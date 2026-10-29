// İstatistik biriktirme
export function recordStats(stats, session, grade, mode) {
  stats.matches++;
  stats.notesSum += grade.note;
  stats.bestNote = Math.max(stats.bestNote, grade.note);
  for (const r of session.results) {
    const t = r.inc.type;
    stats.incidents++;
    const ok = r.ev.acc >= 100;
    if (ok) stats.correct++;
    if (r.ev.verdict === 'kacirilan') stats.missed++;
    if (r.ev.verdict === 'yanlis_mudahale' || r.ev.verdict === 'yanlis_duzeltme') stats.wrong++;
    if (r.ev.verdict === 'gereksiz_gri') stats.unnecessary++;
    stats.totalTime += r.dec.timeUsed || 0;
    const bt = (stats.byType[t] = stats.byType[t] || { n: 0, ok: 0 });
    bt.n++; if (ok) bt.ok++;
    if (t === 'OFSAYT' && r.dec.marks && r.dec.marks.offsideMargin !== undefined && r.dec.marks.offsideMargin !== null) {
      stats.offsideErrSum += Math.abs(r.dec.marks.offsideMargin - r.inc.truth.facts.marginM) * 100;
      stats.offsideN++;
      if (r.dec.marks.passFrame === r.inc.truth.keyFrame) stats.framesPerfect++;
    }
  }
  stats.history.unshift({ d: Date.now(), mode, note: grade.note, home: session.teams[0].short, away: session.teams[1].short, score: session.sim.score.slice() });
  stats.history = stats.history.slice(0, 30);
}

export function recordTraining(stats, inc, ev) {
  const t = inc.type;
  const key = 'train_' + t;
  const bt = (stats.byType[key] = stats.byType[key] || { n: 0, ok: 0 });
  bt.n++; if (ev.acc >= 100) bt.ok++;
}
