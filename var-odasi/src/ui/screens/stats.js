// İstatistikler
import { h } from '../dom.js';
import { page } from './common.js';
import { TYPE_KEYS } from '../../sim/scenarios/index.js';
import { TYPE_INFO } from '../../var/protocol.js';

export class StatsScreen {
  constructor(app) {
    const s = app.save.data.stats;
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
    const stat = (v, l) => h('div.card.stat', null, h('b', null, String(v)), h('span', null, l));
    const types = TYPE_KEYS.map((k) => {
      const m = s.byType[k] || { n: 0, ok: 0 }, t = s.byType['train_' + k] || { n: 0, ok: 0 };
      const p = pct(m.ok, m.n);
      return h('div', { style: { margin: '8px 0' } },
        h('div.row', null, h('span', null, `${TYPE_INFO[k].icon} ${TYPE_INFO[k].name}`), h('div.grow'), h('span.muted', { style: { fontSize: '12px' } }, `Maç: ${m.ok}/${m.n} · Antrenman: ${t.ok}/${t.n}`)),
        h('div.bar', null, h('i', { style: { width: p + '%', background: p >= 70 ? 'var(--green)' : p >= 45 ? 'var(--yellow)' : 'var(--red)' } })),
      );
    });
    const body = h('div.col', null,
      h('div.grid3', null,
        stat(s.matches, 'Yönetilen maç'),
        stat(s.matches ? (s.notesSum / s.matches).toFixed(2) : '—', 'Ortalama hakem notu'),
        stat(s.bestNote ? s.bestNote.toFixed(1) : '—', 'En yüksek not'),
        stat(`%${pct(s.correct, s.incidents)}`, `Doğru karar (${s.correct}/${s.incidents})`),
        stat(s.missed, 'Kaçırılan açık hata'),
        stat(s.wrong, 'Hatalı müdahale'),
        stat(s.unnecessary, 'Gereksiz müdahale (gri)'),
        stat(s.incidents ? (s.totalTime / s.incidents).toFixed(1) + ' sn' : '—', 'Ortalama karar süresi'),
        stat(s.offsideN ? (s.offsideErrSum / s.offsideN).toFixed(1) + ' cm' : '—', 'Ort. ofsayt çizgi hatası'),
        stat(s.offsideN ? `${s.framesPerfect}/${s.offsideN}` : '—', 'Tam isabet pas karesi'),
      ),
      h('div.card', null, h('h3', null, 'Pozisyon türüne göre doğruluk'), ...types),
      h('div.card', null, h('h3', null, 'Son maçlar'),
        s.history.length ? h('div.news', null, ...s.history.map((x) => h('div', null, `${new Date(x.d).toLocaleDateString('tr-TR')} · ${x.home} ${x.score[0]}-${x.score[1]} ${x.away} · not ${x.note.toFixed(1)} · ${({ quick: 'Hızlı maç', career: 'Kariyer', daily: 'Günlük', tutorial: 'Eğitim' })[x.mode] || x.mode}`))) : h('p.muted', null, 'Henüz maç yok.')),
    );
    this.el = page(app, 'İstatistikler', body);
  }
}
