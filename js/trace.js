/* Escuela de Derecho · UNIMET — títulos que se trazan en lacre y luego se rellenan.
   Cada unidad (línea o letra) recibe encima un SVG con el mismo texto, palabra por palabra
   en su posición exacta; el contorno se dibuja, entra el relleno real y el SVG se retira. */

(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const build = (u) => {
    const ur = u.getBoundingClientRect();
    const cs = getComputedStyle(u);
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    u.prepend(probe);
    const base = probe.getBoundingClientRect().bottom - ur.top;
    probe.remove();

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'trace');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', ur.width.toFixed(1));
    svg.setAttribute('height', ur.height.toFixed(1));
    const text = document.createElementNS(NS, 'text');
    Object.assign(text.style, {
      fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing, fontVariationSettings: cs.fontVariationSettings
    });

    // palabra por palabra, cada una en el x que ocupa en la página
    const walker = document.createTreeWalker(u, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let node;
    while ((node = walker.nextNode())) {
      const style = getComputedStyle(node.parentElement).fontStyle;
      const re = /\S+/g;
      let m;
      while ((m = re.exec(node.data))) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const t = document.createElementNS(NS, 'tspan');
        t.setAttribute('x', (range.getBoundingClientRect().left - ur.left).toFixed(2));
        t.setAttribute('y', base.toFixed(2));
        t.style.fontStyle = style;
        t.textContent = m[0];
        text.append(t);
      }
    }
    svg.append(text);

    const fill = document.createElement('span');
    fill.className = 'trace-fill';
    while (u.firstChild) fill.append(u.firstChild);
    u.classList.add('is-tracing');
    u.append(fill, svg);
    return { u, svg, text, fill, len: parseFloat(cs.fontSize) * 4.2 };
  };

  // Devuelve la línea de tiempo (o null con movimiento reducido)
  window.traceTitle = (units, { delay = 0, draw = 1.9, stagger = .1 } = {}) => {
    if (reduce || typeof gsap === 'undefined') return null;
    const parts = [...units].map(build);
    const at = (i) => delay + i * stagger;
    const tl = gsap.timeline({
      onComplete: () => parts.forEach(p => {
        p.svg.remove();
        p.u.classList.remove('is-tracing');
        gsap.set(p.fill, { clearProps: 'opacity' });
      })
    });
    parts.forEach((p, i) => {
      tl.set(p.fill, { opacity: 0 }, 0)
        .fromTo(p.text, { strokeDasharray: p.len, strokeDashoffset: p.len },
          { strokeDashoffset: 0, duration: draw, ease: 'power2.inOut' }, at(i))
        .to(p.fill, { opacity: 1, duration: .9, ease: 'power1.out' }, at(i) + draw - .55)
        .to(p.svg, { opacity: 0, duration: .9, ease: 'power1.out' }, at(i) + draw - .4);
    });
    return tl;
  };
})();
