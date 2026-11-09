/**
 * JARVIS'İN KENDİ MÜZİKLERİ — telif yok, internet yok; tarayıcının ses motoruyla sentezlenir.
 *  phonk : 140 BPM; klasik "cowbell" melodisi, kayan/distorsiyonlu 808 bas, kick, clap, hi-hat (triplet rulolar)
 *  lofi  : 80 BPM; yumuşak elektrik piyano akorları, plak cızırtısı, sakin davul — vlog altına
 * Vuruş zamanları da döner (kesmeler tam ritme otursun).
 */

export interface Track {
  buffer: AudioBuffer
  bpm: number
  beats: number[]
}

const SR = 44100

function noiseBuffer(ctx: BaseAudioContext, sec = 1) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sec), ctx.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

function distCurve(k: number) {
  const n = 1024
  const c = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    c[i] = ((1 + k) * x) / (1 + k * Math.abs(x))
  }
  return c
}

const midi = (m: number) => 440 * 2 ** ((m - 69) / 12)

export async function generatePhonk(duration: number, bpm = 140): Promise<Track> {
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * duration), SR)
  const master = ctx.createGain()
  master.gain.value = 0.8
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -14
  comp.ratio.value = 6
  master.connect(comp).connect(ctx.destination)
  const noise = noiseBuffer(ctx, 1)
  const beat = 60 / bpm
  const step = beat / 4 // 16'lık
  const bars = Math.ceil(duration / (beat * 4))

  // Akor kökleri (F# minör hissi): F#1, D1, E1, C#1
  const roots = [30, 26, 28, 25]
  // Cowbell melodisi (16 adımlık; -1 = sus), iki bar dönüşümlü
  const bellA = [66, -1, 69, 66, -1, 64, -1, 66, 69, -1, 71, 69, -1, 66, 64, -1]
  const bellB = [66, -1, 69, 73, -1, 71, -1, 69, 66, -1, 64, 66, -1, 69, -1, 64]

  const kick = (t: number) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.setValueAtTime(160, t)
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12)
    g.gain.setValueAtTime(1, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.4)
  }
  const bass808 = (t: number, m: number, len: number, slideTo?: number) => {
    const o = ctx.createOscillator()
    const sh = ctx.createWaveShaper()
    sh.curve = distCurve(18)
    const g = ctx.createGain()
    o.frequency.setValueAtTime(midi(m), t)
    if (slideTo) o.frequency.exponentialRampToValueAtTime(midi(slideTo), t + len * 0.8)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + len)
    o.connect(sh).connect(g).connect(master)
    o.start(t)
    o.stop(t + len + 0.05)
  }
  const clap = (t: number) => {
    for (const d of [0, 0.012, 0.024]) {
      const s = ctx.createBufferSource()
      s.buffer = noise
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 1500
      f.Q.value = 0.8
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.5, t + d)
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.16)
      s.connect(f).connect(g).connect(master)
      s.start(t + d)
      s.stop(t + d + 0.2)
    }
  }
  const hat = (t: number, vol = 0.12) => {
    const s = ctx.createBufferSource()
    s.buffer = noise
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 8000
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045)
    s.connect(f).connect(g).connect(master)
    s.start(t)
    s.stop(t + 0.06)
  }
  const bell = (t: number, m: number) => {
    // Cowbell: iki kare dalga, bant geçiren filtre, kısa sönüm
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = midi(m) * 1.5
    f.Q.value = 3
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    for (const mult of [1, 1.48]) {
      const o = ctx.createOscillator()
      o.type = 'square'
      o.frequency.value = midi(m) * mult
      o.connect(f)
      o.start(t)
      o.stop(t + 0.25)
    }
    f.connect(g).connect(master)
  }

  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * beat * 4
    const intro = bar < 2 // girişte yalnız melodi + hat
    const root = roots[bar % roots.length]
    const mel = bar % 2 ? bellB : bellA
    for (let i = 0; i < 16; i++) {
      const t = t0 + i * step
      if (t >= duration) break
      if (mel[i] > 0) bell(t, mel[i])
      // hi-hat: 8'lik, bazı yerlerde triplet rulo
      if (i % 2 === 0) hat(t)
      if (!intro && (i === 14 || i === 6) && bar % 2) for (let k = 0; k < 3; k++) hat(t + (k * step * 2) / 3, 0.09)
      if (intro) continue
      if (i === 0 || i === 10) {
        kick(t)
        bass808(t, root, i === 0 ? beat * 2.2 : beat * 1.2, i === 10 && bar % 2 ? root + 5 : undefined)
      }
      if (i === 7 && bar % 2 === 0) kick(t)
      if (i === 4 || i === 12) clap(t)
    }
  }
  const buffer = await ctx.startRendering()
  const beats = Array.from({ length: Math.floor(duration / beat) + 1 }, (_, i) => i * beat)
  return { buffer, bpm, beats }
}

