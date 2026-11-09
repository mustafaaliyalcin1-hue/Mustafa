/**
 * HAVA DURUMU — Open-Meteo (anahtarsız, ücretsiz).
 * Şehir adı → koordinat (geocoding) → anlık + 7 günlük tahmin.
 * Arayüzdeki 'weather' sahnesinin beklediği veriyi üretir.
 */
import { z } from 'zod'
import { config } from '../config.ts'
import { cached } from './cache.ts'
import { defineTool } from './registry.ts'

type Cond = 'sunny' | 'rain' | 'storm' | 'snow' | 'cloudy' | 'wind' | 'night'

/** WMO hava kodu → Türkçe açıklama + sahne türü */
export function wmo(code: number, isDay = true, wind = 0): { desc: string; cond: Cond } {
  const c = (cond: Cond, desc: string) => ({ cond: wind >= 35 && (cond === 'sunny' || cond === 'cloudy') ? 'wind' : cond, desc }) as { desc: string; cond: Cond }
  if (code === 0) return c(isDay ? 'sunny' : 'night', isDay ? 'Açık ve güneşli' : 'Açık gece')
  if (code <= 2) return c(isDay ? 'sunny' : 'night', 'Az bulutlu')
  if (code === 3) return c('cloudy', 'Kapalı')
  if (code === 45 || code === 48) return c('cloudy', 'Sisli')
  if (code >= 51 && code <= 57) return c('rain', 'Çiseleme')
  if (code >= 61 && code <= 67) return c('rain', code >= 65 ? 'Kuvvetli yağmur' : 'Yağmurlu')
  if (code >= 71 && code <= 77) return c('snow', 'Kar yağışlı')
  if (code >= 80 && code <= 82) return c('rain', 'Sağanak yağışlı')
  if (code >= 85 && code <= 86) return c('snow', 'Kar sağanağı')
  if (code >= 95) return c('storm', 'Gök gürültülü fırtına')
  return c('cloudy', 'Parçalı bulutlu')
}

const DAYS = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT']

async function getJson(url: string) {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export type WeatherResult = {
  city: string
  country: string
  condition: Cond
  desc: string
  temp: number
  feels: number
  humidity: number
  wind: number
  hourly: { time: string; temp: number; rain: number }[]
  days: { day: string; condition: Cond; max: number; min: number; rain: number }[]
  source: string
}

/** Sık kullanılan şehirlerin koordinatları: konum araması bile gerekmesin */
const KNOWN: Record<string, { name: string; lat: number; lon: number }> = {
  istanbul: { name: 'İstanbul', lat: 41.0082, lon: 28.9784 },
  ankara: { name: 'Ankara', lat: 39.9334, lon: 32.8597 },
  izmir: { name: 'İzmir', lat: 38.4237, lon: 27.1428 },
  bursa: { name: 'Bursa', lat: 40.1885, lon: 29.061 },
  antalya: { name: 'Antalya', lat: 36.8969, lon: 30.7133 },
}
const fold = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').trim()

/** Şehir → koordinat (kalıcı önbellek). Open-Meteo, olmazsa OpenStreetMap Nominatim. */
function geocode(city: string): Promise<{ name: string; country: string; lat: number; lon: number }> {
  const k = KNOWN[fold(city)]
  if (k) return Promise.resolve({ ...k, country: 'Türkiye' })
  return cached(`geo:${fold(city)}`, 30 * 864e5, async () => {
    try {
      const geo = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`)
      const p = geo.results?.[0]
      if (p) return { name: p.name as string, country: p.country as string, lat: p.latitude as number, lon: p.longitude as number }
    } catch {
      /* kota dolu → yedek */
    }
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&accept-language=tr`, { headers: { 'user-agent': MET_UA }, signal: AbortSignal.timeout(8000) })
    const j = (await r.json()) as { lat: string; lon: string; display_name: string }[]
    if (!j[0]) throw new Error(`"${city}" adında bir yer bulunamadı`)
    return { name: city.charAt(0).toLocaleUpperCase('tr-TR') + city.slice(1), country: j[0].display_name.split(',').pop()!.trim(), lat: Number(j[0].lat), lon: Number(j[0].lon) }
  })
}

async function openMeteo(place: { name: string; country: string; lat: number; lon: number }): Promise<WeatherResult> {
  const q = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: config.tz,
    forecast_days: '7',
    forecast_hours: '12',
  })
  const w = await getJson(`https://api.open-meteo.com/v1/forecast?${q}`)
  const cur = w.current
  const now = wmo(cur.weather_code, cur.is_day === 1, cur.wind_speed_10m)
  return {
    city: place.name,
    country: place.country,
    condition: now.cond,
    desc: now.desc,
    temp: Math.round(cur.temperature_2m),
    feels: Math.round(cur.apparent_temperature),
    humidity: cur.relative_humidity_2m as number,
    wind: Math.round(cur.wind_speed_10m),
    hourly: (w.hourly.time as string[]).map((t, i) => ({ time: t.slice(11, 16), temp: Math.round(w.hourly.temperature_2m[i]), rain: w.hourly.precipitation_probability[i] })),
    days: (w.daily.time as string[]).map((t, i) => ({
      day: i === 0 ? 'BUGÜN' : DAYS[new Date(t + 'T12:00').getDay()],
      condition: wmo(w.daily.weather_code[i], true).cond,
      max: Math.round(w.daily.temperature_2m_max[i]),
      min: Math.round(w.daily.temperature_2m_min[i]),
      rain: w.daily.precipitation_probability_max[i],
    })),
    source: 'Open-Meteo',
  }
}

