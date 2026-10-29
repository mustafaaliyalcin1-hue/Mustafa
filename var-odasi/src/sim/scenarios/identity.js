// KİMLİK KARIŞIKLIĞI
// Faulü yapan ile yanındaki takım arkadaşı birbirine çok yakın. Hakem kartı yanlış
// oyuncuya gösterebilir. Gerçek cevap: hücumcunun bacağına gerçekten temas eden oyuncu.

import { POSE, ARM, REF } from '../constants.js';
import { pick, newChoreo, src, refWrong, pack } from './common.js';
import { contactScan, LEG_PARTS } from '../../var/truth.js';
import { J } from '../skeleton.js';

export function generate(ctx) {
  const { sim, rng } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const N = 240;
  const fc = rng.int(80, 96);
  const s = rng.sign();
  const A = pick(sim, AT, [6, 7, 9, 10, 5, 8], used);
  const O = pick(sim, DF, [6, 7, 5, 8], used);
  const B = pick(sim, DF, [7, 6, 8, 5], used);
  const T3 = pick(sim, DF, [2, 3, 1, 4], used);
  const X0 = rng.range(-10, 20), Z0 = rng.range(-16, 16);

  const c = newChoreo(ctx, N);
  c.path(A, [[0, X0 - 14, Z0 - s * 2], [fc - 30, X0 - 5.4, Z0 - s * 0.6], [fc, X0, Z0], [fc + 14, X0 + 1.7, Z0 + s * 0.3], [fc + 32, X0 + 2.4, Z0 + s * 0.5, 's']]);
  c.pose(A, fc + 2, fc + 18, POSE.FALL, s * 0.3);
  c.pose(A, fc + 19, fc + 120, POSE.DOWN, s * 0.3);
  c.pose(A, fc + 121, fc + 150, POSE.GETUP, s * 0.3);
  c.path(O, [[0, X0 + 6, Z0 + s * 6], [N - 1, X0, Z0]]);
  c.build();

  // faul yapan: hücumcunun sağ/sol yanından bileğe
  const sk = c.skel(A, fc);
  const u = [0.5, s * 0.87];
  const ak = s > 0 ? J.ANKR : J.ANKL;
  const an = c.R(sk.j[ak * 3], sk.j[ak * 3 + 2]);
  let T = [an[0] + u[0] * 0.06, an[1] + u[1] * 0.06];
  const setO = () => {
    const RD = [T[0] + u[0] * 0.86, T[1] + u[1] * 0.86];
    c.path(O, [[0, RD[0] + u[0] * 9, RD[1] + u[1] * 9], [fc - 9, RD[0] + u[0] * 1.2, RD[1] + u[1] * 1.2], [fc, RD[0], RD[1], 's'], [fc + 40, RD[0] + 0.4, RD[1] + u[1] * 0.4, 's'], [N - 1, RD[0] + 0.6, RD[1] + u[1] * 0.5]]);
    const sp = c.specs.get(O); sp.poses = []; sp.faces = [];
    c.face(O, fc - 12, fc + 8, { X: T[0], Z: T[1] });
    c.build();
    const [wx, wz] = c.W(T[0], T[1]);
    const [lf, lr] = c.toLocal(O, fc, wx, wz);
    c.pose(O, fc - 9, fc + 7, POSE.LUNGE, lf, lr, 0.1);
    c.build();
  };
  setO();
  const S = src(c);
  for (let it = 0; it < 4; it++) {
    const r = contactScan(S, fc - 7, fc + 3, O, LEG_PARTS, A, LEG_PARTS);
    const err = r.minD - (-0.05);
    if (Math.abs(err) < 0.004) break;
    T = [T[0] - u[0] * err, T[1] - u[1] * err];
    setO();
  }
  // takım arkadaşı: çok yakın ama temas yok
  const [ox, oz] = c.posR(O, fc);
  const gap = rng.range(1.5, 2.6);
  const bz = oz + s * gap * 0.55, bx = ox + gap * 0.8;
  c.path(B, [[0, bx + 7, bz + s * 5], [fc - 10, bx + 1.2, bz + s * 0.5], [fc, bx, bz, 's'], [fc + 40, bx - 0.4, bz, 's'], [N - 1, bx - 0.6, bz]]);
  c.face(B, fc - 6, N - 1, { X: X0 + 1.5, Z: Z0 });
  if (T3 !== null) c.path(T3, [[0, X0 + 12, Z0 - s * 5], [fc, X0 + 5, Z0 - s * 4.5], [N - 1, X0 + 3.6, Z0 - s * 3.8]]);

  // kart: doğru ya da yanlış oyuncuya
  const wrong = refWrong(ctx);
  const target = wrong ? (T3 !== null && rng.chance(0.2) ? T3 : B) : O;
  const cf = fc + rng.int(55, 70);
  c.build();
  const [tx, tz] = c.posR(target, cf);
  const rx0 = X0 - 14, rz0 = Z0 - s * 10;
  c.path(REF, [[0, rx0 - 8, rz0], [fc, rx0, rz0 + s * 1], [cf - 4, tx - 2.6, tz - s * 0.8, 's'], [N - 1, tx - 2.6, tz - s * 0.8]]);
  c.face(REF, cf - 12, N - 1, { ent: target });
  c.pose(REF, cf, N - 1, POSE.CARD, 1);
  c.pose(target, cf + 8, N - 1, POSE.LOCO, ARM.PROTEST);
  c.face(target, cf - 8, N - 1, { ent: REF });
  c.build();

  c.ballCarry(A, 0, fc - 3, 0.6);
  const [fx, fz] = c.fwd(A, fc);
  c.ballLoose(fc - 2, N - 1, c.ballAt(fc - 3), fx * 4, fz * 4, 0.3);

  const sc = pack(ctx, c, {
    type: 'KIMLIK', subtype: target === O ? 'dogruKisi' : 'yanlisKisi', keyFrame: fc, focus: O, keep: [A, O, B, REF],
    refDecision: 'CONFIRM', cardTarget: target, cardColor: 'yellow',
    candidates: [O, B, T3].filter((x) => x !== null),
    meta: { attacker: A, offender: O, teammate: B, cardFrame: cf },
    line: null, bestCam: 5,
  });
  sc.events.push({ f: fc + 6, type: 'whistle' }, { f: cf, type: 'card', color: 'yellow', target });
  return sc;
}

export function judge(S, sc) {
  const { attacker: A } = sc.meta;
  const fc = sc.keyFrame;
  let best = null;
  for (const id of sc.candidates) {
    const r = contactScan(S, fc - 7, fc + 3, id, LEG_PARTS, A, LEG_PARTS);
    if (!best || r.minD < best.r.minD) best = { id, r };
  }
  const offender = best.id;
  const ok = offender === sc.cardTarget;
  const outcome = ok ? 'CONFIRM' : 'SW:' + offender;
  return {
    outcome, accept: { [outcome]: 1 }, gray: false, factual: true,
    keyFrame: best.r.first >= 0 ? best.r.first : fc,
    facts: { offender, cardTarget: sc.cardTarget, contactFrame: best.r.first },
  };
}
