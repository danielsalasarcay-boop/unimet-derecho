/* Escuela de Derecho · UNIMET — Centro de Estudiantes: el isotipo se arma con puntos.
   Al entrar en pantalla, cientos de puntos llegan girando hacia el centro hasta formar
   las tres columnas del isotipo. El cursor (o el dedo) los aparta y se tiñen de naranja
   UNIMET; al irse, vuelven a su sitio. */

(() => {
  const box = document.querySelector('.js-ce-iso');
  if (!box) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cv = document.createElement('canvas');
  box.append(cv);
  const ctx = cv.getContext('2d');
  // el mismo trazado del símbolo #iso (250 × 448)
  const ISO = new Path2D('M0 0H62V214.3L0 236ZM0 269L62 247.3V448H0ZM94 0H156V181.4L94 203.1ZM94 236.1L156 214.4V448H94ZM188 203.2L250 181.5V448H188Z');
  const LACRE = [212, 1, 52], NARANJA = [255, 130, 0];

  let W = 0, H = 0, dpr = 1, rad = 2, pts = [];
  let t0 = null, done = false, running = false, visible = false;
  const ptr = { x: -1e4, y: -1e4, on: false };

  const build = () => {
    const r = box.getBoundingClientRect();
    if (!r.width || (r.width === W && r.height === H)) return;
    W = r.width; H = r.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const s = Math.min(W * .66 / 250, H * .86 / 448);
    const ox = (W - 250 * s) / 2, oy = (H - 448 * s) / 2;
    // cada columna lleva un número entero de puntos a lo ancho
    const n = W < 420 ? 6 : 8, step = 62 / n;
    rad = step * s * .34;
    const cx = W / 2, cy = H / 2, far = Math.hypot(W, H) * .7;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    pts = [];
    [0, 94, 188].forEach(c0 => {
      for (let j = 0; j < 448 / step; j++) for (let i = 0; i < n; i++) {
        const ux = c0 + step * (i + .5), uy = step * (j + .5);
        if (!ctx.isPointInPath(ISO, ux, uy)) continue;
        const tx = ox + ux * s, ty = oy + uy * s;
        const a = Math.atan2(ty - cy, tx - cx), d = Math.hypot(tx - cx, ty - cy);
        pts.push({
          tx, ty, x: tx, y: ty, vx: 0, vy: 0, heat: 0, alpha: done || reduce ? 1 : 0,
          a, d, r0: d + far * (.55 + Math.random() * .6),   // de dónde viene, en espiral
          spin: 2.2 + Math.random() * 1.6,
          delay: (d / far) * .5 + Math.random() * .35,
          size: .78 + Math.random() * .3
        });
      }
    });
    // si ya estaba armado, se queda armado en el nuevo tamaño
    if (done || reduce) pts.forEach(p => { p.x = p.tx; p.y = p.ty; });
    draw();
  };

  const DUR = 1.9;
  const ease = t => 1 - Math.pow(1 - t, 4);

  const step = (now) => {
    let moving = false;
    const assembling = t0 !== null && !done;
    const el = assembling ? (now - t0) / 1000 : 0;
    pts.forEach(p => {
      if (assembling) {
        const k = Math.min(1, Math.max(0, (el - p.delay) / DUR));
        const e = ease(k);
        const r = p.r0 + (p.d - p.r0) * e, a = p.a + p.spin * (1 - e);
        p.x = W / 2 + Math.cos(a) * r; p.y = H / 2 + Math.sin(a) * r;
        p.alpha = Math.min(1, k * 3);
        if (k < 1) moving = true;
        return;
      }
      // armado: resorte hacia su sitio y el cursor que aparta
      p.alpha = 1;
      if (ptr.on) {
        const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy, R = Math.max(W, H) * .16;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 2.2;
          p.vx += dx / d * f; p.vy += dy / d * f;
          p.heat = Math.min(1, p.heat + .2);
        }
      }
      p.vx += (p.tx - p.x) * .06; p.vy += (p.ty - p.y) * .06;
      p.vx *= .8; p.vy *= .8;
      p.x += p.vx; p.y += p.vy;
      p.heat *= .965;
      if (Math.abs(p.vx) + Math.abs(p.vy) > .02 || Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > .05 || p.heat > .01) moving = true;
    });
    if (assembling && !moving) { done = true; box.classList.add('is-done'); moving = true; }
    draw();
    if ((moving || ptr.on) && visible) requestAnimationFrame(step);
    else running = false;
  };
  const go = () => { if (!running && visible) { running = true; requestAnimationFrame(step); } };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const cold = new Path2D();
    pts.forEach(p => {
      if (p.alpha === 0) return;
      if (p.heat > .02 || p.alpha < 1) return;
      cold.moveTo(p.x + rad * p.size, p.y);
      cold.arc(p.x, p.y, rad * p.size, 0, Math.PI * 2);
    });
    ctx.fillStyle = `rgb(${LACRE})`;
    ctx.fill(cold);
    // los que están llegando o tibios por el cursor, uno a uno
    pts.forEach(p => {
      if (!(p.heat > .02 || (p.alpha ?? 0) < 1) || !p.alpha) return;
      const h = Math.min(1, p.heat);
      const c = LACRE.map((v, i) => Math.round(v + (NARANJA[i] - v) * h));
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `rgb(${c})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad * p.size * (1 + h * .35), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  build();
  if (reduce) { done = true; draw(); }

  // arranca cuando el recuadro entra en pantalla; solo anima mientras se ve
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible && t0 === null && !reduce && es[0].intersectionRatio >= .3) t0 = performance.now();
      if (visible) go();
    }, { threshold: [0, .3, .6] }).observe(box);
  } else { visible = true; t0 = performance.now(); go(); }

  if (!reduce) {
    const move = e => {
      const r = cv.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; go();
    };
    box.addEventListener('pointermove', move);
    box.addEventListener('pointerdown', move);
    const off = () => { ptr.on = false; ptr.x = ptr.y = -1e4; };
    box.addEventListener('pointerleave', off);
    box.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') off(); });
    box.addEventListener('pointercancel', off);
  }

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); go(); }, 120); });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { build(); go(); }).observe(box);
})();

/* Título trazado en lacre y fotos de las directivas que se abren al entrar */
(() => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const lines = [...document.querySelectorAll('.js-ce-ln')];
  if (lines.length && window.traceTitle?.ok) {
    gsap.set(lines, { opacity: 0 });
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() =>
      traceTitle(lines, innerWidth <= 820 ? { delay: .25, draw: .9, stagger: .12, quick: true } : { delay: .3, draw: 1.8, stagger: .25, calm: true })));
  }

  const figs = [...document.querySelectorAll('.dv')];
  if (!figs.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const img = f => f.querySelector('img'), cap = f => f.querySelector('figcaption');
  gsap.set(figs, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(figs.map(cap), { autoAlpha: 0 });
  ScrollTrigger.batch(figs, {
    start: 'top 90%', once: true,
    onEnter: b => gsap.timeline()
      .to(b, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, stagger: .1, ease: 'expo.inOut' })
      .from(b.map(img), { scale: 1.18, duration: 1.6, stagger: .1, ease: 'expo.out', clearProps: 'transform' }, .2)
      .to(b.map(cap), { autoAlpha: 1, duration: .8, stagger: .08, ease: 'power2.out' }, .8)
  });
})();

/* Logo del CED: el mazo da un golpe al tocarlo (dedo o cursor) y uno solo al cargar */
(() => {
  const logo = document.querySelector('.ceh__logo');
  if (!logo || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const tap = () => { logo.classList.remove('is-tap'); logo.getBoundingClientRect(); logo.classList.add('is-tap'); };
  logo.addEventListener('animationend', () => logo.classList.remove('is-tap'));
  logo.addEventListener('pointerdown', tap);
  logo.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') tap(); });
  setTimeout(tap, 1600);
})();
