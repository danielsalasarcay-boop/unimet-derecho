/* Escuela de Derecho · UNIMET — Centro de Estudiantes (CED).
   1) El isotipo se arma con moléculas: los puntos llegan girando hasta formar las tres
      columnas; el cursor (o el dedo) los aparta y se tiñen de naranja UNIMET.
   2) El mazo del logo del CED da un golpe: se levanta, cae sobre la base, el logo tiembla,
      salen las líneas de impacto y la onda sacude las moléculas.
   3) El título se traza en lacre y las fotos se abren al entrar en pantalla. */

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1) Isotipo de moléculas ---------- */
  const mol = (() => {
    const box = document.querySelector('.js-ce-iso');
    if (!box) return null;
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
      if (!r.width || !r.height || (Math.abs(r.width - W) < 1 && Math.abs(r.height - H) < 1)) return;
      W = r.width; H = r.height;
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const s = Math.min(W * .7 / 250, H * .9 / 448);
      const ox = (W - 250 * s) / 2, oy = (H - 448 * s) / 2;
      // cada columna lleva un número entero de puntos a lo ancho; en teléfono menos y más grandes
      const small = W < 520, n = small ? 5 : 7, step = 62 / n;
      rad = step * s * (small ? .36 : .34);
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
            size: small ? 1 : .86 + Math.random() * .2
          });
        }
      });
      draw();
    };

    const DUR = 1.7;
    const ease = t => 1 - Math.pow(1 - t, 4);

    const step = (now) => {
      let moving = false;
      const assembling = t0 !== null && !done;
      const el = assembling ? (now - t0) / 1000 : 0;
      for (const p of pts) {
        if (assembling) {
          const k = Math.min(1, Math.max(0, (el - p.delay) / DUR));
          const e = ease(k);
          const r = p.r0 + (p.d - p.r0) * e, a = p.a + p.spin * (1 - e);
          p.x = W / 2 + Math.cos(a) * r; p.y = H / 2 + Math.sin(a) * r;
          p.alpha = Math.min(1, k * 3);
          if (k < 1) moving = true;
          continue;
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
      }
      if (assembling && !moving) { done = true; moving = true; }
      draw();
      if ((moving || ptr.on) && visible) requestAnimationFrame(step);
      else running = false;
    };
    const go = () => { if (!running && visible) { running = true; requestAnimationFrame(step); } };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // los que están quietos y fríos van en un solo trazo
      const cold = new Path2D();
      for (const p of pts) {
        if (p.alpha < 1 || p.heat > .02) continue;
        const r = rad * p.size;
        cold.moveTo(p.x + r, p.y);
        cold.arc(p.x, p.y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = `rgb(${LACRE})`;
      ctx.fill(cold);
      // los que llegan o están tibios, uno a uno
      for (const p of pts) {
        if (!p.alpha || (p.alpha >= 1 && p.heat <= .02)) continue;
        const h = Math.min(1, p.heat);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `rgb(${LACRE.map((v, i) => Math.round(v + (NARANJA[i] - v) * h))})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * p.size * (1 + h * .35), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    build();
    if (reduce) { done = true; draw(); }

    // arranca cuando el recuadro entra en pantalla; solo anima mientras se ve
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => {
        const e = es[es.length - 1];
        visible = e.isIntersecting;
        if (visible && t0 === null && !reduce && e.intersectionRatio >= .25) t0 = performance.now();
        if (visible) go();
      }, { threshold: [0, .25, .5] }).observe(box);
    } else { visible = true; t0 = performance.now(); go(); }

    if (!reduce) {
      const move = e => {
        const r = cv.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; go();
      };
      const off = () => { ptr.on = false; ptr.x = ptr.y = -1e4; };
      box.addEventListener('pointermove', move);
      box.addEventListener('pointerdown', move);
      box.addEventListener('pointerleave', off);
      box.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') off(); });
      box.addEventListener('pointercancel', off);
    }

    // solo cambia el lienzo si cambia el ancho (en iOS la barra del navegador cambia el alto)
    let rt, lastW = innerWidth;
    addEventListener('resize', () => {
      if (innerWidth === lastW) return;
      lastW = innerWidth;
      clearTimeout(rt); rt = setTimeout(() => { build(); go(); }, 150);
    });

    return {
      // la onda del mazo: las moléculas saltan desde abajo y se encienden
      shock() {
        if (!done || reduce) return;
        const ox = W / 2, oy = H * 1.05;
        for (const p of pts) {
          const dx = p.x - ox, dy = p.y - oy, d = Math.hypot(dx, dy) || 1;
          const f = 9 + Math.random() * 7;
          p.vx += dx / d * f * .5; p.vy += dy / d * f;
          p.heat = .9;
        }
        go();
      }
    };
  })();

  /* ---------- 2) El mazo del logo ---------- */
  (() => {
    const logo = document.querySelector('.ceh__logo');
    if (!logo || !hasGsap) return;
    const gavel = logo.querySelector('.ceh__gavel'), hit = logo.querySelector('.ceh__hit'), ring = logo.querySelector('.ceh__ring');
    gsap.set(gavel, { svgOrigin: '683 245' });   // gira desde el extremo del mango
    gsap.set(hit, { svgOrigin: '520 246', scale: .6 });
    gsap.set(ring, { svgOrigin: '520 248', scale: 0, autoAlpha: 0 });
    let busy = false;
    const strike = () => {
      if (busy) return;
      busy = true;
      // con "reducir movimiento" el golpe es corto y sin onda, pero se ve
      const k = reduce ? .5 : 1;
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(gavel, { rotation: -38 * k, duration: .3, ease: 'power2.out' })
        .to(gavel, { rotation: 6 * k, duration: .13, ease: 'power4.in' })
        .add(() => { if (!reduce) mol?.shock(); navigator.vibrate?.(18); })
        .to(logo, { y: 4, scale: .95, duration: .07, ease: 'power2.out', yoyo: true, repeat: 1 }, '<')
        .fromTo(hit, { autoAlpha: 1, scale: .6 }, { scale: 1.3, duration: .45, ease: 'expo.out' }, '<')
        .fromTo(ring, { autoAlpha: .9, scale: .2 }, { scale: 1.6, autoAlpha: 0, duration: .7, ease: 'expo.out' }, '<')
        .to(hit, { autoAlpha: 0, duration: .3, ease: 'power1.in' }, '-=.5')
        .to(gavel, { rotation: 0, duration: .7, ease: 'elastic.out(1.1, .35)' }, '<-.1');
    };
    // en iPhone se escucha el toque por todas las vías: touchstart, pointerdown y click
    let last = 0;
    const tap = () => { const t = Date.now(); if (t - last > 250) { last = t; strike(); } };
    logo.addEventListener('touchstart', tap, { passive: true });
    logo.addEventListener('pointerdown', tap);
    logo.addEventListener('click', tap);
    logo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
    logo.addEventListener('mouseenter', tap);
    // un golpe solo al cargar, cuando las moléculas ya están armadas
    setTimeout(strike, innerWidth <= 820 ? 1800 : 3200);
  })();

  /* ---------- 3) Título trazado y fotos ---------- */
  if (!hasGsap) return;
  const lines = [...document.querySelectorAll('.js-ce-ln')];
  if (lines.length && window.traceTitle?.ok) {
    gsap.set(lines, { opacity: 0 });
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() =>
      traceTitle(lines, innerWidth <= 820 ? { delay: .25, draw: .9, stagger: .12, quick: true } : { delay: .3, draw: 1.6, stagger: .22, calm: true })));
  }

  const figs = [...document.querySelectorAll('.dv')];
  if (!figs.length || reduce) return;
  const img = f => f.querySelector('img'), cap = f => f.querySelector('figcaption');
  gsap.set(figs, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(figs.map(cap), { autoAlpha: 0 });
  ScrollTrigger.batch(figs, {
    start: 'top 92%', once: true,
    onEnter: b => gsap.timeline()
      .to(b, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, stagger: .08, ease: 'expo.inOut' })
      .from(b.map(img), { scale: 1.18, duration: 1.5, stagger: .08, ease: 'expo.out', clearProps: 'transform' }, .2)
      .to(b.map(cap), { autoAlpha: 1, duration: .8, stagger: .06, ease: 'power2.out' }, .7)
  });
})();
