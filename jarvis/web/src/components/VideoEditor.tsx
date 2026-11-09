/**
 * 🎞 KURGU STÜDYOSU — günlük vlog ya da phonk edit, tamamen telefonda.
 * Klipleri seç → tarz / oran / süre / müzik / başlık → "Kurguyu başlat" → önizle → galeriye kaydet.
 * Video hiçbir sunucuya yüklenmez; telefonun donanım hızlandırmalı kodlayıcısı kullanılır.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { detectBeats } from '../editor/beats'
import { generateLofi, generatePhonk, loadMusicFile, type Track } from '../editor/music'
import { makePlan, type Aspect, type Style } from '../editor/plan'
import { loadClip, renderPlan, type SourceClip } from '../editor/render'
import { play } from '../core/player'
import { sfx } from '../core/sfx'
import { setStore, useJarvis } from '../core/store'

type Music = 'auto' | 'file' | 'original'
const LENGTHS: { label: string; v?: number }[] = [{ label: '15 sn', v: 15 }, { label: '30 sn', v: 30 }, { label: '60 sn', v: 60 }, { label: 'Otomatik' }]

export default function VideoEditor() {
  const open = useJarvis((s) => s.editorOpen)
  const preset = useJarvis((s) => s.editorStyle)
  const [clips, setClips] = useState<SourceClip[]>([])
  const [loading, setLoading] = useState(false)
  const [style, setStyle] = useState<Style>('vlog')
  const [aspect, setAspect] = useState<Aspect>('9:16')
  const [len, setLen] = useState<number | undefined>(undefined)
  const [music, setMusic] = useState<Music>('auto')
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [phase, setPhase] = useState<'idle' | 'work' | 'done' | 'error'>('idle')
  const [prog, setProg] = useState({ p: 0, label: '' })
  const [out, setOut] = useState<{ url: string; blob: Blob; ext: string; hasAudio: boolean } | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (phase === 'done' || phase === 'error') setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }, [phase])
  const [err, setErr] = useState('')
  const abort = useRef<AbortController | null>(null)
  const pickRef = useRef<HTMLInputElement>(null)
  const musicRef = useRef<HTMLInputElement>(null)

  // Sesli komutla açılırken tarz ön seçimi ("phonk edit yap")
  useEffect(() => {
    if (open && preset) setStyle(preset)
  }, [open, preset])
  useEffect(() => {
    if (style === 'phonk' && len === undefined) setLen(15)
  }, [style]) // eslint-disable-line react-hooks/exhaustive-deps

  const addClips = async (files: FileList | null) => {
    if (!files?.length) return
    setLoading(true)
    setErr('')
    try {
      const loaded: SourceClip[] = []
      for (const f of Array.from(files)) loaded.push(await loadClip(f))
      setClips((c) => [...c, ...loaded])
      sfx('pop')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const totalDur = clips.reduce((s, c) => s + c.duration, 0)

  const start = async () => {
    if (!clips.length) return
    setPhase('work')
    setErr('')
    if (out) URL.revokeObjectURL(out.url)
    setOut(null)
    const ac = new AbortController()
    abort.current = ac
    play([{ type: 'say', text: style === 'phonk' ? 'Phonk edit hazırlanıyor efendim. Vuruşlara göre kesiyorum.' : 'Vlog kurgusu hazırlanıyor efendim.' }, { type: 'end' }])
    try {
      setProg({ p: 0.01, label: 'Müzik hazırlanıyor' })
      const roughLen = len ?? (style === 'phonk' ? 15 : Math.min(totalDur, totalDur <= 45 ? totalDur : Math.max(30, Math.min(180, totalDur * 0.35))))
      let track: Track | null = null
      if (music === 'file' && musicFile) track = await loadMusicFile(musicFile, (s, sr) => detectBeats(s, sr, 90))
      else if (music === 'auto') track = style === 'phonk' ? await generatePhonk(roughLen + 2) : await generateLofi(roughLen + 2)
      const plan = makePlan(
        clips.map((c) => ({ duration: c.duration })),
        { style, target: len, beats: track?.beats, bpm: track?.bpm, title: title.trim() || (style === 'vlog' ? 'Günlük Vlog' : undefined), date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), hasMusic: !!track },
      )
      const r = await renderPlan(plan, clips, { aspect, music: track?.buffer ?? null, signal: ac.signal, onProgress: (p, label) => setProg({ p, label }) })
      setOut({ url: URL.createObjectURL(r.blob), blob: r.blob, ext: r.ext, hasAudio: r.hasAudio })
      setPhase('done')
      play([{ type: 'state', state: 'success' }, { type: 'say', text: `Kurgu hazır efendim; ${Math.round(plan.duration)} saniyelik bir ${style === 'phonk' ? 'phonk edit' : 'vlog'}. İzleyip galerinize kaydedebilirsiniz.` }, { type: 'end' }])
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        setPhase('idle')
        return
      }
      setErr((e as Error).message)
      setPhase('error')
      play([{ type: 'state', state: 'error', message: (e as Error).message }, { type: 'end' }])
    }
  }

  const save = async () => {
    if (!out) return
    const file = new File([out.blob], `jarvis-${style}-${Date.now()}.${out.ext}`, { type: out.blob.type })
    // iPhone: paylaşım sayfasından "Videoyu Kaydet" ile galeriye
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Jarvis kurgusu' })
        return
      } catch {
        /* vazgeçildi → indirme */
      }
    }
    const a = document.createElement('a')
    a.href = out.url
    a.download = file.name
    a.click()
  }

  const Chip = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} disabled={phase === 'work'} className={`hud-btn h-9 flex-1 px-2 text-xs ${on ? 'border-hud-cyan bg-hud-cyan/20 text-white' : ''}`}>
      {children}
    </button>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-x-3 bottom-[84px] top-[100px] z-40 mx-auto max-w-lg sm:top-24" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
          <div className="hud-panel flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-hud-cyan/15 px-4 py-2">
              <span className="font-mono text-[11px] tracking-[0.4em] text-hud-cyan">🎞 KURGU STÜDYOSU</span>
              <button onClick={() => (abort.current?.abort(), setStore({ editorOpen: false }))} className="hud-btn h-8 min-w-[32px] px-2 text-sm" aria-label="Kapat">
                ✕
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {/* Tarz */}
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['vlog', '🎬', 'Günlük Vlog', 'Akıcı geçişler, sıcak renk, başlık, lo-fi müzik'],
                    ['phonk', '🔥', 'Phonk Edit', 'Vuruşa kesme, zoom darbesi, flaş, sarsıntı'],
                  ] as const
                ).map(([k, icon, name, d]) => (
                  <motion.button key={k} whileTap={{ scale: 0.97 }} disabled={phase === 'work'} onClick={() => setStyle(k)} className={`rounded-sm border p-3 text-left transition ${style === k ? (k === 'phonk' ? 'border-fuchsia-400 bg-fuchsia-500/15' : 'border-amber-300 bg-amber-400/10') : 'border-white/10 bg-white/5'}`}>
                    <div className="text-2xl">{icon}</div>
                    <div className="font-hud text-base text-white">{name}</div>
                    <div className="font-mono text-[10px] leading-snug text-white/50">{d}</div>
                  </motion.button>
                ))}
              </div>

              {/* Klipler */}
              <input ref={pickRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => (addClips(e.target.files), (e.target.value = ''))} />
              <div className="space-y-1.5">
                {clips.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-sm border border-hud-cyan/20 bg-black/30 px-3 py-1.5 font-mono text-[11px] text-white/80">
                    <span className="truncate">
                      {i + 1}. {c.name}
                    </span>
                    <span className="flex items-center gap-2">
                      {Math.floor(c.duration / 60)}:{String(Math.round(c.duration % 60)).padStart(2, '0')}
                      <button disabled={phase === 'work'} onClick={() => setClips((cs) => cs.filter((_, j) => j !== i))} className="text-red-300">
                        ✕
                      </button>
                    </span>
                  </div>
                ))}
                <motion.button whileTap={{ scale: 0.97 }} disabled={loading || phase === 'work'} onClick={() => pickRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-dashed border-hud-cyan/40 py-4 font-hud text-hud-cyan hover:bg-hud-cyan/5">
                  {loading ? 'Klipler okunuyor…' : clips.length ? '＋ Klip ekle' : '📁 Galeriden klipleri seç'}
                </motion.button>
                {clips.length > 0 && <div className="text-right font-mono text-[10px] text-white/40">Toplam {Math.round(totalDur)} sn · {clips.length} klip</div>}
              </div>

              {/* Ayarlar */}
              <div className="space-y-2">
                <div className="font-mono text-[10px] tracking-[0.3em] text-hud-cyan/70">ORAN</div>
                <div className="flex gap-2">
                  {(['9:16', '16:9', '1:1'] as Aspect[]).map((a) => (
                    <Chip key={a} on={aspect === a} onClick={() => setAspect(a)}>
                      {a === '9:16' ? '9:16 Reels' : a === '16:9' ? '16:9 YouTube' : '1:1 Kare'}
                    </Chip>
                  ))}
                </div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-hud-cyan/70">UZUNLUK</div>
                <div className="flex gap-2">
                  {LENGTHS.map((l) => (
                    <Chip key={l.label} on={len === l.v} onClick={() => setLen(l.v)}>
                      {l.label}
                    </Chip>
                  ))}
                </div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-hud-cyan/70">MÜZİK</div>
                <div className="flex gap-2">
                  <Chip on={music === 'auto'} onClick={() => setMusic('auto')}>
                    {style === 'phonk' ? 'Jarvis phonk' : 'Jarvis lo-fi'}
                  </Chip>
                  <Chip on={music === 'file'} onClick={() => (setMusic('file'), musicRef.current?.click())}>
                    {musicFile ? '♪ ' + musicFile.name.slice(0, 10) : 'Kendi müziğim'}
                  </Chip>
                  <Chip on={music === 'original'} onClick={() => setMusic('original')}>
                    Orijinal ses
                  </Chip>
                </div>
                <input ref={musicRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setMusicFile(e.target.files[0])} />
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} disabled={phase === 'work'} placeholder={style === 'vlog' ? 'Başlık (ör. Kapadokya Günlüğü)' : 'Flaş yazı (isteğe bağlı, ör. KAPADOKYA)'} className="w-full rounded-sm border border-hud-cyan/30 bg-black/30 px-3 py-2 font-hud text-white focus:border-hud-cyan focus:outline-none" />
              </div>

              {/* İlerleme */}
              {phase === 'work' && (
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-hud-cyan">
                    <span>{prog.label}</span>
                    <span>%{Math.round(prog.p * 100)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-hud-cyan/10">
                    <motion.div className={`h-full ${style === 'phonk' ? 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]' : 'bg-hud-cyan shadow-[0_0_10px_#3ee8ff]'}`} animate={{ width: `${prog.p * 100}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="font-mono text-[10px] text-white/40">Ekranı kapatmayın; kurgu telefonunuzda yapılıyor.</p>
                </div>
              )}
              {phase === 'error' && <p className="font-mono text-xs text-red-300">✗ {err}</p>}
              {err && phase === 'idle' && <p className="font-mono text-xs text-red-300">✗ {err}</p>}
              <div ref={resultRef} />
              {phase === 'done' && out && (
                <div className="space-y-2">
                  {!out.hasAudio && <p className="font-mono text-[11px] text-amber-300">Bu cihaz tarayıcıda ses kodlamayı desteklemiyor; video sessiz kaydedildi.</p>}
                  <video src={out.url} controls playsInline autoPlay className="max-h-72 w-full rounded-sm border border-hud-cyan/40 bg-black" />
                  <button onClick={save} className="h-10 w-full rounded-sm border border-emerald-400 bg-emerald-500/20 font-hud text-white">
                    ⬇ Galeriye kaydet / paylaş
                  </button>
                </div>
              )}
            </div>
            <div className="border-t border-hud-cyan/15 p-3">
              {phase === 'work' ? (
                <button onClick={() => abort.current?.abort()} className="hud-btn h-11 w-full">
                  İptal
                </button>
              ) : (
                <button onClick={start} disabled={!clips.length || (music === 'file' && !musicFile)} className={`h-11 w-full rounded-sm border font-hud text-lg text-white disabled:opacity-40 ${style === 'phonk' ? 'border-fuchsia-400 bg-fuchsia-500/25 shadow-[0_0_14px_#e879f966]' : 'border-hud-cyan bg-hud-cyan/25 shadow-[0_0_14px_#3ee8ff66]'}`}>
                  {phase === 'done' ? 'Yeniden kurgula' : style === 'phonk' ? '🔥 Phonk edit yap' : '🎬 Vlog kurgusu yap'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
