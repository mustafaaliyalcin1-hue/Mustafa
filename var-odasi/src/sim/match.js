// Maç simülasyonu: 22 oyuncu + top + hakem + 2 yan hakem.
// İki çalışma kipi var:
//  - 'free'  : serbest oyun (basit yapay zekâ: pas, koşu, pres, şut)
//  - 'script': kritik pozisyon — senaryo jeneratörünün kare kare kurguladığı an
// Her iki kipte de her kare kayda alınır; replay ve VAR incelemesi bu kayıttan oynar.

import { DT, PITCH, BALL_R, POSE, ARM, REF, AR1, AR2, N_ENT } from './constants.js';
import { BASE, KICKOFF, formationTarget } from './formation.js';
import { RNG } from '../core/rng.js';
import { clamp, turnToward, wrapAngle } from '../core/util.js';


const STRIDE = 2.4;
const G = 9.81;
const ROLL_DECEL = 2.6;

export class MatchSim {
  /**
   * cfg: { seed, squads: [squad0, squad1], kits }
   */
  constructor(cfg) {
    this.rng = new RNG(cfg.seed);
    this.squads = cfg.squads;
    this.ents = [];
    for (let i = 0; i < N_ENT; i++) {
      const team = i < 11 ? 0 : i < 22 ? 1 : 2;
      const idx = i < 22 ? i % 11 : -1;
      const sq = team < 2 ? this.squads[team][idx] : null;
      this.ents.push({
        id: i, team, idx, num: sq ? sq.num : 0, name: sq ? sq.name : i === REF ? 'Hakem' : 'Yan hakem', role: sq ? sq.role : 'REF',
        x: 0, z: 0, h: 0, ph: this.rng.range(0, 6.28), sp: 0, vx: 0, vz: 0,
        pose: POSE.LOCO, pt: 0, p1: 0, p2: 0, p3: 0, anim: null,
        active: true, yellow: 0, red: false,
        wander: [0, 0], wanderT: 0, decide: 0.5, kickCd: 0, tackleT: 0,
      });
    }
    this.ball = { x: 0, y: BALL_R, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, owner: -1, lastTeam: 0, lastKicker: -1, kickerCd: 0, shot: null, intended: -1, held: false };
    this.half = 1;
    this.score = [0, 0];
    this.minute = 0;
    this.mode = 'free';
    this.events = [];
    this.setPiece = null;
    this.celebrate = 0;
    this.sinceRestart = 0;
    this.sc = null; this.sf = 0;
    this.possTeam = 0;
    this.kickoff(0);
  }

  // Takımın hücum yönü (+1: +x kalesine hücum)
  dir(team) { return (this.half === 1) === (team === 0) ? 1 : -1; }
  rel(team, x, z) { const d = this.dir(team); return [d * x, d * z]; }
  world(team, X, Z) { const d = this.dir(team); return [d * X, d * Z]; }
  emit(ev) { this.events.push(ev); }
  activePlayers(team) { return this.ents.filter((e) => e.team === team && e.active); }

  // ---------------- yeniden başlatmalar ----------------
  kickoff(team) {
    this.mode = 'free';
    this.celebrate = 0;
    for (const e of this.ents) {
      if (e.team > 1) continue;
      const k = KICKOFF[e.idx];
      let [X, Z] = k;
      if (e.team !== team && e.idx >= 9) { X = -10; Z = e.idx === 9 ? 6 : -6; }
      const [x, z] = this.world(e.team, X, Z);
      this.place(e, x, z, this.dir(e.team) > 0 ? 0 : Math.PI);
    }
    this.placeOfficials(0, 0);
    this.setBall(0, 0);
    const taker = this.ents[team * 11 + 9].active ? this.ents[team * 11 + 9] : this.nearest(team, 0, 0);
    this.place(taker, -this.dir(team) * 0.4, 0.2, this.dir(team) > 0 ? 0 : Math.PI);
    this.setPiece = { type: 'kickoff', team, x: 0, z: 0, t: 0, taker: taker.id };
    this.possTeam = team;
    this.sinceRestart = 0;
  }

