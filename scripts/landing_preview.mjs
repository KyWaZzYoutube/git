/* ==========================================================================
   Aperçu de la landing page (landing/) : captures d'écran et vidéo de démonstration.

     node scripts/landing_preview.mjs shots            → build/landing/shots/desktop-NN.png
     node scripts/landing_preview.mjs shots --mobile   → build/landing/shots/mobile-NN.png
     node scripts/landing_preview.mjs video            → video/landing/apercu-landing-page.mp4

   La page est servie en local (avec les requêtes « Range » pour les vidéos) ; les services
   externes (agenda Calendly) sont bloqués pendant l'aperçu. Les erreurs de la console sont listées.
   ========================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'landing');
const OUT = path.join(ROOT, 'build', 'landing');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webp': 'image/webp' };
const mode = process.argv[2] || 'shots';
const mobile = process.argv.includes('--mobile');

function serve() {
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(DIR, rel.endsWith('/') ? rel + 'index.html' : rel);
    if (!file.startsWith(DIR) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    const size = fs.statSync(file).size, type = MIME[path.extname(file)] || 'application/octet-stream';
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (m) {
      const a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 });
      fs.createReadStream(file, { start: a, end: b }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
      fs.createReadStream(file).pipe(res);
    }
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const srv = await serve();
const url = `http://127.0.0.1:${srv.address().port}/`;
const vp = mobile ? { width: 390, height: 844 } : (mode === 'video' ? { width: 1280, height: 720 } : { width: 1440, height: 900 });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile,
  ...(mode === 'video' ? { recordVideo: { dir: path.join(OUT, 'rec'), size: vp } } : {}),
});
const page = await ctx.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
await page.route('**/*', r => (r.request().url().startsWith(url) ? r.continue() : r.abort()));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3200);

if (mode === 'shots') {
  const dir = path.join(OUT, 'shots');
  fs.mkdirSync(dir, { recursive: true });
  const tag = mobile ? 'mobile' : 'desktop';
  for (const f of fs.readdirSync(dir)) if (f.startsWith(tag)) fs.unlinkSync(path.join(dir, f));
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < H; y += vp.height * 0.8) {
    await page.evaluate(yy => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(dir, `${tag}-${String(i++).padStart(2, '0')}.png`) });
  }
  console.log(`${i} captures (${tag}), hauteur de page ${H} px → ${dir}`);
} else {
  // défilement fluide, avec des pauses et quelques interactions
  const scrollTo = (y, ms) => page.evaluate(([yy, d]) => new Promise(done => {
    const y0 = scrollY, t0 = performance.now();
    const ease = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const step = now => { const p = Math.min(1, (now - t0) / d); window.scrollTo(0, y0 + (yy - y0) * ease(p)); p < 1 ? requestAnimationFrame(step) : done(); };
    requestAnimationFrame(step);
  }), [y, ms]);
  const top = sel => page.evaluate(s => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
  await page.mouse.move(640, 300);
  await page.waitForTimeout(2500);
  await page.mouse.move(700, 330, { steps: 20 });
  await page.waitForTimeout(800);
  for (const [sel, off, pause] of [['.ticker', -420, 1500], ['#videos', -40, 1800], ['#pourquoi', -40, 2200], ['.bento', 140, 3500], ['#methode', -40, 1500],
    ['#steps', 120, 3200], ['#steps', 700, 1500], ['#tarifs', -40, 1500], ['#priceGrid', -60, 3000], ['#avis', -40, 3500], ['#faq', -40, 1000]]) {
    await scrollTo(await top(sel) + off, 1600);
    await page.waitForTimeout(pause);
    if (sel === '#videos') { await page.click('#carNext'); await page.waitForTimeout(1500); await page.click('#carNext'); await page.waitForTimeout(1200); }
  }
  await page.click('.qa summary');
  await page.waitForTimeout(1800);
  await scrollTo(await top('.final'), 1800);
  await page.waitForTimeout(3200);
  await scrollTo(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight), 1800);
  await page.waitForTimeout(2500);
}

await ctx.close();
await browser.close();
srv.close();
if (mode === 'video') {
  const rec = path.join(OUT, 'rec');
  const webm = fs.readdirSync(rec).filter(f => f.endsWith('.webm')).map(f => path.join(rec, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  const outDir = path.join(ROOT, 'video', 'landing');
  fs.mkdirSync(outDir, { recursive: true });
  const ff = process.env.FFMPEG || 'ffmpeg';
  const out = path.join(outDir, 'apercu-landing-page.mp4');
  execFileSync(ff, ['-y', '-loglevel', 'error', '-i', webm, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow', '-movflags', '+faststart', '-an', out]);
  console.log('→', out);
}
console.log(errors.length ? `erreurs de la page :\n  ${errors.join('\n  ')}` : 'aucune erreur dans la console');
