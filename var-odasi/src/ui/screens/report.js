// Maç sonu: resmi rapor, TV yorum programı ve sosyal medya akışı.
import { h, clear } from '../dom.js';
import { page } from './common.js';
import { TYPE_INFO, VERDICTS, fieldLabel, outcomeLabel } from '../../var/protocol.js';
import { explain } from '../../data/rules.js';
import { CAMS } from '../../replay/cameras.js';
import { fmtMinute } from '../../core/util.js';
import { PUNDITS, PUNDIT_LINES, PUNDIT_INCIDENT, HANDLES, TWEETS, TWEETS_GENERAL } from '../../data/texts.js';
import { RNG, hashString } from '../../core/rng.js';
import { VarView } from '../varview.js';

const cmTxt = (m) => (m === null || m === undefined ? '—' : `${m > 0 ? '+' : '−'}${Math.abs(m * 100).toFixed(1)} cm`);
const tier = (note) => (note >= 7.2 ? 'iyi' : note >= 5.5 ? 'orta' : 'kotu');

export class ReportScreen {
  /** ctx: { mode, extra: [DOM], next(), nextLabel } */
  constructor(app, session, ctx) {
    this.app = app; this.s = session; this.ctx = ctx;
    this.grade = session.grade();
    this.el = this.build();
  }
  enter() { this.app.audio.setRoom(false); this.app.audio.setCrowd(0.15); }

  build() {
    const s = this.s, g = this.grade;
    const P = (id) => s.players(id);
    const gcls = g.note >= 7 ? '' : g.note >= 5.5 ? '.mid' : '.bad';
    const avgT = s.results.length ? s.results.reduce((a, r) => a + r.dec.timeUsed, 0) / s.results.length : 0;
    const head = h('div.card', null,
      h('div.official', null, 'MHK · VAR PERFORMANS RAPORU · RESMİ GÖZLEMCİ DEĞERLENDİRMESİ'),
      h('div.report-head', { style: { marginTop: '10px' } },
        h('div.grade' + gcls, null, h('b', null, g.note.toFixed(1)), h('span', null, '/ 10 · ' + g.label)),
        h('div.col', { style: { gap: '4px' } },
          h('h2', { style: { margin: 0 } }, `${s.teams[0].name} ${s.sim.score[0]} - ${s.sim.score[1]} ${s.teams[1].name}`),
          h('div.muted', null, `${s.cfg.competition} · ${s.cfg.stadium || ''}`),
          h('div.muted', null, `Saha hakemi: ${s.refName} · AVAR: ${s.avarName}`),
          h('div.row.wrap', { style: { marginTop: '6px' } },
            h('span.chip.green', null, `Doğru: ${g.correct}/${g.n}`),
            g.missed ? h('span.chip.red', null, `Kaçırılan açık hata: ${g.missed}`) : null,
            g.wrong ? h('span.chip.red', null, `Hatalı müdahale: ${g.wrong}`) : null,
            h('span.chip', null, `Ort. karar süresi: ${avgT.toFixed(1)} sn`),
            h('span.chip', null, `Doğruluk %${Math.round(g.acc)}`),
          ),
        ),
      ),
      ...(this.ctx.extra || []),
    );
    const cards = s.results.map((r, i) => this.incidentCard(r, i, P));
    const btns = h('div.row.wrap', { style: { marginTop: '16px', justifyContent: 'flex-end' } },
      h('button.btn', { onclick: () => this.app.show(new StudioScreen(this.app, this.s, this)) }, '📺 TV Yorum Programı'),
      h('button.btn', { onclick: () => this.app.show(new SocialScreen(this.app, this.s, this)) }, '📱 Sosyal Medya'),
      h('button.btn.primary', { onclick: () => this.ctx.next() }, this.ctx.nextLabel || 'Devam →'),
    );
    const body = h('div.report-doc.col', null, head, ...cards, btns);
    return page(this.app, 'Maç Sonu Raporu', body, { onBack: () => this.ctx.next(), right: h('button.btn.small.primary', { onclick: () => this.ctx.next() }, this.ctx.nextLabel || 'Devam →') });
  }

