/**
 * 🎬 VİDEO STÜDYOSU
 * Galeriden video seç → önizle → başlık/açıklama/etiket/gizlilik/planla → ONAY → yükle.
 * Akış: telefon → Jarvis sunucusu (ilerleme %) → YouTube. Hiçbir şey onaysız paylaşılmaz.
 * Instagram ve kurgu (kesme, birleştirme, yazı, fon müziği) sonraki adımlarda eklenecek.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { backendConfigured } from '../core/backend'
import { play } from '../core/player'
import { sfx } from '../core/sfx'
import { getStore, setStore, useJarvis } from '../core/store'

type Privacy = 'private' | 'unlisted' | 'public'
const PRIV: Record<Privacy, string> = { private: 'Gizli', unlisted: 'Liste dışı', public: 'Herkese açık' }

interface Status {
  youtube: { configured: boolean; connected: boolean }
  instagram: { configured: boolean; connected: boolean }
}

const base = () => getStore().settings.apiUrl.replace(/\/+$/, '')
const key = () => getStore().settings.apiKey

export default function VideoStudio() {
  const open = useJarvis((s) => s.studioOpen)
  const [status, setStatus] = useState<Status | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [tags, setTags] = useState('')
  const [privacy, setPrivacy] = useState<Privacy>('unlisted')
  const [when, setWhen] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'upload' | 'youtube' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ url?: string; error?: string }>({})
  const input = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  // İlerleme/sonuç değişince görünür alana kaydır
  useEffect(() => {
    if (phase !== 'idle') resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [phase])

  useEffect(() => {
    if (!open || !backendConfigured()) return
    fetch(`${base()}/api/social/status`, { headers: { 'x-jarvis-key': key() } })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [open])

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )

  const pick = (f: File | undefined) => {
    if (!f) return
    if (url) URL.revokeObjectURL(url)
    setFile(f)
    setUrl(URL.createObjectURL(f))
    setTitle((t) => t || f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 90))
    setPhase('idle')
    setResult({})
    sfx('pop')
  }

  const link = async () => {
    try {
      const r = await fetch(`${base()}/api/youtube/link`, { method: 'POST', headers: { 'x-jarvis-key': key() } })
      const j = await r.json()
      if (j.url) window.open(j.url, '_blank')
      else alert(j.error)
    } catch {
      alert('Sunucuya ulaşılamadı')
    }
  }

  const ask = () => {
    if (!file || !title.trim()) return
    setConfirm(true)
    play([{ type: 'say', text: `Videoyu YouTube'a "${title.trim()}" başlığıyla ${PRIV[privacy].toLocaleLowerCase('tr-TR')} olarak ${when ? 'planlı ' : ''}yükleyeyim mi efendim?` }, { type: 'end' }])
  }

  const publish = async () => {
    if (!file) return
    setConfirm(false)
    setPhase('upload')
    setProgress(0)
    try {
      // 1) Telefon → sunucu (ilerleme göstergeli)
      const media = await new Promise<{ id: string }>((resolve, reject) => {
        const x = new XMLHttpRequest()
        x.open('POST', `${base()}/api/media`)
        x.setRequestHeader('x-jarvis-key', key())
        x.setRequestHeader('x-file-name', encodeURIComponent(file.name))
        x.setRequestHeader('content-type', file.type || 'video/mp4')
        x.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100))
        x.onload = () => (x.status < 300 ? resolve(JSON.parse(x.responseText)) : reject(new Error(JSON.parse(x.responseText || '{}').error || `HTTP ${x.status}`)))
        x.onerror = () => reject(new Error('Bağlantı koptu'))
        x.send(file)
      })
      // 2) Sunucu → YouTube
      setPhase('youtube')
      const r = await fetch(`${base()}/api/youtube/upload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-jarvis-key': key() },
        body: JSON.stringify({ mediaId: media.id, title: title.trim(), description: desc, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), privacy, publishAt: when ? new Date(when).toISOString() : undefined }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`)
      setPhase('done')
      setResult({ url: j.url })
      play([{ type: 'state', state: 'success' }, { type: 'say', text: `Videonuz YouTube'a yüklendi efendim.${j.privacy === 'private' && privacy !== 'private' ? ' Google, onaylanmamış uygulamalardan gelen videoları şimdilik gizli tutuyor; YouTube Studio’dan bir dokunuşla yayına alabilirsiniz.' : ''}` }, { type: 'end' }])
    } catch (e) {
      setPhase('error')
      setResult({ error: (e as Error).message })
      play([{ type: 'state', state: 'error', message: (e as Error).message }, { type: 'say', text: 'Video yüklenemedi efendim.' }, { type: 'end' }])
    }
  }

  const busy = phase === 'upload' || phase === 'youtube'
  const ytReady = status?.youtube.connected

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-x-3 bottom-[84px] top-[100px] z-40 mx-auto max-w-lg sm:top-24" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
          <div className="hud-panel flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-hud-cyan/15 px-4 py-2">
              <span className="font-mono text-[11px] tracking-[0.4em] text-hud-cyan">🎬 VİDEO STÜDYOSU</span>
              <button onClick={() => setStore({ studioOpen: false })} className="hud-btn h-8 min-w-[32px] px-2 text-sm" aria-label="Kapat">
                ✕
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {!backendConfigured() && <p className="font-mono text-xs text-amber-300">Önce ⚙ Ayarlar’dan sunucu bağlantısını yapın.</p>}
              {/* Hesap durumu */}
              <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                <span className={`rounded-sm border px-2 py-1 ${ytReady ? 'border-emerald-400/50 text-emerald-300' : 'border-white/20 text-white/60'}`}>▶ YouTube {ytReady ? 'bağlı' : 'bağlı değil'}</span>
                <span className="rounded-sm border border-white/15 px-2 py-1 text-white/40">◎ Instagram · sıradaki adım</span>
                {status && !ytReady && (
                  <button onClick={link} disabled={!status.youtube.configured} className="hud-btn h-7 px-2 text-[11px] disabled:opacity-40" title={status.youtube.configured ? '' : 'Sunucuda Google anahtarları eksik (kurulum rehberi)'}>
                    YouTube’u bağla
                  </button>
                )}
              </div>
              {status && !status.youtube.configured && <p className="font-mono text-[11px] leading-relaxed text-white/50">YouTube’u bağlamak için Render’a GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET eklenmeli (rehber README’de).</p>}

              {/* Video seç */}
              <input ref={input} type="file" accept="video/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
              {!file ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-sm border-2 border-dashed border-hud-cyan/40 py-10 text-hud-cyan hover:bg-hud-cyan/5">
                  <span className="text-4xl">📁</span>
                  <span className="font-hud text-lg">Galeriden video seç</span>
                </motion.button>
              ) : (
                <div className="space-y-2">
                  <video src={url} controls playsInline className="max-h-56 w-full rounded-sm border border-hud-cyan/30 bg-black" />
                  <div className="flex justify-between font-mono text-[11px] text-white/60">
                    <span className="truncate">{file.name}</span>
                    <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <button onClick={() => input.current?.click()} disabled={busy} className="hud-btn h-8 w-full text-xs">
                    Başka video seç
                  </button>
                </div>
              )}

              {file && (
                <div className="space-y-2">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Başlık" className="w-full rounded-sm border border-hud-cyan/30 bg-black/30 px-3 py-2 font-hud text-white focus:border-hud-cyan focus:outline-none" />
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Açıklama" className="w-full rounded-sm border border-hud-cyan/30 bg-black/30 px-3 py-2 text-sm text-white focus:border-hud-cyan focus:outline-none" />
                  <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Etiketler (virgülle)" className="w-full rounded-sm border border-hud-cyan/30 bg-black/30 px-3 py-2 text-sm text-white focus:border-hud-cyan focus:outline-none" />
                  <div className="flex gap-2">
                    {(Object.keys(PRIV) as Privacy[]).map((p) => (
                      <button key={p} onClick={() => setPrivacy(p)} className={`hud-btn h-9 flex-1 text-xs ${privacy === p ? 'border-hud-cyan bg-hud-cyan/20 text-white' : ''}`}>
                        {PRIV[p]}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 font-mono text-[11px] text-white/60">
                    Planla (isteğe bağlı)
                    <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="flex-1 rounded-sm border border-hud-cyan/30 bg-black/30 px-2 py-1 text-white" />
                  </label>
                </div>
              )}

              {/* İlerleme / sonuç */}
              <div ref={resultRef} />
              {busy && (
                <div>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-hud-cyan">
                    <span>{phase === 'upload' ? 'Telefondan sunucuya yükleniyor' : 'YouTube’a gönderiliyor…'}</span>
                    {phase === 'upload' && <span>%{progress}</span>}
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-hud-cyan/10">
                    <motion.div className="h-full bg-hud-cyan shadow-[0_0_10px_#3ee8ff]" animate={phase === 'upload' ? { width: `${progress}%` } : { width: ['10%', '90%', '10%'] }} transition={phase === 'upload' ? { duration: 0.2 } : { repeat: Infinity, duration: 2 }} />
                  </div>
                </div>
              )}
              {phase === 'done' && result.url && (
                <p className="font-hud text-emerald-300">
                  ✓ Yüklendi:{' '}
                  <a href={result.url} target="_blank" rel="noreferrer" className="underline">
                    {result.url}
                  </a>
                </p>
              )}
              {phase === 'error' && <p className="font-mono text-xs text-red-300">✗ {result.error}</p>}
            </div>
            {file && (
              <div className="border-t border-hud-cyan/15 p-3">
                <button onClick={ask} disabled={busy || !title.trim() || !ytReady} className="h-11 w-full rounded-sm border border-hud-cyan bg-hud-cyan/25 font-hud text-lg text-white shadow-[0_0_14px_#3ee8ff66] disabled:opacity-40">
                  {ytReady ? 'YouTube’da paylaş' : 'Önce YouTube’u bağlayın'}
                </button>
              </div>
            )}
          </div>
          {/* Onay penceresi — paylaşım dışarıya açık bir işlem, her seferinde onay */}
          <AnimatePresence>
            {confirm && (
              <motion.div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="hud-panel w-full max-w-sm p-4" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <div className="font-mono text-[10px] tracking-[0.4em] text-amber-300">ONAY GEREKİYOR</div>
                  <p className="mt-2 font-hud text-lg text-white">
                    “{title.trim()}” YouTube’a <b>{PRIV[privacy]}</b> olarak {when ? `${new Date(when).toLocaleString('tr-TR')} tarihine planlanarak ` : ''}yüklensin mi?
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setConfirm(false)} className="hud-btn h-10 flex-1">
                      Vazgeç
                    </button>
                    <button onClick={publish} className="h-10 flex-1 rounded-sm border border-emerald-400 bg-emerald-500/20 font-hud text-white">
                      Evet, yükle
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
