/**
 * HESAP MAKİNESİ MODU
 * Tuşlu panel + işlem geçmişi + panel içinde mikrofon.
 * "=" ile sonuç hesaplanır ve büyük hesap animasyonu oynar. Sesli/yazılı hesapların
 * sonuçları (sunucudan gelen 'calc' sahneleri) da geçmişe düşer.
 * Açmak: sağ üstteki 🧮 HESAP düğmesi ya da "hesap makinesi aç".
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { voiceCommand } from '../core/assistant'
import { evaluate, fmtNum } from '../core/calc'
import { play } from '../core/player'
import { sfx } from '../core/sfx'
import { setStore, useJarvis } from '../core/store'

const KEYS = ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '%', '0', ',', '=', '√', '^', '!', '⌫']

interface Entry {
  expr: string
  result: number
}

export default function CalcPad() {
  const open = useJarvis((s) => s.calcOpen)
  const scene = useJarvis((s) => s.scene)
  const listening = useJarvis((s) => s.state === 'listening')
  const [expr, setExpr] = useState('')
  const [history, setHistory] = useState<Entry[]>([])
  const [justDone, setJustDone] = useState(false)
  const seen = useRef<number>(0)

  // Sesli/yazılı hesap sonuçlarını da geçmişe ekle
  useEffect(() => {
    if (scene?.id === 'calc' && scene.key !== seen.current) {
      seen.current = scene.key
      const d = scene.data as { expr: string; result: number }
      setHistory((h) => (h[0]?.expr === d.expr && h[0]?.result === d.result ? h : [{ expr: d.expr, result: d.result }, ...h].slice(0, 12)))
    }
  }, [scene])

  // Klavye desteği (masaüstü)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const map: Record<string, string> = { '*': '×', '/': '÷', '-': '−', Enter: '=', Backspace: '⌫', Escape: 'C', '.': ',' }
      const k = map[e.key] ?? e.key
      if (KEYS.includes(k)) {
        e.preventDefault()
        press(k)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  let preview = ''
  try {
    if (expr && /[\d)]$|!$|%$/.test(expr) && /[+×÷−^√!%]/.test(expr)) preview = fmtNum(evaluate(expr))
  } catch {
    preview = ''
  }

  function press(k: string) {
    sfx('tick')
    if (k === 'C') return setExpr(''), setJustDone(false)
    if (k === '⌫') return setExpr((e) => e.slice(0, -1))
    if (k === '=') {
      if (!expr) return
      try {
        const r = evaluate(expr)
        const shown = expr.replace(/([+×÷−^])/g, ' $1 ').replace(/\s+/g, ' ').trim()
        setHistory((h) => [{ expr: shown, result: r }, ...h].slice(0, 12))
        seen.current = -1
        play({ type: 'scene', scene: 'calc', data: { expr: shown, result: r, label: 'HESAP' }, hold: 400 })
        setExpr(Number.isFinite(r) ? String(Number(r.toFixed(10))).replace('.', ',') : '')
        setJustDone(true)
      } catch {
        sfx('error')
      }
      return
    }
    const isOp = /^[+×÷−^%!]$/.test(k)
    setExpr((e) => (justDone && !isOp ? '' : e) + k)
    setJustDone(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute bottom-[84px] right-3 z-40 w-[min(92vw,340px)]" initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.9 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
          <div className="hud-panel p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.4em] text-hud-cyan">🧮 HESAP MAKİNESİ</span>
              <div className="flex gap-1">
                <button onClick={() => voiceCommand()} className={`hud-btn h-8 min-w-[32px] px-2 text-sm ${listening ? 'border-hud-cyan bg-hud-cyan/20' : ''}`} title="Sesle hesapla (ör. yüz yirmi beş çarpı on iki)">
                  🎙
                </button>
                <button onClick={() => setStore({ calcOpen: false })} className="hud-btn h-8 min-w-[32px] px-2 text-sm" aria-label="Kapat">
                  ✕
                </button>
              </div>
            </div>
            {/* Ekran */}
            <div className="mb-2 rounded-sm border border-hud-cyan/30 bg-black/40 px-3 py-2 text-right">
              <div className="min-h-[18px] truncate font-mono text-xs text-hud-cyan/60">{preview && `= ${preview}`}</div>
              <div className="truncate font-hud text-3xl text-white" style={{ textShadow: '0 0 12px #3ee8ff88' }}>
                {expr || '0'}
              </div>
            </div>
            {/* Tuşlar */}
            <div className="grid grid-cols-4 gap-1.5">
              {KEYS.map((k) => (
                <motion.button
                  key={k}
                  onClick={() => press(k)}
                  whileTap={{ scale: 0.9 }}
                  className={`h-10 rounded-sm border sm:h-11 font-hud text-xl transition ${k === '=' ? 'border-hud-cyan bg-hud-cyan/30 text-white shadow-[0_0_12px_#3ee8ff88]' : /^[÷×−+^%√!()]$/.test(k) ? 'border-hud-cyan/30 bg-hud-cyan/10 text-hud-cyan' : k === 'C' || k === '⌫' ? 'border-red-400/30 bg-red-500/10 text-red-300' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                >
                  {k}
                </motion.button>
              ))}
            </div>
            {/* Geçmiş */}
            {history.length > 0 && (
              <div className="mt-2 max-h-16 overflow-y-auto sm:max-h-28 border-t border-hud-cyan/15 pt-1.5">
                {history.map((h, i) => (
                  <button key={i} onClick={() => setExpr(String(Number(h.result.toFixed(10))).replace('.', ','))} className="flex w-full justify-between gap-2 py-0.5 text-left font-mono text-[11px] text-white/60 hover:text-hud-cyan" title="Sonucu ekrana al">
                    <span className="truncate">{h.expr}</span>
                    <span className="text-hud-cyan">= {fmtNum(h.result)}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="mt-1.5 hidden font-mono sm:block text-[10px] leading-snug text-hud-cyan/40">Sesle de olur: “yüz yirmi beş çarpı on iki”, “5000'e yüzde 20 zam”, “bunu 3'e böl”</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
