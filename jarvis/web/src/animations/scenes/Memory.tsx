/** HAFIZA ("unutma") — bilgi ışık topuna dönüşüp çekirdeğe emilir, "Kaydedildi efendim" */
import { motion } from 'framer-motion'
import { registerScene, type SceneProps } from '../registry'
import { useAfter } from '../common'

function Memory({ data }: SceneProps<{ text: string }>) {
  const saved = useAfter(2300)
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 1) Not kartı → küçülüp ışık topuna dönüşür */}
      <motion.div
        className="hud-panel absolute max-w-sm px-6 py-4 text-center font-hud text-xl text-white"
        initial={{ y: 160, opacity: 0, scale: 0.9 }}
        animate={{ y: [160, 0, 0, -10], opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.05], borderRadius: ['4px', '4px', '4px', '999px'] }}
        transition={{ duration: 2, times: [0, 0.3, 0.7, 1] }}
      >
        “{data.text}”
      </motion.div>
      {/* 2) Işık topu çekirdeğe emilir */}
      <motion.div
        className="absolute h-6 w-6 rounded-full bg-white shadow-[0_0_30px_12px_#3ee8ff]"
        initial={{ opacity: 0, y: -10, scale: 0.4 }}
        animate={{ opacity: [0, 1, 1, 0], y: [-10, -60, 0, 0], scale: [0.4, 1, 0.6, 0] }}
        transition={{ delay: 1.8, duration: 0.9, times: [0, 0.3, 0.85, 1] }}
      />
      {/* 3) Emilim dalgası */}
      <motion.div className="absolute h-40 w-40 rounded-full border-2 border-hud-cyan" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: [0.2, 2.4], opacity: [0, 0.9, 0] }} transition={{ delay: 2.6, duration: 1 }} />
      {/* Hafıza hücreleri */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2
          return (
            <motion.div key={i} className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-hud-cyan" initial={{ x: Math.cos(a) * 400, y: Math.sin(a) * 400, opacity: 0 }} animate={{ x: 0, y: 0, opacity: [0, 1, 0] }} transition={{ delay: 2.2 + (i % 6) * 0.05, duration: 0.7 }} />
          )
        })}
      </div>
      {saved && (
        <motion.div className="absolute bottom-[26%] font-hud text-2xl tracking-widest text-hud-cyan text-glow" initial={{ opacity: 0, letterSpacing: '0.8em' }} animate={{ opacity: 1, letterSpacing: '0.2em' }}>
          KAYDEDİLDİ EFENDİM
        </motion.div>
      )}
    </div>
  )
}

registerScene({
  id: 'memory',
  title: 'Hafıza (unutma)',
  category: 'Araçlar',
  tools: ['memory_save'],
  component: Memory,
  minDuration: 3200,
  demo: [{ label: 'Kahve', data: { text: 'Kahvemi şekersiz içerim' }, say: 'Not ettim efendim, kahveniz bundan sonra şekersiz.' }],
})
