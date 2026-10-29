// Stadyum: basamaklı tribünler, koltuklar, seyirciler, çelik makaslı çatı, projektörler,
// LED panolar, yedek kulübeleri, foto muhabirleri, TV platformu, skor ekranı ve şehir silüeti.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { personGeometry, crowdMaterial } from './crowd.js';
import { ledTexture, windowsTexture, glowTexture, scoreboardCanvas, shade, kitStyle } from './textures.js';

const ROW_D = 0.85, ROW_H = 0.42, SLOT = 0.6;

function rnd(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

// Basamaklı profil (x = derinlik, y = yükseklik), z boyunca uzatılır
function tierGeo(rows, h0, wall, len) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(0, h0 + wall);
  sh.lineTo(0.25, h0 + wall); sh.lineTo(0.25, h0);
  for (let r = 0; r < rows; r++) {
    const y = h0 + r * ROW_H;
    sh.lineTo(0.25 + r * ROW_D, y + ROW_H); sh.lineTo(0.25 + (r + 1) * ROW_D, y + ROW_H);
  }
  const D = 0.25 + rows * ROW_D;
  sh.lineTo(D, h0 + rows * ROW_H + 1.6); sh.lineTo(D + 0.4, h0 + rows * ROW_H + 1.6); sh.lineTo(D + 0.4, 0);
  sh.lineTo(0, 0);
  return new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false, steps: 1 });
}

