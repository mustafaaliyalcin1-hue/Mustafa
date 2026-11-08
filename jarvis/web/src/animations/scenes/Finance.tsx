/**
 * FİNANS / DÖVİZ / ALTIN / KRİPTO
 * Grafik çizgisi canlı çiziliyormuş gibi soldan sağa akar; yükselişte yeşil ok
 * yukarı fırlar, düşüşte kırmızı ok aşağı iner; fiyatlar kaydırmalı sayaçla
 * gelir; altın istenmişse altta parlayan külçeler belirir.
 */
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { CountUp, SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface FinanceData {
  items: { symbol: string; name: string; price: number; change: number; unit: string }[]
  chart?: { label: string; points: number[] }
}

function Chart({ chart, up }: { chart: NonNullable<FinanceData['chart']>; up: boolean }) {
  const W = 600
  const H = 200
  const { path, area, last } = useMemo(() => {
    const p = chart.points
    const min = Math.min(...p)
    const max = Math.max(...p)
    const pts = p.map((v, i) => [(i / Math.max(1, p.length - 1)) * W, H - 12 - ((v - min) / (max - min || 1)) * (H - 30)])
    const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    return { path, area: `${path} L${W},${H} L0,${H} Z`, last: pts.at(-1)! }
  }, [chart.points])
  const col = up ? '#39ff9a' : '#ff3b4e'
  return (
    <div className="hud-panel w-full px-3 py-2">
      <div className="flex justify-between font-mono text-[10px] tracking-widest text-hud-cyan/70">
        <span>{chart.label.toLocaleUpperCase('tr-TR')}</span>
        <span>
          MİN {Math.min(...chart.points).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} · MAKS {Math.max(...chart.points).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full sm:h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.35" />
            <stop offset="100%" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#3ee8ff" strokeOpacity="0.1" />
        ))}
        <motion.path d={area} fill="url(#fa)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.6 }} />
        <motion.path d={path} fill="none" stroke={col} strokeWidth="2.5" style={{ filter: `drop-shadow(0 0 6px ${col})` }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 1.8, ease: 'easeInOut' }} />
        <motion.circle cx={last[0]} cy={last[1]} r="5" fill={col} initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 1] }} transition={{ delay: 2.2 }} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
      </svg>
    </div>
  )
}

function Finance({ data }: SceneProps<FinanceData>) {
  const items = data.items || []
  const hasGold = items.some((i) => i.symbol === 'GRAM' || i.symbol === 'ONS')
  if (!items.length)
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="font-mono text-sm tracking-[0.4em] text-hud-cyan" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          PİYASA VERİLERİ ALINIYOR
        </motion.div>
      </div>
    )
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneTitle>PİYASALAR</SceneTitle>
      <div className="absolute inset-x-0 bottom-[100px] top-[130px] mx-auto flex max-w-4xl flex-col gap-3 overflow-y-auto px-3 sm:top-[140px]">
        <div className={`grid gap-2 ${items.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
          {items.slice(0, 8).map((it, i) => {
            const up = it.change >= 0
            const dec = it.price >= 1000 ? 0 : it.price >= 10 ? 2 : 4
            return (
              <motion.div key={it.symbol} className="hud-panel relative overflow-hidden px-3 py-3" style={{ borderColor: up ? '#39ff9a55' : '#ff3b4e55' }} initial={{ opacity: 0, y: 30, rotateX: 60 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.15 + i * 0.12 }}>
                <div className="font-mono text-[10px] tracking-widest text-hud-cyan/80">
                  {it.symbol} · {it.name}
                </div>
                <div className="mt-1 font-hud text-2xl font-bold text-white sm:text-3xl">
                  <CountUp to={it.price} decimals={dec} duration={1.4} delay={0.3 + i * 0.12} />
                  <span className="ml-1 text-base text-white/60">{it.unit}</span>
                </div>
                <div className={`flex items-center gap-1 font-mono text-sm ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {/* Ok: yükselişte fırlar, düşüşte iner */}
                  <motion.span className="inline-block text-lg" initial={{ y: up ? 30 : -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 + i * 0.12, type: 'spring', stiffness: 300, damping: 12 }}>
                    {up ? '▲' : '▼'}
                  </motion.span>
                  %{Math.abs(it.change).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                </div>
                {/* Büyük arka plan oku */}
                <motion.div className={`pointer-events-none absolute right-1 text-6xl font-black ${up ? 'text-emerald-400/15' : 'text-red-400/15'}`} initial={{ y: up ? 80 : -80 }} animate={{ y: up ? -6 : 10 }} transition={{ delay: 0.9 + i * 0.12, duration: 0.6 }} style={{ top: 0 }}>
                  {up ? '⬆' : '⬇'}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
        {data.chart && data.chart.points.length > 1 && <Chart chart={data.chart} up={data.chart.points.at(-1)! >= data.chart.points[0]} />}
        {hasGold && (
          <div className="flex items-end justify-center gap-1 pt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div key={i} className="gold-bar h-8 w-16 sm:h-10 sm:w-20" style={{ animationDelay: `${i * 0.3}s` }} initial={{ y: -200, opacity: 0, rotate: i % 2 ? 6 : -6 }} animate={{ y: i === 4 ? -36 : 0, x: i === 4 ? -40 : 0, opacity: 1, rotate: 0 }} transition={{ delay: 1.2 + i * 0.15, type: 'spring', stiffness: 200, damping: 14 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const series = (start: number, n: number, drift: number) => Array.from({ length: n }, (_, i) => start * (1 + drift * i + Math.sin(i * 1.3) * 0.006))

registerScene<FinanceData>({
  id: 'finance',
  title: 'Finans / döviz / altın',
  category: 'Bilgi',
  tools: ['get_market'],
  component: Finance,
  minDuration: 4500,
  demo: [
    {
      label: 'Dolar ve altın',
      data: {
        items: [
          { symbol: 'USD', name: 'Dolar', price: 41.86, change: 0.21, unit: '₺' },
          { symbol: 'EUR', name: 'Euro', price: 48.52, change: -0.14, unit: '₺' },
          { symbol: 'GRAM', name: 'Gram Altın', price: 5412, change: 1.35, unit: '₺' },
          { symbol: 'BTC', name: 'Bitcoin', price: 4125000, change: -2.4, unit: '₺' },
        ],
        chart: { label: 'Gram altın · 30 gün', points: series(5000, 30, 0.0028) },
      },
      say: 'Dolar 41 lira 86 kuruş, euro 48 lira 52 kuruş efendim. Gram altın bugün yüzde 1,3 yükselişle 5 bin 412 lira.',
    },
    {
      label: 'Düşüş',
      data: { items: [{ symbol: 'BTC', name: 'Bitcoin', price: 4125000, change: -4.8, unit: '₺' }, { symbol: 'ETH', name: 'Ethereum', price: 152300, change: -6.1, unit: '₺' }], chart: { label: 'Bitcoin · 30 gün', points: series(4600000, 30, -0.004) } },
      say: 'Kripto piyasasında düşüş var efendim. Bitcoin son 24 saatte yüzde 4,8 geriledi.',
    },
  ],
})
