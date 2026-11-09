/**
 * YOL / HARİTA — 3D eğik holografik zemin üzerinde rota neon çizgiyle çizilir, kamera rotaya doğru
 * yaklaşır, başlangıç/varış iğneleri nabız atar, varış süresi sayaçla gelir.
 */
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { CountUp, SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface MapData {
  loading?: boolean
  from?: { name: string; lat: number; lon: number }
  to?: { name: string; lat: number; lon: number }
  km?: number
  minutes?: number
  path?: [number, number][]
  mode?: 'car' | 'walk'
}

function project(path: [number, number][], W: number, H: number, pad = 60) {
  const lats = path.map((p) => p[0])
  const lons = path.map((p) => p[1])
  const [minLat, maxLat, minLon, maxLon] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)]
  const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180))
  const w = Math.max(1e-6, (maxLon - minLon) * kx)
  const h = Math.max(1e-6, maxLat - minLat)
  const s = Math.min((W - pad * 2) / w, (H - pad * 2) / h)
  const ox = (W - w * s) / 2
  const oy = (H - h * s) / 2
  return path.map(([lat, lon]) => [ox + (lon - minLon) * kx * s, oy + (maxLat - lat) * s] as [number, number])
}

function MapScene({ data }: SceneProps<MapData>) {
  const W = 600
  const H = 600
  const pts = useMemo(() => (data.path && data.path.length > 1 ? project(data.path, W, H) : []), [data.path])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const a = pts[0]
  const b = pts[pts.length - 1]
  // Rastgele "sokaklar" (dekoratif ızgara)
  const streets = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x1: (i * 97) % W, y1: 0, x2: ((i * 97) % W) + ((i % 3) - 1) * 120, y2: H, o: 0.05 + (i % 4) * 0.02 })), [])
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneTitle>{data.loading ? 'ROTA HESAPLANIYOR' : `${data.from?.name ?? ''} → ${data.to?.name ?? ''}`.toLocaleUpperCase('tr-TR')}</SceneTitle>
      {/* Eğik zemin */}
      <div className="absolute inset-x-0 top-[16%] bottom-[22%] flex items-center justify-center" style={{ perspective: 900 }}>
        <motion.div className="relative aspect-square h-full max-w-[96vw]" initial={{ rotateX: 0, scale: 0.7, opacity: 0 }} animate={{ rotateX: 48, scale: 1, opacity: 1 }} transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }} style={{ transformStyle: 'preserve-3d' }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
            <defs>
              <radialGradient id="mapglow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#0d3a5c" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#020814" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill="url(#mapglow)" />
            {Array.from({ length: 13 }).map((_, i) => (
              <g key={i} stroke="#3ee8ff" strokeOpacity="0.1">
                <line x1={(i * W) / 12} y1="0" x2={(i * W) / 12} y2={H} />
                <line x1="0" y1={(i * H) / 12} x2={W} y2={(i * H) / 12} />
              </g>
            ))}
            {streets.map((s, i) => (
              <line key={i} {...s} stroke="#3ee8ff" strokeOpacity={s.o} strokeWidth="2" />
            ))}
            {data.loading && <motion.circle cx={W / 2} cy={H / 2} r="40" fill="none" stroke="#3ee8ff" strokeWidth="2" animate={{ r: [20, 200], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} />}
            {d && (
              <>
                <motion.path d={d} fill="none" stroke="#1b8cff" strokeWidth="14" strokeOpacity="0.25" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 2, ease: 'easeInOut' }} />
                <motion.path d={d} fill="none" stroke="#3ee8ff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px #3ee8ff)' }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 2, ease: 'easeInOut' }} />
                {/* Rotada ilerleyen ışık */}
                <motion.circle r="9" fill="#fff" style={{ filter: 'drop-shadow(0 0 10px #3ee8ff)', offsetPath: `path('${d}')` } as React.CSSProperties} initial={{ offsetDistance: '0%' } as never} animate={{ offsetDistance: '100%' } as never} transition={{ delay: 0.8, duration: 2, ease: 'easeInOut' }} />
                {[a, b].map((p, i) => (
                  <g key={i}>
                    <motion.circle cx={p[0]} cy={p[1]} r="12" fill="none" stroke={i ? '#39ff9a' : '#ffd36b'} strokeWidth="3" animate={{ r: [10, 34], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: i ? 2.6 : 0.6 }} />
                    <motion.circle cx={p[0]} cy={p[1]} r="9" fill={i ? '#39ff9a' : '#ffd36b'} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i ? 2.8 : 0.6, type: 'spring' }} />
                  </g>
                ))}
              </>
            )}
          </svg>
        </motion.div>
      </div>
      {/* Bilgi paneli */}
      {!data.loading && data.minutes !== undefined && (
        <motion.div className="absolute inset-x-0 bottom-[19%] flex justify-center gap-3 px-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}>
          <div className="hud-panel px-5 py-3 text-center">
            <div className="font-mono text-[10px] tracking-[0.3em] text-hud-cyan/70">{data.mode === 'walk' ? '🚶 YÜRÜYEREK' : '🚗 ARABAYLA'}</div>
            <div className="font-hud text-4xl font-bold text-white text-glow">
              <CountUp to={data.minutes >= 60 ? Math.floor(data.minutes / 60) : data.minutes} delay={2.3} />
              <span className="ml-1 text-lg text-white/70">{data.minutes >= 60 ? `sa ${data.minutes % 60} dk` : 'dk'}</span>
            </div>
          </div>
          <div className="hud-panel px-5 py-3 text-center">
            <div className="font-mono text-[10px] tracking-[0.3em] text-hud-cyan/70">MESAFE</div>
            <div className="font-hud text-4xl font-bold text-white">
              <CountUp to={data.km ?? 0} decimals={1} delay={2.3} />
              <span className="ml-1 text-lg text-white/70">km</span>
            </div>
          </div>
        </motion.div>
      )}
      {!data.loading && <div className="absolute inset-x-0 bottom-[15%] text-center font-mono text-[9px] text-white/30">© OpenStreetMap katkıcıları · OSRM · trafiksiz tahmin</div>}
    </div>
  )
}

registerScene<MapData>({
  id: 'map',
  title: 'Yol / harita',
  category: 'Araçlar',
  tools: ['get_route'],
  component: MapScene,
  minDuration: 4000,
  demo: [
    {
      label: 'Kadıköy',
      data: { from: { name: 'Taksim', lat: 41.037, lon: 28.985 }, to: { name: 'Kadıköy', lat: 40.99, lon: 29.03 }, km: 9.8, minutes: 24, mode: 'car', path: [[41.037, 28.985], [41.03, 28.99], [41.02, 28.995], [41.012, 29.0], [41.005, 29.01], [41.0, 29.018], [40.995, 29.024], [40.99, 29.03]] },
      say: 'Taksim’den Kadıköy’e arabayla yaklaşık 24 dakika efendim; 9,8 kilometre.',
    },
  ],
})
