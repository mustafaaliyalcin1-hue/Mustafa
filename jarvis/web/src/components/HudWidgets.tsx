/**
 * Köşe HUD widget'ları: saat, tarih, hava, pil, internet + ara sıra geçen "sistem taraması".
 */
import { useEffect, useState } from 'react'
import { ask } from '../core/assistant'
import { setStore } from '../core/store'

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function useBattery() {
  const [b, setB] = useState<{ level: number; charging: boolean } | null>(null)
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean; addEventListener: (e: string, f: () => void) => void }> }
    nav.getBattery?.().then((bat) => {
      const upd = () => setB({ level: bat.level, charging: bat.charging })
      upd()
      bat.addEventListener('levelchange', upd)
      bat.addEventListener('chargingchange', upd)
    })
  }, [])
  return b
}

function useNet() {
  const [on, setOn] = useState(navigator.onLine)
  useEffect(() => {
    const a = () => setOn(true)
    const b = () => setOn(false)
    window.addEventListener('online', a)
    window.addEventListener('offline', b)
    return () => {
      window.removeEventListener('online', a)
      window.removeEventListener('offline', b)
    }
  }, [])
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
  return { on, type: conn?.effectiveType?.toUpperCase() }
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`hud-panel px-3 py-2 ${className}`}>{children}</div>
}

export default function HudWidgets() {
  const now = useNow()
  const bat = useBattery()
  const net = useNet()
  const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  const sec = now.getSeconds().toString().padStart(2, '0')
  const date = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-10 sm:left-5 sm:top-5">
        <Panel>
          <div className="font-hud text-3xl font-semibold leading-none text-hud-cyan text-glow sm:text-4xl">
            {time}
            <span className="ml-1 text-base text-hud-cyan/60">{sec}</span>
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-hud-cyan/70">{date}</div>
        </Panel>
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-2 sm:right-5 sm:top-5">
        {/* Hızlı düğmeler: günlük özet (hava + gündem + son maçlar) ve hesap makinesi */}
        <div className="flex gap-2">
          <button onClick={() => ask('günlük özet')} className="hud-panel pointer-events-auto flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-wider text-hud-cyan transition hover:bg-hud-cyan/10 hover:text-white active:scale-95" title="Günlük özet">
            <span className="text-amber-300">☀</span>
            <span className="hidden sm:inline">GÜNLÜK ÖZET</span>
          </button>
          <button onClick={() => setStore((s) => ({ calcOpen: !s.calcOpen }))} className="hud-panel pointer-events-auto flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-wider text-hud-cyan transition hover:bg-hud-cyan/10 hover:text-white active:scale-95" title="Hesap makinesi">
            🧮<span className="hidden sm:inline">HESAP</span>
          </button>
          <button onClick={() => setStore((s) => ({ visionOpen: !s.visionOpen }))} className="hud-panel pointer-events-auto flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-wider text-hud-cyan transition hover:bg-hud-cyan/10 hover:text-white active:scale-95" title="Görsel analiz">
            📷<span className="hidden sm:inline">BU NE?</span>
          </button>
          <button onClick={() => setStore((s) => ({ editorOpen: !s.editorOpen, studioOpen: false }))} className="hud-panel pointer-events-auto flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-wider text-hud-cyan transition hover:bg-hud-cyan/10 hover:text-white active:scale-95" title="Kurgu stüdyosu">
            🎞<span className="hidden sm:inline">KURGU</span>
          </button>
        </div>
        <Panel className="flex items-center gap-4 font-mono text-xs text-hud-cyan/80">
          <span className={net.on ? '' : 'text-red-400'}>
            {net.on ? '◉' : '○'} NET {net.on ? net.type || 'OK' : 'YOK'}
          </span>
          <span className="flex items-center gap-1">
            <span className="relative inline-block h-2.5 w-5 rounded-sm border border-hud-cyan/70">
              <span className="absolute inset-y-0 left-0 bg-hud-cyan/80" style={{ width: `${(bat?.level ?? 1) * 100}%` }} />
            </span>
            {bat ? `${Math.round(bat.level * 100)}%${bat.charging ? '⚡' : ''}` : '--'}
          </span>
        </Panel>
      </div>
      {/* Ara sıra geçen sistem tarama çizgisi */}
      <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 z-0 h-24" />
    </>
  )
}
