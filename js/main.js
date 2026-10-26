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
  const isDesk = '(min-width: 821px) and (min-height: 561px), (min-width: 821px) and (orientation: portrait)';

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
    host.addEventListener('click', (e) => {
      const a = e.target.closest('.asig');
      if (!a || a.dataset.area === 'el') return;
      pick(malla.dataset.area === a.dataset.area ? 'all' : a.dataset.area);
    });

    /* Versión táctil (teléfono): pestañas por trimestre, fichas grandes y vista por área */
    const AREA = { fund: 'Fundamentos', civil: 'Civil', publico: 'Público', empresa: 'Empresa y trabajo', proc: 'Procesal y penal', intl: 'Internacional', integral: 'Formación integral', el: 'Electiva' };
    const TRAMO = i => i < 4 ? 'Fundamentos' : i < 8 ? 'Núcleo jurídico' : 'Profundización';
    const mp = $('.js-mplan');
    const st = { t: 0, area: 'all', open: -1 };
    mp.innerHTML = `
      <div class="mplan__tabs" role="tablist" aria-label="Trimestres">${R.map((r, i) => `<button class="mtab" role="tab" data-t="${i}" aria-label="Trimestre ${r}">${r}<i></i></button>`).join('')}</div>
      <div class="mplan__head">
        <div><p class="mplan__k label js-mk"></p><h3 class="mplan__t js-mt"></h3></div>
        <div class="mplan__nav"><button class="mnav" data-d="-1" aria-label="Trimestre anterior">←</button><button class="mnav" data-d="1" aria-label="Trimestre siguiente">→</button></div>
      </div>
      <ol class="mplan__list js-ml"></ol>`;
    const tabs = $('.mplan__tabs', mp), list = $('.js-ml', mp);

    const card = (n, a, i, k) => `
      <li><button class="mcard${a === 'el' ? ' mcard--el' : ''}" data-area="${a}" data-t="${i}" data-k="${k}" aria-expanded="false">
        <i class="mcard__bar"></i>
        <span class="mcard__body"><span class="mcard__n">${n}</span><span class="mcard__a">${st.area === 'all' ? AREA[a] : 'Trimestre ' + R[i]}</span></span>
        <span class="mcard__x" aria-hidden="true"></span>
        <span class="mcard__more">${a === 'el'
          ? '<span class="mcard__info">Asignatura de libre elección para orientar la carrera a tus intereses.</span>'
          : `<span class="mcard__info">Trimestre ${R[i]} · ${TRAMO(i)} · ${AREA[a]}</span><span class="mcard__go" data-go="${st.area === 'all' ? 'area' : 'tri'}">${st.area === 'all' ? 'Ver todas las de ' + AREA[a] : 'Ir al trimestre ' + R[i]} →</span>`}</span>
      </button></li>`;

    const render = (dir = 0) => {
      st.open = -1;
      const byArea = st.area !== 'all';
      mp.classList.toggle('is-area', byArea);
      mp.dataset.area = st.area;
      $$('.mtab', tabs).forEach((b, i) => {
        b.classList.toggle('is-on', !byArea && i === st.t);
        b.classList.toggle('has', byArea && T[i].some(([, a]) => a === st.area));
        b.setAttribute('aria-selected', !byArea && i === st.t);
      });
      if (byArea) {
        const items = T.flatMap((t, i) => t.filter(([, a]) => a === st.area).map(([n, a]) => [n, a, i]));
        $('.js-mk', mp).textContent = 'Área · ' + items.length + ' asignaturas';
        $('.js-mt', mp).innerHTML = AREA[st.area];
        list.innerHTML = items.map(([n, a, i], k) => card(n, a, i, k)).join('');
      } else {
        $('.js-mk', mp).textContent = TRAMO(st.t);
        $('.js-mt', mp).innerHTML = 'Trimestre <em>' + R[st.t] + '</em>';
        list.innerHTML = T[st.t].map(([n, a], k) => card(n, a, st.t, k)).join('');
        const tab = tabs.children[st.t];
        tabs.scrollTo({ left: tab.offsetLeft - (tabs.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
      }
      if (!reduce && hasGsap) gsap.fromTo(list.children, { x: dir * 40, y: dir ? 0 : 14, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: .55, stagger: .04, ease: 'expo.out' });
    };
    const goT = (t, dir) => { st.t = (t + 12) % 12; st.area = 'all'; syncChips(); render(dir); };

    tabs.addEventListener('click', e => { const b = e.target.closest('.mtab'); if (b) goT(+b.dataset.t, Math.sign(+b.dataset.t - st.t)); });
    $$('.mnav', mp).forEach(b => b.addEventListener('click', () => goT(st.t + +b.dataset.d, +b.dataset.d)));
    list.addEventListener('click', e => {
      const go = e.target.closest('.mcard__go'), c = e.target.closest('.mcard');
      if (!c) return;
      if (go) {
        if (go.dataset.go === 'area') pick(c.dataset.area);
        else goT(+c.dataset.t, 0);
        $('.plan__filters').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const open = c.getAttribute('aria-expanded') !== 'true';
      $$('.mcard', list).forEach(x => x.setAttribute('aria-expanded', 'false'));
      c.setAttribute('aria-expanded', open);
    });
    // Deslizar de lado para cambiar de trimestre
    let sx = 0, sy = 0;
    list.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    list.addEventListener('touchend', e => {
      if (st.area !== 'all') return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) goT(st.t + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });

    const syncChips = () => chips.forEach(c => c.classList.toggle('is-on', c.dataset.area === st.area));
    function pick(area) {
      setArea(area);
      st.area = area;
      render(0);
    }
    chips.forEach(c => c.addEventListener('click', () => pick(c.dataset.area)));
    render(0);
  }
  buildMalla();

  /* ---------- Hero: entrar en el sello de la Escuela ---------- */
  // Punto de entrada: zona roja limpia bajo "Derecho" (en coordenadas del logo, 804 x 804).
  const ENTRY = [402 / 804, 700 / 804], CLEAR = 104 / 804;
  const hero = { scaleMax: 20 };
  const seal = $('.js-seal');
  const stage = $('.hero__stage');

  function fitTitle() {
    const h1 = $('.hero__title'), word = $('.js-hero-word');
    const col = parseFloat(getComputedStyle($('.hero__copy')).gridTemplateColumns) || innerWidth;
    h1.style.fontSize = '100px';
    const w = word.getBoundingClientRect().width / 100;   // ancho por px de cuerpo
    let size = (col - 4) / (w + .28 - .19);               // padding .28em menos el margen óptico -.19em
    size = Math.min(size, innerHeight * (innerWidth > innerHeight ? .3 : .2), 340);
    h1.style.fontSize = size.toFixed(1) + 'px';
  }

  function layoutHero() {
    fitTitle();
    const W = stage.clientWidth, H = stage.clientHeight;
    const slot = $('.js-iso-slot').getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const size = Math.max(140, Math.min(slot.width, slot.height));
    const x = slot.left - sr.left + (slot.width - size) / 2;
    const y = slot.top - sr.top + (slot.height - size) / 2;
    gsap.set(seal, { left: x, top: y, width: size, height: size, transformOrigin: `${ENTRY[0] * 100}% ${ENTRY[1] * 100}%` });
    const px = x + ENTRY[0] * size, py = y + ENTRY[1] * size;
    const far = Math.max(Math.hypot(px, py), Math.hypot(W - px, py), Math.hypot(px, H - py), Math.hypot(W - px, H - py));
    hero.scaleMax = far / (CLEAR * size) * 1.08;
  }

  /* ---------- Loader ---------- */
  function intro() {
    const loader = $('.loader');
    const titleSplit = SplitText.create('.js-hero-word', { type: 'chars', charsClass: 'ch' });
    gsap.set(titleSplit.chars, { yPercent: 110 });
    gsap.set(['.hero__meta', '.hero__kicker', '.hero__lede', '.hero__scroll'], { autoAlpha: 0, y: 24 });
    gsap.set('.header', { yPercent: -120 });
    gsap.set(seal, { scale: .55, rotate: -14, autoAlpha: 0 });

    const done = () => {
      document.body.classList.remove('is-loading');
      loader?.remove();
      lenis?.start();
      ScrollTrigger.refresh();
    };

    if (reduce) {
      gsap.set(titleSplit.chars, { yPercent: 0 });
      gsap.set(['.hero__meta', '.hero__kicker', '.hero__lede', '.hero__scroll'], { autoAlpha: 1, y: 0 });
      gsap.set('.header', { clearProps: 'transform' });
      gsap.set(seal, { scale: 1, rotate: 0, autoAlpha: 1 });
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
      .to(seal, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.8, ease: 'expo.out' }, 2.5)
      .to(titleSplit.chars, { yPercent: 0, duration: 1.3, stagger: .045 }, 2.75)
      .to(['.hero__meta', '.hero__kicker', '.hero__lede', '.hero__scroll'], { autoAlpha: 1, y: 0, duration: 1.1, stagger: .08 }, 2.9)
      .to('.header', { yPercent: 0, duration: 1.1 }, 3.0);
  }

  /* ---------- Header ---------- */
  const header = $('.header');
  let heroLight = true;
  let sectionLight = false;
  const paintHeader = () => header.classList.toggle('is-light', heroLight || sectionLight);
  paintHeader();
  let lastY = 0;
  const onScroll = (y) => {
    const heroEnd = $('.hero').offsetHeight - innerHeight;
    const menuOpen = document.body.classList.contains('is-menu');
    header.classList.toggle('is-solid', y > heroEnd + 10);
    if (!menuOpen) header.classList.toggle('is-hidden', y > lastY && y > innerHeight * .4 && y > 80);
    lastY = y;
    $('.runhead').classList.toggle('is-on', y > heroEnd);
    $('.runhead').classList.toggle('is-off', y > $('#contacto').offsetTop - innerHeight * .7);
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
    // Hero: la cámara entra en el sello hasta llenar la pantalla de lacre
    layoutHero();
    const zoom = { p: 0 };
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true,
        invalidateOnRefresh: true,
        onRefresh: layoutHero,
        onUpdate: s => { const l = s.progress < 1; if (l !== heroLight) { heroLight = l; paintHeader(); } }
      }
    })
      .to('.hero__copy', { yPercent: -8, autoAlpha: 0, ease: 'power2.in', duration: .22 }, 0)
      .to(zoom, {
        p: 1, duration: .46, ease: 'power1.in',
        onUpdate: () => {
          gsap.set(seal, { scale: Math.pow(hero.scaleMax, zoom.p) });
          seal.classList.toggle('is-zoom', zoom.p > .02);
        }
      }, .04)
      .to('.js-hero-bg img', { scale: 1.22, duration: .5, ease: 'power1.in' }, 0)
      .set(stage, { backgroundColor: '#D40134' }, .5)
      .set('.js-hero-bg', { autoAlpha: 0 }, .5)
      .set(seal, { autoAlpha: 0 }, .505)
      .fromTo('.hero__after > *', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .2, stagger: .04, ease: 'power2.out' }, .44)
      .to({}, { duration: .25 });

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
    const fw = $('.js-footword');
    fw.innerHTML = [...fw.dataset.word].map((c, i) =>
      `<span class="fl" style="--i:${i}">${c}<span class="fl__ink">${c}</span><span class="fl__glow">${c}</span></span>`).join('');
    const letters = $$('.fl', fw);
    // Luz que sigue al puntero sobre la tinta (solo con mouse)
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
      const foot = $('.footer');
      let tx = 0, cx = 0, active = false;
      const light = () => {
        cx += (tx - cx) * .12;
        const pad = parseFloat(getComputedStyle(fw).fontSize) * .22;   // la tinta empieza .22em antes de la letra
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

    // Competencias en horizontal (en teléfono solo se desplazan las fichas)
    mm.add({ desk: isDesk, phone: '(max-width: 820px) and (min-height: 561px)' }, ctx => {
      const intro = $('.comp__intro'), rail = $('.comp__rail'), arts = $$('.art');
      const desk = ctx.conditions.desk;
      const dist = () => desk ? intro.offsetWidth + rail.scrollWidth - innerWidth : rail.scrollWidth - innerWidth;
      const n = $('.js-art-n');
      gsap.to(desk ? [intro, rail] : rail, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.comp__track', start: 'top top', end: 'bottom bottom', scrub: desk ? true : .4, invalidateOnRefresh: true,
          onUpdate: s => {
            const i = Math.min(arts.length - 1, Math.round(s.progress * (arts.length - 1) * 1.05));
            arts.forEach((a, j) => a.classList.toggle('is-on', j <= i));
            n.textContent = String(i + 1).padStart(2, '0');
          }
        }
      });
    });

    mm.add(isDesk, () => {
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
