/**
 * ANİMASYON GALERİSİ — her animasyonu tek tuşla tetikle.
 * Registry'ye kayıtlı tüm sahneler ve varyantları otomatik listelenir.
 */
import { motion } from 'framer-motion'
import { listScenes } from '../animations'
import { closeScene, interrupt, play, setState } from '../core/player'
import { startMicLevel, stopMicLevel } from '../core/voice'
import type { AssistantState, JarvisEvent } from '../core/types'

const STATES: { s: AssistantState; label: string; say?: string }[] = [
  { s: 'idle', label: 'Boşta' },
  { s: 'listening', label: 'Dinliyor' },
  { s: 'thinking', label: 'Düşünüyor' },
  { s: 'speaking', label: 'Konuşuyor', say: 'Elbette efendim. Bu, konuşma animasyonunun bir örneği; kelimeler altyazı gibi tek tek beliriyor.' },
  { s: 'success', label: 'Başarılı' },
  { s: 'error', label: 'Hata' },
]

export default function Gallery({ onClose, onBoot }: { onClose: () => void; onBoot: () => void }) {
  const scenes = listScenes()
  const cats = [...new Set(scenes.map((s) => s.category))]

  const runState = (x: (typeof STATES)[number]) => {
    interrupt()
    closeScene()
    stopMicLevel()
    onClose()
    if (x.s === 'listening') {
      setState('listening')
      startMicLevel()
      setTimeout(() => {
        stopMicLevel()
        setState('idle')
      }, 5000)
    } else if (x.s === 'thinking') {
      setState('thinking')
      setTimeout(() => setState('idle'), 4000)
    } else if (x.s === 'speaking') play([{ type: 'say', text: x.say! }, { type: 'end' }])
    else if (x.s === 'error') play([{ type: 'state', state: 'error', message: 'Örnek hata: Home Assistant bağlantısı kurulamadı.' }, { type: 'end' }])
    else play([{ type: 'state', state: x.s }, { type: 'end' }])
  }

  const runScene = (id: string, data: unknown, say?: string) => {
    interrupt()
    onClose()
    const ev: JarvisEvent[] = [{ type: 'state', state: 'thinking' }, { type: 'scene', scene: id, data, hold: id === 'factcheck' ? 6600 : 1800 }]
    if (say) ev.push({ type: 'say', text: say })
    ev.push({ type: 'end' })
    play(ev)
  }

  return (
    <motion.div className="absolute inset-0 z-40 overflow-y-auto bg-hud-bg/90 px-4 pb-10 pt-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-hud text-2xl tracking-[0.3em] text-hud-cyan text-glow">ANİMASYON GALERİSİ</h2>
          <button onClick={onClose} className="hud-btn">
            ✕
          </button>
        </div>

        <Section title="TEMEL DURUMLAR">
          <Card label="Açılış (boot)" onClick={() => (onClose(), onBoot())} />
          {STATES.map((x) => (
            <Card key={x.s} label={x.label} onClick={() => runState(x)} />
          ))}
        </Section>

        {cats.map((c) => (
          <Section key={c} title={c.toLocaleUpperCase('tr-TR')}>
            {scenes
              .filter((s) => s.category === c)
              .flatMap((s) => (s.demo?.length ? s.demo : [{ label: '', data: {} as unknown, say: undefined }]).map((d) => <Card key={s.id + d.label} label={s.title} sub={d.label} onClick={() => runScene(s.id, d.data, d.say)} />))}
          </Section>
        ))}
        <p className="mt-6 font-mono text-[11px] text-hud-cyan/50">Yeni animasyonlar 3. ve 4. aşamada eklenecek: araştırma, haberler, spor, finans, harita, çeviri, hesaplama, zamanlayıcı, takvim, tarif, müzik/film, görsel analiz, mesaj, sabah brifingi, akıllı ev, Roborock.</p>
      </div>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 font-mono text-[11px] tracking-[0.4em] text-hud-cyan/60">{title}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  )
}

function Card({ label, sub, onClick }: { label: string; sub?: string; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} className="hud-panel group px-4 py-3 text-left transition hover:bg-hud-cyan/10" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
      <div className="font-hud text-base text-white group-hover:text-hud-cyan">{label}</div>
      {sub && <div className="font-mono text-[11px] text-hud-cyan/60">{sub}</div>}
    </motion.button>
  )
}
