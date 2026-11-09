import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getTool } from './index.ts'
import { parseRss } from './news.ts'
import { parseScoreboard, parseStandings } from './sports.ts'

function mockFetch(routes: [string, unknown][]) {
  const real = globalThis.fetch
  globalThis.fetch = (async (u: string) => {
    const hit = routes.find(([k]) => String(u).includes(k))
    if (!hit) return new Response('yok', { status: 404 })
    return new Response(typeof hit[1] === 'string' ? hit[1] : JSON.stringify(hit[1]))
  }) as typeof fetch
  return () => (globalThis.fetch = real)
}

const RSS = `<?xml version="1.0"?><rss><channel><title>x</title>
<item><title>Merkez Bankası faiz kararını açıkladı - AA</title><link>https://news.google.com/a1</link><pubDate>Sun, 08 Nov 2026 10:00:00 GMT</pubDate><source url="https://aa.com.tr">AA</source></item>
<item><title><![CDATA[Yeni &quot;yapay zekâ&quot; yasası - NTV]]></title><link>https://news.google.com/a2</link><pubDate>Sun, 08 Nov 2026 09:00:00 GMT</pubDate><source url="https://ntv.com.tr">NTV</source></item>
</channel></rss>`

test('RSS: başlıktan kaynak eki ayrılır, HTML varlıkları çözülür', () => {
  const items = parseRss(RSS)
  assert.equal(items.length, 2)
  assert.equal(items[0].title, 'Merkez Bankası faiz kararını açıkladı')
  assert.equal(items[0].source, 'AA')
  assert.equal(items[1].title, 'Yeni "yapay zekâ" yasası')
  assert.equal(items[0].time, '2026-11-08T10:00:00.000Z')
})

const team = (n: string, a: string) => ({ displayName: n, abbreviation: a, logo: `https://x/${a}.png` })
const ev = (id: string, date: string, state: string, h: [string, string, string], a: [string, string, string]) => ({
  id,
  date,
  status: { type: { state, shortDetail: state === 'post' ? 'FT' : state === 'in' ? "67'" : '20:00' } },
  competitions: [{ competitors: [{ homeAway: 'home', team: team(h[0], h[1]), score: h[2] }, { homeAway: 'away', team: team(a[0], a[1]), score: a[2] }] }],
})
const BOARD = {
  events: [
    ev('1', '2026-11-01T17:00Z', 'post', ['Fenerbahce', 'FEN', '3'], ['Galatasaray', 'GS', '1']),
    ev('2', '2026-11-02T17:00Z', 'post', ['Besiktas', 'BJK', '0'], ['Trabzonspor', 'TS', '0']),
    ev('3', '2026-11-08T16:00Z', 'in', ['Samsunspor', 'SAM', '1'], ['Fenerbahce', 'FEN', '2']),
    ev('4', '2026-11-15T17:00Z', 'pre', ['Fenerbahce', 'FEN', ''], ['Besiktas', 'BJK', '']),
  ],
}

test('ESPN skor tablosu ayrıştırılır', () => {
  const m = parseScoreboard(BOARD, 'tur.1')
  assert.equal(m.length, 4)
  assert.equal(m[0].home.score, 3)
  assert.equal(m[3].home.score, undefined)
  assert.equal(m[2].status, 'in')
})

test('ESPN puan durumu sıralanır', () => {
  const st = parseStandings({ children: [{ standings: { entries: [
    { team: { displayName: 'Galatasaray', abbreviation: 'GS' }, stats: [{ name: 'rank', value: 2 }, { name: 'points', value: 25 }, { name: 'gamesPlayed', value: 11 }] },
    { team: { displayName: 'Fenerbahce', abbreviation: 'FEN' }, stats: [{ name: 'rank', value: 1 }, { name: 'points', value: 28 }, { name: 'gamesPlayed', value: 11 }] },
  ] } }] })
  assert.equal(st[0].team, 'Fenerbahce')
  assert.equal(st[0].points, 28)
})

test('get_football: varsayılan Fenerbahçe maçlarını süzer (Türkçe karakterden bağımsız)', async () => {
  const restore = mockFetch([['scoreboard', BOARD]])
  try {
    const out = await getTool('get_football')!.run({ team: 'Fenerbahçe' })
    const d = out.scene!.data as { matches: { id: string }[] }
    assert.deepEqual(d.matches.map((m) => m.id), ['1', '3', '4'])
    assert.equal(out.scene!.scene, 'sports')
  } finally {
    restore()
  }
})

test('get_market: döviz + gram altın hesaplanır', async () => {
  const restore = mockFetch([
    ['frankfurter', { rates: { '2026-11-05': { TRY: 41.0 }, '2026-11-06': { TRY: 41.5 } } }],
    ['simple/price', { 'pax-gold': { try: 155517.38, try_24h_change: 1.2 } }],
    ['market_chart', { prices: [[1, 150000], [2, 155517.38]] }],
  ])
  try {
    const out = await getTool('get_market')!.run({ currencies: ['usd'], gold: true })
    const d = out.scene!.data as { items: { symbol: string; price: number; change: number }[]; chart: { points: number[] } }
    const usd = d.items.find((i) => i.symbol === 'USD')!
    assert.equal(usd.price, 41.5)
    assert.ok(Math.abs(usd.change - 1.2195) < 0.01)
    const gram = d.items.find((i) => i.symbol === 'GRAM')!
    assert.ok(Math.abs(gram.price - 5000) < 1) // 155517.38 / 31.1035 ≈ 5000
    assert.equal(d.chart.points.length, 2)
  } finally {
    restore()
  }
})

