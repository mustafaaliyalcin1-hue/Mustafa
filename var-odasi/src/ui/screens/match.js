// Canlı maç ekranı: yayın görüntüsü, skor, telsiz paneli ve VAR incelemesi.
import { h, clear, toast, modal } from '../dom.js';
import { BroadcastCam, makeCamera, placeCamera } from '../../replay/cameras.js';
import { VarView } from '../varview.js';
import { fmtMinute } from '../../core/util.js';
import { DT } from '../../sim/constants.js';
import { TYPE_INFO, fieldLabel, outcomeLabel } from '../../var/protocol.js';
import { LIVE_COMMENTS, RADIO_CHECK_DONE, RADIO_OFR, RADIO_DIRECT } from '../../data/texts.js';
import { uiRng } from '../../core/rng.js';

export class MatchScreen {
  /** ctx: { mode, onFinish(session) } */
  constructor(app, session, ctx) {
    this.app = app; this.s = session; this.ctx = ctx;
    this.cam = new BroadcastCam();
    this.replayCam = makeCamera();
    this.replayTag = h('div.replay-tag', { style: { display: 'none' } }, '⟲ TEKRAR');
    this.speed = 1;
    this.varView = null;
    this.paused = false;
    this.banner = null;
    this.bannerT = 0;
    this.tickerT = 0;
    this.build();
    this.started = false;
    this.preMatch();
  }

  build() {
    const s = this.s;
    const [k0, k1] = s.kits;
    this.scoreEl = h('div.sb-score', null, '0 - 0');
    this.minEl = h('div.sb-min', null, "1'");
    this.bug = h('div.scorebug', null,
      h('div.sb-live', null, 'CANLI'),
      h('div.sb-team', null, h('i', { style: { background: k0.shirt } }), s.teams[0].short),
      this.scoreEl,
      h('div.sb-team', null, s.teams[1].short, h('i', { style: { background: k1.shirt } })),
      this.minEl,
    );
    this.speedBtn = h('button.btn.small', { onclick: () => this.cycleSpeed(), title: 'Canlı oyunu hızlandır' }, '⏩ 1x');
    this.radioEl = h('div.radio-log');
    this.eventsEl = h('div.events-list', null, h('div.muted', null, 'Maç olayları burada görünecek.'));
    this.fanEl = h('div.fanbar');
    this.side = h('div.panel.side-panel', null,
      h('h4', null, h('span.dot'), `VAR ODASI · ${s.avarName.split(' ')[0]} (AVAR) ile`),
      this.radioEl, this.eventsEl, this.fanEl,
    );
    this.tickerText = h('span', null, s.cfg.competition + ' · ' + (s.cfg.stadium || ''));
    this.fade = h('div.fade');
    this.bannerBox = h('div');
    this.liveEl = h('div.screen.live', null,
      this.bug,
      h('div.sb-comp', null, `${s.teams[0].name} — ${s.teams[1].name} · Hakem: ${s.refName}`),
      h('div.live-tools', null,
        this.speedBtn,
        h('button.btn.small', { onclick: () => this.toggleMute(), title: 'Ses' }, '🔊'),
        h('button.btn.small', { onclick: () => this.pauseMenu(), title: 'Duraklat' }, '⏸'),
      ),
      this.side,
      h('div.ticker', null, h('span.tag', null, 'CANLI'), this.tickerText),
      this.bannerBox,
      this.replayTag,
      this.fade,
    );
    this.el = h('div.screen', null, this.liveEl);
    this.renderFans();
  }

  preMatch() {
    const s = this.s;
    const m = modal(`${s.teams[0].name} — ${s.teams[1].name}`, h('div', null,
      h('p', null, h('b', null, s.cfg.competition)),
      h('p.muted', null, `${s.cfg.stadium || ''} · Hakem: ${s.refName} · AVAR: ${s.avarName}`),
      h('p', null, `Bu maçta VAR odasındasın. Maç hızlandırılmış oynanacak; kritik pozisyonlarda inceleme ekranı açılacak.`),
      h('p.muted', null, `Kontrol süresi: ${s.cfg.noTimer ? 'sınırsız' : s.cfg.diff.time + ' sn'} · Zorluk: ${s.cfg.diff.name}${s.cfg.derby ? ' · DERBİ' : ''}`),
      h('p.muted', { style: { fontSize: '12px' } }, 'Kararların maç sonunda açıklanacak. Unutma: Yalnızca açık ve net hatada müdahale et.'),
    ), [{ label: 'Görevi başlat', cls: 'primary', on: () => { this.started = true; this.s.start(); this.app.audio.setCrowd(0.4); } }]);
    m.classList.add('pre');
  }