  incidentCard(r, i, P) {
    const inc = r.inc, ev = r.ev, dec = r.dec, t = inc.truth;
    const V = VERDICTS[ev.verdict];
    const yourDec = dec.action === 'CHECK' ? `Kontrol tamamlandı${dec.timeout ? ' (süre doldu)' : ''}` : `${outcomeLabel(inc, dec.outcome, P)} (${dec.action === 'OFR' ? 'OFR — hakem monitörde' : 'doğrudan düzeltme'})`;
    const correct = t.gray ? `Gri alan: müdahale yok (saha kararı makul)` : ev.clearError ? `${outcomeLabel(inc, t.outcome, P)} — müdahale gerekli` : 'Müdahale yok — saha kararı doğru';
    const cams = [...(dec.camsUsed || [])].map((c) => CAMS[c].short).join(', ');
    const kv = h('div.kv', null,
      h('span', null, 'Saha kararı'), h('span', null, fieldLabel(inc, P)),
      h('span', null, 'Senin kararın'), h('span', null, yourDec),
      h('span', null, 'Doğru karar'), h('span', null, correct),
      h('span', null, 'Süre'), h('span', null, `${dec.timeUsed.toFixed(1)} sn${inc.timeLimit ? ' / ' + inc.timeLimit + ' sn' : ''}`),
      h('span', null, 'Kullanılan kameralar'), h('span', null, cams || '—'),
      h('span', null, 'Puan'), h('span', null, `Doğruluk ${ev.acc} · Süre ${ev.time} · Hassasiyet ${ev.prec}`),
    );
    let cmp = null;
    if (inc.type === 'OFSAYT') {
      const m = dec.marks || {};
      cmp = h('div.cmp', null,
        h('div', null, 'Senin çizgin', h('b', null, cmTxt(m.offsideMargin))),
        h('div', null, 'Gerçek fark', h('b', { style: { color: t.facts.marginM > 0 ? 'var(--red)' : 'var(--green)' } }, cmTxt(t.facts.marginM))),
        h('div', null, 'Ölçüm hatası', h('b', null, m.offsideMargin === null || m.offsideMargin === undefined ? '—' : `${Math.abs((m.offsideMargin - t.facts.marginM) * 100).toFixed(1)} cm`)),
        h('div', null, 'Pas karesi (sen / gerçek)', h('b', null, `${m.passFrame ?? '—'} / ${t.keyFrame}`)),
      );
    } else if (t.facts && (t.facts.contactFrame !== undefined || inc.type === 'TOP_DISARI')) {
      const m = dec.marks || {};
      const tf = inc.type === 'TOP_DISARI' ? t.facts.frame : t.facts.contactFrame;
      cmp = h('div.cmp', null,
        h('div', null, inc.type === 'TOP_DISARI' ? 'En dış kare (sen / gerçek)' : 'Temas karesi (sen / gerçek)', h('b', null, `${m.contactFrame ?? '—'} / ${tf >= 0 ? tf : 'temas yok'}`)),
        inc.type === 'TOP_DISARI' ? h('div', null, 'Topun çizgiyi geçmesi', h('b', null, cmTxt(t.facts.marginM))) : null,
        inc.type === 'PENALTI' && t.facts.contact ? h('div', null, 'Temas – çizgi mesafesi', h('b', null, `${t.facts.distLineM >= 0 ? 'içeride ' : 'dışarıda '}${Math.abs(t.facts.distLineM * 100).toFixed(1)} cm`)) : null,
      );
    }
    return h('div.card.inc-card.' + V.cls, null,
      h('div.row', null,
        h('h3', { style: { margin: 0 } }, `${i + 1}. ${TYPE_INFO[inc.type].icon} ${TYPE_INFO[inc.type].name} · ${fmtMinute(inc.minute, inc.half)}`),
        h('div.grow'),
        h('span.verdict.' + V.cls, { style: { fontSize: '15px' } }, V.text),
      ),
      kv, cmp,
      ev.notes.length ? h('div.muted', { style: { fontSize: '12.5px', margin: '4px 0 8px' } }, ev.notes.join(' · ')) : null,
      h('div.rule', null, ...explain(inc).map((p) => h('p', null, p))),
      h('div.row', { style: { marginTop: '8px' } }, h('button.btn.small', { onclick: () => this.analyze(inc) }, '🔍 Pozisyonu yeniden izle (analiz)')),
    );
  }

  analyze(inc) {
    const app = this.app;
    const back = this;
    const scr = {
      vv: null,
      enter() { app.audio.setRoom(true); },
      exit() { this.vv.destroy(); app.audio.setRoom(false); },
      update(dt) { this.vv.update(dt); },
      render(g) { this.vv.render(g); },
      onKey(e) { this.vv.onKey(e); },
    };
    scr.vv = new VarView(app, this.s, inc, { readOnly: true, onExit: () => app.show(back) });
    scr.el = scr.vv.el;
    app.show(scr);
  }
}

