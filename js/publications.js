// Publications: rendered from data/publications.json (the single source of
// truth, which GitHub Actions can later enrich, e.g. with citation counts).
// The nextcube-terminal repo reads the same file to build ~/publications/;
// its toBibtex mirrors the one here.

const DATA_URL = './data/publications.json';
const list = document.getElementById('publications-list');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "Dhairya Bhatia" -> "Bhatia, Dhairya"; the surname is the last word unless
// the entry's `bibNames` map overrides it (multi-word surnames).
const bibName = (name, overrides = {}) => {
  if (overrides[name]) return overrides[name];
  const parts = name.trim().split(/\s+/);
  return parts.length < 2 ? name : `${parts.pop()}, ${parts.join(' ')}`;
};

export function toBibtex(p) {
  const surname = p.authors[0].trim().split(/\s+/).pop().toLowerCase();
  const key = `${surname}${p.year}${p.id}`;
  const fields = [
    ['title', `{${p.title}}`],
    ['author', `{${p.authors.map(a => bibName(a, p.bibNames)).join(' and ')}}`],
    ['year', `{${p.year}}`],
  ];
  if (p.arxiv) fields.push(['journal', `{arXiv preprint arXiv:${p.arxiv}}`], ['eprint', `{${p.arxiv}}`], ['archivePrefix', '{arXiv}']);
  else if (p.venue) fields.push(['booktitle', `{${p.venue}}`]);
  return `@article{${key},\n${fields.map(([k, v]) => `  ${k} = ${v}`).join(',\n')}\n}`;
}

function renderCard(p, self) {
  const authors = p.authors
    .map(a => a === self ? `<strong class="pub-self">${esc(a)}</strong>` : esc(a))
    .join(', ');
  const meta = [p.venue, p.arxiv && `arXiv:${p.arxiv}`, p.year].filter(Boolean).map(esc).join(' · ');
  const badges = [p.role, p.status].filter(Boolean)
    .map((b, i) => `<span class="pub-badge${i === 0 ? ' pub-badge--role' : ''}">${esc(b)}</span>`).join('');
  const links = Object.entries(p.links || {})
    .map(([label, href]) => `<a class="run-btn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('');
  const tags = (p.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
  return `<article class="pub-card" id="pub-${esc(p.id)}">
    <div class="pub-badges">${badges}</div>
    <h3 class="pub-title">${esc(p.title)}</h3>
    <p class="pub-authors">${authors}</p>
    <p class="pub-meta">${meta}</p>
    ${p.summary ? `<p class="pub-summary">${esc(p.summary)}</p>` : ''}
    ${tags ? `<div class="chips">${tags}</div>` : ''}
    <div class="pub-actions">${links}<button type="button" class="run-btn" data-bibtex="${esc(p.id)}">Copy BibTeX</button><span class="pub-copy-status" role="status"></span></div>
  </article>`;
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

export async function initPublications() {
  let data;
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch {
    return; // keep the static fallback markup in index.html
  }
  const pubs = data.publications || [];
  if (!list || !pubs.length) return;
  list.innerHTML = pubs.map(p => renderCard(p, data.self)).join('');
  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-bibtex]');
    if (!btn) return;
    const pub = pubs.find(p => p.id === btn.dataset.bibtex);
    const status = btn.parentElement.querySelector('.pub-copy-status');
    status.textContent = (await copyText(toBibtex(pub))) ? 'Copied ✓' : 'Copy failed. Try `cat publications/' + pub.id + '.bib` in the terminal.';
    setTimeout(() => { status.textContent = ''; }, 2500);
  });
}
