// İnsan iskeleti: oyuncu durumundan (konum, yön, adım fazı, poz) eklem noktalarını
// hesaplar. ÖNEMLİ: Hem 3D çizim hem de ofsayt / temas / elle oynama ölçümleri
// bu tek fonksiyonu kullanır. Böylece ekranda gördüğün vücut ile hakemliğin
// "gerçek cevabı" birebir aynı geometriden gelir.

import { POSE, ARM } from './constants.js';
import { clamp, smooth, easeIn, easeOut, lerp } from '../core/util.js';

export const J = {
  PELVIS: 0, NECK: 1, HEAD: 2,
  SHL: 3, SHR: 4, ELL: 5, ELR: 6, HANDL: 7, HANDR: 8,
  HIPL: 9, HIPR: 10, KNEEL: 11, KNEER: 12, ANKL: 13, ANKR: 14, TOEL: 15, TOER: 16,
};
export const NJ = 17;

// Vücut ölçüleri (metre)
const THIGH = 0.46, SHIN = 0.46, ANK = 0.075, HIPW = 0.1, SPINE = 0.5, SHW = 0.19;
const UARM = 0.29, FARM = 0.27, FOOT = 0.21;
export const BODY = { THIGH, SHIN, ANK, HIPW, SPINE, SHW, UARM, FARM, FOOT, HEAD_R: 0.11 };

// Vücut parçaları. cat: 'kol' olanlar ofsayt değerlendirmesinde SAYILMAZ.
export const PARTS = [
  { name: 'Kafa', cat: 'kafa', kind: 'sphere', a: J.HEAD, r: 0.11 },
  { name: 'Gövde', cat: 'govde', kind: 'torso' },
  { name: 'Kalça', cat: 'govde', kind: 'pelvis' },
  { name: 'Sol üst kol', cat: 'kol', kind: 'cyl', a: J.SHL, b: J.ELL, r: 0.055 },
  { name: 'Sağ üst kol', cat: 'kol', kind: 'cyl', a: J.SHR, b: J.ELR, r: 0.055 },
  { name: 'Sol ön kol', cat: 'kol', kind: 'cyl', a: J.ELL, b: J.HANDL, r: 0.045 },
  { name: 'Sağ ön kol', cat: 'kol', kind: 'cyl', a: J.ELR, b: J.HANDR, r: 0.045 },
  { name: 'Sol el', cat: 'kol', kind: 'sphere', a: J.HANDL, r: 0.05 },
  { name: 'Sağ el', cat: 'kol', kind: 'sphere', a: J.HANDR, r: 0.05 },
  { name: 'Sol uyluk', cat: 'bacak', kind: 'cyl', a: J.HIPL, b: J.KNEEL, r: 0.085 },
  { name: 'Sağ uyluk', cat: 'bacak', kind: 'cyl', a: J.HIPR, b: J.KNEER, r: 0.085 },
  { name: 'Sol baldır', cat: 'bacak', kind: 'cyl', a: J.KNEEL, b: J.ANKL, r: 0.062 },
  { name: 'Sağ baldır', cat: 'bacak', kind: 'cyl', a: J.KNEER, b: J.ANKR, r: 0.062 },
  { name: 'Sol ayak', cat: 'ayak', kind: 'foot', a: J.ANKL, b: J.TOEL },
  { name: 'Sağ ayak', cat: 'ayak', kind: 'foot', a: J.ANKR, b: J.TOER },
];
export const P = {
  HEAD: 0, TORSO: 1, PELVIS: 2, UARML: 3, UARMR: 4, FARML: 5, FARMR: 6, HANDL: 7, HANDR: 8,
  THIGHL: 9, THIGHR: 10, SHINL: 11, SHINR: 12, FOOTL: 13, FOOTR: 14,
};
export const LEG_PARTS = [P.THIGHL, P.THIGHR, P.SHINL, P.SHINR, P.FOOTL, P.FOOTR];
export const ARM_PARTS = [P.UARML, P.UARMR, P.FARML, P.FARMR, P.HANDL, P.HANDR];
export const TORSO_HALF = [0.19, 0.21, 0.11]; // sağ, yukarı, ileri
export const PELVIS_HALF = [0.17, 0.1, 0.11];
export const FOOT_HALF = [0.05, 0.04, 0.135];
export const CAT_NAMES = { kafa: 'Kafa', govde: 'Gövde', kol: 'Kol', bacak: 'Bacak', ayak: 'Ayak' };

