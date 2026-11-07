// Touch sound effects: short action-style sounds on taps, navigation, toggles and the
// theme switch. Real recordings (blade draws, swooshes, metal hits, a magic charge) from
// CC0 packs by Kenney and artisticdude, credited in the page footer and in
// assets/sounds/CREDITS.md. If the files cannot load, small synthesized tones play
// instead, so the Sound button always does something.
//
// Design choices:
// - Off until the visitor turns it on with the Sound button, and the choice is
//   remembered. A portfolio gets opened in meetings and libraries; sound has to be
//   opt-in. To change the default, set DEFAULT_ON.
// - Played on pointer-down, not on release, so the sound lands with the press
//   (the same rule the visuals follow). One short sound per interaction, with a little
//   random pitch variation so repeats don't grate.
// - The ten clips total about 40 KB. They are fetched and decoded on the first press
//   after sound is on, since browsers only allow audio after a user gesture.
// - The mapping from element to sound is a pure function, tested without a browser.

const KEY = 'sound';
const DEFAULT_ON = false;
const MASTER_GAIN = 0.14; // the synthesized fallback tones
const SAMPLE_GAIN = 0.8; // the recordings, which are normalized to about -3 dB
const SAMPLE_DIR = './assets/sounds/';
const MIN_GAP_MS = 35; // never stack sounds on top of each other

/** Which sound a pressed element should make, or null for none. Order matters: the
 *  first selector that matches wins. `target` needs only a `closest(selector)` method. */
export const SOUND_MAP = [
  ['[data-sound-toggle]', 'toggle'],
  ['.theme-switch button', 'theme'],
  ['.dock a', 'nav'],
  ['button.jt-head', 'open'],
  ['[data-motion-toggle]', 'motion'],
  ['[data-secret-toggle]', 'cheat'],
  ['.run-btn, .explore-btn, .ctf-btn', 'strike'],
  ['.jr-filters button, .jr-step a, .about-tag, .live-dots span', 'tap'],
  // Projects: filters and spotlight controls tap, cards and "Open" draw the blade, steps swoosh, close latches.
  ['.pj-filters button, .pj-dots button, .pj-spot-btn', 'tap'],
  ['.pj-card, .pj-open', 'open'],
  ['.pj-step', 'nav'],
  ['.pj-close', 'close'],
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
  motionOn: [[400, 700, 0.06, 'triangle', 0.8, 0], [400, 700, 0.06, 'triangle', 0.8, 0.12]],
  motionOff: [[500, 300, 0.12, 'sine', 0.8, 0]],
  cheatOn: [[300, 900, 0.18, 'square', 0.35, 0], [1100, 1100, 0.1, 'sine', 0.6, 0.2]],
  cheatOff: [[900, 300, 0.18, 'square', 0.35, 0]],
};

/** The recording(s) each sound plays: file (without .mp3), gain, delay in seconds. */
export const SAMPLES = {
  tap: [{ file: 'tap', gain: 0.5 }],
  strike: [{ file: 'strike', gain: 0.6 }], // a blade ting
  nav: [{ file: 'nav', gain: 0.7 }], // a swoosh
  open: [{ file: 'open', gain: 0.7 }], // a blade draw
  close: [{ file: 'close', gain: 0.55 }], // sheathed with a metal latch
  toggle: [{ file: 'toggle', gain: 0.6 }],
  on: [{ file: 'on', gain: 0.6 }],
  off: [{ file: 'off', gain: 0.6 }],
  // Motion: a dash and two footsteps when motion turns on, cloth settling when it turns off.
  motionOn: [{ file: 'dash', gain: 0.55 }, { file: 'step-a', gain: 0.6, delay: 0.05 }, { file: 'step-b', gain: 0.6, delay: 0.19 }],
  motionOff: [{ file: 'sit', gain: 0.6 }],
  // Cheat mode: a rising power-up sweep and a chime when it turns on, a falling sweep when it turns off.
  cheatOn: [{ file: 'cheat-on-a', gain: 0.6 }, { file: 'cheat-on-b', gain: 0.55, delay: 0.22 }],
  cheatOff: [{ file: 'cheat-off', gain: 0.6 }],
  theme: [{ file: 'theme-a', gain: 0.75 }, { file: 'theme-b', gain: 0.7, delay: 0.5 }], // a magic charge, then a metal hit
};

const buffers = new Map(); // file -> decoded AudioBuffer
let loading = false;

async function loadSamples() {
  if (loading || !ctx) return;
  loading = true;
  const files = [...new Set(Object.values(SAMPLES).flat().map(l => l.file))];
  await Promise.all(files.map(async (file) => {
    try {
      const res = await fetch(`${SAMPLE_DIR}${file}.mp3`);
      if (!res.ok) throw new Error(res.status);
      buffers.set(file, await ctx.decodeAudioData(await res.arrayBuffer()));
    } catch { /* this clip falls back to a synthesized tone */ }
  }));
}

function playSample(layer) {
  const buffer = buffers.get(layer.file);
  if (!buffer) return false;
  const src = ctx.createBufferSource();
  const amp = ctx.createGain();
  src.buffer = buffer;
  src.playbackRate.value = 1 + (Math.random() - 0.5) * 0.08;
  amp.gain.value = layer.gain * SAMPLE_GAIN;
  src.connect(amp).connect(ctx.destination);
  src.start(ctx.currentTime + (layer.delay || 0));
  return true;
}

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
  loadSamples();
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
  const layers = SAMPLES[kind] || SAMPLES.tap;
  // Use the recordings once they have loaded; until then (or if they failed) play the
  // synthesized version so a press is never silent.
  if (layers.every(l => buffers.has(l.file))) { layers.forEach(playSample); return; }
  if (kind === 'theme') { whoosh(); return; }
  (RECIPES[kind] || RECIPES.tap).forEach(tone);
}

export function initSound() {
  enabled = readSetting();
  const btn = document.querySelector('[data-sound-toggle]');
  const render = () => {
    if (!btn) return;
    // The speaker icon swaps with aria-pressed (see style.css); the title says what it is.
    btn.dataset.tip = enabled ? 'Sound effects: on' : 'Sound effects: off';
    btn.setAttribute('aria-pressed', String(enabled));
    const label = btn.querySelector('[data-sound-label]');
    if (label) label.textContent = enabled ? 'Sound on' : 'Sound off';
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
    if (kind === 'motion') {
      // aria-pressed is true while motion is OFF, and this press is about to flip it.
      const off = e.target.closest('[data-motion-toggle]')?.getAttribute('aria-pressed') === 'true';
      play(off ? 'motionOn' : 'motionOff');
      return;
    }
    if (kind === 'cheat') {
      // aria-pressed is true while cheat mode is ON, and this press is about to flip it.
      const on = e.target.closest('[data-secret-toggle]')?.getAttribute('aria-pressed') === 'true';
      play(on ? 'cheatOff' : 'cheatOn');
      return;
    }
    play(kind);
  }, { passive: true });
}
