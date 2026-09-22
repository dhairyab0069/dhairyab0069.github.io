// The CTF challenge surface inside the terminal: briefing, hints, flag submission.

import { w, wErr } from '../output.js';

export const ctfCommands = {
  ctf() {
    const g = `style="color:var(--color-gold)"`;
    const p = `style="color:var(--color-primary)"`;
    const m = `style="color:var(--color-magenta)"`;
    w(`<span ${g}>╔══════════════════════════════════════════════╗</span>`);
    w(`<span ${g}>║   DHAIRYA'S RESUME — CTF CHALLENGE v1.0     ║</span>`);
    w(`<span ${g}>╚══════════════════════════════════════════════╝</span>`);
    w(``);
    w(`<span ${p}>5 flags hidden across this workstation.</span>`);
    w(`<span style="color:var(--color-text-faint)">Each one requires a different reverse engineering technique.</span>`);
    w(`<span style="color:var(--color-text-faint)">Format: <span ${m}>FLAG{...}</span></span>`);
    w(``);
    w(`<span ${p}>Tools available:</span>`);
    w(`  <span style="color:var(--color-green)">strings  checksec  readelf  xxd  find  file</span>`);
    w(``);
    w(`<span style="color:var(--color-text-faint)">Type <span ${p}>hint [1-5]</span> if you're stuck.</span>`);
    w(`<span style="color:var(--color-text-faint)">Type <span ${p}>submit FLAG{...}</span> to claim a flag.</span>`);
    w(`<span style="color:var(--color-text-faint)">Type <span ${p}>scoreboard</span> to see your progress.</span>`);
  },


  hint(args) {
    const n = parseInt(args[0]);
    const g = `style="color:var(--color-gold)"`;
    const p = `style="color:var(--color-primary)"`;
    const f = `style="color:var(--color-text-faint)"`;
    const hints = {
      1: { title:'Binary Strings', h1:'Binary files often hide readable text.', h2:'Try running strings on your resume.', h3:`<span ${p}>strings resume.pdf</span>` },
      2: { title:'Hidden Files', h1:'Not all files show up by default.', h2:'Unix hides files starting with a dot.', h3:`<span ${p}>ls -la</span> in your home directory` },
      3: { title:'Binary Protections', h1:'Security engineers always check ELF hardening.', h2:'There is an ELF binary in the cactilab directory.', h3:`<span ${p}>checksec research/cactilab/hal_gpio.elf</span>` },
      4: { title:'Section Headers', h1:'ELF files are divided into named sections.', h2:'One section has an unusual name and address.', h3:`<span ${p}>readelf -S research/cactilab/hal_gpio.elf</span> then <span ${p}>xxd</span> it` },
      5: { title:'Hidden Directories', h1:'Some directories are marked classified.', h2:'ls -la shows more than ls alone.', h3:`<span ${p}>ls -la research/cactilab</span>` },
    };
    if (!n || !hints[n]) {
      w(`<span ${g}>CTF Hints — 5 flags total</span>`);
      for (let i = 1; i <= 5; i++) {
        w(`  <span ${p}>hint ${i}</span> <span ${f}>→ ${hints[i].title}</span>`);
      }
      return;
    }
    const h = hints[n];
    w(`<span ${g}>Flag ${n} — ${h.title}</span>`);
    w(`  <span ${f}>${h.h1}</span>`);
    w(`  <span ${f}>${h.h2}</span>`);
    w(`  <span ${p}>Try: ${h.h3}</span>`);
  },

  submit(args) {
    const input = args.join(' ').trim();
    const flags = {
      'FLAG{str1ngs_4r3_y0ur_fr13nd}': { n:1, name:'Binary Strings' },
      'FLAG{d0tf1l3s_n3v3r_l13}':      { n:2, name:'Hidden Files' },
      'FLAG{ch3cks3c_pr0t3ct10ns}':    { n:3, name:'Binary Protections' },
      'FLAG{3lf_s3ct10n_hunt3r}':      { n:4, name:'Section Headers' },
      'FLAG{gh0st_1n_th3_h4l}':        { n:5, name:'Classified Directory' },
      'FLAG{k3rn3l_dungeon_master}':   { n:6, name:'Kernel Dungeon' },
    };
    const g = `style="color:var(--color-gold)"`;
    const r = `style="color:var(--color-magenta)"`;
    if (!input.startsWith('FLAG{')) {
      wErr('submit: flag must start with FLAG{...}');
      return;
    }
    if (flags[input]) {
      const f = flags[input];
      if (!window._ctfFound) window._ctfFound = new Set();
      window._ctfFound.add(input);
      w(`<span ${g}>✓  CORRECT — Flag ${f.n}: ${f.name}</span>`);
      w(`<span style="color:var(--color-text-faint)">${window._ctfFound.size}/5 flags found. ${window._ctfFound.size === 5 ? '🎉 All flags captured!' : 'Keep going...'}</span>`);
    } else {
      w(`<span ${r}>✗  Wrong flag. Keep looking.</span>`);
    }
  },

  scoreboard() {
    const found = window._ctfFound || new Set();
    const all = [
      { n:1, name:'Binary Strings',      flag:'FLAG{str1ngs_4r3_y0ur_fr13nd}' },
      { n:2, name:'Hidden Files',         flag:'FLAG{d0tf1l3s_n3v3r_l13}' },
      { n:3, name:'Binary Protections',   flag:'FLAG{ch3cks3c_pr0t3ct10ns}' },
      { n:4, name:'Section Headers',      flag:'FLAG{3lf_s3ct10n_hunt3r}' },
      { n:5, name:'Classified Directory', flag:'FLAG{gh0st_1n_th3_h4l}' },
    { n:6, name:'Kernel Dungeon (bonus ⚔️)', flag:'FLAG{k3rn3l_dungeon_master}' },
    ];
    const g = `style="color:var(--color-gold)"`;
    const f2 = `style="color:var(--color-text-faint)"`;
    const p = `style="color:var(--color-primary)"`;
    w(`<span ${g}>Scoreboard — ${Math.min(found.size,5)}/5 flags${found.size>=6?' + bonus ⚔️':''}</span>`);
    for (const entry of all) {
      const done = found.has(entry.flag);
      w(`  ${done ? '<span style="color:var(--color-green)">✓' : '<span style="color:var(--color-magenta)">○'} Flag ${entry.n}: ${entry.name}</span>`);
    }
    if (found.size === 5) {
      w(``);
      w(`<span ${g}>All flags captured. You'd fit in at CACTILab.</span>`);
    }
  },

  // ── FLIP COMMAND ─────────────────────────────────────────────
};
