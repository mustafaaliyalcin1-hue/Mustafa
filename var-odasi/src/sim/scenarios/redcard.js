// KIRMIZI KART ŞÜPHESİ
//  - sertFaul: kayarak müdahale; krampon yüksekliği ve hız rakibin sağlığını tehlikeye atıyor mu?
//  - golFirsati: son adam faulü (DOGSO) — kale yönünde koruma yapan savunmacı var mı?
// Gerçek cevap: temas + krampon (ayak bileği) yüksekliği ve hız / temas anında kaleye
// daha yakın ve araya girebilecek savunmacıların konumu (kayıttan ölçülür).

import { POSE, ARM, PITCH } from '../constants.js';
import { pick, idOf, newChoreo, src, refWrong, pack, keeperIdle } from './common.js';
import { contactScan, LEG_PARTS } from '../../var/truth.js';
import { J } from '../skeleton.js';

const W = [
  { w: 2.6, v: 'sertKirmizi' }, { w: 2.2, v: 'sertSari' }, { w: 1.2, v: 'sertGri' },
  { w: 2.4, v: 'dogsoKirmizi' }, { w: 2.2, v: 'dogsoKoruma' }, { w: 1.0, v: 'dogsoGri' },
];

function shinPointAt(sk, legSide, h) {
  // baldır üzerinde istenen yükseklikteki nokta
  const k = legSide > 0 ? J.KNEER : J.KNEEL, a = legSide > 0 ? J.ANKR : J.ANKL;
  const K = [sk.j[k * 3], sk.j[k * 3 + 1], sk.j[k * 3 + 2]], A = [sk.j[a * 3], sk.j[a * 3 + 1], sk.j[a * 3 + 2]];
  const t = Math.max(0, Math.min(1, (h - A[1]) / ((K[1] - A[1]) || 1)));
  return [A[0] + (K[0] - A[0]) * t, A[1] + (K[1] - A[1]) * t, A[2] + (K[2] - A[2]) * t];
}

export function generate(ctx, forced) {
  const sub = forced || ctx.rng.weighted(ctx.diff.gray > 0.25 ? [...W, { w: 1.4, v: 'sertGri' }, { w: 1.2, v: 'dogsoGri' }] : W);
  return sub.startsWith('sert') ? seriousFoul(ctx, sub) : dogso(ctx, sub);
}