export class StudioScreen {
  constructor(app, session, report) {
    this.app = app; this.s = session; this.report = report;
    const g = report.grade;
    const r = new RNG(hashString('studio' + session.seed));
    const tr = tier(g.note);
    // dikkat çekici pozisyonlar: önce hatalar
    const ranked = session.results.slice().sort((a, b) => a.ev.acc - b.ev.acc);
    const lines = PUNDITS.map((p, i) => {
      const base = r.pick(PUNDIT_LINES[p.tone][tr]);
      const rr = ranked[i % Math.max(1, ranked.length)];
      let extra = '';
      if (rr) extra = ' ' + r.pick(PUNDIT_INCIDENT[rr.ev.verdict]).replace('{dk}', Math.floor(rr.inc.minute) + 1);
      return base + extra;
    });
    const tick = h('div.studio-ticker', null, h('span', null, '📺 HAKEM MASASI'), h('span', { style: { fontWeight: 500 } }, `${session.teams[0].name} ${session.sim.score[0]}-${session.sim.score[1]} ${session.teams[1].name} · VAR notu ${g.note.toFixed(1)}`));
    const set = h('div.studio-set', null, ...PUNDITS.map((p, i) => h('div.pundit', null,
      h('div.bubble', { style: { animationDelay: `${i * 0.9}s`, animationFillMode: 'backwards' } }, lines[i]),
      h('div.avatar', { style: { background: p.color } }, p.name.split(' ').map((x) => x[0]).join('')),
      h('div.desk', null, h('b', null, p.name), h('span', null, p.role)),
    )));
    this.el = h('div.screen.studio', null,
      h('div.page-head', null, h('button.btn.small', { onclick: () => app.show(report) }, '← Rapor'), h('h1', null, 'Hakem Masası — Maç Sonu Yorumları'), h('div.grow'),
        h('button.btn.small', { onclick: () => app.show(new SocialScreen(app, session, report)) }, '📱 Sosyal Medya'),
        h('button.btn.small.primary', { onclick: () => report.ctx.next() }, report.ctx.nextLabel || 'Devam →')),
      set, tick,
      h('div.muted', { style: { textAlign: 'center', fontSize: '11px', padding: '6px' } }, 'Yorumcular kurgusal karakterlerdir.'),
    );
  }
  enter() { this.app.audio.setCrowd(0.05); }
}

export class SocialScreen {
  constructor(app, session, report) {
    this.app = app;
    const r = new RNG(hashString('social' + session.seed));
    const tr = tier(report.grade.note);
    const tweets = [];
    for (const res of session.results) {
      const n = res.ev.acc >= 100 ? 1 : 2;
      for (let k = 0; k < n; k++) tweets.push(r.pick(TWEETS[res.ev.verdict]).replace('{dk}', Math.floor(res.inc.minute) + 1));
    }
    for (let k = 0; k < 3; k++) tweets.push(r.pick(TWEETS_GENERAL[tr]));
    // taraftar hesapları (kurgusal)
    for (const t of [0, 1]) {
      const mood = session.fans[t];
      const name = session.teams[t].short;
      tweets.push(mood >= 50 ? `${name} taraftarı olarak bu akşam hakemlere söyleyecek sözüm yok 💪` : `Bu akşam ${name} olarak haksızlığa uğradık bence. Kayıtlar izlensin! 😤`);
    }
    r.shuffle(tweets);
    const feed = h('div.feed', null, ...tweets.map((txt) => {
      const [handle, name] = r.pick(HANDLES);
      const col = `hsl(${r.int(0, 360)}, 60%, 60%)`;
      return h('div.card.tweet', null,
        h('div.av', { style: { background: col } }, name[0]),
        h('div', null,
          h('div.who', null, h('b', null, name), h('span.muted', null, `${handle} · ${r.int(1, 59)} dk`)),
          h('div.txt', null, txt),
          h('div.meta', null, h('span', null, `💬 ${r.int(2, 300)}`), h('span', null, `🔁 ${r.int(5, 900)}`), h('span', null, `❤ ${r.int(20, 4000)}`)),
        ));
    }));
    this.el = page(app, 'Sosyal Medya — #VARodası', h('div', null, feed, h('p.muted', { style: { textAlign: 'center', fontSize: '12px' } }, 'Tüm hesaplar ve paylaşımlar kurgusaldır.')), {
      onBack: () => app.show(report),
      right: h('button.btn.small.primary', { onclick: () => report.ctx.next() }, report.ctx.nextLabel || 'Devam →'),
    });
  }
}
