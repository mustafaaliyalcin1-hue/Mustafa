"use strict";

/* =========================================================
 * Konuşan Baykuş — Türkçe telaffuz pekiştirme uygulaması
 * - Dinleme: tarayıcının Türkçe sesli okuması (speechSynthesis)
 * - Konuşma: yapay zekâ ses tanıma (SpeechRecognition, tr-TR)
 * - Koç: söyleneni hedef cümleyle karşılaştırır, hatalı sesi
 *   bulur ve çocuğa nasıl doğru söyleyeceğini anlatır.
 * ========================================================= */

const $app = document.getElementById("app");
const $back = document.getElementById("backBtn");
const $stars = document.getElementById("starCount");
const $toast = document.getElementById("toast");

/* ---------------- Kayıt (ilerleme) ---------------- */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("kb:" + key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("kb:" + key, JSON.stringify(value)); } catch { /* gizli sekme vb. */ }
  },
};
let stars = store.get("stars", 0);
function addStars(n) {
  stars += n;
  store.set("stars", stars);
  $stars.textContent = stars;
}
$stars.textContent = stars;

function toast(msg, ms = 1800) {
  $toast.textContent = msg;
  $toast.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => ($toast.hidden = true), ms);
}

/* ---------------- Metin yardımcıları ---------------- */
const VOWELS = "aeıioöuü";
const lower = (s) => s.toLocaleLowerCase("tr-TR");
const normalize = (s) =>
  lower(s).replace(/[^a-zçğıöşüâîû\s]/g, " ").replace(/[âîû]/g, (c) => ({ â: "a", î: "i", û: "u" })[c])
    .replace(/\s+/g, " ").trim();
const words = (s) => normalize(s).split(" ").filter(Boolean);
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Türkçe hece kuralı: iki ünlü arasındaki son ünsüz sonraki heceye geçer.
function syllabify(word) {
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

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const similarity = (a, b) => (a === b ? 1 : 1 - levenshtein(a, b) / Math.max(a.length, b.length, 1));

// Harf düzeyinde hizalama: hangi beklenen ses yerine hangisi söylendi?
function charConfusions(expected, heard) {
  const m = expected.length, n = heard.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1));
  const out = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1)) {
      if (expected[i - 1] !== heard[j - 1]) out.push({ want: expected[i - 1], got: heard[j - 1] });
      i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      out.push({ want: expected[i - 1], got: "" }); i--;
    } else {
      j--; // fazladan söylenen ses: ipucu üretmiyoruz
    }
  }
  return out.reverse();
}

/* ---------------- Telaffuz koçu (değerlendirme) ---------------- */
// Hedef ile duyulan kelimeleri hizalar ve her kelimeye durum verir.
function alignWords(target, heard) {
  const m = target.length, n = heard.length;
  const cost = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) cost[i][0] = i;
  for (let j = 1; j <= n; j++) cost[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      cost[i][j] = Math.min(
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 1,
        cost[i - 1][j - 1] + (1 - similarity(target[i - 1], heard[j - 1])) * 1.6
      );
  const res = target.map((w) => ({ word: w, heard: null, sim: 0 }));
  let i = m, j = n;
  while (i > 0 && j > 0) {
    const sub = cost[i - 1][j - 1] + (1 - similarity(target[i - 1], heard[j - 1])) * 1.6;
    if (Math.abs(cost[i][j] - sub) < 1e-9) {
      res[i - 1].heard = heard[j - 1];
      res[i - 1].sim = similarity(target[i - 1], heard[j - 1]);
      i--; j--;
    } else if (Math.abs(cost[i][j] - (cost[i - 1][j] + 1)) < 1e-9) i--;
    else j--;
  }
  return res;
}

