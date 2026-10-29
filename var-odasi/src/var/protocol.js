// VAR protokolü: pozisyon türleri, karar seçenekleri ve puanlama.
// İlke: VAR yalnızca "açık ve net hata" ya da "ciddi kaçırılmış olay" varsa müdahale eder.
// Gri alandaki (yoruma açık) pozisyonlarda saha kararı makulse müdahale etmemek doğrudur.
// Olgusal kararlarda (ofsayt, top dışarı, kimlik, faulün yeri) ölçülen gerçek esas alınır.

export const TYPE_INFO = {
  OFSAYT: {
    name: 'Ofsayt şüpheli gol', icon: '🚩', factual: true,
    outcomes: { GOAL: 'Gol geçerli', OFFSIDE: 'Ofsayt — gol iptal' },
    field: { GOAL: 'GOL (bayrak kalkmadı)', OFFSIDE: 'OFSAYT (yan hakem bayrak kaldırdı)' },
    tools: ['offside'],
  },
  PENALTI: {
    name: 'Penaltı şüphesi', icon: '⚠️', factual: false,
    outcomes: { PEN: 'Penaltı', NOFOUL: 'Penaltı yok — oyun devam', DIVE: 'Penaltı yok + simülasyon sarı kartı', FK: 'Faul ceza sahası dışında — serbest vuruş' },
    field: { PEN: 'PENALTI', NOFOUL: 'DEVAM (faul yok)', FK: 'SERBEST VURUŞ (ceza sahası dışı)' },
    tools: ['contact', 'box'],
  },
  ELLE: {
    name: 'Elle oynama şüphesi', icon: '✋', factual: false,
    outcomes: { PEN: 'Elle oynama — penaltı', NOFOUL: 'Elle oynama yok — devam' },
    field: { PEN: 'PENALTI (elle oynama)', NOFOUL: 'DEVAM (elle oynama yok)' },
    tools: ['contact', 'box'],
  },
  KIRMIZI: {
    name: 'Kırmızı kart şüphesi', icon: '🟥', factual: false,
    outcomes: { RED: 'Direkt kırmızı kart', NORED: 'Kırmızı kart yok (sarı kart yeterli)' },
    field: { RED: 'KIRMIZI KART', NORED: 'SARI KART' },
    tools: ['contact'],
  },
  FAUL_GOL: {
    name: 'Gol öncesi faul şüphesi', icon: '⚽', factual: false,
    outcomes: { GOAL: 'Gol geçerli', NOGOAL_FOUL: 'Atakta faul var — gol iptal' },
    field: { GOAL: 'GOL' },
    tools: ['contact', 'app'],
  },
  KIMLIK: {
    name: 'Kart kimlik kontrolü', icon: '🪪', factual: true,
    outcomes: { CONFIRM: 'Kart doğru oyuncuya gösterildi' },
    field: { CONFIRM: 'SARI KART' },
    tools: ['contact'],
  },
  TOP_DISARI: {
    name: 'Top oyun dışında mı? (gol)', icon: '📏', factual: true,
    outcomes: { GOAL: 'Gol geçerli', NOGOAL_OUT: 'Top oyun dışına çıkmıştı — gol iptal' },
    field: { GOAL: 'GOL', NOGOAL_OUT: 'GOL YOK (yan hakem: top dışarıda)' },
    tools: ['goalline'],
  },
};

export function outcomeLabel(inc, key, players) {
  if (key && key.startsWith('SW:')) {
    const id = +key.slice(3);
    const p = players ? players(id) : null;
    return p ? `Kart #${p.num} ${p.name}'e verilmeli` : 'Kart başka oyuncuya verilmeli';
  }
  return TYPE_INFO[inc.type].outcomes[key] || key;
}

export function fieldLabel(inc, players) {
  if (inc.type === 'KIMLIK') {
    const p = players ? players(inc.cardTarget) : null;
    return p ? `SARI KART → #${p.num} ${p.name}` : 'SARI KART';
  }
  if (inc.type === 'KIRMIZI') {
    const p = players ? players(inc.cardTarget) : null;
    const base = TYPE_INFO.KIRMIZI.field[inc.refDecision];
    return p ? `${base} → #${p.num} ${p.name}` : base;
  }
  return TYPE_INFO[inc.type].field[inc.refDecision] || inc.refDecision;
}

