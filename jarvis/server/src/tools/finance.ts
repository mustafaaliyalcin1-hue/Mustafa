/**
 * FİNANS — döviz, altın, kripto (tümü ücretsiz ve anahtarsız)
 *  - Döviz: Frankfurter (Avrupa Merkez Bankası kurları)
 *  - Altın: CoinGecko PAX Gold (1 token = 1 ons altın) → gram altın hesaplanır
 *  - Kripto: CoinGecko
 * Borsa (BIST) için anahtarsız güvenilir kaynak yok → Claude web aramasıyla bakar.
 */
import { z } from 'zod'
import { cached } from './cache.ts'
import { getJson } from './http.ts'
import { defineTool } from './registry.ts'

const CRYPTO: Record<string, { id: string; name: string }> = {
  BTC: { id: 'bitcoin', name: 'Bitcoin' },
  ETH: { id: 'ethereum', name: 'Ethereum' },
  SOL: { id: 'solana', name: 'Solana' },
  XRP: { id: 'ripple', name: 'XRP' },
  BNB: { id: 'binancecoin', name: 'BNB' },
  DOGE: { id: 'dogecoin', name: 'Dogecoin' },
  AVAX: { id: 'avalanche-2', name: 'Avalanche' },
}
const FX_NAMES: Record<string, string> = { USD: 'Dolar', EUR: 'Euro', GBP: 'Sterlin', CHF: 'İsviçre Frangı', JPY: 'Japon Yeni', SAR: 'Riyal', RUB: 'Ruble', CNY: 'Yuan' }
const OZ_GRAM = 31.1034768

export interface FinanceItem {
  symbol: string
  name: string
  price: number
  change: number // yüzde, 24 saat / önceki güne göre
  unit: string
}

const iso = (d: Date) => d.toISOString().slice(0, 10)

async function fx(codes: string[], chartCode?: string) {
  const end = new Date()
  const start = new Date(Date.now() - 31 * 864e5)
  const items: FinanceItem[] = []
  let chart: { label: string; points: number[] } | undefined
  for (const code of codes) {
    const h = await getJson<{ rates: Record<string, { TRY: number }> }>(`https://api.frankfurter.dev/v1/${iso(start)}..${iso(end)}?base=${code}&symbols=TRY`)
    const series = Object.keys(h.rates)
      .sort()
      .map((d) => h.rates[d].TRY)
    const last = series.at(-1)!
    const prev = series.at(-2) ?? last
    items.push({ symbol: code, name: FX_NAMES[code] || code, price: last, change: ((last - prev) / prev) * 100, unit: '₺' })
    if (!chart && (!chartCode || chartCode === code)) chart = { label: `${code}/TRY · 30 gün`, points: series }
  }
  return { items, chart }
}

/** Altın/kripto: önce CoinGecko, sınırlanırsa (429) Binance açık piyasa verisi */
async function crypto(symbols: string[], withGold: boolean) {
  try {
    return await coingecko(symbols, withGold)
  } catch (e) {
    console.warn(`[finans] CoinGecko başarısız (${(e as Error).message}) → Binance`)
    return binance(symbols, withGold)
  }
}

const BINANCE_HOSTS = ['https://data-api.binance.vision', 'https://api.binance.com']
async function binanceGet<T>(path: string): Promise<T> {
  let last: unknown
  for (const h of BINANCE_HOSTS) {
    try {
      return await getJson<T>(h + path)
    } catch (e) {
      last = e
    }
  }
  throw last
}

/** Binance: kripto/TRY çiftleri doğrudan; altın = PAXG/USDT × USDT/TRY (1 PAXG = 1 ons altın) */
export async function binance(symbols: string[], withGold: boolean) {
  const pairs = [...symbols.filter((s) => CRYPTO[s]).map((s) => `${s}TRY`), ...(withGold ? ['PAXGUSDT', 'USDTTRY'] : [])]
  if (!pairs.length) return { items: [] as FinanceItem[], chart: undefined }
  const t = await binanceGet<{ symbol: string; lastPrice: string; priceChangePercent: string }[]>(`/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`)
  const by = (p: string) => t.find((x) => x.symbol === p)
  const items: FinanceItem[] = []
  for (const s of symbols) {
    const r = by(`${s}TRY`)
    if (r && CRYPTO[s]) items.push({ symbol: s, name: CRYPTO[s].name, price: Number(r.lastPrice), change: Number(r.priceChangePercent), unit: '₺' })
  }
  let chart: { label: string; points: number[] } | undefined
  const usdtry = Number(by('USDTTRY')?.lastPrice || 0)
  const paxg = by('PAXGUSDT')
  if (withGold && paxg && usdtry) {
    const oz = Number(paxg.lastPrice) * usdtry
    const ch = Number(paxg.priceChangePercent)
    items.unshift({ symbol: 'GRAM', name: 'Gram Altın', price: oz / OZ_GRAM, change: ch, unit: '₺' }, { symbol: 'ONS', name: 'Ons Altın', price: oz, change: ch, unit: '₺' })
  }
  try {
    const sym = withGold ? 'PAXGUSDT' : `${symbols[0]}TRY`
    const k = await binanceGet<[number, string, string, string, string][]>(`/api/v3/klines?symbol=${sym}&interval=1d&limit=30`)
    chart = { label: `${withGold ? 'Gram altın' : items[0]?.name} · 30 gün`, points: k.map((x) => (withGold ? (Number(x[4]) * usdtry) / OZ_GRAM : Number(x[4]))) }
  } catch {
    /* grafik isteğe bağlı */
  }
  return { items, chart }
}