  enter() { this.app.audio.setRoom(false); this.app.audio.setCrowd(0.35); }
  exit() { if (this.varView) this.varView.destroy(); document.querySelectorAll('.modal-wrap').forEach((m) => m.remove()); }

  cycleSpeed() {
    this.speed = this.speed === 1 ? 2 : this.speed === 2 ? 4 : 1;
    this.speedBtn.textContent = `⏩ ${this.speed}x`;
  }
  toggleMute() {
    const st = this.app.settings;
    st.muted = !st.muted;
    this.app.audio.applyVolumes();
    this.app.persist();
    toast(st.muted ? 'Ses kapalı' : 'Ses açık');
  }
  pauseMenu() {
    if (this.paused) return;
    this.paused = true;
    modal('Duraklatıldı', h('p.muted', null, 'Maçı terk edersen bu maç kaydedilmez.'), [
      { label: 'Maçı terk et', cls: 'danger', on: () => { this.paused = false; import('./menu.js').then((m) => this.app.show(new m.MenuScreen(this.app))); } },
      { label: 'Devam', cls: 'primary', on: () => { this.paused = false; } },
    ]);
  }

  addRadio(cls, who, text) {
    const m = h('div.rmsg.' + cls, null, h('b', null, who), text);
    this.radioEl.appendChild(m);
    while (this.radioEl.children.length > 30) this.radioEl.firstChild.remove();
    this.radioEl.scrollTop = this.radioEl.scrollHeight;
  }
  renderEvents() {
    const ev = this.s.events;
    clear(this.eventsEl);
    if (!ev.length) { this.eventsEl.appendChild(h('div.muted', null, 'Henüz olay yok.')); return; }
    for (const e of ev.slice().reverse()) {
      const ic = e.kind === 'goal' ? '⚽' : e.kind === 'card' ? (e.text.includes('Kırmızı') || e.text.includes('kırmızı') ? '🟥' : '🟨') : e.kind === 'var' ? '📺' : '•';
      this.eventsEl.appendChild(h('div', null, `${fmtMinute(e.minute, e.half)} ${ic} ${this.s.teams[e.team].short}: ${e.text}`));
    }
  }
  renderFans() {
    const f = this.s.fans;
    clear(this.fanEl);
    this.fanEl.append('TRİBÜN NABZI', h('div.bars', null, ...[0, 1].map((t) => h('div', null,
      h('div', { style: { fontSize: '10px' } }, `${this.s.teams[t].short} ${f[t] >= 60 ? '😃' : f[t] >= 40 ? '😐' : f[t] >= 20 ? '😠' : '🤬'}`),
      h('div.bar', null, h('i', { style: { width: f[t] + '%', background: f[t] >= 40 ? 'var(--green)' : 'var(--red)' } }))))));
  }

  showBanner(cls, text, sub, dur = 2.2) {
    clear(this.bannerBox);
    this.bannerBox.appendChild(h('div.banner.' + cls, null, text, sub ? h('small', null, sub) : null));
    this.bannerT = dur;
  }

