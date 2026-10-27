// ============================================================
//  VOLTRA R — prosedürel elektrikli roadster (Three.js)  · v2 rötuşlu
//  Kullanım:
//    import * as THREE from 'three';
//    import { createRoadster, createBoostFX } from './roadster.js';
//    const car = createRoadster(THREE, { color: 0xb3121f });
//    scene.add(car.object);
//    const fx = createBoostFX(THREE, car);  scene.add(fx.object);
//    // her karede:
//    car.update(dt, { speed, steer, brake, boost });
//    fx.update(dt, boost);
//
//  Birim: metre.  Araç +Z yönüne bakar, Y yukarı, tekerler y=0'a basar.
//  Gaz/boost çıkış noktaları: car.exhaustPoints  (isimleri Exhaust_L / Exhaust_R)
//  Her çıkış noktasının +Z ekseni aracın arkasına doğru bakar.
// ============================================================

export function createRoadster(THREE, options = {}) {
  const opt = {
    color: 0xa50f1d,
    rimColor: 0x9aa0a8,
    caliperColor: 0xf2b705,
    seatColor: 0xe9e4da,
    quality: 1, // 0.5 = mobil için hafif, 1 = yüksek
    ...options,
  };
  const Q = Math.max(0.4, Math.min(1.5, opt.quality));

  const car = new THREE.Group();
  car.name = 'VoltraR';

  // ---------- Malzemeler ----------
  const M = {
    paint: new THREE.MeshPhysicalMaterial({ color: opt.color, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.04, name: 'Paint' }),
    trim: new THREE.MeshStandardMaterial({ color: 0x0b0b0d, metalness: 0.35, roughness: 0.5, name: 'Trim' }),
    gloss: new THREE.MeshPhysicalMaterial({ color: 0x050506, metalness: 0.3, roughness: 0.12, clearcoat: 1, name: 'GlossBlack' }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0b1218, metalness: 0.2, roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false, name: 'Glass' }),
    liner: new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 0.95, side: THREE.DoubleSide, name: 'Liner' }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.88, side: THREE.DoubleSide, name: 'Tire' }),
    rim: new THREE.MeshStandardMaterial({ color: opt.rimColor, metalness: 0.65, roughness: 0.28, name: 'Rim' }),
    rimDark: new THREE.MeshStandardMaterial({ color: 0x1c1d20, metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide, name: 'RimDark' }),
    disc: new THREE.MeshStandardMaterial({ color: 0x6d6f73, metalness: 0.9, roughness: 0.45, name: 'Disc' }),
    caliper: new THREE.MeshStandardMaterial({ color: opt.caliperColor, metalness: 0.3, roughness: 0.35, name: 'Caliper' }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 1, roughness: 0.12, name: 'Chrome' }),
    head: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe6f6ff, emissiveIntensity: 2.2, name: 'Headlight' }),
    tail: new THREE.MeshStandardMaterial({ color: 0x2a0000, emissive: 0xff1424, emissiveIntensity: 1.1, name: 'Taillight' }),
    vent: new THREE.MeshStandardMaterial({ color: 0x001018, emissive: 0x39c6ff, emissiveIntensity: 0.35, name: 'BoostGlow' }),
    seat: new THREE.MeshStandardMaterial({ color: opt.seatColor, roughness: 0.6, name: 'Seat' }),
    interior: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.75, name: 'Interior' }),
    screen: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x4fb7ff, emissiveIntensity: 0.6, name: 'Screen' }),
  };

  // ---------- Yardımcılar ----------
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const V2 = (x, y) => new THREE.Vector2(x, y);

  // Monoton kübik interpolasyon (anahtar noktalar arasında pürüzsüz eğri)
  function curve(keys) {
    const n = keys.length, xs = keys.map((k) => k[0]), ys = keys.map((k) => k[1]);
    const d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return (x) => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (x > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  }
  const smax = (a, b, k) => { const h = clamp01(0.5 + (b - a) / (2 * k)); return a * (1 - h) + b * h + k * h * (1 - h); };
  const sp = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);

  // Kesit kesit (loft) yüzey üretir: section(z, t) -> [x,y]  t: 0..1 çevre
  function loft(zs, ringN, point, closedRing = true) {
    const pos = [], idx = [];
    const rn = closedRing ? ringN : ringN + 1;
    for (const z of zs) for (let j = 0; j < rn; j++) { const [x, y] = point(z, j / ringN); pos.push(x, y, z); }
    for (let i = 0; i < zs.length - 1; i++) {
      for (let j = 0; j < ringN; j++) {
        const j2 = closedRing ? (j + 1) % ringN : j + 1;
        const a = i * rn + j, b = i * rn + j2, c = (i + 1) * rn + j, d = (i + 1) * rn + j2;
        idx.push(a, b, c, b, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  // Uçlarda sık, ortada seyrek z örnekleri
  function zSamples(z0, z1, n) {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n; const u = 0.5 - 0.5 * Math.cos(Math.PI * t); out.push(z0 + (z1 - z0) * (0.35 * t + 0.65 * u)); }
    return out;
  }

  const add = (geo, mat, name, parent = car) => {
    const m = new THREE.Mesh(geo, mat); m.name = name;
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m); return m;
  };

  // ---------- Ana gövde ----------
  const R = 0.345;   // lastik yarıçapı
  const AX = 1.3;    // aks konumu (z)
  const TRACK = 0.835;
  const RA = 0.4;    // çamurluk boşluğu yarıçapı
  const ZF = 2.17, ZR = -2.13;

  const topK = curve([[ZR, 0.72], [-2.06, 0.8], [-1.95, 0.85], [-1.7, 0.87], [-1.3, 0.86], [-0.6, 0.84], [0.3, 0.825], [0.9, 0.815], [1.3, 0.8], [1.6, 0.745], [1.85, 0.65], [2.02, 0.55], [2.12, 0.47], [ZF, 0.41]]);
  const botK = curve([[ZR, 0.42], [-2.05, 0.26], [-1.9, 0.175], [1.9, 0.175], [2.06, 0.22], [ZF, 0.3]]);
  const widK = curve([[ZR, 0.82], [-2.0, 0.92], [-1.6, 0.975], [-1.3, 0.99], [-0.6, 0.95], [0.3, 0.95], [1.3, 0.975], [1.55, 0.95], [1.8, 0.88], [2.0, 0.77], [ZF, 0.58]]);
  const endRound = (z) => {
    if (z > 1.98) return Math.sqrt(Math.max(0, 1 - ((z - 1.98) / (ZF - 1.98)) ** 2));
    if (z < -2.04) return Math.sqrt(Math.max(0, 1 - ((z + 2.04) / (ZR + 2.04)) ** 2));
    return 1;
  };
  const archAt = (z) => {
    let y = 0;
    for (const c of [AX, -AX]) { const d = z - c; if (Math.abs(d) < RA) y = Math.max(y, R + Math.sqrt(RA * RA - d * d)); }
    return y;
  };
  const cockpit = (z) => smooth(-1.5, -1.3, z) * (1 - smooth(0.46, 0.64, z));

  const HS = 0.31; // omuz yüksekliği (üst yarı kesit)
  function bodyPoint(z, t) {
    const e = endRound(z);
    const top = topK(z);
    const bot = smax(botK(z), archAt(z), 0.012);
    const arch = archAt(z);
    const hs = HS * Math.max(e, 0.001);
    const mid = top - hs;
    const w = widK(z) * e;
    const th = t * Math.PI * 2;
    const c = Math.cos(th), s = Math.sin(th);
    const x = w * sp(c, 2 / 3.4);
    let y;
    if (s >= 0) y = mid + hs * sp(s, 2 / 2.6);
    else y = mid > bot ? mid - (mid - bot) * Math.pow(-s, 2 / 7) : bot;
    // çamurluk kabuğu: yanlarda kemerin üstünde et kalsın (v1'de kemer kabuğu delip siyah delik açıyordu)
    if (arch > 0) { const m = smooth(0.5, 0.86, Math.abs(x) / Math.max(w, 1e-3)); y += (smax(y, arch + 0.065, 0.05) - y) * m; }
    y = smax(y, bot, 0.012);
    if (s > 0) {
      const ax = Math.abs(x);
      y -= 0.32 * cockpit(z) * (1 - smooth(0.64, 0.8, ax)) * e;                                   // kokpit
      const xn = x / Math.max(w, 1e-3);
      y -= (0.035 + 0.025 * smooth(0.7, 1.3, z) * (1 - smooth(1.5, 2.1, z))) * smooth(0.55, 1.0, z) * (1 - smooth(1.85, 2.15, z)) * Math.pow(Math.max(0, 1 - (xn / 0.8) ** 2), 1.5) * e; // kaput oluğu + çamurluk sırtları
      y -= 0.025 * smooth(-0.9, -1.25, z) * smooth(-1.9, -1.45, z) * Math.max(0, 1 - (xn / 0.7) ** 2) * e; // arka çamurluk kalçaları arası
      y -= 0.02 * smooth(-1.5, -1.75, z) * (1 - (x / Math.max(w, 1e-3)) ** 2) * e;              // arka kapak oluğu
    }
    return [x, y];
  }
  const body = add(loft(zSamples(ZR, ZF, Math.round(170 * Q)), Math.round(120 * Q), bodyPoint), M.paint, 'Body');

  // Cam kanopi (targa tavan)
  const cTop = curve([[-1.58, 0.8], [-1.3, 0.93], [-0.9, 1.05], [-0.45, 1.105], [0.0, 1.075], [0.25, 1.0], [0.5, 0.86], [0.72, 0.76]]);
  const cWid = curve([[-1.58, 0.62], [-1.1, 0.75], [-0.4, 0.78], [0.3, 0.75], [0.72, 0.62]]);
  const canopyPoint = (z, t) => {
    const th = t * Math.PI; // sadece üst yarı
    const x = cWid(z) * sp(Math.cos(th), 2 / 3.0);
    const y = 0.64 + (cTop(z) - 0.64) * sp(Math.sin(th), 2 / 2.2);
    return [x, y];
  };
  const canopy = add(loft(zSamples(-1.58, 0.72, Math.round(70 * Q)), Math.round(48 * Q), canopyPoint, false), M.glass, 'Canopy');
  canopy.castShadow = false;
  canopy.renderOrder = 2;
  // cam çerçevesi: ön cam pervazı, A sütunları, targa çemberi
  {
    const edge = (z, side) => new THREE.Vector3(side * cWid(z) * 0.985, 0.655, z);
    for (const side of [1, -1]) {
      const pts = []; for (let i = 0; i <= 16; i++) pts.push(edge(-1.56 + (0.7 + 1.56) * (i / 16), side));
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.round(40 * Q), 0.022, 8, false), M.gloss, 'CanopySill');
    }
    for (const zc of [0.7, -0.18]) {
      const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16, [x, y] = canopyPoint(zc, t); pts.push(new THREE.Vector3(x * 1.004, y + 0.004, zc)); }
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.round(40 * Q), zc > 0 ? 0.028 : 0.035, 8, false), M.gloss, zc > 0 ? 'WindshieldFrame' : 'TargaHoop');
    }
    for (const side of [1, -1]) {
      const pts = []; for (let i = 0; i <= 10; i++) { const z = 0.7 - (0.7 + 0.18) * (i / 10), [x, y] = canopyPoint(z, side > 0 ? 0.08 : 0.92); pts.push(new THREE.Vector3(x * 1.004, y + 0.003, z)); }
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.round(30 * Q), 0.024, 8, false), M.gloss, 'APillar');
    }
  }

  // Raycast ile yüzey noktası bulma (far, stop, ayna yerleşimi için)
  car.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  const solids = [body];
  function hit(origin, dir) {
    ray.set(origin, dir.clone().normalize());
    const h = ray.intersectObjects(solids, false)[0];
    return h ? { p: h.point.clone(), n: h.face.normal.clone().transformDirection(h.object.matrixWorld) } : null;
  }
  // Yüzeye yapışık şerit (tube) oluşturur
  function strip(points, radius, mat, name, offset = 0.004, flat = 0.55) {
    const pts = points.filter(Boolean).map((h) => h.p.clone().addScaledVector(h.n, offset));
    if (pts.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, Math.round(48 * Q), radius, Math.round(10 * Q), false);
    const m = add(geo, mat, name);
    m.userData.flat = flat;
    return m;
  }

  // ---------- Farlar ----------
  for (const sgn of [1, -1]) {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = sgn * (0.38 + 0.42 * t);
      const y = 0.53 - 0.05 * t * t;
      pts.push(hit(new THREE.Vector3(x, y, 4), new THREE.Vector3(0, 0, -1)));
    }
    strip(pts, 0.017, M.head, sgn > 0 ? 'HeadlightL' : 'HeadlightR', 0.006);
    // far altı ince gündüz çizgisi
    const pts2 = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts2.push(hit(new THREE.Vector3(sgn * (0.46 + 0.3 * t), 0.485 - 0.05 * t, 4), new THREE.Vector3(0, 0, -1)));
    }
    strip(pts2, 0.006, M.head, sgn > 0 ? 'DRL_L' : 'DRL_R', 0.004);
  }

  // Ön alt hava girişi
  {
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const x = -0.62 + 1.24 * (i / 10);
      pts.push(hit(new THREE.Vector3(x, 0.33, 4), new THREE.Vector3(0, 0, -1)));
    }
    strip(pts, 0.045, M.gloss, 'FrontIntake', -0.012);
  }

  // ---------- Stop lambası (boydan boya) ----------
  const tailPts = [];
  for (let i = 0; i <= 14; i++) {
    const x = -0.82 + 1.64 * (i / 14);
    tailPts.push(hit(new THREE.Vector3(x, 0.725, -4), new THREE.Vector3(0, 0, 1)));
  }
  strip(tailPts, 0.016, M.tail, 'Taillight', 0.006);

  // ---------- Difüzör + boost/gaz çıkışları ----------
  {
    const rearHit = hit(new THREE.Vector3(0, 0.3, -4), new THREE.Vector3(0, 0, 1));
    const zr = rearHit ? rearHit.p.z : -2.12;
    // ince, yukarı kıvrılan difüzör (v1'deki kutu arkadan dışarı taşıyordu)
    const diff = add(new THREE.BoxGeometry(1.36, 0.035, 0.55), M.gloss, 'Diffuser');
    diff.position.set(0, 0.22, zr + 0.3); diff.rotation.x = 0.32;
    for (let i = -3; i <= 3; i++) {
      const fin = add(new THREE.BoxGeometry(0.014, 0.09, 0.46), M.trim, 'DiffuserFin');
      fin.position.set(i * 0.19, 0.255, zr + 0.3); fin.rotation.x = 0.32;
    }
    // ördek kuyruğu spoiler dudağı
    const lipPts = [];
    for (let i = 0; i <= 16; i++) { const x = -0.78 + 1.56 * (i / 16); lipPts.push(hit(new THREE.Vector3(x, 0.79, -4), new THREE.Vector3(0, 0, 1))); }
    strip(lipPts, 0.022, M.paint, 'Ducktail', 0.012);
  }

  const exhaustPoints = [];
  for (const sgn of [1, -1]) {
    const h = hit(new THREE.Vector3(sgn * 0.52, 0.27, -4), new THREE.Vector3(0, 0, 1));
    const z = h ? h.p.z : -2.12;
    const ring = add(new THREE.TorusGeometry(0.062, 0.014, 12, Math.round(36 * Q)), M.chrome, 'ExhaustRing');
    ring.position.set(sgn * 0.52, 0.27, z - 0.02);
    const glow = add(new THREE.CircleGeometry(0.058, Math.round(32 * Q)), M.vent, 'ExhaustGlow');
    glow.rotation.y = Math.PI;
    glow.position.set(sgn * 0.52, 0.27, z - 0.005);
    const tube = add(new THREE.CylinderGeometry(0.062, 0.062, 0.1, Math.round(24 * Q), 1, true), M.liner, 'ExhaustTube');
    tube.rotation.x = Math.PI / 2;
    tube.position.set(sgn * 0.52, 0.27, z + 0.03);

    const ep = new THREE.Object3D();
    ep.name = sgn > 0 ? 'Exhaust_L' : 'Exhaust_R';
    ep.position.set(sgn * 0.52, 0.27, z - 0.04);
    ep.rotation.y = Math.PI; // +Z ekseni arkaya bakar
    ep.userData.isExhaust = true;
    car.add(ep);
    exhaustPoints.push(ep);
  }

  // ---------- Aynalar ----------
  for (const sgn of [1, -1]) {
    let h = null;
    for (let y = 0.84; y > 0.6 && !h; y -= 0.02) h = hit(new THREE.Vector3(sgn * 2, y, 0.42), new THREE.Vector3(-sgn, 0, 0));
    if (!h) continue;
    const g = new THREE.Group(); g.name = sgn > 0 ? 'MirrorL' : 'MirrorR';
    g.position.copy(h.p);
    const stalk = add(new THREE.BoxGeometry(0.12, 0.025, 0.05), M.trim, 'MirrorStalk', g);
    stalk.position.set(sgn * 0.05, 0.03, 0);
    const shell = add(new THREE.SphereGeometry(0.075, Math.round(20 * Q), Math.round(14 * Q)), M.paint, 'MirrorShell', g);
    shell.scale.set(1.25, 0.62, 0.75);
    shell.position.set(sgn * 0.13, 0.06, -0.01);
    const face = add(new THREE.CircleGeometry(0.06, 20), M.chrome, 'MirrorGlass', g);
    face.scale.set(1.2, 0.55, 1);
    face.rotation.y = Math.PI;
    face.position.set(sgn * 0.13, 0.06, -0.068);
    car.add(g);
  }

  // ---------- Etek, alt taban, çamurluk içleri ----------
  for (const sgn of [1, -1]) {
    const skirt = add(new THREE.BoxGeometry(0.05, 0.05, 1.7), M.gloss, 'SideSkirt');
    skirt.position.set(sgn * 0.93, 0.2, 0);
  }
  // yan hava kanalları (arka tekerlek önü) ve ön splitter
  for (const sgn of [1, -1]) {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10, z = 0.05 - 0.85 * t, y = 0.38 + 0.18 * t * t; pts.push(hit(new THREE.Vector3(sgn * 2, y, z), new THREE.Vector3(-sgn, 0, 0))); }
    strip(pts, 0.05, M.gloss, sgn > 0 ? 'SideScoopL' : 'SideScoopR', -0.02);
  }
  {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const x = -0.7 + 1.4 * (i / 12); pts.push(hit(new THREE.Vector3(x, 0.235, 4), new THREE.Vector3(0, 0, -1))); }
    strip(pts, 0.018, M.gloss, 'FrontSplitter', 0.01);
  }
  const floor = add(new THREE.BoxGeometry(1.5, 0.03, 3.9), M.trim, 'Underbody');
  floor.position.set(0, 0.175, 0);
  // v1'de tek parça 1.8 m'lik yuva iki tekerlek arasında kabinin içinden geçiyordu; artık her tekerleğe kendi yuvası
  for (const z of [AX, -AX]) for (const sgn of [1, -1]) {
    const liner = add(new THREE.CylinderGeometry(RA - 0.006, RA - 0.006, 0.36, Math.round(40 * Q), 1, true, Math.PI, Math.PI), M.liner, 'WheelWell');
    liner.rotation.z = -Math.PI / 2;
    liner.position.set(sgn * (TRACK - 0.02), R, z);
  }

  // ---------- İç mekan ----------
  const dash = add(new THREE.BoxGeometry(1.5, 0.16, 0.22), M.interior, 'Dashboard');
  dash.position.set(0, 0.66, 0.42);
  const screen = add(new THREE.PlaneGeometry(0.3, 0.17), M.screen, 'Screen');
  screen.position.set(0, 0.79, 0.33);
  screen.rotation.x = -0.5;
  const tunnel = add(new THREE.BoxGeometry(0.22, 0.18, 1.3), M.interior, 'Console');
  tunnel.position.set(0, 0.6, -0.4);
  const tub = add(new THREE.BoxGeometry(1.56, 0.02, 1.85), M.interior, 'Carpet');
  tub.position.set(0, 0.565, -0.4); // gövde tabanıyla üst üste binip titremesin
  const bulk = add(new THREE.BoxGeometry(1.56, 0.25, 0.04), M.interior, 'RearBulkhead');
  bulk.position.set(0, 0.64, -1.33);

  for (const sgn of [1, -1]) {
    const seat = new THREE.Group(); seat.name = sgn > 0 ? 'SeatL' : 'SeatR';
    seat.position.set(sgn * 0.37, 0.5, -0.6);
    const cushion = add(new THREE.CapsuleGeometry(0.11, 0.2, 6, 12), M.seat, 'SeatCushion', seat);
    cushion.rotation.x = Math.PI / 2; cushion.scale.set(2.0, 1.0, 0.55);
    cushion.position.set(0, 0.06, 0.05);
    const back = add(new THREE.CapsuleGeometry(0.12, 0.24, 6, 12), M.seat, 'SeatBack', seat);
    back.scale.set(1.85, 1, 0.55);
    back.rotation.x = -0.28;
    back.position.set(0, 0.27, -0.22);
    for (const s2 of [1, -1]) {
      const bol = add(new THREE.CapsuleGeometry(0.035, 0.3, 4, 8), M.interior, 'Bolster', seat);
      bol.rotation.x = -0.28; bol.position.set(s2 * 0.2, 0.25, -0.19);
    }
    car.add(seat);
  }
  // Direksiyon (sol direksiyon: +X tarafı)
  const wheelGrp = new THREE.Group(); wheelGrp.name = 'SteeringWheel';
  wheelGrp.position.set(0.37, 0.8, 0.12);
  wheelGrp.rotation.x = -0.35;
  add(new THREE.TorusGeometry(0.15, 0.02, 10, Math.round(40 * Q)), M.interior, 'WheelRim', wheelGrp);
  const spoke = add(new THREE.BoxGeometry(0.28, 0.03, 0.02), M.trim, 'WheelSpoke', wheelGrp);
  spoke.position.y = -0.01;
  const colm = add(new THREE.CylinderGeometry(0.025, 0.03, 0.3, 10), M.trim, 'Column', wheelGrp);
  colm.rotation.x = Math.PI / 2; colm.position.z = 0.15;
  car.add(wheelGrp);

  // ---------- Tekerlekler ----------
  const latheProfile = [
    [0.255, -0.13], [0.31, -0.136], [0.333, -0.128], [0.345, -0.1], [0.35, -0.04], [0.35, 0.04],
    [0.345, 0.1], [0.333, 0.128], [0.31, 0.136], [0.255, 0.13],
  ].map(([r, y]) => V2(r, y));
  const tireGeo = new THREE.LatheGeometry(latheProfile, Math.round(64 * Q));
  tireGeo.rotateZ(Math.PI / 2);
  const barrelGeo = new THREE.CylinderGeometry(0.256, 0.256, 0.25, Math.round(48 * Q), 1, true);
  barrelGeo.rotateZ(Math.PI / 2);
  const lipGeo = new THREE.TorusGeometry(0.25, 0.012, 8, Math.round(56 * Q));
  lipGeo.rotateY(Math.PI / 2);
  const faceGeo = new THREE.CircleGeometry(0.246, Math.round(48 * Q));
  faceGeo.rotateY(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(0.03, 0.2, 0.05);
  const hubGeo = new THREE.CylinderGeometry(0.062, 0.07, 0.05, 24);
  hubGeo.rotateZ(Math.PI / 2);
  const nutGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6);
  nutGeo.rotateZ(Math.PI / 2);
  const discGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.028, Math.round(48 * Q));
  discGeo.rotateZ(Math.PI / 2);
  const calGeo = new THREE.BoxGeometry(0.07, 0.16, 0.09);

  function makeWheel(name, x, z, front) {
    const pivot = new THREE.Group(); pivot.name = name;
    pivot.position.set(x, R, z);
    const hub = new THREE.Group(); hub.scale.x = x > 0 ? 1 : -1; // dış yüz dışarı baksın
    pivot.add(hub);
    const spin = new THREE.Group(); spin.name = name + '_Spin';
    hub.add(spin);

    add(tireGeo, M.rubber, 'Tire', spin);
    add(barrelGeo, M.rimDark, 'Barrel', spin);
    const back = add(faceGeo, M.rimDark, 'RimBack', spin); back.position.x = -0.02;
    add(lipGeo, M.rim, 'RimLip', spin).position.x = 0.115;
    // türbin tipi jant: 14 eğik kanat
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      const arm = new THREE.Group(); arm.rotation.x = a;
      const s = add(spokeGeo, M.rim, 'Spoke', arm);
      s.position.set(0.088, 0.15, 0);
      s.rotation.set(0.55, 0, 0.3); // kanat açısı + çukurluk
      s.scale.set(0.8, 1, 0.75);
      spin.add(arm);
    }
    add(hubGeo, M.rim, 'Hub', spin).position.x = 0.075;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const n = add(nutGeo, M.chrome, 'LugNut', spin);
      n.position.set(0.105, Math.cos(a) * 0.038, Math.sin(a) * 0.038);
    }
    const cap = add(new THREE.CircleGeometry(0.03, 20), M.gloss, 'CenterCap', spin);
    cap.rotation.y = Math.PI / 2; cap.position.x = 0.102;

    // dönmeyen parçalar: disk + kaliper
    const disc = add(discGeo, M.disc, 'BrakeDisc', hub); disc.position.x = 0.0;
    const cal = add(calGeo, M.caliper, 'Caliper', hub);
    cal.position.set(0.035, 0.13, front ? -0.11 : 0.11);
    cal.rotation.x = front ? 0.7 : -0.7;

    pivot.userData = { spin, front };
    car.add(pivot);
    return pivot;
  }

  const wheels = {
    fl: makeWheel('Wheel_FL', TRACK, AX, true),
    fr: makeWheel('Wheel_FR', -TRACK, AX, true),
    rl: makeWheel('Wheel_RL', TRACK, -AX, false),
    rr: makeWheel('Wheel_RR', -TRACK, -AX, false),
  };

  car.userData.exhaustPoints = exhaustPoints;
  car.userData.wheelRadius = R;

  // ---------- Çalışma zamanı API ----------
  let roll = 0;
  const state = { steer: 0 };
  return {
    object: car,
    wheels,
    exhaustPoints,
    materials: M,
    wheelRadius: R,
    /** speed: m/s (+ ileri), steer: -1..1 (+ sağ), brake: bool, boost: 0..1 */
    update(dt, { speed = 0, steer = 0, brake = false, boost = 0 } = {}) {
      roll += (speed * dt) / R;
      for (const w of Object.values(wheels)) w.userData.spin.rotation.x = roll;
      state.steer += (steer - state.steer) * Math.min(1, dt * 10);
      const a = -state.steer * 0.55;
      wheels.fl.rotation.y = a; wheels.fr.rotation.y = a;
      wheelGrp.rotation.z = state.steer * 1.2;
      M.tail.emissiveIntensity = brake ? 4 : 1.1;
      M.vent.emissiveIntensity = 0.35 + 4 * boost;
    },
    setColor(hex) { M.paint.color.set(hex); },
    setHeadlights(on) { M.head.emissiveIntensity = on ? 2.2 : 0.15; },
  };
}

