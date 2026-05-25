const navbar       = document.getElementById('navbar');
const stage        = document.getElementById('stage');
const titleWrap    = document.getElementById('titleWrap');
const blackOverlay = document.getElementById('blackOverlay');
const pinkOverlay  = document.getElementById('pinkOverlay');
const hamburger    = document.getElementById('hamburger');
const hamMenu      = document.getElementById('hamMenu');

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
}

function closeMenu() {
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  hamMenu.classList.remove('open');
  hamMenu.setAttribute('aria-hidden', 'true');
  hamOverlay.classList.remove('visible');
  document.body.style.overflow = '';
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

window.addEventListener('scroll', () => {
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
  const pinkOp = mapRange(progress, 0.5, 1, 0, 1);
  pinkOverlay.style.opacity = pinkOp;

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

    // Logo imagen: blanco → oscuro con el fade
    const logoImg = navbar.querySelector('.nav-logo-img');
    if (logoImg) {
      logoImg.style.filter  = `brightness(0) invert(${(1 - et).toFixed(3)})`;
      logoImg.style.opacity = (0.7 + et * 0.2).toFixed(3);
    }

    // Hamburger lines turn dark as navbar lightens
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

    // Logo imagen: vuelve a blanco
    const logoImgReset = navbar.querySelector('.nav-logo-img');
    if (logoImgReset) {
      logoImgReset.style.filter  = 'brightness(0) invert(1)';
      logoImgReset.style.opacity = '0.9';
    }

    hamburger.classList.remove('dark');
    hamburger.querySelectorAll('span').forEach(s => { s.style.background = 'rgba(255,255,255,.8)'; });
  }
}, { passive: true });