export function makeSkel() {
  return {
    j: new Float64Array(NJ * 3), // dünya koordinatlarında eklemler
    up: new Float64Array(3), // gövde yukarı ekseni
    fwd: new Float64Array(3), // gövde ileri ekseni
    right: new Float64Array(3), // gövde sağ ekseni
    bodyUp: new Float64Array(3), // devrilmeyle döndürülmüş dikey eksen
  };
}

// ---- yerel hesap tamponları (a: ileri, b: sağ, c: yukarı) ----
const L = new Float64Array(NJ * 3);
const tmpK = [0, 0, 0], tmpA = [0, 0, 0];

function setL(i, a, b, c) { L[i * 3] = a; L[i * 3 + 1] = b; L[i * 3 + 2] = c; }
function norm3(v) {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  v[0] /= n; v[1] /= n; v[2] /= n; return v;
}

// Bacak açılarla: al = uyluk açısı (ileri +), be = diz bükümü. Kalça c=0 kabul edilir.
function setLeg(side, al, be) {
  const k = side < 0 ? 0 : 1;
  const hb = side * HIPW;
  const ka = THIGH * Math.sin(al), kc = -THIGH * Math.cos(al);
  const sa = al - be;
  const aa = ka + SHIN * Math.sin(sa), ac = kc - SHIN * Math.cos(sa);
  const g = clamp(sa * 0.6, -0.7, 0.5);
  setL(J.HIPL + k, 0, hb, 0);
  setL(J.KNEEL + k, ka, hb, kc);
  setL(J.ANKL + k, aa, hb, ac);
  setL(J.TOEL + k, aa + FOOT * Math.cos(g), hb, ac + FOOT * Math.sin(g));
}

// İki kemikli ters kinematik (yerel koordinatlarda). Hedefe ulaşamazsa düz uzanır.
function ik(h, t, pole, l1, l2, knee, ankle) {
  let dx = t[0] - h[0], dy = t[1] - h[1], dz = t[2] - h[2];
  let d = Math.hypot(dx, dy, dz) || 1e-6;
  const maxd = l1 + l2 - 1e-4, mind = Math.abs(l1 - l2) + 0.05;
  const dd = clamp(d, mind, maxd);
  const ux = dx / d, uy = dy / d, uz = dz / d;
  const cosA = clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  let pd = pole[0] * ux + pole[1] * uy + pole[2] * uz;
  let px = pole[0] - pd * ux, py = pole[1] - pd * uy, pz = pole[2] - pd * uz;
  let pn = Math.hypot(px, py, pz);
  if (pn < 1e-5) { px = 0; py = 0; pz = 1; pn = 1; }
  px /= pn; py /= pn; pz /= pn;
  knee[0] = h[0] + l1 * (ux * cosA + px * sinA);
  knee[1] = h[1] + l1 * (uy * cosA + py * sinA);
  knee[2] = h[2] + l1 * (uz * cosA + pz * sinA);
  ankle[0] = h[0] + ux * dd; ankle[1] = h[1] + uy * dd; ankle[2] = h[2] + uz * dd;
}

function setLegIK(side, pelvisC, target, pole) {
  const k = side < 0 ? 0 : 1;
  const hip = [0, side * HIPW, pelvisC];
  ik(hip, target, pole, THIGH, SHIN, tmpK, tmpA);
  setL(J.HIPL + k, 0, side * HIPW, 0);
  // bacağı kalçaya göreli (c - pelvisC) yaz, sonra pelvis eklenecek
  setL(J.KNEEL + k, tmpK[0], tmpK[1], tmpK[2] - pelvisC);
  setL(J.ANKL + k, tmpA[0], tmpA[1], tmpA[2] - pelvisC);
  const sa = Math.atan2(tmpA[0] - tmpK[0], -(tmpA[2] - tmpK[2]));
  const g = clamp(sa * 0.5, -0.9, 0.6);
  setL(J.TOEL + k, tmpA[0] + FOOT * Math.cos(g), tmpA[1], tmpA[2] - pelvisC + FOOT * Math.sin(g));
}

