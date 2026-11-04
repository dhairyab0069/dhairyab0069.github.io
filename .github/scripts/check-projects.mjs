// Checks data/projects.json: its shape, and that neither the data nor the text the page
// renders from it names anything private. Run by build.mjs (so CI fails on a problem), or
// on its own with `node .github/scripts/check-projects.mjs`.
//
// Private means: work that is anonymous, under review or in a lab's hands, and any
// repository that is not public. A new public repository is added to PUBLIC_REPOS on purpose.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Names that must never appear anywhere in the data or the rendered text. Each is written as
// two parts, so that this file does not itself spell out what it keeps off the page.
const named = (a, b) => new RegExp(`${a}\\s*-?\\s*${b}`, 'i');
const FORBIDDEN = [
  named('motion', 'blind'), named('motion', 'doctor'), named('ego', 'exo'), named('time', 'blind'),
  /anonymous/i, /under review/i, /double[- ]blind/i, /ml-course/i, /2609\.09528/,
];
// Public repositories under github.com/dhairyab0069 that the page may link.
const PUBLIC_REPOS = new Set([
  'himawari-mac', 'himawari-io', 'abiogenesis', 'calendar-app', 'Atlas', 'Atlas-Mobile', 'LucasCheck',
  'ecg-diagnostic-classification-ptbxl', 'nyc-taxi-duration-tip-prediction', 'manifold-search',
  'DepDeck', 'desktop-shell-mac', 'nextcube-terminal',
]);
const TONES = new Set(['live', 'building', 'done', 'private']);
const KINDS = new Set(['Project', 'Research']);
const LINK_KINDS = new Set(['live', 'repo', 'more']);

export async function checkProjects(root = ROOT) {
  const errors = [];
  const fail = (m) => errors.push(`data/projects.json → ${m}`);
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8')); }
  catch (e) { return [`data/projects.json → ${e.message}`]; }

  // ---- shape
  const str = (v) => typeof v === 'string' && v.trim().length > 0;
  const groupIds = new Set((data.groups || []).map(g => g.id));
  if (!Array.isArray(data.groups) || !data.groups.length || !data.groups.every(g => str(g.id) && str(g.label))) fail('"groups" must be a list of { id, label }');
  if (!Array.isArray(data.projects) || !data.projects.length) { fail('"projects" must be a non-empty list'); return errors; }
  const seen = new Set();
  for (const p of data.projects) {
    const at = `project "${p?.id}"`;
    if (!str(p.id) || !/^[a-z0-9-]+$/.test(p.id)) fail(`${at}: id must be lower-case letters, digits and dashes`);
    if (seen.has(p.id)) fail(`${at}: duplicate id`); seen.add(p.id);
    for (const k of ['title', 'tagline', 'what', 'interesting', 'when']) if (!str(p[k])) fail(`${at}: "${k}" is missing`);
    if (!KINDS.has(p.kind)) fail(`${at}: kind must be Project or Research`);
    if (!Array.isArray(p.groups) || !p.groups.length || !p.groups.every(g => groupIds.has(g))) fail(`${at}: groups must name known groups`);
    if (!Number.isFinite(p.hue) || p.hue < 0 || p.hue > 360) fail(`${at}: hue must be 0 to 360`);
    if (!TONES.has(p.status?.tone) || !str(p.status?.label)) fail(`${at}: status needs a label and a tone (${[...TONES].join(', ')})`);
    for (const k of ['stack', 'tags']) if (!Array.isArray(p[k]) || !p[k].every(str)) fail(`${at}: "${k}" must be a list of strings`);
    if (!Array.isArray(p.facts) || !p.facts.every(f => Array.isArray(f) && f.length === 2 && f.every(str))) fail(`${at}: facts must be [label, value] pairs`);
    if (!str(p.image?.src) || !str(p.image?.alt)) fail(`${at}: image needs src and alt`);
    else if (!p.image.src.startsWith('./assets/projects/')) fail(`${at}: images must be local, under ./assets/projects/`);
    else if (!fs.existsSync(path.join(root, p.image.src))) fail(`${at}: missing image ${p.image.src}`);
    if (!Array.isArray(p.links)) fail(`${at}: links must be a list`);
    for (const l of p.links || []) {
      if (!str(l.label) || !LINK_KINDS.has(l.kind) || !str(l.href)) { fail(`${at}: each link needs label, kind and href`); continue; }
      if (!/^(https:\/\/|#|\/)/.test(l.href)) fail(`${at}: link ${l.href} must be https, a #panel or a site path`);
    }
  }

  // ---- privacy: the raw data and the text the page builds from it
  const mod = await import(pathToFileURL(path.join(root, 'js/projects.js')).href);
  const rendered = [
    JSON.stringify(data),
    ...data.projects.map((p, i) => mod.cardHtml(p, i) + mod.slideHtml(p, i, data.projects.length) + mod.detailHtml(p, i, data.projects.length)),
  ].join('\n');
  for (const re of FORBIDDEN) {
    const m = rendered.match(re);
    if (m) fail(`mentions "${m[0]}", which must not appear on the public site`);
  }
  for (const m of rendered.matchAll(/github\.com\/dhairyab0069\/([A-Za-z0-9._-]+)/g)) {
    if (!PUBLIC_REPOS.has(m[1])) fail(`links github.com/dhairyab0069/${m[1]}, which is not on the public repository list`);
  }
  for (const m of rendered.matchAll(/<img[^>]*\ssrc="(?!\.\/assets\/)[^"]*"/g)) fail(`renders a non-local image: ${m[0].slice(0, 80)}`);
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = await checkProjects();
  if (errors.length) { console.error(`Projects checks failed (${errors.length}):\n- ` + errors.join('\n- ')); process.exit(1); }
  console.log('Projects data OK');
}
