// Entry point. Each feature module owns its own DOM lookups and exports an
// `init*` function; this file only decides what starts up and in what order.
// Load order below mirrors the original single-file script.

import { initTheme } from './theme.js';
import { tickBoot } from './boot-sequence.js';
import { initRepl } from './shell/repl.js';
import { initPanels } from './panels.js';
import { initCtfPanel } from './ctf/panel.js';
import { updatePromptLabel } from './shell/state.js';
import { printBanner } from './shell/banner.js';
import { initProjects } from './projects.js';
import { initKonami } from './konami.js';

initTheme();
tickBoot();

initRepl();
initPanels();
initCtfPanel();

updatePromptLabel();
printBanner();

initProjects();
initKonami();
