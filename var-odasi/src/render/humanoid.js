// Ayrıntılı oyuncu modeli: iskeletli (skinned) tek parça gövde + desenli forma.
// Görünen model güzellik içindir; VAR ölçümleri ve tıklama seçimi, skeleton.js'teki ölçüm
// geometrisiyle birebir aynı olan GÖRÜNMEZ parça gövdeleri (proxy) üzerinden yapılır.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PARTS, J, partBox } from '../sim/skeleton.js';
import { shirtTexture, kitStyle, shade } from './textures.js';
import { hashString } from '../core/rng.js';

const B = { BODY: 0, UARML: 1, UARMR: 2, FARML: 3, FARMR: 4, THIGHL: 5, THIGHR: 6, SHINL: 7, SHINR: 8, FOOTL: 9, FOOTR: 10 };
const NB = 11;
const HAIR = ['kisa', 'kisa', 'kazinmis', 'afro', 'uzun', 'kel', 'ibik', 'topuz', 'kisa', 'kazinmis'];

const _c = new THREE.Color();
function prep(geo, bone, color) {
  let g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  const n = g.attributes.position.count;
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  const col = new Float32Array(n * 3);
  const pos = g.attributes.position;
  for (let i = 0; i < n; i++) {
    const c = typeof color === 'function' ? color(pos.getX(i), pos.getY(i), pos.getZ(i)) : color;
    _c.set(c);
    col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b;
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { si[i * 4] = bone; sw[i * 4] = 1; }
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  return g;
}
// y0..y1 arasında konik tüp (y ekseni boyunca)
function tube(r0, r1, y0, y1, seg, open = true, rings = 3) {
  const g = new THREE.CylinderGeometry(r1, r0, y1 - y0, seg, rings, open);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
}
function ell(sx, sy, sz, x, y, z, seg, phi = Math.PI) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(4, Math.round(seg * 0.7)), 0, Math.PI * 2, 0, phi);
  g.scale(sx, sy, sz); g.translate(x, y, z);
  return g;
}
// Saç: kafatasına oturan kabuk. Saç çizgisinin altındaki köşeler kafatasının içine çekilir;
// böylece alın açık, ense ve favoriler doğal bir hatla kalır.
const SKULL = [0.093, 0.108, 0.103];
function hairShell(seg, vol, front = 0.42, back = -0.45, side = 0.0, y0 = 0.66) {
  const g = new THREE.SphereGeometry(1, seg + 4, seg + 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const nx = p.getX(i), ny = p.getY(i), nz = p.getZ(i);
    // nz > 0 arka (ense), nz < 0 ön (alın)
    const t = nz < 0 ? side + (front - side) * (-nz) : side + (back - side) * nz;
    const burns = Math.abs(nx) > 0.75 && nz < 0.3 && nz > -0.6 ? -0.12 : 0;
    const k = ny > t + burns ? vol : 0.96;
    p.setXYZ(i, nx * SKULL[0] * k, ny * SKULL[1] * k + y0, nz * SKULL[2] * k + 0.006);
  }
  g.computeVertexNormals();
  return g;
}
function box(sx, sy, sz, x, y, z) { const g = new THREE.BoxGeometry(sx, sy, sz); g.translate(x, y, z); return g; }
function lathe(profile, seg) { return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg); }