function legHeight(side) {
  const k = side < 0 ? 0 : 1;
  return -L[(J.ANKL + k) * 3 + 2];
}

// Kol: üst kol ve ön kol yön vektörleri (yerel)
function setArm(side, ua, fa) {
  const k = side < 0 ? 0 : 1;
  const si = (J.SHL + k) * 3;
  const sa = L[si], sb = L[si + 1], sc = L[si + 2];
  norm3(ua); norm3(fa);
  const ea = sa + UARM * ua[0], eb = sb + UARM * ua[1], ec = sc + UARM * ua[2];
  setL(J.ELL + k, ea, eb, ec);
  setL(J.HANDL + k, ea + FARM * fa[0], eb + FARM * fa[1], ec + FARM * fa[2]);
}

function armSwing(side, ph, amp) {
  const phs = ph + (side > 0 ? Math.PI : 0);
  const psi = -(0.1 + 0.6 * amp) * Math.sin(phs);
  const eps = 0.3 + 1.0 * amp;
  setArm(side, [Math.sin(psi), side * 0.13, -Math.cos(psi)], [Math.sin(psi + eps), side * 0.1, -Math.cos(psi + eps)]);
}

function armMode(mode, ph, amp, p2, p3) {
  if (mode === ARM.POINT_R) {
    armSwing(-1, ph, amp);
    setArm(1, [0.95, 0.08, 0.3], [0.95, 0.06, 0.3]);
  } else if (mode === ARM.PROTEST) {
    for (const s of [-1, 1]) setArm(s, [0.35, s * 0.75, -0.2], [0.6, s * 0.4, 0.5]);
  } else if (mode === ARM.OUT) {
    for (const s of [-1, 1]) {
      const on = p3 === 2 || (p3 === 0 && s < 0) || (p3 === 1 && s > 0);
      if (on) {
        const d = p2;
        setArm(s, [0.12, s * Math.sin(d), -Math.cos(d)], [0.25, s * Math.sin(d + 0.1), -Math.cos(d + 0.1)]);
      } else {
        setArm(s, [0.05, s * 0.12, -1], [0.3, s * 0.1, -0.95]);
      }
    }
  } else {
    armSwing(-1, ph, amp);
    armSwing(1, ph, amp);
  }
}

function lungeExt(t) {
  if (t < 0.55) return smooth(t / 0.55);
  if (t < 0.75) return 1;
  return 1 - 0.5 * smooth((t - 0.75) / 0.25);
}

/**
 * s: { x, z, h, ph, sp, pose, pt, p1, p2, p3 }
 * sk: makeSkel() çıktısı (doldurulur)
 */
