#!/usr/bin/env node
/* ==========================================================================
   Rendu déterministe d'une composition (compositions/<nom>/index.html) → vidéo / images fixes.

   node scripts/render.mjs stills 0.5 3.2 7.4 [--comp google-ads] [--scale 0.5]
   node scripts/render.mjs video [--comp google-ads] [--out build/google-ads/video.mp4] [--fps 30]
                                 [--sub 6] [--submax 48] [--shutter 0.5] [--from 0] [--to 30] [--crf 18]
   (--comp vaut « demo » par défaut ; tout est écrit dans build/<comp>/)

   Flou de mouvement adaptatif (comme l'« adaptive sample limit » d'After Effects) :
   un pré-passage mesure la quantité de mouvement de chaque image, puis chaque image
   finale est la moyenne de 6 à 48 sous-images réparties sur l'obturateur
   (--shutter 0.5 = 180°). --sub 1 désactive le flou.
   ========================================================================== */
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------- arguments ----------
const argv = process.argv.slice(2);
const mode = argv[0];
const opt = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const COMP = opt('comp', 'demo');
if (!fs.existsSync(path.join(ROOT, 'compositions', COMP, 'index.html'))) throw new Error(`composition inconnue : ${COMP}`);
const BUILD = path.join(ROOT, 'build', COMP);
fs.mkdirSync(BUILD, { recursive: true });
const positional = argv.slice(1).filter((a, i, arr) => !a.startsWith('--') && !(i > 0 && arr[i - 1].startsWith('--')));

function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  try { return execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim(); } catch {}
  throw new Error('ffmpeg introuvable (installez ffmpeg ou `pip install imageio-ffmpeg`)');
}

// ---------- mini serveur statique (les polices ne se chargent pas en file://) ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };
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
  await page.goto(`http://127.0.0.1:${srv.address().port}/compositions/${COMP}/index.html?render=1`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const cues = await page.evaluate(() => window.__cues);
  const duration = await page.evaluate(() => window.__duration);
  fs.writeFileSync(path.join(BUILD, 'cues.json'), JSON.stringify({ duration, cues }, null, 1));
  const cdp = await page.context().newCDPSession(page);
  const shot = async (t, format = 'jpeg', thumb = 0) => {
    await page.evaluate(tt => window.__seek(tt), t);
    const o = format === 'png' ? { format: 'png', optimizeForSpeed: true } : { format: 'jpeg', quality: 96, optimizeForSpeed: true };
    if (thumb) o.clip = { x: 0, y: 0, width: 1920, height: 1080, scale: thumb };
    const r = await cdp.send('Page.captureScreenshot', o);
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

/* Pré-passage : écart moyen (0–255) entre le début et la fin de l'obturateur de chaque image. */
async function motionProfile(shot, f0, f1, fps, shutter, duration) {
  const grey = async buf => (await sharp(buf).greyscale().raw().toBuffer());
  const clampT = t => Math.min(duration - 1e-4, Math.max(0, t));
  const mad = [];
  for (let f = f0; f < f1; f++) {
    const a = await grey(await shot(clampT((f - shutter / 2) / fps), 'jpeg', 0.125));
    const b = await grey(await shot(clampT((f + shutter / 2) / fps), 'jpeg', 0.125));
    let d = 0;
    for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
    mad.push(d / a.length);
  }
  return mad;
}

async function video() {
  const fps = +opt('fps', 30), shutter = +opt('shutter', 0.5);
  const kMin = +opt('sub', 6), kMax = +opt('submax', 48), gain = +opt('mbgain', 6);
  const scale = +opt('scale', 1), crf = opt('crf', '18');
  const out = path.resolve(opt('out', path.join(BUILD, 'video.mp4')));
  const { srv, browser, shot, duration } = await openPage(scale);
  const from = +opt('from', 0), to = +opt('to', duration);
  const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
  const W = Math.round(1920 * scale), H = Math.round(1080 * scale);

  // 1. nombre de sous-images par image, selon la vitesse
  let K = new Array(f1 - f0).fill(1);
  if (kMin > 1) {
    process.stdout.write('  mesure du mouvement…');
    const mad = await motionProfile(shot, f0, f1, fps, shutter, duration);
    K = mad.map(m => Math.max(kMin, Math.min(kMax, Math.ceil(m * gain))));
    fs.writeFileSync(path.join(BUILD, 'motion.json'), JSON.stringify(mad.map((m, i) => [f0 + i, +m.toFixed(2), K[i]])));
    console.log(` ${K.reduce((a, b) => a + b, 0)} sous-images (${kMin}–${kMax} par image)`);
  }

  // 2. rendu : moyenne des sous-images en RVB, conversion BT.709 propre
  const ff = spawn(findFfmpeg(), [
    '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-profile:v', 'high', '-tune', 'animation', '-x264-params', 'aq-mode=3:aq-strength=0.8',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  const write = buf => new Promise(res => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));

  const px = W * H * 3;
  const acc = new Uint16Array(px);
  const frame = Buffer.alloc(px);
  const total = K.reduce((a, b) => a + b, 0);
  let doneShots = 0;
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const k = K[f - f0];
    acc.fill(0);
    const pending = [];
    for (let s = 0; s < k; s++) {
      const off = k > 1 ? ((s + 0.5) / k - 0.5) * shutter : 0;
      const t = Math.min(duration - 1e-4, Math.max(0, (f + off) / fps));
      const jpg = await shot(t);
      pending.push(sharp(jpg).removeAlpha().raw().toBuffer().then(d => { for (let i = 0; i < px; i++) acc[i] += d[i]; }));
    }
    await Promise.all(pending);
    const half = k >> 1;
    for (let i = 0; i < px; i++) frame[i] = ((acc[i] + half) / k) | 0;
    await write(frame);
    doneShots += k;
    if ((f - f0) % fps === 0 || f === f1 - 1) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r  image ${f + 1}/${f1}  ·  ${(el / doneShots * (total - doneShots)).toFixed(0)} s restantes   `);
    }
  }
  ff.stdin.end();
  await done;
  console.log(`\n→ ${out}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  await browser.close(); srv.close();
}

if (mode === 'stills') await stills();
else if (mode === 'video') await video();
else if (mode === 'profile') {
  const fps = +opt('fps', 30), shutter = +opt('shutter', 0.5);
  const { srv, browser, shot, duration } = await openPage(1);
  const mad = await motionProfile(shot, 0, Math.round(duration * fps), fps, shutter, duration);
  fs.writeFileSync(path.join(BUILD, 'motion.json'), JSON.stringify(mad.map(m => +m.toFixed(2))));
  console.log(path.join(BUILD, 'motion.json'));
  await browser.close(); srv.close();
}
else { console.log('usage : render.mjs stills <t…> | video [--out f.mp4] | profile'); process.exit(1); }
