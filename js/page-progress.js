// A thin progress bar fixed to the top of the window that fills as you scroll down
// the current page (About, Journey, Projects, Workbench or Mail). It resets when you switch
// pages, because each page scrolls from the top.
//
// It only sets one CSS variable (--p, 0 to 1) that scales a bar; no layout work in the
// scroll handler, and updates are batched to one per frame.

/** How far through the page you are, from 0 to 1. A page that fits the window is 0. */
export function scrollFraction(scrollTop, scrollHeight, viewportHeight) {
  const max = scrollHeight - viewportHeight;
  if (!(max > 0)) return 0;
  return Math.min(1, Math.max(0, scrollTop / max));
}

export function initPageProgress() {
  const bar = document.getElementById('page-progress');
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const doc = document.documentElement;
    bar.style.setProperty('--p', scrollFraction(window.scrollY, doc.scrollHeight, window.innerHeight).toFixed(4));
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  // The page grows and shrinks (a Journey item opens, a panel is minimized, a new
  // page appears), which changes how far there is to scroll.
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  schedule();
}
