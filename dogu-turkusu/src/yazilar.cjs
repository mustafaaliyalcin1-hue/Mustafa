// Kısa video (Reels/Shorts) yazı katmanları: kanca cümlesi + nakarat sözleri (1080x1920, şeffaf PNG)
// Kullanım: node yazilar.cjs <klasör> "<kanca cümlesi>" <nakarat.txt>
// Çıktılar: kanca.png (ilk ~3 sn, ekranın ortasında büyük), nakarat.png (sonrası, sözler kutu içinde)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [, , dir, kanca, nakaratDosya] = process.argv;
if (!dir || !kanca || !nakaratDosya) { console.error('kullanım: node yazilar.cjs <klasör> "<kanca>" <nakarat.txt>'); process.exit(1); }
const satirlar = fs.readFileSync(nakaratDosya, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@600;800&display=swap" rel="stylesheet">`;
const temel = `html,body{margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden}`;

const kancaHTML = `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${temel}
  .k{position:absolute;left:70px;right:70px;top:700px;padding:56px 50px;border-radius:36px;
     background:rgba(10,4,8,.82);text-align:center;color:#fff3dc;
     font:800 76px/1.18 Inter,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.5)}
  .k b{color:#f2b45a}
</style></head><body><div class="k">${esc(kanca).replace(/\*(.+?)\*/g, '<b>$1</b>')}</div></body></html>`;

const nakaratHTML = `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${temel}
  .n{position:absolute;left:56px;right:56px;top:880px;padding:40px 36px;border-radius:30px;
     background:rgba(10,4,8,.8);text-align:center;color:#fff3dc}
  .n p{margin:0 0 18px;font:italic 700 52px/1.22 'Playfair Display',serif;text-shadow:0 3px 14px rgba(0,0,0,.7)}
  .n p:last-child{margin:0}
  .n p:nth-child(odd){color:#ffe2a8}
</style></head><body><div class="n">${satirlar.map(s => `<p>${esc(s)}</p>`).join('')}</div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(kancaHTML, { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(dir, 'kanca.png'), omitBackground: true });
  await p.setContent(nakaratHTML, { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(dir, 'nakarat.png'), omitBackground: true });
  await b.close();
  console.log('yazılar hazır:', dir);
})();
