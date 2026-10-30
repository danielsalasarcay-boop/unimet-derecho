/* Escuela de Derecho · UNIMET — Clínica Jurídica: título trazado, como en Galería y el CED */
(() => {
  const lines = [...document.querySelectorAll('.js-clj-ln')];
  if (!lines.length || !window.traceTitle?.ok || typeof gsap === 'undefined') return;
  gsap.set(lines, { opacity: 0 });
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() =>
    traceTitle(lines, innerWidth <= 820 ? { delay: .25, draw: .9, stagger: .12, quick: true } : { delay: .3, draw: 1.7, stagger: .22, calm: true })));
})();
