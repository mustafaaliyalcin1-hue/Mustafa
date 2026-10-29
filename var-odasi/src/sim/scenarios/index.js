// Senaryo kayıt defteri ve üretici.
import * as offside from './offside.js';
import * as penalty from './penalty.js';
import * as handball from './handball.js';
import * as redcard from './redcard.js';
import * as foulGoal from './foulBeforeGoal.js';
import * as identity from './identity.js';
import * as ballOut from './ballOut.js';
import { src } from './common.js';

export const SCENARIOS = {
  OFSAYT: offside,
  PENALTI: penalty,
  ELLE: handball,
  KIRMIZI: redcard,
  FAUL_GOL: foulGoal,
  KIMLIK: identity,
  TOP_DISARI: ballOut,
};
export const TYPE_KEYS = Object.keys(SCENARIOS);

/**
 * Bir kritik pozisyon üret.
 * ctx: { sim, rng, diff, attackTeam }
 */
export function generateScenario(type, ctx) {
  const mod = SCENARIOS[type];
  const full = { ...ctx, defTeam: 1 - ctx.attackTeam, dir: ctx.sim.dir(ctx.attackTeam) };
  const sc = mod.generate(full);
  sc.type = type;
  sc.ctx = { diff: ctx.diff };
  // Jeneratörün kendi koreografisi üzerinden ön hüküm (test ve tutarlılık için)
  return sc;
}

export function judgeScenario(S, sc) {
  return SCENARIOS[sc.type].judge(S, sc);
}

export { src as choreoSrc };
