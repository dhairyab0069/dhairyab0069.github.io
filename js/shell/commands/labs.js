// `labs` — the ML Lab Bench: interactive deep-learning labs from the ML course.

import { w, wErr, esc } from '../output.js';

const BASE = 'https://dhairyab0069.github.io/ml-course/labs/';
const LABS = {
  curve:      ['02', 'Curve fitting & overfitting'],
  perceptron: ['03', 'Perceptron, step by step'],
  mlp:        ['03', 'Tiny MLP trained live (XOR, circles, spirals)'],
  descent:    ['05', 'SGD vs momentum vs Adam'],
  conv:       ['07', 'Convolution filters'],
  attention:  ['11', 'Attention heatmap'],
  gan:        ['14', 'A GAN, trained in your browser'],
  map:        ['00-15', 'Course map'],
};

export const labsCommands = {
  labs(args) {
    const name = (args[0] || '').toLowerCase();
    if (name) {
      if (!(name in LABS)) { wErr(`labs: no lab named ${esc(name)}. Try one of: ${Object.keys(LABS).join(' ')}`); return; }
      window.open(BASE + '#' + name, '_blank', 'noopener');
      w(`<span style="color:var(--color-green)">opening ${esc(LABS[name][1])}…</span>`);
      return;
    }
    w(`<span style="color:var(--color-primary)">ML Lab Bench</span> <span style="color:var(--color-text-muted)">— interactive labs from my deep learning course</span>`);
    for (const [id, [mod, title]] of Object.entries(LABS)) {
      w(`  <span style="color:var(--color-green)">${esc(id.padEnd(11))}</span><span style="color:var(--color-text-faint)">${esc(mod.padEnd(6))}</span><a href="${BASE}#${id}" target="_blank" rel="noopener" style="color:var(--color-text-muted)">${esc(title)}</a>`);
    }
    w(`<span style="color:var(--color-text-faint)">Open one with <span style="color:var(--color-green)">labs mlp</span>. The course: <a href="https://github.com/dhairyab0069/ml-course" target="_blank" rel="noopener" style="color:var(--color-primary)">github.com/dhairyab0069/ml-course</a></span>`);
  },
};
