// Saha: çim dokusu, gerçek ölçülerde 12 cm'lik çizgiler, kaleler ve ağlar.
import * as THREE from 'three';
import { PITCH } from '../sim/constants.js';

function grassTexture(q) {
  const W = q === 'dusuk' ? 512 : 1024, H = W / 2;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  // 117 x 80 m alan; 18 biçim şeridi saha içinde
  const mx = W / 117;
  const stripes = 18;
  const sw = (105 / stripes) * mx;
  const x0 = 6 * mx;
  g.fillStyle = '#2f6b2a';
  g.fillRect(0, 0, W, H);
  for (let i = -2; i < stripes + 2; i++) {
    g.fillStyle = i % 2 === 0 ? '#357a2f' : '#2c6627';
    g.fillRect(x0 + i * sw, 0, sw + 1, H);
  }
  // gürültü
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 18;
    d[i] += n * 0.6; d[i + 1] += n; d[i + 2] += n * 0.4;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Dikdörtgen çizgi parçası ekle (x0..x1, z0..z1)
function pushRect(pos, x0, x1, z0, z1, y) {
  pos.push(x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z0, x1, y, z1, x0, y, z1);
}
function pushRing(pos, cx, cz, r0, r1, a0, a1, seg, y, clip) {
  for (let i = 0; i < seg; i++) {
    const t0 = a0 + ((a1 - a0) * i) / seg, t1 = a0 + ((a1 - a0) * (i + 1)) / seg;
    const p = (r, t) => [cx + Math.cos(t) * r, cz + Math.sin(t) * r];
    const A = p(r0, t0), B = p(r1, t0), C = p(r1, t1), D = p(r0, t1);
    if (clip && (!clip(A[0], A[1]) || !clip(C[0], C[1]))) continue;
    pos.push(A[0], y, A[1], B[0], y, B[1], C[0], y, C[1], A[0], y, A[1], C[0], y, C[1], D[0], y, D[1]);
  }
}

export function buildPitch(q) {
  const group = new THREE.Group();
  // çim
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(117, 80),
    new THREE.MeshLambertMaterial({ map: grassTexture(q) }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  group.add(grass);
  // saha dışı (pist)
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(170, 130), new THREE.MeshLambertMaterial({ color: 0x24301f }));
  apron.rotation.x = -Math.PI / 2; apron.position.y = -0.02;
  group.add(apron);

  // çizgiler
  const L = PITCH.LINE, HL = PITCH.HL, HW = PITCH.HW, y = 0.006;
  const pos = [];
  pushRect(pos, -HL, HL, HW - L, HW, y);
  pushRect(pos, -HL, HL, -HW, -HW + L, y);
  for (const s of [1, -1]) {
    const gx0 = s > 0 ? HL - L : -HL, gx1 = s > 0 ? HL : -HL + L;
    pushRect(pos, gx0, gx1, -HW, HW, y);
    // ceza sahası
    const bx = s * (HL - PITCH.BOX_D);
    const bxi = s > 0 ? [bx, bx + L] : [bx - L, bx];
    pushRect(pos, bxi[0], bxi[1], -PITCH.BOX_HW, PITCH.BOX_HW, y);
    const sideX = s > 0 ? [bx, HL] : [-HL, bx];
    pushRect(pos, sideX[0], sideX[1], PITCH.BOX_HW - L, PITCH.BOX_HW, y);
    pushRect(pos, sideX[0], sideX[1], -PITCH.BOX_HW, -PITCH.BOX_HW + L, y);
    // kale alanı
    const ax = s * (HL - PITCH.GA_D);
    const axi = s > 0 ? [ax, ax + L] : [ax - L, ax];
    pushRect(pos, axi[0], axi[1], -PITCH.GA_HW, PITCH.GA_HW, y);
    const aside = s > 0 ? [ax, HL] : [-HL, ax];
    pushRect(pos, aside[0], aside[1], PITCH.GA_HW - L, PITCH.GA_HW, y);
    pushRect(pos, aside[0], aside[1], -PITCH.GA_HW, -PITCH.GA_HW + L, y);
    // penaltı noktası ve yayı
    const sx = s * (HL - PITCH.SPOT);
    pushRing(pos, sx, 0, 0, 0.11, 0, Math.PI * 2, 16, y);
    pushRing(pos, sx, 0, PITCH.CIRCLE_R - L, PITCH.CIRCLE_R, 0, Math.PI * 2, 96, y, (px) => (s > 0 ? px < bx : px > bx));
    // köşe yayları
    for (const zs of [1, -1]) {
      const a0 = s > 0 ? Math.PI : 0;
      const start = zs > 0 ? (s > 0 ? Math.PI : 1.5 * Math.PI) : (s > 0 ? Math.PI / 2 : 0);
      pushRing(pos, s * HL, zs * HW, 1 - L, 1, start, start + Math.PI / 2, 12, y);
      void a0;
    }
  }
  pushRect(pos, -L / 2, L / 2, -HW, HW, y);
  pushRing(pos, 0, 0, PITCH.CIRCLE_R - L, PITCH.CIRCLE_R, 0, Math.PI * 2, 120, y);
  pushRing(pos, 0, 0, 0, 0.11, 0, Math.PI * 2, 16, y);
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  lg.computeVertexNormals();
  const lines = new THREE.Mesh(lg, new THREE.MeshLambertMaterial({ color: 0xf4f4f0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  lines.receiveShadow = true;
  group.add(lines);

  for (const s of [1, -1]) group.add(buildGoal(s, q));
  // köşe bayrakları
  for (const s of [1, -1]) for (const zs of [1, -1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
    pole.position.set(s * HL, 0.75, zs * HW);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshLambertMaterial({ color: 0xff3d00, side: THREE.DoubleSide }));
    flag.position.set(s * HL, 1.35, zs * HW + 0.2 * zs);
    flag.rotation.y = Math.PI / 2;
    group.add(pole, flag);
  }
  return group;
}

function netTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(255,255,255,0.85)';
  g.lineWidth = 2;
  for (let i = 0; i <= 64; i += 16) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(64, i); g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function buildGoal(s, q) {
  const g = new THREE.Group();
  const white = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const R = PITCH.POST_R, HW = PITCH.GOAL_HW + R, H = PITCH.GOAL_H + R;
  const x = s * (PITCH.HL - R);
  for (const zs of [1, -1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 12), white);
    post.position.set(x, H / 2, zs * HW);
    post.castShadow = true;
    g.add(post);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(R, R, HW * 2 + R * 2, 12), white);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(x, PITCH.GOAL_H + R, 0);
  bar.castShadow = true;
  g.add(bar);
  // ağ
  const tex = netTexture();
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.55 });
  const D = 2.0;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, PITCH.GOAL_H), mat.clone());
  back.material.map = tex.clone(); back.material.map.repeat.set(HW * 2 / 0.25, PITCH.GOAL_H / 0.25); back.material.map.needsUpdate = true;
  back.position.set(s * (PITCH.HL + D), PITCH.GOAL_H / 2, 0);
  back.rotation.y = Math.PI / 2;
  back.rotation.x = 0;
  g.add(back);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(D, HW * 2), mat.clone());
  top.material.map = tex.clone(); top.material.map.repeat.set(D / 0.25, HW * 2 / 0.25); top.material.map.needsUpdate = true;
  top.rotation.x = -Math.PI / 2;
  top.position.set(s * (PITCH.HL + D / 2), PITCH.GOAL_H, 0);
  g.add(top);
  for (const zs of [1, -1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(D, PITCH.GOAL_H), mat.clone());
    side.material.map = tex.clone(); side.material.map.repeat.set(D / 0.25, PITCH.GOAL_H / 0.25); side.material.map.needsUpdate = true;
    side.position.set(s * (PITCH.HL + D / 2), PITCH.GOAL_H / 2, zs * HW);
    g.add(side);
  }
  // arka çerçeve
  const thin = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  for (const zs of [1, -1]) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, D, 6), thin);
    r.rotation.z = Math.PI / 2;
    r.position.set(s * (PITCH.HL + D / 2), PITCH.GOAL_H, zs * HW);
    g.add(r);
  }
  return g;
}
