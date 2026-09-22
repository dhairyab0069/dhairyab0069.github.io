// Fake POST/boot log that types itself out in the about panel.

const bootLines = [
  'INIT :: aclab research .......... READY',
  'MOUNT :: timeblind dataset ...... READY',
  'LOAD :: escalion engine ......... READY',
  'SPAWN :: gsg senate ............. READY',
  'SYNC :: rust toolchain .......... READY'
];
const boot = document.getElementById('boot-lines');
let bootIndex = 0;

export function tickBoot() {
  if (bootIndex >= bootLines.length) return;
  const line = document.createElement('div');
  line.textContent = bootLines[bootIndex++];
  boot.appendChild(line);
  if (bootIndex < bootLines.length) setTimeout(tickBoot, 400);
}
