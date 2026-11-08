/**
 * HAVA DURUMU KOMUTLARI
 *  "hava nasıl", "yarın Ankara'da yağmur yağacak mı", "şemsiye alayım mı",
 *  "hafta sonu İzmir'de hava", "bu akşam soğuk mu", "kar yağacak mı", "kaç derece"
 * Cevap Open-Meteo verisinden üretilir; ekranda hava sahnesi (o güne göre) oynar.
 */
import { config } from '../config.ts'
import { fetchWeather } from '../tools/weather.ts'
import { dayLabel, ekle, extractDayOffset, extractPlace, hasPhrase, hasStem, pick, type Norm } from './text.ts'
import type { Intent } from './types.ts'

type Ask = 'genel' | 'yagmur' | 'kar' | 'soguk' | 'sicak' | 'derece' | 'ruzgar'
interface P extends Record<string, unknown> {
  city?: string
  day?: number
  ask: Ask
}

function askOf(n: Norm): Ask {
  if (hasStem(n, 'yagmur', 'yagis', 'semsiye', 'islan', 'saganak')) return 'yagmur'
  if (hasStem(n, 'karli', 'kartopu') || hasPhrase(n, 'kar yag', 'kar var', 'kar bek')) return 'kar'
  if (hasStem(n, 'soguk', 'usu', 'mont', 'kaban', 'ceket', 'kalin giy')) return 'soguk'
  if (hasStem(n, 'sicak', 'bunalt', 'terlet')) return 'sicak'
  if (hasStem(n, 'ruzgar', 'firtina')) return 'ruzgar'
  if (hasStem(n, 'derece', 'sicaklik')) return 'derece'
  return 'genel'
}

function isWeather(n: Norm) {
  return (
    hasStem(n, 'hava') && !hasStem(n, 'havaalan', 'havalimani', 'havayol', 'havale', 'havai', 'havuz')
  ) || hasStem(n, 'yagmur', 'yagis', 'semsiye', 'sicaklik', 'derece', 'ruzgar', 'saganak') || hasPhrase(n, 'kar yag', 'kar var mi', 'soguk mu', 'sicak mi', 'mont giy', 'ne giy')
}

export const weatherIntent: Intent<P> = {
  name: 'weather',
  detect(n) {
    if (!isWeather(n)) return null
    return { city: extractPlace(n), day: extractDayOffset(n), ask: askOf(n) }
  },
  followUp(n, prev) {
    // "peki yarın?", "ya Ankara?", "hafta sonu nasıl?"
    const city = extractPlace(n)
    const day = extractDayOffset(n)
    if (!city && day === undefined) return null
    const ask = askOf(n)
    return { city: city ?? prev.city, day: day ?? prev.day, ask: ask === 'genel' ? prev.ask : ask }
  },
  async run({ city, day, ask }, emit) {
    const w = await fetchWeather(city || config.defaultCity)
    const off = Math.min(Math.max(day ?? 0, 0), w.days.length - 1)
    const d = w.days[off]
    const where = ekle(w.city, 'loc')
    const when = dayLabel(off)
    const When = when[0].toLocaleUpperCase('tr-TR') + when.slice(1)

    // Ekran: o güne uyarlanmış hava sahnesi
    const scene =
      off === 0
        ? w
        : { ...w, city: `${w.city} · ${when}`, condition: d.condition, temp: d.max, feels: undefined, humidity: undefined, wind: undefined, desc: `${condText(d.condition)} · en düşük ${d.min}°`, days: w.days.slice(off) }
    emit({ type: 'scene', scene: 'weather', data: scene, hold: 2200 })

    const rain = d.rain ?? 0
    switch (ask) {
      case 'yagmur':
        if (rain >= 60) return `Evet efendim, ${when} ${where} yağış ihtimali yüzde ${rain}. Şemsiyenizi almanızı öneririm.`
        if (rain >= 30) return `Olabilir efendim; ${when} ${where} yağış ihtimali yüzde ${rain}. Yanınıza küçük bir şemsiye almak iyi olur.`
        return `Pek sanmıyorum efendim, ${when} ${where} yağış ihtimali yalnızca yüzde ${rain}. Şemsiyeye gerek yok.`
      case 'kar': {
        const snowy = d.condition === 'snow' || (d.min <= 1 && rain >= 50)
        return snowy
          ? `Evet efendim, ${when} ${where} kar bekleniyor. En düşük ${d.min} derece; kalın giyinmeyi unutmayın.`
          : `Hayır efendim, ${when} ${where} kar beklenmiyor. Sıcaklık ${d.min} ile ${d.max} derece arasında.`
      }
      case 'soguk':
        if (d.max <= 10) return `Evet efendim, oldukça soğuk: ${when} ${where} en yüksek ${d.max}, en düşük ${d.min} derece. Mont almanızı öneririm.`
        if (d.max <= 18) return `Serin efendim; ${when} ${where} ${d.min} ile ${d.max} derece arası. Hafif bir ceket yeterli olur.`
        return `Hayır efendim, ${when} ${where} hava ılık: en yüksek ${d.max} derece.`
      case 'sicak':
        if (d.max >= 30) return `Evet efendim, ${when} ${where} sıcak: ${d.max} dereceye kadar çıkacak. Bol su için.`
        return `Çok sıcak sayılmaz efendim; ${when} ${where} en yüksek ${d.max} derece.`
      case 'ruzgar':
        return off === 0 ? `${When} ${where} rüzgâr saatte ${w.wind} kilometre efendim${w.wind >= 35 ? '; oldukça sert, dikkatli olun' : ''}.` : `${When} ${where} hava ${condText(d.condition).toLocaleLowerCase('tr-TR')} efendim; rüzgâr için saatlik tahmini yalnızca bugün için verebiliyorum.`
      case 'derece':
        return off === 0 ? `${where.charAt(0).toUpperCase() + where.slice(1)} şu an ${w.temp} derece efendim, hissedilen ${w.feels}.` : `${When} ${where} sıcaklık ${d.min} ile ${d.max} derece arasında olacak efendim.`
      default:
        if (off === 0)
          return pick([
            `${where} şu an ${w.temp} derece, ${w.desc.toLocaleLowerCase('tr-TR')} efendim. Bugün en yüksek ${d.max}, en düşük ${d.min} derece${rain >= 50 ? `; yağış ihtimali yüzde ${rain}, şemsiye almanızı öneririm` : ''}.`,
            `Şu an ${where} hava ${w.desc.toLocaleLowerCase('tr-TR')}, ${w.temp} derece efendim. Gün içinde ${d.min} ile ${d.max} derece arası bekleniyor${rain >= 50 ? ` ve yağmur ihtimali yüzde ${rain}` : ''}.`,
          ])
        return `${When} ${where} hava ${condText(d.condition).toLocaleLowerCase('tr-TR')} efendim; en yüksek ${d.max}, en düşük ${d.min} derece${rain >= 40 ? `, yağış ihtimali yüzde ${rain}` : ''}.`
    }
  },
}

function condText(c: string) {
  return ({ sunny: 'Güneşli', rain: 'Yağmurlu', storm: 'Fırtınalı', snow: 'Karlı', cloudy: 'Bulutlu', wind: 'Rüzgârlı', night: 'Açık' } as Record<string, string>)[c] || 'Parçalı bulutlu'
}
