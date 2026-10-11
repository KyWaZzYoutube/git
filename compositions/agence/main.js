/* ==========================================================================
   Première Immo — « Agence de publicité immobilière » (36 s · 1920×1080)

   Récit (grille musicale 120 BPM, 1 temps = 0,5 s) :
   A   0,0–6,0   Pige, portails, flyers : ça ne suffit plus (bento « Pourquoi maintenant »)
   B   6,0–10,0  Première Immo : les vendeurs de votre secteur vous contactent
   C  10,0–22,0  Nos leviers : Google Ads (10 s), Facebook et Instagram (14 s), référencement naturel (18 s)
   D  22,0–26,0  Résultats : +8 000 contacts qualifiés générés
   M  26,0–30,0  Méthode : on s'occupe de tout, en ligne sous 72 h
   F  30,0–36,0  Votre secteur est-il encore disponible ? → appel de découverte
   ========================================================================== */
MotionEngine.run({
  duration: 36,
  fonts: ['800 100px "Plus Jakarta Sans Variable"', '700 40px "Plus Jakarta Sans Variable"',
          '600 40px "Plus Jakarta Sans Variable"', '500 40px "Plus Jakarta Sans Variable"'],
  build(E) {
    const { tl, cue, rise, show, hide, $, $$, measure, drivers, counter, typewriter, shake, bump, camera, rel, ez, prog, svgEl } = E;
    const ORANGE = '#FF5100', MUTED = '#62615E';
    // début de chaque partie (les temps internes sont relatifs à ces ancres)
    const B = 6.0, C = 10.0, C2 = 14.0, C3 = 18.0, D = 22.0, M = 26.0, F = 30.0;
    camera($('#bump'));

    /* Découpe en mots sur les espaces simples : les espaces insécables restent dans le mot (« flyers : »). */
    function words(root) {
      const out = [];
      const walk = node => {
        for (const child of Array.from(node.childNodes)) {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/( +)/).forEach(part => {
              if (!part) return;
              if (/^ +$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const s = document.createElement('span');
              s.className = 'wd'; s.textContent = part;
              frag.appendChild(s); out.push(s);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === 1 && child.namespaceURI !== 'http://www.w3.org/2000/svg') walk(child);
        }
      };
      walk(root);
      return out;
    }
    const float = (el, amp, speed, phase) => drivers.push(t => {
      el.style.translate = `0px ${(Math.sin(t * speed + phase) * amp).toFixed(2)}px`;
    });
    /* Anneaux décoratifs du bandeau orange : dérive lente (propriétés CSS séparées, cumulées avec GSAP). */
    const drift = (el, t0, vx, vy, vs) => drivers.push(t => {
      const d = Math.max(0, t - t0);
      el.style.translate = `${(d * vx).toFixed(1)}px ${(d * vy).toFixed(1)}px`;
      el.style.scale = (1 + d * vs).toFixed(4);
    });
    /* Passage à la scène suivante : la nouvelle monte, l'ancienne recule (comme le défilement de la page). */
    function slide(from, to, t, dur = 0.5) {
      show(to, t - dur);
      tl.fromTo(to, { yPercent: 100 }, { yPercent: 0, duration: dur, ease: 'expo.inOut', immediateRender: false }, t - dur);
      tl.to(from, { yPercent: -22, duration: dur, ease: 'expo.inOut' }, t - dur);
      hide(from, t + 0.06);
      cue(t - dur, 'whoosh', 0.8);
    }

    /* ================= A : pige, portails, flyers… ça ne suffit plus (0 → 6 s) ================= */
    gsap.set('#sA', { visibility: 'visible' });
    rise('#aKick', 0.1, { dur: 0.7 });
    const aw1 = words($('#aL1')), aw2 = words($('#aL2'));
    rise(aw1, 0.2, { stagger: 0.06 });
    rise(aw2, 0.48, { stagger: 0.06 });
    const cards = $$('.ac');
    tl.fromTo(cards, { opacity: 0, y: 110, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.14, ease: 'back.out(1.3)' }, 0.85);
    cards.forEach((c, i) => cue(0.85 + i * 0.14, 'pop', 0.45));
    tl.fromTo('.ac-ic', { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, stagger: 0.14, ease: 'back.out(2.4)' }, 1.05);
    // chaque canal historique est barré, au moment où la voix le nomme (« interdite », « portails », « flyers »)
    const NO = [1.95, 3.45, 4.1];
    cards.forEach((c, i) => {
      const t = NO[i];
      tl.fromTo($('.ac-x', c), { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.6)' }, t);
      tl.to($('.ac-in', c), { opacity: 0.34, duration: 0.4, ease: 'power2.out' }, t + 0.05);
      tl.fromTo(c, { x: -16 }, { x: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.3)', immediateRender: false }, t);
      shake(t + 0.01, 3, 0.25);
      cue(t, 'deny');
    });
    // la solution arrive par le bas
    const SOL = 4.45;
    tl.fromTo('#aSol', { y: 330 }, { y: 0, duration: 0.85, ease: 'back.out(1.2)' }, SOL);
    tl.fromTo('#aSolIn > *', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, SOL + 0.22);
    cue(SOL, 'swoosh', 0.6);
    tl.fromTo('#camA', { scale: 1 }, { scale: 1.03, duration: B, ease: 'none' }, 0);
    // … et s'ouvre en plein écran orange
    const EXP = 5.4;
    tl.to('#aSolIn', { opacity: 0, duration: 0.2, ease: 'power1.in' }, EXP);
    tl.to('#aSol', { left: 0, top: 0, width: 1920, height: 1080, borderRadius: 0, duration: 0.6, ease: 'expo.inOut' }, EXP);
    tl.to(['.a-head', '.a-cards'], { scale: 0.94, duration: 0.6, ease: 'expo.inOut' }, EXP);
    cue(EXP, 'riser_short');

    /* ================= B : Première Immo, les vendeurs vous contactent (6 → 10 s) ================= */
    show('#sB', B); hide('#sA', B);
    tl.fromTo('#bGlow', { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.out' }, B);
    tl.fromTo(['#bRing1', '#bRing2'], { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, B);
    drift($('#bRing1'), B, 9, -6, 0.012); drift($('#bRing2'), B, -8, 7, 0.015);
    tl.fromTo('#bLogo', { scale: 0.3, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(2)' }, B + 0.05);
    cue(B, 'hit'); cue(B + 0.05, 'logo', 0.8);
    bump(B, 0.012);
    rise('#bKick', B + 0.3, { dur: 0.7 });
    const bw1 = words($('#bL1')), bw2 = words($('#bL2'));
    rise(bw1, B + 0.42, { stagger: 0.06 });
    rise(bw2, B + 0.62, { stagger: 0.06 });
    const chips = $$('.b-chip');
    tl.fromTo(chips, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' }, B + 1.5);
    chips.forEach((c, i) => cue(B + 1.5 + i * 0.1, 'tick', 0.5));
    tl.fromTo('#camB', { scale: 1.05 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, B);
    tl.to('#camB', { scale: 1.02, duration: 2.6, ease: 'none' }, B + 1.4);

    /* ================= C : nos leviers, un onglet par levier (10 → 22 s) ================= */
    slide('#sB', '#sC', C);
    rise('#cKick', C - 0.15, { dur: 0.7 });
    rise(words($('#cTitle')), C - 0.05, { stagger: 0.05 });
    tl.fromTo('#camC', { scale: 1 }, { scale: 1.02, duration: D - C, ease: 'none' }, C);
    const glowC = $('#glowC');
    drivers.push(t => { glowC.style.translate = `${(Math.sin(t * 0.5) * 40).toFixed(1)}px ${(Math.cos(t * 0.4) * 30).toFixed(1)}px`; });
    // onglets : la pastille orange glisse d'un levier à l'autre
    const tabs = $$('.tab'), tab0 = tabs[0];
    gsap.set('#tabInd', { left: tab0.offsetLeft, top: tab0.offsetTop, width: tab0.offsetWidth, height: tab0.offsetHeight });
    gsap.set(tabs, { color: MUTED }); gsap.set(tab0, { color: '#FFFFFF' });
    function tab(k, t) {
      tl.to('#tabInd', { x: tabs[k].offsetLeft - tab0.offsetLeft, width: tabs[k].offsetWidth, duration: 0.55, ease: 'expo.inOut' }, t);
      tabs.forEach((e, j) => tl.to(e, { color: j === k ? '#FFFFFF' : MUTED, duration: 0.3 }, t + 0.12));
      cue(t, 'tab');
    }
    // texte du levier : sortie vers le haut, entrée par le bas
    function textIn(sel, t) {
      const el = $(sel);
      show(el, t);
      rise($('.cp-name', el), t);
      tl.fromTo([$('.cp-n', el), $('.cp-hook', el), $('.cp-desc', el)], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, t);
    }
    function textOut(sel, t) {
      tl.to(`${sel} > *`, { opacity: 0, y: -26, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, t);
      hide(sel, t + 0.4);
    }
    gsap.set(['#cpt2', '#cpt3'], { visibility: 'hidden' });
    textIn('#cpt1', C + 0.05);
    // maquettes : glissement latéral de l'une à l'autre
    gsap.set(['#mockF', '#mockS'], { xPercent: 100 });
    function mockSwap(a, b, t) {
      tl.to(a, { xPercent: -100, duration: 0.6, ease: 'expo.inOut' }, t);
      tl.fromTo(b, { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: 'expo.inOut', immediateRender: false }, t);
    }

    // --- 1. Google Ads : le propriétaire cherche, votre agence passe en tête ---
    const TQ = C + 0.2;
    const qEnd = typewriter($('#gQ'), 'estimation maison', TQ, 34);
    tl.fromTo('.g-city', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.4)' }, qEnd + 0.02);
    cue(qEnd + 0.02, 'pop', 0.4);
    const SLOT = [160, 298, 436];
    gsap.set('#gr1', { y: SLOT[0] }); gsap.set('#gr2', { y: SLOT[1] }); gsap.set('#grMe', { y: SLOT[2], zIndex: 2 });
    tl.fromTo(['#gr1', '#gr2', '#grMe'], { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.55, stagger: 0.1 }, qEnd + 0.1);
    const CL = C + 1.35;   // « vous êtes en tête »
    tl.to('#grMe', { y: SLOT[0], duration: 0.7, ease: 'expo.inOut' }, CL);
    tl.to('#gr1', { y: SLOT[1], duration: 0.7, ease: 'expo.inOut' }, CL + 0.04);
    tl.to('#gr2', { y: SLOT[2], duration: 0.7, ease: 'expo.inOut' }, CL + 0.08);
    tl.to('#grMe', { scale: 1.045, boxShadow: '0 40px 70px -34px rgba(255,81,0,0.55)', duration: 0.35, ease: 'power2.out' }, CL)
      .to('#grMe', { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, CL + 0.55);
    tl.to(['#gr1', '#gr2'], { opacity: 0.55, duration: 0.4 }, CL + 0.5);
    cue(CL, 'swoosh', 0.5);
    gsap.set('#gRing rect', { drawSVG: '0%' }); gsap.set('#gRing', { opacity: 0 });
    tl.set('#gRing', { opacity: 1 }, CL + 0.6);
    tl.fromTo('#gRing rect', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.65, ease: 'power2.inOut', immediateRender: false }, CL + 0.6);
    tl.fromTo('#gBadge', { scale: 0, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(2.6)' }, CL + 0.8);
    cue(CL + 0.8, 'gold', 0.8);

    // --- 2. Facebook et Instagram : votre publicité dans le fil des propriétaires ---
    tab(1, C2 - 0.1);
    textOut('#cpt1', C2 - 0.1); textIn('#cpt2', C2 + 0.22);
    mockSwap('#mockG', '#mockF', C2 - 0.1);
    cue(C2 - 0.1, 'swipe', 0.6);
    tl.fromTo('#mPhone', { y: 90, rotation: 5 }, { y: 0, rotation: 0, duration: 1.0, immediateRender: false }, C2 - 0.05);
    float($('#mPhone'), 6, 1.3, 0);
    const TO = C2 + 2.2;   // « il vous voit avant même de chercher »
    tl.fromTo('#fToast', { opacity: 0, x: -40, scale: 0.85 }, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, TO);
    cue(TO, 'notif');
    float($('#fToast'), 5, 1.8, 2.0);

    // --- 3. Référencement naturel : la courbe des visites monte, durablement ---
    tab(2, C3 - 0.1);
    textOut('#cpt2', C3 - 0.1); textIn('#cpt3', C3 + 0.22);
    mockSwap('#mockF', '#mockS', C3 - 0.1);
    cue(C3 - 0.1, 'swipe', 0.6);
    const PTS = [[0, 238], [112, 222], [224, 208], [336, 166], [448, 116], [560, 50]];
    let dPath = `M${PTS[0][0]} ${PTS[0][1]}`;
    for (let i = 0; i < PTS.length - 1; i++) {   // Catmull-Rom → Bézier
      const p0 = PTS[Math.max(0, i - 1)], p1 = PTS[i], p2 = PTS[i + 1], p3 = PTS[Math.min(PTS.length - 1, i + 2)];
      dPath += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}`
             + ` ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    const sLine = $('#sLine'), sArea = $('#sArea'), sDot = $('#sDot'), chart = $('#sChart');
    sLine.setAttribute('d', dPath);
    sArea.setAttribute('d', `${dPath} L560 268 L0 268 Z`);
    const clipR = svgEl('rect', { x: -20, y: -40, width: 0, height: 340 }, svgEl('clipPath', { id: 'sClip' }, svgEl('defs', {}, chart)));
    sArea.setAttribute('clip-path', 'url(#sClip)');
    const sPulse = svgEl('circle', { r: 9, class: 's-pulse' });
    chart.insertBefore(sPulse, sDot);
    const LEN = sLine.getTotalLength(), S0 = C3 + 0.45, SD = 1.9;
    sLine.style.strokeDasharray = `${LEN} ${LEN}`;
    drivers.push(t => {
      const p = ez('power1.inOut', prog(t, S0, S0 + SD));
      sLine.style.strokeDashoffset = (LEN * (1 - p)).toFixed(2);
      sLine.style.opacity = p > 0 ? 1 : 0;   // sinon l'extrémité arrondie laisse un point
      const pt = sLine.getPointAtLength(LEN * p);
      sDot.setAttribute('cx', pt.x.toFixed(1)); sDot.setAttribute('cy', pt.y.toFixed(1));
      sPulse.setAttribute('cx', pt.x.toFixed(1)); sPulse.setAttribute('cy', pt.y.toFixed(1));
      clipR.setAttribute('width', (pt.x + 20).toFixed(1));
      const q = t < S0 + SD ? -1 : ((t - S0 - SD) % 1.3) / 1.3;
      sPulse.setAttribute('r', q < 0 ? 9 : (9 + q * 24).toFixed(1));
      sPulse.style.opacity = q < 0 ? 0 : (0.6 * (1 - q)).toFixed(3);
    });
    tl.fromTo(sDot, { attr: { r: 0 } }, { attr: { r: 9 }, duration: 0.4, ease: 'back.out(3)' }, S0 - 0.15);
    cue(S0, 'zip', 0.5);
    tl.fromTo('.s-tag', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, S0 + SD - 0.1);
    cue(S0 + SD - 0.1, 'gold', 0.7);

    /* ================= D : résultats (22 → 26 s) ================= */
    slide('#sC', '#sD', D);
    rise('#dKick', D - 0.15, { dur: 0.7 });
    tl.fromTo('#dN', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.8)' }, D + 0.05);
    counter($('#dN'), 8000, D + 0.1, 1.7, { pre: '+' });
    cue(D + 0.1, 'counter', 0.8);
    tl.fromTo('#dL', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7 }, D + 0.35);
    tl.to('#dN', { scale: 1.06, duration: 0.14, ease: 'power2.out' }, D + 1.75).to('#dN', { scale: 1, duration: 0.45, ease: 'back.out(3)' }, D + 1.89);
    cue(D + 1.75, 'gold', 0.6);
    // les contacts arrivent de tous les leviers
    ['#dt1', '#dt2', '#dt3'].forEach((s, i) => {
      const t = D + 0.5 + i * 0.4;
      tl.fromTo(s, { opacity: 0, scale: 0.8, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.8)' }, t);
      cue(t, 'notif', 0.5);
      float($(s), 6, 1.5 + i * 0.2, i * 1.7);
    });
    tl.fromTo('.d-stat', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, D + 1.9);
    counter($('#dS1'), 500, D + 1.95, 1.2, { pre: '+' });
    counter($('#dS2'), 300, D + 2.07, 1.2, { pre: '+' });
    counter($('#dS3'), 4, D + 2.19, 0.9, { pre: '+' });
    [0, 0.12, 0.24].forEach(d => cue(D + 1.9 + d, 'tick', 0.5));
    tl.fromTo('#camD', { scale: 1.04 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, D);
    tl.to('#camD', { scale: 1.02, duration: 2.6, ease: 'none' }, D + 1.4);

    /* ================= M : méthode, on s'occupe de tout (26 → 30 s) ================= */
    slide('#sD', '#sE', M);
    rise('#eKick', M - 0.15, { dur: 0.7 });
    rise(words($('#eTitle')), M - 0.05, { stagger: 0.06 });
    tl.fromTo('#eSub', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7 }, M + 0.3);
    tl.fromTo('.p-s', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, M + 0.2);
    tl.fromTo('#pTrack', { opacity: 0 }, { opacity: 1, duration: 0.5 }, M + 0.3);
    const P0 = M + 0.8, PD = 2.6;   // l'étape « Sous 72 h » s'allume sur « soixante-douze heures »
    tl.fromTo('#pFill', { scaleX: 0 }, { scaleX: 1, duration: PD, ease: 'none' }, P0);
    $$('.p-dot').forEach((d, i) => {
      const t = P0 + PD * i / 4;
      tl.to(d, { backgroundColor: ORANGE, color: '#FFFFFF', duration: 0.25, ease: 'power1.out' }, t);
      tl.to(d, { scale: 1.12, duration: 0.12, ease: 'power2.out' }, t).to(d, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t + 0.12);
      cue(t, 'step', 0.6);
    });
    tl.fromTo('.e-chip', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, M + 2.0);
    [0, 0.12, 0.24].forEach(d => cue(M + 2.0 + d, 'tick', 0.5));
    tl.fromTo('#camE', { scale: 1 }, { scale: 1.025, duration: F - M, ease: 'none' }, M);

    // la dernière étape s'ouvre en plein écran orange
    show('#sF', F); hide('#sE', F);
    cue(F - 0.5, 'riser_short');
    measure(F - 0.45, () => rel($('#pLast')), s => {
      const Rw = Math.hypot(Math.max(s.cx, 1920 - s.cx), Math.max(s.cy, 1080 - s.cy)) + 30;
      gsap.set('#wipe', { left: s.cx, top: s.cy });
      show('#wipe', F - 0.45);
      tl.fromTo('#wipe', { scale: (s.w * 1.2) / 200 }, { scale: (2 * Rw) / 200, duration: 0.45, ease: 'expo.in', immediateRender: false }, F - 0.45);
      hide('#wipe', F);
    });

    /* ================= F : appel à l'action (30 → 36 s) ================= */
    tl.fromTo('#fLogo', { scale: 0.3, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(2)' }, F);
    tl.fromTo('#fLogoBox', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'io' }, F + 0.2);
    cue(F, 'hit'); cue(F + 0.05, 'logo');
    bump(F, 0.01);
    tl.fromTo(['#fRing1', '#fRing2'], { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, F);
    drift($('#fRing1'), F, 8, -5, 0.01); drift($('#fRing2'), F, -7, 6, 0.012);
    rise(words($('#fL1')), F + 0.3, { stagger: 0.06 });
    rise(words($('#fL2')), F + 0.46, { stagger: 0.06 });
    tl.fromTo('#fSub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, F + 0.9);
    gsap.set('#fBtn', { xPercent: -50 });
    tl.fromTo('#fBtn', { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85 }, F + 1.2);
    tl.fromTo('#fArrow', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.5)' }, F + 1.5);
    cue(F + 1.2, 'swoosh', 0.5); cue(F + 1.5, 'pop', 0.6);
    tl.fromTo('#fReassure', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, F + 1.7);
    tl.fromTo('#fUrl', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, F + 1.9);
    tl.fromTo('#camF', { scale: 1.04 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, F);
    tl.to('#camF', { scale: 1.015, duration: 4.4, ease: 'none' }, F + 1.6);
    // vie du bouton : pulsation blanche + flèche qui avance
    const btnRing = $('#fBtnRing'), arrow = $('#fArrow');
    drivers.push(t => {
      const p = t < F + 2.2 ? -1 : ((t - F - 2.2) % 1.6) / 1.6;
      btnRing.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 24).toFixed(1)}px rgba(255,255,255,${(0.5 * (1 - p)).toFixed(3)})`;
      const k = t > F + 2.4 ? Math.max(0, Math.sin((t - F - 2.4) * Math.PI * 1.25)) ** 6 * 8 : 0;
      arrow.style.translate = `${k.toFixed(2)}px 0px`;
    });
  },
});
