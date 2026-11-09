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
import { config, provider, services } from './config.ts'
import { AllBrainsBusy, brainStatus, rememberTurn, resetFreeConversation, runFreeBrains } from './brains.ts'
import { tryLocal } from './intents/index.ts'
import { isFactCheck } from './intents/text.ts'
import { UA } from './tools/http.ts'
import { randomUUID } from 'node:crypto'
import type { Readable } from 'node:stream'
import { saveUpload } from './social/media.ts'
import { authUrl, exchangeCode, uploadVideo, youtubeConfigured, youtubeConnected } from './social/youtube.ts'
import { claudeVision } from './vision.ts'
import { currentGeminiModel, describeGeminiError, geminiVision, warmUpGemini } from './gemini.ts'
import type { JarvisEvent } from './events.ts'

const app = Fastify({ logger: { level: 'info' } })

await app.register(cors, {
  origin: config.allowedOrigins.length ? config.allowedOrigins : true,
  allowedHeaders: ['content-type', 'x-jarvis-key', 'x-file-name'],
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

// ---------------------------------------------------------------- VİDEO / SOSYAL MEDYA
// Video dosyası ham akış olarak gelir (çok parçalı form yok): x-file-name başlığında ad
app.addContentTypeParser(/^(video\/|application\/octet-stream)/, (_req, payload, done) => done(null, payload))

app.post('/api/media', async (req, reply) => {
  const name = decodeURIComponent((req.headers['x-file-name'] as string) || 'video.mp4')
  const mime = (req.headers['content-type'] as string) || 'video/mp4'
  if (!/^video\//.test(mime) && mime !== 'application/octet-stream') return reply.code(415).send({ error: 'Yalnızca video yüklenebilir' })
  try {
    const f = await saveUpload(req.body as Readable, name, mime)
    return { id: f.id, size: f.size, name: f.name }
  } catch (e) {
    return reply.code(413).send({ error: (e as Error).message })
  }
})

app.get('/api/social/status', async () => ({
  youtube: { configured: youtubeConfigured(), connected: youtubeConnected() },
  instagram: { configured: false, connected: false },
}))

// Google bağlantısı: tek kullanımlık durum kodu (gizli anahtar adreste görünmesin)
const oauthStates = new Map<string, number>()
app.post('/api/youtube/link', async (_req, reply) => {
  if (!youtubeConfigured()) return reply.code(400).send({ error: 'Sunucuda GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET tanımlı değil (kurulum rehberine bakın).' })
  const state = randomUUID()
  oauthStates.set(state, Date.now() + 10 * 60_000)
  return { url: authUrl(state) }
})

app.get<{ Querystring: { code?: string; state?: string; error?: string } }>('/oauth/google/callback', async (req, reply) => {
  const { code, state, error } = req.query
  const page = (title: string, body: string) =>
    reply.type('text/html; charset=utf-8').send(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>J.A.R.V.I.S.</title><body style="background:#020814;color:#e6faff;font-family:system-ui;padding:24px;line-height:1.5"><h2 style="color:#3ee8ff">${title}</h2>${body}</body>`)
  const until = state ? oauthStates.get(state) : undefined
  if (state) oauthStates.delete(state)
  if (error) return page('Bağlantı iptal edildi', `<p>Google: ${error}</p>`)
  if (!code || !until || until < Date.now()) return page('Bağlantı geçersiz', '<p>Bağlantının süresi dolmuş. Jarvis’ten tekrar “YouTube’u bağla” deyin.</p>')
  try {
    const rt = await exchangeCode(code)
    const persist = config.youtubeRefreshToken
      ? '<p>Bağlantı kaydedildi.</p>'
      : `<p><b>Son adım (kalıcı olması için):</b> Render → jarvis-server → Environment → <b>Add</b> → anahtar adı <code>YOUTUBE_REFRESH_TOKEN</code>, değer aşağıdaki metin → Save.</p><textarea readonly style="width:100%;height:90px;background:#041325;color:#3ee8ff;border:1px solid #3ee8ff55;padding:8px" onclick="this.select()">${rt}</textarea><p style="opacity:.7">Bu metni kimseyle paylaşmayın. Sunucu yeniden başlarsa bağlantı bu değerle korunur.</p>`
    return page('YouTube bağlandı ✓', `${persist}<p>Bu sekmeyi kapatıp Jarvis’e dönebilirsiniz.</p>`)
  } catch (e) {
    return page('Bağlantı başarısız', `<p>${(e as Error).message}</p>`)
  }
})

app.post<{ Body: { mediaId?: string; title?: string; description?: string; tags?: string[]; privacy?: 'private' | 'unlisted' | 'public'; publishAt?: string } }>('/api/youtube/upload', async (req, reply) => {
  const b = req.body || {}
  if (!b.mediaId || !b.title) return reply.code(400).send({ error: 'Video ve başlık gerekli' })
  try {
    return await uploadVideo({ mediaId: b.mediaId, title: b.title, description: b.description, tags: b.tags, privacy: b.privacy || 'private', publishAt: b.publishAt })
  } catch (e) {
    req.log.error(e)
    return reply.code(502).send({ error: (e as Error).message })
  }
})

// ------------------------------------------------------------- GÖRSEL ANALİZ
// Kamera/galeri fotoğrafı: { image: "data:image/jpeg;base64,...", question? } → açıklama + nesne kutuları
app.post<{ Body: { image?: string; question?: string } }>('/api/vision', { bodyLimit: 12 * 1024 * 1024 }, async (req, reply) => {
  const m = (req.body?.image || '').match(/^data:(image\/[a-z+]+);base64,(.+)$/)
  if (!m) return reply.code(400).send({ error: 'Görsel gerekli' })
  const question = (req.body?.question || '').slice(0, 500)
  try {
    if (config.geminiKey) return await geminiVision(m[2], m[1], question)
    if (config.anthropicKey) return await claudeVision(m[2], m[1], question)
    return reply.code(503).send({ error: 'Görsel analiz için yapay zekâ anahtarı yok' })
  } catch (e) {
    req.log.error(e)
    return reply.code(502).send({ error: describeGeminiError(e) ?? (e as Error).message })
  }
})

app.get('/health', async () => ({ ok: true, services, model: provider === 'free' ? currentGeminiModel() : config.model, brains: provider === 'free' ? brainStatus() : undefined, time: new Date().toISOString() }))

/**
 * TEŞHİS: veri kaynaklarına sunucudan ulaşılabiliyor mu? (tarayıcıda açılır, gizli bilgi içermez)
 * Sonuç 60 sn önbelleklenir.
 */
let diagCache: { at: number; data: unknown } | null = null
app.get('/diag', async () => {
  if (diagCache && Date.now() - diagCache.at < 60_000) return diagCache.data
  const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
  const from = ymd(new Date(Date.now() - 21 * 864e5))
  const to = ymd(new Date(Date.now() + 21 * 864e5))
  const checks: [string, string, (body: string) => string][] = [
    ['espn_aralik', `https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard?dates=${ymd(new Date(Date.now() - 7 * 864e5))}-${ymd(new Date())}`, (b) => `${(JSON.parse(b).events || []).length} maç`],
    ['espn_gun', `https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard?dates=${ymd(new Date(Date.now() - 864e5))}`, (b) => `${(JSON.parse(b).events || []).length} maç`],
    ['espn_fb_fikstur', 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/schedule', (b) => `${(JSON.parse(b).events || []).length} maç (436 = örnek takım kimliği)`],
    ['espn_1lig', `https://site.api.espn.com/apis/site/v2/sports/soccer/tur.2/scoreboard?dates=${from}-${to}&limit=300`, (b) => `${(JSON.parse(b).events || []).length} maç`],
    ['espn_bugun', 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard', (b) => `${(JSON.parse(b).events || []).length} maç`],
    ['espn_takimlar', 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams', (b) => `${(JSON.parse(b).sports?.[0]?.leagues?.[0]?.teams || []).length} takım`],
    ['hava', 'https://api.open-meteo.com/v1/forecast?latitude=41&longitude=29&current=temperature_2m', (b) => `${JSON.parse(b).current?.temperature_2m}°`],
    ['doviz', 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=TRY', (b) => `USD ${JSON.parse(b).rates?.TRY}`],
    ['altin_kripto', 'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,bitcoin&vs_currencies=try', (b) => Object.keys(JSON.parse(b)).join(',')],
    ['binance_yedek', 'https://data-api.binance.vision/api/v3/ticker/price?symbol=PAXGUSDT', (b) => `PAXG ${JSON.parse(b).price}`],
    ['hava_yedek_met', 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=41.0082&lon=28.9784', (b) => `${JSON.parse(b).properties?.timeseries?.[0]?.data?.instant?.details?.air_temperature}°`],
    ['haberler', 'https://news.google.com/rss?hl=tr&gl=TR&ceid=TR:tr', (b) => `${(b.match(/<item>/g) || []).length} haber`],
    ['arama', 'https://html.duckduckgo.com/html/?q=fenerbahce', (b) => `${(b.match(/result__a/g) || []).length} sonuç`],
  ]
  const results = await Promise.all(
    checks.map(async ([name, url, summarize]) => {
      const t0 = Date.now()
      try {
        // MET Norway kimliği belli bir istemci ister
        const ua = url.includes('api.met.no') ? 'JarvisPersonalAssistant/1.0 (+https://github.com/mustafaaliyalcin1-hue/Mustafa)' : UA
        const r = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { 'user-agent': ua, 'accept-language': 'tr-TR,tr;q=0.9' } })
        const body = await r.text()
        let info = ''
        try {
          info = r.ok ? summarize(body) : body.slice(0, 120)
        } catch {
          info = 'okunamadı: ' + body.slice(0, 80)
        }
        return { kaynak: name, durum: r.status, ms: Date.now() - t0, bilgi: info }
      } catch (e) {
        return { kaynak: name, durum: 'HATA', ms: Date.now() - t0, bilgi: (e as Error).message }
      }
    }),
  )
  const data = { zaman: new Date().toISOString(), sonuclar: results }
  diagCache = { at: Date.now(), data }
  return data
})

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
    // 1) Önce komut çözücü: sık komutlar yapay zekâya gitmeden, ücretsiz ve hızlı
    const local = config.localIntents ? await tryLocal(conversationId, text, emit) : null
    if (local) {
      if (provider === 'free') rememberTurn(conversationId, text, local.reply)
      return
    }
    // 2) Yapay zekâ
    if (!services.ai) {
      emit({ type: 'say', text: 'Bu soruyu yanıtlamak için yapay zekâ beynim bağlı değil efendim. Hava, maç, döviz, haber, hesap ve hatırlatma gibi komutları ise hemen yapabilirim.' })
      return
    }
    // Doğrulama isteğinde yapay zekâya açık görev: gündem değil, iddianın kendisini araştır
    const aiText = isFactCheck(text)
      ? `${text}\n\n[GÖREV: HABER DOĞRULAMA. get_news KULLANMA. İddiayı web_search ile araştır (link varsa web_fetch ile oku); birden çok güvenilir kaynağa ve teyit.org, dogrulukpayi.com, Reuters/AP/AFP doğrulama sayfalarına bak. Sonra present_fact_check ile DOĞRU/YALAN/YANILTICI/DOĞRULANAMADI sonucunu göster ve kısaca gerekçeyi söyle. İddia bu mesajda yoksa önceki konuşmadaki haberi değerlendir; hâlâ belirsizse hangi haberi kastettiğini sor.]`
      : text
    if (provider === 'free') await runFreeBrains(conversationId, aiText, emit, ac.signal)
    else await runAgent(conversationId, aiText, emit, ac.signal)
  } catch (err) {
    if (!ac.signal.aborted) {
      req.log.error(err)
      resetConversation(conversationId)
      resetFreeConversation(conversationId)
      const msg = err instanceof AllBrainsBusy ? 'Yapay zekâ servisleri şu an yoğun ya da kotası dolu. Hava, maç, döviz, haber gibi komutlar yine de çalışır.' : (describeGeminiError(err) ?? describeError(err))
      emit({ type: 'state', state: 'error', message: msg })
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
  if (provider === 'free' && config.geminiKey) warmUpGemini()
  app.log.info(`J.A.R.V.I.S. çevrimiçi → :${config.port} · Beyin:${provider} ${services.ai ? '✓' : '✗'} · TTS:${services.tts ? '✓' : '✗'}`)
})
