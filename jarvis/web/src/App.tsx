/**
 * J.A.R.V.I.S. ana ekranı
 * Katmanlar (alttan üste): arka plan ızgarası → 3D ark reaktörü → konu sahnesi
 * → durum katmanları/altyazı → HUD widget'ları → sohbet çubuğu → çekmeceler/galeri
 */
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import './animations'
import BootSequence, { type BootCheck } from './components/BootSequence'
import ChatDock, { ask } from './components/ChatDock'
import { LogDrawer, SettingsDrawer } from './components/Drawers'
import HudWidgets from './components/HudWidgets'
import SceneLayer from './components/SceneLayer'
import StateOverlay from './components/StateOverlay'
import { setState } from './core/player'
import { startPerfMonitor } from './core/perf'
import { isLowPerf, useJarvis } from './core/store'
import Gallery from './pages/Gallery'

const ArcReactor = lazy(() => import('./components/ArcReactor'))

export default function App() {
  const [booting, setBooting] = useState(() => !new URLSearchParams(location.search).has('noboot'))
  const [gallery, setGallery] = useState(() => new URLSearchParams(location.search).has('galeri'))
  const [settings, setSettings] = useState(false)
  const [log, setLog] = useState(false)
  const sceneOpen = useJarvis((s) => !!s.scene)
  const low = useJarvis((s) => isLowPerf(s))

  useEffect(() => {
    startPerfMonitor()
    if (!booting) setState('idle')
    // Test/otomasyon için: ?soru=... ile doğrudan bir soru sor
    const q = new URLSearchParams(location.search).get('soru')
    if (q) setTimeout(() => ask(q), booting ? 3800 : 300)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checks: BootCheck[] = useMemo(
    () => [
      { label: 'YAPAY ZEKÂ ÇEKİRDEĞİ', ok: 'demo' },
      { label: 'İNTERNET', ok: navigator.onLine },
      { label: 'HOME ASSISTANT', ok: 'demo' },
      { label: 'ROBOROCK', ok: 'demo' },
      { label: 'TELEGRAM', ok: 'demo' },
      { label: 'SES MODÜLÜ', ok: 'speechSynthesis' in window },
    ],
    [],
  )
  const bootDone = useCallback(() => {
    setBooting(false)
    setState('idle')
  }, [])
  const reboot = () => {
    setState('booting')
    setBooting(true)
  }

  return (
    <div className={`relative h-[100dvh] w-full overflow-hidden bg-hud-bg text-white ${low ? 'low-perf' : ''}`}>
      <div className="hud-grid absolute inset-0" />
      <div className="vignette pointer-events-none absolute inset-0" />

      {/* 3D ark reaktörü: sahne açıkken küçülüp arkada kalır */}
      <div className={`absolute inset-0 transition-all duration-700 ${sceneOpen ? 'scale-50 opacity-25 blur-[1px]' : ''}`}>
        <Suspense fallback={null}>
          <ArcReactor />
        </Suspense>
      </div>

      <SceneLayer />
      <StateOverlay />
      <HudWidgets />
      <ChatDock onOpenGallery={() => setGallery(true)} onOpenSettings={() => setSettings(true)} onOpenLog={() => setLog(true)} />

      <AnimatePresence>{gallery && <Gallery onClose={() => setGallery(false)} onBoot={reboot} />}</AnimatePresence>
      <SettingsDrawer open={settings} onClose={() => setSettings(false)} />
      <LogDrawer open={log} onClose={() => setLog(false)} />

      {/* Tarama çizgileri + hafif glitch katmanı (en üstte, tıklamayı engellemez) */}
      <div className="scanlines pointer-events-none absolute inset-0 z-[60]" />
      {booting && <BootSequence checks={checks} onDone={bootDone} />}
    </div>
  )
}
