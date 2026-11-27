// Oyun modu (Macera): karakter duraktan durağa ilerler. Her durak 5 karışık soruluk bir oyun:
// dinle ve resmi bul, resme bak ve kelimeyi seç, hecelerden kelime kur, eksik harfi bul (İngilizcede: anlamını bul).
// Mikrofon gerekmez; her cihazda oynanır. Yanlışta ceza yok: doğru cevap söylenir, tekrar denenir.

import { pic } from "../pictures.js";
import { icon } from "../icons.js";
import { $app, route, go, owl, progressBar, showBadges, onLeave, on } from "../ui.js";
import { say, saySlow } from "../speech.js";
import { PICTURE_WORDS, PARTNER } from "../content.js";
import { syllabify, shuffle, esc } from "../text.js";
import { sfx, confetti, starBurst } from "../fx.js";
import * as store from "../store.js";

const STATIONS = 12;
const QUESTIONS = 5;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const isEn = () => store.lang() === "en";
const STATION_NAMES = ["Orman", "Göl", "Köprü", "Tepe", "Mağara", "Şelale", "Çiçek bahçesi", "Kale", "Deniz", "Ada", "Dağ", "Yıldız tepesi"];

/* ---------- Harita ---------- */
route("oyun", () => {
  const lang = store.lang();
  const adv = store.adventure(lang);
  const current = Math.min(adv.done, STATIONS - 1);
  const total = Object.values(adv.stars).reduce((a, b) => a + b, 0);
  $app.innerHTML = `
    <div class="adv-head">
      <h1>Macera</h1>
      <p class="muted">Durakları geç, yıldız topla. ${lang === "en" ? "Bu macera İngilizce." : ""}</p>
      <div class="adv-total">${icon("trophy")} <b>${total}</b> / ${STATIONS * 3} yıldız</div>
    </div>
    <ol class="adv-path">
      ${Array.from({ length: STATIONS }, (_, i) => {
        const state = i < adv.done ? "done" : i === adv.done ? "now" : "locked";
        const st = adv.stars[i] || 0;
        return `<li class="adv-stop ${state} ${i % 2 ? "r" : "l"}">
          ${i === current && adv.done < STATIONS ? `<span class="adv-buddy" aria-hidden="true">${owl("happy")}</span>` : ""}
          <button class="adv-node" data-i="${i}" ${state === "locked" ? "disabled" : ""} aria-label="${i + 1}. durak: ${STATION_NAMES[i]}${state === "locked" ? " (kilitli)" : ""}">
            ${state === "locked" ? icon("lock", 24) : state === "done" ? icon("check", 26) : `<b>${i + 1}</b>`}
          </button>
          <span class="adv-label">${STATION_NAMES[i]}
            ${state === "done" ? `<span class="adv-stars" aria-label="${st} yıldız">${[0, 1, 2].map((k) => `<i class="${k < st ? "on" : ""}">${icon("star", 14)}</i>`).join("")}</span>` : ""}
          </span>
        </li>`;
      }).join("")}
    </ol>
    ${adv.done >= STATIONS ? `<div class="card center"><h2>Maceranın sonuna geldin!</h2><p class="muted">Durakları yeniden oynayıp daha çok yıldız toplayabilirsin.</p></div>` : ""}`;
  on(".adv-node", (b) => go(`#/oyun-durak/${b.dataset.i}`));
  // Sıradaki durağı görünür yap
  $app.querySelector(".adv-stop.now")?.scrollIntoView({ block: "center" });
});

/* ---------- Soru üretici ---------- */
function makeQuestions(level) {
  const en = isEn();
  const g = store.get().profile?.grade || 1;
  const nOpt = level < 4 ? 3 : 4;
  const words = shuffle(PICTURE_WORDS);
  const types = en ? ["dinle", "oku", "anlam"] : ["dinle", "oku", "hece", "eksik"];
  const list = [];
  for (let k = 0; k < QUESTIONS; k++) {
    let type = types[(k + level) % types.length];
    const item = words[k % words.length];
    // Hece sorusu: uygun uzunlukta kelime yoksa başka tür
    if (type === "hece") {
      const n = syllabify(item.w).length;
      if (n < 2 || n > (g === 1 ? 3 : 4)) type = "oku";
    }
    const others = shuffle(PICTURE_WORDS.filter((p) => p !== item)).slice(0, nOpt - 1);
    list.push({ type, item, options: shuffle([item, ...others]) });
  }
  return list;
}

