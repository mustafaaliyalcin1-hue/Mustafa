// Hikâye Oku: önce baykuş okur (kelime kelime vurgulanır), sonra çocuk cümle cümle okur.
// İngilizce hikâyelerde her cümlenin altında Türkçe anlamı da yazar.

import { $app, route, go, mascot, onLeave, on } from "../ui.js";
import { say, stopSpeaking } from "../speech.js";
import { STORIES } from "../content.js";
import { EN_STORIES } from "../content-en.js";
import { startPractice } from "./practice.js";
import { esc } from "../text.js";
import * as store from "../store.js";

// Türkçe hikâye satırları düz metin, İngilizceler { t, tr }.
const lineOf = (l) => (typeof l === "string" ? { t: l } : l);

route("stories", () => {
  const en = store.lang() === "en";
  const g = store.get().profile?.grade || 1;
  const list = [...(en ? EN_STORIES : STORIES)].sort((a, b) => (a.g === g ? 0 : 1) - (b.g === g ? 0 : 1));
  $app.innerHTML = `
    ${mascot(en ? "Bir hikâye seç. Önce ben İngilizce okuyacağım, sonra sen okuyacaksın! 🇬🇧" : "Bir hikâye seç. Önce ben okuyacağım, sonra sen okuyacaksın!")}
    <div class="grid">
      ${list.map((s) => {
        const n = store.doneCount("story:" + s.id);
        return `<a class="tile" href="#/story/${s.id}">
          <span class="ic">${s.icon}</span>
          <span class="t">${esc(s.title)}</span>
          ${s.tr ? `<span class="d">${esc(s.tr)}</span>` : ""}
          <span class="d">${s.lines.length} cümle · ${n === s.lines.length ? "✅ Okundu" : `${n} / ${s.lines.length}`}</span>
          <span class="badge">${s.g}. sınıf</span>
        </a>`;
      }).join("")}
    </div>`;
});

route("story", (id) => {
  const en = EN_STORIES.some((s) => s.id === id);
  const story = [...STORIES, ...EN_STORIES].find((s) => s.id === id);
  if (!story) return go("#/stories");
  const lang = en ? "en" : "tr";
  const lines = story.lines.map(lineOf);
  let alive = true;
  onLeave(() => { alive = false; });

  $app.innerHTML = `
    <div class="card story">
      <div class="pic">${story.icon}</div>
      <h2 class="center">${esc(story.title)}${story.tr ? `<br><small class="muted">${esc(story.tr)}</small>` : ""}</h2>
      ${lines.map((l, i) => `<p class="line" data-l="${i}">${l.t.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ")}${
        l.tr ? `<small class="line-tr">🇹🇷 ${esc(l.tr)}</small>` : ""}</p>`).join("")}
      <div class="row">
        <button class="btn" id="listen">🔊 Hikâyeyi dinle</button>
        <button class="btn primary big" id="read">🎤 Şimdi ben okuyayım</button>
      </div>
    </div>`;

  let run = 0;
  async function readAloud() {
    const my = ++run; // yeniden basılırsa önceki okuma durur
    for (let i = 0; i < lines.length && alive && my === run; i++) {
      const spans = $app.querySelectorAll(`[data-l="${i}"] .w`);
      $app.querySelectorAll(".line").forEach((el, k) => el.classList.toggle("current", k === i));
      await say(lines[i].t, { lang, onWord: (k) => spans.forEach((s, j) => s.classList.toggle("reading", j === k)) });
      await new Promise((r) => setTimeout(r, 350));
    }
    $app.querySelectorAll(".line").forEach((el) => el.classList.remove("current"));
  }

  on("#listen", () => readAloud());
  on("#read", () => {
    alive = false; // dinleme döngüsünü durdur
    stopSpeaking();
    startPractice({
      title: story.title,
      icon: story.icon,
      items: lines,
      lang,
      listId: "story:" + story.id,
      backHash: "#/stories",
      onFinish: () => ({ story: true }),
    });
  });
  setTimeout(() => alive && readAloud(), 400);
}, "#/stories");