export function computeSkeleton(s, sk) {
  const pose = s.pose | 0;
  const amp = clamp(s.sp / 7.5, 0, 1);
  const ph = s.ph, t = clamp(s.pt, 0, 1);
  let lean = 0.05 + 0.2 * amp;
  let pelvisC = 0;
  let tilt = 0, tiltA = 0, tiltB = 0; // devrilme açısı ve yerel yön
  let lift = 0;

  if (pose === POSE.LUNGE || pose === POSE.SLIDE) {
    const side = s.p2 >= 0 ? 1 : -1;
    const e = lungeExt(t);
    const rest = [0.05, side * 0.14, ANK];
    const tgt = [lerp(rest[0], s.p1, e), lerp(rest[1], s.p2, e), lerp(rest[2], s.p3, e)];
    if (pose === POSE.LUNGE) {
      pelvisC = 0.97 - 0.2 * e;
      lean = 0.15 + 0.25 * e;
      setLegIK(-side, pelvisC, [-0.05, -side * 0.16, ANK], [1, 0, 0]);
      setLegIK(side, pelvisC, tgt, [1, 0, 0.5]);
    } else {
      pelvisC = lerp(0.97, 0.3, e);
      lean = lerp(0.1, -0.6, e);
      setLegIK(side, pelvisC, tgt, [0.3, 0, 1]);
      setLegIK(-side, pelvisC, [-0.25 + 0.2 * (1 - e), -side * 0.18, lerp(ANK, 0.06, e)], [0.2, -side * 0.3, 1]);
    }
  } else if (pose === POSE.KICK) {
    const ks = s.p1 === 1 ? -1 : 1;
    let al, be;
    if (t < 0.45) { const u = t / 0.45; al = lerp(0.05, -0.75, u); be = lerp(0.2, 1.5, u); }
    else if (t < 0.6) { const u = (t - 0.45) / 0.15; al = lerp(-0.75, 0.3, u); be = lerp(1.5, 0.12, u); }
    else { const u = (t - 0.6) / 0.4; al = lerp(0.3, 1.05, u); be = lerp(0.12, 0.05, u); }
    setLeg(-ks, 0.12, 0.18);
    setLeg(ks, al, be);
    pelvisC = legHeight(-ks) + ANK;
    lean = 0.1;
  } else if (pose === POSE.FALL || pose === POSE.DOWN || pose === POSE.GETUP) {
    setLeg(-1, 0.35, 0.5);
    setLeg(1, -0.3, 0.7);
    pelvisC = Math.max(legHeight(-1), legHeight(1)) + ANK;
    lean = 0.2;
    const full = Math.PI / 2 - 0.12;
    tilt = pose === POSE.DOWN ? full : pose === POSE.FALL ? full * easeIn(t) : full * (1 - smooth(t));
    tiltA = Math.cos(s.p1); tiltB = Math.sin(s.p1);
  } else if (pose === POSE.DIVE) {
    setLeg(-1, 0.05, 0.08);
    setLeg(1, -0.05, 0.08);
    pelvisC = Math.max(legHeight(-1), legHeight(1)) + ANK;
    lean = 0;
    tilt = 1.35 * easeOut(Math.min(1, t * 1.4));
    tiltA = 0; tiltB = s.p1 >= 0 ? 1 : -1;
    lift = 0.35 * Math.sin(Math.PI * Math.min(1, t * 1.2));
  } else {
    // LOCO, PUSH, CARD, CELEB, FLAG, POINT: koşu bacakları
    setLeg(-1, 0, 0); setLeg(1, 0, 0);
    const A = 0.08 + 0.55 * amp;
    for (const side of [-1, 1]) {
      const phs = ph + (side > 0 ? Math.PI : 0);
      const al = A * Math.sin(phs);
      const be = 0.1 + amp * (0.12 + 1.2 * Math.max(0, Math.cos(phs)));
      setLeg(side, al, be);
    }
    pelvisC = Math.max(legHeight(-1), legHeight(1)) + ANK + amp * 0.04 * Math.abs(Math.sin(2 * ph));
  }

  // Bacak eklemlerini pelvis yüksekliğine taşı
  for (const jj of [J.HIPL, J.HIPR, J.KNEEL, J.KNEER, J.ANKL, J.ANKR, J.TOEL, J.TOER]) L[jj * 3 + 2] += pelvisC;
  // Ayak ucu yerin altına girmesin
  for (const k of [0, 1]) {
    const ti = (J.TOEL + k) * 3, ai = (J.ANKL + k) * 3;
    if (L[ti + 2] < 0.02 && tilt === 0) {
      L[ti + 2] = 0.02;
      const dc = L[ti + 2] - L[ai + 2];
      const ha = Math.sqrt(Math.max(0, FOOT * FOOT - dc * dc));
      const da = L[ti] - L[ai];
      L[ti] = L[ai] + (da >= 0 ? ha : -ha);
    }
  }

  // Gövde
  const ua = Math.sin(lean), uc = Math.cos(lean);
  setL(J.PELVIS, 0, 0, pelvisC);
  setL(J.NECK, ua * SPINE, 0, pelvisC + uc * SPINE);
  const na = ua * SPINE, nc = pelvisC + uc * SPINE;
  setL(J.SHL, na - ua * 0.06, -SHW, nc - uc * 0.06);
  setL(J.SHR, na - ua * 0.06, SHW, nc - uc * 0.06);
  setL(J.HEAD, na + ua * 0.15, 0, nc + uc * 0.15);

  // Kollar
  if (pose === POSE.LOCO) {
    armMode(s.p1 | 0, ph, amp, s.p2, s.p3 | 0);
  } else if (pose === POSE.KICK) {
    const ks = s.p1 === 1 ? -1 : 1;
    setArm(-ks, [0.2, -ks * 0.75, -0.6], [0.4, -ks * 0.6, -0.2]);
    setArm(ks, [-0.4, ks * 0.25, -0.9], [-0.1, ks * 0.2, -0.95]);
  } else if (pose === POSE.LUNGE) {
    for (const sd of [-1, 1]) setArm(sd, [0.25, sd * 0.65, -0.7], [0.5, sd * 0.5, -0.3]);
  } else if (pose === POSE.SLIDE) {
    for (const sd of [-1, 1]) setArm(sd, [-0.5, sd * 0.5, -0.7], [-0.5, sd * 0.4, -0.75]);
  } else if (pose === POSE.FALL || pose === POSE.DOWN || pose === POSE.GETUP) {
    for (const sd of [-1, 1]) setArm(sd, [0.8, sd * 0.3, -0.3], [0.9, sd * 0.2, 0.0]);
  } else if (pose === POSE.DIVE) {
    for (const sd of [-1, 1]) setArm(sd, [0.15, sd * 0.25, 0.96], [0.15, sd * 0.2, 0.97]);
  } else if (pose === POSE.PUSH) {
    let e = t < 0.4 ? smooth(t / 0.4) : t < 0.75 ? 1 : 1 - 0.7 * smooth((t - 0.75) / 0.25);
    lean += 0.15 * e;
    for (const sd of [-1, 1]) {
      const d = [lerp(0.15, 1, e), sd * lerp(0.12, 0.02, e), lerp(-1, 0.05, e)];
      setArm(sd, d, d.slice());
    }
  } else if (pose === POSE.CARD) {
    armSwing(-1, ph, amp * 0.3);
    setArm(1, [0.12, 0.12, 1], [0.1, 0.1, 1]);
  } else if (pose === POSE.FLAG) {
    armSwing(-1, ph, amp * 0.3);
    setArm(1, [0.35, 0.25, 0.9], [0.35, 0.2, 0.92]);
  } else if (pose === POSE.POINT) {
    armSwing(-1, ph, amp * 0.3);
    const d = [Math.cos(s.p1) * 0.95, Math.sin(s.p1) * 0.95, 0.15];
    setArm(1, d, d.slice());
  } else if (pose === POSE.CELEB) {
    for (const sd of [-1, 1]) setArm(sd, [0.15, sd * 0.55, 0.82], [0.1, sd * 0.4, 0.9]);
  } else {
    armSwing(-1, ph, amp); armSwing(1, ph, amp);
  }

  // ---- yerelden dünyaya ----
  const ch = Math.cos(s.h), shh = Math.sin(s.h);
  const Fx = ch, Fz = shh, Rx = -shh, Rz = ch;
  const j = sk.j;
  for (let i = 0; i < NJ; i++) {
    const a = L[i * 3], b = L[i * 3 + 1], c = L[i * 3 + 2];
    j[i * 3] = a * Fx + b * Rx;
    j[i * 3 + 1] = c;
    j[i * 3 + 2] = a * Fz + b * Rz;
  }
  // gövde ekseni
  sk.up[0] = ua * Fx; sk.up[1] = uc; sk.up[2] = ua * Fz;
  sk.fwd[0] = uc * Fx; sk.fwd[1] = -ua; sk.fwd[2] = uc * Fz;
  sk.right[0] = Rx; sk.right[1] = 0; sk.right[2] = Rz;
  sk.bodyUp[0] = 0; sk.bodyUp[1] = 1; sk.bodyUp[2] = 0;

  if (tilt !== 0) {
    // devrilme yönü (dünya), eksen k = yukarı × yön
    const dx = tiltA * Fx + tiltB * Rx, dz = tiltA * Fz + tiltB * Rz;
    const kx = dz, ky = 0, kz = -dx; // (0,1,0) × (dx,0,dz)
    const c = Math.cos(tilt), sn = Math.sin(tilt);
    const rot = (arr, o) => {
      const vx = arr[o], vy = arr[o + 1], vz = arr[o + 2];
      const kv = kx * vx + ky * vy + kz * vz;
      const cx = ky * vz - kz * vy, cy = kz * vx - kx * vz, cz = kx * vy - ky * vx;
      arr[o] = vx * c + cx * sn + kx * kv * (1 - c);
      arr[o + 1] = vy * c + cy * sn + ky * kv * (1 - c);
      arr[o + 2] = vz * c + cz * sn + kz * kv * (1 - c);
    };
    for (let i = 0; i < NJ; i++) rot(j, i * 3);
    rot(sk.up, 0); rot(sk.fwd, 0); rot(sk.right, 0); rot(sk.bodyUp, 0);
    const l = 0.12 * Math.sin(tilt);
    for (let i = 0; i < NJ; i++) j[i * 3 + 1] += l;
  }
  for (let i = 0; i < NJ; i++) {
    j[i * 3] += s.x;
    j[i * 3 + 1] += lift;
    j[i * 3 + 2] += s.z;
  }
  return sk;
}

