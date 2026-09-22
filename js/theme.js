// Light/dark theme toggle and the "cheat code" palette flip button.
// The initial theme is applied by an inline script in <head> (to avoid a flash
// of the wrong theme); this module picks it up from there and persists changes.

const root = document.documentElement;
export const body = document.body;
export const themeBtn = document.querySelector('[data-theme-toggle]');
export const cheatBtn = document.querySelector('[data-secret-toggle]');

let theme = root.getAttribute('data-theme')
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const syncTheme = () => {
  root.setAttribute('data-theme', theme);
  body.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
};

// Flip the palette and expose the state so shell easter eggs can gate on it.
export function toggleCheatMode() {
  body.classList.toggle('palette-flip');
  window._cheatMode = body.classList.contains('palette-flip');
  cheatBtn.textContent = window._cheatMode ? 'Cheat ON 🔓' : 'Cheat code';
  cheatBtn.setAttribute('aria-pressed', String(window._cheatMode));
}

export function initTheme() {
  syncTheme();
  themeBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', theme); } catch {}
    syncTheme();
  });
  cheatBtn.addEventListener('click', toggleCheatMode);
}
