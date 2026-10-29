// Saha: biçme desenli ve aşınma izli çim (kabartma + ayrıntı dokusu), gerçek ölçülerde
// 12 cm'lik çizgiler, sarkan kutu tipi kale ağları, direkler ve köşe bayrakları.
import * as THREE from 'three';
import { PITCH } from '../sim/constants.js';
import { grassTextures, netTexture } from './textures.js';

function pushRect(pos, x0, x1, z0, z1, y) {
  pos.push(x0, y, z0, x1, y, z1, x1, y, z0, x0, y, z0, x0, y, z1, x1, y, z1);
}
function pushRing(pos, cx, cz, r0, r1, a0, a1, seg, y, clip) {
  for (let i = 0; i < seg; i++) {
    const t0 = a0 + ((a1 - a0) * i) / seg, t1 = a0 + ((a1 - a0) * (i + 1)) / seg;
    const p = (r, t) => [cx + Math.cos(t) * r, cz + Math.sin(t) * r];
    const A = p(r0, t0), B = p(r1, t0), C = p(r1, t1), D = p(r0, t1);
    if (clip && (!clip(A[0], A[1]) || !clip(C[0], C[1]))) continue;
    pos.push(A[0], y, A[1], C[0], y, C[1], B[0], y, B[1], A[0], y, A[1], D[0], y, D[1], C[0], y, C[1]);
  }
}

export function buildPitch(q) {
  const group = new THREE.Group();
  const { color, detail } = grassTextures(q);
  const grassMat = new THREE.MeshStandardMaterial({
    map: color, roughness: 0.93, metalness: 0,
    bumpMap: q === 'dusuk' ? null : detail, bumpScale: 1.6,
    roughnessMap: q === 'dusuk' ? null : detail,
  });
  if (q !== 'dusuk') {
    grassMat.onBeforeCompile = (sh) => {
      // ayrıntı dokusuyla renk kırılımı (yakın planda çim yaprakları)
      sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        #ifdef USE_BUMPMAP
          float gd = texture2D(bumpMap, vBumpMapUv).r;
          diffuseColor.rgb *= 0.8 + 0.42 * gd;
        #endif`);
    };
  }
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(117, 80), grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  group.add(grass);
  // saha çevresi: koşu yolu ve beton
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(150, 112), new THREE.MeshStandardMaterial({ color: 0x1f3a1c, roughness: 0.95 }));
  apron.rotation.x = -Math.PI / 2; apron.position.y = -0.02;
  apron.receiveShadow = true;
  group.add(apron);

  // çizgiler
  const L = PITCH.LINE, HL = PITCH.HL, HW = PITCH.HW, y = 0.006;
  const pos = [];
  pushRect(pos, -HL, HL, HW - L, HW, y);
  pushRect(pos, -HL, HL, -HW, -HW + L, y);
  for (const s of [1, -1]) {
    pushRect(pos, s > 0 ? HL - L : -HL, s > 0 ? HL : -HL + L, -HW, HW, y);
    const bx = s * (HL - PITCH.BOX_D);
    pushRect(pos, s > 0 ? bx : bx - L, s > 0 ? bx + L : bx, -PITCH.BOX_HW, PITCH.BOX_HW, y);
    const sideX = s > 0 ? [bx, HL] : [-HL, bx];
    pushRect(pos, sideX[0], sideX[1], PITCH.BOX_HW - L, PITCH.BOX_HW, y);
    pushRect(pos, sideX[0], sideX[1], -PITCH.BOX_HW, -PITCH.BOX_HW + L, y);
    const ax = s * (HL - PITCH.GA_D);
    pushRect(pos, s > 0 ? ax : ax - L, s > 0 ? ax + L : ax, -PITCH.GA_HW, PITCH.GA_HW, y);
    const aside = s > 0 ? [ax, HL] : [-HL, ax];
    pushRect(pos, aside[0], aside[1], PITCH.GA_HW - L, PITCH.GA_HW, y);
    pushRect(pos, aside[0], aside[1], -PITCH.GA_HW, -PITCH.GA_HW + L, y);
    const sx = s * (HL - PITCH.SPOT);
    pushRing(pos, sx, 0, 0, 0.11, 0, Math.PI * 2, 16, y);
    pushRing(pos, sx, 0, PITCH.CIRCLE_R - L, PITCH.CIRCLE_R, 0, Math.PI * 2, 128, y, (px) => (s > 0 ? px < bx : px > bx));
    for (const zs of [1, -1]) {
      const start = zs > 0 ? (s > 0 ? Math.PI : 1.5 * Math.PI) : (s > 0 ? Math.PI / 2 : 0);
      pushRing(pos, s * HL, zs * HW, 1 - L, 1, start, start + Math.PI / 2, 14, y);
    }
  }
  pushRect(pos, -L / 2, L / 2, -HW, HW, y);
  pushRing(pos, 0, 0, PITCH.CIRCLE_R - L, PITCH.CIRCLE_R, 0, Math.PI * 2, 160, y);
  pushRing(pos, 0, 0, 0, 0.11, 0, Math.PI * 2, 16, y);
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  lg.computeVertexNormals();
  const lines = new THREE.Mesh(lg, new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.75, emissive: 0x111111, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  lines.receiveShadow = true;
  group.add(lines);

  const net = netTexture();
  for (const s of [1, -1]) group.add(buildGoal(s, q, net));
  // köşe bayrakları (çizgili direk + dalgalı bayrak)
  const poleTex = (() => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 64;
    const g = c.getContext('2d');
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ff3d00' : '#ffffff'; g.fillRect(0, i * 8, 8, 8); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const poleMat = new THREE.MeshStandardMaterial({ map: poleTex, roughness: 0.5 });
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xffd000, side: THREE.DoubleSide, roughness: 0.8 });
  for (const s of [1, -1]) for (const zs of [1, -1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.5, 8), poleMat);
    pole.position.set(s * HL, 0.75, zs * HW);
    pole.castShadow = q === 'yuksek';
    const fg = new THREE.PlaneGeometry(0.42, 0.3, 6, 2);
    const fp = fg.attributes.position;
    for (let i = 0; i < fp.count; i++) fp.setZ(i, Math.sin((fp.getX(i) + 0.21) * 9) * 0.03 * (fp.getX(i) + 0.21) * 3);
    fg.computeVertexNormals(); fg.translate(0.21, 0, 0);
    const flag = new THREE.Mesh(fg, flagMat);
    flag.position.set(s * HL, 1.33, zs * HW);
    flag.rotation.y = Math.atan2(-zs, -s) + Math.PI / 2;
    group.add(pole, flag);
  }
  return group;
}