// ------------------------------------------------------------------
// Parça geometrisi
// ------------------------------------------------------------------

const _c = [0, 0, 0];
function jp(sk, i, out) { out[0] = sk.j[i * 3]; out[1] = sk.j[i * 3 + 1]; out[2] = sk.j[i * 3 + 2]; return out; }

// Kutu parçası: merkez + eksenler + yarı boyutlar
export function partBox(sk, pi, out) {
  const p = PARTS[pi];
  out.c = out.c || [0, 0, 0]; out.ax = out.ax || [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  if (p.kind === 'torso' || p.kind === 'pelvis') {
    const k = p.kind === 'torso' ? 0.31 : 0.02;
    const half = p.kind === 'torso' ? TORSO_HALF : PELVIS_HALF;
    const pi0 = J.PELVIS * 3;
    for (let i = 0; i < 3; i++) {
      out.c[i] = sk.j[pi0 + i] + sk.up[i] * k;
      out.ax[0][i] = sk.right[i]; out.ax[1][i] = sk.up[i]; out.ax[2][i] = sk.fwd[i];
    }
    out.h = half;
    return out;
  }
  // ayak
  const a = jp(sk, p.a, [0, 0, 0]), b = jp(sk, p.b, [0, 0, 0]);
  const f = norm3([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const bu = sk.bodyUp;
  const d = bu[0] * f[0] + bu[1] * f[1] + bu[2] * f[2];
  const u = norm3([bu[0] - d * f[0], bu[1] - d * f[1], bu[2] - d * f[2]]);
  const sd = [u[1] * f[2] - u[2] * f[1], u[2] * f[0] - u[0] * f[2], u[0] * f[1] - u[1] * f[0]];
  for (let i = 0; i < 3; i++) {
    out.c[i] = a[i] + f[i] * 0.085 - u[i] * 0.025;
    out.ax[0][i] = sd[i]; out.ax[1][i] = u[i]; out.ax[2][i] = f[i];
  }
  out.h = FOOT_HALF;
  return out;
}

const _box = {};
/** Parçanın (dx,0,dz) yatay yönündeki en uç noktası (skaler izdüşüm). */
export function partExtent(sk, pi, dx, dz) {
  const p = PARTS[pi];
  if (p.kind === 'sphere') {
    const o = p.a * 3;
    return sk.j[o] * dx + sk.j[o + 2] * dz + p.r;
  }
  if (p.kind === 'cyl') {
    const a = p.a * 3, b = p.b * 3;
    const ea = sk.j[a] * dx + sk.j[a + 2] * dz, eb = sk.j[b] * dx + sk.j[b + 2] * dz;
    const ux = sk.j[b] - sk.j[a], uy = sk.j[b + 1] - sk.j[a + 1], uz = sk.j[b + 2] - sk.j[a + 2];
    const n = Math.hypot(ux, uy, uz) || 1;
    const ud = (ux * dx + uz * dz) / n;
    return Math.max(ea, eb) + p.r * Math.sqrt(Math.max(0, 1 - ud * ud));
  }
  const bx = partBox(sk, pi, _box);
  let e = bx.c[0] * dx + bx.c[2] * dz;
  for (let i = 0; i < 3; i++) e += bx.h[i] * Math.abs(bx.ax[i][0] * dx + bx.ax[i][2] * dz);
  return e;
}

/** Vücudun bir yöndeki en uç noktası. countable=true ise kollar hariç (ofsayt kuralı). */
export function bodyExtent(sk, dx, dz, countable = true) {
  let best = -Infinity, bp = -1;
  for (let i = 0; i < PARTS.length; i++) {
    if (countable && PARTS[i].cat === 'kol') continue;
    const e = partExtent(sk, i, dx, dz);
    if (e > best) { best = e; bp = i; }
  }
  return { ext: best, part: bp };
}

// ---- mesafe fonksiyonları (temas tespiti) ----

function segSegDist(p1, q1, p2, q2, outA, outB) {
  // Ericson, Real-Time Collision Detection
  const d1 = [q1[0] - p1[0], q1[1] - p1[1], q1[2] - p1[2]];
  const d2 = [q2[0] - p2[0], q2[1] - p2[1], q2[2] - p2[2]];
  const r = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
  const a = d1[0] * d1[0] + d1[1] * d1[1] + d1[2] * d1[2];
  const e = d2[0] * d2[0] + d2[1] * d2[1] + d2[2] * d2[2];
  const f = d2[0] * r[0] + d2[1] * r[1] + d2[2] * r[2];
  let s, t;
  if (a <= 1e-9 && e <= 1e-9) { s = t = 0; }
  else if (a <= 1e-9) { s = 0; t = clamp(f / e, 0, 1); }
  else {
    const c = d1[0] * r[0] + d1[1] * r[1] + d1[2] * r[2];
    if (e <= 1e-9) { t = 0; s = clamp(-c / a, 0, 1); }
    else {
      const b = d1[0] * d2[0] + d1[1] * d2[1] + d1[2] * d2[2];
      const den = a * e - b * b;
      s = den !== 0 ? clamp((b * f - c * e) / den, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); }
      else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); }
    }
  }
  for (let i = 0; i < 3; i++) { outA[i] = p1[i] + d1[i] * s; outB[i] = p2[i] + d2[i] * t; }
  return Math.hypot(outA[0] - outB[0], outA[1] - outB[1], outA[2] - outB[2]);
}

