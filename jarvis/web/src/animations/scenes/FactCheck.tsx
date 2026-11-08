/**
 * HABER DOĞRULAMA
 * Zaman çizelgesi:
 *   0.0s  haber kartı ortaya uçar
 *   0.6s  büyüteç kart üzerinde gezinir, satırlar taranır
 *   0.9s+ kaynaklar tek tek "eşleşiyor / çelişiyor" diye yeşil/kırmızı yanar
 *   ~3.4s gerilim bekleme (kalp atışı sesi, ekran kararır)
 *   ~4.4s DAMGA "güm" diye vurur
 *          YALAN → kırmızı eğik damga + sarsıntı + kırmızı flaş + kağıt yırtılması
 *          DOĞRU → yeşil damga + parıltı + onay halkası
 *          YANILTICI → turuncu damga + bazı ifadelerin üstü çizilir
 *          DOĞRULANAMADI → gri damga + soru işareti partikülleri
 *   ~5.0s gerekçe ve kaynak linkleri açılır
 */
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import { sfx } from '../../core/sfx'
import ParticleCanvas from '../ParticleCanvas'
import { SceneTitle } from '../common'
import { registerScene, type SceneProps } from '../registry'

export type Verdict = 'DOGRU' | 'YALAN' | 'YANILTICI' | 'DOGRULANAMADI'

export interface FactCheckData {
  headline: string
  outlet?: string
  body: string
  verdict: Verdict
  reason: string
  /** YANILTICI için üstü çizilecek ifadeler (body içinde geçmeli) */
  strike?: string[]
  sources: { name: string; url: string; stance: 'match' | 'conflict' | 'neutral' }[]
}

const V: Record<Verdict, { label: string; color: string; glow: string }> = {
  DOGRU: { label: 'DOĞRU', color: '#39ff9a', glow: '#39ff9a' },
  YALAN: { label: 'YALAN', color: '#ff2e47', glow: '#ff2e47' },
  YANILTICI: { label: 'YANILTICI', color: '#ff9a2e', glow: '#ff9a2e' },
  DOGRULANAMADI: { label: 'DOĞRULANAMADI', color: '#9aa7b4', glow: '#9aa7b4' },
}

const T_STAMP = 4400

