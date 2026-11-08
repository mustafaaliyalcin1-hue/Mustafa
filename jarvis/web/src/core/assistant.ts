/**
 * Asistan kontrolü: soru sorma, sesli komut ve "Jarvis" uyandırma kelimesi.
 * Hepsi tarayıcının ücretsiz Web Speech API'si (tr-TR) ile çalışır; ek hizmet yok.
 */
import { mockRespond } from '../demo/mockBrain'
import { askBackend, backendConfigured, cancelBackend } from './backend'
import { closeScene, interrupt, play, setState } from './player'
import { sfx } from './sfx'
import { getStore, setStore } from './store'
import { listenOnce, speechRecognitionSupported, startMicLevel, stopMicLevel } from './voice'

export function ask(text: string) {
  if (!text.trim()) return
  interrupt()
  cancelBackend()
  closeScene()
  if (backendConfigured()) askBackend(text.trim())
  else play(mockRespond(text.trim()))
}

let stopCurrent: (() => void) | null = null
let commandActive = false

/** Bir sesli komut dinle ve uygula. Jarvis konuşuyorsa hemen susar (barge-in). */
export async function voiceCommand(onInterim?: (t: string) => void) {
  if (commandActive) {
    stopCurrent?.()
    return
  }
  commandActive = true
  pauseWake()
  interrupt()
  cancelBackend()
  sfx('listen')
  setState('listening')
  startMicLevel()
  try {
    if (!speechRecognitionSupported()) {
      await new Promise((r) => setTimeout(r, 2500))
      play([{ type: 'say', text: 'Bu tarayıcı sesli komutu desteklemiyor efendim. Chrome ile açmayı ya da yazarak sormayı deneyin.' }, { type: 'end' }])
      return
    }
    const { promise, stop } = listenOnce(onInterim)
    stopCurrent = stop
    const heard = await promise
    if (heard) ask(stripWakeWord(heard) || heard)
    else if (getStore().state === 'listening') setState('idle')
  } finally {
    stopMicLevel()
    onInterim?.('')
    stopCurrent = null
    commandActive = false
    resumeWake()
  }
}

// ------------------------------------------------------------- uyandırma kelimesi
// Türkçe tanıyıcı "Jarvis"i farklı yazabilir; hepsini yakala.
const WAKE = /(?:^|[\s,.!?])(jarvis|jarvıs|carvis|cervis|jarviz|carviz|şarvis|çarvis)(?=$|[\s,.!?'’])/i

export function stripWakeWord(t: string) {
  const m = t.match(WAKE)
  return m ? t.slice((m.index ?? 0) + m[0].length).replace(/^['’]\p{L}*/u, '').replace(/^[\s,.!]+/, '').trim() : ''
}

let wakeRec: { stop(): void; abort(): void } | null = null
let wakeWanted = false
let wakePaused = false

export function wakeSupported() {
  return speechRecognitionSupported()
}

/** Sürekli dinle; "Jarvis" duyulunca komutu al. ("Jarvis, hava nasıl" tek seferde de olur.) */
export function startWake() {
  if (!wakeSupported()) return false
  wakeWanted = true
  setStore({ wakeActive: true })
  runWake()
  return true
}

export function stopWake() {
  wakeWanted = false
  setStore({ wakeActive: false })
  wakeRec?.abort()
  wakeRec = null
}

function pauseWake() {
  wakePaused = true
  wakeRec?.abort()
  wakeRec = null
}

function resumeWake() {
  wakePaused = false
  if (wakeWanted) setTimeout(runWake, 400)
}

function runWake() {
  if (!wakeWanted || wakePaused || wakeRec) return
  const w = window as unknown as Record<string, new () => any> // eslint-disable-line @typescript-eslint/no-explicit-any
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  const rec = new Ctor()
  rec.lang = 'tr-TR'
  rec.continuous = true
  rec.interimResults = true
  let fired = false
  rec.onresult = (e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => {
    if (fired) return
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      const t = r[0].transcript
      if (!WAKE.test(t)) continue
      const cmd = stripWakeWord(t)
      // "Jarvis" tek başına → dinleme moduna geç. "Jarvis, ... " ve cümle bittiyse → doğrudan uygula.
      if (r.isFinal || !cmd) {
        fired = true
        rec.abort()
        wakeRec = null
        if (r.isFinal && cmd.split(/\s+/).length >= 2) {
          sfx('listen')
          ask(cmd)
        } else voiceCommand()
        return
      }
    }
  }
  rec.onend = () => {
    if (wakeRec === rec) wakeRec = null
    // Chrome bir süre sessizlikten sonra durur → yeniden başlat
    if (!fired && wakeWanted && !wakePaused) setTimeout(runWake, 300)
  }
  rec.onerror = (ev: { error: string }) => {
    if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
      stopWake()
      play([{ type: 'say', text: 'Mikrofon izni verilmedi efendim. Tarayıcı ayarlarından izin verebilirsiniz.' }, { type: 'end' }])
    }
  }
  try {
    rec.start()
    wakeRec = rec
  } catch {
    setTimeout(runWake, 1000)
  }
}
