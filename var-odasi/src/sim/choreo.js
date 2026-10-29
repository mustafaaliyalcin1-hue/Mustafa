// Koreografi: senaryo jeneratörünün pozisyonları kare kare kurguladığı araç.
// Göreli koordinatlar kullanılır: X = hücum yönü (rakip kale X = +52.5), Z = enine.
// Dünya koordinatına dönüşüm: x = dir * X, z = dir * Z (180° döndürme, sağ/sol korunur).

import { DT, POSE, BALL_R } from './constants.js';
import { computeSkeleton, makeSkel, footBallPoint } from './skeleton.js';
import { turnToward, clamp, easeOut } from '../core/util.js';

const STRIDE = 2.4; // bir tam adım döngüsünde alınan yol (m)

export class Track {
  constructor(n) {
    this.n = n;
    this.x = new Float32Array(n); this.z = new Float32Array(n);
    this.h = new Float32Array(n); this.ph = new Float32Array(n); this.sp = new Float32Array(n);
    this.pose = new Int8Array(n); this.pt = new Float32Array(n);
    this.p1 = new Float32Array(n); this.p2 = new Float32Array(n); this.p3 = new Float32Array(n);
  }
  get(f, out = {}) {
    f = clamp(f | 0, 0, this.n - 1);
    out.x = this.x[f]; out.z = this.z[f]; out.h = this.h[f]; out.ph = this.ph[f]; out.sp = this.sp[f];
    out.pose = this.pose[f]; out.pt = this.pt[f]; out.p1 = this.p1[f]; out.p2 = this.p2[f]; out.p3 = this.p3[f];
    return out;
  }
}

function hermite(pts, f, out) {
  // pts: [{f, X, Z, stop}] sıralı
  const n = pts.length;
  if (f <= pts[0].f || n === 1) { out[0] = pts[0].X; out[1] = pts[0].Z; return; }
  if (f >= pts[n - 1].f) { out[0] = pts[n - 1].X; out[1] = pts[n - 1].Z; return; }
  let i = 0;
  while (i < n - 2 && f > pts[i + 1].f) i++;
  const a = pts[i], b = pts[i + 1];
  const D = b.f - a.f;
  const u = (f - a.f) / D;
  const tan = (k) => {
    const p = pts[k];
    if (p.stop) return [0, 0];
    const pa = pts[Math.max(0, k - 1)], pb = pts[Math.min(n - 1, k + 1)];
    const df = pb.f - pa.f || 1;
    return [(pb.X - pa.X) / df, (pb.Z - pa.Z) / df];
  };
  const ma = tan(i), mb = tan(i + 1);
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  out[0] = h00 * a.X + h10 * D * ma[0] + h01 * b.X + h11 * D * mb[0];
  out[1] = h00 * a.Z + h10 * D * ma[1] + h01 * b.Z + h11 * D * mb[1];
}

export class Choreo {
  constructor({ dir, n, rng }) {
    this.dir = dir; this.n = n; this.rng = rng;
    this.specs = new Map();
    this.tracks = new Map();
    this.overlays = []; // yapay zekâ kontrolündeki varlıklara poz bindirme
    this.bx = new Float32Array(n); this.by = new Float32Array(n).fill(BALL_R); this.bz = new Float32Array(n);
    this._sk = makeSkel();
  }
  // göreli → dünya
  W(X, Z) { return [this.dir * X, this.dir * Z]; }
  WB(X, Y, Z) { return [this.dir * X, Y, this.dir * Z]; }
  R(x, z) { return [this.dir * x, this.dir * z]; } // dünya → göreli (aynı dönüşüm)
  hW(hRel) { return this.dir > 0 ? hRel : hRel + Math.PI; }
  hR(hWorld) { return this.dir > 0 ? hWorld : hWorld - Math.PI; }

  spec(id) {
    if (!this.specs.has(id)) this.specs.set(id, { pts: [], poses: [], faces: [], h0: 0, ph0: this.rng.range(0, 6.28) });
    return this.specs.get(id);
  }
  path(id, pts) {
    const s = this.spec(id);
    s.pts = pts.map((p) => ({ f: p[0], X: p[1], Z: p[2], stop: p[3] === 's' }));
    return this;
  }
  pose(id, f0, f1, pose, p1 = 0, p2 = 0, p3 = 0) {
    this.spec(id).poses.push({ f0, f1, pose, p1, p2, p3 });
    return this;
  }
  face(id, f0, f1, target) { this.spec(id).faces.push({ f0, f1, ...target }); return this; }
  heading0(id, hRel) { this.spec(id).h0 = hRel; return this; }
  overlay(id, f0, f1, pose, p1 = 0, p2 = 0, p3 = 0) { this.overlays.push({ id, f0, f1, pose, p1, p2, p3 }); return this; }

  shift(id, dX, dZ) {
    const s = this.specs.get(id);
    for (const p of s.pts) { p.X += dX; p.Z += dZ; }
  }

