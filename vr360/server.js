// Osmo 360 → VR canlı önizleme sunucusu (bağımlılık yok, sadece Node.js)
// - public/ klasörünü HTTPS ile sunar (VR gözlükte WebXR için HTTPS şart)
// - /whep/<yol> isteklerini MediaMTX'e (127.0.0.1:8889) aktarır
// Çalıştır:  node server.js        (port: 8443)
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PORT = Number(process.env.PORT || 8443);
const MTX = process.env.MTX || 'http://127.0.0.1:8889';
const PUB = path.join(__dirname, 'public');
const KEY = path.join(__dirname, 'cert', 'key.pem');
const CRT = path.join(__dirname, 'cert', 'cert.pem');

function lanIPs() {
  return Object.values(os.networkInterfaces()).flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
}

function ensureCert() {
  if (fs.existsSync(KEY) && fs.existsSync(CRT)) return true;
  fs.mkdirSync(path.dirname(KEY), { recursive: true });
  try {
    const san = ['DNS:localhost', 'IP:127.0.0.1', ...lanIPs().map(ip => 'IP:' + ip)].join(',');
    execSync(`openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -keyout "${KEY}" -out "${CRT}" ` +
      `-subj "/CN=osmo360-vr" -addext "subjectAltName=${san}"`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.warn('! openssl bulunamadı; HTTP ile açılıyor (Quest\'te WebXR çalışmayabilir).');
    console.warn('  Windows: Git for Windows kurarsan openssl gelir. Sonra tekrar çalıştır.');
    return false;
  }
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

function handler(req, res) {
  if (req.url.startsWith('/whep/')) return proxy(req, res);
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(PUB, path.normalize(p));
  if (!file.startsWith(PUB) || !fs.existsSync(file)) { res.writeHead(404); return res.end('yok'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

// /whep/osmo            -> MTX/osmo/whep
// /whep/osmo/<oturum>   -> MTX/osmo/whep/<oturum>  (PATCH/DELETE)
function proxy(req, res) {
  const parts = req.url.slice(6).split('/');
  const stream = parts.shift();
  const target = new URL(`${MTX}/${stream}/whep${parts.length ? '/' + parts.join('/') : ''}`);
  const up = http.request(target, { method: req.method, headers: { ...req.headers, host: target.host } }, r => {
    const h = { ...r.headers };
    if (h.location) h.location = '/whep/' + h.location.replace(/^.*?\/([^/]+)\/whep/, '$1');
    res.writeHead(r.statusCode, h);
    r.pipe(res);
  });
  up.on('error', () => { res.writeHead(502); res.end('MediaMTX çalışmıyor mu? (mediamtx.exe açık olmalı)'); });
  req.pipe(up);
}

const secure = ensureCert();
const srv = secure ? https.createServer({ key: fs.readFileSync(KEY), cert: fs.readFileSync(CRT) }, handler)
                   : http.createServer(handler);
srv.listen(PORT, '0.0.0.0', () => {
  const proto = secure ? 'https' : 'http';
  console.log('\n=== Osmo 360 VR önizleme hazır ===');
  console.log(`PC'de:       ${proto}://localhost:${PORT}`);
  for (const ip of lanIPs()) console.log(`VR gözlükte: ${proto}://${ip}:${PORT}`);
  console.log('\nMimo canlı yayın (RTMP) adresi:');
  for (const ip of lanIPs()) console.log(`  rtmp://${ip}:1935/osmo`);
  console.log('\n(İlk açılışta "güvenli değil" uyarısı çıkar: Gelişmiş → Yine de devam et)\n');
});
