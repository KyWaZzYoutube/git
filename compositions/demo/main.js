/* ==========================================================================
   Première Immo — démo motion design (25 s · 1920×1080)

   Toute l'animation est une timeline GSAP en pause. window.__seek(t) affiche
   l'image exacte à l'instant t : le rendu image par image est déterministe
   (scripts/render.mjs), et la même page se lit en temps réel dans un navigateur.

   Grille musicale : 120 BPM (1 temps = 0,5 s, 1 mesure = 2 s).
   0–4 s intro · 4 s DROP · 18–20 s montée · 20 s impact final (signature).
   ========================================================================== */
(() => {
'use strict';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
const DURATION = 25;
const INK = '#0A0E27', ACCENT = '#4D5BFF', GREEN = '#19C77D';

gsap.registerPlugin(CustomEase, DrawSVGPlugin);
CustomEase.create('io', 'M0,0 C0.7,0 0.13,1 1,1');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const EZ = {};
const ez = (name, p) => (EZ[name] || (EZ[name] = gsap.parseEase(name)))(p);
const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const hash = n => { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; };
const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const stage = $('#stage');
const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 0.7 } });
const drivers = [];           // fonctions pures du temps, exécutées après chaque seek
const cues = [];              // repères sonores exportés pour la bande-son
const cue = (t, type, gain = 1) => cues.push({ t: Math.round(t * 1000) / 1000, type, gain });

function seekAll(t) { tl.seek(t, true); for (const d of drivers) d(t); }
function rel(el) {
  const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
  const x = r.left - s.left, y = r.top - s.top;
  return { x, y, w: r.width, h: r.height, cx: x + r.width / 2, cy: y + r.height / 2 };
}

/* Découpe un élément en caractères (en conservant les <span> internes). */
function splitChars(root) {
  const chars = [];
  const walk = node => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const c of child.textContent) {
          if (c === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
          const s = document.createElement('span');
          s.className = 'ch'; s.textContent = c;
          frag.appendChild(s); chars.push(s);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    }
  };
  walk(root);
  return chars;
}
/* Entrée « masque » : les éléments montent depuis sous la ligne. */
function rise(targets, at, o = {}) {
  return tl.fromTo(targets,
    { yPercent: o.from ?? 160, rotation: o.rot ?? 0, opacity: o.fade ? 0 : 1 },
    { yPercent: 0, rotation: 0, opacity: 1, duration: o.dur ?? 0.8, stagger: o.stagger ?? 0.022, ease: o.ease ?? 'expo.out' }, at);
}
/* Sortie vers le haut. */
function sink(targets, at, o = {}) {
  return tl.to(targets, { yPercent: o.to ?? -130, duration: o.dur ?? 0.38, stagger: o.stagger ?? 0.01, ease: o.ease ?? 'power3.in' }, at);
}
const show = (sel, t) => tl.set(sel, { visibility: 'visible' }, t);
const hide = (sel, t) => tl.set(sel, { visibility: 'hidden' }, t);

/* Mesures différées : on ne mesure qu'une fois toute la timeline initialisée
   dans l'ordre chronologique (sinon GSAP peut enregistrer de mauvaises valeurs de départ). */
const measures = [];
const measure = (t, get, add) => measures.push({ t, get, add });
const warm = () => { for (let t = 0; t <= DURATION + 1e-6; t += 1 / 60) seekAll(t); };

const shakes = [], bumps = [];
const shake = (t, amp, dur = 0.45) => shakes.push({ t, amp, dur });
const bump = (t, a) => bumps.push({ t, a });

/* ==========================================================================
   PLAN A — S1 « Le démarchage téléphonique… c'est fini. »  (0 → 2,4 s)
   ========================================================================== */
