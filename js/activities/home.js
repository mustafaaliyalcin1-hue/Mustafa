// Karşılama, ana sayfa, temalar ve kişisel "Zor Seslerim" çalışması.

import { $app, route, go, mascot, owl, on, progressBar } from "../ui.js";
import { say, canListen, missingTurkishVoice } from "../speech.js";
import { THEMES, AVATARS, PICTURE_WORDS, EXTRA_WORDS } from "../content.js";
import { startPractice } from "./practice.js";
import { esc, shuffle, lower } from "../text.js";
import * as store from "../store.js";

const grade = () => store.get().profile?.grade || 1;
export const itemsFor = (theme) => theme.items.filter((x) => x.g === grade());

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
  const todays = store.todayStars();
  const st = store.streak();
  const weak = store.weakList(3);
  $app.innerHTML = `
    ${mascot(`Merhaba <b>${esc(p.name)}</b> ${p.avatar}! Bugün ne çalışalım?`)}
    <div class="goal card">
      <div class="goal-top"><b>Günlük hedef</b><span>${Math.min(todays, store.DAILY_GOAL)} / ${store.DAILY_GOAL} ⭐ ${st > 0 ? `· 🔥 ${st} gün` : ""}</span></div>
      ${progressBar(Math.min(todays, store.DAILY_GOAL), store.DAILY_GOAL)}
      ${todays >= store.DAILY_GOAL ? `<p class="muted">🎉 Bugünkü hedefini tamamladın!</p>` : ""}
    </div>

    ${!canListen ? `<p class="notice">ℹ️ Bu tarayıcı ses tanımayı desteklemiyor. Konuşma etkinlikleri için Android'de veya bilgisayarda <b>Google Chrome</b> kullanın.</p>` : ""}
    ${missingTurkishVoice() ? `<p class="notice">ℹ️ Cihazda Türkçe ses bulunamadı. Ayarlar → Metin okuma bölümünden Türkçe sesi yükleyin.</p>` : ""}

    <h3 class="section">🗣️ Konuş</h3>
    <div class="grid">
      ${tile("themes", "🎤", "Dinle ve Söyle", "Kelime ve cümleleri söyle, baykuş seni dinlesin.")}
      ${tile("stories", "📚", "Hikâye Oku", "Hikâyeyi dinle, cümle cümle sen oku.")}
      ${weak.length ? tile("weak", "🦸", "Zor Seslerim", `Senin için seçtim: ${weak.map(([c]) => `“${esc(c)}”`).join(", ")}`, "hot") : ""}
    </div>

    <h3 class="section">👂 Dinle</h3>
    <div class="grid">
      ${tile("letters", "🔠", "Harflerin Sesi", "Her harfin sesini ve örnek kelimesini dinle.")}
      ${tile("pairs", "🎧", "Benzer Sesler", "ı-i, o-ö, s-ş, c-ç, r-l… Hangisini duydun?")}
      ${tile("listen", "🖼️", "Dinle Bul", "Kelimeyi dinle, doğru resmi bul.")}
    </div>

    <h3 class="section">🧩 Oyna</h3>
    <div class="grid">
      ${tile("syllables", "🧩", "Hece Yapbozu", "Heceleri sırayla diz, kelimeyi kur.")}
      ${tile("missing", "🔍", "Eksik Ses", "Kelimede eksik olan sesi bul.")}
    </div>

    <div class="row footer-row">
      <button class="btn small" onclick="location.hash='#/parent'">👨‍👩‍👧 Veli / Öğretmen</button>
    </div>`;
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
  $app.innerHTML = `
    ${mascot(`Bir konu seç! ${grade()}. sınıf cümleleri seni bekliyor.`)}
    <div class="grid">
      ${THEMES.map((t) => {
        const items = itemsFor(t);
        const n = items.filter((x) => store.isDone(t.id, x.t)).length;
        return `<a class="tile" href="#/theme/${t.id}">
          <span class="ic">${t.icon}</span>
          <span class="t">${t.title}</span>
          ${progressBar(n, items.length)}
          <span class="d">${n === items.length ? "✅ Tamamlandı" : `${n} / ${items.length}`}</span>
        </a>`;
      }).join("")}
    </div>`;
});

route("theme", (id) => {
  const theme = THEMES.find((t) => t.id === id);
  if (!theme) return go("#/themes");
  const items = itemsFor(theme);
  const firstUndone = items.findIndex((x) => !store.isDone(theme.id, x.t));
  startPractice({
    title: theme.title,
    icon: theme.icon,
    items,
    listId: theme.id,
    start: firstUndone < 0 ? 0 : firstUndone,
    backHash: "#/themes",
    onFinish: () => ({ tekerleme: theme.id === "tekerleme" }),
  });
}, "#/themes");

/* ---------- Zor Seslerim (kişisel çalışma) ---------- */
route("weak", () => {
  const weak = store.weakList(3).map(([c]) => c);
  if (!weak.length) return go("#/home");
  // Zorlanılan sesleri içeren kısa kelimeler; resmi olanlar öne.
  const pics = PICTURE_WORDS.map((p) => ({ t: p.w, e: p.e }));
  const extra = EXTRA_WORDS.map((w) => ({ t: w }));
  const seen = new Set();
  const pool = [...pics, ...extra].filter((x) => {
    if (seen.has(x.t) || !weak.some((c) => lower(x.t).includes(c))) return false;
    seen.add(x.t);
    return true;
  });
  const items = shuffle(pool).slice(0, 8);
  if (!items.length) return go("#/home");
  startPractice({
    title: `Zor Seslerim: ${weak.join(", ")}`,
    icon: "🦸",
    items,
    listId: "weak",
    backHash: "#/home",
    onCorrect: (fb, it) => weak.forEach((c) => lower(it.t).includes(c) && store.relieveWeak(c)),
    onFinish: () => ({ weak: true }),
  });
});