export async function generateLofi(duration: number, bpm = 80): Promise<Track> {
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * duration), SR)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2600
  const master = ctx.createGain()
  master.gain.value = 0.7
  master.connect(lp).connect(ctx.destination)
  const noise = noiseBuffer(ctx, 2)
  const beat = 60 / bpm
  const bars = Math.ceil(duration / (beat * 4))
  // Akorlar: Fmaj7, Em7, Dm7, Cmaj7
  const chords = [
    [53, 57, 60, 64],
    [52, 55, 59, 62],
    [50, 53, 57, 60],
    [48, 52, 55, 59],
  ]
  const keys = (t: number, notes: number[], len: number) => {
    for (const m of notes) {
      for (const [type, mul, vol] of [['sine', 1, 0.07], ['triangle', 2, 0.02]] as const) {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.value = midi(m) * mul
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(vol, t + 0.03)
        g.gain.exponentialRampToValueAtTime(0.001, t + len)
        o.connect(g).connect(master)
        o.start(t)
        o.stop(t + len + 0.05)
      }
    }
  }
  const kick = (t: number) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.setValueAtTime(110, t)
    o.frequency.exponentialRampToValueAtTime(45, t + 0.1)
    g.gain.setValueAtTime(0.6, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.35)
  }
  const snare = (t: number) => {
    const s = ctx.createBufferSource()
    s.buffer = noise
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1800
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.18, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    s.connect(f).connect(g).connect(master)
    s.start(t)
    s.stop(t + 0.2)
  }
  // Plak cızırtısı
  const crackle = ctx.createBufferSource()
  crackle.buffer = noise
  crackle.loop = true
  const cf = ctx.createBiquadFilter()
  cf.type = 'highpass'
  cf.frequency.value = 3000
  const cg = ctx.createGain()
  cg.gain.value = 0.012
  crackle.connect(cf).connect(cg).connect(ctx.destination)
  crackle.start(0)
  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * beat * 4
    keys(t0, chords[bar % 4], beat * 3.8)
    kick(t0)
    kick(t0 + beat * 2.5)
    snare(t0 + beat)
    snare(t0 + beat * 3)
  }
  const buffer = await ctx.startRendering()
  const beats = Array.from({ length: Math.floor(duration / beat) + 1 }, (_, i) => i * beat)
  return { buffer, bpm, beats }
}

/** Kullanıcının seçtiği müzik dosyasını çöz + ritmini bul */
export async function loadMusicFile(file: File, detect: (s: Float32Array, sr: number) => { bpm: number; beats: number[] }): Promise<Track> {
  const ctx = new OfflineAudioContext(2, SR, SR)
  const buffer = await ctx.decodeAudioData(await file.arrayBuffer())
  const { bpm, beats } = detect(buffer.getChannelData(0), buffer.sampleRate)
  return { buffer, bpm, beats }
}
