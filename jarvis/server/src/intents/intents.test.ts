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
process.env.DEFAULT_CITY = 'İstanbul'

const { recognize, tryLocal } = await import('./index.ts')
const { clearCache } = await import('../tools/cache.ts')
const { ekle, extractPlace, norm, extractDayOffset } = await import('./text.ts')
const { evaluate } = await import('./calc.ts')
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
  ['havaalanına nasıl giderim', 'route'],
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
  ["1250'nin yüzde 18'i", 'calc', { kind: 'yuzde', a: 1250, b: 18 }],
  ['karekök 144', 'calc', { kind: 'kisayol', a: 144 }],
  ['yüz yirmi beş artı otuz', 'calc', { expr: '125 + 30' }],
  ['iki bin beş yüz bölü elli', 'calc', { expr: '2500 / 50' }],
  ["5000'e yüzde 20 zam", 'calc', { kind: 'zam', a: 5000, b: 20 }],
  ["800'den yüzde 15 indirim", 'calc', { kind: 'indirim', a: 800, b: 15 }],
  ["1000 liranın kdv'si ne kadar", 'calc', { kind: 'kdv', a: 1000, b: 20 }],
  ["kdv dahil 1200'ün kdv hariç fiyatı", 'calc', { kind: 'kdvic', a: 1200 }],
  ["50, 200'ün yüzde kaçı", 'calc', { kind: 'kacyuzde', a: 50, b: 200 }],
  ['3, 5 ve 10 un ortalaması', 'calc', { kind: 'ortalama' }],
  ["120'yi 7'ye böl", 'calc', { expr: '120/7' }],
  ["100'den 37'yi çıkar", 'calc', { expr: '100-37' }],
  ["15 ile 27'yi topla", 'calc', { expr: '15+27' }],
  ["360'ın yarısı", 'calc', { kind: 'kisayol', a: 360 }],
  ['5 faktöriyel', 'calc', { expr: '5!' }],
  ['12 kere 12 kaç eder', 'calc', { expr: '12 * 12' }],
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
  ["Kadıköy'e ne kadar sürer", 'route', { to: "Kadıköy'e", walk: false }],
  ["Taksim'den Kadıköy'e nasıl giderim", 'route', { from: 'Taksim', to: "Kadıköy'e" }],
  ['Ankara ile İzmir arası kaç km', 'route', { from: 'Ankara', to: 'İzmir' }],
  ["Galata Kulesi'ne yürüyerek ne kadar sürer", 'route', { walk: true }],
  ['elmayı İngilizceye çevir', 'translate', { text: 'elma', to: 'en', from: 'tr' }],
  ['teşekkürler Almanca ne demek', 'translate', { text: 'teşekkürler', to: 'de', from: 'tr' }],
  ['İngilizcede kitap ne demek', 'translate', { text: 'kitap', to: 'en' }],
  ['serendipity ne demek', 'translate', { text: 'serendipity', to: 'tr', from: 'en' }],
  ['"Nasılsın, iyi misin?" cümlesini İngilizceye çevir', 'translate', { to: 'en' }],
  ['Elazığspor maçı kaç bitti', null], // 2. Lig → yapay zekâ + internet araması
  ['2. lig puan durumu', null],
  ['ikinci lig sonuçları', null],
  ['1461 Trabzon kazandı mı', null],
  ['Fenerbahçe ile ilgili bu haber gerçekmi', null], // bitişik yazım → doğrulama (yapay zekâ)
  ['bu haber doğrumu', null],
  ['Fener yeni hoca aldı yalanmı', null],
  ['bu iddianın aslı var mı', null],
  ["Amedspor'un maçı ne zaman", 'football', { team: 'amedspor', display: 'Amedspor', ask: 'siradaki' }],
  ['Bandırmaspor kazandı mı', 'football', { display: 'Bandırmaspor', generic: true }],
  ['Keçiörengücü maçı', 'football', { display: 'Keçiörengücü' }],
  ['1. lig puan durumu', 'football', { league: 'birinci_lig', ask: 'puan' }],
  ['premier lig sonuçları', 'football', { league: 'premier_lig', ask: 'liste' }],
  ['bugün hangi maçlar var', 'football', { league: 'super_lig', ask: 'liste' }],
  ['Galatasaray şampiyonlar ligi maçı ne zaman', 'football', { team: 'Galatasaray', league: 'sampiyonlar_ligi', ask: 'siradaki' }],
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
let board2: unknown = { events: [] }
const RSS = `<rss><channel><item><title>Merkez Bankası faizi sabit tuttu - AA</title><link>https://x/1</link><pubDate>Sun, 08 Nov 2026 10:00:00 GMT</pubDate><source url="https://aa.com.tr">AA</source></item><item><title>Yeni metro hattı açıldı - NTV</title><link>https://x/2</link><pubDate>Sun, 08 Nov 2026 09:00:00 GMT</pubDate><source url="https://ntv.com.tr">NTV</source></item></channel></rss>`
globalThis.fetch = (async (url: string) => {
  const u = String(url)
  const J = (o: unknown) => new Response(JSON.stringify(o))
  // ESPN: takım listeleri + takım fikstürü + skor tabloları
  if (/\/teams$/.test(u)) return J({ sports: [{ leagues: [{ teams: u.includes('tur.1') ? [{ team: { id: '1', displayName: 'Fenerbahce' } }, { team: { id: '2', displayName: 'Galatasaray' } }] : u.includes('tur.2') ? [{ team: { id: '77', displayName: 'Bandirmaspor' } }] : [] }] }] })
  if (u.includes('/schedule')) return J(u.includes('fixture=true') ? { events: [] } : u.includes('/teams/77/') ? board2 : board)
  if (u.includes('soccer') && u.includes('scoreboard')) return J(u.includes('uefa') ? { events: [] } : u.includes('tur.1') ? board : u.includes('tur.2') ? board2 : { events: [] })
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
  if (u.includes('nominatim')) {
    const q = decodeURIComponent(u.match(/q=([^&]+)/)![1]).toLocaleLowerCase('tr-TR')
    const known: Record<string, [number, number]> = { 'kadıköy': [40.99, 29.03], 'taksim': [41.037, 28.985], 'istanbul': [41.0082, 28.9784], 'i̇stanbul': [41.0082, 28.9784], ankara: [39.93, 32.86], 'izmir': [38.42, 27.14], 'i̇zmir': [38.42, 27.14] }
    const k = known[q]
    return J(k ? [{ lat: String(k[0]), lon: String(k[1]), display_name: q }] : [])
  }
  if (u.includes('router.project-osrm.org')) return J({ code: 'Ok', routes: [{ distance: 14230, duration: 1500, geometry: { coordinates: [[29.0, 41.0], [29.02, 41.0], [29.03, 40.99]] } }] })
  if (u.includes('mymemory')) {
    const q = decodeURIComponent(u.match(/q=([^&]+)/)![1])
    const dict: Record<string, string> = { elma: 'apple', teşekkürler: 'Danke', kitap: 'book', serendipity: 'tesadüfi şans', 'Nasılsın, iyi misin?': 'How are you, are you okay?' }
    return J({ responseStatus: 200, responseData: { translatedText: dict[q] ?? q } })
  }
  return new Response('yok', { status: 404 })
}) as typeof fetch

