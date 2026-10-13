// Metin yardımcıları (Türkçe + İngilizce): küçültme, temizleme, heceleme, benzerlik.

export const VOWELS = "aeıioöuü";

export const lower = (s, lang = "tr") => String(s).toLocaleLowerCase(lang === "en" ? "en-US" : "tr-TR");

// Ses tanıma sayıları rakamla yazabilir ("3"); kelimeye çevir.
const NUMBERS = {
  tr: ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on",
    "on bir", "on iki", "on üç", "on dört", "on beş", "on altı", "on yedi", "on sekiz", "on dokuz", "yirmi"],
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"],
};

// Noktalama ve kesme işaretlerini temizler; şapkalı harfleri sadeleştirir.
// "Ali'nin" → "alinin", "I'm" → "im" (ses tanıma da kesme işaretini farklı yazabilir).
export function normalize(s, lang = "tr") {
  return lower(s, lang)
    .replace(/\d+/g, (n) => ` ${NUMBERS[lang]?.[+n] ?? n} `)
    .replace(/['’`]/g, "")
    .replace(/[âîû]/g, (c) => ({ â: "a", î: "i", û: "u" })[c])
    .replace(/[^a-zçğıöşü\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const words = (s, lang = "tr") => normalize(s, lang).split(" ").filter(Boolean);

// Türkçe hece kuralı: iki ünlü arasındaki son ünsüz bir sonraki heceye geçer.
// araba → a-ra-ba, kaplumbağa → kap-lum-ba-ğa, Türkçe → Türk-çe
export function syllabify(word) {
  const w = lower(word);
  const v = [];
  for (let i = 0; i < w.length; i++) if (VOWELS.includes(w[i])) v.push(i);
  if (v.length < 2) return [word];
  const cuts = [];
  for (let k = 0; k < v.length - 1; k++) {
    const gap = v[k + 1] - v[k] - 1;
    cuts.push(gap === 0 ? v[k + 1] : v[k + 1] - 1);
  }
  const out = [];
  let start = 0;
  for (const c of cuts) { out.push(word.slice(start, c)); start = c; }
  out.push(word.slice(start));
  return out;
}

function editTable(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d;
}

export const levenshtein = (a, b) => editTable(a, b)[a.length][b.length];

export const similarity = (a, b) =>
  a === b ? 1 : 1 - levenshtein(a, b) / Math.max(a.length, b.length, 1);

// Harf düzeyinde hizalama: beklenen her ses için ne duyuldu?
// Döner: [{ want: "ü", got: "u", at: 1 }, { want: "r", got: "", at: 1 }]  (got "" = ses atlandı, at = beklenen kelimedeki sıra)
export function charConfusions(expected, heard) {
  const d = editTable(expected, heard);
  const out = [];
  let i = expected.length, j = heard.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1)) {
      if (expected[i - 1] !== heard[j - 1]) out.push({ want: expected[i - 1], got: heard[j - 1], at: i - 1 });
      i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      out.push({ want: expected[i - 1], got: "", at: i - 1 });
      i--;
    } else {
      j--; // fazladan söylenen ses
    }
  }
  return out.reverse();
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