// Gövde: eliptik kesitli, göğüs önde dolgun, omuzlar yuvarlak. UV: forma dokusu düzeni.
function torsoGeo(NX, NY) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= NY; j++) {
    const t = j / NY;
    let y, rx, rzF, rzB;
    if (t < 0.8) {
      const k = t / 0.8;
      y = 0.07 + k * 0.39;
      const chest = Math.sin(Math.min(1, k * 1.15) * Math.PI * 0.5);
      rx = 0.168 + 0.024 * chest - (k < 0.3 ? 0.008 * Math.sin(k / 0.3 * Math.PI) : 0);
      rzF = 0.108 + 0.02 * Math.sin(k * Math.PI * 0.9);
      rzB = 0.1 + 0.01 * k;
    } else {
      const k = (t - 0.8) / 0.2;
      y = 0.46 + 0.075 * Math.sin(k * Math.PI * 0.5);
      const c = Math.cos(k * Math.PI * 0.5);
      rx = 0.065 + 0.127 * c;
      rzF = 0.055 + 0.073 * c;
      rzB = 0.055 + 0.056 * c;
    }
    for (let i = 0; i <= NX; i++) {
      const th = (i / NX) * Math.PI * 2;
      const s = Math.sin(th);
      pos.push(Math.cos(th) * rx, y, s * (s < 0 ? rzF : rzB));
      uv.push(1 - i / NX, 0.15 + 0.85 * t);
    }
  }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // dikiş sütunundaki normalleri eşitle
  const nrm = g.attributes.normal;
  for (let j = 0; j <= NY; j++) {
    const a = j * (NX + 1), b = a + NX;
    const x = (nrm.getX(a) + nrm.getX(b)) / 2, y = (nrm.getY(a) + nrm.getY(b)) / 2, z = (nrm.getZ(a) + nrm.getZ(b)) / 2;
    nrm.setXYZ(a, x, y, z); nrm.setXYZ(b, x, y, z);
  }
  return g;
}
function sleeveGeo(r0, r1, len, seg, vy0, vy1) {
  const g = tube(r0, r1, 0, len, seg, true, 2);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, uv.getX(i), vy0 + (p.getY(i) / len) * (vy1 - vy0));
  return g;
}

let SHARED = null;
function sharedMats(q) {
  if (SHARED && SHARED.q === q) return SHARED;
  SHARED = {
    q,
    body: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.02 }),
    proxy: new THREE.MeshBasicMaterial({ visible: false }),
    sphere: new THREE.SphereGeometry(1, 8, 6),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 8, 1),
    box: new THREE.BoxGeometry(1, 1, 1),
  };
  return SHARED;
}

/**
 * opts: { shirt, shorts, socks, skin, hair, num, name, boots, quality, kind ('player'|'gk'|'ref'|'ar'),
 *         teamId, crest:{c1,c2,txt}, seed }
 */
