// The flag table and the localStorage-backed record of which ones are found.
// Flag 6 is the bonus dungeon flag, hence the 5-flag cap on the displayed score.

export const FLAG_MAP = {
  'FLAG{str1ngs_4r3_y0ur_fr13nd}': 1,
  'FLAG{d0tf1l3s_n3v3r_l13}':      2,
  'FLAG{ch3cks3c_pr0t3ct10ns}':    3,
  'FLAG{3lf_s3ct10n_hunt3r}':      4,
  'FLAG{gh0st_1n_th3_h4l}':        5,
  'FLAG{k3rn3l_dungeon_master}':   6,
};

export const ctfState = (() => {
  let saved;
  try { saved = JSON.parse(localStorage.getItem('ctf_state') || '{}'); } catch { saved = {}; }
  if (!saved.found) saved.found = [];
  return saved;
})();

export function saveCTFState() {
  try { localStorage.setItem('ctf_state', JSON.stringify(ctfState)); } catch {}
}

// Record a flag string; returns true if this was a new capture.
export function recordFlag(flag) {
  const num = FLAG_MAP[flag];
  if (!num || ctfState.found.includes(num)) return false;
  ctfState.found.push(num);
  saveCTFState();
  return true;
}
