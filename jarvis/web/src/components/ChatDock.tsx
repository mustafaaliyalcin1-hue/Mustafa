/**
 * Alt çubuk: yazılı sohbet + mikrofon (sesli komut) + "Jarvis" eller serbest modu.
 * Mikrofona basınca Jarvis konuşuyorsa hemen susar ve dinlemeye geçer (barge-in).
 */
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ask, startWake, stopWake, voiceCommand, wakeSupported } from '../core/assistant'
import { setStore, useJarvis } from '../core/store'

export { ask }

export default function ChatDock({ onOpenGallery, onOpenSettings, onOpenLog }: { onOpenGallery: () => void; onOpenSettings: () => void; onOpenLog: () => void }) {
  const [text, setText] = useState('')
  const [interim, setInterim] = useState('')
  const listening = useJarvis((s) => s.state === 'listening')
  const wake = useJarvis((s) => s.wakeActive)

  const toggleWake = () => {
    if (wake) stopWake()
    else startWake()
    setStore((s) => ({ settings: { ...s.settings, handsFree: !wake } }))
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      {interim && <div className="mb-2 text-center font-mono text-sm text-hud-cyan/80">“{interim}”</div>}
      {wake && !listening && (
        <div className="mb-2 text-center font-mono text-[11px] tracking-[0.3em] text-hud-cyan/70">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-hud-cyan align-middle" />
          “JARVIS” DEMENİZİ BEKLİYORUM
        </div>
      )}
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
        <div className="hud-panel flex min-w-0 flex-1 items-center">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Jarvis'e yazın…  (ör. bugün hava nasıl?)" className="w-full min-w-0 bg-transparent px-3 py-3 font-hud text-base text-white placeholder:text-hud-cyan/40 focus:outline-none" />
          <button type="submit" className="px-3 font-mono text-sm text-hud-cyan hover:text-white" aria-label="Gönder">
            ➤
          </button>
        </div>
        <motion.button type="button" onClick={() => voiceCommand(setInterim)} className={`hud-btn relative h-12 w-12 rounded-full text-xl ${listening ? 'border-hud-cyan bg-hud-cyan/20' : ''}`} whileTap={{ scale: 0.9 }} aria-label="Konuş">
          {listening && <span className="absolute inset-0 animate-ping rounded-full border border-hud-cyan" />}
          🎙
        </motion.button>
        {wakeSupported() && (
          <button type="button" onClick={toggleWake} className={`hud-btn hidden sm:flex ${wake ? 'border-hud-cyan bg-hud-cyan/20 text-white' : ''}`} title="Eller serbest: “Jarvis” deyince dinlesin">
            {wake ? 'J●' : 'J○'}
          </button>
        )}
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
