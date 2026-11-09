/**
 * ROBOROCK — evin kat planı belirir, temizlenecek oda(lar) parlar, robot odada şerit şerit
 * iz bırakarak gezer; süpürmede toz partikülleri emilir, paspasta mavi su dalgası ve parlayan zemin.
 */
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface VacuumData {
  mode: 'vacuum' | 'mop' | 'both' | 'dock'
  rooms: string[]
  demo?: boolean
}

const PLAN: { id: string; name: string; x: number; y: number; w: number; h: number }[] = [
  { id: 'salon', name: 'Salon', x: 20, y: 20, w: 300, h: 200 },
  { id: 'mutfak', name: 'Mutfak', x: 330, y: 20, w: 150, h: 130 },
  { id: 'koridor', name: 'Koridor', x: 330, y: 160, w: 150, h: 60 },
  { id: 'yatak odasi', name: 'Yatak Odası', x: 20, y: 230, w: 200, h: 150 },
  { id: 'cocuk odasi', name: 'Çocuk Odası', x: 230, y: 230, w: 130, h: 150 },
  { id: 'banyo', name: 'Banyo', x: 370, y: 230, w: 110, h: 150 },
]

function lawnmower(r: { x: number; y: number; w: number; h: number }) {
  const pts: string[] = []
  const lanes = Math.max(3, Math.floor(r.h / 26))
  for (let i = 0; i < lanes; i++) {
    const y = r.y + 16 + (i * (r.h - 32)) / (lanes - 1)
    pts.push(i % 2 ? `L${r.x + r.w - 16},${y} L${r.x + 16},${y}` : `${i ? 'L' : 'M'}${r.x + 16},${y} L${r.x + r.w - 16},${y}`)
  }
  return pts.join(' ')
}

function Vacuum({ data }: SceneProps<VacuumData>) {
  const rooms = data.rooms.map((r) => (r === 'oturma odasi' ? 'salon' : r))
  const target = PLAN.filter((p) => rooms.includes(p.id))
  const room = target[0] ?? PLAN[0]
  const path = useMemo(() => lawnmower(room), [room])
  const mop = data.mode === 'mop' || data.mode === 'both'
  const vac = data.mode === 'vacuum' || data.mode === 'both'
  const label = data.mode === 'dock' ? 'ŞARJA DÖNÜYOR' : `${target.map((t) => t.name).join(' + ') || 'Salon'} · ${data.mode === 'both' ? 'SÜPÜRME + PASPAS' : mop ? 'PASPAS' : 'SÜPÜRME'}`
  const dust = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ x: room.x + 10 + ((i * 53) % (room.w - 20)), y: room.y + 10 + ((i * 37) % (room.h - 20)), d: (i % 10) * 0.35 })), [room])
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneTitle>{`ROBOROCK · ${label.toLocaleUpperCase('tr-TR')}`}</SceneTitle>
      <div className="absolute inset-x-0 bottom-[110px] top-[130px] flex items-center justify-center px-3" style={{ perspective: 900 }}>
        <motion.svg viewBox="0 0 500 400" className="h-full max-h-[60vh] w-full max-w-2xl" initial={{ rotateX: 0, opacity: 0, scale: 0.8 }} animate={{ rotateX: 35, opacity: 1, scale: 1 }} transition={{ duration: 1.1 }}>
          {PLAN.map((p) => {
            const on = target.includes(p)
            return (
              <g key={p.id}>
                <motion.rect x={p.x} y={p.y} width={p.w} height={p.h} rx="6" fill={on ? (mop ? '#1b8cff22' : '#3ee8ff18') : '#041325'} stroke={on ? '#3ee8ff' : '#3ee8ff44'} strokeWidth={on ? 3 : 1.5} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={on ? { filter: 'drop-shadow(0 0 10px #3ee8ff)' } : undefined} />
                <text x={p.x + 10} y={p.y + 20} fill={on ? '#e6faff' : '#3ee8ff88'} fontSize="13" fontFamily="Rajdhani">
                  {p.name}
                </text>
              </g>
            )
          })}
          {/* Şarj istasyonu */}
          <rect x="455" y="196" width="22" height="20" rx="3" fill="#39ff9a" opacity="0.8" />
          {data.mode !== 'dock' && (
            <>
              {/* Toz partikülleri robot geçtikçe kaybolur */}
              {vac && dust.map((p, i) => <motion.circle key={i} cx={p.x} cy={p.y} r="2" fill="#c9b38a" initial={{ opacity: 0.9 }} animate={{ opacity: 0, scale: 0 }} transition={{ delay: 1.3 + p.d, duration: 0.4 }} />)}
              {/* Temizlenen iz */}
              <motion.path d={path} fill="none" stroke={mop ? '#5fb8ff' : '#3ee8ff'} strokeOpacity={mop ? 0.55 : 0.35} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 3.2, ease: 'linear' }} />
              {mop && <motion.rect x={room.x} y={room.y} width={room.w} height={room.h} rx="6" fill="url(#shine)" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.2] }} transition={{ delay: 3.4, duration: 1.2 }} />}
              {/* Robot */}
              <motion.g style={{ offsetPath: `path('${path}')`, offsetRotate: 'auto' } as React.CSSProperties} initial={{ offsetDistance: '0%' } as never} animate={{ offsetDistance: '100%' } as never} transition={{ delay: 1.2, duration: 3.2, ease: 'linear' }}>
                <circle r="13" fill="#e6faff" stroke="#3ee8ff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px #3ee8ff)' }} />
                <circle r="5" fill="#1b8cff" />
                <rect x="6" y="-2" width="8" height="4" fill="#3ee8ff" />
              </motion.g>
            </>
          )}
          {data.mode === 'dock' && (
            <motion.circle r="13" fill="#e6faff" stroke="#39ff9a" strokeWidth="2" initial={{ cx: 170, cy: 120 }} animate={{ cx: 444, cy: 206 }} transition={{ delay: 0.8, duration: 2.4, ease: 'easeInOut' }} />
          )}
          <defs>
            <linearGradient id="shine" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#bfe6ff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
      {data.demo && <div className="absolute inset-x-0 bottom-[96px] text-center font-mono text-[10px] tracking-widest text-amber-300/80">GÖSTERİM · ROBOROCK HENÜZ BAĞLI DEĞİL</div>}
    </div>
  )
}

registerScene<VacuumData>({
  id: 'vacuum',
  title: 'Roborock',
  category: 'Ev',
  component: Vacuum,
  minDuration: 4500,
  demo: [
    { label: 'Salonu süpür', data: { mode: 'vacuum', rooms: ['salon'], demo: true }, say: 'Salonu süpürüyorum efendim; paspas kaldırıldı.' },
    { label: 'Mutfağı paspasla', data: { mode: 'mop', rooms: ['mutfak'], demo: true }, say: 'Mutfağı yalnızca paspaslıyorum efendim.' },
    { label: 'Şarja dön', data: { mode: 'dock', rooms: [], demo: true }, say: 'Süpürge şarj istasyonuna dönüyor efendim.' },
  ],
})