function evaluate(targetText, alternatives) {
  const target = words(targetText);
  let best = null;
  for (const alt of alternatives) {
    // Ses tanıma bazen kelimeleri birleştirir/ayırır; boşluksuz benzerliği de hesaba kat.
    const heard = words(alt);
    const aligned = alignWords(target, heard);
    const wordScore = aligned.reduce((s, a) => s + a.sim, 0) / target.length;
    const flatScore = similarity(target.join(""), heard.join(""));
    const score = Math.max(wordScore, flatScore);
    if (!best || score > best.score) best = { score, aligned, heardText: heard.join(" "), flatScore };
  }
  if (!best) return null;

  // Boşluksuz hali birebir aynıysa (ör. "kırkının da" / "kırkınında") her şey doğru kabul edilir.
  if (best.flatScore === 1) best.aligned.forEach((a) => { a.sim = 1; a.heard = a.heard || a.word; });

  const tips = [];
  const seen = new Set();
  for (const a of best.aligned) {
    a.status = a.sim === 1 ? "ok" : a.heard == null ? "missing" : a.sim >= 0.6 ? "close" : "bad";
    if (a.status === "close") {
      for (const c of charConfusions(a.word, a.heard)) {
        if (seen.has(c.want) || !SOUND_TIPS[c.want]) continue;
        seen.add(c.want);
        const swap = c.got ? `“${esc(c.want)}” yerine “${esc(c.got)}” gibi duydum.` : `“${esc(c.want)}” sesini duyamadım.`;
        tips.push(`<b>${esc(a.word)}</b>: ${swap} ${SOUND_TIPS[c.want]}`);
      }
    } else if (a.status === "missing") {
      tips.push(`<b>${esc(a.word)}</b> kelimesini duyamadım. Biraz daha yüksek sesle söyle. 📢`);
    } else if (a.status === "bad") {
      tips.push(`<b>${esc(a.word)}</b> kelimesini hecelere ayırarak dene: <b>${syllabify(a.word).map(esc).join(" - ")}</b>`);
    }
  }

  const allOk = best.aligned.every((a) => a.status === "ok");
  const level = allOk || best.score >= 0.92 ? "ok" : best.score >= 0.6 ? "close" : "bad";
  return { ...best, tips: tips.slice(0, 3), level };
}

/* ---------------- Ses: dinleme ve konuşma ---------------- */
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const canListen = !!Recognition;
const canSpeak = "speechSynthesis" in window;

