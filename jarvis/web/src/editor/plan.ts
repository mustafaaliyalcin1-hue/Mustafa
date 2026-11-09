/**
 * KURGU PLANLAYICI (saf fonksiyonlar — tarayıcıdan bağımsız, test edilebilir)
 * Klipler + tarz + hedef süre + ritim → zaman çizelgesi (hangi klibin hangi bölümü, ne zaman, hangi efektle).
 *
 *  VLOG  : her klipten akıcı 3–5 sn'lik bölümler, yumuşak geçişler (çapraz kararma), hafif "Ken Burns"
 *          yakınlaşması, sıcak renk, açılış başlığı + bitiş kararması; orijinal ses korunur, müzik altta.
 *  PHONK : müziğin vuruşlarına oturan hızlı kesmeler; vuruşta zoom darbesi, 4 vuruşta bir beyaz flaş,
 *          sarsıntı, RGB kayması, ara ara ağır çekim; yüksek kontrast + soğuk/karanlık renk; müzik öne çıkar.
 */

export type Style = 'vlog' | 'phonk'
export type Aspect = '9:16' | '16:9' | '1:1'

export interface ClipInfo {
  duration: number // sn
}

export interface Fx {
  zoomFrom: number // segment başında ölçek
  zoomTo: number // segment sonunda ölçek
  punch: number // vuruş anında ekstra zoom (0 = yok)
  flash: boolean // segment başında beyaz flaş
  shake: number // sarsıntı şiddeti (px oranı, 0 = yok)
  rgb: number // RGB kayması (0 = yok)
}

export interface Segment {
  clip: number
  srcStart: number // kaynak klipte başlangıç (sn)
  speed: number // 1 = normal, 0.5 = ağır çekim
  outStart: number // çıktıda başlangıç (sn)
  outDur: number // çıktıda süre (sn)
  fadeIn: number // önceki segmentten çapraz geçiş süresi (sn)
  fx: Fx
}

export interface TextCard {
  text: string
  sub?: string
  start: number
  dur: number
  style: 'title' | 'flash'
}

export interface Plan {
  style: Style
  duration: number
  segments: Segment[]
  texts: TextCard[]
  grade: 'warm' | 'phonk' | 'none'
  musicVolume: number // 0..1
  originalVolume: number // 0..1
  fadeOut: number
}

export interface PlanOptions {
  style: Style
  target?: number // hedef süre (sn); yoksa otomatik
  beats?: number[] // müziğin vuruş zamanları (sn)
  bpm?: number
  title?: string
  date?: string
  hasMusic: boolean
}

const NO_FX: Fx = { zoomFrom: 1, zoomTo: 1, punch: 0, flash: false, shake: 0, rgb: 0 }

/** Basit, tekrar üretilebilir rastgele sayı (aynı girdiye aynı kurgu) */
function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

/** Kliplerden "kullanılabilir" pencereler: baş/son titrek kısımları atla */
function usable(clips: ClipInfo[]) {
  return clips.map((c) => {
    const trim = c.duration > 4 ? Math.min(0.6, c.duration * 0.05) : 0
    return { start: trim, end: Math.max(trim + 0.2, c.duration - trim) }
  })
}

export function makePlan(clips: ClipInfo[], o: PlanOptions): Plan {
  if (!clips.length) throw new Error('Klip yok')
  return o.style === 'phonk' ? phonkPlan(clips, o) : vlogPlan(clips, o)
}

// ----------------------------------------------------------------------- VLOG
function vlogPlan(clips: ClipInfo[], o: PlanOptions): Plan {
  const win = usable(clips)
  const total = win.reduce((s, w) => s + (w.end - w.start), 0)
  // Otomatik süre: kısa toplamda hepsi, uzunda ~%35'i (en az 30, en çok 180 sn)
  const target = Math.min(total, o.target ?? (total <= 45 ? total : Math.max(30, Math.min(180, total * 0.35))))
  const XF = 0.4 // çapraz geçiş
  const segLen = target >= 60 ? 4.5 : target >= 25 ? 3.5 : 2.5
  const count = Math.max(1, Math.round(target / segLen))
  const r = rng(clips.length * 7919 + Math.round(total * 10))
  // Bölümleri kliplere süreleriyle orantılı dağıt, her klipte eşit aralıklı seç (kronolojik akış)
  const perClip = win.map((w) => (w.end - w.start) / total)
  const counts = perClip.map((p) => Math.max(1, Math.round(p * count)))
  const segs: Segment[] = []
  let t = 0
  win.forEach((w, ci) => {
    const len = w.end - w.start
    const n = Math.min(counts[ci], Math.max(1, Math.floor(len / 1.2)))
    const dur = Math.min(segLen, len / n)
    for (let k = 0; k < n; k++) {
      const slot = len / n
      const srcStart = w.start + k * slot + Math.max(0, (slot - dur) / 2)
      const fadeIn = segs.length ? XF : 0
      const zoomIn = r() > 0.5
      segs.push({ clip: ci, srcStart, speed: 1, outStart: Math.max(0, t - fadeIn), outDur: dur, fadeIn, fx: { ...NO_FX, zoomFrom: zoomIn ? 1 : 1.06, zoomTo: zoomIn ? 1.06 : 1 } })
      t = Math.max(0, t - fadeIn) + dur
    }
  })
  const texts: TextCard[] = o.title ? [{ text: o.title, sub: o.date, start: 0.3, dur: 2.8, style: 'title' }] : []
  return { style: 'vlog', duration: t, segments: segs, texts, grade: 'warm', musicVolume: o.hasMusic ? 0.22 : 0, originalVolume: 1, fadeOut: 0.8 }
}

