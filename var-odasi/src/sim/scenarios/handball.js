// ELLE OYNAMA (ceza sahasında savunmacı)
// Orta, savunmacının vücuduna çarpar. Gerçek cevap: topun çarptığı vücut bölgesi
// (kol / omuz / gövde) ve kolun vücuttan açılma açısı (doğal / doğal olmayan pozisyon).

import { POSE, ARM, PITCH } from '../constants.js';
import { pick, idOf, newChoreo, src, refWrong, pack, keeperIdle } from './common.js';
import { ballHit, firstBallContact } from '../../var/truth.js';
import { computeSkeleton, makeSkel, J, PARTS, P } from '../skeleton.js';

const W = [
  { w: 3, v: 'kolAcik' }, { w: 2.4, v: 'kolDogal' }, { w: 1.8, v: 'omuz' }, { w: 1.4, v: 'gogus' }, { w: 1.8, v: 'gri' },
];

export function generate(ctx, forced) {
  const { sim, rng, diff } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const N = 200;
  const kf = rng.int(80, 100);
  const side = rng.sign();
  let subtype = forced || rng.weighted(diff.gray > 0.25 ? [...W, { w: 1.6, v: 'gri' }] : W);

  const C = pick(sim, AT, [side > 0 ? 5 : 8, 5, 8, 6], used); // kanattan ortalayan
  const D = pick(sim, DF, [2, 3, 1, 4], used);
  const F1 = pick(sim, AT, [9, 10], used);
  const F2 = pick(sim, AT, [10, 9], used);
  const D2 = pick(sim, DF, [3, 2, 4, 1], used);
  const GK = idOf(DF, 0);

  const cX = rng.range(37, 44), cZ = side * rng.range(19, 27);
  const dX = rng.range(43.5, 48), dZ = side * rng.range(2.5, 9);
  const flight = rng.int(14, 24);
  const fi = kf + flight;

  const c = newChoreo(ctx, N);
  // ortacı
  c.path(C, [[0, cX - 14, cZ + side * 2], [kf, cX, cZ], [kf + 20, cX + 2.5, cZ - side * 0.6, 's'], [N - 1, cX + 3.5, cZ - side * 2]]);
  c.face(C, kf - 18, kf + 6, { X: dX, Z: dZ });
  c.pose(C, kf - 9, kf + 6, POSE.KICK);

  // savunmacı: topa yan dönmüş ya da cepheden
  const n = [cX - dX, cZ - dZ];
  const nn = Math.hypot(n[0], n[1]);
  const nu = [n[0] / nn, n[1] / nn];
  // topa bakan taraf (kol): sağ kol → sağ yan topa dönük
  const armSide = rng.chance(0.5) ? 1 : 0; // 1 = sağ
  let fRel;
  if (subtype === 'gogus') fRel = nu;
  else fRel = armSide === 1 ? [nu[1], -nu[0]] : [-nu[1], nu[0]];
  // yarı yan dönüş (gerçekçi): biraz topa çevir
  const mix = subtype === 'gogus' ? 0 : 0.35;
  let fx = fRel[0] * (1 - mix) + nu[0] * mix, fz = fRel[1] * (1 - mix) + nu[1] * mix;
  const fn = Math.hypot(fx, fz); fx /= fn; fz /= fn;
  const hRel = Math.atan2(fz, fx);
  c.path(D, [[0, dX - 3, dZ + side * 1.5], [kf - 20, dX - 0.6, dZ + side * 0.3], [fi, dX, dZ, 's'], [N - 1, dX + 0.6, dZ]]);
  c.face(D, 0, N - 1, { h: hRel });

  // kol açısı (radyan, gövdeden yana açılma)
  let ang;
  if (subtype === 'kolAcik') ang = diff.level === 2 ? rng.range(0.85, 1.15) : rng.range(0.95, 1.5);
  else if (subtype === 'kolDogal') ang = rng.range(0.06, 0.24);
  else if (subtype === 'gri') ang = rng.range(0.42, 0.72);
  else ang = rng.range(0.05, 0.4);
  const raiseF = fi - (subtype === 'kolAcik' ? rng.int(8, 22) : rng.int(3, 9));
  const p3 = armSide;
  if (subtype !== 'gogus') {
    // kolu yavaşça aç
    const steps = 6;
    for (let s = 0; s < steps; s++) {
      const f0 = raiseF - steps + s;
      c.pose(D, f0, f0, POSE.LOCO, ARM.OUT, ang * (s + 1) / steps, p3);
    }
    c.pose(D, raiseF, fi + 10, POSE.LOCO, ARM.OUT, ang, p3);
  }
  // forvetler ceza sahasında
  if (F1 !== null) c.path(F1, [[0, dX - 10, dZ - side * 3], [kf, dX - 4, dZ - side * 3.5], [fi, dX - 1.5, dZ - side * 4.2], [N - 1, dX, dZ - side * 4]]);
  if (F2 !== null) c.path(F2, [[0, dX - 12, -dZ], [kf, dX - 6, -dZ * 0.5], [fi + 10, dX - 2, -dZ * 0.3], [N - 1, dX - 1, -dZ * 0.3]]);
  if (D2 !== null) c.path(D2, [[0, dX + 1.5, -dZ * 0.4 - side * 4], [N - 1, dX + 2, -dZ * 0.4 - side * 4.5]]);
  keeperIdle(c, GK, N);
  c.build();

  // çarpma noktası
  const sk = c.skel(D, fi);
  const jj = (k) => [sk.j[k * 3], sk.j[k * 3 + 1], sk.j[k * 3 + 2]];
  const sideJ = armSide === 1 ? 1 : 0;
  let target, rPart;
  if (subtype === 'gogus') {
    const pel = jj(J.PELVIS);
    target = [pel[0] + sk.up[0] * 0.33 + sk.fwd[0] * 0.11, pel[1] + sk.up[1] * 0.33, pel[2] + sk.up[2] * 0.33 + sk.fwd[2] * 0.11];
    rPart = 0;
  } else if (subtype === 'omuz') {
    const sh = jj(J.SHL + sideJ);
    target = [sh[0], sh[1] + 0.05, sh[2]];
    rPart = 0.02;
  } else {
    const e = jj(J.ELL + sideJ), h = jj(J.HANDL + sideJ);
    const t = rng.range(0.3, 0.7);
    target = [e[0] + (h[0] - e[0]) * t, e[1] + (h[1] - e[1]) * t, e[2] + (h[2] - e[2]) * t];
    rPart = 0.045;
  }
  // top, geldiği yönden yüzeye değecek şekilde
  const cp = c.pos(C, kf);
  const inc = [cp[0] - target[0], 0, cp[1] - target[2]];
  const il = Math.hypot(inc[0], inc[2]);
  inc[0] /= il; inc[2] /= il;
  // kol dışa açıksa topu biraz dıştan getir (gövdeye değmesin)
  if (subtype !== 'gogus' && subtype !== 'omuz') {
    const sx = sk.right[0] * (armSide === 1 ? 1 : -1), sz = sk.right[2] * (armSide === 1 ? 1 : -1);
    inc[0] = inc[0] * 0.6 + sx * 0.4; inc[2] = inc[2] * 0.6 + sz * 0.4;
    const l2 = Math.hypot(inc[0], inc[2]); inc[0] /= l2; inc[2] /= l2;
  }
  const off = rPart + 0.11 - 0.012;
  const impact = [target[0] + inc[0] * off, target[1], target[2] + inc[2] * off];

  // top yolu
  c.ballCarry(C, 0, kf - 10, 0.55);
  const kick = c.footBall(C, kf);
  c.ballLine(kf - 9, kf, c.ballAt(kf - 10), kick);
  // düz atış: hedef noktaya doğru, hafif kavis
  const arc = Math.max(0, rng.range(0.4, 1.4) * (impact[1] < 1.0 ? 0.6 : 1));
  c.ballAir(kf, fi, kick, impact, arc);
  // sekme
  const rv = [-inc[0] * 0.3 + (rng.next() - 0.5), -inc[2] * 0.3 + (rng.next() - 0.5)];
  c.ballLoose(fi + 1, N - 1, impact, inc[0] * 5 + rv[0] * 4, inc[2] * 5 + rv[1] * 4, 2.5);

  const S = src(c);
  const hit = firstBallContact(S, kf + 2, fi + 1, D);
  const realHand = hit && (hit.region === 'kol') && ang >= 0.6;
  let ref;
  if (subtype === 'gri') ref = rng.chance(0.5) ? 'PEN' : 'NOFOUL';
  else {
    const wrong = refWrong(ctx);
    ref = realHand ? (wrong ? 'NOFOUL' : 'PEN') : (wrong ? 'PEN' : 'NOFOUL');
  }
  const sc = pack(ctx, c, {
    type: 'ELLE', subtype, keyFrame: fi, focus: D, keep: [D, C, F1],
    refDecision: ref,
    meta: { defender: D, crosser: C, armAngle: ang, armSide, kickFrame: kf },
    line: 'box', bestCam: 5,
  });
  sc.events.push({ f: kf, type: 'kick' }, { f: fi, type: 'thud' }, { f: fi + 12, type: ref === 'PEN' ? 'whistle' : 'crowd' });
  if (ref === 'PEN') {
    const [px, pz] = c.W(PITCH.HL - PITCH.SPOT, 0);
    sc.overlays.push({ id: 22, f0: fi + 18, f1: N - 1, pose: POSE.POINT, p1: 0, toward: [px, pz] });
  }
  return sc;
}

