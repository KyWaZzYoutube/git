/* ==========================================================================
   Realty — « Le logiciel immobilier tout-en-un » (72 s · 1920×1080)
   Film de la page d'accueil de la refonte realty.fr, dans l'esprit des films
   « produit » : une couleur par domaine, barre de module bleu nuit qui devient
   la fenêtre de l'application, curseur qui clique, fonctionnalités qui se cochent.

   Récit (grille musicale 120 BPM, 1 temps = 0,5 s, 1 mesure = 2 s) :
   I    0–4    Pige, mandats, portails, contrats, factures… dix outils à jongler
   L    4–8    Les outils sont aspirés : logo Realty, « le logiciel immobilier tout-en-un »
   A    8–12   L'application : les 6 domaines, le site web et l'application mobile
   D1  12–18   Prospection            D4  30–36   Vente
   D2  18–24   Estimation & mandat    D5  36–42   Location
   D3  24–30   Diffusion              D6  42–48   Pilotage
   W   48–56   Site web inclus (modèles, annonces, contacts, visibilité, statistiques, domaine)
   M   56–62   Application mobile : prospection, estimation, compromis signé sur place
   O   62–66   Tout est inclus : 99 € HT/mois, 5 utilisateurs
   F   66–72   Rentrez plus de mandats, Realty fait le reste ! → Réserver une démo
   Les textes sont ceux du menu et de la page d'accueil validés pour la refonte.
   ========================================================================== */
