// Tohumlu (seed) rastgele sayı üreteci. Math.random kullanılmaz ki
// günlük zorluk ve tekrarlar her cihazda birebir aynı olsun.

export function hashString(str) {
  // FNV-1a 32 bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export class RNG {
  constructor(seed = 1) {
    this.s = (seed >>> 0) || 1;
  }
  // mulberry32
  next() {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  chance(p) { return this.next() < p; }
  sign() { return this.next() < 0.5 ? -1 : 1; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  gauss(m = 0, s = 1) {
    const u = Math.max(1e-9, this.next()), v = this.next();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  // Ağırlıklı seçim: [{w, v}, ...]
  weighted(items) {
    let tot = 0;
    for (const it of items) tot += it.w;
    let r = this.next() * tot;
    for (const it of items) { if ((r -= it.w) <= 0) return it.v; }
    return items[items.length - 1].v;
  }
  fork(salt) { return new RNG(hashString(String(this.s) + ':' + salt)); }
}

// Gerçek zamanlı (deterministik olması gerekmeyen) işler için yardımcı
export const uiRng = new RNG((Date.now() ^ 0x5bd1e995) >>> 0);
