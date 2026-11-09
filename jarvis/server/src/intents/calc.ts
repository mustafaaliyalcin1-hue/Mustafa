/**
 * HESAP MAKİNESİ KOMUTLARI (yapay zekâsız)
 *  Dört işlem     : "15 çarpı 23", "yüz yirmi beş artı otuz", "(12+8)/4", "2 üzeri 10", "120'yi 7'ye böl"
 *  Yüzde          : "1250'nin yüzde 18'i", "50, 200'ün yüzde kaçı"
 *  Zam / indirim  : "5000'e yüzde 20 zam", "800'den yüzde 15 indirim"
 *  KDV            : "1000 liranın KDV'si", "KDV dahil 1200'ün KDV hariç fiyatı", "yüzde 10 KDV ile 500"
 *  Kısayollar     : yarısı, çeyreği, üçte biri, iki katı, karesi, küpü, karekök, faktöriyel, ortalama
 *  Devam etme     : önceki sonuçla → "artı 5", "bunu 2'ye böl", "sonucun yüzde 20'si", "3 ile çarp"
 * Ekranda sayılar süzülüp birleşir, sonuç büyük puntoyla belirir.
 */
import { fmt, type Norm } from './text.ts'
import type { Intent } from './types.ts'

// ---------------------------------------------------------- yazıyla sayılar
const UNITS: Record<string, number> = { sifir: 0, bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9 }
const TENS: Record<string, number> = { on: 10, yirmi: 20, otuz: 30, kirk: 40, elli: 50, altmis: 60, yetmis: 70, seksen: 80, doksan: 90 }
const BIG: Record<string, number> = { bin: 1e3, milyon: 1e6, milyar: 1e9 }

/** "yüz yirmi beş artı iki bin" → "125 artı 2000" (sadeleştirilmiş metin üzerinde) */
export function wordsToNumbers(f: string): string {
  const out: string[] = []
  let total = 0
  let cur = 0
  let active = false
  let decimal: string | null = null
  const flush = () => {
    if (!active) return
    let v = total + cur
    if (decimal !== null) v = Number(`${v}.${decimal}`)
    out.push(String(v))
    total = cur = 0
    active = false
    decimal = null
  }
  for (const raw of f.split(' ')) {
    const [w, suffix] = raw.includes("'") ? [raw.split("'")[0], "'" + raw.split("'").slice(1).join("'")] : [raw, '']
    if (w in UNITS || w in TENS || w === 'yuz' || w in BIG) {
      if (decimal !== null) {
        decimal += String(UNITS[w] ?? TENS[w] ?? '')
      } else if (w in UNITS) cur += UNITS[w]
      else if (w in TENS) cur += TENS[w]
      else if (w === 'yuz') cur = (cur || 1) * 100
      else {
        total += (cur || 1) * BIG[w]
        cur = 0
      }
      active = true
      if (suffix) {
        flush()
        out[out.length - 1] += suffix
      }
      continue
    }
    if (w === 'virgul' && active) {
      decimal = ''
      continue
    }
    if (w === 'bucuk' && active) {
      cur += 0.5
      continue
    }
    flush()
    out.push(raw)
  }
  flush()
  return out.join(' ')
}

// ------------------------------------------------------------ güvenli çözücü
const WORD_OPS: [RegExp, string][] = [
  [/\barti\b|\btopla\w*/g, '+'],
  [/\beksi\b/g, '-'],
  [/\b(carpi|kere|carp\w*)\b|×|\bx\b/g, '*'],
  [/\b(bolu|bol\w*)\b|÷|:/g, '/'],
  [/\b(uzeri|ussu|kuvveti)\b/g, '^'],
]

