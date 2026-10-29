/* Galería: carrusel con flechas, deslizamiento nativo y trackpad */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.js-gal').forEach(g => {
    const tr = $('.gal__track', g), bar = $('.gal__bar', g), bs = $$('.gal__btn', g);
    // Las fotos más verticales que el recuadro se muestran completas
    $$('img', tr).forEach(img => {
      const fit = () => { if (img.naturalWidth / img.naturalHeight < (tr.clientWidth / tr.clientHeight) * .8) { img.parentNode.classList.add('gal__s--v'); img.parentNode.style.setProperty('--bg', `url("${img.currentSrc || img.src}")`); } };
      img.complete && img.naturalWidth ? fit() : img.addEventListener('load', fit, { once: true });
    });
    const n = () => tr.children.length, i = () => Math.round(tr.scrollLeft / (tr.clientWidth || 1));
    // La línea marca el avance continuo; el punto se arrastra para recorrer las fotos
    const max = () => Math.max(1, tr.scrollWidth - tr.clientWidth);
    const sync = () => {
      const k = i(), m = n();
      bar.style.setProperty('--p', Math.min(1, Math.max(0, tr.scrollLeft / max())));
      bar.setAttribute('aria-valuemax', m); bar.setAttribute('aria-valuenow', k + 1);
      bs[0].disabled = k <= 0; bs[1].disabled = k >= m - 1;
    };
    const go = d => {
      const k = Math.max(0, Math.min(n() - 1, i() + d));
      tr.scrollTo({ left: k * tr.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    };
    bs.forEach(b => b.addEventListener('click', () => go(+b.dataset.d)));
    const to = k => tr.scrollTo({ left: k * tr.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    let drag = false;
    const seek = e => {
      const r = bar.getBoundingClientRect();
      tr.scrollLeft = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * max();
    };
    bar.addEventListener('pointerdown', e => {
      drag = true; bar.setPointerCapture(e.pointerId); bar.classList.add('is-drag');
      tr.style.scrollSnapType = 'none'; seek(e); e.preventDefault();
    });
    bar.addEventListener('pointermove', e => { if (drag) seek(e); });
    const end = () => {
      if (!drag) return;
      drag = false; bar.classList.remove('is-drag');
      const k = i(); tr.style.scrollSnapType = ''; to(k);
    };
    bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
    bar.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (e.key === 'Home') { e.preventDefault(); to(0); } else if (e.key === 'End') { e.preventDefault(); to(n() - 1); } else if (d) { e.preventDefault(); go(d); }
    });
    // Trackpad o rueda horizontal: un gesto avanza una foto (el snap nativo de Chrome devuelve los pasos cortos)
    let acc = 0, lock = 0;
    tr.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      acc += e.deltaX;
      if (Math.abs(acc) > 30) { go(Math.sign(acc)); acc = 0; lock = now + 650; }
    }, { passive: false });
    tr.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync);
    sync();
  });

  // Título trazado, como en Profesores y el CED
  const lines = $$('.js-gal-ln');
  if (lines.length && window.traceTitle?.ok && typeof gsap !== 'undefined') {
    gsap.set(lines, { opacity: 0 });
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() =>
      traceTitle(lines, innerWidth <= 820 ? { delay: .25, draw: .9, quick: true } : { delay: .3, draw: 1.8, calm: true })));
  }

  // Brocardos
  $$('.broc').forEach(b => b.addEventListener('click', () => b.classList.toggle('is-open')));
})();
