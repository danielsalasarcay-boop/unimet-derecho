/* Galería: carrusel con flechas, deslizamiento nativo y trackpad */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Galería: carrusel con flechas y deslizamiento nativo
  $$('.js-gal').forEach(g => {
    const tr = $('.gal__track', g), bar = $('.gal__bar i', g), bs = $$('.gal__btn', g);
    // Las fotos más verticales que el recuadro se muestran completas
    $$('img', tr).forEach(img => {
      const fit = () => { if (img.naturalWidth / img.naturalHeight < (tr.clientWidth / tr.clientHeight) * .8) { img.parentNode.classList.add('gal__s--v'); img.parentNode.style.setProperty('--bg', `url("${img.currentSrc || img.src}")`); } };
      img.complete && img.naturalWidth ? fit() : img.addEventListener('load', fit, { once: true });
    });
    const n = () => tr.children.length, i = () => Math.round(tr.scrollLeft / (tr.clientWidth || 1));
    const sync = () => {
      const k = i(), m = n();
      bar.style.width = (100 / m) + '%';
      bar.style.transform = `translateX(${k * 100}%)`;
      bs[0].disabled = k <= 0; bs[1].disabled = k >= m - 1;
    };
    const go = d => {
      const k = Math.max(0, Math.min(n() - 1, i() + d));
      tr.scrollTo({ left: k * tr.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    };
    bs.forEach(b => b.addEventListener('click', () => go(+b.dataset.d)));
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
