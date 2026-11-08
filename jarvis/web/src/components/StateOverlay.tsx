/**
 * Duruma bağlı 2D katmanlar:
 *  - "Dinliyorum efendim..." daktilo yazısı
 *  - "Analiz ediliyor" + veri akış çizgileri (düşünürken)
 *  - Kelime kelime altyazı (konuşurken)
 *  - Yeşil onay halkası (başarılı)  - Kırmızı glitch (hata)
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useJarvis } from '../core/store'

function Typewriter({ text, speed = 45 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const t = setInterval(() => setN((x) => (x >= text.length ? x : x + 1)), speed)
    return () => clearInterval(t)
  }, [text, speed])
  return (
    <span>
      {text.slice(0, n)}
      <span className="caret">▍</span>
    </span>
  )
}

function DataStreams() {
  // Ekranın iki yanından merkeze akan mavi veri çizgileri
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="data-stream"
          style={{
            top: `${8 + ((i * 37) % 84)}%`,
            [i % 2 ? 'left' : 'right']: 0,
            animationDelay: `${(i * 0.23) % 1.6}s`,
            animationDuration: `${1.1 + (i % 4) * 0.3}s`,
            transform: i % 2 ? 'none' : 'scaleX(-1)',
          }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-[30%] text-center font-mono text-[11px] tracking-[0.4em] text-hud-blue/80">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}>
            ▮
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function Subtitle() {
  const sub = useJarvis((s) => s.subtitle)
  if (!sub) return null
  const words = sub.text.split(/\s+/).filter(Boolean)
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center px-4 sm:bottom-32">
      <p className="max-w-3xl text-center font-hud text-xl font-medium leading-snug text-white/95 drop-shadow-[0_0_8px_rgba(62,232,255,0.6)] sm:text-2xl">
        {words.map((w, i) => (
          <motion.span
            key={i + w}
            className="mr-[0.3em] inline-block"
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={i < sub.shown ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0.08, y: 8 }}
            transition={{ duration: 0.22 }}
          >
            {w}
          </motion.span>
        ))}
      </p>
    </div>
  )
}

export default function StateOverlay() {
  const state = useJarvis((s) => s.state)
  const msg = useJarvis((s) => s.stateMessage)
  const sceneOpen = useJarvis((s) => !!s.scene)

  return (
    <>
      <AnimatePresence>
        {state === 'listening' && (
          <motion.div
            key="listen"
            className="pointer-events-none absolute inset-x-0 top-[22%] z-20 text-center font-hud text-2xl tracking-widest text-hud-cyan text-glow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Typewriter text="Dinliyorum efendim..." />
          </motion.div>
        )}
        {state === 'thinking' && !sceneOpen && (
          <motion.div key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DataStreams />
            <div className="pointer-events-none absolute inset-x-0 top-[22%] z-20 text-center font-mono text-sm tracking-[0.5em] text-hud-blue">
              <Typewriter text="ANALİZ EDİLİYOR" speed={30} />
            </div>
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div key="ok" className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <svg viewBox="0 0 200 200" className="h-64 w-64 drop-shadow-[0_0_18px_#39ff9a]">
              <motion.circle cx="100" cy="100" r="80" fill="none" stroke="#39ff9a" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} style={{ originX: '50%', originY: '50%' }} />
              <motion.path d="M65 102 L90 126 L138 76" fill="none" stroke="#39ff9a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.35 }} />
            </svg>
            <motion.div className="absolute h-64 w-64 rounded-full border-2 border-emerald-300" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ delay: 0.6, duration: 0.8 }} />
          </motion.div>
        )}
        {state === 'error' && (
          <motion.div key="err" className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="error-flash absolute inset-0" />
            <div className="glitch-text font-hud text-3xl font-bold tracking-widest text-red-400 sm:text-5xl" data-text="SİSTEM HATASI EFENDİM">
              SİSTEM HATASI EFENDİM
            </div>
            {msg && <p className="mt-3 max-w-md px-6 text-center font-mono text-sm text-red-200/90">{msg}</p>}
          </motion.div>
        )}
      </AnimatePresence>
      <Subtitle />
    </>
  )
}
