/** GENEL "İŞLEM YAPILIYOR" — eşleşmeyen her istek için yedek sahne */
import { motion } from 'framer-motion'
import { registerScene, type SceneProps } from '../registry'
import { SceneTitle } from '../common'

function Generic({ data }: SceneProps<{ label?: string; steps?: string[] }>) {
  const steps = data?.steps || ['İstek çözümleniyor', 'Modüller hazırlanıyor', 'İşlem yürütülüyor']
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <SceneTitle>{data?.label || 'İŞLEM YAPILIYOR'}</SceneTitle>
      <div className="relative h-72 w-72">
        {[0, 1, 2].map((i) => (
          <motion.svg key={i} viewBox="0 0 100 100" className="absolute inset-0" animate={{ rotate: i % 2 ? -360 : 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 6 + i * 3 }}>
            <polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="none" stroke="#3ee8ff" strokeOpacity={0.5 - i * 0.12} strokeWidth={0.6} strokeDasharray={i === 1 ? '4 3' : i === 2 ? '1 2' : '20 6'} transform={`scale(${1 - i * 0.18}) translate(${i * 11} ${i * 11})`} />
          </motion.svg>
        ))}
        {/* Radar taraması */}
        <motion.div className="absolute inset-6 rounded-full" style={{ background: 'conic-gradient(from 0deg, rgba(62,232,255,0.35), transparent 25%)' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 2 }} />
        <div className="absolute inset-0 flex items-center justify-center font-hud text-5xl text-hud-cyan text-glow">
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }}>⬡</motion.span>
        </div>
      </div>
      <div className="mt-8 w-72 space-y-3">
        {steps.map((s, i) => (
          <div key={s}>
            <div className="mb-1 flex justify-between font-mono text-[11px] text-hud-cyan/80">
              <span>{s}</span>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.7 }}>
                ✓
              </motion.span>
            </div>
            <div className="h-1 overflow-hidden bg-hud-cyan/10">
              <motion.div className="h-full bg-hud-cyan shadow-[0_0_8px_#3ee8ff]" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: i * 0.7, duration: 0.8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

registerScene({
  id: 'generic',
  title: 'İşlem yapılıyor',
  category: 'Temel',
  component: Generic,
  minDuration: 2600,
  demo: [{ label: 'Varsayılan', data: {}, say: 'Hallediyorum efendim.' }],
})
