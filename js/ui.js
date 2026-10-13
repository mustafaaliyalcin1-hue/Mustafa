// Ekran yönetimi: yönlendirme, baykuş maskot, bildirimler.

import * as store from "./store.js";
import { stopListening, stopSpeaking } from "./speech.js";
import { sfx, confetti } from "./fx.js";
import { esc } from "./text.js";

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
function paintHeader(s) {
  $stars.textContent = s.stars;
  $avatar.textContent = s.profile?.avatar || "🦉";
}
store.onChange(paintHeader);
paintHeader(store.get());

/* ---------- Baykuş maskot ---------- */
export function owl(mood = "") {
  return `<svg class="owl ${mood}" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M22 30 L38 44 L26 50 Z M98 30 L82 44 L94 50 Z" fill="#8f75ff"/>
    <ellipse cx="60" cy="70" rx="40" ry="44" fill="#8f75ff"/>
    <ellipse cx="60" cy="82" rx="25" ry="28" fill="#efe9ff"/>
    <path d="M44 84 q4 4 8 0 M56 92 q4 4 8 0 M68 84 q4 4 8 0" stroke="#c9bbff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g class="eyes">
      <circle cx="44" cy="54" r="15" fill="#fff"/><circle cx="76" cy="54" r="15" fill="#fff"/>
      <circle class="pupil" cx="45" cy="55" r="7.5" fill="#2b2550"/><circle class="pupil" cx="75" cy="55" r="7.5" fill="#2b2550"/>
      <circle cx="47" cy="52" r="2.2" fill="#fff"/><circle cx="77" cy="52" r="2.2" fill="#fff"/>
    </g>
    <path d="M54 66 L66 66 L60 75 Z" fill="#ffb020"/>
    <ellipse cx="44" cy="110" rx="8" ry="4" fill="#ffb020"/><ellipse cx="76" cy="110" rx="8" ry="4" fill="#ffb020"/>
  </svg>`;
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
      el.innerHTML = `<div class="ic">${b.icon}</div><div><b>Yeni rozet!</b><br>${esc(b.title)}</div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3200);
    }, 900 + i * 3300)
  );
}

export const progressBar = (value, total) =>
  `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${value}"><i style="width:${total ? (value / total) * 100 : 0}%"></i></div>`;

// Tek yerden tıklama bağlamak için kısa yardımcı
export const on = (sel, fn, root = $app) => root.querySelectorAll(sel).forEach((el) => el.addEventListener("click", (e) => fn(el, e)));
