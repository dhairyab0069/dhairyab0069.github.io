// A quiet computer-vision and machine-learning backdrop behind every panel:
//   1. loss landscape: contour lines with gradient-descent agents rolling downhill
//   2. detection boxes: labelled boxes with confidence scores tracking drifting shapes
//   3. convolution scan: a 3x3 Sobel kernel sweeping an image while its feature map fills in
//
// Design choices:
// - One fixed canvas behind the page (z-index -1, pointer-events none) so it never
//   steals input, and everything is drawn at low alpha so text stays readable.
// - The contour map is drawn once to an offscreen canvas and re-drawn only on
//   resize or theme change; per frame we only blit it and draw the moving parts.
// - Capped at ~30 fps and a device pixel ratio of 1.5, paused when the tab is hidden.
// - Reduced motion: one static frame, no loop.
// - The maths (landscape, gradient, contour segments) is exported and DOM-free so
//   it can be tested in node.

import { prefersReducedMotion } from './motion.js';

// ---- pure maths -----------------------------------------------------------

/** A bumpy loss surface over the unit square: three wells on a gentle bowl and ripples. */
export function landscape(u, v) {
  const well = (cx, cy, depth, w) => -depth * Math.exp(-((u - cx) ** 2 + (v - cy) ** 2) / w);
  return well(0.22, 0.7, 1.1, 0.03) + well(0.78, 0.35, 0.9, 0.04) + well(0.5, 0.15, 0.6, 0.02)
    + 0.35 * Math.sin(3.2 * u + 1.3) * Math.cos(2.6 * v) + 0.45 * ((u - 0.5) ** 2 + (v - 0.5) ** 2);
}

/** Numerical gradient of the landscape. */
export function gradient(u, v, eps = 0.003) {
  return [
    (landscape(u + eps, v) - landscape(u - eps, v)) / (2 * eps),
    (landscape(u, v + eps) - landscape(u, v - eps)) / (2 * eps),
  ];
}

/** One momentum step of gradient descent. Returns the new state. */
export function descend({ u, v, du, dv }, lr = 0.0012, momentum = 0.92) {
  const [gu, gv] = gradient(u, v);
  du = momentum * du - lr * gu;
  dv = momentum * dv - lr * gv;
  return { u: u + du, v: v + dv, du, dv, g: Math.hypot(gu, gv) };
}

/** Marching squares: line segments [x1,y1,x2,y2] (in cell units) for the iso-level
 *  `level` over a `cols` x `rows` grid of samples `g`. */
export function contourSegments(g, cols, rows, level) {
  const out = [];
  const t = (p, q) => (level - p) / (q - p);
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = g[j * cols + i], b = g[j * cols + i + 1], c = g[(j + 1) * cols + i + 1], d = g[(j + 1) * cols + i];
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T = [i + t(a, b), j], R = [i + 1, j + t(b, c)], B = [i + t(d, c), j + 1], L = [i, j + t(a, d)];
      const seg = (p, q) => out.push([p[0], p[1], q[0], q[1]]);
      switch (idx) {
        case 1: case 14: seg(L, B); break;
        case 2: case 13: seg(B, R); break;
        case 3: case 12: seg(L, R); break;
        case 4: case 11: seg(T, R); break;
        case 5: seg(T, L); seg(B, R); break;
        case 6: case 9: seg(T, B); break;
        case 7: case 8: seg(T, L); break;
        case 10: seg(T, R); seg(L, B); break;
      }
    }
  }
  return out;
}

/** Valid 3x3 cross-correlation of `img` (rows x cols) with `k`. */
export function convolve(img, k) {
  const rows = img.length, cols = img[0].length;
  const out = [];
  for (let y = 0; y < rows - 2; y++) {
    const row = [];
    for (let x = 0; x < cols - 2; x++) {
      let s = 0;
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) s += img[y + ky][x + kx] * k[ky][kx];
      row.push(s);
    }
    out.push(row);
  }
  return out;
}

export const SOBEL_X = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];

/** A small test image: a disc, a bar and a little noise, values 0..1. */
export function sampleImage(cols = 16, rows = 10) {
  const img = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      const disc = Math.hypot(x - 4.5, y - 4.5) < 3.2 ? 1 : 0;
      const bar = x >= 9 && x <= 13 && y >= 2 && y <= 7 && (x - 9 + y) % 7 < 5 ? 0.8 : 0;
      const noise = ((x * 73 + y * 151) % 11) / 90;
      row.push(Math.min(1, Math.max(disc, bar) + noise));
    }
    img.push(row);
  }
  return img;
}

// ---- drawing --------------------------------------------------------------

