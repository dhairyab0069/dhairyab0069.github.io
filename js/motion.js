// Shared motion helpers. Everything here animates transform and opacity only
// (CSS vars feed compositor-friendly properties) and respects reduced motion.
//
// Design rules (from Apple's fluid-interface talks):
// - Respond on pointer-down, not on release.
// - Never lock input during a transition; CSS transitions retarget from the
//   current value, so a second click mid-animation just reverses smoothly.
// - Default to critically damped motion (no bounce) unless a gesture carried momentum.

// Reduced motion is decided in two layers: the visitor's explicit choice from the
// "Motion" button (kept on <html data-motion="reduced|full"> and in localStorage)
// wins; otherwise the operating system's "Reduce motion" setting applies.
export const prefersReducedMotion = () => {
  const choice = document.documentElement.dataset.motion;
  if (choice) return choice === 'reduced';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const storedMotion = () => {
  try { const v = localStorage.getItem('motion'); return v === 'reduced' || v === 'full' ? v : null; } catch { return null; }
};

/** Wires the Motion button: flips between reduced and full motion, remembers the choice
 *  and announces it as a `site:motion` event so canvases and loops can stop or start.
 *  The button shows a runner while motion is on and a seated person while it is off. */
export function initMotionToggle() {
  const btn = document.querySelector('[data-motion-toggle]');
  if (!btn) return;
  const render = () => {
    const off = prefersReducedMotion();
    btn.dataset.tip = off ? 'Motion: off' : 'Motion: on';
    btn.setAttribute('aria-pressed', String(off));
  };
  const apply = (value) => {
    document.documentElement.dataset.motion = value;
    render();
    window.dispatchEvent(new CustomEvent('site:motion'));
  };
  btn.addEventListener('click', () => {
    const next = prefersReducedMotion() ? 'full' : 'reduced';
    try { localStorage.setItem('motion', next); } catch {}
    apply(next);
  });
  // Until the visitor chooses, follow the system setting, including when it changes.
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener?.('change', () => { if (!storedMotion()) apply(mq.matches ? 'reduced' : 'full'); });
  render();
}

/** Fade and lift elements in as they scroll into view. Stagger with `--i`. */
export function reveal(elements) {
  const list = [...elements];
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    list.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  list.forEach(el => io.observe(el));
}

/** Sets `--progress` (0..1) on `el` as `container` scrolls past the viewport middle. */
export function trackProgress(container, el) {
  let queued = false;
  const update = () => {
    queued = false;
    if (!container.offsetParent) return; // panel is hidden
    const r = container.getBoundingClientRect();
    const p = (window.innerHeight * 0.55 - r.top) / Math.max(r.height, 1);
    el.style.setProperty('--progress', Math.min(1, Math.max(0, p)).toFixed(4));
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  schedule();
  return schedule;
}

/** A soft light that follows the pointer over any `selector` match inside `root`.
 *  Tiles can nest (a card inside a window), so the position is set on every match
 *  from the innermost outwards, and an outer tile's glow never lags behind. */
export function spotlight(root, selector) {
  root.addEventListener('pointermove', e => {
    let el = e.target.closest?.(selector);
    while (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      el = el.parentElement?.closest(selector);
    }
  });
}

/** Counts a number up from 0 with an ease-out curve. Jumps straight there under reduced motion. */
export function countUp(el, to, ms = 900) {
  if (prefersReducedMotion() || to === 0) { el.textContent = String(to); return; }
  const start = performance.now();
  const tick = now => {
    const t = Math.min(1, (now - start) / ms);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Smooth-scroll that falls back to an instant jump under reduced motion. */
export function scrollToEl(el, block = 'start') {
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block });
}
