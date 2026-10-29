// GOL ÖNCESİ FAUL (Atak Başlangıç Anı / APP içinde)
// Uzun top, hücumcu ile savunmacı topa koşarken hücumcu savunmacıyı itebilir.
// Ardından gol gelir. VAR, atağın başladığı ana kadar geriye bakmalıdır.

import { POSE, ARM } from '../constants.js';
import { pick, idOf, newChoreo, src, pack, ballIntoNet, keeperBeaten } from './common.js';
import { contactScan } from '../../var/truth.js';
import { P } from '../skeleton.js';

const W = [{ w: 3.2, v: 'itme' }, { w: 2.6, v: 'omuz' }, { w: 1.6, v: 'hafif' }];
const HANDS = [P.HANDL, P.HANDR, P.FARML, P.FARMR];
const BACK = [P.TORSO, P.PELVIS];

export function generate(ctx, forced) {
  const { sim, rng, diff } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const subtype = forced || rng.weighted(diff.gray > 0.25 ? [...W, { w: 1.4, v: 'hafif' }] : W);
  const N = 290;
  const side = rng.sign();
  const A3 = pick(sim, AT, [6, 7, 2, 3], used);
  const A1 = pick(sim, AT, [9, 10], used);
  const D = pick(sim, DF, [2, 3], used);
  const D2 = pick(sim, DF, [1, 4, 3], used);
  const GK = idOf(DF, 0);

  const Xd = rng.range(31, 37), Zd = side * rng.range(0, 9);
  const kf = 14;
  const fd = rng.int(70, 80); // topun düştüğü an
  const fp = fd - rng.int(4, 9); // temas anı
  const fcol = fd + 9;
  const shootX = rng.range(43, 46.5), zS = Zd * 0.4;
  const fs = fcol + Math.round(((shootX - (Xd + 2.5)) / 6.2) * 30) + 10;

  const c = newChoreo(ctx, N);
  // uzun topu atan
  c.path(A3, [[0, Xd - 30, Zd - side * 8], [kf, Xd - 28.5, Zd - side * 7.5], [kf + 30, Xd - 26, Zd - side * 7, 's'], [N - 1, Xd - 18, Zd - side * 5]]);
  c.face(A3, 0, kf + 6, { X: Xd, Z: Zd });
  c.pose(A3, kf - 9, kf + 6, POSE.KICK);

  // savunmacı: kendi kalesine doğru koşuyor
  const dPts = [[0, Xd - 13, Zd + side * 1.2], [fp - 30, Xd - 7.2, Zd + side * 0.5], [fp, Xd - 2.6, Zd]];
  if (subtype === 'itme') {
    dPts.push([fp + 14, Xd - 0.6, Zd - side * 0.2], [fp + 30, Xd + 0.2, Zd - side * 0.3, 's']);
    c.pose(D, fp + 2, fp + 18, POSE.FALL, rng.range(-0.25, 0.25));
    c.pose(D, fp + 19, N - 1, POSE.DOWN, 0);
  } else if (subtype === 'hafif') {
    dPts.push([fp + 18, Xd - 0.4, Zd - side * 0.4], [fs, shootX - 6, zS + side * 2.5], [N - 1, shootX - 4, zS + side * 2.5]);
    c.pose(D, fp + 30, N - 1, POSE.LOCO, ARM.PROTEST);
  } else {
    dPts.push([fp + 16, Xd + 0.4, Zd + side * 0.35], [fs, shootX - 3.5, zS + side * 2], [N - 1, shootX - 2.5, zS + side * 2.2]);
  }
  c.path(D, dPts);
  c.path(A1, [[0, Xd - 15, Zd], [N - 1, Xd, Zd]]);
  if (D2 !== null) c.path(D2, [[0, Xd - 12, Zd - side * 10], [fp, Xd - 4, Zd - side * 9], [fs, shootX - 4, zS - side * 6], [N - 1, shootX - 3, zS - side * 5]]);
  keeperBeaten(c, GK, fs, side * rng.range(1.3, 2.9), rng);
  c.build();

  // hücumcu: savunmacının arkasında (itme) ya da yanında (omuz omuza)
  const [dx, dz] = c.posR(D, fp);
  const [fx, fz] = c.R(...c.fwd(D, fp));
  let gap = subtype === 'omuz' ? 0.5 : 0.74;
  const desired = subtype === 'itme' ? -0.03 : subtype === 'hafif' ? -0.01 : -0.025;
  const setA = () => {
    let ax, az;
    if (subtype === 'omuz') { ax = dx - fx * 0.12 + -fz * side * gap; az = dz - fz * 0.12 + fx * side * gap; }
    else { ax = dx - fx * gap; az = dz - fz * gap; }
    const bp = [Xd + 2.5, Zd * 0.8];
    c.path(A1, [
      [0, ax - 9.5, az - side * 1.2], [fp - 30, ax - 4.6, az - side * 0.5], [fp, ax, az],
      [fcol, bp[0], bp[1]], [fs, shootX, zS], [fs + 18, shootX + 2.5, zS], [N - 1, shootX + 1, zS - side * 6, 's'],
    ]);
    const sp = c.specs.get(A1); sp.poses = [];
    if (subtype !== 'omuz') c.pose(A1, fp - 12, fp + 10, POSE.PUSH);
    c.pose(A1, fs - 9, fs + 6, POSE.KICK);
    c.pose(A1, fs + 30, N - 1, POSE.CELEB);
    c.build();
  };
  setA();
  const S = src(c);
  const scan = () => (subtype === 'omuz'
    ? contactScan(S, fp - 4, fp + 3, A1, [P.TORSO], D, [P.TORSO])
    : contactScan(S, fp - 4, fp + 3, A1, HANDS, D, BACK));
  for (let it = 0; it < 5; it++) {
    const r = scan();
    const err = r.minD - desired;
    if (Math.abs(err) < 0.003) break;
    gap -= err;
    setA();
  }

  // top
  c.ballHold(0, kf - 10, c.footBall(A3, kf));
  const k = c.footBall(A3, kf);
  c.ballLine(kf - 9, kf, k, k);
  const Pd = c.WB(Xd + 0.8, 0.11, Zd * 0.9);
  c.ballAir(kf, fd, k, Pd, rng.range(7, 10));
  // sektikten sonra hücumcunun önüne
  const [cx, cz] = c.pos(A1, fcol), [cfx, cfz] = c.fwd(A1, fcol);
  const col = [cx + cfx * 0.6, 0.11, cz + cfz * 0.6];
  c.ballAir(fd, fcol, Pd, col, 0.5);
  c.ballCarry(A1, fcol + 1, fs - 10, 0.6);
  const shot = c.footBall(A1, fs);
  c.ballLine(fs - 9, fs, c.ballAt(fs - 10), shot);
  const gz = side * rng.range(1.2, 3), gy = rng.range(0.3, 1.8);
  const fg = ballIntoNet(c, fs, shot, gz, gy, rng);

  const sc = pack(ctx, c, {
    type: 'FAUL_GOL', subtype, keyFrame: fp, focus: A1, keep: [A1, D],
    refDecision: 'GOAL', appFrame: rng.int(4, 9), goalFrame: fg,
    meta: { attacker: A1, defender: D, push: subtype !== 'omuz' },
    line: null, bestCam: 2,
  });
  sc.events.push({ f: kf, type: 'kick' }, { f: fs, type: 'kick' }, { f: fg, type: 'goal', team: AT, scorer: A1 });
  return sc;
}