function Body({ text, strike, active }: { text: string; strike?: string[]; active: boolean }) {
  if (!strike?.length) return <>{text}</>
  const parts: { t: string; s: boolean }[] = []
  let rest = text
  while (rest) {
    let best = -1
    let hit = ''
    for (const s of strike) {
      const i = rest.indexOf(s)
      if (i >= 0 && (best < 0 || i < best)) {
        best = i
        hit = s
      }
    }
    if (best < 0) {
      parts.push({ t: rest, s: false })
      break
    }
    if (best > 0) parts.push({ t: rest.slice(0, best), s: false })
    parts.push({ t: hit, s: true })
    rest = rest.slice(best + hit.length)
  }
  return (
    <>
      {parts.map((p, i) =>
        p.s ? (
          <motion.span
            key={i}
            style={{ backgroundImage: 'linear-gradient(#ff7a1a,#ff7a1a)', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 55%', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
            initial={{ backgroundSize: '0% 3px', color: '#334155' }}
            animate={active ? { backgroundSize: '100% 3px', color: '#9a3412' } : {}}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
          >
            {p.t}
          </motion.span>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </>
  )
}

function FactCheck({ data, low }: SceneProps<FactCheckData>) {
  const v = V[data.verdict]
  const [phase, setPhase] = useState<'scan' | 'tension' | 'stamped' | 'details'>('scan')
  const [lit, setLit] = useState(0)
  const shake = useAnimationControls()

  useEffect(() => {
    const ts: number[] = []
    data.sources.forEach((_, i) =>
      ts.push(
        window.setTimeout(() => {
          setLit(i + 1)
          sfx('bip')
        }, 900 + i * 450),
      ),
    )
    ts.push(
      window.setTimeout(() => {
        setPhase('tension')
        sfx('tension')
      }, T_STAMP - 1100),
    )
    ts.push(
      window.setTimeout(() => {
        setPhase('stamped')
        sfx('stamp')
        if (data.verdict === 'DOGRU') setTimeout(() => sfx('success'), 250)
        const strong = data.verdict === 'YALAN'
        shake.start({ x: strong ? [0, -18, 16, -12, 9, -5, 0] : [0, -5, 4, 0], y: strong ? [0, 10, -8, 6, -3, 0] : [0, 3, 0], transition: { duration: strong ? 0.55 : 0.3 } })
      }, T_STAMP),
    )
    ts.push(window.setTimeout(() => setPhase('details'), T_STAMP + 700))
    return () => ts.forEach(clearTimeout)
  }, [data, shake])

  const stamped = phase === 'stamped' || phase === 'details'
  const torn = stamped && data.verdict === 'YALAN'

  const card = (half?: 'top' | 'bottom') => (
    <div
      className="news-paper relative w-[min(88vw,560px)] px-6 py-5 text-left"
      style={half ? { clipPath: half === 'top' ? 'polygon(0 0,100% 0,100% 46%,88% 52%,74% 44%,60% 55%,45% 47%,30% 56%,15% 46%,0 53%)' : 'polygon(0 53%,15% 46%,30% 56%,45% 47%,60% 55%,74% 44%,88% 52%,100% 46%,100% 100%,0 100%)' } : undefined}
    >
      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">{data.outlet || 'Sosyal medya paylaşımı'}</div>
      <h2 className="font-serif text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{data.headline}</h2>
      <p className="mt-2 font-serif text-sm leading-relaxed text-slate-700">
        <Body text={data.body} strike={data.verdict === 'YANILTICI' ? data.strike : undefined} active={stamped} />
      </p>
      {/* Tarama çizgisi */}
      {phase === 'scan' && <motion.div className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" initial={{ top: '-10%' }} animate={{ top: ['-10%', '100%', '-10%'] }} transition={{ duration: 2.2, repeat: Infinity }} />}
    </div>
  )

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center" animate={shake}>
      <SceneTitle color={stamped ? v.color : '#3ee8ff'}>{stamped ? 'DOĞRULAMA TAMAMLANDI' : 'HABER DOĞRULANIYOR'}</SceneTitle>
      {/* Gerilim: kenarlar kararır, nabız */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #000 85%)' }} animate={{ opacity: phase === 'tension' ? [0.4, 0.9, 0.5, 0.9] : 0.3 }} transition={{ duration: 1 }} />
      {/* Sonuca göre flaş */}
      {stamped && <motion.div className="pointer-events-none absolute inset-0" style={{ background: v.color }} initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} />}
      {stamped && data.verdict === 'DOGRULANAMADI' && <ParticleCanvas kind="question" low={low} />}
      {stamped && data.verdict === 'DOGRU' && <motion.div className="pointer-events-none absolute h-[520px] w-[520px] rounded-full border-4" style={{ borderColor: v.color, boxShadow: `0 0 40px ${v.glow}` }} initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.2 }} />}

      <div className="relative flex w-full flex-col items-center gap-4 px-3 lg:flex-row lg:items-start lg:justify-center">
        {/* Haber kartı */}
        <motion.div className="relative" initial={{ y: 300, rotate: -8, opacity: 0, scale: 0.8 }} animate={{ y: 0, rotate: -1.5, opacity: 1, scale: phase === 'details' ? 0.92 : 1 }} transition={{ type: 'spring', stiffness: 90, damping: 14 }}>
          {torn ? (
            <div className="relative">
              <motion.div animate={{ y: -10, rotate: -2.5, x: -6 }} transition={{ duration: 0.4 }}>
                {card('top')}
              </motion.div>
              <motion.div className="absolute inset-0" animate={{ y: 16, rotate: 2.5, x: 8 }} transition={{ duration: 0.4 }}>
                {card('bottom')}
              </motion.div>
            </div>
          ) : (
            card()
          )}
          {/* Büyüteç */}
          {!stamped && (
            <motion.div className="magnifier absolute h-24 w-24" initial={{ left: '5%', top: '10%' }} animate={{ left: ['5%', '60%', '30%', '70%', '15%', '50%'], top: ['10%', '20%', '55%', '45%', '60%', '25%'] }} transition={{ duration: 3.4, ease: 'easeInOut' }}>
              <div className="h-full w-full rounded-full border-4 border-hud-cyan bg-cyan-200/10 shadow-[0_0_20px_#3ee8ff] backdrop-blur-[1px]" style={{ backdropFilter: 'contrast(1.3) brightness(1.15)' }} />
              <div className="absolute -bottom-7 -right-5 h-10 w-3 rotate-[-45deg] rounded bg-hud-cyan shadow-[0_0_10px_#3ee8ff]" />
            </motion.div>
          )}
          {/* DAMGA */}
          {stamped && (
            <motion.div className="pointer-events-none absolute inset-0 flex items-center justify-center" initial={{ scale: 3.2, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: data.verdict === 'YALAN' ? -16 : -10 }} transition={{ type: 'spring', stiffness: 520, damping: 22 }}>
              <div className="stamp font-hud text-5xl font-black tracking-wider sm:text-7xl" style={{ color: v.color, borderColor: v.color, textShadow: `0 0 18px ${v.glow}` }}>
                {v.label}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Kaynaklar */}
        <div className="w-[min(88vw,320px)] space-y-1.5">
          <div className="font-mono text-[10px] tracking-[0.4em] text-hud-cyan/70">KAYNAKLAR · {lit}/{data.sources.length}</div>
          {data.sources.map((s, i) => {
            const on = i < lit
            const col = s.stance === 'match' ? '#39ff9a' : s.stance === 'conflict' ? '#ff3b4e' : '#9aa7b4'
            return (
              <motion.a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="hud-panel flex items-center justify-between px-3 py-1.5 font-mono text-xs" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0, borderColor: on ? col : 'rgba(62,232,255,0.25)', boxShadow: on ? `0 0 12px ${col}55` : 'none' }} transition={{ delay: 0.5 + i * 0.1 }}>
                <span className="text-white/85">{s.name}</span>
                <span style={{ color: on ? col : '#3ee8ff66' }}>{on ? (s.stance === 'match' ? '● EŞLEŞİYOR' : s.stance === 'conflict' ? '● ÇELİŞİYOR' : '● BİLGİ YOK') : '○ taranıyor'}</span>
              </motion.a>
            )
          })}
        </div>
      </div>

      {/* Gerekçe */}
      {phase === 'details' && (
        <motion.div className="hud-panel mt-5 w-[min(92vw,900px)] px-5 py-3" style={{ borderColor: v.color + '88' }} initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}>
          <div className="font-mono text-[10px] tracking-[0.4em]" style={{ color: v.color }}>
            GEREKÇE
          </div>
          <p className="mt-1 text-sm leading-relaxed text-white/90">{data.reason}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

const baseSources = (stances: FactCheckData['sources'][number]['stance'][]) =>
  [
    { name: 'Teyit.org', url: 'https://teyit.org' },
    { name: 'Doğruluk Payı', url: 'https://www.dogrulukpayi.com' },
    { name: 'Reuters Fact Check', url: 'https://www.reuters.com/fact-check/' },
    { name: 'AP Fact Check', url: 'https://apnews.com/hub/ap-fact-check' },
    { name: 'AFP Doğrulama', url: 'https://factcheck.afp.com' },
  ].map((s, i) => ({ ...s, stance: stances[i] }))

registerScene<FactCheckData>({
  id: 'factcheck',
  title: 'Haber doğrulama',
  category: 'Bilgi',
  tools: ['fact_check'],
  component: FactCheck,
  minDuration: 7000,
  demo: [
    {
      label: 'YALAN',
      data: { headline: 'Yarından itibaren tüm köprüler ücretsiz olacak!', outlet: 'WhatsApp zinciri', body: 'Ulaştırma Bakanlığı’nın gece yarısı yaptığı açıklamaya göre yarından itibaren İstanbul’daki tüm köprü ve otoyollar ücretsiz olacak.', verdict: 'YALAN', reason: 'Bakanlığın resmî kanallarında böyle bir açıklama yok. Teyit.org ve Doğruluk Payı iddianın 2023’ten beri dolaşan asılsız bir zincir mesaj olduğunu belgelemiş.', sources: baseSources(['conflict', 'conflict', 'neutral', 'conflict', 'conflict']) },
      say: 'Bu haber yalan efendim. Resmî bir açıklama yok; iddia yıllardır dolaşan asılsız bir zincir mesaj.',
    },
    {
      label: 'DOĞRU',
      data: { headline: 'Webb Teleskobu yeni bir ötegezegende su buharı tespit etti', outlet: 'Bilim Haberleri', body: 'NASA, James Webb Uzay Teleskobu’nun bir ötegezegenin atmosferinde su buharı izlerine rastladığını duyurdu.', verdict: 'DOGRU', reason: 'NASA’nın resmî basın bülteni ve hakemli makale ile doğrulandı; Reuters ve AP de aynı bilgiyi aktarıyor.', sources: baseSources(['match', 'match', 'match', 'match', 'neutral']) },
      say: 'Bu haber doğru efendim. NASA’nın resmî açıklaması ve hakemli bir makale ile doğrulanıyor.',
    },
    {
      label: 'YANILTICI',
      data: { headline: 'Kahve içenler 10 yıl daha uzun yaşıyor', outlet: 'Sağlık sitesi', body: 'Yeni bir araştırmaya göre günde üç fincan kahve içenler kesinlikle 10 yıl daha uzun yaşıyor.', strike: ['kesinlikle 10 yıl daha uzun yaşıyor'], verdict: 'YANILTICI', reason: 'Araştırma gerçek, ancak bulgu “ölüm riskinde küçük bir azalma” ile sınırlı ve nedensellik kanıtlanmış değil. “10 yıl” ifadesi çalışmada geçmiyor.', sources: baseSources(['match', 'conflict', 'conflict', 'neutral', 'conflict']) },
      say: 'Bu haber yanıltıcı efendim. Araştırma gerçek ama on yıl iddiası çalışmada yok.',
    },
    {
      label: 'DOĞRULANAMADI',
      data: { headline: 'Ünlü oyuncu gizlice evlendi', outlet: 'Magazin hesabı', body: 'İsimsiz bir kaynağa göre ünlü oyuncu geçen hafta sonu gizli bir törenle evlendi.', verdict: 'DOGRULANAMADI', reason: 'Tek kaynak isimsiz bir hesap; ne oyuncunun temsilcileri ne de güvenilir bir yayın organı bilgiyi doğruluyor veya yalanlıyor.', sources: baseSources(['neutral', 'neutral', 'neutral', 'neutral', 'neutral']) },
      say: 'Bunu doğrulayamadım efendim. Tek kaynak isimsiz bir hesap.',
    },
  ],
})
