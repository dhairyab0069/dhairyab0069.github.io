// The "cartridge" project detail pane on the workbench panel.

const projectDetail = document.getElementById('project-detail');
const projectData = {
  cactilab: { title: 'Research Volunteer // CACTILab, Northeastern University', url: null, body: 'Since March 2026. Designed and built a multi-stage agentic code-generation pipeline with LLM orchestration and compiler-in-the-loop verification. Implemented model tiering, per-turn cost observability, and a multi-agent verification loop.', chips: ['LLM Agents', 'Code Generation', 'Rust', 'Research'] },
  aclab: { title: 'ACLab — Augmented Cognition Lab // Northeastern University', url: 'https://arxiv.org/abs/2609.09528', urlLabel: 'Read → arXiv paper', body: 'Research Assistant since May 2026, advised by Prof. Sarah Ostadabbas. Designed and led MotionBlind, a contrastive video benchmark for temporal and motion reasoning in video-language models (co-first author, arXiv 2026, under review at a NeurIPS 2026 workshop). Collected and curated 100+ paired clips across 9 motion categories, built multimodal VLM evaluation pipelines on an HPC cluster, and established baselines across open-source transformer models. Earlier: collected 50+ video pairs for the TimeBlind Challenge benchmark, presented at the CV4Smalls Workshop, CVPR 2026. Paper reviewer for the CV4Smalls Workshop at CVPR 2026.', chips: ['Video-LLMs', 'Benchmarking', 'HPC', 'arXiv 2026'] },
  escalion: { title: 'Project Escalion // NU Launch Labs', url: 'https://github.com/dhairyab0069', body: 'Co-founded a Rust-based game development studio through NU Launch Labs. Building a custom game engine from scratch — focus on memory layout, performance-critical subsystems, and zero-cost abstractions. Early stage, high ambition. Also contributed embedded security firmware to MITRE eCTF 2026, a hardware-constrained competition environment.', chips: ['Rust', 'Game Engine', 'Systems', 'eCTF 2026'] },
  teaching: { title: 'TA Console // CS3100', url: null, body: 'Teaching Assistant for CS3100 (Programming and Design Paradigms II) at Khoury College of Computer Science. Work includes designing and testing labs and assignments pre-release, analyzing student feedback on AI-assisted programming workflows, and exploring a human subjects study on AI usage patterns in CS education. Office hours and lab support.', chips: ['CS3100', 'Curriculum', 'AI Research', 'Student Support'] },
  mllabs: { title: 'ML Lab Bench // an open course', url: 'https://dhairyab0069.github.io/ml-course/labs/', urlLabel: 'Run → open the labs', body: 'A 16-module, fill-in-the-code course from NumPy and the maths through CNNs, RNNs, transformers, LLM architecture, graph networks and GANs, built on d2l.ai, MIT Foundations of Computer Vision and other standard texts. Each module has checks that unlock the next, plus live browser labs: curve fitting, a perceptron, an MLP trained with hand-written backprop, optimisers racing down a valley, convolution filters, attention heatmaps and a GAN. Built with LLM assistance (Claude), reviewed and tested by me; details in the repo README.', chips: ['Deep Learning', 'PyTorch', 'Education', 'Open source'],
    links: [['Curve fitting', 'curve'], ['Tiny MLP', 'mlp'], ['Convolution', 'conv'], ['Attention', 'attention'], ['GAN', 'gan'], ['Course map', 'map']].map(([label, id]) => ({ label, href: `https://dhairyab0069.github.io/ml-course/labs/#${id}` })).concat({ label: 'Course repo', href: 'https://github.com/dhairyab0069/ml-course' }) },
  senate: { title: 'Senate Signal // GSG', url: null, body: 'Senator for Student Affairs at the Northeastern Graduate Student Government. Awarded Senator of the Month for February 2026. Recipient of the Emerging Graduate Leader Award through the Graduate Leadership Institute (co-sponsored by GSG). Active on initiatives including club auditing, Impact Symposium volunteering, and broader student advocacy work.', chips: ['GSG', 'GLI Award', 'Senator of the Month', 'Student Affairs'] }
};
const renderProject = (key) => {
  const p = projectData[key];
  const runBtn = p.url ? `<a class="run-btn" href="${p.url}" target="_blank" rel="noopener">${p.urlLabel || 'Run → view repo'}</a>` : '';
  const links = p.links ? `<div class="chips detail-links">${p.links.map(l => `<a class="run-btn" href="${l.href}" target="_blank" rel="noopener">${l.label} ↗</a>`).join('')}</div>` : '';
  projectDetail.innerHTML = `<p class="eyebrow">Inserted cartridge</p><h3 class="section-title">${p.title}</h3><p class="lede">${p.body}</p><div class="chips detail-chips">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>${runBtn}${links}`;
};

export function initProjects() {
  document.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => {
    document.querySelectorAll('.project-card').forEach(node => {
      node.classList.toggle('active', node === card);
      node.setAttribute('aria-pressed', String(node === card));
    });
    renderProject(card.dataset.project);
  }));
  renderProject('aclab');
}
