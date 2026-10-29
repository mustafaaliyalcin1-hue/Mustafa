// Maç oturumu: simülasyon + kayıt + saat + kritik pozisyonlar + VAR kararları.
// Arayüzden bağımsızdır; olayları `out` kuyruğuna yazar.

import { MatchSim } from '../sim/match.js';
import { Recording } from '../replay/recording.js';
import { RNG, hashString } from '../core/rng.js';
import { DT, PITCH, POSE } from '../sim/constants.js';
import { makeSquad } from '../data/names.js';
import { resolveKits } from '../data/teams.js';
import { generateScenario, judgeScenario, TYPE_KEYS } from '../sim/scenarios/index.js';
import { penaltyKick } from '../sim/scenarios/restarts.js';
import { recordingSource, teamOfId } from '../var/truth.js';
import { evaluateIncident, finalOutcome, matchGrade, TYPE_INFO } from '../var/protocol.js';
import { RADIO_START, RADIO_PRESSURE, AVAR_GOOD, AVAR_TRUTH } from '../data/texts.js';
import { AVAR_NAMES, REFEREE_NAMES } from '../data/names.js';

export class MatchSession {
  /**
   * cfg: { mode, home, away, diff, numIncidents, types, seed, matchSeconds, competition, stadium, noTimer }
   */
  constructor(cfg) {
    this.cfg = cfg;
    this.seed = cfg.seed >>> 0;
    const r = new RNG(this.seed);
    this.rng = r;
    this.squads = [makeSquad(r.fork('h'), !!cfg.home.foreign), makeSquad(r.fork('a'), !!cfg.away.foreign)];
    this.kits = resolveKits(cfg.home, cfg.away);
    this.teams = [cfg.home, cfg.away];
    this.sim = new MatchSim({ seed: hashString('sim' + this.seed), squads: this.squads });
    this.rec = new Recording();
    this.out = [];
    this.state = 'pre';
    this.t = 0;
    this.incidents = [];
    this.results = [];
    this.events = []; // maç olayları (goller, kartlar, VAR)
    this.refName = r.pick(REFEREE_NAMES);
    this.avarName = r.pick(AVAR_NAMES);
    this.fans = [50, 50]; // taraftar memnuniyeti
    this.matchSeconds = cfg.matchSeconds || 420;
    this.stoppage = [r.int(1, 3), r.int(2, 5)];
    this.plan = this.planIncidents();
    this.next = 0;
    this.cur = null;
    this.timer = 0;
    this.record(); // ilk kare
  }

  players(id) {
    if (id === null || id === undefined || id < 0 || id > 21) return null;
    const e = this.sim.ents[id];
    return { num: e.num, name: e.name, team: e.team, teamName: this.teams[e.team].short };
  }

  planIncidents() {
    const cfg = this.cfg, r = this.rng.fork('plan');
    const n = cfg.numIncidents || 5;
    const types = cfg.types && cfg.types.length ? cfg.types : TYPE_KEYS;
    // türleri dengeli dağıt
    const pool = [];
    while (pool.length < n) pool.push(...r.shuffle(types.slice()));
    const list = pool.slice(0, n);
    const mins = [];
    const span = [[7, 43], [48, 87]];
    for (let i = 0; i < n; i++) {
      const h = i < Math.ceil(n / 2) ? 0 : 1;
      mins.push(r.range(span[h][0], span[h][1]));
    }
    mins.sort((a, b) => a - b);
    for (let i = 1; i < n; i++) if (mins[i] - mins[i - 1] < 5) mins[i] = Math.min(88, mins[i - 1] + 5);
    return list.map((type, i) => ({ type, minute: mins[i], half: mins[i] < 45 ? 1 : 2, attackTeam: r.int(0, 1), seed: r.int(1, 1e9) }));
  }

  emit(e) { this.out.push(e); }
  record() { this.rec.push(this.sim); }

  start() {
    this.state = 'live';
    this.emit({ type: 'whistle', long: true });
    this.emit({ type: 'text', text: 'Maç başladı!' });
  }

