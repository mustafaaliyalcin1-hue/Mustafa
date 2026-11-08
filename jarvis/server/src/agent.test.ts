/**
 * Ajan döngüsü uçtan uca testi: gerçek API yerine yerel sahte bir Claude sunucusu
 * (SSE akışı) kullanılır. Senaryo: Claude get_weather aracını çağırır → araç çalışır →
 * arayüze 'weather' sahnesi gider → Claude son cevabı verir → 'say' olayı gider.
 */
import assert from 'node:assert/strict'
import http from 'node:http'
import { test } from 'node:test'

function sse(events: object[]) {
  return events.map((e) => `event: ${(e as { type: string }).type}\ndata: ${JSON.stringify(e)}\n\n`).join('')
}
const usage = { input_tokens: 10, output_tokens: 5 }
const start = (id: string) => ({ type: 'message_start', message: { id, type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', content: [], stop_reason: null, stop_sequence: null, usage } })

const toolTurn = sse([
  start('m1'),
  { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'tu_1', name: 'get_weather', input: {} } },
  { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{"city": "Ankara"}' } },
  { type: 'content_block_stop', index: 0 },
  { type: 'message_delta', delta: { stop_reason: 'tool_use', stop_sequence: null }, usage },
  { type: 'message_stop' },
])
const textTurn = sse([
  start('m2'),
  { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: "**Ankara'da** hava yağmurlu efendim, 9 derece." } },
  { type: 'content_block_stop', index: 0 },
  { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage },
  { type: 'message_stop' },
])

test('ajan: araç çağrısı → sahne → seslendirme', async () => {
  const bodies: { messages: { role: string; content: unknown }[]; fallbacks?: string; model: string }[] = []
  const fake = http.createServer((req, res) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      bodies.push(JSON.parse(b))
      res.writeHead(200, { 'content-type': 'text/event-stream' })
      res.end(bodies.length === 1 ? toolTurn : textTurn)
    })
  })
  await new Promise<void>((r) => fake.listen(0, r))
  const port = (fake.address() as { port: number }).port
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`
  process.env.ANTHROPIC_API_KEY = 'test'

  // Hava servisini taklit et (Anthropic istekleri gerçek fetch ile sahte sunucuya gider)
  const real = globalThis.fetch
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const u = String(url)
    if (u.includes('geocoding-api.open-meteo')) return new Response(JSON.stringify({ results: [{ name: 'Ankara', country: 'Türkiye', latitude: 39.9, longitude: 32.8 }] }))
    if (u.includes('api.open-meteo'))
      return new Response(
        JSON.stringify({
          current: { temperature_2m: 9, apparent_temperature: 7, relative_humidity_2m: 80, weather_code: 63, wind_speed_10m: 10, is_day: 1 },
          hourly: { time: [], temperature_2m: [], precipitation_probability: [], weather_code: [] },
          daily: { time: ['2026-11-08'], weather_code: [63], temperature_2m_max: [10], temperature_2m_min: [4], precipitation_probability_max: [90] },
        }),
      )
    return real(url, init)
  }) as typeof fetch

  try {
    const { runAgent } = await import('./agent.ts')
    const events: { type: string; scene?: string; text?: string; data?: { city?: string; condition?: string } }[] = []
    await runAgent('t1', 'Ankara’da hava nasıl?', (e) => events.push(e as never))

    const types = events.map((e) => e.type + (e.scene ? ':' + e.scene : ''))
    assert.deepEqual(types, ['state', 'scene:generic', 'scene:weather', 'say'])
    const weather = events.find((e) => e.scene === 'weather')!
    assert.equal(weather.data?.city, 'Ankara')
    assert.equal(weather.data?.condition, 'rain')
    assert.equal(events.at(-1)!.text, "Ankara'da hava yağmurlu efendim, 9 derece.") // markdown temizlendi

    // İkinci istek: araç sonucu geçmişe eklendi, istek parametreleri doğru
    assert.equal(bodies.length, 2)
    assert.equal(bodies[0].model, 'claude-sonnet-5-5')
    assert.equal(bodies[0].fallbacks, 'default')
    const last = bodies[1].messages.at(-1) as { role: string; content: { type: string; tool_use_id: string }[] }
    assert.equal(last.role, 'user')
    assert.equal(last.content[0].type, 'tool_result')
    assert.equal(last.content[0].tool_use_id, 'tu_1')
  } finally {
    globalThis.fetch = real
    fake.close()
  }
})
