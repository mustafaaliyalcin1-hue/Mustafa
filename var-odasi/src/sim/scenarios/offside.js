// OFSAYT ŞÜPHELİ GOL
// Ara pası, savunma çizgisinin hizasında koşu, gol. Gerçek cevap pas karesinde
// hücumcunun ve sondan ikinci savunmacının (kollar hariç) en ileri noktalarından ölçülür.

import { POSE, ARM } from '../constants.js';
import { pick, idOf, newChoreo, src, refWrong, arFor, pack, ballIntoNet, keeperBeaten } from './common.js';
import { offsideAt } from '../../var/truth.js';
import { PARTS } from '../skeleton.js';

export function generate(ctx) {
  const { sim, rng, diff } = ctx;
  const AT = ctx.attackTeam, DF = ctx.defTeam;
  const used = new Set();
  const N = 300;
  const c = newChoreo(ctx, N);
  const kf = rng.int(95, 120);
  const lineX = rng.range(21, 32);
  const side = rng.sign();

  const P = pick(sim, AT, [6, 7, 5, 8], used);
  const A = pick(sim, AT, [9, 10], used);
  const A2 = pick(sim, AT, [10, 9, 8, 5], used);
  const GK = idOf(DF, 0);
  const defs = [];
  for (const i of [1, 2, 3, 4]) { const id = pick(sim, DF, [i], used); if (id !== null) defs.push(id); }

  // hedef fark (m): pozitif = ofsayt
  const lv = diff.level;
  const mag = lv === 0 ? rng.range(0.15, 0.45) : lv === 1 ? rng.range(0.05, 0.25) : rng.range(0.012, 0.12);
  const target = (rng.chance(0.5) ? 1 : -1) * mag;

  const zA = side * rng.range(1.5, 8);
  // savunmacıların enine konumları (hücum yönüne göre göreli)
  const baseZ = [-19, -6.5, 6.5, 19].map((z) => z + rng.range(-2, 2));
  let lineIdx = 0, bd = Infinity;
  baseZ.forEach((z, i) => { if (Math.abs(z - zA) < bd) { bd = Math.abs(z - zA); lineIdx = i; } });
  const close = lv === 2 && rng.chance(0.6);
  const defX = baseZ.map((_, i) => (i === lineIdx ? lineX : lineX - (close && Math.abs(i - lineIdx) === 1 ? rng.range(0.28, 0.55) : rng.range(0.8, 2.6))));
  const L = defs[Math.min(lineIdx, defs.length - 1)];

  // alıcı ve şut noktaları
  const fr = kf + rng.int(48, 58);
  const R = [lineX + rng.range(10, 13), zA * 0.55];
  const shootX = Math.min(47, Math.max(42.5, lineX + 16));
  const fs = fr + Math.round(((shootX - R[0]) / 6) * 30) + 8;
  const zS = R[1] * 0.6;

  // pasör
  const zP = -side * rng.range(3, 12);
  c.path(P, [[0, lineX - 24, zP - side * 2], [kf, lineX - 15, zP], [kf + 30, lineX - 13, zP, 's'], [N - 1, lineX - 10, zP * 0.8]]);
  c.face(P, kf - 22, kf + 6, { X: R[0], Z: R[1] });
  c.pose(P, kf - 9, kf + 6, POSE.KICK);

  // hücumcu (sonradan hedef farka göre kaydırılacak)
  const armTrap = rng.chance(lv === 0 ? 0.15 : 0.35);
  c.path(A, [
    [0, lineX - 6, zA + side * 3], [kf - 34, lineX - 2.8, zA + side * 1.5], [kf - 12, lineX - 1.2, zA + side * 0.4],
    [kf, lineX, zA], [kf + 15, lineX + 3.2, zA - side * 0.3], [fr, R[0], R[1]], [fs, shootX, zS],
    [fs + 18, shootX + 2.5, zS], [N - 1, shootX + 1, zS + side * 7, 's'],
  ]);
  if (armTrap) c.pose(A, kf - 14, kf + 4, POSE.LOCO, ARM.POINT_R);
  c.pose(A, fs - 9, fs + 6, POSE.KICK);
  c.pose(A, fs + 30, N - 1, POSE.CELEB);

  // ikinci forvet (oyalayıcı koşu)
  if (A2 !== null) {
    const z2 = -zA * 0.6 - side * 6;
    c.path(A2, [[0, lineX - 9, z2], [kf, lineX - 4.5, z2 * 0.9], [fr, lineX + 4, z2 * 0.6], [N - 1, shootX - 4, z2 * 0.3]]);
  }

  // savunma çizgisi: pas anına kadar öne çıkar, sonra geri döner
  defs.forEach((id, i) => {
    const z = baseZ[i], x = defX[i];
    if (id === L) {
      c.path(id, [[0, x + 2.6, z], [kf - 20, x + 0.7, z], [kf, x, z], [kf + 14, x + 1.6, z + (zA - z) * 0.2], [fr, R[0] - 2.8, R[1] + side * 1.4], [fs, shootX - 2.2, zS + side * 1.2], [N - 1, shootX - 1, zS + side * 3, 's']]);
    } else {
      c.path(id, [[0, x + 2.4, z], [kf, x, z], [kf + 18, x + 2.5, z * 0.92], [fr, x + 10, z * 0.75], [N - 1, x + 14, z * 0.6, 's']]);
    }
    c.face(id, 0, kf + 3, { ent: P });
  });

  keeperBeaten(c, GK, fs, side * rng.range(1.4, 2.9), rng);
  c.build();

  // hücumcuyu hedef farka getir (gerçek ölçümle, iki tur)
  const S = src(c);
  for (let it = 0; it < 3; it++) {
    const m = offsideAt(S, kf, A, DF, ctx.dir);
    const d = target - m.margin;
    if (Math.abs(d) < 0.0005) break;
    c.shift(A, d, 0);
    c.build();
  }

  // top
  c.ballCarry(P, 0, kf - 10, 0.55);
  const contact = c.footBall(P, kf);
  c.ballLine(kf - 9, kf, c.ballAt(kf - 10), contact);
  const [rx, rz] = c.pos(A, fr), [fx, fz] = c.fwd(A, fr);
  const recv = [rx + fx * 0.55, 0.11, rz + fz * 0.55];
  const lofted = rng.chance(0.3);
  if (lofted) c.ballAir(kf, fr, contact, recv, rng.range(2, 4.5));
  else c.ballLine(kf, fr, contact, recv, 'out');
  c.ballCarry(A, fr + 1, fs - 10, 0.6);
  const shot = c.footBall(A, fs);
  c.ballLine(fs - 9, fs, c.ballAt(fs - 10), shot);
  const gz = side * rng.range(1.3, 3.0), gy = rng.range(0.3, 1.9);
  const fg = ballIntoNet(c, fs, shot, gz, gy, rng);

  const truth = offsideAt(S, kf, A, DF, ctx.dir);
  const wrong = refWrong(ctx, lv === 2 ? 0.1 : 0);
  const refOff = wrong ? !truth.offside : truth.offside;
  const sc = pack(ctx, c, {
    type: 'OFSAYT',
    subtype: armTrap ? 'kolOnde' : close ? 'yakinSavunmaci' : 'standart',
    keyFrame: kf,
    goalFrame: fg,
    focus: A,
    keep: [A, P, L],
    refDecision: refOff ? 'OFFSIDE' : 'GOAL',
    meta: { passer: P, receiver: A, lineDefender: L, targetMargin: target, lofted },
    line: 'offside',
    bestCam: 4,
  });
  sc.events.push({ f: kf, type: 'kick' }, { f: fs, type: 'kick' }, { f: fg, type: 'goal', team: AT, scorer: A });
  if (refOff) {
    sc.overlays.push({ id: arFor(ctx.dir), f0: fg + 8, f1: N - 1, pose: POSE.FLAG, p1: 0, p2: 0, p3: 0 });
    sc.events.push({ f: fg + 10, type: 'flag' });
  }
  sc.constrain = (e, wx, wz) => {
    if (e.team === DF && e.idx !== 0) {
      const X = ctx.dir * wx;
      if (X > lineX - 3.5) wx = ctx.dir * (lineX - 3.5);
    }
    return [wx, wz];
  };
  return sc;
}

export function judge(S, sc, ctx) {
  const kf = sc.keyFrame;
  const t = offsideAt(S, kf, sc.meta.receiver, sc.defTeam, sc.dir);
  const offside = t.offside;
  return {
    outcome: offside ? 'OFFSIDE' : 'GOAL',
    accept: { [offside ? 'OFFSIDE' : 'GOAL']: 1 },
    gray: false,
    factual: true,
    keyFrame: kf,
    facts: {
      marginM: t.margin,
      attPart: PARTS[t.attPart].name,
      attAllPart: PARTS[t.attAllPart].name,
      armAhead: t.attAllExt > t.attExt + 0.005,
      secondId: t.second.id,
      secondPart: PARTS[t.second.part].name,
      attExt: t.attExt,
      defExt: t.second.ext,
    },
  };
}
