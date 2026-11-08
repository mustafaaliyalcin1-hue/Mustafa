/**
 * DÖVİZ / ALTIN / KRİPTO KOMUTLARI
 *  "dolar ne kadar", "euro kaç lira", "100 dolar kaç TL", "5000 lira kaç euro",
 *  "gram altın", "çeyrek altın ne kadar", "altın yükseldi mi", "bitcoin düştü mü", "piyasalar nasıl"
 * Ekranda grafik + sayaçlar; altında altın külçeleri.
 */
import { getTool } from '../tools/index.ts'
import type { FinanceItem } from '../tools/finance.ts'
import { fmt, hasPhrase, hasStem, lira, parseAmount, type Norm } from './text.ts'
import type { Intent } from './types.ts'

const FX: [string[], string, string][] = [
  [['dolar', 'usd'], 'USD', 'dolar'],
  [['euro', 'avro', 'eur', 'oyro'], 'EUR', 'euro'],
  [['sterlin', 'pound', 'gbp'], 'GBP', 'sterlin'],
  [['frank', 'chf'], 'CHF', 'İsviçre frangı'],
  [['yen', 'jpy'], 'JPY', 'yen'],
  [['riyal'], 'SAR', 'riyal'],
  [['ruble'], 'RUB', 'ruble'],
  [['yuan'], 'CNY', 'yuan'],
]
const CRYPTO: [string[], string, string][] = [
  [['bitcoin', 'btc'], 'BTC', 'Bitcoin'],
  [['ethereum', 'eth', 'eter'], 'ETH', 'Ethereum'],
  [['solana', 'sol'], 'SOL', 'Solana'],
  [['xrp', 'ripple'], 'XRP', 'XRP'],
  [['bnb', 'binance coin'], 'BNB', 'BNB'],
  [['doge', 'dogecoin'], 'DOGE', 'Dogecoin'],
]
/** Ziynet altınların yaklaşık saf altın karşılığı (gram, 24 ayar) — kuyumcu fiyatı biraz farklıdır */
const GOLD: [string[], string, number][] = [
  [['ceyrek'], 'çeyrek altın', 1.6],
  [['yarim'], 'yarım altın', 3.2],
  [['tam altin', 'tam'], 'tam altın', 6.4],
  [['cumhuriyet', 'ata'], 'Cumhuriyet altını', 6.6],
  [['ons'], 'ons altın', 31.1035],
]

const match = (n: Norm, aliases: string[]) => aliases.some((a) => (a.includes(' ') ? n.f.includes(a) : n.words.some((w) => w === a || (a.length >= 4 && w.startsWith(a)))))

interface P extends Record<string, unknown> {
  fx: string[]
  crypto: string[]
  gold?: string // ziynet türü adı
  goldGrams?: number
  convert?: { amount: number; from: string; to: string }
  ask: 'fiyat' | 'yon'
}

