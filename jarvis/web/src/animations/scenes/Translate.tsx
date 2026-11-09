/**
 * ÇEVİRİ — kaynak metnin harfleri tek tek parçalanıp dağılır, hedef dilde yeniden birleşir;
 * iki dilin bayrağı arasında ışık köprüsü akar.
 */
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { registerScene, type SceneProps } from '../registry'

export interface TranslateData {
  text: string
  out: string
  from: { code: string; name: string; flag: string }
  to: { code: string; name: string; flag: string }
}

/** Metni kelimelere böl (harf sırasını korur) */
function words(t: string) {
  const out: { text: string; start: number }[] = []
  let i = 0
  for (const w of t.split(' ')) {
    out.push({ text: w, start: i })
    i += w.length + 1
  }
  return out
}

function Translate({ data }: SceneProps<TranslateData>) {
  const src = useMemo(() => [...data.text.slice(0, 120)], [data.text])
  const size = data.out.length > 40 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl'
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Bayraklar + ışık köprüsü */}
      <div className="relative mb-8 flex w-full max-w-xl items-center justify-between">
        <motion.div className="z-10 flex flex-col items-center" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <span className="text-5xl drop-shadow-[0_0_12px_#3ee8ff]">{data.from.flag}</span>
          <span className="font-mono text-[10px] tracking-widest text-hud-cyan">{data.from.name.toLocaleUpperCase('tr-TR')}</span>
        </motion.div>
        <div className="absolute inset-x-16 top-1/3 h-[3px] overflow-hidden rounded-full bg-hud-cyan/10">
          <motion.div className="h-full w-1/3 bg-gradient-to-r from-transparent via-hud-cyan to-transparent shadow-[0_0_12px_#3ee8ff]" animate={{ x: ['-100%', '300%'] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} />
        </div>
        <motion.div className="z-10 flex flex-col items-center" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <span className="text-5xl drop-shadow-[0_0_12px_#39ff9a]">{data.to.flag}</span>
          <span className="font-mono text-[10px] tracking-widest text-emerald-300">{data.to.name.toLocaleUpperCase('tr-TR')}</span>
        </motion.div>
      </div>
      {/* Kaynak: harfler dağılır */}
      <div className={`relative mb-6 max-w-2xl text-center font-hud text-white/70 ${size}`}>
        {src.map((ch, i) => {
          const a = (i * 137.5 * Math.PI) / 180
          return (
            <motion.span key={i} className="inline-block whitespace-pre" initial={{ opacity: 1 }} animate={{ x: [0, 0, Math.cos(a) * 300], y: [0, 0, Math.sin(a) * 200 + 120], opacity: [1, 1, 0], rotate: [0, 0, (i % 2 ? 1 : -1) * 180] }} transition={{ duration: 1.8, times: [0, 0.45, 1], delay: i * 0.01 }}>
              {ch}
            </motion.span>
          )
        })}
      </div>
      {/* Hedef: harfler birleşir (kelimeler bölünmesin diye kelime kutuları içinde) */}
      <div className={`max-w-2xl text-center font-hud font-semibold text-white ${size}`} style={{ textShadow: '0 0 18px #39ff9a88' }}>
        {words(data.out.slice(0, 160)).map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {[...w.text].map((ch, ci) => {
              const i = w.start + ci
              const a = (i * 97 * Math.PI) / 180
              return (
                <motion.span key={ci} className="inline-block whitespace-pre" initial={{ x: Math.cos(a) * 320, y: Math.sin(a) * 220 - 100, opacity: 0, scale: 2 }} animate={{ x: 0, y: 0, opacity: 1, scale: 1 }} transition={{ delay: 1.2 + i * 0.025, type: 'spring', stiffness: 140, damping: 15 }}>
                  {ch}
                </motion.span>
              )
            })}
          </span>
        )).flatMap((el, i) => (i ? [' ', el] : [el]))}
      </div>
    </div>
  )
}

registerScene<TranslateData>({
  id: 'translate',
  title: 'Çeviri',
  category: 'Araçlar',
  tools: ['translate'],
  component: Translate,
  minDuration: 3600,
  demo: [{ label: 'İngilizce', data: { text: 'Günaydın, bugün hava çok güzel', out: 'Good morning, the weather is very nice today', from: { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }, to: { code: 'en', name: 'İngilizce', flag: '🇬🇧' } }, say: 'İngilizcesi şöyle efendim: Good morning, the weather is very nice today.' }],
})
