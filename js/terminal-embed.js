// Host side of the embedded terminal (github.com/dhairyab0069/nextcube-terminal,
// served at /nextcube-terminal/ on this origin and loaded in the Workbench
// iframe). See that repo's js/bridge.js for the message protocol.
//
// - Pushes theme and cheat-mode changes into the terminal.
// - Refreshes the CTF scoreboard when the terminal reports a capture.
// - Flips this page when the terminal's `flip` easter egg asks for it.

import { reloadCTFState } from './ctf/flags.js';

const frame = document.getElementById('terminal-frame');

const toTerminal = (type, data = {}) =>
  frame?.contentWindow?.postMessage({ source: 'nextcube-site', type, ...data }, location.origin);

const currentState = () => ({
  theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
  cheat: document.body.classList.contains('palette-flip'),
});

function syncTerminal() {
  const { theme, cheat } = currentState();
  toTerminal('theme', { theme });
  toTerminal('cheat', { on: cheat });
}

function flipPage() {
  const body = document.body;
  body.style.transition = 'transform .6s ease';
  body.style.transform = body.style.transform === 'rotate(180deg)' ? '' : 'rotate(180deg)';
}

function ctfChanged() {
  reloadCTFState();
  window.dispatchEvent(new CustomEvent('ctf:update'));
}

export function initTerminalEmbed() {
  if (!frame) return;
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.source !== frame.contentWindow) return;
    const msg = e.data;
    if (!msg || msg.source !== 'nextcube-terminal') return;
    if (msg.type === 'ready') syncTerminal();
    else if (msg.type === 'ctf') ctfChanged();
    else if (msg.type === 'flip') flipPage();
  });
  // Theme / cheat toggles on this page (see theme.js).
  window.addEventListener('site:state', syncTerminal);
  // Flags captured in another tab (e.g. the standalone terminal).
  window.addEventListener('storage', (e) => { if (e.key === 'ctf_state') ctfChanged(); });
}
