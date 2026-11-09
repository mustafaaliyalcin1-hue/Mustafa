/**
 * HATIRLATICI / TAKVİM — takvim sayfaları hızla çevrilir, ilgili gün parlar,
 * not kartı iğneyle tutturulur; altta yaklaşan hatırlatmalar listelenir.
 */
import { motion } from 'framer-motion'
import { registerScene, type SceneProps } from '../registry'

interface Rem {
  id: string
  text: string
  at: number
}
export interface CalendarData {
  action: 'add' | 'list' | 'due'
  focus?: Rem
  items?: Rem[]
}

const MONTHS = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK']
const DAYS = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ']

function CalendarScene({ data }: SceneProps<CalendarData>) {
  const target = new Date(data.focus?.at ?? data.items?.[0]?.at ?? Date.now())
  const today = new Date()
  const diff = Math.max(0, Math.min(6, Math.round((new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 864e5)))
  // Bugünden hedef güne kadar çevrilecek sayfalar
  const pages = Array.from({ length: diff + 1 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d
  })
  const flipEnd = 0.3 + diff * 0.28
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4">
      <div className="relative h-56 w-48 sm:h-64 sm:w-56" style={{ perspective: 800 }}>
        {/* Halkalar */}
        <div className="absolute -top-3 inset-x-8 z-30 flex justify-between">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-6 w-2 rounded-full bg-hud-cyan/70 shadow-[0_0_8px_#3ee8ff]" />
          ))}
        </div>
        {/* Hedef sayfa (altta) */}
        <div className="absolute inset-0 overflow-hidden rounded-md border border-hud-cyan/40 bg-[#041325] shadow-[0_0_30px_#3ee8ff44]">
          <div className="bg-hud-cyan/80 py-2 text-center font-mono text-xs font-bold tracking-[0.3em] text-[#020814]">{MONTHS[target.getMonth()]}</div>
          <motion.div className="pt-4 text-center font-hud text-7xl font-bold text-white" initial={{ textShadow: '0 0 0px #3ee8ff' }} animate={{ textShadow: ['0 0 0px #3ee8ff', '0 0 30px #3ee8ff', '0 0 12px #3ee8ff'] }} transition={{ delay: flipEnd, duration: 1 }}>
            {target.getDate()}
          </motion.div>
          <div className="text-center font-mono text-[11px] tracking-[0.3em] text-hud-cyan">{DAYS[target.getDay()]}</div>
        </div>
        {/* Çevrilen sayfalar */}
        {pages.slice(0, -1).map((d, i) => (
          <motion.div key={i} className="absolute inset-0 origin-top overflow-hidden rounded-md border border-hud-cyan/30 bg-[#06192f]" style={{ zIndex: 20 - i, backfaceVisibility: 'hidden' }} initial={{ rotateX: 0 }} animate={{ rotateX: -110, opacity: 0 }} transition={{ delay: 0.3 + i * 0.28, duration: 0.45 }}>
            <div className="bg-hud-cyan/50 py-2 text-center font-mono text-xs tracking-[0.3em] text-[#020814]">{MONTHS[d.getMonth()]}</div>
            <div className="pt-4 text-center font-hud text-7xl text-white/80">{d.getDate()}</div>
          </motion.div>
        ))}
        {/* İğneli not */}
        {data.focus && (
          <motion.div className="absolute -right-10 top-24 z-40 w-40 rotate-6 rounded-sm bg-amber-200 p-3 text-slate-800 shadow-xl sm:-right-24" initial={{ y: -200, opacity: 0, rotate: -20 }} animate={{ y: 0, opacity: 1, rotate: 6 }} transition={{ delay: flipEnd + 0.3, type: 'spring', stiffness: 160, damping: 12 }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <motion.div className="h-4 w-4 rounded-full bg-red-500 shadow" initial={{ scale: 3 }} animate={{ scale: 1 }} transition={{ delay: flipEnd + 0.6 }} />
            </div>
            <div className="font-mono text-[10px] font-bold">{target.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="font-hud text-sm font-semibold leading-tight">{data.focus.text}</div>
          </motion.div>
        )}
      </div>
      {data.action === 'due' && <motion.div className="font-hud text-2xl font-bold tracking-widest text-amber-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: 4, duration: 0.6 }}>⏰ HATIRLATMA</motion.div>}
      {/* Yaklaşanlar */}
      {(data.items?.length ?? 0) > 0 && (
        <motion.div className="hud-panel w-full max-w-sm px-4 py-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: flipEnd + 0.5 }}>
          <div className="mb-1 font-mono text-[10px] tracking-[0.3em] text-hud-cyan/70">YAKLAŞAN HATIRLATMALAR</div>
          {data.items!.slice(0, 4).map((r) => (
            <div key={r.id} className={`flex justify-between gap-2 py-0.5 font-hud text-sm ${r.id === data.focus?.id ? 'text-amber-200' : 'text-white/80'}`}>
              <span className="truncate">{r.text}</span>
              <span className="shrink-0 font-mono text-[11px] text-hud-cyan">{new Date(r.at).toLocaleString('tr-TR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

const inDays = (d: number, h: number) => {
  const x = new Date()
  x.setDate(x.getDate() + d)
  x.setHours(h, 0, 0, 0)
  return x.getTime()
}
registerScene<CalendarData>({
  id: 'calendar',
  title: 'Hatırlatıcı / takvim',
  category: 'Araçlar',
  component: CalendarScene,
  minDuration: 3000,
  demo: [{ label: 'Yarın 10:00', data: { action: 'add', focus: { id: 'a', text: 'Dişçi randevusu', at: inDays(1, 10) }, items: [{ id: 'a', text: 'Dişçi randevusu', at: inDays(1, 10) }, { id: 'b', text: 'Annemi ara', at: inDays(2, 19) }] }, say: 'Tamam efendim, yarın saat 10:00’da hatırlatacağım: dişçi randevusu.' }],
})
