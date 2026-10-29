// PENALTI ŞÜPHESİ
// Alt türler: içeride net faul, dışarıda faul (çizgiye yakın), çizgi üstü faul,
// dalış (temas yok), hafif temas (gri alan), topa temiz müdahale.
// Gerçek cevap: bacak parçaları arası gerçek temas mesafesi + temasın gerçekleştiği nokta.

import { POSE, ARM, BOX_LINE_X, PITCH } from '../constants.js';
import { pick, idOf, newChoreo, src, refWrong, pack, keeperIdle } from './common.js';
import { contactScan, LEG_PARTS } from '../../var/truth.js';
import { J } from '../skeleton.js';

const W = [
  { w: 3, v: 'foulIn' }, { w: 2.2, v: 'foulOut' }, { w: 2, v: 'foulLine' },
  { w: 2.4, v: 'dive' }, { w: 1.6, v: 'light' }, { w: 1.4, v: 'clean' },
];

export function generate(ctx, forced) {
  const { sim, rng, diff } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const lv = diff.level;
  const used = new Set();
  const N = 215;
  const fc = rng.int(96, 118);
  const side = rng.sign();
  let subtype = forced || rng.weighted(diff.gray > 0.25 ? [...W, { w: 1.5, v: 'light' }] : W);

  const A = pick(sim, AT, [9, 10, 5, 8], used);
  const D = pick(sim, DF, [2, 3, 1, 4], used);
  const D2 = pick(sim, DF, [3, 2, 4, 1], used);
  const GK = idOf(DF, 0);

  const near = (a, b, c2) => (lv === 0 ? rng.range(...a) : lv === 1 ? rng.range(...b) : rng.range(...c2));
  let Xc;
  if (subtype === 'foulOut') Xc = BOX_LINE_X - near([0.8, 2.4], [0.3, 1.1], [0.06, 0.45]);
  else if (subtype === 'foulLine') Xc = BOX_LINE_X + near([0.8, 2.0], [0.25, 0.9], [0.03, 0.35]);
  else Xc = BOX_LINE_X + rng.range(1.6, 7);
  const Zc = side * rng.range(4, 13);

  const c = newChoreo(ctx, N);
  const fall = subtype !== 'clean';
  const fallStart = subtype === 'dive' ? fc + rng.int(0, 3) : fc + 2;
  const fallDir = rng.range(-0.35, 0.35);
  // hücumcu: köşeden ceza sahasına çapraz giriş
  const aPts = [
    [0, Xc - 16, Zc + side * 6.5], [fc - 40, Xc - 7.6, Zc + side * 2.8], [fc, Xc, Zc],
  ];
  if (fall) aPts.push([fallStart + 12, Xc + 1.7, Zc - side * 0.5], [fallStart + 32, Xc + 2.5, Zc - side * 0.8, 's']);
  else aPts.push([fc + 20, Xc + 3.5, Zc - side * 1.5], [fc + 50, Xc + 5, Zc - side * 2, 's']);
  c.path(A, aPts);
  if (fall) {
    c.pose(A, fallStart, fallStart + 18, POSE.FALL, fallDir);
    c.pose(A, fallStart + 19, N - 1, POSE.DOWN, fallDir);
  } else {
    c.pose(A, fc + 22, N - 1, POSE.LOCO, ARM.PROTEST);
  }

  // savunmacı yaklaşma yönü (göreli): kale tarafından ve içeriden
  const ux = 0.55, uz = -side * 0.84;
  const un = Math.hypot(ux, uz);
  const u = [ux / un, uz / un];
  c.path(A, aPts); // savunmacı yolu için yer tutucu
  c.path(D, [[0, Xc + 7, Zc - side * 7], [N - 1, Xc + 7, Zc - side * 7]]);
  keeperIdle(c, GK, N);
  if (D2 !== null) c.path(D2, [[0, Xc + 9, Zc * 0.2], [fc, Xc + 6, Zc * 0.3], [N - 1, Xc + 5, Zc * 0.4]]);
  c.build();

  // temas edilecek bacak: savunmacıya yakın olan
  const sk = c.skel(A, fc);
  const [aRx, aRz] = c.posR(A, fc);
  const ankle = (j) => c.R(sk.j[j * 3], sk.j[j * 3 + 2]);
  const aL = ankle(J.ANKL), aR = ankle(J.ANKR);
  const dot = (p) => (p[0] - aRx) * u[0] + (p[1] - aRz) * u[1];
  const legP = dot(aL) > dot(aR) ? aL : aR;
  const ballR = c.R(...[c.pos(A, fc)[0] + c.fwd(A, fc)[0] * 0.6, c.pos(A, fc)[1] + c.fwd(A, fc)[1] * 0.6]);

  // istenen en kısa mesafe (m): negatif = iç içe (temas)
  let desired;
  if (subtype === 'foulIn' || subtype === 'foulOut' || subtype === 'foulLine') desired = -rng.range(0.05, 0.1);
  else if (subtype === 'light') desired = -rng.range(0.006, 0.018);
  else if (subtype === 'dive') desired = lv === 0 ? rng.range(0.28, 0.5) : lv === 1 ? rng.range(0.16, 0.32) : rng.range(0.1, 0.2);
  else desired = 0.2;

  let sep = 0.11 - desired; // ayak bileği hedefi ile hücumcunun bileği arası
  let T = subtype === 'clean' ? [ballR[0] + u[0] * 0.15, ballR[1] + u[1] * 0.15] : [legP[0] + u[0] * sep, legP[1] + u[1] * sep];
  const tH = subtype === 'clean' ? 0.1 : rng.range(0.08, 0.16);
  const S = src(c);
  const setDefender = () => {
    const RD = [T[0] + u[0] * 0.86, T[1] + u[1] * 0.86];
    c.path(D, [
      [0, Xc + 7.5, Zc - side * 7.5], [fc - 34, RD[0] + u[0] * 4.2, RD[1] + u[1] * 4.2], [fc - 8, RD[0] + u[0] * 0.9, RD[1] + u[1] * 0.9],
      [fc, RD[0], RD[1]], [fc + 16, RD[0] - u[0] * 0.6, RD[1] - u[1] * 0.6, 's'], [N - 1, RD[0] - u[0] * 1.2, RD[1] - u[1] * 1.2],
    ]);
    const sd = c.specs.get(D);
    sd.poses = []; sd.faces = [];
    c.face(D, fc - 20, fc + 20, { X: T[0], Z: T[1] });
    c.build();
    const [wx, wz] = c.W(T[0], T[1]);
    const [lf, lr] = c.toLocal(D, fc, wx, wz);
    c.pose(D, fc - 9, fc + 7, POSE.LUNGE, lf, lr, tH);
    if (subtype === 'clean') c.pose(D, fc + 20, N - 1, POSE.LOCO, 0);
    c.build();
  };
  setDefender();
  if (subtype !== 'clean') {
    for (let it = 0; it < 5; it++) {
      const s = contactScan(S, fc - 8, fc + 3, D, LEG_PARTS, A, LEG_PARTS);
      const err = s.minD - desired;
      if (Math.abs(err) < 0.003) break;
      T = [T[0] - u[0] * err, T[1] - u[1] * err];
      setDefender();
    }
  }
  // temas noktasını hedef konuma getir (tüm sahneyi kaydır)
  if (subtype === 'foulIn' || subtype === 'foulOut' || subtype === 'foulLine') {
    for (let it = 0; it < 3; it++) {
      const s = contactScan(S, fc - 8, fc + 3, D, LEG_PARTS, A, LEG_PARTS);
      const p = s.firstPoint || s.point;
      const pX = c.R(p[0], p[2])[0];
      const d = Xc - pX;
      if (Math.abs(d) < 0.002) break;
      for (const id of [A, D]) c.shift(id, d, 0);
      T = [T[0] + d, T[1]];
      setDefender();
    }
  }

  // top
  c.ballCarry(A, 0, fc - 2, 0.6);
  const bp = c.ballAt(fc - 2);
  if (subtype === 'clean') {
    const [fx, fz] = c.fwd(D, fc);
    const a = Math.atan2(fz, fx) + side * 0.9 * c.dir;
    const bc = c.WB(T[0] - u[0] * 0.14, 0.11, T[1] - u[1] * 0.14);
    c.ballLine(fc - 2, fc, bp, bc);
    c.ballLoose(fc, N - 1, bc, Math.cos(a) * 9, Math.sin(a) * 9, 1.2);
  } else {
    const [fx, fz] = c.fwd(A, fc);
    c.ballLoose(fc - 1, N - 1, bp, fx * 3.2 + c.dir * 0.4, fz * 3.2, 0);
  }

  // hakem kararı
  const wrong = subtype === 'light' ? rng.chance(0.5) : refWrong(ctx);
  let ref;
  if (subtype === 'foulIn') ref = wrong ? 'NOFOUL' : 'PEN';
  else if (subtype === 'foulLine') ref = wrong ? (rng.chance(0.6) ? 'FK' : 'NOFOUL') : 'PEN';
  else if (subtype === 'foulOut') ref = wrong ? 'PEN' : 'FK';
  else if (subtype === 'dive') ref = wrong ? 'PEN' : 'NOFOUL';
  else if (subtype === 'clean') ref = wrong ? 'PEN' : 'NOFOUL';
  else ref = wrong ? 'PEN' : 'NOFOUL';

  const sc = pack(ctx, c, {
    type: 'PENALTI', subtype, keyFrame: fc, focus: A, keep: [A, D],
    refDecision: ref,
    meta: { attacker: A, defender: D, fallStart, Xc },
    line: 'box', bestCam: 5,
  });
  const wf = fc + 14;
  sc.events.push({ f: wf, type: ref === 'NOFOUL' ? 'crowd' : 'whistle' });
  if (ref === 'PEN') {
    const [px, pz] = c.W(PITCH.HL - PITCH.SPOT, 0);
    sc.overlays.push({ id: 22, f0: wf + 6, f1: N - 1, pose: POSE.POINT, p1: 0, p2: 0, p3: 0, toward: [px, pz] });
  }
  return sc;
}