  /** Bir noktadan oyunu yeniden başlat (serbest vuruş, aut, kale vuruşu). */
  restart(team, x, z, type = 'fk') {
    this.mode = 'free';
    this.celebrate = 0;
    x = clamp(x, -52, 52); z = clamp(z, -33.8, 33.8);
    for (const e of this.ents) {
      if (e.team > 1 || !e.active) continue;
      const [bX, bZ] = this.rel(e.team, x, z);
      const [tX, tZ] = formationTarget(e.idx, bX, bZ, e.team === team);
      let [wx, wz] = this.world(e.team, tX, tZ);
      // rakipler topa 9.15 m'den yakın durmasın
      if (e.team !== team) {
        const d = Math.hypot(wx - x, wz - z);
        if (d < 9.2) { const k = 9.2 / (d || 1); wx = x + (wx - x) * k; wz = z + (wz - z) * k; }
      }
      this.place(e, wx, wz, Math.atan2(z - wz, x - wx));
      e.pose = POSE.LOCO; e.anim = null;
    }
    this.placeOfficials(x, z);
    this.setBall(x, z);
    let taker;
    if (type === 'goalkick') taker = this.ents[team * 11];
    else taker = this.nearest(team, x, z, true);
    const away = this.dir(team);
    this.place(taker, x - away * 0.8, z, away > 0 ? 0 : Math.PI);
    this.setPiece = { type, team, x, z, t: 0, taker: taker.id };
    this.possTeam = team;
    this.sinceRestart = 0;
  }

