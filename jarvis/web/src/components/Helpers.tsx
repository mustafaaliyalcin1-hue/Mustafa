/**
 * Yardımcı arayüz parçaları:
 *  - TimerStrip   : çalışan zamanlayıcı/alarmları üstte canlı gösterir (dokununca sahne)
 *  - VisionPanel  : kamera / galeri → görsel analiz (sunucu → Gemini) → HUD kutulu sahne
 *  - MessageConfirm: hazırlanan mesaj için onay (Gönder → kağıt uçak + WhatsApp)
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { backendConfigured } from '../core/backend'
import { sendPendingMessage } from '../core/localCommands'
import { cancelTimers } from '../core/timekeeper'
import { closeScene, interrupt, play } from '../core/player'
import { sfx } from '../core/sfx'
import { getStore, setStore, useJarvis } from '../core/store'

export function TimerStrip() {
  const timers = useJarvis((s) => s.timers)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!timers.length) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [timers.length])
  if (!timers.length) return null
  return (
    <div className="pointer-events-auto absolute left-1/2 top-[86px] z-30 flex -translate-x-1/2 gap-2 sm:top-5">
      {timers.slice(0, 3).map((t) => {
        const left = Math.max(0, Math.round((t.end - now) / 1000))
        const red = left <= 10
        const txt = left >= 3600 ? `${Math.floor(left / 3600)}:${String(Math.floor((left % 3600) / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}` : `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
        return (
          <button key={t.id} onClick={() => play([{ type: 'scene', scene: 'timer', data: { id: t.id }, hold: 400 }, { type: 'end' }])} className={`hud-panel flex items-center gap-2 px-3 py-1.5 font-mono text-sm tabular-nums ${red ? 'animate-pulse border-red-400 text-red-300' : 'text-hud-cyan'}`}>
            {t.kind === 'alarm' ? '⏰' : '⏱'} {txt}
          </button>
        )
      })}
      <button onClick={() => (cancelTimers(), sfx('whoosh'))} className="hud-panel px-2 font-mono text-xs text-white/50" title="Hepsini iptal et">
        ✕
      </button>
    </div>
  )
}

/** Görseli en fazla 1280 px'e küçült, JPEG veri adresine çevir */
async function toDataUrl(file: File): Promise<string> {
  const img = await createImageBitmap(file)
  const k = Math.min(1, 1280 / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * k)
  c.height = Math.round(img.height * k)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.85)
}

export function VisionPanel() {
  const open = useJarvis((s) => s.visionOpen)
  const [q, setQ] = useState('')
  const cam = useRef<HTMLInputElement>(null)
  const gal = useRef<HTMLInputElement>(null)

  const analyze = async (file?: File) => {
    if (!file) return
    setStore({ visionOpen: false })
    const image = await toDataUrl(file)
    interrupt()
    closeScene()
    play({ type: 'scene', scene: 'vision', data: { image, loading: true }, hold: 300 })
    if (!backendConfigured()) {
      play([{ type: 'say', text: 'Görsel analiz için sunucu bağlantısı gerekli efendim.' }, { type: 'end' }])
      return
    }
    try {
      const s = getStore().settings
      const r = await fetch(`${s.apiUrl.replace(/\/+$/, '')}/api/vision`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-jarvis-key': s.apiKey }, body: JSON.stringify({ image, question: q }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
      play([{ type: 'scene', scene: 'vision', data: { image, description: j.description, objects: j.objects }, hold: 2500 }, { type: 'say', text: j.description || 'Bir şey göremedim efendim.' }, { type: 'end' }])
    } catch (e) {
      play([{ type: 'state', state: 'error', message: (e as Error).message }, { type: 'say', text: 'Görseli analiz edemedim efendim.' }, { type: 'end' }])
    }
    setQ('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-x-3 bottom-[84px] z-40 mx-auto max-w-sm" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}>
          <div className="hud-panel space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.4em] text-hud-cyan">📷 GÖRSEL ANALİZ</span>
              <button onClick={() => setStore({ visionOpen: false })} className="hud-btn h-8 min-w-[32px] px-2 text-sm">
                ✕
              </button>
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Soru (isteğe bağlı): bu bitkinin adı ne?" className="w-full rounded-sm border border-hud-cyan/30 bg-black/30 px-3 py-2 text-sm text-white focus:border-hud-cyan focus:outline-none" />
            <input ref={cam} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => analyze(e.target.files?.[0])} />
            <input ref={gal} type="file" accept="image/*" className="hidden" onChange={(e) => analyze(e.target.files?.[0])} />
            <div className="flex gap-2">
              <button onClick={() => cam.current?.click()} className="h-12 flex-1 rounded-sm border border-hud-cyan bg-hud-cyan/20 font-hud text-white">
                📸 Fotoğraf çek
              </button>
              <button onClick={() => gal.current?.click()} className="hud-btn h-12 flex-1">
                🖼 Galeriden
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function MessageConfirm() {
  const m = useJarvis((s) => s.pendingMessage)
  return (
    <AnimatePresence>
      {m && (
        <motion.div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="hud-panel w-full max-w-sm p-4" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <div className="font-mono text-[10px] tracking-[0.4em] text-amber-300">MESAJ ONAYI</div>
            <div className="mt-2 font-mono text-[11px] text-white/60">ALICI: {m.to}</div>
            <p className="mt-1 rounded-sm bg-white/5 p-2 font-hud text-lg text-white">{m.text}</p>
            <p className="mt-1 font-mono text-[10px] text-white/40">WhatsApp açılır, kişiyi siz seçip gönderirsiniz.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setStore({ pendingMessage: null })} className="hud-btn h-10 flex-1">
                Vazgeç
              </button>
              <button onClick={() => (setStore({ pendingMessage: null }), sendPendingMessage(m))} className="h-10 flex-1 rounded-sm border border-emerald-400 bg-emerald-500/20 font-hud text-white">
                ✈ Gönder
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
