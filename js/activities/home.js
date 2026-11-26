// Karşılama, ana sayfa, temalar ve kişisel "Zor Seslerim" çalışması.

import { $app, route, go, mascot, owl, on, progressBar } from "../ui.js";
import { say, canListen, missingVoice } from "../speech.js";
import { THEMES, PICTURE_WORDS, EXTRA_WORDS } from "../content.js";
import { BODIES, NAME_IDEAS, bodyOf, characterSVG } from "../character.js";
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
// 1) Çocuğun adı ve sınıfı → 2) karakterini seç ve ona isim koy → 3) giydir (Karakterim ekranı)
route("welcome", () => {
  let name = "";
  let g = 1;
  let body = BODIES[0].id;
  let buddyName = NAME_IDEAS[Math.floor(Math.random() * NAME_IDEAS.length)];
  const free = BODIES.filter((b) => !b.stars);

  // Hareketli uzay arka planı + adım göstergesi (3 adım: sen → arkadaşın → giydir)
  const shell = (step, inner) => `
    <div class="wel-bg" aria-hidden="true"><i class="au a"></i><i class="au b"></i><i class="au c"></i><i class="sky"></i><i class="floor"></i></div>
    <div class="wel">
      <ol class="wel-steps" aria-label="Adım ${step} / 3">
        ${["Sen", "Arkadaşın", "Giydir"].map((t, i) => `<li class="${i + 1 < step ? "done" : i + 1 === step ? "on" : ""}"><b>${i + 1 < step ? "✓" : i + 1}</b><span>${t}</span></li>`).join("")}
      </ol>
      ${inner}
    </div>`;

  const step1 = () => {
    $app.innerHTML = shell(1, `
      <div class="wel-cast" aria-hidden="true">
        <i class="ring"></i><i class="ring r2"></i>
        ${free.map((b, i) => `<div class="c c${i}">${characterSVG({ body: b.id, hat: ["cap", "headphones", "bow", "none"][i] || "none" })}</div>`).join("")}
      </div>
      <h1 class="wel-title"><span class="glow">Merhaba!</span> <span class="wave">👋</span></h1>
      <p class="wel-sub">Konuşan Arkadaşım'a hoş geldin! Birlikte dinleyip konuşarak çok güzel söyleyeceğiz.</p>
      <div class="wel-card">
        <label class="wel-field">Adın ne?
          <input id="name" maxlength="20" autocomplete="off" placeholder="Adını yaz" value="${esc(name)}">
        </label>
        <p class="wel-label">Kaçıncı sınıftasın?</p>
        <div class="wel-seg" id="grade">
          <button class="${g === 1 ? "on" : ""}" data-g="1">1. sınıf</button>
          <button class="${g === 2 ? "on" : ""}" data-g="2">2. sınıf</button>
        </div>
        <button class="wel-cta" id="next">Devam <span>→</span></button>
      </div>`);
    on("#grade button", (b) => { g = +b.dataset.g; $app.querySelectorAll("#grade button").forEach((x) => x.classList.toggle("on", x === b)); });
    const nameInput = $app.querySelector("#name");
    on("#next", () => { name = nameInput.value.trim() || "Arkadaşım"; step2(); });
    nameInput.addEventListener("keydown", (e) => e.key === "Enter" && $app.querySelector("#next").click());
  };

  const step2 = () => {
    $app.innerHTML = shell(2, `
      <h1 class="wel-title sm">Arkadaşını seç, <span class="glow">${esc(name)}</span>!</h1>
      <p class="wel-sub">Seninle birlikte çalışacak karakterini seç ve ona bir isim koy.</p>
      <div class="wel-card">
        <div class="wel-stage"><i class="beam"></i><i class="pad"></i><div class="who pop" id="stage">${characterSVG({ body }, "happy")}</div></div>
        <div class="wel-pick">
          ${free.map((b) => `<button data-id="${b.id}" class="${b.id === body ? "on" : ""}" aria-pressed="${b.id === body}">${characterSVG({ body: b.id })}<span>${esc(b.name)}</span></button>`).join("")}
        </div>
        <label class="wel-field">Arkadaşının adı
          <span class="wel-name">
            <input id="buddy" maxlength="16" autocomplete="off" value="${esc(buddyName)}">
            <button id="idea" aria-label="Başka isim öner">🎲</button>
          </span>
        </label>
        <div class="wel-row">
          <button class="wel-back" id="back">←</button>
          <button class="wel-cta" id="next">Devam <span>→</span></button>
        </div>
      </div>`);
    on(".wel-pick button", (b) => {
      body = b.dataset.id;
      const st = $app.querySelector("#stage");
      st.innerHTML = characterSVG({ body }, "happy");
      st.classList.remove("pop"); void st.offsetWidth; st.classList.add("pop");
      $app.querySelectorAll(".wel-pick button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      say(`Ben ${bodyOf(body).name}!`);
    });
    on("#idea", (btn) => {
      const others = NAME_IDEAS.filter((n) => n !== $app.querySelector("#buddy").value);
      $app.querySelector("#buddy").value = others[Math.floor(Math.random() * others.length)];
      btn.classList.remove("spin"); void btn.offsetWidth; btn.classList.add("spin");
    });
    on("#back", () => { buddyName = $app.querySelector("#buddy").value; step1(); });
    on("#next", () => {
      buddyName = $app.querySelector("#buddy").value.trim() || bodyOf(body).name;
      store.setWholeLook({ body });
      store.setProfile({ name, grade: g, buddy: buddyName });
      go("#/character/setup");
      setTimeout(() => say("Merhaba! Hadi beni giydir!"), 60);
    });
  };

  step1();
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
    <a class="hero card" href="#/character" aria-label="Karakterim: ${esc(store.buddy())}">
      <div class="hero-char">${owl("big")}</div>
      <div class="hero-text">
        <div class="bubble">${en
          ? `Hello <b>${esc(p.name)}</b>! Ben <b>${esc(store.buddy())}</b>. Bugün biraz <b>İngilizce</b> çalışalım mı? 🇬🇧`
          : `Merhaba <b>${esc(p.name)}</b>! Ben <b>${esc(store.buddy())}</b>. Bugün ne çalışalım?`}</div>
        <span class="btn small hero-btn">👕 Beni giydir</span>
      </div>
    </a>
    <div class="lang-switch" role="group" aria-label="Dil seçimi">
      <button data-lang="tr" class="${en ? "" : "on"}">🇹🇷 Türkçe<small>Telaffuz ve okuma</small></button>
      <button data-lang="en" class="${en ? "on" : ""}">🇬🇧 İngilizce<small>Başlangıç düzeyi</small></button>
    </div>
    <div class="goal card">
      <div class="goal-top"><b>Günlük hedef</b><span>${Math.min(todays, store.DAILY_GOAL)} / ${store.DAILY_GOAL} ⭐ ${st > 0 ? `· 🔥 ${st} gün` : ""}</span></div>
      ${progressBar(Math.min(todays, store.DAILY_GOAL), store.DAILY_GOAL)}
      ${todays >= store.DAILY_GOAL ? `<p class="muted">🎉 Bugünkü hedefini tamamladın!</p>` : ""}
      <a class="panel-link" href="panel/">🚀 Öğrenme paneli: ilerlemeni gör →</a>
    </div>

    ${!canListen ? `<p class="notice">ℹ️ Bu tarayıcı ses tanımayı desteklemiyor. Konuşma etkinlikleri için Android'de veya bilgisayarda <b>Google Chrome</b> kullanın.</p>` : ""}
    ${missingVoice(en ? "en" : "tr") ? `<p class="notice">ℹ️ Cihazda ${en ? "İngilizce" : "Türkçe"} ses bulunamadı. Ayarlar → Metin okuma bölümünden ${en ? "İngilizce" : "Türkçe"} sesi yükleyin.</p>` : ""}

    <h3 class="section">🗣️ Konuş</h3>
    <div class="grid">
      ${tile("themes", "🎤", en ? "Listen & Say" : "Dinle ve Söyle", en ? "İngilizce kelime ve cümleleri dinle, sen de söyle." : `Kelime ve cümleleri söyle, ${esc(store.buddy())} seni dinlesin.`)}
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
    setTimeout(() => {
      if (b.dataset.lang === "en") say("Hello! Let's learn English!", { lang: "en" });
      else say("Haydi Türkçe çalışalım!");
    }, 60);
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
