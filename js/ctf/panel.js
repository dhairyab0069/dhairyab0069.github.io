// The CTF scoreboard panel: progress bar, per-flag rows, and the handle submit box.
// Terminal `submit` writes captured flags to window._ctfFound; we pick them up by
// observing the terminal output rather than patching the command itself.

import { output } from '../shell/output.js';
import { ctfState, saveCTFState, recordFlag } from './flags.js';

export function updateCTFPanel() {
  const n = ctfState.found.length;
  document.getElementById('ctf-score-label').textContent = n >= 6 ? `5 / 5 flags + bonus ⚔️` : `${Math.min(n,5)} / 5 flags found`;
  document.getElementById('ctf-score-fill').style.width = `${(Math.min(n,5)/5)*100}%`;
  ctfState.found.forEach(num => {
    const row = document.querySelector(`.ctf-flag-row[data-flag="${num}"]`);
    if (row) {
      row.classList.add('found');
      row.querySelector('.flag-icon').textContent = '✓';
    }
  });
  if (n >= 5) {
    document.getElementById('ctf-submit-row').classList.remove('ctf-locked');
  }
}

export function initCtfPanel() {
  const ctfObserver = new MutationObserver(() => {
    const found = window._ctfFound;
    if (!found) return;
    let changed = false;
    found.forEach(f => { if (recordFlag(f)) changed = true; });
    if (changed) updateCTFPanel();
  });
  ctfObserver.observe(output, { childList: true });

  document.getElementById('ctf-submit-btn').addEventListener('click', () => {
    const handle = document.getElementById('ctf-handle').value.trim();
    const status = document.getElementById('ctf-status');
    if (!handle) { status.textContent = 'Enter a handle first.'; return; }
    if (ctfState.found.length < 1) { status.textContent = 'Find at least one flag first.'; return; }
    const btn = document.getElementById('ctf-submit-btn');
    const score = ctfState.found.length;
    btn.disabled = true;
    const base = Math.min(score, 5);
    btn.textContent = score >= 6 ? '🎉 5/5 + bonus!' : score === 5 ? '🎉 All 5 flags!' : `${base}/5 claimed`;
    status.textContent = score >= 6
      ? `${handle} — 5/5 flags + bonus dungeon flag. Impressive.`
      : score === 5
        ? `Nice work, ${handle}. All 5 flags captured.`
        : `${handle} — ${score}/5 flags. Keep going.`;
    ctfState.handle = handle;
    saveCTFState();
  });

  updateCTFPanel();
}
