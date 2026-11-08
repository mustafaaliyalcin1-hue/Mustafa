/**
 * Gemini beyni uçtan uca testi (sahte Gemini REST sunucusu ile):
 *  1) kullanıcı "Ankara hava" → model get_weather çağırır → 'weather' sahnesi
 *  2) model web_search çağırır → alt çağrı Google Arama ile döner → kaynaklar sonuca girer
 *  3) model son metni verir → 'say' olayı
 */
import assert from 'node:assert/strict'
import http from 'node:http'
import { test } from 'node:test'

test('gemini: araç zinciri → sahneler → seslendirme', async () => {
  const reqs: { url: string; body: any }[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
  const fake = http.createServer((req, res) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      const body = JSON.parse(b)
      reqs.push({ url: req.url || '', body })
      const reply = (parts: object[], extra: object = {}) => res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP', ...extra }] }))
      res.writeHead(200, { 'content-type': 'application/json' })
      // web_search alt çağrısı: googleSearch aracıyla gelir
      if (JSON.stringify(body.tools || []).includes('googleSearch'))
        return reply([{ text: 'Ankara’da yarın kar bekleniyor.' }], { groundingMetadata: { groundingChunks: [{ web: { uri: 'https://mgm.gov.tr/x', title: 'mgm.gov.tr' } }] } })
      const last = body.contents.at(-1)
      const hasFnResp = last.parts.some((p: { functionResponse?: unknown }) => p.functionResponse)
      const n = body.contents.filter((c: { role: string }) => c.role === 'model').length
      if (!hasFnResp) return reply([{ functionCall: { id: 'c1', name: 'get_weather', args: { city: 'Ankara' } }, thoughtSignature: 'sig1' }])
      if (n === 1) return reply([{ functionCall: { id: 'c2', name: 'web_search', args: { query: 'Ankara yarın kar' } } }])
      return reply([{ text: '**Ankara’da** şu an yağmurlu efendim, yarın kar bekleniyor.' }])
    })
  })
  await new Promise<void>((r) => fake.listen(0, r))
  process.env.GEMINI_BASE_URL = `http://127.0.0.1:${(fake.address() as { port: number }).port}`
  process.env.GEMINI_API_KEY = 'test'

  const real = globalThis.fetch
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const u = String(url)
    if (u.includes('geocoding-api.open-meteo')) return new Response(JSON.stringify({ results: [{ name: 'Ankara', country: 'Türkiye', latitude: 39.9, longitude: 32.8 }] }))
    if (u.includes('api.open-meteo'))
      return new Response(JSON.stringify({ current: { temperature_2m: 6, apparent_temperature: 4, relative_humidity_2m: 80, weather_code: 63, wind_speed_10m: 10, is_day: 1 }, hourly: { time: [], temperature_2m: [], precipitation_probability: [], weather_code: [] }, daily: { time: ['2026-11-08'], weather_code: [63], temperature_2m_max: [7], temperature_2m_min: [1], precipitation_probability_max: [90] } }))
    return real(url, init)
  }) as typeof fetch

  try {
    const { runGeminiAgent } = await import('./gemini.ts')
    const events: { type: string; scene?: string; text?: string }[] = []
    await runGeminiAgent('g1', 'Ankara hava nasıl, yarın kar yağar mı?', (e) => events.push(e as never))
    assert.deepEqual(
      events.map((e) => e.type + (e.scene ? ':' + e.scene : '')),
      ['state', 'scene:generic', 'scene:weather', 'scene:research', 'say'], // generic = hava verisi alınıyor
    )
    assert.equal(events.at(-1)!.text, 'Ankara’da şu an yağmurlu efendim, yarın kar bekleniyor.')

    const main = reqs.filter((r) => !JSON.stringify(r.body.tools || []).includes('googleSearch'))
    assert.equal(main.length, 3)
    assert.ok(main[0].url.includes('gemini-flash-latest:generateContent'))
    // Araç tanımları JSON şemasıyla gitti
    const decls = main[0].body.tools[0].functionDeclarations.map((d: { name: string }) => d.name)
    assert.ok(decls.includes('get_weather') && decls.includes('web_search') && decls.includes('present_fact_check'))
    // Düşünce imzası korunarak geri gönderildi, araç sonucu doğru id ile döndü
    const second = main[1].body.contents
    assert.equal(second[1].parts[0].thoughtSignature, 'sig1')
    assert.equal(second[2].parts[0].functionResponse.id, 'c1')
    assert.equal(second[2].parts[0].functionResponse.response.output.city, 'Ankara')
    // web_search sonucu kaynaklarıyla döndü
    const third = main[2].body.contents.at(-1).parts[0].functionResponse.response.output
    assert.equal(third.sources[0].url, 'https://mgm.gov.tr/x')
  } finally {
    globalThis.fetch = real
    fake.close()
  }
})

