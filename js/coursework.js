// Coursework: rendered from data/coursework.json. Add a course by adding an
// entry there; no code changes needed.

const DATA_URL = './data/coursework.json';
const list = document.getElementById('coursework-list');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderCard(c) {
  const links = Object.entries(c.links || {})
    .map(([label, href]) => `<a class="run-btn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('');
  const tags = (c.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
  const meta = [c.code, c.term].filter(Boolean).map(esc).join(' · ');
  return `<article class="course-card" id="course-${esc(c.id)}">
    <small>${meta}</small>
    <h3 class="pc-title">${esc(c.title)}</h3>
    ${c.summary ? `<p class="pc-desc">${esc(c.summary)}</p>` : ''}
    ${tags ? `<div class="chips">${tags}</div>` : ''}
    ${links ? `<div class="pub-actions">${links}</div>` : ''}
  </article>`;
}

export async function initCoursework() {
  if (!list) return;
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    const { courses } = await res.json();
    list.innerHTML = courses.map(renderCard).join('');
  } catch {
    list.innerHTML = '<p class="lede">Coursework could not be loaded. Try reloading the page.</p>';
  }
}
