/* Escuela de Derecho · UNIMET — página de Profesores
   Comparte header, índice, contacto y footer con la portada; sin loader ni hero fijo. */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // El título "Profesores" ocupa todo el ancho sin cortarse
  const fitTitle = () => {
    const h1 = $('.ph__title'), word = $('.js-ph-word');
    h1.style.fontSize = '100px';
    const w = word.getBoundingClientRect().width / 100;
    const col = h1.clientWidth;
    h1.style.fontSize = Math.min((col - 8) / w, innerHeight * .42, 300).toFixed(1) + 'px';
  };
  fitTitle();

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: 0 });
    else (typeof target === 'number' ? window.scrollTo({ top: target, behavior: 'smooth' }) : target.scrollIntoView({ behavior: 'smooth' }));
  };

  /* ---------- Header ---------- */
  const header = $('.header');
  let sectionLight = false;
  const paintHeader = () => header.classList.toggle('is-light', sectionLight || document.body.classList.contains('is-menu'));
  let lastY = 0;
  const onScroll = (y) => {
    const menuOpen = document.body.classList.contains('is-menu');
    header.classList.toggle('is-solid', y > 10);
    if (!menuOpen) header.classList.toggle('is-hidden', y > lastY && y > innerHeight * .4 && y > 80);
    lastY = y;
  };
  if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  $$('main > section[data-head], .footer').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 36px', end: 'bottom 36px',
      onToggle: s => { if (s.isActive) { sectionLight = sec.dataset.head === 'light'; paintHeader(); } }
    });
  });

  /* ---------- Índice ---------- */
  const btn = $('.header__index');
  const menu = $('.indice');
  let menuTl = null;
  const toggleMenu = (open) => {
    document.body.classList.toggle('is-menu', open);
    btn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    header.classList.remove('is-hidden');
    paintHeader();
    if (open) { lenis?.stop(); } else { lenis?.start(); }
    menuTl?.kill();
    menuTl = open
      ? gsap.timeline()
        .set(menu, { visibility: 'visible' })
        .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' })
        .from('.indice__list li', { y: 40, autoAlpha: 0, duration: .8, stagger: .05, ease: 'expo.out' }, .35)
      : gsap.timeline()
        .to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'expo.inOut' })
        .set(menu, { visibility: 'hidden' })
        .add(paintHeader);
  };
  btn.addEventListener('click', () => toggleMenu(!document.body.classList.contains('is-menu')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('is-menu')) toggleMenu(false); });

  /* ---------- Anclas ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const t = id === '#inicio' ? 0 : $(id);
    if (t === null) return;
    e.preventDefault();
    if (document.body.classList.contains('is-menu')) toggleMenu(false);
    scrollTo(t === 0 ? 0 : t);
  });

  /* ---------- Animaciones ---------- */
  function anims() {
    // Entrada: el título sube letra por letra
    const split = SplitText.create('.js-ph-word', { type: 'chars', charsClass: 'ch' });
    if (!reduce) {
      if (window.traceTitle) gsap.set('.js-ph-word', { opacity: 0 });
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.header', { yPercent: -120 }, { yPercent: 0, duration: 1.1, clearProps: 'transform' }, .1)
        .from('.ph__top', { autoAlpha: 0, y: 16, duration: 1 }, .15)
        .add(() => window.traceTitle ? traceTitle([$('.js-ph-word')], { draw: 2.6 }) : null, .25)
        .from('.js-ph-fade', { autoAlpha: 0, y: 24, duration: 1.1, stagger: .08 }, .6);
    }

    // Títulos por líneas
    $$('.js-lines').forEach(el => {
      const s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
      if (window.traceTitle?.ok && el.matches('.contacto__title')) {
        gsap.set(s.lines, { opacity: 0 });
        ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: () => traceTitle(s.lines) });
      } else if (!reduce) gsap.from(s.lines, { yPercent: 110, duration: 1.25, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
    if (reduce) return;

    $$('.js-ph-up').forEach(el => gsap.from(el, { y: 28, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));

    // Recuadros: se abren de abajo hacia arriba, en tanda por fila
    const reveal = (photos) => gsap.timeline()
      .fromTo(photos, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, stagger: .1, ease: 'expo.inOut' })
      .from(photos.map(p => $('.prof__ini, img', p)), { yPercent: 30, autoAlpha: 0, duration: 1.4, stagger: .1, ease: 'expo.out', clearProps: 'transform' }, .45);
    const big = $('.js-prof-photo');
    gsap.set(big, { clipPath: 'inset(100% 0 0 0)' });
    ScrollTrigger.create({ trigger: big, start: 'top 85%', once: true, onEnter: () => reveal([big]) });

    const cards = $$('.claustro .prof');
    gsap.set(cards.map(c => $('.prof__photo', c)), { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(cards.map(c => [...$$('.prof__name, .prof__role, .prof__bio', c)]).flat(), { autoAlpha: 0, y: 18 });
    ScrollTrigger.batch(cards, {
      start: 'top 88%', once: true,
      onEnter: batch => {
        reveal(batch.map(c => $('.prof__photo', c)));
        gsap.to(batch.map(c => [...$$('.prof__name, .prof__role, .prof__bio', c)]).flat(), { autoAlpha: 1, y: 0, duration: 1, stagger: .05, ease: 'expo.out', delay: .5 });
      }
    });

    // Leve inclinación de los recuadros con el mouse
    if (fine) $$('.prof__photo').forEach(ph => {
      const rx = gsap.quickTo(ph, 'rotateX', { duration: .8, ease: 'power3.out' });
      const ry = gsap.quickTo(ph, 'rotateY', { duration: .8, ease: 'power3.out' });
      gsap.set(ph, { transformPerspective: 900 });
      ph.addEventListener('pointermove', e => {
        const r = ph.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - .5) * -5);
        ry(((e.clientX - r.left) / r.width - .5) * 6);
      });
      ph.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- Footer: la palabra se llena de lacre ---------- */
  function footWord() {
    const fw = $('.js-footword');
    fw.innerHTML = [...fw.dataset.word].map((c, i) =>
      `<span class="fl" style="--i:${i}">${c}<span class="fl__ink">${c}</span><span class="fl__glow">${c}</span></span>`).join('');
    const letters = $$('.fl', fw);
    if (fine && !reduce) {
      const foot = $('.footer');
      let tx = 0, cx = 0, active = false;
      const light = () => {
        cx += (tx - cx) * .12;
        const pad = parseFloat(getComputedStyle(fw).fontSize) * .22;
        letters.forEach(l => l.style.setProperty('--lx', (cx - l.getBoundingClientRect().left + pad).toFixed(1) + 'px'));
      };
      foot.addEventListener('pointerenter', e => { cx = tx = e.clientX; if (!active) { active = true; gsap.ticker.add(light); } });
      foot.addEventListener('pointermove', e => { tx = e.clientX; });
      foot.addEventListener('pointerleave', () => {
        active = false; gsap.ticker.remove(light);
        letters.forEach(l => l.style.setProperty('--lx', '-3em'));
      });
    }
    gsap.from(letters, {
      yPercent: 26, autoAlpha: 0, filter: 'blur(14px)', duration: 1.6, stagger: .06, ease: 'expo.out',
      clearProps: 'filter', scrollTrigger: { trigger: fw, start: 'top 92%' }
    });
    const fill = gsap.timeline({
      scrollTrigger: {
        trigger: fw, start: 'top 98%', end: 'max', scrub: 1.4,
        onUpdate: s => {
          fw.classList.toggle('is-full', s.progress > .995);
          fw.classList.toggle('is-filling', s.progress > .001 && s.progress <= .995);
        }
      }
    });
    letters.forEach((l, i) => fill.to(l, {
      '--p': 1, duration: 1, ease: 'power1.inOut',
      onUpdate() {
        const p = this.progress();
        l.style.setProperty('--g', p > .02 && p < .97 ? 1 : 0);
        if (p > .995 && !l.classList.contains('is-done')) l.classList.add('is-done');
        if (p < .9) l.classList.remove('is-done');
      }
    }, i * .3));
  }

  /* ---------- Arranque ---------- */
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() => {
    anims(); fitTitle(); footWord(); ScrollTrigger.refresh();
  }));
  let rw = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== rw) { rw = innerWidth; fitTitle(); } });
})();
