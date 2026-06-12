const navbar       = document.getElementById('navbar');
const stage        = document.getElementById('stage');
const titleWrap    = document.getElementById('titleWrap');
const blackOverlay = document.getElementById('blackOverlay');
const pinkOverlay  = document.getElementById('pinkOverlay');
const hamburger    = document.getElementById('hamburger');
const hamMenu      = document.getElementById('hamMenu');
const sloganWrap   = document.getElementById('sloganWrap');

// ─── HAMBURGER OVERLAY (inject once) ───
const hamOverlay = document.createElement('div');
hamOverlay.className = 'ham-overlay';
document.body.appendChild(hamOverlay);

function openMenu() {
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  hamMenu.classList.add('open');
  hamMenu.setAttribute('aria-hidden', 'false');
  hamOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  // Mueve el foco al primer enlace del menú para accesibilidad de teclado
  const firstLink = hamMenu.querySelector('.ham-link');
  if (firstLink) firstLink.focus();
}

function closeMenu() {
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  hamMenu.classList.remove('open');
  hamMenu.setAttribute('aria-hidden', 'true');
  hamOverlay.classList.remove('visible');
  document.body.style.overflow = '';
  // Devuelve el foco al botón hamburguesa al cerrar
  hamburger.focus();
}

hamburger.addEventListener('click', () => {
  hamMenu.classList.contains('open') ? closeMenu() : openMenu();
});

hamOverlay.addEventListener('click', closeMenu);

hamMenu.querySelectorAll('.ham-link').forEach(link => {
  link.addEventListener('click', () => { closeMenu(); });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && hamMenu.classList.contains('open')) closeMenu();
});

// ─── SCROLL ANIMATION ───
function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function mapRange(v, in0, in1, out0, out1) {
  return out0 + (out1 - out0) * ease(clamp((v - in0) / (in1 - in0), 0, 1));
}
function lerpColor(t, r0, g0, b0, r1, g1, b1) {
  return `rgb(${Math.round(r0 + (r1 - r0) * t)},${Math.round(g0 + (g1 - g0) * t)},${Math.round(b0 + (b1 - b0) * t)})`;
}

// Cálculo de la animación del hero, optimizado con requestAnimationFrame
let scrollTicking = false;

function updateScrollAnimation() {
  scrollTicking = false;

  const scrollY  = window.scrollY;
  const stageH   = stage.offsetHeight;
  const vh       = window.innerHeight;
  const progress = clamp(scrollY / (stageH - vh), 0, 1);

  navbar.classList.toggle('scrolled', scrollY > 80);

  // FASE 1 (0 → 0.5): título se encoge y desaparece
  titleWrap.style.transform = `translate(-50%, -50%) scale(${mapRange(progress, 0, 0.5, 1, 0.4)})`;
  titleWrap.style.opacity   = mapRange(progress, 0, 0.5, 1, 0);

  // Overlay negro cubre la imagen
  blackOverlay.style.opacity = mapRange(progress, 0.35, 0.55, 0, 1);

  // FASE 2 (0.5 → 1): negro → rosa
  pinkOverlay.style.opacity  = mapRange(progress, 0.5, 1, 0, 1);
  sloganWrap.style.opacity   = mapRange(progress, 0.58, 0.9, 0, 1);
  sloganWrap.style.transform = `translate(-50%, -50%) scale(${mapRange(progress, 0.55, 1, 0.6, 1)})`;

  // Navbar + hamburger sincronizados con la transición rosa
  if (progress >= 0.35) {
    const t  = clamp((progress - 0.35) / 0.65, 0, 1);
    const et = ease(t);
    navbar.style.background           = `rgba(245,228,232,${(et * 0.88).toFixed(3)})`;
    navbar.style.backdropFilter       = `blur(${(et * 12).toFixed(1)}px)`;
    navbar.style.webkitBackdropFilter = navbar.style.backdropFilter;
    navbar.style.borderBottom         = `.5px solid rgba(201,149,159,${(et * 0.25).toFixed(3)})`;

    navbar.querySelectorAll('.nav-links a').forEach(a => {
      a.style.color = lerpColor(et, 255, 255, 255, 122, 102, 104);
    });
    navbar.querySelector('.nav-logo').style.color = lerpColor(et, 255, 255, 255, 26, 26, 26);

    const logoImg = navbar.querySelector('.nav-logo-img');
    if (logoImg) {
      logoImg.style.filter  = `brightness(0) invert(${(1 - et).toFixed(3)})`;
      logoImg.style.opacity = (0.7 + et * 0.2).toFixed(3);
    }

    hamburger.classList.toggle('dark', et > 0.5);
    hamburger.querySelectorAll('span').forEach(s => {
      const alpha = et > 0.5 ? 0.65 + et * 0.2 : 0.8;
      const col   = et > 0.5
        ? `rgba(26,26,26,${alpha.toFixed(2)})`
        : `rgba(255,255,255,${(0.8).toFixed(2)})`;
      s.style.background = col;
    });

  } else {
    navbar.style.background           = 'transparent';
    navbar.style.backdropFilter       = 'none';
    navbar.style.webkitBackdropFilter = 'none';
    navbar.style.borderBottom         = 'none';

    navbar.querySelectorAll('.nav-links a').forEach(a => { a.style.color = ''; });
    navbar.querySelector('.nav-logo').style.color = '#fff';

    const logoImgReset = navbar.querySelector('.nav-logo-img');
    if (logoImgReset) {
      logoImgReset.style.filter  = 'brightness(0) invert(1)';
      logoImgReset.style.opacity = '0.9';
    }

    hamburger.classList.remove('dark');
    hamburger.querySelectorAll('span').forEach(s => { s.style.background = 'rgba(255,255,255,.8)'; });
  }
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateScrollAnimation);
  }
}, { passive: true });