// ---------------------------------------------------------------------- PHONK
function phonkPlan(clips: ClipInfo[], o: PlanOptions): Plan {
  const win = usable(clips)
  const total = win.reduce((s, w) => s + (w.end - w.start), 0)
  const bpm = o.bpm ?? 140
  const beat = 60 / bpm
  const target = o.target ?? Math.min(30, Math.max(10, total * 0.6))
  // Vuruş ızgarası: verilen vuruşlar ya da BPM'den üret
  let beats = (o.beats?.length ? o.beats : Array.from({ length: Math.ceil(target / beat) + 2 }, (_, i) => i * beat)).filter((b) => b < target + 0.01)
  if (beats[0] > 0.05) beats = [0, ...beats]
  const r = rng(Math.round(total * 100) + clips.length)
  const segs: Segment[] = []
  // Kesme noktaları: giriş kısmında 2 vuruşta bir, sonra her vuruşta; bazen 1/2 vuruş (hızlı çift kesme)
  const cuts: number[] = []
  for (let i = 0; i < beats.length; i++) {
    const intro = beats[i] < target * 0.2
    if (intro && i % 2) continue
    cuts.push(beats[i])
    const next = beats[i + 1]
    if (!intro && next !== undefined && r() < 0.18) cuts.push((beats[i] + next) / 2)
  }
  cuts.push(target)
  // Kaynak bölümleri: tüm kliplerden karışık, aynı yer tekrar etmesin
  const cursor = win.map((w) => w.start)
  for (let i = 0; i < cuts.length - 1; i++) {
    const outStart = cuts[i]
    const outDur = cuts[i + 1] - cuts[i]
    if (outDur < 0.05) continue
    const slow = !(i % 7) && i > 0 && r() < 0.7 // ara ara ağır çekim
    const speed = slow ? 0.5 : 1
    const need = outDur * speed
    let ci = Math.floor(r() * clips.length)
    for (let tries = 0; tries < clips.length && cursor[ci] + need > win[ci].end; tries++) ci = (ci + 1) % clips.length
    if (cursor[ci] + need > win[ci].end) cursor[ci] = win[ci].start // başa sar
    const srcStart = cursor[ci]
    // Bir sonraki bölüm için ileri atla (klip boyunca yayılsın)
    const span = win[ci].end - win[ci].start
    cursor[ci] = Math.min(win[ci].end, srcStart + need + Math.max(0, span / Math.max(4, cuts.length / clips.length) - need) * r())
    const onBar = Math.round(outStart / beat) % 4 === 0
    segs.push({
      clip: ci,
      srcStart,
      speed,
      outStart,
      outDur,
      fadeIn: 0,
      fx: { zoomFrom: slow ? 1.15 : 1.08, zoomTo: slow ? 1.02 : 1.0, punch: onBar ? 0.22 : 0.12, flash: onBar && i > 0, shake: onBar ? 0.025 : r() < 0.3 ? 0.012 : 0, rgb: onBar ? 0.012 : r() < 0.25 ? 0.006 : 0 },
    })
  }
  const texts: TextCard[] = o.title ? [{ text: o.title.toLocaleUpperCase('tr-TR'), start: Math.max(0.2, beats[Math.min(beats.length - 1, 8)] ?? 2), dur: beat * 2, style: 'flash' }] : []
  return { style: 'phonk', duration: target, segments: segs, texts, grade: 'phonk', musicVolume: o.hasMusic ? 1 : 0, originalVolume: o.hasMusic ? 0 : 1, fadeOut: 0.4 }
}

/** Belirli bir anda görünen segment(ler) — çapraz geçişte iki segment, opaklıklarıyla */
export function activeAt(plan: Plan, t: number): { seg: Segment; alpha: number; local: number }[] {
  const out: { seg: Segment; alpha: number; local: number }[] = []
  for (const seg of plan.segments) {
    if (t >= seg.outStart && t < seg.outStart + seg.outDur) {
      const local = t - seg.outStart
      const alpha = seg.fadeIn > 0 && local < seg.fadeIn ? local / seg.fadeIn : 1
      out.push({ seg, alpha, local })
    }
  }
  // Önce alttaki (eski) segment, sonra üstteki
  return out.sort((a, b) => a.seg.outStart - b.seg.outStart)
}
