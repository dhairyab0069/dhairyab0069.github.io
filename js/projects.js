// The Projects panel: a small, curated showcase rendered from data/projects.json, in the
// order it has there, so adding a project is a data edit.
//
//   spotlight   a swipeable strip of the featured projects
//   deck        filter buttons (All, Apps, Research, ...) and instant search over a grid of
//               cards that lean toward the pointer, glow where the pointer is and press in
//   detail      a card opens into a dialog; the picture moves from the card to the dialog
//               (a shared-element View Transition), left and right arrows step through
//               the projects, Esc closes, and the address bar follows (#projects/himawari)
//
// Design choices:
// - The detail view is built on first use, not at load. Cards and slides are plain HTML;
//   the tilt and the glow come from the shared helpers (about-motion.js tilt loop, the
//   spotlight in motion.js), so there is no new animation loop. The ambient drift is two
//   CSS animations that stop by themselves while the panel is hidden.
// - Motion follows the Motion button and the system setting: with motion off nothing
//   morphs, tilts or pops; panels, filters and the detail view just switch.
// - Sounds go through sound.js: pointer presses are mapped in SOUND_MAP, and this module
//   plays the cues that come from the keyboard or from hovering.
// - The rendering functions are pure and DOM-free so a node script can check the text
//   that ends up on the page (.github/scripts/check-projects.mjs).

import { spotlight, prefersReducedMotion, countUp, scrollToEl } from './motion.js';
import { initTilt } from './about-motion.js';
import { play } from './sound.js';

const DATA_URL = './data/projects.json';
const HOVER_DWELL_MS = 45; // a hover sound only after the pointer rests on a card a moment

// ---- pure helpers and renderers (no DOM) ------------------------------------

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Everything a search looks at, lower-cased. */
export const searchText = (p) => [p.title, p.kind, p.tagline, p.what, p.interesting, p.status?.label, ...(p.stack || []), ...(p.tags || []), ...(p.groups || [])]
  .filter(Boolean).join(' ').toLowerCase();

/** The projects in `group` (or 'all') whose text contains every word of `query`. */
export function filterProjects(projects, group = 'all', query = '') {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return projects.filter(p => (group === 'all' || (p.groups || []).includes(group)) && words.every(w => searchText(p).includes(w)));
}

const isInternal = (href) => href.startsWith('#') || href.startsWith('/');

export function linkHtml(l, primary) {
  const ext = !isInternal(l.href);
  return `<a class="run-btn${primary ? ' pj-primary' : ''}" href="${esc(l.href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}${ext ? ' ↗' : ' →'}</a>`;
}

export function linksHtml(p) {
  const links = p.links || [];
  if (!links.length) return '<p class="pj-note">No public page or repository to link.</p>';
  let first = true;
  return `<div class="pj-links">${links.map(l => { const primary = first && l.kind === 'live'; first = false; return linkHtml(l, primary); }).join('')}</div>`;
}

