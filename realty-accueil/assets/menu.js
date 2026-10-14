/* Mécanique commune : menus déroulants, onglets, menu plein écran, tiroir mobile, navigation de présentation */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const desk = () => matchMedia('(min-width:1101px)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---- Menus déroulants ---- */
  let open = null, tIn, tOut;
  function show(dd) {
    clearTimeout(tOut);
    if (open === dd) return;
    if (open) hide(open, true);
    const p = $('.dd-panel', dd);
    p.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => dd.classList.add('on')));
    $('.dd-btn', dd).setAttribute('aria-expanded', 'true');
    open = dd;
  }
  function hide(dd, instant) {
    const p = $('.dd-panel', dd);
    dd.classList.remove('on');
    $('.dd-btn', dd).setAttribute('aria-expanded', 'false');
    if (open === dd) open = null;
    if (instant || reduce) { p.hidden = true; return; }
    setTimeout(() => { if (open !== dd) p.hidden = true; }, 260);
  }
  const closeAll = () => { if (open) hide(open); };
  $$('.dd').forEach(dd => {
    const b = $('.dd-btn', dd);
    b.addEventListener('click', e => { e.stopPropagation(); open === dd ? hide(dd) : show(dd); });
    dd.addEventListener('mouseenter', () => { if (!desk()) return; clearTimeout(tOut); clearTimeout(tIn); tIn = setTimeout(() => show(dd), open ? 0 : 120); });
    dd.addEventListener('mouseleave', () => { clearTimeout(tIn); if (open === dd) tOut = setTimeout(() => hide(dd), 300); });
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) hide(dd); });
  });
  document.addEventListener('click', e => { if (open && !open.contains(e.target)) closeAll(); });

  /* ---- Onglets (au survol ou au clic) ---- */
  $$('[data-tabs]').forEach(t => {
    const tabs = $$('[data-tab]', t), panes = $$('[data-pane]', t);
    const act = id => {
      tabs.forEach(x => { const on = x.dataset.tab === id; x.classList.toggle('act', on); x.setAttribute('aria-selected', on); });
      panes.forEach(p => { const on = p.dataset.pane === id; p.hidden = !on; if (on) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } });
    };
    tabs.forEach(x => {
      if (t.dataset.tabs === 'hover') x.addEventListener('mouseenter', () => act(x.dataset.tab));
      x.addEventListener('focus', () => act(x.dataset.tab));
      x.addEventListener('click', () => act(x.dataset.tab));
    });
  });

  /* ---- Menu plein écran ---- */
  const fs = $('#fs');
  let lastFocus = null;
  function openFs() { if (!fs) return; lastFocus = document.activeElement; fs.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => fs.classList.add('on'))); body.classList.add('lock'); $$('[data-fs-open]').forEach(b => b.setAttribute('aria-expanded', 'true')); setTimeout(() => { const c = $('[data-fs-close]', fs); c && c.focus(); }, 50); }
  function closeFs() { if (!fs || fs.hidden) return; fs.classList.remove('on'); body.classList.remove('lock'); $$('[data-fs-open]').forEach(b => b.setAttribute('aria-expanded', 'false')); setTimeout(() => { fs.hidden = true; }, reduce ? 0 : 400); lastFocus && lastFocus.focus(); }
  $$('[data-fs-open]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openFs(); }));
  $$('[data-fs-close]').forEach(b => b.addEventListener('click', closeFs));

  /* ---- Menu mobile (tiroir, panneau du bas ou panneau sous l'en-tête) ---- */
  const mnav = $('#mnav'), overlay = $('#overlay'), burger = $('#burger'), header = $('.site');
  const mOpen = () => !!mnav && mnav.classList.contains('on');
  function resetSubs() {
    $$('.m-sub', mnav).forEach(s => { s.classList.remove('in', 'away'); s.hidden = true; });
    const r = $('.m-root', mnav); r && r.classList.remove('away');
  }
  function openM() {
    if (!mnav) return;
    document.documentElement.style.setProperty('--hdr', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
    mnav.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => mnav.classList.add('on')));
    overlay.classList.toggle('under', mnav.classList.contains('mnav-drop'));
    overlay.classList.add('on'); body.classList.add('lock');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Fermer le menu');
  }
  function closeM() {
    if (!mOpen()) return;
    mnav.classList.remove('on'); overlay.classList.remove('on'); body.classList.remove('lock');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Ouvrir le menu');
    setTimeout(() => { if (!mOpen()) { mnav.hidden = true; resetSubs(); } }, reduce ? 0 : 450);
  }
  burger.addEventListener('click', () => mOpen() ? closeM() : openM());
  $$('[data-m-close]').forEach(b => b.addEventListener('click', closeM));
  $$('[data-m-link-close]').forEach(a => a.addEventListener('click', closeM));
  overlay.addEventListener('click', closeM);
  /* Navigation par écrans successifs (deux ou trois niveaux) */
  $$('[data-m-go]').forEach(b => b.addEventListener('click', () => {
    const p = $(`[data-m-panel="${b.dataset.mGo}"]`, mnav); if (!p) return;
    const from = b.closest('.m-sub') || $('.m-root', mnav);
    p._from = from; p.hidden = false; from.classList.add('away');
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('in')));
    $('.mnav-body', mnav).scrollTop = 0;
    setTimeout(() => $('[data-m-back]', p).focus(), 50);
  }));
  $$('[data-m-back]').forEach(b => b.addEventListener('click', () => {
    const p = b.closest('.m-sub'); const from = p._from || $('.m-root', mnav);
    p.classList.remove('in'); from.classList.remove('away');
    setTimeout(() => { if (!p.classList.contains('in')) p.hidden = true; }, reduce ? 0 : 400);
  }));
  /* Menu plein écran : accordéons sur mobile, colonnes ouvertes sur ordinateur */
  const fsCols = $$('.fs-col');
  const syncFs = () => fsCols.forEach((d, k) => { d.open = desk() ? true : k === 0; });
  fsCols.forEach(d => $('summary', d).addEventListener('click', e => { if (desk()) e.preventDefault(); }));
  syncFs();
  let wasDesk = desk();
  addEventListener('resize', () => { const d = desk(); if (d) closeM(); else closeAll(); if (d !== wasDesk) { syncFs(); wasDesk = d; } });
  const closeDrawer = closeM;

  /* ---- Clavier ---- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { const b = open && $('.dd-btn', open); closeAll(); closeFs(); closeDrawer(); b && b.focus(); return; }
    if (e.target.closest('input,textarea,select')) return;
    if (e.key === 'ArrowRight' && !open) { const n = $('[data-next]'); if (n) location.href = n.getAttribute('href'); }
    if (e.key === 'ArrowLeft' && !open) { const p = $('[data-prev]'); if (p) location.href = p.getAttribute('href'); }
  });

  /* ---- Bouton de présentation : ouvre le menu principal ---- */
  window.__demo = () => {
    const t = $('[data-demo-target]');
    if (!t) return;
    if (t.id === 'fs') { openFs(); return; }
    if (t.classList.contains('dd')) { window.scrollTo({ top: 0 }); show(t); return; }
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  $$('[data-demo]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); window.__demo(); }));

  /* Ouvre le menu mobile : utilisé par l'aperçu téléphone et les captures */
  window.__mobileDemo = () => { if (mnav) openM(); else openFs(); };
  /* Bande de présentation masquée uniquement dans l'aperçu téléphone */
  if (location.hash === '#mobile' || location.hash === '#apercu') document.documentElement.classList.add('in-frame');
  if (location.hash === '#mobile' && !desk()) setTimeout(window.__mobileDemo, 450);

  /* ---- Aperçu téléphone pendant la présentation ---- */
  $$('[data-phone]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); closeAll();
    const page = b.dataset.src || location.pathname.split('/').pop() || 'index.html';
    const name = ($('.pres b') || {}).textContent || '';
    const m = document.createElement('div');
    m.className = 'phone-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Aperçu mobile');
    m.innerHTML = `<div class="phone"><iframe title="Aperçu mobile" src="${page.includes('#') ? page : page + '#mobile'}"></iframe></div>
      <div class="phone-side"><b>${name}</b><p>${page.includes('#apercu') ? 'Version mobile de la page. Faites défiler l’écran du téléphone et ouvrez le menu.' : 'Version mobile, menu ouvert. Touchez l’écran du téléphone pour naviguer dans le menu.'}</p>
      <button class="x-btn" type="button" aria-label="Fermer l'aperçu"><svg class="i" aria-hidden="true"><use href="#i-x"/></svg></button></div>`;
    document.body.appendChild(m); body.classList.add('lock');
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('on')));
    const close = () => { m.classList.remove('on'); body.classList.remove('lock'); setTimeout(() => m.remove(), 300); document.removeEventListener('keydown', esc); };
    const esc = ev => { if (ev.key === 'Escape') close(); };
    $('.x-btn', m).addEventListener('click', close); $('.x-btn', m).focus();
    m.addEventListener('click', ev => { if (ev.target === m) close(); });
    document.addEventListener('keydown', esc);
  }));
})();
