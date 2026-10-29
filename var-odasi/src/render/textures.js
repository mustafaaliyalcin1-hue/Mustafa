// Prosedürel dokular: forma (desen, numara, isim, arma), çim, LED panolar, pencereler.
// Hiçbir görsel dosya yoktur; hepsi tuvalde çizilir (çevrimdışı).
import * as THREE from 'three';
import { lumi } from '../data/teams.js';
import { hashString } from '../core/rng.js';

export const PATTERNS = ['duz', 'dikey', 'yatay', 'yarim', 'kusak', 'ince', 'omuz', 'v'];

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
export function shade(hex, k) {
  const c = new THREE.Color(hex);
  if (k > 0) c.lerp(new THREE.Color(1, 1, 1), k); else c.multiplyScalar(1 + k);
  return '#' + c.getHexString();
}
export function contrast(hex) { return lumi(hex) > 0.55 ? '#141414' : '#ffffff'; }

/** Takım için desen ve ikinci renk (veride yoksa kimlikten türetilir). */
export function kitStyle(teamId, kit) {
  const h = hashString(teamId || 'x');
  const pattern = kit.pattern || PATTERNS[h % PATTERNS.length];
  let second = kit.second || kit.shorts;
  if (Math.abs(lumi(second) - lumi(kit.shirt)) < 0.12) second = contrast(kit.shirt);
  return { pattern, second };
}

/** Kurgusal arma: kalkan + baş harfler */
export function drawCrest(g, x, y, s, c1, c2, txt) {
  g.save();
  g.translate(x, y);
  g.beginPath();
  g.moveTo(-s, -s); g.lineTo(s, -s); g.lineTo(s, s * 0.2);
  g.quadraticCurveTo(s * 0.9, s * 0.9, 0, s * 1.25);
  g.quadraticCurveTo(-s * 0.9, s * 0.9, -s, s * 0.2);
  g.closePath();
  g.fillStyle = c2; g.fill();
  g.lineWidth = s * 0.16; g.strokeStyle = shade(c1, -0.35); g.stroke();
  g.beginPath(); g.arc(0, -s * 0.05, s * 0.55, 0, Math.PI * 2); g.fillStyle = c1; g.fill();
  g.fillStyle = contrast(c1);
  g.font = `bold ${Math.round(s * 0.55)}px Arial, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(txt.slice(0, 2), 0, -s * 0.03);
  g.restore();
}

/**
 * Forma dokusu. Düzen:
 *  - üst %85: gövde (u = gövde çevresi; sırt u=0.75, göğüs u=0.25)
 *  - alt %13: kollar (manşet şeridi altta)
 */
export function shirtTexture(opts) {
  const { shirt, second, pattern, num, name, crest, hi, collar, official } = opts;
  const W = hi ? 1024 : 512, H = W / 2;
  const [c, g] = canvas(W, H);
  const TH = H * 0.85;
  g.fillStyle = shirt; g.fillRect(0, 0, W, H);
  // desen (gövde)
  g.save();
  g.beginPath(); g.rect(0, 0, W, TH); g.clip();
  g.fillStyle = second;
  const sw = W / 24;
  if (pattern === 'dikey') for (let x = 0; x < W; x += sw * 2) g.fillRect(x, 0, sw, TH);
  else if (pattern === 'ince') { g.globalAlpha = 0.55; for (let x = 0; x < W; x += sw) g.fillRect(x, 0, sw * 0.18, TH); g.globalAlpha = 1; }
  else if (pattern === 'yatay') for (let y = TH * 0.22; y < TH; y += TH * 0.16) g.fillRect(0, y, W, TH * 0.08);
  else if (pattern === 'yarim') { g.fillRect(W * 0.5, 0, W * 0.5, TH); }
  else if (pattern === 'kusak') {
    // göğüste ve sırtta çapraz kuşak
    for (const cx of [W * 0.25, W * 0.75]) { g.save(); g.translate(cx, TH * 0.5); g.rotate(-0.55); g.fillRect(-W * 0.3, -TH * 0.09, W * 0.6, TH * 0.18); g.restore(); }
  } else if (pattern === 'omuz') { g.fillRect(0, 0, W, TH * 0.2); }
  else if (pattern === 'v') {
    for (const cx of [W * 0.25, W * 0.75]) { g.beginPath(); g.moveTo(cx - W * 0.22, 0); g.lineTo(cx, TH * 0.42); g.lineTo(cx + W * 0.22, 0); g.lineTo(cx + W * 0.16, 0); g.lineTo(cx, TH * 0.3); g.lineTo(cx - W * 0.16, 0); g.fill(); }
  }
  // yan paneller ve kumaş dokusu
  g.globalAlpha = 0.22; g.fillStyle = '#000';
  for (const x of [0, W * 0.5, W]) g.fillRect(x - W * 0.035, 0, W * 0.07, TH);
  g.globalAlpha = 1;
  const img = g.getImageData(0, 0, W, H), d = img.data;
  let s = 1234;
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const px = (i / 4) % W, py = Math.floor(i / 4 / W);
    const weave = ((px + py) % 4 < 2 ? 4 : -4) + ((s >> 8) % 9) - 4;
    d[i] += weave; d[i + 1] += weave; d[i + 2] += weave;
  }
  g.putImageData(img, 0, 0);
  g.restore();
  // yaka
  const col = collar || second;
  g.fillStyle = col;
  g.fillRect(0, 0, W, TH * 0.035);
  g.beginPath(); g.moveTo(W * 0.2, 0); g.lineTo(W * 0.25, TH * 0.11); g.lineTo(W * 0.3, 0); g.closePath(); g.fill();
  g.fillStyle = shirt;
  g.beginPath(); g.moveTo(W * 0.215, 0); g.lineTo(W * 0.25, TH * 0.08); g.lineTo(W * 0.285, 0); g.closePath(); g.fill();
  // alt kenar
  g.fillStyle = shade(col, -0.1); g.fillRect(0, TH - TH * 0.025, W, TH * 0.025);
  const fg = contrast(pattern === 'dikey' || pattern === 'yatay' ? shade(shirt, -0.2) : shirt);
  const outline = fg === '#ffffff' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)';
  if (num) {
    // sırt numarası (numara paneli desenin üstünde okunur kalsın)
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${Math.round(TH * 0.42)}px Arial Black, Arial, sans-serif`;
    g.lineWidth = W * 0.008; g.strokeStyle = outline; g.fillStyle = fg;
    g.strokeText(String(num), W * 0.75, TH * 0.52); g.fillText(String(num), W * 0.75, TH * 0.52);
    if (name) {
      g.font = `bold ${Math.round(TH * 0.075)}px Arial, sans-serif`;
      const last = name.split(' ').slice(-1)[0].toLocaleUpperCase('tr-TR');
      g.lineWidth = W * 0.004;
      g.strokeText(last, W * 0.75, TH * 0.19); g.fillText(last, W * 0.75, TH * 0.19);
    }
    // göğüs: küçük numara
    g.font = `bold ${Math.round(TH * 0.12)}px Arial, sans-serif`;
    g.lineWidth = W * 0.004;
    g.strokeText(String(num), W * 0.18, TH * 0.36); g.fillText(String(num), W * 0.18, TH * 0.36);
  }
  if (crest) drawCrest(g, W * 0.335, TH * 0.3, TH * 0.06, crest.c1, crest.c2, crest.txt);
  if (official) {
    // hakem rozeti
    g.fillStyle = '#111'; g.fillRect(W * 0.31, TH * 0.24, W * 0.05, TH * 0.1);
    g.fillStyle = '#ffd400'; g.font = `bold ${Math.round(TH * 0.035)}px Arial`; g.textAlign = 'center';
    g.fillText('HAKEM', W * 0.335, TH * 0.3);
  }
  // kollar: düz renk + manşet
  g.fillStyle = shirt; g.fillRect(0, H * 0.87, W, H * 0.13);
  g.fillStyle = col; g.fillRect(0, H * 0.965, W, H * 0.035);
  return tex(c);
}