/** Parçanın kapsül yaklaşımı: [p0, p1, r] */
export function partCapsule(sk, pi, out) {
  const p = PARTS[pi];
  out.a = out.a || [0, 0, 0]; out.b = out.b || [0, 0, 0];
  if (p.kind === 'sphere') { jp(sk, p.a, out.a); jp(sk, p.a, out.b); out.r = p.r; return out; }
  if (p.kind === 'cyl') { jp(sk, p.a, out.a); jp(sk, p.b, out.b); out.r = p.r; return out; }
  const bx = partBox(sk, pi, _box);
  if (p.kind === 'torso') {
    for (let i = 0; i < 3; i++) { out.a[i] = bx.c[i] - bx.ax[1][i] * 0.12; out.b[i] = bx.c[i] + bx.ax[1][i] * 0.12; }
    out.r = 0.15; return out;
  }
  if (p.kind === 'pelvis') {
    for (let i = 0; i < 3; i++) { out.a[i] = bx.c[i] - bx.ax[0][i] * 0.08; out.b[i] = bx.c[i] + bx.ax[0][i] * 0.08; }
    out.r = 0.1; return out;
  }
  for (let i = 0; i < 3; i++) { out.a[i] = bx.c[i] - bx.ax[2][i] * 0.09; out.b[i] = bx.c[i] + bx.ax[2][i] * 0.09; }
  out.r = 0.045; return out;
}

