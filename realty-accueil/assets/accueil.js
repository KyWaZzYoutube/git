/* Page d'accueil Realty : son de la vidéo, apparitions au défilement, compteurs.
   Le menu (déroulants, tiroir mobile) est géré par menu.js, repris tel quel. */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Vidéo : lecture muette en boucle, « Activer le son » la relance depuis le début ---- */
  const video = $('#sxVideo'), sound = $('#sxSound');
  if (video && sound) {
    const label = $('span', sound), icon = $('use', sound);
    const sync = () => {
      const on = !video.muted;
      sound.setAttribute('aria-pressed', on);
      label.textContent = on ? 'Couper le son' : 'Activer le son';
      icon.setAttribute('href', on ? '#i-volume' : '#i-volume-off');
    };
    sound.addEventListener('click', () => {
      if (video.muted) { video.muted = false; video.currentTime = 0; }
      else video.muted = true;
      video.play().catch(() => {});
      sync();
    });
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); }   // pas de lecture automatique : le bouton lance la vidéo avec le son
    sync();
  }

  /* ---- Apparitions : seuls les blocs encore sous l'écran sont masqués, la page reste lisible sans script ---- */
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.remove('pre');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.sx-rv').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); } });

    /* Compteurs « +100 modules », « +50 contrats », « 5 utilisateurs » */
    const stats = $('#sxStats');
    if (stats && stats.getBoundingClientRect().top > innerHeight) {
      const co = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        $$('[data-count]', e.target).forEach(el => {
          const to = +el.dataset.count, pre = el.dataset.pre || '', t0 = performance.now();
          const step = t => {
            const k = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
            el.textContent = pre + v;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }), { threshold: 0.4 });
      co.observe(stats);
    }
  }
})();
