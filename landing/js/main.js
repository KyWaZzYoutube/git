/* ==========================================================================
   Première Immo — landing page « agence de publicité immobilière »
   Interactions (vidéo, carrousel, FAQ, agenda) et animations GSAP + ScrollTrigger.
   Tout reste lisible sans JavaScript et avec « réduire les animations ».
   ========================================================================== */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const root = document.documentElement;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const MOTION = !REDUCE && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

$$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- navigation : fond flouté dès qu'on défile ---------- */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- vidéo d'accueil : lecture muette en boucle, puis avec le son au clic ---------- */
(function vsl() {
  const video = $('#vsl'), btn = $('#vslBtn'), label = $('#vslLabel');
  if (!video || !btn) return;
  let withSound = false;
  if (REDUCE) label.textContent = 'Lancer la vidéo';
  else {
    const p = video.play();
    if (p && p.catch) p.catch(() => { label.textContent = 'Lancer la vidéo'; });
  }
  function start() {
    withSound = true;
    video.currentTime = 0;
    video.loop = false;
    video.muted = false;
    video.controls = true;
    video.play();
    btn.classList.add('is-hidden');
    video.removeEventListener('click', start);
  }
  btn.addEventListener('click', start);
  video.addEventListener('click', start);
  // l'aperçu muet s'arrête quand la vidéo sort de l'écran (économie de batterie)
  new IntersectionObserver(([e]) => {
    if (withSound || REDUCE) return;
    if (e.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.15 }).observe(video);
})();

/* ---------- carrousel des vidéos : carte centrale + voisines, en boucle ---------- */
(function carousel() {
  const track = $('#carTrack');
  if (!track) return;
  const originals = $$('.car-card', track);
  const n = originals.length;
  // un second jeu de cartes : celle qui sort d'un côté réapparaît de l'autre sans traverser le centre
  originals.forEach(c => {
    const k = c.cloneNode(true);
    k.setAttribute('aria-hidden', 'true');
    track.appendChild(k);
  });
  const cards = $$('.car-card', track);
  const N = cards.length;
  const dotsWrap = $('#carDots');
  const dots = originals.map((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Vidéo ${i + 1} : ${$('h3', c).textContent}`);
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });
  originals.forEach(c => {
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-label', `Lire la vidéo : ${$('h3', c).textContent}`);
  });
  let cur = 0, cw = 0, gap = 32, slots = cards.map((_, i) => i);

  const slotOf = i => { let s = ((i - cur) % N + N) % N; if (s > N / 2) s -= N; return s; };   // −3…2 pour 6 cartes
  function layout(animate = true) {
    cards.forEach((c, i) => {
      const s = slotOf(i), was = slots[i];
      const jump = Math.abs(s - was) > 1;                // passage d'un bord à l'autre : sans transition
      c.classList.toggle('no-anim', !animate || jump);
      c.style.transform = `translateX(${s * (cw + gap)}px) scale(${s === 0 ? 1 : 0.9})`;
      c.style.opacity = Math.abs(s) <= 1 ? 1 : 0;
      c.style.zIndex = s === 0 ? 3 : (Math.abs(s) === 1 ? 2 : 1);
      c.classList.toggle('is-side', s !== 0);
      c.style.pointerEvents = Math.abs(s) <= 1 ? '' : 'none';
      slots[i] = s;
      if (s !== 0) stopVideo(c);
    });
    if (!animate) requestAnimationFrame(() => cards.forEach(c => c.classList.remove('no-anim')));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === cur % n));
  }
  function size() {
    const w = track.clientWidth;
    cw = Math.round(Math.min(w * (innerWidth < 768 ? 0.82 : 0.6), 900));
    gap = innerWidth < 768 ? 14 : 34;
    track.style.setProperty('--cw', `${cw}px`);
    layout(false);
  }
  function step(d) { cur = ((cur + d) % N + N) % N; layout(); }
  function goTo(k) {
    const diff = ((k - (cur % n)) % n + n) % n;
    if (!diff) return;
    const dir = diff <= n / 2 ? 1 : -1;
    let left = dir > 0 ? diff : n - diff;
    const tick = () => { step(dir); if (--left > 0) setTimeout(tick, 140); };
    tick();
  }
  function stopVideo(c) {
    const v = $('video', c);
    if (v) { v.pause(); v.remove(); }
  }
  function play(c) {
    if ($('video', c)) return;
    const v = document.createElement('video');
    v.src = c.dataset.video;
    v.controls = true; v.playsInline = true; v.autoplay = true;
    c.appendChild(v);
    v.play().catch(() => {});
    const hero = $('#vsl');
    if (hero && !hero.paused) hero.pause();
  }
  cards.forEach(c => {
    c.addEventListener('click', e => {
      if (e.target.closest('video')) return;
      const s = slots[cards.indexOf(c)];
      if (s === 0) play(c); else step(s);
    });
    c.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      c.click();
    });
  });
  $('#carPrev').addEventListener('click', () => step(-1));
  $('#carNext').addEventListener('click', () => step(1));
  // glisser du doigt
  let x0 = null;
  track.addEventListener('pointerdown', e => { x0 = e.clientX; });
  track.addEventListener('pointerup', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });
  addEventListener('resize', size);
  size();
})();

/* ---------- avis : trois colonnes qui défilent en sens inverses ---------- */
(function reviews() {
  const grid = $('#rvGrid'), tpl = $('#rvData');
  if (!grid || !tpl) return;
  const src = $$('.rv-card', tpl.content);
  const orders = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
  orders.forEach((order, k) => {
    const col = document.createElement('div');
    col.className = `rv-col${k === 1 ? ' down' : ''}`;
    const tr = document.createElement('div');
    tr.className = 'rv-track';
    tr.style.setProperty('--d', `${[40, 46, 43][k]}s`);
    for (let rep = 0; rep < 2; rep++) {
      order.forEach(i => {
        const card = src[i].cloneNode(true);
        if (rep || k) card.setAttribute('aria-hidden', 'true');
        tr.appendChild(card);
      });
    }
    col.appendChild(tr);
    grid.appendChild(col);
  });
})();

/* ---------- FAQ : ouverture animée ---------- */
$$('.qa').forEach(d => {
  const summary = $('summary', d), body = $('.qa-a', d);
  d.classList.toggle('is-open', d.open);
  summary.addEventListener('click', e => {
    if (!MOTION) { requestAnimationFrame(() => d.classList.toggle('is-open', d.open)); return; }
    e.preventDefault();
    if (d.classList.contains('is-open')) {
      d.classList.remove('is-open');
      gsap.to(body, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height,opacity' }); } });
    } else {
      d.open = true;
      d.classList.add('is-open');
      gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'height' });
    }
  });
});

/* ---------- agenda Calendly : chargé seulement à l'approche de la section ---------- */
(function calendly() {
  const box = $('#calendly');
  if (!box) return;
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    const s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.onload = () => {
      if (!window.Calendly) return;
      window.Calendly.initInlineWidget({ url: box.dataset.url, parentElement: box });
      box.classList.add('is-loaded');
    };
    document.head.appendChild(s);
  }, { rootMargin: '600px' }).observe(box);
})();

/* ---------- carte « une seule agence par secteur » : nid d'abeilles ---------- */
const zoneHex = (function zone() {
  const g = $('#zoneHex');
  if (!g) return [];
  const R = 26, w = Math.sqrt(3) * R, NS = 'http://www.w3.org/2000/svg';
  const out = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 11; col++) {
      const cx = 30 + col * w + (row % 2 ? w / 2 : 0), cy = 22 + row * R * 1.5;
      if (cx > 510) continue;
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = Math.PI / 6 + k * Math.PI / 3;
        return `${(cx + (R - 2) * Math.cos(a)).toFixed(1)},${(cy + (R - 2) * Math.sin(a)).toFixed(1)}`;
      }).join(' ');
      const p = document.createElementNS(NS, 'polygon');
      p.setAttribute('points', pts);
      p.dataset.cx = cx; p.dataset.cy = cy;
      g.appendChild(p);
      out.push(p);
    }
  }
  // « votre secteur » : l'alvéole la plus proche du point (330, 100)
  const me = out.reduce((a, b) => (Math.hypot(b.dataset.cx - 330, b.dataset.cy - 100) < Math.hypot(a.dataset.cx - 330, a.dataset.cy - 100) ? b : a));
  me.classList.add('me');
  $('#zonePin').setAttribute('transform', `translate(${me.dataset.cx} ${me.dataset.cy - 4})`);
  if (!MOTION) me.classList.add('is-me');
  return out;
})();

/* ==========================================================================
   Animations (GSAP)
   ========================================================================== */
if (!MOTION) { root.classList.remove('intro'); return; }
gsap.registerPlugin(ScrollTrigger);

/* Découpe en mots ou en lettres (les espaces insécables restent dans le mot). */
function split(el, mode) {
  const out = [];
  Array.from(el.childNodes).forEach(node => {
    if (node.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    node.textContent.split(/( +)/).forEach(part => {
      if (!part) return;
      if (/^ +$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      if (mode === 'chars') {
        const word = document.createElement('span');
        word.className = 'w';
        Array.from(part).forEach(ch => {
          const c = document.createElement('span');
          c.className = 'c';
          c.textContent = ch;
          word.appendChild(c);
          out.push(c);
        });
        frag.appendChild(word);
      } else {
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = part;
        frag.appendChild(w);
        out.push(w);
      }
    });
    node.replaceWith(frag);
  });
  return out;
}

/* ---------- ouverture : le décor s'allume, la navigation descend, le titre se construit ---------- */
document.fonts.ready.then(() => {
  const title = $('.hero-title'), line = $('.ht-line', title), pill = $('.pill', title);
  const words = split(line, 'words'), chars = split($('.pill-in', pill), 'chars');
  const navItems = $$('#nav .nav-logo, #nav .nav-links a, #nav .nav-cta');
  const tl = gsap.timeline({
    defaults: { ease: 'power4.out' },
    onComplete: () => gsap.set(['.hero-bg img', navItems, '.hero-top', '.hero-sub', '#vslBox', '.hero-ctas .btn', pill], { clearProps: 'all' }),
  });
  tl.add(() => root.classList.remove('intro'), 0);
  tl.from('.hero-bg img', { opacity: 0, scale: 1.15, filter: 'brightness(0.2) blur(12px)', duration: 2.2, ease: 'power2.out' }, 0);
  tl.from(navItems, { opacity: 0, y: -24, duration: 0.8, stagger: 0.06 }, 0.15);
  tl.from('.hero-top', { opacity: 0, y: 16, duration: 0.8 }, 0.3);
  tl.from(words, { yPercent: 110, opacity: 0, duration: 1, stagger: 0.08 }, 0.35);
  tl.from(pill, { scale: 0.4, rotation: -16, opacity: 0, duration: 1.1, ease: 'back.out(1.7)' }, 0.7);
  tl.from(chars, { yPercent: 90, opacity: 0, duration: 0.6, stagger: 0.025 }, 0.85);
  tl.from('.hero-sub', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1 }, 1.0);
  tl.from('#vslBox', { opacity: 0, y: 70, scale: 0.95, duration: 1.2 }, 1.1);
  tl.from('.hero-ctas .btn', { opacity: 0, y: 20, duration: 0.8, stagger: 0.08 }, 1.3);
});
// le décor de l'accueil glisse doucement au défilement
gsap.to('.hero-bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

/* ---------- pastilles « aimantées » : elles suivent un peu la souris ---------- */
if (FINE) {
  const items = $$('.pill').map(el => ({ el, x: 0, y: 0 }));
  const mouse = { x: -9999, y: -9999 };
  let running = false;
  const tick = () => {
    let moving = false;
    items.forEach(it => {
      const r = it.el.getBoundingClientRect();
      const dx = mouse.x - (r.left + r.width / 2 - it.x), dy = mouse.y - (r.top + r.height / 2 - it.y);
      const ox = Math.max(0, Math.abs(dx) - r.width / 2), oy = Math.max(0, Math.abs(dy) - r.height / 2);
      const k = 1 - Math.min(Math.hypot(ox, oy) / 150, 1);
      const tx = dx * 0.3 * k, ty = dy * 0.3 * k;
      it.x += (tx - it.x) * 0.12;
      it.y += (ty - it.y) * 0.12;
      if (Math.abs(tx - it.x) > 0.05 || Math.abs(ty - it.y) > 0.05) moving = true;
      it.el.style.translate = `${it.x.toFixed(2)}px ${it.y.toFixed(2)}px`;
      const inner = it.el.firstElementChild;
      if (inner) inner.style.translate = `${(it.x * 0.25).toFixed(2)}px ${(it.y * 0.25).toFixed(2)}px`;
    });
    if (moving) requestAnimationFrame(tick); else running = false;
  };
  const go = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; go(); }, { passive: true });
  addEventListener('scroll', go, { passive: true });
  root.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; go(); });
}

/* ---------- titres de section et apparitions au défilement ---------- */
$$('[data-head]').forEach(h => {
  gsap.from(h, { opacity: 0, y: 40, filter: 'blur(10px)', duration: 1, ease: 'power4.out', clearProps: 'filter',
    scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
});
gsap.set('[data-reveal]', { opacity: 0, y: 40 });
ScrollTrigger.batch('[data-reveal]', {
  start: 'top 88%', once: true,
  onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, clearProps: 'transform' }),
});

/* ---------- bento 1 : les leviers convergent vers Première Immo, puis le contact sort ---------- */
(function flow() {
  const svg = $('#flow');
  if (!svg) return;
  const SEG = 90;
  const ins = $$('#flowIn path', svg), out = $('#flowOut', svg);
  const pulse = p => {
    const q = p.cloneNode();
    q.removeAttribute('id');
    q.classList.add('pulse');
    p.after(q);
    const L = p.getTotalLength();
    q.style.strokeDasharray = `${SEG} ${L + SEG}`;
    return { q, L };
  };
  [...ins, out].forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const pin = ins.map(pulse), pout = pulse(out);
  const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.5 });
  const delays = [0, 0.18, 0.08, 0.26];
  pin.forEach(({ q, L }, i) => {
    loop.fromTo(q, { strokeDashoffset: SEG, opacity: 1 }, { strokeDashoffset: -L, duration: 1.7, ease: 'power1.in' }, delays[i]);
    loop.set(q, { opacity: 0 }, delays[i] + 1.7);
  });
  loop.to('#flowLogo', { scale: 1.1, svgOrigin: '330 125', duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 }, 1.75);
  loop.fromTo('#flowHaloC', { opacity: 0.35, scale: 1 }, { opacity: 1, scale: 1.25, svgOrigin: '330 125', duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.7);
  loop.fromTo(pout.q, { strokeDashoffset: SEG, opacity: 1 }, { strokeDashoffset: -pout.L, duration: 1.1, ease: 'power2.out' }, 1.95);
  loop.set(pout.q, { opacity: 0 }, 3.05);
  loop.fromTo('#flowLead', { scale: 1 }, { scale: 1.07, svgOrigin: '550 125', duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }, 2.6);
  const intro = gsap.timeline({ paused: true });
  intro.to(ins, { strokeDashoffset: 0, duration: 1.4, stagger: 0.08, ease: 'power2.out' }, 0)
    .from('#flowLogo', { scale: 0, svgOrigin: '330 125', duration: 0.7, ease: 'back.out(2)' }, 0.5)
    .to(out, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' }, 1.1)
    .from('#flowLead', { opacity: 0, x: -24, duration: 0.6, ease: 'power3.out' }, 1.5)
    .add(() => loop.play(), 1.9);
  ScrollTrigger.create({ trigger: svg, start: 'top 85%', once: true, onEnter: () => intro.play() });
  ScrollTrigger.create({ trigger: svg, start: 'top bottom', end: 'bottom top', onToggle: self => { if (intro.progress() === 1) self.isActive ? loop.play() : loop.pause(); } });
})();

/* ---------- bento 2 : la photo se floute derrière la citation ---------- */
gsap.from('.b-quote-blur', { opacity: 0, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: '.b-quote', start: 'top 80%', once: true } });
gsap.from('.b-quote blockquote, .b-who', { y: 24, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.b-quote', start: 'top 80%', once: true } });

/* ---------- bento 3 : les barres montent, la dernière en orange ---------- */
gsap.timeline({ scrollTrigger: { trigger: '#bars', start: 'top 80%', once: true } })
  .from('#bars .bars i:not(.hot)', { scaleY: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.2)
  .from('#bars .bars i.hot', { scaleY: 0, duration: 1, ease: 'expo.out' }, 0.5)
  .from('#bars .bars-tile', { scale: 0.5, rotation: -10, opacity: 0, duration: 0.8, ease: 'back.out(2)' }, 0.8);

/* ---------- bento 4 : le secteur s'allume, les autres restent éteints ---------- */
if (zoneHex.length) {
  const me = zoneHex.find(p => p.classList.contains('me'));
  gsap.timeline({ scrollTrigger: { trigger: '#zone', start: 'top 80%', once: true } })
    .from(zoneHex, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)', stagger: { each: 0.012, from: 'center', grid: 'auto' } }, 0)
    .add(() => me.classList.add('is-me'), 0.9)
    .from('#zonePin', { y: -60, opacity: 0, duration: 0.8, ease: 'bounce.out' }, 1.0)
    .to(zoneHex.filter(p => p !== me), { opacity: 0.55, duration: 0.6 }, 1.2);
}

/* ---------- méthode : les cartes se posent une à une, les captures flottent ---------- */
(function method() {
  const box = $('#steps');
  if (!box) return;
  const order = $$('.step, .step-img', box).filter(el => getComputedStyle(el).display !== 'none');
  const imgs = order.filter(el => el.classList.contains('step-img'));
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: box, start: 'top 75%', once: true },
    onComplete: () => {
      imgs.forEach((el, i) => gsap.to(el, { y: -8, duration: 2.5 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      gsap.to('.steps-glow', { scale: 1.12, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    },
  });
  tl.from('.steps-glow', { opacity: 0, duration: 1.4, ease: 'power2.out' }, 0);
  let k = 0;
  order.forEach((el, i) => {
    const isImg = el.classList.contains('step-img');
    tl.from(el, isImg
      ? { opacity: 0, scale: 0.7, rotation: -10, duration: 0.8, ease: 'back.out(1.6)' }
      : { opacity: 0, y: 90, scale: 0.96, rotation: k++ % 2 ? 6 : -6, duration: 0.9 }, 0.15 + i * 0.16);
  });
})();

/* ---------- tarifs : surlignage peint, cartes qui montent, prix qui défilent, avantages un par un ---------- */
(function pricing() {
  const head = gsap.timeline({ defaults: { ease: 'power4.out' }, scrollTrigger: { trigger: '#priceHead', start: 'top 82%', once: true } });
  head.from('#priceHead', { opacity: 0, y: 40, filter: 'blur(10px)', duration: 1, clearProps: 'filter' }, 0)
    .fromTo('#priceHead .hl', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 0.9, ease: 'power3.inOut' }, 0.4)
    .add(() => $('#priceHead .hl').classList.add('is-lit'), 1.0)
    .from('#priceLead', { opacity: 0, y: 20, duration: 0.8 }, 0.3);
  $$('.price').forEach((card, i) => {
    const num = $('.price-num', card), to = +num.dataset.to, c = { v: 0 };
    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: i * 0.15, scrollTrigger: { trigger: '#priceGrid', start: 'top 78%', once: true } })
      .from(card, { opacity: 0, y: 90, rotation: i % 2 ? 2 : -2, duration: 1.1, ease: 'expo.out' }, 0)
      .from($$('.price-title, .price-desc, .price-badge', card), { opacity: 0, y: 20, duration: 0.7, stagger: 0.06 }, 0.25)
      .from($$('.line', card), { scaleX: 0, duration: 0.9, stagger: 0.25, ease: 'power2.inOut' }, 0.35)
      .fromTo(c, { v: 0 }, { v: to, duration: 1.3, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(c.v); } }, 0.45)
      .from($$('.price-note, .btn, .price-inc', card), { opacity: 0, y: 14, duration: 0.6, stagger: 0.08 }, 0.7)
      .from($$('.checks li', card), { opacity: 0, x: -14, duration: 0.5, stagger: 0.07 }, 0.9);
  });
})();

/* ---------- braises qui flottent derrière les tarifs ---------- */
(function embers() {
  const cv = $('#embers');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, parts = [], on = false, last = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  // trois braises pré-dessinées (nette, floue, très floue) : le flou n'est calculé qu'une fois
  const LEN = 36, TH = 5, PAD = 14;
  const sprites = [0, 2.5, 5].map(b => {
    const s = document.createElement('canvas');
    s.width = (LEN + PAD * 2) * 2; s.height = (TH + PAD * 2) * 2;
    const c = s.getContext('2d');
    c.scale(2, 2);
    c.filter = b ? `blur(${b}px)` : 'none';
    const g = c.createLinearGradient(PAD, 0, PAD + LEN, 0);
    g.addColorStop(0, 'rgba(255,81,0,0)');
    g.addColorStop(0.6, 'rgba(255,110,40,1)');
    g.addColorStop(1, 'rgba(255,170,110,1)');
    c.fillStyle = g;
    c.beginPath();
    c.roundRect(PAD, PAD, LEN, TH, TH / 2);
    c.fill();
    return s;
  });
  const make = (y) => {
    const side = Math.random() < 0.5 ? rnd(0, 0.28) : rnd(0.72, 1);   // surtout sur les côtés
    return { x: side * W, y: y ?? rnd(0, H), k: rnd(0.35, 0.9), a: rnd(0.25, 0.85), vy: -rnd(10, 26), vx: rnd(4, 12), s: sprites[Math.floor(Math.random() * 3)] };
  };
  function resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = Array.from({ length: Math.min(60, Math.round(W * H / 26000)) }, () => make());
  }
  function frame(t) {
    if (!on) return;
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    const dpr = cv.width / W;
    parts.forEach(p => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y < -40 || p.x > W + 40) Object.assign(p, make(H + 30));
      const c = Math.cos(-1.15) * p.k * dpr, s = Math.sin(-1.15) * p.k * dpr;
      ctx.setTransform(c, s, -s, c, p.x * dpr, p.y * dpr);
      ctx.globalAlpha = p.a;
      ctx.drawImage(p.s, -(LEN / 2 + PAD), -(TH / 2 + PAD), LEN + PAD * 2, TH + PAD * 2);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  resize();
  addEventListener('resize', resize);
  new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    if (on) { last = 0; requestAnimationFrame(frame); }
  }).observe(cv);
})();

/* ---------- appel final et pied de page ---------- */
gsap.from('.deck', { opacity: 0, y: 100, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.deck', start: 'top 90%', once: true } });
gsap.from('.foot-big img', { opacity: 0, y: 80, scale: 0.92, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: '.foot-big', start: 'top 92%', once: true } });
gsap.from('.foot-glow', { opacity: 0, scaleY: 0.3, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: '.foot-big', start: 'top 92%', once: true } });
})();
