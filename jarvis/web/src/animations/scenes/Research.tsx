/**
 * ARAŞTIRMA / WEB ARAMASI
 * 3D hissi veren dönen dünya küresi → küreden kaynaklara ışık hüzmeleri →
 * kaynak kartları uçarak gelir, taranır, okunan satır vurgulanır → kartlar
 * arası bağlantı çizgileri → "N kaynak tarandı" sayacı → kartlar birleşip
 * tek bir özet paneline dönüşür.
 * Kaynak listesi boşsa (arama sürerken) "taranıyor" modunda bekler.
 */
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { sfx } from '../../core/sfx'
import { SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface ResearchData {
  topic: string
  summary: string
  sources: { name: string; url: string }[]
}

function Globe({ size, spinning }: { size: number; spinning: boolean }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #1d6fa8 0%, #0b2f55 45%, #041325 75%)', boxShadow: '0 0 60px #1b8cff66, inset -20px -20px 60px #000a' }} />
      <svg viewBox="-50 -50 100 100" className="absolute inset-0">
        {/* Enlemler */}
        {[-30, -15, 0, 15, 30].map((y) => (
          <ellipse key={y} cx="0" cy={y} rx={Math.sqrt(45 * 45 - y * y)} ry={Math.sqrt(45 * 45 - y * y) * 0.18} fill="none" stroke="#3ee8ff" strokeOpacity="0.35" strokeWidth="0.4" />
        ))}
        {/* Dönen boylamlar: rx değişimiyle 3D dönüş hissi */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx="0" cy="0" ry="45" fill="none" stroke="#3ee8ff" strokeOpacity="0.5" strokeWidth="0.4" className={spinning ? 'meridian' : ''} style={{ animationDelay: `${-i * 1}s` }} rx="45" />
        ))}
        <circle r="45" fill="none" stroke="#3ee8ff" strokeWidth="0.8" />
      </svg>
      {/* Kıta noktaları gibi kayan ışıklar */}
      <div className="globe-dots absolute inset-[6%] overflow-hidden rounded-full" />
    </div>
  )
}

/** Kartların ekrandaki konumları (merkez etrafında elips) */
function layout(n: number, mobile: boolean) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.3
    return { x: Math.cos(a) * (mobile ? 36 : 38), y: Math.sin(a) * (mobile ? 30 : 30) }
  })
}

const domain = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return u
  }
}

