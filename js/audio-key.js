// Önceden seslendirilmiş dosyaların adı: metin + dil → kısa özet (uygulama ve üretim betiği aynısını kullanır).

// Noktalama ve büyük/küçük harf farkı aynı ses sayılır; yalnızca harfler ve sözcük sırası önemli.
export const normText = (s) => String(s).replace(/\s+/g, " ").trim();
const keyText = (s, lang) =>
  normText(s).toLocaleLowerCase(lang === "en" ? "en-US" : "tr-TR").replace(/[^\p{L}\p{N}' ]+/gu, " ").replace(/\s+/g, " ").trim();

function fnv(str, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export const audioKey = (text, lang = "tr") => {
  const k = `${lang}|${keyText(text, lang)}`;
  return fnv(k, 2166136261) + fnv(k, 3735928559);
};
