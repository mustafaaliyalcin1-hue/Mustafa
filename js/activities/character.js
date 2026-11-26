// Karakterim: gövdeyi, gözlüğü, şapkayı, boyun aksesuarını, kıyafeti ve ayakkabıyı seç.

import { icon } from "../icons.js";
import { $app, route, on, toast, go, onLeave } from "../ui.js";
import { say } from "../speech.js";
import { BODIES, SLOTS, characterSVG } from "../character.js";
import { sfx, confetti } from "../fx.js";
import { esc } from "../text.js";
import * as store from "../store.js";

const TABS = [{ id: "body", name: "Karakter", icon: "🐾" }, ...SLOTS.map((s) => ({ id: s.id, name: s.name, icon: s.icon }))];
let tab = "body";
let setup = false; // ilk giriş: giydirme adımı

const itemsOf = (t) => (t === "body" ? BODIES : SLOTS.find((s) => s.id === t).items);

route("character", (mode) => {
  setup = mode === "setup";
  if (setup) tab = "glasses";
  draw();
});

function draw() {
  const s = store.get();
  const look = s.look;
  const items = itemsOf(tab);
  document.body.classList.toggle("setup-dark", setup);
  if (setup) onLeave(() => document.body.classList.remove("setup-dark"));
  $app.innerHTML = `
    ${setup ? `<div class="wel-bg" aria-hidden="true"><i class="au a"></i><i class="au b"></i><i class="au c"></i><i class="sky"></i><i class="floor"></i></div>
      <ol class="wel-steps" aria-label="Adım 3 / 3"><li class="done"><b>✓</b><span>Sen</span></li><li class="done"><b>✓</b><span>Arkadaşın</span></li><li class="on"><b>3</b><span>Giydir</span></li></ol>
      <h2 class="wel-title sm" style="text-align:center;margin:4px 0 6px">${esc(store.buddy())} için kıyafet seç</h2>
      <p class="muted" style="text-align:center;margin-top:0">Beğendiğini seç. Sonra yine değiştirebilirsin.</p>` : ""}
    <div class="card">
      <div class="char-stage" id="stage">${characterSVG(look, "happy")}</div>
      <div class="row" style="justify-content:center;margin-top:0">
        <button class="btn small" id="random">${icon("shuffle")} Karıştır</button>
        <button class="btn small" id="plain">${icon("rotate-ccw")} Sade</button>
      </div>
    </div>
    <div class="char-tabs" role="tablist">
      ${TABS.map((t) => `<button role="tab" data-t="${t.id}" class="${t.id === tab ? "on" : ""}" aria-selected="${t.id === tab}">${esc(t.name)}</button>`).join("")}
    </div>
    <div class="char-items">
      ${items.map((it) => {
        const locked = s.stars < it.stars;
        const on = look[tab] === it.id;
        const preview = { ...look, [tab]: it.id };
        return `<button data-id="${it.id}" class="${on ? "on" : ""} ${locked ? "locked" : ""}" aria-pressed="${on}">
          ${characterSVG(preview)}${esc(it.name)}
          ${locked ? `<span class="lock">${icon("star", 13)} ${it.stars}</span>` : ""}
        </button>`;
      }).join("")}
    </div>
    <p class="muted small" style="text-align:center">Yıldız topladıkça yeni parçalar açılır. Şu an <b>${s.stars}</b> yıldızın var.</p>
    ${setup ? `<button class="wel-cta" id="done">Bitti, başlayalım ${icon("arrow-right")}</button>` : ""}`;

  on("#done", () => {
    go("#/home");
    setTimeout(() => say("Harika görünüyorum! Hadi başlayalım."), 60);
  });

  on(".char-tabs button", (b) => { tab = b.dataset.t; draw(); });
  on(".char-items button", (b) => {
    const it = items.find((x) => x.id === b.dataset.id);
    if (s.stars < it.stars) {
      sfx.retry?.();
      toast(`Bunun için ${it.stars} yıldız gerekiyor. ${it.stars - s.stars} yıldız daha topla.`);
      return;
    }
    store.setLook(tab, it.id);
    sfx.tap?.();
    if (tab === "body") say(`Ben ${it.name}!`);
    const y = window.scrollY;
    draw();
    window.scrollTo(0, y);
  });
  on("#random", () => {
    const pick = (list) => {
      const open = list.filter((x) => s.stars >= x.stars);
      return open[Math.floor(Math.random() * open.length)].id;
    };
    const look2 = { body: pick(BODIES) };
    SLOTS.forEach((sl) => { look2[sl.id] = pick(sl.items); });
    store.setWholeLook(look2);
    confetti(14);
    draw();
  });
  on("#plain", () => {
    store.setWholeLook({ body: look.body });
    draw();
  });
}
