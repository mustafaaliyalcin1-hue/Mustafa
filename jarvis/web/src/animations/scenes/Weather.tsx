/**
 * HAVA DURUMU — tüm ekran o havaya bürünür.
 * Güneşli: dönen ışık hüzmeli güneş + lens parlaması   Yağmurlu: yağmur + camda süzülen damlalar + şimşek
 * Karlı: kar + buzlanan kenarlar   Bulutlu: katmanlı bulutlar   Rüzgârlı: uçuşan yapraklar   Gece: yıldızlar + ay
 * Ortada sayarak gelen sıcaklık, altta sırayla kayan 7 günlük kartlar.
 */
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { sfx } from '../../core/sfx'
import ParticleCanvas from '../ParticleCanvas'
import { CountUp } from '../common'
import { registerScene, type SceneProps } from '../registry'

export type WeatherCondition = 'sunny' | 'rain' | 'storm' | 'snow' | 'cloudy' | 'wind' | 'night'

export interface WeatherData {
  city: string
  condition: WeatherCondition
  temp: number
  feels?: number
  humidity?: number
  wind?: number
  desc: string
  days: { day: string; condition: WeatherCondition; min: number; max: number }[]
}

const ICON: Record<WeatherCondition, string> = { sunny: '☀', rain: '🌧', storm: '⛈', snow: '❄', cloudy: '☁', wind: '🍃', night: '☾' }

const BG: Record<WeatherCondition, string> = {
  sunny: 'radial-gradient(ellipse at 70% 20%, #ffb54a55 0%, #ff7a1f22 30%, #0a1424 75%)',
  rain: 'linear-gradient(180deg, #0b1626 0%, #13263c 60%, #0a1220 100%)',
  storm: 'linear-gradient(180deg, #05080f 0%, #141d2e 60%, #070b14 100%)',
  snow: 'linear-gradient(180deg, #1b2c44 0%, #2d4766 60%, #15243a 100%)',
  cloudy: 'linear-gradient(180deg, #172433 0%, #24384d 60%, #101b28 100%)',
  wind: 'linear-gradient(180deg, #102633 0%, #1d3e47 60%, #0c1c24 100%)',
  night: 'radial-gradient(ellipse at 75% 18%, #1c2f5a 0%, #0a1430 35%, #020610 80%)',
}

function Sun({ low }: { low: boolean }) {
  return (
    <div className="absolute right-[8%] top-[8%] h-64 w-64 sm:h-96 sm:w-96">
      {/* Işık hüzmeleri */}
      <motion.div
        className="absolute -inset-[60%]"
        style={{ background: 'repeating-conic-gradient(from 0deg, rgba(255,214,120,0.18) 0deg 6deg, transparent 6deg 18deg)', maskImage: 'radial-gradient(circle, black 20%, transparent 65%)', WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 65%)' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 40 }}
      />
      <motion.div className="absolute inset-[22%] rounded-full" style={{ background: 'radial-gradient(circle at 40% 40%, #fff8d6, #ffd36b 40%, #ff9f1c 75%)', boxShadow: '0 0 80px 30px #ffb54a88, 0 0 200px 80px #ff8a1f44' }} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
      {/* Lens parlaması */}
      {!low &&
        [0.5, 0.9, 1.4, 1.9].map((d, i) => (
          <motion.div key={i} className="absolute rounded-full" style={{ width: 20 + i * 18, height: 20 + i * 18, left: `${-d * 60}%`, top: `${d * 70}%`, background: ['#ffd36b33', '#3ee8ff22', '#ff7a1f22', '#ffffff18'][i] }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4, delay: i * 0.4 }} />
        ))}
    </div>
  )
}

function Moon() {
  return (
    <motion.div className="absolute right-[12%] top-[10%] h-40 w-40 rounded-full sm:h-56 sm:w-56" style={{ background: 'radial-gradient(circle at 35% 35%, #fbfdff, #cfdaf0 55%, #9fb0d0)', boxShadow: '0 0 60px 20px #9fc4ff55, 0 0 160px 60px #5a7fd033' }} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.4 }}>
      {[
        [30, 40, 18],
        [60, 62, 12],
        [55, 25, 9],
        [38, 70, 7],
      ].map(([x, y, s], i) => (
        <span key={i} className="absolute rounded-full bg-[#aab8d4]/60" style={{ left: `${x}%`, top: `${y}%`, width: `${s}%`, height: `${s}%` }} />
      ))}
    </motion.div>
  )
}

