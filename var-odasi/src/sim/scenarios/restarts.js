// İnceleme gerektirmeyen kurgulu anlar: penaltı atışı.
import { POSE, PITCH } from '../constants.js';
import { pick, idOf, newChoreo, pack, ballIntoNet } from './common.js';

export function penaltyKick(ctx) {
  const { sim, rng } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const N = 150;
  const K = pick(sim, AT, [9, 10, 7, 6], used);
  const GK = idOf(DF, 0);
  const spot = PITCH.HL - PITCH.SPOT;
  const kf = 70;
  const goal = rng.chance(0.78);
  const side = rng.sign();
  const c = newChoreo(ctx, N);
  c.path(K, [[0, spot - 4.2, -1.6], [30, spot - 4.2, -1.6, 's'], [kf, spot - 0.55, -0.12], [kf + 14, spot + 0.6, 0, 's'], [N - 1, spot + 4, side * 3]]);
  c.face(K, 0, kf + 5, { X: PITCH.HL, Z: 0 });
  c.pose(K, kf - 9, kf + 6, POSE.KICK);
  if (goal) c.pose(K, kf + 30, N - 1, POSE.CELEB);
  const diveSide = goal ? (rng.chance(0.65) ? -side : side) : side;
  const local = -diveSide;
  c.path(GK, [[0, PITCH.HL - 0.3, 0], [kf, PITCH.HL - 0.4, 0], [kf + 18, PITCH.HL - 0.6, diveSide * 1.7, 's']]);
  c.face(GK, 0, N - 1, { h: Math.PI });
  c.pose(GK, kf - 1, kf + 25, POSE.DIVE, local);
  c.pose(GK, kf + 26, N - 1, POSE.DOWN, local * Math.PI / 2);
  c.build();
  const ballPt = c.footBall(K, kf);
  c.ballHold(0, kf, [c.W(spot, 0)[0], 0.11, c.W(spot, 0)[1]]);
  const gz = side * rng.range(goal ? 2.2 : 1.1, goal ? 3.2 : 1.9), gy = rng.range(0.3, goal ? 1.9 : 1.2);
  let fg = -1;
  if (goal) fg = ballIntoNet(c, kf, ballPt, gz, gy, rng);
  else {
    const save = c.WB(PITCH.HL - 0.6, gy, diveSide * 1.6);
    c.ballAir(kf, kf + 10, ballPt, save, 0.1);
    const away = c.WB(PITCH.HL - 6, 0.11, diveSide * 9);
    c.ballAir(kf + 10, kf + 35, save, away, 1.5);
    c.ballLoose(kf + 36, N - 1, away, -ctx.dir * 2, ctx.dir * diveSide * 1, 0);
  }
  const sc = pack(ctx, c, { type: 'PEN_KICK', keyFrame: kf, focus: K, keep: [K, GK], meta: { goal, kicker: K } });
  sc.events.push({ f: 20, type: 'whistle' }, { f: kf, type: 'kick' });
  if (goal) sc.events.push({ f: fg, type: 'goal', team: AT, scorer: K });
  else sc.events.push({ f: kf + 10, type: 'save' });
  sc.constrain = (e, wx, wz) => {
    if (e.idx === 0) return [wx, wz];
    // herkes ceza sahası ve yayın dışında
    const X = ctx.dir * wx;
    if (X > PITCH.HL - PITCH.BOX_D - 1.5) wx = ctx.dir * (PITCH.HL - PITCH.BOX_D - 1.5 - Math.abs(wz) * 0.02);
    return [wx, wz];
  };
  return sc;
}
