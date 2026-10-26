/* Escuela de Derecho · UNIMET
   GSAP + ScrollTrigger + SplitText + Lenis. Las secciones fijas usan
   position:sticky (no pin de ScrollTrigger) para que iOS no deje bloques flotando. */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  if (!hasGsap) {
    document.body.classList.remove('is-loading');
    $('.loader')?.remove();
    buildMalla();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();
  const isDesk = '(min-width: 821px)';

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: 0 });
    else (typeof target === 'number' ? window.scrollTo({ top: target, behavior: 'smooth' }) : target.scrollIntoView({ behavior: 'smooth' }));
  };

  /* ---------- Plan de estudios (datos oficiales del plan) ---------- */
  function buildMalla() {
    const T = [
      [['Introducción al Derecho', 'fund'], ['Lógica y Argumentación', 'fund'], ['Inglés IV', 'integral'], ['Pensamiento Computacional', 'integral'], ['Competencias para Emprender', 'integral']],
      [['Análisis Jurídico', 'fund'], ['Personas', 'civil'], ['Inglés V', 'integral'], ['Historia del Pensamiento Jurídico', 'fund'], ['Investigación y Sustentabilidad', 'integral']],
      [['Bienes', 'civil'], ['Derechos Reales', 'civil'], ['Derecho Constitucional', 'publico'], ['Introducción a la Política', 'publico'], ['Ideas Emprendedoras', 'integral']],
      [['Sociología Jurídica', 'fund'], ['Obligaciones', 'civil'], ['Sistema de Justicia Constitucional', 'publico'], ['Derecho Internacional Público', 'intl'], ['Electiva', 'el']],
      [['Negocio Jurídico', 'civil'], ['Responsabilidad Civil', 'civil'], ['Derecho del Trabajo', 'empresa'], ['Tópicos de Derecho Internacional Público', 'intl'], ['Fundamentos del Derecho Procesal', 'proc']],
      [['Instituciones y Derecho de Familia', 'civil'], ['Derecho Mercantil', 'empresa'], ['Derecho Colectivo del Trabajo', 'empresa'], ['Derechos Humanos', 'publico'], ['Derecho Procesal Civil', 'proc']],
      [['Contratación', 'civil'], ['Tópicos de Derecho Mercantil', 'empresa'], ['Derecho Comparado', 'fund'], ['Derecho Penal', 'proc'], ['Derecho Administrativo', 'publico']],
      [['Garantías', 'civil'], ['Sucesiones', 'civil'], ['Gestión Profesional', 'empresa'], ['Derecho Penal de los Negocios', 'proc'], ['Derecho Procesal Administrativo', 'proc']],
      [['Derecho Internacional Privado', 'intl'], ['Mundo Global: Tendencias y Transformaciones', 'intl'], ['Seminario Profesional', 'integral'], ['Derecho Procesal Penal', 'proc'], ['Derecho Tributario', 'publico']],
      [['Tópicos de Derecho Internacional Privado', 'intl'], ['Venezuela: Identidad y Contexto', 'integral'], ['Taller de Trabajo de Grado', 'integral'], ['Argumentos y Pruebas', 'proc'], ['Tópicos de Derecho Tributario', 'publico']],
      [['Ética de los Negocios y del Derecho', 'fund'], ['Medios Alternativos de Resolución de Conflictos', 'proc'], ['Derecho Energético', 'publico'], ['Procedimientos Especiales', 'proc'], ['Electiva', 'el']],
      [['Introducción al Análisis Económico del Derecho', 'fund'], ['Derecho de las Nuevas Tecnologías', 'empresa'], ['Electiva', 'el'], ['Electiva', 'el'], ['Electiva', 'el']]
    ];
    const R = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const host = $('.js-malla');
    if (!host) return;
    host.innerHTML = T.map((t, i) => `
      <div class="tri">
        <div class="tri__h"><span class="tri__n">${R[i]}</span><span class="tri__k">Trim.</span></div>
        ${t.map(([n, a]) => `<button class="asig${a === 'el' ? ' asig--el' : ''}" data-area="${a}">${n}</button>`).join('')}
      </div>`).join('');

    const malla = $('.malla');
    const chips = $$('.chip');
    const setArea = (area) => {
      malla.dataset.area = area;
      chips.forEach(c => c.classList.toggle('is-on', c.dataset.area === area));
      $$('.asig', host).forEach(a => a.classList.toggle('is-match', area !== 'all' && a.dataset.area === area));
    };
    chips.forEach(c => c.addEventListener('click', () => setArea(c.dataset.area)));
    host.addEventListener('click', (e) => {
      const a = e.target.closest('.asig');
      if (!a || a.dataset.area === 'el') return;
      setArea(malla.dataset.area === a.dataset.area ? 'all' : a.dataset.area);
    });
  }
  buildMalla();

  /* ---------- Hero: el isotipo como ventana ---------- */
  const ISO = [
    [[0, 0], [62, 0], [62, 214.3], [0, 236]],
    [[0, 269], [62, 247.3], [62, 448], [0, 448]],
    [[94, 0], [156, 0], [156, 181.4], [94, 203.1]],
    [[94, 236.1], [156, 214.4], [156, 448], [94, 448]],
    [[188, 203.2], [250, 181.5], [250, 448], [188, 448]]
  ];
  const hero = { scaleMax: 20, origin: [0, 0] };
  const cover = $('.hero__cover');
  const coverPath = $('.js-cover');
  const stage = $('.hero__stage');
  const shade = document.createElement('div');
  shade.className = 'hero__shade';
  Object.assign(shade.style, { position: 'absolute', inset: '0', background: 'linear-gradient(180deg, rgba(20,20,22,.15), rgba(20,20,22,.72))', opacity: 0, pointerEvents: 'none' });
  $('.hero__photo').after(shade);

  function layoutHero() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const slot = $('.js-iso-slot').getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const sw = slot.width, sh = Math.max(slot.height, 120);
    const k = Math.min(sw / 250, sh / 448);
    const x0 = slot.left - sr.left + (sw - 250 * k) / 2;
    const y0 = slot.top - sr.top + (sh - 448 * k) / 2;
    const p = ISO.map(poly => 'M' + poly.map(([x, y]) => `${(x0 + x * k).toFixed(2)} ${(y0 + y * k).toFixed(2)}`).join('L') + 'Z').join('');
    cover.setAttribute('viewBox', `0 0 ${W} ${H}`);
    coverPath.setAttribute('d', `M-40000 -40000H40000V40000H-40000Z${p}`);
    const px = x0 + 125 * k, py = y0 + 340 * k;
    hero.origin = [px, py];
    hero.scaleMax = Math.max(px / (31 * k), (W - px) / (31 * k), py / (103.9 * k), (H - py) / (108 * k)) * 1.06;
    gsap.set(cover, { transformOrigin: `${px}px ${py}px` });
  }

  /* ---------- Loader ---------- */
  function intro() {
    const loader = $('.loader');
    const titleSplit = SplitText.create('.js-hero-word', { type: 'chars', mask: 'chars', charsClass: 'ch' });
    gsap.set(titleSplit.chars, { yPercent: 110 });
    gsap.set(['.hero__meta', '.hero__kicker', '.hero__lede', '.hero__scroll'], { autoAlpha: 0, y: 24 });
    gsap.set('.header', { yPercent: -120 });
    gsap.set(cover, { scale: 1.06 });

    const done = () => {
      document.body.classList.remove('is-loading');
      loader?.remove();
      lenis?.start();
      ScrollTrigger.refresh();
    };

    if (reduce) {
      gsap.set(titleSplit.chars, { yPercent: 0 });
      gsap.set(['.hero__meta', '.hero__kicker', '.hero__lede', '.hero__scroll'], { autoAlpha: 1, y: 0 });
      gsap.set(['.header', cover], { clearProps: 'transform' });
      done();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: done });
    tl.call(() => loader.classList.add('s1'), null, .15)
      .call(() => loader.classList.add('s2'), null, .45)
      .call(() => loader.classList.add('s3'), null, .7)
      .to('.loader__unimet', { opacity: .9, duration: .8 }, .9)
      .to('.loader__logo', { scale: .94, duration: .18, ease: 'power2.in' }, 1.75)
      .to('.loader__logo', { scale: 1, duration: .9, ease: 'elastic.out(1, .5)' }, 1.93)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.15, ease: 'expo.inOut' }, 2.25)
      .to(cover, { scale: 1, duration: 1.6, ease: 'expo.out' }, 2.55)
      .to(titleSplit.chars, { yPercent: 0, duration: 1.3, stagger: .045 }, 2.75)
      .to(['.hero__meta', '.hero__kicker', '.hero__lede', '.hero__scroll'], { autoAlpha: 1, y: 0, duration: 1.1, stagger: .08 }, 2.9)
      .to('.header', { yPercent: 0, duration: 1.1 }, 3.0);
  }

  /* ---------- Header ---------- */
  const header = $('.header');
  let heroLight = false;
  let sectionLight = false;
  const paintHeader = () => header.classList.toggle('is-light', heroLight || sectionLight);
  let lastY = 0;
  const onScroll = (y) => {
    const heroEnd = $('.hero').offsetHeight - innerHeight;
    const menuOpen = document.body.classList.contains('is-menu');
    header.classList.toggle('is-solid', y > heroEnd + 10);
    if (!menuOpen) header.classList.toggle('is-hidden', y > lastY && y > innerHeight * .4 && y > 80);
    lastY = y;
    $('.runhead').classList.toggle('is-on', y > heroEnd);
  };
  if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  $$('main > section[data-head]:not(.hero), .footer').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 36px', end: 'bottom 36px',
      onToggle: s => { if (s.isActive) { sectionLight = sec.dataset.head === 'light'; paintHeader(); } }
    });
  });

  /* ---------- Encabezado corrido ---------- */
  const runTxt = $('.js-runhead');
  $$('[data-run]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 60%', end: 'bottom 60%',
      onToggle: s => { if (s.isActive) runTxt.textContent = sec.dataset.run; }
    });
  });
  gsap.to('.js-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  /* ---------- Índice ---------- */
  const btn = $('.header__index');
  const menu = $('.indice');
  let menuTl = null;
  const toggleMenu = (open) => {
    document.body.classList.toggle('is-menu', open);
    btn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    header.classList.remove('is-hidden');
    header.classList.toggle('is-light', open || heroLight || sectionLight);
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

  /* ---------- Animaciones de scroll ---------- */
  function scrollAnims() {
    // Hero: entrar por la columna central del isotipo
    layoutHero();
    const zoom = { p: 0 };
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true,
        invalidateOnRefresh: true,
        onRefresh: layoutHero,
        onUpdate: s => { const l = s.progress > .55 && s.progress < 1; if (l !== heroLight) { heroLight = l; paintHeader(); } }
      }
    })
      .to('.hero__copy', { yPercent: -8, autoAlpha: 0, ease: 'power2.in', duration: .22 }, 0)
      .to(zoom, {
        p: 1, duration: .62, ease: 'power2.inOut',
        onUpdate: () => gsap.set(cover, { scale: Math.pow(hero.scaleMax, zoom.p) })
      }, .04)
      .to('.hero__photo img', { scale: 1, duration: .7, ease: 'none' }, 0)
      .to(cover, { autoAlpha: 0, duration: .04 }, .66)
      .to(shade, { opacity: 1, duration: .2 }, .6)
      .fromTo('.hero__after', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: .22, ease: 'power2.out' }, .7)
      .to({}, { duration: .08 });

    // Títulos por líneas
    $$('.js-lines').forEach(el => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.25, stagger: .09, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    // Apariciones suaves
    $$('.js-fade').forEach(el => {
      gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // Imágenes que se revelan
    $$('.reveal-img').forEach(fig => {
      const img = $('img', fig);
      gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 82%' } })
        .from(fig, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut' })
        .to(img, { scale: 1, duration: 1.8, ease: 'expo.out' }, .2);
    });

    // Preámbulo: palabra por palabra
    const words = SplitText.create('.js-words', { type: 'words', wordsClass: 'w' });
    gsap.to(words.words, {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: '.preambulo__text', start: 'top 78%', end: 'bottom 52%', scrub: true }
    });

    // Cifras
    $$('.js-count').forEach(el => {
      const to = +el.dataset.to;
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 2, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
        onUpdate: () => { el.textContent = String(Math.round(o.v)).padStart(String(to).length, '0'); }
      });
    });

    // Malla
    gsap.from('.tri', {
      y: 40, autoAlpha: 0, duration: 1, stagger: .05, ease: 'expo.out',
      scrollTrigger: { trigger: '.malla', start: 'top 85%' }
    });

    // Pirámide
    gsap.from('.nivel', {
      scaleX: 0, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out',
      scrollTrigger: { trigger: '.piramide__fig', start: 'top 80%' }
    });

    // Comunidad: parallax
    gsap.fromTo('.comunidad__img', { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.comunidad__hero', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    // Footer: la palabra se llena de lacre
    ScrollTrigger.create({ trigger: '.footer', start: 'top 70%', onToggle: s => $('.runhead').classList.toggle('is-off', s.isActive) });
    gsap.fromTo('.js-footword', { '--fill': '100%' }, {
      '--fill': '0%', ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true }
    });

    // Marquee de brocardos
    const row = $('.js-marquee');
    row.innerHTML += row.innerHTML;
    const loop = gsap.to(row, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      trigger: '.brocardos', start: 'top bottom', end: 'bottom top',
      onUpdate: s => {
        const v = gsap.utils.clamp(-6, 6, s.getVelocity() / 400);
        gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: .3, overwrite: true });
        gsap.to(loop, { timeScale: 1, duration: 1.2, delay: .3 });
      }
    });

    mm.add(isDesk, () => {
      // Competencias en horizontal
      const intro = $('.comp__intro'), rail = $('.comp__rail'), arts = $$('.art');
      const dist = () => intro.offsetWidth + rail.scrollWidth - innerWidth;
      const n = $('.js-art-n');
      gsap.to([intro, rail], {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.comp__track', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
          onUpdate: s => {
            const i = Math.min(arts.length - 1, Math.round(s.progress * (arts.length - 1) * 1.05));
            arts.forEach((a, j) => a.classList.toggle('is-on', j <= i));
            n.textContent = String(i + 1).padStart(2, '0');
          }
        }
      });

      // Cómo leer una sentencia
      const pasos = $$('.paso'), blks = $$('.doc__blk');
      const setPaso = i => {
        pasos.forEach((p, j) => p.classList.toggle('is-on', j === i));
        blks.forEach((b, j) => b.classList.toggle('is-on', j === i));
      };
      setPaso(0);
      ScrollTrigger.create({
        trigger: '.lectura', start: 'top top', end: 'bottom bottom',
        onUpdate: s => setPaso(Math.min(4, Math.floor(s.progress * 5)))
      });
      gsap.fromTo('.doc__paper', { rotateX: 14, rotateY: -16, rotateZ: 3 }, {
        rotateX: 2, rotateY: -4, rotateZ: 0, ease: 'none',
        scrollTrigger: { trigger: '.lectura', start: 'top top', end: 'bottom bottom', scrub: true }
      });

      // Perfil: la imagen se desplaza dentro del marco
      gsap.fromTo('.perfil__fig img', { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: '.perfil', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- Interacciones ---------- */
  // Pirámide normativa
  const pk = $('.js-pk'), pt = $('.js-pt');
  $$('.nivel').forEach(n => n.querySelector('button').addEventListener('click', () => {
    $$('.nivel').forEach(x => x.classList.toggle('is-on', x === n));
    gsap.to([pk, pt], {
      autoAlpha: 0, y: -8, duration: .2, onComplete: () => {
        pk.textContent = n.dataset.k; pt.textContent = n.dataset.t;
        gsap.fromTo([pk, pt], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .05, ease: 'expo.out' });
      }
    });
  }));

  // Brocardos
  $$('.broc').forEach(b => b.addEventListener('click', () => b.classList.toggle('is-open')));

  // Preguntas con altura animada
  $$('.q').forEach(d => {
    const sum = $('summary', d), body = $('.q__a', d);
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: .5, ease: 'expo.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: .7, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  /* ---------- Arranque ---------- */
  const start = () => { scrollAnims(); intro(); };
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(start));
  let rw = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== rw) { rw = innerWidth; layoutHero(); } });
})();
