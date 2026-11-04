// Entry point. Each feature module owns its own DOM lookups and exports an
// `init*` function; this file only decides what starts up and in what order.
// Load order below mirrors the original single-file script.

import { initTheme } from './theme.js';
import { tickBoot } from './boot-sequence.js';
import { initPanels } from './panels.js';
import { initInterests } from './interests.js';
import { initKonami } from './konami.js';
import { initPublications } from './publications.js';
import { initJourney } from './journey.js';
import { initMlBackground } from './ml-bg.js';
import { initAboutMotion } from './about-motion.js';
import { initMotionToggle } from './motion.js';
import { initPageProgress } from './page-progress.js';
import { initWorkbench } from './workbench.js';
import { initTerminalEmbed } from './terminal-embed.js';

initTheme();
initMotionToggle();
tickBoot();

initPanels();
initTerminalEmbed();

initInterests();
initKonami();
initPublications();
initJourney();
initWorkbench();
initPageProgress();
initMlBackground();
initAboutMotion();
