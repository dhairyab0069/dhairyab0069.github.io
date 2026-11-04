// The small dialogue box under each toolbar control (theme, sound, motion, cheat mode).
// On a mouse it shows on hover and keyboard focus through CSS alone. On a touch screen
// there is no hover, so after a press the box stays up for a moment, which also lets it
// show the new state ("Sound effects: on") right after the control flips.

const SHOW_MS = 1800;

export function initTips() {
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;
  let timer = 0;
  let shown = null;
  const hide = () => { shown?.classList.remove('show-tip'); shown = null; };
  toolbar.addEventListener('pointerdown', (e) => {
    const control = e.target.closest('[data-tip]');
    if (!control) return;
    hide();
    clearTimeout(timer);
    shown = control;
    control.classList.add('show-tip');
    timer = setTimeout(hide, SHOW_MS);
  }, { passive: true });
}
