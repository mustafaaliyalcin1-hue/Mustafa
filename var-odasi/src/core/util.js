// Küçük matematik ve biçimlendirme yardımcıları

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const easeOut = (t) => 1 - (1 - t) * (1 - t);
export const easeIn = (t) => t * t;

export function wrapAngle(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}
export function lerpAngle(a, b, t) { return a + wrapAngle(b - a) * t; }
export function turnToward(cur, target, maxStep) {
  const d = wrapAngle(target - cur);
  return cur + clamp(d, -maxStep, maxStep);
}
export const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// Maç dakikası gösterimi: 45+2' gibi
export function fmtMinute(minute, half) {
  const m = Math.floor(minute);
  if (half === 1 && m >= 45) return `45+${m - 44}'`;
  if (half === 2 && m >= 90) return `90+${m - 89}'`;
  return `${m + 1}'`;
}
export function fmtClock(minute) {
  const m = Math.floor(minute);
  const s = Math.floor((minute - m) * 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
export function fmtCm(m) {
  const cm = m * 100;
  const a = Math.abs(cm);
  return (a < 10 ? a.toFixed(1) : a.toFixed(0)) + ' cm';
}
export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
