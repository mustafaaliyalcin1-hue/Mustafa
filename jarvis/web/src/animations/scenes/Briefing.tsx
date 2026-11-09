/**
 * GÜNLÜK ÖZET (sabah brifingi)
 * 0.0s  gökyüzü geceden şafağa döner, ufuk çizgisi parlar
 * 0.4s  güneş ufuktan yükselir, ışık hüzmeleri yayılır
 * 1.6s  selam + tarih
 * 2.0s+ paneller sırayla açılır: HAVA → GÜNDEM → FENERBAHÇE
 * Bir bölümün verisi yoksa o panel gösterilmez.
 */
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { sfx } from '../../core/sfx'
import ParticleCanvas from '../ParticleCanvas'
import { CountUp } from '../common'
import { registerScene, type SceneProps } from '../registry'

interface Side {
  name: string
  short?: string
  logo?: string
  score?: number
}
interface Match {
  id: string
  date: string
  status: 'pre' | 'in' | 'post'
  detail: string
  home: Side
  away: Side
}
export interface BriefingData {
  greeting: string
  date: string
  weather?: { city: string; temp: number; desc: string; condition: string; max: number; min: number; rain: number }
  news?: { title: string; source: string; url: string }[]
  football?: { team: string; last?: Match; live?: Match; next?: Match }
}

const ICON: Record<string, string> = { sunny: '☀', rain: '🌧', storm: '⛈', snow: '❄', cloudy: '☁', wind: '🍃', night: '☾' }

function Panel({ title, delay, children, accent = '#3ee8ff' }: { title: string; delay: number; children: React.ReactNode; accent?: string }) {
  useEffect(() => {
    const t = setTimeout(() => sfx('whoosh'), delay * 1000)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <motion.div className="hud-panel relative overflow-hidden px-4 py-3" style={{ borderColor: accent + '55' }} initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ delay, type: 'spring', stiffness: 120, damping: 16 }}>
      <motion.div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: delay + 0.15, duration: 0.5 }} />
      <div className="mb-2 font-mono text-[10px] tracking-[0.4em]" style={{ color: accent }}>
        {title}
      </div>
      {children}
    </motion.div>
  )
}

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function MatchRow({ m, label }: { m: Match; label: string }) {
  const fb = (n: string) => n.startsWith('Fenerbah')
  return (
    <div className="mb-1.5">
      <div className="font-mono text-[9px] tracking-widest text-white/50">{label}</div>
      <div className="flex items-center justify-between gap-2 font-hud text-sm text-white sm:text-base">
        <span className={`w-24 truncate ${fb(m.home.name) ? 'font-bold text-yellow-300' : ''}`}>{m.home.name}</span>
        <span className="rounded-sm bg-white/10 px-2 font-bold">{m.status === 'pre' ? fmtWhen(m.date) : `${m.home.score ?? 0} - ${m.away.score ?? 0}`}</span>
        <span className={`w-24 truncate text-right ${fb(m.away.name) ? 'font-bold text-yellow-300' : ''}`}>{m.away.name}</span>
      </div>
    </div>
  )
}

