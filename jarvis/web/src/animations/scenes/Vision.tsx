/**
 * GÖRSEL ANALİZ — fotoğraf üzerinde tarama ızgarası geçer, tanınan nesnelerin etrafında
 * köşeli HUD kutuları çizilir ve etiketler daktilo gibi yazılır; altta açıklama.
 */
import { motion } from 'framer-motion'
import { SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface VisionData {
  image?: string
  loading?: boolean
  description?: string
  objects?: { label: string; box: [number, number, number, number] }[]
}

const COLORS = ['#3ee8ff', '#39ff9a', '#ffd36b', '#ff6bd6', '#8b9bff', '#ff8a3d', '#5ff3ff', '#c4ff3e']

function Vision({ data }: SceneProps<VisionData>) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneTitle>{data.loading ? 'GÖRÜNTÜ ANALİZ EDİLİYOR' : 'ANALİZ TAMAMLANDI'}</SceneTitle>
      <div className="absolute inset-x-0 bottom-[110px] top-[130px] flex flex-col items-center gap-3 px-3">
        {data.image && (
          <div className="relative max-h-[70%] overflow-hidden rounded-md border border-hud-cyan/40 shadow-[0_0_30px_#3ee8ff44]">
            <img src={data.image} alt="" className="block max-h-[52vh] w-auto max-w-[92vw]" />
            {/* Tarama ızgarası */}
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(62,232,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(62,232,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <motion.div className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent" animate={{ top: ['-15%', '105%'] }} transition={{ repeat: data.loading ? Infinity : 1, duration: 1.6, ease: 'linear' }} />
            {/* Nesne kutuları */}
            {(data.objects || []).map((o, i) => {
              const [y1, x1, y2, x2] = o.box
              const c = COLORS[i % COLORS.length]
              return (
                <motion.div key={i} className="absolute" style={{ top: `${y1 / 10}%`, left: `${x1 / 10}%`, width: `${(x2 - x1) / 10}%`, height: `${(y2 - y1) / 10}%` }} initial={{ opacity: 0, scale: 1.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.25 }}>
                  {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((k) => (
                    <span key={k} className={`absolute h-4 w-4 ${k}`} style={{ borderColor: c, filter: `drop-shadow(0 0 4px ${c})` }} />
                  ))}
                  <div className="absolute inset-0 border" style={{ borderColor: c + '55' }} />
                  <motion.span className="absolute -top-5 left-0 whitespace-nowrap rounded-sm px-1 font-mono text-[10px] font-bold text-black" style={{ background: c }} initial={{ width: 0 }} animate={{ width: 'auto' }} transition={{ delay: 0.8 + i * 0.25 }}>
                    {o.label.toLocaleUpperCase('tr-TR')}
                  </motion.span>
                </motion.div>
              )
            })}
          </div>
        )}
        {data.description && (
          <motion.div className="hud-panel w-full max-w-xl px-4 py-2 text-sm leading-relaxed text-white/90" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            {data.description}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Galeri için gömülü örnek görsel (SVG)
const DEMO_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#2b2118"/><rect y="260" width="640" height="160" fill="#5a3d26"/><ellipse cx="200" cy="280" rx="90" ry="20" fill="#ddd"/><rect x="140" y="170" width="120" height="110" rx="12" fill="#f4f1ea"/><path d="M260 200 q40 10 0 50" stroke="#f4f1ea" stroke-width="14" fill="none"/><rect x="380" y="120" width="170" height="160" rx="10" fill="#1d2b3a"/><rect x="395" y="135" width="140" height="100" fill="#3ee8ff" opacity=".5"/><circle cx="470" cy="300" r="14" fill="#888"/></svg>`)

registerScene<VisionData>({
  id: 'vision',
  title: 'Görsel analiz',
  category: 'Araçlar',
  component: Vision,
  minDuration: 3500,
  demo: [{ label: 'Masa', data: { image: DEMO_IMG, description: 'Masada beyaz bir kahve fincanı ve açık duran bir dizüstü bilgisayar görüyorum efendim.', objects: [{ label: 'Fincan', box: [380, 200, 700, 440] }, { label: 'Dizüstü bilgisayar', box: [270, 580, 700, 880] }] }, say: 'Masada bir kahve fincanı ve dizüstü bilgisayar görüyorum efendim.' }],
})
