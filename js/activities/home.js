// Karşılama, ana sayfa, temalar ve kişisel "Zor Seslerim" çalışması.

import { icon, topicIcon } from "../icons.js";
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
      <h1 class="wel-title">Merhaba!</h1>
      <p class="wel-sub">Hoş geldin! Birlikte dinleyip konuşacağız.</p>
      <div class="wel-card">
        <label class="wel-field">Adın ne?
          <input id="name" maxlength="20" autocomplete="off" placeholder="Adını yaz" value="${esc(name)}">
        </label>
        <p class="wel-label">Kaçıncı sınıftasın?</p>
        <div class="wel-seg" id="grade">
          <button class="${g === 1 ? "on" : ""}" data-g="1">1. sınıf</button>
          <button class="${g === 2 ? "on" : ""}" data-g="2">2. sınıf</button>
        </div>
        <button class="wel-cta" id="next">Devam ${icon("arrow-right")}</button>
      </div>`);
    on("#grade button", (b) => { g = +b.dataset.g; $app.querySelectorAll("#grade button").forEach((x) => x.classList.toggle("on", x === b)); });
    const nameInput = $app.querySelector("#name");
    on("#next", () => { name = nameInput.value.trim() || "Arkadaşım"; step2(); });
    nameInput.addEventListener("keydown", (e) => e.key === "Enter" && $app.querySelector("#next").click());
  };

  const step2 = () => {
    $app.innerHTML = shell(2, `
      <h1 class="wel-title sm">Arkadaşını seç, ${esc(name)}!</h1>
      <p class="wel-sub">Bir arkadaş seç ve ona bir ad ver.</p>
      <div class="wel-card">
        <div class="wel-stage"><i class="beam"></i><i class="pad"></i><div class="who pop" id="stage">${characterSVG({ body }, "happy")}</div></div>
        <div class="wel-pick">
          ${free.map((b) => `<button data-id="${b.id}" class="${b.id === body ? "on" : ""}" aria-pressed="${b.id === body}">${characterSVG({ body: b.id })}<span>${esc(b.name)}</span></button>`).join("")}
        </div>
        <label class="wel-field">Arkadaşının adı ne olsun?
          <span class="wel-name">
            <input id="buddy" maxlength="16" autocomplete="off" value="${esc(buddyName)}">
            <button id="idea" aria-label="Başka ad öner">${icon("shuffle")}</button>
          </span>
        </label>
        <div class="wel-row">
          <button class="wel-back" id="back" aria-label="Geri">${icon("arrow-left")}</button>
          <button class="wel-cta" id="next">Devam ${icon("arrow-right")}</button>
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
const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
function lastWeek(days) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ label: DAY_NAMES[d.getDay()], stars: days[k] || 0 });
  }
  return out;
}
route("home", () => {
  const s = store.get();
  const p = s.profile;
  const en = isEn();
  const todays = store.todayStars();
  const st = store.streak();
  const weak = store.weakList(3);
  // Sıradaki görev: bu sınıfta bitmemiş ilk konu
  const next = themesFor().find((t) => itemsFor(t).some((x) => !store.isDone(t.id, x.t)));
  const allThemes = themesFor();
  const finished = allThemes.filter((t) => itemsFor(t).every((x) => store.isDone(t.id, x.t))).length;
  const week = lastWeek(s.days);
  const maxDay = Math.max(store.DAILY_GOAL, ...week.map((d) => d.stars));
  const ringC = 2 * Math.PI * 38;
  $app.innerHTML = `
    <section class="fx-hero card">
      <button class="fx-buddy" id="buddy" aria-label="${esc(store.buddy())}">
        <span class="who">${owl("happy")}</span>
      </button>
      <div class="fx-copy">
        <h1 class="fx-hello">Merhaba ${esc(p.name)}!</h1>
        <p class="fx-say">${en ? "Bugün İngilizce çalışıyoruz." : next ? `Sıradaki konu: <b>${esc(next.sub || next.title)}</b>` : "Bütün konuları bitirdin. Harikasın!"}</p>
        <div class="fx-goal">
          <div class="fx-goal-top"><span>Bugünkü hedef</span><span class="muted">${Math.min(todays, store.DAILY_GOAL)} / ${store.DAILY_GOAL} yıldız</span></div>
          ${progressBar(Math.min(todays, store.DAILY_GOAL), store.DAILY_GOAL)}
        </div>
        <div class="fx-stats">
          <div class="fx-stat"><span class="c-star">${icon("star")}</span><div><b>${s.stars}</b><small>yıldız</small></div></div>
          <div class="fx-stat"><span class="c-flame">${icon("flame")}</span><div><b>${st}</b><small>gün seri</small></div></div>
          <div class="fx-stat"><span class="c-check">${icon("check")}</span><div><b>${finished}/${allThemes.length}</b><small>konu</small></div></div>
        </div>
        <div class="fx-actions">
          <a class="btn primary" href="${next ? `#/theme/${next.id}` : "#/themes"}">Devam et ${icon("arrow-right")}</a>
          <a class="btn" href="#/character">${icon("shirt")} Kıyafet seç</a>
        </div>
      </div>
    </section>

    <section class="fx-week card">
      <div class="fx-week-top"><b>Bu hafta</b><span class="muted small">${(() => { const t = week.reduce((a, d) => a + d.stars, 0); return t ? `${t} yıldız topladın` : "Henüz yıldız yok"; })()}</span></div>
      <div class="fx-bars">${week.map((d, i) => `<div class="col"><div class="bar-wrap"><i style="height:${Math.max(5, (d.stars / maxDay) * 100)}%;animation-delay:${120 + i * 40}ms;${d.stars ? "" : "background:var(--soft)"}"></i></div><small>${d.label}</small></div>`).join("")}</div>
    </section>

    <div class="lang-switch" role="group" aria-label="Dil seçimi">
      <button data-lang="tr" class="${en ? "" : "on"}">🇹🇷 Türkçe<small>Telaffuz ve okuma</small></button>
      <button data-lang="en" class="${en ? "on" : ""}">🇬🇧 İngilizce<small>Başlangıç düzeyi</small></button>
    </div>
    ${!canListen ? `<p class="notice">ℹ️ Bu tarayıcı ses tanımayı desteklemiyor. Konuşma etkinlikleri için Android'de veya bilgisayarda <b>Google Chrome</b> kullanın.</p>` : ""}
    ${missingVoice(en ? "en" : "tr") ? `<p class="notice">ℹ️ Cihazda ${en ? "İngilizce" : "Türkçe"} ses bulunamadı. Ayarlar → Metin okuma bölümünden ${en ? "İngilizce" : "Türkçe"} sesi yükleyin.</p>` : ""}

    <h3 class="section">Konuş</h3>
    <div class="grid">
      ${tile("themes", icon("mic", 26), en ? "Listen & Say" : "Dinle ve Söyle", en ? "İngilizce kelime ve cümleleri dinle, sen de söyle." : `Kelime ve cümleleri söyle, ${esc(store.buddy())} seni dinlesin.`)}
      ${tile("stories", icon("book-open", 26), en ? "Story Time" : "Hikâye Oku", en ? "Kısa İngilizce hikâyeyi dinle, sonra sen oku." : "Hikâyeyi dinle, cümle cümle sen oku.")}
      ${weak.length ? tile("weak", icon("sparkles", 26), "Zor Seslerim", `Senin için seçtim: ${weak.map(([c]) => `“${esc(c)}”`).join(", ")}`, "hot") : ""}
    </div>

    <h3 class="section">Dinle</h3>
    <div class="grid">
      ${tile("letters", icon("type", 26), en ? "ABC" : "Harflerin Sesi", en ? "İngiliz alfabesi: harfi ve örnek kelimeyi dinle." : "Her harfin sesini ve örnek kelimesini dinle.")}
      ${tile("pairs", icon("headphones", 26), "Benzer Sesler", en ? "v-w, th-t, ship-sheep… Hangisini duydun?" : "ı-i, o-ö, s-ş, c-ç, r-l… Hangisini duydun?")}
      ${tile("listen", icon("image", 26), en ? "Listen & Find" : "Dinle Bul", en ? "İngilizce kelimeyi dinle, doğru resmi bul." : "Kelimeyi dinle, doğru resmi bul.")}
    </div>

    <h3 class="section">Oyna</h3>
    <div class="grid">
      ${en
        ? tile("meaning", icon("circle-help", 26), "Ne Demek?", "İngilizce kelimeyi dinle, Türkçesini bul.") + tile("which", icon("languages", 26), "Hangisi?", "Resme bak, doğru İngilizce kelimeyi seç.")
        : tile("syllables", icon("puzzle", 26), "Hece Yapbozu", "Heceleri sırayla diz, kelimeyi kur.") + tile("missing", icon("search", 26), "Eksik Ses", "Kelimede eksik olan sesi bul.")}
    </div>

    <div class="row footer-row">
      <button class="btn small" onclick="location.hash='#/parent'">${icon("settings")} Yönetim paneli</button>
    </div>`;
  // Sayılar sayarak yükselir, hedef halkası dolar, karaktere dokununca zıplar
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("no-anim");
  $app.querySelectorAll("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    if (reduce || !to) { el.textContent = to; return; }
    const t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1 && el.isConnected) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const ring = $app.querySelector(".fx-ring .val");
  if (ring) setTimeout(() => { ring.style.strokeDashoffset = ring.dataset.to; }, 150);
  on("#buddy", (b) => { b.classList.remove("jump"); void b.offsetWidth; b.classList.add("jump"); });
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
          <span class="ic">${topicIcon(t.id, 26)}</span>
          <span class="t">${t.title}</span>
          ${t.sub ? `<span class="d">${esc(t.sub)}</span>` : ""}
          ${progressBar(n, items.length)}
          <span class="d">${n === items.length ? "Bitti" : `${n} / ${items.length}`}</span>
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
    icon: topicIcon(theme.id),
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
    icon: icon("sparkles", 24),
    items,
    lang: en ? "en" : "tr",
    listId: en ? "en-weak" : "weak",
    backHash: "#/home",
    onCorrect: (fb, it) => has(it.t).forEach((x) => store.relieveWeak(en ? x.id : x)),
    onFinish: () => ({ weak: true }),
  });
});
