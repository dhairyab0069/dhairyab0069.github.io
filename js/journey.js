// The Journey panel: one vertical line running down the middle of the page, with a
// point on it wherever something happened. Chapters (school, university, startups,
// the masters, what is planned) are labelled stops on the line; each point holds the
// courses, projects and roles from that moment, listed compactly. Tap an item to open
// its details. Everything is rendered from data/journey.json, in the order it has
// there, so a new point is a data edit. Dates are optional and shown only when known.

import { reveal, trackProgress, countUp, scrollToEl } from './motion.js';
import { progress } from './progress.js';

const DATA_URL = './data/journey.json';
const KINDS = { course: 'Course', research: 'Research', project: 'Project', role: 'Role', goal: 'Goal' };
const STATUS_LABEL = { done: 'Completed', current: 'In progress', planned: 'Planned' };

const timeline = document.getElementById('journey-timeline');
const filters = document.getElementById('journey-filters');
const stats = document.getElementById('journey-stats');
const tracker = document.getElementById('journey-tracker');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const items = new Map(); // id -> item data

export const entryTitle = (id) => (items.has(id) ? items.get(id).title : id);

function renderItem(it, index) {
  const meta = [it.code].filter(Boolean).map(esc).join(' · ');
  const links = Object.entries(it.links || {})
    .map(([label, href]) => `<a class="run-btn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('');
  const tags = (it.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
  const expandable = Boolean(it.detail || links || tags);
  const head = `<span class="jt-kind" aria-hidden="true"></span>
      <span class="jt-text">
        <span class="jt-title">${esc(it.title)}${meta ? ` <small>${meta}</small>` : ''}</span>
        ${it.summary ? `<span class="jt-summary">${esc(it.summary)}</span>` : ''}
      </span>`;
  const body = expandable
    ? `<button class="jt-head" type="button" aria-expanded="false" aria-controls="jt-${esc(it.id)}-detail">${head}<span class="jt-caret" aria-hidden="true"></span></button>
       <div class="jt-detail" id="jt-${esc(it.id)}-detail" inert><div class="jt-detail-inner">
         ${it.detail ? `<p>${esc(it.detail)}</p>` : ''}${tags ? `<div class="chips">${tags}</div>` : ''}${links ? `<div class="jt-links">${links}</div>` : ''}
       </div></div>`
    : `<div class="jt-head jt-head--static">${head}</div>`;
  return `<li class="jt-item" data-kind="${esc(it.kind)}" id="jt-${esc(it.id)}" style="--n:${index}">${body}</li>`;
}

// Points alternate sides of the line, continuing across chapters.
function renderNode(n, side) {
  return `<div class="jt-node reveal" data-side="${side}" id="nd-${esc(n.id)}">
    <span class="jt-when">${esc(n.when || '')}</span>
    <span class="jt-dot" aria-hidden="true"></span>
    <ul class="jt-items">${n.items.map((it, i) => renderItem(it, i)).join('')}</ul>
  </div>`;
}

function renderChapter(c, state) {
  const status = c.status || (c.future ? 'planned' : 'done');
  const cls = ['jt-chapter', c.future && 'jt-chapter--future', c.branch && 'jt-chapter--branch'].filter(Boolean).join(' ');
  const nodes = c.nodes.map(n => renderNode(n, state.side++ % 2 === 0 ? 'r' : 'l')).join('');
  return `<section class="${cls}" id="ch-${esc(c.id)}" data-status="${status}" aria-labelledby="ch-${esc(c.id)}-title">
    <header class="jt-mark reveal">
      <small>${esc(c.note || '')}</small>
      <h3 id="ch-${esc(c.id)}-title">${esc(c.name)}</h3>
      <span>${esc(c.place || '')}</span>
    </header>
    ${nodes}
  </section>`;
}

function renderTracker(chapters) {
  const p = progress(chapters);
  const steps = chapters.map(c => {
    const st = c.status || (c.future ? 'planned' : 'done');
    return `<li class="jr-step ${st}${c.branch ? ' optional' : ''}"><a href="#ch-${esc(c.id)}" data-chapter="${esc(c.id)}"><span class="jr-dot" aria-hidden="true"></span><span class="jr-step-name">${esc(c.name)}</span><small>${c.branch ? 'Optional' : STATUS_LABEL[st]}</small></a></li>`;
  }).join('');
  tracker.innerHTML = `
    <div class="jr-tracker-head">
      <strong>Journey progress</strong>
      <span><b data-to="${p.reached}">0</b> of ${p.total} stages reached · <b data-to="${p.completed}">0</b> completed${p.optional ? ` · ${p.optional} optional` : ''}</span>
    </div>
    <div class="jr-bar" role="progressbar" aria-label="Stages reached" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.reached}">
      <span class="jr-bar-reached" style="--w:${p.reachedPct}%"></span>
      <span class="jr-bar-done" style="--w:${p.completedPct}%"></span>
    </div>
    <ol class="jr-steps">${steps}</ol>`;
}

function setExpanded(item, open) {
  const head = item.querySelector('button.jt-head');
  const detail = item.querySelector('.jt-detail');
  if (!head) return;
  head.setAttribute('aria-expanded', String(open));
  item.classList.toggle('open', open);
  if (open) detail.removeAttribute('inert'); else detail.setAttribute('inert', '');
}

function applyFilter(kind) {
  filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
  timeline.querySelectorAll('.jt-item').forEach(el => { el.hidden = !(kind === 'all' || el.dataset.kind === kind); });
  // A point with nothing left to show disappears too, line and all.
  timeline.querySelectorAll('.jt-node').forEach(n => { n.hidden = !n.querySelector('.jt-item:not([hidden])'); });
}

/** Opens an item from elsewhere (the interest tags on About), clearing any filter. */
export function openEntry(id) {
  const el = document.getElementById(`jt-${id}`);
  if (!el) return;
  applyFilter('all');
  setExpanded(el, true);
  scrollToEl(el, 'center');
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

function initScrollSpy() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(seen => {
    seen.forEach(s => {
      if (!s.isIntersecting) return;
      const id = s.target.id.replace('ch-', '');
      tracker?.querySelectorAll('a[data-chapter]').forEach(a => a.classList.toggle('active', a.dataset.chapter === id));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  timeline.querySelectorAll('.jt-chapter').forEach(c => io.observe(c));
}

export async function initJourney() {
  if (!timeline) return;
  let data;
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch {
    timeline.insertAdjacentHTML('beforeend', '<p class="lede">The journey could not be loaded. Try reloading the page.</p>');
    return;
  }
  const chapters = data.chapters || [];
  chapters.forEach(c => c.nodes.forEach(n => n.items.forEach(i => items.set(i.id, i))));

  const counts = { chapters: chapters.filter(c => !c.future).length, course: 0, research: 0, project: 0, role: 0, goal: 0 };
  items.forEach(i => { if (i.kind in counts) counts[i.kind]++; });

  if (tracker) renderTracker(chapters);

  stats.innerHTML = [
    ['chapters', 'chapters'], ['course', 'courses'], ['research', 'research'], ['project', 'projects'], ['role', 'roles'], ['goal', 'goals ahead'],
  ].filter(([k]) => counts[k]).map(([k, label]) => `<div class="jr-stat"><strong data-to="${counts[k]}">0</strong><span>${label}</span></div>`).join('');

  filters.innerHTML = [['all', 'All'], ...Object.entries(KINDS)]
    .filter(([k]) => k === 'all' || counts[k])
    .map(([k, label]) => `<button type="button" data-kind="${k}" aria-pressed="${k === 'all'}">${label}</button>`).join('');

  const state = { side: 0 };
  timeline.insertAdjacentHTML('beforeend', `${chapters.map(c => renderChapter(c, state)).join('')}<div class="jt-arrow" aria-hidden="true"><span>and onward</span></div>`);
  const spine = timeline.querySelector('.jt-spine');

  // Open and close items; a second tap mid-animation just reverses it.
  timeline.addEventListener('click', e => {
    const head = e.target.closest('button.jt-head');
    if (head) setExpanded(head.closest('.jt-item'), head.getAttribute('aria-expanded') !== 'true');
  });
  filters.addEventListener('click', e => { const b = e.target.closest('button'); if (b) applyFilter(b.dataset.kind); });
  tracker?.addEventListener('click', e => {
    const a = e.target.closest('a[data-chapter]');
    if (!a) return;
    e.preventDefault(); // the hash belongs to the dock; scroll instead of navigating
    scrollToEl(document.getElementById(`ch-${a.dataset.chapter}`), 'start');
  });

  initScrollSpy();
  const update = trackProgress(timeline, spine);

  // Points and numbers animate when the panel is actually on screen.
  reveal(timeline.querySelectorAll('.reveal'));
  const panel = document.getElementById('panel-journey');
  let counted = false;
  const countWhenVisible = () => {
    update();
    if (counted || panel.hidden) return;
    counted = true;
    stats.querySelectorAll('strong').forEach(el => countUp(el, Number(el.dataset.to)));
    tracker?.querySelectorAll('b[data-to]').forEach(el => countUp(el, Number(el.dataset.to)));
    tracker?.classList.add('go'); // the bar fills once the panel is on screen
  };
  // The points pop up again each time the Journey page is opened, not only the first
  // time, so the animation is never missed.
  const replay = () => {
    timeline.querySelectorAll('.reveal.in').forEach(el => el.classList.remove('in'));
    reveal(timeline.querySelectorAll('.reveal'));
  };
  new MutationObserver(() => { if (!panel.hidden && counted) replay(); countWhenVisible(); }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  countWhenVisible();
}