function buildS1() {
  gsap.set('#shotA', { visibility: 'visible' });
  const handset = $('.s1-handset');
  const waves = $$('.s1-wave');
  const c1 = splitChars($('#s1l1')), c2 = splitChars($('#s1l2')), cf = splitChars($('#s1fin'));

  tl.fromTo('.s1-phone', { scale: 0, rotation: -35 }, { scale: 1, rotation: 0, duration: 0.75, ease: 'back.out(2.2)' }, 0);
  cue(0.04, 'ring');
  const rings = [0.1, 0.3, 0.66, 0.86];
  drivers.push(t => {
    const env = (a, b) => (t >= a && t <= b) ? Math.sin(Math.PI * (t - a) / (b - a)) : 0;
    const e = Math.max(env(0.08, 0.56), env(0.64, 1.12));
    handset.style.transform = `rotate(${Math.sin(t * Math.PI * 2 * 16) * 14 * e}deg)`;
    waves.forEach((w, i) => {
      let o = 0, s = 0.8;
      const delay = (i % 2) * 0.07;
      for (const r0 of rings) {
        const p = (t - r0 - delay) / 0.42;
        if (p >= 0 && p <= 1) { const v = Math.sin(Math.PI * p); if (v > o) { o = v; s = 0.75 + p * 0.45; } }
      }
      w.style.opacity = t < 1.2 ? o * (i % 2 ? 0.55 : 1) : 0;
      w.style.transform = `scale(${s})`;
    });
  });

  tl.fromTo('#camA', { scale: 1 }, { scale: 1.035, duration: 2.35, ease: 'none' }, 0);
  rise(c1, 0.12, { stagger: 0.02, dur: 0.85 });
  rise(c2, 0.26, { stagger: 0.02, dur: 0.85 });

  gsap.set('.strike', { scaleX: 0, rotation: -1.5, transformOrigin: '0% 50%' });
  tl.to('.strike', { scaleX: 1, duration: 0.3, ease: 'expo.inOut' }, 1.06);
  cue(1.06, 'slash');
  tl.to([...c1, ...c2], { color: 'rgba(255,255,255,0.26)', duration: 0.3, ease: 'power2.out' }, 1.26);
  tl.to('.s1-phone', { rotation: 30, y: 26, opacity: 0.28, duration: 0.7, ease: 'back.out(2.5)' }, 1.26);
  tl.fromTo('.glow-red', { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' }, 1.26)
    .to('.glow-red', { opacity: 0.35, duration: 0.9, ease: 'power2.out' }, 1.38);
  shake(1.28, 16, 0.4);
  cue(1.28, 'thud');

  rise(cf, 1.4, { rot: 12, stagger: 0.03, dur: 0.85 });
  cue(1.42, 'hit');
  tl.fromTo('.s1-chip', { y: 44, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.7 }, 1.56);
  cue(1.56, 'pop', 0.6);
  const dot = $('.dot-red');
  drivers.push(t => {
    const p = (((t - 1.56) % 0.6) + 0.6) % 0.6 / 0.6;
    dot.style.boxShadow = `0 0 0 ${7 + p * 10}px rgba(255,71,71,${0.28 * (1 - p)})`;
  });

  // sortie : tout part vers le haut (le flou de mouvement fait le reste)
  tl.to('#s1', { y: -170, opacity: 0, duration: 0.3, ease: 'power3.in' }, 2.26);
  cue(2.26, 'whoosh', 0.55);

  // lueurs qui dérivent doucement
  const ga1 = $('.glow-a1'), ga2 = $('.glow-a2');
  drivers.push(t => {
    ga1.style.transform = `translate(${Math.sin(t * 0.7) * 60}px, ${Math.cos(t * 0.5) * 40}px)`;
    ga2.style.transform = `translate(${Math.cos(t * 0.6) * 70}px, ${Math.sin(t * 0.8) * 50}px)`;
  });
}

/* ==========================================================================
   S2 « Et si les vendeurs vous trouvaient d'eux-mêmes ? »  (2,4 → 4 s)
   ========================================================================== */
function buildS2() {
  const words = $$('#s2 .w');
  const at = [2.52, 2.58, 2.72, 2.78, 2.98, 3.06, 3.24, 3.38];
  words.forEach((w, i) => {
    tl.fromTo(w, { yPercent: 180, rotation: 9 }, { yPercent: 0, rotation: 0, duration: 0.75, ease: 'expo.out' }, at[i]);
  });
  [2.52, 2.72, 2.98, 3.24].forEach(t => cue(t, 'tick', 0.45));
  cue(2.4, 'riser');
  tl.to('#camA', { scale: 1.11, duration: 1.6, ease: 'power1.in' }, 2.35);
}

/* Transition A → B : un cercle papier jaillit du « ? » au moment du drop. */
function buildWipeAB() {
  show('#shotB', 3.72);
  tl.set('#shotB', { clipPath: 'none' }, 4.0);
  hide('#shotA', 4.0);
  cue(3.66, 'suck');
  measure(3.72, () => rel($('.s2-q')), q => {
    const qx = q.x + q.w * 0.62, qy = q.y + q.h * 0.7;
    const R = Math.hypot(Math.max(qx, 1920 - qx), Math.max(qy, 1080 - qy)) + 30;
    tl.fromTo('#shotB', { clipPath: `circle(0px at ${qx}px ${qy}px)` },
      { clipPath: `circle(${R}px at ${qx}px ${qy}px)`, duration: 0.28, ease: 'expo.in' }, 3.72);
  });
}

/* ==========================================================================
   PLAN B — S3 recherche → « Votre agence » passe n°1  (4 → 7 s)
   ========================================================================== */
function buildMap() {
  const svg = $('#map');
  const R = rng(11);
  const g = svgEl('g', {}, svg);
  // parcs & fleuve
  [[80, 560, 260, 200], [1540, 90, 300, 180], [1470, 700, 240, 260], [640, -40, 220, 140]].forEach(([x, y, w, h]) =>
    svgEl('rect', { class: 'park', x, y, width: w, height: h, rx: 28 }, g));
  svgEl('path', { class: 'river road', d: 'M -80 1010 C 300 930, 520 1060, 900 960 S 1500 880, 2000 980', 'stroke-width': 46 }, g);
  // grille de rues légèrement tournée
  const ang = -12 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang);
  const P = (x, y) => [960 + (x - 960) * ca - (y - 540) * sa, 540 + (x - 960) * sa + (y - 540) * ca];
  const seg = (x1, y1, x2, y2) => { const a = P(x1, y1), b = P(x2, y2); return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`; };
  for (let x = -300; x <= 2300; x += 132) {
    let y = -300;
    while (y < 1400) { const len = 180 + R() * 520; if (R() > 0.18) svgEl('path', { class: 'road', d: seg(x, y, x, y + len), 'stroke-width': 7 }, g); y += len + 26; }
  }
  for (let y = -300; y <= 1400; y += 124) {
    let x = -300;
    while (x < 2300) { const len = 200 + R() * 600; if (R() > 0.18) svgEl('path', { class: 'road', d: seg(x, y, x + len, y), 'stroke-width': 7 }, g); x += len + 26; }
  }
  // grands axes
  [['M -60 240 C 420 170, 980 330, 1990 200', 18], ['M -60 860 C 520 950, 1220 760, 1990 890', 18],
   ['M 290 -60 C 250 380, 430 700, 330 1140', 16], ['M 1640 -60 C 1720 320, 1540 760, 1660 1140', 16]]
    .forEach(([d, w]) => svgEl('path', { class: 'road main', d, 'stroke-width': w }, g));

  const roads = $$('#map .road');
  tl.fromTo(roads, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', stagger: { each: 0.004, from: 'random' } }, 3.9);
  tl.fromTo('#map .park', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 4.3);

  // épingles concurrentes en périphérie
  const pins = $('#pins');
  const spots = [[170, 210], [300, 420], [150, 760], [360, 960], [1600, 180], [1790, 400], [1700, 650], [1560, 930], [1850, 860], [520, 250]];
  spots.forEach(([x, y], i) => {
    const d = document.createElement('div');
    d.className = 'pin'; d.style.left = x + 'px'; d.style.top = y + 'px';
    d.innerHTML = '<svg class="ico"><use href="#i-pin-solid"/></svg>';
    pins.appendChild(d);
    tl.fromTo(d, { scale: 0, y: -30 }, { scale: 1, y: 0, duration: 0.6, ease: 'back.out(3)' }, 4.45 + i * 0.055);
  });
  const pinEls = $$('.pin');
  // parallaxe : la carte bouge moins que l'interface
  const map = $('#map');
  drivers.push(t => {
    const p = prog(t, 3.7, 7);
    const s = 1.08 - 0.06 * ez('power2.out', p);
    map.style.transform = `scale(${s})`;
    pins.style.transform = `scale(${s})`;
  });
  return pinEls;
}

function buildS3() {
  buildMap();
  // la barre de recherche naît d'un point (le « drop ») puis s'étire en capsule
  gsap.set('#search', { xPercent: -50, transformOrigin: '50% 50%' });
  tl.fromTo('#search', { width: 112, scale: 0, backgroundColor: ACCENT }, { scale: 1, duration: 0.34, ease: 'back.out(2.6)' }, 3.96);
  tl.to('#search', { width: 1100, backgroundColor: '#FFFFFF', duration: 0.62, ease: 'expo.inOut' }, 4.12);
  tl.fromTo(['.search-ico', '.search-text'], { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5 }, 4.36);
  cue(3.98, 'pop', 0.8);
  cue(4.12, 'stretch');
  // onde de choc sur le drop (on anime la taille, pas l'échelle, pour garder un trait fin)
  tl.fromTo('.shock', { width: 90, height: 90, marginLeft: -45, marginTop: -45, opacity: 0.9 },
    { width: 1300, height: 1300, marginLeft: -650, marginTop: -650, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out', immediateRender: false }, 4.0);

  const query = 'estimer ma maison';
  const typed = $('#typed'), caret = $('#caret');
  const T0 = 4.46, CPS = 25;
  drivers.push(t => {
    const n = clamp(Math.floor((t - T0) * CPS), 0, query.length);
    typed.textContent = query.slice(0, n);
    const typing = t >= T0 && t < T0 + query.length / CPS + 0.12;
    caret.style.opacity = t < 4.4 ? 0 : (typing ? 1 : (Math.floor((t - T0) * 2.6) % 2 ? 0 : 1));
  });
  for (let i = 0; i < query.length; i++) if (query[i] !== ' ') cue(T0 + i / CPS, 'type', 0.5 + 0.25 * ((i * 7) % 3) / 2);

  tl.to('.search-btn', { scale: 0.84, duration: 0.07, ease: 'power2.out' }, 5.14)
    .to('.search-btn', { scale: 1, duration: 0.45, ease: 'back.out(3)' }, 5.21);
  cue(5.14, 'click');

  // résultats
  gsap.set('.res-a', { top: 0 }); gsap.set('.res-b', { top: 134 }); gsap.set('#resMe', { top: 268 });
  tl.fromTo(['.res-a', '.res-b', '#resMe'], { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07 }, 5.22);
  [5.22, 5.29, 5.36].forEach(t => cue(t, 'pop', 0.4));
  // « Votre agence » remonte en tête
  tl.to('#resMe', { top: 0, duration: 0.62, ease: 'io' }, 5.5);
  tl.to('.res-a', { top: 134, duration: 0.62, ease: 'io' }, 5.5);
  tl.to('.res-b', { top: 268, duration: 0.62, ease: 'io' }, 5.5);
  tl.to('#resMe', { x: 36, duration: 0.31, ease: 'power2.out' }, 5.5).to('#resMe', { x: 0, duration: 0.31, ease: 'power2.in' }, 5.81);
  tl.to('#resMe', { scale: 1.04, boxShadow: '0 44px 90px -30px rgba(77,91,255,0.6), 0 0 0 4px rgba(77,91,255,1)', duration: 0.5 }, 5.86);
  tl.to(['.res-a', '.res-b'], { opacity: 0.4, duration: 0.5 }, 5.86);
  tl.fromTo('.badge-n1', { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(3)' }, 5.92);
  cue(5.5, 'swoosh'); cue(5.94, 'gold');

  const head = splitChars($('#s3head'));
  rise(head, 5.52, { stagger: 0.016, dur: 0.85 });
  cue(5.52, 'swish', 0.5);

  // caméra : punch-in sur le drop puis lente poussée
  tl.fromTo('#camB', { scale: 1.14 }, { scale: 1, duration: 1.1, ease: 'expo.out' }, 3.9);
  tl.to('#camB', { scale: 1.035, duration: 1.8, ease: 'none' }, 5.0);
}

/* Transition B → C : la carte « Votre agence » s'agrandit jusqu'à devenir l'écran. */
function buildZoomBC() {
  tl.to('#resMe .res-in', { opacity: 0, duration: 0.1, ease: 'none' }, 6.58);
  show('#shotC', 7.02); hide('#shotB', 7.02);
  cue(6.66, 'whoosh', 0.8);
  measure(6.68, () => rel($('#resMe')), r => {
    tl.set('#zoomer', { visibility: 'visible', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 28, backgroundColor: '#FFFFFF' }, 6.68);
    tl.to('#zoomer', { left: 0, top: 0, width: 1920, height: 1080, borderRadius: 0, duration: 0.34, ease: 'expo.in' }, 6.68);
    tl.to('#zoomer', { backgroundColor: INK, duration: 0.2, ease: 'expo.in' }, 6.82);
    hide('#zoomer', 7.02);
  });
}

/* ==========================================================================
   PLAN C — S4 « On s'occupe de tout » : canaux → moteur  (7 → 9,6 s)
   ========================================================================== */
const HUB = { x: 1010, y: 620 };
const CHANNELS = [
  { ico: 'i-search', label: 'Google Ads', a: 128 },
  { ico: 'i-like', label: 'Facebook', a: 154 },
  { ico: 'i-camera', label: 'Instagram', a: 180 },
  { ico: 'i-pin', label: 'SEO local', a: 206 },
  { ico: 'i-mail', label: 'E-mailing', a: 232 },
];
const OUT_PATH = 'M 1140 620 C 1520 620, 1660 810, 2120 810 S 2860 740, 3150 680';
const NOTIF_T = [10.25, 10.75, 11.25, 11.75];

function buildS4() {
  const flow = $('#flow');
  const wiresG = svgEl('g', {}, flow);
  const partsG = svgEl('g', {}, flow);
  const chipsBox = $('#chips');
  const inWires = [];

  CHANNELS.forEach((c, i) => {
    const rad = c.a * Math.PI / 180;
    const ax = HUB.x + 590 * Math.cos(rad), ay = HUB.y - 340 * Math.sin(rad);
    const chip = document.createElement('div');
    chip.className = 'chip-ch';
    chip.innerHTML = `<span class="ci"><svg class="ico"><use href="#${c.ico}"/></svg></span>${c.label}`;
    chip.style.left = ax + 'px'; chip.style.top = ay + 'px';
    chipsBox.appendChild(chip);
    gsap.set(chip, { xPercent: -100, yPercent: -50, transformOrigin: '100% 50%' });
    tl.fromTo(chip, { x: HUB.x - ax, y: HUB.y - ay, scale: 0.2, opacity: 0 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.85, ease: 'expo.out' }, 7.14 + i * 0.07);
    cue(7.14 + i * 0.07, 'pop', 0.55);

    const d = `M ${ax + 10} ${ay} C ${ax + 200} ${ay}, ${HUB.x - 300} ${HUB.y}, ${HUB.x - 40} ${HUB.y}`;
    const path = svgEl('path', { class: 'wire', d }, wiresG);
    tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.55, ease: 'power2.inOut' }, 7.34 + i * 0.06);
    const parts = [0, 1, 2].map(k => {
      const g = svgEl('g', { opacity: 0 }, partsG);
      svgEl('circle', { r: 15, fill: 'rgba(140,151,255,0.28)' }, g);
      svgEl('circle', { r: 5.5, fill: '#fff' }, g);
      return { g, phase: (k / 3 + i * 0.137) % 1 };
    });
    inWires.push({ path, len: 0, parts });
  });
  cue(7.34, 'zip', 0.6);

  // sortie : leads vendeurs → téléphone (dans le décor de droite)
  const out = svgEl('path', { class: 'wire wire-out', d: OUT_PATH }, wiresG);
  tl.fromTo(out, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.7, ease: 'power1.inOut' }, 7.78);
  const outParts = [];
  for (let j = 0; j < 12; j++) {
    const dep = 8.05 + j * 0.25;
    const courier = NOTIF_T.includes(Math.round((dep + 1.2) * 100) / 100);
    const g = svgEl('g', { opacity: 0 }, partsG);
    svgEl('circle', { r: courier ? 26 : 14, fill: courier ? 'rgba(255,194,61,0.3)' : 'rgba(140,151,255,0.25)' }, g);
    svgEl('circle', { r: courier ? 10 : 5.5, fill: courier ? '#FFC23D' : '#fff' }, g);
    outParts.push({ g, dep, courier });
  }

  // moteur central
  tl.fromTo('#hub', { scale: 0 }, { scale: 1, duration: 1.0, ease: 'elastic.out(1, 0.55)' }, 7.0);
  cue(7.0, 'boom', 0.8);
  tl.fromTo('.hub-label', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 7.3);
  tl.fromTo('#outLabel', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.7 }, 8.2);

  const head = splitChars($('#s4head'));
  rise(head, 7.06, { stagger: 0.018, dur: 0.85 });

  const core = $('.hub-core');
  const rings = $$('.hub-ring');
  const beats = [7.5, 8.0, 8.5, 9.0, 9.5];
  drivers.push(t => {
    let s = 1;
    for (const b of beats) { const d = t - b; if (d >= 0 && d < 0.6) s += 0.07 * Math.exp(-d * 9); }
    core.style.transform = `scale(${s})`;
    rings.forEach((r, i) => {
      let o = 0, sc = 1;
      for (const b of beats) { const p = (t - b - i * 0.1) / 0.9; if (p >= 0 && p <= 1) { o = 0.7 * (1 - p); sc = 1 + p * 0.9; } }
      r.style.opacity = o; r.style.transform = `scale(${sc})`;
    });
  });

  // particules : déterministes, calculées depuis t
  let outLen = 0;
  drivers.push(t => {
    for (const w of inWires) {
      if (!w.len) w.len = w.path.getTotalLength();
      for (const p of w.parts) {
        if (t < 7.75 || t > 10.1) { p.g.setAttribute('opacity', 0); continue; }
        const u = ((t - 7.75) / 0.95 + p.phase) % 1;
        const pt = w.path.getPointAtLength(ez('power1.in', u) * w.len);
        p.g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        p.g.setAttribute('opacity', (Math.sin(Math.PI * u) * prog(t, 7.75, 8.0)).toFixed(3));
      }
    }
    if (!outLen) outLen = out.getTotalLength();
    for (const p of outParts) {
      const u = (t - p.dep) / 1.2;
      if (u < 0 || u > 1) { p.g.setAttribute('opacity', 0); continue; }
      const pt = out.getPointAtLength(ez('sine.inOut', u) * outLen);
      p.g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      p.g.setAttribute('opacity', Math.min(1, u * 8, (1 - u) * 14).toFixed(3));
    }
  });

  // grille de points en parallaxe avec le travelling
  const dotgrid = $('#dotgrid');
  const world = $('#world');
  drivers.push(t => {
    const wx = gsap.getProperty(world, 'x') || 0;
    dotgrid.style.backgroundPosition = `${(wx * 0.35).toFixed(1)}px 0px`;
  });
}

/* ==========================================================================
   S5 — les leads arrivent sur le téléphone  (9,6 → 12,2 s)
   ========================================================================== */
const NOTIFS = [
  { body: 'Appartement T3 · 68 m² — Estimation' },
  { body: 'Maison 5 pièces — Projet de vente' },
  { body: 'Terrain 900 m² — Souhaite vendre' },
  { body: 'Maison 120 m² — Rappel souhaité' },
];
function buildS5() {
  // travelling latéral vers le téléphone
  tl.to('#world', { x: -1920, duration: 0.64, ease: 'expo.inOut' }, 9.5);
  cue(9.48, 'whoosh_big');
  bump(10.0, 0.012);

  gsap.set('#phone', { transformPerspective: 1800, rotationY: -16, rotationX: 5 });
  tl.fromTo('#phoneWrap', { y: 160 }, { y: 0, duration: 1.0, ease: 'expo.out' }, 9.7);

  const l1 = splitChars($('#s5l1')), l2 = splitChars($('#s5l2'));
  rise(l1, 9.98, { stagger: 0.016 });
  rise(l2, 10.1, { stagger: 0.016 });

  const box = $('#notifs');
  const SLOT = 136;
  NOTIFS.forEach((n, k) => {
    const el = document.createElement('div');
    el.className = 'notif'; el.id = 'notif' + k;
    el.innerHTML = `<div class="n-app"><svg class="ico mark"><use href="#i-mark"/></svg></div>
      <div class="n-txt"><div class="n-title">Nouveau lead vendeur</div><div class="n-body">${n.body}</div></div>
      <div class="n-time">maintenant</div>`;
    box.appendChild(el);
    const t0 = NOTIF_T[k];
    tl.fromTo(el, { y: -50, scale: 0.8, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }, t0);
    for (let m = k + 1; m < NOTIF_T.length; m++) {
      tl.to(el, { top: (m - k) * SLOT, duration: 0.55, ease: 'expo.out' }, NOTIF_T[m]);
    }
    cue(t0, 'notif');
  });
  // le téléphone réagit à chaque arrivée
  const phone = $('#phone');
  drivers.push(t => {
    let k = 0;
    for (const n of NOTIF_T) { const d = t - n; if (d >= 0 && d < 0.5) k += Math.exp(-d * 10) * Math.sin(d * 60); }
    const fl = Math.sin(t * 1.6) * 8;
    phone.style.translate = `${(k * 6).toFixed(2)}px ${fl.toFixed(2)}px`;
  });
}

/* ==========================================================================
   S6 « Votre seul travail : rappeler. »  (12,2 → 14,5 s)
   ========================================================================== */
function buildS6() {
  const l1 = $$('#s5l1 .ch'), l2 = $$('#s5l2 .ch');
  sink([...l1, ...l2], 12.16, { stagger: 0.008 });

  const h1 = splitChars($('#s6l1')), h2 = splitChars($('#s6l2'));
  rise(h1, 12.42, { stagger: 0.016 });
  rise(h2, 12.68, { stagger: 0.03, rot: 10, dur: 0.9 });
  cue(12.68, 'hit', 0.8);

  // la dernière notification se déplie en fiche contact (container transform)
  const lead = $('#lead');
  const leadH = lead.offsetHeight;
  const nl = -80 - (-110), nt = 300 - 176;  // position de la notif dans le repère de la fiche
  const inset = (t, r, b, l, rad) => `inset(${t}px ${r}px ${b}px ${l}px round ${rad}px)`;
  show('#lead', 12.2);
  tl.fromTo(lead, { clipPath: inset(nt, 660 - nl - 600, leadH - nt - 122, nl, 30) },
    { clipPath: inset(0, 0, 0, 0, 42), duration: 0.6, ease: 'expo.inOut' }, 12.2);
  hide('#notif3', 12.2);
  tl.fromTo(['.lead-top', '.lead-tags', '#callBtn'], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06 }, 12.46);
  tl.to(['#notif0', '#notif1', '#notif2'], { opacity: 0, y: 40, duration: 0.4, ease: 'power2.in', stagger: 0.03 }, 12.2);
  tl.to('#phone', { rotationY: 0, rotationX: 0, opacity: 0.3, duration: 0.8, ease: 'io' }, 12.2);
  cue(12.2, 'swoosh');

  // doigt qui appuie (position calculée dans le repère du téléphone, hors transformations)
  measure(13.3, () => {
    const L = $('#lead'), B = $('#callBtn');
    return { x: L.offsetLeft + B.offsetLeft + B.offsetWidth / 2, y: L.offsetTop + B.offsetTop + B.offsetHeight / 2 };
  }, bp => {
    gsap.set('#touch', { left: bp.x, top: bp.y });
    tl.fromTo('#touch', { opacity: 0, scale: 1.8, x: 120, y: 150 }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.42, ease: 'power3.out' }, 13.06);
    tl.to('#touch', { scale: 0.78, duration: 0.08, ease: 'power2.out' }, 13.48)
      .to('#touch', { scale: 1.1, opacity: 0, duration: 0.4, ease: 'power2.out' }, 13.56);
  });
  tl.to('#callBtn', { scale: 0.95, duration: 0.08, ease: 'power2.out' }, 13.48)
    .to('#callBtn', { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 13.56);
  cue(13.48, 'tap');

  // l'appel part : la capsule devient un bouton rond qui sonne
  tl.to('#callLbl', { opacity: 0, duration: 0.12, ease: 'none' }, 13.56);
  tl.to('#callLbl', { maxWidth: 0, duration: 0.45, ease: 'expo.inOut' }, 13.58);
  tl.to('#callBtn', { width: 126, gap: 0, duration: 0.45, ease: 'expo.inOut' }, 13.58);
  tl.to('#calling', { opacity: 1, duration: 0.3, ease: 'power1.out' }, 13.7);
  cue(13.66, 'ringback');
  const ico = $('#callIco');
  const crs = $$('.call-ring');
  drivers.push(t => {
    const e = (t >= 13.7 && t <= 14.2) ? Math.sin(Math.PI * (t - 13.7) / 0.5) : 0;
    ico.style.transform = `rotate(${Math.sin(t * Math.PI * 2 * 14) * 12 * e}deg)`;
    crs.forEach((c, i) => {
      const p = (t - 13.72 - i * 0.18) / 0.6;
      const on = p >= 0 && p <= 1 && t < 14.12;
      c.style.opacity = on ? (0.8 * (1 - p)).toFixed(3) : 0;
      c.style.transform = `scale(${on ? 1 + p * 0.9 : 1})`;
    });
  });

  // caméra : lente poussée sur la fiche
  gsap.set('#camC', { transformOrigin: '1380px 560px' });
  tl.fromTo('#camC', { scale: 1 }, { scale: 1.07, duration: 2.0, ease: 'power1.inOut' }, 12.2);
}

/* Transition C → D : le bouton d'appel s'ouvre en plein écran. */
function buildCircleCD() {
  show('#shotD', 14.5); hide('#shotC', 14.5);
  cue(14.08, 'whoosh_big', 0.9);
  measure(14.1, () => rel($('#callBtn')), b => {
    const k = b.h / 126;
    const R = Math.hypot(Math.max(b.cx, 1920 - b.cx), Math.max(b.cy, 1080 - b.cy));
    tl.set('#txCircle', { visibility: 'visible', left: b.cx, top: b.cy, scale: k, backgroundColor: GREEN }, 14.1);
    tl.to('#txCircle', { scale: (R * 2 + 40) / 126, duration: 0.4, ease: 'expo.in' }, 14.1);
    tl.to('#txCircle', { backgroundColor: ACCENT, duration: 0.3, ease: 'power1.in' }, 14.16);
    hide('#txCircle', 14.5);
  });
}

/* ==========================================================================
   PLAN D — S7 ×2 mandats → tableau de bord mensuel  (14,5 → 18 s)
   ========================================================================== */
function buildS7() {
  // bandeau de fond « MANDATS »
  const mq = $('#marquee');
  const rows = [];
  for (let i = 0; i < 6; i++) {
    const r = document.createElement('div');
    r.className = 'mq-row';
    r.textContent = 'MANDATS · MANDATS · MANDATS · MANDATS · ';
    mq.appendChild(r); rows.push(r);
  }
  drivers.push(t => {
    const u = t - 14.5;
    rows.forEach((r, i) => { r.style.transform = `translateX(${((i % 2 ? -1 : 1) * u * 170 - 400 - i * 120).toFixed(1)}px)`; });
  });
  tl.fromTo('#marquee', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 14.5);

  // barres qui poussent
  const gb = $('#growbars');
  const H = [70, 95, 120, 150, 185, 225, 270, 320, 380, 450];
  H.forEach(() => gb.appendChild(document.createElement('i')));
  const bars = $$('#growbars i');
  bars.forEach((b, i) => { b.style.height = H[i] + 'px'; });
  tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: 0.045, ease: 'expo.out' }, 14.55);

  // ×2
  tl.fromTo('#x2', { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'expo.out' }, 14.5);
  tl.fromTo('.x2-x', { rotation: -200, scale: 0 }, { rotation: 0, scale: 1, duration: 0.8, ease: 'back.out(1.8)' }, 14.5);
  tl.fromTo('#x2reel', { yPercent: 0 }, { yPercent: -50, duration: 0.42, ease: 'expo.inOut' }, 14.64);
  tl.fromTo('#x2', { y: 0 }, { y: -18, duration: 0.12, ease: 'power2.out' }, 15.0)
    .to('#x2', { y: 0, duration: 0.5, ease: 'back.out(3)' }, 15.12);
  shake(15.0, 14, 0.45);
  bump(15.0, 0.02);
  cue(14.5, 'impact'); cue(14.66, 'roll'); cue(15.0, 'hit_big');

  const a = splitChars($('#s7l1')), b = splitChars($('#s7l2'));
  rise(a, 14.82, { stagger: 0.025 });
  rise(b, 14.94, { stagger: 0.022 });

  // passage au tableau de bord
  tl.to(['#x2', '.s7-text'], { y: -300, opacity: 0, duration: 0.36, ease: 'power3.in', stagger: 0.04 }, 15.96);
  tl.to('#growbars', { y: 360, duration: 0.5, ease: 'power3.in' }, 15.96);
  cue(15.96, 'whoosh', 0.7);
  tl.fromTo('#dash', { y: 820, rotationX: 42, opacity: 1 }, { y: 0, rotationX: 0, duration: 1.0, ease: 'expo.out' }, 16.12);
  cue(16.12, 'swoosh', 0.8);
  const cap = splitChars($('#s7cap'));
  rise(cap, 16.18, { stagger: 0.016 });

  // compteurs
  $$('#dash .num').forEach((el, i) => {
    const to = +el.dataset.to, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const t0 = 16.42 + i * 0.1;
    drivers.push(t => { el.textContent = pre + Math.round(to * ez('expo.out', prog(t, t0, t0 + 0.95))) + suf; });
  });
  cue(16.45, 'counter');

  // courbe
  const chart = $('#chart');
  const defs = svgEl('defs', {}, chart);
  const grad = svgEl('linearGradient', { id: 'gArea', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': ACCENT, 'stop-opacity': 0.28 }, grad);
  svgEl('stop', { offset: '100%', 'stop-color': ACCENT, 'stop-opacity': 0 }, grad);
  const vals = [9, 12, 11, 17, 23, 32], months = ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'];
  const X = i => 40 + i * (1140 / 5), Y = v => 196 - (v / 32) * 176;
  for (let k = 0; k < 4; k++) svgEl('line', { x1: 0, x2: 1220, y1: 20 + k * 58.7, y2: 20 + k * 58.7, stroke: '#EEF0F6', 'stroke-width': 2 }, chart);
  const pts = vals.map((v, i) => [X(i), Y(v)]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  const area = svgEl('path', { d: `${d} L ${X(5)} 196 L ${X(0)} 196 Z`, fill: 'url(#gArea)' }, chart);
  const line = svgEl('path', { d, fill: 'none', stroke: ACCENT, 'stroke-width': 6, 'stroke-linecap': 'round' }, chart);
  const dots = pts.map(([x, y], i) => svgEl('circle', { cx: x, cy: y, r: i === 5 ? 11 : 8, fill: '#fff', stroke: ACCENT, 'stroke-width': 5 }, chart));
  months.forEach((m, i) => { const tx = svgEl('text', { x: X(i), y: 242, 'text-anchor': 'middle', fill: '#8A8FA6', 'font-family': 'Inter Variable, Inter, sans-serif', 'font-weight': 600, 'font-size': 22 }, chart); tx.textContent = m; });
  tl.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.0, ease: 'power2.inOut' }, 16.45);
  tl.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 16.7);
  dots.forEach((c, i) => tl.fromTo(c, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 16.5 + i * 0.17));

  // réassurance
  tl.fromTo('#tagDedie', { x: -90, opacity: 0, scale: 0.9 }, { x: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.8)' }, 16.9);
  cue(16.9, 'pop', 0.8);
  tl.fromTo('#stamp', { scale: 2.6, rotation: -26, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.24, ease: 'power4.in' }, 17.06);
  tl.to('#stamp', { scale: 1.06, duration: 0.08, ease: 'power2.out' }, 17.3).to('#stamp', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, 17.38);
  shake(17.3, 12, 0.4);
  cue(17.3, 'stamp');

  tl.fromTo('#camD', { scale: 1.06 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, 14.5);
  tl.to('#camD', { scale: 1.03, duration: 1.9, ease: 'none' }, 16.1);
}

/* Transition D → E : colonnes d'encre qui montent. */
function buildBarsDE() {
  const box = $('#txBars');
  for (let i = 0; i < 8; i++) box.appendChild(document.createElement('i'));
  show('#txBars', 17.56);
  tl.fromTo('#txBars i', { scaleY: 0 }, { scaleY: 1, duration: 0.28, stagger: 0.022, ease: 'power3.in' }, 17.56);
  show('#shotE', 18.0); hide('#shotD', 18.0); hide('#txBars', 18.0);
  cue(17.56, 'whoosh', 0.8);
}

/* ==========================================================================
   PLAN E — S8 « Pour les agents, mandataires… »  (18 → 20 s)
   ========================================================================== */
function buildS8() {
  const pour = splitChars($('#s8pour'));
  rise(pour, 18.0, { stagger: 0.022 });
  const items = $$('#s8list li');
  items.forEach((li, i) => {
    const t0 = 18.16 + i * 0.25;
    tl.fromTo($('.ln', li), { yPercent: 170 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, t0);
    tl.fromTo($('.s8-i', li), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, t0 + 0.04);
    tl.fromTo($('.s8-rule', li), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, t0);
    cue(t0, 'tick', 0.7);
  });
  tl.fromTo('#camE', { scale: 1 }, { scale: 1.05, duration: 1.8, ease: 'power1.in' }, 18.0);
  // aspiration vers le centre juste avant l'impact
  tl.to('.s8', { scale: 0.55, opacity: 0, duration: 0.2, ease: 'power3.in' }, 19.8);
  cue(19.7, 'suck');
}

/* ==========================================================================
   PLAN F — S9 signature + appel à l'action  (20 → 25 s)
   ========================================================================== */
function buildS9() {
  show('#shotF', 20.0); hide('#shotE', 20.0);
  tl.fromTo('#flash', { opacity: 0.85 }, { opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, 20.0);
  shake(20.02, 18, 0.5);
  bump(20.0, 0.03);
  cue(20.0, 'final');

  tl.fromTo('#s9glow', { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' }, 20.0);
  tl.fromTo('#s9ring', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' }, 20.05);
  tl.fromTo('#logoMark', { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.62)' }, 20.0);
  tl.fromTo('#mRoof', { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.55, ease: 'expo.out' }, 20.1);
  tl.fromTo('#mOne', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'expo.out' }, 20.28);

  // gerbe de traits autour du monogramme
  measure(21.5, () => rel($('#logoMark')), m => {
    const burst = $('#burst');
    gsap.set(burst, { left: m.cx - 400, top: m.cy - 400 });
    const lines = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.2;
      const r1 = 128, r2 = i % 2 ? 190 : 225;
      lines.push(svgEl('line', { x1: (Math.cos(a) * r1).toFixed(1), y1: (Math.sin(a) * r1).toFixed(1), x2: (Math.cos(a) * r2).toFixed(1), y2: (Math.sin(a) * r2).toFixed(1) }, burst));
    }
    tl.fromTo(lines, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.3, ease: 'power2.out' }, 20.04);
    tl.to(lines, { drawSVG: '100% 100%', duration: 0.4, ease: 'power2.in' }, 20.3);
    tl.set(lines, { opacity: 0 }, 20.72);
  });

  const word = splitChars($('#logoWord'));
  rise(word, 20.1, { stagger: 0.028, dur: 0.9 });
  const kick = $('#kicker');
  tl.fromTo(kick, { letterSpacing: '0.9em', opacity: 0 }, { letterSpacing: '0.34em', opacity: 1, duration: 1.1, ease: 'expo.out' }, 20.42);
  const tag = splitChars($('#s9tag'));
  rise(tag, 20.62, { stagger: 0.012, dur: 0.8 });
  cue(20.62, 'swish', 0.5);

  // bouton d'appel à l'action
  gsap.set('#cta', { xPercent: -50 });
  tl.fromTo('#cta', { clipPath: 'inset(0px 50% 0px 50% round 56px)' }, { clipPath: 'inset(0px 0% 0px 0% round 56px)', duration: 0.7, ease: 'expo.inOut' }, 21.0);
  tl.fromTo('.cta-in', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 21.2);
  tl.fromTo('.cta-arrow', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.5)' }, 21.36);
  cue(21.0, 'stretch', 0.7); cue(21.36, 'pop', 0.7);
  tl.fromTo('#s9sub', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 21.45);

  // URL « décodée »
  const urlEl = $('#s9url');
  const url = urlEl.textContent;
  urlEl.style.width = urlEl.getBoundingClientRect().width + 'px';
  const glyphs = 'abcdefghijklmnopqrstuvwxyz0123456789';
  drivers.push(t => {
    if (t < 21.55) { urlEl.textContent = ''; return; }
    const p = prog(t, 21.55, 22.15);
    const n = Math.floor(p * url.length);
    const seed = Math.floor(t * 20);
    let s = '';
    for (let i = 0; i < url.length; i++) {
      if (i < n || p >= 1) s += url[i];
      else if (i < n + 6) s += glyphs[hash(seed * 131 + i * 17) % glyphs.length];
    }
    urlEl.textContent = s;
  });
  cue(21.55, 'scramble');

  // vie de la signature : reflet, flèche, respiration
  const shine = $('#ctaShine'), arrow = $('.cta-arrow'), glow = $('#s9glow'), logo = $('.logo');
  drivers.push(t => {
    const sweep = (t0) => prog(t, t0, t0 + 0.9);
    const p = t < 23.4 ? sweep(22.2) : sweep(23.6);
    shine.style.transform = `translateX(${lerp(-300, 1150, ez('power2.inOut', p)).toFixed(1)}px)`;
    const nudge = t > 22 ? Math.max(0, Math.sin((t - 22) * Math.PI * 1.25)) ** 6 * 10 : 0;
    arrow.style.translate = `${nudge.toFixed(2)}px 0px`;
    glow.style.translate = `${(Math.sin(t * 0.8) * 30).toFixed(1)}px ${(Math.cos(t * 0.6) * 20).toFixed(1)}px`;
    logo.style.translate = `0px ${(t > 20 ? Math.sin((t - 20) * 1.3) * 4 : 0).toFixed(2)}px`;
  });
  tl.fromTo('#camF', { scale: 1.08 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 20.0);
  tl.to('#camF', { scale: 1.025, duration: 3.4, ease: 'none' }, 21.6);
}

/* ==========================================================================
   Caméra globale : secousses sur les impacts + léger « bump » sur les temps forts
   ========================================================================== */
function buildCamera() {
  bump(4.0, 0.025); shake(4.0, 12, 0.4);
  for (let b = 6; b <= 16; b += 2) if (b !== 10) bump(b, 0.008);
  const el = $('#bump');
  drivers.push(t => {
    let sx = 0, sy = 0, sr = 0, sc = 1;
    for (const s of shakes) {
      const p = (t - s.t) / s.dur;
      if (p < 0 || p > 1) continue;
      const e = s.amp * (1 - p) * (1 - p);
      sx += e * Math.sin(t * 91.7 + s.t * 13.1);
      sy += e * Math.cos(t * 83.3 + s.t * 7.7);
      sr += e * 0.025 * Math.sin(t * 67.9 + s.t);
    }
    for (const b of bumps) { const d = t - b.t; if (d >= 0 && d < 0.8) sc += b.a * Math.exp(-d * 7); }
    el.style.transform = `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) rotate(${sr.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
  });
}

/* ==========================================================================
   Construction + lecture
   ========================================================================== */
function build() {
  buildS1(); buildS2(); buildS3(); buildS4(); buildS5(); buildS6(); buildS7(); buildBarsDE(); buildS8(); buildS9();
  buildCamera();
  buildWipeAB(); buildZoomBC(); buildCircleCD();
  tl.set({}, {}, DURATION);
  warm();                                                  // 1. initialise tout dans l'ordre chronologique
  for (const m of measures) { seekAll(m.t); m.val = m.get(); }  // 2. mesure
  seekAll(0);
  for (const m of measures) m.add(m.val);                  // 3. ajoute les transitions mesurées
  warm();
  seekAll(0);
  cues.sort((a, b) => a.t - b.t);
}

async function boot() {
  const sample = 'AÉéèàùâêîôûç’°×…?0123456789';
  await Promise.all([
    document.fonts.load(`800 100px "Inter Tight Variable"`, sample),
    document.fonts.load(`700 100px "Inter Tight Variable"`, sample),
    document.fonts.load(`italic 400 100px "Instrument Serif"`, sample),
    document.fonts.load(`500 40px "Inter Variable"`, sample),
    document.fonts.load(`600 40px "Inter Variable"`, sample),
    document.fonts.load(`700 40px "Inter Variable"`, sample),
  ]);
  await document.fonts.ready;
  build();

  window.__duration = DURATION;
  window.__cues = cues;
  window.__seek = t => seekAll(t);
  window.__ready = true;
  if (RENDER) { document.documentElement.classList.add('render'); return; }

  // ----- aperçu navigateur -----
  const fit = () => {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  };
  fit(); addEventListener('resize', fit);
  const hud = $('#hud');
  const still = params.get('t');
  if (still !== null) { seekAll(+still); hud.textContent = `t = ${(+still).toFixed(2)} s`; return; }
  let t = 0, playing = true, last = performance.now();
  addEventListener('keydown', e => {
    if (e.code === 'Space') playing = !playing;
    if (e.code === 'ArrowRight') t = Math.min(DURATION, t + 1);
    if (e.code === 'ArrowLeft') t = Math.max(0, t - 1);
  });
  const loop = now => {
    if (playing) t = (t + (now - last) / 1000) % DURATION;
    last = now;
    seekAll(t);
    hud.textContent = `${t.toFixed(2)} s — espace : pause · ← → : ±1 s`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
boot();
})();
