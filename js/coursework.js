// Coursework: rendered from data/coursework.json. The journey strip lists the
// institutions in order; courses are grouped under the institution they belong
// to. Add a course or a school by editing the JSON; no code changes needed.

const DATA_URL = './data/coursework.json';
const list = document.getElementById('coursework-list');
const journey = document.getElementById('coursework-journey');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderCard(c) {
  const links = Object.entries(c.links || {})
    .map(([label, href]) => `<a class="run-btn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('');
  const tags = (c.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
  const meta = [c.code, c.term].filter(Boolean).map(esc).join(' · ');
  return `<article class="course-card" id="course-${esc(c.id)}">
    ${meta ? `<small>${meta}</small>` : ''}
    <h3 class="pc-title">${esc(c.title)}</h3>
    ${c.summary ? `<p class="pc-desc">${esc(c.summary)}</p>` : ''}
    ${tags ? `<div class="chips">${tags}</div>` : ''}
    ${links ? `<div class="pub-actions">${links}</div>` : ''}
  </article>`;
}

function renderJourney(institutions, hasCourses) {
  return institutions.map(i => {
    const inner = `<small>${esc(i.note || '')}</small><strong>${esc(i.name)}</strong><span>${esc(i.place || '')}</span>`;
    return hasCourses(i.id)
      ? `<li><a class="journey-stop" href="#inst-${esc(i.id)}">${inner}</a></li>`
      : `<li><span class="journey-stop">${inner}</span></li>`;
  }).join('');
}

function renderGroups(institutions, courses) {
  return institutions.filter(i => courses.some(c => c.institution === i.id)).map(i => `
    <section class="course-group" id="inst-${esc(i.id)}" aria-labelledby="inst-${esc(i.id)}-title">
      <h3 class="course-group-title" id="inst-${esc(i.id)}-title">${esc(i.name)}</h3>
      <div class="course-list">${courses.filter(c => c.institution === i.id).map(renderCard).join('')}</div>
    </section>`).join('');
}

export async function initCoursework() {
  if (!list) return;
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    const { institutions = [], courses = [] } = await res.json();
    if (journey) journey.innerHTML = renderJourney(institutions, id => courses.some(c => c.institution === id));
    list.innerHTML = renderGroups(institutions, courses);
  } catch {
    list.innerHTML = '<p class="lede">Coursework could not be loaded. Try reloading the page.</p>';
  }
}
