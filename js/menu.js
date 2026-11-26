// Hızlı menü (☰): tema, animasyonlar, doğal ses, oyun sesleri, okuma hızı ve kısayollar.
// Ayarlar anında uygulanır ve cihazda saklanır (GitHub'a gerek yok).
import * as store from "./store.js";
import { go } from "./ui.js";

const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");

/** Kayıtlı ayarları sayfaya uygular (açılışta ve her değişiklikte). */
export function applySettings() {
  const s = store.get().settings;
  const theme = s.theme || "auto"; // auto | light | dark
  if (theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  const dark = theme === "dark" || (theme === "auto" && media.matches);
  root.classList.toggle("is-dark", dark);
  root.classList.toggle("no-anim", s.anim === false);
}
media.addEventListener?.("change", applySettings);

const seg = (key, value, options) => `
  <div class="menu-seg" data-key="${key}">
    ${options.map(([v, label]) => `<button data-v="${v}" class="${String(value) === String(v) ? "on" : ""}">${label}</button>`).join("")}
  </div>`;

function panelHTML() {
  const s = store.get().settings;
  return `
    <div class="menu-head"><b>☰ Menü</b><button class="menu-x" aria-label="Menüyü kapat">✕</button></div>
    <nav class="menu-links">
      <a href="#/home">🏠 Ana sayfa</a>
      <a href="#/character">👕 Karakterim</a>
      <a href="#/parent">⚙️ Yönetim paneli</a>
    </nav>
    <div class="menu-group"><p>🌗 Görünüm</p>${seg("theme", s.theme || "auto", [["auto", "Otomatik"], ["light", "☀️ Aydınlık"], ["dark", "🌙 Koyu"]])}</div>
    <div class="menu-group"><p>✨ Animasyonlar</p>${seg("anim", s.anim !== false, [[true, "Açık"], [false, "Kapalı"]])}</div>
    <div class="menu-group"><p>🗣️ Doğal ses (ElevenLabs)</p>${seg("natural", s.natural !== false, [[true, "Açık"], [false, "Kapalı"]])}</div>
    <div class="menu-group"><p>🎵 Oyun sesleri</p>${seg("sfx", s.sfx !== false, [[true, "Açık"], [false, "Kapalı"]])}</div>
    <div class="menu-group"><p>🐢 Okuma hızı: <span id="menuRate">${s.rate.toFixed(2)}</span></p>
      <input type="range" id="menuRateIn" min="0.5" max="1.1" step="0.05" value="${s.rate}" aria-label="Okuma hızı"></div>
    <p class="menu-note">Ayarlar bu cihazda saklanır.</p>`;
}

let el = null;
export function openMenu() {
  if (el) return;
  el = document.createElement("div");
  el.className = "menu-wrap";
  el.innerHTML = `<div class="menu-shade"></div><aside class="menu" role="dialog" aria-modal="true" aria-label="Menü">${panelHTML()}</aside>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("open"));
  const close = () => closeMenu();
  el.querySelector(".menu-shade").onclick = close;
  el.querySelector(".menu-x").onclick = close;
  el.querySelectorAll(".menu-links a").forEach((a) => a.addEventListener("click", (e) => {
    const h = a.getAttribute("href");
    if (h.startsWith("#")) { e.preventDefault(); close(); go(h); } else close();
  }));
  el.querySelectorAll(".menu-seg").forEach((g) => g.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    const key = g.dataset.key;
    const v = b.dataset.v === "true" ? true : b.dataset.v === "false" ? false : b.dataset.v;
    store.setSetting(key, v);
    g.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    applySettings();
  })));
  const rate = el.querySelector("#menuRateIn");
  rate.addEventListener("input", () => {
    store.setSetting("rate", +rate.value);
    el.querySelector("#menuRate").textContent = (+rate.value).toFixed(2);
  });
  document.addEventListener("keydown", onKey);
  el.querySelector(".menu-x").focus();
}
function onKey(e) { if (e.key === "Escape") closeMenu(); }
export function closeMenu() {
  if (!el) return;
  const old = el;
  el = null;
  document.removeEventListener("keydown", onKey);
  old.classList.remove("open");
  setTimeout(() => old.remove(), 260);
}
