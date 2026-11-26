// Konuşan Baykuş'un önceden seslendirilecek metinlerini toplar.
// Kullanım: node scripts/ses-listesi.mjs  → metin sayısı ve toplam karakter
import { THEMES, STORIES, LETTERS, SOUND_PAIRS, PICTURE_WORDS, EXTRA_WORDS } from "../js/content.js";
import { EN_THEMES, EN_STORIES, EN_LETTERS, EN_SOUND_PAIRS } from "../js/content-en.js";
import { SOUND_TIPS, PAIR_TIPS, EN_SOUND_TIPS } from "../js/tips.js";
import { words, syllabify, lower } from "../js/text.js";
import { BODIES } from "../js/character.js";
import { audioKey, normText } from "../js/audio-key.js";

const plain = (s) => s.replace(/\p{Extended_Pictographic}|️/gu, "").replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();

export function collect() {
  const set = new Map();
  const add = (text, lang = "tr") => {
    const t = normText(text);
    if (!t || !/\p{L}/u.test(t)) return;
    set.set(audioKey(t, lang), { text: t, lang });
  };
  const trWords = new Set();
  const addTr = (t) => { add(t); words(t).forEach((w) => trWords.add(w)); };

  // Türkçe içerik
  THEMES.forEach((th) => th.items.forEach((it) => addTr(it.t)));
  STORIES.forEach((s) => s.lines.forEach((l) => addTr(typeof l === "string" ? l : l.t)));
  LETTERS.forEach((x) => { add(lower(x.l)); addTr(x.w); });
  SOUND_PAIRS.forEach((p) => p.words.flat().forEach(addTr));
  PICTURE_WORDS.forEach((x) => { addTr(x.w); add(`${x.w} demek.`); add(`Bu ${x.w} idi.`); add(`Bu ${x.w}.`); add(x.en, "en"); });
  EXTRA_WORDS.forEach(addTr);
  // Yavaş okuma: her kelime ve hecesi
  trWords.forEach((w) => { add(w); syllabify(w).forEach((s) => add(s)); });

  // Sabit cümleler
  [
    "Aferin!", "Harika!", "Süpersin!", "Mükemmel!", "Bravo!", "Çok güzel söyledin!", "Doğru!", "Süper!",
    "Bir daha dinle.", "Bir daha dene.", "Duyduğun kelime:", "Tekrar dinle.", "Tekrar dinle:", "Dikkatli dinle:",
    "Haydi Türkçe çalışalım!", "Hadi başlayalım.", "Seninle Türkçe çalışmayı çok seviyorum.", "Hadi beni giydir!", "Harika görünüyorum!",
    "Muhteşem! Hepsini ilk seferde bildin!", "Tebrikler! Bölümü bitirdin!", "Hepsini ilk seferde bildin!", "Bölümü bitirdin!",
    "Çok yaklaştın!", "Hadi birlikte deneyelim.", "Doğru söyledin.", "Küçük bir ipucu:", "Güzel çalıştın!",
    "Bu kelimeyi dinle ve yavaşça tekrar et.", "Biraz daha yüksek sesle söyle.",
  ].forEach((t) => add(t));
  BODIES.forEach((b) => add(`Ben ${b.name}!`));
  Object.values(SOUND_TIPS).forEach((t) => add(plain(t)));
  Object.values(PAIR_TIPS).forEach((t) => add(plain(t)));

  // İngilizce içerik
  const enWords = new Set();
  const addEn = (t) => { add(t, "en"); t.split(/\s+/).filter(Boolean).forEach((w) => enWords.add(w)); };
  EN_THEMES.forEach((th) => th.items.forEach((it) => addEn(it.t)));
  EN_STORIES.forEach((s) => s.lines.forEach((l) => addEn(typeof l === "string" ? l : l.t)));
  EN_LETTERS.forEach((x) => { add(x.l, "en"); addEn(x.w); add(`This is ${x.w}.`, "en"); add(`Correct! ${x.w}`, "en"); });
  EN_SOUND_PAIRS.forEach((p) => p.words.flat().forEach(addEn));
  enWords.forEach((w) => add(w, "en"));
  ["Great job!", "Well done!", "Super!", "Excellent!", "Amazing!", "Perfect!", "Correct!", "Hello! Let's learn English!"]
    .forEach((t) => add(t, "en"));
  ["Perfect! Hepsini ilk seferde bildin!", "Great job! Bölümü bitirdin!"].forEach((t) => add(t));
  Object.values(EN_SOUND_TIPS).forEach((t) => add(plain(t)));

  return [...set.entries()].map(([key, v]) => ({ key, ...v }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const list = collect();
  const chars = list.reduce((a, x) => a + x.text.length, 0);
  console.log(`${list.length} metin, ${chars} karakter`);
  console.log(`tr: ${list.filter((x) => x.lang === "tr").length}, en: ${list.filter((x) => x.lang === "en").length}`);
}