async function coingecko(symbols: string[], withGold: boolean) {
  const ids = symbols.map((s) => CRYPTO[s]?.id).filter(Boolean) as string[]
  if (withGold) ids.push('pax-gold')
  if (!ids.length) return { items: [] as FinanceItem[], chart: undefined }
  const p = await getJson<Record<string, { try: number; try_24h_change: number }>>(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=try&include_24hr_change=true`)
  const items: FinanceItem[] = []
  for (const s of symbols) {
    const c = CRYPTO[s]
    if (c && p[c.id]) items.push({ symbol: s, name: c.name, price: p[c.id].try, change: p[c.id].try_24h_change, unit: '₺' })
  }
  if (withGold && p['pax-gold']) {
    const oz = p['pax-gold'].try
    items.unshift({ symbol: 'GRAM', name: 'Gram Altın', price: oz / OZ_GRAM, change: p['pax-gold'].try_24h_change, unit: '₺' }, { symbol: 'ONS', name: 'Ons Altın', price: oz, change: p['pax-gold'].try_24h_change, unit: '₺' })
  }
  // İlk varlık için 30 günlük grafik
  const first = withGold ? 'pax-gold' : ids[0]
  let chart: { label: string; points: number[] } | undefined
  try {
    const mc = await getJson<{ prices: [number, number][] }>(`https://api.coingecko.com/api/v3/coins/${first}/market_chart?vs_currency=try&days=30&interval=daily`)
    chart = { label: `${withGold ? 'Gram altın' : items[0]?.name} · 30 gün`, points: mc.prices.map(([, v]) => (withGold ? v / OZ_GRAM : v)) }
  } catch {
    /* grafik isteğe bağlı */
  }
  return { items, chart }
}

defineTool({
  name: 'get_market',
  description:
    'Anlık döviz kurları (TL karşılığı), gram/ons altın ve kripto para fiyatları, 24 saatlik değişim ve 30 günlük grafik. Borsa İstanbul hisseleri için bu aracı değil web_search kullan.',
  schema: z.object({
    currencies: z.array(z.string()).optional().describe('Döviz kodları, ör. ["USD","EUR"]'),
    gold: z.boolean().optional().describe('Altın fiyatı da isteniyorsa true'),
    crypto: z.array(z.string()).optional().describe('Kripto sembolleri, ör. ["BTC","ETH"]'),
  }),
  pendingScene: { scene: 'finance', data: { items: [] } },
  async run({ currencies, gold, crypto: cr }) {
    const fxCodes = (currencies || []).map((c) => c.toUpperCase()).filter((c) => c !== 'TRY')
    const crCodes = (cr || []).map((c) => c.toUpperCase())
    if (!fxCodes.length && !gold && !crCodes.length) fxCodes.push('USD', 'EUR')
    const [a, b] = await Promise.all([
      fxCodes.length ? cached(`fx:${fxCodes.join(',')}`, 10 * 60_000, () => fx(fxCodes)) : null,
      gold || crCodes.length ? cached(`cr:${crCodes.join(',')}:${!!gold}`, 60_000, () => crypto(crCodes, !!gold)) : null,
    ])
    const items = [...(a?.items || []), ...(b?.items || [])]
    const chart = (gold ? b?.chart : a?.chart) || a?.chart || b?.chart
    const data = { items, chart }
    return { result: { items: items.map((i) => ({ ...i, price: Number(i.price.toFixed(i.price > 100 ? 0 : 4)), change: Number(i.change.toFixed(2)) })), note: 'Döviz: ECB kurları (gün sonu). Altın: PAXG üzerinden hesaplanmıştır, kuyumcu fiyatından biraz farklı olabilir.' }, scene: { scene: 'finance', data, hold: 2600 } }
  },
})
