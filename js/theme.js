// Light/dark theme toggle and the "cheat code" palette flip button.
// The initial theme is applied by an inline script in <head> (to avoid a flash
// of the wrong theme); this module picks it up from there and persists changes.

const root = document.documentElement;
export const body = document.body;
export const themeBtn = document.querySelector('[data-theme-toggle]');
export const cheatBtn = document.querySelector('[data-secret-toggle]');

const THEME_MS = 1400;
const EASE_CINEMA = 'cubic-bezier(.6,.04,.2,1)';

let theme = root.getAttribute('data-theme')
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const syncTheme = () => {
  root.setAttribute('data-theme', theme);
  body.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  window.dispatchEvent(new CustomEvent('site:state'));
};

// Flip the palette. Changes are announced as `site:state` so the embedded
// terminal (js/terminal-embed.js) can follow the theme and cheat mode.
export function toggleCheatMode() {
  body.classList.toggle('palette-flip');
  window._cheatMode = body.classList.contains('palette-flip');
  cheatBtn.textContent = window._cheatMode ? 'Cheat ON 🔓' : 'Cheat code';
  cheatBtn.setAttribute('aria-pressed', String(window._cheatMode));
  window.dispatchEvent(new CustomEvent('site:state'));
}

export function initTheme() {
  syncTheme();
  const flip = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', theme); } catch {}
    syncTheme();
  };
  themeBtn.addEventListener('click', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { flip(); return; }
    // Preferred: a cinematic View Transition. The browser snapshots the old and new
    // page; the old one defocuses and dims while a circle of the new theme
    // opens out of the button, overexposed at first and settling to normal, like a
    // camera adjusting. The browser redraws every display refresh, so the frame count
    // follows the screen: roughly 1.4 s is about 84 frames at 60 Hz, 168 at 120 Hz.
    if (document.startViewTransition) {
      const r = themeBtn.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 120;
      const transition = document.startViewTransition(flip);
      transition.ready.then(() => {
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
    flip();
    setTimeout(() => root.classList.remove('theme-switching'), THEME_MS + 50);
  });
  cheatBtn.addEventListener('click', toggleCheatMode);
}
