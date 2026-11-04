// Touch sound effects: short synthesized sounds on taps, navigation, toggles and the
// theme switch.
//
// Design choices:
// - Off until the visitor turns it on with the Sound button, and the choice is
//   remembered. A portfolio gets opened in meetings and libraries; sound has to be
//   opt-in. To change the default, set DEFAULT_ON.
// - Synthesized with the Web Audio API (oscillators and a noise burst), so there are
//   no audio files to source, license or load.
// - Played on pointer-down, not on release, so the sound lands with the press
//   (the same rule the visuals follow). One short sound per interaction, quiet,
//   with a little random pitch variation so repeats don't grate.
// - Browsers only allow audio after a user gesture, so the audio context is created
//   (or resumed) inside the first pointer-down.
// - The mapping from element to sound is a pure function, tested without a browser.

const KEY = 'sound';
const DEFAULT_ON = false;
const MASTER_GAIN = 0.14;
const MIN_GAP_MS = 35; // never stack sounds on top of each other

/** Which sound a pressed element should make, or null for none. Order matters: the
 *  first selector that matches wins. `target` needs only a `closest(selector)` method. */
export const SOUND_MAP = [
  ['[data-sound-toggle]', 'toggle'],
  ['.theme-switch button', 'theme'],
  ['.dock a', 'nav'],
  ['button.jt-head', 'open'],
  ['[data-motion-toggle], [data-secret-toggle]', 'toggle'],
  ['.jr-filters button, .jr-step a, .run-btn, .explore-btn, .ctf-btn, .about-tag, .live-dots span', 'tap'],
];

export function soundFor(target) {
  if (!target?.closest) return null;
  for (const [selector, kind] of SOUND_MAP) if (target.closest(selector)) return kind;
  return null;
}

/** Tone recipes: [startHz, endHz, seconds, wave, relativeGain, delaySeconds]. */
export const RECIPES = {
  tap: [[880, 620, 0.06, 'sine', 0.9, 0]],
  nav: [[520, 520, 0.07, 'triangle', 0.8, 0], [780, 780, 0.09, 'triangle', 0.8, 0.065]],
  open: [[480, 760, 0.08, 'sine', 0.9, 0]],
  close: [[760, 480, 0.08, 'sine', 0.9, 0]],
  on: [[600, 600, 0.07, 'sine', 0.9, 0], [900, 900, 0.1, 'sine', 0.9, 0.07]],
  off: [[900, 900, 0.07, 'sine', 0.9, 0], [600, 600, 0.1, 'sine', 0.9, 0.07]],
};

let ctx = null;
let master = null;
let enabled = DEFAULT_ON;
let lastAt = 0;

const readSetting = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'on' ? true : v === 'off' ? false : DEFAULT_ON;
  } catch { return DEFAULT_ON; }
};

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

function tone([from, to, dur, wave, gain, delay]) {
  const t0 = ctx.currentTime + delay;
  const jitter = 1 + (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(from * jitter, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to * jitter, 1), t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.006); // short attack, no click
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// A soft rising whoosh for the theme switch: a burst of noise through a band-pass
// filter whose centre sweeps upward, matching the circle opening on screen.
function whoosh() {
  const dur = 0.5;
  const t0 = ctx.currentTime;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(350, t0);
  filter.frequency.exponentialRampToValueAtTime(3200, t0 + dur);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(0.9, t0 + 0.12);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(amp).connect(master);
  src.start(t0);
}

export function play(kind) {
  if (!enabled || document.hidden || !ensureContext()) return;
  const now = performance.now();
  if (now - lastAt < MIN_GAP_MS) return;
  lastAt = now;
  if (kind === 'theme') { whoosh(); return; }
  (RECIPES[kind] || RECIPES.tap).forEach(tone);
}

export function initSound() {
  enabled = readSetting();
  const btn = document.querySelector('[data-sound-toggle]');
  const render = () => {
    if (!btn) return;
    btn.textContent = enabled ? 'Sound: on' : 'Sound: off';
    btn.setAttribute('aria-pressed', String(enabled));
  };
  render();

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const kind = soundFor(e.target);
    if (!kind) return;
    if (kind === 'toggle' && e.target.closest('[data-sound-toggle]')) {
      // The Sound button flips the setting; this tap is the one place a sound can
      // confirm a change even though the setting was just off.
      enabled = !enabled;
      try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch {}
      render();
      if (ensureContext()) {
        const was = enabled;
        enabled = true;
        play(was ? 'on' : 'off');
        enabled = was;
      }
      return;
    }
    if (kind === 'open') {
      // Opening and closing sound different; this runs before the click toggles it.
      const expanded = e.target.closest('button.jt-head')?.getAttribute('aria-expanded') === 'true';
      play(expanded ? 'close' : 'open');
      return;
    }
    play(kind);
  }, { passive: true });
}
