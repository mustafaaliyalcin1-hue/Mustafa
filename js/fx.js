// Küçük ses efektleri (Web Audio) ve konfeti. Dosya indirmeden, kodla üretilir.

import * as store from "./store.js";

let ctx = null;
function tone(freq, start, dur, type = "sine", gain = 0.12) {
  if (!store.get().settings.sfx) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch { /* ses desteklenmiyor */ }
}

export const sfx = {
  success() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, "triangle")); },
  almost() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.22, "triangle")); },
  retry() { tone(392, 0, 0.18, "sine", 0.09); tone(330, 0.16, 0.25, "sine", 0.09); },
  tap() { tone(880, 0, 0.06, "square", 0.04); },
  badge() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.12, 0.35, "triangle")); },
};

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function confetti(n = 28) {
  if (reduced()) return;
  const layer = document.createElement("div");
  layer.className = "confetti";
  // Sade kâğıt konfeti: marka renklerinde küçük şeritler (emoji yok)
  const colors = ["#4f46e5", "#0f9b77", "#d77a00", "#2f6fe4", "#e0568f", "#f2c94c"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "paper";
    s.style.background = colors[i % colors.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 0.3 + "s";
    s.style.width = 6 + Math.random() * 6 + "px";
    s.style.height = 10 + Math.random() * 8 + "px";
    s.style.setProperty("--x", (Math.random() * 120 - 60).toFixed(0) + "px");
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1800);
}

// Kazanılan yıldızları ekranda uçurur.
export function starBurst(n) {
  const el = document.createElement("div");
  el.className = "star-burst";
  // Lucide yıldız ikonu (dolu)
  const star = '<svg width="34" height="34" viewBox="0 0 24 24" fill="#f2b233" stroke="#d77a00" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>';
  el.innerHTML = star.repeat(Math.min(n, 5));
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// İlk dokunuşta ses sistemini açar (tarayıcılar sesi ancak kullanıcı dokunduktan sonra çalar).
export function unlockAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch { /* ses desteklenmiyor */ }
}
