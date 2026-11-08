/** Sahnelerde ortak kullanılan küçük yardımcı bileşenler */
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

/** Sayarak gelen rakam */
export function CountUp({ to, duration = 1.2, decimals = 0, delay = 0, className = '' }: { to: number; duration?: number; decimals?: number; delay?: number; className?: string }) {
  const mv = useMotionValue(0)
  const txt = useTransform(mv, (v) => v.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }))
  useEffect(() => {
    const c = animate(mv, to, { duration, delay, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [to, duration, delay, mv])
  return <motion.span className={className}>{txt}</motion.span>
}

/** ms sonra true olur — sahne zaman çizelgesi için */
export function useAfter(ms: number) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOn(true), ms)
    return () => clearTimeout(t)
  }, [ms])
  return on
}

/** HUD köşeli çerçeve */
export function HudFrame({ children, className = '', color = '#3ee8ff' }: { children: React.ReactNode; className?: string; color?: string }) {
  return (
    <div className={`relative ${className}`}>
      {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((c) => (
        <span key={c} className={`absolute h-4 w-4 ${c}`} style={{ borderColor: color }} />
      ))}
      {children}
    </div>
  )
}

/** Sahne başlığı (sol üst, daktilo hissi) */
export function SceneTitle({ children, color = '#3ee8ff' }: { children: React.ReactNode; color?: string }) {
  return (
    <motion.div className="absolute left-1/2 top-[104px] z-20 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.25em] sm:top-24 sm:text-xs sm:tracking-[0.5em]" style={{ color }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      ▸ {children}
    </motion.div>
  )
}