function seriousFoul(ctx, subtype) {
  const { sim, rng } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const N = 200;
  const fc = rng.int(80, 100);
  const s = rng.sign();
  const A = pick(sim, AT, [6, 7, 5, 8], used);
  const D = pick(sim, DF, [6, 7, 5, 8], used);
  const M2 = pick(sim, DF, [7, 6, 2], used);
  const X0 = rng.range(-12, 18), Z0 = rng.range(-18, 18);

  const c = newChoreo(ctx, N);
  c.path(A, [[0, X0 - 15, Z0 - s * 3], [fc - 30, X0 - 5.5, Z0 - s * 1], [fc, X0, Z0], [fc + 14, X0 + 1.8, Z0 + s * 0.4], [fc + 34, X0 + 2.6, Z0 + s * 0.6, 's']]);
  c.pose(A, fc + 1, fc + 16, POSE.FALL, s * 0.4);
  c.pose(A, fc + 17, N - 1, POSE.DOWN, s * 0.4);
  c.path(D, [[0, X0 + 8, Z0 + s * 7], [N - 1, X0, Z0]]);
  if (M2 !== null) c.path(M2, [[0, X0 + 6, Z0 - s * 6], [N - 1, X0 + 3, Z0 - s * 3]]);
  c.build();

  let h;
  if (subtype === 'sertKirmizi') h = rng.range(0.3, 0.46);
  else if (subtype === 'sertSari') h = rng.range(0.04, 0.1);
  else h = rng.range(0.17, 0.24);
  const sk = c.skel(A, fc);
  // savunmacı tarafındaki bacak
  const u = [0.62, s * 0.78];
  const legSide = s; // +X yönünde koşarken göreli +Z tarafı gövdenin sağıdır
  const shin = shinPointAt(sk, legSide, h);
  const sh = c.R(shin[0], shin[2]);
  const pen = 0.03;
  let T = [sh[0] + u[0] * (0.105 - pen), sh[1] + u[1] * (0.105 - pen)];
  const speed = subtype === 'sertKirmizi' ? rng.range(6.5, 8) : rng.range(4.2, 5.5);
  const setD = () => {
    const RD = [T[0] + u[0] * 0.88, T[1] + u[1] * 0.88];
    const back = speed * 14 / 30; // kayma mesafesi
    c.path(D, [
      [0, RD[0] + u[0] * 14, RD[1] + u[1] * 14], [fc - 14, RD[0] + u[0] * back, RD[1] + u[1] * back],
      [fc, RD[0], RD[1]], [fc + 16, RD[0] - u[0] * 1.6, RD[1] - u[1] * 1.6, 's'], [N - 1, RD[0] - u[0] * 1.8, RD[1] - u[1] * 1.8],
    ]);
    const sd = c.specs.get(D); sd.poses = []; sd.faces = [];
    c.face(D, fc - 30, fc + 30, { X: T[0], Z: T[1] });
    c.build();
    const [wx, wz] = c.W(T[0], T[1]);
    const [lf, lr] = c.toLocal(D, fc, wx, wz);
    c.pose(D, fc - 14, fc + 10, POSE.SLIDE, lf, lr, h);
    c.pose(D, fc + 11, fc + 40, POSE.SLIDE, lf * 0.7, lr, 0.1);
    c.build();
  };
  setD();
  const S = src(c);
  for (let it = 0; it < 4; it++) {
    const r = contactScan(S, fc - 6, fc + 3, D, LEG_PARTS, A, LEG_PARTS);
    const err = r.minD - (-0.04);
    if (Math.abs(err) < 0.004) break;
    T = [T[0] - u[0] * err, T[1] - u[1] * err];
    setD();
  }
  c.ballCarry(A, 0, fc - 3, 0.6);
  const [fx, fz] = c.fwd(A, fc);
  c.ballLoose(fc - 2, N - 1, c.ballAt(fc - 3), fx * 4, fz * 4, 0.6);

  let ref;
  if (subtype === 'sertGri') ref = rng.chance(0.5) ? 'RED' : 'NORED';
  else { const wrong = refWrong(ctx); const red = subtype === 'sertKirmizi'; ref = red !== wrong ? 'RED' : 'NORED'; }
  const sc = pack(ctx, c, {
    type: 'KIRMIZI', subtype, keyFrame: fc, focus: A, keep: [A, D],
    refDecision: ref, meta: { kind: 'sert', attacker: A, defender: D, leadSide: 1 },
    line: null, bestCam: 5,
  });
  cardSequence(sc, c, ctx, D, fc, ref);
  return sc;
}

