/**
 * AÇILIŞ SEKANSI — en fazla ~3 sn, dokununca/tuşa basınca atlanır.
 * "J.A.R.V.I.S. ONLINE" + satır satır sistem kontrolleri + reaktör açılışı.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { sfx } from '../core/sfx'

export interface BootCheck {
  label: string
  ok: boolean | 'demo'
}

export default function BootSequence({ checks, onDone }: { checks: BootCheck[]; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    sfx('boot')
    const timers: number[] = []
    checks.forEach((_, i) =>
      timers.push(
        window.setTimeout(() => {
          setStep(i + 1)
          sfx('tick')
        }, 500 + i * 280),
      ),
    )
    timers.push(window.setTimeout(() => setLeaving(true), 500 + checks.length * 280 + 700))
    timers.push(window.setTimeout(onDone, 500 + checks.length * 280 + 1150))
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', skip)
    }
  }, [checks, onDone])

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-hud-bg"
          onClick={onDone}
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
          transition={{ duration: 0.45 }}
        >
          {/* Açılan halka */}
          <motion.div
            className="absolute h-72 w-72 rounded-full border border-hud-cyan/40"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.1, 1], opacity: [0, 1, 0.5] }}
            transition={{ duration: 1.2 }}
          />
          <motion.div
            className="absolute h-96 w-96 rounded-full border border-dashed border-hud-blue/30 spin-slow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.h1
            className="glitch-text font-hud text-4xl font-bold tracking-[0.4em] text-hud-cyan text-glow sm:text-6xl"
            data-text="J.A.R.V.I.S."
            initial={{ opacity: 0, letterSpacing: '1.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 0.8 }}
          >
            J.A.R.V.I.S.
          </motion.h1>
          <motion.p
            className="mt-2 font-mono text-sm tracking-[0.5em] text-hud-cyan/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1] }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            ONLINE
          </motion.p>
          <div className="mt-8 w-72 space-y-1 font-mono text-xs sm:text-sm">
            {checks.slice(0, step).map((c) => (
              <motion.div key={c.label} className="flex justify-between border-b border-hud-cyan/10 pb-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <span className="text-hud-cyan/80">{c.label}</span>
                <span className={c.ok === true ? 'text-emerald-400' : c.ok === 'demo' ? 'text-amber-300' : 'text-red-400'}>
                  {c.ok === true ? '✓' : c.ok === 'demo' ? 'DEMO' : '✗'}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="absolute bottom-8 font-mono text-[10px] tracking-widest text-hud-cyan/40">ATLAMAK İÇİN DOKUNUN</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
