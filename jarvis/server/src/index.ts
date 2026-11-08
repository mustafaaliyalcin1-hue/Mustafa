/**
 * J.A.R.V.I.S. backend — HTTP sunucusu
 *   GET  /health          servis durumu (açılış ekranındaki ✓ işaretleri buradan gelir)
 *   POST /api/chat        { text, conversationId } → SSE ile JarvisEvent akışı
 *   POST /api/tts         { text } → ElevenLabs MP3 (yoksa 204: tarayıcı TTS'i kullanılır)
 *   POST /cron/tick       zamanlanmış görevler (hatırlatıcı, sabah brifingi) — dış cron servisi çağırır
 * Tüm /api ve /cron uçları "x-jarvis-key" başlığında JARVIS_APP_SECRET ister.
 */
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { describeError, resetConversation, runAgent } from './agent.ts'
import { config, services } from './config.ts'
import type { JarvisEvent } from './events.ts'

const app = Fastify({ logger: { level: 'info' } })

await app.register(cors, {
  origin: config.allowedOrigins.length ? config.allowedOrigins : true,
  allowedHeaders: ['content-type', 'x-jarvis-key'],
})

// --- basit kimlik doğrulama + hız sınırı
const hits = new Map<string, number[]>()
app.addHook('onRequest', async (req, reply) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/cron')) return
  if (!config.appSecret) return reply.code(500).send({ error: 'Sunucuda JARVIS_APP_SECRET tanımlı değil' })
  if (req.headers['x-jarvis-key'] !== config.appSecret) return reply.code(401).send({ error: 'Yetkisiz' })
  const now = Date.now()
  const arr = (hits.get(req.ip) || []).filter((t) => now - t < 60_000)
  arr.push(now)
  hits.set(req.ip, arr)
  if (arr.length > 30) return reply.code(429).send({ error: 'Çok fazla istek, biraz bekleyin efendim' })
})

app.get('/health', async () => ({ ok: true, services, model: config.model, time: new Date().toISOString() }))

app.post<{ Body: { text?: string; conversationId?: string } }>('/api/chat', async (req, reply) => {
  const text = (req.body?.text || '').toString().slice(0, 4000).trim()
  const conversationId = (req.body?.conversationId || 'default').toString().slice(0, 64)
  if (!text) return reply.code(400).send({ error: 'Boş mesaj' })

  reply.hijack()
  const res = reply.raw
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
    'access-control-allow-origin': (req.headers.origin as string) || '*',
  })
  const emit = (e: JarvisEvent) => res.write(`data: ${JSON.stringify(e)}\n\n`)
  const ping = setInterval(() => res.write(': ping\n\n'), 15_000)
  const ac = new AbortController()
  res.on('close', () => ac.abort())

  try {
    if (!services.ai) throw new Error('Sunucuda ANTHROPIC_API_KEY tanımlı değil.')
    await runAgent(conversationId, text, emit, ac.signal)
  } catch (err) {
    if (!ac.signal.aborted) {
      req.log.error(err)
      resetConversation(conversationId)
      emit({ type: 'state', state: 'error', message: describeError(err) })
      emit({ type: 'say', text: 'Üzgünüm efendim, bir sorun oluştu.' })
    }
  } finally {
    clearInterval(ping)
    if (!res.writableEnded) {
      emit({ type: 'end' })
      res.end()
    }
  }
})

app.post<{ Body: { text?: string } }>('/api/tts', async (req, reply) => {
  const text = (req.body?.text || '').toString().slice(0, 1200)
  if (!services.tts || !text) return reply.code(204).send()
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.elevenVoice}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'xi-api-key': config.elevenKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.25 } }),
    signal: AbortSignal.timeout(20_000),
  }).catch(() => null)
  if (!r?.ok) {
    req.log.warn(`ElevenLabs hatası: ${r?.status}`)
    return reply.code(204).send() // arayüz tarayıcı sesine düşer
  }
  reply.header('content-type', 'audio/mpeg')
  return reply.send(Buffer.from(await r.arrayBuffer()))
})

// Dış cron servisi (cron-job.org) her birkaç dakikada çağırır:
// hem sunucuyu uyanık tutar hem de zamanı gelen görevleri çalıştırır (7. aşamada dolacak).
app.post('/cron/tick', async () => ({ ok: true, ran: [] as string[] }))

app.listen({ port: config.port, host: '0.0.0.0' }).then(() => {
  app.log.info(`J.A.R.V.I.S. çevrimiçi → :${config.port} · AI:${services.ai ? '✓' : '✗'} · TTS:${services.tts ? '✓' : '✗'}`)
})
