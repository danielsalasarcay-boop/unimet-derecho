/* Escuela de Derecho · UNIMET — Conoce más: cómo leer una sentencia, el orden de las normas y los brocardos.
   Header, índice, contacto y footer los maneja profesores.js. */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesk = '(min-width: 821px) and (min-height: 561px), (min-width: 821px) and (orientation: portrait)';

  // Brocardos
  $$('.broc').forEach(b => b.addEventListener('click', () => b.classList.toggle('is-open')));
  // Teléfono: puntos que indican en qué brocardo vas dentro del carrusel
  const bg = $('.brocardos__grid'), dots = $('.brocardos__dots');
  if (bg && dots) {
    const cards = $$('.broc', bg);
    dots.innerHTML = cards.map(() => '<i></i>').join('');
    const ds = $$('i', dots);
    const sync = () => {
      const mid = bg.scrollLeft + bg.clientWidth / 2;
      let k = 0, best = 1e9;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < best) { best = d; k = i; } });
      ds.forEach((d, i) => d.classList.toggle('is-on', i === k));
    };
    bg.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync); sync();
  }

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

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

  const start = () => {
    const mm = gsap.matchMedia();

    // Pasos de la sentencia: una línea lacre baja por los números; el paso donde estás se engruesa
    const pasosEl = $('.pasos');
    if (pasosEl) {
      const rail = document.createElement('span');
      rail.className = 'pasos__rail';
      rail.innerHTML = '<i></i><b></b>';
      pasosEl.prepend(rail);
      const nums = $$('.paso__n', pasosEl);
      const railFill = $('i', rail), railDot = $('b', rail);
      // centros de los números; el riel va del primero al último
      const centers = () => {
        const c = nums.map(n => n.offsetTop + n.offsetHeight / 2);
        rail.style.top = c[0] + 'px';
        rail.style.height = (c[c.length - 1] - c[0]) + 'px';
        return c.map(v => v - c[0]);
      };
      const fillTo = gsap.quickTo(railFill, 'scaleY', { duration: .6, ease: 'power3.out' });
      const dotTo = gsap.quickTo(railDot, 'y', { duration: .6, ease: 'power3.out' });
      const setNum = i => nums.forEach((n, j) => n.parentElement.classList.toggle('is-here', j === i));
      // i: paso actual; t: avance (0–1) hacia el siguiente
      const railTo = (i, t) => {
        const c = centers(), H = rail.offsetHeight || 1;
        const y = c[i] + ((c[i + 1] ?? c[i]) - c[i]) * t;
        fillTo(Math.max(0, Math.min(1, y / H))); dotTo(y); setNum(i);
      };
      railTo(0, 0);
      mm.add('(max-width: 820px), (max-height: 560px)', () => {
        ScrollTrigger.create({
          trigger: pasosEl, start: 'top 62%', end: 'bottom 62%',
          onUpdate: s => {
            const c = centers(), y = s.progress * c[c.length - 1];
            let i = 0;
            c.forEach((v, j) => { if (y >= v - 2) i = j; });
            const t = c[i + 1] ? (y - c[i]) / (c[i + 1] - c[i]) : 0;
            railTo(i, Math.max(0, t));
            setNum(t > .5 ? i + 1 : i); // el número más cercano a la punta de la línea
          }
        });
      });

      // Computadora: la sentencia queda fija y cada paso ilumina su bloque del documento
      mm.add(isDesk, () => {
        const pasos = $$('.paso'), blks = $$('.doc__blk');
        const setPaso = i => {
          pasos.forEach((p, j) => p.classList.toggle('is-on', j === i));
          blks.forEach((b, j) => b.classList.toggle('is-on', j === i));
        };
        setPaso(0);
        ScrollTrigger.create({
          trigger: '.lectura', start: 'top top', end: 'bottom bottom',
          onUpdate: s => {
            const f = Math.min(4.999, s.progress * 5), i = Math.floor(f);
            setPaso(i); railTo(i, f - i);
          }
        });
        if (!reduce) gsap.fromTo('.doc__paper', { rotateX: 14, rotateY: -16, rotateZ: 3 }, {
          rotateX: 2, rotateY: -4, rotateZ: 0, ease: 'none',
          scrollTrigger: { trigger: '.lectura', start: 'top top', end: 'bottom bottom', scrub: true }
        });
      });
    }

    if (reduce) return;
    // Pirámide: los niveles se abren de arriba abajo
    gsap.from('.nivel', {
      scaleX: 0, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out',
      scrollTrigger: { trigger: '.piramide__fig', start: 'top 80%' }
    });
    $$('.js-fade').forEach(el => gsap.from(el, { y: 24, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  };
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(start));
})();
