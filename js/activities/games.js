// Dinleme ve oyun etkinlikleri: Harflerin Sesi, Benzer Sesler, Dinle Bul, Hece Yapbozu, Eksik Ses.

import { $app, route, go, mascot, owl, toast, progressBar, showBadges, onLeave, on } from "../ui.js";
import { say, saySlow, listen, canListen, listenErrorMessage } from "../speech.js";
import { evaluate } from "../coach.js";
import { LETTERS, SOUND_PAIRS, PICTURE_WORDS, PARTNER } from "../content.js";
import { SOUND_TIPS } from "../tips.js";
import { syllabify, shuffle, esc, lower } from "../text.js";
import { sfx, confetti, starBurst } from "../fx.js";
import * as store from "../store.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Oyun sonu ekranı (ortak)
function endScreen({ correct, total, again }) {
  const great = correct >= total * 0.8;
  $app.innerHTML = `
    <div class="card center finish">
      ${owl("happy big")}
      <h2>${great ? "Harikasın!" : "Güzel çalıştın!"}</h2>
      <div class="summary"><div><b>🎯 ${correct} / ${total}</b><span>doğru</span></div></div>
      <div class="row">
        <button class="btn primary big" id="again">🔁 Tekrar oyna</button>
        <button class="btn big" id="home">Ana sayfa</button>
      </div>
    </div>`;
  confetti(great ? 40 : 16);
  sfx.success();
  say(great ? `Harikasın! ${total} sorudan ${correct} doğru.` : `Güzel çalıştın! ${correct} doğru.`);
  showBadges(store.checkBadges());
  on("#again", again);
  on("#home", () => go("#/home"));
}

function reward(n) {
  store.addStars(n);
  starBurst(n);
  showBadges(store.checkBadges());
}

/* ---------- Harflerin Sesi ---------- */
route("letters", () => {
  $app.innerHTML = `
    ${mascot("Bir harfe dokun: sesini, örnek kelimesini ve ağzını nasıl kullanacağını öğren!")}
    <div class="card center letter-detail" id="detail"><p class="muted">Bir harf seç 👇</p></div>
    <div class="letters">
      ${LETTERS.map((x, i) => `<button class="letter" data-i="${i}">${x.l}<small>${lower(x.l)}</small></button>`).join("")}
    </div>`;
  on(".letter", (b) => {
    $app.querySelectorAll(".letter.on").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    const x = LETTERS[+b.dataset.i];
    const small = lower(x.l);
    const detail = $app.querySelector("#detail");
    detail.innerHTML = `
      <div class="pic">${x.e}</div>
      <div class="target">${x.l} ${small} — ${esc(x.w)}</div>
      ${SOUND_TIPS[small] ? `<p>${SOUND_TIPS[small]}</p>` : ""}
      <div class="row">
        <button class="btn" id="again">🔊 Dinle</button>
        ${canListen ? `<button class="btn primary" id="try">🎤 Ben söyleyeyim</button>` : ""}
      </div>
      <p class="interim" id="res"></p>`;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    on("#again", () => sayLetter(x), detail);
    on("#try", async (btn) => {
      btn.classList.add("listening");
      const res = detail.querySelector("#res");
      res.textContent = "Dinliyorum… “" + x.w + "” de!";
      let alts = [];
      try { alts = await listen(); } catch (e) { toast(listenErrorMessage(e)); }
      btn.classList.remove("listening");
      if (!alts.length) { res.textContent = ""; return; }
      const fb = evaluate(x.w, alts);
      if (fb.level === "ok" || fb.level === "almost") {
        res.innerHTML = `🎉 Doğru! “${esc(x.w)}”`;
        sfx.success();
        reward(1);
        say("Aferin!");
      } else {
        res.innerHTML = `“${esc(fb.heardText)}” duydum. ${fb.tips[0]?.html || "Bir daha dene!"}`;
        sfx.retry();
        await say("Bir daha dinle.");
        sayLetter(x);
      }
    }, detail);
    sayLetter(x);
  });
});

