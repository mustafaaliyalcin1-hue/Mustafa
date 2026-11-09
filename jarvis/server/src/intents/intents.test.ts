/**
 * Komut çözücü testleri
 *  1) Tanıma: gerçek cümleler doğru komuta ve parametrelere gidiyor mu, yapay zekâ gerekenler ayrılıyor mu
 *  2) Cevaplar: maç (galibiyet/mağlubiyet/beraberlik/canlı/sıradaki/puan), hava, döviz, haber, hesap, hafıza
 *  3) Takip soruları: "peki yarın?", "ya Galatasaray?"
 */
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

process.env.DATA_DIR = path.join(os.tmpdir(), 'jarvis-test-' + process.pid)
process.env.TZ = 'Europe/Istanbul'

const { recognize, tryLocal } = await import('./index.ts')
const { ekle, extractPlace, norm, extractDayOffset } = await import('./text.ts')
const { evaluate } = await import('./misc.ts')
const { saatEki } = await import('./football.ts')

// ------------------------------------------------------------------ 1) tanıma
const CASES: [string, string | null, Record<string, unknown>?][] = [
  ['Fener yendi mi?', 'football', { team: 'Fenerbahce', ask: 'sonuc' }],
  ['fenerbahçe maçı kaç kaç bitti', 'football', { ask: 'sonuc' }],
  ['Galatasaray kazandı mı', 'football', { team: 'Galatasaray', ask: 'sonuc' }],
  ['maç ne oldu', 'football', { team: undefined, ask: 'sonuc' }],
  ['sıradaki maç ne zaman', 'football', { ask: 'siradaki' }],
  ['kiminle oynuyoruz', null], // takım/maç kelimesi yok → yapay zekâ (ya da takip)
  ['Fenerbahçe kiminle oynuyor', 'football', { ask: 'siradaki' }],
  ['maç şu an kaç kaç', 'football', { ask: 'canli' }],
  ['puan durumu', null],
  ['süper lig puan durumu', 'football', { ask: 'puan' }],
  ['Fenerbahçe kaçıncı sırada', 'football', { ask: 'puan' }],
  ['Beşiktaş maçı ne zaman', 'football', { team: 'Besiktas', ask: 'siradaki' }],
  ['Real Madrid kazandı mı', 'football', { team: 'Real Madrid' }],
  ['bugün hava nasıl', 'weather', { ask: 'genel', day: 0 }],
  ['yarın yağmur yağacak mı', 'weather', { ask: 'yagmur', day: 1 }],
  ["Ankara'da hava nasıl", 'weather', { city: 'Ankara' }],
  ['hafta sonu İzmir hava', 'weather', { city: 'İzmir' }],
  ['şemsiye alayım mı', 'weather', { ask: 'yagmur' }],
  ['bu akşam soğuk mu', 'weather', { ask: 'soguk', day: 0 }],
  ['erzurumda kar yağacak mı', 'weather', { city: 'Erzurum', ask: 'kar' }],
  ['havaalanına nasıl giderim', null],
  ['dolar ne kadar', 'finance', { fx: ['USD'] }],
  ['100 dolar kaç TL', 'finance', { convert: { amount: 100, from: 'USD', to: 'TRY' } }],
  ['5000 lira kaç euro', 'finance', { convert: { amount: 5000, from: 'TRY', to: 'EUR' } }],
  ['çeyrek altın ne kadar', 'finance', { gold: 'çeyrek altın' }],
  ['altın yükseldi mi', 'finance', { gold: 'gram altın', ask: 'yon' }],
  ['bitcoin düştü mü', 'finance', { crypto: ['BTC'], ask: 'yon' }],
  ['borsa bugün nasıl', null],
  ['gündem ne', 'news', {}],
  ['spor haberleri', 'news', { category: 'spor' }],
  ['Fenerbahçe ile ilgili haberler', 'news', { query: 'Fenerbahçe' }],
  ['bu haber doğru mu', null],
  ['saat kaç', 'time', { ask: 'saat' }],
  ['bugün ayın kaçı', 'time', { ask: 'tarih' }],
  ['15 çarpı 23', 'calc', { expr: '15 * 23' }],
  ["1250'nin yüzde 18'i", 'calc', { percent: [18, 1250] }],
  ['karekök 144', 'calc', { sqrt: 144 }],
  ['kahvemi şekersiz içerim, unutma', 'memory', { action: 'save', text: 'kahvemi şekersiz içerim' }],
  ['Jarvis, unutma: annemin doğum günü 3 Mart', 'memory', { action: 'save', text: 'annemin doğum günü 3 Mart' }],
  ['hakkımda ne biliyorsun', 'memory', { action: 'list' }],
  ['selam', 'smalltalk', { kind: 'selam' }],
  ['günaydın jarvis', 'briefing', { morning: true }],
  ['günlük özet', 'briefing'],
  ['bugün neler var', 'briefing'],
  ['Jarvis brifing ver', 'briefing'],
  ['teşekkürler', 'smalltalk', { kind: 'tesekkur' }],
  ['ne yapabilirsin', 'smalltalk', { kind: 'yetenek' }],
  ['elektrikli araba mı hibrit mi araştır', null],
  ['Fenerbahçe neden kaybetti', null],
  ['macera filmi öner', null],
  ["Milano'da hava nasıl", 'weather'],
  ["Fenerbahçe'nin maçı ne zaman", 'football', { team: 'Fenerbahce', ask: 'siradaki' }],
  ["fenerin maçı saat kaçta", 'football', { ask: 'siradaki' }],
  ['fener maçı hangi kanalda', null],
  ['son dakika haberleri', 'news', {}],
  ['Fenerbahçe yenildi mi', 'football', { ask: 'sonuc' }],
  ['dolar kaç lira', 'finance', { fx: ['USD'] }],
  ['kar yağıyor mu', 'weather', { ask: 'kar' }],
]

