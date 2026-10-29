// Maç kaydı: her karede tüm varlıkların durumu ve top. Parçalı Float32Array
// kullanılır; 90 dakikalık (hızlandırılmış) maç birkaç MB tutar.
// Replay, kamera açıları ve VAR ölçümleri hep bu kayıttan okunur.

import { N_ENT, ESTRIDE, BSTRIDE, FSTRIDE, POSE } from '../sim/constants.js';
import { lerpAngle } from '../core/util.js';

const CHUNK = 1024;

export class Recording {
  constructor() {
    this.chunks = [];
    this.meta = []; // kare başına { minute, half }
    this.count = 0;
  }

  push(sim) {
    const c = (this.count / CHUNK) | 0, o = (this.count % CHUNK) * FSTRIDE;
    if (!this.chunks[c]) this.chunks[c] = new Float32Array(CHUNK * FSTRIDE);
    const a = this.chunks[c];
    for (let i = 0; i < N_ENT; i++) {
      const e = sim.ents[i], k = o + i * ESTRIDE;
      a[k] = e.x; a[k + 1] = e.z; a[k + 2] = e.h; a[k + 3] = e.ph; a[k + 4] = e.sp;
      a[k + 5] = e.active ? e.pose : POSE.HIDDEN; a[k + 6] = e.pt; a[k + 7] = e.p1; a[k + 8] = e.p2; a[k + 9] = e.p3;
    }
    const b = sim.ball, k = o + N_ENT * ESTRIDE;
    a[k] = b.x; a[k + 1] = b.y; a[k + 2] = b.z; a[k + 3] = b.spin;
    this.meta.push(sim.minute, sim.half);
    return this.count++;
  }

  _off(f) {
    f = Math.max(0, Math.min(this.count - 1, f | 0));
    return [this.chunks[(f / CHUNK) | 0], (f % CHUNK) * FSTRIDE];
  }

  /** Tam kare okuma (ölçümler için: enterpolasyon YOK). */
  ent(f, i, out = {}) {
    const [a, o] = this._off(f);
    const k = o + i * ESTRIDE;
    out.x = a[k]; out.z = a[k + 1]; out.h = a[k + 2]; out.ph = a[k + 3]; out.sp = a[k + 4];
    out.pose = a[k + 5]; out.pt = a[k + 6]; out.p1 = a[k + 7]; out.p2 = a[k + 8]; out.p3 = a[k + 9];
    return out;
  }
  ball(f, out = [0, 0, 0, 0]) {
    const [a, o] = this._off(f);
    const k = o + N_ENT * ESTRIDE;
    out[0] = a[k]; out[1] = a[k + 1]; out[2] = a[k + 2]; out[3] = a[k + 3];
    return out;
  }
  minute(f) { f = Math.max(0, Math.min(this.count - 1, f | 0)); return this.meta[f * 2]; }
  half(f) { f = Math.max(0, Math.min(this.count - 1, f | 0)); return this.meta[f * 2 + 1]; }

  /** Kesirli kare: çizim için yumuşak enterpolasyon. */
  sampleEnt(ff, i, out = {}) {
    const f0 = Math.floor(ff), t = ff - f0;
    if (t < 1e-4 || f0 + 1 >= this.count) return this.ent(f0, i, out);
    const A = this.ent(f0, i, _a), B = this.ent(f0 + 1, i, _b);
    // ışınlanma (kesme) varsa enterpolasyon yapma
    if (Math.abs(A.x - B.x) + Math.abs(A.z - B.z) > 3) return this.ent(t < 0.5 ? f0 : f0 + 1, i, out);
    out.x = A.x + (B.x - A.x) * t; out.z = A.z + (B.z - A.z) * t;
    out.h = lerpAngle(A.h, B.h, t);
    out.ph = Math.abs(B.ph - A.ph) < 3 ? A.ph + (B.ph - A.ph) * t : B.ph;
    out.sp = A.sp + (B.sp - A.sp) * t;
    if (A.pose === B.pose) {
      out.pose = A.pose;
      out.pt = B.pt >= A.pt ? A.pt + (B.pt - A.pt) * t : (t < 0.5 ? A.pt : B.pt);
      out.p1 = A.p1 + (B.p1 - A.p1) * t; out.p2 = A.p2 + (B.p2 - A.p2) * t; out.p3 = A.p3 + (B.p3 - A.p3) * t;
    } else {
      const S = t < 0.5 ? A : B;
      out.pose = S.pose; out.pt = S.pt; out.p1 = S.p1; out.p2 = S.p2; out.p3 = S.p3;
    }
    return out;
  }
  sampleBall(ff, out = [0, 0, 0, 0]) {
    const f0 = Math.floor(ff), t = ff - f0;
    if (t < 1e-4 || f0 + 1 >= this.count) return this.ball(f0, out);
    const A = this.ball(f0, _ba), B = this.ball(f0 + 1, _bb);
    if (Math.abs(A[0] - B[0]) + Math.abs(A[2] - B[2]) > 4) return this.ball(t < 0.5 ? f0 : f0 + 1, out);
    for (let k = 0; k < 4; k++) out[k] = A[k] + (B[k] - A[k]) * t;
    return out;
  }
}
const _a = {}, _b = {}, _ba = [0, 0, 0, 0], _bb = [0, 0, 0, 0];