  /** Gerçek zamanlı ilerleme. speed: canlı oyunda hızlandırma çarpanı. */
  update(dt, speed = 1) {
    if (this.state === 'live' || this.state === 'scenario' || this.state === 'restartScript') {
      const mul = this.state === 'live' ? speed : 1;
      this.acc = (this.acc || 0) + dt * mul;
      let steps = 0;
      while (this.acc >= DT && steps < 12) {
        this.acc -= DT; steps++;
        this.tick();
        if (this.state !== 'live' && this.state !== 'scenario' && this.state !== 'restartScript') { this.acc = 0; break; }
      }
    } else if (this.state === 'cutting') {
      this.timer += dt;
      if (!this.cutDone && this.timer >= 0.28) { this.cutDone = true; this.cutAction(); }
      if (this.timer >= 0.6) { this.state = this.cutNext; this.acc = 0; }
    } else if (this.state === 'aftermath') {
      this.timer += dt;
      if (this.timer >= 3.2) this.beginReview();
    } else if (this.state === 'resume') {
      this.timer += dt;
      if (this.timer >= 0.4) this.applyAftermath();
    }
  }

  tick() {
    const sim = this.sim;
    sim.step();
    if (sim.mode === 'free') {
      sim.minute += DT * (90 / this.matchSeconds);
    } else {
      sim.minute += DT / 60;
    }
    this.record();
    for (const ev of sim.events) this.handleSimEvent(ev);
    sim.events.length = 0;
    if (this.state !== 'live') return;
    // devre / maç sonu
    const m = sim.minute;
    if (sim.half === 1 && m >= 45 + this.stoppage[0] && sim.mode === 'free') { this.halftime(); return; }
    if (sim.half === 2 && m >= 90 + this.stoppage[1] && sim.mode === 'free') { this.fulltime(); return; }
    // kritik pozisyon tetikleme
    const p = this.plan[this.next];
    if (p && sim.mode === 'free' && m >= p.minute && (p.half === sim.half || m > p.minute + 3 || sim.half === 2) && !sim.setPiece && sim.celebrate <= 0 && sim.sinceRestart > 3) {
      this.triggerIncident(p);
    }
  }

  handleSimEvent(ev) {
    const sim = this.sim;
    switch (ev.type) {
      case 'goal':
        if (ev.script) {
          // senaryo golü: saha kararına göre skor
          const inc = this.cur;
          if (inc && inc.sc.type !== 'PEN_KICK') {
            if (inc.sc.refDecision === 'GOAL') { sim.score[ev.team]++; inc.goalCounted = true; this.emit({ type: 'goal', team: ev.team, scorer: ev.scorer, pending: true }); }
            else this.emit({ type: 'goalNoFlag', team: ev.team });
          } else if (this.penScript) {
            sim.score[ev.team]++;
            this.events.push({ kind: 'goal', team: ev.team, minute: sim.minute, half: sim.half, text: `Penaltı golü: ${this.players(ev.scorer).name}` });
            this.emit({ type: 'goal', team: ev.team, scorer: ev.scorer });
          }
        } else {
          this.events.push({ kind: 'goal', team: ev.team, minute: sim.minute, half: sim.half, text: `Gol: ${this.players(ev.scorer).name}` });
          this.emit({ type: 'goal', team: ev.team, scorer: ev.scorer });
          this.emit({ type: 'text', text: `VAR sessiz kontrol: gol temiz.` });
        }
        break;
      case 'kickoffNeeded':
        this.cut(() => sim.kickoff(ev.team), 'live');
        break;
      case 'scriptEnd':
        if (this.penScript) this.endPenalty();
        else this.endScenario();
        break;
      default:
        this.emit(ev);
    }
  }

  cut(action, next) {
    this.state = 'cutting';
    this.timer = 0;
    this.cutDone = false;
    this.cutAction = action;
    this.cutNext = next;
    this.emit({ type: 'cut' });
  }