test('tanıma: gerçek cümleler doğru komuta gider', () => {
  const fails: string[] = []
  for (const [text, intent, params] of CASES) {
    const r = recognize(text)
    const got = r?.intent.name ?? null
    if (got !== intent) {
      fails.push(`"${text}" → ${got} (beklenen ${intent})`)
      continue
    }
    for (const [k, v] of Object.entries(params || {})) {
      try {
        assert.deepEqual(r!.params[k], v)
      } catch {
        fails.push(`"${text}" → ${k}=${JSON.stringify(r!.params[k])} (beklenen ${JSON.stringify(v)})`)
      }
    }
  }
  assert.deepEqual(fails, [])
})

test('Türkçe ekler, yer, gün ve saat eki', () => {
  assert.equal(ekle('Galatasaray', 'acc'), "Galatasaray'ı")
  assert.equal(ekle('Beşiktaş', 'dat'), "Beşiktaş'a")
  assert.equal(ekle('Real Madrid', 'acc'), "Real Madrid'i")
  assert.equal(ekle('Samsunspor', 'acc'), "Samsunspor'u")
  assert.equal(ekle('Ankara', 'loc'), "Ankara'da")
  assert.equal(ekle('Paris', 'loc'), "Paris'te")
  assert.equal(ekle('Fenerbahçe', 'gen'), "Fenerbahçe'nin")
  assert.equal(extractPlace(norm("Kemer'de hava nasıl")), 'Kemer')
  assert.equal(extractPlace(norm('istanbulda yağmur var mı')), 'İstanbul')
  const sat = new Date('2026-11-07T12:00:00') // cumartesi
  assert.equal(extractDayOffset(norm('pazartesi hava'), sat), 2)
  assert.equal(extractDayOffset(norm('cuma hava'), sat), 6)
  assert.equal(extractDayOffset(norm('cumartesi'), sat), 0)
  assert.equal(saatEki(new Date('2026-11-08T16:00:00Z')), 'da') // 19.00'da
  assert.equal(saatEki(new Date('2026-11-08T17:00:00Z')), 'de') // 20.00'de
  assert.equal(saatEki(new Date('2026-11-08T17:45:00Z')), 'te') // 20.45'te
  assert.equal(evaluate('(12+8)/4*2^3'), 40)
  assert.equal(evaluate('-3+10'), 7)
})

