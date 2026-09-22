// ↑↑↓↓←→←→BA — unlocks cheat mode, same as the "Cheat code" button.

import { toggleCheatMode } from './theme.js';

const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
const buffer = [];

export function initKonami() {
  window.addEventListener('keydown', (event) => {
    // Typing in the terminal or the CTF handle box shouldn't count: ↑/↓ are
    // shell history there, and "b"/"a" are just letters.
    if (event.target.closest?.('input, textarea')) { buffer.length = 0; return; }
    buffer.push(event.key);
    if (buffer.length > sequence.length) buffer.shift();
    if (sequence.every((k, i) => buffer[i] === k)) toggleCheatMode();
  });
}