async function sayLetter(x) {
  await say(lower(x.l), { rate: 0.7 });
  await say(x.w, { rate: 0.75 });
}

/* ---------- Benzer Sesler ---------- */
route("pairs", (idx) => {
  if (idx === undefined) {
    $app.innerHTML = `
      ${mascot("Bazı sesler birbirine çok benzer. Dikkatli dinle! Hangisini çalışalım?")}
      <div class="grid">
        ${SOUND_PAIRS.map((p, i) => `<a class="tile" href="#/pairs/${i}">
          <span class="t big-pair">${p.a} – ${p.b}</span>
          <span class="d">${p.words.map((w) => w.join(" / ")).join(", ")}</span></a>`).join("")}
      </div>`;
    return;
  }
  const pair = SOUND_PAIRS[+idx];
  if (!pair) return go("#/pairs");
  let alive = true;
  onLeave(() => { alive = false; });
  const ROUNDS = 6;
  let round = 0;
  let correct = 0;

  function q() {
    if (!alive) return;
    if (round >= ROUNDS) return endScreen({ correct, total: ROUNDS, again: () => go(`#/pairs/${idx}`) });
    const [w1, w2] = shuffle(pair.words[round % pair.words.length]);
    const answer = Math.random() < 0.5 ? w1 : w2;
    $app.innerHTML = `
      <div class="practice-head"><h2>🎧 “${pair.a}” mı, “${pair.b}” mi?</h2><span class="muted">${round + 1} / ${ROUNDS}</span></div>
      ${progressBar(round, ROUNDS)}
      <div class="card">
        <div class="row"><button class="btn primary big" id="hear">🔊 Dinle</button></div>
        <p class="center muted">Hangi kelimeyi duydun?</p>
        <div class="pair">
          <button class="btn choice-word" data-w="${esc(w1)}">${esc(w1)}</button>
          <button class="btn choice-word" data-w="${esc(w2)}">${esc(w2)}</button>
        </div>
        <details class="tips"><summary>💡 Bu sesler nasıl söylenir?</summary>
          <p>${SOUND_TIPS[pair.a] || ""}</p><p>${SOUND_TIPS[pair.b] || ""}</p>
        </details>
        <div id="turn"></div>
      </div>`;
    on("#hear", () => say(answer, { rate: 0.7 }));
    say(answer, { rate: 0.7 });
    on(".choice-word", async (b) => {
      $app.querySelectorAll(".choice-word").forEach((x) => (x.disabled = true));
      if (b.dataset.w === answer) {
        correct++;
        b.classList.add("right");
        sfx.success();
        reward(1);
        await say("Doğru!");
      } else {
        b.classList.add("wrong");
        $app.querySelector(`.choice-word[data-w="${CSS.escape(answer)}"]`).classList.add("right");
        sfx.retry();
        await say(`Bu ${answer} idi.`, { rate: 0.75 });
      }
      if (alive) speakTurn(answer);
    });
  }

  // Dinledikten sonra çocuk aynı kelimeyi kendisi söyler.
  function speakTurn(word) {
    const turn = $app.querySelector("#turn");
    turn.innerHTML = `
      <div class="feedback close">
        <p class="title">Şimdi sen söyle: “${esc(word)}”</p>
        ${canListen ? `<button class="mic" id="mic" aria-label="Konuşmak için bas">🎤</button><p class="center" id="res"></p>` : ""}
        <div class="row"><button class="btn" id="skip">Devam ➡️</button></div>
      </div>`;
    on("#skip", () => { round++; q(); }, turn);
    const mic = turn.querySelector("#mic");
    if (!mic) return;
    mic.onclick = async () => {
      mic.classList.add("listening");
      let alts = [];
      try { alts = await listen(); } catch (e) { toast(listenErrorMessage(e)); }
      if (!alive) return;
      mic.classList.remove("listening");
      if (!alts.length) return;
      const fb = evaluate(word, alts);
      const box = turn.querySelector(".feedback");
      const res = turn.querySelector("#res");
      if (fb.level === "ok") {
        box.className = "feedback ok";
        res.innerHTML = "🎉 Süper! Doğru söyledin!";
        sfx.success();
        reward(1);
        await say("Süper!");
        await wait(400);
        if (alive) { round++; q(); }
      } else {
        box.className = "feedback bad";
        res.innerHTML = `“${esc(fb.heardText)}” duydum. ${fb.tips[0]?.html || "Bir daha dene!"}`;
        sfx.retry();
        store.recordAttempt({ success: false, weakSounds: fb.weakSounds });
        await say(fb.tips[0]?.speech || "Bir daha dene.");
        if (alive) say(word, { rate: 0.6 });
      }
    };
  }
  q();
}, (idx) => (idx === undefined ? "#/home" : "#/pairs"));