/** Oyuncuya sunulacak karar seçenekleri. */
export function decisionOptions(inc, players) {
  const f = inc.refDecision;
  const opts = { check: { action: 'CHECK', label: 'Kontrol tamamlandı — saha kararı geçerli' }, ofr: [], direct: [] };
  const L = (k) => outcomeLabel(inc, k, players);
  switch (inc.type) {
    case 'OFSAYT':
    case 'TOP_DISARI': {
      const keys = Object.keys(TYPE_INFO[inc.type].outcomes).filter((k) => k !== f);
      for (const k of keys) opts.direct.push({ action: 'DIRECT', outcome: k, label: L(k) });
      break;
    }
    case 'KIMLIK':
      for (const id of inc.candidates) if (id !== inc.cardTarget) opts.direct.push({ action: 'DIRECT', outcome: 'SW:' + id, label: L('SW:' + id) });
      break;
    case 'PENALTI':
      for (const k of ['PEN', 'NOFOUL', 'DIVE']) if (k !== f) opts.ofr.push({ action: 'OFR', outcome: k, label: L(k) });
      if (f === 'PEN') opts.direct.push({ action: 'DIRECT', outcome: 'FK', label: 'Olgusal: faul ceza sahası DIŞINDA — serbest vuruş' });
      if (f === 'FK') opts.direct.push({ action: 'DIRECT', outcome: 'PEN', label: 'Olgusal: faul ceza sahası İÇİNDE — penaltı' });
      if (f === 'FK') opts.ofr = opts.ofr.filter((o) => o.outcome !== 'PEN');
      break;
    default: {
      const keys = Object.keys(TYPE_INFO[inc.type].outcomes).filter((k) => k !== f);
      for (const k of keys) opts.ofr.push({ action: 'OFR', outcome: k, label: L(k) });
    }
  }
  return opts;
}

/** Karar sonrası nihai sonuç (oyunun gidişatı için). */
export function finalOutcome(inc, decision) {
  if (!decision || decision.action === 'CHECK') return inc.refDecision;
  return decision.outcome;
}

export const VERDICTS = {
  dogru_mudahale: { text: 'Doğru müdahale', cls: 'ok' },
  dogru_kontrol: { text: 'Doğru: müdahale gerekmiyordu', cls: 'ok' },
  gri_kontrol: { text: 'Doğru: gri alan, saha kararı korundu', cls: 'ok' },
  kismi: { text: 'Kısmen doğru düzeltme', cls: 'mid' },
  gereksiz_gri: { text: 'Gereksiz müdahale (gri alan)', cls: 'mid' },
  yanlis_mudahale: { text: 'Yanlış müdahale', cls: 'bad' },
  kacirilan: { text: 'Kaçırılan açık hata', cls: 'bad' },
  yanlis_duzeltme: { text: 'Hatalı düzeltme', cls: 'bad' },
};

/**
 * Bir pozisyonu puanla.
 * inc: { type, refDecision, truth, timeLimit, ... }
 * dec: { action, outcome, timeUsed, timeout, camsUsed:Set, marks:{passFrame, offsideMargin, contactFrame} }
 */
