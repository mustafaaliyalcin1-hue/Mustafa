// Köprü Oyunu: söylenen kelime soldaki mi sağdaki taşta mı? ← / → tuşlarıyla (ya da dokunarak) doğru taşa zıpla.
// Süre bitmeden köprünün sonuna var. Yanlış taş düşürmez: sallanır, 3 saniye eksilir, aynı basamak tekrar denenir.

import { icon } from "../icons.js";
import { $app, route, go, owl, showBadges, onLeave, on } from "../ui.js";
import { say } from "../speech.js";
import { SOUND_PAIRS, PICTURE_WORDS } from "../content.js";
import { EN_SOUND_PAIRS } from "../content-en.js";
import { shuffle, esc } from "../text.js";
import { sfx, confetti } from "../fx.js";
import * as store from "../store.js";

const STEPS = 10;
const PENALTY = 3; // yanlışta eksilen saniye
const BLOCK = new Set(["öl"]); // çocuklara uygun olmayan kelime

function makeSteps(en, grade) {
  // Yarısı benzer sesli çift (kır/kir), yarısı resimli kelime çifti
  const minimal = (en ? EN_SOUND_PAIRS : SOUND_PAIRS).flatMap((p) => p.words).filter(([a, b]) => !BLOCK.has(a) && !BLOCK.has(b));
  const pics = shuffle(PICTURE_WORDS).map((p) => (en ? p.en : p.w));
  const pairs = shuffle(minimal).slice(0, grade === 1 ? 4 : 6);
  for (let k = 0; pairs.length < STEPS; k += 2) pairs.push([pics[k], pics[k + 1]]);
  return shuffle(pairs).map(([a, b]) => {
    const target = Math.random() < 0.5 ? a : b;
    const sides = Math.random() < 0.5 ? [a, b] : [b, a];
    return { left: sides[0], right: sides[1], target, answer: sides[0] === target ? "left" : "right" };
  });
}

