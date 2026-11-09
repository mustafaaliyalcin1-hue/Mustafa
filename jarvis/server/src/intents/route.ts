/**
 * YOL KOMUTLARI: "Kadıköy'e ne kadar sürer", "Taksim'den Kadıköy'e nasıl giderim",
 * "Ankara ile İzmir arası kaç km", "Galata Kulesi'ne yürüyerek ne kadar"
 */
import { durationText, findPlace, route, type Place } from '../tools/route.ts'
import { ekle, hasPhrase, type Norm } from './text.ts'
import type { Intent } from './types.ts'

interface P extends Record<string, unknown> {
  from?: string
  to: string
  walk: boolean
}

const ASK = "(?:ne kadar s[üu]rer|ne kadar s[üu]r[üu]yor|ka[çc] dakika|ka[çc] saat|ka[çc] km|ka[çc] kilometre|nas[ıi]l gider|ne kadar uzak|yol tarifi|mesafe)"
const clean = (s: string) => s.replace(/^(jarvis[,\s]+|buradan\s+|benim\s+|bana\s+)+/i, '').replace(/[?.!]+$/, '').trim()

/** "Kadıköy'e" → "Kadıköy"; ek kesme işaretsizse adaylar üret */
function placeCandidates(w: string): string[] {
  const t = clean(w)
  if (/['’]/.test(t)) return [t.split(/['’]/)[0]]
  // Kesme işaretsiz yazımda ek belirsiz: "Kadıköye" = Kadıköy+e, "Ankaraya" = Ankara+ya → hepsini dene
  const out: string[] = []
  for (const suf of ['e', 'a', 'ye', 'ya', 'den', 'dan', 'ten', 'tan', 'ne', 'na']) {
    if (t.toLocaleLowerCase('tr-TR').endsWith(suf) && t.length - suf.length >= 3) out.push(t.slice(0, -suf.length))
  }
  return [...out, t]
}

export const routeIntent: Intent<P> = {
  name: 'route',
  detect(n: Norm) {
    if (!/(ne kadar sur|kac dakika|kac saat|kac km|kac kilometre|nasil gider|ne kadar uzak|yol tarifi|arasi mesafe|arasi kac|arasi ne kadar)/.test(n.f)) return null
    const raw = n.raw
    const walk = hasPhrase(n, 'yuruyerek', 'yurume', 'yaya', 'yurusem')
    const body = raw.replace(/\b(yürüyerek|arabayla|araçla|yaya olarak)\b/gi, '').replace(/\s+/g, ' ')
    let m = body.match(new RegExp(`(.+?)\\s+(?:ile|ve|-)\\s+(.+?)\\s+aras[ıi]`, 'i'))
    if (m) return { from: clean(m[1]), to: clean(m[2]), walk }
    m = body.match(new RegExp(`(.+?['’]?(?:dan|den|tan|ten))\\s+(.+?)\\s+${ASK}`, 'i'))
    if (m) return { from: placeCandidates(m[1])[0], to: clean(m[2]), walk }
    m = body.match(new RegExp(`(.+?)\\s+${ASK}`, 'i'))
    if (m) return { to: clean(m[1]), walk }
    return null
  },
  async run({ from, to, walk }, emit) {
    // Ekli/eksiz yer adı adaylarını dene ("Kadıköye" → "Kadıköy")
    let dest: Place | null = null
    let destName = to
    for (const c of placeCandidates(to)) {
      try {
        dest = await findPlace(c)
        destName = c
        break
      } catch {
        /* sıradaki aday */
      }
    }
    if (!dest) throw new Error(`"${to}" bulunamadı`)
    const r = await route(from ? placeCandidates(from)[0] : undefined, destName, walk ? 'walk' : 'car')
    emit({ type: 'scene', scene: 'map', data: r, hold: 3200 })
    const km = r.km.toLocaleString('tr-TR')
    const fromTxt = from ? `${ekle(r.from.name, 'abl')} ` : ''
    return walk
      ? `${fromTxt}${ekle(r.to.name, 'dat')} yürüyerek yaklaşık ${durationText(r.minutes)} efendim; ${km} kilometre.`
      : `${fromTxt}${ekle(r.to.name, 'dat')} arabayla yaklaşık ${durationText(r.minutes)} efendim; ${km} kilometre. Bu, trafiksiz bir tahmin.`
  },
}
