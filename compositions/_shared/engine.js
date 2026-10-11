/* ==========================================================================
   Moteur d'animation partagé par les compositions (GSAP, timeline déterministe).

   Une composition appelle :
     MotionEngine.run({ duration, fonts: [...], build(E) { ... } })

   build(E) construit la timeline avec les outils de E (tl, rise, sink, cue,
   measure, drivers…). Le moteur expose ensuite window.__seek(t) pour le rendu
   image par image (scripts/render.mjs) et un lecteur temps réel pour l'aperçu.
   ========================================================================== */
(() => {
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';

function create(duration) {
  gsap.registerPlugin(CustomEase, DrawSVGPlugin);
  // Courbe des animations du site premiere-immo.fr : cubic-bezier(.2,.7,.2,1)
  CustomEase.create('pi', 'M0,0 C0.2,0.7 0.2,1 1,1');
  CustomEase.create('io', 'M0,0 C0.7,0 0.13,1 1,1');

  const stage = document.getElementById('stage');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, p) => a + (b - a) * p;
  const EZ = {};
  const ez = (name, p) => (EZ[name] || (EZ[name] = gsap.parseEase(name)))(p);
  const svgEl = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const hash = n => { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'pi', duration: 0.8 } });
  const drivers = [];   // fonctions pures du temps, exécutées après chaque seek
  const cues = [];      // repères sonores exportés pour la bande-son
  const cue = (t, type, gain = 1) => cues.push({ t: Math.round(t * 1000) / 1000, type, gain });
  const measures = [];
  const measure = (t, get, add) => measures.push({ t, get, add });

  function seekAll(t) { tl.seek(t, true); for (const d of drivers) d(t); }
  const warm = () => { for (let t = 0; t <= duration + 1e-6; t += 1 / 60) seekAll(t); };
  function rel(el) {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    const x = r.left - s.left, y = r.top - s.top;
    return { x, y, w: r.width, h: r.height, cx: x + r.width / 2, cy: y + r.height / 2 };
  }

  /* Découpe en caractères (conserve les <span> internes). */
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
  /* Découpe en mots (garde le crénage à l'intérieur de chaque mot). */
  function splitWords(root) {
    const words = [];
    const walk = node => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span');
            s.className = 'wd'; s.textContent = part;
            frag.appendChild(s); words.push(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      }
    };
    walk(root);
    return words;
  }

  /* Entrée « masque » : les éléments montent depuis sous la ligne. */
  function rise(targets, at, o = {}) {
    return tl.fromTo(targets,
      { yPercent: o.from ?? 120, rotation: o.rot ?? 0, opacity: o.fade ? 0 : 1 },
      { yPercent: 0, rotation: 0, opacity: 1, duration: o.dur ?? 0.9, stagger: o.stagger ?? 0.06, ease: o.ease ?? 'pi', immediateRender: o.ir ?? true }, at);
  }
  /* Sortie vers le haut. */
  function sink(targets, at, o = {}) {
    return tl.to(targets, { yPercent: o.to ?? -120, opacity: o.fade ? 0 : 1, duration: o.dur ?? 0.45, stagger: o.stagger ?? 0.03, ease: o.ease ?? 'power3.in' }, at);
  }
  /* Apparition douce façon site (fondu + translation verticale). */
  function fadeUp(targets, at, o = {}) {
    return tl.fromTo(targets, { opacity: 0, y: o.y ?? 40 }, { opacity: 1, y: 0, duration: o.dur ?? 0.8, stagger: o.stagger ?? 0.08, ease: o.ease ?? 'pi' }, at);
  }
  const show = (sel, t) => tl.set(sel, { visibility: 'visible' }, t);
  const hide = (sel, t) => tl.set(sel, { visibility: 'hidden' }, t);

  /* Caméra : secousses et « bumps » sur un conteneur. */
  const shakes = [], bumps = [];
  const shake = (t, amp, dur = 0.4) => shakes.push({ t, amp, dur });
  const bump = (t, a) => bumps.push({ t, a });
  function camera(el) {
    drivers.push(t => {
      let sx = 0, sy = 0, sr = 0, sc = 1;
      for (const s of shakes) {
        const p = (t - s.t) / s.dur;
        if (p < 0 || p > 1) continue;
        const e = s.amp * (1 - p) * (1 - p);
        sx += e * Math.sin(t * 91.7 + s.t * 13.1);
        sy += e * Math.cos(t * 83.3 + s.t * 7.7);
        sr += e * 0.02 * Math.sin(t * 67.9 + s.t);
      }
      for (const b of bumps) { const d = t - b.t; if (d >= 0 && d < 0.8) sc += b.a * Math.exp(-d * 7); }
      el.style.transform = `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) rotate(${sr.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
    });
  }

  /* Machine à écrire déterministe. */
  function typewriter(el, text, t0, cps, o = {}) {
    drivers.push(t => {
      const n = clamp(Math.floor((t - t0) * cps), 0, text.length);
      el.textContent = text.slice(0, n);
    });
    if (o.cue !== false) for (let i = 0; i < text.length; i++) if (text[i] !== ' ') cue(t0 + i / cps, 'type', 0.5 + 0.25 * ((i * 7) % 3) / 2);
    return t0 + text.length / cps;
  }

  /* Compteur déterministe (format français : espace fine entre milliers). */
  function counter(el, to, t0, dur, o = {}) {
    const fmt = n => (o.pre || '') + Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ') + (o.suf || '');
    drivers.push(t => { el.textContent = fmt(to * ez(o.ease || 'expo.out', prog(t, t0, t0 + dur))); });
  }

  return { stage, tl, drivers, cues, cue, measure, measures, seekAll, warm, rel, splitChars, splitWords, rise, sink, fadeUp, show, hide,
           shake, bump, camera, typewriter, counter, $, $$, clamp, prog, lerp, ez, svgEl, hash, rng, duration };
}

async function run({ duration, fonts = [], build }) {
  const params = new URLSearchParams(location.search);
  const RENDER = params.has('render');
  const sample = 'AÉéèàùâêîôûç’°×…?€0123456789';
  await Promise.all(fonts.map(f => document.fonts.load(f, sample)));
  await document.fonts.ready;
  await Promise.all(Array.from(document.images).map(img => (img.decode ? img.decode().catch(() => {}) : null)));

  const E = create(duration);
  build(E);
  E.tl.set({}, {}, duration);
  // 1. initialise tout dans l'ordre chronologique, 2. mesure, 3. ajoute les transitions mesurées
  E.warm();
  for (const m of E.measures) { E.seekAll(m.t); m.val = m.get(); }
  E.seekAll(0);
  for (const m of E.measures) m.add(m.val);
  E.warm();
  E.seekAll(0);
  E.cues.sort((a, b) => a.t - b.t);

  window.__duration = duration;
  window.__cues = E.cues;
  window.__seek = t => E.seekAll(t);
  window.__ready = true;
  if (RENDER) { document.documentElement.classList.add('render'); return; }

  // ----- aperçu navigateur -----
  const stage = E.stage;
  const fit = () => {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  };
  fit(); addEventListener('resize', fit);
  const hud = document.getElementById('hud');
  const still = params.get('t');
  if (still !== null) { E.seekAll(+still); if (hud) hud.textContent = `t = ${(+still).toFixed(2)} s`; return; }
  let t = 0, playing = true, last = performance.now();
  addEventListener('keydown', e => {
    if (e.code === 'Space') playing = !playing;
    if (e.code === 'ArrowRight') t = Math.min(duration, t + 1);
    if (e.code === 'ArrowLeft') t = Math.max(0, t - 1);
  });
  const loop = now => {
    if (playing) t = (t + (now - last) / 1000) % duration;
    last = now;
    E.seekAll(t);
    if (hud) hud.textContent = `${t.toFixed(2)} s — espace : pause · ← → : ±1 s`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

window.MotionEngine = { run };
})();
