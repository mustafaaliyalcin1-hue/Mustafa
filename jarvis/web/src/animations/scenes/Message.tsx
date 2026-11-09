/**
 * MESAJ — mesaj kartı katlanıp kağıt uçağa dönüşür ve ışık izi bırakarak uçup gider.
 */
import { motion } from 'framer-motion'
import { registerScene, type SceneProps } from '../registry'

export interface MessageData {
  to: string
  text: string
}

function Message({ data }: SceneProps<MessageData>) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Kart → katlanma */}
      <motion.div className="absolute w-72 rounded-md bg-white p-4 text-slate-800 shadow-2xl" initial={{ scale: 0.6, opacity: 0, rotateX: 0 }} animate={{ scale: [0.6, 1, 1, 0.3], opacity: [0, 1, 1, 0], rotateX: [0, 0, 70, 70], rotateZ: [0, 0, -10, -30] }} transition={{ duration: 1.4, times: [0, 0.25, 0.65, 1] }}>
        <div className="font-mono text-[10px] text-slate-500">ALICI: {data.to}</div>
        <div className="mt-1 font-hud text-lg leading-snug">{data.text}</div>
      </motion.div>
      {/* Kağıt uçak */}
      <motion.div className="absolute text-7xl" initial={{ x: 0, y: 0, opacity: 0, rotate: -20, scale: 0.4 }} animate={{ x: [0, 0, 260, 700], y: [0, 0, -140, -500], opacity: [0, 1, 1, 0], rotate: [-20, -20, -35, -40], scale: [0.4, 1, 1, 0.6] }} transition={{ delay: 1.1, duration: 1.6, times: [0, 0.1, 0.6, 1], ease: 'easeIn' }}>
        <svg viewBox="0 0 64 64" className="h-20 w-20 drop-shadow-[0_0_12px_#3ee8ff]">
          <path d="M2 30 L62 4 L40 60 L30 38 Z" fill="#e6faff" />
          <path d="M30 38 L62 4 L22 34 Z" fill="#9fdcff" />
        </svg>
      </motion.div>
      {/* Işık izi */}
      <motion.svg className="pointer-events-none absolute h-full w-full" viewBox="-400 -400 800 800" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 1.3, duration: 1.6 }}>
        <motion.path d="M0 0 C 120 -40, 200 -80, 360 -330" stroke="#3ee8ff" strokeWidth="3" strokeDasharray="8 10" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: 1.2 }} />
      </motion.svg>
      {/* Son durum: onay halkası + alıcı */}
      <motion.div className="absolute flex flex-col items-center" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.1, type: 'spring', stiffness: 180, damping: 14 }}>
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-hud-cyan text-5xl text-hud-cyan shadow-[0_0_30px_#3ee8ff88]">✓</div>
        <div className="mt-3 font-hud text-lg text-white">{data.to}</div>
      </motion.div>
      <motion.div className="absolute bottom-[26%] font-mono text-xs tracking-[0.4em] text-hud-cyan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
        ✓ WHATSAPP'A GÖNDERİLDİ
      </motion.div>
    </div>
  )
}

registerScene<MessageData>({ id: 'message', title: 'Mesaj gönderme', category: 'Araçlar', component: Message, minDuration: 2800, demo: [{ label: 'Kağıt uçak', data: { to: 'Ahmet', text: 'Yarın geliyorum 👋' }, say: 'Mesajınız hazır efendim.' }] })
