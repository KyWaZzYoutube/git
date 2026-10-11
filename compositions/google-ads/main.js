/* ==========================================================================
   Première Immo — « Google Ads immobilier » (32 s · 1920×1080)

   Récit (grille musicale 120 BPM, 1 temps = 0,5 s) :
   A  0,0–3,6   Un propriétaire veut vendre : il cherche sur Google
   B  3,6–9,6   « estimation maison » puis « agence immobilière » + votre ville :
                les deux fois, « Votre agence » passe en tête devant les concurrents
   C  9,6–13,6  Clic → les contacts vendeurs arrivent
   D 13,6–18,0  RDV d'estimation → mandat signé
   E 18,0–21,0  Plus de mandats, plus de chiffre d'affaires
   F 21,0–25,6  Concrètement, on s'occupe de tout (les 4 leviers du site)
   P 25,6–28,0  Première Immo en chiffres
   G 28,0–32,0  Votre secteur est-il encore disponible ? → appel découverte
   ========================================================================== */
MotionEngine.run({
  duration: 32,
  fonts: ['800 100px "Plus Jakarta Sans Variable"', '700 40px "Plus Jakarta Sans Variable"',
          '600 40px "Plus Jakarta Sans Variable"', '500 40px "Plus Jakarta Sans Variable"'],
  build(E) {
    const { tl, cue, rise, sink, show, hide, $, $$, splitWords, measure, drivers,
            counter, shake, bump, camera, clamp, rel } = E;
    const ORANGE = '#FF5100', BORDER = '#EAEAEA';
    // début de chaque scène (les temps internes sont relatifs à ces ancres)
    const B2 = 6.0, C = 9.6, D = 13.6, EE = 18.0, F = 21.0, P = 25.6, G = 28.0;
    camera($('#bump'));

    /* ---------- colonnes de texte (sur-titre, titre, sous-titre) ---------- */
    const col = sel => ({ eyebrow: $(`${sel} .eyebrow`), lines: $$(`${sel} .h .ln`), sub: $$(`${sel} .sub, ${sel} .queries`) });
    function colIn(sel, t) {
      const c = col(sel);
      rise(c.eyebrow, t, { dur: 0.7 });
      rise(c.lines, t + 0.06, { stagger: 0.1, dur: 0.95 });
      tl.fromTo(c.sub[0], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, t + 0.32);
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

    // texte de la recherche : 1re requête, effacement, 2e requête (déterministe)
    const Q1 = 'estimation maison', Q2 = 'agence immobilière';
    const T1 = 1.3, CPS1 = 18, BS = B2 + 0.02, BS_CPS = 60, T2 = B2 + 0.36, CPS2 = 26;
    const typed = $('#typed');
    drivers.push(t => {
      let s;
      if (t < BS) s = Q1.slice(0, clamp(Math.floor((t - T1) * CPS1), 0, Q1.length));
      else if (t < T2) s = Q1.slice(0, Math.max(0, Q1.length - Math.floor((t - BS) * BS_CPS)));
      else s = Q2.slice(0, clamp(Math.floor((t - T2) * CPS2), 0, Q2.length));
      if (typed.textContent !== s) typed.textContent = s;
    });
    for (let i = 0; i < Q1.length; i++) if (Q1[i] !== ' ') cue(T1 + i / CPS1, 'type', 0.5 + 0.25 * ((i * 7) % 3) / 2);
    for (let i = 0; i < 4; i++) cue(BS + i * 0.07, 'type', 0.3);
    for (let i = 0; i < Q2.length; i++) if (Q2[i] !== ' ') cue(T2 + i / CPS2, 'type', 0.5 + 0.25 * ((i * 5) % 3) / 2);
    const caret = $('#caret');
    drivers.push(t => {
      const typing = (t >= T1 && t <= 2.28) || (t >= BS && t <= T2 + Q2.length / CPS2 + 0.05);
      const on = (t >= 1.0 && t < 2.32) || (t >= B2 - 0.05 && t < B2 + 1.15);
      caret.style.opacity = on ? (typing ? 1 : (Math.floor(t * 2.4) % 2 ? 0 : 1)) : 0;
    });

    tl.fromTo('#city', { maxWidth: 0, scale: 0.4, opacity: 0 }, { maxWidth: 360, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' }, 2.32);
    cue(2.32, 'pop');
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

    /* ================= B : position n°1 sur les deux recherches (3,6 → 9,6 s) ================= */
    colIn('#colB', 3.62);
    const SL = [140, 326, 512];
    gsap.set('#resC1', { top: SL[0] }); gsap.set('#resC2', { top: SL[1] }); gsap.set('#resMe', { top: SL[2], zIndex: 3 });
    tl.fromTo(['#resC1', '#resC2', '#resMe'], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 4.0);
    [4.0, 4.1, 4.2].forEach(t => cue(t, 'pop', 0.35));
    gsap.set('#sponso', { maxWidth: 0 });

    // 1re recherche : « estimation maison » — votre agence remonte devant le concurrent et le portail
    function climb(t0) {
      tl.to('#resMe', { top: SL[0], duration: 0.72, ease: 'io' }, t0);
      tl.to('#resMe', { x: 22, duration: 0.36, ease: 'power2.out' }, t0).to('#resMe', { x: 0, duration: 0.36, ease: 'power2.in' }, t0 + 0.36);
      tl.to('#resMe', { boxShadow: '0 34px 70px -34px rgba(255,81,0,0.55)', duration: 0.6 }, t0 + 0.4);
      tl.fromTo('#adBorder rect', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.75, ease: 'power2.inOut', immediateRender: false }, t0 + 0.38);
      tl.fromTo('#badge', { scale: 0, rotation: -14 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.6)', immediateRender: false }, t0 + 0.72);
      cue(t0, 'swoosh'); cue(t0 + 0.72, 'gold');
    }
    gsap.set('#badge', { scale: 0 }); gsap.set('#adBorder rect', { drawSVG: '0%' });
    tl.to('#resC1', { top: SL[1], duration: 0.72, ease: 'io' }, 4.8);
    tl.to('#resC2', { top: SL[2], duration: 0.72, ease: 'io' }, 4.8);
    climb(4.8);
    tl.to('#sponso', { maxWidth: 240, duration: 0.6 }, 5.25);
    tl.to(['#resC1', '#resC2'], { opacity: 0.45, duration: 0.6 }, 5.45);

    // pastilles des requêtes (colonne de gauche), cochées « N°1 » au fil de la démonstration
    tl.fromTo('#q1', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 4.05);
    tl.fromTo('#q1ok', { maxWidth: 0 }, { maxWidth: 160, duration: 0.5, ease: 'back.out(1.6)' }, 5.6);
    tl.to('#q1', { borderColor: BORDER, duration: 0.3 }, B2);
    tl.fromTo('#q2', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, B2);
    cue(B2, 'pop', 0.4);

    // 2e recherche : « agence immobilière » — les résultats se rechargent, votre agence remonte encore
    tl.to('.pill', { scale: 0.985, duration: 0.08, ease: 'power2.out' }, B2 + 1.12).to('.pill', { scale: 1, duration: 0.4, ease: 'back.out(3)' }, B2 + 1.2);
    cue(B2 + 1.12, 'click');
    const R2 = B2 + 1.34;   // instant où la nouvelle page de résultats remplace l'ancienne
    tl.to(['#resC1', '#resC2', '#resMe'], { opacity: 0, y: 16, duration: 0.16, ease: 'power2.in' }, B2 + 1.16);
    tl.set('#resC1', { top: SL[0] }, R2); tl.set('#resMe', { top: SL[1], boxShadow: '0 0px 0px 0px rgba(255,81,0,0)' }, R2); tl.set('#resC2', { top: SL[2] }, R2);
    tl.set('#badge', { scale: 0 }, R2);
    tl.set('#adBorder rect', { drawSVG: '0%' }, R2);
    tl.fromTo(['#resC1', '#resMe', '#resC2'], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, immediateRender: false }, R2 + 0.01);
    cue(R2, 'pop', 0.3);
    tl.to('#resC1', { top: SL[1], duration: 0.72, ease: 'io' }, B2 + 1.78);
    climb(B2 + 1.78);
    tl.to(['#resC1', '#resC2'], { opacity: 0.45, duration: 0.5 }, B2 + 2.3);
    tl.fromTo('#q2ok', { maxWidth: 0 }, { maxWidth: 160, duration: 0.5, ease: 'back.out(1.6)' }, B2 + 2.5);
    // contenus des résultats propres à chaque requête
    const swap = (sel, a, b) => { const el = $(sel); drivers.push(t => { const v = t < R2 ? a : b; if (el.textContent !== v) el.textContent = v; }); };
    swap('#adTitle', 'Estimation offerte en 48 h | Votre agence', 'Agence immobilière à votre ville | Votre agence');
    swap('#adText', 'Agence locale, experte de votre quartier. Rendez-vous en ligne.', 'Estimation offerte sous 48 h. Agence locale, experte de votre quartier.');
    swap('#c2Url', 'www.portail-annonces.fr', 'www.reseau-national.fr');
    swap('#c2Title', 'Estimation et annonces — votre ville', 'Réseau immobilier — votre ville');
    swap('#c2Tag', 'Portail', 'Concurrent');

    const ring = $('#badgeRing');
    drivers.push(t => {   // piPulse du site
      const t0 = t < R2 ? 6.0 : B2 + 2.9;
      const p = t < t0 ? -1 : ((t - t0) % 2.2) / 2.2;
      ring.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 16).toFixed(1)}px rgba(255,81,0,${(0.45 * (1 - p)).toFixed(3)})`;
    });

    // le propriétaire clique sur l'annonce
    measure(C - 0.6, () => rel($('#adTitle')), r => {
      const tx = r.x + 150, ty = r.y + r.h * 0.55;
      tl.fromTo('#cursor', { opacity: 0, x: 1720, y: 980 }, { opacity: 1, x: tx, y: ty, duration: 0.45 }, C - 0.8);
      tl.to('#cursor', { scale: 0.82, duration: 0.08, ease: 'power2.out', transformOrigin: '18% 9%' }, C - 0.35)
        .to('#cursor', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, C - 0.27);
      gsap.set('#ripple', { left: tx + 12, top: ty + 6 });
      tl.fromTo('#ripple', { scale: 0.2, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, C - 0.33);
      gsap.set('#ripple', { opacity: 0 });
      tl.to('#cursor', { opacity: 0, duration: 0.25 }, C + 0.1);
    });
    cue(C - 0.33, 'click');

    /* ================= C : les contacts arrivent (9,6 → 13,6 s) ================= */
    colOut('#colB', C - 0.15);
    colIn('#colC', C + 0.16);
    tl.to(['#serp', '#search'], { y: '+=70', opacity: 0, duration: 0.5, ease: 'power3.in' }, C - 0.05);
    cue(C - 0.05, 'whoosh', 0.6);
    gsap.set(['#toast1', '#cal', '#doc'], { visibility: 'hidden' });
    measure(C - 0.05, () => ({ ad: rel($('#resMe')), panel: rel($('#panel')) }), m => {
      show('#toast1', C - 0.05);
      tl.fromTo('#toast1',
        { left: m.ad.x - m.panel.x, top: m.ad.y - m.panel.y, width: m.ad.w, height: m.ad.h, rotation: 0, borderRadius: 30, borderColor: ORANGE, borderWidth: 4 },
        { left: 80, top: 250, width: 660, height: 132, rotation: -2, borderRadius: 32, borderColor: BORDER, borderWidth: 2, duration: 0.8, ease: 'io', immediateRender: false }, C - 0.05);
    });
    tl.fromTo('#toast1 .toast-in', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, C + 0.48);
    cue(C + 0.48, 'notif');
    gsap.set('#toast2', { left: 110, top: 420 }); gsap.set('#toast3', { left: 70, top: 590 });
    tl.fromTo('#toast2', { opacity: 0, y: -50, rotation: 7 }, { opacity: 1, y: 0, rotation: 1.5, duration: 0.75, ease: 'back.out(1.6)' }, C + 1.0);
    cue(C + 1.0, 'notif');
    tl.fromTo('#toast3', { opacity: 0, y: -50, rotation: -6 }, { opacity: 1, y: 0, rotation: -1, duration: 0.75, ease: 'back.out(1.6)' }, C + 1.5);
    cue(C + 1.5, 'notif');
    tl.fromTo('#chipNew', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, C + 2.0);
    cue(C + 2.0, 'pop', 0.6);
    const dot = $('#chipDot');
    drivers.push(t => {
      const p = t < C + 2.3 ? -1 : ((t - C - 2.3) % 1.2) / 1.2;
      dot.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 10).toFixed(1)}px rgba(255,81,0,${(0.4 * (1 - p)).toFixed(3)})`;
    });
    const toasts = ['#toast1', '#toast2', '#toast3'].map(s => $(s));
    drivers.push(t => {   // piFloat du site
      toasts.forEach((el, i) => { el.style.translate = `0px ${(Math.sin(t * 1.9 + i * 1.7) * 5).toFixed(2)}px`; });
    });

    /* ================= D : RDV puis mandat signé (13,6 → 18 s) ================= */
    colOut('#colC', D - 0.15);
    colIn('#colD', D + 0.16);
    tl.to(['#toast2', '#toast3'], { x: 180, opacity: 0, duration: 0.5, ease: 'power3.in', stagger: 0.06 }, D - 0.15);
    tl.to('#chipNew', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, D - 0.15);
    tl.to('#toast1 .toast-in', { opacity: 0, duration: 0.15, ease: 'none' }, D - 0.1);
    show('#cal', D + 0.05); hide('#toast1', D + 0.05);
    tl.fromTo('#cal', { left: 80, top: 250, width: 660, height: 132, rotation: -2 },
      { left: 80, top: 120, width: 660, height: 392, rotation: 0, duration: 0.8, ease: 'io', immediateRender: false }, D + 0.05);
    cue(D + 0.05, 'swoosh', 0.7);
    tl.fromTo('#calIn', { opacity: 0 }, { opacity: 1, duration: 0.45 }, D + 0.4);
    tl.fromTo('#dayOn', { backgroundColor: '#F7F7F7', color: '#5E5E5E', scale: 1 },
      { backgroundColor: ORANGE, color: 'rgba(255,255,255,0.85)', scale: 1.08, duration: 0.3, ease: 'power2.out' }, D + 0.8)
      .to('#dayOn', { scale: 1, duration: 0.4, ease: 'back.out(3)' }, D + 1.1);
    tl.fromTo('#dayOn b', { color: '#171717' }, { color: '#FFFFFF', duration: 0.3 }, D + 0.8);
    cue(D + 0.8, 'tick');
    tl.fromTo('#calIn .slot', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 }, D + 0.9);

    show('#doc', D + 1.15);
    tl.fromTo('#doc', { top: 1040, rotation: 14 }, { top: 330, rotation: 4, duration: 0.9, immediateRender: false }, D + 1.15);
    cue(D + 1.15, 'swoosh', 0.8);
    tl.fromTo('#sig1', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.75, ease: 'power1.inOut' }, D + 1.9);
    tl.fromTo('#sig2', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.22, ease: 'power2.out' }, D + 2.67);
    cue(D + 1.9, 'scribble');
    gsap.set('#stamp', { left: 236, top: 296 });
    tl.fromTo('#stamp', { scale: 2.4, opacity: 0, rotation: -32 }, { scale: 1, opacity: 1, rotation: -12, duration: 0.26, ease: 'power4.in' }, D + 2.95);
    tl.to('#stamp', { scale: 1.06, duration: 0.07, ease: 'power2.out' }, D + 3.21).to('#stamp', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, D + 3.28);
    shake(D + 3.22, 9, 0.4);
    cue(D + 3.21, 'stamp');

    // le tampon s'ouvre en plein écran orange
    show('#money', EE); hide('#light', EE);
    cue(EE - 0.5, 'riser_short');
    measure(EE - 0.45, () => rel($('#stamp')), s => {
      const R = Math.hypot(Math.max(s.cx, 1920 - s.cx), Math.max(s.cy, 1080 - s.cy)) + 30;
      gsap.set('#wipe', { left: s.cx, top: s.cy });
      show('#wipe', EE - 0.45);
      tl.fromTo('#wipe', { scale: s.w / 200 }, { scale: (2 * R) / 200, duration: 0.45, ease: 'expo.in', immediateRender: false }, EE - 0.45);
      hide('#wipe', EE);
    });

    /* ================= E : chiffre d'affaires (18 → 21 s) ================= */
    const m1 = splitWords($('#mL1')), m2 = splitWords($('#mL2'));
    rise(m1, EE, { stagger: 0.07 });
    rise(m2, EE + 0.16, { stagger: 0.07 });
    bump(EE, 0.012);
    cue(EE, 'hit');
    const H = [150, 205, 185, 255, 300, 285, 360, 450];
    const barsBox = $('#bars');
    const bars = H.map((h, i) => {
      const b = document.createElement('i');
      b.style.height = h + 'px';
      b.style.background = `rgba(255,255,255,${(0.32 + 0.68 * (i / (H.length - 1)) ** 1.6).toFixed(2)})`;
      barsBox.appendChild(b);
      return b;
    });
    tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 1.0, stagger: 0.07, ease: 'expo.out' }, EE + 0.32);
    bars.forEach((b, i) => cue(EE + 0.32 + i * 0.07, 'blip', 0.3 + 0.05 * i));
    measure(EE + 2.3, () => bars.map(b => rel(b)), rs => {
      const pts = rs.map(r => [r.cx, r.y - 46]);
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
      const [lx, ly] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
      const ang = Math.atan2(ly - py, lx - px), a = 26;
      $('#trendPath').setAttribute('d', d);
      $('#trendHead').setAttribute('d', `M ${lx - a * Math.cos(ang - 0.6)} ${ly - a * Math.sin(ang - 0.6)} L ${lx} ${ly} L ${lx - a * Math.cos(ang + 0.6)} ${ly - a * Math.sin(ang + 0.6)}`);
      // (opacité nulle tant que le tracé n'a pas commencé : sinon l'extrémité arrondie laisse un point)
      gsap.set(['#trendPath', '#trendHead'], { opacity: 0 });
      tl.set('#trendPath', { opacity: 1 }, EE + 0.95);
      tl.fromTo('#trendPath', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.0, ease: 'power2.inOut', immediateRender: false }, EE + 0.95);
      tl.set('#trendHead', { opacity: 1 }, EE + 1.88);
      tl.fromTo('#trendHead', { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.3, ease: 'power2.out', immediateRender: false }, EE + 1.88);
      gsap.set('#mTag', { left: lx - 330, top: ly - 120 });
      tl.fromTo('#mTag', { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, EE + 1.75);
    });
    cue(EE + 0.95, 'zip', 0.7); cue(EE + 1.75, 'pop', 0.7);
    tl.fromTo('#camM', { scale: 1.06 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, EE);

    /* ================= F : on s'occupe de tout (21 → 25,6 s) ================= */
    show('#dark', F - 0.45);
    tl.fromTo('#dark', { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'expo.inOut', immediateRender: false }, F - 0.45);
    tl.to('#money', { yPercent: -22, duration: 0.5, ease: 'expo.inOut' }, F - 0.45);
    hide('#money', F + 0.06);
    cue(F - 0.45, 'whoosh', 0.8);
    rise('#dark .eyebrow', F - 0.08, { dur: 0.7 });
    rise('#dH', F, { dur: 0.95 });
    tl.fromTo('#dSub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, F + 0.3);
    const cards = $$('#dark .card');
    tl.fromTo(cards, { opacity: 0, y: 60, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.25 }, F + 0.6);
    cards.forEach((c, i) => cue(F + 0.6 + i * 0.25, 'pop', 0.45));
    tl.fromTo('#dark .card-n', { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, stagger: 0.25, ease: 'back.out(2.4)' }, F + 0.75);
    tl.fromTo('#dark .chip-d', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.14 }, F + 2.75);
    [0, 0.14, 0.28].forEach(d => cue(F + 2.75 + d, 'tick', 0.5));
    tl.fromTo('#camD', { scale: 1 }, { scale: 1.025, duration: 4.6, ease: 'none' }, F);

    /* ================= P : en chiffres (25,6 → 28 s) ================= */
    show('#proof', P - 0.45);
    tl.fromTo('#proof', { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'expo.inOut', immediateRender: false }, P - 0.45);
    tl.to('#dark', { yPercent: -22, duration: 0.5, ease: 'expo.inOut' }, P - 0.45);
    hide('#dark', P + 0.06);
    cue(P - 0.45, 'whoosh', 0.8);
    rise('#proof .eyebrow', P - 0.1, { dur: 0.7 });
    rise('#pH', P - 0.04, { dur: 0.9 });
    tl.fromTo('#proof .stat', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, P + 0.1);
    counter($('#n1'), 500, P + 0.15, 1.1, { pre: '+' });
    counter($('#n2'), 8000, P + 0.27, 1.2, { pre: '+' });
    counter($('#n3'), 300, P + 0.39, 1.1, { pre: '+' });
    cue(P + 0.15, 'counter');
    tl.to(['#proof .p-head', '#proof .stats'], { y: -60, opacity: 0, duration: 0.42, ease: 'power3.in', stagger: 0.05 }, P + 1.95);

    /* ================= G : appel à l'action (28 → 32 s) ================= */
    show('#cta', G - 0.05); hide('#proof', G);
    tl.fromTo('#logoIcon', { scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.95, ease: 'back.out(2)' }, G);
    tl.fromTo('#logoWordBox', { width: 0 }, { width: 270, duration: 0.8, ease: 'io' }, G + 0.18);
    cue(G, 'logo');
    bump(G, 0.01);
    const g1 = splitWords($('#gL1')), g2 = splitWords($('#gL2'));
    rise(g1, G + 0.36, { stagger: 0.06 });
    rise(g2, G + 0.52, { stagger: 0.06 });
    tl.fromTo('#gSub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, G + 0.95);
    gsap.set('#btn', { xPercent: -50 });
    tl.fromTo('#btn', { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85 }, G + 1.2);
    tl.fromTo('#btnArrow', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.5)' }, G + 1.5);
    cue(G + 1.2, 'swoosh', 0.5); cue(G + 1.5, 'pop', 0.6);
    tl.fromTo('#reassure', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, G + 1.7);
    tl.fromTo('#url', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, G + 1.9);
    tl.fromTo('#camG', { scale: 1.04 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, G);
    tl.to('#camG', { scale: 1.015, duration: 2.4, ease: 'none' }, G + 1.6);
    // vie du bouton : pulsation (piPulse) + flèche qui avance
    const btnRing = $('#btnRing'), arrow = $('#btnArrow');
    drivers.push(t => {
      const p = t < G + 2.2 ? -1 : ((t - G - 2.2) % 1.6) / 1.6;
      btnRing.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 22).toFixed(1)}px rgba(255,81,0,${(0.42 * (1 - p)).toFixed(3)})`;
      const n = t > G + 2.4 ? Math.max(0, Math.sin((t - G - 2.4) * Math.PI * 1.25)) ** 6 * 8 : 0;
      arrow.style.translate = `${n.toFixed(2)}px 0px`;
    });
    // « secteur » : ondes concentriques discrètes derrière le titre
    const radar = $('#radar');
    const rings = [0, 1, 2, 3].map(() => { const i = document.createElement('i'); radar.appendChild(i); return i; });
    drivers.push(t => {
      rings.forEach((r, k) => {
        const p = t < G ? -1 : (((t - G) / 3.2 + k / 4) % 1);
        const R = 200 + p * 900;
        r.style.width = r.style.height = `${(2 * R).toFixed(0)}px`;
        r.style.marginLeft = r.style.marginTop = `${(-R).toFixed(0)}px`;
        r.style.opacity = p < 0 ? 0 : (Math.sin(Math.PI * p) * Math.min(1, (t - G) / 0.8)).toFixed(3);
      });
    });
  },
});
