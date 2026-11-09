/**
 * TARİF — malzemeler sırayla havadan tabağa düşer (zıplayarak), tabaktan buhar yükselir;
 * yanda malzeme listesi ve numaralı adımlar açılır.
 */
import { motion } from 'framer-motion'
import { SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export interface RecipeData {
  name: string
  emoji?: string
  time?: string
  servings?: string
  ingredients: { item: string; amount?: string; emoji?: string }[]
  steps: string[]
}

const FALLBACK = ['🧅', '🧄', '🍅', '🥕', '🧂', '🫒', '🌶️', '🥔', '🧈', '🥚', '🍋', '🌿']

function Recipe({ data }: SceneProps<RecipeData>) {
  const ing = data.ingredients.slice(0, 12)
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneTitle color="#ffc46b">{`${data.name}${data.time ? ' · ' + data.time : ''}`.toLocaleUpperCase('tr-TR')}</SceneTitle>
      <div className="absolute inset-x-0 bottom-[100px] top-[130px] mx-auto flex max-w-4xl flex-col items-center gap-4 overflow-y-auto px-3 sm:flex-row sm:items-start sm:justify-center">
        {/* Tabak */}
        <div className="relative h-56 w-56 shrink-0 sm:h-72 sm:w-72">
          {ing.map((x, i) => (
            <motion.div key={i} className="absolute left-1/2 top-1/2 text-3xl sm:text-4xl" initial={{ x: (i % 2 ? 1 : -1) * 40 - 20, y: -400, rotate: -40, opacity: 0 }} animate={{ x: Math.cos(i * 1.7) * 60 - 20, y: Math.sin(i * 1.7) * 30 - 20, rotate: (i * 47) % 60 - 30, opacity: 1 }} transition={{ delay: 0.4 + i * 0.22, type: 'spring', stiffness: 180, damping: 11 }}>
              {x.emoji || FALLBACK[i % FALLBACK.length]}
            </motion.div>
          ))}
          <div className="absolute inset-x-4 bottom-6 h-20 rounded-[50%] border-4 border-white/70 bg-gradient-to-b from-white/30 to-white/5 shadow-[0_10px_40px_#ffc46b55]" />
          {/* Buhar */}
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="absolute bottom-24 h-24 w-6 rounded-full bg-white/20 blur-md" style={{ left: `${35 + i * 15}%` }} initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 0.6, 0], y: -90, scaleX: [1, 1.8, 2.4] }} transition={{ delay: 0.4 + ing.length * 0.22 + i * 0.3, duration: 2.4, repeat: Infinity }} />
          ))}
          {data.emoji && (
            <div className="absolute left-1/2 top-[38%] -translate-x-1/2">
              <motion.div className="text-6xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + ing.length * 0.22, type: 'spring' }}>
                {data.emoji}
              </motion.div>
            </div>
          )}
        </div>
        {/* Liste + adımlar */}
        <motion.div className="hud-panel w-full max-w-md px-4 py-3" style={{ borderColor: '#ffc46b55' }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <div className="mb-1 font-mono text-[10px] tracking-[0.3em] text-amber-200">MALZEMELER{data.servings ? ` · ${data.servings}` : ''}</div>
          <ul className="mb-3 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {ing.map((x, i) => (
              <motion.li key={i} className="truncate font-hud text-sm text-white/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.22 }}>
                {x.emoji || '•'} {x.amount ? <span className="text-amber-200">{x.amount} </span> : null}
                {x.item}
              </motion.li>
            ))}
          </ul>
          <div className="mb-1 font-mono text-[10px] tracking-[0.3em] text-amber-200">YAPILIŞI</div>
          <ol className="space-y-1">
            {data.steps.map((st, i) => (
              <motion.li key={i} className="flex gap-2 text-sm leading-snug text-white/85" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + ing.length * 0.15 + i * 0.15 }}>
                <span className="font-mono text-amber-300">{i + 1}.</span>
                {st}
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </div>
  )
}

registerScene<RecipeData>({
  id: 'recipe',
  title: 'Tarif',
  category: 'Bilgi',
  tools: ['present_recipe'],
  component: Recipe,
  minDuration: 5000,
  demo: [
    {
      label: 'Menemen',
      data: { name: 'Menemen', emoji: '🍳', time: '15 dakika', servings: '2 kişilik', ingredients: [{ item: 'yumurta', amount: '3', emoji: '🥚' }, { item: 'domates', amount: '3', emoji: '🍅' }, { item: 'sivri biber', amount: '2', emoji: '🌶️' }, { item: 'tereyağı', amount: '1 yk', emoji: '🧈' }, { item: 'tuz, pul biber', emoji: '🧂' }], steps: ['Biberleri tereyağında 2-3 dakika kavurun.', 'Rendelenmiş domatesi ekleyip suyunu çekene kadar pişirin.', 'Yumurtaları kırın, hafifçe karıştırın.', 'Tuz ve pul biberle servis edin.'] },
      say: 'Menemen 15 dakikada hazır efendim. Biberi kavurun, domatesi ekleyin, yumurtaları kırıp hafifçe karıştırın.',
    },
  ],
})
