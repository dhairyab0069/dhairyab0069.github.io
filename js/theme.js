// Light/dark theme toggle and the "cheat code" palette flip button.
// The initial theme is applied by an inline script in <head> (to avoid a flash
// of the wrong theme); this module picks it up from there and persists changes.

import { prefersReducedMotion } from './motion.js';

const root = document.documentElement;
export const body = document.body;
export const themeSwitch = document.querySelector('.theme-switch');
export const cheatBtn = document.querySelector('[data-secret-toggle]');

const THEME_MS = 1400;
const EASE_CINEMA = 'cubic-bezier(.6,.04,.2,1)';
const mq = window.matchMedia('(prefers-color-scheme: dark)');

// `mode` is what the user picked: light, dark, or auto (follow the system).
// `theme` is what is actually showing, and is what the rest of the site reads.
const resolve = (m) => (m === 'auto' ? (mq.matches ? 'dark' : 'light') : m);
let mode = root.getAttribute('data-theme-mode') || 'auto';
let theme = root.getAttribute('data-theme') || resolve(mode);

const syncTheme = () => {
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-theme-mode', mode);
  body.setAttribute('data-theme', theme);
  themeSwitch?.querySelectorAll('[data-theme-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeMode === mode)));
  window.dispatchEvent(new CustomEvent('site:state'));
};

// Flip the palette. Changes are announced as `site:state` so the embedded
// terminal (js/terminal-embed.js) can follow the theme and cheat mode.
export function toggleCheatMode() {
  body.classList.toggle('palette-flip');
  window._cheatMode = body.classList.contains('palette-flip');
  // The icon swaps with aria-pressed (see style.css); the tip says what it is.
  cheatBtn.dataset.tip = window._cheatMode ? 'Cheat mode: on' : 'Cheat mode: off';
  cheatBtn.setAttribute('aria-pressed', String(window._cheatMode));
  window.dispatchEvent(new CustomEvent('site:state'));
}

/** Runs `commit` (which changes the theme) inside a cinematic View Transition that
 *  opens from `origin`, or a colour fade where View Transitions are missing. */
function transition(commit, origin) {
  if (prefersReducedMotion()) { commit(); return; }
  // Preferred: a cinematic View Transition. The browser snapshots the old and new
  // page; the old one defocuses and dims while a circle of the new theme opens out of
  // the control, overexposed at first and settling, like a camera adjusting. The
  // browser redraws every display refresh, so the frame count follows the screen:
  // roughly 1.4 s is about 84 frames at 60 Hz, 168 at 120 Hz.
  if (document.startViewTransition) {
    const r = (origin || themeSwitch || body).getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 120;
    const vt = document.startViewTransition(commit);
    vt.ready.then(() => {
      const opts = { duration: THEME_MS, easing: EASE_CINEMA, fill: 'both' };
      // clip-path circles interpolate everywhere; gradients in a mask would not.
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { ...opts, pseudoElement: '::view-transition-new(root)' },
      );
      root.animate(
        { filter: ['brightness(1.7) saturate(1.3)', 'brightness(1) saturate(1)'] },
        { ...opts, easing: 'cubic-bezier(.2,.6,.3,1)', pseudoElement: '::view-transition-new(root)' },
      );
      root.animate(
        { filter: ['blur(0px) brightness(1)', 'blur(10px) brightness(.55)'], transform: ['scale(1)', 'scale(.97)'] },
        { ...opts, pseudoElement: '::view-transition-old(root)' },
      );
    }).catch(() => {});
    return;
  }
  // Fallback: fade colours across the whole page for the same duration.
  root.classList.add('theme-switching');
  commit();
  setTimeout(() => root.classList.remove('theme-switching'), THEME_MS + 50);
}

/** Picks a mode. If the visible theme would not change (say auto to light while the
 *  system is already light) only the control updates, with no transition. */
function setMode(next, origin) {
  if (next === mode) return;
  mode = next;
  try { localStorage.setItem('theme', mode); } catch {}
  const nextTheme = resolve(mode);
  if (nextTheme === theme) { syncTheme(); return; }
  transition(() => { theme = nextTheme; syncTheme(); }, origin);
}

export function initTheme() {
  syncTheme();
  themeSwitch?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme-mode]');
    if (b) setMode(b.dataset.themeMode, b);
  });
  // Arrow keys move between the three options, as in any radio group.
  themeSwitch?.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    const all = [...themeSwitch.querySelectorAll('[data-theme-mode]')];
    const next = all[(all.indexOf(document.activeElement) + keys[e.key] + all.length) % all.length];
    next.focus(); setMode(next.dataset.themeMode, next); e.preventDefault();
  });
  // In auto mode, follow the system when it changes.
  mq.addEventListener?.('change', () => {
    if (mode !== 'auto' || resolve('auto') === theme) return;
    transition(() => { theme = resolve('auto'); syncTheme(); }, themeSwitch?.querySelector('[data-theme-mode="auto"]'));
  });
  cheatBtn.addEventListener('click', toggleCheatMode);
}
