import { test } from "node:test";
import assert from "node:assert/strict";
import { syllabify, normalize, charConfusions } from "../js/text.js";
import { evaluate } from "../js/coach.js";
import { THEMES, STORIES, PICTURE_WORDS } from "../js/content.js";

test("Türkçe heceleme kuralı", () => {
  const cases = {
    araba: "a-ra-ba", kaplumbağa: "kap-lum-ba-ğa", öğretmen: "öğ-ret-men", bisiklet: "bi-sik-let",
    televizyon: "te-le-viz-yon", şemsiye: "şem-si-ye", Türkçe: "Türk-çe", saat: "sa-at", kitap: "ki-tap", ev: "ev",
  };
  for (const [w, s] of Object.entries(cases)) assert.equal(syllabify(w).join("-"), s, w);
});

test("normalize: büyük İ/I, kesme işareti, noktalama", () => {
  assert.equal(normalize("İnek ot yer."), "inek ot yer");
  assert.equal(normalize("IŞIK"), "ışık");
  assert.equal(normalize("Ali'nin topu, kırmızı!"), "alinin topu kırmızı");
  assert.equal(normalize("dükkânı"), "dükkanı");
});

test("harf karışıklığı tespiti", () => {
  assert.deepEqual(charConfusions("süt", "sut"), [{ want: "ü", got: "u", at: 1 }]);
  assert.deepEqual(charConfusions("araba", "aaba"), [{ want: "r", got: "", at: 1 }]);
});

test("doğru söyleyiş → ok", () => {
  assert.equal(evaluate("Ali topu at.", ["ali topu at"]).level, "ok");
  assert.equal(evaluate("İnek ot yer.", ["İnek ot yer"]).level, "ok");
});

test("ses tanıma kelimeleri birleştirse de doğru sayılır", () => {
  assert.equal(evaluate("Kırk küp, kırkının da kulpu kırık küp.", ["kırk küp kırkınında kulpu kırık küp"]).level, "ok");
});

test("en iyi alternatif seçilir", () => {
  assert.equal(evaluate("Kedi süt içti.", ["kedi sut içti", "kedi süt içti"]).level, "ok");
});

test("r yerine l → özel ipucu ve zayıf ses kaydı", () => {
  const fb = evaluate("Kartal kalkar dal sarkar.", ["kaltal kalkal dal salkal"]);
  assert.notEqual(fb.level, "ok");
  assert.ok(fb.tips.some((t) => t.html.includes("“r” yerine “l”")), JSON.stringify(fb.tips));
  assert.ok(fb.weakSounds.includes("r"));
});

test("ı yerine i → ipucu", () => {
  const fb = evaluate("kır", ["kir"]);
  assert.equal(fb.level, "close");
  assert.match(fb.tips[0].html, /“ı” yerine “i”/);
  assert.ok(fb.tips[0].speech.length > 0);
  assert.doesNotMatch(fb.tips[0].speech, /[“”]/);
});

test("uzun cümlede tek küçük hata → almost (doğru sayılır)", () => {
  const fb = evaluate("Öğretmenimiz bize masal okudu.", ["öğretmenimiz bize masal okudı"]);
  assert.equal(fb.level, "almost");
});

test("eksik kelime → missing durumu ve ipucu", () => {
  const fb = evaluate("Bugün hava çok güneşli.", ["bugün hava"]);
  assert.equal(fb.level, "bad");
  assert.deepEqual(fb.aligned.map((a) => a.status), ["ok", "ok", "missing", "missing"]);
});

test("ilgisiz söz → bad, hece önerisi", () => {
  const fb = evaluate("kelebek", ["merhaba"]);
  assert.equal(fb.level, "bad");
  assert.match(fb.tips[0].html, /ke - le - bek/);
});

test("boş sonuç → null", () => {
  assert.equal(evaluate("kedi", []), null);
});

test("içerik: her temada iki sınıf için de cümle var", () => {
  for (const t of THEMES) {
    assert.ok(t.items.filter((x) => x.g === 1).length >= 4, t.id);
    assert.ok(t.items.filter((x) => x.g === 2).length >= 4, t.id);
  }
  for (const s of STORIES) assert.ok(s.lines.length >= 4);
  assert.equal(new Set(PICTURE_WORDS.map((p) => p.w)).size, PICTURE_WORDS.length);
});

test("içerik: ekrandaki kelime sayısı, değerlendirilen kelime sayısıyla aynı", () => {
  const all = [...THEMES.flatMap((t) => t.items.map((x) => x.t)), ...STORIES.flatMap((s) => s.lines)];
  for (const t of all) assert.equal(t.split(/\s+/).length, normalize(t).split(" ").length, t);
});

/* ---------------- İngilizce ---------------- */
import { EN_THEMES, EN_STORIES, EN_SOUND_PAIRS } from "../js/content-en.js";

test("EN normalize: büyük I Türkçe ı olmaz, rakamlar kelimeye çevrilir", () => {
  assert.equal(normalize("I like it!", "en"), "i like it");
  assert.equal(normalize("I have 2 cats.", "en"), "i have two cats");
  assert.equal(normalize("I'm fine", "en"), "im fine");
  assert.equal(normalize("3 kedi", "tr"), "üç kedi");
});

test("EN doğru söyleyiş → ok (rakamla gelse de)", () => {
  assert.equal(evaluate("Hello!", ["hello"], { lang: "en" }).level, "ok");
  assert.equal(evaluate("I am seven years old.", ["I am 7 years old"], { lang: "en" }).level, "ok");
  assert.equal(evaluate("Thank you.", ["thank you"], { lang: "en" }).level, "ok");
});

test("EN th → t: Türkçe th ipucu ve zayıf ses", () => {
  const fb = evaluate("three", ["tree"], { lang: "en" });
  assert.equal(fb.level, "close");
  assert.match(fb.tips[0].html, /“th” sesinde/);
  assert.deepEqual(fb.weakSounds, ["en:th"]);
});

test("EN w → v: w ipucu", () => {
  const fb = evaluate("water", ["vater"], { lang: "en" });
  assert.match(fb.tips[0].html, /“w” sesinde/);
});

test("EN sheep → ship: uzun ii ipucu", () => {
  const fb = evaluate("sheep", ["ship"], { lang: "en" });
  assert.match(fb.tips[0].html, /uzun bir “i”/);
});

test("EN içerik: anlam, okunuş ve kelime sayısı tutarlı", () => {
  for (const t of EN_THEMES) {
    assert.ok(t.items.filter((x) => x.g === 1).length >= 4, t.id);
    assert.ok(t.items.filter((x) => x.g === 2).length >= 4, t.id);
    for (const x of t.items) {
      assert.ok(x.tr && x.p, x.t);
      assert.equal(x.t.split(/\s+/).length, normalize(x.t, "en").split(" ").length, x.t);
    }
  }
  for (const s of EN_STORIES) for (const l of s.lines) assert.ok(l.t && l.tr);
  for (const p of EN_SOUND_PAIRS) assert.equal(p.words.length, 3);
});
