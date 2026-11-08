/**
 * Ses katmanı (tarayıcı tarafı)
 * - speak(): Türkçe TTS. 2. aşamada backend'den gelen ElevenLabs sesi çalınacak;
 *   o yoksa tarayıcı TTS'ine (speechSynthesis, tr-TR) düşülür.
 * - Konuşurken kelime kelime altyazı ilerletilir ve küre için sentetik ses seviyesi üretilir.
 * - Mikrofon: getUserMedia + AnalyserNode ile seviye ölçümü (dinleme animasyonu sese tepki verir)
 * - Konuşma tanıma: Web Speech API (tr-TR).
 */
import { audioLevel, getStore, setStore } from './store'

let cancelSpeak: (() => void) | null = null

/** Konuşmayı hemen kes (barge-in). */
export function stopSpeaking() {
  cancelSpeak?.()
  cancelSpeak = null
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() || []
  const tr = voices.filter((v) => v.lang.toLowerCase().startsWith('tr'))
  // Erkek sesi tercih et (isimde ipucu varsa), yoksa ilk Türkçe ses
  return tr.find((v) => /male|erkek|tolga|cem|ahmet/i.test(v.name)) || tr[0]
}

/** Metni seslendir; altyazı kelime kelime ilerler. Bitince resolve olur. */
export function speak(text: string): Promise<void> {
  stopSpeaking()
  const words = text.split(/\s+/).filter(Boolean)
  setStore({ subtitle: { text, shown: 0 } })

  return new Promise((resolve) => {
    let done = false
    let shown = 0
    let pulse = 0
    const timers: number[] = []
    // Sentetik ses seviyesi: her kelimede bir "darbe", araya gürültü
    const levelLoop = window.setInterval(() => {
      pulse *= 0.82
      audioLevel.voice = Math.min(1, pulse + Math.random() * 0.25)
    }, 40)
    const advance = () => {
      shown = Math.min(words.length, shown + 1)
      pulse = 0.9
      setStore({ subtitle: { text, shown } })
    }
    const finish = () => {
      if (done) return
      done = true
      timers.forEach(clearTimeout)
      clearInterval(levelLoop)
      audioLevel.voice = 0
      setStore({ subtitle: { text, shown: words.length } })
      timers.push(window.setTimeout(() => setStore((s) => (s.subtitle?.text === text ? { subtitle: null } : {})), 1800))
      resolve()
    }
    cancelSpeak = finish

    const useTTS = getStore().settings.voice && 'speechSynthesis' in window
    if (useTTS) {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'tr-TR'
      u.rate = 1.02
      u.pitch = 0.9
      const v = pickVoice()
      if (v) u.voice = v
      let gotBoundary = false
      u.onboundary = (e) => {
        if (e.name === 'word' || e.name === undefined) {
          gotBoundary = true
          advance()
        }
      }
      u.onend = finish
      u.onerror = finish
      window.speechSynthesis.speak(u)
      // Bazı tarayıcılar boundary olayı göndermez → zamanlayıcıyla ilerle
      const per = 330
      words.forEach((_, i) =>
        timers.push(window.setTimeout(() => !gotBoundary && advance(), 150 + i * per)),
      )
      // Güvenlik: TTS takılırsa
      timers.push(window.setTimeout(finish, 2500 + words.length * 600))
    } else {
      const per = 300
      words.forEach((_, i) => timers.push(window.setTimeout(advance, 100 + i * per)))
      timers.push(window.setTimeout(finish, 400 + words.length * per))
    }
  })
}

// ------------------------------------------------------------------ mikrofon
let micStream: MediaStream | null = null
let micRaf = 0

export async function startMicLevel() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const c = new AudioContext()
    const src = c.createMediaStreamSource(micStream)
    const an = c.createAnalyser()
    an.fftSize = 512
    src.connect(an)
    const buf = new Uint8Array(an.fftSize)
    const loop = () => {
      an.getByteTimeDomainData(buf)
      let sum = 0
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / buf.length)
      audioLevel.mic = audioLevel.mic * 0.7 + Math.min(1, rms * 6) * 0.3
      micRaf = requestAnimationFrame(loop)
    }
    loop()
    return true
  } catch {
    // İzin yok → sahte seviye (yine de animasyon canlı görünsün)
    const loop = () => {
      audioLevel.mic = 0.25 + Math.abs(Math.sin(performance.now() / 180)) * 0.35 * Math.random()
      micRaf = requestAnimationFrame(loop)
    }
    loop()
    return false
  }
}

export function stopMicLevel() {
  cancelAnimationFrame(micRaf)
  micStream?.getTracks().forEach((t) => t.stop())
  micStream = null
  audioLevel.mic = 0
}

// ------------------------------------------------------------ konuşma tanıma
type SR = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

export function speechRecognitionSupported() {
  const w = window as unknown as Record<string, unknown>
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

/** Bir cümle dinle; nihai metni döndür (boşsa ''). */
export function listenOnce(onInterim?: (t: string) => void): { promise: Promise<string>; stop: () => void } {
  const w = window as unknown as Record<string, new () => SR>
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  if (!Ctor) return { promise: Promise.resolve(''), stop: () => {} }
  const rec = new Ctor()
  rec.lang = 'tr-TR'
  rec.interimResults = true
  rec.continuous = false
  let finalText = ''
  const promise = new Promise<string>((resolve) => {
    rec.onresult = (e) => {
      let interim = ''
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interim += r[0].transcript
      }
      onInterim?.(finalText + interim)
    }
    rec.onend = () => resolve(finalText.trim())
    rec.onerror = () => resolve(finalText.trim())
  })
  rec.start()
  return { promise, stop: () => rec.stop() }
}