export function judge(S, sc) {
  const { attacker: A1, defender: D } = sc.meta;
  const fp = sc.keyFrame;
  const hands = contactScan(S, fp - 4, fp + 3, A1, HANDS, D, BACK);
  const body = contactScan(S, fp - 4, fp + 3, A1, [P.TORSO], D, [P.TORSO]);
  let fell = false;
  for (let f = fp; f <= fp + 12; f++) { const e = S.ent(f, D); if (e && e.pose === POSE.FALL) { fell = true; break; } }
  // itme: kollar öne uzanmış (itme hareketi) ve eller rakibin sırtına değiyor
  let pushing = false;
  if (hands.contact) { const a = S.ent(hands.first, A1); pushing = a && a.pose === POSE.PUSH; }
  let outcome, accept, gray = false;
  if (pushing && fell) { outcome = 'NOGOAL_FOUL'; accept = { NOGOAL_FOUL: 1 }; }
  else if (pushing) { gray = true; outcome = 'NOGOAL_FOUL'; accept = { NOGOAL_FOUL: 1, GOAL: 1 }; }
  else { outcome = 'GOAL'; accept = { GOAL: 1 }; }
  return {
    outcome, accept, gray, factual: false,
    keyFrame: pushing ? hands.first : body.contact ? body.first : fp,
    facts: {
      handsContact: pushing, bodyContact: body.contact, fell,
      contactFrame: pushing ? hands.first : body.contact ? body.first : -1,
      framesBeforeGoal: (sc.goalFrame || 0) - fp,
    },
  };
}
