/* Escuela de Derecho · UNIMET — píldoras deslizantes (al estilo de D&A Lab).
   Header: sigue al cursor y, sin cursor, se queda en la sección visible (o en la página actual).
   Footer: solo con el cursor, por encima de los enlaces y sin cambiar ninguna medida.
   Alternan lacre de la Escuela y naranja UNIMET. */

(() => {
  const pills = (nav, { padX = 0, padY = 0, track = false } = {}) => {
    if (!nav) return;
    const links = [...nav.querySelectorAll('a')];
    const pill = document.createElement('span');
    pill.className = 'nav__pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.prepend(pill);

    let hover = null;
    let active = track ? links.find(a => a.hasAttribute('aria-current')) || null : null;
    const place = () => {
      const a = hover || active;
      links.forEach(l => l.classList.toggle('is-pill', l === a));
      if (!a) { pill.style.opacity = 0; return; }
      const first = pill.style.opacity !== '1';
      if (first) pill.style.transition = 'none';
      pill.style.width = (a.offsetWidth + padX * 2) + 'px';
      pill.style.height = (a.offsetHeight + padY * 2) + 'px';
      pill.style.transform = `translate(${a.offsetLeft - padX}px, ${a.offsetTop - padY}px)`;
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
    const bySection = track ? links
      .map(a => [a, a.getAttribute('href')])
      .filter(([, h]) => h.startsWith('#') && document.querySelector(h))
      .map(([a, h]) => [a, document.querySelector(h)]) : [];
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
  };

  pills(document.querySelector('.header__nav'), { track: true });
  pills(document.querySelector('.footer__nav'), { padX: 11, padY: 6 });
})();
