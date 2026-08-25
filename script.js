// ---- Mobile navigation ----
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---- Header scroll + progress bar ----
const header = document.getElementById('header');
const progress = document.getElementById('progress');

function onScroll() {
  const scrollY = window.scrollY;
  header.classList.toggle('scrolled', scrollY > 40);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (docHeight > 0 ? (scrollY / docHeight) * 100 : 0) + '%';

  highlightNav(scrollY);
}
window.addEventListener('scroll', onScroll, { passive: true });

// ---- Active nav link ----
const sections = document.querySelectorAll('section[id]');
function highlightNav(scrollY) {
  const pos = scrollY + 140;
  sections.forEach(section => {
    const top = section.offsetTop;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav__links a[href="#${id}"]`);
    if (pos >= top && pos < top + section.offsetHeight) {
      document.querySelectorAll('.nav__links a').forEach(a => a.classList.remove('active'));
      link?.classList.add('active');
    }
  });
}

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll(
  '.hero__copy, .hero__panel, .section__header, .feature-card, .project-card, .skill-card, .lab-card, .contact__headline, .contact__intro, .contact__links'
);
revealEls.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => io.observe(el));

// ---- Skill matrix tabs ----
const skillSwitcher = document.querySelector('[data-skill-switcher]');
if (skillSwitcher) {
  const tabs = skillSwitcher.querySelectorAll('[data-skill]');
  const panels = skillSwitcher.querySelectorAll('[data-panel]');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const selected = tab.dataset.skill;
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', active);
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === selected;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
  }));
}

// ---- Animated counter ----
const counter = document.querySelector('.stat__number[data-count]');
if (counter) {
  const target = parseInt(counter.dataset.count, 10);
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      let current = 0;
      const step = Math.max(1, Math.round(target / 40));
      const tick = () => {
        current = Math.min(target, current + step);
        counter.textContent = current + (current >= target ? '+' : '');
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  countObserver.observe(counter);
}

// ---- Desktop-only: custom cursor + work hover preview ----
const isDesktop = window.matchMedia('(min-width: 881px) and (pointer: fine)').matches;

if (isDesktop) {
  const cursor = document.getElementById('cursor');
  let cx = 0, cy = 0, tx = 0, ty = 0;

  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  function renderCursor() {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  document.querySelectorAll('a, button, .project-card, .feature-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

// ---- Subtle orb ring motion ----
const orb = document.querySelector('.orb');
const rings = document.querySelector('.orb__rings');
if (orb && rings && isDesktop) {
  let rx = 0, ry = 0;
  window.addEventListener('mousemove', e => {
    const rect = orb.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rx = (e.clientX - cx) / rect.width * 8; // small tilt
    ry = (e.clientY - cy) / rect.height * 8;
    rings.style.transform = `rotate(${rx}deg) translateY(${ry}px)`;
  }, { passive: true });

  // gentle idle rotation
  let angle = 0;
  function rotateIdle() {
    angle += 0.012;
    rings.style.opacity = 0.96 + Math.sin(angle) * 0.02;
    rings.style.filter = `blur(${1 + Math.sin(angle) * 0.5}px)`;
    requestAnimationFrame(rotateIdle);
  }
  requestAnimationFrame(rotateIdle);
}

// ---- Lightweight interactive mesh ----
const mesh = document.getElementById('mesh');
const meshContext = mesh?.getContext('2d');
if (meshContext) {
  const points = Array.from({ length: 28 }, () => ({
    x: Math.random(), y: Math.random(), dx: (Math.random() - 0.5) * 0.00016, dy: (Math.random() - 0.5) * 0.00016
  }));
  const resizeMesh = () => {
    mesh.width = window.innerWidth * devicePixelRatio;
    mesh.height = window.innerHeight * devicePixelRatio;
    meshContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  const drawMesh = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    meshContext.clearRect(0, 0, width, height);
    points.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;
      points.slice(index + 1).forEach(other => {
        const ox = other.x * width;
        const oy = other.y * height;
        const distance = Math.hypot(x - ox, y - oy);
        if (distance < 175) {
          meshContext.strokeStyle = `rgba(103, 232, 249, ${0.1 * (1 - distance / 175)})`;
          meshContext.beginPath(); meshContext.moveTo(x, y); meshContext.lineTo(ox, oy); meshContext.stroke();
        }
      });
    });
  };
  resizeMesh();
  drawMesh();
  window.addEventListener('resize', () => { resizeMesh(); drawMesh(); }, { passive: true });
}
