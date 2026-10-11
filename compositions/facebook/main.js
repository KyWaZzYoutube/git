/* ==========================================================================
   Première Immo — « Publicité Facebook immobilier » (32 s · 1920×1080)

   Récit (grille musicale 120 BPM, 1 temps = 0,5 s) :
   A   0,0–4,0   Vos futurs vendeurs sont sur Facebook (+40 M d'utilisateurs en France)
   S1  4,0–7,0   1. Il voit votre publicité (dans son fil, dans votre secteur)
   S2  7,0–10,5  2. Il demande une estimation (en 2 clics, sans quitter Facebook)
   S3 10,5–13,5  3. Vous recevez le contact (tout de suite, rien qu'à vous)
   S4 13,5–17,0  4. Vous le rappelez (et vous fixez le rendez-vous)
   S5 17,0–20,0  5. Vous signez le mandat (sans pige, sans portail)
   T  20,0–23,6  Et on s'occupe de tout
   R  23,6–28,0  Témoignage d'un client (avis publié sur le site)
   G  28,0–32,0  Votre secteur est-il encore disponible ? → appel découverte
   ========================================================================== */
MotionEngine.run({
  duration: 32,
  fonts: ['800 100px "Plus Jakarta Sans Variable"', '700 40px "Plus Jakarta Sans Variable"',
          '600 40px "Plus Jakarta Sans Variable"', '500 40px "Plus Jakarta Sans Variable"'],
  build(E) {
    const { tl, cue, rise, sink, show, hide, $, $$, splitWords, measure, drivers,
            counter, typewriter, shake, bump, camera, rel } = E;
    const ORANGE = '#FF5100', PEACH = '#FFF1EA', INK = '#141414', FB = '#1877F2';
    // début de chaque partie (les temps internes sont relatifs à ces ancres)
    const S1 = 4.0, S2 = 7.0, S3 = 10.5, S4 = 13.5, S5 = 17.0, T = 20.0, R = 23.6, G = 28.0;
    camera($('#bump'));
    const phone = $('#phone');

    /* Position d'un élément dans le repère de `root`, d'après la mise en page (sans les transformations). */
    function off(el, root) {
      let x = 0, y = 0, e = el;
      while (e && e !== root) {
        x += e.offsetLeft; y += e.offsetTop;
        const p = e.offsetParent;
        if (p && p !== root) { x += p.clientLeft; y += p.clientTop; }
        e = p;
      }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2 };
    }
    /* Découpe en mots sur les espaces simples : les espaces insécables restent dans le mot (« … configuré. »). */
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
    /* Un doigt touche l'écran : pression + onde orange. */
    function press(touch, rip, t, x, y) {
      tl.to(touch, { scale: 0.8, duration: 0.09, ease: 'power2.out' }, t).to(touch, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t + 0.09);
      gsap.set(rip, { x, y, opacity: 0 });
      tl.fromTo(rip, { scale: 0.25, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, t);
      cue(t, 'tap');
    }
    /* Pastille numérotée « 1 », « 2 » au bord du téléphone : les deux clics du propriétaire. */
    function badge(sel, t, y, tOut) {
      tl.fromTo(sel, { opacity: 0, scale: 0.3, x: 486, y }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, t);
      tl.to(sel, { opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, tOut);
    }
    const float = (el, amp, speed, phase) => drivers.push(t => {
      el.style.translate = `0px ${(Math.sin(t * speed + phase) * amp).toFixed(2)}px`;
    });

    /* ================= A : vos futurs vendeurs sont sur Facebook (0 → 4 s) ================= */
    gsap.set('#light', { visibility: 'visible' });
    rise('#aTag', 0.1, { dur: 0.7 });
    const a1 = splitWords($('#aL1')), a2 = splitWords($('#aL2'));
    rise(a1, 0.2, { stagger: 0.06 });
    rise(a2, 0.46, { stagger: 0.06 });
    tl.fromTo('#aStat', { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 1.2);
    counter($('#aStatN'), 40, 1.3, 1.0, { pre: '+', suf: ' M' });
    cue(1.3, 'counter', 0.6);

    // les propriétaires du secteur, avec leurs réactions Facebook
    const PAL = [['#DCE8FB', '#86A9E6'], ['#FFE1D1', '#FF9C6B'], ['#EDEAE4', '#B8B0A3'], ['#DDEFD8', '#8BC27E'], ['#E9E1F7', '#A890D8']];
    const PEOPLE = [
      [236, 252, 112, 0, 'like'], [440, 146, 74, 1], [178, 566, 92, 3, 'love'], [338, 856, 124, 2, 'like'], [590, 958, 72, 4],
      [1690, 232, 108, 1, 'love'], [1478, 128, 72, 3], [1766, 556, 88, 0, 'like'], [1590, 862, 122, 4, 'love'], [1350, 972, 74, 2],
    ];
    const people = PEOPLE.map(([x, y, s, c, r]) => {
      const el = document.createElement('div');
      el.className = 'pp';
      Object.assign(el.style, { left: `${x - s / 2}px`, top: `${y - s / 2}px`, width: `${s}px`, height: `${s}px` });
      el.innerHTML = `<div class="pp-in" style="background:${PAL[c][0]}"><svg viewBox="0 0 48 48"><circle cx="24" cy="19.5" r="8.5" fill="${PAL[c][1]}"/><path d="M7 48c1.5-11 8.5-17 17-17s15.5 6 17 17z" fill="${PAL[c][1]}"/></svg></div>`
        + (r ? `<span class="pp-r ${r}"><svg viewBox="0 0 24 24"><use href="#i-${r === 'like' ? 'thumb' : 'heart'}"/></svg></span>` : '');
      $('#people').appendChild(el);
      return { el, x, y, r: r && el.querySelector('.pp-r') };
    });
    [0, 5, 2, 7, 3, 8, 1, 6, 4, 9].forEach((k, j) => {
      const t = 0.5 + j * 0.085;
      tl.fromTo(people[k].el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.2)' }, t);
      cue(t, 'bubble', 0.5);
    });
    people.filter(p => p.r).forEach((p, j) => {
      const t = 1.75 + j * 0.24;
      tl.fromTo(p.r, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(3)' }, t);
      cue(t, 'react', 0.6);
    });
    drivers.push(t => {
      people.forEach((p, i) => {
        const a = t * (0.9 + (i % 3) * 0.15) + i * 1.3;
        p.el.style.translate = `${(Math.sin(a) * 6).toFixed(2)}px ${(Math.cos(a * 1.1) * 8).toFixed(2)}px`;
      });
    });
    // le texte s'efface ; les propriétaires rejoignent le fil du téléphone
    sink(['#aTag', ...a1, ...a2], 2.95, { stagger: 0.012, dur: 0.38 });
    tl.to('#aStat', { opacity: 0, y: -24, duration: 0.3, ease: 'power2.in' }, 2.98);
    const PX = 1410, PY = 540;   // centre de l'écran du téléphone
    people.forEach(p => {
      const d = Math.hypot(PX - p.x, PY - p.y);
      const t0 = 3.0 + (1 - d / 1300) * 0.25;
      tl.to(p.el, { x: PX - p.x, y: PY - p.y, scale: 0.16, duration: 0.62, ease: 'power3.in' }, t0);
      tl.to(p.el, { opacity: 0, duration: 0.14, ease: 'none' }, t0 + 0.48);
    });
    cue(3.0, 'whoosh', 0.7);
    tl.fromTo('#panelBg', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8 }, 3.2);
    tl.fromTo('#phoneWrap', { y: 340, rotation: 6 }, { y: 0, rotation: 0, duration: 0.95 }, 3.28);
    tl.fromTo('#phoneWrap', { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'none' }, 3.28);
    cue(3.28, 'swoosh', 0.6);
    tl.fromTo('#role', { opacity: 0, x: -30, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 3.85);
    cue(3.85, 'pop', 0.4);
    float($('#phoneWrap'), 7, 1.25, 0);
    const glow = $('#glowO');
    drivers.push(t => { glow.style.translate = `${(Math.sin(t * 0.5) * 40).toFixed(1)}px ${(Math.cos(t * 0.4) * 30).toFixed(1)}px`; });

    /* ================= les 5 étapes (colonne de gauche) ================= */
    rise('#sTag', S1 - 0.05, { dur: 0.7 });
    const steps = $$('.st').map(el => ({ el, dot: $('.st-dot', el), fill: $('.st-fill', el), ring: $('.st-ring', el), n: $('.st-n', el),
      ck: $('.st-ck', el), t: $('.st-t', el), sw: $('.st-sw', el), s: $('.st-s', el), rf: $('.st-rf', el) }));
    gsap.set(steps.map(s => s.fill), { scale: 0 });
    gsap.set(steps.map(s => s.ck), { scale: 0 });
    gsap.set(steps.filter(s => s.rf).map(s => s.rf), { scaleY: 0 });
    tl.fromTo(steps.map(s => s.el), { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.07 }, S1);
    const ACT = [], DONE = [];
    function activate(k, t) {
      const s = steps[k];
      ACT[k] = t;
      tl.to(s.fill, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, t);
      tl.to(s.n, { color: '#FFFFFF', duration: 0.25 }, t + 0.05);
      tl.to(s.t, { color: INK, duration: 0.4 }, t);
      tl.to(s.sw, { height: s.s.offsetHeight, duration: 0.55 }, t + 0.05);
      tl.fromTo(s.s, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, t + 0.15);
      cue(t, 'step');
    }
    function complete(k, t) {
      const s = steps[k];
      DONE[k] = t;
      tl.to(s.fill, { backgroundColor: PEACH, duration: 0.35, ease: 'power1.out' }, t);
      tl.to(s.n, { opacity: 0, scale: 0.5, duration: 0.2, ease: 'power2.in' }, t);
      tl.to(s.ck, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, t + 0.1);
      tl.to(s.t, { color: '#8F8E8A', duration: 0.4 }, t);
      tl.to(s.sw, { height: 0, duration: 0.45, ease: 'power2.inOut' }, t);
      tl.to(s.s, { opacity: 0, duration: 0.25 }, t);
      if (s.rf) tl.to(s.rf, { scaleY: 1, duration: 0.5, ease: 'power2.inOut' }, t + 0.05);
    }
    activate(0, S1 + 0.5);
    complete(0, S2); activate(1, S2 + 0.25);
    complete(1, S3); activate(2, S3 + 0.25);
    complete(2, S4); activate(3, S4 + 0.25);
    complete(3, S5); activate(4, S5 + 0.25);
    drivers.push(t => {   // piPulse sur l'étape en cours
      steps.forEach((s, k) => {
        const a = ACT[k] + 0.45, b = DONE[k] ?? 99;
        const p = t < a || t >= b ? -1 : ((t - a) % 1.4) / 1.4;
        s.ring.style.boxShadow = p < 0 ? 'none' : `0 0 0 ${(p * 14).toFixed(1)}px rgba(255,81,0,${(0.4 * (1 - p)).toFixed(3)})`;
      });
    });
    tl.fromTo('#camL', { scale: 1 }, { scale: 1.025, duration: T - S1, ease: 'none' }, S1);

    /* ================= S1 : il voit votre publicité (4 → 7 s) ================= */
    const ad = $('#ad');
    const SCROLL = ad.offsetTop - 14, DRAG = 200, D0 = S1 + 0.85;
    // le propriétaire fait défiler son fil jusqu'à votre publicité
    tl.fromTo('#touch0', { opacity: 0, x: 250, y: 700, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' }, D0 - 0.25);
    tl.to('#touch0', { y: 700 - DRAG, duration: 0.45, ease: 'power1.in' }, D0);
    tl.to('#touch0', { opacity: 0, scale: 1.2, duration: 0.2 }, D0 + 0.45);
    tl.fromTo('#feed', { y: 0 }, { y: -DRAG, duration: 0.45, ease: 'power1.in' }, D0);
    tl.to('#feed', { y: -SCROLL, duration: 0.45, ease: 'power3.out' }, D0 + 0.45);
    cue(D0 + 0.2, 'swipe');
    // la publicité s'entoure d'orange
    const ring = $('#adRing'), rr = $('#adRing rect');
    ring.setAttribute('width', ad.offsetWidth + 12); ring.setAttribute('height', ad.offsetHeight + 12);
    rr.setAttribute('width', ad.offsetWidth + 6); rr.setAttribute('height', ad.offsetHeight + 6);
    const HL = S1 + 1.7;
    gsap.set(rr, { drawSVG: '0%' });
    tl.set(ring, { opacity: 1 }, HL);
    tl.fromTo(rr, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut', immediateRender: false }, HL);
    tl.fromTo(ad, { boxShadow: '0 30px 60px -30px rgba(255,81,0,0)' }, { boxShadow: '0 30px 60px -30px rgba(255,81,0,0.6)', duration: 0.7 }, HL + 0.3);
    cue(HL, 'swoosh', 0.35);
    // uniquement dans votre secteur
    tl.fromTo('#mapC', { opacity: 0, scale: 0.7, rotation: -8, x: 40 }, { opacity: 1, scale: 1, rotation: -3, x: 0, duration: 0.75, ease: 'back.out(1.7)' }, HL + 0.2);
    tl.fromTo('#mapPin', { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'bounce.out' }, HL + 0.45);
    tl.fromTo('#mapZone', { scale: 0 }, { scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, HL + 0.6);
    cue(HL + 0.2, 'pop', 0.5); cue(HL + 0.62, 'drop', 0.6); cue(HL + 1.0, 'gold', 0.6);
    tl.to('#mapC', { opacity: 0, scale: 0.86, y: 30, duration: 0.35, ease: 'power2.in' }, S2 - 0.05);
    const mapPulse = $('#mapPulse');
    drivers.push(t => {
      const p = t < HL + 1.2 ? -1 : ((t - HL - 1.2) % 1.2) / 1.2;
      mapPulse.style.opacity = p < 0 ? 0 : (0.8 * (1 - p)).toFixed(3);
      mapPulse.style.transform = `scale(${(1 + p * 0.7).toFixed(3)})`;
    });
    float($('#mapC'), 5, 1.9, 1.0);

    /* ================= S2 : il demande une estimation, en 2 clics (7 → 10,5 s) ================= */
    const pAd = off($('#adBtn'), phone); pAd.cy -= SCROLL;
    const TAP1 = S2 + 0.35;
    tl.fromTo('#touch1', { opacity: 0, x: pAd.cx + 120, y: pAd.cy + 260 }, { opacity: 1, x: pAd.cx, y: pAd.cy, duration: 0.42, ease: 'power3.out' }, TAP1 - 0.42);
    press('#touch1', '#rip1', TAP1, pAd.cx, pAd.cy);
    tl.to('#touch1', { opacity: 0, duration: 0.22 }, TAP1 + 0.3);
    badge('#tapN1', TAP1 + 0.04, pAd.cy, S3 - 0.3);
    // le formulaire s'ouvre dans Facebook
    const SH = TAP1 + 0.15;
    tl.fromTo('#dim', { opacity: 0 }, { opacity: 1, duration: 0.45 }, SH);
    tl.fromTo('#sheet', { yPercent: 105 }, { yPercent: 0, duration: 0.65 }, SH);
    cue(SH, 'swoosh', 0.5);
    const ADDR = '12 rue des Lilas', CPS = 24, TA = SH + 0.6;
    tl.to('#fldAddr', { borderColor: FB, duration: 0.2 }, TA - 0.15);
    typewriter($('#fvAddr'), ADDR, TA, CPS);
    tl.to('#fldAddr', { borderColor: '#E4E6EB', duration: 0.3 }, TA + 0.8);
    const fCaret = $('#fCaret');
    drivers.push(t => {
      const on = t >= TA - 0.15 && t < TA + 0.8;
      const typing = t >= TA && t <= TA + ADDR.length / CPS;
      fCaret.style.opacity = on ? (typing ? 1 : (Math.floor(t * 2.6) % 2 ? 0 : 1)) : 0;
    });
    const TP = TA + 0.75;   // le téléphone est déjà rempli par Facebook
    tl.fromTo('#fvTel', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35 }, TP);
    tl.fromTo('#pre', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.6)' }, TP + 0.08);
    cue(TP, 'tick', 0.7);
    // 2e clic : envoi
    const pB = off($('#shBtn'), phone);
    const TAP2 = TP + 0.45;
    tl.fromTo('#touch2', { opacity: 0, x: pB.cx + 140, y: pB.cy + 200 }, { opacity: 1, x: pB.cx + 40, y: pB.cy + 4, duration: 0.42, ease: 'power3.out' }, TAP2 - 0.42);
    press('#touch2', '#rip2', TAP2, pB.cx + 40, pB.cy + 4);
    tl.to('#shBtn', { scale: 0.97, duration: 0.08, ease: 'power2.out' }, TAP2).to('#shBtn', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, TAP2 + 0.08);
    tl.to('#touch2', { opacity: 0, duration: 0.22 }, TAP2 + 0.3);
    badge('#tapN2', TAP2 + 0.04, pB.cy, S3 - 0.24);
    tl.to('#shB1', { yPercent: -120, duration: 0.3, ease: 'power3.in' }, TAP2 + 0.1);
    tl.fromTo('#shB2', { yPercent: 120 }, { yPercent: 0, duration: 0.45, ease: 'back.out(1.8)' }, TAP2 + 0.25);
    const OK = TAP2 + 0.45;
    tl.to('#shOk', { opacity: 1, duration: 0.3 }, OK);
    tl.fromTo('#okC', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, OK + 0.05);
    gsap.set('#okPath', { drawSVG: '0%', opacity: 0 });
    tl.set('#okPath', { opacity: 1 }, OK + 0.2);
    tl.fromTo('#okPath', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.35, ease: 'power2.out', immediateRender: false }, OK + 0.2);
    cue(OK + 0.05, 'success');

    /* ================= S3 : vous recevez le contact (10,5 → 13,5 s) ================= */
    // le téléphone se retourne : on passe du côté de l'agence
    const FLIP = S3 - 0.1;
    gsap.set('#phone', { transformPerspective: 2000 });
    tl.to('#phone', { rotationY: 90, scale: 0.95, duration: 0.24, ease: 'power2.in' }, FLIP);
    tl.set('#scrO', { visibility: 'hidden' }, FLIP + 0.24);
    tl.set('#scrA', { visibility: 'visible' }, FLIP + 0.24);
    tl.fromTo('#phone', { rotationY: -90, scale: 0.95 }, { rotationY: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)', immediateRender: false }, FLIP + 0.24);
    cue(FLIP, 'flip');
    const W1 = $('#roleT1').offsetWidth, W2 = $('#roleT2').offsetWidth;
    gsap.set('#roleBox', { width: W1 });
    gsap.set('#roleT2', { yPercent: 110 });
    tl.to('#roleT1', { yPercent: -110, duration: 0.3, ease: 'power3.in' }, FLIP + 0.04);
    tl.to('#roleBox', { width: W2, duration: 0.45, ease: 'power2.inOut' }, FLIP + 0.18);
    tl.fromTo('#roleT2', { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'back.out(1.6)', immediateRender: false }, FLIP + 0.3);
    tl.to('#roleIc', { backgroundColor: ORANGE, color: '#FFFFFF', duration: 0.35 }, FLIP + 0.3);
    tl.to('#role', { scale: 1.06, duration: 0.15, ease: 'power2.out' }, FLIP + 0.3).to('#role', { scale: 1, duration: 0.4, ease: 'back.out(3)' }, FLIP + 0.45);
    // la notification arrive, le téléphone vibre
    const NT = S3 + 0.62;
    tl.fromTo('#nt', { y: -70, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, NT);
    cue(NT, 'notif'); cue(NT + 0.02, 'buzz');
    drivers.push(t => {
      const d = t - NT;
      const v = d >= 0 && d < 0.55 ? Math.sin(d * 2 * Math.PI * 24) * 6 * (1 - d / 0.55) : 0;
      phone.style.translate = `${v.toFixed(2)}px 0px`;
    });
    tl.fromTo('#excl', { opacity: 0, x: -40, scale: 0.85 }, { opacity: 1, x: 0, scale: 1, duration: 0.65, ease: 'back.out(2)' }, S3 + 1.35);
    cue(S3 + 1.35, 'pop', 0.5);
    tl.to('#excl', { opacity: 0, x: -30, duration: 0.3, ease: 'power2.in' }, S4 - 0.05);
    float($('#excl'), 5, 1.8, 2.0);

    /* ================= S4 : vous le rappelez (13,5 → 17 s) ================= */
    const pN = off($('#nt'), phone);
    const TAP3 = S4 + 0.3;
    tl.fromTo('#touch3', { opacity: 0, x: pN.cx + 90, y: pN.cy + 240 }, { opacity: 1, x: pN.cx + 40, y: pN.cy + 6, duration: 0.42, ease: 'power3.out' }, TAP3 - 0.42);
    press('#touch3', '#rip3', TAP3, pN.cx + 40, pN.cy + 6);
    tl.to('#touch3', { opacity: 0, duration: 0.2 }, TAP3 + 0.25);
    // la notification s'ouvre sur la fiche du contact
    const n = off($('#nt'), $('#scrA'));
    const CT = TAP3 + 0.1;
    show('#contact', CT);
    tl.fromTo('#contact', { clipPath: `inset(${n.y}px ${408 - n.x - n.w}px ${848 - n.y - n.h}px ${n.x}px round 28px)` },
      { clipPath: 'inset(0px 0px 0px 0px round 50px)', duration: 0.6, ease: 'io', immediateRender: false }, CT);
    cue(CT, 'swoosh', 0.45);
    tl.fromTo('.ct-a', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045 }, CT + 0.25);
    const pC = off($('#ctBtn'), phone);
    const TAP4 = CT + 1.15;
    tl.fromTo('#touch4', { opacity: 0, x: pC.cx + 110, y: pC.cy + 170 }, { opacity: 1, x: pC.cx + 40, y: pC.cy + 4, duration: 0.42, ease: 'power3.out' }, TAP4 - 0.42);
    press('#touch4', '#rip4', TAP4, pC.cx + 40, pC.cy + 4);
    tl.to('#ctBtn', { scale: 0.96, duration: 0.08, ease: 'power2.out' }, TAP4).to('#ctBtn', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, TAP4 + 0.08);
    tl.to('#touch4', { opacity: 0, duration: 0.2 }, TAP4 + 0.25);
    // l'appel
    const CALL = TAP4 + 0.2;
    show('#call', CALL);
    tl.fromTo('#call', { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'expo.out', immediateRender: false }, CALL);
    cue(CALL + 0.1, 'ring');
    const clT = $('#clT');
    drivers.push(t => {   // durée d'appel (accélérée)
      const s = Math.max(0, Math.floor((t - CALL - 0.3) * 4));
      const v = `00:${String(Math.min(s, 59)).padStart(2, '0')}`;
      if (clT.textContent !== v) clT.textContent = v;
    });
    const clRings = [0, 1, 2].map(() => { const i = document.createElement('i'); $('#clRings').appendChild(i); return i; });
    drivers.push(t => {
      clRings.forEach((r, k) => {
        const p = t < CALL ? -1 : (((t - CALL) / 1.6 + k / 3) % 1);
        const Rr = 80 + p * 110;
        r.style.width = r.style.height = `${(2 * Rr).toFixed(0)}px`;
        r.style.marginLeft = r.style.marginTop = `${(-Rr).toFixed(0)}px`;
        r.style.opacity = p < 0 ? 0 : (1 - p).toFixed(3);
      });
    });
    const bars = Array.from({ length: 11 }, () => { const i = document.createElement('i'); $('#clWave').appendChild(i); return i; });
    drivers.push(t => {
      bars.forEach((b, k) => {
        const env = Math.min(1, Math.max(0, (t - CALL - 0.5) / 0.4));
        const v = 0.2 + 0.8 * Math.abs(Math.sin(t * 7.3 + k * 0.9) * Math.sin(t * 3.1 + k * 1.7));
        b.style.transform = `scaleY(${(0.12 + 0.88 * v * env).toFixed(3)})`;
      });
    });
    // rendez-vous fixé
    const RDV = CALL + 0.6;
    tl.fromTo('#rdv', { opacity: 0, x: -40, scale: 0.85, rotation: -6 }, { opacity: 1, x: 0, scale: 1, rotation: -2, duration: 0.7, ease: 'back.out(1.8)' }, RDV);
    cue(RDV, 'pop', 0.6); cue(RDV + 0.2, 'tick', 0.6);
    tl.to('#rdv', { opacity: 0, x: -30, duration: 0.3, ease: 'power2.in' }, S5 + 0.45);
    float($('#rdv'), 5, 1.7, 0.5);

    /* ================= S5 : vous signez le mandat (17 → 20 s) ================= */
    show('#doc', S5 + 0.05);
    tl.fromTo('#doc', { y: 900, rotation: 14 }, { y: 0, rotation: 3, duration: 0.9, immediateRender: false }, S5 + 0.05);
    cue(S5 + 0.05, 'swoosh', 0.8);
    // (opacité nulle tant que le tracé n'a pas commencé : sinon l'extrémité arrondie laisse un point)
    gsap.set(['#sig1', '#sig2'], { drawSVG: '0%', opacity: 0 });
    tl.set('#sig1', { opacity: 1 }, S5 + 0.85);
    tl.fromTo('#sig1', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.75, ease: 'power1.inOut', immediateRender: false }, S5 + 0.85);
    tl.set('#sig2', { opacity: 1 }, S5 + 1.62);
    tl.fromTo('#sig2', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.22, ease: 'power2.out', immediateRender: false }, S5 + 1.62);
    cue(S5 + 0.85, 'scribble');
    const STAMP = S5 + 2.0;
    tl.fromTo('#stamp', { scale: 2.4, opacity: 0, rotation: -32 }, { scale: 1, opacity: 1, rotation: -12, duration: 0.26, ease: 'power4.in' }, STAMP - 0.26);
    tl.to('#stamp', { scale: 1.06, duration: 0.07, ease: 'power2.out' }, STAMP).to('#stamp', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, STAMP + 0.07);
    shake(STAMP + 0.01, 9, 0.4);
    cue(STAMP, 'stamp');
    complete(4, STAMP + 0.1);
    cue(STAMP + 0.2, 'gold', 0.8);
    steps.forEach((s, k) => {   // le parcours est complet : les 5 coches sautent l'une après l'autre
      const t = STAMP + 0.3 + k * 0.06;
      tl.to(s.dot, { scale: 1.14, duration: 0.12, ease: 'power2.out' }, t).to(s.dot, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.12);
    });

    // le tampon s'ouvre en plein écran orange
    show('#team', T); hide('#light', T);
    cue(T - 0.5, 'riser_short');
    measure(T - 0.45, () => rel($('#stamp')), s => {
      const Rw = Math.hypot(Math.max(s.cx, 1920 - s.cx), Math.max(s.cy, 1080 - s.cy)) + 30;
      gsap.set('#wipe', { left: s.cx, top: s.cy });
      show('#wipe', T - 0.45);
      tl.fromTo('#wipe', { scale: s.w / 200 }, { scale: (2 * Rw) / 200, duration: 0.45, ease: 'expo.in', immediateRender: false }, T - 0.45);
      hide('#wipe', T);
    });

    /* ================= T : et on s'occupe de tout (20 → 23,6 s) ================= */
    rise('#tTag', T - 0.02, { dur: 0.7 });
    const tw = splitWords($('#tH'));
    rise(tw, T + 0.05, { stagger: 0.06 });
    tl.fromTo('#tSub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, T + 0.38);
    bump(T, 0.012);
    cue(T, 'hit');
    const tcs = $$('.tc');
    tl.fromTo(tcs, { opacity: 0, y: 90, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.14, ease: 'back.out(1.2)' }, T + 0.6);
    tcs.forEach((c, i) => cue(T + 0.6 + i * 0.14, 'pop', 0.45));
    tl.fromTo('.tc-ic', { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, stagger: 0.14, ease: 'back.out(2.4)' }, T + 0.78);
    tl.fromTo('.t-chip', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, T + 1.7);
    [0, 0.12, 0.24].forEach(d => cue(T + 1.7 + d, 'tick', 0.5));
    tl.fromTo('#camT', { scale: 1.05 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, T);
    tl.to('#camT', { scale: 1.02, duration: 2.2, ease: 'none' }, T + 1.4);
    const tr1 = $('#tRing1'), tr2 = $('#tRing2');
    drivers.push(t => {
      const d = Math.max(0, t - T);
      tr1.style.transform = `translate(${(d * 14).toFixed(1)}px, ${(-d * 10).toFixed(1)}px) scale(${(1 + d * 0.02).toFixed(4)})`;
      tr2.style.transform = `translate(${(-d * 12).toFixed(1)}px, ${(d * 9).toFixed(1)}px) scale(${(1 + d * 0.025).toFixed(4)})`;
    });

    /* ================= R : témoignage (23,6 → 28 s) ================= */
    show('#review', R - 0.45);
    tl.fromTo('#review', { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'expo.inOut', immediateRender: false }, R - 0.45);
    tl.to('#team', { yPercent: -22, duration: 0.5, ease: 'expo.inOut' }, R - 0.45);
    hide('#team', R + 0.06);
    cue(R - 0.45, 'whoosh', 0.8);
    $$('.r-stars svg').forEach((s, i) => {
      const t = R + 0.1 + i * 0.08;
      tl.fromTo(s, { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(3)' }, t);
      cue(t, 'star', 0.5);
    });
    rise('#rTag', R + 0.05, { dur: 0.7 });
    const qw = words($('#rQ'));
    tl.fromTo(qw, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.03 }, R + 0.3);
    const l1w = $('.r-l1').offsetWidth;
    const ul = $('#rUl');
    ul.setAttribute('width', l1w); ul.setAttribute('viewBox', `0 0 ${l1w} 30`);
    $('#rUl path').setAttribute('d', `M6 20 C ${(l1w * 0.2).toFixed(0)} 8, ${(l1w * 0.47).toFixed(0)} 6, ${l1w - 6} 14`);
    const rw = words($('#rRes'));
    tl.fromTo(rw, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 }, R + 1.2);
    cue(R + 1.3, 'gold', 0.7);
    gsap.set(ul, { opacity: 0 });
    gsap.set('#rUl path', { drawSVG: '0%' });
    tl.set(ul, { opacity: 1 }, R + 1.85);
    tl.fromTo('#rUl path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut', immediateRender: false }, R + 1.85);
    cue(R + 1.85, 'zip', 0.6);
    tl.fromTo('#rWho', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, R + 1.6);
    tl.fromTo('#camR', { scale: 1 }, { scale: 1.025, duration: G - R, ease: 'none' }, R);
    tl.to('#rCard', { y: -60, opacity: 0, duration: 0.45, ease: 'power3.in' }, G - 0.5);

    /* ================= G : appel à l'action (28 → 32 s) ================= */
    show('#cta', G - 0.05); hide('#review', G);
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
      const k = t > G + 2.4 ? Math.max(0, Math.sin((t - G - 2.4) * Math.PI * 1.25)) ** 6 * 8 : 0;
      arrow.style.translate = `${k.toFixed(2)}px 0px`;
    });
    // « secteur » : ondes concentriques discrètes derrière le titre
    const radar = $('#radar');
    const rings = [0, 1, 2, 3].map(() => { const i = document.createElement('i'); radar.appendChild(i); return i; });
    drivers.push(t => {
      rings.forEach((r, k) => {
        const p = t < G ? -1 : (((t - G) / 3.2 + k / 4) % 1);
        const Rr = 200 + p * 900;
        r.style.width = r.style.height = `${(2 * Rr).toFixed(0)}px`;
        r.style.marginLeft = r.style.marginTop = `${(-Rr).toFixed(0)}px`;
        r.style.opacity = p < 0 ? 0 : (Math.sin(Math.PI * p) * Math.min(1, (t - G) / 0.8)).toFixed(3);
      });
    });
  },
});