/** Güvenli matematik (eval yok): + - * / ^ ! √ ve parantez */
export function evaluate(expr: string): number {
  const s = expr.replace(/\s+/g, '').replace(/√/g, 'r')
  let i = 0
  const peek = () => s[i]
  const fact = (n: number) => {
    if (n < 0 || n > 170 || !Number.isInteger(n)) throw new Error('faktöriyel')
    let r = 1
    for (let k = 2; k <= n; k++) r *= k
    return r
  }
  const atom = (): number => {
    if (peek() === '(') {
      i++
      const v = add()
      if (s[i++] !== ')') throw new Error('parantez')
      return v
    }
    if (peek() === '-') {
      i++
      return -atom()
    }
    if (peek() === 'r') {
      i++
      return Math.sqrt(atom())
    }
    const m = s.slice(i).match(/^\d+(\.\d+)?/)
    if (!m) throw new Error('sayı')
    i += m[0].length
    return Number(m[0])
  }
  const post = (): number => {
    let v = atom()
    while (peek() === '!') {
      i++
      v = fact(v)
    }
    return v
  }
  const pow = (): number => {
    const b = post()
    if (peek() === '^') {
      i++
      return b ** pow()
    }
    return b
  }
  const mul = (): number => {
    let v = pow()
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = s[i++]
      const r = pow()
      v = op === '*' ? v * r : op === '/' ? v / r : v % r
    }
    return v
  }
  const add = (): number => {
    let v = mul()
    while (peek() === '+' || peek() === '-') {
      const op = s[i++]
      const r = mul()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  const v = add()
  if (i < s.length) throw new Error('fazla')
  return v
}

// ------------------------------------------------------------------- tanıma
const N = "(\\d+(?:[.,]\\d+)*)"
const toNum = (x: string) => (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(x) ? Number(x.replace(/\./g, '').replace(',', '.')) : Number(x.replace(',', '.')))
const nums = (t: string) => [...t.matchAll(new RegExp(N, 'g'))].map((m) => toNum(m[1]))

type Kind = 'ifade' | 'yuzde' | 'zam' | 'indirim' | 'kdv' | 'kdvic' | 'kacyuzde' | 'ortalama' | 'kisayol'
export interface CalcP extends Record<string, unknown> {
  kind: Kind
  expr: string // çözülecek ifade
  shown: string // ekranda gösterilecek ifade
  a?: number
  b?: number
  label?: string
  result?: number // çalışınca doldurulur (devam etmek için)
}

const pretty = (e: string) => e.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/(\d)-/g, '$1 − ').replace(/\+/g, ' + ').replace(/\^/g, '^').replace(/\s+/g, ' ').trim()

