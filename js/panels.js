// Dock navigation: shows one top-level panel at a time. The active panel is
// kept in the URL hash (#about, #journey, #workbench, #mail) so reload, deep links and
// the Back button all work.

import { tickBoot } from './boot-sequence.js';
import { prefersReducedMotion } from './motion.js';

const PANELS = { about: 'panel-about', journey: 'panel-journey', workbench: 'panel-workbench', mail: 'panel-mail' };
const ORDER = Object.keys(PANELS); // the dock's left-to-right order
const DEFAULT_PANEL = 'about';
const root = document.documentElement;
let current = null;

const panelFromHash = () => {
  const name = location.hash.slice(1);
  return name in PANELS ? name : DEFAULT_PANEL;
};

// Swaps which panel is visible and updates the dock, focus and scroll. Pure DOM
// work with no animation of its own, so it can run inside a View Transition.
function swap(name, { focus, instant }) {
  Object.entries(PANELS).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) el.hidden = k !== name;
  });
  document.querySelectorAll('.dock a').forEach(a => {
    const active = a.dataset.panel === name;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' });
  // Move focus to the new panel so keyboard and screen-reader users land on
  // its content instead of staying on the dock at the bottom of the page.
  if (focus) document.getElementById(PANELS[name])?.focus({ preventScroll: true });
  if (name === 'about') tickBoot();
}

// Moving right along the dock slides the old panel out to the left and the new one
// in from the right; moving left does the reverse, so the motion matches the dock.
export function showPanel(name, { focus = true, animate = true } = {}) {
  const from = current;
  current = name;
  const moving = animate && from !== null && from !== name && !prefersReducedMotion();
  if (!moving) { swap(name, { focus, instant: false }); return; }

  const dir = ORDER.indexOf(name) > ORDER.indexOf(from) ? 'fwd' : 'back';
  root.dataset.navDir = dir;

  if (document.startViewTransition) {
    // Only name the panel while navigating, so a theme switch (which also uses View
    // Transitions) isn't split into a separate cross-fading group.
    root.classList.add('panel-nav');
    const vt = document.startViewTransition(() => swap(name, { focus, instant: true }));
    vt.finished.finally(() => root.classList.remove('panel-nav'));
    return;
  }

  // Fallback: animate the arriving panel on its own.
  swap(name, { focus, instant: false });
  const el = document.getElementById(PANELS[name]);
  if (el) {
    el.classList.remove('panel-enter-fwd', 'panel-enter-back');
    void el.offsetWidth;
    el.classList.add(`panel-enter-${dir}`);
    el.addEventListener('animationend', () => el.classList.remove(`panel-enter-${dir}`), { once: true });
  }
}

export function initPanels() {
  // Buttons inside panels (e.g. "Journey →") navigate the same way the dock does.
  document.querySelectorAll('button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => { location.hash = btn.dataset.panel; });
  });
  // React to panel hashes (and an empty hash, i.e. Back to the bare URL);
  // other fragments such as the #main skip link leave the current panel alone.
  window.addEventListener('hashchange', () => {
    const name = location.hash.slice(1);
    if (!name || name in PANELS) showPanel(panelFromHash());
  });
  showPanel(panelFromHash(), { focus: false, animate: false });
}
