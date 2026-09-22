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
let running = false;

// Safe to call repeatedly (e.g. every time the About panel is shown): only one
// timer chain ever runs, and it stops once every line is printed.
export function tickBoot() {
  if (running || bootIndex >= bootLines.length) return;
  running = true;
  const step = () => {
    const line = document.createElement('div');
    line.textContent = bootLines[bootIndex++];
    boot.appendChild(line);
    if (bootIndex < bootLines.length) setTimeout(step, 400);
    else running = false;
  };
  step();
}
