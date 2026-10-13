// Telaffuz koçu: ses tanımanın duyduğunu hedef metinle karşılaştırır,
// hangi kelimede hangi sesin hatalı olduğunu bulur ve ipucu üretir.

import { words, similarity, charConfusions, syllabify, esc } from "./text.js";
import { tipFor } from "./tips.js";

// Sesli okunacak düz metin: emoji ve tırnakları temizler.
export const plain = (s) => s.replace(/\p{Extended_Pictographic}|\uFE0F/gu, "").replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();

// Hedef kelimeleri duyulan kelimelerle hizalar (eksik / fazla kelimeye dayanıklı).
export function alignWords(target, heard) {
  const m = target.length, n = heard.length;
  const subCost = (i, j) => (1 - similarity(target[i], heard[j])) * 1.6;
  const cost = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) cost[i][0] = i;
  for (let j = 1; j <= n; j++) cost[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      cost[i][j] = Math.min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + subCost(i - 1, j - 1));

  const res = target.map((w) => ({ word: w, heard: null, sim: 0 }));
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (Math.abs(cost[i][j] - (cost[i - 1][j - 1] + subCost(i - 1, j - 1))) < 1e-9) {
      res[i - 1].heard = heard[j - 1];
      res[i - 1].sim = similarity(target[i - 1], heard[j - 1]);
      i--; j--;
    } else if (Math.abs(cost[i][j] - (cost[i - 1][j] + 1)) < 1e-9) i--;
    else j--;
  }
  return res;
}

function scoreAlternative(target, alt) {
  const heard = words(alt);
  const aligned = alignWords(target, heard);
  const wordScore = aligned.reduce((s, a) => s + a.sim, 0) / target.length;
  // Ses tanıma bazen kelimeleri birleştirir ("kırkının da" → "kırkınında"): boşluksuz karşılaştır.
  const flatScore = similarity(target.join(""), heard.join(""));
  return { aligned, heardText: heard.join(" "), score: Math.max(wordScore, flatScore), flatScore };
}

/**
 * @param {string} targetText   Çocuğun söylemesi gereken metin
 * @param {string[]} alternatives  Ses tanımanın tahminleri (en olası önce)
 * @returns {{level:"ok"|"almost"|"close"|"bad", score:number, aligned:object[], heardText:string,
 *            tips:{word:string, html:string, speech:string}[], weakSounds:string[]} | null}
 *   ok     → tam doğru
 *   almost → doğru sayılır, küçük bir ipucu verilir
 *   close  → yaklaştı, tekrar denemeli
 *   bad    → uzak, hece hece çalışmalı
 */
export function evaluate(targetText, alternatives) {
  const target = words(targetText);
  if (!target.length || !alternatives || !alternatives.length) return null;

  let best = null;
  for (const alt of alternatives) {
    const r = scoreAlternative(target, alt);
    if (!best || r.score > best.score) best = r;
  }
  if (best.flatScore === 1) best.aligned.forEach((a) => { a.sim = 1; a.heard = a.word; });

  const tips = [];
  const weakSounds = [];
  const seen = new Set();
  for (const a of best.aligned) {
    a.status = a.sim === 1 ? "ok" : a.heard == null ? "missing" : a.sim >= 0.6 ? "close" : "bad";
    if (a.status === "close") {
      for (const c of charConfusions(a.word, a.heard)) {
        weakSounds.push(c.want);
        const key = c.want + ">" + c.got;
        const tip = tipFor(c.want, c.got);
        if (!tip || seen.has(key)) continue;
        seen.add(key);
        tips.push({
          word: a.word,
          html: `<b>${esc(a.word)}</b> → “${esc(a.heard)}” duydum. ${tip}`,
          speech: `${a.word} kelimesinde. ${plain(tip)}`,
        });
      }
    } else if (a.status === "missing") {
      tips.push({
        word: a.word,
        html: `<b>${esc(a.word)}</b> kelimesini duyamadım. Biraz daha yüksek ve tane tane söyle. 📢`,
        speech: `${a.word} kelimesini duyamadım. Biraz daha yüksek sesle söyle.`,
      });
    } else if (a.status === "bad") {
      const sy = syllabify(a.word);
      tips.push({
        word: a.word,
        html: `<b>${esc(a.word)}</b> kelimesini hecelere ayırarak dene: <b>${sy.map(esc).join(" - ")}</b>`,
        speech: `${a.word} kelimesini hece hece söyleyelim: ${sy.join(", ")}.`,
      });
    }
  }

  const allOk = best.aligned.every((a) => a.status === "ok");
  const onlyMinor = best.aligned.every((a) => a.status === "ok" || a.status === "close");
  let level;
  if (allOk) level = "ok";
  else if (onlyMinor && best.score >= 0.9) level = "almost";
  else if (best.score >= 0.6) level = "close";
  else level = "bad";

  return { level, score: best.score, aligned: best.aligned, heardText: best.heardText, tips: tips.slice(0, 3), weakSounds };
}