// ------------------------------------------------------------
//  Boost / gaz partikülleri. fx.object'i sahneye ekleyin (dünya koordinatı).
// ------------------------------------------------------------
export function createBoostFX(THREE, roadster, { count = 600, color = 0x5fd0ff } = {}) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const life = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  let map = null;
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    map = new THREE.CanvasTexture(c);
  }
  const mat = new THREE.PointsMaterial({
    size: 0.16, map, vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.name = 'BoostFX';
  life.fill(0);
  for (let i = 0; i < count; i++) pos[i * 3 + 1] = -999;

  const base = new THREE.Color(color);
  const wp = new THREE.Vector3(), wd = new THREE.Vector3();
  let next = 0, carry = 0;
  const LIFE = 0.45;

  return {
    object: points,
    update(dt, boost = 0) {
      carry += boost * 520 * dt;
      while (carry >= 1) {
        carry -= 1;
        const ep = roadster.exhaustPoints[next % roadster.exhaustPoints.length];
        ep.getWorldPosition(wp); ep.getWorldDirection(wd);
        const i = next % count; next++;
        const sp = 2.5 + 5 * boost;
        pos[i * 3] = wp.x + (Math.random() - 0.5) * 0.05;
        pos[i * 3 + 1] = wp.y + (Math.random() - 0.5) * 0.05;
        pos[i * 3 + 2] = wp.z + (Math.random() - 0.5) * 0.05;
        vel[i * 3] = wd.x * sp + (Math.random() - 0.5) * 0.5;
        vel[i * 3 + 1] = wd.y * sp + Math.random() * 0.35;
        vel[i * 3 + 2] = wd.z * sp + (Math.random() - 0.5) * 0.5;
        life[i] = LIFE * (0.6 + Math.random() * 0.6);
      }
      for (let i = 0; i < count; i++) {
        if (life[i] <= 0) { col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 0; continue; }
        life[i] -= dt;
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        vel[i * 3] *= 0.96; vel[i * 3 + 1] *= 0.96; vel[i * 3 + 2] *= 0.96;
        const k = Math.max(0, life[i] / LIFE);
        const w = k * k;
        col[i * 3] = base.r * w + 0.5 * w * w;
        col[i * 3 + 1] = base.g * w + 0.5 * w * w;
        col[i * 3 + 2] = base.b * w + 0.5 * w * w;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    },
  };
}
