// Interest and hobby tags on the about panel. An interest tag shows which
// project it shows up in, with a button that opens that entry on the
// journey panel; a hobby tag just lights up and bounces its emoji.

import { openEntry, entryTitle } from './journey.js';

const SUMMARY = {
  aclab: 'video-language model benchmarking (MotionBlind).',
  cactilab: 'agentic code generation with LLM orchestration.',
  escalion: 'a Rust game engine built from scratch.',
};

export function initInterests() {
  const note = document.getElementById('interest-note');
  const interests = document.querySelectorAll('.about-tag[data-related]');

  interests.forEach(tag => tag.addEventListener('click', () => {
    const on = tag.getAttribute('aria-pressed') !== 'true';
    interests.forEach(t => t.setAttribute('aria-pressed', String(on && t === tag)));
    if (!on) {
      note.textContent = 'Pick an interest to see where it shows up in my work.';
      return;
    }
    const key = tag.dataset.related;
    note.innerHTML = `<strong>${tag.textContent}</strong> → ${entryTitle(key)}: ${SUMMARY[key]}<br>`
      + `<button type="button" class="run-btn" data-open-project="${key}">Open in Journey →</button>`;
  }));

  note.addEventListener('click', e => {
    const btn = e.target.closest('[data-open-project]');
    if (!btn) return;
    location.hash = 'journey';
    // showPanel scrolls to the top; then open the entry and bring it into view.
    setTimeout(() => openEntry(btn.dataset.openProject), 350);
  });

  document.querySelectorAll('.about-tag.hobby').forEach(tag => {
    tag.addEventListener('click', () => {
      tag.setAttribute('aria-pressed', String(tag.getAttribute('aria-pressed') !== 'true'));
      tag.classList.remove('pop');
      void tag.offsetWidth; // restart the animation on repeat clicks
      tag.classList.add('pop');
    });
    tag.addEventListener('animationend', () => tag.classList.remove('pop'));
  });
}
