// Karşılama, ana sayfa, temalar ve kişisel "Zor Seslerim" çalışması.

import { $app, route, go, mascot, owl, on, progressBar } from "../ui.js";
import { say, canListen, missingVoice } from "../speech.js";
import { THEMES, AVATARS, PICTURE_WORDS, EXTRA_WORDS } from "../content.js";
import { EN_THEMES, EN_LETTERS, EN_SOUND_PAIRS } from "../content-en.js";
import { EN_PATTERNS } from "../tips.js";
import { startPractice } from "./practice.js";
import { esc, shuffle, lower } from "../text.js";
import * as store from "../store.js";

const grade = () => store.get().profile?.grade || 1;
export const itemsFor = (theme) => theme.items.filter((x) => x.g === grade());
const isEn = () => store.lang() === "en";
export const themesFor = () => (isEn() ? EN_THEMES : THEMES);

/* ---------- Karşılama (ilk açılış) ---------- */
route("welcome", () => {
  let avatar = AVATARS[0];
  let g = 1;
  $app.innerHTML = `
    <div class="welcome">
      ${owl("big")}
      <h1>Merhaba! Ben Bilge Baykuş 🦉</h1>
      <p>Birlikte dinleyip konuşarak Türkçeyi çok güzel söyleyeceğiz!</p>
      <div class="card">
        <label class="field">Adın ne?
          <input id="name" maxlength="20" autocomplete="off" placeholder="Adını yaz">
        </label>
        <p class="label">Kaçıncı sınıftasın?</p>
        <div class="seg" id="grade">
          <button class="on" data-g="1">1. sınıf</button>
          <button data-g="2">2. sınıf</button>
        </div>
        <p class="label">Bir arkadaş seç:</p>
        <div class="avatars">${AVATARS.map((a, i) => `<button class="${i ? "" : "on"}" data-a="${a}" aria-label="${a}">${a}</button>`).join("")}</div>
        <div class="row"><button class="btn primary big" id="start">Başlayalım! 🚀</button></div>
      </div>
    </div>`;
  on("#grade button", (b) => { g = +b.dataset.g; $app.querySelectorAll("#grade button").forEach((x) => x.classList.toggle("on", x === b)); });
  on(".avatars button", (b) => { avatar = b.dataset.a; $app.querySelectorAll(".avatars button").forEach((x) => x.classList.toggle("on", x === b)); });
  on("#start", () => {
    const name = $app.querySelector("#name").value.trim() || "Arkadaşım";
    store.setProfile({ name, grade: g, avatar });
    say(`Merhaba ${name}! Hadi başlayalım.`);
    go("#/home");
  });
});