MotionEngine.run({
  duration: 72,
  fonts: ['800 100px "Manrope Variable"', '700 40px "Manrope Variable"', '600 40px "Manrope Variable"'],
  build(E) {
    const { tl, cue, cues, rise, fadeUp, show, hide, $, $$, measure, drivers, counter, typewriter, shake, bump, camera, rel, ez, clamp, lerp } = E;
    const L = 4, A = 8, W = 48, M = 56, O = 62, F = 66;
    const DSTART = [12, 18, 24, 30, 36, 42];
    camera($('#bump'));

    /* ---------------------------------------------------------------- outils */
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
    const html = s => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };
    const ico = id => `<svg class="ico"><use href="#${id}"/></svg>`;
    const sk = w => `<i class="sk" style="width:${w}%"></i>`;
    const float = (el, amp, speed, phase) => drivers.push(t => {
      el.style.translate = `0px ${(Math.sin(t * speed + phase) * amp).toFixed(2)}px`;
    });
    const pop = (el, t, o = {}) => {
      tl.fromTo(el, { scale: o.from ?? 0.6, opacity: 0, y: o.y ?? 0 }, { scale: 1, opacity: 1, y: 0, duration: o.dur ?? 0.55, ease: o.ease ?? 'back.out(1.8)', immediateRender: true }, t);
      if (o.cue !== false) cue(t, o.cue || 'pop', o.gain ?? 1);
    };
    const draw = (el, t, dur, o = {}) => tl.fromTo(el, { drawSVG: '0%' }, { drawSVG: o.to || '100%', duration: dur, ease: o.ease || 'power1.inOut' }, t);

    /* Transition : un disque de la couleur de la scène suivante grandit depuis (x, y). */
    const wipesLayer = $('#wipes');
    function wipe(t, color, x, y, from, to, dur = 0.55) {
      const w = document.createElement('i');
      w.className = 'wipe';
      w.style.background = color;
      w.style.left = `${x - 2400}px`; w.style.top = `${y - 2400}px`;
      wipesLayer.appendChild(w);
      tl.set(w, { visibility: 'visible' }, t - dur);
      tl.fromTo(w, { scale: 0 }, { scale: 1, duration: dur, ease: 'expo.in', immediateRender: false }, t - dur);
      const cam = $('.cam', $(from));
      if (cam) tl.to(cam, { scale: 0.94, duration: dur, ease: 'power2.in' }, t - dur);
      show(to, t); hide(from, t); hide(w, t + 0.001);
      cue(t - dur, 'whoosh');
    }

    /* Curseur : positions-clés (arrivée à l'instant t), segments de visibilité, clics. */
    const CK = [], CSEG = [], CLK = [];
    const cursorSeg = (t0, t1, from, to) => { CSEG.push([t0, t1]); CK.push({ t: t0, x: from[0], y: from[1] }); if (to) CK.push({ t: t1, x: to[0], y: to[1] }); };
    const cursorAt = (t, x, y) => CK.push({ t, x, y });
    const clickAt = t => { CLK.push(t); cue(t, 'click'); };
    /* Arrive sur le centre d'un élément (mesuré à l'instant du clic), clique si demandé. */
    function cursorOn(t, sel, o = {}) {
      measure(o.mt ?? t, () => { const r = rel(typeof sel === 'string' ? $(sel) : sel); return { x: r.x + r.w * (o.fx ?? 0.5) + (o.dx || 0), y: r.y + r.h * (o.fy ?? 0.5) + (o.dy || 0) }; },
        v => CK.push({ t, x: v.x, y: v.y }));
      if (o.click) clickAt(t + 0.04);
    }
    const curEl = $('#cursor'), curRing = $('#curRing');
    let sorted = false;
    drivers.push(t => {
      if (!sorted) { CK.sort((a, b) => a.t - b.t); sorted = true; }
      let x = CK[0].x, y = CK[0].y;
      for (let i = 0; i < CK.length - 1; i++) {
        const k0 = CK[i], k1 = CK[i + 1];
        if (t < k0.t) break;
        x = k0.x; y = k0.y;
        if (t >= k1.t) { x = k1.x; y = k1.y; continue; }
        const mv = Math.min(0.62, k1.t - k0.t), s = k1.t - mv;
        if (t > s) {
          const p = ez('power3.inOut', (t - s) / mv);
          const dx = k1.x - k0.x, dy = k1.y - k0.y, arc = Math.sin(Math.PI * p) * 0.1;
          x = k0.x + dx * p - dy * arc; y = k0.y + dy * p + dx * arc;
        }
        break;
      }
      let op = 0;
      for (const [a, b] of CSEG) if (t >= a - 0.15 && t <= b + 0.2) op = Math.max(op, Math.min(clamp((t - a + 0.15) / 0.15), clamp((b + 0.2 - t) / 0.2)));
      let sc = 1, ro = 0, rs = 0.4;
      for (const c of CLK) {
        const d = t - c;
        if (d >= 0 && d < 0.18) sc = Math.min(sc, 1 - 0.2 * Math.sin(Math.PI * d / 0.18));
        if (d >= 0 && d < 0.5) { ro = 1 - d / 0.5; rs = 0.4 + 1.3 * ez('expo.out', d / 0.5); }
      }
      curEl.style.opacity = op.toFixed(3);
      curEl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      curRing.style.opacity = (ro * op).toFixed(3);
      curRing.style.transform = `scale(${rs.toFixed(3)})`;
    });

    /* ================= I : dix outils à jongler (0 → 4 s) ================= */
    gsap.set('#sI', { visibility: 'visible' });
    const WINS = [
      ['Pige', 'i-target', '#3300FF', 110, 80, -8], ['Agenda', 'i-cal', '#E0219B', 560, 50, 5],
      ['Portails', 'i-grid', '#FF5A36', 1070, 64, -4], ['Mandats', 'i-file', '#0B9B6A', 1510, 110, 7],
      ['Contrats', 'i-pen', '#1D7BEA', 140, 730, 6], ['Factures', 'i-euro', '#E6A700', 610, 820, -6],
      ['Site web', 'i-globe', '#3300FF', 1090, 800, 4], ['Tableur', 'i-chart', '#E0219B', 1520, 710, -7],
    ];
    const wins = WINS.map(([name, ic, col, x, y, r], i) => {
      const w = html(`<div class="iw" style="left:${x}px;top:${y}px"><div class="iw-h"><span class="ic" style="background:${col}">${ico(ic)}</span>${name}</div>
        <div class="iw-b"><div class="row"><i class="c"></i>${sk(70 - (i % 3) * 12)}</div><div class="row"><i class="c"></i>${sk(52 + (i % 2) * 20)}</div><div class="row"><i class="c"></i>${sk(64 - (i % 4) * 8)}</div></div></div>`);
      $('#iWins').appendChild(w);
      const dx = x + 150 - 960, dy = y + 98 - 540;
      const t0 = 0.12 + i * 0.16;
      tl.fromTo(w, { x: dx * 0.9, y: dy * 0.9, rotation: r * 3, scale: 0.6, opacity: 0 },
        { x: 0, y: 0, rotation: r, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.3)' }, t0);
      cue(t0 + 0.05, 'pop', 0.7);
      float(w, 9 + (i % 3) * 3, 1.6 + (i % 4) * 0.3, i * 1.7);
      // aspirés vers le centre, puis l'icône Realty apparaît
      tl.to(w, { x: -dx, y: -dy, rotation: 0, scale: 0.12, opacity: 0, duration: 0.55, ease: 'power3.in' }, 3.38 + (7 - i) * 0.02);
      return w;
    });
    tl.fromTo('#iRings i', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, stagger: 0.08, ease: 'expo.out' }, 0);
        tl.to('#iRings', { scale: 0.2, duration: 0.6, ease: 'power3.in' }, 3.4);
    rise('#iL1', 0.55, { dur: 0.8 });
    rise(words($('#iL2')), 0.9, { stagger: 0.07 });
    tl.fromTo('.pill-w', { backgroundColor: 'rgba(255,255,255,0)', color: '#fff' }, { backgroundColor: '#fff', color: '#3300FF', duration: 0.35, ease: 'power2.out' }, 1.5);
    cue(1.5, 'pop');
    tl.to('.i-head', { scale: 0.6, opacity: 0, duration: 0.45, ease: 'power3.in' }, 3.3);
    // le curseur s'affole d'une fenêtre à l'autre
    cursorSeg(1.55, 3.3, [1980, 1120]);
    [[1.95, 7], [2.45, 2], [2.95, 0]].forEach(([t, i]) => {
      cursorOn(t, wins[i], { click: true, dx: 20, dy: -10 });
      tl.fromTo(wins[i], { scale: 0.9 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)', immediateRender: false }, t + 0.04);
    });
    cursorAt(3.3, 960, 560);
    cue(3.38, 'suck');

    /* ================= L : logo, le logiciel immobilier tout-en-un (4 → 8 s) ================= */
    wipe(L, '#ffffff', 960, 540, '#sI', '#sL', 0.4);
    gsap.set('#lLogo', { x: 330.5, scale: 0, clipPath: 'inset(0% 76.8% 0% 0%)', transformOrigin: '99.5px 99.5px' });
    tl.to('#lLogo', { scale: 1.5, duration: 0.7, ease: 'back.out(2)' }, L);
    cue(L, 'hit'); cue(L, 'logo'); bump(L, 0.02);
    tl.to('#lLogo', { x: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'expo.inOut' }, L + 0.8);
    cue(L + 0.8, 'swoosh');
    tl.fromTo('#lRings i', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, stagger: 0.06, ease: 'expo.out' }, L);
    rise('#lL1', L + 1.45, { dur: 0.9 });
    tl.fromTo('#lPillBg', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.out' }, L + 2.0);
    tl.fromTo('#lPillT', { color: '#141B33' }, { color: '#ffffff', duration: 0.2 }, L + 2.08);
    cue(L + 2.0, 'gold');
    fadeUp('#lSub', L + 2.45, { y: 30 });

    /* ================= A : l'application, les 6 domaines (8 → 12 s) ================= */
    wipe(A, '#EEEAFF', 1320, 650, '#sL', '#sA');
    tl.fromTo('#app3d', { rotationY: -26, rotationX: 14, rotation: -4, y: 520, scale: 0.9 },
      { rotationY: -13, rotationX: 7, rotation: -2, y: 0, scale: 1, duration: 1.1, ease: 'expo.out' }, A);
    tl.to('#app3d', { rotationY: -5, rotationX: 3, rotation: -1, scale: 1.04, duration: 2.9, ease: 'sine.inOut' }, A + 1.1);
    const sideItems = $$('#sideList li').filter(li => !li.classList.contains('sep'));
    const hl = $('#sideHl'), list = $('#sideList');
    const yOf = li => list.offsetTop + li.offsetTop;
    gsap.set(hl, { top: yOf(sideItems[0]), opacity: 0 });
    sideItems.forEach((li, k) => {
      const t = A + 0.9 + k * 0.36;
      if (k === 0) tl.fromTo(hl, { opacity: 0, scaleX: 0.6 }, { opacity: 1, scaleX: 1, duration: 0.3, ease: 'back.out(2)' }, t);
      else tl.to(hl, { top: yOf(li), duration: 0.26, ease: 'power3.out' }, t);
      tl.to(li, { color: '#ffffff', duration: 0.15 }, t);
      if (k < sideItems.length - 1) tl.to(li, { color: '#B8BDD6', duration: 0.2 }, t + 0.36);
      cue(t, 'tick', 0.8);
    });
    pop('#aBadge', A + 1.3, { from: 0.4 });
    float($('#aBadge'), 8, 2.2, 0.5);

    /* ================= D1…D6 : les domaines (12 → 48 s) ================= */
    const DOMAINS = [
      { name: 'Prospection', icon: 'i-target', bg: '#E3DEFF', acc: '#3300FF',
        tag: 'Chaque annonce de particulier arrive dans Realty en temps réel, avec suivi et relances.',
        feats: [['Pige immobilière', 'Gratuit'], ['Porte-à-porte & phoning'], ['Secteurs & îlots'], ['Campagnes e-mail & SMS'], ['Parrainage']] },
      { name: 'Estimation & mandat', icon: 'i-gauge', bg: '#C9F1E1', acc: '#0B9B6A',
        tag: 'Des avis de valeur solides et des mandats signés en deux clics.',
        feats: [['Estimation comparative'], ['Fiche bien & immeuble'], ['Mandats & délégation'], ['Registres des mandats'], ['Barème d’honoraires']] },
      { name: 'Diffusion', icon: 'i-cast', bg: '#FFDCD2', acc: '#FF5A36',
        tag: 'Vos biens sur tous les portails et sur votre site, sans double saisie.',
        feats: [['Multidiffusion'], ['Site web agence', 'Inclus'], ['Annonces par l’IA', 'IA'], ['Modèles & flyers']] },
      { name: 'Vente', icon: 'i-hand', bg: '#FFEBA6', acc: '#D99A00',
        tag: 'De la première visite au compromis signé électroniquement.',
        feats: [['Fiches acquéreurs'], ['Click & Visit'], ['Offres & compromis'], ['Signature électronique'], ['Notification SRU']] },
      { name: 'Location', icon: 'i-key', bg: '#CFE5FF', acc: '#1D7BEA',
        tag: 'Tous vos baux générés et signés en quelques minutes.',
        feats: [['Baux de location'], ['Acte de caution'], ['Honoraires & règlements'], ['Extranet locataires & bailleurs']] },
      { name: 'Pilotage', icon: 'i-chart', bg: '#FFD8EE', acc: '#E0219B',
        tag: 'Vos chiffres, vos équipes et vos tâches réunis dans un tableau de bord.',
        feats: [['Tableau de bord'], ['Agenda partagé'], ['Tâches & automatisations'], ['Facturation'], ['Tableau des clés'], ['Multi-agences']] },
    ];
    const BODY = [prospection, estimation, diffusion, vente, location, pilotage];
    const holder = $('#domains');
    let prev = '#sA';
    DOMAINS.forEach((d, k) => {
      const a = DSTART[k], id = `d${k + 1}`;
      const sec = html(`<section class="scene dom" id="${id}" style="background:${d.bg};--acc:${d.acc}">
        <i class="blob b1"></i><i class="blob b2"></i>
        <div class="cam">
          <div class="d-body"><div class="d-in"></div></div>
          <div class="d-bar"><span class="d-ic">${ico(d.icon)}</span><span class="d-name">${d.name}</span><span class="d-dots"><i></i><i></i><i></i></span></div>
          <div class="d-right"><div class="mask km"><span class="d-kick">Domaine <b>0${k + 1}</b>&nbsp;/ 06</span></div><div class="d-tag">${d.tag}</div></div>
          <ul class="d-feats">${d.feats.map(([f, b]) => `<li><span class="ck"><i></i>${ico('i-check')}</span>${f}${b ? `<span class="bdg">${b}</span>` : ''}</li>`).join('')}</ul>
        </div></section>`);
      holder.appendChild(sec);
      wipe(a, d.bg, k === 0 ? 560 : 960, k === 0 ? 330 : 540, prev, `#${id}`);
      prev = `#${id}`;
      const q = s => $(s, sec);
      // fonds : grands disques qui dérivent lentement
      drivers.push(t => {
        const s = t - a;
        q('.b1').style.translate = `${(-s * 14).toFixed(1)}px ${(s * 8).toFixed(1)}px`;
        q('.b2').style.translate = `${(s * 10).toFixed(1)}px ${(-s * 6).toFixed(1)}px`;
      });
      // barre de module : apparaît au centre, puis devient l'en-tête de la fenêtre
      tl.fromTo(q('.d-bar'), { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)' }, a + 0.05);
      cue(a + 0.05, 'pop', 1.1);
      tl.to(q('.d-bar'), { left: 110, top: 132, width: 1040, duration: 0.75, ease: 'expo.inOut' }, a + 0.7);
      cue(a + 0.7, 'swoosh');
      tl.fromTo(q('.d-body'), { clipPath: 'inset(0% 0% 100% 0% round 32px)', y: -24 }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', y: 0, duration: 0.8, ease: 'expo.out' }, a + 1.0);
      rise(q('.d-kick'), a + 0.95, { dur: 0.7 });
      tl.fromTo(words(q('.d-tag')), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: 'pi' }, a + 1.05);
      const rows = $$('.d-feats li', sec);
      tl.fromTo(rows, { x: 90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.09, ease: 'pi' }, a + 1.3);
      rows.forEach((r, i) => {
        const t = a + 2.0 + i * 0.5;
        tl.fromTo($('.ck i', r), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2.6)' }, t);
        tl.fromTo($('.ck .ico', r), { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.05);
        tl.fromTo(r, { scale: 1.045 }, { scale: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t);
        cues.push({ t, type: 'check', gain: 1, n: i });
      });
      BODY[k](sec, q('.d-in'), a);
    });

    /* ---- D1 prospection : la pige arrive en direct, secteur et rappel du vendeur ---- */
    function prospection(sec, body, a) {
      const ROWS = [['h1', 'Maison 5 pièces · 128 m²', 'Particulier · Rezé · il y a 1 min', '389 000 €'],
                    ['h2', 'Appartement T3 · 68 m²', 'Particulier · Nantes · il y a 4 min', '245 000 €'],
                    ['h3', 'Longère · 160 m²', 'Particulier · Vertou · il y a 9 min', '498 000 €'],
                    ['h4', 'Maison 4 pièces · 96 m²', 'Particulier · Orvault · il y a 12 min', '312 000 €']];
      body.innerHTML = `
        <div class="p-head"><span class="ttl">Pige immobilière</span><span class="live"><i></i>En direct</span><span class="chip">${ico('i-pin')}Mon secteur</span></div>
        <div class="p-list">${ROWS.map(([h, t, s, p], i) => `<div class="p-row"><div class="lst-img ${h}"></div><div class="tx"><b>${t}</b><span>${s}</span></div>
          <div class="pr"><b>${p}</b><span class="new">Nouveau</span></div>${i === 0 ? `<span class="p-call"><span class="c1">${ico('i-phone')}Appeler</span></span>` : ''}</div>`).join('')}</div>
        <div class="card p-map"><svg viewBox="0 0 332 572" width="332" height="572"><path class="roads" d="M-10 120 L340 88 M-10 300 Q 160 266 340 330 M-10 476 L340 500 M84 -10 L122 590 M252 -10 L214 590"/>
          <path class="zone" d="M58 170 L248 138 L292 332 L204 444 L70 404 Z"/></svg>
          <span class="chip zl">${ico('i-target')}Secteur Rezé Sud</span>
          <i class="pin" style="left:118px;top:236px"></i><i class="pin" style="left:226px;top:300px"></i><i class="pin" style="left:150px;top:372px"></i></div>`;
      const toast = html(`<div class="toast" style="left:600px;top:930px"><span class="t-ic">${ico('i-bell')}</span><span class="t-txt"><span class="t-title">Nouvelle annonce de particulier</span><span class="t-text">Maison 5 pièces · Rezé · 389 000 €</span></span></div>`);
      $('.cam', sec).appendChild(toast);
      const rows = $$('.p-row', body);
      rows.forEach((r, i) => { tl.fromTo(r, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, a + 1.35 + i * 0.3); cue(a + 1.35 + i * 0.3, 'blip', 1); });
      drivers.push(t => { const p = (t * 1.6) % 1; $('.live i', body).style.boxShadow = `0 0 0 ${(p * 10).toFixed(1)}px rgba(11,155,106,${(0.4 * (1 - p)).toFixed(2)})`; });
      const zone = $('.zone', body);
      draw(zone, a + 1.6, 0.9);
      tl.fromTo(zone, { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.5 }, a + 2.3);
      $$('.pin', body).forEach((p, i) => { tl.fromTo(p, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'bounce.out' }, a + 2.4 + i * 0.15); cue(a + 2.45 + i * 0.15, 'tick', 0.6); });
      pop(toast, a + 3.0, { y: 40, cue: 'notif' });
      tl.to(toast, { y: 30, opacity: 0, duration: 0.35, ease: 'power2.in' }, a + 4.4);
      // le curseur ouvre la première annonce et appelle le vendeur
      const call = $('.p-call', body);
      cursorSeg(a + 3.2, a + 5.5, [1280, 1120]);
      cursorOn(a + 3.75, rows[0], { fx: 0.55 });
      tl.to($('.pr', rows[0]), { opacity: 0, duration: 0.2 }, a + 3.8);
      tl.to(rows[0], { borderColor: '#3300FF', duration: 0.25 }, a + 3.75);
      pop(call, a + 3.85, { from: 0.5 });
      cursorOn(a + 4.25, call, { click: true, dx: 10, dy: 6, mt: a + 4.3 });
      tl.to(call, { backgroundColor: '#0B9B6A', boxShadow: '0 14px 24px -12px rgba(11,155,106,0.8)', duration: 0.25 }, a + 4.3);
      drivers.push(t => { const d = t - (a + 4.3); $('.ico', call).style.rotate = d > 0 && d < 1.2 ? `${(Math.sin(d * 38) * 14 * (1 - d / 1.2)).toFixed(1)}deg` : '0deg'; });
      textSwap($('.c1', call), [[0, `${ico('i-phone')}Appeler`], [a + 4.3, `${ico('i-phone')}Appel en cours…`]]);
      cursorAt(a + 5.5, 1180, 1000);
    }

    /* ---- D2 estimation & mandat : valeur du bien, comparables, mandat signé ---- */
    function estimation(sec, body, a) {
      body.innerHTML = `
        <div class="card e-prop"><div class="lst-img h1"></div><div class="ttl">Maison 150 m² · 5 pièces</div><div class="sub">Nantes · jardin de 600 m²</div>
          <div class="chips"><span class="chip">4 chambres</span><span class="chip">DPE B</span><span class="chip">Garage</span></div></div>
        <div class="e-main"><div class="lbl">Estimation comparative</div><div class="e-val">0 €</div><div class="e-range"><i></i><b></b></div><div class="e-ends"><span>395 000 €</span><span>430 000 €</span></div></div>
        <div class="e-comps">${[['h2', '405 000 €', '145 m²'], ['h3', '420 000 €', '152 m²'], ['h5', '398 000 €', '140 m²']].map(([h, p, s]) => `<div class="e-comp"><div class="lst-img ${h}"></div><b>${p}</b><span>Vendu · ${s}</span></div>`).join('')}</div>
        <div class="btn e-btn">${ico('i-file')}Générer le mandat</div>
        <div class="card e-doc"><div class="doc-t">Mandat exclusif de vente</div><div class="doc-s">N° 2026-148 · Registre des mandats</div>
          <div class="doc-lines">${sk(92)}${sk(78)}${sk(86)}${sk(60)}${sk(70)}</div>
          <div class="sig-box"><small>Signature du vendeur</small><svg class="sig" viewBox="0 0 300 100" preserveAspectRatio="none"><path d="M12 70 C 26 24, 40 22, 46 56 S 62 92, 76 50 S 100 16, 108 60 C 114 86, 128 78, 138 52 C 148 30, 162 36, 166 58 S 192 82, 210 48 C 222 26, 236 40, 248 56 S 272 64, 288 34"/></svg></div>
          <div class="stamp" style="right:22px;top:118px">${ico('i-check')}Signé</div></div>`;
      fadeUp($('.e-prop', body), a + 1.15, { y: 40 });
      fadeUp($('.e-main', body), a + 1.35, { y: 30 });
      counter($('.e-val', body), 412000, a + 1.5, 1.3, { suf: ' €' });
      cue(a + 1.5, 'counter');
      tl.fromTo($('.e-range i', body), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.out' }, a + 1.6);
      tl.fromTo($('.e-range b', body), { left: '22%', scale: 0 }, { left: '49%', scale: 1, duration: 1.0, ease: 'expo.out' }, a + 1.7);
      $$('.e-comp', body).forEach((c, i) => pop(c, a + 2.0 + i * 0.16, { y: 30 }));
      pop($('.e-btn', body), a + 2.55, { from: 0.7 });
      cursorSeg(a + 2.5, a + 5.5, [1300, 1120]);
      cursorOn(a + 3.1, $('.e-btn', body), { click: true, dx: 40 });
      tl.fromTo($('.e-btn', body), { scale: 0.94 }, { scale: 1, duration: 0.4, ease: 'back.out(3)', immediateRender: false }, a + 3.14);
      const doc = $('.e-doc', body);
      tl.fromTo(doc, { y: 620, rotation: 8, opacity: 0 }, { y: 0, rotation: -2, opacity: 1, duration: 0.75, ease: 'expo.out' }, a + 3.3);
      cue(a + 3.3, 'swoosh');
      draw($('.sig path', doc), a + 3.85, 0.8);
      cue(a + 3.85, 'scribble');
      const st = $('.stamp', doc);
      tl.fromTo(st, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: 'power4.in' }, a + 4.75);
      cue(a + 4.95, 'stamp'); shake(a + 4.95, 6, 0.3);
      cursorAt(a + 3.7, 900, 1000);
    }

    /* ---- D3 diffusion : rédaction par l'IA, puis publication sur tous les canaux ---- */
    function diffusion(sec, body, a) {
      const DEST = [['i-grid', 'Portails immobiliers', 40, 60], ['i-globe', 'Votre site agence', 730, 60], ['i-share', 'Réseaux sociaux', 40, 500], ['i-file', 'Modèles & flyers', 730, 500]];
      const PATHS = ['M360 170 C 330 170, 340 135, 310 135', 'M680 170 C 710 170, 700 135, 730 135', 'M360 380 C 322 380, 340 575, 310 575', 'M680 380 C 718 380, 700 575, 730 575'];
      body.innerHTML = `
        <svg class="f-links" viewBox="0 0 1040 720" width="1040" height="720">${PATHS.map(p => `<path d="${p}"/>`).join('')}${PATHS.map(() => '<circle r="8"/>').join('')}</svg>
        <div class="card f-prop"><div class="lst-img h4"></div><div class="ttl">Maison 150 m²</div><div class="pr">412 000 €</div>
          <span class="btn" style="right:16px;bottom:16px;height:52px;font-size:20px;padding:0 22px">${ico('i-cast')}Diffuser</span></div>
        ${DEST.map(([ic, n, x, y]) => `<div class="card f-dest" style="left:${x}px;top:${y}px"><span class="ic">${ico(ic)}</span><b>${n}</b><span class="ok">${ico('i-check')}Publié</span></div>`).join('')}
        <div class="card f-ai"><div class="ai-l">${ico('i-spark')}Annonce rédigée par l’IA</div><p><span class="ai-t"></span><i class="caret"></i></p></div>
        <div class="toast f-total"><span class="t-ic">${ico('i-cast')}</span><span class="t-txt"><span class="t-title">Diffusé sur tous vos canaux</span><span class="t-text">Une seule saisie, mise à jour partout</span></span></div>`;
      pop($('.f-prop', body), a + 1.15, { y: 40 });
      const dests = $$('.f-dest', body);
      dests.forEach((d, i) => tl.fromTo(d, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, a + 1.35 + i * 0.08));
      fadeUp($('.f-ai', body), a + 1.5, { y: 30 });
      typewriter($('.ai-t', body), 'Lumineuse maison familiale de 150 m², jardin de 600 m², au calme, proche des écoles.', a + 1.75, 52);
      drivers.push(t => { $('.caret', body).style.opacity = (t > a + 3.6 ? (Math.floor(t * 3) % 2) : 1); });
      cursorSeg(a + 2.4, a + 4.0, [1200, 1120]);
      const btn = $('.f-prop .btn', body);
      cursorOn(a + 2.95, btn, { click: true, dx: 20 });
      tl.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: 'back.out(3)', immediateRender: false }, a + 2.99);
      cursorAt(a + 4.0, 1060, 1010);
      const paths = $$('.f-links path', body), dots = $$('.f-links circle', body);
      paths.forEach((p, i) => draw(p, a + 3.05 + i * 0.08, 0.45, { ease: 'power2.out' }));
      cue(a + 3.05, 'zip');
      drivers.push(t => dots.forEach((c, i) => {
        const p = clamp((t - (a + 3.1 + i * 0.08)) / 0.5), L0 = paths[i].getTotalLength();
        const pt = paths[i].getPointAtLength(L0 * ez('power2.inOut', p));
        c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y);
        c.style.opacity = p > 0 && p < 1 ? 1 : 0;
      }));
      dests.forEach((d, i) => {
        const t = a + 3.55 + i * 0.12;
        pop($('.ok', d), t, { from: 0.3, cue: i === 0 ? 'gold' : 'pop', gain: 0.7 });
        tl.fromTo(d, { borderColor: '#FF5A36' }, { borderColor: '#E3E6F2', duration: 0.8, immediateRender: false }, t);
      });
      gsap.set($('.f-total', body), { xPercent: -50 });
      pop($('.f-total', body), a + 4.4, { y: 30, cue: 'notif' });
    }

    /* ---- D4 vente : acquéreur, visite Click & Visit, compromis signé en ligne ---- */
    function vente(sec, body, a) {
      const DAYS = ['Mar.', 'Jeu.', 'Ven.'];
      const SLOTS = [['09:00', 'off', '09:00'], ['10:00', 'pick', '10:30'], ['14:00', '14:00', 'off'], ['off', '17:30', '18:00']];
      body.innerHTML = `
        <div class="card v-acq"><div class="av">CM</div><div class="ttl">Claire Martin</div><div class="sub">Acquéreuse · budget 420&nbsp;000&nbsp;€</div>
          <div class="chips"><span class="chip">Maison</span><span class="chip">4 ch.</span><span class="chip">Jardin</span><span class="chip">Nantes</span></div>
          <div class="v-match"><svg viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="84"/><circle class="fg" cx="100" cy="100" r="84"/></svg><div class="val"><b>0 %</b><span>Correspondance</span></div></div></div>
        <div class="card v-cal"><div class="lbl">Click &amp; Visit</div><div class="ttl" style="font-size:24px;margin-top:4px">Visite · Maison 150 m²</div>
          <div class="v-days">${DAYS.map(d => `<span class="v-day">${d}</span>`).join('')}
          ${SLOTS.flat().map(s => s === 'off' ? '<span class="slot off">—</span>' : s === 'pick' ? '<span class="slot pick"><i></i><span>10:00</span></span>' : `<span class="slot">${s}</span>`).join('')}</div>
          <div class="v-conf">${ico('i-check')}Visite confirmée · jeu. 10:00</div></div>
        <div class="card v-doc"><div class="doc-t">Compromis de vente</div><div class="doc-s">Maison 150 m² · Nantes</div><div class="v-offer">Offre acceptée · 412&nbsp;000&nbsp;€</div>
          <div class="doc-lines">${sk(90)}${sk(74)}${sk(82)}</div>
          <div class="sig-box"><small>Acquéreur</small><svg class="sig" viewBox="0 0 300 100" preserveAspectRatio="none"><path d="M16 64 C 30 30, 48 30, 52 60 S 74 84, 92 46 S 120 26, 130 58 S 158 74, 176 40 S 214 34, 226 60 S 262 66, 284 38"/></svg></div>
          <div class="sig-box"><small>Vendeur</small><svg class="sig" viewBox="0 0 300 100" preserveAspectRatio="none"><path d="M14 72 C 34 20, 56 24, 60 62 C 64 84, 82 76, 94 50 C 104 30, 122 30, 128 56 S 150 86, 168 52 C 182 28, 204 30, 214 58 C 222 78, 246 70, 290 36"/></svg></div>
          <div class="eidas">${ico('i-lock')}Signature électronique eIDAS</div></div>`;
      fadeUp($('.v-acq', body), a + 1.15, { y: 40 });
      const fg = $('.v-match .fg', body);
      draw(fg, a + 1.55, 1.0, { to: '96%', ease: 'expo.out' });
      counter($('.v-match b', body), 96, a + 1.55, 1.0, { suf: ' %' });
      cue(a + 1.55, 'counter', 0.7);
      fadeUp($('.v-cal', body), a + 1.4, { y: 40 });
      tl.fromTo($$('.slot', body), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'back.out(2)' }, a + 1.65);
      const conf = $('.v-conf', body);
      gsap.set(conf, { opacity: 0 });
      cursorSeg(a + 2.2, a + 5.5, [1100, 1120]);
      cursorOn(a + 2.75, $('.slot.pick', body), { click: true, dx: 12, dy: 4 });
      tl.fromTo($('.slot.pick i', body), { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' }, a + 2.79);
      tl.to($('.slot.pick span', body), { color: '#ffffff', duration: 0.1 }, a + 2.82);
      pop(conf, a + 3.0, { y: 20, cue: 'notif' });
      const doc = $('.v-doc', body);
      tl.fromTo(doc, { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, a + 3.1);
      cue(a + 3.1, 'swoosh');
      const sigs = $$('.sig path', doc);
      draw(sigs[0], a + 3.5, 0.6); cue(a + 3.5, 'scribble', 0.8);
      draw(sigs[1], a + 4.1, 0.6); cue(a + 4.1, 'scribble', 0.8);
      gsap.set($('.eidas', doc), { xPercent: -50 });
      pop($('.eidas', doc), a + 4.8, { from: 0.5, cue: 'stamp', gain: 0.6 });
      cursorAt(a + 3.4, 1000, 990);
    }

    /* ---- D5 location : le bail se génère, se signe, l'extranet suit les loyers ---- */
    function location(sec, body, a) {
      const ITEMS = [['i-euro', 'Loyer d’octobre', '890 € · prélevé le 05/10', 'Payé'], ['i-file', 'Quittance d’octobre', 'Envoyée au locataire', 'Envoyée'],
                     ['i-euro', 'Honoraires de location', '650 € TTC', 'Réglé'], ['i-key', 'État des lieux d’entrée', 'Signé le 01/10', 'Signé']];
      body.innerHTML = `
        <div class="card l-doc"><div class="ttl">Bail de location</div><div class="sub" style="font-size:19px;font-weight:600;color:var(--muted)">Appartement T3 · 68 m² · Nantes</div>
          <div class="l-prog"><div class="pl"><span class="pl-t">Génération du bail…</span><b class="pct">0 %</b></div><div class="bar"><i></i></div></div>
          <div class="l-lines">${[94, 80, 88, 70, 84, 58].map(sk).join('')}</div>
          <div class="l-signs">${[['Locataire', 'Lucas Bernard'], ['Bailleur', 'SCI Les Tilleuls'], ['Garant', 'Acte de caution']].map(([r, n]) => `<div class="l-sign">${r}<small>${n}</small><span class="okc">${ico('i-check')}</span></div>`).join('')}</div></div>
        <div class="card l-ext"><div class="lbl">Extranet</div><div class="ttl" style="font-size:25px;margin-top:4px">Locataires &amp; bailleurs</div>
          <div class="l-ten"><div class="av">LB</div><div><b>Lucas Bernard</b><span>Locataire depuis le 01/10</span></div></div>
          <div class="l-items">${ITEMS.map(([ic, b, s, st]) => `<div class="l-item"><span class="ic">${ico(ic)}</span><div><b>${b}</b><span>${s}</span></div><span class="st">${st}</span></div>`).join('')}</div></div>`;
      fadeUp($('.l-doc', body), a + 1.15, { y: 40 });
      tl.fromTo($('.l-prog .bar i', body), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power1.inOut' }, a + 1.4);
      counter($('.pct', body), 100, a + 1.4, 1.4, { suf: ' %', ease: 'power1.inOut' });
      cue(a + 1.4, 'counter', 0.6);
      tl.fromTo($$('.l-lines .sk', body), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.4, stagger: 0.18, ease: 'power2.out' }, a + 1.5);
      textSwap($('.pl-t', body), [[0, 'Génération du bail…'], [a + 2.85, 'Bail prêt en 2 minutes ✓']]);
      tl.to($('.pct', body), { color: '#0B9B6A', duration: 0.2 }, a + 2.85);
      cue(a + 2.85, 'gold', 0.8);
      fadeUp($('.l-ext', body), a + 1.9, { y: 40 });
      tl.fromTo($$('.l-item', body), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.14, ease: 'pi' }, a + 2.2);
      $$('.l-item .st', body).forEach((s, i) => pop(s, a + 2.5 + i * 0.14, { from: 0.4, cue: false }));
      $$('.okc', body).forEach((c, i) => pop(c, a + 3.3 + i * 0.45, { from: 0.2, ease: 'back.out(3)', cue: 'success', gain: 0.6 }));
      const notif = html(`<div class="toast" style="left:560px;top:930px"><span class="t-ic">${ico('i-euro')}</span><span class="t-txt"><span class="t-title">Loyer d’octobre encaissé</span><span class="t-text">Quittance envoyée automatiquement</span></span></div>`);
      $('.cam', sec).appendChild(notif);
      pop(notif, a + 4.55, { y: 40, cue: 'notif' });
    }

    /* ---- D6 pilotage : chiffres, chiffre d'affaires, agenda partagé, facturation ---- */
    function pilotage(sec, body, a) {
      const KPI = [['Mandats signés', 48, '', '+18 %'], ['CA HT encaissé', 186400, ' €', '+24 %'], ['Ventes conclues', 23, '', '+12 %']];
      const BARS = [36, 50, 44, 58, 47, 64, 55, 70, 62, 84, 73, 90];
      const EV = [['09:00 · Estimation', 'M. et Mme Durand', '#E0219B'], ['11:30 · Visite', 'Maison 150 m² · C. Martin', '#3300FF'],
                  ['14:00 · Compromis', 'Signature électronique', '#0B9B6A'], ['17:30 · Remise des clés', 'Appartement T3', '#FF5A36']];
      body.innerHTML = `
        <div class="k-row">${KPI.map(([l, v, s, u]) => `<div class="kpi"><small>${l}</small><b>0${s}</b><span class="up">${u}</span></div>`).join('')}</div>
        <div class="card k-chart"><div class="lbl" style="color:#C0157F">Chiffre d’affaires 2026</div><div class="ttl" style="margin-top:4px">Honoraires encaissés</div>
          <div class="k-bars">${BARS.map((h, i) => `<i style="height:${h}%" class="${i === 9 ? 'hi' : ''}"></i>`).join('')}</div>
          <div class="k-months">${'JFMAMJJASOND'.split('').map(m => `<span>${m}</span>`).join('')}</div>
          <div class="k-tip">Oct. · 24 800 € HT</div></div>
        <div class="card k-agenda"><div class="lbl">Agenda partagé</div><div class="ttl" style="margin-top:4px;font-size:24px">Aujourd’hui · 4 RDV</div>
          ${EV.map(([b, s, c]) => `<div class="k-ev" style="border-color:${c}"><b>${b}</b><span>${s}</span></div>`).join('')}</div>`;
      const kpis = $$('.kpi', body);
      kpis.forEach((k, i) => { fadeUp(k, a + 1.15 + i * 0.1, { y: 30 }); counter($('b', k), KPI[i][1], a + 1.35, 1.3, { suf: KPI[i][2] }); pop($('.up', k), a + 2.6 + i * 0.1, { from: 0.4, cue: false }); });
      cue(a + 1.35, 'counter');
      fadeUp($('.k-chart', body), a + 1.45, { y: 40 });
      tl.fromTo($$('.k-bars i', body), { scaleY: 0 }, { scaleY: 1, duration: 0.55, stagger: 0.05, ease: 'back.out(1.4)' }, a + 1.7);
      cue(a + 1.7, 'bars');
      fadeUp($('.k-agenda', body), a + 1.8, { y: 40 });
      tl.fromTo($$('.k-ev', body), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'pi' }, a + 2.1);
      const bar = $$('.k-bars i', body)[9], tip = $('.k-tip', body);
      measure(a + 3.5, () => ({ x: bar.offsetLeft + bar.offsetWidth / 2 + bar.parentElement.offsetLeft, y: bar.parentElement.offsetTop + bar.parentElement.offsetHeight - bar.offsetHeight }),
        v => gsap.set(tip, { left: v.x, top: v.y - 64, xPercent: -50 }));
      gsap.set(tip, { opacity: 0 });
      cursorSeg(a + 3.0, a + 5.5, [1000, 1120]);
      cursorOn(a + 3.5, bar, { click: true, fy: 0.3 });
      pop(tip, a + 3.56, { y: 14, from: 0.6, cue: false });
      tl.fromTo(bar, { scaleX: 1 }, { scaleX: 1.12, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, a + 3.56);
      const inv = html(`<div class="toast" style="left:560px;top:930px"><span class="t-ic">${ico('i-euro')}</span><span class="t-txt"><span class="t-title">Facture F-2026-118 envoyée</span><span class="t-text">Honoraires · 12 400 € HT</span></span></div>`);
      $('.cam', sec).appendChild(inv);
      pop(inv, a + 4.3, { y: 40, cue: 'notif' });
      cursorAt(a + 5.5, 1250, 1000);
    }

    /* Change le contenu HTML d'un élément à des instants donnés (déterministe). */
    function textSwap(el, steps) {
      let cur = -1;
      drivers.push(t => {
        let k = 0;
        for (let i = 0; i < steps.length; i++) if (t >= steps[i][0]) k = i;
        if (k !== cur) { el.innerHTML = steps[k][1]; cur = k; }
      });
    }

    /* ================= W : site web inclus (48 → 56 s) ================= */
    wipe(W, '#3300FF', 960, 540, prev, '#sW');
    tl.fromTo('#sW .rings i', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, stagger: 0.06, ease: 'expo.out' }, W);
    rise('#wKick', W + 0.15, { dur: 0.7 });
    rise(words($('#wT')), W + 0.25, { stagger: 0.06 });
    tl.fromTo('#browser', { y: 640, rotation: 3 }, { y: 0, rotation: 0, duration: 1.0, ease: 'expo.out' }, W + 0.4);
    cue(W + 0.4, 'whoosh', 0.8);
    tl.fromTo('#wPhone', { x: 420, y: 120, rotation: 12, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, W + 1.2);
    cue(W + 1.2, 'swoosh');
    ['#lst1', '#lst2', '#lst3'].forEach((s, i) => pop(s, W + 1.3 + i * 0.15, { y: 30 }));
    pop('#siteSync', W + 1.9, { from: 0.5, cue: 'gold' });
    drivers.push(t => { const d = t - (W + 1.9); $('#siteSync .ico').style.rotate = `${d > 0 ? (ez('expo.out', Math.min(1, d / 1.2)) * 360).toFixed(1) : 0}deg`; });
    $$('#wFeats li').forEach((li, i) => {
      const t = W + 2.0 + i * 0.5;
      tl.fromTo(li, { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.4)' }, t);
      cues.push({ t, type: 'check', gain: 1, n: i });
    });
    pop('#swatches', W + 2.3, { from: 0.5, cue: false });
    gsap.set('#sw1', { boxShadow: '0 0 0 3px #fff, 0 0 0 6px #141B33' });
    cursorSeg(W + 2.6, W + 5.5, [1300, 1120]);
    const SW = [['#sw2', '#FF5A36'], ['#sw3', '#0B9B6A'], ['#sw1', '#3300FF']];
    SW.forEach(([s, col], i) => {
      const t = W + 3.2 + i * 0.75;
      cursorOn(t, s, { click: true, dx: 6, dy: 6 });
      tl.to(['#site', '#wPhone .ph-screen'], { '--sc': col, duration: 0.35, ease: 'power2.out' }, t + 0.04);
      SW.forEach(([o]) => tl.to(o, { boxShadow: o === s ? '0 0 0 3px #fff, 0 0 0 6px #141B33' : '0 0 0 3px #fff, 0 0 0 5px rgba(0,0,0,0)', duration: 0.2 }, t + 0.04));
      cue(t + 0.06, 'blip', 1);
    });
    cursorAt(W + 5.5, 1250, 1120);
    pop('#wToast', W + 5.4, { y: 40, cue: 'notif' });

    /* ================= M : application mobile (56 → 62 s) ================= */
    wipe(M, '#EEEAFF', 960, 540, '#sW', '#sM');
    tl.fromTo('#sM .rings i', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, stagger: 0.06, ease: 'expo.out' }, M);
    rise('#mKick', M + 0.15, { dur: 0.7 });
    rise(['#mT1', '#mT2', '#mT3'], M + 0.25, { stagger: 0.1 });
    tl.fromTo('#mPhone', { y: 760, rotation: 10 }, { y: 0, rotation: 0, duration: 1.0, ease: 'expo.out' }, M + 0.3);
    cue(M + 0.3, 'whoosh', 0.8);
    float($('#mPhone'), 8, 1.4, 0);
    const steps = $$('#mSteps li');
    tl.fromTo(steps, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'pi' }, M + 0.6);
    const stepOn = (i, t) => {
      tl.to($('.m-n', steps[i]), { backgroundColor: '#3300FF', color: '#ffffff', duration: 0.25 }, t);
      tl.fromTo(steps[i], { scale: 1.06 }, { scale: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t);
      if (i) tl.to($('.m-n', steps[i - 1]), { backgroundColor: '#F0EEFF', color: '#3300FF', duration: 0.25 }, t);
      cues.push({ t, type: 'check', gain: 1, n: i * 2 });
    };
    // écran 1 : prospection sur le terrain
    stepOn(0, M + 1.0);
    ['#mp1', '#mp2', '#mp3'].forEach((p, i) => pop(p, M + 1.0 + i * 0.15, { from: 0, cue: 'tick', gain: 0.6 }));
    tl.fromTo('#msForm', { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }, M + 1.4);
    cue(M + 1.4, 'pop');
    // écran 2 : estimation en rendez-vous
    const swipeTo = (from, to, t) => {
      tl.fromTo(to, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'expo.inOut', immediateRender: true }, t);
      tl.to(from, { xPercent: -35, duration: 0.55, ease: 'expo.inOut' }, t);
      cue(t, 'swipe');
    };
    swipeTo('#ms1', '#ms2', M + 2.0);
    stepOn(1, M + 2.3);
    counter($('#msVal'), 412000, M + 2.4, 1.0, { suf: ' €' });
    cue(M + 2.4, 'counter', 0.7);
    tl.fromTo('#msRange', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.out' }, M + 2.5);
    // écran 3 : compromis signé sur place
    swipeTo('#ms2', '#ms3', M + 3.5);
    stepOn(2, M + 3.8);
    draw($('#msSig'), M + 3.95, 0.75);
    cue(M + 3.95, 'scribble');
    pop('#msOk', M + 4.75, { y: 20, cue: 'success' });
    tl.fromTo($$('#mDevices span'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.6)' }, M + 4.9);
    cue(M + 4.9, 'pop', 0.7);

    /* ================= O : tout est inclus (62 → 66 s) ================= */
    wipe(O, '#3300FF', 1100, 540, '#sM', '#sO');
    tl.fromTo('#oStack i', { scale: 0.75, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, stagger: -0.07, ease: 'expo.out' }, O + 0.05);
    pop('#oCard', O + 0.05, { from: 0.5, cue: false });
    const OW = ['#oW1', '#oW2', '#oW3', '#oW4', '#oW5'];
    gsap.set([...OW, '#oPrice'], { yPercent: 110 });
    OW.forEach((w, i) => {
      const t = O + 0.2 + i * 0.36;
      tl.fromTo(w, { yPercent: 110 }, { yPercent: 0, duration: 0.3, ease: 'expo.out', immediateRender: false }, t);
      tl.to(w, { yPercent: -110, duration: 0.25, ease: 'power3.in' }, t + 0.3);
      cue(t, 'tick');
    });
    drivers.push(t => { $$('#oStack i').forEach((r, k) => { const d = t - (O + 0.2); r.style.scale = d > 0 && d < 1.8 ? (1 + 0.02 * Math.sin(d * Math.PI * 2 / 0.36 - k * 0.8)).toFixed(4) : 1; }); });
    tl.fromTo('#oPrice', { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'expo.out', immediateRender: false }, O + 2.0);
    tl.to('#oCard', { width: 1000, marginLeft: -500, height: 240, marginTop: -120, duration: 0.5, ease: 'back.out(2)' }, O + 2.0);
    counter($('#oN'), 99, O + 2.0, 0.7);
    cue(O + 2.0, 'hit'); bump(O + 2.0, 0.025); shake(O + 2.0, 5, 0.35);
    fadeUp('#oSub', O + 2.35, { y: 30 });

    /* ================= F : fin, réserver une démo (66 → 72 s) ================= */
    wipe(F, '#141B33', 960, 540, '#sO', '#sF');
    fadeUp('#fLogo', F + 0.15, { y: 30, dur: 0.9 });
    cue(F + 0.15, 'logo');
    rise(words($('#fL1')), F + 0.4, { stagger: 0.06 });
    rise('#fL2 .grad', F + 0.75, { dur: 0.9 });
    pop('#fBtn', F + 1.35, { from: 0.6 });
    gsap.set('#fBtn', { xPercent: -50 });
    fadeUp('#fUrl', F + 1.7, { y: 20 });
    cursorSeg(F + 2.0, F + 4.6, [1500, 1120]);
    cursorOn(F + 2.7, '#fBtn', { click: true, dx: 140, dy: 14 });
    tl.fromTo('#fBtn', { scale: 0.94 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', immediateRender: false }, F + 2.74);
    cursorAt(F + 4.6, 1400, 1000);
    drivers.push(t => {   // halo du bouton : une impulsion par mesure après le clic
      const ring = $('#fBtnRing');
      const d = t - (F + 2.74);
      if (d < 0) { ring.style.opacity = 0; return; }
      const p = (d % 1.0) / 1.0;
      ring.style.opacity = (0.8 * (1 - p)).toFixed(3);
      ring.style.transform = `scale(${(1 + 0.22 * ez('expo.out', p)).toFixed(4)}, ${(1 + 0.5 * ez('expo.out', p)).toFixed(4)})`;
    });
    tl.to('#camF', { scale: 1.03, duration: 5.5, ease: 'none' }, F + 0.5);
  },
});
