// Cihazda saklanan profil, ayarlar ve ilerleme.

import { BADGES } from "./content.js";

const KEY = "konusan-baykus:v2";

const DEFAULTS = () => ({
  profile: null, // { name, grade: 1|2, avatar }
  settings: { rate: 0.85, sfx: true },
  stars: 0,
  done: {}, // { [listId]: [metin, ...] }
  attempts: 0, // değerlendirilen konuşma sayısı
  firstTry: 0, // ilk denemede doğru
  correct: 0, // doğru söylenen toplam
  weak: {}, // { "ş": 3, ... } zorlanılan sesler
  days: {}, // { "2026-10-13": yıldız }
  badges: [],
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS(), ...JSON.parse(raw) };
  } catch { /* gizli sekme vb. */ }
  return DEFAULTS();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* yok say */ }
}

const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);
function changed() { save(); listeners.forEach((fn) => fn(state)); }

export const get = () => state;

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const DAILY_GOAL = 15;

export function setProfile(profile) { state.profile = { ...state.profile, ...profile }; changed(); }
export function setSetting(k, v) { state.settings = { ...state.settings, [k]: v }; changed(); }

export function addStars(n) {
  if (n <= 0) return;
  state.stars += n;
  const t = today();
  state.days[t] = (state.days[t] || 0) + n;
  changed();
}

export function markDone(listId, text) {
  const list = state.done[listId] || (state.done[listId] = []);
  if (!list.includes(text)) list.push(text);
  changed();
}

export const doneCount = (listId) => (state.done[listId] || []).length;
export const isDone = (listId, text) => (state.done[listId] || []).includes(text);

// Her konuşma denemesinin sonucunu istatistiğe işler.
export function recordAttempt({ success, firstTry, weakSounds = [] }) {
  state.attempts++;
  if (success) state.correct++;
  if (success && firstTry) state.firstTry++;
  for (const s of weakSounds) state.weak[s] = (state.weak[s] || 0) + 1;
  changed();
}

// Çalışılan ses doğru söylendikçe zayıflık puanı azalır.
export function relieveWeak(sound) {
  if (state.weak[sound]) { state.weak[sound] = Math.max(0, state.weak[sound] - 1); changed(); }
}

export function weakList(limit = 4) {
  return Object.entries(state.weak).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function streak() {
  let n = 0;
  const d = new Date();
  // Bugün henüz çalışılmadıysa seri dünden itibaren sayılır.
  const key = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  if (!state.days[key(d)]) d.setDate(d.getDate() - 1);
  while (state.days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const todayStars = () => state.days[today()] || 0;

// Yeni kazanılan rozetleri döndürür.
export function checkBadges(extra = {}) {
  const earned = [];
  const give = (id) => { if (!state.badges.includes(id)) { state.badges.push(id); earned.push(BADGES.find((b) => b.id === id)); } };
  if (state.stars > 0) give("ilk");
  if (state.correct >= 10) give("on-cumle");
  if (state.correct >= 50) give("elli-cumle");
  if (state.stars >= 100) give("yuz");
  if (streak() >= 3) give("seri3");
  if (extra.story) give("hikaye");
  if (extra.tekerleme) give("tekerleme");
  if (extra.weak) give("zor-ses");
  if (earned.length) changed();
  return earned;
}

export function reset() {
  const keep = { profile: state.profile, settings: state.settings };
  state = { ...DEFAULTS(), ...keep };
  changed();
}
