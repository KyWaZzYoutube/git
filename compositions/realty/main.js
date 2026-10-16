/* ==========================================================================
   Realty — bande démo du logiciel immobilier (114 s · 1920×1080 · 120 BPM)

   Un seul plan continu : pas de scènes qui entrent et sortent, mais des objets
   qui passent d'une fonctionnalité à la suivante. Le fond (lavande ↔ violet)
   s'ouvre et se referme en cercle depuis l'objet qu'on touche.

     0,0  dix outils → flash → logo, « Le logiciel immobilier que vous attendiez »
     7,6  l'icône devient le logo de l'application → carte du turnover (cartes stratégiques)
    12,6  la carte rentre dans le téléphone (prospection terrain)
    18,0  on plonge dans l'écran → cadastre (prospection cadastrale)
    22,8  un marqueur s'ouvre en fiche du bien (saisie assistée)
    27,6  la fiche se range à droite, documents en vrac (Magic Scan)
    32,9  clic sur le micro → fond violet, la fiche se retourne (saisie IA)
    37,7  le fond se referme sur le prix → estimation, rapports
    42,2  le rapport devient le téléphone (mandat)
    47,8  l'écran du téléphone devient le cadre photo (valorisation)
    55,0  le cadre devient le bouton « Démarrer la commercialisation »
    63,3  la 1re visite devient l'avis de visite, puis l'annonce (Click & Visit)
    73,0  l'annonce devient le site web, puis l'application (offre d'achat)
    82,0  l'offre devient le compromis, puis l'enveloppe (SRU, notaires)
    91,0  le dossier se resserre en moyeu (automatisations)
    97,3  le moyeu devient le tableau de bord (reporting, TRACFIN)
   104,3  le tableau de bord devient le téléphone (formation ALUR)
   107,2  le fond se referme en logo : fin
   ========================================================================== */
