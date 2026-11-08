// Kapak üretici: Doğu Anadolu manzarası (dağlar, Fırat, köy, gün batımı, bağlama) — tamamen kodla çizilir, ücretsiz.
// Kullanım: node kapak.cjs <cikti_klasoru> <baslik> <stil A|B|C> [alt_yazi]
// Çıktılar: arkaplan.png (1296x2304, zoom için), yazi.png (1080x1920 şeffaf), kapak.png (1080x1920 birleşik),
//           arkaplan_yatay.png (4096x2304), yazi_yatay.png (1920x1080), kucuk_resim.png (1280x720, YouTube için)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [, , outDir, baslik, stil = 'C', altYazi = ''] = process.argv;
if (!outDir || !baslik) { console.error('kullanım: node kapak.cjs <klasör> <başlık> <stil> [alt yazı]'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

// Başlıktan tohum: her şarkıda farklı ama tekrarlanabilir manzara
let seed = [...baslik].reduce((a, c) => (a * 31 + c.codePointAt(0)) >>> 0, 7);
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const PALETLER = {
  // A: arabesk — gece, mor/lacivert, ay ışığı, yağmur
  A: { gok: ['#0b0820', '#2a1446', '#6b2a5e', '#c2566b'], gunes: '#f4d9a8', dag: ['#3a1d4d', '#25123a', '#160b26', '#0a0512'], nehir: '#f0c9a0', yagmur: true, yildiz: 0.9 },
  // B: halay — sıcak altın öğleden sonra
  B: { gok: ['#3b1a0e', '#a63d1c', '#f08a2c', '#ffd27a'], gunes: '#fff1c2', dag: ['#9b4a2a', '#6e2f1d', '#431b12', '#200b07'], nehir: '#ffe2a0', yagmur: false, yildiz: 0 },
  // C: gurbet — kızıl gün batımı
  C: { gok: ['#140a1c', '#5a1730', '#c2412f', '#f39a3d'], gunes: '#ffd98a', dag: ['#6d2436', '#461629', '#280d1c', '#12060e'], nehir: '#ffc070', yagmur: false, yildiz: 0.5 },
};
const P = PALETLER[stil] || PALETLER.C;

function dagYolu(W, taban, tepe, puruz, adim, vadi = null) {
  let y = taban - rnd() * tepe, d = `M0 ${H} L0 ${y.toFixed(1)}`;
  for (let x = 0; x <= W + adim; x += adim) {
    y += (rnd() - 0.5) * puruz;
    y = Math.max(taban - tepe, Math.min(taban, y));
    let yy = y;
    if (vadi) yy += vadi.derin * Math.exp(-(((x - vadi.x) / vadi.gen) ** 2));
    d += ` L${x} ${yy.toFixed(1)}`;
  }
  return d + ` L${W} ${H} Z`;
}
let W = 1296; const H = 2304;

function manzaraSVG() {
  const ufuk = 1500;
  const gunesX = 300 + rnd() * 700, gunesY = ufuk - 260 - rnd() * 220, gunesR = stil === 'A' ? 110 : 190;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="gok" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.gok[0]}"/><stop offset="0.35" stop-color="${P.gok[1]}"/>
      <stop offset="0.58" stop-color="${P.gok[2]}"/><stop offset="0.68" stop-color="${P.gok[3]}"/></linearGradient>
    <radialGradient id="hale"><stop offset="0" stop-color="${P.gunes}" stop-opacity="0.85"/><stop offset="1" stop-color="${P.gunes}" stop-opacity="0"/></radialGradient>
    <linearGradient id="nehir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.nehir}" stop-opacity="0.9"/><stop offset="1" stop-color="${P.nehir}" stop-opacity="0.25"/></linearGradient>
    <linearGradient id="sis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.gok[3]}" stop-opacity="0"/><stop offset="0.75" stop-color="${P.gok[3]}" stop-opacity="0.3"/><stop offset="1" stop-color="${P.gok[3]}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#gok)"/>`;
  // yıldızlar
  for (let i = 0; i < 260 * P.yildiz; i++) {
    const x = rnd() * W, y = rnd() * 900, r = rnd() * 2.2 + 0.4;
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  // güneş / ay
  s += `<circle cx="${gunesX}" cy="${gunesY}" r="${gunesR * 3.2}" fill="url(#hale)"/>`;
  s += `<circle cx="${gunesX}" cy="${gunesY}" r="${gunesR}" fill="${P.gunes}"/>`;
  // dağ katmanları (uzak → yakın); yakın katmanlarda Fırat vadisi açılır
  const nx = W * (0.38 + rnd() * 0.24);
  const katman = [[ufuk - 40, 520, 70, 24], [ufuk + 60, 420, 90, 30], [ufuk + 220, 280, 110, 36], [ufuk + 420, 200, 120, 40]];
  katman.forEach(([taban, tepe, puruz, adim], i) => {
    const vadi = i >= 1 ? { x: nx + (i - 1) * 60, gen: 120 + i * 90, derin: 200 + i * 160 } : null;
    s += `<path d="${dagYolu(W, taban, tepe, puruz, adim, vadi)}" fill="${P.dag[i]}"/>`;
    if (i === 0) {
      s += `<rect y="${ufuk - 600}" width="${W}" height="700" fill="url(#sis)"/>`;
      // Fırat: ufuktan aşağı kıvrılarak genişleyen nehir (vadilerin içinden görünür)
      s += `<path d="M${nx - 8} ${ufuk + 20} C ${nx + 60} ${ufuk + 200}, ${nx - 120} ${ufuk + 380}, ${nx - 30} ${ufuk + 560}
             C ${nx + 60} ${ufuk + 700}, ${nx - 260} ${H - 120}, ${nx - 340} ${H} L ${nx + 520} ${H}
             C ${nx + 360} ${H - 160}, ${nx + 150} ${ufuk + 700}, ${nx + 70} ${ufuk + 560}
             C ${nx + 10} ${ufuk + 400}, ${nx + 90} ${ufuk + 200}, ${nx + 8} ${ufuk + 20} Z" fill="url(#nehir)"/>`;
      for (let r = 0; r < 26; r++) {
        const y = ufuk + 60 + rnd() * (H - ufuk - 100), w = 20 + (y - ufuk) * 0.25 * rnd();
        s += `<rect x="${nx - w / 2 + (rnd() - 0.5) * 60}" y="${y}" width="${w}" height="3" fill="#fff" opacity="${(0.25 + rnd() * 0.4).toFixed(2)}"/>`;
      }
    }
    if (i === 2) {
      // köy evleri ve kavaklar (vadinin solunda)
      const kx = 60 + rnd() * 160;
      for (let e = 0; e < 7; e++) {
        const x = kx + e * (40 + rnd() * 24), y = taban - 70 - rnd() * 50, w = 40 + rnd() * 26, h = 28 + rnd() * 18;
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${P.dag[3]}"/>`;
        s += `<rect x="${x + w * 0.4}" y="${y + h * 0.35}" width="7" height="9" fill="${P.gunes}" opacity="${rnd() > 0.4 ? 0.9 : 0}"/>`;
      }
      for (let k = 0; k < 8; k++) {
        const x = kx - 30 + rnd() * 380, y = taban - 90 - rnd() * 40, h = 90 + rnd() * 80;
        s += `<ellipse cx="${x}" cy="${y - h / 2}" rx="${10 + rnd() * 6}" ry="${h / 2}" fill="${P.dag[3]}"/>`;
      }
    }
  });
  // ön planda bağlama silüeti
  const bx = W * 0.82, by = H * 0.86, rot = -24;
  s += `<g transform="translate(${bx} ${by}) rotate(${rot})" fill="#050205" opacity="0.95">
      <path d="M0 -60 C 70 -40 130 80 125 200 C 120 330 60 380 0 380 C -60 380 -120 330 -125 200 C -130 80 -70 -40 0 -60 Z"/>
      <rect x="-11" y="-820" width="22" height="790" rx="4"/>
      <rect x="-15" y="-930" width="30" height="120" rx="6"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${i % 2 ? 12 : -34}" y="${-920 + i * 15}" width="22" height="7" rx="3"/>`).join('')}
    </g>`;
  // yağmur (arabesk)
  if (P.yagmur) {
    for (let i = 0; i < 380; i++) {
      const x = rnd() * W, y = rnd() * H, l = 30 + rnd() * 50;
      s += `<line x1="${x}" y1="${y}" x2="${x - l * 0.18}" y2="${y + l}" stroke="#d9d0ff" stroke-width="1.4" opacity="${(0.12 + rnd() * 0.25).toFixed(2)}"/>`;
    }
  }
  // alt kararma (yazı okunsun)
  s += `<defs><linearGradient id="alt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-opacity="0"/><stop offset="1" stop-opacity="0.45"/></linearGradient></defs>
  <rect y="${H * 0.6}" width="${W}" height="${H * 0.4}" fill="url(#alt)"/></svg>`;
  return s;
}

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@500;700&display=swap" rel="stylesheet">`;
function yaziHTML(w, h, olcek, arkaplan) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>
  html,body{margin:0;width:${w}px;height:${h}px;background:${arkaplan ? `url(data:image/png;base64,${arkaplan}) center/cover` : 'transparent'};overflow:hidden}
  .k{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:${h * 0.11}px;text-align:center;color:#fff3dc}
  .kanal{font:700 ${30 * olcek}px Inter,sans-serif;letter-spacing:${10 * olcek}px;text-transform:uppercase;opacity:.9}
  .cizgi{width:${120 * olcek}px;height:${3 * olcek}px;background:#f2b45a;margin:${22 * olcek}px 0}
  h1{margin:0 ${60 * olcek}px;font:900 ${118 * olcek}px/1.02 'Playfair Display',serif;text-shadow:0 ${6 * olcek}px ${30 * olcek}px rgba(0,0,0,.65)}
  .alt{margin-top:${26 * olcek}px;font:italic 400 ${40 * olcek}px 'Playfair Display',serif;opacity:.92;text-shadow:0 2px 12px rgba(0,0,0,.7)}
  .ai{position:absolute;bottom:${48 * olcek}px;left:0;right:0;text-align:center;color:#fff3dc;font:500 ${24 * olcek}px Inter,sans-serif;opacity:.7;letter-spacing:${2 * olcek}px}
  </style></head><body><div class="k"><div class="kanal">Yanık Ezgiler</div><div class="cizgi"></div>
  <h1>${baslik}</h1>${altYazi ? `<div class="alt">${altYazi}</div>` : ''}</div>
  <div class="ai">AI ile üretilmiştir</div></body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(`<html><body style="margin:0">${manzaraSVG()}</body></html>`);
  await p.screenshot({ path: path.join(outDir, 'arkaplan.png') });
  const bg = fs.readFileSync(path.join(outDir, 'arkaplan.png')).toString('base64');

  await p.setViewportSize({ width: 1080, height: 1920 });
  await p.setContent(yaziHTML(1080, 1920, 1, null), { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(outDir, 'yazi.png'), omitBackground: true });
  await p.setContent(yaziHTML(1080, 1920, 1, bg), { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(outDir, 'kapak.png') });

  // Yatay (16:9) sürüm: YouTube uzun video + küçük resim
  W = 4096; seed = seed ^ 0x9e3779b9;
  await p.setViewportSize({ width: W, height: H });
  await p.setContent(`<html><body style="margin:0">${manzaraSVG()}</body></html>`);
  await p.screenshot({ path: path.join(outDir, 'arkaplan_yatay.png') });
  const bgY = fs.readFileSync(path.join(outDir, 'arkaplan_yatay.png')).toString('base64');
  await p.setViewportSize({ width: 1920, height: 1080 });
  await p.setContent(yaziHTML(1920, 1080, 0.72, null), { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(outDir, 'yazi_yatay.png'), omitBackground: true });
  await p.setViewportSize({ width: 1280, height: 720 });
  await p.setContent(yaziHTML(1280, 720, 0.6, bgY), { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(outDir, 'kucuk_resim.png') });
  await b.close();
  console.log('kapak hazır:', outDir);
})();
