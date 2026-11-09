/**
 * MÜZİK / FİLM / DİZİ / KİTAP ÖNERİSİ — müzikte dönen plak, filmde akan film şeridi;
 * öneriler afiş kartları olarak tek tek dönerek açılır.
 */
import { motion } from 'framer-motion'
import { SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface MediaData {
  kind: 'film' | 'dizi' | 'muzik' | 'kitap'
  title: string
  items: { title: string; by?: string; year?: string; note?: string; emoji?: string }[]
}

const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)
const ICON = { film: '🎬', dizi: '📺', muzik: '🎵', kitap: '📚' }

function Media({ data }: SceneProps<MediaData>) {
  const music = data.kind === 'muzik'
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneTitle color="#c084fc">{data.title.toLocaleUpperCase('tr-TR')}</SceneTitle>
      {/* Arka plan: plak ya da film şeridi */}
      {music ? (
        <div className="absolute left-1/2 top-[30%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 opacity-60 sm:h-96 sm:w-96">
          <motion.div className="h-full w-full rounded-full" style={{ background: 'repeating-radial-gradient(circle, #111 0 3px, #1c1c1c 3px 6px)', boxShadow: '0 0 60px #c084fc55' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
            <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600" />
            <div className="absolute inset-[48%] rounded-full bg-black" />
          </motion.div>
        </div>
      ) : (
        <div className="absolute inset-x-0 top-[18%] h-24 overflow-hidden opacity-40">
          <motion.div className="flex h-full w-[200%]" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="relative h-full w-28 shrink-0 border-x-4 border-black bg-zinc-800">
                <div className="absolute inset-x-1 top-1 flex justify-between">{[0, 1, 2, 3].map((k) => <span key={k} className="h-2 w-3 rounded-sm bg-black" />)}</div>
                <div className="absolute inset-x-3 bottom-4 top-4 rounded-sm" style={{ background: `hsl(${(i * 47) % 360} 50% 30%)` }} />
                <div className="absolute inset-x-1 bottom-1 flex justify-between">{[0, 1, 2, 3].map((k) => <span key={k} className="h-2 w-3 rounded-sm bg-black" />)}</div>
              </div>
            ))}
          </motion.div>
        </div>
      )}
      {/* Kartlar */}
      <div className="absolute inset-x-0 bottom-[100px] top-[150px] overflow-y-auto px-3 sm:top-[170px]">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3" style={{ perspective: 900 }}>
          {data.items.map((it, i) => (
            <motion.div key={i} className="overflow-hidden rounded-md border border-white/15 bg-black/40" initial={{ rotateY: 90, opacity: 0, y: 30 }} animate={{ rotateY: 0, opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.18, type: 'spring', stiffness: 120, damping: 14 }}>
              <div className="relative flex h-28 items-end p-2 sm:h-36" style={{ background: `linear-gradient(160deg, hsl(${hue(it.title)} 70% 45%), hsl(${(hue(it.title) + 60) % 360} 60% 15%))` }}>
                <span className="absolute right-2 top-2 text-3xl drop-shadow">{it.emoji || ICON[data.kind]}</span>
                <span className="font-hud text-lg font-bold leading-tight text-white drop-shadow-[0_2px_6px_#000]">{it.title}</span>
              </div>
              <div className="p-2">
                <div className="font-mono text-[10px] text-fuchsia-200">{[it.by, it.year].filter(Boolean).join(' · ')}</div>
                {it.note && <div className="mt-0.5 line-clamp-3 text-xs leading-snug text-white/75">{it.note}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

registerScene<MediaData>({
  id: 'media',
  title: 'Film / müzik önerisi',
  category: 'Bilgi',
  tools: ['present_media'],
  component: Media,
  minDuration: 4500,
  demo: [
    { label: 'Film', data: { kind: 'film', title: 'Bu akşam için bilim kurgu', items: [{ title: 'Interstellar', by: 'Christopher Nolan', year: '2014', note: 'Uzay, zaman ve aile üzerine destansı bir yolculuk.' }, { title: 'Arrival', by: 'Denis Villeneuve', year: '2016', note: 'Dil ve zaman algısını sorgulayan zekice bir ilk temas hikâyesi.' }, { title: 'Ex Machina', by: 'Alex Garland', year: '2014', note: 'Yapay zekâ üzerine gerilimli bir oda filmi.' }] }, say: 'Bu akşam için üç bilim kurgu önerim var efendim: Interstellar, Arrival ve Ex Machina.' },
    { label: 'Müzik', data: { kind: 'muzik', title: 'Çalışırken dinlemelik', items: [{ title: 'Weightless', by: 'Marconi Union', note: 'Sakinleştirici ambient.' }, { title: 'Clair de Lune', by: 'Debussy', note: 'Klasik bir dinginlik.' }, { title: 'Nuvole Bianche', by: 'Ludovico Einaudi', note: 'Minimal piyano.' }] }, say: 'Çalışırken dinlemeniz için sakin parçalar seçtim efendim.' },
  ],
})