test('gemini: en uygun Flash modeli seçilir', async () => {
  const { pickFlashModel } = await import('./gemini.ts')
  assert.equal(pickFlashModel(['models/gemini-2.5-flash', 'models/gemini-3.8-flash', 'models/gemini-3.8-flash-lite', 'models/gemini-3.8-pro', 'models/gemini-3.9-flash-preview-09-2026', 'models/gemini-3.8-flash-image', 'models/text-embedding-004']), 'gemini-3.8-flash')
  assert.equal(pickFlashModel(['models/gemini-flash-lite-latest', 'models/gemini-2.0-flash-lite']), 'gemini-flash-lite-latest')
  assert.equal(pickFlashModel(['models/gemini-3.8-pro']), undefined)
})

test('gemini: model 404 verirse listelenip otomatik seçilir', async () => {
  const seen: string[] = []
  const fake = http.createServer((req, res) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      seen.push(`${req.method} ${req.url}`)
      res.setHeader('content-type', 'application/json')
      if (req.method === 'GET' && req.url?.includes('/models')) return res.end(JSON.stringify({ models: [{ name: 'models/gemini-3.8-flash', supportedActions: ['generateContent'] }, { name: 'models/gemini-3.8-flash-lite', supportedActions: ['generateContent'] }] }))
      if (req.url?.includes('gemini-flash-latest')) {
        res.statusCode = 404
        return res.end(JSON.stringify({ error: { code: 404, message: 'models/gemini-flash-latest is not found', status: 'NOT_FOUND' } }))
      }
      res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Merhaba efendim.' }] } }] }))
    })
  })
  await new Promise<void>((r) => fake.listen(0, r))
  const port = (fake.address() as { port: number }).port
  // Ayrı modül örneği: yeni temel adresle taze istemci
  process.env.GEMINI_BASE_URL = `http://127.0.0.1:${port}`
  const mod = await import('./gemini.ts?keşif=' + port)
  try {
    const events: { type: string; text?: string }[] = []
    await mod.runGeminiAgent('g2', 'selam', (e: never) => events.push(e))
    assert.equal(events.at(-1)!.text, 'Merhaba efendim.')
    assert.equal(mod.currentGeminiModel(), 'gemini-3.8-flash')
    assert.ok(seen.some((x) => x.startsWith('GET') && x.includes('/models')))
    assert.ok(seen.some((x) => x.includes('gemini-3.8-flash:generateContent')))
  } finally {
    fake.close()
  }
})

test('gemini: model aşırı yoğunsa (503) tekrar dener, sonra yedek modele geçer', async () => {
  const seen: string[] = []
  const fake = http.createServer((req, res) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      seen.push(`${req.method} ${req.url}`)
      res.setHeader('content-type', 'application/json')
      if (req.method === 'GET' && req.url?.includes('/models')) return res.end(JSON.stringify({ models: [{ name: 'models/gemini-flash-latest', supportedActions: ['generateContent'] }, { name: 'models/gemini-flash-lite-latest', supportedActions: ['generateContent'] }] }))
      if (req.url?.includes('gemini-flash-latest:')) {
        res.statusCode = 503
        return res.end(JSON.stringify({ error: { code: 503, message: 'The model is overloaded.', status: 'UNAVAILABLE' } }))
      }
      res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Yedek modelden merhaba.' }] } }] }))
    })
  })
  await new Promise<void>((r) => fake.listen(0, r))
  const port = (fake.address() as { port: number }).port
  process.env.GEMINI_BASE_URL = `http://127.0.0.1:${port}`
  const mod = await import('./gemini.ts?yogun=' + port)
  try {
    const events: { type: string; text?: string }[] = []
    await mod.runGeminiAgent('g3', 'selam', (e: never) => events.push(e))
    assert.equal(events.at(-1)!.text, 'Yedek modelden merhaba.')
    assert.equal(seen.filter((x) => x.includes('gemini-flash-latest:generateContent')).length, 3) // 1 + 2 tekrar
    assert.ok(seen.some((x) => x.includes('gemini-flash-lite-latest:generateContent')))
  } finally {
    fake.close()
  }
})

test('gemini: düşünme ayarı reddedilirse (400) ayarsız devam eder', async () => {
  const bodies: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
  const fake = http.createServer((req, res) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      res.setHeader('content-type', 'application/json')
      if (req.method === 'GET') return res.end(JSON.stringify({ models: [{ name: 'models/gemini-flash-latest', supportedActions: ['generateContent'] }] }))
      const body = JSON.parse(b)
      bodies.push(body)
      if (body.generationConfig?.thinkingConfig) {
        res.statusCode = 400
        return res.end(JSON.stringify({ error: { code: 400, message: 'Unsupported field', status: 'INVALID_ARGUMENT' } }))
      }
      res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Tamam efendim.' }] } }] }))
    })
  })
  await new Promise<void>((r) => fake.listen(0, r))
  const port = (fake.address() as { port: number }).port
  process.env.GEMINI_BASE_URL = `http://127.0.0.1:${port}`
  const mod = await import('./gemini.ts?dusunme=' + port)
  try {
    const events: { text?: string }[] = []
    await mod.runGeminiAgent('g4', 'selam', (e: never) => events.push(e))
    assert.equal(events.at(-1)!.text, 'Tamam efendim.')
    assert.ok(bodies[0].generationConfig.thinkingConfig.thinkingLevel === 'LOW')
    assert.equal(bodies.length, 2)
  } finally {
    fake.close()
  }
})