/** Sadeleştirilmiş metinden hesap isteği çıkar */
export function parseCalc(t: string): CalcP | null {
  let m: RegExpMatchArray | null
  // KDV
  if (/\bkdv/.test(t)) {
    const rate = Number(t.match(/yuzde\s*(\d+)\s*kdv/)?.[1] || t.match(/kdv\w*\s*(?:orani)?\s*yuzde\s*(\d+)/)?.[1] || 20)
    const all = nums(t).filter((x) => x !== rate)
    if (all.length) {
      const x = all[0]
      const inside = /haric|icinden|dahil\w*.*haric/.test(t) && /dahil|icinden|haric/.test(t)
      if (inside) return { kind: 'kdvic', expr: `${x}/(1+${rate}/100)`, shown: `${fmt(x)} ÷ ${1 + rate / 100}`, a: x, b: rate }
      return { kind: 'kdv', expr: `${x}*(1+${rate}/100)`, shown: `${fmt(x)} × ${1 + rate / 100}`, a: x, b: rate }
    }
  }
  // Zam / indirim
  if ((m = t.match(new RegExp(`${N}'?\\w*\\s+(?:yuzde|%)\\s*${N}'?\\w*\\s*(zam|art|fazla|indirim|eksi|az|dus)`))) || (m = t.match(new RegExp(`(?:yuzde|%)\\s*${N}\\s*(zam|artis|fazla|indirim)\\w*\\s+${N}`)))) {
    const swap = !/^\d/.test(m[0]) // ikinci kalıpta sıra farklı
    const x = toNum(swap ? m[3] : m[1])
    const p = toNum(swap ? m[1] : m[2])
    const up = /^(zam|art|fazla)/.test(swap ? m[2] : m[3])
    return up ? { kind: 'zam', expr: `${x}*(1+${p}/100)`, shown: `${fmt(x)} + %${fmt(p)}`, a: x, b: p } : { kind: 'indirim', expr: `${x}*(1-${p}/100)`, shown: `${fmt(x)} − %${fmt(p)}`, a: x, b: p }
  }
  // "50, 200'ün yüzde kaçı"
  if ((m = t.match(new RegExp(`${N}[\\s,]+${N}'?\\w*\\s+yuzde kaci`)))) {
    const a = toNum(m[1])
    const b = toNum(m[2])
    return { kind: 'kacyuzde', expr: `${a}/${b}*100`, shown: `${fmt(a)} ÷ ${fmt(b)} × 100`, a, b }
  }
  // Yüzde: "1250'nin yüzde 18'i" / "yüzde 18'i 1250"
  if ((m = t.match(new RegExp(`${N}'?\\w*\\s+(?:yuzde|%)\\s*${N}`)))) {
    const x = toNum(m[1])
    const p = toNum(m[2])
    return { kind: 'yuzde', expr: `${x}*${p}/100`, shown: `${fmt(x)} × %${fmt(p)}`, a: x, b: p }
  }
  if ((m = t.match(new RegExp(`(?:yuzde|%)\\s*${N}'?\\w*\\s+${N}`)))) {
    const p = toNum(m[1])
    const x = toNum(m[2])
    return { kind: 'yuzde', expr: `${x}*${p}/100`, shown: `${fmt(x)} × %${fmt(p)}`, a: x, b: p }
  }
  // Ortalama
  if (/ortalama/.test(t)) {
    const all = nums(t)
    if (all.length >= 2) return { kind: 'ortalama', expr: `(${all.join('+')})/${all.length}`, shown: `(${all.map((x) => fmt(x)).join(' + ')}) ÷ ${all.length}` }
  }
  // Kısayollar
  const short: [RegExp, (x: number) => string, string][] = [
    [new RegExp(`${N}'?\\w*\\s+yarisi`), (x) => `${x}/2`, 'yarısı'],
    [new RegExp(`${N}'?\\w*\\s+ceyregi`), (x) => `${x}/4`, 'çeyreği'],
    [new RegExp(`${N}'?\\w*\\s+(?:ucte biri|ucte 1)`), (x) => `${x}/3`, 'üçte biri'],
    [new RegExp(`${N}'?\\w*\\s+(?:iki|2) kati`), (x) => `${x}*2`, 'iki katı'],
    [new RegExp(`${N}'?\\w*\\s+(?:uc|3) kati`), (x) => `${x}*3`, 'üç katı'],
    [new RegExp(`${N}'?\\w*\\s+karesi`), (x) => `${x}^2`, 'karesi'],
    [new RegExp(`${N}'?\\w*\\s+kupu`), (x) => `${x}^3`, 'küpü'],
    [new RegExp(`${N}'?\\w*\\s+karekok`), (x) => `√${x}`, 'karekökü'],
    [new RegExp(`karekok\\w*\\s*${N}`), (x) => `√${x}`, 'karekökü'],
    [new RegExp(`${N}'?\\w*\\s+faktoriyel`), (x) => `${x}!`, 'faktöriyeli'],
  ]
  for (const [re, f, label] of short) {
    if ((m = t.match(re))) {
      const x = toNum(m[1])
      return { kind: 'kisayol', expr: f(x), shown: f(x).replace('*', ' × ').replace('/', ' ÷ '), a: x, label }
    }
  }
  // Fiil kalıpları: "120'yi 7'ye böl", "8 ile 9'u çarp", "15 ile 27'yi topla", "100'den 37'yi çıkar"
  if ((m = t.match(new RegExp(`${N}'?\\w*\\s+${N}'?\\w*\\s+bol`)))) return expr(`${toNum(m[1])}/${toNum(m[2])}`)
  if ((m = t.match(new RegExp(`${N}'?\\w*\\s+ile\\s+${N}'?\\w*\\s+carp`)))) return expr(`${toNum(m[1])}*${toNum(m[2])}`)
  if ((m = t.match(new RegExp(`${N}'?\\w*\\s+ile\\s+${N}'?\\w*\\s+topla`)))) return expr(`${toNum(m[1])}+${toNum(m[2])}`)
  if ((m = t.match(new RegExp(`${N}'?(?:den|dan|ten|tan)\\s+${N}'?\\w*\\s+cikar`)))) return expr(`${toNum(m[1])}-${toNum(m[2])}`)
  if ((m = t.match(new RegExp(`${N}'?\\w*\\s+${N}'?(?:den|dan|ten|tan)\\s+cikar`)))) return expr(`${toNum(m[2])}-${toNum(m[1])}`)
  if ((m = t.match(new RegExp(`${N}'?\\w*\\s+mod\\s+${N}`))) || (m = t.match(new RegExp(`${N}'?\\w*\\s+${N}'?\\w*\\s+bolumunden kalan`)))) return expr(`${toNum(m[1])}%${toNum(m[2])}`)
  // Serbest ifade
  let e = t.replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2')
  for (const [re, op] of WORD_OPS) e = e.replace(re, op)
  const mm = e.match(/[\d(√-][\d\s.+\-*/^()!√%]*[\d)!]/)
  if (!mm || !/\d/.test(mm[0])) return null
  const body = mm[0].trim()
  if (!/[+*/^!√%]|\s-\s|\d-\d/.test(body)) return null
  return expr(body)
}
const expr = (e: string): CalcP => ({ kind: 'ifade', expr: e, shown: pretty(e) })

const CALC_WORDS = /(arti|eksi|carp|bol|kere|uzeri|yuzde|kdv|zam|indirim|ortalama|karekok|karesi|kupu|yarisi|ceyregi|kati|faktoriyel|hesapla|kac eder|kac yapar|topla|cikar|mod\b|kalan|[+*/^=×÷√!%]|\d\s*-\s*\d)/