function Research({ data }: SceneProps<ResearchData>) {
  const pending = !data.sources?.length
  const mobile = typeof window !== 'undefined' && window.innerWidth < 640
  const sources = useMemo(() => (pending ? Array.from({ length: 6 }, (_, i) => ({ name: '· · ·', url: String(i) })) : data.sources.slice(0, mobile ? 6 : 10)), [data.sources, pending, mobile])
  const pos = useMemo(() => layout(sources.length, mobile), [sources.length, mobile])
  const [count, setCount] = useState(0)
  const [merged, setMerged] = useState(false)
  const tMerge = 900 + sources.length * 320 + 1200

  useEffect(() => {
    if (pending) {
      const t = setInterval(() => setCount((c) => c + 1), 280)
      return () => clearInterval(t)
    }
    const ts = sources.map((_, i) =>
      window.setTimeout(() => {
        setCount(i + 1)
        sfx('tick')
      }, 900 + i * 320),
    )
    ts.push(
      window.setTimeout(() => {
        setMerged(true)
        sfx('whoosh')
      }, tMerge),
    )
    return () => ts.forEach(clearTimeout)
  }, [pending, sources, tMerge])

  const globe = mobile ? 140 : 210
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneTitle>{pending ? 'İNTERNETTE ARAŞTIRILIYOR' : data.topic.toLocaleUpperCase('tr-TR')}</SceneTitle>

      {/* Hüzmeler ve kartlar arası bağlantılar */}
      <motion.svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="-50 -50 100 100" preserveAspectRatio="none" animate={{ opacity: merged ? 0 : 1 }} transition={{ duration: 0.4 }}>
        {pos.map((p, i) => (
          <motion.line key={'b' + i} x1="0" y1="0" x2={p.x} y2={p.y} stroke="#3ee8ff" strokeWidth="0.25" initial={{ pathLength: 0, opacity: 0 }} animate={merged ? { opacity: 0 } : { pathLength: 1, opacity: [0, 0.9, 0.5] }} transition={{ delay: 0.5 + i * 0.32, duration: 0.5 }} style={{ filter: 'drop-shadow(0 0 1px #3ee8ff)' }} />
        ))}
        {!pending &&
          pos.map((p, i) => {
            const q = pos[(i + 1) % pos.length]
            return <motion.line key={'c' + i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#1b8cff" strokeWidth="0.15" strokeDasharray="0.8 0.6" initial={{ pathLength: 0, opacity: 0 }} animate={merged ? { opacity: 0 } : { pathLength: 1, opacity: 0.6 }} transition={{ delay: 1.2 + i * 0.32, duration: 0.6 }} />
          })}
      </motion.svg>

      {/* Dünya küresi */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <motion.div animate={merged ? { scale: 0.45, opacity: 0.25, y: mobile ? -260 : -230 } : { scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
        <Globe size={globe} spinning />
        <div className="mt-3 text-center font-mono text-xs tracking-[0.3em] text-hud-cyan">
          <span className="font-hud text-2xl text-white text-glow">{pending ? '…' : count}</span> {pending ? 'KAYNAK ARANIYOR' : 'KAYNAK TARANDI'}
        </div>
      </motion.div>
      </div>

      {/* Kaynak kartları */}
      {sources.map((s, i) => (
        <div key={s.url + i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + pos[i].x}%`, top: `${50 + pos[i].y}%` }}>
        <motion.div
          className="hud-panel relative w-32 overflow-hidden px-2 py-2 sm:w-44"
          initial={{ opacity: 0, scale: 0.3, x: `${-pos[i].x}vw`, y: `${-pos[i].y}vh`, rotateY: 70 }}
          animate={merged ? { x: `${-pos[i].x}vw`, y: `${-pos[i].y}vh`, opacity: 0, scale: 0.2 } : { opacity: 1, scale: 1, x: 0, y: 0, rotateY: 0 }}
          transition={merged ? { duration: 0.6, delay: i * 0.03 } : { delay: 0.6 + i * 0.32, type: 'spring', stiffness: 120, damping: 15 }}
        >
          <div className="truncate font-mono text-[10px] text-hud-cyan">{pending ? 'taranıyor' : domain(s.url)}</div>
          <div className="line-clamp-2 font-hud text-xs leading-tight text-white/90 sm:text-sm">{s.name}</div>
          {/* okunan satırlar */}
          <div className="mt-1 space-y-1">
            {[80, 95, 60].map((w, j) => (
              <motion.div key={j} className="h-1 rounded-sm" style={{ width: `${w}%` }} initial={{ backgroundColor: 'rgba(62,232,255,0.15)' }} animate={{ backgroundColor: j === 1 ? ['rgba(62,232,255,0.15)', 'rgba(62,232,255,0.9)', 'rgba(62,232,255,0.45)'] : 'rgba(62,232,255,0.15)' }} transition={{ delay: 1 + i * 0.32 + 0.3, duration: 0.6, repeat: pending ? Infinity : 0 }} />
            ))}
          </div>
          {/* tarama çizgisi */}
          <motion.div className="pointer-events-none absolute inset-x-0 h-4 bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent" initial={{ top: '-30%' }} animate={{ top: ['-30%', '120%'] }} transition={{ delay: 0.9 + i * 0.32, duration: 0.8, repeat: pending ? Infinity : 1 }} />
        </motion.div>
        </div>
      ))}

      {/* Özet paneli */}
      {merged && (
        <div className="absolute inset-x-0 top-[30%] flex justify-center px-3 sm:top-[28%]">
        <motion.div className="hud-panel max-h-[44vh] w-[min(92vw,760px)] overflow-y-auto px-5 py-4" initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.5 }}>
          <div className="font-mono text-[10px] tracking-[0.4em] text-hud-cyan/70">ÖZET · {data.sources.length} KAYNAK</div>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/90 sm:text-base">{data.summary}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" className="rounded-sm border border-hud-cyan/30 px-2 py-0.5 font-mono text-[10px] text-hud-cyan hover:bg-hud-cyan/10">
                [{i + 1}] {s.name}
              </a>
            ))}
          </div>
        </motion.div>
        </div>
      )}
    </div>
  )
}

registerScene<ResearchData>({
  id: 'research',
  title: 'Araştırma',
  category: 'Bilgi',
  tools: ['web_search', 'web_fetch', 'present_research'],
  component: Research,
  minDuration: 5200,
  demo: [
    {
      label: 'Detaylı araştırma',
      data: {
        topic: 'Elektrikli araba mı, hibrit mi?',
        summary:
          '• Günlük kullanım 60 km altındaysa ve evde şarj imkânı varsa elektrikli araç, km başı maliyette yaklaşık 3-4 kat avantajlı.\n• Uzun yol ağırlıklı kullanımda hibrit, şarj altyapısı bağımsızlığı sayesinde daha pratik.\n• Elektriklilerde ÖTV avantajı devam ediyor; ancak ikinci el değer kaybı modele göre değişiyor.\n• Kaynakların çoğu, şehir içi kullanıcı için elektrikliyi öneriyor.',
        sources: [
          { name: 'Otomotiv Distribütörleri Derneği', url: 'https://www.odd.org.tr' },
          { name: 'EPDK şarj fiyatları', url: 'https://www.epdk.gov.tr' },
          { name: 'Reuters — EV pazarı', url: 'https://www.reuters.com' },
          { name: 'IEA Global EV Outlook', url: 'https://www.iea.org' },
          { name: 'Donanım Haber', url: 'https://www.donanimhaber.com' },
          { name: 'ShiftDelete', url: 'https://shiftdelete.net' },
          { name: 'Webtekno', url: 'https://www.webtekno.com' },
          { name: 'Ekonomim', url: 'https://www.ekonomim.com' },
        ],
      },
      say: 'Sekiz kaynağı taradım efendim. Şehir içi kullanıyorsanız ve evde şarj imkânınız varsa elektrikli araç daha mantıklı görünüyor.',
    },
    { label: 'Taranıyor (bekleme)', data: { topic: '', summary: '', sources: [] } },
  ],
})
