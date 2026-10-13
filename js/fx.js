// Küçük ses efektleri (Web Audio) ve konfeti. Dosya indirmeden, kodla üretilir.

import * as store from "./store.js";

let ctx = null;
function tone(freq, start, dur, type = "sine", gain = 0.12) {
  if (!store.get().settings.sfx) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
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
  const bits = ["⭐", "🎉", "✨", "🌟", "🎈"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.textContent = bits[i % bits.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 0.3 + "s";
    s.style.fontSize = 16 + Math.random() * 18 + "px";
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
  el.textContent = "⭐".repeat(n);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}
