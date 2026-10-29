// Gerçek cevap tutarlılığı ve puanlama testleri: `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MatchSim } from '../src/sim/match.js';
import { makeSquad } from '../src/data/names.js';
import { RNG } from '../src/core/rng.js';
import { Recording } from '../src/replay/recording.js';
import { generateScenario, judgeScenario, TYPE_KEYS } from '../src/sim/scenarios/index.js';
import { recordingSource, choreoSource, teamOfId } from '../src/var/truth.js';
import { evaluateIncident, matchGrade } from '../src/var/protocol.js';
import { MatchSession } from '../src/game/session.js';
import { DIFFICULTIES } from '../src/data/difficulty.js';
import { LEAGUES } from '../src/data/teams.js';
import { computeSkeleton, makeSkel, bodyExtent } from '../src/sim/skeleton.js';
import { POSE } from '../src/sim/constants.js';

function runScenario(type, seed, level) {
  const r = new RNG(seed);
  const sim = new MatchSim({ seed, squads: [makeSquad(r), makeSquad(r)] });
  const rec = new Recording();
  for (let i = 0; i < 90; i++) { sim.step(); rec.push(sim); sim.events.length = 0; }
  const diff = { ...Object.values(DIFFICULTIES)[level] };
  const sc = generateScenario(type, { sim, rng: new RNG(seed * 97 + 3), diff, attackTeam: seed % 2 });
  const fromChoreo = judgeScenario(choreoSource({ n: sc.n, tracks: sc.tracks, state: (id, f) => sc.tracks.get(id).get(f, {}), ballAt: (f) => [sc.bx[f], sc.by[f], sc.bz[f]] }, teamOfId), sc);
  sim.startScript(sc);
  const start = rec.count;
  for (let f = 0; f < sc.n; f++) { sim.step(); rec.push(sim); }
  const fromRec = judgeScenario(recordingSource(rec, start, sc.n, teamOfId), sc);
  return { sc, fromChoreo, fromRec };
}

for (const type of TYPE_KEYS) {
  test(`${type}: kayıttan ölçülen gerçek cevap, jeneratörün ölçümüyle aynı`, () => {
    for (let seed = 1; seed <= 12; seed++) {
      const { fromChoreo, fromRec } = runScenario(type, seed, seed % 3);
      assert.equal(fromRec.outcome, fromChoreo.outcome, `seed ${seed}`);
      assert.deepEqual(Object.keys(fromRec.accept).sort(), Object.keys(fromChoreo.accept).sort());
      assert.equal(fromRec.gray, fromChoreo.gray);
    }
  });
}

test('OFSAYT: zorluk arttıkça fark küçülür ve kol sayılmaz', () => {
  for (let seed = 1; seed <= 9; seed++) {
    const { fromRec, sc } = runScenario('OFSAYT', seed, 2);
    assert.ok(Math.abs(fromRec.facts.marginM) <= 0.13, `zor seviyede fark küçük olmalı: ${fromRec.facts.marginM}`);
    assert.ok(Math.abs(fromRec.facts.marginM - sc.meta.targetMargin) < 0.002, 'hedef farka ulaşılmalı');
    assert.notEqual(fromRec.facts.attPart, 'Sağ el');
    assert.notEqual(fromRec.facts.attPart, 'Sol el');
  }
});

test('iskelet: kollar hariç uç nokta her zaman tüm vücudun ucundan küçük ya da eşit', () => {
  const sk = makeSkel();
  for (let ph = 0; ph < 6.3; ph += 0.3) {
    computeSkeleton({ x: 0, z: 0, h: 0, ph, sp: 7, pose: POSE.LOCO, pt: 0, p1: 1, p2: 0, p3: 0 }, sk);
    assert.ok(bodyExtent(sk, 1, 0, true).ext <= bodyExtent(sk, 1, 0, false).ext + 1e-9);
  }
});

test('PENALTI: dalışta temas yok, faulde temas var', () => {
  let dive = 0, foul = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const { sc, fromRec } = runScenario('PENALTI', seed, 1);
    if (sc.subtype === 'dive') { dive++; assert.equal(fromRec.facts.contact, false); assert.equal(fromRec.outcome, 'DIVE'); }
    if (sc.subtype.startsWith('foul')) { foul++; assert.equal(fromRec.facts.contact, true); }
  }
  assert.ok(dive > 0 && foul > 0);
});

test('protokol: gri alanda müdahale etmemek doğru, açık hatayı kaçırmak yanlış', () => {
  const base = { type: 'PENALTI', timeLimit: 90, bestCam: 5 };
  const gray = { ...base, refDecision: 'NOFOUL', truth: { outcome: 'PEN', accept: { PEN: 1, NOFOUL: 1 }, gray: true, facts: { contactFrame: 10 }, keyFrame: 10 } };
  assert.equal(evaluateIncident(gray, { action: 'CHECK', timeUsed: 10 }).verdict, 'gri_kontrol');
  assert.equal(evaluateIncident(gray, { action: 'OFR', outcome: 'PEN', timeUsed: 10 }).verdict, 'gereksiz_gri');
  const clear = { ...base, refDecision: 'PEN', truth: { outcome: 'DIVE', accept: { DIVE: 1, NOFOUL: 0.8 }, gray: false, facts: { contactFrame: -1 }, keyFrame: 10 } };
  assert.equal(evaluateIncident(clear, { action: 'CHECK', timeUsed: 10 }).verdict, 'kacirilan');
  const ok = evaluateIncident(clear, { action: 'OFR', outcome: 'DIVE', timeUsed: 10 });
  assert.equal(ok.verdict, 'dogru_mudahale');
  assert.ok(ok.acc === 100 && ok.time === 20);
  assert.equal(evaluateIncident(clear, { action: 'OFR', outcome: 'NOFOUL', timeUsed: 10 }).verdict, 'kismi');
  const g = matchGrade([ok, evaluateIncident(clear, { action: 'CHECK', timeUsed: 10 })]);
  assert.ok(g.note > 1 && g.note < 7);
});

test('oturum: tam maç baştan sona çalışır ve tüm pozisyonlar değerlendirilir', () => {
  const t = LEAGUES[4].teams;
  const s = new MatchSession({ mode: 'quick', home: t[0], away: t[1], diff: DIFFICULTIES.orta, numIncidents: 5, seed: 99, matchSeconds: 300, competition: 'test' });
  s.start();
  for (let i = 0; i < 30 * 60 * 10 && s.state !== 'ended'; i++) {
    s.update(1 / 30, 4);
    for (const ev of s.out) if (ev.type === 'halftime') s.continueSecondHalf();
    s.out.length = 0;
    if (s.state === 'review') s.submitDecision({ action: 'CHECK', timeUsed: 5, camsUsed: new Set(), marks: {} });
  }
  assert.equal(s.state, 'ended');
  assert.equal(s.results.length, 5);
  const g = s.grade();
  assert.ok(g.note >= 1 && g.note <= 10);
});
