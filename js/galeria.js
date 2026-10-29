/* Galería: carrusel con flechas, deslizamiento nativo y trackpad */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.js-gal').forEach(g => {
    const tr = $('.gal__track', g), bar = $('.gal__bar', g), bs = $$('.gal__btn', g);
    // Las fotos más verticales que el recuadro se muestran completas
    $$('img', tr).forEach(img => {
      const iw = +img.getAttribute('width') || img.naturalWidth, ih = +img.getAttribute('height') || img.naturalHeight;
      const r = iw / ih, fr = tr.clientWidth / tr.clientHeight;
      // muy verticales o muy panorámicas: completas sobre el fondo difuminado, sin cortar a nadie
      if (iw && ih && (r < fr * .8 || r > fr * 1.15)) img.parentNode.classList.add('gal__s--v');
    });
    // Fondo único: dos capas que se alternan al cambiar de foto
    const bgs = $$('.gal__bg', g); let shown = -1, layer = 0;
    // Adelanta la carga de las fotos vecinas para que nunca aparezca un recuadro vacío
    const near = k => $$('img', tr).slice(Math.max(0, k - 1), k + 3).forEach(im => { if (im.loading === 'lazy') im.loading = 'eager'; });
    const backdrop = k => {
      near(k);
      if (k === shown || !bgs.length) return;
      const img = $$('img', tr)[k];
      if (!img) return;
      shown = k; layer ^= 1;
      bgs[layer].style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      bgs[layer].classList.add('is-on'); bgs[layer ^ 1].classList.remove('is-on');
    };
    const n = () => tr.children.length, w = () => tr.getBoundingClientRect().width || 1, i = () => Math.round(tr.scrollLeft / w());
    // La línea marca el avance continuo; el punto se arrastra para recorrer las fotos
    const max = () => Math.max(1, tr.scrollWidth - tr.clientWidth);
    // Desplazamiento propio y suave (las flechas, el punto y el trackpad usan el mismo)
    let raf = 0, slide = 0, drag = false, want = 0;
    const stop = () => { cancelAnimationFrame(raf); raf = 0; tr.style.scrollSnapType = ''; };
    const glide = (k, dur = 1000) => {
      slide = Math.max(0, Math.min(n() - 1, k));
      backdrop(slide);
      const x = slide * w(), x0 = tr.scrollLeft, t0 = performance.now();
      cancelAnimationFrame(raf);
      if (reduce || Math.abs(x - x0) < 1) { tr.scrollLeft = x; stop(); return; }
      tr.style.scrollSnapType = 'none';
      const step = now => {
        const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 4);
        tr.scrollLeft = x0 + (x - x0) * e;
        if (t < 1) raf = requestAnimationFrame(step); else { tr.scrollLeft = x; stop(); }
      };
      raf = requestAnimationFrame(step);
    };
    const sync = () => {
      const k = i(), m = n();
      backdrop(raf && !drag ? slide : k);
      if (!drag) bar.style.setProperty('--p', Math.min(1, Math.max(0, tr.scrollLeft / max())));
      bar.setAttribute('aria-valuemax', m); bar.setAttribute('aria-valuenow', k + 1);
      bs[0].disabled = k <= 0; bs[1].disabled = k >= m - 1;
    };
    const go = d => glide((raf ? slide : i()) + d);
    bs.forEach(b => b.addEventListener('click', () => go(+b.dataset.d)));
    // El punto sigue al dedo o al cursor; las fotos lo alcanzan con suavidad
    const follow = () => {
      tr.scrollLeft += (want - tr.scrollLeft) * .16;
      if (drag) raf = requestAnimationFrame(follow);
    };
    const seek = e => {
      const r = bar.getBoundingClientRect(), q = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      bar.style.setProperty('--p', q); want = q * max();
    };
    bar.addEventListener('pointerdown', e => {
      e.preventDefault(); cancelAnimationFrame(raf);
      drag = true; try { bar.setPointerCapture(e.pointerId); } catch (_) {} bar.classList.add('is-drag');
      tr.style.scrollSnapType = 'none'; seek(e);
      if (reduce) tr.scrollLeft = want; else raf = requestAnimationFrame(follow);
    });
    bar.addEventListener('pointermove', e => { if (drag) { seek(e); if (reduce) tr.scrollLeft = want; } });
    const end = () => {
      if (!drag) return;
      drag = false; bar.classList.remove('is-drag'); cancelAnimationFrame(raf); raf = 0;
      glide(Math.round(want / w()), 750);
    };
    bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
    bar.addEventListener('lostpointercapture', end);
    bar.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (e.key === 'Home') { e.preventDefault(); glide(0); } else if (e.key === 'End') { e.preventDefault(); glide(n() - 1); } else if (d) { e.preventDefault(); go(d); }
    });
    // Las fotos no se arrastran con el mouse (ni como imagen fantasma)
    tr.addEventListener('dragstart', e => e.preventDefault());
    // Si el dedo toma las fotos a mitad de un desplazamiento, manda el dedo
    tr.addEventListener('touchstart', () => { if (raf && !drag) stop(); }, { passive: true });
    // Trackpad o rueda horizontal: un gesto avanza una foto (el snap nativo de Chrome devuelve los pasos cortos)
    let acc = 0, lock = 0;
    tr.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      acc += e.deltaX;
      if (Math.abs(acc) > 30) { go(Math.sign(acc)); acc = 0; lock = now + 650; }
    }, { passive: false });
    tr.addEventListener('scroll', () => { if (!raf && !drag) slide = i(); requestAnimationFrame(sync); }, { passive: true });
    addEventListener('resize', () => { if (!drag) { stop(); tr.scrollLeft = slide * w(); } sync(); });
    sync();
  });

  // Título trazado, como en Profesores y el CED
  const lines = $$('.js-gal-ln');
  if (lines.length && window.traceTitle?.ok && typeof gsap !== 'undefined') {
    gsap.set(lines, { opacity: 0 });
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() =>
      traceTitle(lines, innerWidth <= 820 ? { delay: .25, draw: .9, quick: true } : { delay: .3, draw: 1.8, calm: true })));
  }

  // Brocardos
  $$('.broc').forEach(b => b.addEventListener('click', () => b.classList.toggle('is-open')));
})();