export function grassTextures(q) {
  const W = q === 'yuksek' ? 4096 : q === 'orta' ? 2048 : 1024, H = W / 2;
  const [c, g] = canvas(W, H);
  const mx = W / 117, my = H / 80;
  const X = (x) => (x + 58.5) * mx, Y = (z) => (z + 40) * my;
  g.fillStyle = '#2b6a26'; g.fillRect(0, 0, W, H);
  // biçme şeritleri (boyuna) + hafif enine dama
  const stripes = 18, sw = (105 / stripes) * mx;
  for (let i = -3; i < stripes + 3; i++) {
    g.fillStyle = i % 2 === 0 ? '#357d2f' : '#2b6a27';
    g.fillRect(X(-52.5) + i * sw, 0, sw + 1, H);
  }
  g.globalAlpha = 0.035;
  for (let j = 0; j < 12; j++) { g.fillStyle = j % 2 ? '#ffffff' : '#000000'; g.fillRect(0, Y(-34) + j * (68 / 12) * my, W, (68 / 12) * my); }
  g.globalAlpha = 1;
  // aşınma: kale ağızları, orta yuvarlak, yan hakem koridorları
  const wear = (x, z, rx, rz, a) => {
    const gr = g.createRadialGradient(X(x), Y(z), 0, X(x), Y(z), Math.max(rx, rz) * mx);
    gr.addColorStop(0, `rgba(120,105,60,${a})`); gr.addColorStop(1, 'rgba(120,105,60,0)');
    g.save(); g.translate(X(x), Y(z)); g.scale(1, rz / rx); g.translate(-X(x), -Y(z));
    g.fillStyle = gr; g.fillRect(X(x) - rx * mx, Y(z) - rx * mx, rx * 2 * mx, rx * 2 * mx); g.restore();
  };
  for (const s of [1, -1]) { wear(s * 50.5, 0, 4.5, 3, 0.55); wear(s * 41.5, 0, 2, 2, 0.35); wear(s * 47, 0, 6, 5, 0.25); }
  wear(0, 0, 3, 3, 0.25);
  g.globalAlpha = 0.25; g.fillStyle = '#6f7d3a';
  g.fillRect(X(0), Y(33.2), X(52) - X(0), my * 1.2); g.fillRect(X(-52), Y(-34.3), X(0) - X(-52), my * 1.2);
  g.globalAlpha = 1;
  // ince gürültü
  const img = g.getImageData(0, 0, W, H), d = img.data;
  let s = 777;
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const n = ((s >> 10) % 23) - 11;
    d[i] += n * 0.5; d[i + 1] += n; d[i + 2] += n * 0.35;
  }
  g.putImageData(img, 0, 0);
  const color = tex(c);
  // ayrıntı (çim yaprağı) dokusu: kabartma + pürüzlülük için, döşenerek kullanılır
  const DS = 256;
  const [dc, dg] = canvas(DS, DS);
  const di = dg.createImageData(DS, DS), dd = di.data;
  let t = 99;
  const val = new Float32Array(DS * DS);
  for (let i = 0; i < DS * DS; i++) { t = (t * 1103515245 + 12345) & 0x7fffffff; val[i] = (t >> 8) / 8388608; }
  // dikey çizgiler (yapraklar)
  for (let k = 0; k < 2600; k++) {
    t = (t * 1103515245 + 12345) & 0x7fffffff;
    const x = t % DS; const y = (t >> 9) % DS; const len = 2 + ((t >> 3) % 6);
    for (let j = 0; j < len; j++) val[((y + j) % DS) * DS + x] = 1;
  }
  for (let i = 0; i < DS * DS; i++) { const v = 90 + val[i] * 140; dd[i * 4] = v; dd[i * 4 + 1] = v; dd[i * 4 + 2] = v; dd[i * 4 + 3] = 255; }
  dg.putImageData(di, 0, 0);
  const detail = tex(dc, false);
  detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
  detail.repeat.set(117 * 1.6, 80 * 1.6);
  return { color, detail };
}

