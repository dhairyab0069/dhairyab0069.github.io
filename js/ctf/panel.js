// The CTF scoreboard panel: progress bar, per-flag rows, and the handle submit box.
// Refreshes whenever flags.js announces a capture via the `ctf:update` event.

import {
  ctfState, saveCTFState, REQUIRED_FLAGS, requiredFound, bonusFound
} from './flags.js';

export function updateCTFPanel() {
  const n = requiredFound();
  const bonus = bonusFound();
  document.getElementById('ctf-score-label').textContent =
    `${n} / ${REQUIRED_FLAGS} flags found${bonus ? ' + bonus ⚔️' : ''}`;
  document.getElementById('ctf-score-fill').style.width = `${(n / REQUIRED_FLAGS) * 100}%`;
  ctfState.found.forEach(num => {
    const row = document.querySelector(`.ctf-flag-row[data-flag="${num}"]`);
    if (row) {
      row.classList.add('found');
      row.querySelector('.flag-icon').textContent = '✓';
    }
  });
  const locked = n < REQUIRED_FLAGS;
  document.getElementById('ctf-submit-row').classList.toggle('ctf-locked', locked);
  document.getElementById('ctf-handle').disabled = locked;
  document.getElementById('ctf-submit-btn').disabled = locked;
}

export function initCtfPanel() {
  window.addEventListener('ctf:update', updateCTFPanel);

  document.getElementById('ctf-submit-btn').addEventListener('click', () => {
    const handle = document.getElementById('ctf-handle').value.trim();
    const status = document.getElementById('ctf-status');
    if (!handle) { status.textContent = 'Enter a handle first.'; return; }
    if (requiredFound() < REQUIRED_FLAGS) { status.textContent = `Find all ${REQUIRED_FLAGS} flags first.`; return; }
    const btn = document.getElementById('ctf-submit-btn');
    const bonus = bonusFound();
    btn.disabled = true;
    btn.textContent = bonus ? '🎉 5/5 + bonus!' : '🎉 All 5 flags!';
    status.textContent = bonus
      ? `${handle} — 5/5 flags + bonus dungeon flag. Impressive.`
      : `Nice work, ${handle}. All 5 flags captured.`;
    ctfState.handle = handle;
    saveCTFState();
  });

  updateCTFPanel();
}
