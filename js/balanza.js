/* Escuela de Derecho · UNIMET — Clínica Jurídica: balanza de la justicia sobre libros de Derecho.
   Dibujo original a lápiz (SVG): los trazos se dibujan con el scroll hacia adelante y se borran hacia atrás.
   Primero los libros, luego el pie y la columna, el brazo, las cadenas y los platillos; la balanza llega
   inclinada y, al final del recorrido, oscila hasta quedar en equilibrio. Ya completa, respira y se inclina
   un poco hacia el cursor; en el teléfono, un toque la hace oscilar. */

(() => {
  const art = document.querySelector('.clj__art');
  if (!art) return;
  const pin = document.querySelector('.clj__pin');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => innerWidth <= 820;
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const INK = '#2B2723', LACRE = '#D40134', PAPER = '#F5F3EF';
  const PX = 313, PY = 168, ARM = 170;          // pivote y medio brazo
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '60 90 520 520');
  svg.setAttribute('aria-hidden', 'true');
  art.appendChild(svg);

  const el = (tag, attrs, parent = svg) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };
  const g = (parent = svg, attrs = {}) => el('g', attrs, parent);

  // trazos que se dibujan: [elemento, inicio, fin]
  const strokes = [];
  const fills = [];
  const line = (parent, d, t0, t1, w = 1.6, color = INK, sketch = true) => {
    const p = el('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, parent);
    strokes.push([p, t0, t1]);
    // segunda pasada de lápiz, levemente corrida y más tenue
    if (sketch) {
      const q = el('path', { d, fill: 'none', stroke: color, 'stroke-width': w * .55, 'stroke-linecap': 'round', opacity: .38, transform: 'translate(.9 -.7) rotate(.25 300 400)', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, parent);
      strokes.push([q, t0 + .02, t1 + .02]);
    }
    return p;
  };
  const hatch = (parent, segs, t0, t1, color = INK) => {
    const d = segs.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join('');
    const p = el('path', { d, fill: 'none', stroke: color, 'stroke-width': .8, 'stroke-linecap': 'round', opacity: .5 }, parent);
    // el rayado aparece de izquierda a derecha con una máscara de recorte
    const id = 'h' + strokes.length + Math.random().toString(36).slice(2, 6);
    const cp = el('clipPath', { id }, defs);
    const r = el('rect', { x: 0, y: 0, width: 0, height: 700 }, cp);
    p.setAttribute('clip-path', `url(#${id})`);
    strokes.push([{ hatch: r }, t0, t1]);
  };
  const fill = (parent, d, color, t0, t1, op = 1) => {
    const f = el('path', { d, fill: color, opacity: 0 }, parent);
    fills.push([f, t0, t1, op]);
    return f;
  };
  const defs = el('defs', {});

  /* ---------- Sombra en el suelo ---------- */
  const shadow = el('ellipse', { cx: 318, cy: 603, rx: 0, ry: 7, fill: INK, opacity: .12 });

  /* ---------- Libros ---------- */
  const books = g();
  const bookGs = [];
  const book = (x1, x2, y1, y2, dx, dy, spine, t0, t1, bands) => {
    const outer = books; const bg = g(outer); bookGs.push({ g: bg, t0, t1 });
    // frente (lomo), cara superior y canto de páginas
    const front = `M${x1} ${y1}H${x2}V${y2}H${x1}Z`;
    const top = `M${x1} ${y1}L${x1 + dx} ${y1 - dy}H${x2 + dx}L${x2} ${y1}`;
    const side = `M${x2} ${y1}L${x2 + dx} ${y1 - dy}V${y2 - dy}L${x2} ${y2}`;
    fill(bg, front, spine, t1 - .02, t1 + .14, spine === PAPER ? 1 : .92);
    fill(bg, `M${x1} ${y1}L${x1 + dx} ${y1 - dy}H${x2 + dx}L${x2} ${y1}Z`, PAPER, t1 - .02, t1 + .12);
    fill(bg, `M${x2} ${y1}L${x2 + dx} ${y1 - dy}V${y2 - dy}L${x2} ${y2}Z`, '#ECE6DC', t1 - .02, t1 + .12);
    line(bg, front, t0, t1, 1.7);
    line(bg, top, t0 + .03, t1, 1.4);
    line(bg, side, t0 + .05, t1, 1.4);
    // hojas en el canto
    const pages = [];
    for (let y = y1 + 5; y < y2 - 2; y += 4.2) pages.push([x2 + 2, y - 1, x2 + dx - 2, y - dy + 1]);
    hatch(bg, pages, t1 - .04, t1 + .06);
    // nervios del lomo y etiqueta
    const lc = spine === PAPER ? INK : PAPER;
    bands.forEach(bx => line(bg, `M${bx} ${y1 + 3}V${y2 - 3}M${bx + 6} ${y1 + 3}V${y2 - 3}`, t1 - .06, t1 + .04, 1.1, lc, false));
    const cx = (x1 + x2) / 2;
    line(bg, `M${cx - 46} ${y1 + 12}H${cx + 46}V${y2 - 12}H${cx - 46}Z`, t1 - .04, t1 + .06, 1.1, lc, false);
    line(bg, `M${cx - 30} ${(y1 + y2) / 2 - 3}H${cx + 30}M${cx - 20} ${(y1 + y2) / 2 + 4}H${cx + 20}`, t1, t1 + .08, 1, lc, false);
  };
  book(108, 492, 548, 600, 30, 17, LACRE, 0, .12, [138, 452]);
  book(140, 462, 498, 548, 24, 14, INK, .06, .19, [168, 424]);
  book(176, 432, 454, 498, 20, 12, PAPER, .12, .25, [200, 396]);
  // listón de lectura que cuelga del libro del medio
  line(books, 'M392 548C394 566 386 580 392 598', .22, .29, 2.2, LACRE, false);

  /* ---------- Pie y columna ---------- */
  const stand = g();
  const SX = PX;
  fill(stand, `M${SX - 64} 448C${SX - 60} 436 ${SX - 30} 432 ${SX - 18} 424H${SX + 18}C${SX + 30} 432 ${SX + 60} 436 ${SX + 64} 448Z`, PAPER, .36, .46);
  line(stand, `M${SX - 64} 448C${SX - 60} 436 ${SX - 30} 432 ${SX - 18} 424H${SX + 18}C${SX + 30} 432 ${SX + 60} 436 ${SX + 64} 448Z`, .24, .33, 1.7);
  line(stand, `M${SX - 22} 424C${SX - 22} 416 ${SX + 22} 416 ${SX + 22} 424`, .3, .35, 1.4);
  line(stand, `M${SX - 7} 418V184M${SX + 7} 418V184`, .32, .44, 1.6);
  // anillos de la columna
  [404, 316, 228].forEach((y, i) => line(stand, `M${SX - 12} ${y}C${SX - 12} ${y - 8} ${SX + 12} ${y - 8} ${SX + 12} ${y}C${SX + 12} ${y + 8} ${SX - 12} ${y + 8} ${SX - 12} ${y}Z`, .34 + i * .025, .4 + i * .025, 1.3));
  hatch(stand, Array.from({ length: 52 }, (_, i) => [SX + 2, 410 - i * 4.4, SX + 6, 406 - i * 4.4]), .4, .5);
  hatch(stand, Array.from({ length: 14 }, (_, i) => [SX + 18 + i * 3.2, 446, SX + 12 + i * 3, 432 + i * .3]), .36, .44);

  /* ---------- Brazo (gira sobre el pivote) ---------- */
  const beam = g();
  fill(beam, `M${PX - ARM} ${PY - 3}Q${PX} ${PY - 12} ${PX + ARM} ${PY - 3}V${PY + 4}Q${PX} ${PY - 4} ${PX - ARM} ${PY + 4}Z`, PAPER, .5, .6);
  line(beam, `M${PX - ARM} ${PY - 3}Q${PX} ${PY - 12} ${PX + ARM} ${PY - 3}`, .44, .54, 1.7);
  line(beam, `M${PX - ARM} ${PY + 4}Q${PX} ${PY - 4} ${PX + ARM} ${PY + 4}`, .46, .56, 1.4);
  // remates del brazo y corazón central
  [-1, 1].forEach(s => line(beam, `M${PX + s * ARM} ${PY - 8}C${PX + s * (ARM + 12)} ${PY - 8} ${PX + s * (ARM + 12)} ${PY + 8} ${PX + s * ARM} ${PY + 8}`, .52, .56, 1.5));
  line(beam, `M${PX - 13} ${PY}C${PX - 13} ${PY - 15} ${PX + 13} ${PY - 15} ${PX + 13} ${PY}C${PX + 13} ${PY + 15} ${PX - 13} ${PY + 15} ${PX - 13} ${PY}Z`, .48, .54, 1.6);
  fill(beam, `M${PX - 5} ${PY}a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z`, LACRE, .56, .64);
  // remate superior de la columna (fijo, por encima del brazo)
  const finial = g();
  line(finial, `M${PX} ${PY - 16}V${PY - 30}`, .5, .55, 1.6);
  line(finial, `M${PX - 8} ${PY - 38}C${PX - 8} ${PY - 49} ${PX + 8} ${PY - 49} ${PX + 8} ${PY - 38}C${PX + 8} ${PY - 27} ${PX - 8} ${PY - 27} ${PX - 8} ${PY - 38}Z`, .52, .58, 1.6);
  line(finial, `M${PX} ${PY - 49}L${PX} ${PY - 64}`, .56, .6, 1.4);

  /* ---------- Platillos (cuelgan siempre en vertical) ---------- */
  const pans = [-1, 1].map((s, i) => {
    const pg = g();
    const x = PX + s * ARM, top = PY + 4, rim = 336, R = 66;
    const off = i * .02;
    line(pg, `M${x} ${top}V${top + 14}`, .56 + off, .6 + off, 1.5);
    line(pg, `M${x - 4} ${top + 18}a4 4 0 1 0 8 0a4 4 0 1 0-8 0`, .58 + off, .61 + off, 1.2, INK, false);
    line(pg, `M${x} ${top + 22}L${x - R + 4} ${rim}M${x} ${top + 22}L${x + R - 4} ${rim}M${x} ${top + 22}L${x} ${rim - 6}`, .6 + off, .7 + off, 1.1);
    // cadena: eslabones pequeños sobre los cordones
    const links = [];
    for (let k = 1; k < 9; k++) {
      const u = k / 9;
      [[x - R + 4, rim], [x + R - 4, rim]].forEach(([ex, ey]) => {
        const cx = lerp(x, ex, u), cy = lerp(top + 22, ey, u);
        links.push(`M${cx - 1.6} ${cy}a1.6 2.4 0 1 0 3.2 0a1.6 2.4 0 1 0-3.2 0`);
      });
    }
    line(pg, links.join(''), .64 + off, .74 + off, .8, INK, false);
    const bowl = `M${x - R} ${rim}C${x - R + 8} ${rim + 50} ${x + R - 8} ${rim + 50} ${x + R} ${rim}`;
    fill(pg, `${bowl}C${x + R - 10} ${rim + 7} ${x - R + 10} ${rim + 7} ${x - R} ${rim}Z`, PAPER, .74, .84);
    line(pg, bowl, .66 + off, .76 + off, 1.8);
    line(pg, `M${x - R} ${rim}C${x - R + 12} ${rim - 9} ${x + R - 12} ${rim - 9} ${x + R} ${rim}C${x + R - 12} ${rim + 9} ${x - R + 12} ${rim + 9} ${x - R} ${rim}Z`, .68 + off, .78 + off, 1.4);
    hatch(pg, Array.from({ length: 18 }, (_, k) => [x - 12 + k * 4, rim + 12 + (k > 9 ? (k - 9) * .5 : 0), x - 6 + k * 4, rim + 32 - Math.abs(k - 9) * 1.1]), .76, .86);
    return { g: pg, x0: x, y0: PY, s };
  });

  // orden de capas: libros, pie, platillos, brazo, remate
  const glow = el('circle', { cx: PX, cy: PY, r: 6, fill: 'none', stroke: LACRE, 'stroke-width': 2, opacity: 0 });
  svg.append(shadow, books, stand, ...pans.map(p => p.g), beam, finial, glow);

  /* ---------- Estado ---------- */
  let P = 0, Pv = 0, intro = 0, T = 0, raf = 0, last = 0, visible = true;
  let lean = 0, leanT = 0, kick = 0, kickV = 0, swing = 0;

  const tiltAt = p => {
    // llega inclinada a la izquierda y, al final, oscila hasta el equilibrio
    if (p < .62) return -11;
    const u = clamp((p - .62) / .34);
    // un vaivén lento y suave hasta el equilibrio
    return -11 * Math.exp(-2.2 * u) * Math.cos(Math.PI * 1.7 * u) * (1 - u * u);
  };

  const render = () => {
    const p = Pv;
    strokes.forEach(([s, a, b]) => {
      const f = clamp((p - a) / (b - a || 1));
      if (s.hatch) s.hatch.setAttribute('width', (f * 700).toFixed(1));
      else { s.setAttribute('stroke-dashoffset', (1 - ease(f)).toFixed(4)); s.style.visibility = f > .002 ? '' : 'hidden'; } // sin puntitos antes de empezar
    });
    fills.forEach(([f, a, b, op]) => f.setAttribute('opacity', (clamp((p - a) / (b - a)) * op).toFixed(3)));
    shadow.setAttribute('rx', (230 * ease(clamp(p / .2))).toFixed(1));
    const bounce = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
    bookGs.forEach((bk, i) => {
      const u = clamp((p - bk.t0) / (bk.t1 - bk.t0 + .04));
      const y = reduce ? 0 : (1 - bounce(u)) * -110;
      bk.g.setAttribute('transform', `translate(0 ${y.toFixed(1)}) rotate(${(reduce ? 0 : (1 - u) * (i % 2 ? 4 : -4)).toFixed(2)} 300 520)`);
      bk.g.setAttribute('opacity', clamp(u * 4).toFixed(2));
    });
    // la columna y el brazo suben desde los libros
    // la columna crece hacia arriba desde su pie, que nunca se mueve: siempre queda sobre el libro
    const rise = reduce ? 1 : lerp(.25, 1, ease(clamp((p - .24) / .22)));
    stand.setAttribute('transform', `translate(0 448) scale(1 ${rise.toFixed(3)}) translate(0 -448)`);
    // el brazo baja desde arriba hasta posarse en la columna
    const lift = reduce ? 0 : -(1 - ease(clamp((p - .4) / .2))) * 18;
    const done = clamp((p - .94) / .06);
    const gl = clamp((p - .9) / .1);
    glow.setAttribute('r', (6 + gl * 34).toFixed(1)); glow.setAttribute('opacity', (gl > 0 && gl < 1 ? (1 - gl) * .8 : 0).toFixed(2));
    glow.setAttribute('transform', `translate(0 ${lift.toFixed(1)})`);
    const idle = reduce ? 0 : (Math.sin(T * .7) * .5 + Math.sin(T * 1.6) * .12) * done;
    const th = tiltAt(p) + (lean + idle + kick) * done;
    beam.setAttribute('transform', `translate(0 ${lift.toFixed(1)}) rotate(${th.toFixed(3)} ${PX} ${PY})`);
    finial.setAttribute('transform', `translate(0 ${lift.toFixed(1)})`);
    const r = th * Math.PI / 180;
    const dTh = th - (render.prev ?? th); render.prev = th;
    swing += (dTh * 1.4 - swing) * .08;
    pans.forEach(o => {
      const ex = PX + Math.cos(r) * ARM * o.s, ey = PY + Math.sin(r) * ARM * o.s;
      // péndulo: el platillo se atrasa respecto al brazo y se balancea
      const sw = reduce ? 0 : -swing * 1.2 + Math.sin(T * 1.2 + o.s) * .3 * done;
      o.g.setAttribute('transform', `translate(${(ex - o.x0).toFixed(2)} ${(ey - o.y0 + lift).toFixed(2)}) rotate(${sw.toFixed(2)} ${o.x0} ${o.y0 + 4})`);
    });
  };

  const tick = now => {
    raf = 0;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    T += dt;
    const target = Math.max(P, intro);
    Pv += (target - Pv) * (reduce ? 1 : 1 - Math.pow(.05, dt)); // sigue al scroll con más calma
    if (Math.abs(target - Pv) < .0005) Pv = target;
    lean += (leanT - lean) * (1 - Math.pow(.15, dt));
    // toque: oscilación amortiguada
    kickV += (-kick * 18 - kickV * 3.2) * dt; kick += kickV * dt;
    render();
    const settled = Pv === target && Math.abs(lean - leanT) < .01 && Math.abs(kick) < .01 && Math.abs(kickV) < .01;
    if (visible && (!settled || (!reduce && Pv > .94))) raf = requestAnimationFrame(tick);
  };
  const go = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick); } };

  /* ---------- Scroll: se dibuja al bajar y se borra al subir ---------- */
  const fromRect = () => {
    if (!phone() && pin) { const r = pin.getBoundingClientRect(), run = r.height - innerHeight; return clamp(-r.top / ((run || 1) * .9)); }
    const r = art.getBoundingClientRect(); return clamp((innerHeight * .95 - r.top) / (innerHeight * .75));
  };
  if (reduce) { P = intro = Pv = 1; }
  else {
    addEventListener('scroll', () => { P = fromRect(); go(); }, { passive: true });
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.addEventListener('refresh', () => { P = fromRect(); go(); });
    // al cargar, los libros y el pie se dibujan solos (la mitad derecha nunca queda vacía)
    const t0 = performance.now(), dur = 1900;
    const step = now => { const u = clamp((now - t0) / dur); intro = .3 * ease(u); go(); if (u < 1) requestAnimationFrame(step); };
    (document.fonts?.ready || Promise.resolve()).then(() => setTimeout(() => requestAnimationFrame(step), phone() ? 300 : 700));
  }

  /* ---------- Cursor y toque ---------- */
  art.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = art.getBoundingClientRect();
    leanT = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1) * 4; go();
  });
  art.addEventListener('pointerleave', () => { leanT = 0; go(); });
  art.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { kickV += (Math.random() < .5 ? -1 : 1) * 18; go(); } });

  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) go(); }), { rootMargin: '80px' }).observe(art);
  P = reduce ? 1 : fromRect(); Pv = P; render(); go();
})();
