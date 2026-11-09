/**
 * GÜNLÜK ÖZET (sabah brifingi)
 *  "günlük özet", "brifing", "bugünün özeti", "günün özeti", "bugün neler var", "günaydın"
 * Hava + gündem haberleri + Fenerbahçe'nin son/canlı/sıradaki maçı aynı anda çekilir.
 * Ekranda güneş doğuşu, ardından paneller sırayla açılır; Jarvis tek konuşmada özetler.
 * Bir kaynak çökerse o bölüm atlanır, diğerleri yine gelir.
 */
import { config } from '../config.ts'
import { getTool } from '../tools/index.ts'
import { fetchFootball, type Match } from '../tools/sports.ts'
import { fetchWeather } from '../tools/weather.ts'
import { daysAgo, liveText, opponent, when } from './football.ts'
import { ekle, hasPhrase, type Norm } from './text.ts'
import type { Intent } from './types.ts'

export interface BriefingData {
  greeting: string
  date: string
  weather?: { city: string; temp: number; desc: string; condition: string; max: number; min: number; rain: number }
  news?: { title: string; source: string; url: string }[]
  football?: { team: string; last?: Match; live?: Match; next?: Match }
}

const TRIGGERS = /^(jarvis )?(gunaydin|gun aydin)( jarvis)?$/

export const briefingIntent: Intent<{ morning: boolean }> = {
  name: 'briefing',
  detect(n: Norm) {
    const t = n.f.replace(/[.,!?]/g, '').trim()
    if (TRIGGERS.test(t)) return { morning: true }
    if (hasPhrase(n, 'gunluk ozet', 'gunun ozeti', 'bugunun ozeti', 'sabah ozeti', 'brifing', 'ozet gec', 'gunluk brifing', 'bugun neler var', 'gune basla', 'gunumu ozetle', 'bugun ne var')) return { morning: false }
    return null
  },
  async run({ morning }, emit) {
    const now = new Date()
    const hour = Number(now.toLocaleTimeString('tr-TR', { hour: '2-digit', timeZone: config.tz }))
    const greeting = morning || hour < 12 ? 'Günaydın efendim' : hour < 18 ? 'İyi günler efendim' : 'İyi akşamlar efendim'
    const date = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long', timeZone: config.tz })

    // Üç kaynak paralel; biri çökerse diğerleri gelir
    const [w, news, fb] = await Promise.allSettled([
      fetchWeather(config.defaultCity),
      getTool('get_news')!.run({}),
      fetchFootball({ team: 'Fenerbahce' }),
    ])

    const data: BriefingData = { greeting, date }
    const parts: string[] = [`${greeting}, bugün ${date}.`]

    if (w.status === 'fulfilled') {
      const x = w.value
      const d = x.days[0]
      data.weather = { city: x.city, temp: x.temp, desc: x.desc, condition: x.condition, max: d.max, min: d.min, rain: d.rain ?? 0 }
      parts.push(`${ekle(x.city, 'loc')} hava ${x.temp} derece, ${x.desc.toLocaleLowerCase('tr-TR')}; gün içinde ${d.min} ile ${d.max} derece arası${(d.rain ?? 0) >= 50 ? `, yağış ihtimali yüzde ${d.rain}; şemsiyenizi unutmayın` : ''}.`)
    }

    if (news.status === 'fulfilled') {
      const items = ((news.value.scene?.data as { items?: BriefingData['news'] })?.items || []).slice(0, 4)
      if (items.length) {
        data.news = items
        parts.push(`Gündemden öne çıkanlar: ${items.slice(0, 3).map((i) => i.title.replace(/[.!?]+$/, '')).join('; ')}.`)
      }
    }

    if (fb.status === 'fulfilled') {
      const ms = fb.value.matches
      const live = ms.find((m) => m.status === 'in')
      const last = [...ms].reverse().find((m) => m.status === 'post')
      const next = ms.find((m) => m.status === 'pre')
      data.football = { team: 'Fenerbahçe', live, last, next }
      if (live) parts.push(`Fenerbahçe şu an sahada: ${liveText(live, 'Fenerbahçe')}`)
      else if (last) parts.push(briefResult(last))
      if (next && !live) parts.push(`Sıradaki maç ${when(next.date)}, ${opponent(next, 'Fenerbahçe')} ile.`)
    }

    emit({ type: 'scene', scene: 'briefing', data, hold: 3800 })
    if (parts.length === 1) parts.push('Ancak şu an veri kaynaklarına ulaşamadım; biraz sonra tekrar deneyebilirim.')
    else parts.push('İyi bir gün dilerim.')
    return parts.join(' ')
  },
}

/** Özet için düz sonuç cümlesi: "Fenerbahçe dün Galatasaray'ı 3-1 yendi." */
function briefResult(m: Match) {
  const home = m.home.name.startsWith('Fenerbah')
  const us = home ? m.home.score ?? 0 : m.away.score ?? 0
  const them = home ? m.away.score ?? 0 : m.home.score ?? 0
  const opp = opponent(m, 'Fenerbahçe')
  const ago = daysAgo(m.date)
  const score = `${Math.max(us, them)}-${Math.min(us, them)}`
  if (us > them) return `Fenerbahçe ${ago} ${ekle(opp, 'acc')} ${score} yendi.`
  if (us < them) return `Fenerbahçe ${ago} ${ekle(opp, 'dat')} ${score} yenildi.`
  return `Fenerbahçe ${ago} ${opp} ile ${us}-${them} berabere kaldı.`
}
