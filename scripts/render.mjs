#!/usr/bin/env node
/* ==========================================================================
   Rendu déterministe de src/index.html → vidéo / images fixes.

   node scripts/render.mjs stills 0.5 3.2 7.4 [--scale 0.5]
   node scripts/render.mjs video [--out build/video.mp4] [--fps 30] [--sub 5]
                                 [--shutter 0.5] [--from 0] [--to 25] [--crf 16]

   Flou de mouvement : chaque image finale est la moyenne de --sub sous-images
   réparties sur l'obturateur (--shutter 0.5 = 180°), comme en post-production.
   ========================================================================== */
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'build');
fs.mkdirSync(BUILD, { recursive: true });

// ---------- arguments ----------
const argv = process.argv.slice(2);
const mode = argv[0];
const opt = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const positional = argv.slice(1).filter((a, i, arr) => !a.startsWith('--') && !(i > 0 && arr[i - 1].startsWith('--')));

function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  try { return execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim(); } catch {}
  throw new Error('ffmpeg introuvable (installez ffmpeg ou `pip install imageio-ffmpeg`)');
}

// ---------- mini serveur statique (les polices ne se chargent pas en file://) ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

async function openPage(scale) {
  const srv = await serve();
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb', '--hide-scrollbars'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  page.on('pageerror', e => console.error('[page error]', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[console]', m.text()); });
  await page.goto(`http://127.0.0.1:${srv.address().port}/src/index.html?render=1`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const cues = await page.evaluate(() => window.__cues);
  const duration = await page.evaluate(() => window.__duration);
  fs.writeFileSync(path.join(BUILD, 'cues.json'), JSON.stringify({ duration, cues }, null, 1));
  const cdp = await page.context().newCDPSession(page);
  const shot = async (t, format = 'jpeg') => {
    await page.evaluate(tt => window.__seek(tt), t);
    const r = await cdp.send('Page.captureScreenshot', format === 'png'
      ? { format: 'png', optimizeForSpeed: true }
      : { format: 'jpeg', quality: 96, optimizeForSpeed: true });
    return Buffer.from(r.data, 'base64');
  };
  return { srv, browser, page, shot, duration, cues };
}

async function stills() {
  const scale = +opt('scale', 0.5);
  const dir = path.join(BUILD, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const { srv, browser, shot } = await openPage(scale);
  for (const a of positional) {
    const t = +a;
    const file = path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`);
    fs.writeFileSync(file, await shot(t, 'png'));
    console.log(file);
  }
  await browser.close(); srv.close();
}

async function video() {
  const fps = +opt('fps', 30), sub = +opt('sub', 5), shutter = +opt('shutter', 0.5);
  const scale = +opt('scale', 1), crf = opt('crf', '16');
  const out = path.resolve(opt('out', path.join(BUILD, 'video.mp4')));
  const { srv, browser, shot, duration } = await openPage(scale);
  const from = +opt('from', 0), to = +opt('to', duration);
  const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
  const W = Math.round(1920 * scale), H = Math.round(1080 * scale);

  const vf = [];
  if (sub > 1) vf.push(`tmix=frames=${sub}`, `select='eq(mod(n\\,${sub})\\,${sub - 1})'`);
  vf.push(`setpts=N/(${fps}*TB)`, `scale=${W}:${H}:flags=lanczos`, 'format=yuv420p');
  const ff = spawn(findFfmpeg(), [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps * sub), '-i', '-',
    '-vf', vf.join(','), '-r', String(fps),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-profile:v', 'high', '-tune', 'animation', '-x264-params', 'aq-mode=3:aq-strength=0.8',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  const write = buf => new Promise(res => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));

  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    for (let s = 0; s < sub; s++) {
      const off = sub > 1 ? ((s + 0.5) / sub - 0.5) * shutter : 0;
      const t = Math.min(duration - 1e-4, Math.max(0, (f + off) / fps));
      await write(await shot(t));
    }
    if ((f - f0) % fps === 0) {
      const el = (Date.now() - t0) / 1000, done_ = f - f0 + 1;
      process.stdout.write(`\r  image ${f}/${f1}  ·  ${(el / done_ * (f1 - f)).toFixed(0)} s restantes   `);
    }
  }
  ff.stdin.end();
  await done;
  console.log(`\n→ ${out}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  await browser.close(); srv.close();
}

if (mode === 'stills') await stills();
else if (mode === 'video') await video();
else { console.log('usage : render.mjs stills <t…> | video [--out f.mp4]'); process.exit(1); }