// 4 köşe arasında alt bölümlü, sarkık file yüzeyi
function netPatch(a, b, c, d, nu, nv, sag, mat, ru, rv) {
  const g = new THREE.PlaneGeometry(1, 1, nu, nv);
  const p = g.attributes.position, uv = g.attributes.uv;
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), C = new THREE.Vector3(...c), D = new THREE.Vector3(...d);
  const n = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(B, A), new THREE.Vector3().subVectors(D, A)).normalize();
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    const u = uv.getX(i), w = uv.getY(i);
    v.copy(A).multiplyScalar((1 - u) * (1 - w)).addScaledVector(B, u * (1 - w)).addScaledVector(C, u * w).addScaledVector(D, (1 - u) * w);
    v.addScaledVector(n, Math.sin(u * Math.PI) * Math.sin(w * Math.PI) * sag);
    p.setXYZ(i, v.x, v.y, v.z);
    uv.setXY(i, u * ru, w * rv);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

function buildGoal(s, q, netTex) {
  const g = new THREE.Group();
  const white = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.05, clearcoat: q === 'yuksek' ? 0.8 : 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.5, metalness: 0.6 });
  const R = PITCH.POST_R, HW = PITCH.GOAL_HW + R, H = PITCH.GOAL_H + R;
  const x = s * (PITCH.HL - R);
  for (const zs of [1, -1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 20), white);
    post.position.set(x, H / 2, zs * HW);
    post.castShadow = true;
    g.add(post);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(R, R, HW * 2 + R * 2, 20), white);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(x, PITCH.GOAL_H + R, 0);
  bar.castShadow = true;
  g.add(bar);
  // ağ: üstte 1 m geri, sonra yere 2.2 m'ye inen eğim
  const mat = new THREE.MeshStandardMaterial({ map: netTex, transparent: true, alphaTest: 0.12, side: THREE.DoubleSide, roughness: 0.9, color: 0xf0f0f0 });
  const X0 = s * PITCH.HL, X1 = s * (PITCH.HL + 1.0), X2 = s * (PITCH.HL + 2.2), Y = PITCH.GOAL_H;
  const z0 = -HW, z1 = HW;
  const seg = q === 'dusuk' ? 4 : 10;
  g.add(netPatch([X0, Y, z0], [X0, Y, z1], [X1, Y, z1], [X1, Y, z0], seg, 2, -0.08, mat, HW * 2 / 0.14, 1.0 / 0.14));
  g.add(netPatch([X1, Y, z0], [X1, Y, z1], [X2, 0, z1], [X2, 0, z0], seg, seg, 0.18 * s, mat, HW * 2 / 0.14, 2.6 / 0.14));
  for (const zs of [1, -1]) {
    const zz = zs * HW;
    g.add(netPatch([X0, 0, zz], [X2, 0, zz], [X1, Y, zz], [X0, Y, zz], seg, seg, 0.1 * zs, mat, 2.2 / 0.14, Y / 0.14));
  }
  // arka destek boruları
  const tubeAt = (a, b, r) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 8), dark);
    m.position.addVectors(A, B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(B, A).normalize());
    g.add(m);
  };
  for (const zs of [1, -1]) { tubeAt([X0, Y, zs * HW], [X1, Y, zs * HW], 0.025); tubeAt([X1, Y, zs * HW], [X2, 0, zs * HW], 0.025); tubeAt([X0, 0.02, zs * HW], [X2, 0.02, zs * HW], 0.02); }
  tubeAt([X1, Y, -HW], [X1, Y, HW], 0.025);
  tubeAt([X2, 0.02, -HW], [X2, 0.02, HW], 0.02);
  return g;
}