export function judge(S, sc) {
  const { attacker: A, defender: D } = sc.meta;
  const fc = sc.keyFrame;
  const s = contactScan(S, fc - 8, fc + 3, D, LEG_PARTS, A, LEG_PARTS);
  const p = s.firstPoint || s.point;
  const X = p[0] * sc.dir, Z = p[2] * sc.dir;
  const inside = X >= BOX_LINE_X && Math.abs(Z) <= PITCH.BOX_HW;
  let fell = false;
  for (let f = fc - 3; f <= fc + 12; f++) { const e = S.ent(f, A); if (e && e.pose === POSE.FALL) { fell = true; break; } }
  let outcome, accept, gray = false;
  if (s.contact) {
    if (sc.subtype === 'light' || (sc.subtype === 'clean')) {
      gray = true;
      outcome = inside ? 'PEN' : 'FK';
      accept = { [outcome]: 1, NOFOUL: 1 };
    } else {
      outcome = inside ? 'PEN' : 'FK';
      accept = { [outcome]: 1 };
    }
  } else if (fell) {
    outcome = 'DIVE';
    accept = { DIVE: 1, NOFOUL: 0.8 };
  } else {
    outcome = 'NOFOUL';
    accept = { NOFOUL: 1 };
  }
  // yer (içeride/dışarıda) olgusal bir karardır
  const factual = s.contact && !gray && (sc.refDecision === 'PEN' || sc.refDecision === 'FK');
  return {
    outcome, accept, gray, factual,
    keyFrame: s.contact ? s.first : s.minF,
    facts: {
      contact: s.contact,
      minDistM: s.minD,
      penetrationM: s.maxPen,
      contactFrame: s.contact ? s.first : -1,
      closestFrame: s.minF,
      distLineM: X - BOX_LINE_X,
      inside,
      fell,
      point: p,
    },
  };
}
