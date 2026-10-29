// Kamera açıları. Replay'de her kamera konumu yalnızca kare numarasının fonksiyonudur
// (geri sarınca titreme olmaz). Canlı yayın kamerası ise yumuşak takip eder.
import * as THREE from 'three';
import { PITCH, BOX_LINE_X, AR1 } from '../sim/constants.js';

export const CAMS = [
  { id: 0, name: 'Ana yayın', short: 'ANA' },
  { id: 1, name: 'Ters açı', short: 'TERS' },
  { id: 2, name: 'Kale arkası', short: 'KALE' },
  { id: 3, name: 'Taktik (yüksek)', short: 'TAKTİK' },
  { id: 4, name: 'Çizgi / ofsayt kamerası', short: 'ÇİZGİ' },
  { id: 5, name: 'Yakın plan', short: 'YAKIN' },
];

export function makeCamera() {
  const c = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 600);
  return c;
}

/**
 * info: {
 *   ball: [x,y,z] (yumuşatılmış), focus: [x,y,z], dir: hücum yönü,
 *   lineX: çizgi kamerası için x, lineKind: 'offside'|'goal'|'box'|null, ballRaw
 * }
 */
export function placeCamera(cam, id, info, aspect) {
  const b = info.ball, f = info.focus, dir = info.dir;
  let fov = 30;
  const P = new THREE.Vector3(), T = new THREE.Vector3();
  switch (id) {
    case 0: // ana yayın: ana tribün, yüksek
      P.set(b[0] * 0.82, 21, -54);
      T.set(b[0], 0.5, b[2] * 0.55);
      fov = 22;
      break;
    case 1: // ters açı
      P.set(b[0] * 0.82, 17, 54);
      T.set(b[0], 0.5, b[2] * 0.55);
      fov = 22;
      break;
    case 2: { // kale arkası
      const gx = dir * (PITCH.HL + 12);
      P.set(gx, 5.5, f[2] * 0.25);
      T.set(f[0], 0.9, f[2]);
      fov = Math.max(14, Math.min(38, 1100 / Math.max(8, Math.abs(gx - f[0])) * 0.9));
      break;
    }
    case 3: // taktik: yüksek, hücum yönünün gerisinden
      P.set(f[0] - dir * 26, 46, f[2] * 0.4 - 14);
      T.set(f[0] + dir * 4, 0, f[2]);
      fov = 42;
      break;
    case 4: { // çizgi kamerası: çizgiye dik bakar
      if (info.lineKind === 'goal') {
        const x = dir * PITCH.HL;
        const zs = Math.sign(info.ballRaw[2] || 1);
        P.set(x, 2.6, zs * (PITCH.HW + 9));
        T.set(x, 0.1, info.ballRaw[2]);
        fov = 14;
      } else {
        const x = info.lineX !== null && info.lineX !== undefined ? info.lineX : f[0];
        P.set(x, 13, -44);
        T.set(x, 0, f[2] * 0.75);
        fov = 21;
      }
      break;
    }
    case 5: { // yakın plan: iki oyuncu arasındaki doğruya dik bakar (temas net görünsün)
      let px = -0.17, pz = -1;
      if (info.pair) {
        const [dx, dz] = info.pair;
        const n = Math.hypot(dx, dz) || 1;
        px = -dz / n; pz = dx / n;
        if (pz > 0) { px = -px; pz = -pz; }
      }
      P.set(f[0] + px * 17, 3.2, f[2] + pz * 17);
      T.set(f[0], 0.85, f[2]);
      fov = 10;
      break;
    }
  }
  cam.position.copy(P);
  cam.lookAt(T);
  cam.fov = fov;
  cam.aspect = aspect;
}

/** Görüntü kırpma ile dijital yakınlaştırma / kaydırma. */
export function applyZoom(cam, view, rect) {
  const z = view.zoom || 1;
  if (z <= 1.001) { cam.clearViewOffset(); cam.updateProjectionMatrix(); return; }
  const W = rect.w, H = rect.h;
  const w = W / z, h = H / z;
  const maxX = W - w, maxY = H - h;
  view.panX = Math.max(-0.5, Math.min(0.5, view.panX || 0));
  view.panY = Math.max(-0.5, Math.min(0.5, view.panY || 0));
  const ox = maxX / 2 + view.panX * maxX, oy = maxY / 2 + view.panY * maxY;
  cam.setViewOffset(W, H, ox, oy, w, h);
  cam.updateProjectionMatrix();
}

/** Canlı yayın kamerası (durumlu, yumuşak takip). */
export class BroadcastCam {
  constructor() {
    this.cam = makeCamera();
    this.x = 0; this.z = 0; this.zoom = 26;
  }
  update(ball, dt, aspect, closeFocus) {
    const k = 1 - Math.exp(-dt * 2.2);
    this.x += (ball[0] - this.x) * k;
    this.z += (ball[2] - this.z) * k * 0.7;
    const targetFov = closeFocus ? 16 : 26;
    this.zoom += (targetFov - this.zoom) * (1 - Math.exp(-dt * 1.5));
    this.cam.position.set(this.x * 0.82, 21, -54);
    this.cam.lookAt(this.x, 0.5, this.z * 0.55);
    this.cam.fov = this.zoom * (aspect < 1.4 ? 1.25 : 1);
    this.cam.aspect = aspect;
    this.cam.clearViewOffset();
    this.cam.updateProjectionMatrix();
  }
}

export { BOX_LINE_X, AR1 };
