// Oxmere — small UI helpers (design demo only)
document.addEventListener('click', e => {
  const s = e.target.closest('.size-grid button:not(:disabled)');
  if (s) { s.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('on')); s.classList.add('on'); }
  const sw = e.target.closest('.swatch');
  if (sw) sw.classList.toggle('on');
  const q = e.target.closest('.qty button');
  if (q) {
    const i = q.parentElement.querySelector('input');
    i.value = Math.max(1, (parseInt(i.value) || 1) + (q.dataset.d === '+' ? 1 : -1));
  }
  const w = e.target.closest('.p-wish');
  if (w) { e.preventDefault(); w.querySelector('path').setAttribute('fill', w.classList.toggle('on') ? 'currentColor' : 'none'); }
  const t = e.target.closest('.pd-thumb');
  if (t) { document.querySelector('.pd-gallery img').src = t.src; }
});
document.querySelectorAll('.newsletter').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault(); f.outerHTML = '<p class="mb-0 py-2">Thanks, you are subscribed.</p>';
}));

// Sticky bar: slides in once the main header has scrolled out of view
const siteHeader = document.getElementById('siteHeader');
const stickyBar = document.getElementById('stickyBar');
if (siteHeader && stickyBar) {
  const syncSticky = () => {
    const show = siteHeader.getBoundingClientRect().bottom <= 0;
    stickyBar.classList.toggle('is-visible', show);
    stickyBar.inert = !show;
  };
  addEventListener('scroll', syncSticky, { passive: true });
  addEventListener('resize', syncSticky);
  syncSticky();
}

// Side menu: drill down into a category panel, back out, reset on close
const sideMenu = document.getElementById('mobileNav');
if (sideMenu) {
  const panels = sideMenu.querySelector('.sm-panels');
  sideMenu.addEventListener('click', e => {
    const open = e.target.closest('[data-sm-open]');
    if (open) {
      panels.querySelectorAll('.sm-sub').forEach(p => p.classList.toggle('is-active', p.id === open.dataset.smOpen));
      panels.classList.add('sub-open');
      document.getElementById(open.dataset.smOpen).querySelector('.sm-back').focus({ preventScroll: true });
    }
    if (e.target.closest('[data-sm-back]')) panels.classList.remove('sub-open');
  });
  sideMenu.addEventListener('hidden.bs.offcanvas', () => {
    panels.classList.remove('sub-open');
    panels.querySelectorAll('.sm-sub').forEach(p => p.classList.remove('is-active'));
  });
}

// Home "New Arrivals" carousel: arrows scroll by one card and hide at either end
document.querySelectorAll('.h-track').forEach(track => {
  const btns = document.querySelectorAll(`.h-car-btn[data-car="${track.id}"]`);
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    btns.forEach(b => { b.hidden = b.dataset.dir === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max; });
  };
  btns.forEach(b => b.addEventListener('click', () => {
    const card = track.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
    track.scrollBy({ left: step * Number(b.dataset.dir), behavior: 'smooth' });
  }));
  track.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  sync();
});
