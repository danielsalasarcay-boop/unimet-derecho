/* Escuela de Derecho · UNIMET — El samán.
   Dibujo procedural original (no copia ninguna foto): un tronco corto y muy grueso con la base
   ensanchada, cinco brazos sinuosos que se abren casi horizontales y una red de ramas que crece
   hacia una copa ancha y plana en paraguas (algoritmo de colonización del espacio, como en la
   ilustración botánica digital). Crece con el scroll hacia adelante y se recoge hacia atrás;
   luego brota el follaje verde y aparecen las borlas rosadas. Crecido, cada brazo se mece con la
   brisa, el cursor o el dedo levantan una ráfaga, caen hojas, y "Ver al atardecer" cierra los
   folíolos. Rendimiento: crecido, cada brazo se pinta una vez en su propia capa y solo se rota. */

(() => {
// mini: la versión en miniatura de Preguntas frecuentes (mismo árbol, crece al entrar en pantalla)
const setup = (root, mini) => {
  const cv = root.querySelector('.saman__cv');
  const ctx = cv.getContext('2d');
  const art = mini ? root : root.querySelector('.saman__art');
  // tinta y papel según el fondo de la sección
  const light = mini; // la miniatura va sobre el fondo claro de Preguntas frecuentes: tinta oscura
  const INK = light ? [46, 42, 38] : [238, 232, 220], INK_S = INK.join(','), PAPER = light ? '#F5F3EF' : '#1D1E21', LINE = light ? '46,42,38' : '243,239,231';
  const notes = [...root.querySelectorAll('.saman__note')];
  const barFill = root.querySelector('.saman__bar i');
  const modeBtn = root.querySelector('.saman__mode');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth <= 820 && innerHeight > 560;

  /* ---------- Utilidades ---------- */
  let seed = 1;
  const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rr = (a, b) => a + rnd() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const TAU = Math.PI * 2;

  /* ---------- Mundo: 1000 × 640, suelo en y = 600 ---------- */
  const W = 1000, H = 640, GY = 600, BX = 500;
  // silueta de la copa: muy ancha, de techo plano y bordes que caen
  const crownTop = x => { const u = Math.abs((x - BX) / 492); return 70 + 210 * Math.pow(u, 2.4); };
  const crownBot = x => { const u = Math.abs((x - BX) / 480); return crownTop(x) + 60 + 110 * (1 - u * u); };

  /* ---------- Nodos del árbol ---------- */
  const nodes = [];
  const node = (x, y, parent, group, w = 0, skel = false) => {
    const n = { x, y, parent, group, kids: [], w, skel, i: nodes.length };
    if (parent) parent.kids.push(n);
    nodes.push(n);
    return n;
  };
  // tramo sinuoso hecho a mano (tronco y brazos)
  const chain = (from, a0, a1, len, w0, w1, group, wig = .14) => {
    let n = from, a = a0, x = from.x, y = from.y;
    const steps = Math.max(2, Math.round(len / 11)), ph = rnd() * TAU;
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      a = lerp(a0, a1, u * u * (3 - 2 * u)) + Math.sin(u * 5.2 + ph) * wig * (1 - u * .4);
      x += Math.cos(a) * len / steps; y += Math.sin(a) * len / steps;
      n = node(x, y, n, group, lerp(w0, w1, u), true);
    }
    return n;
  };

  seed = 41;
  const base = node(BX, GY - 2, null, -1, 92, true);
  const trunkTop = chain(base, -Math.PI / 2 + .06, -Math.PI / 2 - .04, 96, 90, 78, -1, .04);
  // cinco brazos: los de afuera largos y casi horizontales, como el samán del campus
  const L = [
    [-2.45, -3.0, 370, 54, 8],
    [-2.02, -2.55, 290, 46, 7],
    [-1.66, -1.48, 200, 36, 6],
    [-1.12, -.6, 290, 46, 7],
    [-.7, -.14, 370, 54, 8],
  ];
  const limbs = L.map(([a0, a1, len, w0, w1], g) => chain(trunkTop, a0, a1, len, w0, w1, g, .15));
  // ramas secundarias gruesas que suben desde los brazos (dan la forma de candelabro)
  const along = (g, f) => { const ns = nodes.filter(n => n.group === g && n.skel); return ns[Math.floor(ns.length * f)]; };
  [[0, .38, -1.85, -2.15, 230, 24, 4], [0, .7, -2.0, -2.35, 170, 14, 3], [1, .55, -1.62, -1.9, 190, 18, 4],
   [3, .55, -1.52, -1.24, 190, 18, 4], [4, .38, -1.29, -.99, 230, 24, 4], [4, .7, -1.14, -.8, 170, 14, 3], [2, .65, -1.8, -2.05, 140, 12, 3], [2, .5, -1.34, -1.1, 140, 12, 3]]
    .forEach(([g, f, a0, a1, len, w0, w1]) => chain(along(g, f), a0, a1, len, w0, w1, g, .2));

  /* ---------- Colonización del espacio: ramas finas hacia la copa ---------- */
  seed = 9;
  const attr = [];
  while (attr.length < 620) {
    const x = rr(14, 986), y = rr(56, 450);
    if (y >= crownTop(x) && y <= crownBot(x)) attr.push({ x, y });
  }
  const DI = 96, DK = 18, STEP = 13; // ramas más dispersas: pasos largos y pocas atracciones
  const CELL = 48, grid = new Map();
  const key = (x, y) => ((x / CELL) | 0) + ',' + ((y / CELL) | 0);
  const put = n => { const kk = key(n.x, n.y); let a = grid.get(kk); if (!a) grid.set(kk, a = []); a.push(n); };
  // solo crecen desde los brazos (no desde el tronco)
  nodes.forEach(n => { if (n.group >= 0) put(n); });
  for (let it = 0; it < 160 && attr.length; it++) {
    const pull = new Map();
    for (const a of attr) {
      let best = null, bd = DI * DI;
      const cx = (a.x / CELL) | 0, cy = (a.y / CELL) | 0;
      for (let gx = cx - 2; gx <= cx + 2; gx++) for (let gy = cy - 2; gy <= cy + 2; gy++) {
        const arr = grid.get(gx + ',' + gy); if (!arr) continue;
        for (const n of arr) { const dx = a.x - n.x, dy = a.y - n.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = n; } }
      }
      if (best) {
        const d = Math.sqrt(bd) || 1; let v = pull.get(best);
        if (!v) pull.set(best, v = [0, 0, 0]);
        v[0] += (a.x - best.x) / d; v[1] += (a.y - best.y) / d; v[2]++;
      }
    }
    if (!pull.size) break;
    const fresh = [];
    pull.forEach((v, n) => {
      if (n.kids.length > 2) return;
      let dx = v[0] + rr(-.25, .25), dy = v[1] - .18 + rr(-.25, .25);
      const l = Math.hypot(dx, dy) || 1;
      const c = node(n.x + dx / l * STEP, n.y + dy / l * STEP, n, n.group);
      fresh.push(c); put(c);
    });
    for (let i = attr.length - 1; i >= 0; i--) {
      const a = attr[i];
      for (const c of fresh) { if ((a.x - c.x) ** 2 + (a.y - c.y) ** 2 < DK * DK) { attr.splice(i, 1); break; } }
    }
  }

  // grosor por modelo de tubos: cada rama suma el área de sus hijas
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    const pipe = n.kids.length ? Math.pow(n.kids.reduce((s, c) => s + Math.pow(c.w, 2.3), 0), 1 / 2.3) : 1.2;
    n.w = n.skel ? Math.max(n.w, pipe) : Math.min(pipe, 22);
  }
  // tiempos de crecimiento según la distancia desde el suelo
  let maxD = 0;
  nodes.forEach(n => { n.d = n.parent ? n.parent.d + Math.hypot(n.x - n.parent.x, n.y - n.parent.y) : 0; maxD = Math.max(maxD, n.d); });
  const G0 = .1, G1 = .6;
  nodes.forEach(n => { n.t = lerp(G0, G1, n.d / maxD); });
  const tips = nodes.filter(n => !n.kids.length && n.group >= 0);

  // aristas agrupadas por grosor: un trazo por grupo (rápido)
  const buckets = new Map();
  nodes.forEach(n => {
    if (!n.parent) return;
    const w = n.w < 6 ? Math.round(n.w * 4) / 4 : n.w < 20 ? Math.round(n.w) : Math.round(n.w / 3) * 3;
    const kk = n.group + '|' + w;
    let b = buckets.get(kk); if (!b) buckets.set(kk, b = { g: n.group, w, list: [] });
    b.list.push(n);
  });
  const bucketList = [...buckets.values()].sort((a, b) => b.w - a.w);

  // raíces
  seed = 7;
  const roots = [];
  for (let i = 0; i < 12; i++) { const dir = i % 2 ? 1 : -1; roots.push({ dir, len: rr(80, 270), w: rr(12, 26), lift: rr(4, 14), x0: BX + dir * rr(18, 44), t: rr(0, .05) }); }

  /* ---------- Follaje frondoso ---------- */
  let dots = [], blobs = [], flowers = [];
  const TONES = 6;
  const buildFoliage = () => {
    seed = 77; dots = []; blobs = []; flowers = [];
    const per = mini ? 40 : small() ? 34 : 60;
    // racimos en las puntas y en los nodos cercanos a ellas (copa llena)
    const host = nodes.filter(n => n.group >= 0 && ((!n.skel && n.w < 4.2) || (n.skel && !n.kids.length)));
    host.forEach(n => {
      const tip = !n.kids.length;
      const t = clamp(n.t + .04, 0, 1);
      if (tip || rnd() < .7) blobs.push({ n, rx: rr(32, 48), ry: rr(15, 22), dy: -3, t });
      const cnt = tip ? per : Math.round(per * .6);
      for (let i = 0; i < cnt; i++) {
        const r = Math.pow(rnd(), .65), th = rnd() * TAU;
        const dx = Math.cos(th) * r * 40, dy = Math.sin(th) * r * 19 - 5;
        const ct = crownTop(n.x);
        const light = clamp(.72 - (dy / 14) * .3 - ((n.y - ct) / 150) * .45 + ((BX - n.x) / 1000) * .22 + rr(-.16, .16));
        dots.push({ n, dx, dy, r: rr(1.6, 3.2), a: rr(-.9, .9) + (rnd() < .5 ? 0 : Math.PI), tone: Math.min(TONES - 1, Math.floor(light * TONES)), t: t + rr(0, .14) });
      }
      if (tip && n.y < crownTop(n.x) + 26 && rnd() < .1) flowers.push({ n, dx: rr(-12, 12), dy: rr(-14, -6), t: .86 + rr(0, .1), k: 5 + (rnd() * 3 | 0) });
    });
  };
  buildFoliage();

  /* ---------- Estado ---------- */
  let P = reduce ? 1 : 0, Pv = P, fold = 0, foldT = 0, gust = 0, T = 0, spawn = 0;
  const falling = [];
  let visible = false, raf = 0, last = 0;

  /* ---------- Lienzo ---------- */
  let k = 1, ox = 0, oy = 0, dpr = 1, cw = 0, ch = 0, sprites = null, spriteFold = -1;
  const fit = () => {
    const r = art.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    cw = Math.max(1, r.width); ch = Math.max(1, r.height);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    // en el teléfono el árbol se agranda y las puntas de la copa pueden salirse un poco por los lados
    k = Math.min(cw / W * (small() && !mini ? 1.32 : 1), ch / (H - 40));
    ox = (cw - W * k) / 2;
    oy = ch - H * k + (small() && !mini ? 4 : 0);
    notes.forEach(n => {
      let x = ox + +n.dataset.x * k; const y = oy + +n.dataset.y * k, w = n.offsetWidth || 120;
      if (n.dataset.side === 'l') x = Math.max(x, w + 4); else x = Math.min(x, cw - w - 4);
      n.style.left = x + 'px'; n.style.top = y + 'px';
    });
    sprites = null;
  };

  /* ---------- Paleta ---------- */
  const rgb = (a, b, t) => `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
  const mixA = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const BARK = [124, 104, 86], BARK_SH = [52, 42, 34], BARK_HI = [190, 172, 146], DUSK = [255, 196, 140];
  const LEAF_DARK = [22, 58, 32], LEAF_LIGHT = [168, 214, 104], MOSS = [104, 138, 70];

  const grownTo = (n, p) => {
    const a = n.parent.t, b = n.t;
    return b <= a ? (p >= b ? 1 : 0) : clamp((p - a) / (b - a));
  };

  /* ---------- Escena ---------- */
  // only: undefined = todo; -1 = base; 0..4 = un brazo
  const scene = (c, p, only) => {
    const isBase = only === undefined || only === -1;
    const leafP = clamp((p - .46) / .44);
    c.lineCap = 'round'; c.lineJoin = 'round';

    if (isBase) {
      // la Biblioteca al fondo: bandas de concreto apenas sugeridas
      const bp = clamp((p - .02) / .2);
      if (bp > 0) {
        c.strokeStyle = `rgba(${LINE},${(light ? .1 : .07) * bp})`; c.lineWidth = 1.2;
        c.beginPath();
        const x0 = 70, x1 = 70 + 860 * ease(bp);
        [436, 468, 474, 520, 526].forEach(y => { c.moveTo(x0, y); c.lineTo(x1, y); });
        for (let x = 90; x < x1; x += 46) { c.moveTo(x, 526); c.lineTo(x, GY); }
        c.stroke();
      }
      if (leafP > 0) {
        c.save(); c.translate(BX, GY + 4); c.scale(1, .1);
        const sh = c.createRadialGradient(0, 0, 10, 0, 0, 480);
        sh.addColorStop(0, `rgba(0,0,0,${(light ? .18 : .5) * leafP})`); sh.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = sh; c.beginPath(); c.arc(0, 0, 480, 0, TAU); c.fill(); c.restore();
      }
      const gp = clamp(p / .1);
      if (gp > 0) {
        const gl = c.createLinearGradient(BX - 490, 0, BX + 490, 0);
        gl.addColorStop(0, `rgba(${LINE},0)`); gl.addColorStop(.5, `rgba(${LINE},.4)`); gl.addColorStop(1, `rgba(${LINE},0)`);
        c.fillStyle = gl; c.fillRect(BX - 490 * gp, GY, 980 * gp, 1.2);
        c.fillStyle = `rgba(${MOSS.join(',')},.35)`;
        let s2 = 5; const r2 = () => { s2 = s2 * 16807 % 2147483647; return s2 / 2147483647; };
        for (let i = 0; i < 220 * gp; i++) { const x = BX + (r2() * 940 - 470) * gp, h = 1 + r2() * 4; c.fillRect(x, GY - h, 1, h); }
      }
    }

    // dos banquitos de cemento a cada lado, con el mismo trazo a lápiz
    if (isBase) {
      const bp = clamp((p - .04) / .12);
      if (bp > 0) {
        const ink2 = rgb(INK, DUSK, fold * .45);
        (small() && !mini ? [[146, 250], [750, 854]] : [[120, 236], [764, 880]]).forEach(([x0, x1], bi) => {
          const e = ease(bp), y = GY - 28, th = 8, dp = 7, lh = y + th;
          c.globalAlpha = e;
          // relleno para tapar lo de atrás
          c.fillStyle = PAPER; c.beginPath();
          c.moveTo(x0, y); c.lineTo(x0 + dp, y - dp); c.lineTo(x1 + dp, y - dp); c.lineTo(x1, y); c.lineTo(x1, lh); c.lineTo(x0, lh); c.closePath();
          [[x0 + 12, x0 + 26], [x1 - 26, x1 - 12]].forEach(([a, b]) => { c.rect(a, lh, b - a, GY - lh); });
          c.fill();
          // contornos
          c.strokeStyle = ink2; c.lineWidth = .95; c.beginPath();
          c.moveTo(x0, y); c.lineTo(x0 + dp, y - dp); c.lineTo(x1 + dp, y - dp); c.lineTo(x1, y); c.lineTo(x0, y);
          c.lineTo(x0, lh); c.lineTo(x1, lh); c.lineTo(x1, y); c.moveTo(x1, lh); c.lineTo(x1 + dp, lh - dp); c.lineTo(x1 + dp, y - dp);
          [[x0 + 12, x0 + 26], [x1 - 26, x1 - 12]].forEach(([a, b]) => {
            c.moveTo(a, lh); c.lineTo(a, GY); c.moveTo(b, lh); c.lineTo(b, GY);
            c.moveTo(b, lh); c.lineTo(b + 4, lh - 4); c.lineTo(b + 4, GY - 4);
          });
          c.stroke();
          // rayado del frente y de las patas (textura de cemento)
          c.strokeStyle = `rgba(${INK_S},.32)`; c.lineWidth = .65; c.beginPath();
          for (let x = x0 + 3; x < x1 - 1; x += 4.2) { c.moveTo(x, y + 1.5); c.lineTo(x - 2, lh - 1); }
          [[x0 + 12, x0 + 26], [x1 - 26, x1 - 12]].forEach(([a, b]) => { for (let yy = lh + 3; yy < GY - 1; yy += 3.6) { c.moveTo(a + 1, yy); c.lineTo(b - 1, yy - 1.5); } });
          // puntitos del cemento en el asiento
          for (let i = 0; i < 14; i++) { const px = x0 + 6 + ((i * 37 + bi * 11) % (x1 - x0 - 10)), py = y - 1.5 - (i % 3) * 1.8; c.moveTo(px, py); c.lineTo(px + .8, py); }
          c.stroke();
          c.globalAlpha = 1;
        });
      }
    }

    // masa del follaje detrás de las ramas
    if (leafP > 0) {
      c.fillStyle = rgb(light ? [70, 112, 62] : [18, 46, 26], [10, 30, 18], fold * .7);
      c.globalAlpha = (light ? .34 : .78) * (1 + fold * .15);
      c.beginPath();
      blobs.forEach(b => {
        if (only !== undefined && b.n.group !== only) return;
        const g = clamp((p - b.t) / .16); if (g <= 0) return;
        const e = ease(g);
        c.moveTo(b.n.x + b.rx * e, b.n.y + b.dy); c.ellipse(b.n.x, b.n.y + b.dy, b.rx * e, b.ry * e, 0, 0, TAU);
      });
      c.fill(); c.globalAlpha = 1;
    }

    // madera a lápiz: relleno del color del fondo (tapa la masa verde de atrás),
    // contornos finos, rayado en el lado de la sombra y vetas en la corteza
    const ink = rgb(INK, DUSK, fold * .45), inkSoft = `rgba(${INK_S},${.34 + fold * .1})`, paper = PAPER;
    const visibleEdges = [];
    nodes.forEach(n => {
      if (!n.parent || (only !== undefined && n.group !== only && !(only === -1 && n.group === -1))) return;
      if (only !== undefined && only !== -1 && n.group === -1) return;
      const f = grownTo(n, p); if (f <= 0) return;
      visibleEdges.push([n, f]);
    });
    c.save(); c.beginPath(); c.rect(-400, -400, W + 800, GY + 401); c.clip();
    // 1) relleno
    c.strokeStyle = paper; c.lineCap = 'round'; c.lineJoin = 'round';
    bucketList.forEach(bk => {
      if (only !== undefined && bk.g !== only) return;
      if (bk.w < 2.6) return;
      c.lineWidth = bk.w; c.beginPath(); let any = false;
      for (const n of bk.list) { const f = grownTo(n, p); if (f <= 0) continue; const pa = n.parent; c.moveTo(pa.x, pa.y); c.lineTo(pa.x + (n.x - pa.x) * f, pa.y + (n.y - pa.y) * f); any = true; }
      if (any) c.stroke();
    });
    if (isBase) {
      c.fillStyle = paper; c.beginPath();
      const f = clamp(p / .12);
      if (f > 0) { const h = 70 * ease(f); c.moveTo(BX - 46, GY - h); c.bezierCurveTo(BX - 50, GY - h * .35, BX - 74, GY - 6, BX - 98, GY + .5); c.lineTo(BX + 100, GY + .5); c.bezierCurveTo(BX + 76, GY - 6, BX + 52, GY - h * .35, BX + 48, GY - h); c.closePath(); }
      c.fill();
    }
    // 2) contornos: dos líneas finas paralelas por rama gruesa, una sola por ramita
    c.strokeStyle = ink; c.lineWidth = .95; c.beginPath();
    const thin = [];
    for (const [n, f] of visibleEdges) {
      const pa = n.parent, ex = pa.x + (n.x - pa.x) * f, ey = pa.y + (n.y - pa.y) * f;
      if (n.w < 2.6) { thin.push(pa.x, pa.y, ex, ey, n.w); continue; }
      const a = Math.atan2(ey - pa.y, ex - pa.x), nx = -Math.sin(a), ny = Math.cos(a);
      const w0 = (pa.parent ? Math.max(n.w, Math.min(pa.w, n.w * 1.15)) : n.w) / 2, w1 = n.w / 2;
      const j = Math.sin(n.i * 2.3) * .35; // pulso de la mano
      c.moveTo(pa.x + nx * w0, pa.y + ny * w0); c.lineTo(ex + nx * (w1 + j), ey + ny * (w1 + j));
      c.moveTo(pa.x - nx * w0, pa.y - ny * w0); c.lineTo(ex - nx * (w1 - j), ey - ny * (w1 - j));
    }
    c.stroke();
    // ramitas: trazo único, más tenue cuanto más fina
    c.lineWidth = .8; c.strokeStyle = ink; c.globalAlpha = .82; c.beginPath();
    for (let i = 0; i < thin.length; i += 5) { c.moveTo(thin[i], thin[i + 1]); c.lineTo(thin[i + 2], thin[i + 3]); }
    c.stroke(); c.globalAlpha = 1;
    // 3) rayado de sombra (lado derecho e inferior) y vetas a lo largo
    c.strokeStyle = inkSoft; c.lineWidth = .7; c.beginPath();
    for (const [n, f] of visibleEdges) {
      if (n.w < 7) continue;
      const pa = n.parent, ex = pa.x + (n.x - pa.x) * f, ey = pa.y + (n.y - pa.y) * f;
      const dx = ex - pa.x, dy = ey - pa.y, L = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
      let nx = -Math.sin(a), ny = Math.cos(a);
      if (nx + ny * .6 < 0) { nx = -nx; ny = -ny; } // hacia el lado de la sombra (abajo a la derecha)
      const half = n.w / 2, step = n.w > 40 ? 3.2 : 4;
      for (let t = 0; t < L; t += step) {
        const u = t / L, bx = pa.x + dx * u, by = pa.y + dy * u;
        const reach = half * (.35 + .25 * Math.abs(Math.sin(n.i + t * .4)));
        c.moveTo(bx + nx * (half - .6), by + ny * (half - .6));
        c.lineTo(bx + nx * (half - reach) + dx / L * 2.2, by + ny * (half - reach) + dy / L * 2.2);
      }
      // vetas de corteza
      const lines = n.w > 50 ? 4 : n.w > 24 ? 2 : 1;
      for (let k2 = 0; k2 < lines; k2++) {
        const o = ((k2 + .5) / lines - .5) * n.w * .55 + Math.sin(n.i * 1.7 + k2) * 1.6;
        c.moveTo(pa.x - nx * o, pa.y - ny * o); c.lineTo(ex - nx * (o + Math.sin(n.i + k2)), ey - ny * (o + Math.sin(n.i + k2)));
      }
    }
    c.stroke();
    c.restore();
    if (isBase) {
      // pie ensanchado y raíces a lápiz
      const f = clamp(p / .12);
      c.strokeStyle = ink; c.lineWidth = .95; c.beginPath();
      if (f > 0) {
        const h = 70 * ease(f);
        c.moveTo(BX - 46, GY - h); c.bezierCurveTo(BX - 50, GY - h * .35, BX - 74, GY - 6, BX - 98, GY + .5);
        c.moveTo(BX + 48, GY - h); c.bezierCurveTo(BX + 52, GY - h * .35, BX + 76, GY - 6, BX + 100, GY + .5);
      }
      roots.forEach(r => {
        const fr = clamp((p - r.t) / .1); if (fr <= 0) return;
        const Lr = r.len * ease(fr), n = 12;
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 0; i <= n; i++) {
            const u = i / n, x = r.x0 + r.dir * Lr * u, w = (r.w * (1 - u) * fr + .4) / 2;
            const y = GY - Math.sin(u * Math.PI) * r.lift - (side < 0 ? w * 1.1 : 0);
            if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
          }
        }
      });
      c.stroke();
      c.strokeStyle = inkSoft; c.lineWidth = .7; c.beginPath();
      if (f > 0) for (let x = -40; x <= 44; x += 7) { const sx = BX + x; c.moveTo(sx, GY - 4); c.lineTo(sx + Math.sin(x) * 2, GY - 60 * ease(f) + Math.abs(x) * .3); }
      c.stroke();
    }
    // musgo en la cara de arriba de los brazos
    {
      const f = clamp((p - .3) / .2);
      if (f > 0) {
        c.fillStyle = rgb(MOSS, DUSK, fold * .3); c.globalAlpha = .75 * f; c.beginPath();
        nodes.forEach(n => {
          if (!n.skel || n.w < 14 || n.i % 2 || (only !== undefined && n.group !== only)) return;
          if (!n.parent || grownTo(n, p) < 1) return;
          const s2 = 1.1 + (n.i % 3) * .5; c.rect(n.x - n.w * .15 + (n.i % 5), n.y - n.w * .45, s2, s2);
        });
        c.fill(); c.globalAlpha = 1;
      }
    }

    // hojas: punteado verde por tonos
    if (leafP > 0) {
      const shrink = lerp(1, .9, fold);
      c.lineCap = 'round';
      for (let tn = 0; tn < TONES; tn++) {
        const base = mixA(LEAF_DARK, LEAF_LIGHT, tn / (TONES - 1));
        const t2 = tn / (TONES - 1); c.strokeStyle = fold ? rgb(rgb(base, [8, 30, 16], fold * (1 - t2) * .45).match(/\d+/g).map(Number), [255, 196, 110], fold * t2 * .32) : rgb(base, base, 0);
        c.lineWidth = lerp(1.9, 1.6, fold);
        c.beginPath();
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          if (d.tone !== tn || (only !== undefined && d.n.group !== only)) continue;
          const g = clamp((p - d.t) / .1); if (g <= 0) continue;
          const r = d.r * ease(g) * shrink, x = d.n.x + d.dx, y = d.n.y + d.dy;
          const ca = Math.cos(d.a) * r, sa = Math.sin(d.a) * r * .7;
          c.moveTo(x - ca, y - sa); c.lineTo(x + ca, y + sa);
        }
        c.stroke();
      }
      const fp = clamp((p - .86) / .1);
      if (fp > 0) {
        c.fillStyle = `rgba(255,132,160,${.95 * fp})`; c.beginPath();
        flowers.forEach(fl => {
          if (only !== undefined && fl.n.group !== only) return;
          for (let i = 0; i < fl.k; i++) {
            const a = -Math.PI / 2 + (i - (fl.k - 1) / 2) * .45, R = 3.4 * fp;
            c.rect(fl.n.x + fl.dx + Math.cos(a) * R - .7, fl.n.y + fl.dy + Math.sin(a) * R - .7, 1.4, 1.4);
          }
        });
        c.fill();
        c.fillStyle = '#D40134'; c.beginPath();
        flowers.forEach(fl => { if (only === undefined || fl.n.group === only) c.rect(fl.n.x + fl.dx - 1, fl.n.y + fl.dy - 1, 2, 2); });
        c.fill();
      }
    }
  };

  /* ---------- Capas por brazo (árbol completo) ---------- */
  const bbox = g => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    nodes.forEach(n => { if (n.group !== g) return; x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y); });
    const m = 70; return [x0 - m, y0 - m, x1 - x0 + m * 2, y1 - y0 + m * 2];
  };
  const buildSprites = () => {
    const sc = k * dpr;
    sprites = [-1, 0, 1, 2, 3, 4].map(g => {
      const [bx, by, bw, bh] = g === -1 ? [-20, 380, W + 40, H - 380] : bbox(g);
      const o = document.createElement('canvas');
      o.width = Math.max(1, Math.ceil(bw * sc)); o.height = Math.max(1, Math.ceil(bh * sc));
      const c = o.getContext('2d');
      c.setTransform(sc, 0, 0, sc, -bx * sc, -by * sc);
      scene(c, 1, g);
      return { g, o, bx, by, bw, bh, ph: g * 1.9 };
    });
    spriteFold = fold;
  };

  /* ---------- Cuadro ---------- */
  const frame = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
    if (fold > .01) {
      const g = ctx.createRadialGradient(BX, 300, 30, BX, 300, 580);
      g.addColorStop(0, `rgba(255,122,0,${.62 * fold})`); g.addColorStop(.5, `rgba(255,106,0,${.2 * fold})`); g.addColorStop(1, "rgba(255,106,0,0)");
      ctx.fillStyle = g; ctx.fillRect(-300, -100, W + 600, H + 100);
    }
    if (Pv < .995) scene(ctx, Pv);
    else {
      if (!sprites || Math.abs(spriteFold - fold) > .02) buildSprites();
      const px = trunkTop.x, py = trunkTop.y;
      sprites.forEach(sp => {
        if (sp.g === -1) return;
        const outer = Math.abs(sp.g - 2) / 2, dir = sp.g < 2 ? 1 : sp.g > 2 ? -1 : 0;
        const a = reduce ? 0 : (Math.sin(T * .8 + sp.ph) * .004 + Math.sin(T * 1.9 + sp.ph * 2) * .0013) * (.6 + outer) - gust * .018 * (.4 + outer) * (dir || .3);
        ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.translate(-px, -py);
        ctx.drawImage(sp.o, sp.bx, sp.by, sp.bw, sp.bh);
        ctx.restore();
      });
      const b = sprites[0]; ctx.drawImage(b.o, b.bx, b.by, b.bw, b.bh); // tronco encima del arranque de los brazos
    }
    if (falling.length) {
      ctx.fillStyle = rgb([126, 176, 82], DUSK, fold * .4);
      falling.forEach(f => {
        ctx.globalAlpha = f.a;
        const c = Math.cos(f.r), sn = Math.sin(f.r), s = 4, w = 1.6;
        ctx.beginPath();
        ctx.moveTo(f.x - c * s, f.y - sn * s); ctx.lineTo(f.x - sn * w, f.y + c * w);
        ctx.lineTo(f.x + c * s, f.y + sn * s); ctx.lineTo(f.x + sn * w, f.y - c * w);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
  };

  /* ---------- Animación ---------- */
  const tick = now => {
    raf = 0;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    T += dt;
    Pv += (P - Pv) * (reduce ? 1 : 1 - Math.pow(.002, dt));
    if (Math.abs(P - Pv) < .0004) Pv = P;
    fold += (foldT - fold) * (reduce ? 1 : 1 - Math.pow(.04, dt));
    if (Math.abs(foldT - fold) < .004) fold = foldT;
    gust *= Math.pow(.2, dt);
    if (!reduce && Pv > .995) {
      spawn -= dt;
      if (spawn <= 0 && falling.length < (small() ? 15 : 27)) {
        spawn = rr(.14, .45);
        const d = dots[(rnd() * dots.length) | 0];
        falling.push({ x: d.n.x + d.dx, y: d.n.y + d.dy, vy: rr(16, 30), r: rnd() * 6, vr: rr(-2.4, 2.4), a: 1, ph: rnd() * 6 });
      }
    }
    for (let i = falling.length - 1; i >= 0; i--) {
      const f = falling[i];
      f.x += (Math.sin(T * 1.5 + f.ph) * 20 + gust * 40) * dt; f.y += f.vy * dt; f.r += f.vr * dt;
      if (f.y > GY - 3) { f.y = GY - 3; f.vy = 0; f.vr = 0; f.a -= dt * .5; }
      if (f.a <= 0 || Pv < .98) falling.splice(i, 1);
    }
    frame();
    notes.forEach(n => n.classList.toggle('is-on', Pv >= +n.dataset.at));
    if (barFill) barFill.style.transform = `scaleX(${Pv.toFixed(4)})`;
    const moving = P !== Pv || fold !== foldT || Math.abs(gust) > .001;
    if (visible && (!reduce || moving)) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick); } };

  /* ---------- Scroll: crece al bajar, se recoge al subir ---------- */
  // grande: fijo en pantalla, crece a lo largo de su recorrido; mini: crece mientras sube desde abajo hasta un cuarto de la pantalla
  const fromRect = () => {
    const r = root.getBoundingClientRect();
    if (mini) return clamp((innerHeight - r.top) / (innerHeight * .78));
    const run = r.height - innerHeight; return clamp(-r.top / ((run || 1) * .84));
  };
  if (!reduce && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create(mini
      ? { trigger: root, start: 'top bottom', end: 'top 22%', onUpdate: s => { P = s.progress; kick(); }, onRefresh: () => { P = fromRect(); kick(); } }
      : { trigger: root, start: 'top top', end: 'bottom bottom', onUpdate: s => { P = clamp(s.progress / .84); kick(); }, onRefresh: () => { P = fromRect(); kick(); } });
  } else if (!reduce) addEventListener('scroll', () => { P = fromRect(); kick(); }, { passive: true });

  /* ---------- Cursor y dedo: ráfaga ---------- */
  let lx = null;
  art.addEventListener('pointermove', e => { if (lx !== null) gust = clamp(gust + (e.clientX - lx) * .006, -1.4, 1.4); lx = e.clientX; kick(); }, { passive: true });
  art.addEventListener('pointerleave', () => { lx = null; });

  /* ---------- Atardecer ---------- */
  modeBtn?.addEventListener('click', () => {
    const on = modeBtn.getAttribute('aria-pressed') !== 'true';
    modeBtn.setAttribute('aria-pressed', on);
    root.classList.toggle('is-dusk', on);
    modeBtn.querySelector('.saman__mode-t').textContent = on ? 'Ver de día' : 'Ver al atardecer';
    foldT = on ? 1 : 0; gust += .5; kick();
  });

  /* ---------- Solo se anima mientras se ve ---------- */
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) kick(); }), { rootMargin: '120px' }).observe(art);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden && art.getBoundingClientRect().bottom > 0; kick(); });

  let lw = innerWidth, wasSmall = small();
  addEventListener('resize', () => {
    if (small() && innerWidth === lw) return; // la barra del navegador del teléfono no cuenta
    lw = innerWidth;
    if (small() !== wasSmall) { wasSmall = small(); buildFoliage(); }
    fit(); frame();
  });
  fit(); P = reduce ? 1 : fromRect(); Pv = P; frame();
};
document.querySelectorAll('.saman').forEach(r => setup(r, false));
document.querySelectorAll('.saman-mini').forEach(r => setup(r, true));
})();
