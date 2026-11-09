/**
 * KURGU MOTORU — tamamen telefonda (WebCodecs, donanım hızlandırmalı), video hiçbir yere yüklenmez.
 *  1) Klipler Mediabunny ile çözülür (CanvasSink: çıktı boyutuna "cover" ölçeklenmiş kareler)
 *  2) Her çıktı karesi tuvale çizilir: zoom/Ken Burns, vuruş darbesi, sarsıntı, RGB kayması, flaş,
 *     renk (sıcak vlog / karanlık phonk), vinyet, yazılar, bitiş kararması, çapraz geçişler
 *  3) Ses: orijinal sesin seçilen bölümleri (hız ayarlı) + müzik tek bir mikste birleştirilir
 *  4) H.264 + AAC MP4 olarak kodlanır (desteklenmezse VP9/Opus WebM)
 */
import {
  ALL_FORMATS,
  AudioBufferSink,
  AudioBufferSource,
  BlobSource,
  BufferTarget,
  CanvasSink,
  CanvasSource,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
  canEncodeAudio,
  canEncodeVideo,
  type InputAudioTrack,
  type InputVideoTrack,
  type WrappedCanvas,
} from 'mediabunny'
import { activeAt, type Aspect, type Plan } from './plan'

export interface SourceClip {
  file: File
  name: string
  input: Input
  video: InputVideoTrack
  audio: InputAudioTrack | null
  duration: number
  width: number
  height: number
}

export async function loadClip(file: File): Promise<SourceClip> {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  const video = await input.getPrimaryVideoTrack()
  if (!video) throw new Error(`${file.name}: video izi bulunamadı`)
  if (!(await video.canDecode())) throw new Error(`${file.name}: bu cihaz bu videoyu çözemiyor`)
  const audio = await input.getPrimaryAudioTrack()
  const duration = await input.computeDuration()
  return { file, name: file.name, input, video, audio: audio && (await audio.canDecode()) ? audio : null, duration, width: await video.getDisplayWidth(), height: await video.getDisplayHeight() }
}

export function outputSize(aspect: Aspect, long = 1280): { w: number; h: number } {
  const short = Math.round((long * 9) / 16 / 2) * 2
  if (aspect === '9:16') return { w: short, h: long }
  if (aspect === '16:9') return { w: long, h: short }
  return { w: short, h: short }
}

export interface RenderOptions {
  aspect: Aspect
  music: AudioBuffer | null
  fps?: number
  onProgress?: (p: number, label: string) => void
  signal?: AbortSignal
}

const FPS = 30
const AUDIO_SR = 48000

// ------------------------------------------------------------------- SES MİKSİ
async function mixAudio(plan: Plan, clips: SourceClip[], music: AudioBuffer | null, signal?: AbortSignal): Promise<AudioBuffer> {
  const len = Math.ceil(plan.duration * AUDIO_SR)
  const ctx = new OfflineAudioContext(2, Math.max(1, len), AUDIO_SR)
  const out = ctx.createGain()
  out.connect(ctx.destination)
  // Bitiş kararması
  out.gain.setValueAtTime(1, Math.max(0, plan.duration - plan.fadeOut))
  out.gain.linearRampToValueAtTime(0, plan.duration)

  if (plan.originalVolume > 0) {
    for (const seg of plan.segments) {
      if (signal?.aborted) throw new DOMException('İptal', 'AbortError')
      const clip = clips[seg.clip]
      if (!clip.audio) continue
      const srcEnd = seg.srcStart + seg.outDur * seg.speed
      const g = ctx.createGain()
      const fade = Math.max(0.02, seg.fadeIn)
      g.gain.setValueAtTime(0, seg.outStart)
      g.gain.linearRampToValueAtTime(plan.originalVolume, seg.outStart + fade)
      g.gain.setValueAtTime(plan.originalVolume, seg.outStart + seg.outDur - 0.03)
      g.gain.linearRampToValueAtTime(0, seg.outStart + seg.outDur)
      g.connect(out)
      const sink = new AudioBufferSink(clip.audio)
      for await (const w of sink.buffers(seg.srcStart, srcEnd)) {
        const src = ctx.createBufferSource()
        src.buffer = w.buffer
        src.playbackRate.value = seg.speed
        const offset = Math.max(0, seg.srcStart - w.timestamp)
        const when = seg.outStart + Math.max(0, w.timestamp - seg.srcStart) / seg.speed
        src.connect(g)
        src.start(when, offset)
        src.stop(Math.min(seg.outStart + seg.outDur, when + (w.duration - offset) / seg.speed + 0.01))
      }
    }
  }
  if (music && plan.musicVolume > 0) {
    const src = ctx.createBufferSource()
    src.buffer = music
    src.loop = music.duration < plan.duration
    const g = ctx.createGain()
    g.gain.value = plan.musicVolume
    src.connect(g).connect(out)
    src.start(0)
  }
  return ctx.startRendering()
}

