// ElevenLabs ile doğal ses.
// 1) Merkezi sunucu (config.js → VOICE_SERVER): anahtar sunucuda durur, tüm cihazlar kullanır.
// 2) Sunucu yoksa: veli ekranından bu cihaza özel anahtar girilebilir (yalnızca bu cihazda saklanır).
// Aynı metin bir kez üretilir, sonra cihazdaki önbellekten çalınır.

import { VOICE_SERVER } from "./config.js";
import { audioKey, normText } from "./audio-key.js";
export const server = VOICE_SERVER.replace(/\/+$/, "");

const CFG_KEY = "konusan-baykus:elevenlabs";
const API = "https://api.elevenlabs.io/v1";
const MODEL = "eleven_multilingual_v2"; // Türkçe ve İngilizce destekli
const CACHE = "baykus-elevenlabs-v1";

export function getCfg() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch { return {}; }
}
export function setCfg(cfg) {
  try {
    if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(CFG_KEY);
  } catch { /* yok say */ }
  failed = false;
}
let failed = false; // bu açılışta ElevenLabs hata verdiyse cihaz sesine dönülür
export let lastError = "";
export const enabled = () => { const c = getCfg(); return !!(server || (c.key && c.voice)) && !failed; };

function errText(status, body) {
  if (status === 401) return "API anahtarı geçersiz ya da bu işlem için yetkisi yok.";
  if (status === 403 && server) return "Ses sunucusu bu siteye izin vermiyor.";
  if (status === 500 && /ELEVENLABS_API_KEY/.test(body)) return "Sunucuda API anahtarı tanımlı değil.";
  if (status === 429) return "Çok fazla istek ya da kota doldu. Biraz sonra tekrar deneyin.";
  if (/quota/i.test(body)) return "ElevenLabs karakter kotası doldu.";
  if (/voice_not_found|not found/i.test(body)) return "Seçilen ses bulunamadı.";
  return `ElevenLabs hatası (${status}).`;
}

// Hesaptaki sesleri listeler: [{ id, name }]
export async function listVoices(key) {
  const r = server
    ? await fetch(`${server}/voices`)
    : await fetch(`${API}/voices`, { headers: { "xi-api-key": key } });
  if (!r.ok) throw new Error(errText(r.status, await r.text().catch(() => "")));
  const j = await r.json();
  return (j.voices || []).map((v) => ({
    id: v.voice_id || v.id,
    name: v.name + (v.category === "premade" ? "" : " ★"),
  }));
}

// --- Önbellek (bellek + kalıcı Cache Storage) ---
const mem = new Map();
const cacheUrl = (k) => `https://baykus.local/tts/${encodeURIComponent(k)}`;
async function cached(k) {
  if (mem.has(k)) return mem.get(k);
  try {
    const c = await caches.open(CACHE);
    const r = await c.match(cacheUrl(k));
    if (r) { const j = await r.json(); mem.set(k, j); return j; }
  } catch { /* önbellek yok */ }
  return null;
}
async function store(k, j) {
  mem.set(k, j);
  try { (await caches.open(CACHE)).put(cacheUrl(k), new Response(JSON.stringify(j))); } catch { /* yok say */ }
}

async function synth(text, speed) {
  const { key, voice } = getCfg();
  const k = `${server ? "srv" : "dev"}|${voice || ""}|${speed}|${text}`;
  const hit = await cached(k);
  if (hit) return hit;
  let out;
  if (server) {
    const r = await fetch(`${server}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, speed, voice: voice || undefined }),
    });
    if (!r.ok) throw new Error(errText(r.status, await r.text().catch(() => "")));
    out = await r.json();
  } else {
    const r = await fetch(`${API}/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, speed } }),
    });
    if (!r.ok) throw new Error(errText(r.status, await r.text().catch(() => "")));
    const j = await r.json();
    const a = j.alignment || j.normalized_alignment || {};
    out = { audio: j.audio_base64, starts: a.character_start_times_seconds || [] };
  }
  await store(k, out);
  return out;
}

