/**
 * SPOR / MAÇ
 * Stadyum ışıkları sırayla yanar → takımlar iki yandan gelip ortada çarpışır (flaş) →
 * skor tabelasındaki rakamlar dönerek yerine oturur → gol varsa konfeti ve flaş.
 * Fenerbahçe kazandıysa sarı-lacivert özel kutlama.
 * Altta diğer maçlar ve (istenmişse) puan durumu.
 */
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { sfx } from '../../core/sfx'
import ParticleCanvas from '../ParticleCanvas'
import { registerScene, type SceneProps } from '../registry'

interface Side {
  name: string
  short: string
  logo?: string
  score?: number
}
export interface Match {
  id: string
  date: string
  league?: string
  status: 'pre' | 'in' | 'post'
  detail: string
  home: Side
  away: Side
}
export interface SportsData {
  focusTeam?: string
  matches: Match[]
  standings?: { rank: number; team: string; short?: string; points: number; played: number }[]
}

const norm = (s: string) => s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i')
const isFB = (n: string) => norm(n).includes('fenerbahce')

/** Dönerek yerine oturan skor rakamı */
function RollingDigit({ value, delay }: { value: number; delay: number }) {
  const digits = Array.from({ length: 10 + value + 1 }, (_, i) => i % 10)
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top leading-none">
      <motion.span className="flex flex-col" initial={{ y: 0 }} animate={{ y: `-${digits.length - 1}em` }} transition={{ delay, duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}>
        {digits.map((d, i) => (
          <span key={i} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

function Crest({ side, from }: { side: Side; from: 'left' | 'right' }) {
  const fb = isFB(side.name)
  return (
    <motion.div className="flex w-28 flex-col items-center sm:w-44" initial={{ x: from === 'left' ? '-60vw' : '60vw', rotate: from === 'left' ? -25 : 25, opacity: 0 }} animate={{ x: [from === 'left' ? '-60vw' : '60vw', from === 'left' ? '6vw' : '-6vw', '0vw'], rotate: 0, opacity: 1 }} transition={{ delay: 0.9, duration: 0.9, times: [0, 0.75, 1], ease: 'easeOut' }}>
      <div className={`flex h-20 w-20 items-center justify-center rounded-full border-2 sm:h-28 sm:w-28 ${fb ? 'border-yellow-300 bg-[#0b1d5c]' : 'border-hud-cyan/50 bg-hud-deep'}`} style={{ boxShadow: fb ? '0 0 30px #ffd200aa' : '0 0 20px #3ee8ff44' }}>
        {side.logo ? <img src={side.logo} alt="" className="h-14 w-14 object-contain sm:h-20 sm:w-20" /> : <span className={`font-hud text-2xl font-bold ${fb ? 'text-yellow-300' : 'text-white'}`}>{side.short || side.name.slice(0, 3).toUpperCase()}</span>}
      </div>
      <div className="mt-2 text-center font-hud text-sm font-semibold uppercase tracking-wider text-white sm:text-lg">{side.name}</div>
    </motion.div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function Sports({ data, low }: SceneProps<SportsData>) {
  const ms = data.matches || []
  const focus = ms.find((m) => m.status === 'in') || [...ms].reverse().find((m) => m.status === 'post') || ms.find((m) => m.status === 'pre')
  const [phase, setPhase] = useState(0) // 0 ışıklar, 1 çarpışma, 2 skor, 3 kutlama
  const goals = (focus?.home.score ?? 0) + (focus?.away.score ?? 0)
  const fbSide = focus ? (isFB(focus.home.name) ? 'home' : isFB(focus.away.name) ? 'away' : null) : null
  const fbWon = !!(focus && fbSide && focus.status === 'post' && (focus[fbSide].score ?? 0) > (focus[fbSide === 'home' ? 'away' : 'home'].score ?? 0))

  useEffect(() => {
    const ts = [
      window.setTimeout(() => (setPhase(1), sfx('stamp')), 1750),
      window.setTimeout(() => (setPhase(2), sfx('tick')), 2000),
      window.setTimeout(() => {
        setPhase(3)
        if (goals > 0) sfx('success')
      }, 3500),
    ]
    return () => ts.forEach(clearTimeout)
  }, [goals])

  if (!focus)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="stadium-beam left-[-10%] opacity-60" style={{ transform: 'rotate(18deg)' }} />
        <div className="stadium-beam right-[-10%] opacity-60" style={{ transform: 'rotate(-18deg)' }} />
        <motion.div className="font-mono text-sm tracking-[0.4em] text-hud-cyan" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          MAÇ VERİLERİ ALINIYOR
        </motion.div>
      </div>
    )

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: fbWon && phase >= 3 ? 'linear-gradient(180deg,#081a4f 0%,#0b1d5c 55%,#1a1500 100%)' : 'linear-gradient(180deg,#020814 0%,#041a12 70%,#06301c 100%)', transition: 'background 0.8s' }}>
      {/* Stadyum ışıkları: sırayla yanar */}
      {[
        ['left-[-15%]', 22, 0.2],
        ['left-[10%]', 10, 0.45],
        ['right-[10%]', -10, 0.7],
        ['right-[-15%]', -22, 0.95],
      ].map(([pos, rot, d], i) => (
        <motion.div key={i} className={`stadium-beam ${pos}`} style={{ rotate: `${rot}deg` }} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.7, 0.95] }} transition={{ delay: d as number, duration: 0.5 }} />
      ))}
      {/* Projektör lambaları */}
      <div className="absolute inset-x-0 top-2 flex justify-between px-[8%]">
        {[0.2, 0.45, 0.7, 0.95].map((d, i) => (
          <motion.div key={i} className="h-3 w-16 rounded-sm bg-white" initial={{ opacity: 0.1 }} animate={{ opacity: 1, boxShadow: '0 0 40px 12px #fffbe0' }} transition={{ delay: d }} />
        ))}
      </div>
      {/* Saha çizgileri (perspektif) */}
      <div className="absolute inset-x-[-20%] bottom-0 h-[40%] origin-bottom opacity-30" style={{ transform: 'perspective(500px) rotateX(55deg)', backgroundImage: 'linear-gradient(90deg, transparent 49.7%, #fff 49.7%, #fff 50.3%, transparent 50.3%), radial-gradient(circle at 50% 50%, transparent 14%, #fff 14.3%, #fff 14.8%, transparent 15%), repeating-linear-gradient(90deg, #0a4a2a 0 8%, #0c5a32 8% 16%)' }} />

      {/* Çarpışma flaşı */}
      {phase >= 1 && <motion.div className="pointer-events-none absolute inset-0 bg-white" initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
      {phase >= 3 && goals > 0 && <ParticleCanvas kind="confetti" low={low} colors={fbWon ? ['#ffd200', '#0b1d5c', '#ffffff', '#ffe866'] : undefined} />}

      {/* Lig / durum */}
      <motion.div className="absolute inset-x-0 top-[100px] text-center sm:top-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <span className={`rounded-sm px-3 py-1 font-mono text-xs tracking-[0.3em] ${focus.status === 'in' ? 'animate-pulse bg-red-600 text-white' : 'bg-white/10 text-white/80'}`}>
          {focus.status === 'in' ? `● CANLI ${focus.detail}` : focus.status === 'post' ? 'MAÇ SONUCU' : `SIRADAKİ MAÇ · ${fmtDate(focus.date)}`}
        </span>
      </motion.div>

      {/* Skor tabelası */}
      <div className="absolute inset-x-0 top-[22%] flex items-center justify-center gap-2 sm:gap-8">
        <Crest side={focus.home} from="left" />
        <motion.div className="hud-panel flex min-w-[120px] items-center justify-center gap-3 px-4 py-3 font-hud text-6xl font-bold text-white sm:min-w-[200px] sm:text-8xl" style={{ borderColor: fbWon ? '#ffd200' : undefined }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: phase >= 1 ? 1 : 0, opacity: phase >= 1 ? 1 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
          {focus.status === 'pre' ? (
            <span className="text-4xl text-hud-cyan sm:text-6xl">VS</span>
          ) : (
            <>
              {phase >= 2 ? <RollingDigit value={focus.home.score ?? 0} delay={0} /> : '0'}
              <span className="text-hud-cyan/60">-</span>
              {phase >= 2 ? <RollingDigit value={focus.away.score ?? 0} delay={0.25} /> : '0'}
            </>
          )}
        </motion.div>
        <Crest side={focus.away} from="right" />
      </div>

      {/* Fenerbahçe kutlaması */}
      {fbWon && phase >= 3 && (
        <motion.div className="absolute inset-x-0 top-[47%] text-center sm:top-[44%]" initial={{ scale: 3, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          <div className="inline-block border-4 border-yellow-300 bg-[#0b1d5c]/80 px-4 py-2 font-hud text-2xl font-black tracking-wider text-yellow-300 sm:px-6 sm:text-5xl sm:tracking-widest" style={{ textShadow: '0 0 20px #ffd200' }}>
            FENERBAHÇE KAZANDI!
          </div>
        </motion.div>
      )}

      {/* Diğer maçlar + puan durumu */}
      <motion.div className="absolute inset-x-0 top-[58%] flex flex-col sm:top-auto sm:bottom-[190px] items-center gap-2 px-3 sm:flex-row sm:items-end sm:justify-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 30 }}>
        <div className="w-full max-w-sm space-y-1">
          {ms
            .filter((m) => m !== focus)
            .slice(0, 3)
            .map((m) => (
              <div key={m.id} className="hud-panel flex items-center justify-between px-3 py-1.5 font-mono text-xs text-white/85">
                <span className="w-24 truncate">{m.home.name}</span>
                <span className="text-hud-cyan">{m.status === 'pre' ? fmtDate(m.date) : `${m.home.score ?? 0} - ${m.away.score ?? 0}`}</span>
                <span className="w-24 truncate text-right">{m.away.name}</span>
              </div>
            ))}
        </div>
        {data.standings?.length ? (
          <div className="hud-panel hidden w-full max-w-xs px-3 py-2 font-mono text-[11px] sm:block">
            <div className="mb-1 tracking-[0.3em] text-hud-cyan/70">PUAN DURUMU</div>
            {data.standings.slice(0, 6).map((s) => (
              <div key={s.team} className={`flex justify-between py-0.5 ${isFB(s.team) ? 'font-bold text-yellow-300' : 'text-white/80'}`}>
                <span>
                  {s.rank}. {s.team}
                </span>
                <span>
                  {s.points}p <span className="text-white/40">({s.played})</span>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}

const d = (days: number, h = 20) => {
  const x = new Date()
  x.setDate(x.getDate() + days)
  x.setHours(h, 0, 0, 0)
  return x.toISOString()
}
const FB = { name: 'Fenerbahçe', short: 'FB' }

registerScene<SportsData>({
  id: 'sports',
  title: 'Spor / maç',
  category: 'Bilgi',
  tools: ['get_football'],
  component: Sports,
  minDuration: 5500,
  demo: [
    {
      label: 'Fenerbahçe kazandı',
      data: {
        focusTeam: 'Fenerbahçe',
        matches: [
          { id: '1', date: d(-1), status: 'post', detail: 'MS', home: { ...FB, score: 3 }, away: { name: 'Galatasaray', short: 'GS', score: 1 } },
          { id: '2', date: d(6), status: 'pre', detail: '', home: { name: 'Beşiktaş', short: 'BJK' }, away: { ...FB } },
        ],
        standings: [
          { rank: 1, team: 'Fenerbahçe', points: 31, played: 12 },
          { rank: 2, team: 'Galatasaray', points: 29, played: 12 },
          { rank: 3, team: 'Trabzonspor', points: 24, played: 12 },
          { rank: 4, team: 'Beşiktaş', points: 22, played: 12 },
          { rank: 5, team: 'Samsunspor', points: 20, played: 12 },
          { rank: 6, team: 'Göztepe', points: 19, played: 12 },
        ],
      },
      say: 'Harika haber efendim! Fenerbahçe derbide Galatasaray’ı 3-1 yendi ve liderliğe yükseldi. Sıradaki maç cumartesi Beşiktaş deplasmanında.',
    },
    {
      label: 'Canlı maç',
      data: { focusTeam: 'Fenerbahçe', matches: [{ id: '3', date: d(0, 19), status: 'in', detail: "67'", home: { name: 'Samsunspor', short: 'SAM', score: 1 }, away: { ...FB, score: 2 } }] },
      say: 'Maç devam ediyor efendim, 67. dakikada Fenerbahçe deplasmanda 2-1 önde.',
    },
    {
      label: 'Sıradaki maç',
      data: { focusTeam: 'Fenerbahçe', matches: [{ id: '4', date: d(3, 21), status: 'pre', detail: '', home: { ...FB }, away: { name: 'Real Madrid', short: 'RMA' } }] },
      say: 'Sıradaki maç çarşamba akşamı saat dokuzda, Kadıköy’de Real Madrid ile efendim.',
    },
  ],
})