export function ledTexture(lines, bg = '#04101a') {
  const [c, g] = canvas(2048, 64);
  g.fillStyle = bg; g.fillRect(0, 0, 2048, 64);
  let x = 20, i = 0;
  while (x < 2048) {
    const [txt, col] = lines[i++ % lines.length];
    g.fillStyle = col; g.font = 'bold 40px Arial, sans-serif'; g.textBaseline = 'middle';
    g.fillText(txt, x, 34);
    x += g.measureText(txt).width + 50;
    g.fillStyle = '#22d36b'; g.fillRect(x - 32, 26, 14, 14); x += 10;
  }
  // LED ızgarası
  g.fillStyle = 'rgba(0,0,0,0.35)';
  for (let y = 0; y < 64; y += 4) g.fillRect(0, y, 2048, 1);
  for (let xx = 0; xx < 2048; xx += 4) g.fillRect(xx, 0, 1, 64);
  const t = tex(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

export function windowsTexture() {
  const [c, g] = canvas(256, 512);
  g.fillStyle = '#0a0f16'; g.fillRect(0, 0, 256, 512);
  let s = 5;
  for (let y = 8; y < 512; y += 16) for (let x = 6; x < 256; x += 14) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const r = (s >> 8) % 100;
    if (r < 38) { g.fillStyle = r < 8 ? '#9fc8ff' : r < 20 ? '#ffd88a' : '#f5e6b8'; g.globalAlpha = 0.5 + (r % 10) / 20; g.fillRect(x, y, 8, 9); }
  }
  g.globalAlpha = 1;
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function glowTexture() {
  const [c, g] = canvas(128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.18, 'rgba(255,250,225,0.65)'); gr.addColorStop(0.5, 'rgba(255,240,200,0.12)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return tex(c);
}

export function netTexture() {
  const [c, g] = canvas(64, 64);
  g.clearRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 6;
  // altıgen benzeri file
  g.beginPath(); g.moveTo(0, 16); g.lineTo(16, 0); g.lineTo(48, 0); g.lineTo(64, 16); g.moveTo(0, 48); g.lineTo(16, 64); g.lineTo(48, 64); g.lineTo(64, 48);
  g.moveTo(16, 0); g.lineTo(16, 64); g.moveTo(48, 0); g.lineTo(48, 64); g.moveTo(0, 16); g.lineTo(0, 48); g.moveTo(64, 16); g.lineTo(64, 48);
  g.stroke();
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function scoreboardCanvas() {
  const [c, g] = canvas(1024, 512);
  return { c, g, t: tex(c) };
}