function Clouds({ dark = false, count = 7 }: { dark?: boolean; count?: number }) {
  const clouds = useMemo(() => Array.from({ length: count }, (_, i) => ({ top: 4 + ((i * 13) % 40), scale: 0.6 + ((i * 7) % 10) / 10, dur: 40 + ((i * 11) % 30), delay: -((i * 9) % 40), op: 0.35 + ((i * 3) % 5) / 10 })), [count])
  return (
    <>
      {clouds.map((c, i) => (
        <motion.div key={i} className="absolute" style={{ top: `${c.top}%`, scale: c.scale, opacity: c.op }} initial={{ x: '-40vw' }} animate={{ x: '120vw' }} transition={{ repeat: Infinity, ease: 'linear', duration: c.dur, delay: c.delay }}>
          <div className="relative h-24 w-72">
            {[
              [0, 30, 120, 70],
              [60, 0, 140, 100],
              [150, 20, 120, 80],
              [40, 40, 200, 60],
            ].map(([x, y, w, h], j) => (
              <span key={j} className="absolute rounded-full blur-md" style={{ left: x, top: y, width: w, height: h, background: dark ? '#3a4658' : '#c9d6e6' }} />
            ))}
          </div>
        </motion.div>
      ))}
    </>
  )
}

/** Camda süzülen damlalar */
function GlassDrops({ low }: { low: boolean }) {
  const drops = useMemo(() => Array.from({ length: low ? 10 : 26 }, (_, i) => ({ left: (i * 37) % 100, size: 6 + ((i * 5) % 12), dur: 3 + ((i * 7) % 5), delay: (i * 0.37) % 4 })), [low])
  return (
    <>
      {drops.map((d, i) => (
        <motion.div key={i} className="glass-drop absolute" style={{ left: `${d.left}%`, width: d.size, height: d.size * 1.3 }} initial={{ top: '-5%' }} animate={{ top: ['-5%', '20%', '22%', '105%'] }} transition={{ repeat: Infinity, duration: d.dur, delay: d.delay, times: [0, 0.3, 0.5, 1], ease: 'easeIn' }} />
      ))}
    </>
  )
}

function Lightning() {
  const [flash, setFlash] = useState(0)
  useEffect(() => {
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        setFlash((f) => f + 1)
        setTimeout(() => sfx('thunder'), 400)
        loop()
      }, 2200 + Math.random() * 3000)
    }
    t = window.setTimeout(() => {
      setFlash(1)
      loop()
    }, 900)
    return () => clearTimeout(t)
  }, [])
  return (
    <>
      <motion.div key={flash} className="absolute inset-0 bg-[#cfe6ff]" initial={{ opacity: 0 }} animate={{ opacity: flash ? [0, 0.55, 0.05, 0.4, 0] : 0 }} transition={{ duration: 0.6 }} />
      {flash > 0 && (
        <motion.svg key={'b' + flash} className="absolute left-[20%] top-0 h-[55%]" viewBox="0 0 60 300" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1, 0] }} transition={{ duration: 0.5 }}>
          <path d="M30 0 L22 90 L36 95 L18 190 L32 195 L14 300" stroke="#e8f4ff" strokeWidth="3" fill="none" style={{ filter: 'drop-shadow(0 0 8px #9fd0ff)' }} />
        </motion.svg>
      )}
    </>
  )
}

function Frost() {
  return <motion.div className="frost-edges absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} />
}

function WindStreaks() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ top: `${10 + i * 7}%`, width: `${20 + (i % 4) * 10}%` }} initial={{ x: '-50vw' }} animate={{ x: '130vw' }} transition={{ repeat: Infinity, duration: 1.2 + (i % 3) * 0.5, delay: i * 0.21, ease: 'easeIn' }} />
      ))}
    </>
  )
}

function Atmosphere({ c, low }: { c: WeatherCondition; low: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {c === 'sunny' && (
        <>
          <Sun low={low} />
          <ParticleCanvas kind="dust" low={low} density={0.5} />
        </>
      )}
      {c === 'night' && (
        <>
          <ParticleCanvas kind="stars" low={low} />
          <Moon />
          <Clouds count={2} dark />
        </>
      )}
      {c === 'cloudy' && <Clouds count={low ? 4 : 9} />}
      {(c === 'rain' || c === 'storm') && (
        <>
          <Clouds count={low ? 3 : 6} dark />
          <ParticleCanvas kind="rain" low={low} density={c === 'storm' ? 1.4 : 1} />
          <GlassDrops low={low} />
          {c === 'storm' ? <Lightning /> : !low && <Lightning />}
        </>
      )}
      {c === 'snow' && (
        <>
          <ParticleCanvas kind="snow" low={low} />
          <Frost />
        </>
      )}
      {c === 'wind' && (
        <>
          <WindStreaks />
          <ParticleCanvas kind="leaves" low={low} />
        </>
      )}
    </div>
  )
}

