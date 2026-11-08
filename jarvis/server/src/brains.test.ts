/**
 * Ücretsiz beyin zinciri testi:
 *  Gemini kotası dolu (429) → aynı soru otomatik olarak Groq'a (OpenAI uyumlu) gider →
 *  Groq get_weather aracını çağırır → hava sahnesi → cevap seslendirilir.
 *  İkinci soruda Gemini dinlenmede olduğu için doğrudan Groq kullanılır ve geçmiş taşınır.
 */
import assert from 'node:assert/strict'
import http from 'node:http'
import { test } from 'node:test'

const gemini = http.createServer((req, res) => {
  req.resume()
  req.on('end', () => {
    res.setHeader('content-type', 'application/json')
    if (req.method === 'GET') return res.end(JSON.stringify({ models: [{ name: 'models/gemini-flash-latest', supportedActions: ['generateContent'] }] }))
    res.statusCode = 429
    res.end(JSON.stringify({ error: { code: 429, message: 'Quota exceeded', status: 'RESOURCE_EXHAUSTED' } }))
  })
})
const groqBodies: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
const groq = http.createServer((req, res) => {
  let b = ''
  req.on('data', (c) => (b += c))
  req.on('end', () => {
    const body = JSON.parse(b)
    groqBodies.push({ auth: req.headers.authorization, url: req.url, ...body })
    res.setHeader('content-type', 'application/json')
    const last = body.messages.at(-1)
    const msg =
      last.role === 'tool'
        ? { role: 'assistant', content: '<think>kısa</think>**Ankara’da** hava yağmurlu efendim, 9 derece.' }
        : last.content.includes('teşekkür')
          ? { role: 'assistant', content: 'Rica ederim efendim.' }
          : { role: 'assistant', content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'get_weather', arguments: '{"city":"Ankara"}' } }] }
    res.end(JSON.stringify({ choices: [{ message: msg, finish_reason: 'stop' }] }))
  })
})

test('zincir: Gemini 429 → Groq devralır, araç çalışır, geçmiş taşınır', async () => {
  await new Promise<void>((r) => gemini.listen(0, r))
  await new Promise<void>((r) => groq.listen(0, r))
  process.env.GEMINI_API_KEY = 'g'
  process.env.GEMINI_BASE_URL = `http://127.0.0.1:${(gemini.address() as { port: number }).port}`
  process.env.GROQ_API_KEY = 'gk'
  const { BrainError } = await import('./openai-compat.ts')
  void BrainError
  // Groq adresini test sunucusuna yönlendir
  const real = globalThis.fetch
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    let u = String(url)
    if (u.startsWith('https://api.groq.com/openai/v1')) u = u.replace('https://api.groq.com/openai/v1', `http://127.0.0.1:${(groq.address() as { port: number }).port}`)
    if (u.includes('geocoding-api.open-meteo')) return new Response(JSON.stringify({ results: [{ name: 'Ankara', country: 'Türkiye', latitude: 39.9, longitude: 32.8 }] }))
    if (u.includes('api.open-meteo'))
      return new Response(JSON.stringify({ current: { temperature_2m: 9, apparent_temperature: 7, relative_humidity_2m: 80, weather_code: 63, wind_speed_10m: 10, is_day: 1 }, hourly: { time: [], temperature_2m: [], precipitation_probability: [], weather_code: [] }, daily: { time: ['2026-11-08'], weather_code: [63], temperature_2m_max: [10], temperature_2m_min: [4], precipitation_probability_max: [90] } }))
    return real(u, init)
  }) as typeof fetch

  try {
    const { runFreeBrains, brainStatus } = await import('./brains.ts')
    const ev: { type: string; scene?: string; text?: string }[] = []
    await runFreeBrains('c1', 'Ankara hava nasıl?', (e) => ev.push(e as never))
    assert.deepEqual(ev.map((e) => e.type + (e.scene ? ':' + e.scene : '')), ['state', 'scene:generic', 'scene:weather', 'say'])
    assert.equal(ev.at(-1)!.text, 'Ankara’da hava yağmurlu efendim, 9 derece.') // <think> ve markdown temizlendi
    assert.equal(groqBodies[0].auth, 'Bearer gk')
    assert.equal(groqBodies[0].model, 'openai/gpt-oss-120b')
    assert.ok(groqBodies[0].tools.some((t: { function: { name: string } }) => t.function.name === 'web_search'))
    assert.equal(groqBodies[1].messages.at(-1).tool_call_id, 'call_1')
    assert.deepEqual(brainStatus(), [{ name: 'gemini', ready: false }, { name: 'groq', ready: true }])

    // İkinci soru: Gemini dinlenmede → doğrudan Groq; önceki tur geçmişte
    const n = groqBodies.length
    const ev2: { type: string; text?: string }[] = []
    await runFreeBrains('c1', 'teşekkürler', (e) => ev2.push(e as never))
    assert.equal(ev2.at(-1)!.text, 'Rica ederim efendim.')
    const msgs = groqBodies[n].messages
    assert.ok(msgs.some((m: { role: string; content: string }) => m.role === 'assistant' && m.content.includes('yağmurlu')))
  } finally {
    globalThis.fetch = real
    gemini.close()
    groq.close()
  }
})

test('DuckDuckGo sonuçları ayrıştırılır (yönlendirme linkleri çözülür)', async () => {
  const { parseDuckDuckGo } = await import('./tools/web.ts')
  const html = `<div class="result"><a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.teyit.org%2Fanaliz%2Fx&amp;rut=1">Teyit: <b>köprü</b> iddiası</a>
  <a class="result__snippet" href="#">İddia <b>yanlış</b>.</a></div>
  <div class="result"><a class="result__a" href="https://duckduckgo.com/y.js?ad=1">Reklam</a></div>
  <div class="result"><a class="result__a" href="https://www.aa.com.tr/haber">AA haber</a><a class="result__snippet">Özet</a></div>`
  const r = parseDuckDuckGo(html)
  assert.equal(r.length, 2)
  assert.deepEqual(r[0], { name: 'Teyit: köprü iddiası', url: 'https://www.teyit.org/analiz/x', snippet: 'İddia yanlış.' })
  assert.equal(r[1].url, 'https://www.aa.com.tr/haber')
})