  halftime() {
    this.state = 'halftime';
    this.emit({ type: 'whistle', long: true, triple: true });
    this.emit({ type: 'halftime' });
  }
  continueSecondHalf() {
    const sim = this.sim;
    sim.half = 2;
    sim.minute = 45;
    this.cut(() => sim.kickoff(1), 'live');
    this.emit({ type: 'text', text: 'İkinci yarı başladı.' });
  }
  fulltime() {
    this.state = 'ended';
    // tetiklenmemiş pozisyon kalmasın: (nadiren) atlanırsa listeden düş
    this.emit({ type: 'whistle', long: true, triple: true });
    this.emit({ type: 'fulltime' });
  }

  // ---------------- kritik pozisyon ----------------
  diffFor() { return this.cfg.diff; }

  triggerIncident(p) {
    this.next++;
    this.cut(() => this.startScenario(p), 'scenario');
  }

  startScenario(p) {
    const sim = this.sim;
    const rng = new RNG(hashString(`${this.seed}:${p.seed}:${p.type}`));
    const sc = generateScenario(p.type, { sim, rng, diff: this.diffFor(), attackTeam: p.attackTeam });
    const inc = {
      idx: this.incidents.length, type: p.type, sc, subtype: sc.subtype,
      minute: sim.minute, half: sim.half, attackTeam: p.attackTeam, defTeam: 1 - p.attackTeam, dir: sc.dir,
      refDecision: sc.refDecision, cardTarget: sc.cardTarget, candidates: sc.candidates || [],
      bestCam: sc.bestCam, line: sc.line, focus: sc.focus, meta: sc.meta,
      timeLimit: this.cfg.noTimer ? 0 : this.cfg.diff.time,
    };
    this.cur = inc;
    sim.startScript(sc);
    inc.segStart = this.rec.count; // ilk script karesi bir sonraki tick'te yazılır
    this.emit({ type: 'incidentLive', inc });
  }

  endScenario() {
    const inc = this.cur;
    const sc = inc.sc;
    inc.segEnd = inc.segStart + sc.n - 1;
    inc.appFrame = inc.segStart + (sc.appFrame || 0);
    const S = recordingSource(this.rec, inc.segStart, sc.n, teamOfId);
    inc.truth = judgeScenario(S, sc);
    inc.truth.keyFrameAbs = inc.segStart + inc.truth.keyFrame;
    if (inc.truth.facts && inc.truth.facts.contactFrame >= 0) inc.truth.facts.contactFrameAbs = inc.segStart + inc.truth.facts.contactFrame;
    this.incidents.push(inc);
    this.state = 'aftermath';
    this.timer = 0;
    this.emit({ type: 'fieldDecision', inc });
  }

  /** Eğitim/antrenman: canlı oyun olmadan tek pozisyon hazırla. */
  prepareSingle(type) {
    const sim = this.sim;
    for (let i = 0; i < 60; i++) { sim.step(); sim.minute += DT * 0.2; this.record(); sim.events.length = 0; }
    const p = { type, minute: sim.minute, half: 1, attackTeam: this.rng.int(0, 1), seed: this.rng.int(1, 1e9) };
    if (this.cfg.attackMinute) sim.minute = this.cfg.attackMinute;
    this.startScenario(p);
    while (sim.mode === 'script') {
      sim.step(); sim.minute += DT / 60; this.record();
      for (const ev of sim.events) if (ev.type === 'scriptEnd') this.endScenario();
      sim.events.length = 0;
    }
    this.state = 'review';
    this.buildRadio(this.cur);
    return this.cur;
  }

  beginReview() {
    this.state = 'review';
    const inc = this.cur;
    this.buildRadio(inc);
    this.emit({ type: 'review', inc });
  }

