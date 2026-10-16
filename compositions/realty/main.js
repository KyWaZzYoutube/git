/* ==========================================================================
   Realty — bande démo du logiciel immobilier (110 s · 1920×1080 · 120 BPM)

   Les 20 fonctionnalités dans l'ordre voulu, chacune enchaînée à la suivante
   par une vraie transition (pilule du logo, zoom dans l'écran, iris, morphing,
   stores, poussée) plutôt que par des diapositives.

    0    0,0  intro, logo                     11  59,5  retours de visite
    1    5,0  cartes stratégiques             12  64,0  Click & Visit
    2   10,0  prospection terrain             13  69,0  site web inclus
    3   15,0  prospection cadastrale          14  74,0  offre d'achat
    4   20,0  saisie assistée                 15  78,0  compromis
    5   24,5  Magic Scan                      16  82,5  SRU & notaires
    6   29,5  saisie IA                       17  87,5  automatisations
    7   34,5  estimations                     18  93,5  reporting
    8   39,0  mandat sur mobile               19  97,5  TRACFIN (bientôt)
    9   44,5  valorisation (4 temps)          20 100,5  formation ALUR (bientôt)
   10   51,5  commercialisation               21 103,5  fin : logo, démo
   ========================================================================== */
MotionEngine.run({
  duration: 110,
  fonts: ['700 100px "Bricolage Grotesque Variable"', '600 40px "Inter Variable"', '500 40px "Inter Variable"', '700 40px "Inter Variable"'],
  build(E) {
    const { tl, cue, show, hide, $, $$, drivers, counter, typewriter, shake, bump, camera, rel, ez, prog, clamp, lerp, svgEl, rng } = E;
    camera($('#bump'));
    const R = rng(20261016);
    const rr = (a, b) => a + (b - a) * R();
    const H = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
    const ico = (id, cls = 'ico') => `<svg class="${cls}"><use href="#${id}"/></svg>`;
    const BLUE = '#3300FF', PINK = '#E0219B', ORANGE = '#FF5A36', INK = '#141B33';

    /* ---------------- outils communs ---------------- */
    // titre d'une scène : sur-titre, lignes masquées, sous-titre ; sortie optionnelle
    function titles(sc, t, out) {
      const eb = $$('.tx .eb', $(sc)), lns = $$('.tx .h .ln', $(sc)), sub = $$('.tx .sub', $(sc));
      tl.fromTo(eb, { yPercent: 115 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, t);
      tl.fromTo(lns, { yPercent: 118, rotation: 3 }, { yPercent: 0, rotation: 0, duration: 0.95, stagger: 0.09, ease: 'expo.out', transformOrigin: '0% 100%' }, t + 0.08);
      if (sub.length) tl.fromTo(sub, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, ease: 'pi' }, t + 0.38);
      cue(t, 'title');
      if (out != null) {
        tl.to([...eb, ...lns], { yPercent: -118, duration: 0.42, stagger: 0.035, ease: 'power3.in' }, out);
        if (sub.length) tl.to(sub, { opacity: 0, y: -18, duration: 0.32, ease: 'power2.in' }, out);
      }
    }
    // lente dérive de caméra (propriétés CSS indépendantes des tweens GSAP)
    function drift(cam, t0, t1, s0 = 1, s1 = 1.045, dx = 0, dy = 0) {
      const el = $(cam);
      drivers.push(t => {
        const p = ez('sine.inOut', prog(t, t0, t1));
        el.style.scale = lerp(s0, s1, p).toFixed(4);
        el.style.translate = `${(dx * p).toFixed(1)}px ${(dy * p).toFixed(1)}px`;
      });
    }
    const pop = (els, t, o = {}) => tl.fromTo(els, { scale: o.from ?? 0.4, opacity: 0, y: o.y ?? 0 },
      { scale: 1, opacity: 1, y: 0, duration: o.dur ?? 0.6, stagger: o.stagger ?? 0.08, ease: o.ease ?? 'back.out(2.2)', transformOrigin: o.origin ?? '50% 50%' }, t);
    const slideIn = (els, t, o = {}) => tl.fromTo(els, { x: o.x ?? 0, y: o.y ?? 40, opacity: 0 },
      { x: 0, y: 0, opacity: 1, duration: o.dur ?? 0.8, stagger: o.stagger ?? 0.08, ease: o.ease ?? 'expo.out' }, t);

    // transition « pilule » : deux pilules du logo traversent l'écran en diagonale ; t = écran couvert
    const pw = $('#pw'), pwA = $('#pwA'), pwB = $('#pwB');
    function pillWipe(t, from, to, color = BLUE, dir = 1) {
      const a = (dir > 0 ? -32 : 148) * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
      const W = 6400, S = W / 2 + 1250;
      const place = (el, h, off) => {
        const nx = -dy * off, ny = dx * off;
        return { s: -S, apply: s => ({ x: 960 + dx * s + nx - W / 2, y: 540 + dy * s + ny - h / 2 }) };
      };
      tl.set(pw, { visibility: 'visible' }, t - 0.62);
      tl.set(pwA, { width: W, height: 2700, background: color, rotation: a * 180 / Math.PI, transformOrigin: '50% 50%' }, t - 0.62);
      tl.set(pwB, { width: W, height: 1700, rotation: a * 180 / Math.PI, transformOrigin: '50% 50%' }, t - 0.62);
      const pa = place(pwA, 2700, 0), pb = place(pwB, 1700, -420);
      tl.fromTo(pwB, pb.apply(-S), { ...pb.apply(S), duration: 1.1, ease: 'power2.inOut', immediateRender: false }, t - 0.62);
      tl.fromTo(pwA, pa.apply(-S), { ...pa.apply(S), duration: 1.1, ease: 'power2.inOut', immediateRender: false }, t - 0.55);
      tl.set(pw, { visibility: 'hidden' }, t + 0.6);
      if (to) show(to, t);
      if (from) hide(from, t);
      cue(t - 0.55, 'wipe');
    }
    // iris : la scène suivante s'ouvre en cercle depuis un point
    function iris(to, from, t, x, y, dur = 0.75) {
      show(to, t);
      tl.fromTo(to, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(2300px at ${x}px ${y}px)`, duration: dur, ease: 'expo.inOut', immediateRender: false }, t);
      tl.set(to, { clipPath: 'none' }, t + dur);
      if (from) hide(from, t + dur);
      cue(t, 'iris');
    }
    // poussée : la scène suivante pousse la précédente
    function push(to, from, t, axis = 'x', dur = 0.8) {
      const k = axis === 'x' ? 'xPercent' : 'yPercent';
      show(to, t);
      tl.fromTo(to, { [k]: 100 }, { [k]: 0, duration: dur, ease: 'expo.inOut', immediateRender: false }, t);
      tl.fromTo(from, { [k]: 0, filter: 'brightness(1)' }, { [k]: -32, filter: 'brightness(.55)', duration: dur, ease: 'expo.inOut', immediateRender: false }, t);
      hide(from, t + dur);
      cue(t, 'whoosh');
    }
    // stores : bandes verticales qui montent puis repartent
    function blinds(to, from, t, color) {
      const wrap = H('div', 'ov', '', $('#stage'));
      wrap.style.inset = '0';
      const bands = [];
      for (let i = 0; i < 6; i++) { const b = H('i', 'abs', '', wrap); Object.assign(b.style, { left: `${i * 320}px`, top: 0, width: '321px', height: '1080px', background: color }); bands.push(b); }
      tl.set(wrap, { visibility: 'visible' }, t - 0.5);
      tl.fromTo(bands, { yPercent: 100 }, { yPercent: 0, duration: 0.5, stagger: 0.04, ease: 'power3.in', immediateRender: false }, t - 0.5 - 0.2);
      tl.to(bands, { yPercent: -100, duration: 0.55, stagger: 0.04, ease: 'power3.out' }, t);
      tl.set(wrap, { visibility: 'hidden' }, t + 0.8);
      show(to, t); hide(from, t);
      cue(t - 0.6, 'whoosh');
    }
    function flash(t, up = 0.18, down = 0.4) {
      tl.fromTo('#flash', { opacity: 0 }, { opacity: 1, duration: up, ease: 'power2.in', immediateRender: false }, t - up);
      tl.to('#flash', { opacity: 0, duration: down, ease: 'power2.out' }, t);
    }

    // curseur : trajets [{t,x,y}], clics avec onde
    const cur = $('#cur'), rip = $('#rip');
    const paths = [], clicks = [];
    const curPath = keys => paths.push(keys);
    function click(t, x, y) {
      clicks.push(t);
      cue(t, 'click');
      tl.fromTo(rip, { x, y, scale: 0.3, opacity: 0.9, visibility: 'visible' }, { scale: 1.5, opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, t);
      tl.set(rip, { visibility: 'hidden' }, t + 0.56);
    }
    drivers.push(t => {
      let vis = false, x = 0, y = 0;
      for (const ks of paths) {
        if (t < ks[0].t || t > ks[ks.length - 1].t) continue;
        vis = true;
        for (let i = 0; i < ks.length - 1; i++) {
          if (t >= ks[i].t && t <= ks[i + 1].t) {
            const p = ez('power3.inOut', prog(t, ks[i].t, ks[i + 1].t));
            x = lerp(ks[i].x, ks[i + 1].x, p); y = lerp(ks[i].y, ks[i + 1].y, p);
          }
        }
      }
      let s = 1;
      for (const c of clicks) { const d = t - c; if (d > -0.08 && d < 0.25) s = Math.min(s, 1 - 0.18 * Math.sin(Math.PI * clamp((d + 0.08) / 0.33))); }
      cur.style.visibility = vis ? 'visible' : 'hidden';
      cur.style.transform = `translate(${(x - 7).toFixed(1)}px, ${(y - 5).toFixed(1)}px) scale(${s.toFixed(3)})`;
    });
    // particule qui suit un arc (x et y avec des courbes différentes)
    function arc(el, t, x0, y0, x1, y1, dur = 0.6) {
      tl.set(el, { x: x0, y: y0, opacity: 1, scale: 1 }, t);
      tl.to(el, { x: x1, duration: dur, ease: 'power1.in' }, t);
      tl.to(el, { y: y1, duration: dur, ease: 'power2.out' }, t);
      tl.to(el, { opacity: 0, scale: 0.4, duration: 0.12 }, t + dur - 0.05);
    }

    /* ======================================================================
       0 · INTRO (0–5)
       ====================================================================== */
    show('#s0', 0);
    drift('#c0', 0, 5, 1, 1.05);
    drivers.push(t => { $('#g0').style.transform = `perspective(900px) rotateX(58deg) translateY(${(t * 40) % 80}px) scale(1.4)`; });
    tl.fromTo('#g0', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'none' }, 0);
    tl.fromTo('#pRed', { x: 760, y: -760, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, 0.2);
    tl.fromTo('#pBlue', { x: -760, y: 760, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, 0.32);
    cue(0.2, 'swoosh'); cue(0.32, 'swoosh', 0.8); cue(0.62, 'logo');
    tl.fromTo('#heroIc', { scale: 0.7, rotation: -20 }, { scale: 1, rotation: 0, duration: 1.4, ease: 'expo.out', transformOrigin: '50% 50%' }, 0.2);
    // verrouillage : icône 210 px à gauche, logotype à droite (proportions du logo officiel)
    const LK = { x: 507, y: 316, s: 210 };
    const wmX = LK.x + LK.s * 461 / 371, wmY = LK.y + LK.s * 95 / 371, wmH = LK.s * 257 / 371, wmW = wmH * 1139 / 257;
    Object.assign($('#wm0').style, { left: `${wmX}px`, top: `${wmY}px`, width: `${wmW + 4}px`, height: `${wmH + 2}px` });
    Object.assign($('#wm0i').style, { width: `${wmW}px`, height: `${wmH}px` });
    tl.to('#heroIc', { x: LK.x - 760, y: LK.y - 340, scale: LK.s / 400, duration: 0.9, ease: 'expo.inOut', transformOrigin: '0% 0%' }, 1.5);
    tl.fromTo('#wm0i', { x: -wmW - 40 }, { x: 0, duration: 0.95, ease: 'expo.out' }, 2.05);
    cue(1.5, 'swoosh', 0.7);
    $('.tag0').style.top = '585px';
    tl.fromTo('#tag0', { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 2.55);
    cue(2.55, 'title', 0.7);
    tl.to(['#heroIc', '#wm0'], { y: '-=40', opacity: 0, duration: 0.5, ease: 'power3.in', stagger: 0.05 }, 4.05);
    tl.to('#tag0', { yPercent: -115, duration: 0.4, ease: 'power3.in' }, 4.0);
    pillWipe(4.75, '#s0', '#s1', BLUE, 1);

    /* ======================================================================
       1 · CARTES STRATÉGIQUES (4,75–10)
       ====================================================================== */
    const T1 = 4.75;
    const msvg = $('#map1svg');
    svgEl('path', { d: 'M-100 760 C 260 640 420 820 700 610 S 1120 300 1500 160', class: 'street', style: 'stroke:rgba(80,40,255,.45);stroke-width:26' }, msvg);
    const ilots = [];
    const COLS = 7, ROWS = 5, CW = 200, CH = 196;
    const jit = [];
    for (let r = 0; r <= ROWS; r++) { jit[r] = []; for (let c = 0; c <= COLS; c++) jit[r][c] = [c * CW + (c % COLS ? rr(-22, 22) : 0), r * CH + (r % ROWS ? rr(-22, 22) : 0)]; }
    const HOT = [3, 2];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const g = 15, p = [jit[r][c], jit[r][c + 1], jit[r + 1][c + 1], jit[r + 1][c]];
      const cx = (p[0][0] + p[1][0] + p[2][0] + p[3][0]) / 4, cy = (p[0][1] + p[1][1] + p[2][1] + p[3][1]) / 4;
      const pts = p.map(([x, y]) => [x + (cx - x) * g / 100 * 1.4, y + (cy - y) * g / 100 * 1.4]);
      const el = svgEl('polygon', { points: pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' '), class: 'ilot' }, msvg);
      const d = Math.hypot(c - HOT[0], (r - HOT[1]) * 1.2);
      const heat = clamp(1 - d / 4.2 + rr(-0.18, 0.18), 0.05, 1);
      const anc = H('i', 'abs', '', $('#map1')); Object.assign(anc.style, { left: `${cx}px`, top: `${cy}px`, width: '1px', height: '1px' });
      ilots.push({ el, c, r, heat, anc, cx, cy });
    }
    ilots.forEach(i => { const q = rel(i.anc); i.sx = q.cx; i.sy = q.cy; });
    const heatCol = h => h > 0.82 ? PINK : `rgba(51,0,255,${(0.1 + h * 0.85).toFixed(2)})`;
    const hot = ilots.find(i => i.c === HOT[0] && i.r === HOT[1]);
    hot.heat = 1;
    const ap = i => [i.sx, i.sy];
    const [hx, hy] = ap(hot);
    tl.set(hot.el, { fill: BLUE }, 0);
    tl.fromTo('.mapwrap', { scale: 9 }, { scale: 1, duration: 1.7, ease: 'expo.out', transformOrigin: `${hx - 520}px ${hy - 60}px` }, T1 - 0.05);
    drift('#c1', T1, 10, 1, 1.06, -20, 10);
    ilots.forEach(i => {
      const d = Math.hypot(i.c - HOT[0], i.r - HOT[1]);
      tl.to(i.el, { fill: heatCol(i.heat), duration: 0.6, ease: 'power2.out' }, T1 + 0.9 + d * 0.09);
    });
    titles('#s1', T1 + 0.75, 9.3);
    tl.fromTo('#scale1', { opacity: 0 }, { opacity: 1, duration: 0.5 }, T1 + 1.4);
    // trois bulles d'information sur les îlots chauds
    const LABS = [[hot, '9,2 %', 'Turnover'], [ilots.find(i => i.c === 4 && i.r === 1), '41', 'Ventes par an'], [ilots.find(i => i.c === 5 && i.r === 3), '286 k€', 'Honoraires à prendre']];
    LABS.forEach(([il, v, k], j) => {
      const [x, y] = ap(il);
      const lab = H('div', 'pinlab', `<div class="bubble"><b>${v}</b><small>${k}</small></div><i class="stem"></i>`, $('#labs1'));
      Object.assign(lab.style, { left: `${x}px`, top: `${y}px` });
      tl.fromTo(lab, { opacity: 0, y: 30, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)', transformOrigin: '50% 100%' }, T1 + 1.7 + j * 0.35);
      cue(T1 + 1.7 + j * 0.35, 'pop');
      tl.to(lab, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, 9.2 + j * 0.04);
    });
    // attribution des îlots aux collaborateurs
    const TEAM = [[BLUE, [[2, 1], [3, 1], [2, 2], [3, 2]]], [PINK, [[4, 1], [5, 1], [4, 2]]], [ORANGE, [[4, 3], [5, 3], [5, 2]]]];
    slideIn($$('#leg1 .lg-row'), T1 + 2.85, { x: -60, y: 0, stagger: 0.18 });
    TEAM.forEach(([col, cells], k) => cells.forEach(([c, r], j) => {
      const il = ilots.find(i => i.c === c && i.r === r);
      tl.to(il.el, { stroke: col, strokeWidth: 9, duration: 0.35, ease: 'power2.out' }, T1 + 2.95 + k * 0.18 + j * 0.05);
    }));
    [0, 1, 2].forEach(k => cue(T1 + 2.95 + k * 0.18, 'tick'));
    tl.to(['#leg1', '#scale1'], { opacity: 0, duration: 0.3 }, 9.25);
    // sortie : plongée dans un îlot, le téléphone sort de la carte
    tl.to('.mapwrap', { scale: 4.5, duration: 0.75, ease: 'expo.in', transformOrigin: `${hx - 520}px ${hy - 60}px` }, 9.3);
    cue(9.4, 'whoosh');
    iris('#s2', '#s1', 9.85, 530, 540, 0.7);

    /* ======================================================================
       2 · PROSPECTION TERRAIN (9,85–15)
       ====================================================================== */
    const T2 = 9.85;
    const st2 = $('#street2');
    for (let y = -40; y < 820; y += 150) for (let x = -60; x < 400; x += 130) {
      const w = 100 + rr(-8, 8), h = 118 + rr(-8, 8);
      svgEl('rect', { x: x + 14, y: y + 14, width: w, height: h, rx: 10, fill: '#fff', stroke: '#E3E6F2', 'stroke-width': 2 }, st2);
    }
    svgEl('path', { d: 'M-20 250 C 120 270 240 300 400 230', fill: 'none', stroke: '#D9DEFB', 'stroke-width': 26 }, st2);
    tl.fromTo('#ph2', { scale: 1.5, y: 40 }, { scale: 1, y: 0, duration: 1.0, ease: 'expo.out', transformOrigin: '50% 50%' }, T2);
    drift('#c2', T2, 15, 1, 1.04, -10, 0);
    drivers.push(t => {
      const p = ((t - T2) % 1.4) / 1.4;
      const r = $('#meRing');
      r.style.transform = `scale(${(0.25 + p * 1.2).toFixed(3)})`;
      r.style.opacity = (0.9 * (1 - p)).toFixed(3);
      $('#caret2').style.opacity = (Math.floor(t * 2.2) % 2 && t > 11.1 && t < 12.6) ? 1 : (t >= 11.1 && t < 12.6 ? 0.15 : 0);
    });
    pop('#me', T2 + 0.5, { from: 0 });
    titles('#s2', T2 + 0.35, 14.35);
    tl.fromTo('#sheet2', { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 10.75);
    cue(10.75, 'swoosh', 0.8);
    typewriter($('#type2'), 'Famille Lefèvre', 11.15, 13);
    tl.fromTo('#chip2', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)' }, 12.4);
    cue(12.4, 'tick');
    tl.to('#save2', { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 12.75);
    tl.to('#save2', { backgroundColor: BLUE, duration: 0.2 }, 12.8);
    cue(12.75, 'click');
    tl.fromTo('#tlFill', { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 12.85);
    $$('#tl2 .tl-it').forEach((it, i) => {
      tl.fromTo(it, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 12.9 + i * 0.38);
      tl.fromTo($('.tl-dot', it), { scale: 0.3 }, { scale: 1, duration: 0.6, ease: 'back.out(2.6)' }, 12.9 + i * 0.38);
      cue(12.9 + i * 0.38, 'pop', 0.8);
    });
    tl.fromTo('#tl2 .tl-rail', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 12.85);
    tl.to('#tl2', { opacity: 0, y: 30, duration: 0.35, ease: 'power2.in' }, 14.3);
    // sortie : on plonge dans l'écran du téléphone
    tl.to('#c2', { scale: 5.2, duration: 0.8, ease: 'expo.in', transformOrigin: '530px 520px' }, 14.35);
    cue(14.45, 'whoosh');
    show('#s3', 14.95);
    tl.fromTo('#s3', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none', immediateRender: false }, 14.95);
    tl.fromTo('#c3', { scale: 1.6 }, { scale: 1, duration: 1.1, ease: 'expo.out' }, 14.95);
    hide('#s2', 15.3);

    /* ======================================================================
       3 · PROSPECTION CADASTRALE (14,95–20)
       ====================================================================== */
    const T3 = 14.95;
    const cad = $('#cad3');
    const gcad = svgEl('g', { transform: 'rotate(-6 960 540) translate(960 540) scale(1.12) translate(-960 -540)' }, cad);
    const toScreen = (x, y) => {   // même transformation que le groupe, pour poser les marqueurs
      const a = -6 * Math.PI / 180, sx = (x - 960) * 1.12, sy = (y - 540) * 1.12;
      return [960 + sx * Math.cos(a) - sy * Math.sin(a), 540 + sx * Math.sin(a) + sy * Math.cos(a)];
    };
    const parcels = [], cents = [];
    for (let by = -160; by < 1200; by += 236) for (let bx = -200; bx < 2100; bx += 316) {
      const bw = 270, bh = 192, ncol = 3 + Math.floor(R() * 3);
      const cuts = [0]; for (let k = 1; k < ncol; k++) cuts.push(bw * k / ncol + rr(-14, 14)); cuts.push(bw);
      const mid = bh / 2 + rr(-20, 20);
      for (let k = 0; k < ncol; k++) for (const [y0, y1] of [[0, mid], [mid, bh]]) {
        const x0 = bx + cuts[k], x1 = bx + cuts[k + 1];
        const el = svgEl('rect', { x: x0, y: by + y0, width: x1 - x0, height: y1 - y0, class: 'parcel' }, gcad);
        parcels.push(el);
        cents.push(toScreen((x0 + x1) / 2, by + (y0 + y1) / 2));
      }
    }
    parcels.sort(() => R() - 0.5);
    tl.fromTo(parcels, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, stagger: { amount: 1.1 }, ease: 'power2.out' }, T3 + 0.05);
    drift('#c3', T3, 20, 1, 1.05, 10, -10);
    titles('#s3', T3 + 0.45, 19.35);
    // balayage radar
    const SC = [1000, 600];
    ['#scan3', '#sr3a'].forEach(s => Object.assign($(s).style, { left: `${SC[0]}px`, top: `${SC[1]}px` }));
    drivers.push(t => {
      $('#scan3').style.transform = `rotate(${((t - T3) * 150).toFixed(1)}deg)`;
      $('#scan3').style.opacity = (clamp((t - T3 - 0.6) / 0.6) * (1 - clamp((t - 19.2) / 0.3))).toFixed(3);
      const p = ((t - T3) % 1.8) / 1.8;
      $('#sr3a').style.transform = `scale(${(0.1 + p).toFixed(3)})`;
      $('#sr3a').style.opacity = (t > T3 + 0.6 && t < 19.3 ? (1 - p) : 0).toFixed(3);
    });
    const LAYERS = [['DPE récents', '#12A86B'], ['Pige particuliers', ORANGE], ['Annonces de confrères', '#F59E0B'], ['Estimations à suivre', '#9C8CFF'], ['Anciens clients', PINK], ['Acquéreurs revendeurs', '#00B3E6'], ['SCI et gérants', '#FFFFFF']];
    const free = cents.filter(([x, y]) => x > 40 && x < 1880 && y > 40 && y < 1040 && !(x < 900 && y < 520) && !(x > 1390 && y < 720) && !(x < 640 && y > 740));
    free.sort(() => R() - 0.5);
    let fi = 0;
    tl.fromTo('#lay3', { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, T3 + 0.8);
    LAYERS.forEach(([name, col], i) => {
      const ly = H('div', 'ly', `<i style="background:${col}"></i>${name}<span class="sw"><i class="f"></i><i class="k"></i></span>`, $('#lay3'));
      const t = T3 + 1.35 + i * 0.36;
      tl.to($('.f', ly), { opacity: 1, duration: 0.2 }, t);
      tl.to($('.k', ly), { x: 20, duration: 0.3, ease: 'back.out(2)' }, t);
      cue(t, 'tick', 0.8);
      const n = 6 + (i % 3);
      for (let k = 0; k < n; k++) {
        const [x, y] = free[fi++ % free.length];
        const m = H('i', 'mk', '', $('#mk3'));
        Object.assign(m.style, { left: `${x}px`, top: `${y}px`, background: col });
        tl.fromTo(m, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(3)' }, t + 0.06 + k * 0.035);
      }
      cue(t + 0.08, 'blip', 0.7);
    });
    tl.fromTo('#cnt3', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, T3 + 1.3);
    counter($('#cnt3n'), 137, T3 + 1.4, 2.6, { ease: 'power1.inOut' });
    // sortie : on sélectionne un marqueur, l'iris s'ouvre dessus
    const sel3 = free[3];
    tl.to('#mk3 .mk', { opacity: 0.25, duration: 0.3 }, 19.0);
    iris('#s4', '#s3', 19.45, sel3[0], sel3[1], 0.75);

    /* ======================================================================
       4 · SAISIE DE BIENS ASSISTÉE (19,45–24,5)
       ====================================================================== */
    const T4 = 19.45;
    const st4 = $('#street4');
    for (let y = -30; y < 480; y += 140) for (let x = -40; x < 600; x += 150) svgEl('rect', { x: x + 16, y: y + 16, width: 118, height: 108, rx: 12, fill: '#fff', stroke: '#E3E6F2', 'stroke-width': 2 }, st4);
    svgEl('path', { d: 'M-20 300 C 160 260 300 330 600 250', fill: 'none', stroke: '#D9DEFB', 'stroke-width': 30 }, st4);
    drift('#c4', T4, 24.5, 1, 1.035);
    titles('#s4', T4 + 0.3, 23.9);
    slideIn('#mm4', T4 + 0.3, { y: 60 });
    tl.fromTo('#pin4', { y: -320, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: 'bounce.out' }, T4 + 0.9);
    tl.fromTo('#psh4', { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.75, ease: 'bounce.out' }, T4 + 0.9);
    tl.fromTo('#pr4', { scale: 0.2, opacity: 0.9 }, { scale: 1.6, opacity: 0, duration: 0.9, ease: 'power2.out' }, T4 + 1.25);
    cue(T4 + 1.2, 'drop');
    slideIn('#fiche4', T4 + 0.45, { x: 160, y: 0, dur: 0.9 });
    const rows4 = $$('#fiche4 .fr');
    rows4.forEach((row, i) => {
      const t = T4 + 1.45 + i * 0.3;
      tl.fromTo($('.ibox', row), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, t);
      tl.fromTo($$('.fld, .src, .dpe', row), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05 }, t + 0.05);
      cue(t, 'tick', 0.8);
      // particule de données : de l'épingle vers la ligne
      const dot = H('i', 'abs', '', $('#c4'));
      Object.assign(dot.style, { left: 0, top: 0, width: '16px', height: '16px', margin: '-8px', borderRadius: '50%', background: BLUE, boxShadow: '0 0 14px rgba(51,0,255,.8)', opacity: 0 });
      arc(dot, t - 0.42, 420, 690, 878, 110 + 70 + i * 112 + 56, 0.42);
    });
    tl.fromTo('#dpe4 .c', { scale: 1 }, { scale: 1.3, duration: 0.4, ease: 'back.out(3)', boxShadow: '0 6px 16px rgba(0,0,0,.25)' }, T4 + 1.45 + 3 * 0.3 + 0.35);
    tl.to('#dpe4 i:not(.c)', { opacity: 0.25, duration: 0.3 }, T4 + 1.45 + 3 * 0.3 + 0.35);
    pop('#ok4', T4 + 3.4, { from: 0.6 });
    cue(T4 + 3.4, 'notif');
    // sortie : la fiche glisse vers la scène Magic Scan
    tl.to('#mm4', { x: -700, opacity: 0, duration: 0.6, ease: 'expo.in' }, 23.85);
    tl.to('#fiche4', { x: 360, y: 70, scale: 620 / 960, duration: 0.75, ease: 'expo.inOut', transformOrigin: '0% 0%' }, 23.85);
    show('#s5', 24.3);
    tl.fromTo('#s5', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none', immediateRender: false }, 24.3);
    hide('#s4', 24.62);
    cue(23.9, 'swoosh');

    /* ======================================================================
       5 · MAGIC SCAN (24,3–29,6)
       ====================================================================== */
    const T5 = 24.3;
    drift('#c5', T5, 29.6, 1, 1.035);
    titles('#s5', T5 + 0.3, 29.0);
    const DOCS = [['Acte de vente', 'i-file'], ['Titre de propriété', 'i-key'], ['Plan', 'i-map'], ['Taxe foncière', 'i-euro'], ['Diagnostics', 'i-zap'], ['Appels de charges', 'i-euro'], ['Règlement de copro', 'i-building'], ['PV d’AG', 'i-news']];
    const docs = DOCS.map(([name, ic], i) => {
      const d = H('div', 'doc', `<div class="dt"></div>${'<div class="dl"></div>'.repeat(9)}<div class="lbl">${ico(ic)}${name}</div>`, $('#pile5'));
      $$('.dl', d).forEach(l => (l.style.width = `${rr(45, 85)}%`));
      Object.assign(d.style, { left: 0, top: 0 });
      return d;
    });
    docs.forEach((d, i) => {
      const x = 300 + rr(-210, 230), y = 200 + rr(-120, 140), r = rr(-28, 28);
      tl.fromTo(d, { x: x + rr(-300, 300), y: y - 900, rotation: r * 3, opacity: 1 }, { x, y, rotation: r, duration: 0.75, ease: 'power3.out' }, T5 + 0.45 + i * 0.07);
      tl.set($('.lbl', d), { opacity: 0 }, 0);
      // rangement en grille après le scan
      const gx = (i % 4) * 215, gy = Math.floor(i / 4) * 320;
      tl.to(d, { x: gx, y: gy, rotation: 0, scale: 0.92, duration: 0.7, ease: 'expo.inOut' }, 26.75 + i * 0.04);
      tl.to($('.lbl', d), { opacity: 1, duration: 0.3 }, 27.05 + i * 0.04);
      // envoi dans la fiche
      tl.to(d, { x: 1330 - 115, y: 280 - 150 + i * 4, scale: 0.12, rotation: rr(-10, 10), opacity: 0, duration: 0.55, ease: 'power3.in' }, 27.7 + i * 0.12);
    });
    cue(T5 + 0.45, 'paper'); cue(T5 + 0.75, 'paper', 0.7);
    tl.fromTo('#beam5', { y: 180, opacity: 0 }, { y: 1000, opacity: 1, duration: 0.9, ease: 'power1.inOut' }, 25.75);
    tl.to('#beam5', { opacity: 0, duration: 0.15 }, 26.55);
    cue(25.75, 'scan');
    cue(26.75, 'swoosh', 0.8);
    show('#fiche5', T5);
    tl.fromTo('#fiche5', { opacity: 0 }, { opacity: 1, duration: 0.25 }, T5 + 0.25);
    const ROWS5 = [['Propriétaire', 'Famille Lefèvre'], ['Cadastre', 'AB 124'], ['Surface Carrez', '128,4 m²'], ['Taxe foncière', '2 140 €'], ['DPE', 'C · 142'], ['Charges / an', '1 860 €'], ['Lots de copro', '48'], ['Dernière AG', '12/03/2026']];
    ROWS5.forEach(([k, v], i) => {
      const row = H('div', 'fr', `<span>${k}</span><b class="v">${v}</b><span class="chk">${ico('i-check')}</span>`, $('#rows5'));
      const t = 28.15 + i * 0.12;
      tl.fromTo($('.v', row), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.35, ease: 'expo.out' }, t);
      tl.fromTo($('.chk', row), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t);
      tl.fromTo(row, { backgroundColor: 'rgba(51,0,255,0)' }, { backgroundColor: 'rgba(51,0,255,.08)', duration: 0.12, yoyo: true, repeat: 1 }, t);
      cue(t, 'tick', 0.6);
    });
    tl.fromTo('#done5', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 28.2);
    counter($('#n5'), 42, 28.2, 1.0, { ease: 'power1.out' });
    tl.fromTo('#ms5', { scale: 1 }, { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 }, 25.75);
    pillWipe(29.65, '#s5', '#s6', BLUE, -1);

    /* ======================================================================
       6 · SAISIE PAR IA (29,65–34,75)
       ====================================================================== */
    const T6 = 29.65;
    $('#s6 .h').classList.add('md');
    drift('#c6', T6, 34.75, 1, 1.04);
    titles('#s6', T6 + 0.3, 34.2);
    const OC = [1390, 560];
    const wv = $('#wave6'), bars6 = [];
    for (let i = 0; i < 44; i++) { const b = H('i', '', '', wv); b.style.transform = `rotate(${(i / 44) * 360}deg) translateY(96px)`; bars6.push(b); }
    drivers.push(t => {
      const talking = clamp((t - 30.0) / 0.3) * (1 - clamp((t - 31.9) / 0.3));
      bars6.forEach((b, i) => {
        const h = 10 + talking * (22 + 46 * Math.abs(Math.sin(t * 9.3 + i * 0.7) * Math.cos(t * 5.1 + i * 1.3)));
        b.style.height = `${h.toFixed(1)}px`;
        b.style.opacity = (0.3 + 0.7 * talking).toFixed(2);
      });
      const o = $('#orb6');
      o.style.scale = (1 + 0.06 * Math.sin(t * 4) + 0.12 * talking * Math.abs(Math.sin(t * 7))).toFixed(3);
    });
    pop(['#orb6', '#core6'], T6 + 0.2, { from: 0, stagger: 0.06 });
    tl.fromTo('#wave6', { opacity: 0 }, { opacity: 1, duration: 0.3 }, T6 + 0.3);
    const label6 = H('span', 'tag w', `${ico('i-mic')}Dictée en cours…`, $('#c6'));
    Object.assign(label6.style, { position: 'absolute', left: `${OC[0] - 110}px`, top: `${OC[1] + 200}px`, height: '44px', fontSize: '18px' });
    tl.fromTo(label6, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 30.0);
    tl.to(label6, { opacity: 0, duration: 0.3 }, 31.8);
    cue(30.0, 'voice');
    const FLY = ['villa-piscine', 'salon-design', 'salon-lumineux', 'fauteuil', 'salon-plantes', 'annonce-maison', 'doc', 'doc', 'doc'];
    FLY.forEach((f, i) => {
      const el = f === 'doc' ? H('div', 'fly docf doc', `<div class="dt"></div>${'<div class="dl"></div>'.repeat(7)}`, $('#fly6')) : H('div', 'fly', `<img src="assets/${f}.jpg" alt="">`, $('#fly6'));
      const a = (-110 + i * 27) * Math.PI / 180, rad = 360 + (i % 2) * 70;
      const w = f === 'doc' ? 130 : 190, h = f === 'doc' ? 170 : 140;
      const x = OC[0] + Math.cos(a) * rad - w / 2, y = OC[1] + Math.sin(a) * rad - h / 2;
      Object.assign(el.style, { left: 0, top: 0 });
      tl.fromTo(el, { x, y: y + 60, scale: 0.4, opacity: 0, rotation: rr(-12, 12) }, { y, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, 30.25 + i * 0.09);
      tl.to(el, { x: OC[0] - w / 2, y: OC[1] - h / 2, scale: 0.05, rotation: rr(-90, 90), duration: 0.6, ease: 'power3.in' }, 31.3 + i * 0.07);
      tl.set(el, { opacity: 0 }, 31.9 + i * 0.07);
    });
    cue(30.25, 'pop', 0.7); cue(30.6, 'pop', 0.6);
    cue(31.1, 'riser');
    tl.to('#orb6', { scale: 3.2, opacity: 0, duration: 0.6, ease: 'expo.out' }, 32.15);
    tl.to(['#core6', '#wave6'], { scale: 0, opacity: 0, duration: 0.35, ease: 'back.in(2)' }, 31.95);
    cue(32.15, 'hit'); bump(32.15, 0.025);
    tl.fromTo('#gen6', { scale: 0.3, opacity: 0, rotation: -4 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.9, ease: 'expo.out', transformOrigin: '50% 51%' }, 32.15);
    tl.fromTo('#gen6 .gt, #gen6 .gp, #gen6 .gc', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'expo.out' }, 32.4);
    const pub = $('#pub6'); pub.innerHTML = '<b>Texte pub · </b><span id="pub6t"></span>';
    typewriter($('#pub6t'), 'Lumineuse maison d’architecte de 128 m² sur un jardin de 612 m², au calme absolu, à deux pas des écoles…', 32.7, 52, { cue: false });
    cue(32.7, 'typeburst');
    pop('#gen6 .tags .tag', 33.7, { stagger: 0.1, from: 0.6 });
    cue(33.7, 'notif');
    // sortie : flash blanc sur le prix → estimation
    tl.to('#c6', { scale: 2.6, duration: 0.6, ease: 'expo.in', transformOrigin: '1130px 560px' }, 34.2);
    flash(34.75, 0.2, 0.45);
    show('#s7', 34.75); hide('#s6', 34.75);
    cue(34.55, 'whoosh');

    /* ======================================================================
       7 · ESTIMATIONS (34,75–39)
       ====================================================================== */
    const T7 = 34.75;
    tl.fromTo('#c7', { scale: 1.12 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, T7);
    drift('#rep7', T7, 39, 1, 1.03);
    titles('#s7', T7 + 0.15, 38.4);
    tl.fromTo('#val7', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, T7 + 0.3);
    counter($('#val7'), 685000, T7 + 0.35, 1.6, { suf: ' €' });
    cue(T7 + 0.35, 'counter');
    tl.fromTo('#rg7', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, T7 + 0.6);
    tl.fromTo('#mk7', { left: '8%' }, { left: '52%', duration: 1.4, ease: 'expo.out' }, T7 + 0.7);
    $$('#meth7 .mt').forEach((m, i) => {
      const t = T7 + 0.9 + i * 0.3;
      tl.fromTo(m, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, t - 0.2);
      tl.to($('.f', m), { opacity: 1, duration: 0.2 }, t + 0.1);
      tl.to($('.k', m), { x: 20, duration: 0.3, ease: 'back.out(2)' }, t + 0.1);
      tl.to(m, { boxShadow: '0 0 0 2px #3300FF', duration: 0.2 }, t + 0.1);
      cue(t + 0.1, 'tick', 0.8);
    });
    // rapports en éventail (3D)
    tl.fromTo(['#rp7c', '#rp7b', '#rp7a'], { y: 300, rotationX: 40, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, T7 + 0.5);
    tl.to('#rp7a', { rotationY: -14, rotationZ: 2, x: 30, duration: 1.0, ease: 'expo.out' }, T7 + 1.5);
    tl.to('#rp7b', { rotationY: -14, rotationZ: -6, x: -70, y: 10, duration: 1.0, ease: 'expo.out' }, T7 + 1.55);
    tl.to('#rp7c', { rotationY: -14, rotationZ: -12, x: -140, y: 30, duration: 1.0, ease: 'expo.out' }, T7 + 1.6);
    cue(T7 + 1.5, 'paper');
    tl.fromTo('#rp7a .bars i', { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out', transformOrigin: '50% 100%' }, T7 + 1.0);
    // sortie : le rapport vient au centre et devient le téléphone
    tl.to(['#val7', '#rg7', '#meth7', '#rp7b', '#rp7c'], { opacity: 0, y: 30, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, 38.35);
    tl.to('#rp7a', { x: -(1140 + 140 + 260) + 960, y: -60, rotationY: 0, rotationZ: 0, scale: 0.9, duration: 0.65, ease: 'expo.inOut' }, 38.35);
    iris('#s8', '#s7', 38.85, 960, 520, 0.75);

    /* ======================================================================
       8 · MANDAT SUR MOBILE (38,85–44,4)
       ====================================================================== */
    const T8 = 38.85;
    drift('#c8', T8, 44.4, 1, 1.035);
    tl.fromTo('#ph8', { scale: 1.12, y: 30 }, { scale: 1, y: 0, duration: 1.0, ease: 'expo.out' }, T8);
    titles('#s8', T8 + 0.3, 43.8);
    pop('#chr8', T8 + 0.45, { from: 0.6 });
    const ringLen = 2 * Math.PI * 116;
    $('#chrRing').setAttribute('stroke-dasharray', `${ringLen} ${ringLen}`);
    drivers.push(t => {
      const p = clamp((t - 39.5) / 3.1);
      const s = Math.floor(p * 28);
      $('#chrN').textContent = `00:${String(s).padStart(2, '0')}`;
      $('#chrRing').setAttribute('stroke-dashoffset', (ringLen * (1 - p * 28 / 30)).toFixed(1));
    });
    ['#mf8a', '#mf8b', '#mf8c'].forEach((m, i) => {
      tl.fromTo(m, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' }, 39.55 + i * 0.28);
      tl.fromTo(m, { boxShadow: '0 0 0 0px rgba(51,0,255,0)' }, { boxShadow: '0 0 0 3px rgba(51,0,255,.9)', duration: 0.18, yoyo: true, repeat: 1 }, 39.6 + i * 0.28);
      cue(39.55 + i * 0.28, 'tick', 0.8);
    });
    tl.fromTo('#sig8', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 40.35);
    tl.fromTo('#sigp', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.95, ease: 'power1.inOut' }, 40.6);
    cue(40.6, 'scribble');
    slideIn('#bub8a', 41.55, { x: 80, y: 0 }); cue(41.55, 'notif');
    slideIn('#bub8b', 41.85, { x: 80, y: 0 }); cue(41.85, 'notif', 0.8);
    tl.fromTo('#stamp8', { scale: 2.6, opacity: 0, rotation: -18 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.6)' }, 42.45);
    cue(42.45, 'stamp'); shake(42.5, 9, 0.35); bump(42.5, 0.02);
    slideIn('#bub8c', 42.75, { x: 80, y: 0 });
    tl.to('#chr8', { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1 }, 42.6);
    // sortie : on entre dans l'écran du téléphone → photo du bien
    tl.to('#stamp8', { opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, 43.75);
    tl.to(['#bub8a', '#bub8b', '#bub8c', '#chr8'], { opacity: 0, x: 60, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, 43.8);
    tl.to('#c8', { scale: 5, duration: 0.7, ease: 'expo.in', transformOrigin: '960px 550px' }, 43.85);
    cue(43.95, 'whoosh');
    show('#s9', 44.4);
    tl.fromTo('#s9', { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none', immediateRender: false }, 44.4);
    hide('#s8', 44.6);

    /* ======================================================================
       9 · VALORISATION (44,4–51,6) : 4 temps
       ====================================================================== */
    const T9 = 44.4, B9 = [44.5, 46.2, 47.9, 49.6, 51.2];
    tl.fromTo('#frame9', { scale: 2.1, x: -100, y: 30, borderRadius: 0 }, { scale: 1, x: 0, y: 0, borderRadius: 30, duration: 1.1, ease: 'expo.out', transformOrigin: '50% 50%' }, T9);
    titles('#s9', T9 + 0.45, 50.95);
    tl.fromTo('#step9', { opacity: 0 }, { opacity: 1, duration: 0.4 }, T9 + 0.6);
    $$('#step9 b').forEach((b, i) => tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: B9[i + 1] - B9[i], ease: 'none' }, B9[i]));
    ['#ft9a', '#ft9b', '#ft9c', '#ft9d'].forEach((f, i) => {
      const t0 = i === 0 ? T9 + 0.75 : B9[i];
      tl.fromTo(`${f} b, ${f} span`, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'expo.out' }, t0);
      if (i < 3) tl.to(`${f} b, ${f} span`, { yPercent: -50, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, B9[i + 1] - 0.25);
      else tl.to(`${f} b, ${f} span`, { opacity: 0, duration: 0.3 }, 50.95);
    });
    // curseur avant/après : les calques « avant » sont visibles à gauche du curseur
    const FW = 1000, sl9 = $('#sl9');
    sl9.style.left = `${FW}px`;
    const sweep = (layer, t0, t1, x0 = FW, x1 = 150) => {
      drivers.push(t => {
        if (t < t0 || t > t1 + 1.2) return;
        const x = lerp(x0, x1, ez('power2.inOut', prog(t, t0, t1)));
        $(layer).style.clipPath = `inset(0 ${(FW - x).toFixed(1)}px 0 0)`;
        sl9.style.left = `${x.toFixed(1)}px`;
      });
    };
    // a : retouche photo
    ['#lb9', '#lb9d', '#lc9', '#ld9', '#play9', '#vtl9', '#hot9a', '#hot9b', '#deg9', '#sun9'].forEach(s => tl.set(s, { opacity: 0 }, 0));
    sweep('#la9d', 44.95, 45.85);
    cue(44.95, 'swipe');
    tl.to('#sun9', { opacity: 1, scale: 1.1, duration: 0.8, ease: 'power2.out' }, 45.6);
    cue(45.7, 'sparkle');
    tl.fromTo(['#baL', '#baR'], { opacity: 0 }, { opacity: 1, duration: 0.3 }, 44.9);
    // b : home staging
    tl.set(['#lb9', '#lb9d'], { opacity: 1 }, 46.2);
    tl.fromTo('#lb9', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 46.2);
    tl.fromTo('#lb9d', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 46.2);
    tl.set('#sun9', { opacity: 0 }, 46.5);
    sweep('#lb9d', 46.85, 47.6);
    cue(46.2, 'swoosh', 0.7); cue(46.85, 'swipe');
    slideIn('#sty9 .stl', 46.4, { y: 20, stagger: 0.06 });
    tl.fromTo('#stl9a', { scale: 1 }, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1 }, 46.7);
    cue(46.7, 'tick');
    // c : visite virtuelle
    tl.set('#lc9', { opacity: 1 }, 47.9);
    tl.fromTo('#lc9', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 47.9);
    tl.to(['#sl9', '#baL', '#baR'], { opacity: 0, duration: 0.2 }, 47.95);
    tl.to('#sty9 .stl', { opacity: 0, y: 20, duration: 0.3, stagger: 0.03 }, 47.9);
    tl.fromTo('#pano9', { x: 0 }, { x: -640, duration: 2.0, ease: 'sine.inOut' }, 47.9);
    tl.to(['#hot9a', '#hot9b', '#deg9'], { opacity: 1, duration: 0.3, stagger: 0.1 }, 48.3);
    tl.to(['#hot9a', '#hot9b'], { x: -330, duration: 1.4, ease: 'sine.inOut' }, 48.2);
    drivers.push(t => {
      $('#deg9a').setAttribute('transform', `rotate(${((t - 47.9) * 70).toFixed(1)} 55 55)`);
      const p = ((t * 1.3) % 1);
      ['#hot9a', '#hot9b'].forEach(s => ($(s).style.boxShadow = `0 0 0 ${(p * 26).toFixed(1)}px rgba(255,255,255,${(0.5 * (1 - p)).toFixed(2)})`));
    });
    cue(47.9, 'swoosh', 0.7); cue(48.3, 'pop', 0.6);
    // d : vidéo immersive
    tl.set(['#ld9', '#vtl9', '#play9'], { opacity: 1 }, 49.6);
    tl.to(['#hot9a', '#hot9b', '#deg9'], { opacity: 0, duration: 0.2 }, 49.6);
    tl.fromTo('#ld9', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 49.6);
    tl.fromTo('#vid9', { scale: 1.15 }, { scale: 1, duration: 1.8, ease: 'none' }, 49.6);
    tl.fromTo('#vtl9', { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' }, 49.75);
    tl.fromTo('#play9', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 49.95);
    const wf = $('#wf9');
    for (let i = 0; i < 150; i++) { const b = H('i', '', '', wf); b.style.height = `${(6 + 34 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.13 + 1))).toFixed(1)}px`; }
    tl.fromTo('#head9', { x: 0 }, { x: 940, duration: 1.4, ease: 'none' }, 50.0);
    tl.set('#sty9', { visibility: 'hidden' }, 49.6);
    tl.set('#opt9', { visibility: 'visible' }, 49.6);
    slideIn('#opt9 .stl', 49.7, { y: 20, stagger: 0.06 });
    cue(49.6, 'swoosh', 0.7); cue(49.95, 'pop');
    // sortie : le cadre se transforme en bouton « Démarrer la commercialisation »
    tl.to(['#opt9', '#step9'], { opacity: 0, duration: 0.3 }, 50.95);
    tl.to(['#la9', '#la9d', '#lb9', '#lb9d', '#lc9', '#ld9', '#vtl9', '#play9'], { opacity: 0, duration: 0.25 }, 51.05);
    tl.set('#frame9', { backgroundColor: '#fff' }, 51.0);
    tl.to('#frame9', { left: 600, top: 540, width: 720, height: 120, borderRadius: 60, duration: 0.6, ease: 'expo.inOut' }, 51.0);
    cue(51.0, 'swoosh');
    show('#s10', 51.6); hide('#s9', 51.6);

    /* ======================================================================
       10 · DÉMARRER LA COMMERCIALISATION (51,6–59,6)
       ====================================================================== */
    const T10 = 51.6;
    drift('#c10', T10, 59.6, 1, 1.03);
    tl.fromTo('#go10 > *', { opacity: 0 }, { opacity: 1, duration: 0.3 }, T10);
    titles('#s10', T10 + 0.15, 55.85);
    curPath([{ t: 51.9, x: 1500, y: 1000 }, { t: 52.45, x: 1010, y: 625 }, { t: 52.9, x: 1010, y: 625 }, { t: 53.4, x: 1600, y: 1150 }]);
    click(52.55, 1010, 625);
    tl.to('#go10', { scale: 0.94, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 52.5);
    tl.to('#go10', { backgroundColor: BLUE, color: '#fff', duration: 0.25 }, 52.6);
    tl.fromTo(['#wv10a', '#wv10b'], { scale: 0.3, opacity: 0.9 }, { scale: 4, opacity: 0, duration: 1.1, stagger: 0.18, ease: 'power2.out' }, 52.6);
    tl.to('#glow10', { opacity: 0.45, duration: 0.8 }, 52.6);
    cue(52.6, 'launch'); bump(52.6, 0.03);
    tl.to('#go10', { scale: 0.5, duration: 0.6, ease: 'expo.inOut' }, 52.85);
    const ACTS = [['i-mail', 'Merci envoyé aux propriétaires'], ['i-lock', 'Accès extranet vendeur'], ['i-bell', 'Équipe notifiée : nouveau mandat'], ['i-sms', 'Acquéreurs relancés (email, SMS)'], ['i-calendar', 'Click & Visit activé'], ['i-share', 'Tous les portails immobiliers'], ['i-globe', 'Votre site web d’agence'], ['i-home', 'Voisins du bien informés'], ['i-video', 'Réseaux sociaux : post ou vidéo']];
    const CX = 960, CY = 600, net = $('#net10');
    ACTS.forEach(([ic, txt], i) => {
      const a = (-90 + i * 40) * Math.PI / 180;
      const x = CX + Math.cos(a) * 640, y = CY + Math.sin(a) * 300;
      const line = svgEl('path', { d: `M${CX} ${CY} L${x.toFixed(1)} ${y.toFixed(1)}`, stroke: 'rgba(160,140,255,.5)', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }, net);
      const nd = H('div', 'node', `<span class="ibox g">${ico(ic)}</span><span>${txt}</span><span class="chk">${ico('i-check')}</span>`, $('#nodes10'));
      Object.assign(nd.style, { left: `${x}px`, top: `${y}px` });
      const t = 52.95 + i * 0.27;
      tl.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.4, ease: 'power2.out' }, t);
      tl.fromTo(nd, { x: CX - x, y: CY - y, scale: 0.2, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out' }, t);
      tl.fromTo($('.chk', nd), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.45);
      cue(t, 'pop', 0.8); cue(t + 0.45, 'tick', 0.6);
      // impulsion lumineuse sur la ligne
      const pl = H('i', 'abs', '', $('#nodes10'));
      Object.assign(pl.style, { left: 0, top: 0, width: '12px', height: '12px', margin: '-6px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 14px 4px rgba(160,140,255,.9)' });
      drivers.push(tt => {
        const p = ((tt - t - 0.4) * 0.9) % 1;
        const vis = tt > t + 0.4 && tt < 55.85;
        pl.style.opacity = vis ? (Math.sin(Math.PI * p)).toFixed(2) : 0;
        pl.style.transform = `translate(${lerp(CX, x, p).toFixed(1)}px, ${lerp(CY, y, p).toFixed(1)}px)`;
      });
      tl.to(nd, { x: CX - x, y: CY - y, scale: 0.1, opacity: 0, duration: 0.5, ease: 'expo.in' }, 55.85 + (8 - i) * 0.02);
      tl.to(line, { opacity: 0, duration: 0.3 }, 55.85);
    });
    tl.to('#go10', { scale: 0, opacity: 0, duration: 0.4, ease: 'back.in(2)' }, 56.1);
    tl.to('#glow10', { opacity: 0.15, duration: 0.6 }, 56.0);
    cue(55.85, 'suck');
    // pause café
    tl.fromTo('#cup10', { scale: 0, rotation: -12, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' }, 56.45);
    drivers.push(t => ['#steam1', '#steam2', '#steam3'].forEach((s, i) => {
      const p = ((t * 0.8 + i * 0.33) % 1);
      $(s).style.transform = `translateY(${(-p * 30).toFixed(1)}px)`;
      $(s).style.opacity = (Math.sin(Math.PI * p) * 0.9).toFixed(2);
    }));
    tl.fromTo('#cof10', { yPercent: 115 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 56.65);
    cue(56.5, 'cafe');
    tl.to('#cup10', { y: -40, opacity: 0, duration: 0.45, ease: 'power3.in' }, 57.65);
    tl.to('#cof10', { yPercent: -115, duration: 0.4, ease: 'power3.in' }, 57.6);
    tl.fromTo('#nxt10', { yPercent: 115 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 57.85);
    ['#v10a', '#v10b', '#v10c'].forEach((v, i) => {
      tl.fromTo(v, { y: -60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 58.1 + i * 0.3);
      cue(58.1 + i * 0.3, 'notif');
    });
    push('#s11', '#s10', 59.25, 'x', 0.8);

    /* ======================================================================
       11 · RETOURS DE VISITE (59,25–64)
       ====================================================================== */
    const T11 = 59.25;
    drift('#c11', T11, 64, 1, 1.035);
    titles('#s11', T11 + 0.55, 63.4);
    slideIn('#rv11', T11 + 0.6, { y: 60 });
    const CRIT = [['Quartier', 4.5], ['Disposition des pièces', 4], ['État général', 3.5], ['Rapport qualité / prix', 3]];
    CRIT.forEach(([k, v], i) => {
      let stars = '';
      for (let s = 0; s < 5; s++) stars += `<svg class="ico ${s < Math.floor(v) ? '' : 'e'}"><use href="#i-star"/></svg>`;
      const row = H('div', 'crit', `<span>${k}</span><div class="stars">${stars}</div><div class="bar-l"><i></i></div><em>${String(v).replace('.', ',')}</em>`, $('#crit11'));
      const t = 60.35 + i * 0.28;
      tl.fromTo($$('.stars .ico', row), { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: 0.4, stagger: 0.04, ease: 'back.out(3)' }, t);
      tl.fromTo($('.bar-l i', row), { scaleX: 0 }, { scaleX: v / 5, duration: 0.8, ease: 'expo.out' }, t + 0.1);
      tl.fromTo($('em', row), { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.3);
      cue(t, 'tick', 0.7);
    });
    drivers.push(t => { $('#rl11 .ico').style.transform = `rotate(${(t * 140).toFixed(0)}deg)`; });
    tl.fromTo('#cm11a', { scale: 0.5, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: -2, duration: 0.6, ease: 'back.out(2)' }, 61.55);
    tl.fromTo('#cm11b', { scale: 0.5, opacity: 0, rotation: 6 }, { scale: 1, opacity: 1, rotation: 2, duration: 0.6, ease: 'back.out(2)' }, 61.85);
    cue(61.55, 'pop'); cue(61.85, 'pop', 0.8);
    slideIn('#snd11', 62.45, { y: 30 });
    cue(62.45, 'notif');
    blinds('#s12', '#s11', 64.05, BLUE);

    /* ======================================================================
       12 · CLICK & VISIT (64,05–69,1)
       ====================================================================== */
    const T12 = 64.05;
    drift('#c12', T12, 69.1, 1, 1.03);
    titles('#s12', T12 + 0.1, 68.5);
    slideIn('#ann12', T12 + 0.2, { y: 60 });
    curPath([{ t: 64.55, x: 900, y: 1150 }, { t: 65.05, x: 440, y: 922 }, { t: 65.35, x: 440, y: 922 }, { t: 65.9, x: 1000, y: 1150 }]);
    click(65.15, 440, 922);
    tl.to('#btn12', { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 65.1);
    tl.fromTo('#cal12', { scale: 0.85, opacity: 0, x: -40 }, { scale: 1, opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', transformOrigin: '0% 70%' }, 65.25);
    cue(65.25, 'swoosh', 0.7);
    const slots = $$('#days12 .sl');
    tl.fromTo(slots, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.025, ease: 'back.out(2)' }, 65.5);
    // vérification : créneaux occupés hachurés, libres en vert
    slots.forEach(s => {
      const cls = s.classList.contains('a') ? 'bz' : s.classList.contains('b') || s.classList.contains('c') ? 'fr' : null;
      if (!cls) return;
      const o = H('i', '', '', s); o.className = cls;
      Object.assign(o.style, { position: 'absolute', inset: 0, borderRadius: '12px', opacity: 0 });
      s.style.position = 'relative';
      tl.to(o, { opacity: 1, duration: 0.25 }, 66.0 + R() * 0.35);
    });
    cue(66.0, 'scanlite');
    const pk = $('#pick12');
    const pko = H('i', '', '', pk); pk.style.position = 'relative';
    Object.assign(pko.style, { position: 'absolute', inset: 0, borderRadius: '12px', background: BLUE, boxShadow: '0 10px 24px -8px rgba(51,0,255,.7)', opacity: 0 });
    pko.textContent = '18:00';
    Object.assign(pko.style, { display: 'grid', placeItems: 'center', color: '#fff' });
    tl.to(pko, { opacity: 1, duration: 0.25 }, 66.55);
    tl.fromTo(pk, { scale: 1 }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1 }, 66.55);
    cue(66.55, 'pop');
    slideIn('#ok12', 66.8, { y: 20 }); cue(66.8, 'tick');
    tl.fromTo('#ph12', { x: 420, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 66.7);
    slideIn('#sms12', 67.2, { y: -30 }); cue(67.2, 'notif');
    slideIn('#bon12', 67.65, { y: -30 }); cue(67.65, 'notif', 0.8);
    pillWipe(69.1, '#s12', '#s13', BLUE, 1);

    /* ======================================================================
       13 · SITE WEB INCLUS (69,1–74)
       ====================================================================== */
    const T13 = 69.1;
    drift('#c13', T13, 74, 1, 1.03);
    titles('#s13', T13 + 0.15, 73.4);
    tl.fromTo('#br13', { x: 260, rotationY: -22, opacity: 0, transformPerspective: 2400 }, { x: 0, rotationY: -6, opacity: 1, duration: 1.0, ease: 'expo.out', transformOrigin: '100% 50%' }, T13 + 0.15);
    $('#site13').style.setProperty('--accent', BLUE);
    typewriter($('#url13'), 'www.votre-agence.fr', 69.85, 22);
    // glisser un module vers le haut
    curPath([{ t: 70.4, x: 1300, y: 1140 }, { t: 70.85, x: 820, y: 745 }, { t: 71.0, x: 820, y: 745 }, { t: 71.55, x: 820, y: 560 }, { t: 71.8, x: 820, y: 560 }, { t: 72.3, x: 1500, y: 1150 }]);
    click(70.95, 820, 745);
    tl.to('#m13c', { scale: 1.03, boxShadow: '0 24px 50px -20px rgba(20,27,51,.45)', backgroundColor: '#fff', duration: 0.2 }, 70.95);
    tl.to('#m13c', { top: 0, duration: 0.6, ease: 'power3.inOut' }, 71.0);
    tl.to('#m13a', { top: 184, duration: 0.5, ease: 'power3.inOut' }, 71.1);
    tl.to('#m13b', { top: 368, duration: 0.5, ease: 'power3.inOut' }, 71.15);
    tl.to('#m13c', { scale: 1, boxShadow: '0 0px 0px 0px rgba(20,27,51,0)', backgroundColor: '#F4F6FC', duration: 0.25 }, 71.6);
    cue(70.95, 'pop', 0.7); cue(71.6, 'drop', 0.6);
    // modèles et couleurs
    slideIn('#sws13', 71.7, { y: 20 });
    const sw = $$('#sws13 i');
    [['#0F766E', 1], ['#141B33', 2], [BLUE, 0]].forEach(([c, k], j) => {
      const t = 72.1 + j * 0.42;
      tl.to('#site13', { '--accent': c, duration: 0.3 }, t);
      sw.forEach((s, m) => tl.to(s, { borderColor: m === k ? '#fff' : 'rgba(255,255,255,.35)', duration: 0.2 }, t));
      cue(t, 'tick');
    });
    pop('#seo13 .tag', 72.3, { stagger: 0.09, from: 0.5 });
    cue(72.3, 'pop', 0.6);
    push('#s14', '#s13', 73.95, 'y', 0.8);

    /* ======================================================================
       14 · OFFRE D'ACHAT (73,95–78)
       ====================================================================== */
    const T14 = 73.95;
    drift('#c14', T14, 78, 1, 1.03);
    titles('#s14', T14 + 0.5, 77.5);
    slideIn('#mand14', T14 + 0.55, { y: 50 });
    tl.set('#menu14', { opacity: 0 }, 0);
    curPath([{ t: 74.6, x: 700, y: 1150 }, { t: 75.0, x: 250, y: 700 }, { t: 75.15, x: 250, y: 700 }, { t: 75.5, x: 300, y: 850 }, { t: 75.65, x: 300, y: 850 }, { t: 76.1, x: 900, y: 1150 }]);
    click(75.05, 250, 700);
    tl.fromTo('#menu14', { scaleY: 0.4, opacity: 0, y: -20 }, { scaleY: 1, opacity: 1, y: 0, duration: 0.35, ease: 'expo.out', transformOrigin: '50% 0%' }, 75.12);
    tl.fromTo('#hi14', { y: 0, opacity: 0 }, { y: 0, opacity: 1, duration: 0.15 }, 75.2);
    tl.to('#hi14', { y: 54, duration: 0.3, ease: 'power3.inOut' }, 75.3);
    click(75.55, 300, 850);
    tl.to('#menu14', { opacity: 0, scaleY: 0.8, duration: 0.2 }, 75.7);
    tl.fromTo('#form14', { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 75.6);
    cue(75.6, 'swoosh', 0.7);
    drivers.push(t => {
      const s = Math.floor(clamp((t - 75.7) / 1.9) * 47);
      $('#tm14n').textContent = `0:${String(s).padStart(2, '0')}`;
    });
    [['#f14a', '#f14an', '405 000 €', 75.9], ['#f14b', '#f14bn', '16 200 € TTC', 76.45], ['#f14c', '#f14cn', 'Jusqu’au 24 octobre 2026', 76.95]].forEach(([b, s, txt, t]) => {
      tl.to(b, { borderColor: BLUE, duration: 0.15 }, t);
      typewriter($(s), txt, t + 0.05, 30, { cue: false });
      cue(t + 0.05, 'typeburst', 0.7);
      tl.to(b, { borderColor: '#E3E6F2', duration: 0.2 }, t + 0.55);
    });
    tl.to('#send14', { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 77.4);
    cue(77.4, 'click');
    tl.fromTo('#plane14', { x: 1300, y: 860, scale: 0.6, rotation: 0, opacity: 0 }, { opacity: 1, duration: 0.1 }, 77.45);
    tl.to('#plane14', { x: 1960, y: 40, scale: 1.4, rotation: -20, duration: 0.65, ease: 'power2.in' }, 77.5);
    cue(77.5, 'whoosh', 0.8);
    show('#s15', 77.9);
    tl.fromTo('#s15', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none', immediateRender: false }, 77.9);
    tl.fromTo('#stk15', { y: 80, scale: 1.06 }, { y: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, 77.9);
    hide('#s14', 78.25);

    /* ======================================================================
       15 · COMPROMIS (77,9–82,4)
       ====================================================================== */
    const T15 = 77.9;
    drift('#c15', T15, 82.4, 1, 1.03);
    titles('#s15', T15 + 0.25, 81.85);
    tl.fromTo('#pg15 .sec i:not(#ax15)', { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.05, ease: 'expo.out' }, T15 + 0.35);
    tl.fromTo('#pg15 .sec b', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.12, ease: 'expo.out' }, T15 + 0.3);
    cue(T15 + 0.35, 'typeburst', 0.6);
    slideIn('#tm15', T15 + 0.4, { x: 60, y: 0 });
    drivers.push(t => {
      const s = Math.floor(clamp((t - 78.4) / 3.2) * 112);
      $('#tm15n').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    });
    const labs15 = $$('#att15 .label');
    slideIn(labs15, 79.0, { x: -60, y: 0, stagger: 0.07 });
    cue(79.0, 'pop', 0.6);
    tl.fromTo('#anx15', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 79.4);
    curPath([{ t: 79.6, x: 900, y: 1150 }, { t: 80.0, x: 330, y: 915 }, { t: 80.25, x: 330, y: 915 }, { t: 80.7, x: 700, y: 1150 }]);
    click(80.1, 330, 915);
    labs15.forEach((l, i) => {
      tl.to(l, { x: 960 - 120 + rr(-30, 30), y: 820 - (420 + i * 62), scale: 0.3, opacity: 0, rotation: rr(-12, 12), duration: 0.5, ease: 'power3.in' }, 80.25 + i * 0.07);
      cue(80.55 + i * 0.07, 'tick', 0.5);
    });
    tl.to('#ax15', { width: '88%', duration: 0.6, ease: 'expo.out' }, 80.6);
    tl.fromTo('#pg15b', { x: 0, y: 0 }, { x: 14, y: 14, duration: 0.5, ease: 'back.out(2)' }, 80.6);
    tl.fromTo('#pg15c', { x: 0, y: 0 }, { x: 28, y: 28, duration: 0.5, ease: 'back.out(2)' }, 80.75);
    tl.to('#anx15', { opacity: 0, y: 20, duration: 0.3 }, 80.6);
    pop('#ok15', 81.15, { from: 0.6 }); cue(81.15, 'notif');
    pop('#mob15 .tag', 81.4, { stagger: 0.12, from: 0.6 }); cue(81.4, 'pop', 0.6);
    // sortie : le compromis se plie dans l'enveloppe
    tl.to('#stk15', { x: -(820 + 320) + 730, y: -(110 + 430) + 560, scale: 0.18, rotation: -8, opacity: 0, duration: 0.6, ease: 'expo.in', transformOrigin: '50% 50%' }, 81.95);
    tl.to(['#tm15', '#mob15'], { opacity: 0, x: 60, duration: 0.3, ease: 'power2.in' }, 81.9);
    cue(82.0, 'whoosh', 0.8);
    iris('#s16', '#s15', 82.4, 730, 560, 0.7);

    /* ======================================================================
       16 · SRU & NOTAIRES (82,4–87,5)
       ====================================================================== */
    const T16 = 82.4;
    drift('#c16', T16, 87.5, 1, 1.03);
    tl.fromTo('#env16', { scale: 0.5, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.8)' }, T16);
    titles('#s16', T16 + 0.3, 86.95);
    tl.fromTo('#env16 .fl', { scaleY: 1 }, { scaleY: -1, duration: 0.35, ease: 'power2.inOut' }, 83.1);
    cue(83.1, 'paper', 0.7);
    tl.fromTo(['#w16a', '#w16b'], { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 83.0);
    tl.to('#env16', { scale: 0.92, duration: 0.3, ease: 'power2.inOut', yoyo: true, repeat: 1 }, 83.3);
    tl.to('#env16', { scale: 0.5, opacity: 0, duration: 0.4, ease: 'power3.in' }, 84.45);
    const n16 = $('#net16');
    const link = (x0, y0, x1, y1, t, dur = 0.45) => {
      const mx = (x0 + x1) / 2;
      const p = svgEl('path', { d: `M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`, stroke: 'rgba(160,140,255,.6)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, n16);
      tl.fromTo(p, { drawSVG: '100% 100%' }, { drawSVG: '0% 100%', duration: dur, ease: 'power2.inOut' }, t);
      const dot = H('i', 'abs', '', $('#c16'));
      Object.assign(dot.style, { left: 0, top: 0, width: '16px', height: '16px', margin: '-8px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 16px 5px rgba(160,140,255,.9)', opacity: 0 });
      const len = p.getTotalLength();
      drivers.push(tt => {
        const q = prog(tt, t, t + dur + 0.1);
        dot.style.opacity = q > 0 && q < 1 ? 1 : 0;
        const pt = p.getPointAtLength(len * (1 - ez('power2.inOut', q)));
        dot.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`;
      });
      tl.to(p, { opacity: 0, duration: 0.3 }, t < 85 ? 84.45 : 87.0);
      return p;
    };
    link(445, 468, 600, 560, 83.55); link(445, 598, 600, 560, 83.6);
    tl.fromTo(['#w16a .chk', '#w16b .chk'], { scale: 0 }, { scale: 1, duration: 0.35, stagger: 0.15, ease: 'back.out(3)' }, 84.05);
    cue(83.55, 'swoosh', 0.6); cue(84.05, 'notif'); cue(84.2, 'notif', 0.7);
    slideIn('#cal16 > *', 84.3, { y: 20, stagger: 0.06 });
    tl.fromTo('#cal16 .d1', { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 }, 84.7);
    cue(84.7, 'tick');
    // dossier complet aux notaires
    tl.fromTo('#fold16', { y: 80, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, 84.7);
    $$('#fold16 .fi').forEach((f, i) => {
      tl.fromTo(f, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'expo.out' }, 84.95 + i * 0.2);
      tl.fromTo($('.chk', f), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 85.15 + i * 0.2);
      cue(85.15 + i * 0.2, 'tick', 0.7);
    });
    tl.fromTo(['#w16c', '#w16d'], { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 85.6);
    link(1380, 560, 1500, 420, 86.0, 0.4); link(1380, 560, 1500, 680, 86.05, 0.4);
    tl.fromTo(['#w16c .chk', '#w16d .chk'], { scale: 0 }, { scale: 1, duration: 0.35, stagger: 0.15, ease: 'back.out(3)' }, 86.45);
    cue(86.0, 'swoosh', 0.6); cue(86.45, 'notif'); cue(86.6, 'notif', 0.7);
    pillWipe(87.5, '#s16', '#s17', INK, -1);

    /* ======================================================================
       17 · AUTOMATISATIONS (87,5–93,55)
       ====================================================================== */
    const T17 = 87.5;
    drift('#c17', T17, 93.55, 1, 1.04);
    $('#big17').style.top = '150px';
    $('#big17n').textContent = 'Des centaines';
    $('#big17n').style.fontSize = '88px';
    tl.fromTo('#hub17', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.6)' }, T17 + 0.15);
    cue(T17 + 0.15, 'hit', 0.7);
    drivers.push(t => {
      $('#ob17a').style.transform = `rotate(${(t * 12).toFixed(1)}deg)`;
      $('#ob17b').style.transform = `rotate(${(-t * 8).toFixed(1)}deg)`;
    });
    ['#ob17a', '#ob17b'].forEach(s => Object.assign($(s).style, { left: '960px', top: '600px' }));
    tl.fromTo(['#ob17a', '#ob17b'], { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, stagger: 0.12, ease: 'expo.out' }, T17 + 0.3);
    titles('#s17', T17 + 0.4, 92.9);
    tl.fromTo('#big17 b, #big17 span', { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'expo.out' }, 89.0);
    tl.to('#big17', { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in' }, 92.9);
    const SCN = [['i-cake', 'Fêtes et anniversaires', '« Joyeux anniversaire, Claire ! »'], ['i-news', 'Newsletters automatiques', 'Tout votre annuaire, chaque mois'],
      ['i-home', 'Voisins informés', 'Mis en vente, vendu vite : ils le savent'], ['i-calendar', 'Projets à long terme', 'Relancés aux bonnes fréquences'],
      ['i-euro', 'Relance des estimations', 'Email, SMS et tâches selon l’urgence'], ['i-users', 'Suivi des visites', 'Sans retour ? Realty relance'],
      ['i-down', 'Suivi des mandats', 'Avenant, baisse de prix : rappels'], ['i-handshake', 'Points vendeurs', 'Comptes rendus organisés'],
      ['i-key', 'Dossiers locataires', 'Pièces demandées puis analysées']];
    const POS = [[430, 420], [1490, 420], [430, 560], [1490, 560], [430, 700], [1490, 700], [430, 840], [1490, 840], [960, 975]];
    const n17 = $('#net17'), HB = [960, 600];
    SCN.forEach(([ic, t1, t2], i) => {
      const [x, y] = POS[i];
      const ex = i === 8 ? x : (x < 960 ? x + 220 : x - 220), ey = i === 8 ? y - 48 : y;
      const mx = (HB[0] + ex) / 2;
      const d = i === 8 ? `M${HB[0]} ${HB[1]} L${ex} ${ey}` : `M${HB[0]} ${HB[1]} C${mx} ${HB[1]} ${mx} ${ey} ${ex} ${ey}`;
      const p = svgEl('path', { d, stroke: 'rgba(160,140,255,.45)', 'stroke-width': 2.5, fill: 'none' }, n17);
      const card = H('div', 'sc', `<span class="ibox g">${ico(ic)}</span><div>${t1}<small>${t2}</small></div>`, $('#sc17'));
      Object.assign(card.style, { left: `${x}px`, top: `${y}px` });
      const t = 88.4 + i * 0.3;
      tl.fromTo(p, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.45, ease: 'power2.out' }, t);
      tl.fromTo(card, { x: HB[0] - x, y: HB[1] - y, scale: 0.15, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.7, ease: 'expo.out' }, t + 0.05);
      cue(t + 0.05, 'pop', 0.7);
      const len = p.getTotalLength();
      for (let k = 0; k < 2; k++) {
        const pl = H('i', 'pulse', '', $('#pl17'));
        drivers.push(tt => {
          const q = ((tt - t - 0.5) * 0.7 + k * 0.5) % 1;
          const vis = tt > t + 0.5 && tt < 92.95;
          pl.style.opacity = vis ? Math.sin(Math.PI * q).toFixed(2) : 0;
          const pt = p.getPointAtLength(len * (q < 0 ? 0 : q));
          pl.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`;
        });
      }
      tl.to(card, { x: HB[0] - x, y: HB[1] - y, scale: 0.1, opacity: 0, duration: 0.45, ease: 'expo.in' }, 92.95 + (i % 3) * 0.03);
      tl.to(p, { opacity: 0, duration: 0.25 }, 92.95);
    });
    // sortie : le moyeu blanc envahit l'écran
    tl.to(['#ob17a', '#ob17b'], { scale: 0.2, opacity: 0, duration: 0.4, ease: 'expo.in' }, 92.95);
    tl.to('#hub17', { scale: 14, duration: 0.65, ease: 'expo.in' }, 93.05);
    tl.to('#hub17 svg', { opacity: 0, duration: 0.2 }, 93.1);
    cue(93.0, 'suck'); cue(93.5, 'hit', 0.6);
    show('#s18', 93.62); hide('#s17', 93.65);

    /* ======================================================================
       18 · REPORTING (93,62–97,6)
       ====================================================================== */
    const T18 = 93.62;
    drift('#c18', T18, 97.6, 1, 1.03);
    tl.fromTo('#dash18', { y: 60, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'expo.out' }, T18);
    titles('#s18', T18 + 0.2, 97.0);
    counter($('#k18a'), 1248300, 94.0, 1.5, { suf: ' €' });
    counter($('#k18b'), 186400, 94.1, 1.5, { suf: ' €' });
    counter($('#k18c'), 64, 94.2, 1.4);
    counter($('#k18d'), 312, 94.3, 1.4);
    cue(94.0, 'counter');
    const ch = $('#ch18');
    const VAL = [38, 44, 41, 55, 62, 58, 70, 66, 78, 84, 80, 96];
    const pts = VAL.map((v, i) => [20 + i * (920 / 11), 240 - v * 2.2]);
    let dline = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const mx = (x0 + x1) / 2; dline += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
    const grad = svgEl('linearGradient', { id: 'gArea', x1: 0, y1: 0, x2: 0, y2: 1 }, ch);
    svgEl('stop', { offset: 0, 'stop-color': BLUE, 'stop-opacity': 0.28 }, grad); svgEl('stop', { offset: 1, 'stop-color': BLUE, 'stop-opacity': 0 }, grad);
    const area = svgEl('path', { d: `${dline} L${pts[11][0]} 250 L${pts[0][0]} 250 Z`, fill: 'url(#gArea)' }, ch);
    const lineP = svgEl('path', { d: dline, fill: 'none', stroke: BLUE, 'stroke-width': 5, 'stroke-linecap': 'round' }, ch);
    const dots = pts.map(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 7, fill: '#fff', stroke: BLUE, 'stroke-width': 4 }, ch));
    tl.fromTo(lineP, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' }, 94.2);
    tl.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 94.8);
    tl.fromTo(dots, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.3, stagger: 0.11, ease: 'back.out(3)' }, 94.25);
    cue(94.2, 'draw');
    const TM = [['JD', BLUE, 'Julie D.', 412000, 1], ['MR', PINK, 'Marc R.', 356000, 0.86], ['SL', ORANGE, 'Sofia L.', 298000, 0.72], ['HB', '#5B4BFF', 'Hugo B.', 182000, 0.44]];
    TM.forEach(([ini, col, name, v, k], i) => {
      const row = H('div', 'tm', `<span class="avatar" style="background:${col}">${ini}</span><span style="width:120px">${name}</span><div class="bar-l"><i></i></div><em></em>`, $('#team18'));
      tl.fromTo($('.bar-l i', row), { scaleX: 0 }, { scaleX: k, duration: 1.0, ease: 'expo.out' }, 94.6 + i * 0.12);
      counter($('em', row), v, 94.6 + i * 0.12, 1.0, { suf: ' €' });
      tl.fromTo(row, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4 }, 94.5 + i * 0.12);
    });
    push('#s19', '#s18', 97.6, 'y', 0.75);

    /* ======================================================================
       19 · TRACFIN (97,6–100,6) — bientôt
       ====================================================================== */
    const T19 = 97.6;
    drift('#c19', T19, 100.6, 1, 1.04);
    $$('#s19 .rr').forEach(r => Object.assign(r.style, { left: '1240px', top: '520px' }));
    titles('#s19', T19 + 0.4, 100.05);
    pop('#sh19', T19 + 0.5, { from: 0.2, ease: 'back.out(1.8)', dur: 0.8 });
    drivers.push(t => { $('#rad19').style.transform = `rotate(${((t - T19) * 160).toFixed(1)}deg)`; $('#rad19').style.opacity = clamp((t - T19 - 0.4) / 0.4).toFixed(2); });
    tl.fromTo('#s19 .rr', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, T19 + 0.4);
    cue(T19 + 0.5, 'scanlite');
    tl.fromTo('#al19', { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 98.9);
    tl.fromTo('#al19', { rotation: 0 }, { rotation: 1.2, duration: 0.06, yoyo: true, repeat: 5, ease: 'none' }, 99.45);
    cue(98.95, 'alert');
    iris('#s20', '#s19', 100.55, 1240, 520, 0.7);

    /* ======================================================================
       20 · FORMATION LOI ALUR (100,55–103,5) — bientôt
       ====================================================================== */
    const T20 = 100.55;
    drift('#c20', T20, 103.5, 1, 1.04);
    titles('#s20', T20 + 0.2, 102.95);
    pop('#ring20', T20 + 0.3, { from: 0.6, dur: 0.8, ease: 'expo.out' });
    const rl = 2 * Math.PI * 186;
    $('#ring20c').setAttribute('stroke-dasharray', `${rl} ${rl}`);
    drivers.push(t => {
      const p = ez('expo.out', prog(t, 100.9, 102.4)) * (11 / 14);
      $('#ring20c').setAttribute('stroke-dashoffset', (rl * (1 - p)).toFixed(1));
      $('#ring20n').textContent = `${Math.round(p * 14)} h`;
    });
    cue(100.9, 'counter', 0.7);
    $$('#mods20 .m20').forEach((m, i) => {
      tl.fromTo(m, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 100.95 + i * 0.15);
      tl.fromTo($('.chk', m), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 101.35 + i * 0.15);
      cue(101.35 + i * 0.15, 'tick', 0.6);
    });
    pop('#dev20 .tag', 101.6, { stagger: 0.1, from: 0.6 });
    pillWipe(103.55, '#s20', '#s21', INK, 1);

    /* ======================================================================
       21 · FIN (103,55–110)
       ====================================================================== */
    const T21 = 103.55;
    drivers.push(t => { $('#g21').style.transform = `perspective(900px) rotateX(58deg) translateY(${(t * 40) % 80}px) scale(1.4)`; });
    tl.fromTo('#g21', { opacity: 0 }, { opacity: 0.8, duration: 1.0 }, T21);
    drift('#c21', T21, 110, 1, 1.04);
    const EK = { x: 486, y: 300, s: 220 };
    const ex = EK.x + EK.s * 461 / 371, ey = EK.y + EK.s * 95 / 371, eh = EK.s * 257 / 371, ew = eh * 1139 / 257;
    Object.assign($('#endIc').style, { left: `${EK.x}px`, top: `${EK.y}px`, width: `${EK.s}px`, height: `${EK.s}px` });
    Object.assign($('#wm21').style, { left: `${ex}px`, top: `${ey}px`, width: `${ew + 4}px`, height: `${eh + 2}px` });
    Object.assign($('#wm21i').style, { width: `${ew}px`, height: `${eh}px` });
    tl.fromTo('#eRed', { x: 700, y: -700, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.0, ease: 'expo.out' }, T21 + 0.15);
    tl.fromTo('#eBlue', { x: -700, y: 700, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.0, ease: 'expo.out' }, T21 + 0.25);
    tl.fromTo('#endIc', { rotation: 25, scale: 1.3 }, { rotation: 0, scale: 1, duration: 1.3, ease: 'expo.out', transformOrigin: '50% 50%' }, T21 + 0.15);
    cue(T21 + 0.15, 'swoosh'); cue(T21 + 0.25, 'swoosh', 0.8);
    cue(T21 + 0.5, 'final');
    tl.fromTo('#wm21i', { x: -ew - 40 }, { x: 0, duration: 1.0, ease: 'expo.out' }, T21 + 0.75);
    tl.fromTo('#t21a', { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, T21 + 1.25);
    tl.fromTo('#t21b', { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, T21 + 1.55);
    cue(T21 + 1.25, 'title', 0.7);
    tl.fromTo('#cta21', { scale: 0.4, opacity: 0, xPercent: -50 }, { scale: 1, opacity: 1, xPercent: -50, duration: 0.8, ease: 'back.out(2)' }, T21 + 2.1);
    cue(T21 + 2.1, 'pop');
    tl.fromTo('#url21', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, T21 + 2.4);
    drivers.push(t => {   // reflet qui passe sur le bouton
      const p = prog(t, 107.0, 107.9);
      $('#cta21').style.backgroundImage = p > 0 && p < 1 ? `linear-gradient(105deg, #fff ${(p * 140 - 30).toFixed(1)}%, #E5E3FF ${(p * 140 - 15).toFixed(1)}%, #fff ${(p * 140).toFixed(1)}%)` : 'none';
    });
    tl.fromTo('#c21', { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 109.4);
  },
});
