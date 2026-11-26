// Veli / Öğretmen paneli: basit bir ebeveyn kapısının arkasında ilerleme ve ayarlar.

import { $app, route, go, on, toast, progressBar } from "../ui.js";
import { say, elevenLabs as eleven } from "../speech.js";
import { THEMES, STORIES, BADGES } from "../content.js";
import { EN_THEMES, EN_STORIES } from "../content-en.js";
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
  // Türkçe ve İngilizce zorlanılan sesler birlikte
  const weak = [
    ...store.weakList(6, "tr").map(([c, n]) => [c, n, "🇹🇷"]),
    ...store.weakList(6, "en").map(([c, n]) => [c, n, "🇬🇧"]),
  ].sort((a, b) => b[1] - a[1]);
  const maxWeak = weak[0]?.[1] || 1;
  const topicRows = (themes, stories) =>
    themes.map((t) => {
      const items = t.items.filter((x) => x.g === g);
      const n = items.filter((x) => store.isDone(t.id, x.t)).length;
      return `<div class="hrow"><span>${t.icon} ${esc(t.title)}</span>${progressBar(n, items.length)}<span>${n}/${items.length}</span></div>`;
    }).join("") +
    stories.map((st) => {
      const n = store.doneCount("story:" + st.id);
      return `<div class="hrow"><span>${st.icon} ${esc(st.title)}</span>${progressBar(n, st.lines.length)}<span>${n}/${st.lines.length}</span></div>`;
    }).join("");

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
           ${weak.map(([c, n, flag]) => `<div class="hbar"><span class="k">${flag}<br>${esc(c)}</span><div class="bar"><i style="width:${(n / maxWeak) * 100}%"></i></div><span>${n}</span></div>`).join("")}`
        : `<p class="muted">Henüz belirgin bir zorluk görünmüyor. 👍</p>`}
    </div>

    <div class="card">
      <h3>🇹🇷 Türkçe konular (${g}. sınıf)</h3>
      ${topicRows(THEMES, STORIES)}
    </div>

    <div class="card">
      <h3>🇬🇧 İngilizce konular (${g}. sınıf)</h3>
      ${topicRows(EN_THEMES, EN_STORIES)}
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
      <label class="field">Karakterin adı <input id="buddy" value="${esc(store.buddy())}" maxlength="16"></label>
      <div class="row" style="margin-top:0"><a class="btn" href="#/character">👕 Karakteri giydir</a></div>
      <label class="field">Okuma hızı: <span id="rateVal">${s.settings.rate.toFixed(2)}</span>
        <input type="range" id="rate" min="0.5" max="1.1" step="0.05" value="${s.settings.rate}">
      </label>
      <label class="check"><input type="checkbox" id="sfx" ${s.settings.sfx ? "checked" : ""}> Oyun sesleri</label>
      <div class="row">
        <button class="btn" id="testVoice">🔊 Sesi dene</button>
        <button class="btn danger" id="reset">🗑️ İlerlemeyi sıfırla</button>
      </div>
    </div>

    <div class="card settings" id="elevenCard">
      <h3>🎙️ Doğal ses (ElevenLabs)</h3>
      ${eleven.server ? `
      <p class="muted small">Doğal ses <b>merkezi sunucudan</b> geliyor: API anahtarı sunucuda saklanır, cihazlara anahtar girmek gerekmez.
        Sunucuya ulaşılamazsa cihazın kendi sesi kullanılır.</p>` : `
      <p class="muted small">Robotik ses yerine ElevenLabs sesi kullanılır. Merkezi ses sunucusu kurulmadıysa anahtar buraya girilir;
        <b>yalnızca bu cihazda</b> saklanır (sadece ElevenLabs'e gönderilir). Bağlı değilse cihazın kendi sesi kullanılır.</p>
      <label class="field">API anahtarı
        <input type="password" id="elKey" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="sk_..." value="${esc(eleven.getCfg().key || "")}">
      </label>`}
      <div class="row"><button class="btn" id="elConnect">🔗 ${eleven.server ? "Sesleri getir" : "Bağlan ve sesleri getir"}</button></div>
      <label class="field" id="elVoiceWrap" ${eleven.getCfg().voice ? "" : "hidden"}>Ses
        <select id="elVoice">${eleven.getCfg().voice ? `<option value="${esc(eleven.getCfg().voice)}">${esc(eleven.getCfg().voiceName || eleven.getCfg().voice)}</option>` : ""}</select>
      </label>
      ${eleven.server ? "" : `<label class="field">Ses kimliği (Voice ID, listede yoksa elle yazın)
        <input type="text" id="elVoiceId" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(eleven.getCfg().voice || "")}">
      </label>`}
      <p class="small" id="elStatus">${eleven.server
        ? "✅ Merkezi ses sunucusu kullanılıyor" + (eleven.getCfg().voice ? " · Ses: " + esc(eleven.getCfg().voiceName || "") : " · Varsayılan ses")
        : eleven.enabled() ? "✅ Bağlı: " + esc(eleven.getCfg().voiceName || eleven.getCfg().voice) : "Bağlı değil (cihaz sesi kullanılıyor)."}</p>
      <div class="row">
        <button class="btn" id="elSave">💾 Kaydet ve dene</button>
        <button class="btn danger" id="elRemove">✖️ ${eleven.server ? "Varsayılan sese dön" : "Bağlantıyı kaldır"}</button>
      </div>
    </div>

    <p class="muted small">Gizlilik: Uygulama hesap açmaz, kişisel veri toplamaz; ilerleme yalnızca bu cihazda saklanır.
      Konuşma tanıma, cihazın/tarayıcının ses tanıma hizmetiyle yapılır ve ses kaydı uygulamada saklanmaz.
      <a href="privacy.html">Gizlilik politikası</a></p>`;

  $app.querySelector("#name").addEventListener("change", (e) => store.setProfile({ name: e.target.value.trim() || p.name }));
  on("#grade button", (b) => { store.setProfile({ grade: +b.dataset.g }); panel(); });
  $app.querySelector("#buddy").addEventListener("change", (e) => store.setProfile({ buddy: e.target.value.trim() || store.buddy() }));
  $app.querySelector("#rate").addEventListener("input", (e) => {
    store.setSetting("rate", +e.target.value);
    $app.querySelector("#rateVal").textContent = (+e.target.value).toFixed(2);
  });
  $app.querySelector("#sfx").addEventListener("change", (e) => store.setSetting("sfx", e.target.checked));
  on("#testVoice", () => say("Merhaba! Seninle Türkçe çalışmayı çok seviyorum."));
  // --- ElevenLabs ---
  const $ = (q) => $app.querySelector(q);
  const status = (t) => { $("#elStatus").textContent = t; };
  const keyVal = () => ($("#elKey")?.value || "").trim();
  const voiceVal = () => ($("#elVoiceId") ? $("#elVoiceId").value : $("#elVoice").value || "").trim();
  on("#elConnect", async (b) => {
    const key = keyVal();
    if (!eleven.server && !key) return status("Önce API anahtarını yazın.");
    b.disabled = true; status("Bağlanılıyor…");
    try {
      const voices = await eleven.listVoices(key);
      const cur = voiceVal();
      $("#elVoice").innerHTML = (eleven.server ? `<option value="">Varsayılan ses</option>` : "") +
        voices.map((v) => `<option value="${esc(v.id)}" ${v.id === cur ? "selected" : ""}>${esc(v.name)}</option>`).join("");
      $("#elVoiceWrap").hidden = false;
      if ($("#elVoiceId") && !cur && voices[0]) $("#elVoiceId").value = voices[0].id;
      status(`${voices.length} ses bulundu. Birini seçip "Kaydet ve dene"ye basın.`);
    } catch (e) {
      status("❌ " + (e.message || "Bağlanılamadı") + (eleven.server ? "" : " Ses kimliğini elle yazıp yine kaydedebilirsiniz."));
    } finally { b.disabled = false; }
  });
  $("#elVoice").addEventListener("change", (e) => { if ($("#elVoiceId")) $("#elVoiceId").value = e.target.value; });
  on("#elSave", async () => {
    const key = keyVal();
    const voice = voiceVal();
    if (!eleven.server && (!key || !voice)) return status("API anahtarı ve ses gerekli.");
    const opt = [...$("#elVoice").options].find((o) => o.value === voice);
    const name = opt ? opt.textContent : voice;
    eleven.setCfg(eleven.server ? (voice ? { voice, voiceName: name } : null) : { key, voice, voiceName: name });
    status("Deneniyor…");
    await say("Merhaba! Seninle Türkçe çalışmayı çok seviyorum.");
    status(eleven.enabled() ? "✅ " + (eleven.server ? "Sunucu sesi çalışıyor" : "Bağlı") + (voice ? ": " + name : "")
      : "❌ " + (eleven.lastError || "Ses üretilemedi.") + " Cihaz sesi kullanılıyor.");
  });
  on("#elRemove", () => {
    eleven.setCfg(null);
    if ($("#elKey")) $("#elKey").value = "";
    if ($("#elVoiceId")) $("#elVoiceId").value = "";
    $("#elVoice").innerHTML = ""; $("#elVoiceWrap").hidden = true;
    status(eleven.server ? "Varsayılan sese dönüldü." : "Bağlantı kaldırıldı (cihaz sesi kullanılıyor).");
  });
  // Tarayıcı onay penceresi bazı ortamlarda çalışmaz; onayı sayfada iste.
  on("#reset", (b) => {
    if (b.dataset.sure !== "1") {
      b.dataset.sure = "1";
      b.textContent = "⚠️ Emin misiniz? Silmek için tekrar basın";
      setTimeout(() => { b.dataset.sure = ""; b.textContent = "🗑️ İlerlemeyi sıfırla"; }, 4000);
      return;
    }
    store.reset();
    toast("İlerleme sıfırlandı");
    go("#/home");
  });
}
