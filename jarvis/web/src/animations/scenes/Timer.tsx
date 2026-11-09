/**
 * ZAMANLAYICI / ALARM — holografik saat kadranı, geri sayan halka, dönen çentikler;
 * son 10 saniyede kırmızıya döner ve nabız atar. Süre dolunca kırmızı flaş + "SÜRE DOLDU".
 */
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useJarvis } from '../../core/store'
import { registerScene, type SceneProps } from '../registry'

export interface TimerData {
  id?: string
  done?: boolean
  label?: string
  kind?: 'timer' | 'alarm'
  demo?: number // galeri için sahte süre (sn)
}

function fmt(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function TimerScene({ data }: SceneProps<TimerData>) {
  const timer = useJarvis((s) => s.timers.find((t) => t.id === data.id))
  const [now, setNow] = useState(Date.now())
  const [demoEnd] = useState(() => Date.now() + (data.demo ?? 0) * 1000)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [])
  const end = timer?.end ?? (data.demo ? demoEnd : now)
  const total = timer?.total ?? data.demo ?? 1
  const left = data.done ? 0 : Math.max(0, (end - now) / 1000)
  const frac = Math.min(1, left / total)
  const red = data.done || left <= 10
  const col = red ? '#ff3b4e' : '#3ee8ff'
  const R = 120
  const C = 2 * Math.PI * R
  const label = timer?.label ?? data.label ?? (data.kind === 'alarm' ? 'Alarm' : 'Zamanlayıcı')
  const isAlarm = (timer?.kind ?? data.kind) === 'alarm'

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {data.done && <motion.div className="absolute inset-0 bg-red-600" animate={{ opacity: [0.5, 0, 0.4, 0, 0.3, 0] }} transition={{ duration: 1.6 }} />}
      <motion.div className="relative h-72 w-72 sm:h-80 sm:w-80" animate={red && !data.done ? { scale: [1, 1.04, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
        <svg viewBox="-150 -150 300 300" className="h-full w-full">
          {/* dönen çentik halkası */}
          <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}>
            {Array.from({ length: 60 }).map((_, i) => (
              <line key={i} x1="0" y1={-142} x2="0" y2={i % 5 ? -136 : -128} stroke={col} strokeOpacity={i % 5 ? 0.3 : 0.7} strokeWidth="2" transform={`rotate(${i * 6})`} />
            ))}
          </motion.g>
          <circle r={R} fill="none" stroke={col} strokeOpacity="0.12" strokeWidth="10" />
          <circle r={R} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90)" style={{ filter: `drop-shadow(0 0 10px ${col})`, transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }} />
          {/* saniye ibresi */}
          <line x1="0" y1="0" x2="0" y2={-R + 18} stroke={col} strokeWidth="2" transform={`rotate(${(now / 1000) * 6})`} strokeOpacity="0.5" />
          <circle r="5" fill={col} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-[10px] tracking-[0.4em]" style={{ color: col }}>
            {isAlarm ? '⏰ ALARM' : '⏱ ZAMANLAYICI'}
          </div>
          <div className="font-hud text-5xl font-bold tabular-nums text-white sm:text-6xl" style={{ textShadow: `0 0 20px ${col}` }}>
            {data.done ? '00:00' : fmt(left)}
          </div>
          <div className="max-w-[60%] truncate font-hud text-sm text-white/70">{label}</div>
        </div>
      </motion.div>
      {data.done && (
        <motion.div className="mt-6 font-hud text-4xl font-black tracking-widest text-red-400" initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          {isAlarm ? 'ALARM!' : 'SÜRE DOLDU'}
        </motion.div>
      )}
    </div>
  )
}

registerScene<TimerData>({
  id: 'timer',
  title: 'Zamanlayıcı / alarm',
  category: 'Araçlar',
  component: TimerScene,
  minDuration: 2000,
  demo: [
    { label: '15 saniye', data: { demo: 15, label: 'Çay demleniyor' }, say: '15 saniye sayıyorum efendim.' },
    { label: 'Süre doldu', data: { done: true, label: 'Makarna' }, say: 'Süre doldu efendim: makarna.' },
  ],
})