export function judge(S, sc) {
  const { defender: D, kickFrame } = sc.meta;
  const hit = firstBallContact(S, kickFrame + 2, sc.keyFrame + 3, D);
  // kol açısı kayıttan okunur (kol pozu parametresi)
  const st = S.ent(sc.keyFrame, D);
  let ang = 0;
  if (st.pose === POSE.LOCO && (st.p1 | 0) === ARM.OUT) ang = st.p2;
  const region = hit ? hit.region : 'yok';
  const arm = region === 'kol';
  let outcome, accept, gray = false;
  if (arm && ang >= 0.75) { outcome = 'PEN'; accept = { PEN: 1 }; }
  else if (arm && ang >= 0.4) { gray = true; outcome = ang >= 0.6 ? 'PEN' : 'NOFOUL'; accept = { PEN: 1, NOFOUL: 1 }; }
  else { outcome = 'NOFOUL'; accept = { NOFOUL: 1 }; }
  return {
    outcome, accept, gray, factual: false,
    keyFrame: hit ? hit.f : sc.keyFrame,
    facts: {
      region, part: hit ? PARTS[hit.part].name : '-', armAngleDeg: ang * 180 / Math.PI,
      contactFrame: hit ? hit.f : -1,
      point: hit ? hit.point : null,
    },
  };
}