function Briefing({ data, low }: SceneProps<BriefingData>) {
  useEffect(() => {
    sfx('boot')
  }, [])
  const panels = [data.weather && 'w', data.news?.length && 'n', data.football && (data.football.last || data.football.next || data.football.live) && 'f'].filter(Boolean) as string[]
  const delayOf = (k: string) => 2 + panels.indexOf(k) * 0.55

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gökyüzü: gece → şafak */}
      <motion.div className="absolute inset-0" initial={{ background: 'linear-gradient(180deg,#020814 0%,#06122a 60%,#0a1630 100%)' }} animate={{ background: 'linear-gradient(180deg,#0b1a3a 0%,#4a2a5a 45%,#ff8a3d 78%,#ffc46b 100%)' }} transition={{ duration: 2.2, ease: 'easeOut' }} />
      {!low && <ParticleCanvas kind="stars" density={0.5} className="opacity-60" />}
      {/* Güneş */}
      <motion.div className="absolute inset-x-0 flex justify-center" initial={{ top: '78%', opacity: 0.6 }} animate={{ top: '46%', opacity: 1 }} transition={{ delay: 0.4, duration: 2, ease: [0.16, 1, 0.3, 1] }}>
        <div className="h-56 w-56 rounded-full sm:h-72 sm:w-72" style={{ background: 'radial-gradient(circle at 50% 45%, #fff6d0, #ffd36b 45%, #ff9f1c 80%)', boxShadow: '0 0 90px 40px #ffb54a88, 0 0 220px 90px #ff7a1f44' }} />
      </motion.div>
      <div className="pointer-events-none absolute left-1/2 top-[56%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2">
        <motion.div className="h-full w-full" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(255,214,120,0.16) 0deg 5deg, transparent 5deg 15deg)', maskImage: 'radial-gradient(circle, black 8%, transparent 45%)', WebkitMaskImage: 'radial-gradient(circle, black 8%, transparent 45%)' }} initial={{ opacity: 0, rotate: 0 }} animate={{ opacity: 1, rotate: 25 }} transition={{ delay: 1, duration: 6 }} />
      </div>
      {/* Ufuk */}
      <div className="absolute inset-x-0 top-[68%] bottom-0 bg-gradient-to-b from-[#1a1030] to-[#020814]" />
      <motion.div className="absolute inset-x-0 top-[68%] h-[2px] bg-amber-200" style={{ boxShadow: '0 0 30px 6px #ffc46b' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2 }} />
      {/* Karartma: paneller okunur olsun */}
      <motion.div className="absolute inset-0 bg-[#020814]" initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 1.8, duration: 0.8 }} />

      {/* Selam */}
      <motion.div className="absolute inset-x-0 top-[96px] text-center sm:top-24" initial={{ opacity: 0, y: -16, letterSpacing: '0.6em' }} animate={{ opacity: 1, y: 0, letterSpacing: '0.12em' }} transition={{ delay: 1.6, duration: 0.7 }}>
        <div className="font-hud text-3xl font-bold text-white sm:text-4xl" style={{ textShadow: '0 0 20px #ffb54a' }}>
          {data.greeting.replace(/ efendim$/, '')}
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-amber-100/80">{data.date}</div>
      </motion.div>

      {/* Paneller */}
      <div className="absolute inset-x-0 bottom-[110px] top-[180px] overflow-y-auto px-3 sm:top-[190px]">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
          {data.weather && (
            <Panel title={`HAVA · ${data.weather.city.toLocaleUpperCase('tr-TR')}`} delay={delayOf('w')} accent="#ffc46b">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{ICON[data.weather.condition] || '☁'}</span>
                <div>
                  <div className="font-hud text-4xl font-bold leading-none text-white">
                    <CountUp to={data.weather.temp} delay={delayOf('w') + 0.2} />°
                  </div>
                  <div className="font-hud text-sm text-white/80">{data.weather.desc}</div>
                </div>
              </div>
              <div className="mt-2 flex gap-3 font-mono text-[11px] text-white/70">
                <span>↑{data.weather.max}°</span>
                <span>↓{data.weather.min}°</span>
                <span className={data.weather.rain >= 50 ? 'text-sky-300' : ''}>☂ %{data.weather.rain}</span>
              </div>
            </Panel>
          )}
          {data.news?.length ? (
            <Panel title="GÜNDEM" delay={delayOf('n')}>
              <ol className="space-y-1.5">
                {data.news.slice(0, 4).map((n, i) => (
                  <motion.li key={i} className="flex gap-2 font-hud text-sm leading-snug text-white/90" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delayOf('n') + 0.2 + i * 0.12 }}>
                    <span className="font-mono text-hud-cyan">{i + 1}</span>
                    <a href={n.url} target="_blank" rel="noreferrer" className="line-clamp-2 hover:text-hud-cyan">
                      {n.title}
                    </a>
                  </motion.li>
                ))}
              </ol>
            </Panel>
          ) : null}
          {panels.includes('f') && data.football && (
            <Panel title="FENERBAHÇE" delay={delayOf('f')} accent="#ffd200">
              {data.football.live && <MatchRow m={data.football.live} label={`● CANLI ${data.football.live.detail}`} />}
              {!data.football.live && data.football.last && <MatchRow m={data.football.last} label="SON MAÇ" />}
              {data.football.next && <MatchRow m={data.football.next} label="SIRADAKİ MAÇ" />}
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

const d = (days: number, h = 20) => {
  const x = new Date()
  x.setDate(x.getDate() + days)
  x.setHours(h, 0, 0, 0)
  return x.toISOString()
}

registerScene<BriefingData>({
  id: 'briefing',
  title: 'Günlük özet',
  category: 'Bilgi',
  tools: ['briefing'],
  component: Briefing,
  minDuration: 5500,
  demo: [
    {
      label: 'Sabah brifingi',
      data: {
        greeting: 'Günaydın efendim',
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }),
        weather: { city: 'İstanbul', temp: 14, desc: 'Parçalı bulutlu', condition: 'cloudy', max: 17, min: 10, rain: 20 },
        news: [
          { title: 'Merkez Bankası faiz kararını açıkladı: politika faizi sabit', source: 'AA', url: 'https://www.aa.com.tr' },
          { title: 'İstanbul’da yeni metro hattı hizmete giriyor', source: 'NTV', url: 'https://www.ntv.com.tr' },
          { title: 'Meteoroloji’den Karadeniz için kuvvetli yağış uyarısı', source: 'TRT Haber', url: 'https://www.trthaber.com' },
        ],
        football: {
          team: 'Fenerbahçe',
          last: { id: '1', date: d(-1), status: 'post', detail: 'MS', home: { name: 'Fenerbahçe', score: 3 }, away: { name: 'Galatasaray', score: 1 } },
          next: { id: '2', date: d(5), status: 'pre', detail: '', home: { name: 'Beşiktaş' }, away: { name: 'Fenerbahçe' } },
        },
      },
      say: 'Günaydın efendim, bugün Pazartesi. İstanbul’da hava 14 derece, parçalı bulutlu. Gündemden öne çıkanlar: Merkez Bankası faizi sabit tuttu; İstanbul’da yeni metro hattı açılıyor. Fenerbahçe dün Galatasaray’ı 3-1 yendi. İyi bir gün dilerim.',
    },
  ],
})
