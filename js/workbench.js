// Workbench: the terminal reacts to where the pointer is on the panel.
//
// Three zones, measured from the centre of the stage in square rings:
//   focus  (centre)  the terminal lifts, glows and leans toward the pointer
//   orbit  (middle)  a wider, cooler light follows the pointer; the glow is softer
//   quiet  (edges)   the terminal settles back and the panel dims
//
// Design choices:
// - The pointer cannot be tracked over the iframe (it swallows the events), and a
//   tilting terminal is annoying to type in. So over the terminal the scene is
//   always "focus" and the tilt eases flat; tilt only happens around it.
// - Values are smoothed in a requestAnimationFrame loop (exponential approach, no
//   overshoot) instead of CSS transitions, so a fast pointer never queues up
//   animations and reversing direction just retargets from the current value.
// - Only transform, opacity and box-shadow vars are driven. The loop sleeps when
//   everything has settled and when the panel is hidden.
// - Reduced motion: no tilt, no smoothing; the scene label and light still change.

import { reveal, prefersReducedMotion } from './motion.js';

export const ZONES = [
  { name: 'focus', max: 0.4 },
  { name: 'orbit', max: 0.75 },
  { name: 'quiet', max: Infinity },
];
const HYSTERESIS = 0.04;
const TAU_MS = 90; // time constant of the smoothing

/** Zone for a pointer at (nx, ny), each in -1..1 from the stage centre. `current`
 *  gives the zone a little stickiness so it doesn't flicker on a boundary. */
export function zoneFor(nx, ny, current = null) {
  const d = Math.max(Math.abs(nx), Math.abs(ny));
  const i = ZONES.findIndex(z => d < z.max);
  if (current) {
    const c = ZONES.findIndex(z => z.name === current);
    if (c !== i) {
      const edge = i > c ? ZONES[c].max : ZONES[i].max; // the boundary being crossed
      if (Math.abs(d - edge) < HYSTERESIS) return current;
    }
  }
  return ZONES[i].name;
}

const GLOW = { focus: 1, orbit: 0.45, quiet: 0 };
const SCALE = { focus: 1.012, orbit: 1, quiet: 0.988 };

export function initWorkbench() {
  const stage = document.getElementById('wb-stage');
  const frame = document.getElementById('wb-frame');
  const label = document.getElementById('wb-scene');
  const panel = document.getElementById('panel-workbench');
  if (!stage || !frame || !panel) return;

  let reduced = prefersReducedMotion();
  const cur = { x: 0, y: 0, glow: 1, scale: 1 };
  const tgt = { x: 0, y: 0, glow: 1, scale: 1 };
  let zone = 'focus';
  let raf = 0;
  let last = 0;

  const setZone = (z) => {
    if (z === zone) return;
    zone = z;
    stage.dataset.zone = z;
    label.textContent = `scene: ${z}`;
    tgt.glow = GLOW[z];
    tgt.scale = SCALE[z];
  };

  const apply = () => {
    frame.style.setProperty('--tx', cur.x.toFixed(4));
    frame.style.setProperty('--ty', cur.y.toFixed(4));
    frame.style.setProperty('--glow', cur.glow.toFixed(4));
    frame.style.setProperty('--sc', cur.scale.toFixed(4));
  };

  const tick = (now) => {
    raf = 0;
    if (panel.hidden) return;
    const dt = Math.min(64, now - (last || now));
    last = now;
    const k = 1 - Math.exp(-dt / TAU_MS);
    let moving = false;
    for (const key of Object.keys(cur)) {
      const diff = tgt[key] - cur[key];
      if (Math.abs(diff) > 0.0005) { cur[key] += diff * k; moving = true; } else cur[key] = tgt[key];
    }
    apply();
    if (moving) raf = requestAnimationFrame(tick); else last = 0;
  };
  const wake = () => {
    if (reduced) { Object.assign(cur, tgt); apply(); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const overFrame = (e) => frame.contains(e.target);

  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    stage.style.setProperty('--ax', `${e.clientX - r.left}px`);
    stage.style.setProperty('--ay', `${e.clientY - r.top}px`);
    if (overFrame(e)) {
      setZone('focus');
      tgt.x = 0; tgt.y = 0;
    } else {
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      setZone(zoneFor(nx, ny, zone));
      // Lean toward the pointer, clamped; the CSS maps this to a few degrees.
      tgt.x = reduced ? 0 : Math.max(-1, Math.min(1, nx));
      tgt.y = reduced ? 0 : Math.max(-1, Math.min(1, ny));
    }
    wake();
  });

  // Leaving the stage is the quietest scene of all.
  stage.addEventListener('pointerleave', () => {
    setZone('quiet');
    tgt.x = 0; tgt.y = 0;
    wake();
  });

  // Back at rest, the terminal is in focus, ready to type.
  const rest = () => { setZone('focus'); tgt.x = 0; tgt.y = 0; wake(); };
  frame.addEventListener('focusin', rest);
  new MutationObserver(() => { if (!panel.hidden) { rest(); } }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });

  window.addEventListener('site:motion', () => {
    reduced = prefersReducedMotion();
    if (reduced) { tgt.x = 0; tgt.y = 0; Object.assign(cur, tgt); apply(); }
  });

  reveal(panel.querySelectorAll('.wb-reveal'));
  apply();
}