/* ---------- Dinle Bul ---------- */
route("listen", () => {
  let alive = true;
  onLeave(() => { alive = false; });
  const ROUNDS = 8;
  let round = 0;
  let correct = 0;
  const order = shuffle(PICTURE_WORDS).slice(0, ROUNDS);

  function q() {
    if (!alive) return;
    if (round >= ROUNDS) return endScreen({ correct, total: ROUNDS, again: () => go("#/listen") });
    const target = order[round];
    const options = shuffle([target, ...shuffle(PICTURE_WORDS.filter((x) => x !== target)).slice(0, 3)]);
    let firstTry = true;
    $app.innerHTML = `
      <div class="practice-head"><h2>🖼️ Dinle Bul</h2><span class="muted">${round + 1} / ${ROUNDS}</span></div>
      ${progressBar(round, ROUNDS)}
      <div class="row" style="margin-bottom:14px"><button class="btn primary big" id="hear">🔊 Kelimeyi dinle</button></div>
      <div class="choices">
        ${options.map((o) => `<button class="choice" data-w="${esc(o.w)}" aria-label="${esc(o.e)}">${o.e}<span hidden>${esc(o.w)}</span></button>`).join("")}
      </div>`;
    on("#hear", () => say(target.w, { rate: 0.75 }));
    say(target.w, { rate: 0.75 });
    let locked = false;
    on(".choice", async (b) => {
      if (locked || b.classList.contains("wrong")) return;
      b.querySelector("span").hidden = false;
      if (b.dataset.w === target.w) {
        locked = true;
        b.classList.add("right");
        if (firstTry) correct++;
        sfx.success();
        reward(firstTry ? 2 : 1);
        await say(`Doğru! ${target.w}`);
        await wait(300);
        round++;
        q();
      } else {
        firstTry = false;
        b.classList.add("wrong");
        sfx.retry();
        await say(`Bu ${b.dataset.w}. Tekrar dinle: ${target.w}`, { rate: 0.8 });
      }
    });
  }
  q();
});