test('get_news: kategori manşetleri sahneye gider', async () => {
  const restore = mockFetch([['topic/BUSINESS', RSS]])
  try {
    const out = await getTool('get_news')!.run({ category: 'ekonomi' })
    const d = out.scene!.data as { category: string; items: unknown[] }
    assert.equal(d.category, 'EKONOMİ')
    assert.equal(d.items.length, 2)
  } finally {
    restore()
  }
})

test('ESPN takvim biçimi: skor nesnesi ve yarışma içi durum', () => {
  const m = parseScoreboard({ events: [{ id: '9', date: '2026-11-01T17:00Z', competitions: [{ status: { type: { state: 'post', completed: true, shortDetail: 'FT' } }, competitors: [
    { homeAway: 'home', team: { displayName: 'Fenerbahce', abbreviation: 'FEN', logos: [{ href: 'l.png' }] }, score: { value: 2, displayValue: '2' } },
    { homeAway: 'away', team: { displayName: 'Galatasaray', abbreviation: 'GAL' }, score: { value: 0, displayValue: '0' } },
  ] }] }] }, 'tur.1')
  assert.equal(m[0].status, 'post')
  assert.equal(m[0].home.score, 2)
  assert.equal(m[0].away.score, 0)
  assert.equal(m[0].home.logo, 'l.png')
})

test('ESPN tarih aralığını reddederse (400) gün gün sorguya geçilir', async () => {
  const { clearCache } = await import('./cache.ts')
  clearCache()
  let rangeCalls = 0
  const real = globalThis.fetch
  globalThis.fetch = (async (u: string) => {
    const url = String(u)
    if (/\/teams$/.test(url)) return new Response('yok', { status: 404 })
    if (url.includes('scoreboard') && /dates=\d{8}-\d{8}/.test(url)) {
      rangeCalls++
      return new Response(JSON.stringify({ code: 400, message: 'Failed to get events endpoint.' }), { status: 400 })
    }
    if (url.includes('tur.1/scoreboard')) return new Response(JSON.stringify(BOARD))
    return new Response(JSON.stringify({ events: [] }))
  }) as typeof fetch
  try {
    const out = await getTool('get_football')!.run({ team: 'Fenerbahçe' })
    const d = out.scene!.data as { matches: { id: string }[] }
    assert.deepEqual(d.matches.map((m) => m.id), ['1', '3', '4'])
    assert.ok(rangeCalls >= 1)
  } finally {
    globalThis.fetch = real
  }
})

test('altın/kripto: CoinGecko sınırlarsa (429) Binance yedeği', async () => {
  const { clearCache } = await import('./cache.ts')
  clearCache()
  const real = globalThis.fetch
  globalThis.fetch = (async (u: string) => {
    const url = String(u)
    if (url.includes('coingecko')) return new Response('Throttled', { status: 429 })
    if (url.includes('/ticker/24hr'))
      return new Response(JSON.stringify([
        { symbol: 'BTCTRY', lastPrice: '4100000', priceChangePercent: '-2.5' },
        { symbol: 'PAXGUSDT', lastPrice: '3110.35', priceChangePercent: '1.1' },
        { symbol: 'USDTTRY', lastPrice: '50' },
      ]))
    if (url.includes('/klines')) return new Response(JSON.stringify([[1, '0', '0', '0', '3000'], [2, '0', '0', '0', '3110.35']]))
    return new Response('yok', { status: 404 })
  }) as typeof fetch
  try {
    const out = await getTool('get_market')!.run({ gold: true, crypto: ['BTC'] })
    const d = out.scene!.data as { items: { symbol: string; price: number; change: number }[]; chart: { points: number[] } }
    const gram = d.items.find((i) => i.symbol === 'GRAM')!
    assert.ok(Math.abs(gram.price - 5000) < 1) // 3110.35 × 50 / 31.1035
    assert.equal(d.items.find((i) => i.symbol === 'BTC')!.price, 4100000)
    assert.equal(d.chart.points.length, 2)
  } finally {
    globalThis.fetch = real
  }
})

test('hava: Open-Meteo kotası dolarsa (429) MET Norway yedeği', async () => {
  const { clearCache } = await import('./cache.ts')
  clearCache()
  const { fetchWeather } = await import('./weather.ts')
  const real = globalThis.fetch
  const ts = (h: number, temp: number, sym: string, mm: number) => ({ time: new Date(Date.UTC(2026, 10, 9, h)).toISOString(), data: { instant: { details: { air_temperature: temp, relative_humidity: 80, wind_speed: 3 } }, next_1_hours: { summary: { symbol_code: sym }, details: { precipitation_amount: mm } } } })
  globalThis.fetch = (async (u: string) => {
    const url = String(u)
    if (url.includes('open-meteo')) return new Response(JSON.stringify({ reason: 'Daily API request limit exceeded.' }), { status: 429 })
    if (url.includes('api.met.no')) return new Response(JSON.stringify({ properties: { timeseries: [ts(9, 12, 'lightrain', 0.6), ts(10, 14, 'rain', 1.5), ts(11, 15, 'rain', 1), ts(30, 9, 'clearsky_day', 0), ts(31, 11, 'fair_day', 0)] } }))
    return new Response('yok', { status: 404 })
  }) as typeof fetch
  try {
    const w = await fetchWeather('İstanbul')
    assert.equal(w.source, 'MET Norway')
    assert.equal(w.city, 'İstanbul')
    assert.equal(w.temp, 12)
    assert.equal(w.condition, 'rain')
    assert.equal(w.days[0].max, 15)
    assert.ok(w.days[0].rain >= 60)
    assert.equal(w.days[1].condition, 'sunny')
  } finally {
    globalThis.fetch = real
  }
})