function Weather({ data, low }: SceneProps<WeatherData>) {
  const warm = data.condition === 'sunny'
  return (
    <motion.div className="absolute inset-0" style={{ background: BG[data.condition] }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <Atmosphere c={data.condition} low={low} />
      {/* Ana bilgi */}
      <div className="absolute inset-x-0 top-[16%] flex flex-col items-center text-center sm:top-[18%]">
        <motion.div className="font-mono text-xs tracking-[0.6em] text-white/70" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          ▸ {data.city.toLocaleUpperCase('tr-TR')}
        </motion.div>
        <div className={`mt-2 font-hud text-[7rem] font-bold leading-none sm:text-[10rem] ${warm ? 'text-amber-100 drop-shadow-[0_0_30px_#ffb54a]' : 'text-white drop-shadow-[0_0_24px_#3ee8ff]'}`}>
          <CountUp to={data.temp} duration={1.6} delay={0.3} />
          <span className="align-top text-6xl sm:text-8xl">°</span>
        </div>
        <motion.div className="font-hud text-2xl text-white/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          {ICON[data.condition]} {data.desc}
        </motion.div>
        <motion.div className="mt-3 flex gap-5 font-mono text-xs text-white/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          {data.feels !== undefined && <span>HİSSEDİLEN {data.feels}°</span>}
          {data.humidity !== undefined && <span>NEM %{data.humidity}</span>}
          {data.wind !== undefined && <span>RÜZGÂR {data.wind} km/s</span>}
        </motion.div>
      </div>
      {/* 7 günlük tahmin */}
      <div className="absolute inset-x-0 top-[55%] flex justify-center gap-2 overflow-x-auto px-3 sm:top-[56%] sm:gap-3">
        {data.days.map((d, i) => (
          <motion.div key={d.day + i} className="hud-panel min-w-[64px] px-2 py-3 text-center sm:min-w-[84px]" initial={{ opacity: 0, x: 80, rotateY: 50 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ delay: 1.4 + i * 0.12, type: 'spring', stiffness: 140, damping: 16 }}>
            <div className="font-mono text-[10px] tracking-widest text-hud-cyan/80">{d.day}</div>
            <div className="my-1 text-2xl">{ICON[d.condition]}</div>
            <div className="font-hud text-sm text-white">
              {d.max}° <span className="text-white/50">{d.min}°</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const week = (c: WeatherCondition[], base: number) => ['BUGÜN', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'].map((day, i) => ({ day, condition: c[i % c.length], max: base + ((i * 3) % 5) - 2, min: base - 6 + ((i * 2) % 4) }))

const demoData = (condition: WeatherCondition, temp: number, desc: string, city = 'İstanbul'): WeatherData => ({ city, condition, temp, feels: temp - 1, humidity: 62, wind: condition === 'wind' ? 38 : 12, desc, days: week([condition, 'cloudy', 'sunny', 'rain', 'sunny', 'cloudy', 'sunny'], temp) })

registerScene<WeatherData>({
  id: 'weather',
  title: 'Hava durumu',
  category: 'Bilgi',
  tools: ['get_weather'],
  component: Weather,
  minDuration: 5000,
  demo: [
    { label: 'Güneşli', data: demoData('sunny', 27, 'Açık ve güneşli'), say: 'İstanbul’da hava açık ve güneşli efendim, 27 derece. Güneş gözlüğünüzü unutmayın.' },
    { label: 'Yağmurlu', data: demoData('rain', 14, 'Sağanak yağışlı'), say: 'Bugün sağanak yağış bekleniyor efendim, 14 derece. Şemsiye almanızı öneririm.' },
    { label: 'Fırtına', data: demoData('storm', 11, 'Gök gürültülü fırtına'), say: 'Gök gürültülü fırtına var efendim. Bugün evde kalmak iyi bir fikir olabilir.' },
    { label: 'Karlı', data: demoData('snow', -2, 'Kar yağışlı', 'Erzurum'), say: 'Erzurum’da kar yağışı var efendim, eksi 2 derece.' },
    { label: 'Bulutlu', data: demoData('cloudy', 19, 'Parçalı bulutlu'), say: 'Hava parçalı bulutlu efendim, 19 derece.' },
    { label: 'Rüzgârlı', data: demoData('wind', 16, 'Kuvvetli rüzgâr'), say: 'Kuvvetli rüzgâr var efendim, saatte 38 kilometre.' },
    { label: 'Gece', data: demoData('night', 12, 'Açık gece'), say: 'Gökyüzü açık efendim, 12 derece. Yıldızlar bu gece güzel görünüyor.' },
  ],
})