export class Humanoid {
  constructor(entId, opts) {
    const q = opts.quality;
    const S = sharedMats(q);
    this.entId = entId;
    this.group = new THREE.Group();
    const seg = q === 'dusuk' ? 8 : q === 'orta' ? 12 : 16;
    const h = hashString(String(opts.seed || entId) + (opts.name || ''));
    const style = opts.kind === 'ref' || opts.kind === 'ar' ? { pattern: 'duz', second: '#111111' } : kitStyle(opts.teamId, { shirt: opts.shirt, shorts: opts.shorts });
    const second = opts.second || style.second;
    const skin = opts.skin, skinD = shade(skin, -0.18), hairC = opts.hair || '#222';
    const sock = opts.socks, sockBand = opts.kind === 'ref' || opts.kind === 'ar' ? '#c6ff00' : second;
    const bootC = opts.boots || ['#111111', '#f2f2f2', '#ff3d00', '#00b0ff', '#ffd600', '#d500f9', '#111111'][h % 7];
    const bootAcc = bootC === '#111111' ? ['#ff3d00', '#00e676', '#ffd600', '#ffffff'][(h >> 3) % 4] : '#111111';
    const gk = opts.kind === 'gk';
    const gloves = gk ? ['#ff6d00', '#c6ff00', '#2979ff', '#ffffff'][(h >> 5) % 4] : skin;

    // ---------------- düz renkli gövde (köşe renkleri) ----------------
    const parts = [];
    const P = (g, bone, col) => parts.push(prep(g, bone, col));
    // şort + kalça
    const shortsStripe = (sideSign) => (x) => (x * sideSign > 0.082 ? second : opts.shorts);
    const sh0 = lathe([[0.15, -0.14], [0.172, -0.12], [0.182, -0.02], [0.178, 0.08], [0.17, 0.13]], seg); sh0.scale(1, 1, 0.7);
    P(sh0, B.BODY, opts.shorts);
    P(ell(0.155, 0.05, 0.1, 0, -0.125, 0.0, seg), B.BODY, opts.shorts);
    // boyun ve kafa
    P(tube(0.054, 0.05, 0.47, 0.58, seg), B.BODY, skin);
    P(ell(0.093, 0.108, 0.103, 0, 0.66, 0.006, seg + 4), B.BODY, skin);
    P(ell(0.07, 0.056, 0.078, 0, 0.607, -0.022, seg), B.BODY, skin);
    const nose = new THREE.ConeGeometry(0.015, 0.026, 8); nose.rotateX(-Math.PI / 2); nose.scale(1, 1.4, 1); nose.translate(0, 0.642, -0.104);
    P(nose, B.BODY, skinD);
    for (const sx of [-1, 1]) {
      P(ell(0.016, 0.028, 0.02, sx * 0.094, 0.655, 0.006, 8), B.BODY, skinD);
      P(ell(0.012, 0.008, 0.005, sx * 0.034, 0.668, -0.093, 8), B.BODY, '#efe9df');
      P(ell(0.0055, 0.0055, 0.003, sx * 0.034, 0.668, -0.097, 6), B.BODY, '#2a1a10');
      P(box(0.032, 0.008, 0.01, sx * 0.035, 0.688, -0.094), B.BODY, hairC);
    }
    P(box(0.036, 0.006, 0.008, 0, 0.616, -0.1), B.BODY, '#7a3b33');
    // saç modeli
    const hs = opts.kind === 'ref' || opts.kind === 'ar' ? 'kisa' : HAIR[h % HAIR.length];
    if (hs === 'kisa') P(hairShell(seg, 1.07), B.BODY, hairC);
    else if (hs === 'kazinmis') P(hairShell(seg, 1.025, 0.5, -0.35), B.BODY, shade(hairC, 0.12));
    else if (hs === 'afro') P(hairShell(seg, 1.32, 0.48, -0.25, 0.05, 0.668), B.BODY, hairC);
    else if (hs === 'uzun') { P(hairShell(seg, 1.09, 0.38, -0.95, -0.1), B.BODY, hairC); }
    else if (hs === 'ibik') { P(hairShell(seg, 1.015, 0.55, -0.3), B.BODY, shade(hairC, 0.2)); P(box(0.03, 0.045, 0.17, 0, 0.755, 0.01), B.BODY, hairC); }
    else if (hs === 'topuz') { P(hairShell(seg, 1.06, 0.4, -0.4), B.BODY, hairC); P(ell(0.042, 0.042, 0.042, 0, 0.745, 0.08, 8), B.BODY, hairC); }
    if ((h >> 7) % 4 === 0 && opts.kind !== 'ref') P(ell(0.074, 0.05, 0.08, 0, 0.6, -0.018, seg, Math.PI), B.BODY, shade(hairC, 0.05));
    // kollar
    for (const s of [0, 1]) {
      const ua = s ? B.UARMR : B.UARML, fa = s ? B.FARMR : B.FARML;
      if (!gk) P(tube(0.052, 0.045, 0.13, 0.29, seg), ua, skin);
      P(ell(0.045, 0.045, 0.045, 0, 0.29, 0, seg), ua, gk ? opts.shirt : skin);
      if (!gk) P(tube(0.045, 0.035, 0, 0.25, seg), fa, skin);
      P(ell(0.036, 0.05, 0.024, 0, 0.29, 0, seg), fa, gloves);
      P(ell(0.012, 0.025, 0.012, (s ? -1 : 1) * 0.03, 0.275, -0.01, 6), fa, gloves);
      if (gk) P(ell(0.045, 0.06, 0.03, 0, 0.29, 0, seg), fa, gloves);
    }
    // bacaklar
    for (const s of [0, 1]) {
      const th = s ? B.THIGHR : B.THIGHL, sh = s ? B.SHINR : B.SHINL, ft = s ? B.FOOTR : B.FOOTL;
      const sideSign = s ? -1 : 1; // bacak aşağı baktığı için yerel +x gövdenin soluna denk gelir
      P(tube(0.098, 0.092, -0.02, 0.19, seg, true, 2), th, shortsStripe(sideSign));
      P(tube(0.088, 0.064, 0.17, 0.45, seg), th, skin);
      P(ell(0.062, 0.062, 0.062, 0, 0.455, 0, seg), th, skin);
      P(lathe([[0.056, 0.0], [0.062, 0.05], [0.067, 0.13], [0.063, 0.22], [0.052, 0.33], [0.045, 0.42], [0.046, 0.47]], seg), sh, (x, y) => (y < 0.065 ? sockBand : sock));
      // kaval kemiği koruması hafif kabartı (önde)
      P(ell(0.05, 0.11, 0.022, 0, 0.2, -0.05, seg), sh, shade(sock, 0.06));
      // krampon
      P(ell(0.053, 0.044, 0.138, 0, 0.004, 0, seg), ft, bootC);
      P(ell(0.0545, 0.018, 0.1, 0, -0.006, 0.01, seg), ft, bootAcc);
      P(box(0.096, 0.014, 0.265, 0, -0.036, 0), ft, shade(bootC, -0.45));
      for (const [sx, sz] of [[-0.03, 0.09], [0.03, 0.09], [-0.03, 0.02], [0.03, 0.02], [-0.028, -0.09], [0.028, -0.09]]) {
        const st = new THREE.CylinderGeometry(0.007, 0.006, 0.014, 6); st.translate(sx, -0.049, sz); P(st, ft, '#cfcfcf');
      }
      P(tube(0.05, 0.047, 0.03, 0.06, seg), ft, bootC);
    }
    const bodyGeo = mergeGeometries(parts);
    // ---------------- forma (dokulu) ----------------
    const sp = [];
    const N = q === 'dusuk' ? 18 : 30;
    sp.push(prep(torsoGeo(N, q === 'dusuk' ? 10 : 16), B.BODY, '#ffffff'));
    for (const s of [0, 1]) {
      const ua = s ? B.UARMR : B.UARML, fa = s ? B.FARMR : B.FARML;
      const len = gk ? 0.29 : 0.17;
      sp.push(prep(sleeveGeo(0.068, gk ? 0.054 : 0.062, len, seg, gk ? 0.12 : 0.12, gk ? 0.1 : 0.015), ua, '#ffffff'));
      const sh = prep(ell(0.069, 0.069, 0.069, 0, 0.01, 0, seg), ua, '#ffffff');
      const su = sh.attributes.uv; for (let i = 0; i < su.count; i++) su.setXY(i, 0.5, 0.1);
      sp.push(sh);
      if (gk) sp.push(prep(sleeveGeo(0.05, 0.04, 0.24, seg, 0.1, 0.015), fa, '#ffffff'));
    }
    const shirtGeo = mergeGeometries(sp);
    const shirtMap = shirtTexture({
      shirt: opts.shirt, second, pattern: style.pattern, num: opts.num, name: opts.name, hi: q === 'yuksek',
      crest: opts.crest, official: opts.kind === 'ref' || opts.kind === 'ar', collar: opts.kind === 'ref' || opts.kind === 'ar' ? '#111111' : undefined,
    });
    const shirtMat = q === 'yuksek'
      ? new THREE.MeshPhysicalMaterial({ map: shirtMap, roughness: 0.74, metalness: 0, sheen: 0.6, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff) })
      : new THREE.MeshStandardMaterial({ map: shirtMap, roughness: 0.72 });
    this.ownMats = [shirtMat];
    this.ownTex = [shirtMap];
    this.ownGeo = [bodyGeo, shirtGeo];

