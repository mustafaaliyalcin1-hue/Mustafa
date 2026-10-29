// Senaryo jeneratörleri için ortak yardımcılar.

import { Choreo } from '../choreo.js';
import { PITCH, BALL_R, REF, AR1, AR2 } from '../constants.js';
import { choreoSource, teamOfId } from '../../var/truth.js';

export function idOf(team, idx) { return team * 11 + idx; }

/** Tercih sırasına göre aktif (oyundan atılmamış ve kullanılmamış) bir oyuncu seç. */
export function pick(sim, team, prefs, used) {
  for (const i of prefs) {
    const id = idOf(team, i);
    if (sim.ents[id].active && !used.has(id)) { used.add(id); return id; }
  }
  for (let i = 1; i < 11; i++) {
    const id = idOf(team, i);
    if (sim.ents[id].active && !used.has(id)) { used.add(id); return id; }
  }
  return null;
}

export function newChoreo(ctx, n) {
  return new Choreo({ dir: ctx.dir, n, rng: ctx.rng });
}

export function src(c) { return choreoSource(c, teamOfId); }

/** Saha hakeminin hatalı karar verip vermeyeceği. */
export function refWrong(ctx, extra = 0) {
  return ctx.rng.chance(Math.min(0.9, ctx.diff.refError + extra));
}

/** Hücum edilen kaleyi gören yan hakem. */
export function arFor(dir) { return dir > 0 ? AR1 : AR2; }

/** Senaryo nesnesini paketle. */
export function pack(ctx, c, extra) {
  return {
    n: c.n,
    tracks: c.tracks,
    bx: c.bx, by: c.by, bz: c.bz,
    overlays: c.overlays,
    dir: ctx.dir,
    attackTeam: ctx.attackTeam,
    defTeam: ctx.defTeam,
    events: [],
    keep: [],
    keepR: 4,
    appFrame: 0,
    ...extra,
  };
}

/** Kale ağına giden topun son kısmı. */
export function ballIntoNet(c, f0, A, gz, gy, rng) {
  const G = c.WB(52.9, gy, gz);
  const n = c.n;
  const fg = f0 + Math.max(8, Math.round(Math.hypot(G[0] - A[0], G[2] - A[2]) / 25 * 30));
  c.ballAir(f0, fg, A, G, 0.25);
  const back = c.WB(54.2, Math.max(BALL_R, gy * 0.4), gz * 0.95);
  c.ballLine(fg, fg + 10, G, back, 'out');
  c.ballLine(fg + 10, fg + 20, back, c.WB(54.0, BALL_R, gz * 0.95), 'out');
  c.ballHold(fg + 20, n - 1, c.WB(54.0, BALL_R, gz * 0.95));
  return fg;
}

/** Kalecinin gol yemesi: yanlış yöne ya da geç uçuş. */
export function keeperBeaten(c, gk, fs, gz, rng, extraPts = []) {
  const side = rng.chance(0.6) ? -Math.sign(gz) : Math.sign(gz);
  c.path(gk, [[0, 50.6, 0], [fs - 12, 50.4, gz * 0.12], ...extraPts, [fs + 3, 50.4, gz * 0.12], [fs + 22, 50.6, gz * 0.12 + side * 1.6, 's']]);
  c.face(gk, 0, c.n - 1, { h: Math.PI, snap: false });
  // Kaleci -X'e bakıyor: gövdesinin sağı göreli -Z yönüdür.
  const local = -side;
  c.pose(gk, fs + 3, fs + 30, 8, local, 0, 0);
  c.pose(gk, fs + 31, c.n - 1, 5, local * Math.PI / 2, 0, 0);
}

/** Kaleci kurtarışı/topu yakalaması gibi basit bir bekleyiş (gol olmayan durumlar). */
export function keeperIdle(c, gk, n) {
  c.path(gk, [[0, 50.5, 0], [n - 1, 50.2, 0]]);
  c.face(gk, 0, n - 1, { h: Math.PI });
}

export { PITCH, BALL_R, REF, AR1, AR2 };