  handle(ev) {
    const a = this.app.audio, s = this.s;
    switch (ev.type) {
      case 'whistle': a.whistle(ev.long, ev.triple); break;
      case 'whistleShort': a.whistle(false); break;
      case 'kick': a.kick(ev.power || 15); break;
      case 'shot': a.setCrowd(0.7); break;
      case 'save': a.groan(); this.addRadio('sys', 'SAHA', 'Kaleci kurtardı!'); break;
      case 'goal':
        a.roar(1);
        if (this.app.gamepad) this.app.gamepad.rumble(400, 0.8);
        this.showBanner('goal', 'GOL!', `${s.teams[ev.team].name}${ev.scorer !== undefined ? ' · ' + s.players(ev.scorer).name : ''}${ev.pending ? ' · VAR kontrolü bekleniyor' : ''}`, 2.5);
        this.renderEvents();
        break;
      case 'goalNoFlag': a.roar(0.6); break;
      case 'flag': a.groan(); this.addRadio('ref', 'YAN HAKEM', 'Bayrak kalktı!'); break;
      case 'card': a.whistle(false); break;
      case 'crowd': a.groan(); break;
      case 'cut': this.fade.classList.add('on'); setTimeout(() => this.fade.classList.remove('on'), 330); break;
      case 'text': this.tickerText.textContent = ev.text; break;
      case 'halftime':
        this.showBanner('field', 'DEVRE ARASI', `${s.teams[0].short} ${s.sim.score[0]} - ${s.sim.score[1]} ${s.teams[1].short}`, 3.5);
        setTimeout(() => this.s.continueSecondHalf(), 3600);
        break;
      case 'fulltime':
        this.showBanner('field', 'MAÇ SONU', `${s.teams[0].short} ${s.sim.score[0]} - ${s.sim.score[1]} ${s.teams[1].short}`, 3.5);
        setTimeout(() => this.finish(), 3200);
        break;
      case 'incidentLive':
        this.tickerText.textContent = uiRng.pick(LIVE_COMMENTS);
        break;
      case 'fieldDecision': {
        const inc = ev.inc;
        this.showBanner('field', 'SAHA KARARI', fieldLabel(inc, (id) => s.players(id)), 2.2);
        a.setCrowd(0.85);
        break;
      }
      case 'review':
        this.openVar(ev.inc);
        break;
      case 'resumed':
        this.renderEvents(); this.renderFans();
        break;
      default: break;
    }
  }

  openVar(inc) {
    const a = this.app.audio;
    a.radio('in');
    this.addRadio('sys', 'VAR', `${TYPE_INFO[inc.type].name} — kontrol başladı.`);
    this.showBanner('var', 'VAR KONTROLÜ', TYPE_INFO[inc.type].name, 1.4);
    setTimeout(() => {
      this.varView = new VarView(this.app, this.s, inc, { onDecision: (dec) => this.onDecision(inc, dec) });
      this.el.appendChild(this.varView.el);
      a.setRoom(true);
    }, 900);
  }

  onDecision(inc, dec) {
    const s = this.s, a = this.app.audio, vv = this.varView;
    s.submitDecision(dec);
    const P = (id) => s.players(id);
    let text, sub, kind = 'plain';
    if (dec.action === 'CHECK') { text = 'KONTROL TAMAMLANDI'; sub = `Saha kararı geçerli: ${fieldLabel(inc, P)}`; a.radio('out'); this.addRadio('ref', 'HAKEM', dec.timeout ? 'Süre doldu, devam!' : uiRng.pick(RADIO_CHECK_DONE)); }
    else if (dec.action === 'OFR') { kind = 'ofr'; text = 'SAHADA İNCELEME'; sub = `Hakem monitöre gidiyor… Öneri: ${outcomeLabel(inc, dec.outcome, P)}`; a.radio('out'); this.addRadio('ref', 'HAKEM', uiRng.pick(RADIO_OFR)); }
    else { text = 'KARAR DÜZELTİLDİ'; sub = outcomeLabel(inc, dec.outcome, P); a.radio('out'); this.addRadio('ref', 'HAKEM', uiRng.pick(RADIO_DIRECT)); }
    vv.showOverlay(kind, text, sub);
    setTimeout(() => {
      if (dec.action === 'OFR') { vv.viewsEl.lastChild.remove(); vv.showOverlay('plain', 'NİHAİ KARAR', outcomeLabel(inc, dec.outcome, P)); a.whistle(false); }
    }, 1700);
    setTimeout(() => {
      vv.destroy();
      vv.el.remove();
      this.varView = null;
      a.setRoom(false);
      a.setCrowd(0.6);
      this.addRadio('sys', 'VAR', 'İnceleme kapandı. Karar maç sonunda değerlendirilecek.');
    }, dec.action === 'OFR' ? 3000 : 1900);
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.ctx.onFinish(this.s);
  }