// Estado inicial al cargar
updateScrollAnimation();

/* ═══════════════════════════════════════
   CARRUSEL COVERFLOW · INSTALACIONES
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const track    = document.getElementById('coverflowTrack');
  const dotsWrap = document.getElementById('coverflowDots');
  const prevBtn  = document.getElementById('coverflowPrev');
  const nextBtn  = document.getElementById('coverflowNext');
  const cover    = document.getElementById('coverflow');

  if (!track) return;

  // Lista de imágenes de instalaciones (ajusta según tus archivos)
  const imagenes = [
    'img/instalaciones/instalaciones1.jpg',
    'img/instalaciones/instalaciones2.jpg',
    'img/instalaciones/instalaciones3.jpg',
    'img/instalaciones/instalaciones4.jpg',
    'img/instalaciones/instalaciones5.jpg',
  ];

  let current = 0;
  const slides = [];

  // Crear diapositivas
  imagenes.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'coverflow-slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Instalaciones Estética Langie ' + (i + 1);
    img.loading = 'lazy';
    slide.appendChild(img);
    slide.addEventListener('click', () => { goTo(i); resetAutoplay(); });
    track.appendChild(slide);
    slides.push(slide);
  });

  // Crear puntos
  imagenes.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'coverflow-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    const total = slides.length;
    slides.forEach((slide, i) => {
      // Distancia relativa más corta (circular)
      let offset = i - current;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const abs = Math.abs(offset);
      const translateX = offset * 55;        // separación horizontal (%)
      const rotateY = offset * -35;          // giro 3D
      const scale = abs === 0 ? 1 : 0.82 - (abs - 1) * 0.06;
      const z = -abs * 120;
      const opacity = abs > 2 ? 0 : 1;

      slide.style.transform =
        `translateX(${translateX}%) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`;
      slide.style.opacity = String(opacity);
      slide.style.zIndex = String(100 - abs);
      slide.classList.toggle('is-active', offset === 0);
      slide.classList.toggle('is-side', offset !== 0);
      slide.style.pointerEvents = abs > 2 ? 'none' : 'auto';
    });

    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function goTo(i) {
    const total = slides.length;
    current = (i % total + total) % total;
    render();
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // ─── Reproducción automática (solo cuando el carrusel está visible) ───
  const AUTOPLAY_MS = 4000;
  let autoplayTimer = null;
  let isInView = false;      // el carrusel está en el viewport
  let isHovered = false;     // el ratón está encima

  function canAutoplay() { return isInView && !isHovered && !document.hidden; }

  function startAutoplay() {
    stopAutoplay();
    if (canAutoplay()) autoplayTimer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  }
  function resetAutoplay() { startAutoplay(); }

  nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });

  // Navegación con teclado SOLO cuando el carrusel está visible en pantalla
  document.addEventListener('keydown', e => {
    if (!isInView) return;
    if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
    if (e.key === 'ArrowLeft')  { prev(); resetAutoplay(); }
  });

  // Soporte de arrastre / swipe táctil y con ratón
  let startX = null;
  function onStart(x) { startX = x; }
  function onEnd(x) {
    if (startX === null) return;
    const diff = x - startX;
    if (Math.abs(diff) > 50) { diff < 0 ? next() : prev(); resetAutoplay(); }
    startX = null;
  }
  cover.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
  cover.addEventListener('touchend',   e => onEnd(e.changedTouches[0].clientX));
  cover.addEventListener('mousedown',  e => onStart(e.clientX));
  cover.addEventListener('mouseup',    e => onEnd(e.clientX));

  // Pausa el autoplay con el ratón encima
  cover.addEventListener('mouseenter', () => { isHovered = true; stopAutoplay(); });
  cover.addEventListener('mouseleave', () => { isHovered = false; startAutoplay(); });

  // Pausa cuando la pestaña no está visible
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  // Inicia/pausa el autoplay según el carrusel entre o salga del viewport
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isInView = entry.isIntersecting;
        isInView ? startAutoplay() : stopAutoplay();
      });
    }, { threshold: 0.25 });
    io.observe(cover);
  } else {
    // Fallback: si no hay IntersectionObserver, se considera siempre visible
    isInView = true;
    startAutoplay();
  }

  render();
});