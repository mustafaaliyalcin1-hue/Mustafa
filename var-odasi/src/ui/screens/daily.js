// Günlük Zorluk: tarihe göre tohumlanmış sabit 5 pozisyon
import { h } from '../dom.js';
import { page } from './common.js';
import { dailyConfig, startMatch } from '../../game/flows.js';
import { todayKey } from '../../core/util.js';
import { afterMatch } from './post.js';

export class DailyScreen {
  constructor(app) {
    this.app = app;
    const key = todayKey();
    const cfg = dailyConfig(app, key);
    const d = app.save.data.daily[key];
    const past = Object.entries(app.save.data.daily).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 10);
    const body = h('div.grid2', null,
      h('div.card', null,
        h('h3', null, `📅 ${key}`),
        h('p', null, `${cfg.home.name} — ${cfg.away.name}`),
        h('p.muted', null, 'Bugünün maçı herkes için aynı: aynı takımlar, aynı 5 kritik pozisyon, aynı hakem hataları. Kendi rekorunu geçmeye çalış!'),
        h('div.row', null, h('span.chip.green', null, d ? `Rekorun: ${d.best} puan` : 'Bugün henüz oynamadın'), d ? h('span.chip', null, `${d.plays} deneme`) : null),
        h('button.btn.primary', { style: { width: '100%', marginTop: '14px', height: '56px', fontSize: '18px' }, onclick: () => this.start(key) }, '▶ Günün maçını oyna'),
      ),
      h('div.card', null,
        h('h3', null, 'Geçmiş günler'),
        past.length ? h('div.news', null, ...past.map(([k, v]) => h('div', null, `${k} — en iyi: ${v.best} puan (${v.plays} deneme)`))) : h('p.muted', null, 'Henüz kayıt yok.'),
        h('p.muted', { style: { fontSize: '12px' } }, 'Puan: her pozisyon için doğruluk + süre + hassasiyet (en fazla 140).'),
      ),
    );
    this.el = page(app, 'Günlük Zorluk', body);
  }
  start(key) {
    const app = this.app;
    const cfg = dailyConfig(app, key);
    startMatch(app, cfg, { mode: 'daily', onFinish: (s) => afterMatch(app, s, { mode: 'daily', next: () => app.show(new DailyScreen(app)), nextLabel: 'Günlük ekrana dön' }) });
  }
}