// ----------------------------------------------------------------- GÖRÜNTÜ
function drawFrame(ctx: CanvasRenderingContext2D, plan: Plan, t: number, frames: Map<number, WrappedCanvas>, W: number, H: number) {
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  const act = activeAt(plan, t)
  for (const a of act) {
    const fr = frames.get(plan.segments.indexOf(a.seg))
    if (!fr) continue
    const { fx } = a.seg
    const p = a.seg.outDur > 0 ? a.local / a.seg.outDur : 0
    let zoom = fx.zoomFrom + (fx.zoomTo - fx.zoomFrom) * p
    if (fx.punch && a.local < 0.14) zoom += fx.punch * (1 - a.local / 0.14) ** 2
    let dx = 0
    let dy = 0
    if (fx.shake) {
      const k = a.local < 0.3 ? 1 - a.local / 0.3 : 0.25
      dx = (Math.sin(t * 91) + Math.sin(t * 57)) * fx.shake * W * k
      dy = (Math.cos(t * 83) + Math.sin(t * 41)) * fx.shake * H * k
    }
    const dw = W * zoom
    const dh = H * zoom
    const x = (W - dw) / 2 + dx
    const y = (H - dh) / 2 + dy
    ctx.globalAlpha = a.alpha
    ctx.drawImage(fr.canvas as CanvasImageSource, x, y, dw, dh)
    // RGB kayması: kaydırılmış "hayalet" kopyalar
    if (fx.rgb && a.local < 0.35) {
      const o = fx.rgb * W * (1 - a.local / 0.35)
      ctx.globalAlpha = 0.35 * a.alpha
      ctx.globalCompositeOperation = 'screen'
      ctx.drawImage(fr.canvas as CanvasImageSource, x - o, y, dw, dh)
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = 'rgba(255,0,80,0.25)'
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'screen'
      ctx.drawImage(fr.canvas as CanvasImageSource, x + o, y, dw, dh)
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.globalAlpha = 1
  }

  // Renk düzenleme (ctx.filter Safari'de yok → karıştırma modlarıyla)
  if (plan.grade === 'warm') {
    ctx.globalCompositeOperation = 'soft-light'
    ctx.fillStyle = 'rgba(255,170,90,0.35)'
    ctx.fillRect(0, 0, W, H)
  } else if (plan.grade === 'phonk') {
    ctx.globalCompositeOperation = 'saturation'
    ctx.globalAlpha = 0.7
    ctx.fillStyle = 'hsl(0,0%,50%)'
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'overlay'
    ctx.fillStyle = 'rgba(20,40,70,0.55)'
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(200,210,230,1)'
    ctx.fillRect(0, 0, W, H)
  }
  ctx.globalCompositeOperation = 'source-over'
  // Vinyet
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, plan.grade === 'phonk' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.35)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)

  // Flaş
  for (const a of act)
    if (a.seg.fx.flash && a.local < 0.12) {
      ctx.fillStyle = `rgba(255,255,255,${0.85 * (1 - a.local / 0.12)})`
      ctx.fillRect(0, 0, W, H)
    }

  // Yazılar
  for (const c of plan.texts) {
    if (t < c.start || t > c.start + c.dur) continue
    const lt = t - c.start
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (c.style === 'title') {
      const a = Math.min(1, lt / 0.5, (c.dur - lt) / 0.5)
      ctx.globalAlpha = Math.max(0, a)
      ctx.fillStyle = '#fff'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 18
      ctx.font = `600 ${Math.round(Math.min(W, H) * 0.085)}px Rajdhani, system-ui, sans-serif`
      ctx.fillText(c.text, W / 2, H * 0.8 - (1 - a) * 20)
      if (c.sub) {
        ctx.font = `400 ${Math.round(Math.min(W, H) * 0.04)}px "Share Tech Mono", monospace`
        ctx.fillStyle = 'rgba(255,230,200,0.95)'
        ctx.fillText(c.sub.toLocaleUpperCase('tr-TR'), W / 2, H * 0.8 + Math.min(W, H) * 0.07)
      }
      ctx.shadowBlur = 0
    } else {
      // Phonk flaş yazı: yanıp sönen, glitch kaydırmalı
      if (Math.floor(lt * 12) % 3 === 2) continue
      const size = Math.round(Math.min(W, H) * 0.16)
      ctx.font = `900 ${size}px Rajdhani, Impact, sans-serif`
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(255,0,80,0.8)'
      ctx.fillText(c.text, W / 2 - 6, H / 2)
      ctx.fillStyle = 'rgba(0,240,255,0.8)'
      ctx.fillText(c.text, W / 2 + 6, H / 2)
      ctx.fillStyle = '#fff'
      ctx.fillText(c.text, W / 2, H / 2)
    }
    ctx.globalAlpha = 1
  }
  // Bitiş kararması
  if (t > plan.duration - plan.fadeOut) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (t - (plan.duration - plan.fadeOut)) / plan.fadeOut)})`
    ctx.fillRect(0, 0, W, H)
  }
}

/** Planı videoya dönüştür; sonuç Blob (MP4 ya da WebM) */
export async function renderPlan(plan: Plan, clips: SourceClip[], o: RenderOptions): Promise<{ blob: Blob; mime: string; ext: string; hasAudio: boolean }> {
  const fps = o.fps ?? FPS
  const { w: W, h: H } = outputSize(o.aspect)
  const progress = o.onProgress ?? (() => {})

  // Kodek seçimi: MP4/H.264 (iPhone galerisi için ideal), yoksa WebM/VP9
  const useMp4 = await canEncodeVideo('avc', { width: W, height: H })
  const vCodec = useMp4 ? 'avc' : 'vp9'
  // Ses: MP4'te önce AAC, yoksa Opus (MP4 içinde geçerli); WebM'de Opus
  const aCodec = useMp4 && (await canEncodeAudio('aac')) ? 'aac' : (await canEncodeAudio('opus')) ? 'opus' : null
  if (!useMp4 && !(await canEncodeVideo('vp9', { width: W, height: H }))) throw new Error('Bu cihaz video kodlamayı desteklemiyor (WebCodecs).')

  progress(0.02, 'Ses miksleniyor')
  const audio = aCodec ? await mixAudio(plan, clips, o.music, o.signal) : null

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const output = new Output({ format: useMp4 ? new Mp4OutputFormat({ fastStart: 'in-memory' }) : new WebMOutputFormat(), target: new BufferTarget() })
  const vSource = new CanvasSource(canvas, { codec: vCodec, bitrate: QUALITY_HIGH, keyFrameInterval: 2 })
  output.addVideoTrack(vSource, { frameRate: fps })
  let aSource: AudioBufferSource | null = null
  if (audio && aCodec) {
    aSource = new AudioBufferSource({ codec: aCodec, bitrate: 160_000 })
    output.addAudioTrack(aSource)
  }
  await output.start()
  if (aSource && audio) await aSource.add(audio)

  // Her klip için çıktı boyutuna ölçekli kare kaynağı
  const sinks = clips.map((c) => new CanvasSink(c.video, { width: W, height: H, fit: 'cover', poolSize: 3 }))
  // Segment başına sıralı kare üreticileri (çözümleme sırayla, verimli)
  const gens = new Map<number, { it: AsyncGenerator<WrappedCanvas | null>; k: number; last: WrappedCanvas | null }>()
  const frames = new Map<number, WrappedCanvas>()
  const total = Math.ceil(plan.duration * fps)

  try {
    for (let f = 0; f < total; f++) {
      if (o.signal?.aborted) throw new DOMException('İptal', 'AbortError')
      const t = f / fps
      const act = activeAt(plan, t)
      const live = new Set<number>()
      for (const a of act) {
        const idx = plan.segments.indexOf(a.seg)
        live.add(idx)
        let g = gens.get(idx)
        if (!g) {
          const n = Math.ceil(a.seg.outDur * fps) + 2
          const times = Array.from({ length: n }, (_, k) => Math.min(clips[a.seg.clip].duration - 0.001, a.seg.srcStart + (k / fps) * a.seg.speed))
          g = { it: sinks[a.seg.clip].canvasesAtTimestamps(times), k: -1, last: null }
          gens.set(idx, g)
        }
        const want = Math.round(a.local * fps)
        while (g.k < want) {
          const r = await g.it.next()
          g.k++
          if (r.done) break
          if (r.value) g.last = r.value
        }
        if (g.last) frames.set(idx, g.last)
      }
      // Biten segmentlerin üreticilerini kapat
      for (const [idx, g] of gens)
        if (!live.has(idx)) {
          await g.it.return(undefined)
          gens.delete(idx)
          frames.delete(idx)
        }
      drawFrame(ctx, plan, t, frames, W, H)
      await vSource.add(t, 1 / fps)
      if (f % 15 === 0) progress(0.05 + 0.93 * (f / total), 'Kareler işleniyor')
    }
    progress(0.99, 'Dosya hazırlanıyor')
    await output.finalize()
  } catch (e) {
    await output.cancel().catch(() => {})
    throw e
  }
  const buf = (output.target as BufferTarget).buffer!
  const mime = useMp4 ? 'video/mp4' : 'video/webm'
  progress(1, 'Bitti')
  return { blob: new Blob([buf], { type: mime }), mime, ext: useMp4 ? 'mp4' : 'webm', hasAudio: !!aSource }
}
