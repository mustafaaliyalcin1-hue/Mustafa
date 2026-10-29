// TOP OYUN DIŞINA ÇIKTI MI? (gol öncesi)
// Kanat oyuncusu topu kale çizgisine kadar götürür, geri çeker ve ortalar; gol olur.
// Kural: Top, kale çizgisini yerde ya da havada TAMAMEN geçtiğinde oyun dışıdır.
// Gerçek cevap: kayıttaki top merkezinin çizginin dış kenarını (top yarıçapı dahil) aşma miktarı.

import { POSE, BALL_R, PITCH } from '../constants.js';
import { pick, idOf, newChoreo, src, refWrong, arFor, pack, ballIntoNet, keeperBeaten } from './common.js';
import { ballOutMargin } from '../../var/truth.js';

export function generate(ctx) {
  const { sim, rng, diff } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const N = 270;
  const s = rng.sign();
  const lv = diff.level;
  const Wg = pick(sim, AT, [s > 0 ? 5 : 8, 5, 8], used);
  const St = pick(sim, AT, [9, 10], used);
  const D = pick(sim, DF, [s > 0 ? 4 : 1, 1, 4], used);
  const D2 = pick(sim, DF, [2, 3], used);
  const GK = idOf(DF, 0);
  const mag = lv === 0 ? rng.range(0.08, 0.25) : lv === 1 ? rng.range(0.03, 0.12) : rng.range(0.008, 0.05);
  const o = (rng.chance(0.5) ? 1 : -1) * mag;
  const peakX = PITCH.HL + BALL_R + o;
  const zb = s * rng.range(9, 17);
  const fp = rng.int(100, 116);
  const fc = fp + rng.int(20, 26);
  const fh = fc + rng.int(16, 22);
  const sX = rng.range(43.5, 46.5), sZ = s * rng.range(0.5, 3.5);

  const c = newChoreo(ctx, N);
  // kanat: çizgiye paralel sürüş
  const wfp = [peakX - 0.95, zb + s * 0.1];
  c.path(Wg, [[0, 33, s * 30], [fp - 50, 44, s * 26], [fp - 14, 50.2, zb + s * 4], [fp, wfp[0], wfp[1], 's'], [fp + 12, wfp[0] - 0.3, wfp[1] - s * 0.1, 's']]);
  c.path(D, [[0, 37, s * 27], [fp - 14, 48, zb + s * 6], [fp, 50.4, zb - s * 1.5], [N - 1, 49, zb - s * 2]]);
  if (D2 !== null) c.path(D2, [[0, 46, s * 3], [N - 1, 47.5, sZ + s * 1.5]]);
  c.path(St, [[0, 33, -s * 6], [fc, 40.5, sZ - s * 1.5], [fh, sX, sZ], [fh + 20, sX + 2.5, sZ], [N - 1, sX + 1.5, sZ - s * 6, 's']]);
  keeperBeaten(c, GK, fh, -s * rng.range(1.2, 2.8), rng);
  c.build();

  // geri çekip ortalama: ortacının vuruş anındaki konumu
  const peak = c.WB(peakX, BALL_R, zb);
  const dragTo = c.WB(peakX - 0.75, BALL_R, zb - s * 0.25);
  const [sxw, szw] = c.W(sX, sZ);
  const ang = Math.atan2(szw - dragTo[2], sxw - dragTo[0]);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const off = [0.53, 0.1]; // sağ ayak temasında topun gövdeye göre yeri (ileri, sağ)
  const rootW = [dragTo[0] - (ca * off[0] - sa * off[1]), dragTo[2] - (sa * off[0] + ca * off[1])];
  const rootR = c.R(rootW[0], rootW[1]);
  const sp = c.specs.get(Wg);
  sp.pts.push({ f: fc, X: rootR[0], Z: rootR[1], stop: true }, { f: N - 1, X: rootR[0] - 2, Z: rootR[1] - s * 1.5, stop: false });
  c.face(Wg, fp + 12, fc + 6, { X: sX, Z: sZ });
  c.face(Wg, fp - 10, fp + 8, { X: peakX, Z: zb });
  c.build();
  const [lf, lr] = c.toLocal(Wg, fp, peak[0], peak[2]);
  c.pose(Wg, fp - 9, fp + 7, POSE.LUNGE, lf - 0.02, lr, 0.17);
  c.pose(Wg, fc - 9, fc + 6, POSE.KICK);
  c.build();

  // top
  c.ballCarry(Wg, 0, fp - 15, 0.7);
  c.ballLine(fp - 14, fp, c.ballAt(fp - 15), peak, 'out2');
  c.ballLine(fp, fp + 10, peak, dragTo, 'out2');
  c.ballHold(fp + 10, fc - 10, dragTo);
  const cross = c.footBall(Wg, fc);
  c.ballLine(fc - 9, fc, dragTo, cross);
  c.pose(St, fh - 9, fh + 6, POSE.KICK);
  c.pose(St, fh + 30, N - 1, POSE.CELEB);
  c.build();
  const recv = c.footBall(St, fh);
  c.ballLine(fc, fh, cross, recv, 'lin');
  const gz = -s * rng.range(1.0, 2.8), gy = rng.range(0.3, 1.6);
  const fg = ballIntoNet(c, fh, recv, gz, gy, rng);

  const S = src(c);
  const m = ballOutMargin(S, 0, fc, ctx.dir);
  const isOut = m.margin > 0;
  const wrong = refWrong(ctx, lv === 2 ? 0.1 : 0);
  const refOut = wrong ? !isOut : isOut;
  const sc = pack(ctx, c, {
    type: 'TOP_DISARI', subtype: isOut ? 'disari' : 'iceride', keyFrame: m.frame, focus: Wg, keep: [Wg, St, D],
    refDecision: refOut ? 'NOGOAL_OUT' : 'GOAL', goalFrame: fg,
    meta: { winger: Wg, striker: St, crossFrame: fc, peakFrame: fp, targetMargin: o, zb },
    line: 'goal', bestCam: 4,
  });
  sc.events.push({ f: fc, type: 'kick' }, { f: fh, type: 'kick' }, { f: fg, type: 'goal', team: AT, scorer: St });
  if (refOut) {
    sc.overlays.push({ id: arFor(ctx.dir), f0: fg + 8, f1: N - 1, pose: POSE.FLAG, p1: 0 });
    sc.events.push({ f: fg + 10, type: 'flag' });
  }
  return sc;
}

export function judge(S, sc) {
  const m = ballOutMargin(S, 0, sc.meta.crossFrame, sc.dir);
  const out = m.margin > 0;
  const outcome = out ? 'NOGOAL_OUT' : 'GOAL';
  return {
    outcome, accept: { [outcome]: 1 }, gray: false, factual: true,
    keyFrame: m.frame,
    facts: { marginM: m.margin, frame: m.frame },
  };
}