export const financeIntent: Intent<P> = {
  name: 'finance',
  detect(n) {
    const fx = FX.filter(([a]) => match(n, a)).map(([, c]) => c)
    const crypto = CRYPTO.filter(([a]) => match(n, a)).map(([, c]) => c)
    const goldWord = hasStem(n, 'altin')
    const markets = hasPhrase(n, 'piyasa', 'borsa', 'doviz', 'kurlar')
    if (!fx.length && !crypto.length && !goldWord && !markets) return null
    if (hasStem(n, 'borsa', 'bist', 'hisse')) return null // BIST için anahtarsız kaynak yok → yapay zekâ arasın
    let gold: string | undefined
    let goldGrams: number | undefined
    if (goldWord) {
      const g = GOLD.find(([a]) => match(n, a))
      gold = g?.[1] ?? 'gram altın'
      goldGrams = g?.[2] ?? 1
    }
    // Çevirme: "100 dolar kaç tl", "5000 lira kaç euro", "250 euro"
    let convert: P['convert']
    const m = n.f.match(/(?:^|\s)(\d[\d.,]*|bir|iki|uc|dort|bes|on|yuz|bin|elli|yirmi)\s*(bin\s*)?(dolar|usd|euro|avro|sterlin|tl|lira|turk lirasi)/)
    if (m) {
      let amount = parseAmount(m[1]) ?? 1
      if (m[2]) amount *= 1000
      const fromTL = /^(tl|lira|turk)/.test(m[3])
      const target = fx[0] || 'USD'
      convert = fromTL ? { amount, from: 'TRY', to: target } : { amount, from: FX.find(([a]) => a.some((x) => m[3].startsWith(x)))?.[1] || target, to: 'TRY' }
    }
    if (!fx.length && !crypto.length && !goldWord) fx.push('USD', 'EUR')
    const ask = hasStem(n, 'yuksel', 'dus', 'art', 'azal', 'cikt', 'indi', 'deger') ? 'yon' : 'fiyat'
    return { fx: [...new Set(fx)], crypto, gold, goldGrams, convert, ask }
  },
  followUp(n, prev) {
    // "peki euro?", "ya altın?"
    const d = this.detect(n, {})
    return d ? { ...d, ask: d.ask === 'fiyat' ? prev.ask : d.ask } : null
  },
  async run(p, emit) {
    const out = await getTool('get_market')!.run({ currencies: p.fx, gold: !!p.gold, crypto: p.crypto })
    const data = out.scene!.data as { items: FinanceItem[]; chart?: unknown }
    emit({ type: 'scene', scene: 'finance', data, hold: 2600 })
    const items = data.items
    const by = (s: string) => items.find((i) => i.symbol === s)
    const dir = (c: number) => (Math.abs(c) < 0.05 ? 'neredeyse değişmedi' : c > 0 ? `yüzde ${fmt(c)} yükseldi` : `yüzde ${fmt(Math.abs(c))} düştü`)
    const parts: string[] = []

    if (p.convert) {
      const { amount, from, to } = p.convert
      if (from === 'TRY') {
        const r = by(to)
        if (r) parts.push(`${fmt(amount, 0)} lira yaklaşık ${fmt(amount / r.price)} ${FX.find((f) => f[1] === to)?.[2] ?? to} ediyor efendim.`)
      } else {
        const r = by(from)
        if (r) parts.push(`${fmt(amount)} ${FX.find((f) => f[1] === from)?.[2] ?? from} yaklaşık ${lira(amount * r.price)} ediyor efendim.`)
      }
      if (parts.length) return parts[0] + ' Kur, Avrupa Merkez Bankası’nın son verisi.'
    }

    for (const code of p.fx) {
      const r = by(code)
      if (!r) continue
      const name = FX.find((f) => f[1] === code)?.[2] ?? code
      parts.push(p.ask === 'yon' ? `${cap(name)} düne göre ${dir(r.change)}, şu an ${lira(r.price)}.` : `${cap(name)} ${lira(r.price)}${Math.abs(r.change) >= 0.05 ? `, düne göre ${dir(r.change)}` : ''}.`)
    }
    if (p.gold) {
      const g = by('GRAM')
      if (g) {
        const price = g.price * (p.goldGrams ?? 1)
        const label = p.gold === 'gram altın' ? 'Gram altın' : p.gold === 'ons altın' ? 'Ons altın' : cap(p.gold)
        parts.push(`${label} ${p.gold === 'gram altın' || p.gold === 'ons altın' ? '' : 'yaklaşık '}${lira(price)}; son 24 saatte ${dir(g.change)}.`)
        if (p.gold !== 'gram altın' && p.gold !== 'ons altın') parts.push('Ziynet altın fiyatı kuyumcuya göre biraz farklı olabilir.')
      }
    }
    for (const code of p.crypto) {
      const r = by(code)
      if (r) parts.push(`${CRYPTO.find((c) => c[1] === code)?.[2]} ${lira(r.price)}; son 24 saatte ${dir(r.change)}.`)
    }
    return parts.length ? parts.join(' ').replace(/\.$/, ' efendim.') : 'Piyasa verilerine şu an ulaşamadım efendim.'
  },
}

const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1)