const _ca = {}, _cb = {}, _pa = [0, 0, 0], _pb = [0, 0, 0];
/** İki iskeletin seçili parçaları arası en kısa yüzey mesafesi (negatif = iç içe / temas). */
export function minPartDistance(skA, partsA, skB, partsB) {
  let best = { d: Infinity, pa: -1, pb: -1, point: [0, 0, 0] };
  for (const ia of partsA) {
    partCapsule(skA, ia, _ca);
    for (const ib of partsB) {
      partCapsule(skB, ib, _cb);
      const d = segSegDist(_ca.a, _ca.b, _cb.a, _cb.b, _pa, _pb) - _ca.r - _cb.r;
      if (d < best.d) {
        best.d = d; best.pa = ia; best.pb = ib;
        // temas noktası: iki yüzeyin ortası
        const L2 = Math.hypot(_pb[0] - _pa[0], _pb[1] - _pa[1], _pb[2] - _pa[2]) || 1;
        const w = (_ca.r + (d) / 2) / L2;
        for (let i = 0; i < 3; i++) best.point[i] = _pa[i] + (_pb[i] - _pa[i]) * clamp(w, 0, 1);
      }
    }
  }
  return best;
}

/** Top (küre) ile parça arasındaki yüzey mesafesi ve en yakın nokta. */
export function ballPartDistance(sk, pi, bx, by, bz, ballR) {
  const p = PARTS[pi];
  if (p.kind === 'torso' || p.kind === 'pelvis' || p.kind === 'foot') {
    const b = partBox(sk, pi, _box);
    const v = [bx - b.c[0], by - b.c[1], bz - b.c[2]];
    const q = [0, 0, 0];
    let out2 = 0;
    for (let i = 0; i < 3; i++) {
      const d = v[0] * b.ax[i][0] + v[1] * b.ax[i][1] + v[2] * b.ax[i][2];
      const cl = clamp(d, -b.h[i], b.h[i]);
      q[i] = cl;
      out2 += (d - cl) * (d - cl);
    }
    const pt = [b.c[0], b.c[1], b.c[2]];
    for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) pt[k] += b.ax[i][k] * q[i];
    return { d: Math.sqrt(out2) - ballR, point: pt, t: 0 };
  }
  const c = partCapsule(sk, pi, _ca);
  const ab = [c.b[0] - c.a[0], c.b[1] - c.a[1], c.b[2] - c.a[2]];
  const l2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
  const t = l2 > 1e-9 ? clamp(((bx - c.a[0]) * ab[0] + (by - c.a[1]) * ab[1] + (bz - c.a[2]) * ab[2]) / l2, 0, 1) : 0;
  const q = [c.a[0] + ab[0] * t, c.a[1] + ab[1] * t, c.a[2] + ab[2] * t];
  const dd = Math.hypot(bx - q[0], by - q[1], bz - q[2]);
  const pt = [q[0] + (bx - q[0]) / (dd || 1) * c.r, q[1] + (by - q[1]) / (dd || 1) * c.r, q[2] + (bz - q[2]) / (dd || 1) * c.r];
  return { d: dd - c.r - ballR, point: pt, t, len: Math.sqrt(l2) };
}

/** Vuruş anında topun durması gereken nokta: vuran ayağın ucunun hemen önü. */
export function footBallPoint(sk, left, ballR) {
  const a = left ? J.ANKL : J.ANKR, b = left ? J.TOEL : J.TOER;
  const ax = sk.j[a * 3], az = sk.j[a * 3 + 2], tx = sk.j[b * 3], tz = sk.j[b * 3 + 2];
  const n = Math.hypot(tx - ax, tz - az) || 1;
  return [tx + (tx - ax) / n * ballR * 0.95, ballR, tz + (tz - az) / n * ballR * 0.95];
}

export function jointPos(sk, i) { return [sk.j[i * 3], sk.j[i * 3 + 1], sk.j[i * 3 + 2]]; }