// ----------------------------------------------------------- 2) cevaplar (sahte veri)
const iso = (days: number, h = 17) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setUTCHours(h, 0, 0, 0)
  return d.toISOString()
}
const ev = (id: string, date: string, state: string, h: [string, string], a: [string, string], detail = '') => ({
  id,
  date,
  status: { type: { state, shortDetail: detail } },
  competitions: [{ competitors: [{ homeAway: 'home', team: { displayName: h[0], abbreviation: h[0].slice(0, 3).toUpperCase() }, score: h[1] }, { homeAway: 'away', team: { displayName: a[0], abbreviation: a[0].slice(0, 3).toUpperCase() }, score: a[1] }] }],
})

let board: unknown = { events: [] }
const RSS = `<rss><channel><item><title>Merkez Bankası faizi sabit tuttu - AA</title><link>https://x/1</link><pubDate>Sun, 08 Nov 2026 10:00:00 GMT</pubDate><source url="https://aa.com.tr">AA</source></item><item><title>Yeni metro hattı açıldı - NTV</title><link>https://x/2</link><pubDate>Sun, 08 Nov 2026 09:00:00 GMT</pubDate><source url="https://ntv.com.tr">NTV</source></item></channel></rss>`
globalThis.fetch = (async (url: string) => {
  const u = String(url)
  const J = (o: unknown) => new Response(JSON.stringify(o))
  if (u.includes('soccer') && u.includes('scoreboard')) return J(u.includes('tur.1') ? board : { events: [] })
  if (u.includes('standings'))
    return J({ children: [{ standings: { entries: [
      { team: { displayName: 'Galatasaray' }, stats: [{ name: 'rank', value: 1 }, { name: 'points', value: 31 }, { name: 'gamesPlayed', value: 12 }] },
      { team: { displayName: 'Fenerbahce' }, stats: [{ name: 'rank', value: 2 }, { name: 'points', value: 29 }, { name: 'gamesPlayed', value: 12 }] },
    ] } }] })
  if (u.includes('geocoding')) return J({ results: [{ name: u.includes('Ankara') ? 'Ankara' : 'İstanbul', country: 'Türkiye', latitude: 41, longitude: 29 }] })
  if (u.includes('api.open-meteo'))
    return J({
      current: { temperature_2m: 14, apparent_temperature: 12, relative_humidity_2m: 70, weather_code: 3, wind_speed_10m: 12, is_day: 1 },
      hourly: { time: [], temperature_2m: [], precipitation_probability: [], weather_code: [] },
      daily: { time: ['2026-11-08', '2026-11-09', '2026-11-10'], weather_code: [3, 63, 0], temperature_2m_max: [16, 12, 18], temperature_2m_min: [9, 7, 8], precipitation_probability_max: [10, 85, 0] },
    })
  if (u.includes('frankfurter')) return J({ rates: { '2026-11-05': { TRY: 41.5 }, '2026-11-06': { TRY: 41.86 } } })
  if (u.includes('simple/price')) return J({ 'pax-gold': { try: 168000, try_24h_change: 1.3 }, bitcoin: { try: 4125000, try_24h_change: -2.4 } })
  if (u.includes('market_chart')) return J({ prices: [[1, 160000], [2, 168000]] })
  if (u.includes('news.google')) return new Response(RSS)
  return new Response('yok', { status: 404 })
}) as typeof fetch

