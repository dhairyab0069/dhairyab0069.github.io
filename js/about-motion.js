// Foreground life for the About panel:
//  - sections and cards ease in on scroll and get a pointer glare (reveal + spotlight)
//  - small cards lean toward the pointer in 3D
//  - the traffic-light dots on each window work: yellow minimizes the panel to its
//    title bar (and back), green brings it into view, red politely refuses
//  - the "Mode" in the status strip cycles through what I do
//  - a live session uptime counter in the telemetry panel
//
// Design choices:
// - Tilt is driven from a rAF loop with exponential smoothing (no overshoot) and sets
//   CSS variables only; the loop sleeps when every card has settled.
// - Minimize animates height with the Web Animations API starting from the panel's
//   current on-screen height, so toggling mid-animation reverses smoothly.
// - Reduced motion: no tilt, no cycling, no height animation (panels just switch).

import { reveal, spotlight, prefersReducedMotion, scrollToEl } from './motion.js';

const TILT_SELECTOR = '.philo-card, .slot, .module, .pub-card';
const EASE = 'cubic-bezier(.22,1,.36,1)';
const ROLES = ['ml-researcher', 'benchmark-builder', 'rust-tinkerer', 'teaching-assistant'];

function initTilt(panel) {
  if (prefersReducedMotion()) return;
  const state = new Map(); // el -> { x, y, tx, ty }
  let raf = 0, last = 0;
  const tick = (now) => {
    raf = 0;
    const k = 1 - Math.exp(-Math.min(64, now - (last || now)) / 110);
    last = now;
    let moving = false;
    for (const [el, s] of state) {
      s.x += (s.tx - s.x) * k; s.y += (s.ty - s.y) * k;
      if (Math.abs(s.tx - s.x) < 0.001 && Math.abs(s.ty - s.y) < 0.001 && s.tx === 0 && s.ty === 0) {
        el.style.removeProperty('--tx'); el.style.removeProperty('--ty'); el.classList.remove('tilting'); state.delete(el);
        continue;
      }
      el.style.setProperty('--tx', s.x.toFixed(4)); el.style.setProperty('--ty', s.y.toFixed(4));
      moving = true;
    }
    if (moving) raf = requestAnimationFrame(tick); else last = 0;
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const get = (el) => state.get(el) || (state.set(el, { x: 0, y: 0, tx: 0, ty: 0 }), el.classList.add('tilting'), state.get(el));

  panel.addEventListener('pointermove', (e) => {
    const el = e.target.closest(TILT_SELECTOR);
    if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const s = get(el);
    s.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    s.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    wake();
  });
  panel.addEventListener('pointerout', (e) => {
    const el = e.target.closest(TILT_SELECTOR);
    if (!el || el.contains(e.relatedTarget)) return;
    const s = state.get(el);
    if (s) { s.tx = 0; s.ty = 0; wake(); }
  });
}

function initWindows(panel) {
  const reduced = prefersReducedMotion();
  panel.querySelectorAll('.deck, .info-tower, .about-extra').forEach((win) => {
    const chrome = win.querySelector(':scope > .chrome');
    const dots = chrome?.querySelector('.dots');
    if (!dots || dots.children.length < 3) return;
    const [red, yellow, green] = dots.children;
    dots.removeAttribute('aria-hidden');
    red.setAttribute('aria-hidden', 'true');
    green.setAttribute('aria-hidden', 'true');
    Object.assign(yellow, { tabIndex: 0 });
    yellow.setAttribute('role', 'button');
    yellow.setAttribute('aria-label', 'Minimize panel');
    yellow.setAttribute('aria-expanded', 'true');
    dots.classList.add('live-dots');

    let anim = null;
    const toggle = () => {
      const minimize = !win.classList.contains('minimized');
      const from = win.getBoundingClientRect().height; // the current on-screen value, even mid-animation
      anim?.cancel();
      win.classList.toggle('minimized', minimize);
      yellow.setAttribute('aria-expanded', String(!minimize));
      yellow.setAttribute('aria-label', minimize ? 'Restore panel' : 'Minimize panel');
      if (reduced) return;
      win.style.setProperty('--chrome-h', `${chrome.offsetHeight + 2}px`);
      const to = win.getBoundingClientRect().height;
      win.style.overflow = 'hidden';
      anim = win.animate({ height: [`${from}px`, `${to}px`] }, { duration: 480, easing: EASE });
      anim.onfinish = anim.oncancel = () => { win.style.overflow = ''; anim = null; };
    };
    yellow.addEventListener('click', toggle);
    yellow.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    red.addEventListener('click', () => {
      if (!reduced) win.animate({ transform: ['translateX(0)', 'translateX(-7px)', 'translateX(6px)', 'translateX(-3px)', 'translateX(0)'] }, { duration: 320 });
    });
    green.addEventListener('click', () => {
      if (win.classList.contains('minimized')) toggle();
      scrollToEl(win, 'center');
      win.classList.remove('flash-ring'); void win.offsetWidth; win.classList.add('flash-ring');
    });
  });
}

function initRoleCycle() {
  const strip = document.querySelector('#panel-about .status-strip span');
  if (!strip || !/^Mode/.test(strip.textContent)) return;
  strip.innerHTML = 'Mode // <span class="role-swap">ml-researcher</span>';
  if (prefersReducedMotion()) return;
  const swap = strip.querySelector('.role-swap');
  let i = 0;
  setInterval(() => {
    if (document.hidden || document.getElementById('panel-about').hidden) return;
    i = (i + 1) % ROLES.length;
    swap.animate({ opacity: [1, 0], transform: ['translateY(0)', 'translateY(-6px)'] }, { duration: 220, easing: 'ease-in' }).onfinish = () => {
      swap.textContent = ROLES[i];
      swap.animate({ opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0)'] }, { duration: 320, easing: EASE });
    };
  }, 2800);
}

function initUptime() {
  const el = document.getElementById('uptime');
  if (!el) return;
  const t0 = Date.now();
  const pad = (n) => String(n).padStart(2, '0');
  const render = () => { const s = Math.floor((Date.now() - t0) / 1000); el.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
  setInterval(() => { if (!document.hidden) render(); }, 1000);
}

export function initAboutMotion() {
  const panel = document.getElementById('panel-about');
  if (!panel) return;
  const targets = panel.querySelectorAll('.info-tower, .deck, .deck-card, .about-extra, .explore-btn');
  targets.forEach((el, i) => { el.classList.add('reveal', 'about-live'); el.style.setProperty('--i', String(i % 4)); });
  reveal(targets);
  spotlight(panel, '.about-live');
  panel.addEventListener('transitionend', (e) => {
    if (e.target.classList?.contains('about-live') && e.propertyName === 'opacity') e.target.style.transitionDelay = '0ms';
  });
  panel.querySelectorAll(TILT_SELECTOR).forEach((el) => el.classList.add('tilt'));
  initTilt(panel);
  initWindows(panel);
  initRoleCycle();
  initUptime();
}
