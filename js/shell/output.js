// Everything that writes into the terminal's output pane.

export const output = document.getElementById('terminal-output');

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Append a line of pre-built HTML.
export function w(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  output.appendChild(d);
}

// Append preformatted plain text (file contents, ASCII art).
export function wPre(text) {
  const d = document.createElement('div');
  d.style.whiteSpace = 'pre';
  d.style.fontFamily = 'inherit';
  d.textContent = text;
  output.appendChild(d);
}

export function wErr(msg) {
  w(`<span style="color:var(--color-magenta)">${esc(msg)}</span>`);
}

export function dirSpan(name) {
  return `<span style="color:var(--color-primary);font-weight:600">${esc(name)}/</span>`;
}

export function fileSpan(name) {
  return `<span style="color:var(--color-text)">${esc(name)}</span>`;
}
