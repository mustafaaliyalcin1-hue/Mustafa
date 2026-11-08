/**
 * GÜNCEL HABERLER
 * Üstte holografik manşet bandı (ticker) akar; ortada haber kartları bir deste
 * halinde gelir, sonra yelpaze gibi açılıp ızgaraya yerleşir.
 */
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { sfx } from '../../core/sfx'
import { registerScene, type SceneProps } from '../registry'

export interface NewsData {
  category: string
  items: { title: string; source: string; url: string; time?: string }[]
}

function ago(iso?: string) {
  if (!iso) return ''
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'şimdi'
  if (m < 60) return `${m} dk önce`
  if (m < 1440) return `${Math.round(m / 60)} sa önce`
  return `${Math.round(m / 1440)} gün önce`
}

function News({ data }: SceneProps<NewsData>) {
  const loading = !data.items?.length
  const mobile = typeof window !== 'undefined' && window.innerWidth < 640
  const items = (loading ? Array.from({ length: 6 }, () => ({ title: '', source: '', url: '', time: '' })) : data.items).slice(0, mobile ? 4 : 6)
  const [spread, setSpread] = useState(false)
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => {
      setSpread(true)
      sfx('whoosh')
    }, 900)
    return () => clearTimeout(t)
  }, [loading])
  const cols = mobile ? 1 : 3

  const tickerText = loading ? 'MANŞETLER YÜKLENİYOR  ◆  ' : data.items.map((i) => `${i.title}  ◆  `).join('')

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Kategori başlığı */}
      <motion.div className="absolute inset-x-0 top-[96px] text-center sm:top-24" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="font-mono text-[10px] tracking-[0.5em] text-hud-cyan/70">▸ GÜNCEL HABERLER</div>
        <div className="font-hud text-3xl font-bold tracking-[0.25em] text-white text-glow sm:text-4xl">{data.category}</div>
      </motion.div>

      {/* Manşet bandı */}
      <motion.div className="absolute inset-x-0 top-[170px] overflow-hidden border-y border-hud-cyan/40 bg-hud-cyan/10 py-1.5 sm:top-[180px]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6 }}>
        <div className="flex">
          <span className="z-10 shrink-0 bg-red-600 px-3 font-mono text-xs font-bold tracking-widest text-white">SON DAKİKA</span>
          <div className="ticker flex whitespace-nowrap font-hud text-sm text-white/90">
            <span className="pl-4">{tickerText}</span>
            <span className="pl-4">{tickerText}</span>
          </div>
        </div>
      </motion.div>

      {/* Kart destesi → ızgara */}
      <div className="absolute inset-x-0 bottom-[110px] top-[220px] overflow-y-auto px-3 sm:top-[240px]">
        <div className={`relative mx-auto grid max-w-5xl gap-3 ${mobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {items.map((n, i) => {
            const r = Math.floor(i / cols)
            const c = i % cols
            // Destedeyken hepsi ortada üst üste, hafif dönük
            const stack = { x: mobile ? 0 : (1 - c) * 100 + '%', y: -r * 100 + '%', rotate: (i - 2) * 3, scale: 0.92 }
            return (
              <motion.a
                key={i}
                href={n.url || undefined}
                target="_blank"
                rel="noreferrer"
                className="news-card hud-panel block min-h-[92px] px-4 py-3"
                style={{ zIndex: 10 - i }}
                initial={{ opacity: 0, y: 200, rotate: -10 }}
                animate={spread ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 } : { opacity: 1, ...stack }}
                transition={spread ? { delay: i * 0.08, type: 'spring', stiffness: 140, damping: 18 } : { delay: i * 0.07, duration: 0.5 }}
              >
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-hud-cyan/20" />
                    <div className="h-4 w-full animate-pulse rounded bg-hud-cyan/15" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-hud-cyan/15" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between font-mono text-[10px] tracking-wider text-hud-cyan/80">
                      <span>{n.source}</span>
                      <span>{ago(n.time)}</span>
                    </div>
                    <div className="mt-1 font-hud text-base leading-snug text-white sm:text-lg">{n.title}</div>
                  </>
                )}
              </motion.a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const now = Date.now()
const t = (min: number) => new Date(now - min * 60000).toISOString()

registerScene<NewsData>({
  id: 'news',
  title: 'Güncel haberler',
  category: 'Bilgi',
  tools: ['get_news'],
  component: News,
  minDuration: 4500,
  demo: [
    {
      label: 'Gündem',
      data: {
        category: 'GÜNDEM',
        items: [
          { title: 'Merkez Bankası faiz kararını açıkladı: politika faizi sabit tutuldu', source: 'Anadolu Ajansı', url: 'https://www.aa.com.tr', time: t(12) },
          { title: 'İstanbul’da yeni metro hattı hizmete giriyor', source: 'NTV', url: 'https://www.ntv.com.tr', time: t(40) },
          { title: 'Meteoroloji’den Karadeniz için kuvvetli yağış uyarısı', source: 'TRT Haber', url: 'https://www.trthaber.com', time: t(65) },
          { title: 'Yerli elektrikli otomobilde yeni model tanıtıldı', source: 'Hürriyet', url: 'https://www.hurriyet.com.tr', time: t(120) },
          { title: 'Üniversite tercih kılavuzunda yeni dönem', source: 'Sözcü', url: 'https://www.sozcu.com.tr', time: t(180) },
          { title: 'Yapay zekâ düzenlemesi Meclis gündeminde', source: 'BBC Türkçe', url: 'https://www.bbc.com/turkce', time: t(240) },
        ],
      },
      say: 'Günün öne çıkan başlıkları efendim: Merkez Bankası faizi sabit tuttu, İstanbul’da yeni bir metro hattı açılıyor ve Karadeniz için kuvvetli yağış uyarısı var.',
    },
  ],
})
