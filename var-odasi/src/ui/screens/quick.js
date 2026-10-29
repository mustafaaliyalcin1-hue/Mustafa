// Hızlı Maç kurulumu
import { h } from '../dom.js';
import { page, optGroup } from './common.js';
import { quickConfig, startMatch } from '../../game/flows.js';
import { TYPE_KEYS } from '../../sim/scenarios/index.js';
import { TYPE_INFO } from '../../var/protocol.js';
import { afterMatch } from './post.js';

export class QuickScreen {
  constructor(app) {
    this.app = app;
    const o = (this.o = { diff: 'orta', n: 5, league: 'super', derby: false, types: new Set(TYPE_KEYS) });
    const typeBox = h('div.opt-group');
    const renderTypes = () => {
      typeBox.innerHTML = '';
      for (const k of TYPE_KEYS) {
        typeBox.appendChild(h('button.btn.small' + (o.types.has(k) ? '.on' : ''), {
          onclick: () => { if (o.types.has(k) && o.types.size > 1) o.types.delete(k); else o.types.add(k); renderTypes(); },
        }, `${TYPE_INFO[k].icon} ${TYPE_INFO[k].name}`));
      }
    };
    renderTypes();
    const body = h('div.grid2', null,
      h('div.card', null,
        h('h3', null, 'Zorluk'),
        optGroup([{ value: 'kolay', label: 'Kolay (120 sn)' }, { value: 'orta', label: 'Orta (90 sn)' }, { value: 'zor', label: 'Zor (60 sn)' }], o.diff, (v) => (o.diff = v)),
        h('p.muted', { style: { fontSize: '13px' } }, 'Zorluk; ofsayt farklarını (40 cm → 2 cm), gri alan sıklığını, hakemin hata oranını, AVAR’ın güvenilirliğini ve kontrol süresini belirler.'),
        h('h3', null, 'Pozisyon sayısı'),
        optGroup([4, 5, 6, 7, 8].map((n) => ({ value: n, label: String(n) })), o.n, (v) => (o.n = v)),
        h('h3', null, 'Lig'),
        optGroup([{ value: 'lig2', label: '2. Lig' }, { value: 'lig1', label: '1. Lig' }, { value: 'super', label: 'Süper Lig' }, { value: 'derbi', label: '🔥 Derbi' }], 'super', (v) => { o.derby = v === 'derbi'; o.league = v === 'derbi' ? 'super' : v; }),
      ),
      h('div.card', null,
        h('h3', null, 'Pozisyon türleri'),
        typeBox,
        h('p.muted', { style: { fontSize: '13px' } }, `Maç süresi ayarlardan değiştirilebilir (şu an ${app.settings.matchMinutes} dakika).`),
        h('button.btn.primary', { style: { width: '100%', marginTop: '10px', height: '56px', fontSize: '18px' }, onclick: () => this.start() }, '▶ Maça başla'),
      ),
    );
    this.el = page(app, 'Hızlı Maç', body);
  }
  start() {
    const app = this.app, o = this.o;
    const cfg = quickConfig(app, { diff: o.diff, n: o.n, league: o.league, derby: o.derby, types: [...o.types] });
    const menu = () => import('./menu.js').then((m) => app.show(new m.MenuScreen(app)));
    startMatch(app, cfg, { mode: 'quick', onFinish: (s) => afterMatch(app, s, { mode: 'quick', next: menu, nextLabel: 'Ana menü' }) });
  }
}
