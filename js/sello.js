/* Escuela de Derecho · UNIMET — sello de lacre en "Disposición final".
   Ligado al scroll: el sello baja desde cerca de la pantalla girando, golpea, se aplasta
   soltando cera por los bordes y queda pegado. Al subir, se despega.
   Va junto al título "Escríbenos. Te orientamos.". */

(() => {
  const grid = document.querySelector('.contacto__grid');
  if (!grid) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WAX = 'M184.8 100.0C184.8 106.7 182.4 113.3 181.1 120.0C179.8 126.7 180.3 134.6 177.1 140.5C173.9 146.3 166.8 150.0 162.1 155.0C157.5 160.1 153.9 165.7 149.0 171.0C144.1 176.3 139.5 185.1 133.0 187.0C126.5 188.9 117.2 182.6 110.0 182.3C102.8 182.0 96.2 186.2 89.6 185.4C83.1 184.6 77.0 179.9 70.7 177.4C64.3 174.9 56.9 174.1 51.4 170.4C45.9 166.7 42.1 160.3 37.9 155.0C33.7 149.7 29.9 144.4 26.4 138.6C22.9 132.9 19.5 126.9 17.0 120.5C14.6 114.0 11.4 106.7 11.7 100.0C12.1 93.3 16.7 86.6 19.1 80.0C21.4 73.5 22.9 67.2 25.6 60.9C28.2 54.7 31.6 48.9 35.0 42.4C38.4 35.8 40.2 25.6 46.0 21.7C51.7 17.8 62.0 20.1 69.3 19.1C76.6 18.0 82.8 16.6 89.7 15.3C96.6 14.1 104.2 10.1 110.8 11.3C117.4 12.5 122.8 19.9 129.4 22.6C136.0 25.2 144.6 23.6 150.3 27.2C155.9 30.7 159.3 38.3 163.3 43.9C167.2 49.6 171.0 55.2 173.9 61.2C176.9 67.2 179.1 73.6 180.9 80.1C182.7 86.5 184.7 93.3 184.8 100.0Z';
  const RING = 'Escuela de Derecho · Universidad Metropolitana · ';
  // cera que se escapa por el borde al presionar: [x, y, radio]
  const DROPS = [[22, 52, 4.2], [181, 150, 3.4], [168, 22, 2.6], [36, 176, 2.9], [196, 92, 2]];

  const seal = document.createElement('div');
  seal.className = 'sello';
  seal.setAttribute('aria-hidden', 'true');
  // relieve: cada trazo del grabado en sombra (abajo) y en luz (arriba) sobre la cera
  seal.innerHTML = `
    <span class="sello__wave"></span>
    <svg class="sello__wax" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="selloCera" cx="50%" cy="46%" r="60%">
          <stop offset="0" stop-color="#B8072F"/><stop offset=".62" stop-color="#A2002A"/><stop offset="1" stop-color="#6A0017"/>
        </radialGradient>
        <radialGradient id="selloHueco" cx="58%" cy="64%" r="70%">
          <stop offset="0" stop-color="#B3062F"/><stop offset="1" stop-color="#76001B"/>
        </radialGradient>
        <path id="selloArco" d="M100 100m-55 0a55 55 0 1 1 110 0a55 55 0 1 1-110 0"/>
      </defs>
      <g class="sello__drops">${DROPS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#selloCera)"/>`).join('')}</g>
      <g class="sello__body">
        <path d="${WAX}" fill="url(#selloCera)"/>
        <g class="sello__mark">
          <circle cx="100" cy="100" r="67" fill="url(#selloHueco)"/>
          <circle cx="100" cy="101.2" r="67" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="1.4"/>
          <circle cx="100" cy="98.8" r="67" fill="none" stroke="rgba(40,0,8,.55)" stroke-width="1.6"/>
          <circle cx="100" cy="100.8" r="44" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>
          <circle cx="100" cy="100" r="44" fill="none" stroke="rgba(40,0,8,.45)" stroke-width="1"/>
          <text class="sello__ring" fill="rgba(255,255,255,.22)" transform="translate(0 .7)"><textPath href="#selloArco" textLength="342">${RING}</textPath></text>
          <text class="sello__ring" fill="rgba(45,0,10,.72)"><textPath href="#selloArco" textLength="342">${RING}</textPath></text>
          <use href="#iso" x="81" y="66.5" width="38" height="68" style="color: rgba(255,255,255,.22)" transform="translate(0 .8)"/>
          <use href="#iso" x="81" y="66.5" width="38" height="68" style="color: rgba(45,0,10,.74)"/>
        </g>
      </g>
    </svg>`;

  const main = grid.querySelector('.contacto__main'), title = grid.querySelector('.contacto__title');
  main.append(seal);
  const place = () => { seal.style.top = (title.offsetTop + (title.offsetHeight - seal.offsetHeight) / 2) + 'px'; };
  place();
  addEventListener('resize', place);
  document.fonts?.ready.then(place);

  if (reduce || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const wax = seal.querySelector('.sello__wax'), wave = seal.querySelector('.sello__wave');
  const drops = [...seal.querySelectorAll('.sello__drops circle')];
  gsap.set(drops, { svgOrigin: '100 100' });

  // ligado al scroll: al bajar el sello cae y se pega; al subir, se despega y se va
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: grid, start: 'top 80%', scrub: .5,
      end: self => Math.min(self.start + innerHeight * .5, ScrollTrigger.maxScroll(window) - 2)
    }
  })
    // 1) baja desde cerca de la pantalla, girando, con su sombra lejos
    .fromTo(wax, { scale: 2.6, rotation: -60, y: -50, autoAlpha: 0, filter: 'drop-shadow(0 60px 40px rgba(40,0,10,.3))' },
      { scale: 1, rotation: -14, y: 0, autoAlpha: 1, filter: 'drop-shadow(0 4px 4px rgba(40,0,10,.5))', duration: .55, ease: 'power3.in' })
    // 2) golpe: se aplasta contra la página y la cera se escapa por los bordes
    .to(wax, { scaleX: 1.1, scaleY: .9, duration: .06, ease: 'power2.out' })
    .fromTo(drops, { scale: 0 }, { scale: 1, duration: .2, stagger: .01, ease: 'expo.out' }, '<')
    .fromTo(wave, { scale: .7, autoAlpha: .6 }, { scale: 2, autoAlpha: 0, duration: .3, ease: 'expo.out', immediateRender: false }, '<')
    .fromTo(main, { y: 0 }, { y: 3, duration: .03, yoyo: true, repeat: 1 }, '<')
    // 3) rebota y queda pegado
    .to(wax, { scaleX: 1, scaleY: 1, duration: .3, ease: 'back.out(3)' }, '<.06');
})();
