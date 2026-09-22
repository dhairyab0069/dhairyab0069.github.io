// ↑↑↓↓←→←→BA — unlocks cheat mode, same as the "Cheat code" button.

import { toggleCheatMode } from './theme.js';

const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
const buffer = [];

export function initKonami() {
  window.addEventListener('keydown', (event) => {
    buffer.push(event.key);
    if (buffer.length > sequence.length) buffer.shift();
    if (sequence.every((k, i) => buffer[i] === k)) toggleCheatMode();
  });
}