// ------------------------------------------------- yedek: MET Norway (ücretsiz, anahtarsız)
const MET_UA = 'JarvisPersonalAssistant/1.0 (+https://github.com/mustafaaliyalcin1-hue/Mustafa)'

/** MET Norway sembol kodu → Türkçe açıklama + sahne */
export function metSymbol(code: string, wind = 0): { desc: string; cond: Cond } {
  const night = /_night/.test(code)
  const c = code.replace(/_(day|night|polartwilight)$/, '')
  const w = (cond: Cond, desc: string) => ({ cond: wind >= 35 && (cond === 'sunny' || cond === 'cloudy') ? ('wind' as Cond) : cond, desc })
  if (/thunder/.test(c)) return w('storm', 'Gök gürültülü fırtına')
  if (/snow/.test(c)) return w('snow', 'Kar yağışlı')
  if (/sleet/.test(c)) return w('snow', 'Karla karışık yağmur')
  if (/heavyrain/.test(c)) return w('rain', 'Kuvvetli yağmur')
  if (/rainshowers/.test(c)) return w('rain', 'Sağanak yağışlı')
  if (/rain/.test(c)) return w('rain', /light/.test(c) ? 'Hafif yağmurlu' : 'Yağmurlu')
  if (c === 'fog') return w('cloudy', 'Sisli')
  if (c === 'cloudy') return w('cloudy', 'Kapalı')
  if (c === 'partlycloudy') return w(night ? 'night' : 'cloudy', 'Parçalı bulutlu')
  if (c === 'fair') return w(night ? 'night' : 'sunny', 'Az bulutlu')
  return w(night ? 'night' : 'sunny', night ? 'Açık gece' : 'Açık ve güneşli')
}