// --- Çalma ---
// iPhone sesi yalnızca dokunuşla açılmış bir oynatıcıda çalar: tek oynatıcı, ilk dokunuşta açılır.
const player = typeof Audio !== "undefined" ? new Audio() : null;
// Gerçek (0,1 sn) sessiz WAV: boş dosya iPhone'da hata verip oynatıcıyı açmıyordu.
const SILENT = (() => {
  const n = 800, buf = new Uint8Array(44 + n), v = new DataView(buf.buffer);
  const w = (o, s) => [...s].forEach((c, i) => (buf[o + i] = c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  w(36, "data"); v.setUint32(40, n, true); buf.fill(128, 44);
  let bin = ""; buf.forEach((b) => (bin += String.fromCharCode(b)));
  return "data:audio/wav;base64," + btoa(bin);
})();
export let unlocked = false; // iPhone: oynatıcı bir dokunuşla açıldı mı
export function unlock() {
  if (!player) return;
  try {
    player.src = SILENT;
    const p = player.play();
    p?.then(() => { unlocked = true; }).catch(() => {});
  } catch { /* yok say */ }
}

let current = null; // çalan okumanın bitirme fonksiyonu
export function stop() {
  current?.();
  try { player?.pause(); } catch { /* yok say */ }
}

// Uygulama hızını (0.5–1.1) ElevenLabs hızına (0.7–1.2) çevirir.
const toSpeed = (rate) => Math.round(Math.min(1.2, Math.max(0.7, rate + 0.15)) * 20) / 20;

/**
 * Sesi tek oynatıcıda çalar. parts: [{ src, times: [kelime başlangıç sn] }] sırayla çalınır;
 * onWord tüm parçalar boyunca kelime sırasını bildirir. Çalma engellenirse false döner.
 */
async function playParts(parts, { onWord, playbackRate = 1 } = {}) {
  stop();
  let mine = true;
  let done;
  const finished = new Promise((r) => { done = r; });
  let raf = 0;
  const finish = () => {
    if (!mine) return;
    mine = false;
    cancelAnimationFrame(raf);
    player.onended = player.onerror = null;
    if (current === finish) current = null;
    onWord?.(-1);
    done(true);
  };
  current = finish;
  let offset = 0;
  for (let p = 0; p < parts.length; p++) {
    if (!mine) return true;
    const { src, times } = parts[p];
    let lastWord = -1;
    const tick = () => {
      if (!mine) return;
      const t = player.currentTime;
      let i = -1;
      times.forEach((st, k) => { if (st != null && t >= st) i = k; });
      if (i >= 0 && i !== lastWord) { lastWord = i; onWord(offset + i); }
      raf = requestAnimationFrame(tick);
    };
    const ended = new Promise((r) => { player.onended = r; player.onerror = r; });
    player.src = src;
    try { player.playbackRate = playbackRate; player.preservesPitch = true; } catch { /* yok say */ }
    try {
      await player.play();
      unlocked = true;
      try { player.playbackRate = playbackRate; } catch { /* yok say */ }
    } catch (e) {
      // Çalma engellendi (ör. dokunuş yok): çağıran cihaz sesine geçsin.
      lastError = "Ses çalınamadı (ekrana bir kez dokunup tekrar deneyin).";
      mine = false;
      cancelAnimationFrame(raf);
      player.onended = player.onerror = null;
      if (current === finish) current = null;
      return p === 0 ? false : true;
    }
    if (onWord) { onWord(offset); lastWord = 0; cancelAnimationFrame(raf); tick(); }
    // Güvenlik: bitiş olayı gelmezse takılma
    await Promise.race([ended, new Promise((r) => setTimeout(r, 30000))]);
    cancelAnimationFrame(raf);
    offset += times.length;
  }
  finish();
  return finished;
}

/* ---------- Önceden seslendirilmiş dosyalar (ses/) ---------- */
let manifest = null;
const manifestReady = fetch("ses/manifest.json").then((r) => (r.ok ? r.json() : {})).then((m) => { manifest = m; }).catch(() => { manifest = {}; });
const fileFor = (text, lang) => {
  const k = audioKey(text, lang);
  return manifest && manifest[k] ? { src: `ses/${k}.mp3`, times: manifest[k] } : null;
};
// Önce metnin tamamı, yoksa cümlelerine bölünmüş hâli aranır.
function filesFor(text, lang) {
  if (!manifest) return null;
  const whole = fileFor(text, lang);
  if (whole) return [whole];
  const pieces = (normText(text).match(/[^.!?:]+[.!?:]*/g) || []).map((x) => x.trim()).filter(Boolean);
  if (pieces.length < 2) return null;
  const parts = pieces.map((t) => fileFor(t, lang));
  return parts.every(Boolean) ? parts : null;
}
export const fileReady = () => manifestReady;
export const hasFile = (text, lang = "tr") => !!(player && filesFor(text, lang));

/** Hazır ses dosyası varsa çalar ve true döner; yoksa false (çağıran başka yola geçer). */
export function sayFile(text, { rate = 0.85, onWord, lang = "tr" } = {}) {
  const parts = player && filesFor(text, lang);
  if (!parts) return Promise.resolve(false);
  // Uygulamanın okuma hızı (0.85 = normal) dosyanın çalma hızına çevrilir.
  const playbackRate = Math.min(1.25, Math.max(0.65, rate / 0.85));
  return playParts(parts, { onWord, playbackRate });
}

/** Metni ElevenLabs ile okur. Hata olursa false döner (çağıran cihaz sesine geçer). */
export async function say(text, { rate = 0.85, onWord } = {}) {
  stop();
  let mine = true;
  let done;
  const finished = new Promise((r) => { done = r; });
  const finish = () => {
    if (!mine) return;
    mine = false;
    if (current === finish) current = null;
    onWord?.(-1);
    done(true);
  };
  current = finish;
  let data;
  try {
    data = await synth(text, toSpeed(rate));
  } catch (e) {
    lastError = e.message || "ElevenLabs'e ulaşılamadı.";
    failed = true;
    if (current === finish) current = null;
    mine = false;
    return false;
  }
  if (!mine) return true; // bu arada başka okuma başladı

  // Kelime başlangıç zamanları (karaoke)
  const wordTimes = [];
  text.replace(/\S+/g, (_, idx) => wordTimes.push(data.starts[idx] ?? null));
  let raf = 0;
  let lastWord = -1;
  const tick = () => {
    if (!mine) return;
    const t = player.currentTime;
    let i = -1;
    wordTimes.forEach((s, k) => { if (s != null && t >= s) i = k; });
    if (i >= 0 && i !== lastWord) { lastWord = i; onWord(i); }
    raf = requestAnimationFrame(tick);
  };
  const end = () => { cancelAnimationFrame(raf); player.onended = player.onerror = null; finish(); };
  player.onended = end;
  player.onerror = end;
  player.src = `data:audio/mpeg;base64,${data.audio}`;
  try {
    await player.play();
    lastError = "";
    if (onWord) { onWord(0); lastWord = 0; tick(); }
  } catch (e) {
    // Çalma engellendi (ör. dokunuş yok): bu okumayı cihaz sesi yapsın.
    lastError = "Ses çalınamadı (ekrana bir kez dokunup tekrar deneyin).";
    cancelAnimationFrame(raf);
    player.onended = player.onerror = null;
    if (current === finish) current = null;
    mine = false;
    return false;
  }
  // Güvenlik: çalma hiç bitmezse takılma
  setTimeout(() => mine && end(), 3000 + text.length * 200);
  return finished;
}
