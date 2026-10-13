// Konuşma alıştırması: çocuk dinler, söyler; baykuş değerlendirip yönlendirir.
// Temalar, hikâyeler ve "Zor Seslerim" bu ortak ekranı kullanır.

import { $app, mascot, owl, toast, progressBar, showBadges, go, onLeave } from "../ui.js";
import { say, saySlow, listen, stopListening, canListen, listenErrorMessage } from "../speech.js";
import { evaluate } from "../coach.js";
import { words, syllabify, esc } from "../text.js";
import { sfx, confetti, starBurst } from "../fx.js";
import * as store from "../store.js";

const PRAISE = ["Aferin!", "Harika!", "Süpersin!", "Mükemmel!", "Bravo!", "Çok güzel söyledin!"];
const PRAISE_EN = ["Great job!", "Well done!", "Super!", "Excellent!", "Amazing!", "Perfect!"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/**
 * @param {object} o
 * @param {string} o.title
 * @param {string} o.icon
 * @param {{t:string, e?:string, tr?:string, p?:string}[]} o.items  tr: Türkçe anlamı, p: okunuşu (İngilizce)
 * @param {"tr"|"en"} [o.lang]  Çalışılan dil
 * @param {string} o.listId     İlerlemenin kaydedileceği liste
 * @param {string} o.backHash   Bitince dönülecek ekran
 * @param {number} [o.start]    Kaldığı yerden devam için başlangıç sırası
 * @param {(sum:{stars:number, firstTry:number, total:number}) => object} [o.onFinish]  Rozet bilgisi döndürebilir
 * @param {(fb:object, item:object) => void} [o.onCorrect]
 */
export function startPractice(o) {
  let index = Math.min(o.start || 0, o.items.length - 1);
  let tries = 0;
  let busy = false;
  let alive = true;
  const sum = { stars: 0, firstTry: 0, total: o.items.length };
  onLeave(() => { alive = false; });

  const item = () => o.items[index];
  const lang = o.lang || "tr";
  const en = lang === "en";

  function show(fb) {
    const it = item();
    const target = words(it.t, lang);
    // Orijinal yazımı (büyük harf, noktalama) koruyarak kelimelere böl
    const shown = it.t.split(/\s+/);
    const status = fb ? fb.aligned.map((a) => a.status) : [];
    const wordsHtml = shown
      .map((w, i) => `<button class="w ${status[i] || ""}" data-i="${i}" title="Dinlemek için dokun">${esc(w)}</button>`)
      .join(" ");

    $app.innerHTML = `
      <div class="practice-head">
        <h2>${o.icon} ${esc(o.title)}</h2>
        <span class="muted">${index + 1} / ${o.items.length}</span>
      </div>
      ${progressBar(index, o.items.length)}
      <div class="card practice">
        ${it.e ? `<div class="pic" aria-hidden="true">${it.e}</div>` : ""}
        <div class="target" id="target">${wordsHtml}</div>
        ${en
          ? `<div class="meaning">${it.tr ? `<span class="tr">🇹🇷 ${esc(it.tr)}</span>` : ""}${it.p ? `<span class="say">🗣️ Okunuşu: <b>${esc(it.p)}</b></span>` : ""}</div>`
          : `<div class="syll" aria-label="Heceler">${target.map((w) => syllabify(w).join("·")).join("   ")}</div>`}
        <div class="row">
          <button class="btn" id="play">🔊 Dinle</button>
          <button class="btn" id="slow">🐢 ${en ? "Yavaş" : "Hece hece"}</button>
        </div>
        ${canListen
          ? `<button class="mic" id="mic" aria-label="Konuşmak için bas">🎤</button>
             <p class="center muted" id="hint">${hintText(fb)}</p>
             <p class="interim" id="interim" aria-live="polite"></p>`
          : `<p class="notice">Bu tarayıcıda ses tanıma yok. Cümleyi yüksek sesle oku; öğretmenin ya da velin dinlesin.</p>
             <div class="row"><button class="btn primary" id="selfOk">✅ Doğru okudu</button><button class="btn" id="selfAgain">🔁 Tekrar okusun</button></div>`}
        <div id="fb">${fb ? feedbackHtml(fb) : ""}</div>
      </div>`;

    $app.querySelector("#play").onclick = () => karaoke();
    $app.querySelector("#slow").onclick = () => saySlow(it.t, { onWord: highlight, lang });
    $app.querySelectorAll(".w").forEach((b) => {
      b.onclick = () => {
        const w = en ? b.textContent : words(b.textContent)[0];
        if (w) saySlow(w, { onWord: (i) => b.classList.toggle("reading", i >= 0), lang });
      };
    });
    const mic = $app.querySelector("#mic");
    if (mic) mic.onclick = () => record(mic);
    const selfOk = $app.querySelector("#selfOk");
    if (selfOk) {
      selfOk.onclick = () => success({ level: "ok", weakSounds: [] });
      $app.querySelector("#selfAgain").onclick = () => karaoke();
    }
    $app.querySelectorAll("[data-act]").forEach((b) => {
      b.onclick = () => {
        const act = b.dataset.act;
        if (act === "next") next();
        if (act === "model") saySlow(b.dataset.word, { lang });
      };
    });
  }

  function highlight(i) {
    $app.querySelectorAll("#target .w").forEach((el, k) => el.classList.toggle("reading", k === i));
  }
  const karaoke = () => say(item().t, { onWord: highlight, lang });

  function hintText(fb) {
    if (!fb) return en ? "Dinle, sonra mikrofona bas ve İngilizce söyle" : "Dinle, sonra mikrofona bas ve söyle";
    if (fb.level === "ok") return "Sıradakine geçiyoruz… ➡️";
    if (fb.level === "almost") return "Devam etmek için “Devam”a bas";
    return "Bir daha denemek için mikrofona bas";
  }

  function feedbackHtml(fb) {
    if (fb.level === "ok") {
      return `<div class="feedback ok">${mascot(`<b>🎉 ${esc(fb.praise)}</b> Doğru söyledin!`, "happy")}</div>`;
    }
    if (fb.level === "almost") {
      return `<div class="feedback ok">
        ${mascot(`<b>👏 ${esc(fb.praise)}</b> Doğru kabul ediyorum! Küçük bir ipucu:`, "happy")}
        ${fb.tips.length ? `<ul>${fb.tips.slice(0, 1).map((t) => `<li>${t.html}</li>`).join("")}</ul>` : ""}
        <div class="row"><button class="btn primary big" data-act="next">Devam ➡️</button></div>
      </div>`;
    }
    const title = fb.level === "close" ? "Çok yaklaştın! Bir daha deneyelim. 💪" : "Hadi birlikte, yavaş yavaş deneyelim. 🙂";
    const firstWord = fb.tips[0]?.word || fb.aligned.find((a) => a.status !== "ok")?.word;
    return `<div class="feedback ${fb.level}">
      ${mascot(`<b>${title}</b><br><span class="muted">Duyduğum: “${esc(fb.heardText || "…")}”</span>`, "thinking")}
      ${fb.tips.length ? `<ul>${fb.tips.map((t) => `<li>${t.html}</li>`).join("")}</ul>` : ""}
      <div class="row">
        ${firstWord ? `<button class="btn" data-act="model" data-word="${esc(firstWord)}">🔊 “${esc(firstWord)}” nasıl söylenir?</button>` : ""}
        ${tries >= 2 ? `<button class="btn" data-act="next">⏭️ Sonrakine geç</button>` : ""}
      </div>
    </div>`;
  }

  async function record(mic) {
    if (busy) { stopListening(); return; }
    busy = true;
    mic.classList.add("listening");
    mic.setAttribute("aria-label", "Dinliyorum, bitirmek için bas");
    const hint = $app.querySelector("#hint");
    const interim = $app.querySelector("#interim");
    hint.textContent = "Dinliyorum… şimdi söyle! 👂";
    sfx.tap();
    let alts = [];
    try {
      alts = await listen({ lang, onInterim: (t) => { if (alive) interim.textContent = "“" + t + "”"; } });
    } catch (err) {
      busy = false;
      if (!alive) return;
      mic.classList.remove("listening");
      hint.textContent = "Mikrofona bas ve söyle";
      toast(listenErrorMessage(err), 3500);
      return;
    }
    busy = false;
    if (!alive) return;
    mic.classList.remove("listening");
    if (!alts.length) {
      hint.textContent = "Mikrofona bas ve söyle";
      interim.textContent = "";
      toast("Sesini duyamadım. Mikrofona yakın ve biraz daha yüksek söyle 📢");
      return;
    }
    tries++;
    const fb = evaluate(item().t, alts, { lang });
    if (fb.level === "ok" || fb.level === "almost") return success(fb);

    store.recordAttempt({ success: false, firstTry: false, weakSounds: fb.weakSounds });
    show(fb);
    sfx.retry();
    // Baykuş ne yapılacağını sesli anlatır, sonra doğrusunu örnekler.
    const opener = fb.level === "close" ? "Çok yaklaştın!" : "Hadi birlikte deneyelim.";
    await say(`${opener} ${fb.tips[0]?.speech || ""}`, { rate: 0.9 });
    if (alive && fb.tips[0]) await saySlow(fb.tips[0].word, { lang });
  }

  async function success(fb) {
    fb.praise = pick(en ? PRAISE_EN : PRAISE);
    const earned = tries <= 1 ? 3 : tries === 2 ? 2 : 1;
    sum.stars += earned;
    if (tries <= 1) sum.firstTry++;
    store.addStars(earned);
    store.recordAttempt({ success: true, firstTry: tries <= 1, weakSounds: fb.level === "almost" ? fb.weakSounds : [] });
    store.markDone(o.listId, item().t);
    o.onCorrect?.(fb, item());
    show(fb);
    sfx[fb.level === "ok" ? "success" : "almost"]();
    if (fb.level === "ok") confetti();
    starBurst(earned);
    showBadges(store.checkBadges());
    if (en) {
      await say(fb.praise, { lang: "en" });
      if (alive && fb.level === "almost" && fb.tips[0]) await say(`Doğru! Küçük bir ipucu: ${fb.tips[0].speech}`);
    } else {
      await say(fb.level === "ok" ? `${fb.praise} Doğru söyledin.` : `${fb.praise} Doğru! ${fb.tips[0]?.speech || ""}`);
    }
    if (!alive) return;
    if (fb.level === "ok") setTimeout(() => alive && next(), 700);
  }

  function next() {
    if (!alive) return;
    tries = 0;
    index++;
    if (index >= o.items.length) return finish();
    show();
    karaoke();
  }

  function finish() {
    const extra = o.onFinish?.(sum) || {};
    const perfect = sum.firstTry === sum.total;
    $app.innerHTML = `
      <div class="card center finish">
        ${owl("happy big")}
        <h2>${perfect ? "Muhteşem! Hepsini ilk seferde bildin!" : "Tebrikler! Bölümü bitirdin!"}</h2>
        <div class="summary">
          <div><b>⭐ ${sum.stars}</b><span>yıldız kazandın</span></div>
          <div><b>🎯 ${sum.firstTry} / ${sum.total}</b><span>ilk denemede doğru</span></div>
        </div>
        <div class="row">
          <button class="btn primary big" id="again">🔁 Tekrar</button>
          <button class="btn big" id="back">Devam ➡️</button>
        </div>
      </div>`;
    confetti(40);
    sfx.success();
    if (en) say(perfect ? "Perfect! Hepsini ilk seferde bildin!" : "Great job! Bölümü bitirdin!");
    else say(perfect ? "Muhteşem! Hepsini ilk seferde bildin!" : "Tebrikler! Bölümü bitirdin!");
    showBadges(store.checkBadges(extra));
    $app.querySelector("#again").onclick = () => startPractice({ ...o, start: 0 });
    $app.querySelector("#back").onclick = () => go(o.backHash);
  }

  show();
  setTimeout(() => alive && karaoke(), 300);
}