  onKey(e) {
    if (this.varView) { this.varView.onKey(e); return; }
    if (e.key === 'Escape') this.pauseMenu();
    if (e.key === 'f' || e.key === 'F') this.cycleSpeed();
  }

  update(dt) {
    const s = this.s;
    if (this.varView) { this.varView.update(dt); }
    else if (this.started && !this.paused) s.update(dt, this.speed);
    for (const ev of s.out) this.handle(ev);
    s.out.length = 0;
    const sim = s.sim;
    this.scoreEl.textContent = `${sim.score[0]} - ${sim.score[1]}`;
    this.minEl.textContent = fmtMinute(sim.minute, sim.half);
    const st = this.varView || s.state === 'review' ? 'VAR KONTROLÜ' : s.state === 'aftermath' ? 'İNCELENİYOR' : s.state === 'halftime' ? 'DEVRE ARASI' : s.state === 'ended' ? 'MAÇ SONU' : '';
    this.app.world.setScoreboard(`${sim.score[0]} - ${sim.score[1]}`, fmtMinute(sim.minute, sim.half), st);
    if (this.bannerT > 0) { this.bannerT -= dt; if (this.bannerT <= 0) clear(this.bannerBox); }
    this.tickerT += dt;
    if (this.tickerT > 14 && s.state === 'live') { this.tickerT = 0; this.tickerText.textContent = uiRng.pick(LIVE_COMMENTS); }
    // tribün sesi
    if (!this.varView) this.app.audio.setCrowd(s.state === 'scenario' ? 0.55 : 0.38);
  }

  render(g, dt) {
    if (this.varView) { this.varView.render(g); return; }
    const rec = this.s.rec;
    const inc = this.s.cur;
    const replay = this.s.state === 'aftermath' && inc && inc.truth;
    this.replayTag.style.display = replay ? '' : 'none';
    if (replay) {
      // saha kararı açıklanırken kritik anın yavaş çekim tekrarı
      const k = inc.segStart + inc.truth.keyFrame;
      const f = Math.min(inc.segEnd, Math.max(inc.segStart, k - 35 + this.s.timer * 18));
      this.app.world.apply((i, out) => rec.sampleEnt(f, i, out), () => rec.sampleBall(f));
      const a = rec.ent(Math.round(f), inc.focus, {}), b = rec.ball(Math.round(f));
      const m = inc.meta || {};
      const other = [m.defender, m.offender, m.attacker, m.lineDefender].find((x) => x !== undefined && x !== null && x !== inc.focus);
      let pair = null;
      if (other !== undefined) { const o = rec.ent(Math.round(f), other, {}); pair = [o.x - a.x, o.z - a.z]; }
      placeCamera(this.replayCam, inc.type === 'OFSAYT' || inc.type === 'TOP_DISARI' ? 4 : 5, { ball: b, focus: [a.x, 0.9, a.z], dir: inc.dir, lineX: null, lineKind: inc.line === 'goal' ? 'goal' : null, ballRaw: b, pair }, g.w / g.h);
      if (inc.type !== 'OFSAYT' && inc.type !== 'TOP_DISARI') this.replayCam.fov = 16;
      this.replayCam.clearViewOffset(); this.replayCam.updateProjectionMatrix();
      g.renderView(this.replayCam, { x: 0, y: 0, w: g.w, h: g.h });
      return;
    }
    const f = Math.max(0, rec.count - 2 + Math.min(1, (this.s.acc || 0) / DT));
    this.app.world.apply((i, out) => rec.sampleEnt(f, i, out), () => rec.sampleBall(f));
    this.app.world.setCrowd(this.app.time, this.bannerT > 0 && this.bannerBox.querySelector('.goal') ? 1 : 0.05);
    const b = rec.sampleBall(f);
    this.cam.update(b, dt, g.w / g.h, this.s.state === 'aftermath');
    g.renderView(this.cam.cam, { x: 0, y: 0, w: g.w, h: g.h });
  }
}