function dogso(ctx, subtype) {
  const { sim, rng } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const N = 230;
  const fc = rng.int(110, 130);
  const s = rng.sign();
  const A = pick(sim, AT, [9, 10], used);
  const Pp = pick(sim, AT, [6, 7], used);
  const D = pick(sim, DF, [2, 3], used);
  const C2 = pick(sim, DF, [3, 2, 1, 4], used);
  const GK = idOf(DF, 0);
  const XA = rng.range(22, 30), ZA = rng.range(-7, 7);
  const fr = 40;
  const c = newChoreo(ctx, N);
  const R0 = [XA - 14, ZA - s * 2];
  c.path(Pp, [[0, R0[0] - 18, R0[1] + s * 6], [12, R0[0] - 15.5, R0[1] + s * 5.4], [40, R0[0] - 12, R0[1] + s * 4, 's'], [N - 1, R0[0] - 8, R0[1] + s * 3]]);
  c.face(Pp, 0, 14, { X: R0[0], Z: R0[1] });
  c.pose(Pp, 3, 18, POSE.KICK);
  c.path(A, [[0, R0[0] - 4, R0[1] - s * 3], [fr, R0[0], R0[1]], [fc, XA, ZA], [fc + 14, XA + 2, ZA + s * 0.3], [fc + 34, XA + 2.8, ZA + s * 0.4, 's']]);
  c.pose(A, fc + 1, fc + 17, POSE.FALL, -s * 0.3);
  c.pose(A, fc + 18, N - 1, POSE.DOWN, -s * 0.3);
  c.path(D, [[0, R0[0] + 2, R0[1] + s * 6], [N - 1, XA, ZA]]);
  // koruma yapan savunmacı
  let cx, cz;
  if (subtype === 'dogsoKoruma') { cx = XA + rng.range(3.5, 6.5); cz = ZA + s * rng.range(0.5, 3); }
  else if (subtype === 'dogsoGri') { cx = XA + rng.range(6.5, 9.5); cz = ZA + s * rng.range(5.5, 8.5); }
  else { cx = XA - rng.range(5, 9); cz = ZA - s * rng.range(9, 14); }
  if (C2 !== null) c.path(C2, [[0, cx - 4, cz + (cz - ZA) * 0.4], [fc, cx, cz], [N - 1, cx + 1, (cz + ZA) / 2]]);
  keeperIdle(c, GK, N);
  c.build();

  const sk = c.skel(A, fc);
  const u0 = [-0.55, s * 0.83];
  const legSide = s;
  const ak = legSide > 0 ? J.ANKR : J.ANKL;
  const an = c.R(sk.j[ak * 3], sk.j[ak * 3 + 2]);
  let T = [an[0] + u0[0] * 0.07, an[1] + u0[1] * 0.07];
  const setD = () => {
    const RD = [T[0] + u0[0] * 0.86, T[1] + u0[1] * 0.86];
    c.path(D, [[0, R0[0] + 2, R0[1] + s * 6], [fc - 40, RD[0] - 6, RD[1] + s * 1.5], [fc, RD[0], RD[1]], [fc + 16, RD[0] + 1.6, RD[1], 's'], [N - 1, RD[0] + 2, RD[1]]]);
    const sd = c.specs.get(D); sd.poses = []; sd.faces = [];
    c.face(D, fc - 12, fc + 10, { X: T[0], Z: T[1] });
    c.build();
    const [wx, wz] = c.W(T[0], T[1]);
    const [lf, lr] = c.toLocal(D, fc, wx, wz);
    c.pose(D, fc - 9, fc + 7, POSE.LUNGE, lf, lr, 0.12);
    c.build();
  };
  setD();
  const S = src(c);
  for (let it = 0; it < 4; it++) {
    const r = contactScan(S, fc - 7, fc + 3, D, LEG_PARTS, A, LEG_PARTS);
    const err = r.minD - (-0.05);
    if (Math.abs(err) < 0.004) break;
    T = [T[0] - u0[0] * err, T[1] - u0[1] * err];
    setD();
  }
  // top: ara pası, sonra sürüş
  const k = c.footBall(Pp, 12);
  c.ballHold(0, 11, k);
  const [rx, rz] = c.pos(A, fr), [fx, fz] = c.fwd(A, fr);
  c.ballLine(12, fr, k, [rx + fx * 0.6, 0.11, rz + fz * 0.6], 'out');
  c.ballCarry(A, fr + 1, fc - 2, 0.75);
  const [gx, gz] = c.fwd(A, fc);
  c.ballLoose(fc - 1, N - 1, c.ballAt(fc - 2), gx * 4.5, gz * 4.5, 0);

  let ref;
  if (subtype === 'dogsoGri') ref = rng.chance(0.5) ? 'RED' : 'NORED';
  else { const wrong = refWrong(ctx); const red = subtype === 'dogsoKirmizi'; ref = red !== wrong ? 'RED' : 'NORED'; }
  const sc = pack(ctx, c, {
    type: 'KIRMIZI', subtype, keyFrame: fc, focus: A, keep: [A, D, C2],
    refDecision: ref, meta: { kind: 'dogso', attacker: A, defender: D, cover: C2 },
    line: null, bestCam: 3,
  });
  sc.events.push({ f: 12, type: 'kick' });
  sc.constrain = (e, wx, wz, f) => {
    if (e.team === DF && e.idx !== 0) {
      const X = ctx.dir * wx;
      const ax = c.posR(A, f)[0];
      if (X > ax - 7) wx = ctx.dir * (ax - 7);
    }
    return [wx, wz];
  };
  cardSequence(sc, c, ctx, D, fc, ref);
  return sc;
}

