// The Journey panel: school, research, projects, roles and coursework on one
// timeline, rendered from data/journey.json. Chapters (schools) run in order;
// entries keep the order they have in the JSON, so a new entry is just a data
// edit. Dates are optional and shown only when known.

import { reveal, trackProgress, spotlight, countUp, scrollToEl } from './motion.js';

const DATA_URL = './data/journey.json';
const KINDS = { course: 'Course', research: 'Research', project: 'Project', role: 'Role', goal: 'Goal' };

const timeline = document.getElementById('journey-timeline');
const rail = document.getElementById('journey-rail');
const filters = document.getElementById('journey-filters');
const stats = document.getElementById('journey-stats');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (t) => t.replace(/ \/\/ /g, ' · ');

const entries = new Map(); // id -> entry data

export const entryTitle = (id) => (entries.has(id) ? clean(entries.get(id).title) : id);

function renderEntry(e, index) {
  const meta = [e.code, e.period].filter(Boolean).map(esc).join(' · ');
  const links = Object.entries(e.links || {})
    .map(([label, href]) => `<a class="run-btn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('');
  const tags = (e.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
  const expandable = Boolean(e.detail || links);
  const head = `<span class="jr-kind">${KINDS[e.kind] || esc(e.kind)}</span>
      ${meta ? `<small class="jr-meta">${meta}</small>` : ''}
      <span class="jr-title">${esc(clean(e.title))}</span>
      ${e.summary ? `<span class="jr-summary">${esc(e.summary)}</span>` : ''}
      ${tags ? `<span class="chips">${tags}</span>` : ''}`;
  const body = expandable
    ? `<button class="jr-head" type="button" aria-expanded="false" aria-controls="jr-${esc(e.id)}-detail">${head}<span class="jr-caret" aria-hidden="true"></span></button>
       <div class="jr-detail" id="jr-${esc(e.id)}-detail" inert><div class="jr-detail-inner">
         ${e.detail ? `<p>${esc(e.detail)}</p>` : ''}${links ? `<div class="jr-links">${links}</div>` : ''}
       </div></div>`
    : `<div class="jr-head jr-head--static">${head}</div>`;
  return `<article class="jr-entry reveal" data-kind="${esc(e.kind)}" id="jr-${esc(e.id)}" style="--i:${index}">${body}</article>`;
}

function renderChapter(c) {
  const list = c.entries.map(renderEntry).join('');
  const count = c.entries.length;
  // Chapters still ahead are drawn dashed with a "planned" feel; a branch is an
  // optional detour off the main line (the postdoc, which may not happen).
  const cls = ['jr-chapter', c.future && 'jr-chapter--future', c.branch && 'jr-chapter--branch'].filter(Boolean).join(' ');
  return `<section class="${cls}" id="ch-${esc(c.id)}" aria-labelledby="ch-${esc(c.id)}-title">
    <div class="jr-node reveal" aria-hidden="true"></div>
    <header class="jr-chapter-head reveal">
      <small>${esc(c.note || '')}</small>
      <h3 id="ch-${esc(c.id)}-title">${esc(c.name)}</h3>
      <span>${esc(c.place || '')}${count && !c.future ? ` · ${count} ${count === 1 ? 'entry' : 'entries'}` : ''}</span>
    </header>
    <div class="jr-entries">${list}</div>
  </section>`;
}

function setExpanded(entry, open) {
  const head = entry.querySelector('button.jr-head');
  const detail = entry.querySelector('.jr-detail');
  if (!head) return;
  head.setAttribute('aria-expanded', String(open));
  entry.classList.toggle('open', open);
  if (open) detail.removeAttribute('inert'); else detail.setAttribute('inert', '');
}

function applyFilter(kind) {
  filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
  timeline.querySelectorAll('.jr-entry').forEach(el => {
    const show = kind === 'all' || el.dataset.kind === kind;
    const wasHidden = el.hidden;
    el.hidden = !show;
    if (show && wasHidden) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); }
  });
}

/** Opens an entry from elsewhere (the interest tags on About), clearing any filter. */
export function openEntry(id) {
  const el = document.getElementById(`jr-${id}`);
  if (!el) return;
  applyFilter('all');
  setExpanded(el, true);
  scrollToEl(el, 'center');
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

function initScrollSpy() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(items => {
    items.forEach(i => {
      if (!i.isIntersecting) return;
      const id = i.target.id.replace('ch-', '');
      rail.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.chapter === id));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  timeline.querySelectorAll('.jr-chapter').forEach(c => io.observe(c));
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
  chapters.forEach(c => c.entries.forEach(e => entries.set(e.id, e)));

  const all = [...entries.values()];
  const counts = { chapters: chapters.filter(c => !c.future).length, course: 0, research: 0, project: 0, role: 0, goal: 0 };
  all.forEach(e => { if (e.kind in counts) counts[e.kind]++; });

  stats.innerHTML = [
    ['chapters', 'schools'], ['course', 'courses'], ['research', 'research'], ['project', 'projects'], ['role', 'roles'], ['goal', 'goals ahead'],
  ].filter(([k]) => counts[k]).map(([k, label]) => `<div class="jr-stat"><strong data-to="${counts[k]}">0</strong><span>${label}</span></div>`).join('');

  rail.innerHTML = chapters.map(c => `<a href="#ch-${esc(c.id)}" data-chapter="${esc(c.id)}"${c.future ? ' class="future"' : ''}><small>${esc(c.note || '')}</small>${esc(c.name)}</a>`).join('');
  filters.innerHTML = [['all', 'All'], ...Object.entries(KINDS)]
    .filter(([k]) => k === 'all' || counts[k])
    .map(([k, label]) => `<button type="button" data-kind="${k}" aria-pressed="${k === 'all'}">${label}</button>`).join('');

  timeline.insertAdjacentHTML('beforeend', chapters.map(renderChapter).join(''));
  const spine = timeline.querySelector('.jr-spine');

  // Open and close entries; a second tap mid-animation just reverses it.
  timeline.addEventListener('click', e => {
    const head = e.target.closest('button.jr-head');
    if (head) setExpanded(head.closest('.jr-entry'), head.getAttribute('aria-expanded') !== 'true');
  });
  filters.addEventListener('click', e => { const b = e.target.closest('button'); if (b) applyFilter(b.dataset.kind); });
  rail.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault(); // the hash belongs to the dock; scroll instead of navigating
    scrollToEl(document.getElementById(`ch-${a.dataset.chapter}`), 'start');
  });

  spotlight(timeline, '.jr-entry');
  initScrollSpy();
  const update = trackProgress(timeline, spine);

  // Entries and numbers animate when the panel is actually on screen.
  reveal(timeline.querySelectorAll('.reveal'));
  const panel = document.getElementById('panel-journey');
  let counted = false;
  const countWhenVisible = () => {
    update();
    if (counted || panel.hidden) return;
    counted = true;
    stats.querySelectorAll('strong').forEach(el => countUp(el, Number(el.dataset.to)));
  };
  new MutationObserver(countWhenVisible).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  countWhenVisible();
}