async function ask(text: string, conv = 'c-' + Math.random()) {
  const events: { type: string; scene?: string; text?: string; data?: any }[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await tryLocal(conv, text, (e) => events.push(e as never))
  return { r, events, say: events.find((e) => e.type === 'say')?.text || '', scenes: events.filter((e) => e.type === 'scene').map((e) => e.scene) }
}

test('maç: galibiyet, mağlubiyet, beraberlik, canlı, sıradaki, puan', async () => {
  board = { events: [ev('1', iso(-1), 'post', ['Fenerbahce', '3'], ['Galatasaray', '1']), ev('2', iso(6), 'pre', ['Besiktas', ''], ['Fenerbahce', ''])] }
  let x = await ask('Fener yendi mi?')
  assert.deepEqual(x.scenes, ['sports'])
  assert.match(x.say, /(Fenerbahçe dün Galatasaray'ı 3-1 yendi|Kazandık efendim! Fenerbahçe dün Galatasaray karşısında 3-1)/)
  assert.match(x.say, /Sıradaki maç .* Beşiktaş ile/)
  const scene = x.events.find((e) => e.scene === 'sports')!.data
  assert.equal(scene.matches[0].home.name, 'Fenerbahçe') // Türkçeleştirildi

  board = { events: [ev('1', iso(-2), 'post', ['Trabzonspor', '2'], ['Fenerbahce', '1'])] }
  x = await ask('fenerbahçe maçı kaç kaç bitti')
  assert.match(x.say, /Maalesef efendim, Fenerbahçe .* Trabzonspor'a 2-1 yenildi/)

  board = { events: [ev('1', iso(-1), 'post', ['Fenerbahce', '1'], ['Samsunspor', '1'])] }
  x = await ask('maç ne oldu')
  assert.match(x.say, /Fenerbahçe dün Samsunspor ile 1-1 berabere kaldı/)

  board = { events: [ev('1', iso(0), 'in', ['Samsunspor', '1'], ['Fenerbahce', '2'], "67'")] }
  x = await ask('Fener maçı şu an kaç kaç')
  assert.match(x.say, /67\. dakikada Fenerbahçe, Samsunspor karşısında 2-1 önde/)

  board = { events: [ev('2', iso(3, 17), 'pre', ['Fenerbahce', ''], ['Real Madrid', ''])] }
  x = await ask('sıradaki maç ne zaman')
  assert.match(x.say, /Fenerbahçe'nin sıradaki maçı .* saat 20:00'de, kendi sahasında Real Madrid ile/)

  x = await ask('Fenerbahçe kaçıncı sırada')
  assert.match(x.say, /Fenerbahçe 29 puanla 2\. sırada efendim\. Lider Galatasaray, 31 puanla; aradaki fark 2 puan/)
})

test('hava: genel, yarın yağmur, şemsiye, takip sorusu', async () => {
  let x = await ask('bugün hava nasıl', 'w1')
  assert.deepEqual(x.scenes, ['weather'])
  assert.match(x.say, /İstanbul'da .*14 derece/)
  x = await ask('yarın yağmur yağacak mı', 'w2')
  assert.match(x.say, /^Evet efendim, yarın İstanbul'da yağış ihtimali yüzde 85\. Şemsiyenizi almanızı öneririm\.$/)
  const sc = x.events.find((e) => e.scene === 'weather')!.data
  assert.equal(sc.condition, 'rain') // ekranda yarının havası
  assert.equal(sc.city, 'İstanbul · yarın')
  // Takip: "peki öbür gün?" → aynı soru, iki gün sonrası
  x = await ask('peki öbür gün?', 'w2')
  assert.match(x.say, /Pek sanmıyorum efendim, öbür gün İstanbul'da yağış ihtimali yalnızca yüzde 0/)
})

test('döviz: fiyat, çevirme, altın, kripto, takip', async () => {
  let x = await ask('dolar ne kadar', 'f1')
  assert.deepEqual(x.scenes, ['finance'])
  assert.match(x.say, /^Dolar 41 lira 86 kuruş, düne göre yüzde 0,87 yükseldi efendim\.$/)
  x = await ask('100 dolar kaç TL')
  assert.match(x.say, /100 dolar yaklaşık 4\.186 lira ediyor efendim/)
  x = await ask('5000 lira kaç euro')
  assert.match(x.say, /5\.000 lira yaklaşık .* euro ediyor/)
  x = await ask('çeyrek altın ne kadar')
  assert.match(x.say, /Çeyrek altın yaklaşık 8\.\d{3} lira; son 24 saatte yüzde 1,3 yükseldi/)
  x = await ask('bitcoin düştü mü')
  assert.match(x.say, /Bitcoin 4\.125\.000 lira; son 24 saatte yüzde 2,4 düştü efendim/)
  x = await ask('peki euro?', 'f1')
  assert.equal(x.r?.intent, 'finance')
})

test('haber, saat, hesap, hafıza, sohbet', async () => {
  let x = await ask('gündem ne')
  assert.deepEqual(x.scenes, ['news'])
  assert.match(x.say, /Birincisi, Merkez Bankası faizi sabit tuttu\. İkincisi, Yeni metro hattı açıldı\./)
  x = await ask('saat kaç')
  assert.match(x.say, /^Saat \d\d:\d\d efendim\.$/)
  x = await ask('15 çarpı 23')
  assert.equal(x.say, 'Sonuç 345 efendim.')
  x = await ask("1250'nin yüzde 18'i")
  assert.equal(x.say, "1.250 sayısının yüzde 18'i 225 eder efendim.")
  x = await ask('kahvemi şekersiz içerim, unutma')
  assert.deepEqual(x.scenes, ['memory'])
  x = await ask('hakkımda ne biliyorsun')
  assert.match(x.say, /kahvemi şekersiz içerim/)
  x = await ask('kahve bilgisini unut')
  assert.match(x.say, /unuttum/)
  x = await ask('hakkımda ne biliyorsun')
  assert.match(x.say, /Henüz hakkınızda/)
  x = await ask('teşekkürler')
  assert.ok(x.say.length > 5)
  // Yapay zekâ gerektiren soru yerelde çözülmez
  x = await ask('bu haber doğru mu')
  assert.equal(x.r, null)
})

test('günlük özet: hava + haber + maç tek sahnede ve tek konuşmada', async () => {
  board = { events: [ev('1', iso(-1), 'post', ['Fenerbahce', '3'], ['Galatasaray', '1']), ev('2', iso(6), 'pre', ['Besiktas', ''], ['Fenerbahce', ''])] }
  const x = await ask('günlük özet')
  assert.deepEqual(x.scenes, ['briefing'])
  const d = x.events.find((e) => e.scene === 'briefing')!.data
  assert.equal(d.weather.city, 'İstanbul')
  assert.equal(d.news.length, 2)
  assert.equal(d.football.last.home.name, 'Fenerbahçe')
  assert.equal(d.football.next.home.name, 'Beşiktaş')
  assert.match(x.say, /bugün .*\. İstanbul'da hava 14 derece/)
  assert.match(x.say, /Gündemden öne çıkanlar: Merkez Bankası faizi sabit tuttu; Yeni metro hattı açıldı\./)
  assert.match(x.say, /Fenerbahçe dün Galatasaray'ı 3-1 yendi\. Sıradaki maç .* Beşiktaş ile\. İyi bir gün dilerim\.$/)

  // Maç kaynağı çökerse özet yine gelir (maçsız)
  board = { bozuk: true }
  const y = await ask('günaydın')
  assert.match(y.say, /^Günaydın efendim, bugün/)
  assert.doesNotMatch(y.say, /Fenerbahçe/)
  assert.match(y.say, /Gündemden/)
})