let trVoice = null;
function pickVoice() {
  if (!canSpeak) return;
  const voices = speechSynthesis.getVoices();
  trVoice = voices.find((v) => /^tr(-|_|$)/i.test(v.lang)) || null;
}
if (canSpeak) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function say(text, rate = 0.85) {
  return new Promise((resolve) => {
    if (!canSpeak) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    if (trVoice) u.voice = trVoice;
    u.rate = rate;
    u.pitch = 1.1;
    u.onend = u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

async function saySlow(text) {
  for (const w of words(text)) {
    for (const s of syllabify(w)) await say(s, 0.6);
    await new Promise((r) => setTimeout(r, 250));
  }
}

let activeRec = null;
function listen() {
  return new Promise((resolve, reject) => {
    if (!canListen) return reject(new Error("unsupported"));
    if (canSpeak) speechSynthesis.cancel();
    const rec = new Recognition();
    activeRec = rec;
    rec.lang = "tr-TR";
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let done = false;
    rec.onresult = (e) => {
      done = true;
      const alts = [];
      for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
      resolve(alts);
    };
    rec.onerror = (e) => { if (!done) { done = true; reject(new Error(e.error || "error")); } };
    rec.onend = () => { activeRec = null; if (!done) { done = true; resolve([]); } };
    rec.start();
  });
}
function stopListening() { if (activeRec) try { activeRec.abort(); } catch { /* yok say */ } }

/* ---------------- Yönlendirme ---------------- */
const routes = {};
function go(hash) { location.hash = hash; }
function render() {
  stopListening();
  if (canSpeak) speechSynthesis.cancel();
  const [name, arg] = location.hash.replace(/^#\/?/, "").split("/");
  const view = routes[name] || routes.home;
  $back.hidden = !routes[name] || name === "home";
  view(arg ? decodeURIComponent(arg) : undefined);
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", render);
$back.addEventListener("click", () => {
  const [name, arg] = location.hash.replace(/^#\/?/, "").split("/");
  go(name === "speak" ? "#/levels" : arg !== undefined ? `#/${name}` : "#/home");
});

function mascot(text) {
  return `<div class="mascot"><div class="owl" aria-hidden="true">🦉</div><div class="bubble">${text}</div></div>`;
}

/* ---------------- Ana sayfa ---------------- */
routes.home = () => {
  $app.innerHTML = `
    ${mascot("Merhaba! Ben <b>Bilge Baykuş</b>. Birlikte Türkçeyi güzel konuşmayı öğrenelim! Bir etkinlik seç. 👇")}
    <div class="grid">
      ${tile("levels", "🎤", "Dinle ve Söyle", "Cümleyi dinle, sen de söyle. Baykuş seni dinlesin!", "Konuşma")}
      ${tile("letters", "🔠", "Harflerin Sesi", "Her harfi ve örnek kelimesini dinle.", "Dinleme")}
      ${tile("pairs", "👂", "Zor Sesler", "ı-i, o-ö, s-ş, c-ç… Hangisini duydun?", "Dinleme + Konuşma")}
      ${tile("listen", "🖼️", "Dinle Bul", "Kelimeyi dinle, doğru resmi bul.", "Dinleme")}
      ${tile("syllables", "🧩", "Hece Yapbozu", "Heceleri sırayla diz, kelimeyi kur.", "Okuma")}
    </div>
    ${!canListen ? `<p class="notice" style="margin-top:16px">ℹ️ Bu tarayıcı ses tanımayı desteklemiyor. Konuşma etkinlikleri için Android'de veya bilgisayarda <b>Google Chrome</b> kullanın.</p>` : ""}
  `;
};
function tile(route, icon, title, desc, badge) {
  return `<button class="tile" onclick="go('#/${route}')">
    <span class="ic" aria-hidden="true">${icon}</span>
    <span class="t">${title}</span>
    <span class="d">${desc}</span>
    <span class="badge">${badge}</span>
  </button>`;
}

/* ---------------- Dinle ve Söyle: seviye seçimi ---------------- */
routes.levels = () => {
  const done = store.get("done", {});
  $app.innerHTML = `
    ${mascot("Hangi seviyede çalışalım? Önce dinle, sonra mikrofona basıp söyle.")}
    <div class="grid">
      ${SPEAK_LEVELS.map((lv) => {
        const n = (done[lv.id] || []).length;
        return `<button class="tile" onclick="go('#/speak/${lv.id}')">
          <span class="ic">${lv.icon}</span>
          <span class="t">${lv.title}</span>
          <span class="d">${n} / ${lv.items.length} tamamlandı</span>
          <span class="badge">${lv.grade}</span>
        </button>`;
      }).join("")}
    </div>`;
};

/* ---------------- Dinle ve Söyle: alıştırma ---------------- */
routes.speak = (levelId) => {
  const level = SPEAK_LEVELS.find((l) => l.id === levelId);
  if (!level) return go("#/levels");
  let index = 0;
  let tries = 0;

  const markDone = (text) => {
    const done = store.get("done", {});
    const list = done[level.id] || [];
    if (!list.includes(text)) list.push(text);
    done[level.id] = list;
    store.set("done", done);
  };

  function show(feedback) {
    const item = level.items[index];
    const wordsHtml = feedback
      ? feedback.aligned.map((a) => `<span class="w ${a.status}">${esc(a.word)}</span>`).join(" ")
      : esc(item);
    $app.innerHTML = `
      <h2>${level.icon} ${level.title}</h2>
      <div class="progress"><i style="width:${(index / level.items.length) * 100}%"></i></div>
      <div class="card">
        <p class="muted center">${index + 1}. / ${level.items.length}</p>
        <div class="target">${wordsHtml}</div>
        <div class="syll">${words(item).map((w) => syllabify(w).join("·")).join("  ")}</div>
        <div class="row">
          <button class="btn" id="play">🔊 Dinle</button>
          <button class="btn" id="slow">🐢 Yavaş</button>
        </div>
        ${canListen
          ? `<button class="mic" id="mic" aria-label="Konuş">🎤</button>
             <p class="center muted" id="micHint">Mikrofona bas ve söyle</p>`
          : `<p class="notice">Ses tanıma bu tarayıcıda yok. Cümleyi yüksek sesle oku, öğretmenin/velin değerlendirsin:</p>
             <div class="row"><button class="btn primary" id="selfOk">✅ Doğru söyledim</button><button class="btn" id="selfAgain">🔁 Tekrar</button></div>`}
        <div id="fb">${feedback ? feedbackHtml(feedback) : ""}</div>
      </div>`;

    document.getElementById("play").onclick = () => say(item);
    document.getElementById("slow").onclick = () => saySlow(item);
    const mic = document.getElementById("mic");
    if (mic) mic.onclick = () => record(mic);
    const selfOk = document.getElementById("selfOk");
    if (selfOk) {
      selfOk.onclick = () => success();
      document.getElementById("selfAgain").onclick = () => say(item);
    }
    bindFeedbackButtons();
  }

  function feedbackHtml(fb) {
    if (fb.level === "ok") {
      return `<div class="feedback ok"><div class="title">🎉 Harika! Doğru söyledin!</div>
        <p>Duyduğum: “${esc(fb.heardText)}”</p></div>`;
    }
    const title = fb.level === "close" ? "👍 Çok yaklaştın! Bir daha deneyelim." : "💪 Hadi bir daha deneyelim!";
    return `<div class="feedback ${fb.level}">
      <div class="title">${title}</div>
      <p>Duyduğum: “${esc(fb.heardText || "…")}”</p>
      ${fb.tips.length ? `<ul>${fb.tips.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}
      <div class="row">
        <button class="btn" data-act="slow">🐢 Yavaş dinle</button>
        ${tries >= 2 ? `<button class="btn" data-act="skip">⏭️ Sonrakine geç</button>` : ""}
      </div>
    </div>`;
  }

  function bindFeedbackButtons() {
    $app.querySelectorAll("[data-act]").forEach((b) => {
      b.onclick = () => {
        if (b.dataset.act === "slow") saySlow(level.items[index]);
        if (b.dataset.act === "skip") next();
      };
    });
  }

  async function record(mic) {
    if (mic.classList.contains("listening")) return stopListening();
    mic.classList.add("listening");
    document.getElementById("micHint").textContent = "Dinliyorum… şimdi söyle!";
    let alts = [];
    try {
      alts = await listen();
    } catch (e) {
      mic.classList.remove("listening");
      const msg = e.message === "not-allowed" || e.message === "service-not-allowed"
        ? "Mikrofon izni gerekiyor. Tarayıcı ayarlarından izin ver."
        : e.message === "network" ? "Ses tanıma için internet bağlantısı gerekiyor."
        : "Sesini duyamadım, tekrar dene.";
      toast(msg, 3000);
      document.getElementById("micHint").textContent = "Mikrofona bas ve söyle";
      return;
    }
    mic.classList.remove("listening");
    if (!alts.length) {
      toast("Sesini duyamadım, biraz daha yüksek söyle 📢");
      document.getElementById("micHint").textContent = "Mikrofona bas ve söyle";
      return;
    }
    tries++;
    const fb = evaluate(level.items[index], alts);
    show(fb);
    if (fb.level === "ok") {
      success();
    } else {
      say(fb.level === "close" ? "Çok yaklaştın. Bir daha dene." : "Hadi bir daha deneyelim.");
    }
  }

  async function success() {
    addStars(tries <= 1 ? 3 : tries === 2 ? 2 : 1);
    markDone(level.items[index]);
    await say("Aferin! Doğru söyledin.");
    setTimeout(next, 600);
  }

  function next() {
    tries = 0;
    index++;
    if (index >= level.items.length) {
      $app.innerHTML = `${mascot("Tebrikler! Bu bölümü bitirdin! 🏆")}
        <div class="card center"><div style="font-size:80px">🏆</div>
        <h2>Bölüm tamamlandı!</h2><p>Toplam yıldızın: ⭐ ${stars}</p>
        <div class="row"><button class="btn primary big" onclick="go('#/levels')">Başka bölüm seç</button></div></div>`;
      say("Tebrikler! Bölümü bitirdin.");
      return;
    }
    show();
    say(level.items[index]);
  }

  show();
  say(level.items[index]);
};

/* ---------------- Harflerin Sesi ---------------- */
routes.letters = () => {
  $app.innerHTML = `
    ${mascot("Bir harfe dokun, sesini ve örnek kelimesini dinle!")}
    <div class="card center" id="detail"><p class="muted">Bir harf seç 👇</p></div>
    <div class="letters">
      ${LETTERS.map((x, i) => `<button class="letter" data-i="${i}">${x.l}<small>${x.l.toLocaleLowerCase("tr-TR")}</small></button>`).join("")}
    </div>`;
  $app.querySelectorAll(".letter").forEach((b) => {
    b.onclick = () => {
      $app.querySelectorAll(".letter.on").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      const x = LETTERS[+b.dataset.i];
      const small = x.l.toLocaleLowerCase("tr-TR");
      document.getElementById("detail").innerHTML = `
        <div style="font-size:70px">${x.e}</div>
        <div class="target">${x.l} ${small} — ${x.w}</div>
        ${SOUND_TIPS[small] ? `<p>${SOUND_TIPS[small]}</p>` : ""}
        <div class="row"><button class="btn" id="again">🔊 Tekrar dinle</button></div>`;
      document.getElementById("again").onclick = () => sayLetter(x);
      sayLetter(x);
    };
  });
};
async function sayLetter(x) {
  await say(x.l.toLocaleLowerCase("tr-TR"), 0.7);
  await say(x.w, 0.75);
}

/* ---------------- Zor Sesler ---------------- */
routes.pairs = (idx) => {
  if (idx === undefined) {
    $app.innerHTML = `
      ${mascot("Bazı sesler birbirine çok benzer. Hangisini çalışmak istersin?")}
      <div class="grid">
        ${SOUND_PAIRS.map((p, i) => `<button class="tile" onclick="go('#/pairs/${i}')">
          <span class="t" style="font-size:34px">${p.a} – ${p.b}</span>
          <span class="d">${p.words.map((w) => w.join("/")).join(", ")}</span></button>`).join("")}
      </div>`;
    return;
  }
  const pair = SOUND_PAIRS[+idx];
  if (!pair) return go("#/pairs");
  let round = 0;
  let correct = 0;
  const ROUNDS = 6;

  function quiz() {
    if (round >= ROUNDS) return finish();
    const [w1, w2] = pair.words[round % pair.words.length];
    const answer = Math.random() < 0.5 ? w1 : w2;
    $app.innerHTML = `
      <h2>👂 ${pair.a} mı, ${pair.b} mi?</h2>
      <div class="progress"><i style="width:${(round / ROUNDS) * 100}%"></i></div>
      <div class="card">
        <div class="row"><button class="btn primary big" id="hear">🔊 Dinle</button></div>
        <p class="center muted">Hangi kelimeyi duydun?</p>
        <div class="pair">
          <button class="btn" data-w="${esc(w1)}">${esc(w1)}</button>
          <button class="btn" data-w="${esc(w2)}">${esc(w2)}</button>
        </div>
        <div class="grid" style="margin-top:14px;grid-template-columns:1fr 1fr">
          <div class="center"><p>${esc(SOUND_TIPS[pair.a] || "")}</p></div>
          <div class="center"><p>${esc(SOUND_TIPS[pair.b] || "")}</p></div>
        </div>
      </div>`;
    document.getElementById("hear").onclick = () => say(answer, 0.7);
    say(answer, 0.7);
    $app.querySelectorAll("[data-w]").forEach((b) => {
      b.onclick = async () => {
        if (b.dataset.w === answer) {
          correct++; addStars(1);
          b.style.background = "var(--ok-bg)";
          await say("Doğru!");
          speakTurn(answer);
        } else {
          b.style.background = "var(--bad-bg)";
          await say(`Bu ${answer} idi. Dinle: ${answer}`, 0.7);
          speakTurn(answer);
        }
      };
    });
  }

  // Dinlemeden sonra çocuk aynı kelimeyi kendisi söyler.
  function speakTurn(word) {
    $app.querySelector(".card").insertAdjacentHTML("beforeend", `
      <div class="feedback close" id="turn">
        <div class="title">Şimdi sen söyle: “${esc(word)}”</div>
        ${canListen ? `<button class="mic" id="mic">🎤</button>` : ""}
        <div class="row"><button class="btn" id="skip">⏭️ Devam</button></div>
      </div>`);
    $app.querySelectorAll("[data-w]").forEach((b) => (b.disabled = true));
    document.getElementById("skip").onclick = () => { round++; quiz(); };
    const mic = document.getElementById("mic");
    if (!mic) return;
    mic.onclick = async () => {
      mic.classList.add("listening");
      let alts = [];
      try { alts = await listen(); } catch { /* aşağıda ele alınır */ }
      mic.classList.remove("listening");
      const turn = document.getElementById("turn");
      if (!alts.length) return toast("Sesini duyamadım, tekrar dene 📢");
      const fb = evaluate(word, alts);
      if (fb.level === "ok") {
        addStars(1);
        turn.className = "feedback ok";
        turn.querySelector(".title").textContent = "🎉 Süper! Doğru söyledin!";
        await say("Süper!");
        round++; quiz();
      } else {
        turn.className = "feedback bad";
        turn.querySelector(".title").innerHTML = `“${esc(fb.heardText)}” duydum. ${fb.tips[0] || "Bir daha dene!"}`;
        say(word, 0.6);
      }
    };
  }

  function finish() {
    $app.innerHTML = `${mascot(`${ROUNDS} sorudan <b>${correct}</b> tanesini doğru buldun! 👏`)}
      <div class="row"><button class="btn primary big" onclick="go('#/pairs/${idx}');render()">🔁 Tekrar oyna</button>
      <button class="btn big" onclick="go('#/pairs')">Başka ses</button></div>`;
    say(`${ROUNDS} sorudan ${correct} tanesini doğru buldun.`);
  }

  quiz();
};

/* ---------------- Dinle Bul ---------------- */
routes.listen = () => {
  let round = 0;
  let correct = 0;
  const ROUNDS = 8;
  const order = shuffle(PICTURE_WORDS).slice(0, ROUNDS);

  function q() {
    if (round >= ROUNDS) {
      $app.innerHTML = `${mascot(`${ROUNDS} kelimeden <b>${correct}</b> tanesini buldun! 🌟`)}
        <div class="row"><button class="btn primary big" onclick="render()">🔁 Tekrar oyna</button></div>`;
      say(`Harika! ${correct} doğru.`);
      return;
    }
    const target = order[round];
    const options = shuffle([target, ...shuffle(PICTURE_WORDS.filter((x) => x !== target)).slice(0, 3)]);
    $app.innerHTML = `
      <h2>🖼️ Dinle Bul</h2>
      <div class="progress"><i style="width:${(round / ROUNDS) * 100}%"></i></div>
      <div class="row" style="margin-bottom:14px"><button class="btn primary big" id="hear">🔊 Kelimeyi dinle</button></div>
      <div class="choices">
        ${options.map((o) => `<button class="choice" data-w="${esc(o.w)}">${o.e}<span hidden>${esc(o.w)}</span></button>`).join("")}
      </div>`;
    document.getElementById("hear").onclick = () => say(target.w, 0.75);
    say(target.w, 0.75);
    let locked = false;
    $app.querySelectorAll(".choice").forEach((b) => {
      b.onclick = async () => {
        if (locked) return;
        b.querySelector("span").hidden = false;
        if (b.dataset.w === target.w) {
          locked = true;
          b.classList.add("right");
          correct++; addStars(1);
          await say(`Doğru! ${target.w}`);
          round++; q();
        } else {
          b.classList.add("wrong");
          await say(`Bu ${b.dataset.w}. Tekrar dinle: ${target.w}`, 0.8);
        }
      };
    });
  }
  q();
};

/* ---------------- Hece Yapbozu ---------------- */
routes.syllables = () => {
  let round = 0;
  const ROUNDS = 6;
  const order = shuffle(SYLLABLE_WORDS).slice(0, ROUNDS);

  function q() {
    if (round >= ROUNDS) {
      $app.innerHTML = `${mascot("Bütün yapbozları tamamladın! 🧩🎉")}
        <div class="row"><button class="btn primary big" onclick="render()">🔁 Tekrar oyna</button></div>`;
      say("Bütün yapbozları tamamladın!");
      return;
    }
    const item = order[round];
    const parts = syllabify(item.w);
    let built = [];
    const pool = shuffle(parts.map((p, i) => ({ p, i })));

    function draw() {
      $app.innerHTML = `
        <h2>🧩 Hece Yapbozu</h2>
        <div class="progress"><i style="width:${(round / ROUNDS) * 100}%"></i></div>
        <div class="card center">
          <div style="font-size:72px">${item.e}</div>
          <div class="row" style="margin:0 0 12px"><button class="btn" id="hear">🔊 Dinle</button></div>
          <div class="slot chips" id="slot">${built.map((b) => `<span class="chip">${esc(b.p)}</span>`).join("") || `<span class="muted">Heceleri sırayla buraya diz</span>`}</div>
          <div class="chips">
            ${pool.map((x, k) => `<button class="chip" data-k="${k}" ${built.includes(x) ? "hidden" : ""}>${esc(x.p)}</button>`).join("")}
          </div>
          <div class="row"><button class="btn" id="undo">↩️ Geri al</button></div>
        </div>`;
      document.getElementById("hear").onclick = () => saySlow(item.w);
      document.getElementById("undo").onclick = () => { built.pop(); draw(); };
      $app.querySelectorAll("[data-k]").forEach((b) => {
        b.onclick = async () => {
          const x = pool[+b.dataset.k];
          say(x.p, 0.7);
          // Aynı heceden iki tane olabilir (ör. ke-le-bek değil ama ba-ba); metne göre kontrol et.
          if (x.p !== parts[built.length]) {
            toast("Bu hece buraya gelmiyor, tekrar dene 🙂");
            return;
          }
          built.push(x);
          draw();
          if (built.length === parts.length) {
            addStars(2);
            await say(`Harika! ${item.w}`);
            round++; q();
          }
        };
      });
    }
    draw();
    saySlow(item.w);
  }
  q();
};

/* ---------------- Başlat ---------------- */
render();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
