// Dock navigation: shows one top-level panel at a time.

import { tickBoot } from './boot-sequence.js';

export function showPanel(name) {
  const panels = { about: 'panel-about', workbench: 'panel-workbench', mail: 'panel-mail' };
  Object.entries(panels).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = k === name ? '' : 'none';
  });
  document.querySelectorAll('.dock a').forEach(a => {
    a.classList.toggle('active', a.dataset.panel === name);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'about') tickBoot();
}

export function initPanels() {
  document.querySelectorAll('[data-panel]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); showPanel(a.dataset.panel); });
  });
}
