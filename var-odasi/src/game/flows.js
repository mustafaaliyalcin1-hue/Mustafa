// Mod akışları: oturum oluşturup doğru ekranları bağlar.
import { MatchSession } from './session.js';
import { DIFFICULTIES, withDerby } from '../data/difficulty.js';
import { LEAGUES, DERBIES, STADIUMS } from '../data/teams.js';
import { RNG, hashString } from '../core/rng.js';
import { todayKey } from '../core/util.js';
import { TYPE_KEYS } from '../sim/scenarios/index.js';

export async function startMatch(app, cfg, ctx) {
  const { MatchScreen } = await import('../ui/screens/match.js');
  const session = new MatchSession(cfg);
  app.world.setTeams({ kits: session.kits, squads: session.squads });
  app.show(new MatchScreen(app, session, ctx));
}

export function quickConfig(app, opts) {
  const r = new RNG(opts.seed || ((Date.now() * 2654435761) >>> 0));
  const pool = opts.derby ? null : LEAGUES.find((l) => l.id === (opts.league || 'super')).teams;
  let home, away, competition;
  if (opts.derby) {
    const d = r.pick(DERBIES);
    [home, away] = r.chance(0.5) ? [d.a, d.b] : [d.b, d.a];
    competition = `Hızlı Maç — ${d.name}`;
  } else {
    const i = r.int(0, pool.length - 1);
    let j = r.int(0, pool.length - 2); if (j >= i) j++;
    home = pool[i]; away = pool[j];
    competition = 'Hızlı Maç — ' + LEAGUES.find((l) => l.id === (opts.league || 'super')).name;
  }
  let diff = DIFFICULTIES[opts.diff || 'orta'];
  if (opts.derby) diff = withDerby(diff);
  return {
    mode: 'quick', home, away, diff, numIncidents: opts.n || 5, types: opts.types || TYPE_KEYS,
    seed: r.int(1, 2e9), matchSeconds: (app.settings.matchMinutes || 7) * 60, competition,
    stadium: r.pick(STADIUMS.super), derby: !!opts.derby,
  };
}

export function dailyConfig(app, date = todayKey()) {
  const seed = hashString('gunluk:' + date);
  const r = new RNG(seed);
  const pool = LEAGUES.find((l) => l.id === 'super').teams;
  const i = r.int(0, pool.length - 1);
  let j = r.int(0, pool.length - 2); if (j >= i) j++;
  return {
    mode: 'daily', home: pool[i], away: pool[j], diff: DIFFICULTIES.orta, numIncidents: 5, types: TYPE_KEYS,
    seed, matchSeconds: 300, competition: `Günlük Zorluk — ${date}`, stadium: r.pick(STADIUMS.super), dateKey: date,
  };
}

export function trainingConfig(type, diffKey, seed) {
  const r = new RNG(seed || ((Date.now() * 2654435761) >>> 0));
  const pool = LEAGUES.find((l) => l.id === 'super').teams;
  const i = r.int(0, pool.length - 1);
  let j = r.int(0, pool.length - 2); if (j >= i) j++;
  return {
    mode: 'training', home: pool[i], away: pool[j], diff: DIFFICULTIES[diffKey || 'orta'], numIncidents: 1,
    types: [type], seed: r.int(1, 2e9), matchSeconds: 420, competition: 'Pozisyon Antrenmanı', noTimer: true,
  };
}
