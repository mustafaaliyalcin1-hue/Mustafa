// Pozisyon Antrenmanı: tek tür, süre yok, anında geri bildirim, sınırsız tekrar.
import { h } from '../dom.js';
import { page, optGroup } from './common.js';
import { trainingConfig } from '../../game/flows.js';
import { MatchSession } from '../../game/session.js';
import { TYPE_KEYS } from '../../sim/scenarios/index.js';
import { TYPE_INFO } from '../../var/protocol.js';
import { TYPE_LESSONS } from '../../data/rules.js';
import { VarView } from '../varview.js';
import { recordTraining } from '../../career/stats.js';

export class TrainingScreen {
  constructor(app) {
    this.app = app;
    this.diff = 'orta';
    const tb = app.save.data.stats.byType;
    const cards = TYPE_KEYS.map((k) => {
      const st = tb['train_' + k];
      return h('div.card', null,
        h('h3', null, `${TYPE_INFO[k].icon} ${TYPE_INFO[k].name}`),
        h('p.muted', { style: { fontSize: '13px', minHeight: '54px' } }, TYPE_LESSONS[k]),
        h('div.row', null,
          h('span.chip', null, st ? `${st.ok}/${st.n} doğru` : 'Henüz denenmedi'),
          h('div.grow'),
          h('button.btn.primary', { onclick: () => startTraining(app, k, this.diff) }, 'Çalış ▶')),
      );
    });
    const body = h('div', null,
      h('div.row.wrap', { style: { marginBottom: '10px' } }, h('b', null, 'Zorluk:'), optGroup([{ value: 'kolay', label: 'Kolay' }, { value: 'orta', label: 'Orta' }, { value: 'zor', label: 'Zor' }], this.diff, (v) => (this.diff = v))),
      h('p.muted', null, 'Süre sınırı yok. Kararını verdiğin anda doğru cevap, ölçümler ve kural açıklaması gösterilir. “Yeni pozisyon” ile aynı türden sınırsız tekrar yapabilirsin.'),
      h('div.grid3', null, ...cards),
    );
    this.el = page(app, 'Pozisyon Antrenmanı', body);
  }
}

/** Tek pozisyonlu antrenman / eğitim ekranı. guide: rehber adımları (eğitim maçı için) */
export function startTraining(app, type, diff, extra = {}) {
  const cfg = trainingConfig(type, diff, extra.seed);
  const session = new MatchSession(cfg);
  app.world.setTeams({ kits: session.kits, squads: session.squads });
  const inc = session.prepareSingle(type);
  const back = extra.onExit || (() => app.show(new TrainingScreen(app)));
  const scr = {
    enter() { app.audio.setRoom(true); app.audio.setCrowd(0.2); },
    exit() { scr.vv.destroy(); app.audio.setRoom(false); },
    update(dt) { scr.vv.update(dt); },
    render(g) { scr.vv.render(g); },
    onKey(e) { scr.vv.onKey(e); },
  };
  scr.vv = new VarView(app, session, inc, {
    training: true,
    guide: extra.guide,
    onNext: extra.onNext || (() => startTraining(app, type, diff)),
    nextLabel: extra.nextLabel,
    onExit: back,
    onTrainingResult: (res) => {
      recordTraining(app.save.data.stats, inc, res.ev);
      app.persist();
      if (extra.onResult) extra.onResult(res);
    },
  });
  scr.el = scr.vv.el;
  app.show(scr);
  return scr;
}
