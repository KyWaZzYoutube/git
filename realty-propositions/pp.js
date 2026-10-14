/* Interactions des propositions 6 à 11 : hub (08), parcours (09), rail (10).
   Sans script, chaque bloc reste lisible : le hub affiche Realty au centre,
   le parcours la première étape, le rail se fait défiler au doigt ou à la souris. */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Avance automatique, arrêtée dès que le visiteur interagit ou que le bloc sort de l'écran. */
  function autoplay(root, step, ms) {
    if (reduce) return () => {};
    let timer = null, stopped = false, visible = false;
    const run = () => { clearInterval(timer); if (!stopped && visible) timer = setInterval(step, ms); };
    new IntersectionObserver(es => { visible = es[0].isIntersecting; run(); }, { threshold: 0.3 }).observe(root);
    return () => { stopped = true; clearInterval(timer); };
  }

  /* ---- 08 · hub : le module survolé ou choisi s'affiche au centre ---- */
  const hub = $('.hb-orbit');
  if (hub) {
    const nodes = $$('.hb-node', hub), lines = $$('.lines line', hub), center = $('.hb-center', hub);
    const home = center.innerHTML;
    let cur = -1;
    const show = k => {
      cur = k;
      nodes.forEach((n, i) => n.classList.toggle('on', i === k));
      lines.forEach((l, i) => l.classList.toggle('on', i === k));
      if (k < 0) { center.innerHTML = home; return; }
      const n = nodes[k].dataset;
      center.innerHTML = `<div class="fade"><b>${n.name}</b><p>${n.hook}</p><a href="${n.href}">Découvrir<svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></a></div>`;
    };
    const stop = autoplay(hub, () => show((cur + 1) % nodes.length), 2600);
    nodes.forEach((n, i) => {
      n.addEventListener('mouseenter', () => { stop(); show(i); });
      n.addEventListener('focus', () => { stop(); show(i); });
      n.addEventListener('click', e => { if (cur !== i) { e.preventDefault(); stop(); show(i); } });
    });
  }

  /* ---- 09 · parcours : étapes de la pige à la facture ---- */
  const track = $('.pc-track');
  if (track) {
    const steps = $$('.pc-step', track), fill = $('.pc-fill', track), panel = $('.pc-panel'), data = steps.map(s => s.dataset);
    let cur = 0;
    const show = k => {
      cur = k;
      steps.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); s.setAttribute('aria-selected', i === k); });
      fill.style.width = `calc((100% - 100% / 6) * ${k / (steps.length - 1)})`;
      const d = data[k];
      $('.shot img', panel).src = d.img; $('.shot img', panel).alt = d.alt;
      const t = $('.txt', panel);
      t.innerHTML = `<span class="k">Étape ${k + 1} sur ${steps.length}</span><h2>${d.title}</h2><p>${d.hook}</p><ul>${d.feats.split('|').map(f => `<li><svg class="i" aria-hidden="true"><use href="#i-checkc"/></svg>${f}</li>`).join('')}</ul><a class="sx-tlink" href="${d.href}">Découvrir ${d.name.toLowerCase()}<svg class="i" aria-hidden="true"><use href="#i-chevr"/></svg></a>`;
      t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    };
    const stop = autoplay(track, () => show((cur + 1) % steps.length), 4200);
    steps.forEach((s, i) => s.addEventListener('click', () => { stop(); show(i); }));
    show(0);
  }

  /* ---- 10 · rail : flèches et barre de progression ---- */
  const rail = $('.rl-rail');
  if (rail) {
    const bar = $('.rl-bar i'), card = () => $('.rl-card:not(.video)', rail).getBoundingClientRect().width + 18;
    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth, vis = rail.clientWidth / rail.scrollWidth;
      bar.style.width = `${Math.max(12, vis * 100)}%`;
      bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * (100 / Math.max(.12, vis) - 100) : 0}%)`;
    };
    $('.rl-btn.prev').addEventListener('click', () => rail.scrollBy({ left: -card(), behavior: reduce ? 'auto' : 'smooth' }));
    $('.rl-btn.next').addEventListener('click', () => rail.scrollBy({ left: card(), behavior: reduce ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }
})();