  buildRadio(inc) {
    const r = new RNG(hashString('radio' + this.seed + ':' + inc.idx));
    const d = this.cfg.diff;
    const lines = [];
    lines.push({ t: 0.5, who: 'HAKEM', text: r.pick(RADIO_START[inc.type]) });
    const good = r.chance(d.avar);
    const t1 = r.range(6, 14);
    if (r.chance(0.6)) lines.push({ t: t1, who: 'AVAR', text: r.pick(AVAR_GOOD[inc.type]) });
    const o = inc.truth.outcome;
    let opinionKey = o.startsWith('SW:') ? 'SW' : o;
    if (!good) {
      // yanıltıcı görüş
      const alts = Object.keys(inc.truth.accept).length > 1 ? [inc.refDecision] : Object.keys(TYPE_INFO[inc.type].outcomes).filter((k) => !(k in inc.truth.accept));
      opinionKey = alts.length ? alts[0] : opinionKey;
      if (inc.type === 'KIMLIK') opinionKey = o === 'CONFIRM' ? 'SW' : 'CONFIRM';
      if (opinionKey.startsWith('SW:')) opinionKey = 'SW';
    }
    if (AVAR_TRUTH[opinionKey]) lines.push({ t: t1 + r.range(8, 16), who: 'AVAR', text: AVAR_TRUTH[opinionKey], opinion: true, correct: good });
    if (inc.timeLimit) {
      const T = inc.timeLimit;
      const used = new Set();
      for (const fr of [0.45, 0.7, 0.88]) {
        let txt; do { txt = r.pick(RADIO_PRESSURE); } while (used.has(txt) && used.size < RADIO_PRESSURE.length);
        used.add(txt);
        lines.push({ t: T * fr, who: 'HAKEM', text: txt, pressure: true });
      }
    }
    inc.radio = lines.sort((a, b) => a.t - b.t);
    inc.avarCorrect = good;
  }

  /** Oyuncu kararını ver. dec: { action, outcome, timeUsed, timeout, camsUsed, marks } */
  submitDecision(dec) {
    const inc = this.cur;
    const ev = evaluateIncident(inc, dec, { noTimer: this.cfg.noTimer });
    const res = { inc, dec, ev };
    this.results.push(res);
    inc.decision = dec; inc.eval = ev;
    inc.final = finalOutcome(inc, dec);
    // taraftar tepkisi (karara göre, doğruluğuna göre değil)
    const AT = inc.attackTeam;
    const favorAtt = ['GOAL', 'PEN', 'RED', 'FK'].includes(inc.final) || (inc.type === 'KIMLIK' ? false : false);
    const changed = inc.final !== inc.refDecision;
    if (changed) {
      const winner = favorAtt ? AT : 1 - AT;
      this.fans[winner] = Math.min(100, this.fans[winner] + 8);
      this.fans[1 - winner] = Math.max(0, this.fans[1 - winner] - 14);
    }
    this.state = 'resume';
    this.timer = 0;
    this.emit({ type: 'decisionMade', inc, dec });
    return res;
  }

