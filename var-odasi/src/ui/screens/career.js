// Kariyer merkezi
import { h, modal } from '../dom.js';
import { page } from './common.js';
import { TIERS, newCareer, fixture, tierProgress, skipSuspendedWeek } from '../../career/career.js';
import { DIFFICULTIES, withDerby } from '../../data/difficulty.js';
import { startMatch } from '../../game/flows.js';
import { TYPE_KEYS } from '../../sim/scenarios/index.js';
import { afterMatch } from './post.js';

export class CareerScreen {
  constructor(app) {
    this.app = app;
    const c = app.save.data.career;
    this.el = c ? this.hub(c) : this.create();
  }

  create() {
    const app = this.app;
    const inp = h('input', { type: 'text', maxlength: 24, placeholder: 'Adın (ör. Deniz Yıldırım)', value: '' });
    const body = h('div.grid2', null,
      h('div.card', null,
        h('h3', null, '🏆 Yeni kariyer'),
        h('p', null, 'Bölgesel Amatör Lig’de VAR odasına adım at. İyi notlar ve itibarla üst liglere yüksel: 3. Lig, 2. Lig, 1. Lig, Süper Lig, derbiler, Avrupa ve sonunda Turnuva Finali.'),
        h('p.muted', null, 'Kötü performansta MHK seni görevlendirmeyebilir ya da alt lige indirebilir.'),
        inp,
        h('button.btn.primary', { style: { marginTop: '12px', width: '100%', height: '52px' }, onclick: () => {
          app.save.data.career = newCareer(inp.value.trim() || 'VAR Hakemi');
          app.persist();
          app.show(new CareerScreen(app));
        } }, 'Kariyere başla'),
      ),
      h('div.card', null, h('h3', null, 'Basamaklar'), this.ladder(null)),
    );
    return page(app, 'Kariyer', body);
  }

  ladder(c) {
    return h('div.ladder', null, ...TIERS.map((t, i) => {
      const cls = !c ? '' : i < c.tier ? '.done' : i === c.tier ? '.cur' : '.lock';
      return h('div.rung' + cls, null, h('span', null, t.icon), h('b', null, t.name), h('div.grow'),
        h('span.muted', { style: { fontSize: '12px' } }, t.key === 'final' ? 'Tek maç' : `${t.matches} maç · ort. ≥ ${t.minNote} · itibar ≥ ${t.minRep}`));
    }));
  }

  hub(c) {
    const app = this.app;
    const pr = tierProgress(c);
    const fx = c.finished ? null : fixture(c);
    const nextCard = c.finished
      ? h('div.card', null, h('h3', null, c.trophy ? '🏆 Kariyer tamamlandı — şampiyon VAR hakemi!' : 'Kariyer tamamlandı'),
        h('p', null, `${c.history.length} maç yönettin. İtibar: ${c.rep}.`),
        h('button.btn', { onclick: () => modal('Yeni kariyer', h('p', null, 'Mevcut kariyer silinip yenisi başlatılsın mı?'), [{ label: 'Vazgeç' }, { label: 'Yeni kariyer', cls: 'primary', on: () => { app.save.data.career = null; app.persist(); app.show(new CareerScreen(app)); } }]) }, 'Yeni kariyer başlat'))
      : c.suspended
        ? h('div.card', null, h('h3', null, `Hafta ${c.week} — Görevsiz`), h('p', null, 'MHK bu hafta seni görevlendirmedi. Eğitim videolarını izleyip bir sonraki haftayı bekle.'),
          h('button.btn.warn', { onclick: () => { skipSuspendedWeek(c); app.persist(); app.show(new CareerScreen(app)); } }, 'Haftayı geçir →'))
        : h('div.card', null,
          h('div.official', null, `HAFTA ${c.week} · MHK GÖREVLENDİRMESİ`),
          h('h3', { style: { marginTop: '8px' } }, `${fx.home.name} — ${fx.away.name}`),
          h('p.muted', null, `${fx.competition} · ${fx.stadium}`),
          h('p', null, `Görev: VAR · ${fx.numIncidents} kritik pozisyon bekleniyor${fx.derby ? ' · 🔥 DERBİ: daha az süre, daha gri pozisyonlar' : ''}`),
          h('button.btn.primary', { style: { width: '100%', height: '54px', fontSize: '17px' }, onclick: () => this.play(c, fx) }, '▶ Göreve git'),
        );
    const body = h('div.grid2', null,
      h('div.col', null,
        h('div.card', null,
          h('div.row', null, h('h3', { style: { margin: 0 } }, `👤 ${c.name}`), h('div.grow'), h('span.chip.green', null, `İtibar ${c.rep}/100`)),
          h('div.bar', { style: { margin: '8px 0' } }, h('i', { style: { width: c.rep + '%' } })),
          h('p.muted', { style: { fontSize: '13px' } }, c.finished ? 'Kariyer tamamlandı.' : `${pr.tier.name}: ${pr.played} maç · son ${pr.matches} maç ortalaması ${pr.avg ? pr.avg.toFixed(2) : '—'} (yükselme için ≥ ${pr.need}, itibar ≥ ${pr.needRep})`),
        ),
        nextCard,
        h('div.card', null, h('h3', null, '📰 Haberler'), h('div.news', null, ...c.news.slice(0, 8).map((n) => h('div', null, `Hafta ${n.week}: ${n.text}`)))),
      ),
      h('div.col', null,
        h('div.card', null, h('h3', null, 'Kariyer basamakları'), this.ladder(c)),
        h('div.card', null, h('h3', null, 'Son maçlar'), c.history.length ? h('div.news', null, ...c.history.slice(-8).reverse().map((x) => h('div', null, `H${x.week} · ${x.home} – ${x.away} · not ${x.note.toFixed(1)}`))) : h('p.muted', null, 'Henüz maç yok.')),
      ),
    );
    return page(app, 'Kariyer', body);
  }

  play(c, fx) {
    const app = this.app;
    const tier = TIERS[c.tier];
    let diff = DIFFICULTIES[tier.diff];
    if (fx.derby) diff = withDerby(diff);
    // üst liglerde süre biraz daha kısa
    diff = { ...diff, time: Math.max(45, diff.time - Math.max(0, c.tier - 3) * 5) };
    const cfg = {
      mode: 'career', home: fx.home, away: fx.away, diff, numIncidents: fx.numIncidents, types: TYPE_KEYS,
      seed: fx.seed, matchSeconds: (app.settings.matchMinutes || 7) * 60, competition: fx.competition, stadium: fx.stadium, derby: fx.derby,
    };
    startMatch(app, cfg, { mode: 'career', onFinish: (s) => afterMatch(app, s, { mode: 'career', fixture: fx, next: () => app.show(new CareerScreen(app)), nextLabel: 'Kariyer merkezi' }) });
  }
}
