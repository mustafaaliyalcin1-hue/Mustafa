/**
 * UI ses efektleri — dosya yok, hepsi Web Audio API ile sentezlenir.
 * Ayarlardan kapatılabilir (store.settings.sound).
 */
import { getStore } from './store'

let ctx: AudioContext | null = null
function ac() {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08, slideTo?: number, delay = 0) {
  const c = ac()
  const t = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise(dur: number, vol = 0.1, filterFreq = 1200, delay = 0, type: BiquadFilterType = 'lowpass') {
  const c = ac()
  const t = c.currentTime + delay
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = filterFreq
  const g = c.createGain()
  g.gain.value = vol
  src.connect(f).connect(g).connect(c.destination)
  src.start(t)
}

const sounds = {
  bip: () => tone(1320, 0.08, 'sine', 0.05),
  tick: () => tone(2400, 0.03, 'square', 0.015),
  boot: () => {
    tone(220, 0.6, 'sawtooth', 0.03, 880)
    tone(440, 0.9, 'sine', 0.05, 1760, 0.4)
  },
  whoosh: () => noise(0.45, 0.12, 900, 0, 'bandpass'),
  listen: () => {
    tone(880, 0.09, 'sine', 0.05)
    tone(1320, 0.12, 'sine', 0.05, undefined, 0.08)
  },
  success: () => {
    tone(784, 0.12, 'triangle', 0.06)
    tone(1175, 0.25, 'triangle', 0.06, undefined, 0.1)
  },
  error: () => {
    tone(180, 0.35, 'sawtooth', 0.06, 90)
    noise(0.25, 0.08, 400)
  },
  /** Damga "güm" sesi */
  stamp: () => {
    tone(90, 0.35, 'sine', 0.35, 40)
    noise(0.18, 0.35, 300)
  },
  thunder: () => noise(1.8, 0.25, 220),
  tension: () => {
    for (let i = 0; i < 6; i++) tone(110, 0.18, 'sine', 0.06, undefined, i * 0.32)
  },
  pop: () => tone(600, 0.1, 'sine', 0.06, 1200),
  alarm: () => {
    tone(880, 0.12, 'square', 0.08)
    tone(1175, 0.12, 'square', 0.08, undefined, 0.15)
    tone(880, 0.12, 'square', 0.08, undefined, 0.3)
  },
  paper: () => noise(0.6, 0.1, 2500, 0, 'highpass'),
}

export type SfxName = keyof typeof sounds

export function sfx(name: SfxName) {
  if (!getStore().settings.sound) return
  try {
    sounds[name]()
  } catch {
    /* ses desteklenmiyor */
  }
}