/* ---------- Ana sayfa ---------- */
route("home", () => {
  const s = store.get();
  const p = s.profile;
  const en = isEn();
  const todays = store.todayStars();
  const st = store.streak();
  const weak = store.weakList(3);
  $app.innerHTML = `
    ${mascot(en
      ? `Hello <b>${esc(p.name)}</b> ${p.avatar}! Bugün biraz <b>İngilizce</b> çalışalım mı? 🇬🇧`
      : `Merhaba <b>${esc(p.name)}</b> ${p.avatar}! Bugün ne çalışalım?`)}
    <div class="lang-switch" role="group" aria-label="Dil seçimi">
      <button data-lang="tr" class="${en ? "" : "on"}">🇹🇷 Türkçe<small>Telaffuz ve okuma</small></button>
      <button data-lang="en" class="${en ? "on" : ""}">🇬🇧 İngilizce<small>Başlangıç düzeyi</small></button>
    </div>
    <div class="goal card">
      <div class="goal-top"><b>Günlük hedef</b><span>${Math.min(todays, store.DAILY_GOAL)} / ${store.DAILY_GOAL} ⭐ ${st > 0 ? `· 🔥 ${st} gün` : ""}</span></div>
      ${progressBar(Math.min(todays, store.DAILY_GOAL), store.DAILY_GOAL)}
      ${todays >= store.DAILY_GOAL ? `<p class="muted">🎉 Bugünkü hedefini tamamladın!</p>` : ""}
    </div>

    ${!canListen ? `<p class="notice">ℹ️ Bu tarayıcı ses tanımayı desteklemiyor. Konuşma etkinlikleri için Android'de veya bilgisayarda <b>Google Chrome</b> kullanın.</p>` : ""}
    ${missingVoice(en ? "en" : "tr") ? `<p class="notice">ℹ️ Cihazda ${en ? "İngilizce" : "Türkçe"} ses bulunamadı. Ayarlar → Metin okuma bölümünden ${en ? "İngilizce" : "Türkçe"} sesi yükleyin.</p>` : ""}

    <h3 class="section">🗣️ Konuş</h3>
    <div class="grid">
      ${tile("themes", "🎤", en ? "Listen & Say" : "Dinle ve Söyle", en ? "İngilizce kelime ve cümleleri dinle, sen de söyle." : "Kelime ve cümleleri söyle, baykuş seni dinlesin.")}
      ${tile("stories", "📚", en ? "Story Time" : "Hikâye Oku", en ? "Kısa İngilizce hikâyeyi dinle, sonra sen oku." : "Hikâyeyi dinle, cümle cümle sen oku.")}
      ${weak.length ? tile("weak", "🦸", "Zor Seslerim", `Senin için seçtim: ${weak.map(([c]) => `“${esc(c)}”`).join(", ")}`, "hot") : ""}
    </div>

    <h3 class="section">👂 Dinle</h3>
    <div class="grid">
      ${tile("letters", "🔠", en ? "ABC" : "Harflerin Sesi", en ? "İngiliz alfabesi: harfi ve örnek kelimeyi dinle." : "Her harfin sesini ve örnek kelimesini dinle.")}
      ${tile("pairs", "🎧", "Benzer Sesler", en ? "v-w, th-t, ship-sheep… Hangisini duydun?" : "ı-i, o-ö, s-ş, c-ç, r-l… Hangisini duydun?")}
      ${tile("listen", "🖼️", en ? "Listen & Find" : "Dinle Bul", en ? "İngilizce kelimeyi dinle, doğru resmi bul." : "Kelimeyi dinle, doğru resmi bul.")}
    </div>

    <h3 class="section">🧩 Oyna</h3>
    <div class="grid">
      ${en
        ? tile("meaning", "🤔", "Ne Demek?", "İngilizce kelimeyi dinle, Türkçesini bul.") + tile("which", "🔤", "Hangisi?", "Resme bak, doğru İngilizce kelimeyi seç.")
        : tile("syllables", "🧩", "Hece Yapbozu", "Heceleri sırayla diz, kelimeyi kur.") + tile("missing", "🔍", "Eksik Ses", "Kelimede eksik olan sesi bul.")}
    </div>

    <div class="row footer-row">
      <button class="btn small" onclick="location.hash='#/parent'">👨‍👩‍👧 Veli / Öğretmen</button>
    </div>`;
  on(".lang-switch button", (b) => {
    if (b.dataset.lang === store.lang()) return;
    store.setLang(b.dataset.lang);
    go("#/home");
    if (b.dataset.lang === "en") say("Hello! Let's learn English!", { lang: "en" });
    else say("Haydi Türkçe çalışalım!");
  });
});

function tile(r, icon, title, desc, cls = "") {
  return `<a class="tile ${cls}" href="#/${r}">
    <span class="ic" aria-hidden="true">${icon}</span>
    <span class="t">${title}</span>
    <span class="d">${desc}</span>
  </a>`;
}

/* ---------- Temalar ---------- */
route("themes", () => {
  const en = isEn();
  $app.innerHTML = `
    ${mascot(en ? `Bir konu seç! ${grade()}. sınıf için İngilizce kelime ve cümleler. 🇬🇧` : `Bir konu seç! ${grade()}. sınıf cümleleri seni bekliyor.`)}
    <div class="grid">
      ${themesFor().map((t) => {
        const items = itemsFor(t);
        const n = items.filter((x) => store.isDone(t.id, x.t)).length;
        return `<a class="tile" href="#/theme/${t.id}">
          <span class="ic">${t.icon}</span>
          <span class="t">${t.title}</span>
          ${t.sub ? `<span class="d">${esc(t.sub)}</span>` : ""}
          ${progressBar(n, items.length)}
          <span class="d">${n === items.length ? "✅ Tamamlandı" : `${n} / ${items.length}`}</span>
        </a>`;
      }).join("")}
    </div>`;
});

route("theme", (id) => {
  const theme = [...THEMES, ...EN_THEMES].find((t) => t.id === id);
  if (!theme) return go("#/themes");
  const items = itemsFor(theme);
  const firstUndone = items.findIndex((x) => !store.isDone(theme.id, x.t));
  startPractice({
    title: theme.sub || theme.title,
    icon: theme.icon,
    items,
    lang: EN_THEMES.includes(theme) ? "en" : "tr",
    listId: theme.id,
    start: firstUndone < 0 ? 0 : firstUndone,
    backHash: "#/themes",
    onFinish: () => ({ tekerleme: theme.id === "tekerleme" }),
  });
}, "#/themes");

/* ---------- Zor Seslerim (kişisel çalışma) ---------- */
route("weak", () => {
  const en = isEn();
  const weak = store.weakList(3).map(([c]) => c);
  if (!weak.length) return go("#/home");

  // Bir kelime zorlanılan sesi içeriyor mu?
  const patterns = weak.map((id) => EN_PATTERNS.find((p) => p.id === id)).filter(Boolean);
  const has = en
    ? (t) => patterns.filter((p) => new RegExp(p.re.source).test(lower(t, "en")))
    : (t) => weak.filter((c) => lower(t).includes(c));

  // Aday kelimeler; resmi olanlar öne.
  const candidates = en
    ? [
        ...EN_THEMES.flatMap((th) => th.items.filter((x) => !/\s/.test(x.t))),
        ...PICTURE_WORDS.map((p) => ({ t: p.en, e: p.e, tr: p.w })),
        ...EN_LETTERS.map((l) => ({ t: l.w, e: l.e })),
        ...EN_SOUND_PAIRS.flatMap((p) => p.words.flat().map((w) => ({ t: w }))),
      ]
    : [...PICTURE_WORDS.map((p) => ({ t: p.w, e: p.e })), ...EXTRA_WORDS.map((w) => ({ t: w }))];
  const seen = new Set();
  const pool = candidates.filter((x) => {
    const key = lower(x.t.replace(/[^\p{L} ]/gu, ""), en ? "en" : "tr");
    if (seen.has(key) || !has(x.t).length) return false;
    seen.add(key);
    return true;
  });
  const items = shuffle(pool).slice(0, 8);
  if (!items.length) return go("#/home");
  startPractice({
    title: `Zor Seslerim: ${weak.join(", ")}`,
    icon: "🦸",
    items,
    lang: en ? "en" : "tr",
    listId: en ? "en-weak" : "weak",
    backHash: "#/home",
    onCorrect: (fb, it) => has(it.t).forEach((x) => store.relieveWeak(en ? x.id : x)),
    onFinish: () => ({ weak: true }),
  });
});
