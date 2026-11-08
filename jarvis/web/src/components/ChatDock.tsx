/**
 * Alt çubuk: yazılı sohbet + mikrofon (sesli) + barge-in.
 * Mikrofona basınca Jarvis konuşuyorsa hemen susar ve dinlemeye geçer.
 */
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { mockRespond } from '../demo/mockBrain'
import { askBackend, backendConfigured, cancelBackend } from '../core/backend'
import { closeScene, interrupt, play, setState } from '../core/player'
import { sfx } from '../core/sfx'
import { getStore, useJarvis } from '../core/store'
import { listenOnce, speechRecognitionSupported, startMicLevel, stopMicLevel } from '../core/voice'

export async function ask(text: string) {
  if (!text.trim()) return
  interrupt()
  cancelBackend()
  closeScene()
  if (backendConfigured()) askBackend(text.trim())
  else play(mockRespond(text.trim()))
}

export default function ChatDock({ onOpenGallery, onOpenSettings, onOpenLog }: { onOpenGallery: () => void; onOpenSettings: () => void; onOpenLog: () => void }) {
  const [text, setText] = useState('')
  const [interim, setInterim] = useState('')
  const state = useJarvis((s) => s.state)
  const listening = state === 'listening'
  const stopRef = useRef<(() => void) | null>(null)

  const toggleMic = async () => {
    if (listening) {
      stopRef.current?.()
      return
    }
    interrupt() // barge-in: Jarvis sussun
    cancelBackend()
    sfx('listen')
    setState('listening')
    startMicLevel()
    if (speechRecognitionSupported()) {
      const { promise, stop } = listenOnce(setInterim)
      stopRef.current = stop
      const heard = await promise
      stopMicLevel()
      setInterim('')
      if (heard) ask(heard)
      else if (getStore().state === 'listening') setState('idle')
    } else {
      // Konuşma tanıma yok (ör. Firefox): 3 sn dinleme animasyonu, sonra uyarı
      stopRef.current = () => {}
      setTimeout(() => {
        stopMicLevel()
        play([{ type: 'say', text: 'Bu tarayıcı konuşma tanımayı desteklemiyor efendim. Lütfen yazarak sorun.' }, { type: 'end' }])
      }, 3000)
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      {interim && <div className="mb-2 text-center font-mono text-sm text-hud-cyan/80">“{interim}”</div>}
      <form
        className="mx-auto flex max-w-3xl items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          ask(text)
          setText('')
        }}
      >
        <button type="button" onClick={onOpenGallery} className="hud-btn" title="Animasyon galerisi">
          ▦
        </button>
        <div className="hud-panel flex flex-1 items-center">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Jarvis'e yazın…  (ör. bugün hava nasıl?)" className="w-full bg-transparent px-3 py-3 font-hud text-base text-white placeholder:text-hud-cyan/40 focus:outline-none" />
          <button type="submit" className="px-3 font-mono text-sm text-hud-cyan hover:text-white" aria-label="Gönder">
            ➤
          </button>
        </div>
        <motion.button type="button" onClick={toggleMic} className={`hud-btn relative h-12 w-12 rounded-full text-xl ${listening ? 'border-hud-cyan bg-hud-cyan/20' : ''}`} whileTap={{ scale: 0.9 }} aria-label="Konuş">
          {listening && <span className="absolute inset-0 animate-ping rounded-full border border-hud-cyan" />}
          🎙
        </motion.button>
        <button type="button" onClick={onOpenLog} className="hud-btn" title="Sohbet geçmişi">
          ☰
        </button>
        <button type="button" onClick={onOpenSettings} className="hud-btn" title="Ayarlar">
          ⚙
        </button>
      </form>
    </div>
  )
}