const statusHtml = (p) => `<span class="pj-status" data-tone="${esc(p.status?.tone || 'done')}">${esc(p.status?.label || '')}</span>`;
const chips = (list) => (list || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');

export function cardHtml(p, i = 0) {
  return `<li class="pj-item" data-id="${esc(p.id)}" style="--i:${i};--hue:${Number(p.hue) || 200}">
    <button type="button" class="pj-card tilt has-glow" data-id="${esc(p.id)}" aria-haspopup="dialog">
      <span class="glow" aria-hidden="true"></span>
      <span class="pj-art"><img src="${esc(p.image.src)}" alt="" width="720" height="378" loading="lazy" decoding="async"><span class="pj-shine" aria-hidden="true"></span></span>
      <span class="pj-badge">${statusHtml(p)}</span>
      <span class="pj-body">
        <span class="pj-kicker"><span class="pj-kind">${esc(p.kind)}${p.when ? ` · ${esc(p.when)}` : ''}</span></span>
        <span class="pj-title">${esc(p.title)}</span>
        <span class="pj-tag">${esc(p.tagline)}</span>
        <span class="pj-chips">${(p.tags || []).slice(0, 3).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</span>
      </span>
    </button>
  </li>`;
}

export function slideHtml(p, i, n) {
  const live = (p.links || []).find(l => l.kind === 'live');
  return `<div class="pj-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}: ${esc(p.title)}" data-id="${esc(p.id)}" style="--hue:${Number(p.hue) || 200}">
    <span class="pj-slide-art"><img src="${esc(p.image.src)}" alt="" width="720" height="378" loading="lazy" decoding="async"></span>
    <div class="pj-slide-body">
      <p class="pj-kicker"><span class="pj-kind">Spotlight · ${esc(p.kind)}</span>${statusHtml(p)}</p>
      <h3>${esc(p.title)}</h3>
      <p class="pj-slide-tag">${esc(p.tagline)}</p>
      <div class="pj-links"><button type="button" class="pj-open" data-id="${esc(p.id)}" aria-haspopup="dialog">Open details</button>${live ? linkHtml(live, false) : ''}</div>
    </div>
  </div>`;
}

export function detailHtml(p, index, total) {
  const facts = (p.facts || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  return `<div class="pj-d-grid" style="--hue:${Number(p.hue) || 200}">
    <div class="pj-d-side">
      <div class="pj-d-art"><img src="${esc(p.image.src)}" alt="${esc(p.image.alt || '')}" width="720" height="378" decoding="async"></div>
      ${facts ? `<dl class="pj-facts">${facts}</dl>` : ''}
    </div>
    <div class="pj-d-main">
      <p class="pj-kicker"><span class="pj-kind">${esc(p.kind)}${p.when ? ` · ${esc(p.when)}` : ''}</span>${statusHtml(p)}</p>
      <h3 id="pj-d-title">${esc(p.title)}</h3>
      <p class="pj-d-tag">${esc(p.tagline)}</p>
      <h4>What it is</h4>
      <p>${esc(p.what)}</p>
      <h4>What is interesting</h4>
      <p>${esc(p.interesting)}</p>
      ${p.stack?.length ? `<h4>Stack</h4><div class="chips">${chips(p.stack)}</div>` : ''}
      ${p.tags?.length ? `<h4>Tags</h4><div class="chips">${chips(p.tags)}</div>` : ''}
      ${linksHtml(p)}
    </div>
  </div>`;
}

/** The count line under the filters, for screen readers and as a quiet status for everyone. */
export function countText(shown, total, groupLabel, query) {
  if (!shown) return 'No projects match.';
  if (shown === total) return `${total} projects`;
  const what = [groupLabel && groupLabel !== 'All' ? groupLabel : '', query ? `“${query}”` : ''].filter(Boolean).join(' · ');
  return `${shown} of ${total} projects${what ? ` · ${what}` : ''}`;
}

// ---- the panel -------------------------------------------------------------

const root = typeof document === 'undefined' ? null : document.documentElement;

export async function initProjects() {
  const panel = document.getElementById('panel-projects');
  const grid = document.getElementById('projects-grid');
  if (!panel || !grid) return;
  const filtersEl = document.getElementById('projects-filters');
  const searchEl = document.getElementById('projects-search');
  const countEl = document.getElementById('projects-count');
  const emptyEl = document.getElementById('projects-empty');
  const statsEl = document.getElementById('projects-stats');
  const spotEl = document.getElementById('projects-spot');

  let data;
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch {
    grid.insertAdjacentHTML('beforebegin', '<p class="lede">The projects could not be loaded. Try reloading the page.</p>');
    return;
  }
  const projects = data.projects || [];
  const groups = data.groups || [];
  const byId = new Map(projects.map(p => [p.id, p]));
  const groupLabel = (id) => (id === 'all' ? 'All' : groups.find(g => g.id === id)?.label || id);

  // ---- render the static parts
  grid.innerHTML = projects.map((p, i) => cardHtml(p, i)).join('');
  const items = [...grid.querySelectorAll('.pj-item')];
  const itemOf = new Map(items.map(el => [el.dataset.id, el]));

  const counts = { project: projects.filter(p => p.kind === 'Project').length, research: projects.filter(p => p.kind === 'Research').length, live: projects.filter(p => (p.links || []).some(l => l.kind === 'live')).length };
  statsEl.innerHTML = [['project', 'projects'], ['research', 'research'], ['live', 'with a page']]
    .map(([k, label]) => `<div class="jr-stat"><strong data-to="${counts[k]}">0</strong><span>${label}</span></div>`).join('');

  filtersEl.innerHTML = [{ id: 'all', label: 'All' }, ...groups].map(g => {
    const n = g.id === 'all' ? projects.length : projects.filter(p => p.groups.includes(g.id)).length;
    return n ? `<button type="button" data-group="${esc(g.id)}" aria-pressed="${g.id === 'all'}">${esc(g.label)} <span class="pj-n">${n}</span></button>` : '';
  }).join('');

  // ---- spotlight: a scroll-snap strip, so swiping works with no code
  const featured = projects.filter(p => p.featured);
  const state = { group: 'all', query: '' };
  if (featured.length) {
    spotEl.innerHTML = `<div class="pj-track" tabindex="-1">${featured.map((p, i) => slideHtml(p, i, featured.length)).join('')}</div>
      <div class="pj-spot-ctl">
        <button type="button" class="pj-spot-btn" data-dir="-1" aria-label="Previous featured project"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
        <div class="pj-dots">${featured.map((p, i) => `<button type="button" data-i="${i}" aria-label="Show ${esc(p.title)}"></button>`).join('')}</div>
        <button type="button" class="pj-spot-btn" data-dir="1" aria-label="Next featured project"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
      </div>`;
    const track = spotEl.querySelector('.pj-track');
    const slides = [...track.children];
    const dots = [...spotEl.querySelectorAll('.pj-dots button')];
    let active = -1;
    const mark = () => {
      const i = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
      if (i === active) return;
      active = i;
      slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.toggleAttribute('inert', k !== i); });
      dots.forEach((d, k) => { if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    };
    const go = (i) => {
      const k = (i + slides.length) % slides.length;
      track.scrollTo({ left: k * track.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    };
    let queued = false;
    track.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; mark(); }); } }, { passive: true });
    window.addEventListener('resize', () => { track.scrollLeft = Math.max(0, active) * track.clientWidth; });
    spotEl.addEventListener('click', (e) => {
      const b = e.target.closest('.pj-spot-btn, .pj-dots button');
      if (b) go(b.dataset.dir ? active + Number(b.dataset.dir) : Number(b.dataset.i));
      const open = e.target.closest('.pj-open');
      if (open) { if (e.detail === 0) play('open'); openDetail(open.dataset.id, { opener: open, art: open.closest('.pj-slide')?.querySelector('.pj-slide-art') }); }
    });
    mark();
  } else {
    spotEl.hidden = true;
  }

  // ---- filters and search
  const canVT = () => typeof document.startViewTransition === 'function' && !prefersReducedMotion();
  const visibleIds = () => projects.filter(p => !itemOf.get(p.id).hidden).map(p => p.id);

  function pop() {
    if (prefersReducedMotion()) return;
    let n = 0;
    items.forEach(el => {
      if (el.hidden) return;
      el.style.setProperty('--d', `${Math.min(n++, 10) * 45}ms`);
      el.classList.remove('pj-pop'); void el.offsetWidth; el.classList.add('pj-pop');
    });
  }
  items.forEach(el => el.addEventListener('animationend', () => el.classList.remove('pj-pop')));

  function apply({ animate = false } = {}) {
    const hit = new Set(filterProjects(projects, state.group, state.query).map(p => p.id));
    const run = () => {
      items.forEach(el => { el.hidden = !hit.has(el.dataset.id); });
      filtersEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.group === state.group)));
      countEl.textContent = countText(hit.size, projects.length, groupLabel(state.group), state.query.trim());
      emptyEl.hidden = hit.size > 0;
    };
    if (animate && canVT()) {
      // Cards that stay glide to their new places; the others fade out and in.
      items.forEach(el => { el.style.viewTransitionName = `pj-${el.dataset.id}`; });
      root.classList.add('pj-vt-filter');
      const vt = document.startViewTransition(run);
      vt.finished.finally(() => { root.classList.remove('pj-vt-filter'); items.forEach(el => { el.style.viewTransitionName = ''; }); });
    } else {
      run();
      if (animate) pop();
    }
  }
  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.dataset.group === state.group) return;
    state.group = b.dataset.group;
    apply({ animate: true });
  });
  searchEl.addEventListener('input', () => { state.query = searchEl.value; apply(); });
  searchEl.addEventListener('keydown', (e) => { if (e.key === 'Escape' && searchEl.value) { e.stopPropagation(); searchEl.value = ''; state.query = ''; apply(); } });
  apply();

  // ---- the pointer: tilt (shared loop), glow and specular light, and a hover sound
  initTilt(panel, '.pj-card');
  spotlight(panel, '.pj-card');
  let dwell = 0;
  grid.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const card = e.target.closest('.pj-card');
    if (!card || card.contains(e.relatedTarget)) return;
    clearTimeout(dwell);
    dwell = setTimeout(() => play('tap'), HOVER_DWELL_MS);
  });
  grid.addEventListener('pointerout', (e) => { if (!e.target.closest('.pj-card')?.contains(e.relatedTarget)) clearTimeout(dwell); });

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.pj-card');
    if (!card) return;
    if (e.detail === 0) play('open'); // from the keyboard; a pointer press already sounded
    openDetail(card.dataset.id, { opener: card, art: card.querySelector('.pj-art') });
  });

  // ---- the detail view, built on first use
  let overlay = null;
  let dialog = null;
  let body = null;
  let live = null;
  let openId = null;
  let opener = null;
  let pushed = false;
  let closing = false;

  const hashFor = (id) => `#projects/${id}`;
  const navList = () => { const v = visibleIds(); return v.includes(openId) ? v : projects.map(p => p.id); };

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'pj-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `<div class="pj-backdrop"></div>
      <div class="pj-dialog" role="dialog" aria-modal="true" aria-labelledby="pj-d-title" tabindex="-1">
        <div class="chrome">
          <div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="titlebar" id="pj-d-path">/projects</div>
          <button type="button" class="pj-close" aria-label="Close project details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        </div>
        <div class="pj-d-scroll"><div class="pj-d-body"></div></div>
        <div class="pj-d-nav">
          <button type="button" class="pj-step" data-dir="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg><span>Previous</span></button>
          <span class="pj-d-pos" aria-hidden="true"></span>
          <button type="button" class="pj-step" data-dir="1"><span>Next</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
        </div>
        <p class="pj-hint" aria-hidden="true">Left and right arrows step through the projects. Esc closes.</p>
        <p class="pj-sr" role="status"></p>
      </div>`;
    document.body.appendChild(overlay);
    dialog = overlay.querySelector('.pj-dialog');
    body = overlay.querySelector('.pj-d-body');
    live = overlay.querySelector('.pj-sr');
    overlay.addEventListener('click', (e) => {
      if (e.target.closest('.pj-close')) closeDetail();
      else if (e.target.classList.contains('pj-backdrop')) { play('close'); closeDetail(); }
      else if (e.target.closest('.pj-step')) { if (e.detail === 0) play('nav'); step(Number(e.target.closest('.pj-step').dataset.dir)); }
      else if (e.target.closest('a[href^="#"]')) closeDetail({ instant: true, keepHash: true }); // going to another panel
    });
  }

  function render(id, dir = 0) {
    const p = byId.get(id);
    const list = navList();
    const at = list.indexOf(id);
    openId = id;
    body.innerHTML = detailHtml(p, at, list.length);
    body.dataset.dir = dir > 0 ? 'fwd' : dir < 0 ? 'back' : '';
    body.classList.remove('swap'); void body.offsetWidth; if (dir && !prefersReducedMotion()) body.classList.add('swap');
    overlay.querySelector('#pj-d-path').textContent = `/projects/${p.id}`;
    overlay.querySelector('.pj-d-pos').textContent = `${at + 1} of ${list.length}`;
    overlay.querySelector('[data-dir="-1"]').disabled = list.length < 2;
    overlay.querySelector('[data-dir="1"]').disabled = list.length < 2;
    live.textContent = `${p.title}, ${at + 1} of ${list.length}`;
    dialog.scrollTop = 0;
    overlay.querySelector('.pj-d-scroll').scrollTop = 0;
  }

  function step(dir) {
    const list = navList();
    const next = list[(list.indexOf(openId) + dir + list.length) % list.length];
    render(next, dir);
    history.replaceState(history.state, '', hashFor(next));
  }

  const lock = (on) => {
    document.querySelector('.shell')?.toggleAttribute('inert', on);
    root.classList.toggle('pj-lock', on);
  };

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); play('close'); closeDetail(); }
    else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.altKey && !e.metaKey && !e.ctrlKey && !e.target.closest?.('input, textarea')) {
      e.preventDefault(); play('nav'); step(e.key === 'ArrowRight' ? 1 : -1);
    }
  }

  // Runs `change` inside a View Transition when the browser has them and motion is on.
  function transition(cls, change, after = () => {}) {
    if (!canVT()) { change(); after(); return; }
    root.classList.add(cls);
    const vt = document.startViewTransition(change);
    vt.finished.finally(() => { root.classList.remove(cls); after(); });
  }

  function openDetail(id, { opener: from = null, art = null, instant = false, fromHash = false } = {}) {
    if (!byId.has(id)) return;
    if (!overlay) build();
    if (openId && !overlay.hidden) { render(id); return; }
    opener = from || document.activeElement;
    const show = () => {
      if (art) art.style.viewTransitionName = '';
      render(id);
      overlay.hidden = false;
      lock(true);
      document.addEventListener('keydown', onKey);
      dialog.focus({ preventScroll: true });
    };
    if (!fromHash) { history.pushState({ pj: id }, '', hashFor(id)); pushed = true; }
    if (art && !instant && canVT()) {
      art.style.viewTransitionName = 'pj-art'; // the picture travels from here to the dialog
      transition('pj-vt-open', show);
    } else {
      show();
      if (!prefersReducedMotion()) overlay.classList.add('pj-fade');
    }
  }

  function closeDetail({ instant = false, keepHash = false } = {}) {
    if (!overlay || overlay.hidden || closing) return;
    closing = true;
    const id = openId;
    const card = itemOf.get(id);
    const back = card && !card.hidden ? card : null;
    const done = () => {
      overlay.hidden = true;
      overlay.classList.remove('pj-fade');
      lock(false);
      document.removeEventListener('keydown', onKey);
      const target = back?.querySelector('.pj-card') || (opener?.isConnected ? opener : null);
      target?.focus({ preventScroll: true });
      openId = null;
      closing = false;
    };
    if (!keepHash) {
      if (pushed) { pushed = false; history.back(); } else history.replaceState(null, '', '#projects');
    }
    if (instant || !back || !canVT()) { done(); return; }
    // The picture flies back to its card, which may have been scrolled away or filtered since.
    if (back.getBoundingClientRect().bottom < 0 || back.getBoundingClientRect().top > innerHeight) back.scrollIntoView({ block: 'center', behavior: 'instant' });
    const art = back.querySelector('.pj-art');
    transition('pj-vt-close', () => { art.style.viewTransitionName = 'pj-art'; done(); }, () => { art.style.viewTransitionName = ''; });
  }

  // Deep links and the Back button: #projects/<id> opens a project, #projects closes it.
  const fromHash = () => {
    const [name, id] = location.hash.slice(1).split('/');
    if (name === 'projects' && id && byId.has(id)) {
      if (overlay && !overlay.hidden) { if (openId !== id) render(id); return; }
      whenVisible(() => openDetail(id, { fromHash: true, instant: true }));
    } else if (overlay && !overlay.hidden) {
      pushed = false;
      closeDetail({ instant: name !== 'projects', keepHash: true });
    }
  };
  function whenVisible(fn) {
    if (!panel.hidden) { fn(); return; }
    const mo = new MutationObserver(() => { if (!panel.hidden) { mo.disconnect(); requestAnimationFrame(fn); } });
    mo.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  }
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('popstate', fromHash);
  fromHash();

  // ---- entrance: numbers count up and cards pop each time the panel is shown
  let first = true;
  const shown = () => {
    if (panel.hidden) { if (overlay && !overlay.hidden) closeDetail({ instant: true, keepHash: true }); return; }
    pop();
    if (first) { first = false; statsEl.querySelectorAll('strong').forEach(el => countUp(el, Number(el.dataset.to))); }
  };
  new MutationObserver(shown).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  shown();
  // Keep a card in view when it is focused from the keyboard in a long list.
  grid.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) { const r = e.target.getBoundingClientRect(); if (r.bottom > innerHeight - 90 || r.top < 70) scrollToEl(e.target, 'center'); } });
}