/** Yağış miktarından (mm) yaklaşık yağış ihtimali */
const rainChance = (mm: number, wet: boolean) => Math.max(wet ? 60 : 0, mm >= 5 ? 85 : mm >= 2 ? 70 : mm >= 0.5 ? 50 : mm >= 0.1 ? 30 : 5)

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseMet(j: any, place: { name: string; country: string }): WeatherResult {
  const ts: any[] = j.properties?.timeseries || []
  if (!ts.length) throw new Error('MET verisi boş')
  const local = (iso: string) => new Date(iso).toLocaleString('sv-SE', { timeZone: config.tz }) // "2026-11-09 16:00:00"
  const first = ts[0].data
  const det = first.instant.details
  const windKmh = Math.round((det.wind_speed ?? 0) * 3.6)
  const sym = first.next_1_hours?.summary?.symbol_code || first.next_6_hours?.summary?.symbol_code || 'cloudy'
  const now = metSymbol(sym, windKmh)
  // Günlere grupla
  const byDay = new Map<string, any[]>()
  for (const t of ts) {
    const d = local(t.time).slice(0, 10)
    if (!byDay.has(d)) byDay.set(d, [])
    byDay.get(d)!.push(t)
  }
  const days = [...byDay.entries()].slice(0, 7).map(([d, list], i) => {
    const temps = list.map((t) => t.data.instant.details.air_temperature as number)
    const mm = list.reduce((sum, t) => sum + (t.data.next_1_hours?.details?.precipitation_amount ?? (t.data.next_6_hours?.details?.precipitation_amount ?? 0) / 6), 0)
    const noon = list.find((t) => local(t.time).slice(11, 13) >= '12') || list[0]
    const s = noon.data.next_6_hours?.summary?.symbol_code || noon.data.next_1_hours?.summary?.symbol_code || 'cloudy'
    const cond = metSymbol(s.replace('_night', '_day')).cond
    return { day: i === 0 ? 'BUGÜN' : DAYS[new Date(d + 'T12:00').getDay()], condition: cond, max: Math.round(Math.max(...temps)), min: Math.round(Math.min(...temps)), rain: rainChance(mm, cond === 'rain' || cond === 'storm' || cond === 'snow') }
  })
  const t = det.air_temperature as number
  const feels = windKmh > 5 && t < 10 ? 13.12 + 0.6215 * t - 11.37 * windKmh ** 0.16 + 0.3965 * t * windKmh ** 0.16 : t
  return {
    city: place.name,
    country: place.country,
    condition: now.cond,
    desc: now.desc,
    temp: Math.round(t),
    feels: Math.round(feels),
    humidity: Math.round(det.relative_humidity ?? 0),
    wind: windKmh,
    hourly: ts.slice(0, 12).map((x) => ({ time: local(x.time).slice(11, 16), temp: Math.round(x.data.instant.details.air_temperature), rain: rainChance(x.data.next_1_hours?.details?.precipitation_amount ?? 0, false) })),
    days,
    source: 'MET Norway',
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function metNo(place: { name: string; country: string; lat: number; lon: number }) {
  const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${place.lat.toFixed(4)}&lon=${place.lon.toFixed(4)}`, { headers: { 'user-agent': MET_UA }, signal: AbortSignal.timeout(8000) })
  if (!r.ok) throw new Error(`MET Norway yanıt vermedi (HTTP ${r.status})`)
  return parseMet(await r.json(), place)
}

/** Hava durumu: 10 dk önbellek; Open-Meteo kotası dolarsa MET Norway */
export function fetchWeather(city: string): Promise<WeatherResult> {
  return cached(`wx:${fold(city)}`, 10 * 60_000, async () => {
    const place = await geocode(city)
    try {
      return await openMeteo(place)
    } catch (e) {
      console.warn(`[hava] Open-Meteo başarısız (${(e as Error).message}) → MET Norway`)
      return metNo(place)
    }
  })
}

defineTool({
  name: 'get_weather',
  description:
    'Bir şehir için anlık hava durumu, önümüzdeki 12 saatin saatlik tahmini ve 7 günlük tahmin. Kullanıcı şehir söylemezse varsayılan şehri kullan. "Yarın yağmur yağacak mı" gibi sorular için de kullan.',
  schema: z.object({ city: z.string().describe('Şehir adı, ör. "İstanbul", "Ankara", "Londra"').optional() }),
  pendingScene: { scene: 'generic', data: { label: 'HAVA VERİSİ ALINIYOR' } },
  async run({ city }) {
    const data = await fetchWeather(city || config.defaultCity)
    return { result: data, scene: { scene: 'weather', data, hold: 2200 } }
  },
})
