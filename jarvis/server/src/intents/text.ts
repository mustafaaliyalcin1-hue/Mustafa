/**
 * Komut çözücü için Türkçe metin araçları:
 * harf sadeleştirme, kelime/kök arama, şehir ve gün çıkarma, Türkçe ekler, sayı okuma.
 */

export const lower = (s: string) => s.toLocaleLowerCase('tr-TR')

/** Türkçe karakterleri sadeleştir: "Fenerbahçe'yi" → "fenerbahce'yi" */
export function fold(s: string) {
  return lower(s)
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[âà]/g, 'a')
    .replace(/[îì]/g, 'i')
    .replace(/[ûù]/g, 'u')
    .replace(/[’‘`´]/g, "'")
    .replace(/[^a-z0-9'.,%+\-*/×÷^ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface Norm {
  raw: string
  f: string // sadeleştirilmiş
  words: string[] // kesme işaretinden önceki kökler dahil kelimeler
}

export function norm(raw: string): Norm {
  const f = fold(raw)
  const words = f.split(' ').flatMap((w) => (w.includes("'") ? [w.replace(/'/g, ''), w.split("'")[0]] : [w]))
  return { raw, f, words }
}

/** Kelimelerden biri verilen köklerden biriyle başlıyor mu? ("yagmur" → "yagmurlu", "yagmur'a") */
export function hasStem(n: Norm, ...stems: string[]) {
  return n.words.some((w) => stems.some((s) => w.startsWith(s)))
}

/** Metinde ifade geçiyor mu (kelime sınırına dikkat ederek) */
export function hasPhrase(n: Norm, ...phrases: string[]) {
  return phrases.some((p) => new RegExp(`(^|\\s)${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(n.f))
}

// ------------------------------------------------------------------ şehirler
const TR_CITIES =
  'Adana Adıyaman Afyonkarahisar Ağrı Amasya Ankara Antalya Artvin Aydın Balıkesir Bilecik Bingöl Bitlis Bolu Burdur Bursa Çanakkale Çankırı Çorum Denizli Diyarbakır Edirne Elazığ Erzincan Erzurum Eskişehir Gaziantep Giresun Gümüşhane Hakkari Hatay Isparta Mersin İstanbul İzmir Kars Kastamonu Kayseri Kırklareli Kırşehir Kocaeli Konya Kütahya Malatya Manisa Kahramanmaraş Mardin Muğla Muş Nevşehir Niğde Ordu Rize Sakarya Samsun Siirt Sinop Sivas Tekirdağ Tokat Trabzon Tunceli Şanlıurfa Uşak Van Yozgat Zonguldak Aksaray Bayburt Karaman Kırıkkale Batman Şırnak Bartın Ardahan Iğdır Yalova Karabük Kilis Osmaniye Düzce'.split(
    ' ',
  )
const EXTRA_PLACES =
  'Antep Urfa Maraş İzmit Adapazarı Bodrum Marmaris Fethiye Alanya Kuşadası Çeşme Kapadokya Kadıköy Beşiktaş Üsküdar Bakırköy Kartal Pendik Ataşehir Maltepe Sarıyer Beylikdüzü Esenyurt Şişli Beyoğlu Fatih Londra Paris Berlin Roma Madrid Barselona Amsterdam Viyana Atina Moskova Dubai Tokyo Pekin Bakü Tiflis Münih Milano Prag Budapeşte Varşova Brüksel Zürih Cenevre Lizbon Kopenhag Stockholm Oslo Kahire Doha Riyad Tahran Bağdat Lefkoşa Girne'.split(
    ' ',
  )
const PLACE_MAP = new Map([...TR_CITIES, ...EXTRA_PLACES].map((c) => [fold(c), c]))
PLACE_MAP.set('new york', 'New York')
PLACE_MAP.set('los angeles', 'Los Angeles')

/** Metinden yer adı çıkar: bilinen il/şehir listesi + "Kadıköy'de" gibi büyük harfli ekli kelimeler */
export function extractPlace(n: Norm): string | undefined {
  for (const [k, v] of PLACE_MAP) {
    if (k.includes(' ')) {
      if (n.f.includes(k)) return v
    } else if (n.words.some((w) => w === k || (w.startsWith(k) && /^(da|de|ta|te|daki|deki|taki|teki|nin|nın|in|un|un|a|e|ya|ye|dan|den|tan|ten|li|lu)$/.test(w.slice(k.length))))) return v
  }
  // Bilinmeyen yer: "Kemer'de", "Datça'da"
  const m = n.raw.match(/(?:^|\s)([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)['’](?:da|de|ta|te|daki|deki)\b/)
  if (m && !/^(Fenerbahçe|Galatasaray|Jarvis)$/.test(m[1])) return m[1]
  return undefined
}

// --------------------------------------------------------------------- günler
const WEEKDAYS: [string, number][] = [
  ['pazartesi', 1],
  ['sali', 2],
  ['carsamba', 3],
  ['persembe', 4],
  ['cumartesi', 6],
  ['cuma', 5],
  ['pazar', 0],
]
export const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

/** Kaç gün sonrası soruluyor? (0 = bugün). Belirtilmemişse undefined. */
export function extractDayOffset(n: Norm, now = new Date()): number | undefined {
  if (hasStem(n, 'bugun', 'simdi') || hasPhrase(n, 'su an', 'bu aksam', 'bu gece', 'bu sabah', 'bu ogle')) return 0
  if (hasPhrase(n, 'obur gun', 'ertesi gun', '2 gun sonra', 'iki gun sonra')) return 2
  if (hasStem(n, 'yarin')) return 1
  if (hasPhrase(n, 'hafta sonu', 'haftasonu')) {
    const d = (6 - now.getDay() + 7) % 7
    return d
  }
  const m = n.f.match(/(\d+|bir|iki|uc|dort|bes|alti) gun sonra/)
  if (m) return Math.min(6, Number(m[1]) || { bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6 }[m[1] as 'bir'] || 1)
  for (const [w, idx] of WEEKDAYS) {
    if (n.words.some((x) => x.startsWith(w) && !(w === 'pazar' && x.startsWith('pazartesi')) && !(w === 'cuma' && x.startsWith('cumartesi')))) {
      return (idx - now.getDay() + 7) % 7
    }
  }
  return undefined
}

export function dayLabel(offset: number, now = new Date()) {
  if (offset === 0) return 'bugün'
  if (offset === 1) return 'yarın'
  if (offset === 2) return 'öbür gün'
  const d = new Date(now)
  d.setDate(d.getDate() + offset)
  return DAY_NAMES[d.getDay()]
}

// --------------------------------------------------------------- Türkçe ekler
const FRONT = /[eiöü]/
const VOWELS = 'aeıioöuü'
const HARD = 'çfhkpsşt'

function lastVowel(w: string) {
  const l = lower(w)
  for (let i = l.length - 1; i >= 0; i--) if (VOWELS.includes(l[i])) return l[i]
  return 'a'
}
const endsWithVowel = (w: string) => VOWELS.includes(lower(w).slice(-1))
const endsHard = (w: string) => HARD.includes(lower(w).slice(-1))

/** Özel isme ek: ekle("Galatasaray","acc") → "Galatasaray'ı", ekle("Paris","loc") → "Paris'te" */
export function ekle(name: string, kind: 'acc' | 'dat' | 'loc' | 'abl' | 'gen') {
  const v = lastVowel(name)
  const front = FRONT.test(v)
  const round = 'oöuü'.includes(v)
  const i4 = front ? (round ? 'ü' : 'i') : round ? 'u' : 'ı'
  const a2 = front ? 'e' : 'a'
  const vow = endsWithVowel(name)
  let suf = ''
  if (kind === 'acc') suf = (vow ? 'y' : '') + i4
  if (kind === 'dat') suf = (vow ? 'y' : '') + a2
  if (kind === 'gen') suf = (vow ? 'n' : '') + i4 + 'n'
  if (kind === 'loc') suf = (endsHard(name) ? 't' : 'd') + a2
  if (kind === 'abl') suf = (endsHard(name) ? 't' : 'd') + a2 + 'n'
  return `${name}'${suf}`
}

// ------------------------------------------------------------- sayı ve para
export const fmt = (x: number, digits = 2) => x.toLocaleString('tr-TR', { maximumFractionDigits: digits, minimumFractionDigits: 0 })

/** 41.86 → "41 lira 86 kuruş"; 5412.3 → "5.412 lira" */
export function lira(x: number) {
  if (x >= 1000) return `${fmt(Math.round(x), 0)} lira`
  const tl = Math.floor(x)
  const kr = Math.round((x - tl) * 100)
  return kr ? `${fmt(tl, 0)} lira ${kr} kuruş` : `${fmt(tl, 0)} lira`
}

/** "1.500", "1500,5", "2,5", "bin", "iki yüz" → sayı */
export function parseAmount(s: string): number | undefined {
  const t = s.trim()
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'))
  if (/^\d+(,\d+)?$/.test(t)) return Number(t.replace(',', '.'))
  if (/^\d+\.\d+$/.test(t)) return Number(t)
  const W: Record<string, number> = { bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10, yirmi: 20, otuz: 30, kirk: 40, elli: 50, yuz: 100, bin: 1000 }
  if (W[t] !== undefined) return W[t]
  return undefined
}

export const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

/**
 * Haber/iddia doğrulama isteği mi? Ses tanımanın bitişik yazımları da dahil:
 * "gerçek mi", "gerçekmi", "doğru mu/doğrumu", "yalan mı", "sahte mi", "aslı var mı", "teyit et"...
 */
export const FACT_CHECK = /(gercek ?mi(dir)?\b|gercekten (oldu|dogru)|dogru ?mu(dur)?\b|yalan ?mi\b|sahte ?mi\b|uydurma ?mi\b|fake|asli (var|astari) ?mi|dogrula|dogrulugu|teyit|inanayim ?mi|gercegi yansit|dezenformasyon|iddia dogru)/
export const isFactCheck = (text: string) => FACT_CHECK.test(fold(text))
