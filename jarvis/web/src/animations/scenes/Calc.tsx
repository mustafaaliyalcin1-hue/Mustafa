/**
 * HESAPLAMA
 * Arka planda matematik sembolleri süzülür → ifadenin parçaları (sayılar, işaretler)
 * ekranın dört bir yanından uçup bir satırda birleşir → "=" belirir →
 * sonuç sayarak gelir ve büyük puntoyla "çarpar" (sarsıntı + flaş + halka).
 */
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { sfx } from '../../core/sfx'
import { useJarvis } from '../../core/store'
import { CountUp } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface CalcData {
  expr: string
  result: number
  label?: string
}

const SYMBOLS = ['π', '∑', '√', '∫', '×', '÷', '%', '∞', 'Δ', '=', '+', 'x²', 'λ', 'θ']

function Calc({ data, low }: SceneProps<CalcData>) {
  // Hesap makinesi paneli açıksa animasyon panelin kapatmadığı bölgede oynar
  const padOpen = useJarvis((s) => s.calcOpen)
  const tokens = useMemo(() => data.expr.split(/\s+/).filter(Boolean), [data.expr])
  const tEq = 0.25 + tokens.length * 0.12 + 0.35
  const [slam, setSlam] = useState(false)
  const shake = useAnimationControls()
  const decimals = Number.isInteger(data.result) ? 0 : Math.min(4, (String(data.result).split('.')[1] || '').length)

  useEffect(() => {
    const ts = tokens.map((_, i) => window.setTimeout(() => sfx('tick'), 250 + i * 120))
    ts.push(
      window.setTimeout(() => {
        setSlam(true)
        sfx('stamp')
        shake.start({ x: [0, -10, 8, -5, 3, 0], transition: { duration: 0.4 } })
      }, (tEq + 0.9) * 1000),
    )
    return () => ts.forEach(clearTimeout)
  }, [tokens, tEq, shake])

  // Sembollerin rastgele konumları (bir kez)
  const floaters = useMemo(() => Array.from({ length: low ? 10 : 26 }, (_, i) => ({ s: SYMBOLS[i % SYMBOLS.length], x: (i * 37) % 100, y: (i * 53) % 100, d: 6 + (i % 5) * 2, size: 16 + ((i * 7) % 30) })), [low])

  return (
    <motion.div className={`absolute inset-0 flex flex-col items-center overflow-hidden ${padOpen ? 'justify-start pt-[92px] sm:justify-center sm:pt-0 sm:pr-[360px]' : 'justify-center'}`} animate={shake}>
      {/* Süzülen semboller */}
      {floaters.map((f, i) => (
        <motion.span key={i} className="pointer-events-none absolute font-mono text-hud-cyan/15" style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: f.size }} animate={{ y: [0, -30, 0], opacity: [0.1, 0.35, 0.1], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: f.d, delay: i * 0.2 }}>
          {f.s}
        </motion.span>
      ))}
      {data.label && (
        <motion.div className={`mb-4 rounded-sm border border-hud-cyan/40 px-3 py-1 font-mono text-[11px] tracking-[0.4em] text-hud-cyan ${padOpen ? 'hidden sm:block' : ''}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {data.label}
        </motion.div>
      )}
      {/* İfade: parçalar uçarak birleşir */}
      <div className={`flex max-w-[92vw] flex-wrap items-center justify-center gap-x-3 gap-y-1 font-hud text-white/90 ${padOpen ? 'text-xl sm:text-4xl' : 'text-3xl sm:text-5xl'}`}>
        {tokens.map((t, i) => {
          const a = (i / Math.max(1, tokens.length)) * Math.PI * 2 + 0.7
          return (
            <motion.span key={i} className={/^[×÷+−\-^=%]$/.test(t) ? 'text-hud-cyan' : ''} initial={{ x: Math.cos(a) * 520, y: Math.sin(a) * 380, opacity: 0, rotate: (i % 2 ? 1 : -1) * 90, scale: 2.2 }} animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }} transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 160, damping: 14 }}>
              {t}
            </motion.span>
          )
        })}
        <motion.span className="text-hud-cyan" initial={{ opacity: 0, scale: 3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: tEq, type: 'spring', stiffness: 300 }}>
          =
        </motion.span>
      </div>
      {/* Sonuç */}
      <div className={`relative ${padOpen ? 'mt-1 sm:mt-6' : 'mt-6'}`}>
        {slam && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div className="h-40 w-40 rounded-full border-2 border-hud-cyan" initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.8 }} />
          </div>
        )}
        <motion.div className={`font-hud font-bold text-white ${padOpen ? 'text-4xl sm:text-7xl' : 'text-6xl sm:text-8xl'}`} style={{ textShadow: '0 0 30px #3ee8ff, 0 0 60px #1b8cff' }} initial={{ opacity: 0, scale: 0.4, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: slam ? [1.6, 1] : 1, filter: 'blur(0px)' }} transition={{ delay: slam ? 0 : tEq + 0.1, duration: slam ? 0.35 : 0.8 }}>
          {Number.isFinite(data.result) ? <CountUp to={data.result} decimals={decimals} duration={0.8} delay={tEq + 0.1} /> : 'Tanımsız'}
        </motion.div>
      </div>
      {slam && <motion.div className="pointer-events-none absolute inset-0 bg-hud-cyan" initial={{ opacity: 0.25 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
    </motion.div>
  )
}

registerScene<CalcData>({
  id: 'calc',
  title: 'Hesaplama',
  category: 'Araçlar',
  tools: ['calc'],
  component: Calc,
  minDuration: 3200,
  demo: [
    { label: 'Dört işlem', data: { expr: '125 × 30 + 18', result: 3768, label: 'HESAP' }, say: 'Sonuç 3.768 efendim.' },
    { label: 'Zam', data: { expr: '5.000 + %20', result: 6000, label: 'ZAM' }, say: '5.000 sayısına yüzde 20 zam yapılınca 6.000 olur efendim; artış 1.000.' },
    { label: 'KDV', data: { expr: '1.000 × 1,2', result: 1200, label: 'KDV DAHİL' }, say: 'Yüzde 20 KDV ile birlikte 1.200 eder efendim; KDV tutarı 200.' },
  ],
})
