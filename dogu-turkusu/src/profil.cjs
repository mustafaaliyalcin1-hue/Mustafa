// Kanal görselleri: profil resmi (1080x1080, daire içinde güvenli) + YouTube banner (2560x1440)
// Kullanım: node profil.cjs <cikti_klasoru>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const out = process.argv[2] || 'kanal';
fs.mkdirSync(out, { recursive: true });

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Inter:wght@700&display=swap" rel="stylesheet">`;

// Dağ silüeti (sabit, el ile)
const dag = (w, h, y0, renk, noktalar) =>
  `<path d="M0 ${h} L0 ${y0} ${noktalar.map(([x, y]) => `L${x * w} ${y}`).join(' ')} L${w} ${y0} L${w} ${h} Z" fill="${renk}"/>`;

const baglama = (x, y, olcek, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${olcek})" fill="#0a0306">
  <path d="M0 -60 C 70 -40 130 80 125 200 C 120 330 60 380 0 380 C -60 380 -120 330 -125 200 C -130 80 -70 -40 0 -60 Z"/>
  <circle cx="0" cy="150" r="28" fill="#f2b45a" opacity=".9"/>
  <rect x="-11" y="-820" width="22" height="790" rx="4"/>
  <rect x="-15" y="-930" width="30" height="120" rx="6"/>
  ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${i % 2 ? 12 : -34}" y="${-920 + i * 15}" width="22" height="7" rx="3"/>`).join('')}
</g>`;

function profilSVG() {
  const S = 1080;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a1e"/><stop offset=".45" stop-color="#6a1a33"/><stop offset=".75" stop-color="#d0502f"/><stop offset="1" stop-color="#f39a3d"/></linearGradient>
    <radialGradient id="h"><stop offset="0" stop-color="#ffd98a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${S}" height="${S}" fill="url(#g)"/>
  <circle cx="540" cy="560" r="420" fill="url(#h)"/>
  <circle cx="540" cy="560" r="230" fill="#ffd98a"/>
  ${dag(S, S, 720, '#6d2436', [[.1, 640], [.22, 560], [.33, 650], [.45, 590], [.58, 680], [.7, 580], [.82, 640], [.92, 600]])}
  ${dag(S, S, 820, '#3a1226', [[.08, 760], [.2, 700], [.35, 790], [.5, 730], [.65, 800], [.8, 720], [.95, 780]])}
  ${dag(S, S, 900, '#14060f', [[.15, 880], [.3, 850], [.5, 900], [.7, 860], [.9, 890]])}
  ${baglama(610, 760, 0.62, -28)}
  </svg>`;
}

function bannerHTML() {
  const W = 2560, H = 1440;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="position:absolute;inset:0">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140a1c"/><stop offset=".4" stop-color="#5a1730"/><stop offset=".62" stop-color="#c2412f"/><stop offset=".72" stop-color="#f39a3d"/></linearGradient>
    <radialGradient id="h"><stop offset="0" stop-color="#ffd98a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="2230" cy="820" r="420" fill="url(#h)"/>
  <circle cx="2230" cy="820" r="120" fill="#ffd98a"/>
  ${dag(W, H, 900, '#6d2436', [[.05, 820], [.15, 760], [.26, 850], [.38, 780], [.5, 870], [.62, 760], [.74, 840], [.86, 790], [.95, 830]])}
  ${dag(W, H, 980, '#3a1226', [[.07, 930], [.2, 890], [.33, 960], [.48, 910], [.63, 970], [.78, 900], [.92, 950]])}
  ${dag(W, H, 1060, '#14060f', [[.12, 1030], [.3, 1000], [.5, 1050], [.7, 1010], [.88, 1040]])}
  ${baglama(2330, 1010, 0.45, -24)}
  </svg>`;
  return `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>
  html,body{margin:0;width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#140a1c}
  .t{position:absolute;left:0;right:0;top:${H / 2 - 150}px;text-align:center;color:#fff3dc}
  h1{margin:0;font:900 150px/1 'Playfair Display',serif;text-shadow:0 8px 30px rgba(0,0,0,.6)}
  p{margin:22px 0 0;font:700 40px Inter,sans-serif;letter-spacing:10px;color:#f2b45a;text-transform:uppercase}
  </style></head><body>${svg}<div class="t"><h1>Yanık Ezgiler</h1><p>Türkü · Arabesk · Halay</p></div></body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.setContent(`<html><body style="margin:0">${profilSVG()}</body></html>`);
  await p.screenshot({ path: path.join(out, 'profil_resmi.png') });
  await p.setViewportSize({ width: 2560, height: 1440 });
  await p.setContent(bannerHTML(), { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(out, 'youtube_banner.png') });
  await b.close();
  console.log('hazır:', out);
})();