  applyAftermath() {
    const inc = this.cur, sim = this.sim;
    const final = inc.final;
    const AT = inc.attackTeam, DF = inc.defTeam;
    const sc = inc.sc;
    const kf = Math.min(sc.n - 1, inc.truth.keyFrame || 0);
    const fpos = sc.tracks.has(sc.focus) ? sc.tracks.get(sc.focus).get(kf, {}) : { x: sim.ball.x, z: sim.ball.z };
    const minute = inc.minute, half = inc.half;
    const log = (kind, team, text) => this.events.push({ kind, team, minute, half, text, inc: inc.idx });
    let next = null;
    // skor düzeltmeleri
    const isGoalType = ['OFSAYT', 'TOP_DISARI', 'FAUL_GOL'].includes(inc.type);
    if (isGoalType) {
      if (final === 'GOAL' && !inc.goalCounted) { sim.score[AT]++; inc.goalCounted = true; }
      if (final !== 'GOAL' && inc.goalCounted) { sim.score[AT]--; inc.goalCounted = false; }
      if (final === 'GOAL') { log('goal', AT, `Gol: ${this.players(sc.meta.receiver || sc.meta.attacker || sc.meta.striker).name}${inc.decision.action !== 'CHECK' ? ' (VAR sonrası)' : ''}`); next = () => sim.kickoff(DF); }
      else {
        log('var', AT, `VAR: ${TYPE_INFO[inc.type].outcomes[final]}`);
        if (final === 'NOGOAL_OUT') next = () => sim.restart(DF, AT === 0 ? sim.dir(AT) * (PITCH.HL - 5.5) : sim.dir(AT) * (PITCH.HL - 5.5), 3, 'goalkick');
        else next = () => sim.restart(DF, fpos.x, fpos.z, 'fk');
      }
    } else if (inc.type === 'PENALTI' || inc.type === 'ELLE') {
      if (final === 'PEN') {
        log('var', AT, inc.decision.action === 'CHECK' ? 'Penaltı' : 'VAR sonrası penaltı');
        next = 'penalty';
      } else if (final === 'FK') {
        log('var', AT, 'Serbest vuruş (ceza sahası dışı)');
        next = () => sim.restart(AT, fpos.x - sim.dir(AT) * 0.5, fpos.z, 'fk');
      } else {
        if (final === 'DIVE') { this.giveCard(sc.meta.attacker, 'yellow'); log('card', AT, `Sarı kart (simülasyon): ${this.players(sc.meta.attacker).name}`); }
        if (inc.refDecision === 'PEN') log('var', AT, 'VAR sonrası penaltı iptal');
        next = () => sim.restart(DF, sim.dir(AT) * (PITCH.HL - 5.5), 0, 'goalkick');
      }
    } else if (inc.type === 'KIRMIZI') {
      const t = sc.cardTarget;
      if (final === 'RED') { this.giveCard(t, 'red'); log('card', DF, `Kırmızı kart: ${this.players(t).name}${inc.refDecision !== 'RED' ? ' (VAR sonrası)' : ''}`); }
      else { this.giveCard(t, 'yellow'); log('card', DF, `Sarı kart: ${this.players(t).name}${inc.refDecision === 'RED' ? ' (VAR: kırmızı iptal)' : ''}`); }
      next = () => sim.restart(AT, fpos.x - sim.dir(AT) * 0.5, fpos.z, 'fk');
    } else if (inc.type === 'KIMLIK') {
      const target = final.startsWith('SW:') ? +final.slice(3) : sc.cardTarget;
      this.giveCard(target, 'yellow');
      log('card', DF, `Sarı kart: ${this.players(target).name}${final.startsWith('SW:') ? ' (VAR: kimlik düzeltildi)' : ''}`);
      next = () => sim.restart(AT, fpos.x - sim.dir(AT) * 0.5, fpos.z, 'fk');
    }
    this.cur.done = true;
    if (next === 'penalty') {
      this.cut(() => this.startPenalty(inc), 'restartScript');
    } else {
      this.cut(next, 'live');
    }
    this.emit({ type: 'resumed', inc });
  }

  giveCard(id, color) {
    const e = this.sim.ents[id];
    if (!e || !e.active) return;
    if (color === 'yellow') {
      e.yellow++;
      if (e.yellow >= 2) { this.sim.sendOff(id); this.events.push({ kind: 'card', team: e.team, minute: this.sim.minute, half: this.sim.half, text: `İkinci sarıdan kırmızı: ${e.name}` }); }
    } else this.sim.sendOff(id);
  }

  startPenalty(inc) {
    const sim = this.sim;
    const rng = new RNG(hashString('pen' + this.seed + inc.idx));
    const sc = penaltyKick({ sim, rng, diff: this.cfg.diff, attackTeam: inc.attackTeam, defTeam: inc.defTeam, dir: sim.dir(inc.attackTeam) });
    this.penScript = { sc, inc };
    this.cur = { sc, type: 'PEN_KICK', idx: -1 };
    sim.startScript(sc);
  }
  endPenalty() {
    const { sc, inc } = this.penScript;
    this.penScript = null;
    this.cur = inc;
    const sim = this.sim;
    if (sc.meta.goal) this.cut(() => sim.kickoff(inc.defTeam), 'live');
    else { this.events.push({ kind: 'miss', team: inc.attackTeam, minute: sim.minute, half: sim.half, text: 'Penaltı kaçtı' }); this.cut(() => sim.restart(inc.defTeam, sim.dir(inc.attackTeam) * (PITCH.HL - 5.5), 2, 'goalkick'), 'live'); }
  }

  grade() { return matchGrade(this.results.map((r) => r.ev), { noTimer: this.cfg.noTimer }); }
}
