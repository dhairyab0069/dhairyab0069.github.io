// Entry point. Each feature module owns its own DOM lookups and exports an
// `init*` function; this file only decides what starts up and in what order.
// Load order below mirrors the original single-file script.

import { initTheme } from './theme.js';
import { tickBoot } from './boot-sequence.js';
import { initPanels } from './panels.js';
import { initCtfPanel } from './ctf/panel.js';
import { initProjects } from './projects.js';
import { initKonami } from './konami.js';
import { initPublications } from './publications.js';
import { initTerminalEmbed } from './terminal-embed.js';

initTheme();
tickBoot();

initPanels();
initCtfPanel();
initTerminalEmbed();

initProjects();
initKonami();
initPublications();
