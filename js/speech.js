// Ses: Türkçe sesli okuma (dinleme) ve yapay zekâ ses tanıma (konuşma).

import { words, syllabify } from "./text.js";
import * as store from "./store.js";

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = !!Recognition;
// Mikrofon izni reddedildiyse (ör. izin verilmeyen bir çerçevede) konuşma ekranları
// öğretmen/veli onaylı moda geçer.
let micBlocked = false;
export const micAvailable = () => canListen && !micBlocked;
const BLOCKING = ["not-allowed", "service-not-allowed", "audio-capture"];
export const canSpeak = "speechSynthesis" in window;

const LOCALES = { tr: "tr-TR", en: "en-US" };
const voiceFor = { tr: null, en: null };
let voicesLoaded = false;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (voices.length) voicesLoaded = true;
  for (const l of ["tr", "en"]) {
    const list = voices.filter((v) => new RegExp(`^${l}([-_]|$)`, "i").test(v.lang));
    // Varsa Google / doğal sesleri, İngilizcede ABD/İngiltere aksanını tercih et.
    voiceFor[l] =
      list.find((v) => /google|natural|neural/i.test(v.name) && (l !== "en" || /US|GB/i.test(v.lang))) ||
      list.find((v) => l !== "en" || /US|GB/i.test(v.lang)) ||
      list[0] || null;
  }
}
if (canSpeak) {
  pickVoice();
  speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}
// Ses listesi yüklendiyse ve Türkçe ses yoksa true.
export const missingVoice = (l = "tr") => canSpeak && voicesLoaded && !voiceFor[l];

export function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); }

// --- Sesin gerçekten çıkıp çıkmadığını izleme ---
let heardOnce = false; // en az bir okuma başladı mı
let problemReported = false;
let touched = false; // kullanıcı ekrana dokundu mu (dokunmadan ses zaten engellenir)
let onProblem = null;
// Ses hiç başlamazsa (ses motoru yok, çerçeve engelliyor vb.) bir kez haber verir.
export const onSpeechProblem = (fn) => { onProblem = fn; };
function reportProblem() {
  if (heardOnce || problemReported || !touched) return;
  problemReported = true;
  onProblem?.();
}

// Bazı telefonlar (özellikle iOS) sesi ancak bir dokunuşun içinde başlatırsa açar.
// İlk dokunuşta sessiz, boş bir okuma yaparak ses motorunu uyandırır.
export function unlockSpeech() {
  touched = true;
  if (!canSpeak) return;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    speechSynthesis.speak(u);
    speechSynthesis.resume?.();
  } catch { /* yok say */ }
}

/**
 * Metni okur (lang: "tr" | "en"). onWord(i) verilirse okunan kelimenin sırası bildirilir (karaoke).
 * Bazı cihazlar kelime olayını desteklemez; o durumda süreye göre tahmin edilir.
 */
