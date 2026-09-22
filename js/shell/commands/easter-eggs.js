// Commands hidden behind cheat mode (the konami code or the "Cheat code" button).

import { w, wErr } from '../output.js';
import { createDungeonState } from '../dungeon/world.js';
import { printDungeonIntro } from '../dungeon/intro.js';
import { dgLook } from '../dungeon/engine.js';

export const easterEggCommands = {
  flip() {
    if (!window._cheatMode) { wErr('flip: permission denied. activate cheat code first.'); return; }
    const body = document.body;
    const flipped = body.style.transform === 'rotate(180deg)';
    body.style.transform = flipped ? '' : 'rotate(180deg)';
    body.style.transition = 'transform .6s ease';
    w(flipped
      ? `<span style="color:var(--color-green)">right-side up. welcome back.</span>`
      : `<span style="color:var(--color-magenta)">flipped. type <span style="color:var(--color-green)">flip</span> again to undo.</span>`
    );
  },

  dungeon() {
    if (!window._cheatMode) { wErr('dungeon: permission denied. activate cheat code first.'); return; }
    if (window._dg && window._dg.active) {
      w(`<span style="color:var(--color-text-faint)">Already in dungeon. Type <span style="color:var(--color-green)">quit</span> to exit.</span>`);
      return;
    }
    window._dg = createDungeonState();
    printDungeonIntro();
    dgLook();
    window._dgMode = true; // repl now routes input to dgCmd
  }
};