MotionEngine.run({
  duration: 114,
  fonts: ['800 100px "Manrope Variable"', '700 40px "Manrope Variable"', '600 40px "Manrope Variable"', '500 40px "Manrope Variable"'],
  build(E) {
    const { tl, cue, $, $$, drivers, counter, typewriter, shake, bump, camera, rel, ez, prog, clamp, lerp, svgEl, rng, measure } = E;
    camera($('#bump'));
    const R = rng(20261017);
    const rr = (a, b) => a + (b - a) * R();
    const H = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
    const ico = id => `<svg class="ico"><use href="#${id}"/></svg>`;
    const BLUE = '#3300FF', PINK = '#E0219B', ORANGE = '#FF5A36', INK = '#141B33';
    const vis = (s, t) => tl.set(s, { visibility: 'visible' }, t);
    const hid = (s, t) => tl.set(s, { visibility: 'hidden' }, t);
    const W = $('#world');

    /* ---------------- fond : anneaux, ouverture / fermeture du violet ---------------- */
    for (const id of ['#ringsL', '#ringsB']) {
      [420, 760, 1140, 1580, 2080].forEach((d, i) => {
        const r = H('i', '', '', $(id));
        Object.assign(r.style, { width: `${d}px`, height: `${d}px`, left: `${-d / 2}px`, top: `${-d / 2}px` });
        drivers.push(t => { r.style.transform = `scale(${(1 + 0.025 * Math.sin(t * 0.9 - i * 0.7)).toFixed(4)})`; });
      });
    }
    const bgB = $('#bgB');
    function bgOpen(t, x, y, dur = 0.8) {
      tl.set(bgB, { visibility: 'visible' }, t);
      tl.fromTo(bgB, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(2400px at ${x}px ${y}px)`, duration: dur, ease: 'expo.inOut', immediateRender: false }, t);
      cue(t, 'open');
    }
    function bgClose(t, x, y, dur = 0.8) {
      tl.fromTo(bgB, { clipPath: `circle(2400px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)`, duration: dur, ease: 'expo.inOut', immediateRender: false }, t);
      tl.set(bgB, { visibility: 'hidden' }, t + dur);
      cue(t, 'close');
    }

    /* ---------------- légendes : lignes masquées, badge qui s'étire ---------------- */
    const badge = (b, t, d = 0.55) => {
      tl.fromTo(b, { '--s': 0 }, { '--s': 1, duration: d, ease: 'expo.inOut' }, t);
      tl.fromTo(b.firstElementChild, { clipPath: 'inset(-10% 100% -10% 0)' }, { clipPath: 'inset(-10% 0% -10% 0)', duration: d, ease: 'expo.inOut' }, t);
      cue(t, 'badge');
    };
    function cap(id, tIn, tOut) {
      const c = $(id);
      const lns = $$('.ln', c), sub = $$('.sub', c), bdg = $$('.bdg', c);
      tl.set(c, { visibility: 'hidden' }, 0);
      vis(c, tIn);
      tl.fromTo(lns, { yPercent: 118 }, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, tIn);
      bdg.forEach((b, i) => badge(b, tIn + 0.45 + i * 0.18));
      if (sub.length) tl.fromTo(sub, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, tIn + 0.35);
      cue(tIn, 'title');
      if (tOut != null) {
        tl.to(lns, { yPercent: -118, duration: 0.45, stagger: 0.04, ease: 'power3.in' }, tOut);
        if (sub.length) tl.to(sub, { opacity: 0, y: -16, duration: 0.3, ease: 'power2.in' }, tOut);
        hid(c, tOut + 0.7);
      }
    }

    /* ---------------- transformation de conteneur (un objet en devient un autre) ---------------- */
    const shell = $('#shell');
    function morph(t, a, b, dur = 0.75, c0 = '#fff', c1 = c0) {
      tl.set(shell, { visibility: 'visible', opacity: 1, left: a[0], top: a[1], width: a[2], height: a[3], borderRadius: a[4], backgroundColor: c0 }, t);
      tl.to(shell, { left: b[0], top: b[1], width: b[2], height: b[3], borderRadius: b[4], backgroundColor: c1, duration: dur, ease: 'expo.inOut' }, t);
      tl.to(shell, { opacity: 0, duration: 0.22, ease: 'power1.in' }, t + dur);
      hid(shell, t + dur + 0.23);
      cue(t, 'morph');
    }
    const fadeOut = (s, t, d = 0.15) => { tl.to(s, { opacity: 0, duration: d }, t); hid(s, t + d); };
    const fadeIn = (s, t, d = 0.25) => { vis(s, t); tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: d, immediateRender: false }, t); };
    const pop = (els, t, o = {}) => tl.fromTo(els, { scale: o.from ?? 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: o.dur ?? 0.6, stagger: o.stagger ?? 0.08, ease: o.ease ?? 'back.out(2.2)', transformOrigin: o.origin ?? '50% 50%' }, t);
    const slideIn = (els, t, o = {}) => tl.fromTo(els, { x: o.x ?? 0, y: o.y ?? 40, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: o.dur ?? 0.8, stagger: o.stagger ?? 0.08, ease: o.ease ?? 'expo.out' }, t);
    const slideOut = (els, t, o = {}) => tl.to(els, { x: o.x ?? 0, y: o.y ?? 30, opacity: 0, duration: o.dur ?? 0.4, stagger: o.stagger ?? 0.03, ease: 'power2.in' }, t);

    /* ---------------- curseur ---------------- */
    const cur = $('#cur'), rip = $('#rip');
    const paths = [], clicks = [];
    const curPath = keys => paths.push(keys);
    function click(t, x, y) {
      clicks.push(t);
      cue(t, 'click');
      tl.fromTo(rip, { x, y, scale: 0.3, opacity: 0.9, visibility: 'visible' }, { scale: 1.5, opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, t);
      hid(rip, t + 0.56);
    }
    drivers.push(t => {
      let v = false, x = 0, y = 0;
      for (const ks of paths) {
        if (t < ks[0].t || t > ks[ks.length - 1].t) continue;
        v = true;
        for (let i = 0; i < ks.length - 1; i++) if (t >= ks[i].t && t <= ks[i + 1].t) {
          const p = ez('power3.inOut', prog(t, ks[i].t, ks[i + 1].t));
          x = lerp(ks[i].x, ks[i + 1].x, p); y = lerp(ks[i].y, ks[i + 1].y, p);
        }
      }
      let s = 1;
      for (const c of clicks) { const d = t - c; if (d > -0.08 && d < 0.25) s = Math.min(s, 1 - 0.18 * Math.sin(Math.PI * clamp((d + 0.08) / 0.33))); }
      cur.style.visibility = v ? 'visible' : 'hidden';
      cur.style.transform = `translate(${(x - 7).toFixed(1)}px, ${(y - 5).toFixed(1)}px) scale(${s.toFixed(3)})`;
    });
    function arc(el, t, x0, y0, x1, y1, dur = 0.6) {
      tl.set(el, { x: x0, y: y0, opacity: 1, scale: 1 }, t);
      tl.to(el, { x: x1, duration: dur, ease: 'power1.in' }, t);
      tl.to(el, { y: y1, duration: dur, ease: 'power2.out' }, t);
      tl.to(el, { opacity: 0, scale: 0.4, duration: 0.12 }, t + dur - 0.05);
    }
    const dot = (col = BLUE) => { const d = H('i', 'abs', '', W); Object.assign(d.style, { left: 0, top: 0, width: '16px', height: '16px', margin: '-8px', borderRadius: '50%', background: col, boxShadow: `0 0 14px ${col}`, opacity: 0, zIndex: 40 }); return d; };

    /* ======================================================================
       PRÉLUDE · dix outils (0–3,7)
       ====================================================================== */
    vis('#gPre', 0); hid('#gPre', 3.75);
    tl.set(bgB, { visibility: 'visible', clipPath: 'none' }, 0);
    const TOOLS = [['Pige', '#3300FF', 'i-radar', 330, 170], ['Agenda', '#E0219B', 'i-calendar', 760, 140], ['Portails', '#FF5A36', 'i-share', 1190, 160], ['Mandats', '#12A86B', 'i-file', 1600, 190],
      ['Contrats', '#2F80ED', 'i-pen', 330, 860], ['Factures', '#F2B705', 'i-euro', 760, 900], ['Site web', '#3300FF', 'i-globe', 1190, 880], ['Tableur', '#E0219B', 'i-chart', 1600, 850]];
    TOOLS.forEach(([name, col, ic, x, y], i) => {
      const el = H('div', 'tool', `<b><i style="background:${col}">${ico(ic)}</i>${name}</b>${'<div class="tl"><s></s><u style="width:' + (60 + (i * 37) % 70) + 'px"></u></div>'.repeat(3)}`, $('#tools'));
      const rot = rr(-7, 7);
      Object.assign(el.style, { left: `${x}px`, top: `${y}px` });
      tl.fromTo(el, { x: (x - 960) * 0.6, y: (y - 540) * 0.8 + 300, rotation: rot * 3, opacity: 0, scale: 0.6 }, { x: 0, y: 0, rotation: rot, opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out' }, 0.1 + i * 0.07);
      drivers.push(t => { el.style.translate = `0px ${(Math.sin(t * 1.6 + i) * 6).toFixed(1)}px`; });
      tl.to(el, { x: 960 - x, y: 540 - y, scale: 0.15, rotation: rot * 4, opacity: 0, duration: 0.55, ease: 'expo.in' }, 2.95 + (i % 4) * 0.03);
    });
    cue(0.1, 'swoosh', 0.7); cue(0.4, 'swoosh', 0.6);
    tl.fromTo('#preS', { yPercent: 118 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 0.45);
    tl.fromTo('#preH', { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 0.6);
    badge($('#preB'), 1.15);
    cue(0.6, 'title');
    tl.to('#preT', { scale: 0.85, opacity: 0, duration: 0.45, ease: 'power3.in' }, 2.9);
    // flash blanc depuis le centre : le fond devient lavande
    tl.fromTo('#cflash', { scale: 0, visibility: 'visible' }, { scale: 7, duration: 0.55, ease: 'expo.in', immediateRender: false }, 3.15);
    hid(bgB, 3.7);
    tl.to('#cflash', { opacity: 0, duration: 0.45, ease: 'power2.out' }, 3.7);
    hid('#cflash', 4.2);
    cue(3.15, 'suck'); cue(3.7, 'hit');

    /* ======================================================================
       LOGO (3,7–8,4)
       ====================================================================== */
    vis('#gLogo', 3.7); hid('#gLogo', 8.45);
    tl.set('#gLogo', { visibility: 'hidden' }, 0);
    const LK = { x: 529, y: 255, s: 200 };
    const wmX = LK.x + LK.s * 461 / 371, wmY = LK.y + LK.s * 95 / 371, wmH = LK.s * 257 / 371, wmW = wmH * 1139 / 257;
    Object.assign($('#lgIc').style, { left: `${LK.x}px`, top: `${LK.y}px`, width: `${LK.s}px`, height: `${LK.s}px` });
    Object.assign($('#lgWm').style, { left: `${wmX}px`, top: `${wmY}px`, width: `${wmW + 4}px`, height: `${wmH + 2}px` });
    Object.assign($('#lgWmi').style, { width: `${wmW}px`, height: `${wmH}px` });
    const centerX = 960 - LK.s / 2 - LK.x;
    tl.fromTo('#lgIc', { x: centerX, scale: 0.2, rotation: -30 }, { scale: 1.15, rotation: 0, duration: 0.9, ease: 'expo.out', transformOrigin: '50% 50%' }, 3.7);
    tl.fromTo('#pRed', { x: 160, y: -160 }, { x: 0, y: 0, duration: 0.9, ease: 'expo.out' }, 3.7);
    tl.fromTo('#pBlue', { x: -160, y: 160 }, { x: 0, y: 0, duration: 0.9, ease: 'expo.out' }, 3.7);
    tl.to('#lgIc', { x: 0, scale: 1, duration: 0.9, ease: 'expo.inOut' }, 4.45);
    tl.fromTo('#lgWmi', { x: -wmW - 40 }, { x: 0, duration: 0.9, ease: 'expo.out' }, 4.85);
    cue(3.75, 'logo'); cue(4.45, 'swoosh', 0.6);
    tl.fromTo('#lgTl', { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 5.25);
    badge($('#lgB'), 5.75, 0.6);
    tl.fromTo('#lgSl', { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 6.1);
    cue(5.25, 'title');
    // l'icône devient le logo de l'application
    tl.to(['#lgSl', '#lgTl'], { yPercent: -118, duration: 0.45, stagger: 0.05, ease: 'power3.in' }, 7.25);
    tl.to('#lgWmi', { x: -wmW - 40, duration: 0.55, ease: 'expo.in' }, 7.3);
    const SLOT = [306, 157, 44];
    tl.to('#lgIc', { x: SLOT[0] - LK.x, y: SLOT[1] - LK.y, scale: SLOT[2] / LK.s, duration: 0.85, ease: 'expo.inOut', transformOrigin: '0% 0%' }, 7.6);
    cue(7.6, 'whoosh', 0.8);
    vis('#app', 8.0);
    tl.fromTo('#app', { clipPath: 'circle(0px at 48px 49px)' }, { clipPath: 'circle(1700px at 48px 49px)', duration: 0.9, ease: 'expo.inOut', immediateRender: false }, 8.0);
    tl.set('#app', { clipPath: 'none' }, 8.9);
    tl.fromTo('#nav .mi', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'expo.out' }, 8.3);

    /* ======================================================================
       CARTES STRATÉGIQUES (8,3–12,9) : la carte s'incline, les îlots chauffent
       ====================================================================== */
    vis('#vMap', 8.3);
    tl.fromTo('#hiS', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 8.6);
    const ms = $('#mapSvg');
    svgEl('path', { d: 'M-40 600 C 220 520 380 650 600 470 S 900 230 1160 140', class: 'mapPath' }, ms);
    const ilots = [], COLS = 6, ROWS = 4, CW = 185, CH = 186;
    const jit = [];
    for (let r = 0; r <= ROWS; r++) { jit[r] = []; for (let c = 0; c <= COLS; c++) jit[r][c] = [c * CW + (c % COLS ? rr(-20, 20) : 0), r * CH + (r % ROWS ? rr(-20, 20) : 0)]; }
    const HOT = [3, 1];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = [jit[r][c], jit[r][c + 1], jit[r + 1][c + 1], jit[r + 1][c]];
      const cx = p.reduce((a, q) => a + q[0], 0) / 4, cy = p.reduce((a, q) => a + q[1], 0) / 4;
      const pts = p.map(([x, y]) => [x + (cx - x) * 0.2, y + (cy - y) * 0.2]);
      const el = svgEl('polygon', { points: pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' '), class: 'ilot' }, ms);
      const d = Math.hypot(c - HOT[0], (r - HOT[1]) * 1.2);
      const heat = clamp(1 - d / 3.6 + rr(-0.15, 0.15), 0.06, 1);
      const anc = H('i', 'abs', '', $('#mapIn')); Object.assign(anc.style, { left: `${cx}px`, top: `${cy}px`, width: '1px', height: '1px' });
      ilots.push({ el, c, r, heat, anc, d });
    }
    tl.fromTo(ilots.map(i => i.el), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, stagger: { amount: 0.6, from: 'center' }, ease: 'power2.out' }, 8.6);
    // l'application glisse à droite et la carte s'incline en 3D
    tl.to('#app', { x: 470, y: 30, scale: 0.86, rotationY: -8, transformPerspective: 2600, duration: 1.1, ease: 'expo.inOut' }, 9.0);
    tl.to('#mapIn', { rotationX: 40, rotationZ: -10, scale: 1.2, y: 30, duration: 1.2, ease: 'expo.inOut' }, 9.1);
    cue(9.0, 'swoosh', 0.7);
    cap('#cA', 9.45, 12.35);
    const hot = ilots.find(q => q.c === HOT[0] && q.r === HOT[1]);
    ilots.forEach(i => tl.to(i.el, { fill: i === hot ? PINK : `rgba(51,0,255,${(0.08 + i.heat * 0.86).toFixed(2)})`, duration: 0.5, ease: 'power2.out' }, 9.9 + i.d * 0.1));
    cue(9.9, 'sweep');
    // bulles et collaborateurs, posés sur la carte inclinée (positions mesurées)
    const pick = (c, r) => ilots.find(i => i.c === c && i.r === r);
    const LABS = [[pick(3, 1), '9,2 %', 'Turnover'], [pick(4, 0), '41', 'Ventes par an'], [pick(4, 2), '286 k€', 'Honoraires à prendre']];
    const TEAM = [[BLUE, 'JD', [[2, 1], [3, 1], [2, 2]]], [PINK, 'MR', [[4, 0], [4, 1], [5, 1]]], [ORANGE, 'SL', [[3, 2], [4, 2], [5, 2]]]];
    const labEls = LABS.map(([il, v, k]) => { const lab = H('div', 'pinlab', `<div class="bubble"><b>${v}</b><small>${k}</small></div><i class="stem"></i>`, W); lab.style.visibility = 'hidden'; return lab; });
    const avEls = TEAM.map(([col, ini]) => { const av = H('div', 'who-pin', ini, W); Object.assign(av.style, { background: col, visibility: 'hidden' }); return av; });
    measure(11.0, () => ilots.map(i => { const q = rel(i.anc); return [q.cx, q.cy]; }), P => {
      const at = il => P[ilots.indexOf(il)];
      LABS.forEach(([il], j) => { const [x, y] = at(il); Object.assign(labEls[j].style, { left: `${x}px`, top: `${y}px` }); });
      TEAM.forEach(([, , cells], k) => { const [x, y] = at(pick(...cells[1])); Object.assign(avEls[k].style, { left: `${x}px`, top: `${y}px` }); });
    });
    labEls.forEach((lab, j) => {
      vis(lab, 10.4 + j * 0.3);
      tl.fromTo(lab, { opacity: 0, y: 30, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)', transformOrigin: '50% 100%' }, 10.4 + j * 0.3);
      cue(10.4 + j * 0.3, 'pop');
      tl.to(lab, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, 11.45 + j * 0.05);
      hid(lab, 11.9);
    });
    TEAM.forEach(([col, , cells], k) => {
      cells.forEach(([c, r], j) => tl.to(pick(c, r).el, { stroke: col, strokeWidth: 9, duration: 0.35 }, 11.75 + k * 0.22 + j * 0.05));
      vis(avEls[k], 11.7 + k * 0.22);
      tl.fromTo(avEls[k], { y: -260, scale: 0.6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, 11.7 + k * 0.22);
      tl.to(avEls[k], { opacity: 0, scale: 0.5, duration: 0.25 }, 12.4);
      hid(avEls[k], 12.7);
      cue(11.75 + k * 0.22, 'drop', 0.7);
    });
    // sortie : la carte se remet à plat, on fonce dedans, le téléphone recule
    tl.to('#mapIn', { rotationX: 0, rotationZ: 0, scale: 1, y: 0, duration: 0.5, ease: 'power2.inOut' }, 12.35);
    tl.to('#app', { x: 590, scale: 2.8, rotationY: 0, duration: 0.6, ease: 'expo.in' }, 12.55);
    tl.to('#app', { opacity: 0, duration: 0.12 }, 13.03);
    hid('#app', 13.16);
    tl.set('#app', { opacity: 1, x: 0, y: 0, scale: 1, rotationY: 0 }, 13.2);
    hid('#vMap', 13.2);
    cue(12.6, 'whoosh');
    const pmap = $('#pmap');
    for (let y = -40; y < 820; y += 150) for (let x = -60; x < 400; x += 130) svgEl('rect', { x: x + 14, y: y + 14, width: 100 + rr(-8, 8), height: 118 + rr(-8, 8), rx: 10, fill: '#fff', stroke: '#D8D2FF', 'stroke-width': 2 }, pmap);
    svgEl('path', { d: 'M-20 250 C 120 270 240 300 400 230', class: 'mapPath' }, pmap);
    tl.set('#ph', { left: 330, top: 130 }, 0);
    vis('#ph', 13.0); vis('#pvMap', 13.0);
    tl.fromTo('#ph', { x: 430, scale: 4.6 }, { x: 0, scale: 1, duration: 1.05, ease: 'expo.out', immediateRender: false }, 13.0);

    /* ======================================================================
       PROSPECTION TERRAIN (13–18,4)
       ====================================================================== */
    drivers.push(t => {
      const p = (((t - 13) % 1.4) + 1.4) % 1.4 / 1.4;
      $('#meRing').style.transform = `scale(${(0.25 + p * 1.2).toFixed(3)})`;
      $('#meRing').style.opacity = (0.9 * (1 - p)).toFixed(3);
      $('#caret').style.opacity = (t >= 14.55 && t < 16.1) ? (Math.floor(t * 2.2) % 2 ? 1 : 0.15) : 0;
    });
    pop('#me', 13.5, { from: 0 });
    cap('#cB', 13.55, 17.85);
    tl.fromTo('#sheet', { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, 14.1);
    cue(14.1, 'swoosh', 0.7);
    typewriter($('#typ'), 'Famille Lefèvre', 14.55, 13);
    tl.fromTo('#chipF', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)' }, 15.85);
    cue(15.85, 'tick');
    tl.to('#save', { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, 16.2);
    tl.to('#save', { backgroundColor: BLUE, duration: 0.2 }, 16.25);
    cue(16.2, 'click');
    vis('#gRel', 16.2); hid('#gRel', 18.3);
    const REL = [['i-mail', 'J+1', 'Email de bienvenue', 860, 590], ['i-sms', 'J+15', 'SMS de suivi', 1220, 590], ['i-task', 'M+2', 'Tâche : rappeler', 860, 712], ['i-refresh', 'M+6', 'Nouvelle relance', 1220, 712]];
    REL.forEach(([ic, k, txt, x, y], i) => {
      const c = H('div', 'rel', `<span class="ibox ${i === 3 ? 'b' : ''}">${ico(ic)}</span><div><small>${k}</small>${txt}</div>`, $('#gRel'));
      Object.assign(c.style, { left: `${x}px`, top: `${y}px` });
      tl.fromTo(c, { x: 650 - x, y: 600 - y, scale: 0.2, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.75, ease: 'expo.out' }, 16.35 + i * 0.28);
      cue(16.35 + i * 0.28, 'pop', 0.8);
      tl.to(c, { x: 200, opacity: 0, duration: 0.4, ease: 'power2.in' }, 17.85 + i * 0.03);
    });
    // sortie : la fiche redescend, plongée dans la carte du téléphone → cadastre
    tl.to('#sheet', { yPercent: 100, duration: 0.45, ease: 'power3.in' }, 17.55);
    tl.to('#ph', { x: 430, y: 180, scale: 5.2, transformOrigin: '50% 28%', duration: 0.7, ease: 'expo.in' }, 17.95);
    cue(18.05, 'whoosh');
    tl.set('#gCad', { visibility: 'hidden' }, 0);
    fadeIn('#gCad', 18.4, 0.25);
    tl.fromTo('#cad', { scale: 1.5 }, { scale: 1, duration: 1.1, ease: 'expo.out', immediateRender: false }, 18.4);
    hid('#ph', 18.7); hid('#pvMap', 18.7);
    tl.set('#ph', { x: 0, y: 0, scale: 1, transformOrigin: '50% 50%' }, 18.75);

    /* ======================================================================
       PROSPECTION CADASTRALE (18,4–23,4)
       ====================================================================== */
    const gcad = svgEl('g', { transform: 'rotate(-6 960 540) translate(960 540) scale(1.12) translate(-960 -540)' }, $('#cad'));
    const toS = (x, y) => { const a = -6 * Math.PI / 180, sx = (x - 960) * 1.12, sy = (y - 540) * 1.12; return [960 + sx * Math.cos(a) - sy * Math.sin(a), 540 + sx * Math.sin(a) + sy * Math.cos(a)]; };
    const parcels = [], cents = [];
    for (let by = -160; by < 1200; by += 236) for (let bx = -200; bx < 2100; bx += 316) {
      const bw = 270, bh = 192, n = 3 + Math.floor(R() * 3);
      const cuts = [0]; for (let k = 1; k < n; k++) cuts.push(bw * k / n + rr(-14, 14)); cuts.push(bw);
      const mid = bh / 2 + rr(-20, 20);
      for (let k = 0; k < n; k++) for (const [y0, y1] of [[0, mid], [mid, bh]]) {
        const x0 = bx + cuts[k], x1 = bx + cuts[k + 1];
        parcels.push(svgEl('rect', { x: x0, y: by + y0, width: x1 - x0, height: y1 - y0, class: 'parcel' }, gcad));
        cents.push(toS((x0 + x1) / 2, by + (y0 + y1) / 2));
      }
    }
    parcels.sort(() => R() - 0.5);
    tl.fromTo(parcels, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, stagger: { amount: 1.0 }, ease: 'power2.out' }, 18.45);
    cap('#cC', 18.85, 22.75);
    drivers.push(t => {
      $('#radar').style.transform = `rotate(${((t - 18.4) * 150).toFixed(1)}deg)`;
      $('#radar').style.opacity = (clamp((t - 19.0) / 0.5) * (1 - clamp((t - 22.6) / 0.3))).toFixed(3);
    });
    const LAY = [['DPE récents', '#12A86B'], ['Pige particuliers', ORANGE], ['Annonces de confrères', '#F59E0B'], ['Estimations à suivre', '#9C8CFF'], ['Anciens clients', PINK], ['Acquéreurs revendeurs', '#00B3E6'], ['SCI et gérants', INK]];
    const free = cents.filter(([x, y]) => x > 40 && x < 1880 && y > 40 && y < 1040 && !(x < 880 && y < 470) && !(x > 1390 && y < 700) && !(x < 640 && y > 760));
    free.sort(() => R() - 0.5);
    slideIn('#layers', 19.1, { x: 80, y: 0 });
    let fi = 0;
    LAY.forEach(([name, col], i) => {
      const ly = H('div', 'ly', `<i style="background:${col}"></i>${name}<span class="sw"><i class="f"></i><i class="k"></i></span>`, $('#layers'));
      const t = 19.5 + i * 0.34;
      tl.to($('.f', ly), { opacity: 1, duration: 0.2 }, t);
      tl.to($('.k', ly), { x: 20, duration: 0.3, ease: 'back.out(2)' }, t);
      cue(t, 'tick', 0.8);
      for (let k = 0; k < 6 + (i % 3); k++) {
        const [x, y] = free[fi++ % free.length];
        const m = H('i', 'mk', '', $('#mks'));
        Object.assign(m.style, { left: `${x}px`, top: `${y}px`, background: col });
        tl.fromTo(m, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(3)' }, t + 0.06 + k * 0.035);
      }
      cue(t + 0.08, 'blip', 0.7);
    });
    slideIn('#cnt', 19.3, { y: 40 });
    counter($('#cntN'), 137, 19.4, 2.6, { ease: 'power1.inOut' });
    // sortie : un marqueur s'ouvre en fiche du bien
    const SEL = free[2];
    tl.to('#mks .mk', { opacity: 0.2, duration: 0.3 }, 22.75);
    slideOut('#layers', 22.75, { x: 80, y: 0 }); slideOut('#cnt', 22.75, { y: 40 });
    const selM = H('i', 'mk', '', W); Object.assign(selM.style, { left: `${SEL[0]}px`, top: `${SEL[1]}px`, background: BLUE, visibility: 'hidden', zIndex: 16 });
    vis(selM, 22.75);
    tl.fromTo(selM, { scale: 1 }, { scale: 1.8, duration: 0.3, ease: 'back.out(3)' }, 22.8);
    cue(22.8, 'pop');
    tl.set('#fc', { visibility: 'hidden' }, 0);
    vis('#fc', 23.1);
    tl.fromTo('#fc', { scale: 0.03, x: SEL[0] - 860, y: SEL[1] - 150, opacity: 0 }, { scale: 1, x: 0, y: 0, opacity: 1, duration: 0.85, ease: 'expo.out', immediateRender: false }, 23.1);
    tl.to(selM, { scale: 0, duration: 0.2 }, 23.15); hid(selM, 23.4);
    tl.to('#gCad', { opacity: 0, duration: 0.5 }, 23.2); hid('#gCad', 23.75);
    cue(23.1, 'whoosh', 0.7);

    /* ======================================================================
       SAISIE ASSISTÉE (23,1–27,8)
       ====================================================================== */
    tl.set(['#fvB', '#fvC', '#micB'], { visibility: 'hidden' }, 0);
    cap('#cD', 23.45, 27.45);
    const SRC = [['Base adresse nationale', 'i-pin'], ['Cadastre', 'i-map'], ['Registre des copropriétés', 'i-building'], ['ADEME · DPE', 'i-zap'], ['Géorisques', 'i-shield']];
    const srcBox = H('div', 'abs', '', W); Object.assign(srcBox.style, { left: '110px', top: '540px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 20 });
    const srcEls = SRC.map(([n, ic]) => H('span', 'label', `${ico(ic)}${n}`, srcBox));
    srcEls.forEach(s => Object.assign(s.style, { height: '50px', fontSize: '18px', padding: '0 16px', borderRadius: '14px', background: '#fff', color: INK, boxShadow: 'var(--sh)', alignSelf: 'flex-start', opacity: 0 }));
    slideIn(srcEls, 23.7, { x: -50, y: 0, stagger: 0.07 });
    $$('#fvA .fr').forEach((row, i) => {
      const t = 24.35 + i * 0.32;
      tl.fromTo($('.ibox', row), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, t);
      tl.fromTo($$('.fld, .src, .dpe', row), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05 }, t + 0.05);
      tl.fromTo(row, { backgroundColor: 'rgba(51,0,255,0)' }, { backgroundColor: 'rgba(51,0,255,.07)', duration: 0.15, yoyo: true, repeat: 1 }, t);
      cue(t, 'tick', 0.8);
      if (i < 5) arc(dot(), t - 0.4, 360, 565 + i * 62, 890, 150 + 76 + i * 112 + 56, 0.42);
    });
    tl.fromTo('#dpeC', { scale: 1 }, { scale: 1.3, duration: 0.4, ease: 'back.out(3)' }, 25.7);
    tl.set('#fcOk', { opacity: 0 }, 0);
    pop('#fcOk', 26.4, { from: 0.6 }); cue(26.4, 'notif');
    slideOut(srcEls, 27.35, { x: -50, y: 0 });

    /* ======================================================================
       MAGIC SCAN (27,6–32,9) : la même fiche se range à droite
       ====================================================================== */
    const FC2 = [1160, 170, 0.711];
    tl.to('#fc', { x: FC2[0] - 860, y: FC2[1] - 150, scale: FC2[2], duration: 0.9, ease: 'expo.inOut' }, 27.55);
    tl.to(['#fvA', '#fcOk'], { opacity: 0, duration: 0.25 }, 27.6);
    fadeIn('#fvB', 27.85, 0.3);
    cue(27.55, 'swoosh', 0.7);
    cap('#cE', 27.85, 32.55);
    const ROWS5 = [['Propriétaire', 'Famille Lefèvre'], ['Cadastre', 'AB 124'], ['Surface Carrez', '128,4 m²'], ['Taxe foncière', '2 140 €'], ['DPE', 'C · 142'], ['Charges par an', '1 860 €'], ['Lots de copropriété', '48'], ['Dernière AG', '12/03/2026']];
    ROWS5.forEach(([k, v], i) => {
      const row = H('div', 'sr', `<span>${k}</span><b class="v">${v}</b><span class="chk">${ico('i-check')}</span>`, $('#rowsB'));
      const t = 31.25 + i * 0.12;
      tl.fromTo([$('.v', row), $('.chk', row)], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.4)' }, t);
      cue(t, 'tick', 0.6);
    });
    tl.fromTo('#done5', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 31.3);
    counter($('#n5'), 42, 31.3, 1.0, { ease: 'power1.out' });
    const DOCS = [['Acte de vente', 'i-file'], ['Titre de propriété', 'i-key'], ['Plan', 'i-map'], ['Taxe foncière', 'i-euro'], ['Diagnostics', 'i-zap'], ['Appels de charges', 'i-euro'], ['Règlement de copro', 'i-building'], ['PV d’AG', 'i-news']];
    DOCS.forEach(([name, ic], i) => {
      const d = H('div', 'doc', `<div class="dt"></div>${'<div class="dl"></div>'.repeat(9)}<div class="lbl">${ico(ic)}${name}</div>`, $('#pile'));
      $$('.dl', d).forEach(l => (l.style.width = `${rr(45, 85)}%`));
      Object.assign(d.style, { left: 0, top: 0 });
      const x = 320 + rr(-230, 230), y = 170 + rr(-110, 130), r = rr(-28, 28);
      tl.fromTo(d, { x: x + rr(-300, 300), y: y - 1000, rotation: r * 3, opacity: 1 }, { x, y, rotation: r, duration: 0.75, ease: 'power3.out' }, 28.3 + i * 0.07);
      tl.set($('.lbl', d), { opacity: 0 }, 0);
      tl.to(d, { x: (i % 4) * 215, y: Math.floor(i / 4) * 320, rotation: 0, scale: 0.92, duration: 0.7, ease: 'expo.inOut' }, 30.25 + i * 0.04);
      tl.to($('.lbl', d), { opacity: 1, duration: 0.3 }, 30.55 + i * 0.04);
      tl.to(d, { x: 1160 + 320 - 120 - 115, y: 170 + 280 - 360 - 150 + i * 4, scale: 0.12, rotation: rr(-10, 10), opacity: 0, duration: 0.55, ease: 'power3.in' }, 30.95 + i * 0.12);
    });
    cue(28.3, 'paper'); cue(28.6, 'paper', 0.7);
    tl.set('#beam', { visibility: 'hidden' }, 0);
    vis('#beam', 29.3); hid('#beam', 30.2);
    tl.fromTo('#beam', { y: 220, opacity: 0 }, { y: 1010, opacity: 1, duration: 0.85, ease: 'power1.inOut' }, 29.3);
    cue(29.3, 'scan'); cue(30.25, 'swoosh', 0.7);
    // le micro de la fiche : clic → fond violet
    const MIC = [FC2[0] + (900 - 26 - 24) * FC2[2], FC2[1] + 38 * FC2[2]];
    vis('#micB', 32.3);
    pop('#micB', 32.3, { from: 0 });
    curPath([{ t: 32.25, x: 1500, y: 1150 }, { t: 32.75, x: MIC[0], y: MIC[1] }, { t: 33.1, x: MIC[0], y: MIC[1] }, { t: 33.5, x: 1900, y: 700 }]);
    click(32.85, MIC[0], MIC[1]);
    bgOpen(32.95, MIC[0], MIC[1], 0.9);

    /* ======================================================================
       SAISIE PAR IA (32,95–37,7)
       ====================================================================== */
    cap('#cF', 33.45, 37.5);
    tl.to('#fc', { x: 1000 - 860, y: 0, scale: 0.86, duration: 0.9, ease: 'expo.inOut' }, 33.2);
    tl.to('#micB', { scale: 0, duration: 0.25 }, 33.25); hid('#micB', 33.5);
    const OC = [640, 730];
    tl.set(['#orb', '#core', '#wave'], { left: OC[0], top: OC[1] }, 0);
    ['#orb', '#core', '#wave'].forEach(s => { tl.set(s, { visibility: 'hidden' }, 0); vis(s, 33.5); });
    pop(['#orb', '#core'], 33.5, { from: 0, stagger: 0.06 });
    const bars = [];
    for (let i = 0; i < 44; i++) { const b = H('i', '', '', $('#wave')); b.style.transform = `rotate(${(i / 44) * 360}deg) translateY(96px)`; bars.push(b); }
    drivers.push(t => {
      const talk = clamp((t - 33.9) / 0.3) * (1 - clamp((t - 35.6) / 0.3));
      bars.forEach((b, i) => { b.style.height = `${(10 + talk * (22 + 46 * Math.abs(Math.sin(t * 9.3 + i * 0.7) * Math.cos(t * 5.1 + i * 1.3)))).toFixed(1)}px`; b.style.opacity = (0.3 + 0.7 * talk).toFixed(2); });
      $('#orb').style.scale = (1 + 0.06 * Math.sin(t * 4) + 0.12 * talk * Math.abs(Math.sin(t * 7))).toFixed(3);
    });
    cue(33.9, 'voice');
    ['villa-piscine', 'salon-design', 'salon-lumineux', 'fauteuil', 'salon-plantes', 'annonce-maison'].forEach((f, i) => {
      const el = H('div', 'fly', `<img src="assets/${f}.jpg" alt="">`, $('#flys'));
      const a = (200 + i * 30) * Math.PI / 180, rad = 330 + (i % 2) * 60;
      const x = OC[0] + Math.cos(a) * rad - 95, y = OC[1] + Math.sin(a) * rad * 0.55 - 70;
      Object.assign(el.style, { left: 0, top: 0, visibility: 'hidden' });
      vis(el, 34.1 + i * 0.09);
      tl.fromTo(el, { x, y: y + 60, scale: 0.4, opacity: 0, rotation: rr(-12, 12) }, { y, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, 34.1 + i * 0.09);
      tl.to(el, { x: OC[0] - 95, y: OC[1] - 70, scale: 0.05, rotation: rr(-90, 90), duration: 0.6, ease: 'power3.in' }, 35.0 + i * 0.07);
      hid(el, 35.65 + i * 0.07);
    });
    cue(34.1, 'pop', 0.7); cue(34.5, 'pop', 0.6); cue(35.0, 'riser');
    tl.to('#orb', { scale: 3, opacity: 0, duration: 0.6, ease: 'expo.out' }, 35.75);
    tl.to(['#core', '#wave'], { scale: 0, opacity: 0, duration: 0.35, ease: 'back.in(2)' }, 35.55);
    ['#orb', '#core', '#wave'].forEach(s => hid(s, 36.4));
    cue(35.75, 'hit'); bump(35.75, 0.02);
    // la fiche se retourne : version générée par l'IA
    tl.to('#fc', { rotationY: 90, transformPerspective: 2400, duration: 0.22, ease: 'power2.in' }, 35.75);
    hid('#fvB', 35.97); vis('#fvC', 35.97);
    tl.fromTo('#fc', { rotationY: -90 }, { rotationY: 0, duration: 0.5, ease: 'back.out(1.4)', immediateRender: false }, 35.97);
    cue(35.8, 'flip');
    typewriter($('#pubT'), 'Lumineuse maison d’architecte de 128 m² sur un jardin de 612 m², au calme absolu…', 36.4, 50, { cue: false });
    cue(36.4, 'typeburst');
    pop('#genTags .tag', 37.1, { stagger: 0.1, from: 0.6 }); cue(37.1, 'notif');

    /* ======================================================================
       ESTIMATIONS (37,65–42,3) : le fond se referme sur le prix
       ====================================================================== */
    const GP = [1000 + 32 * 0.86 + 90, 150 + 405 * 0.86];
    bgClose(37.65, GP[0], GP[1], 0.8);
    tl.fromTo('#gp', { scale: 1 }, { scale: 1.2, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: '0% 50%' }, 37.65);
    cap('#cG', 38.2, 41.95);
    const FC3 = [1180, 200, 0.6];
    tl.to('#fc', { x: FC3[0] - 860, y: FC3[1] - 150, scale: FC3[2], duration: 0.9, ease: 'expo.inOut' }, 38.0);
    ['#rp1', '#rp2'].forEach((s, k) => {
      tl.set(s, { transformOrigin: '0% 0%', x: FC3[0], y: FC3[1], scale: FC3[2], visibility: 'hidden' }, 0);
      vis(s, 38.6);
      tl.fromTo(s, { opacity: 0, rotation: 0 }, { opacity: 1, rotation: -6 - k * 6, x: FC3[0] - 70 - k * 70, y: FC3[1] + 20 + k * 20, duration: 0.9, ease: 'expo.out', immediateRender: false }, 38.6 + k * 0.08);
      tl.to(s, { opacity: 0, x: FC3[0], y: FC3[1], rotation: 0, duration: 0.4, ease: 'power2.in' }, 41.8);
      hid(s, 42.25);
    });
    cue(38.6, 'paper');
    ['#val', '#rng', '#meth'].forEach(s => tl.set(s, { visibility: 'hidden' }, 0));
    vis('#val', 38.35);
    tl.fromTo('#val', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 38.35);
    counter($('#val'), 685000, 38.4, 1.6, { suf: ' €' });
    cue(38.4, 'counter');
    vis('#rng', 38.7); slideIn('#rng', 38.7, { y: 20 });
    tl.fromTo('#rngK', { left: '8%' }, { left: '52%', duration: 1.4, ease: 'expo.out' }, 38.8);
    vis('#meth', 38.8);
    $$('#meth .mt').forEach((m, i) => {
      const t = 39.1 + i * 0.3;
      tl.fromTo(m, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, t - 0.2);
      tl.to($('.f', m), { opacity: 1, duration: 0.2 }, t + 0.1);
      tl.to($('.k', m), { x: 20, duration: 0.3, ease: 'back.out(2)' }, t + 0.1);
      tl.to(m, { boxShadow: '0 0 0 2px #3300FF', duration: 0.2 }, t + 0.1);
      cue(t + 0.1, 'tick', 0.8);
    });
    slideOut(['#val', '#rng', '#meth'], 41.85, { y: 30 });
    hid('#val', 42.4); hid('#rng', 42.4); hid('#meth', 42.4);
    // le rapport devient le téléphone
    morph(42.15, [FC3[0], FC3[1], 900 * FC3[2], 780 * FC3[2], 17], [760, 130, 400, 820, 64], 0.75, '#fff', '#0b0f1f');
    fadeOut('#fc', 42.15, 0.12);
    tl.set('#fc', { rotationY: 0 }, 42.5);
    tl.set('#ph', { left: 760, top: 130 }, 42.0);
    vis('#ph', 42.85); vis('#pvMand', 42.85);

    /* ======================================================================
       MANDAT SUR MOBILE (42,85–47,9)
       ====================================================================== */
    cap('#cH', 42.95, 47.3);
    tl.set('#chr', { visibility: 'hidden' }, 0);
    vis('#chr', 43.0); pop('#chr', 43.0, { from: 0.6 });
    const rl = 2 * Math.PI * 116;
    $('#chrRing').setAttribute('stroke-dasharray', `${rl} ${rl}`);
    drivers.push(t => {
      const p = clamp((t - 43.2) / 3.1);
      $('#chrN').textContent = `00:${String(Math.floor(p * 28)).padStart(2, '0')}`;
      $('#chrRing').setAttribute('stroke-dashoffset', (rl * (1 - p * 28 / 30)).toFixed(1));
    });
    ['#mfA', '#mfB', '#mfC'].forEach((m, i) => {
      tl.fromTo(m, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' }, 43.3 + i * 0.28);
      cue(43.3 + i * 0.28, 'tick', 0.8);
    });
    tl.fromTo('#sig', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 44.1);
    tl.fromTo('#sigp', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.95, ease: 'power1.inOut' }, 44.3);
    cue(44.3, 'scribble');
    ['#bA', '#bB', '#bC'].forEach(s => tl.set(s, { visibility: 'hidden' }, 0));
    ['#bA', '#bB'].forEach((b, i) => { vis(b, 45.25 + i * 0.3); slideIn(b, 45.25 + i * 0.3, { x: 80, y: 0 }); cue(45.25 + i * 0.3, 'notif', 1 - i * 0.2); });
    tl.fromTo('#stamp', { scale: 2.6, opacity: 0, rotation: -18 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.6)' }, 46.1);
    cue(46.1, 'stamp'); shake(46.15, 8, 0.35); bump(46.15, 0.015);
    vis('#bC', 46.4); slideIn('#bC', 46.4, { x: 80, y: 0 });
    tl.to('#chr', { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1 }, 46.3);
    slideOut(['#bA', '#bB', '#bC', '#chr'], 47.25, { x: 60, y: 0 });
    ['#bA', '#bB', '#bC', '#chr'].forEach(s => hid(s, 47.8));
    // l'écran du téléphone devient le cadre photo
    tl.to('#stamp', { opacity: 0, scale: 0.6, duration: 0.25 }, 47.25);
    fadeIn('#pvPhoto', 47.4, 0.25);
    hid('#pvMand', 47.7);
    tl.set('#fr', { visibility: 'hidden' }, 0);
    vis('#fr', 47.75);
    tl.fromTo('#fr', { left: 774, top: 144, width: 372, height: 792, borderRadius: 51 }, { left: 820, top: 160, width: 1000, height: 640, borderRadius: 30, duration: 0.85, ease: 'expo.inOut', immediateRender: false }, 47.75);
    tl.to('#ph', { scale: 1.15, opacity: 0, duration: 0.3, ease: 'power2.in' }, 47.75);
    hid('#ph', 48.1); hid('#pvPhoto', 48.1);
    tl.set('#ph', { scale: 1, opacity: 1 }, 48.15);
    cue(47.75, 'morph');

    /* ======================================================================
       VALORISATION (47,75–55,6) : 4 temps dans le même cadre
       ====================================================================== */
    const B9 = [48.6, 50.3, 52.0, 53.7, 55.25];
    cap('#cI', 48.4, 54.9);
    tl.set('#steps', { visibility: 'hidden' }, 0);
    vis('#steps', 48.6); tl.fromTo('#steps', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 48.6); slideOut('#steps', 54.9, { y: 0 });
    $$('#steps b').forEach((b, i) => tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, duration: B9[i + 1] - B9[i], ease: 'none' }, B9[i]));
    ['#ftA', '#ftB', '#ftC', '#ftD'].forEach((f, i) => {
      const t0 = i === 0 ? 48.8 : B9[i], t1 = i < 3 ? B9[i + 1] : 55.15;
      tl.set(f, { visibility: 'hidden' }, 0);
      vis(f, t0);
      tl.fromTo(`${f} .ln, ${f} .sub`, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'expo.out' }, t0);
      tl.to(`${f} .ln, ${f} .sub`, { yPercent: -50, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, t1 - 0.25);
      hid(f, t1 + 0.1);
    });
    const FW = 1000, sl = $('#sl');
    sl.style.left = `${FW}px`;
    const sweep = (layer, t0, t1, x0 = FW, x1 = 150) => drivers.push(t => {
      if (t < t0 || t > t1 + 1.2) return;
      const x = lerp(x0, x1, ez('power2.inOut', prog(t, t0, t1)));
      $(layer).style.clipPath = `inset(0 ${(FW - x).toFixed(1)}px 0 0)`;
      sl.style.left = `${x.toFixed(1)}px`;
    });
    ['#lb', '#lbd', '#lc', '#ld', '#play', '#vtl', '#hotA', '#hotB', '#deg', '#sun', '#baL', '#baR'].forEach(s => tl.set(s, { opacity: 0 }, 0));
    tl.set(['#sty', '#opt'], { visibility: 'hidden' }, 0);
    sweep('#lad', 48.9, 49.8);
    tl.to(['#baL', '#baR'], { opacity: 1, duration: 0.3 }, 48.85);
    cue(48.9, 'swipe');
    tl.to('#sun', { opacity: 1, scale: 1.1, duration: 0.8, ease: 'power2.out' }, 49.6); cue(49.7, 'sparkle');
    tl.set(['#lb', '#lbd'], { opacity: 1 }, 50.3);
    tl.fromTo(['#lb', '#lbd'], { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 50.3);
    tl.set('#sun', { opacity: 0 }, 50.6);
    sweep('#lbd', 50.95, 51.7);
    cue(50.3, 'swoosh', 0.7); cue(50.95, 'swipe');
    vis('#sty', 50.45); slideIn('#sty .stl', 50.45, { y: 20, stagger: 0.06 }); cue(50.8, 'tick');
    tl.set('#lc', { opacity: 1 }, 52.0);
    tl.fromTo('#lc', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 52.0);
    tl.to(['#sl', '#baL', '#baR'], { opacity: 0, duration: 0.2 }, 52.05);
    slideOut('#sty .stl', 52.0, { y: 20 }); hid('#sty', 52.5);
    tl.fromTo('#pano', { x: 0 }, { x: -640, duration: 2.0, ease: 'sine.inOut' }, 52.0);
    tl.to(['#hotA', '#hotB', '#deg'], { opacity: 1, duration: 0.3, stagger: 0.1 }, 52.4);
    tl.to(['#hotA', '#hotB'], { x: -330, duration: 1.4, ease: 'sine.inOut' }, 52.3);
    drivers.push(t => {
      $('#degA').setAttribute('transform', `rotate(${((t - 52) * 70).toFixed(1)} 55 55)`);
      const p = (t * 1.3) % 1;
      ['#hotA', '#hotB'].forEach(s => ($(s).style.boxShadow = `0 0 0 ${(p * 26).toFixed(1)}px rgba(255,255,255,${(0.5 * (1 - p)).toFixed(2)})`));
    });
    cue(52.0, 'swoosh', 0.7); cue(52.4, 'pop', 0.6);
    tl.set(['#ld', '#vtl', '#play'], { opacity: 1 }, 53.7);
    tl.to(['#hotA', '#hotB', '#deg'], { opacity: 0, duration: 0.2 }, 53.7);
    tl.fromTo('#ld', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 53.7);
    tl.fromTo('#vid', { scale: 1.15 }, { scale: 1, duration: 1.8, ease: 'none' }, 53.7);
    tl.fromTo('#vtl', { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' }, 53.85);
    tl.fromTo('#play', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 54.05);
    for (let i = 0; i < 140; i++) { const b = H('i', '', '', $('#wf')); b.style.height = `${(6 + 34 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.13 + 1))).toFixed(1)}px`; }
    tl.fromTo('#head', { x: 0 }, { x: 940, duration: 1.3, ease: 'none' }, 54.1);
    vis('#opt', 53.8); slideIn('#opt .stl', 53.8, { y: 20, stagger: 0.06 });
    cue(53.7, 'swoosh', 0.7); cue(54.05, 'pop');
    // le cadre devient le bouton
    slideOut('#opt .stl', 54.95, { y: 20 }); hid('#opt', 55.4);
    tl.to(['#la', '#lad', '#lb', '#lbd', '#lc', '#ld', '#vtl', '#play'], { opacity: 0, duration: 0.25 }, 55.05);
    tl.set('#fr', { backgroundColor: '#fff' }, 55.05);
    tl.to('#fr', { left: 600, top: 540, width: 720, height: 120, borderRadius: 60, duration: 0.6, ease: 'expo.inOut' }, 55.0);
    cue(55.0, 'morph');
    hid('#fr', 55.62);
    tl.set('#go', { visibility: 'hidden' }, 0);
    vis('#go', 55.6);

    /* ======================================================================
       COMMERCIALISATION (55,6–63,6)
       ====================================================================== */
    tl.fromTo('#go > *', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 55.6);
    curPath([{ t: 55.85, x: 1500, y: 1000 }, { t: 56.4, x: 1010, y: 625 }, { t: 56.85, x: 1010, y: 625 }, { t: 57.3, x: 1600, y: 1150 }]);
    click(56.5, 1010, 625);
    tl.to('#go', { scale: 0.94, duration: 0.09, yoyo: true, repeat: 1 }, 56.45);
    bgOpen(56.55, 960, 600, 0.9);
    tl.fromTo(['#wv1', '#wv2'], { scale: 0.3, opacity: 0.9 }, { scale: 4, opacity: 0, duration: 1.1, stagger: 0.18, ease: 'power2.out', immediateRender: false }, 56.6);
    cue(56.55, 'launch'); bump(56.6, 0.025);
    cap('#cJ', 56.9, 59.85);
    tl.to('#go', { scale: 0.5, duration: 0.6, ease: 'expo.inOut' }, 56.85);
    const ACTS = [['i-mail', 'Merci envoyé aux propriétaires'], ['i-lock', 'Accès extranet vendeur'], ['i-bell', 'Équipe notifiée : nouveau mandat'], ['i-sms', 'Acquéreurs relancés (email, SMS)'], ['i-calendar', 'Click & Visit activé'], ['i-share', 'Tous les portails immobiliers'], ['i-globe', 'Votre site web d’agence'], ['i-home', 'Voisins du bien informés'], ['i-video', 'Réseaux sociaux : post ou vidéo']];
    const CX = 960, CY = 600;
    ACTS.forEach(([ic, txt], i) => {
      const a = (-90 + i * 40) * Math.PI / 180, x = CX + Math.cos(a) * 640, y = CY + Math.sin(a) * 300;
      const line = svgEl('path', { d: `M${CX} ${CY} L${x.toFixed(1)} ${y.toFixed(1)}`, stroke: 'rgba(255,255,255,.45)', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }, $('#net'));
      const nd = H('div', 'node', `<span class="ibox b">${ico(ic)}</span><span>${txt}</span><span class="chk">${ico('i-check')}</span>`, $('#nodes'));
      Object.assign(nd.style, { left: `${x}px`, top: `${y}px`, visibility: 'hidden' });
      const t = 56.95 + i * 0.27;
      vis(nd, t);
      tl.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.4, ease: 'power2.out' }, t);
      tl.fromTo(nd, { x: CX - x, y: CY - y, scale: 0.2, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out' }, t);
      tl.fromTo($('.chk', nd), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.45);
      cue(t, 'pop', 0.8); cue(t + 0.45, 'tick', 0.6);
      const pl = H('i', 'pulse', '', $('#nodes'));
      drivers.push(tt => {
        const p = (((tt - t - 0.4) * 0.9) % 1 + 1) % 1, on = tt > t + 0.4 && tt < 59.85;
        pl.style.opacity = on ? Math.sin(Math.PI * p).toFixed(2) : 0;
        pl.style.transform = `translate(${lerp(CX, x, p).toFixed(1)}px, ${lerp(CY, y, p).toFixed(1)}px)`;
      });
      tl.to(nd, { x: CX - x, y: CY - y, scale: 0.1, opacity: 0, duration: 0.5, ease: 'expo.in' }, 59.85 + (8 - i) * 0.02);
      hid(nd, 60.45);
      tl.to(line, { opacity: 0, duration: 0.3 }, 59.85);
    });
    tl.to('#go', { scale: 0, opacity: 0, duration: 0.4, ease: 'back.in(2)' }, 60.1); hid('#go', 60.55);
    cue(59.85, 'suck');
    tl.set('#cup', { visibility: 'hidden' }, 0);
    vis('#cup', 60.45);
    tl.fromTo('#cup', { scale: 0, rotation: -12, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' }, 60.45);
    drivers.push(t => ['#st1', '#st2', '#st3'].forEach((s, i) => {
      const p = (t * 0.8 + i * 0.33) % 1;
      $(s).style.transform = `translateY(${(-p * 30).toFixed(1)}px)`;
      $(s).style.opacity = (Math.sin(Math.PI * p) * 0.9).toFixed(2);
    }));
    cap('#cCafe', 60.65, 61.6);
    cue(60.5, 'cafe');
    tl.to('#cup', { y: -40, opacity: 0, duration: 0.45, ease: 'power3.in' }, 61.65); hid('#cup', 62.1);
    cap('#cNext', 61.85, 63.3);
    ['#vA', '#vB', '#vC'].forEach((v, i) => {
      tl.set(v, { visibility: 'hidden' }, 0);
      vis(v, 62.1 + i * 0.3);
      tl.fromTo(v, { y: -60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 62.1 + i * 0.3);
      cue(62.1 + i * 0.3, 'notif');
    });
    // la 1re visite devient l'avis de visite ; le fond se referme dessus
    slideOut(['#vB', '#vC'], 63.3, { y: 30 }); hid('#vB', 63.8); hid('#vC', 63.8);
    bgClose(63.3, 960, 356, 0.8);
    morph(63.55, [640, 300, 640, 112, 20], [1000, 170, 800, 456, 26], 0.75);
    fadeOut('#vA', 63.55, 0.12);
    tl.set('#rv', { visibility: 'hidden' }, 0);
    fadeIn('#rv', 64.15, 0.2);

    /* ======================================================================
       RETOURS DE VISITE (64,15–68,4)
       ====================================================================== */
    cap('#cK', 64.1, 67.75);
    [['Quartier', 4.5], ['Disposition des pièces', 4], ['État général', 3.5], ['Rapport qualité / prix', 3]].forEach(([k, v], i) => {
      let st = ''; for (let s = 0; s < 5; s++) st += `<svg class="ico ${s < Math.floor(v) ? '' : 'e'}"><use href="#i-star"/></svg>`;
      const row = H('div', 'crit', `<span>${k}</span><div class="stars">${st}</div><div class="bl"><i></i></div><em>${String(v).replace('.', ',')}</em>`, $('#crit'));
      const t = 64.45 + i * 0.28;
      tl.fromTo($$('.stars .ico', row), { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: 0.4, stagger: 0.04, ease: 'back.out(3)' }, t);
      tl.fromTo($('.bl i', row), { scaleX: 0 }, { scaleX: v / 5, duration: 0.8, ease: 'expo.out' }, t + 0.1);
      tl.fromTo($('em', row), { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.3);
      cue(t, 'tick', 0.7);
    });
    drivers.push(t => { $('#rl .ico').style.transform = `rotate(${(t * 140).toFixed(0)}deg)`; });
    ['#cmA', '#cmB', '#snd'].forEach(s => tl.set(s, { visibility: 'hidden' }, 0));
    vis('#cmA', 65.6); vis('#cmB', 65.9);
    tl.fromTo('#cmA', { scale: 0.5, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: -2, duration: 0.6, ease: 'back.out(2)' }, 65.6);
    tl.fromTo('#cmB', { scale: 0.5, opacity: 0, rotation: 6 }, { scale: 1, opacity: 1, rotation: 2, duration: 0.6, ease: 'back.out(2)' }, 65.9);
    cue(65.6, 'pop'); cue(65.9, 'pop', 0.8);
    vis('#snd', 66.45); slideIn('#snd', 66.45, { y: 30 }); cue(66.45, 'notif');
    slideOut(['#cmA', '#cmB', '#snd'], 67.7, { y: 30 });
    ['#cmA', '#cmB', '#snd'].forEach(s => hid(s, 68.2));
    // l'avis devient l'annonce
    morph(67.9, [1000, 170, 800, 456, 26], [120, 380, 620, 590, 26], 0.75);
    fadeOut('#rv', 67.9, 0.12);
    tl.set('#ann', { visibility: 'hidden' }, 0);
    fadeIn('#ann', 68.5, 0.2);

    /* ======================================================================
       CLICK & VISIT (68,5–73,5)
       ====================================================================== */
    cap('#cL', 68.55, 72.75);
    curPath([{ t: 68.9, x: 900, y: 1150 }, { t: 69.35, x: 420, y: 915 }, { t: 69.65, x: 420, y: 915 }, { t: 70.1, x: 1000, y: 1150 }]);
    click(69.45, 420, 915);
    tl.to('#annB', { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 69.4);
    tl.set('#cal', { visibility: 'hidden' }, 0);
    vis('#cal', 69.55);
    tl.fromTo('#cal', { scale: 0.85, opacity: 0, x: -40 }, { scale: 1, opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', transformOrigin: '0% 80%' }, 69.55);
    cue(69.55, 'swoosh', 0.7);
    const slots = $$('#days .sl');
    tl.fromTo(slots, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.025, ease: 'back.out(2)' }, 69.8);
    slots.forEach(s => { if (!s.dataset.o) return; const o = H('i', `ov ${s.dataset.o}`, '', s); tl.to(o, { opacity: 1, duration: 0.25 }, 70.25 + R() * 0.35); });
    cue(70.25, 'scanlite');
    const pko = H('i', 'ov pk', '18:00', $('#pick'));
    tl.to(pko, { opacity: 1, duration: 0.25 }, 70.8);
    tl.fromTo('#pick', { scale: 1 }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1 }, 70.8);
    cue(70.8, 'pop');
    slideIn('#okC', 71.05, { y: 20 }); cue(71.05, 'tick');
    tl.set('#ph', { left: 1500, top: 330, scale: 0.78, transformOrigin: '0% 0%' }, 70.5);
    vis('#ph', 70.95); vis('#pvSms', 70.95);
    tl.fromTo('#ph', { x: 420, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'expo.out', immediateRender: false }, 70.95);
    slideIn('#sms', 71.4, { y: -30 }); cue(71.4, 'notif');
    slideIn('#bon', 71.85, { y: -30 }); cue(71.85, 'notif', 0.8);
    tl.to('#ph', { x: 420, opacity: 0, duration: 0.45, ease: 'power2.in' }, 72.75);
    hid('#ph', 73.25); hid('#pvSms', 73.25);
    tl.set('#ph', { x: 0, opacity: 1, scale: 1, transformOrigin: '50% 50%' }, 73.3);
    slideOut('#cal', 72.75, { x: 60, y: 0 }); hid('#cal', 73.3);
    // l'annonce devient le site web (fond violet)
    bgOpen(72.95, 430, 675, 0.85);
    morph(72.95, [120, 380, 620, 590, 26], [760, 140, 1060, 800, 22], 0.8);
    fadeOut('#ann', 72.95, 0.12);
    tl.set('#br', { visibility: 'hidden' }, 0);
    fadeIn('#br', 73.6, 0.2);

    /* ======================================================================
       SITE WEB INCLUS (73,6–78,4)
       ====================================================================== */
    cap('#cM', 73.75, 77.6);
    typewriter($('#urlT'), 'www.votre-agence.fr', 74.0, 22);
    curPath([{ t: 74.5, x: 1300, y: 1140 }, { t: 74.95, x: 820, y: 745 }, { t: 75.1, x: 820, y: 745 }, { t: 75.65, x: 820, y: 560 }, { t: 75.9, x: 820, y: 560 }, { t: 76.4, x: 1500, y: 1150 }]);
    click(75.05, 820, 745);
    tl.to('#m13c', { scale: 1.03, boxShadow: '0 24px 50px -20px rgba(20,27,51,.45)', backgroundColor: '#fff', duration: 0.2 }, 75.05);
    tl.to('#m13c', { top: 0, duration: 0.6, ease: 'power3.inOut' }, 75.1);
    tl.to('#m13a', { top: 184, duration: 0.5, ease: 'power3.inOut' }, 75.2);
    tl.to('#m13b', { top: 368, duration: 0.5, ease: 'power3.inOut' }, 75.25);
    tl.to('#m13c', { scale: 1, boxShadow: '0 0 0 0 rgba(20,27,51,0)', backgroundColor: '#F6F5FD', duration: 0.25 }, 75.7);
    cue(75.05, 'pop', 0.7); cue(75.7, 'drop', 0.6);
    tl.set(['#sws', '#seo'], { opacity: 0 }, 0);
    slideIn('#sws', 75.8, { y: 20 });
    const sw = $$('#sws i');
    tl.set(sw[0], { borderColor: '#fff' }, 0);
    [['#0F766E', 1], ['#141B33', 2], [BLUE, 0]].forEach(([c, k], j) => {
      const t = 76.15 + j * 0.42;
      tl.to('#site', { '--accent': c, duration: 0.3 }, t);
      sw.forEach((s, m) => tl.to(s, { borderColor: m === k ? '#fff' : 'rgba(255,255,255,.35)', duration: 0.2 }, t));
      cue(t, 'tick');
    });
    tl.set('#seo', { opacity: 1 }, 76.3);
    pop('#seo .tag', 76.4, { stagger: 0.09, from: 0.5 }); cue(76.4, 'pop', 0.6);
    slideOut(['#sws', '#seo'], 77.6, { y: 20 });
    // le site redevient l'application : offre d'achat
    bgClose(77.75, 1290, 540, 0.8);
    const APP2 = [760, 150, 0.8];
    morph(77.85, [760, 140, 1060, 800, 22], [APP2[0], APP2[1], 1360 * APP2[2], 820 * APP2[2], 24], 0.75);
    fadeOut('#br', 77.85, 0.12);
    tl.set('#app', { x: APP2[0] - 280, y: APP2[1] - 130, scale: APP2[2], transformOrigin: '0% 0%' }, 78.0);
    fadeIn('#app', 78.5, 0.2);
    vis('#vMand', 78.5);
    tl.set('#hiS', { y: 150 }, 78.4);

    /* ======================================================================
       OFFRE D'ACHAT (78,5–82,4)
       ====================================================================== */
    cap('#cN', 78.55, 81.9);
    tl.set('#menu', { opacity: 0 }, 0);
    const AX = v => APP2[0] + (250 + v) * APP2[2], AY = v => APP2[1] + (74 + v) * APP2[2];
    curPath([{ t: 78.8, x: 1500, y: 1150 }, { t: 79.2, x: AX(420), y: AY(177) }, { t: 79.35, x: AX(420), y: AY(177) }, { t: 79.6, x: AX(460), y: AY(300) }, { t: 79.8, x: AX(460), y: AY(300) }, { t: 80.2, x: 1700, y: 1150 }]);
    click(79.25, AX(420), AY(177));
    tl.fromTo('#menu', { scaleY: 0.4, opacity: 0, y: -20 }, { scaleY: 1, opacity: 1, y: 0, duration: 0.35, ease: 'expo.out', transformOrigin: '50% 0%' }, 79.32);
    tl.to('#menuHi', { y: 52, duration: 0.3, ease: 'power3.inOut' }, 79.45);
    click(79.7, AX(460), AY(300));
    tl.to('#menu', { opacity: 0, duration: 0.2 }, 79.85);
    tl.set('#form', { visibility: 'hidden' }, 0);
    vis('#form', 79.8);
    tl.fromTo('#form', { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 79.8);
    tl.to('#app', { opacity: 0.35, duration: 0.4 }, 79.8);
    cue(79.8, 'swoosh', 0.7);
    drivers.push(t => { $('#tmO').textContent = `0:${String(Math.floor(clamp((t - 79.9) / 1.9) * 47)).padStart(2, '0')}`; });
    [['#fA', '#fAn', '405 000 €', 80.1], ['#fB', '#fBn', '16 200 € TTC', 80.6], ['#fC', '#fCn', 'Jusqu’au 24 octobre 2026', 81.05]].forEach(([b, s, txt, t]) => {
      tl.to(b, { borderColor: BLUE, duration: 0.15 }, t);
      typewriter($(s), txt, t + 0.05, 30, { cue: false });
      cue(t + 0.05, 'typeburst', 0.7);
      tl.to(b, { borderColor: '#E6E4F5', duration: 0.2 }, t + 0.5);
    });
    tl.to('#send', { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 81.55); cue(81.55, 'click');
    tl.set('#plane', { visibility: 'hidden' }, 0);
    vis('#plane', 81.6);
    tl.fromTo('#plane', { x: 1240, y: 830, scale: 0.6, rotation: 0, opacity: 1 }, { x: 1960, y: 60, scale: 1.4, rotation: -20, duration: 0.65, ease: 'power2.in', immediateRender: false }, 81.6);
    hid('#plane', 82.3);
    cue(81.6, 'whoosh', 0.8);
    tl.to('#app', { opacity: 0, duration: 0.3 }, 81.95); hid('#app', 82.3); hid('#vMand', 82.3);
    // l'offre devient le compromis
    morph(82.0, [820, 160, 900, 760, 26], [860, 120, 640, 850, 18], 0.65);
    fadeOut('#form', 82.0, 0.12);
    tl.set('#stk', { visibility: 'hidden' }, 0);
    fadeIn('#stk', 82.55, 0.2);

    /* ======================================================================
       COMPROMIS (82,55–87)
       ====================================================================== */
    cap('#cO', 82.6, 86.25);
    tl.fromTo('#pg .sec i:not(#ax)', { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.05, ease: 'expo.out' }, 82.7);
    tl.fromTo('#pg .sec b', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.12, ease: 'expo.out' }, 82.65);
    cue(82.7, 'typeburst', 0.6);
    tl.set('#tm15', { visibility: 'hidden' }, 0);
    vis('#tm15', 82.8); slideIn('#tm15', 82.8, { x: 60, y: 0 });
    drivers.push(t => { const s = Math.floor(clamp((t - 82.9) / 3.1) * 112); $('#tmC').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; });
    const labs = $$('#att .label');
    tl.set(labs, { opacity: 0 }, 0);
    slideIn(labs, 83.4, { x: -60, y: 0, stagger: 0.07 }); cue(83.4, 'pop', 0.6);
    tl.set('#anx', { visibility: 'hidden' }, 0);
    vis('#anx', 83.8); tl.fromTo('#anx', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 83.8);
    curPath([{ t: 84.0, x: 900, y: 1150 }, { t: 84.35, x: 300, y: 912 }, { t: 84.6, x: 300, y: 912 }, { t: 85.0, x: 700, y: 1150 }]);
    click(84.45, 300, 912);
    labs.forEach((l, i) => {
      tl.to(l, { x: 1180 - 120 - 110 + rr(-30, 30), y: 860 - (450 + i * 62), scale: 0.3, opacity: 0, rotation: rr(-12, 12), duration: 0.5, ease: 'power3.in' }, 84.55 + i * 0.07);
      cue(84.85 + i * 0.07, 'tick', 0.5);
    });
    tl.to('#ax', { width: '88%', duration: 0.6, ease: 'expo.out' }, 84.95);
    tl.fromTo('#pgB', { x: 0, y: 0 }, { x: 14, y: 14, duration: 0.5, ease: 'back.out(2)' }, 84.95);
    tl.fromTo('#pgC', { x: 0, y: 0 }, { x: 28, y: 28, duration: 0.5, ease: 'back.out(2)' }, 85.1);
    tl.to('#anx', { opacity: 0, y: 20, duration: 0.3 }, 84.9); hid('#anx', 85.3);
    tl.set('#ok15', { opacity: 0 }, 0);
    pop('#ok15', 85.45, { from: 0.6 }); cue(85.45, 'notif');
    tl.set('#mob15 .tag', { opacity: 0 }, 0);
    pop('#mob15 .tag', 85.7, { stagger: 0.12, from: 0.6 }); cue(85.7, 'pop', 0.6);
    slideOut(['#tm15', '#mob15'], 86.2, { x: 60, y: 0 }); hid('#tm15', 86.7);
    // le compromis se plie dans l'enveloppe
    tl.to('#stk', { x: 960 - 1180, y: 540 - 545, scale: 0.2, rotation: -8, opacity: 0, duration: 0.55, ease: 'expo.in', transformOrigin: '50% 50%' }, 86.25);
    hid('#stk', 86.85);
    tl.set('#env', { visibility: 'hidden' }, 0);
    vis('#env', 86.6);
    tl.fromTo('#env', { scale: 0.4, rotation: -10, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, 86.65);
    cue(86.3, 'whoosh', 0.7);

    /* ======================================================================
       SRU ET NOTAIRES (86,65–91,8)
       ====================================================================== */
    cap('#cP', 86.85, 91.0);
    tl.fromTo('#flap', { scaleY: 1 }, { scaleY: -1, duration: 0.35, ease: 'power2.inOut' }, 87.35); cue(87.35, 'paper', 0.7);
    ['#wA', '#wB', '#wC', '#wD'].forEach(s => tl.set(s, { visibility: 'hidden' }, 0));
    ['#wA', '#wB'].forEach((s, i) => { vis(s, 87.3 + i * 0.1); slideIn(s, 87.3 + i * 0.1, { x: -40, y: 0 }); });
    const n16 = $('#net16');
    const link = (x0, y0, x1, y1, t, out, dur = 0.45) => {
      const mx = (x0 + x1) / 2;
      const p = svgEl('path', { d: `M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`, stroke: 'rgba(51,0,255,.35)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, n16);
      tl.fromTo(p, { drawSVG: '100% 100%' }, { drawSVG: '0% 100%', duration: dur, ease: 'power2.inOut' }, t);
      const d = dot();
      const len = p.getTotalLength();
      drivers.push(tt => {
        const q = prog(tt, t, t + dur + 0.1);
        d.style.opacity = q > 0 && q < 1 ? 1 : 0;
        const pt = p.getPointAtLength(len * (1 - ez('power2.inOut', q)));
        d.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`;
      });
      tl.to(p, { opacity: 0, duration: 0.3 }, out);
    };
    link(450, 478, 830, 540, 87.7, 88.55); link(450, 613, 830, 540, 87.75, 88.55);
    tl.fromTo(['#wA .chk', '#wB .chk'], { scale: 0 }, { scale: 1, duration: 0.35, stagger: 0.15, ease: 'back.out(3)' }, 88.2);
    cue(87.7, 'swoosh', 0.6); cue(88.2, 'notif'); cue(88.35, 'notif', 0.7);
    tl.set('#cal16 > *', { opacity: 0 }, 0);
    slideIn('#cal16 > *', 88.4, { y: 20, stagger: 0.06 });
    tl.fromTo('#cal16 .d1', { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 }, 88.8); cue(88.8, 'tick');
    tl.to('#env', { scale: 0.5, opacity: 0, duration: 0.35, ease: 'power3.in' }, 88.6); hid('#env', 89.0);
    tl.set('#fold', { visibility: 'hidden' }, 0);
    vis('#fold', 88.8);
    tl.fromTo('#fold', { y: 80, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, 88.8);
    $$('#fold .fi').forEach((f, i) => {
      tl.fromTo(f, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'expo.out' }, 89.05 + i * 0.2);
      tl.fromTo($('.chk', f), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 89.25 + i * 0.2);
      cue(89.25 + i * 0.2, 'tick', 0.7);
    });
    ['#wC', '#wD'].forEach((s, i) => { vis(s, 89.6 + i * 0.1); slideIn(s, 89.6 + i * 0.1, { x: 40, y: 0 }); });
    link(1260, 560, 1440, 398, 90.0, 91.0, 0.4); link(1260, 560, 1440, 698, 90.05, 91.0, 0.4);
    tl.fromTo(['#wC .chk', '#wD .chk'], { scale: 0 }, { scale: 1, duration: 0.35, stagger: 0.15, ease: 'back.out(3)' }, 90.45);
    cue(90.0, 'swoosh', 0.6); cue(90.45, 'notif'); cue(90.6, 'notif', 0.7);
    // tout se resserre en moyeu, le fond devient violet
    [['#wA', 120, 440], ['#wB', 120, 575], ['#wC', 1440, 360], ['#wD', 1440, 660]].forEach(([s, x, y], i) => {
      tl.to(s, { x: 960 - x - 150, y: 600 - y - 40, scale: 0.2, opacity: 0, duration: 0.5, ease: 'expo.in' }, 91.0 + i * 0.03); hid(s, 91.6);
    });
    slideOut('#cal16 > *', 91.0, { y: 20 });
    tl.to('#fold', { scale: 0.3, opacity: 0, duration: 0.5, ease: 'expo.in', transformOrigin: '46% 54%' }, 91.05); hid('#fold', 91.6);
    tl.set('#hub', { visibility: 'hidden' }, 0);
    vis('#hub', 91.35);
    tl.fromTo('#hub', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.6)' }, 91.35);
    bgOpen(91.45, 960, 600, 0.85);

    /* ======================================================================
       AUTOMATISATIONS (91,45–97,6)
       ====================================================================== */
    cap('#cQ', 91.85, 96.85);
    ['#obA', '#obB'].forEach(s => { tl.set(s, { visibility: 'hidden' }, 0); vis(s, 91.6); });
    tl.fromTo(['#obA', '#obB'], { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, stagger: 0.12, ease: 'expo.out' }, 91.6);
    drivers.push(t => { $('#obA').style.rotate = `${(t * 12).toFixed(1)}deg`; $('#obB').style.rotate = `${(-t * 8).toFixed(1)}deg`; });
    tl.set('#big', { visibility: 'hidden' }, 0);
    vis('#big', 93.0);
    tl.fromTo('#big b, #big span', { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'expo.out' }, 93.0);
    tl.to('#big', { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in' }, 96.85); hid('#big', 97.3);
    const SCN = [['i-cake', 'Fêtes et anniversaires', '« Joyeux anniversaire, Claire ! »'], ['i-news', 'Newsletters automatiques', 'Tout votre annuaire, chaque mois'],
      ['i-home', 'Voisins informés', 'Mis en vente, vendu vite : ils le savent'], ['i-calendar', 'Projets à long terme', 'Relancés aux bonnes fréquences'],
      ['i-euro', 'Relance des estimations', 'Email, SMS et tâches selon l’urgence'], ['i-users', 'Suivi des visites', 'Sans retour ? Realty relance'],
      ['i-down', 'Suivi des mandats', 'Avenant, baisse de prix : rappels'], ['i-handshake', 'Points vendeurs', 'Comptes rendus organisés'],
      ['i-key', 'Dossiers locataires', 'Pièces demandées puis analysées']];
    const POS = [[430, 420], [1490, 420], [430, 560], [1490, 560], [430, 700], [1490, 700], [430, 840], [1490, 840], [960, 975]];
    const HB = [960, 600];
    SCN.forEach(([ic, t1, t2], i) => {
      const [x, y] = POS[i];
      const ex = i === 8 ? x : (x < 960 ? x + 220 : x - 220), ey = i === 8 ? y - 48 : y, mx = (HB[0] + ex) / 2;
      const p = svgEl('path', { d: i === 8 ? `M${HB[0]} ${HB[1]} L${ex} ${ey}` : `M${HB[0]} ${HB[1]} C${mx} ${HB[1]} ${mx} ${ey} ${ex} ${ey}`, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 2.5, fill: 'none' }, $('#net17'));
      const card = H('div', 'sc', `<span class="ibox b">${ico(ic)}</span><div>${t1}<small>${t2}</small></div>`, $('#scs'));
      Object.assign(card.style, { left: `${x}px`, top: `${y}px`, visibility: 'hidden' });
      const t = 92.4 + i * 0.3;
      vis(card, t + 0.05);
      tl.fromTo(p, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.45, ease: 'power2.out' }, t);
      tl.fromTo(card, { x: HB[0] - x, y: HB[1] - y, scale: 0.15, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.7, ease: 'expo.out' }, t + 0.05);
      cue(t + 0.05, 'pop', 0.7);
      const len = p.getTotalLength();
      for (let k = 0; k < 2; k++) {
        const pl = H('i', 'pulse', '', $('#pls'));
        drivers.push(tt => {
          const q = ((((tt - t - 0.5) * 0.7 + k * 0.5) % 1) + 1) % 1, on = tt > t + 0.5 && tt < 96.9;
          pl.style.opacity = on ? Math.sin(Math.PI * q).toFixed(2) : 0;
          const pt = p.getPointAtLength(len * q);
          pl.style.transform = `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`;
        });
      }
      tl.to(card, { x: HB[0] - x, y: HB[1] - y, scale: 0.1, opacity: 0, duration: 0.45, ease: 'expo.in' }, 96.9 + (i % 3) * 0.03);
      hid(card, 97.45);
      tl.to(p, { opacity: 0, duration: 0.25 }, 96.9);
    });
    tl.to(['#obA', '#obB'], { scale: 0.2, opacity: 0, duration: 0.4, ease: 'expo.in' }, 96.9);
    ['#obA', '#obB'].forEach(s => hid(s, 97.35));
    // le moyeu devient le tableau de bord
    tl.to('#hub svg', { opacity: 0, duration: 0.2 }, 97.1);
    hid('#hub', 97.32);
    morph(97.3, [860, 500, 200, 200, 100], [APP2[0], APP2[1], 1360 * APP2[2], 820 * APP2[2], 24], 0.75);
    bgClose(97.2, 960, 600, 0.8);
    tl.set('#app', { opacity: 1 }, 97.9);
    vis('#vDash', 97.9); tl.set('#hiS', { y: 250 }, 97.9);
    fadeIn('#app', 98.0, 0.2);

    /* ======================================================================
       REPORTING (98–101,4) puis TRACFIN (101,4–104,3)
       ====================================================================== */
    cap('#cR', 98.0, 101.25);
    counter($('#k1'), 1248300, 98.2, 1.5, { suf: ' €' });
    counter($('#k2'), 186400, 98.3, 1.5, { suf: ' €' });
    counter($('#k3'), 64, 98.4, 1.4);
    counter($('#k4'), 312, 98.5, 1.4);
    cue(98.2, 'counter');
    const ch = $('#ch');
    const VAL = [38, 44, 41, 55, 62, 58, 70, 66, 78, 84, 80, 96];
    const pts = VAL.map((v, i) => [20 + i * (960 / 11), 215 - v * 2.0]);
    let dl = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2; dl += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
    const gr = svgEl('linearGradient', { id: 'gArea', x1: 0, y1: 0, x2: 0, y2: 1 }, ch);
    svgEl('stop', { offset: 0, 'stop-color': BLUE, 'stop-opacity': 0.25 }, gr); svgEl('stop', { offset: 1, 'stop-color': BLUE, 'stop-opacity': 0 }, gr);
    const area = svgEl('path', { d: `${dl} L${pts[11][0]} 225 L${pts[0][0]} 225 Z`, fill: 'url(#gArea)' }, ch);
    const lineP = svgEl('path', { d: dl, fill: 'none', stroke: BLUE, 'stroke-width': 5, 'stroke-linecap': 'round' }, ch);
    const dots = pts.map(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 7, fill: '#fff', stroke: BLUE, 'stroke-width': 4 }, ch));
    tl.fromTo(lineP, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' }, 98.4);
    tl.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 99.0);
    tl.fromTo(dots, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.3, stagger: 0.11, ease: 'back.out(3)' }, 98.45);
    cue(98.4, 'draw');
    [['JD', BLUE, 'Julie D.', 412000, 1], ['MR', PINK, 'Marc R.', 356000, 0.86], ['SL', ORANGE, 'Sofia L.', 298000, 0.72]].forEach(([ini, col, name, v, k], i) => {
      const row = H('div', 'tm', `<span class="avatar" style="background:${col}">${ini}</span><span style="width:110px">${name}</span><div class="bl"><i></i></div><em></em>`, $('#team'));
      tl.fromTo($('.bl i', row), { scaleX: 0 }, { scaleX: k, duration: 1.0, ease: 'expo.out' }, 98.8 + i * 0.12);
      counter($('em', row), v, 98.8 + i * 0.12, 1.0, { suf: ' €' });
    });
    cap('#cS', 101.45, 104.15);
    vis('#scanL', 101.7); hid('#scanL', 103.0);
    tl.fromTo('#scanL', { y: -160 }, { y: 760, duration: 1.2, ease: 'power1.inOut' }, 101.7);
    cue(101.7, 'scan');
    const APPC = [APP2[0] + 1360 * APP2[2] / 2, APP2[1] + 820 * APP2[2] / 2];
    tl.set('#shield', { left: APPC[0], top: APPC[1], visibility: 'hidden' }, 0);
    vis('#shield', 102.0);
    tl.fromTo('#shield', { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' }, 102.0);
    tl.to('#app', { opacity: 0.45, duration: 0.4 }, 102.0);
    cue(102.0, 'pop');
    tl.set('#al', { visibility: 'hidden' }, 0);
    vis('#al', 102.75);
    tl.fromTo('#al', { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 102.75);
    tl.fromTo('#al', { rotation: 0 }, { rotation: 1.2, duration: 0.06, yoyo: true, repeat: 5, ease: 'none' }, 103.3);
    cue(102.8, 'alert');
    tl.to(['#shield', '#al'], { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' }, 104.1);
    hid('#shield', 104.45); hid('#al', 104.45);

    /* ======================================================================
       FORMATION LOI ALUR (104,3–107,2) : le tableau de bord devient le téléphone
       ====================================================================== */
    tl.to('#app', { opacity: 0, duration: 0.15 }, 104.25); hid('#app', 104.4); hid('#vDash', 104.4);
    const PH3 = [1250, 130];
    morph(104.25, [APP2[0], APP2[1], 1360 * APP2[2], 820 * APP2[2], 24], [PH3[0], PH3[1], 400, 820, 64], 0.75, '#fff', '#0b0f1f');
    bgOpen(104.45, PH3[0] + 200, 540, 0.85);
    tl.set('#ph', { left: PH3[0], top: PH3[1], x: 0, y: 0, scale: 1, opacity: 1 }, 104.3);
    vis('#ph', 104.95); vis('#pvAlur', 104.95);
    cap('#cT', 104.75, 107.05);
    const ra = 2 * Math.PI * 112;
    $('#ringAc').setAttribute('stroke-dasharray', `${ra} ${ra}`);
    drivers.push(t => {
      const p = ez('expo.out', prog(t, 105.1, 106.5)) * (11 / 14);
      $('#ringAc').setAttribute('stroke-dashoffset', (ra * (1 - p)).toFixed(1));
      $('#ringAn').textContent = `${Math.round(p * 14)} h`;
    });
    cue(105.1, 'counter', 0.7);
    $$('#pvAlur .m20').forEach((m, i) => { slideIn(m, 105.2 + i * 0.15, { x: 40, y: 0 }); tl.fromTo($('.chk', m), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 105.6 + i * 0.15); cue(105.6 + i * 0.15, 'tick', 0.6); });

    /* ======================================================================
       FIN (107,2–114) : le fond violet se referme en logo
       ====================================================================== */
    tl.to('#ph', { x: 960 - PH3[0] - 200, y: 355 - PH3[1] - 410, scale: 0.15, opacity: 0, duration: 0.7, ease: 'expo.in' }, 107.1);
    hid('#ph', 107.85); hid('#pvAlur', 107.85);
    bgClose(107.2, 960, 355, 0.8);
    cue(107.95, 'final');
    tl.set('#gEnd', { visibility: 'hidden' }, 0);
    vis('#gEnd', 107.9);
    const EK = { x: 529, y: 255, s: 200 };
    const ex = EK.x + EK.s * 461 / 371, ey = EK.y + EK.s * 95 / 371, eh = EK.s * 257 / 371, ew = eh * 1139 / 257;
    Object.assign($('#eIc').style, { left: `${EK.x}px`, top: `${EK.y}px`, width: `${EK.s}px`, height: `${EK.s}px` });
    Object.assign($('#eWm').style, { left: `${ex}px`, top: `${ey}px`, width: `${ew + 4}px`, height: `${eh + 2}px` });
    Object.assign($('#eWmi').style, { width: `${ew}px`, height: `${eh}px` });
    tl.fromTo('#eIc', { x: 960 - EK.s / 2 - EK.x, scale: 0.3, rotation: 30 }, { scale: 1.15, rotation: 0, duration: 0.8, ease: 'expo.out', transformOrigin: '50% 50%' }, 107.9);
    tl.fromTo('#eRed', { x: 160, y: -160 }, { x: 0, y: 0, duration: 0.8, ease: 'expo.out' }, 107.9);
    tl.fromTo('#eBlue', { x: -160, y: 160 }, { x: 0, y: 0, duration: 0.8, ease: 'expo.out' }, 107.9);
    tl.to('#eIc', { x: 0, scale: 1, duration: 0.9, ease: 'expo.inOut' }, 108.55);
    tl.fromTo('#eWmi', { x: -ew - 40 }, { x: 0, duration: 0.9, ease: 'expo.out' }, 108.95);
    tl.fromTo('#endTl', { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 109.3);
    badge($('#eB'), 109.8, 0.6);
    tl.fromTo('#endSl', { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 110.15);
    cue(109.3, 'title', 0.7);
    tl.set('#cta', { visibility: 'hidden' }, 0);
    vis('#cta', 110.6);
    tl.fromTo('#cta', { scale: 0.4, opacity: 0, xPercent: -50 }, { scale: 1, opacity: 1, xPercent: -50, duration: 0.8, ease: 'back.out(2)' }, 110.6);
    cue(110.6, 'pop');
    tl.set('#url', { visibility: 'hidden' }, 0);
    vis('#url', 110.9);
    tl.fromTo('#url', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 110.9);
    tl.fromTo('#world', { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 113.4);
  },
});