// Eksik harf: harfi ve seçenekleri hazırla
function missingLetter(word) {
  const letters = [...word];
  const idx = 1 + Math.floor(Math.random() * Math.max(1, letters.length - 1));
  const right = letters[idx];
  const pool = "aeıioöuübcçdfgğhjklmnprsştvyz".split("").filter((c) => c !== right);
  const wrong = new Set();
  if (PARTNER[right]) wrong.add(PARTNER[right]);
  while (wrong.size < 2) wrong.add(pool[Math.floor(Math.random() * pool.length)]);
  return { masked: letters.map((c, i) => (i === idx ? "_" : c)).join(""), right, options: shuffle([right, ...wrong]) };
}

/* ---------- Durak oyunu ---------- */
route("oyun-durak", (n) => {
  const level = Math.max(0, Math.min(STATIONS - 1, +n || 0));
  const adv = store.adventure(store.lang());
  if (level > adv.done) return go("#/oyun");
  let alive = true;
  onLeave(() => { alive = false; });
  const en = isEn();
  const lang = en ? "en" : "tr";
  const qs = makeQuestions(level);
  let i = 0;
  let correct = 0;

  const head = () => `
    <div class="practice-head"><h2>${level + 1}. durak · ${STATION_NAMES[level]}</h2><span class="muted">${i + 1} / ${QUESTIONS}</span></div>
    ${progressBar(i, QUESTIONS)}`;

  async function right(btn, firstTry) {
    if (firstTry) correct++;
    btn?.classList.add("right");
    sfx.success();
    if (firstTry) { store.addStars(1); starBurst(1); }
    await say(en ? "Correct!" : "Doğru!", { lang });
    await wait(250);
    i++;
    next();
  }
  function wrong(btn, answerText, answerLang) {
    btn.classList.add("wrong", "shake");
    btn.disabled = true;
    sfx.retry();
    setTimeout(() => btn.classList.remove("shake"), 500);
    if (answerText) say(answerText, { lang: answerLang, rate: 0.75 });
  }

  function next() {
    if (!alive) return;
    if (i >= QUESTIONS) return finish();
    const q = qs[i];
    const { item } = q;
    let firstTry = true;

    if (q.type === "dinle") {
      // Kelimeyi dinle → doğru resmi bul
      const word = en ? item.en : item.w;
      $app.innerHTML = `${head()}
        <div class="card center adv-q">
          <p class="adv-ask">Dinle ve resmi bul</p>
          <button class="btn primary big" id="hear">${icon("volume-2")} Dinle</button>
          <div class="choices adv-choices">${q.options.map((o, k) => `<button class="choice" data-k="${k}" aria-label="${k + 1}. resim">${pic(o.e)}</button>`).join("")}</div>
        </div>`;
      on("#hear", () => say(word, { lang, rate: 0.8 }));
      on("[data-k]", (b) => {
        const o = q.options[+b.dataset.k];
        if (o === item) right(b, firstTry);
        else { firstTry = false; wrong(b, word, lang); }
      });
      say(word, { lang, rate: 0.8 });
    } else if (q.type === "oku" || q.type === "anlam") {
      // oku: resme bak → kelimeyi seç · anlam (İngilizce): İngilizce kelimeyi dinle → Türkçesini seç
      const ask = q.type === "anlam" ? "Dinle. Türkçesi hangisi?" : en ? "Bunun İngilizcesi hangisi?" : "Bu ne? Doğru kelimeyi seç.";
      const label = (o) => (q.type === "anlam" ? o.w : en ? o.en : o.w);
      $app.innerHTML = `${head()}
        <div class="card center adv-q">
          <p class="adv-ask">${ask}</p>
          ${q.type === "anlam" ? `<button class="btn primary big" id="hear">${icon("volume-2")} ${esc(item.en)}</button>` : `<div class="pic">${pic(item.e)}</div>`}
          <div class="adv-words">${q.options.map((o, k) => `<button class="btn big adv-word" data-k="${k}">${esc(label(o))}</button>`).join("")}</div>
        </div>`;
      if (q.type === "anlam") { on("#hear", () => say(item.en, { lang: "en", rate: 0.8 })); say(item.en, { lang: "en", rate: 0.8 }); }
      on("[data-k]", (b) => {
        const o = q.options[+b.dataset.k];
        if (o === item) { say(label(o), { lang: q.type === "oku" && en ? "en" : "tr" }); right(b, firstTry); }
        else { firstTry = false; wrong(b, label(o), q.type === "oku" && en ? "en" : "tr"); }
      });
    } else if (q.type === "hece") {
      // Hecelerden kelime kur
      const parts = syllabify(item.w);
      const chips = shuffle(parts.map((p, k) => ({ p, k })));
      const built = [];
      const draw = () => {
        $app.innerHTML = `${head()}
          <div class="card center adv-q">
            <p class="adv-ask">Heceleri sırayla diz</p>
            <div class="pic">${pic(item.e)}</div>
            <div class="slot chips">${built.map((b) => `<span class="chip placed">${esc(b.p)}</span>`).join("") || `<span class="muted">Buraya diz</span>`}</div>
            <div class="chips">${chips.map((x, k) => `<button class="chip" data-k="${k}" ${built.includes(x) ? "hidden" : ""}>${esc(x.p)}</button>`).join("")}</div>
            <button class="btn small" id="hear">${icon("volume-2")} Hece hece dinle</button>
          </div>`;
        on("#hear", () => saySlow(item.w));
        on("[data-k]", async (b) => {
          const x = chips[+b.dataset.k];
          if (x.p !== parts[built.length]) {
            firstTry = false;
            b.classList.add("shake"); sfx.retry();
            setTimeout(() => b.classList.remove("shake"), 500);
            say(parts[built.length], { rate: 0.7 });
            return;
          }
          sfx.tap();
          built.push(x);
          say(x.p, { rate: 0.7 });
          if (built.length === parts.length) { draw(); await wait(350); await say(item.w); right(null, firstTry); }
          else draw();
        });
      };
      draw();
    } else if (q.type === "eksik") {
      // Eksik harfi bul
      const m = missingLetter(item.w);
      $app.innerHTML = `${head()}
        <div class="card center adv-q">
          <p class="adv-ask">Eksik harfi bul</p>
          <div class="pic">${pic(item.e)}</div>
          <div class="adv-masked" aria-label="${esc(m.masked.replace("_", " boşluk "))}">${[...m.masked].map((c) => (c === "_" ? `<span class="gap">?</span>` : esc(c))).join("")}</div>
          <div class="adv-words">${m.options.map((c) => `<button class="btn big adv-letter" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
          <button class="btn small" id="hear">${icon("volume-2")} Kelimeyi dinle</button>
        </div>`;
      on("#hear", () => say(item.w, { rate: 0.75 }));
      on("[data-c]", (b) => {
        if (b.dataset.c === m.right) {
          $app.querySelector(".adv-masked .gap").textContent = m.right;
          $app.querySelector(".adv-masked .gap").classList.add("filled");
          say(item.w);
          right(b, firstTry);
        } else { firstTry = false; wrong(b, item.w, "tr"); }
      });
    }
  }

  function finish() {
    const stars = correct >= QUESTIONS ? 3 : correct >= QUESTIONS - 1 ? 2 : 1;
    store.finishStation(store.lang(), level, stars);
    const last = level >= STATIONS - 1;
    $app.innerHTML = `
      <div class="card center finish">
        ${owl("happy big")}
        <h2>${STATION_NAMES[level]} tamam!</h2>
        <div class="adv-stars big" aria-label="${stars} yıldız">${[0, 1, 2].map((k) => `<i class="${k < stars ? "on" : ""}" style="animation-delay:${k * 150}ms">${icon("star", 40)}</i>`).join("")}</div>
        <p class="muted">${correct} / ${QUESTIONS} soruyu ilk denemede bildin.</p>
        <div class="row">
          ${last ? "" : `<button class="btn primary big" id="nextStop">Sonraki durak ${icon("arrow-right")}</button>`}
          <button class="btn big" id="map">${icon("map")} Harita</button>
        </div>
      </div>`;
    sfx.success();
    confetti(stars === 3 ? 30 : 12);
    say(stars === 3 ? "Harikasın!" : "Güzel çalıştın!");
    showBadges(store.checkBadges());
    on("#nextStop", () => go(`#/oyun-durak/${level + 1}`));
    on("#map", () => go("#/oyun"));
  }

  next();
}, () => "#/oyun");