const PALETTE = {
  dark: { line: [147, 240, 187], cool: [140, 170, 255], warm: [255, 203, 107], contour: 0.1, boost: 1 },
  light: { line: [0, 105, 120], cool: [70, 60, 190], warm: [140, 90, 0], contour: 0.14, boost: 1.25 },
};
const LABELS = ['person', 'laptop', 'cup', 'cat', 'sunflower', 'cube'];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, a).toFixed(3)})`;
const rand = (a, b) => a + Math.random() * (b - a);

export function initMlBackground() {
  if (document.getElementById('ml-bg')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'ml-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = prefersReducedMotion();
  let W = 0, H = 0, dpr = 1, pal = PALETTE.dark;
  const land = document.createElement('canvas');

  // agents, boxes and the convolution scan
  const agents = [];
  const boxes = [];
  const image = sampleImage();
  const feature = convolve(image, SOBEL_X);
  const maxResp = Math.max(...feature.flat().map(Math.abs)) || 1;
  const fCols = feature[0].length, fRows = feature.length;
  const scan = { step: 0, hold: 0 };

  const spawnAgent = (a = {}) => Object.assign(a, { u: rand(0.05, 0.95), v: rand(0.05, 0.95), du: 0, dv: 0, trail: [], age: 0, calm: 0, life: 1 });
  const spawnBox = (b = {}) => Object.assign(b, {
    x: rand(0.12, 0.88), y: rand(0.15, 0.85), vx: rand(-0.004, 0.004), vy: rand(-0.003, 0.003),
    rx: rand(0.035, 0.06), ry: rand(0.05, 0.09), label: LABELS[Math.floor(Math.random() * LABELS.length)],
    phase: rand(0, 6.28), bx: null, by: null, age: 0, span: rand(700, 1100),
  });
  for (let i = 0; i < 3; i++) agents.push(spawnAgent());
  for (let i = 0; i < 4; i++) { const b = spawnBox(); b.age = rand(0, b.span); boxes.push(b); }

  const buildLandscape = () => {
    land.width = Math.round(W * dpr); land.height = Math.round(H * dpr);
    const lc = land.getContext('2d');
    lc.scale(dpr, dpr);
    const cs = 14, cols = Math.ceil(W / cs) + 1, rows = Math.ceil(H / cs) + 1;
    const g = new Float32Array(cols * rows);
    let lo = Infinity, hi = -Infinity;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const val = landscape((i * cs) / W, (j * cs) / H);
      g[j * cols + i] = val; lo = Math.min(lo, val); hi = Math.max(hi, val);
    }
    lc.strokeStyle = rgba(pal.line, pal.contour * pal.boost);
    lc.lineWidth = 1;
    lc.beginPath();
    for (let n = 1; n <= 14; n++) {
      const level = lo + ((hi - lo) * n) / 15;
      for (const [x1, y1, x2, y2] of contourSegments(g, cols, rows, level)) { lc.moveTo(x1 * cs, y1 * cs); lc.lineTo(x2 * cs, y2 * cs); }
    }
    lc.stroke();
  };

  const resize = () => {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    pal = PALETTE[document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'];
    buildLandscape();
    if (reduced) draw(0);
  };

  const drawAgents = () => {
    for (const a of agents) {
      if (!reduced) {
        const s = descend(a);
        a.u = s.u; a.v = s.v; a.du = s.du; a.dv = s.dv; a.age++;
        a.calm = s.g < 0.12 ? a.calm + 1 : 0;
        a.trail.push([a.u * W, a.v * H]);
        if (a.trail.length > 70) a.trail.shift();
        const out = a.u < -0.05 || a.u > 1.05 || a.v < -0.05 || a.v > 1.05;
        if (a.calm > 50 || a.age > 900 || out) a.life -= 0.04;
        if (a.life <= 0) spawnAgent(a);
      }
      const fade = Math.max(0, a.life);
      ctx.lineWidth = 1.5;
      for (let i = 1; i < a.trail.length; i++) {
        ctx.strokeStyle = rgba(pal.warm, (i / a.trail.length) * 0.3 * fade * pal.boost);
        ctx.beginPath(); ctx.moveTo(a.trail[i - 1][0], a.trail[i - 1][1]); ctx.lineTo(a.trail[i][0], a.trail[i][1]); ctx.stroke();
      }
      const x = a.u * W, y = a.v * H;
      ctx.fillStyle = rgba(pal.warm, 0.12 * fade * pal.boost); ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill();
      ctx.fillStyle = rgba(pal.warm, 0.55 * fade * pal.boost); ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill();
    }
  };

  const drawBoxes = (t) => {
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'middle';
    for (const b of boxes) {
      if (!reduced) {
        b.age++;
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0.08 || b.x > 0.92) b.vx *= -1;
        if (b.y < 0.1 || b.y > 0.9) b.vy *= -1;
        if (b.age > b.span) spawnBox(b);
      }
      const env = Math.sin(Math.PI * Math.min(1, b.age / b.span)) ** 0.6; // fade in and out
      const cx = b.x * W, cy = b.y * H, rx = b.rx * Math.min(W, 1100), ry = b.ry * Math.min(H, 900);
      // the box follows the object a little late and with jitter, like a real detector
      const jx = Math.sin(t * 0.004 + b.phase) * 1.5, jy = Math.cos(t * 0.0033 + b.phase) * 1.5;
      b.bx = b.bx === null ? cx : b.bx + (cx + jx - b.bx) * 0.12;
      b.by = b.by === null ? cy : b.by + (cy + jy - b.by) * 0.12;
      const x0 = b.bx - rx - 6, y0 = b.by - ry - 6, w = rx * 2 + 12, h = ry * 2 + 12, k = Math.min(14, w / 3, h / 3);
      const conf = 0.86 + 0.1 * Math.sin(t * 0.0011 + b.phase);

      ctx.fillStyle = rgba(pal.cool, 0.045 * env * pal.boost);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = rgba(pal.cool, 0.35 * env * pal.boost); ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const [px, py, dx, dy] of [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0, y0 + h, 1, -1], [x0 + w, y0 + h, -1, -1]]) {
        ctx.moveTo(px + dx * k, py); ctx.lineTo(px, py); ctx.lineTo(px, py + dy * k);
      }
      ctx.stroke();
      const text = `${b.label} ${conf.toFixed(2)}`, tw = ctx.measureText(text).width + 10;
      ctx.fillStyle = rgba(pal.cool, 0.22 * env * pal.boost); ctx.fillRect(x0, y0 - 17, tw, 16);
      ctx.fillStyle = rgba(pal.cool, 0.8 * env); ctx.fillText(text, x0 + 5, y0 - 9);
    }
  };

  const drawScan = (t) => {
    const cs = W < 720 ? 8 : 12;
    const inCols = image[0].length, inRows = image.length;
    const inW = inCols * cs, inH = inRows * cs, fW = fCols * cs, fH = fRows * cs;
    const x0 = W - inW - 28, yIn = H - inH - 56, yOut = yIn - fH - 44;
    if (x0 < 8 || yOut < 8) return;
    if (!reduced) {
      if (scan.step >= fCols * fRows) { if (++scan.hold > 60) { scan.step = 0; scan.hold = 0; } }
      else if (Math.floor(t / 140) !== scan.last) { scan.last = Math.floor(t / 140); scan.step++; }
    } else scan.step = fCols * fRows;
    const cur = Math.min(scan.step, fCols * fRows - 1);
    const kx = cur % fCols, ky = Math.floor(cur / fCols);

    // input image
    for (let y = 0; y < inRows; y++) for (let x = 0; x < inCols; x++) {
      ctx.fillStyle = rgba(pal.line, (0.03 + image[y][x] * 0.2) * pal.boost);
      ctx.fillRect(x0 + x * cs, yIn + y * cs, cs - 1, cs - 1);
    }
    // feature map: only cells the kernel has already visited
    for (let y = 0; y < fRows; y++) for (let x = 0; x < fCols; x++) {
      const done = y * fCols + x < scan.step;
      const v = Math.abs(feature[y][x]) / maxResp;
      ctx.fillStyle = done ? rgba(feature[y][x] >= 0 ? pal.cool : pal.warm, (0.04 + v * 0.38) * pal.boost) : rgba(pal.line, 0.03 * pal.boost);
      ctx.fillRect(x0 + (x + 1) * cs, yOut + y * cs, cs - 1, cs - 1);
    }
    // the 3x3 kernel window and the feature cell it is producing
    ctx.strokeStyle = rgba(pal.warm, 0.7 * pal.boost); ctx.lineWidth = 1.5;
    ctx.strokeRect(x0 + kx * cs - 0.5, yIn + ky * cs - 0.5, cs * 3, cs * 3);
    ctx.strokeRect(x0 + (kx + 1) * cs - 0.5, yOut + ky * cs - 0.5, cs, cs);
    ctx.fillStyle = rgba(pal.line, 0.4 * pal.boost);
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('feature map · sobel-x', x0, yOut - 8);
    ctx.fillText('input 16×10 · kernel 3×3', x0, yIn + inH + 14);
  };

  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(land, 0, 0, W, H);
    drawAgents();
    drawBoxes(t);
    drawScan(t);
  }

  // ~30 fps, paused when the tab is hidden.
  let raf = 0, lastFrame = 0;
  const loop = (t) => {
    raf = 0;
    if (document.hidden) return;
    if (t - lastFrame >= 33) { lastFrame = t; draw(t); }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!reduced && !raf) raf = requestAnimationFrame(loop); };
  document.addEventListener('visibilitychange', start);

  let resizeTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
  new MutationObserver(resize).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  resize();
  start();
}
