/** Telefon tarafı küçük Türkçe çözümleyici: süre, saat, gün (zamanlayıcı/alarm/hatırlatıcı için) */
export const fold = (s: string) =>
  s.toLocaleLowerCase('tr-TR').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[’‘]/g, "'")

const W: Record<string, number> = { bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10, onbes: 15, yirmi: 20, otuz: 30, kirk: 40, elli: 50, altmis: 60, doksan: 90 }

/** "on beş" → 15, "yirmi" → 20, "3" → 3 */
export function num(s: string): number | undefined {
  const t = fold(s).trim()
  if (/^\d+([.,]\d+)?$/.test(t)) return Number(t.replace(',', '.'))
  const parts = t.split(/\s+/)
  let v = 0
  for (const p of parts) {
    if (W[p] === undefined) return undefined
    v += W[p]
  }
  return v || undefined
}

const N = '(\\d+(?:[.,]\\d+)?|(?:bir|iki|uc|dort|bes|alti|yedi|sekiz|dokuz|on|yirmi|otuz|kirk|elli|altmis|doksan)(?:\\s(?:bir|iki|uc|dort|bes|alti|yedi|sekiz|dokuz))?)'

/** Metindeki süreyi saniye olarak bul: "1 saat 20 dakika", "beş dakika", "yarım saat", "90 saniye", "2 buçuk dakika" */
export function parseDuration(text: string): number | undefined {
  const f = fold(text)
  let sec = 0
  let found = false
  if (/yarim saat/.test(f)) {
    sec += 1800
    found = true
  }
  if (/ceyrek saat/.test(f)) {
    sec += 900
    found = true
  }
  for (const [unit, mul] of [['saat', 3600], ['dakika', 60], ['dk', 60], ['saniye', 1], ['sn', 1]] as const) {
    const m = f.match(new RegExp(`${N}(\\s?bucuk)?\\s?${unit}\\b`))
    if (m) {
      const v = num(m[1])
      if (v !== undefined) {
        sec += (v + (m[2] ? 0.5 : 0)) * mul
        found = true
      }
    }
  }
  return found ? Math.round(sec) : undefined
}

/** Saat: "7:30", "saat 7'de", "sabah 7 buçukta", "akşam 8'de", "21.15" → {h, m} */
export function parseClock(text: string): { h: number; m: number } | undefined {
  const f = fold(text)
  let m = f.match(/(\d{1,2})[:.](\d{2})/)
  let h: number | undefined
  let min = 0
  if (m) {
    h = Number(m[1])
    min = Number(m[2])
  } else if ((m = f.match(new RegExp(`(?:saat\\s)?${N}(\\s?bucuk)?['\\s]?(?:de|da|te|ta)\\b`))) || (m = f.match(new RegExp(`saat\\s${N}(\\s?bucuk)?`)))) {
    h = num(m[1])
    if (m[2]) min = 30
  }
  if (h === undefined || h > 24 || min > 59) return undefined
  // "akşam/gece 8" → 20; "öğleden sonra 3" → 15
  if (h < 12 && /(aksam|gece|ogleden sonra|ikindi)/.test(f)) h += 12
  return { h: h % 24, m: min }
}

/** Gün kayması: bugün 0, yarın 1, öbür gün 2, haftanın günleri */
export function parseDay(text: string, now = new Date()): number | undefined {
  const f = fold(text)
  if (/obur gun|ertesi gun/.test(f)) return 2
  if (/yarin/.test(f)) return 1
  if (/bugun|bu aksam|bu gece|bu sabah/.test(f)) return 0
  const days: [string, number][] = [['pazartesi', 1], ['sali', 2], ['carsamba', 3], ['persembe', 4], ['cumartesi', 6], ['cuma', 5], ['pazar', 0]]
  for (const [w, d] of days) if (new RegExp(`\\b${w}`).test(f) && !(w === 'pazar' && /pazartesi/.test(f)) && !(w === 'cuma' && /cumartesi/.test(f))) return ((d - now.getDay() + 7) % 7) || 7
  return undefined
}

export function fmtClock(d: Date) {
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}
export function fmtWhen(d: Date, now = new Date()) {
  const day = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 864e5)
  const g = day === 0 ? 'bugün' : day === 1 ? 'yarın' : d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${g} saat ${fmtClock(d)}`
}
export function fmtDur(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return [h && `${h} saat`, m && `${m} dakika`, s && `${s} saniye`].filter(Boolean).join(' ') || '0 saniye'
}
