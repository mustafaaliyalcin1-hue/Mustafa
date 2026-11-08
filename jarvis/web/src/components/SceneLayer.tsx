/** Aktif konu sahnesini registry'den bulup tam ekran oynatır. */
import { AnimatePresence, motion } from 'framer-motion'
import { getScene } from '../animations'
import { closeScene } from '../core/player'
import { isLowPerf, useJarvis } from '../core/store'

export default function SceneLayer() {
  const scene = useJarvis((s) => s.scene)
  const low = useJarvis((s) => isLowPerf(s))
  const def = scene ? getScene(scene.id) : null
  const C = def?.component
  return (
    <AnimatePresence mode="wait">
      {scene && C && (
        <motion.div key={scene.key} className="absolute inset-0 z-10 overflow-hidden" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }} transition={{ duration: 0.4 }}>
          <C data={scene.data as never} low={low} />
          <button onClick={closeScene} className="absolute bottom-[76px] right-3 z-30 rounded border border-hud-cyan/40 bg-hud-bg/70 px-2 py-1 font-mono text-xs text-hud-cyan/80 hover:bg-hud-cyan/10 sm:bottom-auto sm:right-4 sm:top-32" aria-label="Sahneyi kapat">
            ✕ KAPAT
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
