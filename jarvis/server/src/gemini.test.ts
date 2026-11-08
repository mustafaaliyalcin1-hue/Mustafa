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