export function buildStadium(q, home, away) {
  const group = new THREE.Group();
  const R = rnd(4242);
  const concrete = new THREE.MeshStandardMaterial({ color: 0x6b7078, roughness: 0.92, metalness: 0, side: THREE.DoubleSide });
  const darkConc = new THREE.MeshStandardMaterial({ color: 0x3b4048, roughness: 0.9, side: THREE.DoubleSide });
  const steel = new THREE.MeshStandardMaterial({ color: 0xb8c0c8, roughness: 0.35, metalness: 0.8 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xa8c8e0, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.7, metalness: 0.3, side: THREE.DoubleSide });
  const boardSide = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.5 });
  const hk = home.kit || home, ak = away.kit || away;
  const hStyle = kitStyle(home.id, hk), aStyle = kitStyle(away.id, ak);
  const mtx = new THREE.Matrix4(), col = new THREE.Color(), rot = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), dv = new THREE.Vector3();

  // ---------------- tribün bölümleri ----------------
  const sections = [
    { axis: 'x', sign: -1, front: 44, len: 118, rows: 18, h0: 0.2, wall: 1.2, name: 'anaAlt' },
    { axis: 'x', sign: -1, front: 56, len: 118, rows: 18, h0: 10.8, wall: 1.1, name: 'anaUst' },
    { axis: 'x', sign: 1, front: 44, len: 118, rows: 18, h0: 0.2, wall: 1.2, name: 'karsiAlt' },
    { axis: 'x', sign: 1, front: 56, len: 118, rows: 18, h0: 10.8, wall: 1.1, name: 'karsiUst' },
    { axis: 'z', sign: 1, front: 64, len: 72, rows: 24, h0: 0.2, wall: 1.2, name: 'evKale' },
    { axis: 'z', sign: -1, front: 64, len: 72, rows: 24, h0: 0.2, wall: 1.2, name: 'deplasmanKale' },
  ];
  const place = (S, d, h, a) => (S.axis === 'x' ? [a, h, S.sign * (S.front + d)] : [S.sign * (S.front + d), h, a]);
  for (const S of sections) {
    const g = tierGeo(S.rows, S.h0, S.wall, S.len);
    const m = new THREE.Matrix4();
    if (S.axis === 'x') m.set(0, 0, 1, -S.len / 2, 0, 1, 0, 0, S.sign, 0, 0, S.sign * S.front, 0, 0, 0, 1);
    else m.set(S.sign, 0, 0, S.sign * S.front, 0, 1, 0, 0, 0, 0, 1, -S.len / 2, 0, 0, 0, 1);
    g.applyMatrix4(m);
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, S.h0 > 5 ? darkConc : concrete);
    mesh.receiveShadow = q === 'yuksek';
    group.add(mesh);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(12, 9, 12), concrete);
    c.position.set(sx * 65, 4.5, sz * 50);
    c.rotation.y = Math.PI / 4;
    group.add(c);
  }

  // ---------------- koltuklar ve seyirciler ----------------
  const occ = q === 'yuksek' ? 0.72 : q === 'orta' ? 0.42 : 0.2;
  const personGeo = personGeometry(q === 'yuksek');
  const cmat = crowdMaterial();
  const seatGeo = (() => {
    const a = new THREE.BoxGeometry(0.46, 0.06, 0.4); a.translate(0, 0.42, 0.05);
    const b = new THREE.BoxGeometry(0.46, 0.42, 0.05); b.translate(0, 0.65, 0.24);
    return mergeGeometries([a, b]);
  })();
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const crowds = [];
  const neutral = ['#2b2f36', '#dcdcdc', '#465260', '#7a6a5a', '#1e3d59', '#5a2a2a', '#9e9e9e', '#14324a'];
  const seatPalette = { anaAlt: hk.shirt, anaUst: shade(hk.shirt, -0.4), karsiAlt: '#5b6470', karsiUst: shade(hk.shirt, -0.25), evKale: hStyle.second, deplasmanKale: '#5b6470' };
  for (const S of sections) {
    const slots = Math.floor(S.len / SLOT);
    const people = [], seats = [];
    const yaw = S.axis === 'x' ? (S.sign > 0 ? 0 : Math.PI) : (S.sign > 0 ? Math.PI / 2 : -Math.PI / 2);
    for (let r = 0; r < S.rows; r++) {
      for (let k = 0; k < slots; k++) {
        const a = -S.len / 2 + (k + 0.5) * SLOT;
        const p = place(S, 0.25 + r * ROW_D + 0.3, S.h0 + (r + 1) * ROW_H, a);
        seats.push(p);
        if (R() < occ) people.push([p, r, a]);
      }
    }
    if (q === 'yuksek') {
      const im = new THREE.InstancedMesh(seatGeo, seatMat, seats.length);
      const base = new THREE.Color(seatPalette[S.name] || '#566');
      rot.setFromAxisAngle(up, yaw);
      seats.forEach((p, i) => {
        mtx.compose(pos.set(p[0], p[1] - ROW_H, p[2]), rot, sc.set(1, 1, 1));
        im.setMatrixAt(i, mtx);
        im.setColorAt(i, col.copy(base).multiplyScalar(0.85 + R() * 0.2));
      });
      im.computeBoundingSphere();
      group.add(im);
    }
    if (!people.length) continue;
    const im = new THREE.InstancedMesh(personGeo, cmat, people.length);
    people.forEach(([p, r, a], i) => {
      rot.setFromAxisAngle(up, yaw + (R() - 0.5) * 0.5);
      const hgt = 0.9 + R() * 0.18;
      mtx.compose(pos.set(p[0] + (R() - 0.5) * 0.12, p[1] - ROW_H + 0.02, p[2]), rot, sc.set(hgt, hgt, hgt));
      im.setMatrixAt(i, mtx);
      let c;
      if (S.name === 'evKale') c = r % 4 < 2 ? hk.shirt : hStyle.second; // çizgili koreografi
      else if (S.name === 'deplasmanKale') c = a > 0 ? (R() < 0.8 ? ak.shirt : aStyle.second) : (R() < 0.55 ? hk.shirt : neutral[(R() * neutral.length) | 0]);
      else { const pr = R(); c = pr < 0.58 ? hk.shirt : pr < 0.68 ? hStyle.second : pr < 0.74 ? ak.shirt : neutral[(R() * neutral.length) | 0]; }
      im.setColorAt(i, col.set(c).multiplyScalar(0.75 + R() * 0.3));
    });
    im.computeBoundingSphere();
    group.add(im);
    crowds.push(im);
  }

  // ---------------- LED panolar ----------------
  const ledA = ledTexture([['VAR ODASI', '#ffffff'], ['REKLAMSIZ FUTBOL', '#22d36b'], ['FAIR PLAY', '#ffd400'], ['HAKEME SAYGI', '#4fc3f7']]);
  const ledB = ledTexture([['ADİL OYUN', '#ffffff'], ['İNTERNETSİZ', '#22d36b'], ['KURGUSAL LİG', '#ff9100'], ['SAYGI', '#ffffff']], '#0a0414');
  const boards = [];
  const addBoard = (x, z, len, rotY, base) => {
    const t = base.clone(); t.needsUpdate = true;
    t.repeat.set(len / 30, 1);
    const mat = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 1.1, roughness: 0.4 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.9, 0.16), [boardSide, boardSide, boardSide, boardSide, mat, mat]);
    m.position.set(x, 0.45, z); m.rotation.y = rotY;
    group.add(m);
    boards.push(t);
  };
  addBoard(-27, -38.6, 52, 0, ledA); addBoard(27, -38.6, 52, 0, ledB);
  addBoard(0, 38.6, 110, Math.PI, ledB);
  addBoard(-58, -20, 28, Math.PI / 2, ledA); addBoard(-58, 20, 28, Math.PI / 2, ledB);
  addBoard(58, -20, 28, -Math.PI / 2, ledB); addBoard(58, 20, 28, -Math.PI / 2, ledA);

  // ---------------- çatı + çelik makaslar + projektörler ----------------
  const trussSegs = [];
  const lampPos = [];
  const roofDefs = [
    { axis: 'x', sign: -1, front: 46, back: 76, len: 124, y0: 29, y1: 34 },
    { axis: 'x', sign: 1, front: 46, back: 76, len: 124, y0: 29, y1: 34 },
    { axis: 'z', sign: 1, front: 63, back: 88, len: 78, y0: 25, y1: 29 },
    { axis: 'z', sign: -1, front: 63, back: 88, len: 78, y0: 25, y1: 29 },
  ];
  for (const D of roofDefs) {
    const depth = D.back - D.front;
    const P = (d, y, a) => (D.axis === 'x' ? new THREE.Vector3(a, y, D.sign * (D.front + d)) : new THREE.Vector3(D.sign * (D.front + d), y, a));
    const tilt = Math.atan2(D.y1 - D.y0, depth);
    for (const [d0, d1, mat] of [[0, depth * 0.45, glass], [depth * 0.45, depth, roofMat]]) {
      const a = P(d0, D.y0 + (D.y1 - D.y0) * d0 / depth + 0.6, 0), b = P(d1, D.y0 + (D.y1 - D.y0) * d1 / depth + 0.6, 0);
      const L2 = a.distanceTo(b);
      const pl = new THREE.Mesh(new THREE.BoxGeometry(D.axis === 'x' ? D.len : L2, 0.12, D.axis === 'x' ? L2 : D.len), mat);
      pl.position.addVectors(a, b).multiplyScalar(0.5);
      if (D.axis === 'x') pl.rotation.x = -D.sign * tilt; else pl.rotation.z = D.sign * tilt;
      group.add(pl);
    }
    for (let a = -D.len / 2; a <= D.len / 2 + 0.01; a += 8) {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const d0 = (depth * i) / n, d1 = (depth * (i + 1)) / n;
        const yt0 = D.y0 + (D.y1 - D.y0) * d0 / depth, yt1 = D.y0 + (D.y1 - D.y0) * d1 / depth;
        const yb0 = yt0 - 2.4 * (1 - i / n) - 0.8, yb1 = yt1 - 2.4 * (1 - (i + 1) / n) - 0.8;
        trussSegs.push([P(d0, yt0, a), P(d1, yt1, a), 0.11]);
        trussSegs.push([P(d0, yb0, a), P(d1, yb1, a), 0.09]);
        trussSegs.push([P(d0, yb0, a), P(d1, yt1, a), 0.06]);
        trussSegs.push([P(d1, yb1, a), P(d1, yt1, a), 0.06]);
      }
      trussSegs.push([P(depth, 0, a), P(depth, D.y1, a), 0.28]);
    }
    trussSegs.push([P(0, D.y0 - 0.2, -D.len / 2), P(0, D.y0 - 0.2, D.len / 2), 0.35]);
    for (let a = -D.len / 2 + 2; a <= D.len / 2 - 2; a += 3.2) lampPos.push(P(-0.3, D.y0 - 0.9, a));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    trussSegs.push([new THREE.Vector3(sx * 70, 0, sz * 56), new THREE.Vector3(sx * 70, 42, sz * 56), 0.55]);
    for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) lampPos.push(new THREE.Vector3(sx * (70 - 1.5 + k), 40 + i * 1.2, sz * 54.8));
  }
  const tm = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, q === 'dusuk' ? 5 : 8, 1), steel, trussSegs.length);
  trussSegs.forEach(([a, b, r], i) => {
    dv.subVectors(b, a); const len = dv.length(); dv.normalize();
    rot.setFromUnitVectors(up, dv);
    mtx.compose(pos.addVectors(a, b).multiplyScalar(0.5), rot, sc.set(r, len, r));
    tm.setMatrixAt(i, mtx);
  });
  tm.computeBoundingSphere();
  group.add(tm);
  const lampFace = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.7, 0.05), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6dd, emissiveIntensity: 3.2 }), lampPos.length);
  const lampBody = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, 0.78, 0.42), steel, lampPos.length);
  const o = new THREE.Object3D();
  const glows = [];
  lampPos.forEach((p, i) => {
    o.position.copy(p); o.rotation.set(0, 0, 0); o.lookAt(0, -4, 0); o.updateMatrix();
    lampFace.setMatrixAt(i, o.matrix);
    o.translateZ(-0.24); o.updateMatrix();
    lampBody.setMatrixAt(i, o.matrix);
    if (i % 2 === 0) glows.push(p);
  });
  lampFace.computeBoundingSphere(); lampBody.computeBoundingSphere();
  group.add(lampFace, lampBody);
  const gmat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xfff3d6, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  for (const p of glows) { const s = new THREE.Sprite(gmat); s.position.copy(p); s.scale.set(5.5, 5.5, 1); s.renderOrder = 5; group.add(s); }
  if (q === 'yuksek') {
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0.03, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const from = new THREE.Vector3(sx * 69, 41, sz * 55), to = new THREE.Vector3(sx * 22, 0, sz * 12);
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 22, from.distanceTo(to), 24, 1, true), beamMat);
      dv.subVectors(from, to).normalize();
      cone.quaternion.setFromUnitVectors(up, dv);
      cone.position.addVectors(from, to).multiplyScalar(0.5);
      group.add(cone);
    }
  }

  // ---------------- yedek kulübeleri, teknik ekip, foto muhabirleri, TV platformu ----------------
  const extra = [];
  for (const [t, sx] of [[0, -1], [1, 1]]) {
    const kit = t === 0 ? hk : ak;
    const x0 = sx * 10;
    const bench = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 1.2), darkConc);
    bench.position.set(x0, 0.25, -41.4); group.add(bench);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 9.4, 18, 1, true, 0, Math.PI), glass);
    shell.rotation.z = Math.PI / 2; shell.position.set(x0, 0.4, -41.4);
    group.add(shell);
    for (const e of [-4.7, 4.7]) {
      const f = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 6, 18, Math.PI), steel);
      f.rotation.y = Math.PI / 2; f.position.set(x0 + e, 0.4, -41.4); group.add(f);
    }
    for (let i = 0; i < 7; i++) extra.push([x0 - 3.6 + i * 1.2, 0.05, -41.6, 0, 0.8, i < 6 ? kit.shirt : '#1a1a1a']);
    extra.push([x0 + sx * 2, 0, -36.9, sx * 0.4, 1.0, '#151515']);
    extra.push([x0 - sx * 3, 0, -37.3, -sx * 0.3, 0.98, '#26323e']);
  }
  const R2 = rnd(77);
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) {
    const z = (i < 3 ? -1 : 1) * (6 + (i % 3) * 5 + R2() * 2);
    extra.push([sx * 55.4, -0.5, z, sx > 0 ? -Math.PI / 2 : Math.PI / 2, 0.72, '#ff9100']);
  }
  const gantry = new THREE.Mesh(new THREE.BoxGeometry(84, 0.25, 2.2), steel);
  gantry.position.set(0, 18.7, -55.2); group.add(gantry);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(84, 0.06, 0.06), steel);
  rail.position.set(0, 19.8, -54.15); group.add(rail);
  const camMat = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.4, metalness: 0.6 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.15, metalness: 0.9 });
  for (const x of [-30, -12, 8, 26]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.9), camMat); c.position.set(x, 19.6, -55); group.add(c);
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.6, 12), lensMat); l.rotation.x = Math.PI / 2; l.position.set(x, 19.65, -54.3); group.add(l);
    extra.push([x - 0.7, 18.83, -55.6, 0, 1, '#2d2d2d']);
  }
  {
    // kişiler -z'ye bakar; döndürme: yaw (π = +z'ye, yani sahaya)
    const im = new THREE.InstancedMesh(personGeo, cmat, extra.length);
    extra.forEach(([x, y, z, yaw, s, c], i) => {
      rot.setFromAxisAngle(up, Math.PI + yaw);
      mtx.compose(pos.set(x, y, z), rot, sc.set(s, s, s));
      im.setMatrixAt(i, mtx); im.setColorAt(i, col.set(c));
    });
    im.computeBoundingSphere();
    group.add(im);
  }

  // ---------------- skor ekranı ----------------
  const sb = scoreboardCanvas();
  const sbMat = new THREE.MeshStandardMaterial({ map: sb.t, emissiveMap: sb.t, emissive: 0xffffff, emissiveIntensity: 1.25, roughness: 0.3 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(19, 9.5), sbMat);
  screen.position.set(-70, 22, 0); screen.rotation.y = Math.PI / 2;
  const sframe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 10.6, 20.2), boardSide);
  sframe.position.set(-70.5, 22, 0);
  for (const z of [-7, 7]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.6, 17, 0.6), steel); l.position.set(-70.8, 8.5, z); group.add(l); }
  group.add(screen, sframe);

  // ---------------- dış çevre ----------------
  const ground = new THREE.Mesh(new THREE.CircleGeometry(420, 48), new THREE.MeshStandardMaterial({ color: 0x0d1410, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05;
  group.add(ground);
  const wtex = windowsTexture();
  const bparts = [];
  const R3 = rnd(9);
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2 + R3() * 0.05;
    const r = 150 + R3() * 120;
    const w = 12 + R3() * 22, d = 12 + R3() * 18, hgt = 14 + R3() * R3() * 90;
    const g = new THREE.BoxGeometry(w, hgt, d);
    const uv = g.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w / 8, uv.getY(k) * hgt / 10);
    g.rotateY(-a);
    g.translate(Math.cos(a) * r, hgt / 2, Math.sin(a) * r);
    bparts.push(g);
  }
  group.add(new THREE.Mesh(mergeGeometries(bparts), new THREE.MeshStandardMaterial({ color: 0x0b1016, roughness: 0.9, emissive: 0xffffff, emissiveMap: wtex, emissiveIntensity: 0.55, map: wtex })));

  return {
    group, crowds, crowdMat: cmat, boards, scoreboard: sb,
    update(t) { for (const tx of boards) tx.offset.x = (t * 0.035) % 1; },
  };
}