export const calcIntent: Intent<CalcP> = {
  name: 'calc',
  detect(n: Norm) {
    if (!CALC_WORDS.test(n.f)) return null
    if (/(dolar|euro|avro|sterlin|altin|bitcoin)/.test(n.f) && !/kdv|zam|indirim/.test(n.f)) return null // döviz çevirisi finance'ta
    return parseCalc(wordsToNumbers(n.f))
  },
  followUp(n, prev) {
    if (prev.result === undefined || !Number.isFinite(prev.result)) return null
    const r = String(Number(prev.result.toFixed(10)))
    let t = wordsToNumbers(n.f).replace(/^(peki|ve|o zaman)\s+/, '')
    // "bunu / sonucu / bunun" → önceki sonuç
    t = t.replace(/\b(bunu|bunun|buna|sonucu|sonucun|sonuca|cevabi|cevabin)\b/g, `${r}'`)
    // Operatörle başlıyorsa önceki sonuçtan devam: "artı 5", "× 3", "2 ile çarp" (tek sayı)
    let e = t
    for (const [re, op] of WORD_OPS) e = e.replace(re, op)
    if (/^[+\-*/^%]/.test(e.trim())) return parseCalc(`${r} ${e.trim()}`) ?? null
    if ((t.match(/\d+/g) || []).length === 1 && /(ile carp|ile bol|ekle|cikar|bol|carp)/.test(t)) {
      const x = t.match(/(\d+(?:[.,]\d+)?)/)![1]
      if (/ile carp|carp/.test(t)) return parseCalc(`${r} * ${x}`)
      if (/ile bol|bol/.test(t)) return parseCalc(`${r} / ${x}`)
      if (/ekle/.test(t)) return parseCalc(`${r} + ${x}`)
      if (/cikar/.test(t)) return parseCalc(`${r} - ${x}`)
    }
    return t.includes(r) ? parseCalc(t) : null
  },
  async run(p, emit) {
    let r: number
    try {
      r = evaluate(p.expr)
    } catch {
      return 'Bu işlemi çözemedim efendim, tekrar söyler misiniz?'
    }
    if (!Number.isFinite(r)) return 'Sıfıra bölme tanımsızdır efendim; matematik bu konuda oldukça katıdır.'
    p.result = r
    const R = fmt(r, 4)
    emit({ type: 'scene', scene: 'calc', data: { expr: p.shown, result: r, label: labelOf(p) }, hold: 1500 })
    const ek = (x: number) => "'" + iyelik(x)
    switch (p.kind) {
      case 'yuzde':
        return `${fmt(p.a!)} sayısının yüzde ${fmt(p.b!)}${ek(p.b!)} ${R} eder efendim.`
      case 'zam':
        return `${fmt(p.a!)} sayısına yüzde ${fmt(p.b!)} zam yapılınca ${R} olur efendim; artış ${fmt(r - p.a!, 2)}.`
      case 'indirim':
        return `${fmt(p.a!)} sayısından yüzde ${fmt(p.b!)} indirimle ${R} olur efendim; indirim tutarı ${fmt(p.a! - r, 2)}.`
      case 'kdv':
        return `Yüzde ${p.b} KDV ile birlikte ${R} eder efendim; KDV tutarı ${fmt(r - p.a!, 2)}.`
      case 'kdvic':
        return `KDV hariç tutar ${R} efendim; içindeki yüzde ${p.b} KDV ${fmt(p.a! - r, 2)}.`
      case 'kacyuzde':
        return `${fmt(p.a!)}, ${fmt(p.b!)} sayısının yüzde ${fmt(r, 2)}${ek(r)} ediyor efendim.`
      case 'ortalama':
        return `Ortalama ${R} efendim.`
      case 'kisayol':
        return `${fmt(p.a!)} sayısının ${p.label} ${R} efendim.`
      default:
        return `Sonuç ${R} efendim.`
    }
  },
}

function labelOf(p: CalcP) {
  return ({ yuzde: 'YÜZDE', zam: 'ZAM', indirim: 'İNDİRİM', kdv: 'KDV DAHİL', kdvic: 'KDV HARİÇ', kacyuzde: 'ORAN', ortalama: 'ORTALAMA', kisayol: (p.label || '').toLocaleUpperCase('tr-TR'), ifade: 'HESAP' } as Record<Kind, string>)[p.kind]
}


/** "yüzde 20'si", "yüzde 30'u", "yüzde 25'i", "yüzde 100'ü" — sayının okunuşuna göre iyelik eki */
export function iyelik(x: number): string {
  if (!Number.isInteger(x)) return 'i'
  const n = Math.abs(x)
  if (n === 0) return 'ı'
  const U: Record<number, string> = { 1: 'i', 2: 'si', 3: 'ü', 4: 'ü', 5: 'i', 6: 'sı', 7: 'si', 8: 'i', 9: 'u' }
  const T: Record<number, string> = { 10: 'u', 20: 'si', 30: 'u', 40: 'ı', 50: 'si', 60: 'ı', 70: 'i', 80: 'i', 90: 'ı' }
  if (n % 10) return U[n % 10]
  if (n % 100) return T[n % 100]
  if (n % 1000) return 'ü' // yüz
  if (n % 1e6) return 'i' // bin
  return 'u' // milyon
}
