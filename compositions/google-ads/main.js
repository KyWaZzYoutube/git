/* ==========================================================================
   Première Immo — « Google Ads immobilier » (30 s · 1920×1080)

   Récit (grille musicale 120 BPM, 1 temps = 0,5 s) :
   A  0,0–3,6   Un propriétaire veut vendre : il cherche sur Google
   B  3,6–7,6   « Votre agence » passe en tête, devant concurrents et portails
   C  7,6–11,6  Clic → les contacts vendeurs arrivent
   D 11,6–16,0  RDV d'estimation → mandat signé
   E 16,0–19,0  Plus de mandats, plus de chiffre d'affaires
   F 19,0–23,6  Concrètement, on s'occupe de tout
   P 23,6–26,0  Première Immo en chiffres
   G 26,0–30,0  Votre secteur est-il encore disponible ? → appel découverte
   ========================================================================== */
MotionEngine.run({
  duration: 30,
  fonts: ['800 100px "Plus Jakarta Sans Variable"', '700 40px "Plus Jakarta Sans Variable"',
          '600 40px "Plus Jakarta Sans Variable"', '500 40px "Plus Jakarta Sans Variable"'],
  build(E) {
    const { tl, cue, rise, sink, fadeUp, show, hide, $, $$, splitWords, measure, drivers,
            typewriter, counter, shake, bump, camera, ez, prog, svgEl, rel } = E;
    const ORANGE = '#FF5100', BORDER = '#EAEAEA';
    camera($('#bump'));

    /* ---------- colonnes de texte (sur-titre, titre, sous-titre) ---------- */
    const col = sel => ({ eyebrow: $(`${sel} .eyebrow`), lines: $$(`${sel} .h .ln`), sub: $(`${sel} .sub`) });
    function colIn(sel, t) {
      const c = col(sel);
      rise(c.eyebrow, t, { dur: 0.7 });
      rise(c.lines, t + 0.06, { stagger: 0.1, dur: 0.95 });
      tl.fromTo(c.sub, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, t + 0.32);
    }
    function colOut(sel, t) {
      const c = col(sel);
      sink([c.eyebrow, ...c.lines], t, { stagger: 0.03, dur: 0.3 });
      tl.to(c.sub, { opacity: 0, y: -24, duration: 0.3, ease: 'power2.in' }, t);
    }

    /* ================= A : la recherche (0 → 3,6 s) ================= */
    gsap.set('#light', { visibility: 'visible' });
    rise('#aEyebrow', 0.1, { dur: 0.7 });
    const a1 = splitWords($('#aL1')), a2 = splitWords($('#aL2'));
    rise(a1, 0.2, { stagger: 0.06 });
    rise(a2, 0.46, { stagger: 0.06 });

    gsap.set('#search', { x: 370, y: 650, scale: 1, transformOrigin: '0 0' });
    tl.fromTo('#search', { opacity: 0, y: 700 }, { opacity: 1, y: 650, duration: 0.9 }, 0.8);
    typewriter($('#typed'), 'estimation maison', 1.3, 18);
    tl.fromTo('#city', { maxWidth: 0, scale: 0.4, opacity: 0 }, { maxWidth: 360, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' }, 2.32);
    cue(2.32, 'pop');
    const caret = $('#caret');
    drivers.push(t => {
      const on = t >= 1.0 && t < 2.32;
      caret.style.opacity = on ? ((t >= 1.3 && t <= 2.28) ? 1 : (Math.floor(t * 2.4) % 2 ? 0 : 1)) : 0;
      caret.style.display = t < 2.32 ? 'inline-block' : 'none';
    });
    tl.to('.pill', { scale: 0.985, duration: 0.08, ease: 'power2.out' }, 2.8).to('.pill', { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 2.88);
    cue(2.8, 'click');
    sink(['#aEyebrow', ...a1, ...a2], 2.86, { stagger: 0.012, dur: 0.38 });
    // la barre de recherche rejoint la maquette Google
    tl.to('#search', { x: 1080, y: 214, scale: 640 / 1180, duration: 0.85, ease: 'expo.inOut' }, 3.0);
    cue(3.0, 'whoosh', 0.7);
    tl.fromTo('#panel', { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.7 }, 3.2);
    tl.fromTo('#serp', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.65 }, 3.22);
    const glow = $('#glowO');
    drivers.push(t => { glow.style.translate = `${(Math.sin(t * 0.5) * 40).toFixed(1)}px ${(Math.cos(t * 0.4) * 30).toFixed(1)}px`; });

    /* ================= B : position n°1 (3,6 → 7,6 s) ================= */
    colIn('#colB', 3.62);
    const SL = [140, 326, 512];
    gsap.set('#resC1', { top: SL[0] }); gsap.set('#resC2', { top: SL[1] }); gsap.set('#resMe', { top: SL[2], zIndex: 3 });
    tl.fromTo(['#resC1', '#resC2', '#resMe'], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 4.0);
    [4.0, 4.1, 4.2].forEach(t => cue(t, 'pop', 0.35));
    gsap.set('#sponso', { maxWidth: 0 });
    tl.to('#resMe', { top: SL[0], duration: 0.72, ease: 'io' }, 4.8);
    tl.to('#resC1', { top: SL[1], duration: 0.72, ease: 'io' }, 4.8);
    tl.to('#resC2', { top: SL[2], duration: 0.72, ease: 'io' }, 4.8);
    tl.to('#resMe', { x: 22, duration: 0.36, ease: 'power2.out' }, 4.8).to('#resMe', { x: 0, duration: 0.36, ease: 'power2.in' }, 5.16);
    cue(4.8, 'swoosh');
    tl.to('#resMe', { boxShadow: '0 34px 70px -34px rgba(255,81,0,0.55)', duration: 0.6 }, 5.2);
    tl.to('#sponso', { maxWidth: 240, duration: 0.6 }, 5.25);
    tl.fromTo('#adBorder rect', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, 5.2);
    tl.fromTo('#badge', { scale: 0, rotation: -14 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.6)' }, 5.55);
    cue(5.55, 'gold');
    tl.to(['#resC1', '#resC2'], { opacity: 0.45, duration: 0.6 }, 5.45);
    const ring = $('#badgeRing');
    drivers.push(t => {   // piPulse du site
      const p = t < 6.0 ? -1 : ((t - 6.0) % 2.2) / 2.2;
      ring.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 16).toFixed(1)}px rgba(255,81,0,${(0.45 * (1 - p)).toFixed(3)})`;
    });

    // le propriétaire clique sur l'annonce
    measure(7.0, () => rel($('#adTitle')), r => {
      const tx = r.x + 150, ty = r.y + r.h * 0.55;
      tl.fromTo('#cursor', { opacity: 0, x: 1760, y: 1010 }, { opacity: 1, x: tx, y: ty, duration: 0.75 }, 6.45);
      tl.to('#cursor', { scale: 0.82, duration: 0.08, ease: 'power2.out', transformOrigin: '18% 9%' }, 7.25)
        .to('#cursor', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, 7.33);
      gsap.set('#ripple', { left: tx + 12, top: ty + 6 });
      tl.fromTo('#ripple', { scale: 0.2, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, 7.27);
      gsap.set('#ripple', { opacity: 0 });
      tl.to('#cursor', { opacity: 0, duration: 0.25 }, 7.7);
    });
    cue(7.27, 'click');

    /* ================= C : les contacts arrivent (7,6 → 11,6 s) ================= */
    colOut('#colB', 7.45);
    colIn('#colC', 7.76);
    tl.to(['#serp', '#search'], { y: '+=70', opacity: 0, duration: 0.5, ease: 'power3.in' }, 7.55);
    cue(7.55, 'whoosh', 0.6);
    gsap.set(['#toast1', '#cal', '#doc'], { visibility: 'hidden' });
    measure(7.55, () => ({ ad: rel($('#resMe')), panel: rel($('#panel')) }), m => {
      show('#toast1', 7.55);
      tl.fromTo('#toast1',
        { left: m.ad.x - m.panel.x, top: m.ad.y - m.panel.y, width: m.ad.w, height: m.ad.h, rotation: 0, borderRadius: 30, borderColor: ORANGE, borderWidth: 4 },
        { left: 80, top: 250, width: 660, height: 132, rotation: -2, borderRadius: 32, borderColor: BORDER, borderWidth: 2, duration: 0.8, ease: 'io', immediateRender: false }, 7.55);
    });
    tl.fromTo('#toast1 .toast-in', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 8.08);
    cue(8.08, 'notif');
    gsap.set('#toast2', { left: 110, top: 420 }); gsap.set('#toast3', { left: 70, top: 590 });
    tl.fromTo('#toast2', { opacity: 0, y: -50, rotation: 7 }, { opacity: 1, y: 0, rotation: 1.5, duration: 0.75, ease: 'back.out(1.6)' }, 8.6);
    cue(8.6, 'notif');
    tl.fromTo('#toast3', { opacity: 0, y: -50, rotation: -6 }, { opacity: 1, y: 0, rotation: -1, duration: 0.75, ease: 'back.out(1.6)' }, 9.1);
    cue(9.1, 'notif');
    tl.fromTo('#chipNew', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 9.6);
    cue(9.6, 'pop', 0.6);
    const dot = $('#chipDot');
    drivers.push(t => {
      const p = t < 9.9 ? -1 : ((t - 9.9) % 1.2) / 1.2;
      dot.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 10).toFixed(1)}px rgba(255,81,0,${(0.4 * (1 - p)).toFixed(3)})`;
    });
    const toasts = ['#toast1', '#toast2', '#toast3'].map(s => $(s));
    drivers.push(t => {   // piFloat du site
      toasts.forEach((el, i) => { el.style.translate = `0px ${(Math.sin(t * 1.9 + i * 1.7) * 5).toFixed(2)}px`; });
    });

    /* ================= D : RDV puis mandat signé (11,6 → 16 s) ================= */
    colOut('#colC', 11.45);
    colIn('#colD', 11.76);
    tl.to(['#toast2', '#toast3'], { x: 180, opacity: 0, duration: 0.5, ease: 'power3.in', stagger: 0.06 }, 11.45);
    tl.to('#chipNew', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 11.45);
    tl.to('#toast1 .toast-in', { opacity: 0, duration: 0.15, ease: 'none' }, 11.5);
    show('#cal', 11.65); hide('#toast1', 11.65);
    tl.fromTo('#cal', { left: 80, top: 250, width: 660, height: 132, rotation: -2 },
      { left: 80, top: 120, width: 660, height: 392, rotation: 0, duration: 0.8, ease: 'io', immediateRender: false }, 11.65);
    cue(11.65, 'swoosh', 0.7);
    tl.fromTo('#calIn', { opacity: 0 }, { opacity: 1, duration: 0.45 }, 12.0);
    tl.fromTo('#dayOn', { backgroundColor: '#F7F7F7', color: '#5E5E5E', scale: 1 },
      { backgroundColor: ORANGE, color: 'rgba(255,255,255,0.85)', scale: 1.08, duration: 0.3, ease: 'power2.out' }, 12.4)
      .to('#dayOn', { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 12.7);
    tl.fromTo('#dayOn b', { color: '#171717' }, { color: '#FFFFFF', duration: 0.3 }, 12.4);
    cue(12.4, 'tick');
    tl.fromTo('#calIn .slot', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 }, 12.5);

    show('#doc', 12.75);
    tl.fromTo('#doc', { top: 1040, rotation: 14 }, { top: 330, rotation: 4, duration: 0.9, immediateRender: false }, 12.75);
    cue(12.75, 'swoosh', 0.8);
    tl.fromTo('#sig1', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.75, ease: 'power1.inOut' }, 13.5);
    tl.fromTo('#sig2', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.22, ease: 'power2.out' }, 14.27);
    cue(13.5, 'scribble');
    gsap.set('#stamp', { left: 236, top: 296 });
    tl.fromTo('#stamp', { scale: 2.4, opacity: 0, rotation: -32 }, { scale: 1, opacity: 1, rotation: -12, duration: 0.26, ease: 'power4.in' }, 14.55);
    tl.to('#stamp', { scale: 1.06, duration: 0.07, ease: 'power2.out' }, 14.81).to('#stamp', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, 14.88);
    shake(14.82, 9, 0.4);
    cue(14.81, 'stamp');

    // le tampon s'ouvre en plein écran orange
    show('#money', 16.0); hide('#light', 16.0);
    cue(15.5, 'riser_short');
    measure(15.55, () => rel($('#stamp')), s => {
      const R = Math.hypot(Math.max(s.cx, 1920 - s.cx), Math.max(s.cy, 1080 - s.cy)) + 30;
      gsap.set('#wipe', { left: s.cx, top: s.cy });
      show('#wipe', 15.55);
      tl.fromTo('#wipe', { scale: s.w / 200 }, { scale: (2 * R) / 200, duration: 0.45, ease: 'expo.in', immediateRender: false }, 15.55);
      hide('#wipe', 16.0);
    });

    /* ================= E : chiffre d'affaires (16 → 19 s) ================= */
    const m1 = splitWords($('#mL1')), m2 = splitWords($('#mL2'));
    rise(m1, 16.0, { stagger: 0.07 });
    rise(m2, 16.16, { stagger: 0.07 });
    bump(16.0, 0.012);
    cue(16.0, 'hit');
    const H = [150, 205, 185, 255, 300, 285, 360, 450];
    const barsBox = $('#bars');
    const bars = H.map((h, i) => {
      const b = document.createElement('i');
      b.style.height = h + 'px';
      b.style.background = `rgba(255,255,255,${(0.32 + 0.68 * (i / (H.length - 1)) ** 1.6).toFixed(2)})`;
      barsBox.appendChild(b);
      return b;
    });
    tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 1.0, stagger: 0.07, ease: 'expo.out' }, 16.32);
    bars.forEach((b, i) => cue(16.32 + i * 0.07, 'blip', 0.3 + 0.05 * i));
    measure(18.3, () => bars.map(b => rel(b)), rs => {
      const pts = rs.map(r => [r.cx, r.y - 46]);
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
      const [lx, ly] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
      const ang = Math.atan2(ly - py, lx - px), a = 26;
      $('#trendPath').setAttribute('d', d);
      $('#trendHead').setAttribute('d', `M ${lx - a * Math.cos(ang - 0.6)} ${ly - a * Math.sin(ang - 0.6)} L ${lx} ${ly} L ${lx - a * Math.cos(ang + 0.6)} ${ly - a * Math.sin(ang + 0.6)}`);
      // (opacité nulle tant que le tracé n'a pas commencé : sinon l'extrémité arrondie laisse un point)
      gsap.set(['#trendPath', '#trendHead'], { opacity: 0 });
      tl.set('#trendPath', { opacity: 1 }, 16.95);
      tl.fromTo('#trendPath', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.0, ease: 'power2.inOut', immediateRender: false }, 16.95);
      tl.set('#trendHead', { opacity: 1 }, 17.88);
      tl.fromTo('#trendHead', { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.3, ease: 'power2.out', immediateRender: false }, 17.88);
      gsap.set('#mTag', { left: lx - 330, top: ly - 120 });
      tl.fromTo('#mTag', { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 17.75);
    });
    cue(16.95, 'zip', 0.7); cue(17.75, 'pop', 0.7);
    tl.fromTo('#camM', { scale: 1.06 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 16.0);

    /* ================= F : on s'occupe de tout (19 → 23,6 s) ================= */
    show('#dark', 18.55);
    tl.fromTo('#dark', { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 18.55);
    tl.to('#money', { yPercent: -22, duration: 0.5, ease: 'expo.inOut' }, 18.55);
    hide('#money', 19.06);
    cue(18.55, 'whoosh', 0.8);
    rise('#dark .eyebrow', 18.92, { dur: 0.7 });
    rise('#dH', 19.0, { dur: 0.95 });
    tl.fromTo('#dSub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 19.3);
    const cards = $$('#dark .card');
    tl.fromTo(cards, { opacity: 0, y: 60, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.25 }, 19.6);
    cards.forEach((c, i) => cue(19.6 + i * 0.25, 'pop', 0.45));
    tl.fromTo('#dark .card-n', { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, stagger: 0.25, ease: 'back.out(2.4)' }, 19.75);
    tl.fromTo('#dark .chip-d', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.14 }, 21.75);
    [21.75, 21.89, 22.03].forEach(t => cue(t, 'tick', 0.5));
    tl.fromTo('#camD', { scale: 1 }, { scale: 1.025, duration: 4.6, ease: 'none' }, 19.0);

    /* ================= P : en chiffres (23,6 → 26 s) ================= */
    show('#proof', 23.15);
    tl.fromTo('#proof', { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'expo.inOut', immediateRender: false }, 23.15);
    tl.to('#dark', { yPercent: -22, duration: 0.5, ease: 'expo.inOut' }, 23.15);
    hide('#dark', 23.66);
    cue(23.15, 'whoosh', 0.8);
    rise('#proof .eyebrow', 23.5, { dur: 0.7 });
    rise('#pH', 23.56, { dur: 0.9 });
    tl.fromTo('#proof .stat', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 23.7);
    counter($('#n1'), 500, 23.75, 1.1, { pre: '+' });
    counter($('#n2'), 8000, 23.87, 1.2, { pre: '+' });
    counter($('#n3'), 300, 23.99, 1.1, { pre: '+' });
    cue(23.75, 'counter');
    tl.to(['#proof .p-head', '#proof .stats'], { y: -60, opacity: 0, duration: 0.42, ease: 'power3.in', stagger: 0.05 }, 25.55);

    /* ================= G : appel à l'action (26 → 30 s) ================= */
    show('#cta', 25.95); hide('#proof', 26.0);
    tl.fromTo('#logoIcon', { scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.95, ease: 'back.out(2)' }, 26.0);
    tl.fromTo('#logoWordBox', { width: 0 }, { width: 270, duration: 0.8, ease: 'io' }, 26.18);
    cue(26.0, 'logo');
    bump(26.0, 0.01);
    const g1 = splitWords($('#gL1')), g2 = splitWords($('#gL2'));
    rise(g1, 26.36, { stagger: 0.06 });
    rise(g2, 26.52, { stagger: 0.06 });
    tl.fromTo('#gSub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 26.95);
    gsap.set('#btn', { xPercent: -50 });
    tl.fromTo('#btn', { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85 }, 27.2);
    tl.fromTo('#btnArrow', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.5)' }, 27.5);
    cue(27.2, 'swoosh', 0.5); cue(27.5, 'pop', 0.6);
    tl.fromTo('#reassure', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 27.7);
    tl.fromTo('#url', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 27.9);
    tl.fromTo('#camG', { scale: 1.04 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 26.0);
    tl.to('#camG', { scale: 1.015, duration: 2.4, ease: 'none' }, 27.6);
    // vie du bouton : pulsation (piPulse) + flèche qui avance
    const btnRing = $('#btnRing'), arrow = $('#btnArrow');
    drivers.push(t => {
      const p = t < 28.2 ? -1 : ((t - 28.2) % 1.6) / 1.6;
      btnRing.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 22).toFixed(1)}px rgba(255,81,0,${(0.42 * (1 - p)).toFixed(3)})`;
      const n = t > 28.4 ? Math.max(0, Math.sin((t - 28.4) * Math.PI * 1.25)) ** 6 * 8 : 0;
      arrow.style.translate = `${n.toFixed(2)}px 0px`;
    });
    // « secteur » : ondes concentriques discrètes derrière le titre
    const radar = $('#radar');
    const rings = [0, 1, 2, 3].map(() => { const i = document.createElement('i'); radar.appendChild(i); return i; });
    drivers.push(t => {
      rings.forEach((r, k) => {
        const p = t < 26 ? -1 : (((t - 26) / 3.2 + k / 4) % 1);
        const R = 200 + p * 900;
        r.style.width = r.style.height = `${(2 * R).toFixed(0)}px`;
        r.style.marginLeft = r.style.marginTop = `${(-R).toFixed(0)}px`;
        r.style.opacity = p < 0 ? 0 : (Math.sin(Math.PI * p) * Math.min(1, (t - 26) / 0.8)).toFixed(3);
      });
    });
  },
});
