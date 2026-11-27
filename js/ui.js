// Ekran yönetimi: yönlendirme, karakter maskot, bildirimler.

import { pic } from "./pictures.js";
import * as store from "./store.js";
import { stopListening, stopSpeaking } from "./speech.js";
import { sfx, confetti } from "./fx.js";
import { esc } from "./text.js";
import { characterSVG } from "./character.js";

export const $app = document.getElementById("app");
const $back = document.getElementById("backBtn");
const $toast = document.getElementById("toast");

/* ---------- Yönlendirme ---------- */
const routes = {};
const parents = {};
let cleanup = null;

// parent: geri tuşunun gideceği yer (fonksiyon da olabilir)
export function route(name, view, parent = "#/home") {
  routes[name] = view;
  parents[name] = parent;
}

export const go = (hash) => {
  if (location.hash === hash) render();
  else location.hash = hash;
};

// Ekrandan çıkarken çalışacak temizlik (zamanlayıcılar vb.)
export const onLeave = (fn) => { cleanup = fn; };

export function render() {
  stopListening();
  stopSpeaking();
  if (cleanup) { try { cleanup(); } catch { /* yok say */ } cleanup = null; }
  document.querySelectorAll(".confetti, .star-burst").forEach((el) => el.remove());
  const [name, ...args] = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
  const p = store.get().profile;
  const target = !p && name !== "welcome" ? "welcome" : routes[name] ? name : "home";
  $back.hidden = target === "home" || target === "welcome";
  document.body.dataset.screen = target;
  $app.innerHTML = "";
  routes[target](...args);
  $app.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

$back.addEventListener("click", () => {
  const [name, ...args] = location.hash.replace(/^#\/?/, "").split("/");
  const p = parents[name];
  go(typeof p === "function" ? p(...args) : p || "#/home");
});
window.addEventListener("hashchange", render);

/* ---------- Üst bilgi ---------- */
const $stars = document.getElementById("starCount");
const $avatar = document.getElementById("avatar");
const $brand = document.getElementById("brandName");
function paintHeader(s) {
  $stars.textContent = s.stars;
  $avatar.innerHTML = s.profile ? characterSVG(s.look, "mini") : "";
  $brand.textContent = s.profile ? store.buddy() : "Konuşan Arkadaşım";
}
store.onChange(paintHeader);
paintHeader(store.get());

/* ---------- Karakter maskot ---------- */
// Maskot: çocuğun seçip giydirdiği karakter.
export function owl(mood = "") {
  return characterSVG(store.get().look, mood);
}

export function mascot(text, mood = "") {
  return `<div class="mascot">${owl(mood)}<div class="bubble">${text}</div></div>`;
}

/* ---------- Bildirimler ---------- */
export function toast(msg, ms = 2200) {
  $toast.textContent = msg;
  $toast.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => ($toast.hidden = true), ms);
}

export function showBadges(list) {
  list.forEach((b, i) =>
    setTimeout(() => {
      sfx.badge();
      confetti(20);
      const el = document.createElement("div");
      el.className = "badge-pop";
      el.innerHTML = `<div class="ic">${pic(b.icon, "badge-img")}</div><div><b>Yeni rozet!</b><br>${esc(b.title)}</div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3200);
    }, 900 + i * 3300)
  );
}

export const progressBar = (value, total) =>
  `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${value}"><i style="width:${total ? (value / total) * 100 : 0}%"></i></div>`;

// Tek yerden tıklama bağlamak için kısa yardımcı
export const on = (sel, fn, root = $app) => root.querySelectorAll(sel).forEach((el) => el.addEventListener("click", (e) => fn(el, e)));

// Ses çıkmadığında bir kez gösterilen yardım kutusu.
export function showSoundHelp() {
  if (document.getElementById("soundHelp")) return;
  const el = document.createElement("div");
  el.id = "soundHelp";
  el.className = "sound-help";
  el.setAttribute("role", "alert");
  el.innerHTML = `<b>Arkadaşının sesi gelmiyor mu?</b>
    <ul>
      <li>Telefonun <b>sesini</b> açın. iPhone'da yan taraftaki <b>sessiz mod düğmesini</b> kapatın (turuncu görünmesin).</li>
      <li>iPhone'da uygulamayı <b>Safari</b> ile açın.</li>
      <li>Android'de uygulamayı <b>Google Chrome</b> ile açın.</li>
      <li>Android'de: Ayarlar → “Metin okuma” bölümünde <b>Google konuşma motorunun</b> ve Türkçe sesin yüklü olduğunu kontrol edin.</li>
    </ul>
    <button class="btn small" id="soundHelpClose">Tamam</button>`;
  document.body.appendChild(el);
  el.querySelector("#soundHelpClose").onclick = () => el.remove();
}
