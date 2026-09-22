// Tab completion: command names on the first word, filenames after that.

import { CMDS } from './commands/index.js';
import { shell, getNode } from './state.js';
import { w } from './output.js';

export function tabComplete(val) {
  const parts = val.split(' ');
  const last = parts[parts.length - 1];
  if (parts.length === 1) {
    const matches = Object.keys(CMDS).filter(c => c.startsWith(last));
    if (matches.length === 1) return matches[0] + ' ';
    if (matches.length > 1) w(matches.join('  '));
    return val;
  }
  const node = getNode(shell.cwd);
  if (node && node.type === 'dir') {
    const matches = Object.entries(node.entries)
      .filter(([n]) => n.startsWith(last));
    if (matches.length === 1) {
      const [n, e] = matches[0];
      return [...parts.slice(0,-1), n + (e.type==='dir' ? '/' : '')].join(' ');
    }
    if (matches.length > 1) w(matches.map(([n,e]) => n+(e.type==='dir'?'/':'')).join('  '));
  }
  return val;
}
