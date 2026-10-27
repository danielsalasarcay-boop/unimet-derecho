/* Escuela de Derecho · UNIMET — píldora del header (al estilo de D&A Lab).
   Sigue al cursor entre los enlaces; sin cursor se queda en la sección visible
   (o en la página actual). Alterna lacre de la Escuela y naranja UNIMET. */

(() => {
  const nav = document.querySelector('.header__nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const pill = document.createElement('span');
  pill.className = 'nav__pill';
  pill.setAttribute('aria-hidden', 'true');
  nav.prepend(pill);

  let hover = null;
  let active = links.find(a => a.hasAttribute('aria-current')) || null;
  const place = () => {
    const a = hover || active;
    links.forEach(l => l.classList.toggle('is-pill', l === a));
    if (!a) { pill.style.opacity = 0; return; }
    const first = pill.style.opacity !== '1';
    if (first) pill.style.transition = 'none';
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
    pill.classList.toggle('is-uni', links.indexOf(a) % 2 === 1);
    if (first) { pill.offsetWidth; pill.style.transition = ''; }
    pill.style.opacity = 1;
  };

  links.forEach(a => {
    a.addEventListener('pointerenter', () => { hover = a; place(); });
    a.addEventListener('focus', () => { hover = a; place(); });
    a.addEventListener('blur', () => { hover = null; place(); });
  });
  nav.addEventListener('pointerleave', () => { hover = null; place(); });

  // Sección activa: la que cruza la franja central de la pantalla
  const bySection = links
    .map(a => [a, a.getAttribute('href')])
    .filter(([, h]) => h.startsWith('#') && document.querySelector(h))
    .map(([a, h]) => [a, document.querySelector(h)]);
  if (bySection.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const hit = bySection.find(([, s]) => s === e.target);
        if (e.isIntersecting) active = hit[0];
        else if (active === hit[0]) active = null;
      });
      place();
    }, { rootMargin: '-45% 0px -50% 0px' });
    bySection.forEach(([, s]) => io.observe(s));
  }

  addEventListener('resize', place);
  (document.fonts?.ready || Promise.resolve()).then(place);
})();