    // iskelet
    this.bones = [];
    for (let i = 0; i < NB; i++) { const b = new THREE.Bone(); b.matrixAutoUpdate = false; this.bones.push(b); }
    const inv = this.bones.map(() => new THREE.Matrix4());
    this.skeleton = new THREE.Skeleton(this.bones, inv);
    const shadows = q !== 'dusuk';
    this.body = new THREE.SkinnedMesh(bodyGeo, S.body);
    this.shirt = new THREE.SkinnedMesh(shirtGeo, shirtMat);
    for (const m of [this.body, this.shirt]) {
      m.frustumCulled = false;
      m.castShadow = shadows;
      m.receiveShadow = q === 'yuksek';
      m.bind(this.skeleton, new THREE.Matrix4());
      this.group.add(m);
    }
    for (const b of this.bones) this.body.add(b);

    // görünmez ölçüm/seçim gövdeleri
    this.meshes = [];
    for (let i = 0; i < PARTS.length; i++) {
      const p = PARTS[i];
      const geo = p.kind === 'sphere' ? S.sphere : p.kind === 'cyl' ? S.cyl : S.box;
      const m = new THREE.Mesh(geo, S.proxy);
      m.matrixAutoUpdate = false;
      m.userData = { ent: entId, part: i };
      this.group.add(m);
      this.meshes.push(m);
    }
    // aksesuarlar
    if (opts.kind === 'ref') {
      this.card = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.105, 0.004), new THREE.MeshStandardMaterial({ color: 0xffd400, roughness: 0.4, emissive: 0x332a00 }));
      this.card.visible = false;
      this.group.add(this.card);
    }
    if (opts.kind === 'ar') {
      const fg = new THREE.Group();
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.58, 8), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.5 }));
      stick.position.y = 0.27;
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48;
      const g = cv.getContext('2d');
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#ffd000' : '#e8102a'; g.fillRect(x * 16, y * 12, 16, 12); }
      const ft = new THREE.CanvasTexture(cv); ft.colorSpace = THREE.SRGBColorSpace;
      const clothGeo = new THREE.PlaneGeometry(0.34, 0.26, 6, 3);
      const cp = clothGeo.attributes.position;
      for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 14) * 0.015);
      clothGeo.computeVertexNormals();
      const cloth = new THREE.Mesh(clothGeo, new THREE.MeshStandardMaterial({ map: ft, side: THREE.DoubleSide, roughness: 0.8 }));
      cloth.position.set(0.18, 0.42, 0);
      fg.add(stick, cloth);
      this.flag = fg;
      this.group.add(fg);
      this.ownTex.push(ft);
    }
  }

  dispose() {
    for (const g of this.ownGeo) g.dispose();
    for (const m of this.ownMats) m.dispose();
    for (const t of this.ownTex) t.dispose();
    this.skeleton.dispose();
  }

  setProxyCyl(mesh, j, a, b, r) {
    _a.set(j[a * 3], j[a * 3 + 1], j[a * 3 + 2]);
    _b.set(j[b * 3], j[b * 3 + 1], j[b * 3 + 2]);
    _v.subVectors(_b, _a);
    const len = _v.length() || 1e-4;
    _v.divideScalar(len);
    _q.setFromUnitVectors(UP, _v);
    _s.set(r, len, r);
    _a.addScaledVector(_v, len / 2);
    mesh.matrix.compose(_a, _q, _s);
  }

  limbBone(bone, j, a, b, sk) {
    _a.set(j[a * 3], j[a * 3 + 1], j[a * 3 + 2]);
    _b.set(j[b * 3], j[b * 3 + 1], j[b * 3 + 2]);
    _y.subVectors(_b, _a).normalize();
    _z.set(-sk.fwd[0], -sk.fwd[1], -sk.fwd[2]);
    _z.addScaledVector(_y, -_z.dot(_y));
    if (_z.lengthSq() < 1e-6) { _z.set(sk.right[0], sk.right[1], sk.right[2]); _z.addScaledVector(_y, -_z.dot(_y)); }
    _z.normalize();
    _x.crossVectors(_y, _z);
    bone.matrix.makeBasis(_x, _y, _z).setPosition(_a);
    bone.matrixWorldNeedsUpdate = true;
  }

  update(sk, pose, p1) {
    const j = sk.j;
    // kemikler
    const bb = this.bones;
    _x.set(sk.right[0], sk.right[1], sk.right[2]);
    _y.set(sk.up[0], sk.up[1], sk.up[2]);
    _z.set(-sk.fwd[0], -sk.fwd[1], -sk.fwd[2]);
    bb[B.BODY].matrix.makeBasis(_x, _y, _z).setPosition(j[0], j[1], j[2]);
    bb[B.BODY].matrixWorldNeedsUpdate = true;
    this.limbBone(bb[B.UARML], j, J.SHL, J.ELL, sk);
    this.limbBone(bb[B.UARMR], j, J.SHR, J.ELR, sk);
    this.limbBone(bb[B.FARML], j, J.ELL, J.HANDL, sk);
    this.limbBone(bb[B.FARMR], j, J.ELR, J.HANDR, sk);
    this.limbBone(bb[B.THIGHL], j, J.HIPL, J.KNEEL, sk);
    this.limbBone(bb[B.THIGHR], j, J.HIPR, J.KNEER, sk);
    this.limbBone(bb[B.SHINL], j, J.KNEEL, J.ANKL, sk);
    this.limbBone(bb[B.SHINR], j, J.KNEER, J.ANKR, sk);
    for (const [bi, pi] of [[B.FOOTL, 13], [B.FOOTR, 14]]) {
      const bx = partBox(sk, pi, _box);
      _x.set(bx.ax[0][0], bx.ax[0][1], bx.ax[0][2]);
      _y.set(bx.ax[1][0], bx.ax[1][1], bx.ax[1][2]);
      _z.set(bx.ax[2][0], bx.ax[2][1], bx.ax[2][2]);
      bb[bi].matrix.makeBasis(_x, _y, _z).setPosition(bx.c[0], bx.c[1], bx.c[2]);
      bb[bi].matrixWorldNeedsUpdate = true;
    }
    // görünmez ölçüm gövdeleri
    for (let i = 0; i < PARTS.length; i++) {
      const p = PARTS[i], mesh = this.meshes[i];
      if (p.kind === 'sphere') {
        _a.set(j[p.a * 3], j[p.a * 3 + 1], j[p.a * 3 + 2]);
        _q.identity(); _s.set(p.r, p.r, p.r);
        mesh.matrix.compose(_a, _q, _s);
      } else if (p.kind === 'cyl') this.setProxyCyl(mesh, j, p.a, p.b, p.r);
      else {
        const bx = partBox(sk, i, _box);
        _x.set(bx.ax[0][0], bx.ax[0][1], bx.ax[0][2]);
        _y.set(bx.ax[1][0], bx.ax[1][1], bx.ax[1][2]);
        _z.set(bx.ax[2][0], bx.ax[2][1], bx.ax[2][2]);
        if (p.kind !== 'foot') _z.negate();
        _m.makeBasis(_x, _y, _z);
        _m.scale(_s.set(bx.h[0] * 2, bx.h[1] * 2, bx.h[2] * 2));
        _m.setPosition(bx.c[0], bx.c[1], bx.c[2]);
        mesh.matrix.copy(_m);
      }
    }
    if (this.card) {
      this.card.visible = pose === 7;
      if (this.card.visible) {
        this.card.material.color.set(p1 >= 2 ? 0xe00000 : 0xffd400);
        this.card.material.emissive.set(p1 >= 2 ? 0x330000 : 0x332a00);
        this.card.position.set(j[J.HANDR * 3], j[J.HANDR * 3 + 1] + 0.08, j[J.HANDR * 3 + 2]);
        this.card.rotation.set(0, -Math.atan2(sk.fwd[2], sk.fwd[0]) + Math.PI / 2, 0);
      }
    }
    if (this.flag) {
      _a.set(j[J.HANDR * 3], j[J.HANDR * 3 + 1], j[J.HANDR * 3 + 2]);
      _b.set(j[J.ELR * 3], j[J.ELR * 3 + 1], j[J.ELR * 3 + 2]);
      _v.subVectors(_a, _b).normalize();
      this.flag.position.copy(_a);
      this.flag.quaternion.setFromUnitVectors(UP, _v);
    }
  }
}

const UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _m = new THREE.Matrix4();
const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
const _box = {};