  place(e, x, z, h) {
    e.x = x; e.z = z; e.vx = 0; e.vz = 0; e.sp = 0;
    if (h !== undefined) e.h = h;
    e.pose = e.active ? POSE.LOCO : POSE.HIDDEN; e.anim = null; e.pt = 0; e.p1 = 0; e.p2 = 0; e.p3 = 0;
  }
  placeOfficials(bx, bz) {
    const r = this.ents[REF];
    this.place(r, bx - 8, clamp(bz * 0.5 - 10, -28, 28), 0);
    this.place(this.ents[AR1], 20, PITCH.HW + 0.9, -Math.PI / 2);
    this.place(this.ents[AR2], -20, -PITCH.HW - 0.9, Math.PI / 2);
  }
  setBall(x, z) {
    const b = this.ball;
    b.x = x; b.z = z; b.y = BALL_R; b.vx = b.vy = b.vz = 0; b.owner = -1; b.shot = null; b.intended = -1; b.held = true;
  }
  nearest(team, x, z, skipGK = false) {
    let best = null, bd = Infinity;
    for (const e of this.ents) {
      if (e.team !== team || !e.active || (skipGK && e.idx === 0)) continue;
      const d = Math.hypot(e.x - x, e.z - z);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  sendOff(id) {
    const e = this.ents[id];
    e.active = false; e.red = true;
    this.place(e, e.x, e.team === 0 ? -40 : 40);
    e.pose = POSE.HIDDEN;
  }

  // ---------------- ana adım ----------------
  step() {
    if (this.mode === 'script') this.stepScript();
    else if (this.mode === 'free') this.stepFree();
    // hold: hiçbir şey yapma
  }

  animate(e) {
    if (e.anim) {
      e.anim.f++;
      e.pose = e.anim.pose; e.pt = Math.min(1, e.anim.f / e.anim.n);
      e.p1 = e.anim.p1; e.p2 = e.anim.p2; e.p3 = e.anim.p3;
      if (e.anim.f >= e.anim.n) {
        const next = e.anim.next;
        e.anim = next || null;
        if (!next) { e.pose = POSE.LOCO; e.pt = 0; e.p1 = e.p2 = e.p3 = 0; }
      }
    }
  }
  playAnim(e, pose, n, p1 = 0, p2 = 0, p3 = 0, next = null) { e.anim = { pose, n, f: 0, p1, p2, p3, next }; }

  moveTo(e, tx, tz, maxSp, faceX, faceZ) {
    const dx = tx - e.x, dz = tz - e.z;
    const d = Math.hypot(dx, dz);
    const desired = d < 0.25 ? 0 : Math.min(maxSp, d * 1.3 + 0.3);
    const dvx = (d > 1e-6 ? (dx / d) * desired : 0) - e.vx;
    const dvz = (d > 1e-6 ? (dz / d) * desired : 0) - e.vz;
    const dv = Math.hypot(dvx, dvz);
    const maxA = 6.5 * DT;
    const k = dv > maxA ? maxA / dv : 1;
    e.vx += dvx * k; e.vz += dvz * k;
    e.x += e.vx * DT; e.z += e.vz * DT;
    e.sp = Math.hypot(e.vx, e.vz);
    if (e.sp > 1.2) e.h = turnToward(e.h, Math.atan2(e.vz, e.vx), 0.22);
    else if (faceX !== undefined) e.h = turnToward(e.h, Math.atan2(faceZ - e.z, faceX - e.x), 0.12);
    e.ph += e.sp * DT * (2 * Math.PI / STRIDE);
  }

  // ---------------- serbest oyun ----------------
  stepFree() {
    const b = this.ball, rng = this.rng;
    this.sinceRestart += DT;
    if (b.kickerCd > 0) b.kickerCd -= DT;

    // set parçası
    const sp = this.setPiece;
    if (sp) {
      sp.t += DT;
      const tk = this.ents[sp.taker];
      if (!tk.active) { sp.taker = this.nearest(sp.team, sp.x, sp.z).id; }
      const dd = Math.hypot(tk.x - sp.x, tk.z - sp.z);
      if (sp.t > 0.9 && dd < 1.2) {
        b.held = false;
        b.owner = tk.id; b.lastTeam = tk.team;
        tk.decide = 0;
        tk.forcePass = true;
        this.setPiece = null;
        this.possTeam = tk.team;
        if (sp.type !== 'kickoff') this.emit({ type: 'whistleShort' });
        else this.emit({ type: 'whistle' });
      }
    }

    // sahip oyuncu
    const owner = b.owner >= 0 ? this.ents[b.owner] : null;
    if (owner) this.possTeam = owner.team;
    else if (!sp && !b.shot) this.possTeam = b.lastTeam;

    // gezinme ofsetleri (oyuncular hep aynı noktada durmasın)
    for (const e of this.ents) {
      if (e.team > 1) continue;
      e.wanderT -= DT;
      if (e.wanderT <= 0) { e.wanderT = rng.range(1.5, 4); e.wander = [rng.range(-4, 4), rng.range(-3, 3)]; }
    }

    // takım hareketleri
    for (const team of [0, 1]) this.teamAI(team, owner);

    // sahip oyuncu kararları
    if (owner) this.ownerAI(owner);

    // top fiziği
    if (owner && !owner.kicking) {
      const d = 0.55 + 0.12 * Math.sin(owner.ph * 0.5);
      b.x = owner.x + Math.cos(owner.h) * d; b.z = owner.z + Math.sin(owner.h) * d; b.y = BALL_R;
      b.vx = owner.vx; b.vz = owner.vz; b.vy = 0;
      b.spin += owner.sp * DT / BALL_R;
    } else if (!b.held) {
      this.ballPhysics();
      if (!b.held) this.ballControl();
    }

    this.checkBoundaries();
    this.officialsAI();
    for (const e of this.ents) this.animate(e);
    if (this.celebrate > 0) {
      this.celebrate -= DT;
      if (this.celebrate <= 0) this.emit({ type: 'kickoffNeeded', team: this.celebrateTeam });
    }
  }

  teamAI(team, owner) {
    const b = this.ball;
    const inPoss = this.possTeam === team;
    const [bX, bZ] = this.rel(team, b.x, b.z);
    const players = this.activePlayers(team);
    // en yakın iki oyuncu (presçi / top kovalayan)
    const byDist = players.filter((e) => e.idx !== 0).map((e) => ({ e, d: Math.hypot(e.x - b.x, e.z - b.z) })).sort((a, c) => a.d - c.d);
    const chaser = byDist[0] ? byDist[0].e : null;
    const cover = byDist[1] ? byDist[1].e : null;
    // ofsayt çizgisi: rakibin sondan ikinci oyuncusu (göreli)
    const opp = this.activePlayers(1 - team).map((e) => this.rel(team, e.x, e.z)[0]).sort((a, c) => c - a);
    const offLine = Math.max(opp[1] !== undefined ? opp[1] : 0, bX, 0);

    for (const e of players) {
      if (owner && e === owner) continue;
      if (e.kicking) { this.kickStep(e); continue; }
      let tX, tZ, sp = 5.2;
      if (this.celebrate > 0) {
        const sc = this.ents[this.scorer];
        if (e.team === sc.team) { tX = sc.x; tZ = sc.z; sp = 4; this.moveTo(e, tX + (e.idx % 3) - 1, tZ + (e.idx % 4) - 1.5, sp, sc.x, sc.z); }
        else { this.moveTo(e, e.x, e.z, 1, b.x, b.z); }
        continue;
      }
      const [eX, eZ] = this.rel(team, e.x, e.z);
      [tX, tZ] = formationTarget(e.idx, bX, bZ, inPoss, e.wander);
      if (inPoss && e.role === 'FW') tX = Math.min(tX + 6, offLine - 0.8);
      if (inPoss && !owner && b.intended === e.id) {
        // pas alıcısı topa doğru
        [tX, tZ] = this.rel(team, b.x + b.vx * 0.35, b.z + b.vz * 0.35);
        sp = 6.5;
      } else if (!owner && !this.setPiece && e === chaser && !b.shot) {
        [tX, tZ] = this.rel(team, b.x + b.vx * 0.4, b.z + b.vz * 0.4);
        sp = 7;
      } else if (!inPoss && owner && e === chaser) {
        // pres: topla kale arasında dur
        const [oX, oZ] = this.rel(team, owner.x, owner.z);
        tX = oX - 0.9; tZ = oZ; sp = 6.6;
        const dd = Math.hypot(e.x - owner.x, e.z - owner.z);
        if (dd < 1.25 && !owner.kicking) {
          e.tackleT += DT;
          if (e.tackleT > 0.45 && this.rng.chance(0.05)) this.tackle(e, owner);
        } else e.tackleT = 0;
      } else if (!inPoss && owner && e === cover) {
        const [oX, oZ] = this.rel(team, owner.x, owner.z);
        tX = Math.max(oX - 9, eX - 2); tZ = oZ * 0.7; sp = 5.5;
      }
      if (this.setPiece && this.setPiece.taker === e.id) {
        const away = this.dir(team);
        [tX, tZ] = this.rel(team, this.setPiece.x - away * 0.7, this.setPiece.z);
        sp = 6;
        if (this.setPiece.t > 3) { this.place(e, this.setPiece.x - away * 0.7, this.setPiece.z, away > 0 ? 0 : Math.PI); continue; }
      }
      if (e.idx === 0) {
        // kaleci
        if (b.shot && b.shot.team !== team) this.keeperSave(e, team);
        else {
          const [gX, gZ] = formationTarget(0, bX, bZ, inPoss);
          tX = gX; tZ = gZ; sp = 4;
          if (!owner && !this.setPiece && bX < -36 && Math.abs(bZ) < 18 && e === this.nearest(team, b.x, b.z) && !b.shot) {
            [tX, tZ] = [bX, bZ]; sp = 6;
          }
        }
        if (e.pose === POSE.DIVE && e.anim) { this.moveTo(e, e.x + e.vx * 0.1, e.z + e.vz * 0.1, 6); continue; }
      }
      // kendi kalesinin gerisine geçme
      tX = clamp(tX, -51.5, 51.5); tZ = clamp(tZ, -33, 33);
      const [wx, wz] = this.world(team, tX, tZ);
      this.separate(e, wx, wz, sp);
    }
  }

  separate(e, wx, wz, sp) {
    // diğer oyunculara çok yaklaşmayı önle
    let ax = 0, az = 0;
    for (const o of this.ents) {
      if (o === e || o.team > 1 || !o.active) continue;
      const dx = e.x - o.x, dz = e.z - o.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 2.2 && d2 > 1e-4) { const d = Math.sqrt(d2); ax += (dx / d) * (1.5 - d); az += (dz / d) * (1.5 - d); }
    }
    this.moveTo(e, wx + ax * 2, wz + az * 2, sp, this.ball.x, this.ball.z);
  }

  tackle(def, owner) {
    const b = this.ball, rng = this.rng;
    def.tackleT = 0;
    this.playAnim(def, POSE.LUNGE, 14, 0.75, 0.22, 0.08);
    if (rng.chance(0.5)) {
      b.owner = def.id; b.lastTeam = def.team; def.decide = rng.range(0.3, 0.8);
    } else {
      b.owner = -1;
      const a = def.h + rng.range(-0.8, 0.8);
      const v = rng.range(4, 7);
      b.vx = Math.cos(a) * v; b.vz = Math.sin(a) * v; b.vy = 0.5;
      b.lastTeam = def.team; b.lastKicker = def.id; b.kickerCd = 0.3;
    }
    owner.decide = 0.4;
  }

  ownerAI(o) {
    const b = this.ball, rng = this.rng;
    if (o.kicking) { this.kickStep(o); return; }
    if (this.celebrate > 0) { this.moveTo(o, o.x, o.z, 1); return; }
    const team = o.team;
    const [oX, oZ] = this.rel(team, o.x, o.z);
    // baskı
    let pressD = Infinity;
    for (const e of this.activePlayers(1 - team)) pressD = Math.min(pressD, Math.hypot(e.x - o.x, e.z - o.z));
    if (o.idx === 0) {
      // kaleci topu tutuyorsa uzun at
      o.holdT = (o.holdT || 0) + DT;
      this.moveTo(o, o.x, o.z, 1, 0, 0);
      if (o.holdT > 1.4) { o.holdT = 0; this.pass(o, true); }
      return;
    }
    o.decide -= DT;
    // dripling yönü
    let tX = oX + 8, tZ = oZ * 0.85;
    if (oX > 38) tZ = oZ * 0.5;
    const [wx, wz] = this.world(team, clamp(tX, -50, 51), clamp(tZ, -32, 32));
    this.moveTo(o, wx, wz, pressD < 3 ? 6.2 : 5.4);
    if (o.decide <= 0 || o.forcePass || pressD < 1.4) {
      o.decide = rng.range(0.5, 1.3);
      const canShoot = oX > 27 && Math.abs(oZ) < 17;
      if (o.forcePass) { o.forcePass = false; this.pass(o, false); }
      else if (canShoot && rng.chance(oX > 36 ? 0.55 : 0.28)) this.shoot(o);
      else if (rng.chance(0.55) || pressD < 2.2) this.pass(o, false);
    }
  }

  // vuruş animasyonu: 9. karede topa temas
  beginKick(o, launch) {
    o.kicking = { f: 0, launch };
    this.playAnim(o, POSE.KICK, 15);
  }
  kickStep(o) {
    const k = o.kicking;
    k.f++;
    this.moveTo(o, o.x + Math.cos(o.h) * 0.6, o.z + Math.sin(o.h) * 0.6, 2.5);
    const b = this.ball;
    if (k.f < 9 && b.owner === o.id) {
      b.x = o.x + Math.cos(o.h) * 0.62; b.z = o.z + Math.sin(o.h) * 0.62; b.y = BALL_R;
    }
    if (k.f === 9) {
      if (b.owner === o.id) {
        b.owner = -1; b.held = false;
        k.launch(b);
        b.lastTeam = o.team; b.lastKicker = o.id; b.kickerCd = 0.35;
        this.emit({ type: 'kick', power: Math.hypot(b.vx, b.vy, b.vz) });
      }
    }
    if (k.f >= 15) o.kicking = null;
  }

  pass(o, long) {
    const rng = this.rng, team = o.team;
    const [oX, oZ] = this.rel(team, o.x, o.z);
    const opps = this.activePlayers(1 - team);
    let best = null, bs = -Infinity;
    for (const m of this.activePlayers(team)) {
      if (m === o || m.idx === 0) continue;
      const [mX, mZ] = this.rel(team, m.x, m.z);
      const d = Math.hypot(mX - oX, mZ - oZ);
      if (d < 6 || d > (long ? 55 : 38)) continue;
      let open = 9;
      for (const p of opps) open = Math.min(open, segDist(p.x, p.z, o.x, o.z, m.x, m.z));
      if (open < 1.3) continue;
      const s = (mX - oX) * 0.35 + Math.min(open, 6) * 1.2 - Math.abs(d - (long ? 30 : 16)) * 0.08 + rng.range(0, 2.5);
      if (s > bs) { bs = s; best = m; }
    }
    if (!best) {
      if (long) best = this.activePlayers(team).filter((m) => m.idx > 0)[rng.int(0, 5)] || null;
      if (!best) return;
    }
    const m = best;
    const tx = m.x + m.vx * 0.6, tz = m.z + m.vz * 0.6;
    const d = Math.hypot(tx - o.x, tz - o.z);
    o.h = Math.atan2(tz - o.z, tx - o.x);
    const lofted = long || d > 30 || rng.chance(0.12);
    this.beginKick(o, (b) => {
      const dx = tx - b.x, dz = tz - b.z, dd = Math.hypot(dx, dz) || 1;
      if (lofted) {
        const vh = clamp(dd * 0.55 + 6, 12, 24), T = dd / vh;
        b.vx = (dx / dd) * vh; b.vz = (dz / dd) * vh; b.vy = 0.5 * G * T * 0.92;
      } else {
        const v0 = Math.sqrt(25 + 2 * ROLL_DECEL * dd);
        b.vx = (dx / dd) * v0; b.vz = (dz / dd) * v0; b.vy = 0;
      }
      b.intended = m.id;
    });
  }

  shoot(o) {
    const rng = this.rng, team = o.team;
    const [oX, oZ] = this.rel(team, o.x, o.z);
    const dist = Math.hypot(52.5 - oX, oZ);
    const pGoal = clamp(0.3 - dist * 0.0085, 0.05, 0.26);
    const r = rng.next();
    const outcome = r < pGoal ? 'goal' : r < pGoal + 0.5 ? 'save' : 'wide';
    let gZ, gY;
    if (outcome === 'goal') { gZ = rng.sign() * rng.range(1.2, 3.2); gY = rng.range(0.25, 2.0); }
    else if (outcome === 'save') { gZ = rng.range(-2.2, 2.2); gY = rng.range(0.3, 1.8); }
    else if (rng.chance(0.6)) { gZ = rng.sign() * rng.range(4.2, 7); gY = rng.range(0.3, 1.5); }
    else { gZ = rng.range(-3, 3); gY = rng.range(2.75, 3.6); }
    const [tx, tz] = this.world(team, 53.2, gZ);
    o.h = Math.atan2(tz - o.z, tx - o.x);
    this.beginKick(o, (b) => {
      const dx = tx - b.x, dz = tz - b.z, dd = Math.hypot(dx, dz) || 1;
      const vh = rng.range(22, 28), T = dd / vh;
      b.vx = (dx / dd) * vh; b.vz = (dz / dd) * vh;
      b.vy = (gY - b.y + 0.5 * G * T * T) / T;
      b.shot = { team, outcome, gZ };
      b.intended = -1;
      this.emit({ type: 'shot', team, outcome });
    });
  }

  keeperSave(gk, team) {
    const b = this.ball;
    const [gX, gZ] = this.rel(team, gk.x, gk.z);
    const [bX, bZ] = this.rel(team, b.x, b.z);
    const [vX, vZ] = this.rel(team, b.vx, b.vz);
    // topun kaleci hizasına geleceği an
    const T = vX < -0.1 ? (gX - bX) / vX : 0.5;
    const pZ = bZ + vZ * Math.max(0, T);
    const out = b.shot.outcome;
    let tZ = out === 'goal' ? gZ - Math.sign(pZ - gZ) * 0.3 : pZ;
    tZ = clamp(tZ, -3.5, 3.5);
    const [wx, wz] = this.world(team, -51.3, tZ);
    if (T < 0.35 && Math.abs(pZ - gZ) > 0.9 && gk.pose !== POSE.DIVE && out !== 'wide') {
      const side = Math.sign(this.rel(team, -Math.sin(gk.h), Math.cos(gk.h))[1] * (pZ - gZ)) || 1;
      this.playAnim(gk, POSE.DIVE, 26, out === 'goal' ? -side : side);
      gk.vx = (wx - gk.x) * 2.5; gk.vz = (wz - gk.z) * 2.5;
    }
    this.moveTo(gk, wx, wz, out === 'goal' ? 3 : 6.5, b.x, b.z);
    // kurtarış
    if (out === 'save') {
      const d = Math.hypot(b.x - gk.x, b.z - gk.z);
      if (d < 1.6 && b.y < 2.5) {
        b.shot = null; b.owner = gk.id; b.lastTeam = team; b.vx = b.vy = b.vz = 0; gk.holdT = 0;
        this.emit({ type: 'save', team });
      }
    }
  }

  ballPhysics() {
    const b = this.ball;
    const onGround = b.y <= BALL_R + 0.005 && Math.abs(b.vy) < 0.01;
    if (!onGround) { b.vy -= G * DT; b.vx *= 0.999; b.vz *= 0.999; }
    b.x += b.vx * DT; b.y += b.vy * DT; b.z += b.vz * DT;
    if (b.y < BALL_R) {
      b.y = BALL_R;
      if (b.vy < -1.6) { b.vy = -b.vy * 0.5; b.vx *= 0.9; b.vz *= 0.9; } else b.vy = 0;
    }
    if (b.y <= BALL_R + 0.005 && b.vy === 0) {
      const v = Math.hypot(b.vx, b.vz);
      if (v > 0) { const nv = Math.max(0, v - ROLL_DECEL * DT); b.vx *= nv / v; b.vz *= nv / v; }
    }
    b.spin += Math.hypot(b.vx, b.vz) * DT / BALL_R;
  }

  ballControl() {
    const b = this.ball;
    if (b.shot || b.y > 1.3) return;
    let best = null, bd = 1.0;
    for (const e of this.ents) {
      if (e.team > 1 || !e.active || e.kicking) continue;
      if (e.id === b.lastKicker && b.kickerCd > 0) continue;
      const d = Math.hypot(e.x - b.x, e.z - b.z);
      if (d < bd) { bd = d; best = e; }
    }
    if (best) {
      if (best.team !== b.lastTeam) this.emit({ type: 'interception', team: best.team });
      b.owner = best.id; b.lastTeam = best.team; b.intended = -1;
      best.decide = this.rng.range(0.35, 1.0);
    }
  }

  checkBoundaries() {
    const b = this.ball;
    if (b.held || b.owner >= 0 && !this.ents[b.owner].kicking && this.ents[b.owner].idx === 0) return;
    const R = BALL_R;
    // gol
    if (Math.abs(b.x) > PITCH.HL + R && Math.abs(b.z) < PITCH.GOAL_HW - R && b.y < PITCH.GOAL_H - R && this.celebrate <= 0) {
      const scoringTeam = this.dir(0) * Math.sign(b.x) > 0 ? 0 : 1;
      this.goal(scoringTeam);
      return;
    }
    if (this.celebrate > 0) {
      // ağlarda yavaşla
      if (Math.abs(b.x) > PITCH.HL + 1.8) { b.x = Math.sign(b.x) * (PITCH.HL + 1.8); b.vx = 0; b.vz *= 0.5; }
      return;
    }
    if (Math.abs(b.z) > PITCH.HW + R) {
      const team = 1 - b.lastTeam;
      this.emit({ type: 'out', kind: 'taç' });
      this.restart(team, clamp(b.x, -52, 52), Math.sign(b.z) * (PITCH.HW - 0.1), 'throw');
      return;
    }
    if (Math.abs(b.x) > PITCH.HL + R) {
      const defTeam = this.dir(0) * Math.sign(b.x) > 0 ? 1 : 0; // o kaleyi savunan takım
      if (b.lastTeam === defTeam) {
        this.emit({ type: 'out', kind: 'korner' });
        this.restart(1 - defTeam, Math.sign(b.x) * (PITCH.HL - 0.3), Math.sign(b.z || 1) * (PITCH.HW - 0.3), 'corner');
      } else {
        this.emit({ type: 'out', kind: 'aut' });
        this.restart(defTeam, Math.sign(b.x) * (PITCH.HL - 5.5), Math.sign(b.z || 1) * 3, 'goalkick');
      }
    }
  }

  goal(team, scorerId) {
    this.score[team]++;
    const b = this.ball;
    b.shot = null; b.owner = -1;
    let sc = scorerId;
    if (sc === undefined) sc = b.lastKicker >= 0 && this.ents[b.lastKicker].team === team ? b.lastKicker : this.activePlayers(team).find((e) => e.role === 'FW').id;
    this.scorer = sc;
    this.celebrate = 3.2;
    this.celebrateTeam = 1 - team;
    this.playAnim(this.ents[sc], POSE.CELEB, 70);
    this.emit({ type: 'goal', team, scorer: sc });
  }

  officialsAI() {
    const b = this.ball;
    const r = this.ents[REF];
    const pd = this.dir(this.possTeam);
    const tx = clamp(b.x - pd * 11, -45, 45), tz = clamp(b.z * 0.55 - Math.sign(b.z || 1) * 9, -27, 27);
    if (!r.anim) this.moveTo(r, tx, tz, 6, b.x, b.z);
    this.arStep(this.ents[AR1], 1);
    this.arStep(this.ents[AR2], -1);
  }
  arStep(ar, side) {
    // side=+1: x>0 yarısı ve z=+34.9 çizgisi
    const defTeam = this.dir(0) === side ? 1 : 0;
    const xs = this.activePlayers(defTeam).map((e) => e.x * side).sort((a, c) => c - a);
    const line = Math.max(xs[1] !== undefined ? xs[1] : 0, this.ball.x * side);
    const tx = side * clamp(line, 0, PITCH.HL), tz = side * (PITCH.HW + 0.9);
    if (!ar.anim) {
      this.moveTo(ar, tx, tz, 7);
      if (ar.sp < 1.5) ar.h = turnToward(ar.h, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0.2);
    }
  }

  // ---------------- senaryo kipi ----------------
  startScript(sc) {
    this.mode = 'script';
    this.sc = sc; this.sf = 0;
    this.setPiece = null; this.celebrate = 0;
    const b = this.ball;
    b.owner = -1; b.shot = null; b.held = false; b.intended = -1;
    // izlenen oyuncular ilk kareye
    for (const [id, tr] of sc.tracks) {
      const e = this.ents[id];
      tr.get(0, e); e.vx = e.vz = 0; e.anim = null;
    }
    // diğerleri: topun ilk konumuna göre dizilime ışınla
    for (const e of this.ents) {
      if (sc.tracks.has(e.id) || !e.active) continue;
      e.anim = null; e.pose = POSE.LOCO; e.pt = 0; e.p1 = e.p2 = e.p3 = 0; e.kicking = null;
      if (e.team > 1) continue;
      const [wx, wz] = this.shadowTarget(e, 0);
      this.place(e, wx, wz, Math.atan2(sc.bz[0] - wz, sc.bx[0] - wx));
    }
    const r = this.ents[REF];
    if (!sc.tracks.has(REF)) this.place(r, sc.bx[0] - sc.dir * 12, clamp(sc.bz[0] * 0.5 - 9, -27, 27));
    this.stepScriptBall(0);
  }

  shadowTarget(e, f) {
    const sc = this.sc;
    const attack = sc.attackTeam;
    const [bX, bZ] = this.rel(e.team, sc.bx[f], sc.bz[f]);
    let [tX, tZ] = formationTarget(e.idx, bX, bZ, e.team === attack, [0, 0]);
    let [wx, wz] = this.world(e.team, tX, tZ);
    if (sc.constrain) [wx, wz] = sc.constrain(e, wx, wz, f);
    // kilit oyunculardan uzak dur
    for (const id of sc.keep || []) {
      const t = sc.tracks.get(id);
      if (!t) continue;
      const dx = wx - t.x[f], dz = wz - t.z[f], d = Math.hypot(dx, dz);
      const R = sc.keepR || 4;
      if (d < R) { const k = R / (d || 1); wx = t.x[f] + dx * k; wz = t.z[f] + dz * k; }
    }
    return [clamp(wx, -52, 52), clamp(wz, -33.5, 33.5)];
  }

  stepScriptBall(f) {
    const b = this.ball, sc = this.sc;
    const nx = sc.bx[f], ny = sc.by[f], nz = sc.bz[f];
    b.spin += Math.hypot(nx - b.x, nz - b.z) / BALL_R;
    b.x = nx; b.y = ny; b.z = nz;
  }

  stepScript() {
    const sc = this.sc;
    const f = Math.min(this.sf, sc.n - 1);
    for (const [id, tr] of sc.tracks) {
      const e = this.ents[id];
      const px = e.x, pz = e.z;
      tr.get(f, e);
      e.vx = (e.x - px) / DT; e.vz = (e.z - pz) / DT;
    }
    for (const e of this.ents) {
      if (sc.tracks.has(e.id) || !e.active) continue;
      if (e.team <= 1) {
        const [wx, wz] = this.shadowTarget(e, f);
        this.moveTo(e, wx, wz, e.idx === 0 ? 4 : 5.5, sc.bx[f], sc.bz[f]);
      }
    }
    if (!sc.tracks.has(REF)) {
      const r = this.ents[REF];
      const tx = clamp(sc.bx[f] - sc.dir * 12, -45, 45), tz = clamp(sc.bz[f] * 0.5 - Math.sign(sc.bz[f] || 1) * 9, -27, 27);
      this.moveTo(r, tx, tz, 6, sc.bx[f], sc.bz[f]);
    }
    for (const ar of [AR1, AR2]) if (!sc.tracks.has(ar)) this.arStep(this.ents[ar], ar === AR1 ? 1 : -1);
    // poz bindirmeleri (ör. yan hakem bayrağı, hakem kartı)
    for (const e of this.ents) if (!sc.tracks.has(e.id)) { if (e.pose !== POSE.HIDDEN) { e.pose = POSE.LOCO; e.pt = 0; e.p1 = e.p2 = e.p3 = 0; } }
    for (const o of sc.overlays) {
      if (f < o.f0 || f > o.f1) continue;
      const e = this.ents[o.id];
      e.pose = o.pose; e.pt = o.f1 > o.f0 ? (f - o.f0) / (o.f1 - o.f0) : 1; e.p1 = o.p1; e.p2 = o.p2; e.p3 = o.p3;
      if (o.toward) e.p1 = wrapAngle(Math.atan2(o.toward[1] - e.z, o.toward[0] - e.x) - e.h);
    }
    this.stepScriptBall(f);
    for (const ev of sc.events) if (ev.f === f) this.emit({ ...ev, script: true });
    this.sf++;
    if (this.sf >= sc.n) {
      this.mode = 'hold';
      this.emit({ type: 'scriptEnd' });
    }
  }
}

function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const l2 = dx * dx + dz * dz;
  const t = l2 > 0 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 0;
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

export { wrapAngle, ARM };