export function say(text, { rate, onWord, lang = "tr" } = {}) {
  return new Promise((resolve) => {
    if (!canSpeak) { reportProblem(); return resolve(); }
    // Dokunuştan önce başlayan okumalar tarayıcı tarafından engellenebilir; onları sorun sayma.
    const armed = touched;
    const problem = () => armed && reportProblem();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LOCALES[lang];
    try { if (voiceFor[lang]) u.voice = voiceFor[lang]; } catch { /* lang yeterli */ }
    // İngilizce çocuklar için biraz daha yavaş okunur.
    u.rate = rate ?? store.get().settings.rate * (lang === "en" ? 0.9 : 1);
    u.pitch = 1.1;

    let timers = [];
    let gotBoundary = false;
    if (onWord) {
      // Kelime başlangıçlarının metindeki konumları
      const starts = [];
      text.replace(/\S+/g, (_, idx) => starts.push(idx));
      u.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        gotBoundary = true;
        timers.forEach(clearTimeout);
        let i = starts.findIndex((s, k) => e.charIndex >= s && (k === starts.length - 1 || e.charIndex < starts[k + 1]));
        if (i >= 0) onWord(i);
      };
      u.onstart = () => {
        heardOnce = true;
        onWord(0);
        // Yedek: kelime olayları gelmezse uzunluğa göre zamanla.
        let t = 0;
        const perChar = 75 / u.rate;
        text.split(/\s+/).forEach((w, i) => {
          if (i > 0) timers.push(setTimeout(() => !gotBoundary && onWord(i), t));
          t += (w.length + 1) * perChar + 90;
        });
      };
    }
    let ended = false;
    let guard;
    const finish = () => {
      if (ended) return;
      ended = true;
      clearTimeout(guard);
      timers.forEach(clearTimeout);
      onWord?.(-1);
      resolve();
    };
    if (!onWord) u.onstart = () => { heardOnce = true; };
    u.onend = finish;
    u.onerror = (e) => {
      // "interrupted/canceled" bizim durdurmamızdır; diğer hatalar ses sorunudur.
      if (e?.error && e.error !== "interrupted" && e.error !== "canceled") problem();
      finish();
    };
    // Chrome'da cancel() hemen ardından speak() bazen okumayı yutar: önce durdur, kısa bekle.
    const busy = speechSynthesis.speaking || speechSynthesis.pending;
    if (busy) speechSynthesis.cancel();
    const start = () => { speechSynthesis.resume?.(); speechSynthesis.speak(u); };
    if (busy) setTimeout(start, 70); else start();
    // Bazı tarayıcılarda onend hiç gelmeyebilir; takılmayı önle.
    guard = setTimeout(() => { if (!heardOnce) problem(); finish(); }, 2000 + (text.length * 160) / Math.min(u.rate, 1));
    // Ses 2,5 sn içinde hiç başlamadıysa sorun var demektir.
    setTimeout(() => { if (!heardOnce && !ended) problem(); }, 2500);
  });
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// Yavaş okuma: Türkçede hece hece, İngilizcede kelime kelime. onWord ile hangi kelimede olduğunu bildirir.
export async function saySlow(text, { onWord, lang = "tr" } = {}) {
  const list = lang === "en" ? text.split(/\s+/).filter(Boolean) : words(text);
  for (let i = 0; i < list.length; i++) {
    onWord?.(i);
    if (lang === "en") await say(list[i], { rate: 0.6, lang });
    else for (const s of syllabify(list[i])) await say(s, { rate: 0.6 });
    await pause(250);
  }
  onWord?.(-1);
}

let activeRec = null;

/**
 * Mikrofondan dinler. onInterim(metin) konuşurken anlık yazıyı verir.
 * Döner: olası metinler dizisi (en olası önce). Hiç ses yoksa [].
 */
export function listen({ onInterim, lang = "tr" } = {}) {
  return new Promise((resolve, reject) => {
    if (!canListen) return reject(new Error("unsupported"));
    stopSpeaking();
    const rec = new Recognition();
    activeRec = rec;
    rec.lang = LOCALES[lang];
    rec.interimResults = !!onInterim;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let done = false;
    const safety = setTimeout(() => { try { rec.stop(); } catch { /* yok say */ } }, 12000);
    const end = (fn) => { if (done) return; done = true; clearTimeout(safety); activeRec = null; fn(); };

    rec.onresult = (e) => {
      const r = e.results[e.results.length - 1];
      if (!r.isFinal) { onInterim?.(r[0].transcript); return; }
      const alts = [];
      for (let i = 0; i < r.length; i++) alts.push(r[i].transcript);
      end(() => resolve(alts));
    };
    rec.onerror = (e) => end(() => {
      if (BLOCKING.includes(e.error)) micBlocked = true;
      e.error === "no-speech" || e.error === "aborted" ? resolve([]) : reject(new Error(e.error || "error"));
    });
    rec.onend = () => end(() => resolve([]));
    try { rec.start(); } catch (err) { micBlocked = true; end(() => reject(new Error("not-allowed"))); }
  });
}

export function stopListening() {
  if (activeRec) try { activeRec.abort(); } catch { /* yok say */ }
}

export function listenErrorMessage(err) {
  switch (err?.message) {
    case "not-allowed":
    case "service-not-allowed":
      return "Mikrofon kullanılamıyor. Öğretmen/veli onayı moduna geçildi. 🎤";
    case "network":
      return "Ses tanıma için internet bağlantısı gerekiyor. 📶";
    case "audio-capture":
      return "Mikrofon bulunamadı. Mikrofonun takılı mı? 🎤";
    default:
      return "Sesini duyamadım, bir daha dene. 📢";
  }
}
