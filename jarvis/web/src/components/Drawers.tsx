/** Ayarlar ve sohbet geçmişi çekmeceleri */
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { startWake, stopWake, wakeSupported } from '../core/assistant'
import { setStore, useJarvis, type PerfMode } from '../core/store'

function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="absolute inset-0 z-40 bg-black/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="hud-panel absolute bottom-0 right-0 top-0 z-50 w-[min(92vw,380px)] overflow-y-auto p-5" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 24, stiffness: 220 }}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-hud text-xl tracking-[0.3em] text-hud-cyan">{title}</h2>
              <button onClick={onClose} className="hud-btn">
                ✕
              </button>
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between border-b border-hud-cyan/10 py-3 font-hud text-white/90">
      {label}
      <button onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full border transition ${value ? 'border-hud-cyan bg-hud-cyan/30' : 'border-white/30 bg-white/5'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${value ? 'left-6 bg-hud-cyan shadow-[0_0_8px_#3ee8ff]' : 'left-1 bg-white/50'}`} />
      </button>
    </label>
  )
}

export function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useJarvis((s) => s.settings)
  const lowPerf = useJarvis((s) => s.lowPerf)
  const set = (p: Partial<typeof settings>) => setStore((s) => ({ settings: { ...s.settings, ...p } }))
  return (
    <Drawer open={open} onClose={onClose} title="AYARLAR">
      <Toggle label="Arayüz ses efektleri" value={settings.sound} onChange={(v) => set({ sound: v })} />
      <Toggle label="Sesli yanıt (TTS)" value={settings.voice} onChange={(v) => set({ voice: v })} />
      {wakeSupported() && (
        <Toggle
          label="Eller serbest: “Jarvis” deyince dinle"
          value={settings.handsFree}
          onChange={(v) => {
            set({ handsFree: v })
            if (v) startWake()
            else stopWake()
          }}
        />
      )}
      <div className="border-b border-hud-cyan/10 py-3">
        <div className="mb-2 font-hud text-white/90">Performans modu</div>
        <div className="flex gap-2">
          {(['auto', 'high', 'low'] as PerfMode[]).map((m) => (
            <button key={m} onClick={() => set({ perf: m })} className={`hud-btn flex-1 ${settings.perf === m ? 'border-hud-cyan bg-hud-cyan/20 text-white' : ''}`}>
              {m === 'auto' ? 'Otomatik' : m === 'high' ? 'Yüksek' : 'Düşük'}
            </button>
          ))}
        </div>
        {settings.perf === 'auto' && <p className="mt-2 font-mono text-[11px] text-hud-cyan/60">Tespit edilen: {lowPerf ? 'zayıf cihaz → efektler azaltıldı' : 'güçlü cihaz → tüm efektler açık'}</p>}
      </div>
      <ServerSettings />
    </Drawer>
  )
}

export function LogDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const messages = useJarvis((s) => s.messages)
  return (
    <Drawer open={open} onClose={onClose} title="SOHBET">
      {messages.length === 0 && <p className="font-mono text-sm text-hud-cyan/50">Henüz mesaj yok efendim.</p>}
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : ''}>
            <div className="font-mono text-[10px] tracking-widest text-hud-cyan/50">
              {m.role === 'user' ? 'SİZ' : 'JARVIS'} · {new Date(m.at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={`mt-1 inline-block max-w-[90%] rounded px-3 py-2 text-left text-sm ${m.role === 'user' ? 'bg-hud-blue/20 text-white' : 'border border-hud-cyan/20 bg-hud-cyan/5 text-white/90'}`}>{m.text}</div>
          </div>
        ))}
      </div>
    </Drawer>
  )
}

/** Sunucu (backend) bağlantısı: adres + uygulama anahtarı. Boşsa demo modu. */
function ServerSettings() {
  const settings = useJarvis((s) => s.settings)
  const [url, setUrl] = useState(settings.apiUrl)
  const [key, setKey] = useState(settings.apiKey)
  const [status, setStatus] = useState<string>('')
  const connected = !!(settings.apiUrl && settings.apiKey)

  const save = async () => {
    setStore((s) => ({ settings: { ...s.settings, apiUrl: url.trim(), apiKey: key.trim() } }))
    if (!url.trim()) return setStatus('Demo moduna geçildi.')
    setStatus('Bağlanılıyor…')
    try {
      const r = await fetch(url.trim().replace(/\/+$/, '') + '/health', { signal: AbortSignal.timeout(60000) })
      const j = await r.json()
      setStatus(`Bağlandı ✓ · Yapay zekâ: ${j.services.ai ? '✓' : '✗ (anahtar yok)'} · ElevenLabs: ${j.services.tts ? '✓' : '✗'}`)
    } catch {
      setStatus('Sunucuya ulaşılamadı. (Ücretsiz sunucu uykudaysa ilk açılış 1 dakika sürebilir.)')
    }
  }

  return (
    <div className="py-3">
      <div className="mb-2 font-hud text-white/90">Sunucu bağlantısı</div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://jarvis-xxxx.onrender.com" className="mb-2 w-full rounded-sm border border-hud-cyan/30 bg-black/30 px-3 py-2 font-mono text-xs text-white placeholder:text-hud-cyan/30 focus:border-hud-cyan focus:outline-none" />
      <input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="Uygulama anahtarı (JARVIS_APP_SECRET)" className="mb-2 w-full rounded-sm border border-hud-cyan/30 bg-black/30 px-3 py-2 font-mono text-xs text-white placeholder:text-hud-cyan/30 focus:border-hud-cyan focus:outline-none" />
      <button onClick={save} className="hud-btn w-full">Kaydet ve bağlan</button>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-hud-cyan/60">{status || (connected ? 'Gerçek beyin (Claude) kullanılıyor.' : 'DEMO MODU · Sunucu adresi girilmedi; sahte verilerle çalışıyor.')}</p>
    </div>
  )
}