export function evaluateIncident(inc, dec, opts = {}) {
  const t = inc.truth;
  const field = inc.refDecision;
  const fieldOk = t.accept[field] !== undefined;
  const clearError = !t.gray && !fieldOk;
  const intervened = dec.action !== 'CHECK';
  const final = finalOutcome(inc, dec);
  const credit = t.accept[final];
  let verdict, acc;
  if (!clearError) {
    if (!intervened) { verdict = t.gray ? 'gri_kontrol' : 'dogru_kontrol'; acc = 100; }
    else if (t.gray && credit !== undefined) { verdict = 'gereksiz_gri'; acc = 40; }
    else { verdict = 'yanlis_mudahale'; acc = 0; }
  } else if (!intervened) { verdict = 'kacirilan'; acc = 0; }
  else if (credit !== undefined) { verdict = credit >= 1 ? 'dogru_mudahale' : 'kismi'; acc = Math.round(100 * credit); }
  else { verdict = 'yanlis_duzeltme'; acc = 15; }

  // süre puanı (yalnız doğruysa)
  let time = 0;
  if (!opts.noTimer && acc >= 40 && inc.timeLimit) {
    const r = Math.min(1, dec.timeUsed / inc.timeLimit);
    time = r <= 0.25 ? 20 : Math.max(0, Math.round(20 * (1 - (r - 0.25) / 0.75)));
    if (dec.timeout) time = 0;
  }
  // hassasiyet puanı
  let prec = 0;
  const notes = [];
  const m = dec.marks || {};
  const kf = t.keyFrame;
  if (inc.type === 'OFSAYT') {
    if (m.passFrame !== undefined && m.passFrame !== null) {
      const fe = Math.abs(m.passFrame - kf);
      if (fe === 0) { prec += 5; notes.push('Pas karesini tam buldun (+5)'); }
      else if (fe === 1) { prec += 2; notes.push('Pas karesi 1 kare kaydı (+2)'); }
      else notes.push(`Pas karesi ${fe} kare uzakta`);
    }
    if (m.offsideMargin !== undefined && m.offsideMargin !== null) {
      const e = Math.abs(m.offsideMargin - t.facts.marginM) * 100;
      const p = e <= 2 ? 10 : e <= 5 ? 7 : e <= 10 ? 4 : e <= 20 ? 2 : 0;
      prec += p;
      notes.push(`Çizgi farkı hatası ${e.toFixed(1)} cm (+${p})`);
    }
  } else if (m.contactFrame !== undefined && m.contactFrame !== null && t.facts && (t.facts.contactFrame >= 0 || inc.type === 'TOP_DISARI')) {
    const ref = inc.type === 'TOP_DISARI' ? t.facts.frame : t.facts.contactFrame;
    const fe = Math.abs(m.contactFrame - ref);
    const p = fe <= 1 ? 10 : fe <= 3 ? 5 : 0;
    prec += p;
    notes.push(fe <= 1 ? `Kritik kareyi buldun (+${p})` : `Kritik kareye ${fe} kare uzaktın (+${p})`);
  }
  if (dec.camsUsed && dec.camsUsed.has && dec.camsUsed.has(inc.bestCam)) { prec += 5; notes.push('En net kamerayı kullandın (+5)'); }
  // doğru prosedür
  if (clearError && intervened && credit !== undefined) {
    const factualFix = t.factual || inc.type === 'OFSAYT' || inc.type === 'TOP_DISARI' || inc.type === 'KIMLIK';
    const okProc = factualFix ? dec.action === 'DIRECT' : dec.action === 'OFR';
    if (okProc) { prec += 5; notes.push('Doğru prosedür (+5)'); }
    else notes.push(factualFix ? 'Olgusal karar doğrudan düzeltilebilirdi' : 'Yoruma dayalı kararda hakemi monitöre çağırmalıydın');
  }
  prec = Math.min(20, prec);
  return { verdict, acc, time, prec, total: acc + time + prec, clearError, intervened, final, notes };
}

/** Maç sonu hakem notu (10 üzerinden). */
export function matchGrade(results, opts = {}) {
  if (!results.length) return { note: 0, acc: 0 };
  const n = results.length;
  const acc = results.reduce((s, r) => s + r.acc, 0) / n;
  const time = results.reduce((s, r) => s + r.time, 0) / n;
  const prec = results.reduce((s, r) => s + r.prec, 0) / n;
  const missed = results.filter((r) => r.verdict === 'kacirilan').length;
  const wrong = results.filter((r) => r.verdict === 'yanlis_mudahale' || r.verdict === 'yanlis_duzeltme').length;
  const tw = opts.noTimer ? 0 : 0.13;
  let note = 10 * ((0.75 + (0.13 - tw)) * (acc / 100) + tw * (time / 20) + 0.12 * (prec / 20));
  note -= missed * 0.6 + wrong * 0.3;
  note = Math.max(1, Math.min(10, Math.round(note * 10) / 10));
  const correct = results.filter((r) => r.acc >= 100).length;
  return { note, acc, time, prec, missed, wrong, correct, n, label: gradeLabel(note) };
}

export function gradeLabel(note) {
  if (note >= 9.2) return 'Kusursuz';
  if (note >= 8.2) return 'Çok iyi';
  if (note >= 7.2) return 'İyi';
  if (note >= 6.2) return 'Yeterli';
  if (note >= 5) return 'Zayıf';
  return 'Başarısız';
}
