// Maç bitiminde kayıt ve rapor ekranına geçiş
import { h } from '../dom.js';
import { ReportScreen } from './report.js';
import { recordStats } from '../../career/stats.js';
import { applyResult, TIERS } from '../../career/career.js';

export function afterMatch(app, session, ctx) {
  const save = app.save.data;
  const grade = session.grade();
  recordStats(save.stats, session, grade, ctx.mode);
  const extra = [];
  let next = ctx.next;
  if (ctx.mode === 'career' && save.career) {
    const c = save.career;
    const res = applyResult(c, grade, ctx.fixture);
    extra.push(h('div.rule', { style: { marginTop: '12px' } },
      h('p', null, h('b', null, `Kariyer: ${c.name}`), ` · İtibar ${c.rep} (${res.repDelta >= 0 ? '+' : ''}${res.repDelta})`),
      ...res.news.map((n) => h('p', null, '📰 ' + n)),
      c.finished ? null : h('p.muted', null, `Klasman: ${TIERS[c.tier].name}`),
    ));
  }
  if (ctx.mode === 'daily') {
    const k = session.cfg.dateKey;
    const d = (save.daily[k] = save.daily[k] || { best: 0, plays: 0 });
    d.plays++;
    const score = Math.round(session.results.reduce((s, r) => s + r.ev.total, 0));
    const isBest = score > d.best;
    if (isBest) d.best = score;
    extra.push(h('div.rule', { style: { marginTop: '12px' } }, h('p', null, h('b', null, `Günlük skor: ${score} puan`), isBest ? ' — YENİ REKOR! 🎉' : ` (rekorun: ${d.best})`)));
  }
  app.persist();
  app.show(new ReportScreen(app, session, { mode: ctx.mode, extra, next, nextLabel: ctx.nextLabel }));
}