function cardSequence(sc, c, ctx, D, fc, ref) {
  sc.events.push({ f: fc + 6, type: 'whistle' });
  const cf = Math.min(c.n - 30, fc + 60);
  sc.events.push({ f: cf, type: 'card', color: ref === 'RED' ? 'red' : 'yellow', target: D });
  sc.overlays.push({ id: 22, f0: cf, f1: c.n - 1, pose: POSE.CARD, p1: ref === 'RED' ? 2 : 1 });
  sc.cardTarget = D;
  sc.cardColor = ref === 'RED' ? 'red' : 'yellow';
  sc.refApproach = { id: D, f0: fc + 12, f1: cf };
}

export function judge(S, sc) {
  const { attacker: A, defender: D } = sc.meta;
  const fc = sc.keyFrame;
  const r = contactScan(S, fc - 7, fc + 3, D, LEG_PARTS, A, LEG_PARTS);
  const cf = r.contact ? r.first : r.minF;
  let outcome, accept, gray = false;
  const facts = { contact: r.contact, contactFrame: r.contact ? r.first : -1, penetrationM: r.maxPen };
  if (sc.meta.kind === 'sert') {
    const st = S.ent(cf, D);
    // öne uzanan ayağın bileği (krampon yüksekliği)
    const h = st.p3 * 1;
    const realH = (() => {
      // ayak bileği yüksekliği: kayıttaki iskeletten
      const p = r.firstPoint || r.point;
      return p ? p[1] : h;
    })();
    const sp = st.sp;
    facts.studsHeightM = realH; facts.speed = sp;
    if (!r.contact) { outcome = 'NORED'; accept = { NORED: 1 }; }
    else if (realH >= 0.34 && sp >= 3.5) { outcome = 'RED'; accept = { RED: 1 }; }
    else if (realH >= 0.22) { gray = true; outcome = realH >= 0.28 ? 'RED' : 'NORED'; accept = { RED: 1, NORED: 1 }; }
    else { outcome = 'NORED'; accept = { NORED: 1 }; }
  } else {
    const a = S.ent(cf, A);
    const [AX, AZ] = [a.x * sc.dir, a.z * sc.dir];
    let clear = 0, grayN = 0, nearest = Infinity, nearestId = -1;
    for (const id of S.ids(sc.defTeam)) {
      if (id === D || id % 11 === 0) continue;
      const e = S.ent(cf, id);
      if (!e) continue;
      const X = e.x * sc.dir, Z = e.z * sc.dir;
      if (X <= AX + 0.5) continue; // kale tarafında değil
      // hücumcudan kaleye uzanan doğruya mesafe
      const gx = 52.5 - AX, gz = 0 - AZ, gl = Math.hypot(gx, gz);
      const t = Math.max(0, Math.min(1, ((X - AX) * gx + (Z - AZ) * gz) / (gl * gl)));
      const cd = Math.hypot(X - (AX + gx * t), Z - (AZ + gz * t));
      const d = Math.hypot(X - AX, Z - AZ);
      if (d < nearest) { nearest = d; nearestId = id; }
      if (cd < 4 && d < 10.5) clear++;
      else if (cd < 9 && d < 14) grayN++;
    }
    const distGoal = Math.hypot(52.5 - AX, AZ);
    facts.coverClear = clear; facts.coverGray = grayN; facts.distGoalM = distGoal; facts.nearestCoverM = nearest; facts.nearestId = nearestId;
    if (!r.contact) { outcome = 'NORED'; accept = { NORED: 1 }; }
    else if (clear > 0 || distGoal > 38) { outcome = 'NORED'; accept = { NORED: 1 }; }
    else if (grayN > 0) { gray = true; outcome = 'RED'; accept = { RED: 1, NORED: 1 }; }
    else { outcome = 'RED'; accept = { RED: 1 }; }
  }
  return { outcome, accept, gray, factual: false, keyFrame: cf, facts };
}