async function ask(text: string, conv = 'c-' + Math.random()) {
  clearCache() // her soru güncel sahte veriyle
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

test('hesap: cevaplar, ekler ve önceki sonuçla devam', async () => {
  const { iyelik } = await import('./calc.ts')
  assert.deepEqual([20, 30, 25, 100, 18, 40, 6, 1000].map(iyelik), ['si', 'u', 'i', 'ü', 'i', 'ı', 'sı', 'i'])
  let x = await ask("5000'e yüzde 20 zam", 'h1')
  assert.deepEqual(x.scenes, ['calc'])
  assert.equal(x.say, '5.000 sayısına yüzde 20 zam yapılınca 6.000 olur efendim; artış 1.000.')
  x = await ask("800'den yüzde 15 indirim")
  assert.equal(x.say, '800 sayısından yüzde 15 indirimle 680 olur efendim; indirim tutarı 120.')
  x = await ask("1000 liranın kdv'si ne kadar")
  assert.equal(x.say, 'Yüzde 20 KDV ile birlikte 1.200 eder efendim; KDV tutarı 200.')
  x = await ask("kdv dahil 1200'ün kdv hariç fiyatı")
  assert.equal(x.say, 'KDV hariç tutar 1.000 efendim; içindeki yüzde 20 KDV 200.')
  x = await ask("200'ün yüzde 30'u")
  assert.equal(x.say, "200 sayısının yüzde 30'u 60 eder efendim.")
  x = await ask("50, 200'ün yüzde kaçı")
  assert.equal(x.say, "50, 200 sayısının yüzde 25'i ediyor efendim.")
  x = await ask('yüz yirmi beş artı otuz')
  assert.equal(x.say, 'Sonuç 155 efendim.')
  x = await ask('5 faktöriyel')
  assert.equal(x.say, '5 sayısının faktöriyeli 120 efendim.')
  // Devam: önceki sonuç üzerinden
  x = await ask('12 kere 12', 'zincir')
  assert.equal(x.say, 'Sonuç 144 efendim.')
  x = await ask('artı 6', 'zincir')
  assert.equal(x.say, 'Sonuç 150 efendim.')
  x = await ask("bunu 3'e böl", 'zincir')
  assert.equal(x.say, 'Sonuç 50 efendim.')
  x = await ask("sonucun yüzde 20'si", 'zincir')
  assert.equal(x.say, "50 sayısının yüzde 20'si 10 eder efendim.")
  x = await ask('2 ile çarp', 'zincir')
  assert.equal(x.say, 'Sonuç 20 efendim.')
  const sc = x.events.find((e) => e.scene === 'calc')!.data
  assert.equal(sc.result, 20)
  assert.equal(sc.expr, '10 × 2')
})

test('tüm takımlar: alt lig takımı, bulunamayan takım asla Fenerbahçe sonucu vermez, lig listesi', async () => {
  board = { events: [ev('1', iso(-1), 'post', ['Fenerbahce', '3'], ['Galatasaray', '1']), ev('5', iso(-1), 'post', ['Konyaspor', '0'], ['Kasimpasa', '2'])] }
  board2 = { events: [ev('7', iso(-1), 'post', ['Sivasspor', '1'], ['Bandirmaspor', '2'])] }
  // 1. Lig takımı bulunur
  let x = await ask('Bandırmaspor kazandı mı')
  assert.deepEqual(x.scenes, ['sports'])
  assert.match(x.say, /Bandırmaspor dün Sivasspor'u 2-1 yendi/)
  assert.doesNotMatch(x.say, /Fenerbahçe/)
  // Hiçbir ligde olmayan takım → yerelde cevap yok (yapay zekâ internetten bulur), Fenerbahçe gösterilmez
  x = await ask('Muşspor maçı kaç bitti')
  assert.equal(x.r, null)
  assert.deepEqual(x.scenes, [])
  // Lig listesi
  x = await ask('süper lig sonuçları')
  assert.deepEqual(x.scenes, ['sports'])
  assert.match(x.say, /^Süper Lig'de son oynanan maçlar efendim: Fenerbahçe 3, Galatasaray 1; Konyaspor 0, Kasımpaşa 2\.$/)
  x = await ask('1. lig sonuçları')
  assert.match(x.say, /^1\. Lig'de son oynanan maçlar efendim: Sivasspor 1, Bandırmaspor 2\.$/)
  // Lig puan durumu
  x = await ask('süper lig puan durumu')
  assert.match(x.say, /^Süper Lig puan durumu efendim: 1\. Galatasaray 31 puan, 2\. Fenerbahçe 29 puan\.$/)
})

test('doğrulama isteği algılanır (bitişik yazımlar dahil)', async () => {
  const { isFactCheck } = await import('./text.ts')
  for (const t of ['bu gerçek mi', 'bu haber gerçekmi', 'doğrumu bu', 'yalanmı', 'sahte mi bu video', 'bunu teyit et', 'aslı var mı']) assert.equal(isFactCheck(t), true, t)
  for (const t of ['gündem haberleri', 'hava nasıl', 'gerçekten çok güzel']) assert.equal(isFactCheck(t), false, t)
})

test('yol ve çeviri cevapları', async () => {
  let x = await ask("Kadıköy'e ne kadar sürer")
  assert.deepEqual(x.scenes, ['map'])
  assert.equal(x.say, "Kadıköy'e arabayla yaklaşık 25 dakika efendim; 14,2 kilometre. Bu, trafiksiz bir tahmin.")
  const m = x.events.find((e) => e.scene === 'map')!.data
  assert.equal(m.path.length, 3)
  assert.deepEqual(m.path[0], [41.0, 29.0]) // [enlem, boylam]
  x = await ask("Taksim'den Kadıköy'e nasıl giderim")
  assert.match(x.say, /^Taksim'den Kadıköy'e arabayla/)
  x = await ask('Kadıköye yürüyerek ne kadar sürer')
  assert.match(x.say, /^Kadıköy'e yürüyerek yaklaşık 2 saat 58 dakika efendim; 14,2 kilometre\.$/)
  x = await ask('elmayı İngilizceye çevir')
  assert.deepEqual(x.scenes, ['translate'])
  assert.equal(x.say, '"elma" İngilizcede "apple" efendim.')
  x = await ask('teşekkürler Almanca ne demek')
  assert.equal(x.say, '"teşekkürler" Almancada "Danke" efendim.')
  x = await ask('serendipity ne demek')
  assert.equal(x.say, '"serendipity" Türkçede "tesadüfi şans" efendim.')
})