  build() {
    // 1) konumlar ve hızlar
    const n = this.n;
    const tmp = [0, 0];
    for (const [id, s] of this.specs) {
      const t = new Track(n);
      for (let f = 0; f < n; f++) {
        hermite(s.pts, f, tmp);
        t.x[f] = this.dir * tmp[0]; t.z[f] = this.dir * tmp[1];
      }
      for (let f = 0; f < n; f++) {
        const a = Math.max(0, f - 1), b = Math.min(n - 1, f + 1);
        const vx = (t.x[b] - t.x[a]) / ((b - a) * DT), vz = (t.z[b] - t.z[a]) / ((b - a) * DT);
        t.sp[f] = Math.hypot(vx, vz);
        t._vx = t._vx || new Float32Array(n); t._vz = t._vz || new Float32Array(n);
        t._vx[f] = vx; t._vz[f] = vz;
      }
      this.tracks.set(id, t);
    }
    // 2) yönler (bakış hedefleri diğer izlerin konumlarına bağlı olabilir)
    for (const [id, s] of this.specs) {
      const t = this.tracks.get(id);
      let h = this.hW(s.h0);
      for (let f = 0; f < n; f++) {
        let target = null, rate = 0.22;
        for (const fc of s.faces) {
          if (f < fc.f0 || f > fc.f1) continue;
          if (fc.ent !== undefined) {
            const o = this.tracks.get(fc.ent);
            if (o) target = Math.atan2(o.z[f] - t.z[f], o.x[f] - t.x[f]);
          } else if (fc.X !== undefined) {
            const [wx, wz] = this.W(fc.X, fc.Z);
            target = Math.atan2(wz - t.z[f], wx - t.x[f]);
          } else if (fc.h !== undefined) target = this.hW(fc.h);
          if (fc.snap) rate = 10;
        }
        if (target === null && t.sp[f] > 0.7) target = Math.atan2(t._vz[f], t._vx[f]);
        if (f === 0 && target !== null) h = target;
        if (target !== null) h = turnToward(h, target, rate);
        t.h[f] = h;
      }
      // 3) adım fazı
      let ph = s.ph0;
      for (let f = 0; f < n; f++) {
        ph += t.sp[f] * DT * (2 * Math.PI / STRIDE);
        t.ph[f] = ph;
      }
      // 4) pozlar
      t.pose.fill(POSE.LOCO);
      for (const p of s.poses) {
        for (let f = Math.max(0, p.f0); f <= Math.min(n - 1, p.f1); f++) {
          t.pose[f] = p.pose;
          t.pt[f] = p.f1 > p.f0 ? (f - p.f0) / (p.f1 - p.f0) : 1;
          t.p1[f] = p.p1; t.p2[f] = p.p2; t.p3[f] = p.p3;
        }
      }
    }
    return this;
  }

  state(id, f, out = {}) { return this.tracks.get(id).get(f, out); }
  skel(id, f, sk = this._sk) { return computeSkeleton(this.state(id, f), sk); }
  pos(id, f) { const t = this.tracks.get(id); f = clamp(f, 0, this.n - 1); return [t.x[f], t.z[f]]; }
  posR(id, f) { const p = this.pos(id, f); return this.R(p[0], p[1]); }
  fwd(id, f) { const t = this.tracks.get(id); const h = t.h[clamp(f, 0, this.n - 1)]; return [Math.cos(h), Math.sin(h)]; }

  // Dünya noktasını varlığın gövde yerel (ileri, sağ) koordinatına çevir
  toLocal(id, f, wx, wz) {
    const t = this.tracks.get(id);
    const h = t.h[f], dx = wx - t.x[f], dz = wz - t.z[f];
    const Fx = Math.cos(h), Fz = Math.sin(h);
    return [dx * Fx + dz * Fz, dx * -Fz + dz * Fx];
  }

  // ---------------- top ----------------
  ballAt(f) { f = clamp(f, 0, this.n - 1); return [this.bx[f], this.by[f], this.bz[f]]; }
  footBall(id, f) {
    const st = this.state(id, f);
    computeSkeleton(st, this._sk);
    return footBallPoint(this._sk, st.p1 === 1, BALL_R);
  }
  _set(f, x, y, z) { if (f < 0 || f >= this.n) return; this.bx[f] = x; this.by[f] = y; this.bz[f] = z; }
  ballHold(f0, f1, P) { for (let f = f0; f <= f1; f++) this._set(f, P[0], P[1], P[2]); }
  ballCarry(id, f0, f1, d = 0.55) {
    const t = this.tracks.get(id);
    for (let f = f0; f <= f1; f++) {
      if (f < 0 || f >= this.n) continue;
      const dd = d + 0.12 * Math.sin(t.ph[f] * 0.5);
      this._set(f, t.x[f] + Math.cos(t.h[f]) * dd, BALL_R, t.z[f] + Math.sin(t.h[f]) * dd);
    }
  }
  ballLine(f0, f1, A, B, ease = 'lin') {
    for (let f = f0; f <= f1; f++) {
      let u = f1 > f0 ? (f - f0) / (f1 - f0) : 1;
      if (ease === 'out') u = 1 - Math.pow(1 - u, 1.6);
      else if (ease === 'out2') u = easeOut(u);
      this._set(f, A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u);
    }
  }
  ballAir(f0, f1, A, B, h) {
    for (let f = f0; f <= f1; f++) {
      const u = f1 > f0 ? (f - f0) / (f1 - f0) : 1;
      this._set(f, A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u + 4 * h * u * (1 - u), A[2] + (B[2] - A[2]) * u);
    }
  }
  // Topu önce kendi hızıyla ileri doğru, sonra yerde yavaşlayarak bırak
  ballLoose(f0, f1, A, vx, vz, vy = 0) {
    let x = A[0], y = A[1], z = A[2];
    for (let f = f0; f <= f1; f++) {
      this._set(f, x, y, z);
      x += vx * DT; z += vz * DT; y += vy * DT;
      vy -= 9.81 * DT;
      if (y < BALL_R) { y = BALL_R; vy = -vy * 0.45; if (Math.abs(vy) < 0.8) vy = 0; }
      const k = y <= BALL_R + 0.01 ? 0.965 : 0.995;
      vx *= k; vz *= k;
    }
  }
}
