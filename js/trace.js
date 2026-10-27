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

  window.traceTitle = (units, { delay = 0, draw = 2.4, stagger = .14 } = {}) => {
    if (reduce || typeof gsap === 'undefined') { gsap?.set(units, { opacity: 1 }); return null; }
    const parts = [...units].map(build);
    gsap.set(parts.map(p => p.fill), { opacity: 0 });
    gsap.set(units, { opacity: 1 });
    const tl = gsap.timeline({
      delay,
      onComplete: () => parts.forEach(p => {
        p.svg.remove();
        p.u.classList.remove('is-tracing');
        gsap.set(p.fill, { clearProps: 'opacity' });
      })
    });
    // 1) el contorno lacre se dibuja  2) se llena de lacre  3) la tinta se asienta en su color
    parts.forEach((p, i) => {
      const t = i * stagger;
      tl.fromTo(p.text, { strokeDasharray: p.len, strokeDashoffset: p.len },
          { strokeDashoffset: 0, duration: draw, ease: 'power2.inOut' }, t)
        .to(p.text, { fillOpacity: 1, duration: .55, ease: 'power1.inOut' }, t + draw - .35)
        .to(p.fill, { opacity: 1, duration: .5, ease: "power1.out" }, t + draw + .2)
        .to(p.svg, { opacity: 0, duration: .8, ease: "power2.inOut" }, t + draw + .3);
    });
    return tl;
  };
  window.traceTitle.ok = !reduce;
})();
