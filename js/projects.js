// The "cartridge" project detail pane on the workbench panel.

const projectDetail = document.getElementById('project-detail');
const projectData = {
  cactilab: { title: 'Research Volunteer // CACTILab, Northeastern University', url: null, body: 'Contributed to a research project at CACTILab, Northeastern University. Details to be shared at a later date.', chips: ['Research', 'LLM', 'Rust', 'Embedded'] },
  aclab: { title: 'ACLab — Augmented Cognition Lab // Northeastern University', url: null, body: 'Research lab member at Northeastern University. Served as paper reviewer for CV4Smalls Workshop at CVPR 2026. Collected 50+ video pairs contributing to the TimeBlind spatio-temporal compositionality benchmark for video-language model evaluation. Thesis project starting Fall 2026.', chips: ['Computer Vision', 'Video-Language Models', 'CVPR 2026', 'ACLab'] },
  escalion: { title: 'Project Escalion // NU Launch Labs', url: 'https://github.com/dhairyab0069', body: 'Co-founded a Rust-based game development studio through NU Launch Labs. Building a custom game engine from scratch — focus on memory layout, performance-critical subsystems, and zero-cost abstractions. Early stage, high ambition. Also competed in MITRE eCTF 2026, contributing to embedded security firmware in a hardware-constrained competition environment.', chips: ['Rust', 'Game Engine', 'Systems', 'eCTF 2026'] },
  teaching: { title: 'TA Console // CS3100', url: null, body: 'Teaching Assistant for CS3100 (Programming and Design Paradigms II) at Khoury College of Computer Science. Work includes designing and testing labs and assignments pre-release, analyzing student feedback on AI-assisted programming workflows, and exploring a human subjects study on AI usage patterns in CS education. Office hours and lab support.', chips: ['CS3100', 'Curriculum', 'AI Research', 'Student Support'] },
  senate: { title: 'Senate Signal // GSG', url: null, body: 'Senator for Student Affairs at the Northeastern Graduate Student Government. Awarded Senator of the Month for February 2026. Recipient of the Emerging Graduate Leader Award through the Graduate Leadership Institute (co-sponsored by GSG). Active on initiatives including club auditing, Impact Symposium volunteering, and broader student advocacy work.', chips: ['GSG', 'GLI Award', 'Senator of the Month', 'Student Affairs'] }
};
const renderProject = (key) => {
  const p = projectData[key];
  const runBtn = p.url ? `<a class="run-btn" href="${p.url}" target="_blank" rel="noopener">Run → view repo</a>` : '';
  projectDetail.innerHTML = `<p class="eyebrow">Inserted cartridge</p><h3 class="section-title">${p.title}</h3><p class="lede">${p.body}</p><div class="chips" style="margin-top:1rem">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>${runBtn}`;
};

export function initProjects() {
  document.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => {
    document.querySelectorAll('.project-card').forEach(node => node.classList.remove('active'));
    card.classList.add('active');
    renderProject(card.dataset.project);
  }));
  renderProject('aclab');
}
