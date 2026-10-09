// Oxmere — small UI helpers (design demo only)
document.addEventListener('click', e => {
  const s = e.target.closest('.pd-size:not(:disabled)');
  if (s) s.parentElement.querySelectorAll('.pd-size').forEach(b => {
    b.classList.toggle('is-on', b === s); b.setAttribute('aria-pressed', b === s);
  });
  const q = e.target.closest('.qty button');
  if (q) {
    const i = q.parentElement.querySelector('input');
    i.value = Math.max(1, (parseInt(i.value) || 1) + (q.dataset.d === '+' ? 1 : -1));
  }
  const fc = e.target.closest('.f-clear');
  if (fc) document.querySelectorAll('.f-check input, .f-sale input').forEach(i => { i.checked = false; });
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

// Product gallery: thumbnails scroll the image track; swiping the track updates the active thumbnail
const pdTrack = document.getElementById('pdTrack');
if (pdTrack) {
  const thumbs = [...document.querySelectorAll('.pd-thumb')];
  const zoomImg = document.getElementById('pdZoomImg');
  const current = () => Math.round(pdTrack.scrollLeft / pdTrack.clientWidth);
  thumbs.forEach(t => t.addEventListener('click', () => {
    pdTrack.scrollTo({ left: pdTrack.clientWidth * Number(t.dataset.slide), behavior: 'smooth' });
  }));
  pdTrack.addEventListener('scroll', () => {
    const i = current();
    thumbs.forEach((t, n) => t.classList.toggle('is-active', n === i));
  }, { passive: true });
  document.getElementById('pdZoom')?.addEventListener('show.bs.modal', () => {
    const img = pdTrack.children[current()]?.querySelector('img');
    if (img && zoomImg) zoomImg.src = img.src.replace('large_responsive', 'xlarge_responsive');
  });
}

// Recommendation carousels: arrows page by one card, the bar tracks scroll position
document.querySelectorAll('.rec-track').forEach(track => {
  const btns = document.querySelectorAll(`[data-rec="${track.id}"]`);
  const bar = document.querySelector(`[data-progress="${track.id}"]`);
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth;
    const view = track.clientWidth / track.scrollWidth;
    if (bar) { bar.style.width = `${view * 100}%`; bar.style.left = `${max > 0 ? (track.scrollLeft / track.scrollWidth) * 100 : 0}%`; }
    btns.forEach(b => { b.disabled = b.dataset.dir === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max - 2; });
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

// Checkout: unlock recipient + payment once the account step is done, float select labels,
// default the delivery date, and keep the order summary totals in step with the quantity
const coSteps = document.getElementById('coSteps');
if (coSteps) {
  const unlock = () => { coSteps.classList.remove('is-locked'); coSteps.querySelector('input,select')?.focus({ preventScroll: true }); };
  document.querySelector('[data-co-guest]')?.addEventListener('click', unlock);
  document.getElementById('coAccountForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('coIdentifier');
    if (id.value.trim()) unlock(); else id.reportValidity();
  });
  coSteps.addEventListener('submit', e => e.preventDefault());

  document.querySelectorAll('[data-co-float]').forEach(sel => {
    const sync = () => sel.closest('.co-select').classList.toggle('is-floated', !!sel.value);
    sel.addEventListener('change', sync); sync();
  });
  const city = document.getElementById('coCity'), area = document.getElementById('coArea');
  city?.addEventListener('change', () => { area.disabled = !city.value; });

  const date = document.getElementById('coDate');
  if (date) {
    const iso = d => d.toISOString().slice(0, 10), day = 864e5, now = Date.now();
    date.min = iso(new Date(now + day)); date.value = iso(new Date(now + 3 * day));
  }

  const fmt = n => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  document.querySelectorAll('.co-qty').forEach(box => {
    const count = box.querySelector('[data-co-count]'), price = Number(box.dataset.price);
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-co-qty]'); if (!b) return;
      const q = Math.max(1, Number(count.textContent) + Number(b.dataset.coQty));
      count.textContent = q; box.classList.toggle('is-multi', q > 1);
      const sub = price * q, vat = Math.round(sub * 7.5) / 100;
      document.querySelector('[data-co-sub]').textContent = fmt(sub);
      document.querySelector('[data-co-vat]').textContent = fmt(vat);
      document.querySelectorAll('[data-co-total]').forEach(t => { t.textContent = fmt(sub + vat); });
    });
  });
}
