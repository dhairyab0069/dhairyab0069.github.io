// Dock navigation: shows one top-level panel at a time. The active panel is
// kept in the URL hash (#about, #workbench, #mail) so reload, deep links and
// the Back button all work.

import { tickBoot } from './boot-sequence.js';

const PANELS = { about: 'panel-about', workbench: 'panel-workbench', mail: 'panel-mail' };
const DEFAULT_PANEL = 'about';

const panelFromHash = () => {
  const name = location.hash.slice(1);
  return name in PANELS ? name : DEFAULT_PANEL;
};

export function showPanel(name, { focus = true } = {}) {
  Object.entries(PANELS).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) el.hidden = k !== name;
  });
  document.querySelectorAll('.dock a').forEach(a => {
    const active = a.dataset.panel === name;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Move focus to the new panel so keyboard and screen-reader users land on
  // its content instead of staying on the dock at the bottom of the page.
  if (focus) document.getElementById(PANELS[name])?.focus({ preventScroll: true });
  if (name === 'about') tickBoot();
}

export function initPanels() {
  // Buttons inside panels (e.g. "Workbench →") navigate the same way the dock does.
  document.querySelectorAll('button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => { location.hash = btn.dataset.panel; });
  });
  // React to panel hashes (and an empty hash, i.e. Back to the bare URL);
  // other fragments such as the #main skip link leave the current panel alone.
  window.addEventListener('hashchange', () => {
    const name = location.hash.slice(1);
    if (!name || name in PANELS) showPanel(panelFromHash());
  });
  showPanel(panelFromHash(), { focus: false });
}