route("kopru", () => {
  const en = store.lang() === "en";
  const lang = en ? "en" : "tr";
  const grade = store.get().profile?.grade || 1;
  const TIME = grade === 1 ? 75 : 60;
  let alive = true;
  let steps, step, timeLeft, timer, busy, started, wrongs;

  function intro() {
    $app.innerHTML = `
      <div class="card center br-intro">
        <h1>Köprü Oyunu</h1>
        <div class="br-intro-art" aria-hidden="true">
          <span class="br-mini l"></span><span class="br-mini r ok"></span>
          <span class="br-mini l ok"></span><span class="br-mini r"></span>
        </div>
        <p class="br-rule">Kelimeyi dinle. Doğru kelime hangi taştaysa oraya zıpla.</p>
        <div class="br-keys"><span class="br-key">${icon("arrow-left")}</span> sol taş <span class="br-key">${icon("arrow-right")}</span> sağ taş</div>
        <p class="muted">${STEPS} basamak · ${TIME} saniye. Yanlış taş 3 saniye götürür.</p>
        <button class="btn primary big" id="start">Başla ${icon("play", 18)}</button>
        ${best() ? `<p class="muted small">En iyi sonucun: ${best()} saniye kaldı</p>` : ""}
      </div>`;
    on("#start", start);
  }
  const best = () => store.get().bridgeBest?.[lang] || 0;

  function start() {
    steps = makeSteps(en, grade);
    step = 0; timeLeft = TIME; busy = false; started = true; wrongs = 0;
    draw();
    speak();
    clearInterval(timer);
    timer = setInterval(() => {
      if (!alive) return clearInterval(timer);
      timeLeft = Math.max(0, timeLeft - 1);
      paintTime();
      if (timeLeft <= 5 && timeLeft > 0) sfx.tap();
      if (timeLeft <= 0) { clearInterval(timer); end(false); }
    }, 1000);
  }

  const speak = () => steps[step] && say(steps[step].target, { lang, rate: 0.85 });

  function paintTime() {
    const t = $app.querySelector("#brTime");
    const bar = $app.querySelector("#brBar");
    if (!t || !bar) return;
    t.textContent = timeLeft;
    bar.style.width = `${(timeLeft / TIME) * 100}%`;
    $app.querySelector(".br-timer")?.classList.toggle("low", timeLeft <= 10);
  }

  function draw() {
    // Köprü aşağıdan yukarıya: en altta başlangıç, en üstte bitiş
    const rows = steps.map((s, i) => {
      const passed = i < step, now = i === step;
      const tile = (side) => {
        const word = s[side];
        const cls = passed ? (s.answer === side ? "ok" : "off") : now ? "now" : "";
        return `<button class="br-tile ${side} ${cls}" data-side="${side}" ${now ? "" : "disabled tabindex=-1"} aria-label="${now ? `${side === "left" ? "Sol" : "Sağ"} taş: ${esc(word)}` : ""}">
          ${now || passed ? `<span>${esc(word)}</span>` : ""}
          ${passed && s.answer === side ? `<span class="br-buddy-spot"></span>` : ""}
        </button>`;
      };
      return `<div class="br-row ${passed ? "passed" : now ? "current" : "future"}" data-i="${i}">${tile("left")}${tile("right")}</div>`;
    }).reverse().join("");
    $app.innerHTML = `
      <div class="br-top">
        <div class="br-timer"><span class="lc-wrap">${icon("flag", 18)}</span><b id="brTime">${timeLeft}</b><small>sn</small><div class="br-bar"><i id="brBar" style="width:${(timeLeft / TIME) * 100}%"></i></div></div>
        <span class="muted">${Math.min(step + 1, STEPS)} / ${STEPS}</span>
      </div>
      <div class="br-stage" id="stage">
        <div class="br-goal">${icon("flag", 20)} Bitiş</div>
        ${rows}
        <div class="br-start"><span class="br-who" id="who">${owl("happy")}</span></div>
      </div>
      <div class="br-controls">
        <button class="br-btn" data-side="left" aria-label="Sol taşa zıpla">${icon("arrow-left", 30)}</button>
        <button class="btn br-hear" id="hear" aria-label="Kelimeyi tekrar dinle">${icon("volume-2", 26)}</button>
        <button class="br-btn" data-side="right" aria-label="Sağ taşa zıpla">${icon("arrow-right", 30)}</button>
      </div>`;
    // Karakter: geçilen son doğru taşın üstüne
    if (step > 0) {
      const spot = $app.querySelector(`.br-row[data-i="${step - 1}"] .br-buddy-spot`);
      const who = $app.querySelector("#who");
      if (spot && who) spot.appendChild(who);
    }
    on("#hear", speak);
    on("[data-side]", (b) => choose(b.dataset.side));
    // Şu anki basamak görünsün
    $app.querySelector(".br-row.current")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function choose(side) {
    if (!started || busy || step >= STEPS || timeLeft <= 0) return;
    const s = steps[step];
    const tile = $app.querySelector(`.br-row.current .br-tile.${side}`);
    if (side === s.answer) {
      busy = true;
      sfx.success();
      tile?.classList.add("ok");
      const who = $app.querySelector("#who");
      who?.classList.add("jump");
      await new Promise((r) => setTimeout(r, 320));
      step++;
      busy = false;
      if (step >= STEPS) { clearInterval(timer); return end(true); }
      draw();
      speak();
    } else {
      wrongs++;
      sfx.retry();
      timeLeft = Math.max(0, timeLeft - PENALTY);
      paintTime();
      tile?.classList.add("crack");
      setTimeout(() => tile?.classList.remove("crack"), 500);
      const pen = document.createElement("span");
      pen.className = "br-pen"; pen.textContent = `−${PENALTY} sn`;
      tile?.appendChild(pen);
      setTimeout(() => pen.remove(), 900);
      say(s.target, { lang, rate: 0.8 });
      if (timeLeft <= 0) { clearInterval(timer); end(false); }
    }
  }

  function end(won) {
    started = false;
    const passed = won ? STEPS : step;
    const stars = won ? (timeLeft >= TIME * 0.4 ? 3 : timeLeft >= TIME * 0.15 ? 2 : 1) : 0;
    store.addStars(won ? stars : Math.floor(passed / 4));
    if (won && timeLeft > best()) store.setBridgeBest(lang, timeLeft);
    $app.innerHTML = `
      <div class="card center finish">
        ${owl("happy big")}
        <h2>${won ? "Köprüyü geçtin!" : "Süre bitti!"}</h2>
        ${won ? `<div class="adv-stars big" aria-label="${stars} yıldız">${[0, 1, 2].map((k) => `<i class="${k < stars ? "on" : ""}" style="animation-delay:${k * 150}ms">${icon("star", 40)}</i>`).join("")}</div>
          <p class="muted">${timeLeft} saniye kaldı${wrongs ? `, ${wrongs} yanlış taş` : ", hiç yanlış yok"}.</p>`
          : `<p class="muted">${passed} / ${STEPS} basamak geçtin. Bir daha deneyelim mi?</p>`}
        <div class="row">
          <button class="btn primary big" id="again">${icon("rotate-ccw")} ${won ? "Tekrar oyna" : "Tekrar dene"}</button>
          <button class="btn big" id="home">Ana sayfa</button>
        </div>
      </div>`;
    if (won) { sfx.success(); confetti(stars === 3 ? 30 : 14); say(stars === 3 ? "Harikasın!" : "Güzel çalıştın!"); }
    else say("Bir daha dene.");
    showBadges(store.checkBadges());
    on("#again", start);
    on("#home", () => go("#/home"));
  }

  // Klavye: ← sol, → sağ, boşluk = tekrar dinle
  const onKey = (e) => {
    if (!started) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); choose("left"); }
    else if (e.key === "ArrowRight") { e.preventDefault(); choose("right"); }
    else if (e.key === " ") { e.preventDefault(); speak(); }
  };
  document.addEventListener("keydown", onKey);
  onLeave(() => { alive = false; clearInterval(timer); document.removeEventListener("keydown", onKey); });
  intro();
});
