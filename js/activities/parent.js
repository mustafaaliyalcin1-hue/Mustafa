// Veli / Öğretmen paneli: basit bir ebeveyn kapısının arkasında ilerleme ve ayarlar.

import { $app, route, go, on, toast, progressBar } from "../ui.js";
import { say } from "../speech.js";
import { THEMES, STORIES, BADGES, AVATARS } from "../content.js";
import { esc } from "../text.js";
import * as store from "../store.js";

let unlockedUntil = 0;

route("parent", () => {
  if (Date.now() < unlockedUntil) return panel();
  // Ebeveyn kapısı: çocukların ayarlara girmesini engeller.
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  $app.innerHTML = `
    <div class="card center">
      <h2>👨‍👩‍👧 Veli / Öğretmen Girişi</h2>
      <p>Devam etmek için işlemin sonucunu yazın:</p>
      <p class="target">${a} × ${b} = ?</p>
      <input id="ans" class="ans" inputmode="numeric" autocomplete="off" aria-label="Cevap">
      <div class="row"><button class="btn primary" id="ok">Giriş</button></div>
    </div>`;
  const check = () => {
    if (+$app.querySelector("#ans").value === a * b) {
      unlockedUntil = Date.now() + 10 * 60 * 1000;
      panel();
    } else toast("Yanlış cevap");
  };
  on("#ok", check);
  $app.querySelector("#ans").addEventListener("keydown", (e) => e.key === "Enter" && check());
});

function panel() {
  const s = store.get();
  const p = s.profile;
  const g = p.grade;
  const acc = s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
  const first = s.correct ? Math.round((s.firstTry / s.correct) * 100) : 0;
  const weak = store.weakList(8);
  const maxWeak = weak[0]?.[1] || 1;

  // Son 7 gün
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { label: d.toLocaleDateString("tr-TR", { weekday: "short" }), n: s.days[k] || 0 };
  });
  const maxDay = Math.max(store.DAILY_GOAL, ...days.map((d) => d.n));

  $app.innerHTML = `
    <h2>👨‍👩‍👧 ${esc(p.name)} — İlerleme Raporu</h2>

    <div class="stats">
      <div class="stat"><b>⭐ ${s.stars}</b><span>toplam yıldız</span></div>
      <div class="stat"><b>🗣️ ${s.correct}</b><span>doğru söylenen</span></div>
      <div class="stat"><b>${acc}%</b><span>doğruluk</span></div>
      <div class="stat"><b>${first}%</b><span>ilk denemede</span></div>
      <div class="stat"><b>🔥 ${store.streak()}</b><span>gün seri</span></div>
    </div>

    <div class="card">
      <h3>Son 7 gün (yıldız)</h3>
      <div class="week">
        ${days.map((d) => `<div class="day"><div class="bar-v"><i style="height:${(d.n / maxDay) * 100}%"></i></div><b>${d.n}</b><span>${esc(d.label)}</span></div>`).join("")}
      </div>
    </div>

    <div class="card">
      <h3>Zorlandığı sesler</h3>
      ${weak.length
        ? `<p class="muted">Ses tanıma bu seslerde farklılık yakaladı. “Zor Seslerim” etkinliği bu seslere göre kelime seçer.</p>
           ${weak.map(([c, n]) => `<div class="hbar"><span class="k">${esc(c)}</span><div class="bar"><i style="width:${(n / maxWeak) * 100}%"></i></div><span>${n}</span></div>`).join("")}`
        : `<p class="muted">Henüz belirgin bir zorluk görünmüyor. 👍</p>`}
    </div>

    <div class="card">
      <h3>Konular (${g}. sınıf)</h3>
      ${THEMES.map((t) => {
        const items = t.items.filter((x) => x.g === g);
        const n = items.filter((x) => store.isDone(t.id, x.t)).length;
        return `<div class="hrow"><span>${t.icon} ${esc(t.title)}</span>${progressBar(n, items.length)}<span>${n}/${items.length}</span></div>`;
      }).join("")}
      ${STORIES.map((st) => {
        const n = store.doneCount("story:" + st.id);
        return `<div class="hrow"><span>${st.icon} ${esc(st.title)}</span>${progressBar(n, st.lines.length)}<span>${n}/${st.lines.length}</span></div>`;
      }).join("")}
    </div>

    <div class="card">
      <h3>Rozetler</h3>
      <div class="badges">
        ${BADGES.map((b) => `<div class="b ${s.badges.includes(b.id) ? "" : "locked"}" title="${esc(b.desc)}"><span>${b.icon}</span><small>${esc(b.title)}</small></div>`).join("")}
      </div>
    </div>

    <div class="card settings">
      <h3>Ayarlar</h3>
      <label class="field">Ad <input id="name" value="${esc(p.name)}" maxlength="20"></label>
      <p class="label">Sınıf</p>
      <div class="seg" id="grade"><button data-g="1" class="${g === 1 ? "on" : ""}">1. sınıf</button><button data-g="2" class="${g === 2 ? "on" : ""}">2. sınıf</button></div>
      <p class="label">Arkadaş</p>
      <div class="avatars">${AVATARS.map((a) => `<button data-a="${a}" class="${a === p.avatar ? "on" : ""}">${a}</button>`).join("")}</div>
      <label class="field">Okuma hızı: <span id="rateVal">${s.settings.rate.toFixed(2)}</span>
        <input type="range" id="rate" min="0.5" max="1.1" step="0.05" value="${s.settings.rate}">
      </label>
      <label class="check"><input type="checkbox" id="sfx" ${s.settings.sfx ? "checked" : ""}> Oyun sesleri</label>
      <div class="row">
        <button class="btn" id="testVoice">🔊 Sesi dene</button>
        <button class="btn danger" id="reset">🗑️ İlerlemeyi sıfırla</button>
      </div>
    </div>

    <p class="muted small">Gizlilik: Uygulama hesap açmaz, kişisel veri toplamaz; ilerleme yalnızca bu cihazda saklanır.
      Konuşma tanıma, cihazın/tarayıcının ses tanıma hizmetiyle yapılır ve ses kaydı uygulamada saklanmaz.
      <a href="privacy.html">Gizlilik politikası</a></p>`;

  $app.querySelector("#name").addEventListener("change", (e) => store.setProfile({ name: e.target.value.trim() || p.name }));
  on("#grade button", (b) => { store.setProfile({ grade: +b.dataset.g }); panel(); });
  on(".avatars button", (b) => { store.setProfile({ avatar: b.dataset.a }); panel(); });
  $app.querySelector("#rate").addEventListener("input", (e) => {
    store.setSetting("rate", +e.target.value);
    $app.querySelector("#rateVal").textContent = (+e.target.value).toFixed(2);
  });
  $app.querySelector("#sfx").addEventListener("change", (e) => store.setSetting("sfx", e.target.checked));
  on("#testVoice", () => say("Merhaba! Ben Bilge Baykuş. Seninle Türkçe çalışmayı çok seviyorum."));
  on("#reset", () => {
    if (confirm("Tüm yıldızlar, rozetler ve ilerleme silinsin mi?")) {
      store.reset();
      toast("İlerleme sıfırlandı");
      go("#/home");
    }
  });
}