/* ---------- Hece Yapbozu ---------- */
route("syllables", () => {
  let alive = true;
  onLeave(() => { alive = false; });
  const ROUNDS = 6;
  const g = store.get().profile?.grade || 1;
  // 1. sınıfa 2-3 heceli, 2. sınıfa daha uzun kelimeler
  const pool = PICTURE_WORDS.filter((p) => {
    const n = syllabify(p.w).length;
    return g === 1 ? n >= 2 && n <= 3 : n >= 3;
  });
  const order = shuffle(pool).slice(0, ROUNDS);
  let round = 0;
  let correct = 0;

  function q() {
    if (!alive) return;
    if (round >= ROUNDS) return endScreen({ correct, total: ROUNDS, again: () => go("#/syllables") });
    const item = order[round];
    const parts = syllabify(item.w);
    const chips = shuffle(parts.map((p, i) => ({ p, i })));
    const built = [];
    let mistakes = 0;

    function draw() {
      $app.innerHTML = `
        <div class="practice-head"><h2>🧩 Hece Yapbozu</h2><span class="muted">${round + 1} / ${ROUNDS}</span></div>
        ${progressBar(round, ROUNDS)}
        <div class="card center">
          <div class="pic">${item.e}</div>
          <div class="row" style="margin:0 0 12px"><button class="btn" id="hear">🔊 Hece hece dinle</button></div>
          <div class="slot chips" id="slot">${built.map((b) => `<span class="chip placed">${esc(b.p)}</span>`).join("") || `<span class="muted">Heceleri sırayla buraya diz</span>`}</div>
          <div class="chips">
            ${chips.map((x, k) => `<button class="chip" data-k="${k}" ${built.includes(x) ? "hidden" : ""}>${esc(x.p)}</button>`).join("")}
          </div>
        </div>`;
      on("#hear", () => saySlow(item.w));
      on("[data-k]", async (b) => {
        const x = chips[+b.dataset.k];
        // Aynı yazılışlı iki hece olabilir (ör. ba-ba); yazıya göre kontrol et.
        if (x.p !== parts[built.length]) {
          mistakes++;
          b.classList.add("shake");
          sfx.retry();
          say(x.p, { rate: 0.7 });
          setTimeout(() => b.classList.remove("shake"), 500);
          toast(`Önce “${parts[built.length]}” sesini bul 🙂`);
          return;
        }
        sfx.tap();
        built.push(x);
        draw();
        say(x.p, { rate: 0.7 });
        if (built.length === parts.length) {
          if (!mistakes) correct++;
          sfx.success();
          reward(mistakes ? 1 : 2);
          await wait(500);
          await say(`Harika! ${item.w}`);
          round++;
          q();
        }
      });
    }
    draw();
    saySlow(item.w);
  }
  q();
});

/* ---------- Eksik Ses ---------- */
route("missing", () => {
  let alive = true;
  onLeave(() => { alive = false; });
  const ROUNDS = 8;
  // Karışan bir ses içeren kelimeler
  const pool = PICTURE_WORDS.filter((p) => [...p.w].some((c) => PARTNER[c]));
  const order = shuffle(pool).slice(0, ROUNDS);
  let round = 0;
  let correct = 0;

  function q() {
    if (!alive) return;
    if (round >= ROUNDS) return endScreen({ correct, total: ROUNDS, again: () => go("#/missing") });
    const item = order[round];
    const letters = [...item.w];
    const candidates = letters.map((c, i) => (PARTNER[c] ? i : -1)).filter((i) => i >= 0);
    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    const answer = letters[pos];
    const opts = shuffle([answer, PARTNER[answer]]);
    let firstTry = true;
    $app.innerHTML = `
      <div class="practice-head"><h2>🔍 Eksik Ses</h2><span class="muted">${round + 1} / ${ROUNDS}</span></div>
      ${progressBar(round, ROUNDS)}
      <div class="card center">
        <div class="pic">${item.e}</div>
        <div class="target gap-word">${letters.map((c, i) => (i === pos ? `<span class="gap">?</span>` : esc(c))).join("")}</div>
        <div class="row"><button class="btn" id="hear">🔊 Dinle</button></div>
        <p class="muted">Hangi ses eksik?</p>
        <div class="pair">${opts.map((o) => `<button class="btn letter-opt" data-c="${esc(o)}">${esc(o)}</button>`).join("")}</div>
      </div>`;
    on("#hear", () => say(item.w, { rate: 0.7 }));
    say(item.w, { rate: 0.7 });
    on(".letter-opt", async (b) => {
      if (b.dataset.c === answer) {
        $app.querySelectorAll(".letter-opt").forEach((x) => (x.disabled = true));
        b.classList.add("right");
        $app.querySelector(".gap").outerHTML = `<span class="gap filled">${esc(answer)}</span>`;
        if (firstTry) correct++;
        sfx.success();
        reward(firstTry ? 2 : 1);
        await say(`Doğru! ${item.w}`);
        await wait(300);
        round++;
        q();
      } else {
        firstTry = false;
        b.classList.add("wrong");
        b.disabled = true;
        sfx.retry();
        await say(`Dikkatli dinle: ${item.w}`, { rate: 0.6 });
      }
    });
  }
  q();
});
