/* ============================================
   CUADERNO DE FLORES - Lógica + Pétalos Canvas
   ============================================ */

/* ── CANVAS SETUP ──────────────────────────── */
const canvas = document.getElementById('petalCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ── VIENTO ────────────────────────────────── */
let windX   = 0.28;
let windGust = 0;

setInterval(() => {
  const dir = Math.random() > .5 ? 1 : -1;
  windGust  = dir * (Math.random() * .9);
  setTimeout(() => { windGust = 0; }, 1800 + Math.random() * 2000);
}, 4500);

/* ── CLASE PÉTALO ──────────────────────────── */
class Petal {
  constructor(burst = false) { this.reset(burst); }

  reset(burst = false) {
    this.x   = Math.random() * window.innerWidth;
    this.y   = burst
                 ? window.innerHeight * .3 + Math.random() * window.innerHeight * .4
                 : window.innerHeight * .6 + Math.random() * window.innerHeight * .38;

    this.vx  = (Math.random() - .3) * (burst ? 5 : 1.8) + windX;
    this.vy  = -(Math.random() * (burst ? 5 : 2.2) + (burst ? 2 : .6));

    this.gravity    = .03 + Math.random() * .04;
    this.drag       = .984 + Math.random() * .012;
    this.angle      = Math.random() * Math.PI * 2;
    this.spin       = (Math.random() - .5) * .1;
    this.w          = 5 + Math.random() * 11;
    this.h          = this.w * (1.4 + Math.random() * .7);

    const hue       = 36 + Math.random() * 22;
    this.color      = `hsla(${hue},${(88 + Math.random() * 12).toFixed(0)}%,${(54 + Math.random() * 22).toFixed(0)}%,`;
    this.alpha      = .08 + Math.random() * .15;
    this.maxAlpha   = .55 + Math.random() * .38;
    this.fadeIn     = true;
    this.fadeOut    = false;
    this.life       = 0;
    this.maxLife    = 180 + Math.random() * 320;
    this.wobble     = 0;
    this.wobbleSpd  = .04 + Math.random() * .04;
    this.wobbleAmp  = .3  + Math.random() * .6;
    return this;
  }

  update() {
    this.life++;
    this.wobble += this.wobbleSpd;

    this.vx += (windX + windGust) * .04 + Math.sin(this.wobble) * this.wobbleAmp * .04;
    this.vy += this.gravity;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.x  += this.vx;
    this.y  += this.vy;
    this.angle += this.spin;

    if (this.fadeIn) {
      this.alpha += .035;
      if (this.alpha >= this.maxAlpha) { this.alpha = this.maxAlpha; this.fadeIn = false; }
    }
    if (this.life > this.maxLife * .72) this.fadeOut = true;
    if (this.fadeOut) this.alpha -= .007;

    return !(this.alpha <= 0 ||
             this.y > window.innerHeight + 30 ||
             this.x < -60 || this.x > window.innerWidth + 60);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const g = ctx.createRadialGradient(0, -this.h * .1, 1, 0, 0, this.h * .55);
    g.addColorStop(0,   this.color + this.alpha + ')');
    g.addColorStop(.5,  this.color + (this.alpha * .88) + ')');
    g.addColorStop(1,   this.color + (this.alpha * .25) + ')');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w * .5, this.h * .5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(190,130,0,${this.alpha * .45})`;
    ctx.lineWidth   = .5;
    ctx.beginPath();
    ctx.moveTo(0, -this.h * .38);
    ctx.lineTo(0,  this.h * .38);
    ctx.stroke();

    ctx.restore();
  }
}

/* ── POOL DE PÉTALOS ────────────────────────── */
const petals    = [];
const MAX_PETALS = 65;

for (let i = 0; i < 20; i++) {
  setTimeout(() => { if (petals.length < MAX_PETALS) petals.push(new Petal()); }, i * 250);
}

setInterval(() => {
  if (petals.length < MAX_PETALS) petals.push(new Petal());
}, 400);

/* ── LOOP ANIMACIÓN ─────────────────────────── */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = petals.length - 1; i >= 0; i--) {
    if (!petals[i].update()) petals.splice(i, 1);
    else petals[i].draw(ctx);
  }
  requestAnimationFrame(animate);
}
animate();

/* ── ESTRELLAS ─────────────────────────────── */
(function createStars() {
  const c = document.getElementById('stars');
  const colors = ['#fff', '#fff', '#fff', '#ffd6e7', '#ffe87a', '#e8d0ff', '#ffc2e2', '#fffacd', '#d0e8ff'];
  for (let i = 0; i < 90; i++) {
    const s  = document.createElement('div');
    s.className = 'star';
    const sz = .7 + Math.random() * 2.8;
    const col = colors[Math.floor(Math.random() * colors.length)];
    s.style.cssText = `
      width:${sz}px; height:${sz}px;
      top:${Math.random() * 100}%; left:${Math.random() * 100}%;
      --d:${2+Math.random()*4}s; --dl:${Math.random()*5}s; --sc:${col};
    `;
    c.appendChild(s);
  }
})();

/* ════════════════════════════════════════════
   LÓGICA DEL CUADERNO
════════════════════════════════════════════ */
const TOTAL_PAGES = 6;   // 0..5
const PAGE_LABELS = [
  'Portada', 'Capítulo I', 'Capítulo II',
  'Capítulo III', 'Poema', 'Fin ✨'
];

let currentPage = 0;
let isFlipping   = false;
const pages      = Array.from(document.querySelectorAll('.page'));

/* Inicializar z-index: la portada (0) arriba */
function setZIndexes() {
  pages.forEach((p, i) => {
    const idx = parseInt(p.dataset.index);
    if (idx < currentPage) {
      // ya volteadas → van detrás de todas con z bajo
      p.style.zIndex = idx + 1;
    } else {
      // pendientes → apiladas, la más baja al fondo
      p.style.zIndex = TOTAL_PAGES - idx + 5;
    }
  });
}

setZIndexes();

/* Renderizar indicadores de progreso */
function buildDots() {
  const container = document.getElementById('progressDots');
  container.innerHTML = '';
  for (let i = 0; i < TOTAL_PAGES; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === currentPage ? ' active' : '');
    d.addEventListener('click', () => goToPage(i));
    container.appendChild(d);
  }
}
buildDots();

function updateUI() {
  document.getElementById('currentPageLabel').textContent = PAGE_LABELS[currentPage] || '';
  document.getElementById('btnPrev').disabled = currentPage === 0;
  document.getElementById('btnNext').disabled = currentPage === TOTAL_PAGES - 1;
  // Actualizar dots
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentPage);
  });
  // Animar entrada del contenido de la página actual
  pages.forEach(p => p.classList.remove('just-entered'));
  const activePage = pages[currentPage];
  if (activePage) {
    void activePage.offsetWidth; // fuerza reflow para reiniciar animaciones
    activePage.classList.add('just-entered');
  }
}
updateUI();

/* ── Voltear hacia adelante ────────────────── */
function flipForward() {
  if (isFlipping || currentPage >= TOTAL_PAGES - 1) return;
  isFlipping = true;

  const page = pages[currentPage];
  // Elevar durante la animación
  page.style.zIndex = 100;

  page.classList.add('flipped');

  // Ráfaga de pétalos al pasar página
  burstPetals(18);

  setTimeout(() => {
    page.style.zIndex = currentPage + 1;  // queda detrás
    currentPage++;
    setZIndexes();
    updateUI();
    isFlipping = false;
  }, 1150);
}

/* ── Voltear hacia atrás ────────────────────── */
function flipBackward() {
  if (isFlipping || currentPage <= 0) return;
  isFlipping = true;

  currentPage--;
  const page = pages[currentPage];
  page.style.zIndex = 100;

  page.classList.remove('flipped');
  setZIndexes();

  // Suave brisa de vuelta
  burstPetals(8);

  setTimeout(() => {
    setZIndexes();
    updateUI();
    isFlipping = false;
  }, 1150);
}

/* ── Ir a una página concreta ──────────────── */
function goToPage(target) {
  if (isFlipping || target === currentPage) return;
  if (target > currentPage) {
    // flip forward hasta llegar
    (function tick() {
      if (currentPage < target) {
        flipForward();
        setTimeout(tick, 1200);
      }
    })();
  } else {
    (function tick() {
      if (currentPage > target) {
        flipBackward();
        setTimeout(tick, 1200);
      }
    })();
  }
}

/* ── Botones de navegación ──────────────────── */
document.getElementById('btnNext').addEventListener('click', flipForward);
document.getElementById('btnPrev').addEventListener('click', flipBackward);
document.getElementById('btnRestart').addEventListener('click', () => goToPage(0));

/* ── Teclado ─────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') flipForward();
  if (e.key === 'ArrowLeft')                    flipBackward();
});

/* ── Ráfaga de pétalos ──────────────────── */
function burstPetals(count = 20) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => { petals.push(new Petal(true)); }, i * 40);
  }
  windGust = (Math.random() > .5 ? 1 : -1) * 1.8;
  setTimeout(() => { windGust = 0; }, 2200);
}

/* ── Sparkle al hacer clic en el canvas ── */
canvas.addEventListener('click', e => {
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const speed = 2 + Math.random() * 3.5;
    const p = new Petal();
    p.x = e.clientX; p.y = e.clientY;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 2;
    p.w  = 4 + Math.random() * 5;
    p.h  = p.w; p.maxAlpha = .9; p.alpha = .9;
    p.fadeIn = false; p.maxLife = 70; p.life = 0;
    petals.push(p);
  }
});

/* ============================================
   INTERACTIVE 21 DE MARZO — EVENT HANDLERS
   ============================================ */

// ── Portada: sunflower tap → petal burst + scale pop ──────────────────────
const coverSunflower = document.querySelector('.cover-sunflower');
if (coverSunflower) {
  coverSunflower.style.cursor = 'pointer';
  coverSunflower.addEventListener('click', () => {
    burstPetals(22);
    coverSunflower.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1)';
    coverSunflower.style.transform  = 'scale(1.32)';
    setTimeout(() => { coverSunflower.style.transform = 'scale(1)'; }, 380);
  });
}

// ── Capítulo I: blooming flower ───────────────────────────────────────────
const bloomFlower = document.getElementById('bloomFlower');
if (bloomFlower) {
  bloomFlower.addEventListener('click', () => {
    if (bloomFlower.classList.contains('bloomed')) {
      bloomFlower.classList.remove('bloomed');
    } else {
      bloomFlower.classList.add('bloomed');
      burstPetals(10);
    }
  });
}

// ── Capítulo II: interactive sun burst ───────────────────────────────────
const interactiveSun = document.getElementById('interactiveSun');
if (interactiveSun) {
  interactiveSun.addEventListener('click', () => {
    if (interactiveSun.classList.contains('burst')) return;
    interactiveSun.classList.add('burst');
    burstPetals(18);
    setTimeout(() => interactiveSun.classList.remove('burst'), 750);
  });
}

// ── Capítulo III: wind zone → blow petals ────────────────────────────────
const windZone = document.getElementById('windZone');
if (windZone) {
  windZone.addEventListener('click', () => {
    windZone.classList.add('blown');
    burstPetals(28);
    windX = 1.5;
    setTimeout(() => { windZone.classList.remove('blown'); }, 950);
  });
}

// ── Poema: tap zone → floating golden hearts ─────────────────────────────
const poemTapZone = document.getElementById('poemTapZone');
if (poemTapZone) {
  const HEARTS = ['💛', '🌻', '💛', '✨', '💛'];
  poemTapZone.addEventListener('click', (e) => {
    for (let i = 0; i < 7; i++) {
      const h  = document.createElement('span');
      h.className  = 'float-heart';
      h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      const ox = (Math.random() - .5) * 70;
      h.style.left             = (e.clientX + ox) + 'px';
      h.style.top              = e.clientY + 'px';
      h.style.animationDelay   = (i * .09) + 's';
      h.style.fontSize         = (.8 + Math.random() * .6) + 'rem';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1700 + i * 100);
    }
  });
}

// ── Contraportada: countdown to March 21 ─────────────────────────────────
function updateCountdown() {
  const cdEl = document.getElementById('cdText');
  if (!cdEl) return;
  const now   = new Date();
  let target  = new Date(now.getFullYear(), 2, 21); // month 2 = March (0-indexed)
  if (now >= new Date(now.getFullYear(), 2, 22))    // already past this year's date
    target = new Date(now.getFullYear() + 1, 2, 21);

  const diff  = target - now;
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);

  if (days === 0 && hours === 0) {
    cdEl.textContent = '¡Hoy es el Día de las Flores Amarillas! 🌻';
  } else if (days === 0) {
    cdEl.textContent = `¡Faltan ${hours}h ${mins}m para el 21 de Marzo! 🌻`;
  } else if (days === 1) {
    cdEl.textContent = `¡Mañana es el 21 de Marzo! 🌻 Día de las Flores Amarillas`;
  } else {
    cdEl.textContent = `Faltan ${days} días para el 21 de Marzo 🌻`;
  }
}
updateCountdown();
setInterval(updateCountdown, 60000);

/* ═══════════════════════════════════════════════
   JARDÍN DE GIRASOLES – Canvas (Portada)
═══════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('sfTreeCanvas');
  if (!canvas) return;

  const W = 300, H = 200;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);


  /* ── Garden sunflower specs ───────────────── */
  const SFDATA = [
    { x: 22,  stemH: 62,  r: 10, ph: 0.0,  spd: 0.90, del: 0   },
    { x: 62,  stemH: 88,  r: 14, ph: 1.3,  spd: 1.00, del: 200 },
    { x: 104, stemH: 118, r: 17, ph: 0.7,  spd: 0.85, del: 400 },
    { x: 152, stemH: 130, r: 19, ph: 2.0,  spd: 0.95, del: 140 },
    { x: 198, stemH: 112, r: 16, ph: 0.4,  spd: 1.05, del: 320 },
    { x: 244, stemH: 84,  r: 13, ph: 1.7,  spd: 0.88, del: 480 },
    { x: 282, stemH: 64,  r: 10, ph: 1.1,  spd: 1.10, del: 580 },
  ];
  const GROW_DUR = 900; // ms for each stem to fully grow

  /* ── Flying petals ───────────────────────── */
  const fPetals = [];
  let lastPetal = 0;

  /* ── Easing ──────────────────────────────── */
  const easeOut3 = t => 1 - Math.pow(1 - t, 3);

  /* ── Draw sky + ground bg ────────────────── */
  const GROUND_Y = H - 32;

  function drawBg() {
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0,   '#ffe4f4');
    sky.addColorStop(0.55,'#ffd6a0');
    sky.addColorStop(1,   '#ffc870');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND_Y);

    // soft radial sun glow top-right
    const sun = ctx.createRadialGradient(W*0.80, 14, 0, W*0.80, 14, 80);
    sun.addColorStop(0,   'rgba(255,245,150,.50)');
    sun.addColorStop(0.4, 'rgba(255,220,100,.20)');
    sun.addColorStop(1,   'rgba(255,200,80,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, GROUND_Y);

    // ground hill
    const gnd = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    gnd.addColorStop(0,   '#5faa28');
    gnd.addColorStop(0.4, '#3e8a14');
    gnd.addColorStop(1,   '#2a6008');
    ctx.fillStyle = gnd;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 6);
    ctx.bezierCurveTo(W*0.25, GROUND_Y - 4, W*0.65, GROUND_Y + 2, W, GROUND_Y - 2);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // ground highlight stripe
    ctx.fillStyle = 'rgba(150,240,80,.18)';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 4);
    ctx.bezierCurveTo(W*0.25, GROUND_Y - 6, W*0.65, GROUND_Y, W, GROUND_Y - 4);
    ctx.lineTo(W, GROUND_Y + 3);
    ctx.bezierCurveTo(W*0.65, GROUND_Y + 7, W*0.25, GROUND_Y + 1, 0, GROUND_Y + 11);
    ctx.closePath();
    ctx.fill();

    // tiny grass blades
    ctx.strokeStyle = '#4aaa18';
    ctx.lineWidth = 1;
    for (let gx = 6; gx < W; gx += 9) {
      const gy = GROUND_Y + 2 + Math.sin(gx * 0.3) * 3;
      ctx.beginPath();
      ctx.moveTo(gx, gy + 5);
      ctx.quadraticCurveTo(gx + 2, gy - 5, gx + 4, gy - 11);
      ctx.stroke();
    }
  }

  /* ── Draw one sunflower ──────────────────── */
  function drawSunflower(sf, t, growP) {
    if (growP <= 0) return;
    const baseY  = GROUND_Y + 3;
    const tipY   = baseY - sf.stemH * growP;
    const sway   = Math.sin(t * sf.spd + sf.ph) * 3.5 * growP;
    const tipX   = sf.x + sway;

    ctx.save();

    // stem shadow
    ctx.globalAlpha = 0.12 * growP;
    ctx.beginPath();
    ctx.moveTo(sf.x + 2, baseY);
    ctx.quadraticCurveTo(tipX + 5, (baseY + tipY) * 0.5, tipX + 3, tipY);
    ctx.strokeStyle = '#1a4a00';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // stem
    const stemG = ctx.createLinearGradient(sf.x - 3, 0, sf.x + 3, 0);
    stemG.addColorStop(0,   '#2a6e08');
    stemG.addColorStop(0.5, '#4dac18');
    stemG.addColorStop(1,   '#2a6e08');
    ctx.beginPath();
    ctx.moveTo(sf.x, baseY);
    ctx.quadraticCurveTo(tipX - sway * 0.4, (baseY + tipY) * 0.5 + 6, tipX, tipY);
    ctx.strokeStyle = stemG;
    ctx.lineWidth = growP >= 1 ? (sf.r > 15 ? 4 : 3) : 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // leaves (only after 40% growth)
    if (growP > 0.40) {
      const leafP = Math.min((growP - 0.40) / 0.45, 1);
      const lMidY  = baseY - sf.stemH * 0.48 * growP;
      const lMidX  = sf.x + sway * 0.48;

      // left leaf
      ctx.save();
      ctx.globalAlpha = leafP;
      ctx.translate(lMidX, lMidY);
      ctx.rotate(-0.42 + sway * 0.025);
      ctx.beginPath();
      ctx.ellipse(-sf.r * 0.95, 0, sf.r * 1.0 * leafP, sf.r * 0.38 * leafP, 0.18, 0, Math.PI * 2);
      const lg = ctx.createLinearGradient(-sf.r * 1.6, 0, 0, 0);
      lg.addColorStop(0,   '#2a7a08');
      lg.addColorStop(0.5, '#5aba22');
      lg.addColorStop(1,   '#3a9010');
      ctx.fillStyle = lg;
      ctx.fill();
      ctx.restore();

      // right leaf
      ctx.save();
      ctx.globalAlpha = leafP;
      ctx.translate(lMidX + sf.stemH * 0.10, lMidY - sf.stemH * 0.14 * growP);
      ctx.rotate(0.38 + sway * 0.025);
      ctx.beginPath();
      ctx.ellipse(sf.r * 0.90, 0, sf.r * 0.92 * leafP, sf.r * 0.34 * leafP, -0.16, 0, Math.PI * 2);
      const rg = ctx.createLinearGradient(0, 0, sf.r * 1.6, 0);
      rg.addColorStop(0,   '#3a9010');
      rg.addColorStop(0.5, '#5aba22');
      rg.addColorStop(1,   '#2a7a08');
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.restore();
    }

    // flower head (only after 75% growth)
    if (growP > 0.75) {
      const headP = Math.min((growP - 0.75) / 0.25, 1);
      const hSc   = easeOut3(headP) * (0.75 + 0.25 * headP);
      const headR = sf.r * hSc;
      const rot   = sway * 0.04;

      ctx.save();
      ctx.translate(tipX, tipY);
      ctx.rotate(rot);

      // petal shadow/backing
      ctx.beginPath();
      ctx.arc(0, 0, headR * 1.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,120,0,0.13)';
      ctx.fill();

      // 16 petals
      const NP = 16;
      for (let i = 0; i < NP; i++) {
        ctx.save();
        ctx.rotate(Math.PI * 2 / NP * i);
        ctx.beginPath();
        const pd = headR * 1.02, pw = headR * 0.22, ph = headR * 0.58;
        ctx.ellipse(0, -pd, pw, ph, 0, 0, Math.PI * 2);
        const pg = ctx.createLinearGradient(0, -(pd + ph), 0, -(pd - ph));
        pg.addColorStop(0,   '#fffde8');
        pg.addColorStop(0.2, '#ffe840');
        pg.addColorStop(0.65,'#f0b800');
        pg.addColorStop(1,   '#c07000');
        ctx.fillStyle = pg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(160,90,0,0.14)';
        ctx.lineWidth = 0.4;
        ctx.stroke();
        ctx.restore();
      }

      // center disk
      const cr  = headR * 0.55;
      const cdg = ctx.createRadialGradient(-cr * 0.25, -cr * 0.25, 0, 0, 0, cr);
      cdg.addColorStop(0,   '#8a460a');
      cdg.addColorStop(0.45,'#4e2000');
      cdg.addColorStop(1,   '#1e0a00');
      ctx.beginPath();
      ctx.arc(0, 0, cr, 0, Math.PI * 2);
      ctx.fillStyle = cdg;
      ctx.fill();

      // center texture rings
      for (let ri = 1; ri <= 2; ri++) {
        ctx.beginPath();
        ctx.arc(0, 0, cr * (0.40 + ri * 0.28), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(80,30,0,0.35)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // center highlight
      ctx.beginPath();
      ctx.arc(-cr * 0.30, -cr * 0.30, cr * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,130,50,0.22)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  /* ── Flying petals ───────────────────────── */
  function spawnPetal(elapsed) {
    if (elapsed - lastPetal < 1400) return;
    lastPetal = elapsed + Math.random() * 400;
    fPetals.push({
      x:  Math.random() * W * 0.6,
      y:  GROUND_Y - 40 - Math.random() * 60,
      vx: 0.6 + Math.random() * 1.4,
      vy: -(0.1 + Math.random() * 0.5),
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.08,
      alpha: 0.9,
      life: 0,
      maxLife: 110 + Math.floor(Math.random() * 100),
      w:  3 + Math.random() * 3,
      h:  1.2 + Math.random() * 1.2
    });
  }

  function drawFlyingPetals() {
    fPetals.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.018;
      p.rot += p.rotV;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = p.alpha * 0.85;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.restore();
    });
    for (let i = fPetals.length - 1; i >= 0; i--) {
      if (fPetals[i].alpha <= 0 || fPetals[i].x > W + 20) fPetals.splice(i, 1);
    }
  }

  /* ── Main loop ───────────────────────────── */
  let startTS = null;

  function animate(ts) {
    if (!startTS) startTS = ts;
    const elapsed = ts - startTS;
    const t       = ts / 1000;
    ctx.clearRect(0, 0, W, H);

    drawBg();

    // draw back sunflowers first (shorter ones), then front (taller)
    const sorted = SFDATA.slice().sort((a, b) => a.stemH - b.stemH);
    sorted.forEach(sf => {
      const growRaw = (elapsed - sf.del) / GROW_DUR;
      const growP   = easeOut3(Math.max(0, Math.min(growRaw, 1)));
      drawSunflower(sf, t, growP);
    });

    spawnPetal(elapsed);
    drawFlyingPetals();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
