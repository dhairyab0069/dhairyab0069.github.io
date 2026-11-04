// The small dialogue box under each toolbar control (theme, sound, motion, cheat mode).
//
// Behaviour:
// - Hover: the box shows while the pointer is on the control and fades when it leaves.
// - Press: the box shows the new state ("Sound effects: on"), then fades after about a
//   second and a half even if the pointer is still resting there, so it never hangs around.
// - Only one box is up at a time: pointing at or pressing another control fades the
//   previous one out as the new one comes in.
// - Touch screens have no hover: a press shows the box for the same short time.
// - Keyboard focus shows it too, and moving focus away hides it.
//
// The CSS only draws the box when its control has the `tip-on` class; this module decides
// when that is.

const AFTER_PRESS_MS = 1500;

export function initTips() {
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;
  let current = null;
  let timer = 0;

  const hide = (el) => {
    if (!el) return;
    el.classList.remove('tip-on');
    if (el === current) { current = null; clearTimeout(timer); }
  };
  const show = (el, autoHideMs = 0) => {
    if (current && current !== el) hide(current); // the previous box fades as this one appears
    clearTimeout(timer);
    current = el;
    el.classList.add('tip-on');
    if (autoHideMs) timer = setTimeout(() => hide(el), autoHideMs);
  };
  const controlOf = (target) => target?.closest?.('[data-tip]') || null;

  toolbar.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return; // no hover on touch
    const el = controlOf(e.target);
    if (el && el !== current) show(el);
  });
  toolbar.addEventListener('pointerout', (e) => {
    if (e.pointerType === 'touch') return;
    const el = controlOf(e.target);
    if (el && !el.contains(e.relatedTarget)) hide(el);
  });
  toolbar.addEventListener('pointerdown', (e) => {
    const el = controlOf(e.target);
    if (el) show(el, AFTER_PRESS_MS);
  }, { passive: true });
  toolbar.addEventListener('focusin', (e) => {
    const el = controlOf(e.target);
    if (el && el.matches(':focus-visible')) show(el);
  });
  toolbar.addEventListener('focusout', (e) => {
    const el = controlOf(e.target);
    if (el) hide(el);
  });
}
