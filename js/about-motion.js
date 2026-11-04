// Gives the About panel some life: its sections and cards ease in as they scroll
// into view (staggered), and cards get the same pointer spotlight and press feedback
// as the Journey entries. Content is never hidden when motion is reduced or
// IntersectionObserver is missing (motion.js falls back to showing everything).

import { reveal, spotlight } from './motion.js';

export function initAboutMotion() {
  const panel = document.getElementById('panel-about');
  if (!panel) return;
  const targets = panel.querySelectorAll('.info-tower, .deck, .deck-card, .about-extra, .explore-btn');
  targets.forEach((el, i) => { el.classList.add('reveal', 'about-live'); el.style.setProperty('--i', String(i % 4)); });
  // Reveal is a transition on opacity/transform; keep hover lifts fast by dropping the delay once shown.
  reveal(targets);
  spotlight(panel, '.about-live');
  panel.addEventListener('transitionend', (e) => {
    if (e.target.classList?.contains('about-live') && e.propertyName === 'opacity') e.target.style.transitionDelay = '0ms';
  });
}
