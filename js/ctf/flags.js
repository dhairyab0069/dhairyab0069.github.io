// CTF progress, read from localStorage. The flags themselves (and the code that
// records captures) live in the nextcube-terminal repo; it writes the same
// `ctf_state` key, which this page shares because both are on the same origin.
// Flag 6 is the bonus dungeon flag and does not count toward the 5-flag score.

export const REQUIRED_FLAGS = 5;

const load = () => {
  let saved;
  try { saved = JSON.parse(localStorage.getItem('ctf_state') || '{}'); } catch { saved = {}; }
  if (!saved || typeof saved !== 'object') saved = {};
  if (!Array.isArray(saved.found)) saved.found = [];
  return saved;
};

export const ctfState = load();

// Re-read after the terminal reports a capture, keeping the same object so
// importers see the update.
export function reloadCTFState() {
  const fresh = load();
  for (const k of Object.keys(ctfState)) delete ctfState[k];
  Object.assign(ctfState, fresh);
}

export function saveCTFState() {
  try { localStorage.setItem('ctf_state', JSON.stringify(ctfState)); } catch {}
}

export const requiredFound = () => ctfState.found.filter(n => n <= REQUIRED_FLAGS).length;
export const bonusFound = () => ctfState.found.some(n => n > REQUIRED_FLAGS);
