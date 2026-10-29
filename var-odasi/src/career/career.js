// Kariyer modu: Bölgesel Amatör Lig'den Turnuva Finali'ne.
import { LEAGUES, DERBIES, FINAL_TEAMS, STADIUMS } from '../data/teams.js';
import { RNG, hashString } from '../core/rng.js';
import { MHK_EVENTS } from '../data/texts.js';

export const TIERS = [
  { key: 'amator', name: 'Bölgesel Amatör Lig', matches: 3, minNote: 6.0, minRep: 0, diff: 'kolay', inc: [4, 4], icon: '🌱' },
  { key: 'lig3', name: '3. Lig', matches: 3, minNote: 6.3, minRep: 35, diff: 'kolay', inc: [4, 5], icon: '🥉' },
  { key: 'lig2', name: '2. Lig', matches: 3, minNote: 6.6, minRep: 45, diff: 'orta', inc: [5, 5], icon: '🥈' },
  { key: 'lig1', name: '1. Lig', matches: 4, minNote: 6.9, minRep: 50, diff: 'orta', inc: [5, 6], icon: '🥇' },
  { key: 'super', name: 'Süper Lig', matches: 4, minNote: 7.2, minRep: 55, diff: 'zor', inc: [6, 6], icon: '⭐' },
  { key: 'derbi', name: 'Derbi Maçları', matches: 3, minNote: 7.4, minRep: 60, diff: 'zor', inc: [6, 7], derby: true, icon: '🔥' },
  { key: 'avrupa', name: 'Avrupa Kupası', matches: 3, minNote: 7.6, minRep: 65, diff: 'zor', inc: [7, 7], icon: '🌍' },
  { key: 'final', name: 'Turnuva Finali', matches: 1, minNote: 0, minRep: 0, diff: 'zor', inc: [7, 7], derby: true, icon: '🏆' },
];

export function newCareer(name) {
  return {
    name: name || 'VAR Hakemi',
    tier: 0, week: 1, tierNotes: [], rep: 50, suspended: 0, lowStreak: 0,
    history: [], news: [{ week: 1, text: 'MHK seni Bölgesel Amatör Lig VAR hakemi olarak görevlendirdi. Başarılar!' }],
    finished: false, trophy: false, started: Date.now(),
  };
}

export function fixture(c) {
  const tier = TIERS[c.tier];
  const r = new RNG(hashString(`${c.name}:${c.started}:${c.week}`));
  let home, away, competition = tier.name, derbyName = null;
  if (tier.key === 'derbi') {
    const d = r.pick(DERBIES);
    [home, away] = r.chance(0.5) ? [d.a, d.b] : [d.b, d.a];
    derbyName = d.name;
    competition = `Süper Lig — ${d.name}`;
  } else if (tier.key === 'avrupa') {
    const eu = LEAGUES.find((l) => l.id === 'avrupa').teams;
    const tr = LEAGUES.find((l) => l.id === 'super').teams;
    const a = r.pick(tr), b = { ...r.pick(eu), foreign: true };
    [home, away] = r.chance(0.5) ? [a, b] : [b, a];
  } else if (tier.key === 'final') {
    home = FINAL_TEAMS[0]; away = { ...FINAL_TEAMS[1], foreign: true };
  } else {
    const teams = LEAGUES.find((l) => l.id === tier.key).teams;
    const i = r.int(0, teams.length - 1);
    let j = r.int(0, teams.length - 2); if (j >= i) j++;
    home = teams[i]; away = teams[j];
  }
  const stadium = r.pick(STADIUMS[tier.key] || STADIUMS.super);
  const numIncidents = r.int(tier.inc[0], tier.inc[1]);
  return { home, away, competition, stadium, derby: !!tier.derby, derbyName, numIncidents, seed: r.int(1, 2e9), tier: tier.key };
}

function avg(a) { return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0; }

/** Maç sonucu kariyere işlenir; haber listesini döndürür. */
export function applyResult(c, grade, fx) {
  const r = new RNG(hashString(`${c.name}:${c.week}:res`));
  const tier = TIERS[c.tier];
  const news = [];
  const mult = tier.derby ? 1.4 : tier.key === 'avrupa' || tier.key === 'final' ? 1.3 : 1;
  let d = (grade.note - 6.5) * 4 - grade.missed * 4 - grade.wrong * 2;
  d = Math.round(d * mult);
  const repBefore = c.rep;
  c.rep = Math.max(0, Math.min(100, c.rep + d));
  c.tierNotes.push(grade.note);
  c.history.push({ week: c.week, tier: tier.key, home: fx.home.name, away: fx.away.name, note: grade.note, rep: c.rep });
  if (c.history.length > 60) c.history.shift();
  const N = (k) => r.pick(MHK_EVENTS[k]);

  if (tier.key === 'final') {
    c.finished = true;
    c.trophy = grade.note >= 7;
    news.push(c.trophy ? '🏆 Turnuva finalini kusursuz yönettin! Kariyerinin zirvesindesin.' : 'Finali yönettin. Kariyer tamamlandı — ama not daha iyi olabilirdi.');
  } else {
    if (grade.note < 5) { c.suspended = 1; news.push(N('suspend')); }
    else if (grade.note >= 8.5) news.push(N('praise'));
    else if (grade.note < 6) news.push(N('warn'));
    c.lowStreak = grade.note < 5.5 ? c.lowStreak + 1 : 0;
    if (c.lowStreak >= 2 && c.tier > 0) {
      c.tier--; c.tierNotes = []; c.lowStreak = 0;
      news.push(N('demote').replace('{lig}', TIERS[c.tier].name));
    } else {
      const last = c.tierNotes.slice(-tier.matches);
      if (c.tierNotes.length >= tier.matches && avg(last) >= tier.minNote && c.rep >= tier.minRep) {
        c.tier++; c.tierNotes = [];
        news.push(N('promote').replace('{lig}', TIERS[c.tier].name));
        c.promoted = true;
      }
    }
  }
  c.week++;
  for (const t of news) c.news.unshift({ week: c.week - 1, text: t });
  c.news = c.news.slice(0, 20);
  return { news, repDelta: c.rep - repBefore };
}

export function skipSuspendedWeek(c) {
  c.suspended = 0;
  c.news.unshift({ week: c.week, text: 'Görevsiz hafta tamamlandı. MHK seni yeniden görevlendirdi.' });
  c.week++;
}

export function tierProgress(c) {
  const t = TIERS[c.tier];
  const last = c.tierNotes.slice(-t.matches);
  return { tier: t, played: c.tierNotes.length, avg: avg(last), need: t.minNote, needRep: t.minRep, matches: t.matches };
}
