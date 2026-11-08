/**
 * HAVA DURUMU — Open-Meteo (anahtarsız, ücretsiz).
 * Şehir adı → koordinat (geocoding) → anlık + 7 günlük tahmin.
 * Arayüzdeki 'weather' sahnesinin beklediği veriyi üretir.
 */
import { z } from 'zod'
import { config } from '../config.ts'
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

export async function fetchWeather(city: string) {
  const geo = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`)
  const place = geo.results?.[0]
  if (!place) throw new Error(`"${city}" adında bir yer bulunamadı`)
  const q = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
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
  const days = (w.daily.time as string[]).map((t, i) => ({
    day: i === 0 ? 'BUGÜN' : DAYS[new Date(t + 'T12:00').getDay()],
    condition: wmo(w.daily.weather_code[i], true).cond,
    max: Math.round(w.daily.temperature_2m_max[i]),
    min: Math.round(w.daily.temperature_2m_min[i]),
    rain: w.daily.precipitation_probability_max[i],
  }))
  return {
    city: place.name as string,
    country: place.country as string,
    condition: now.cond,
    desc: now.desc,
    temp: Math.round(cur.temperature_2m),
    feels: Math.round(cur.apparent_temperature),
    humidity: cur.relative_humidity_2m as number,
    wind: Math.round(cur.wind_speed_10m),
    hourly: (w.hourly.time as string[]).map((t, i) => ({ time: t.slice(11, 16), temp: Math.round(w.hourly.temperature_2m[i]), rain: w.hourly.precipitation_probability[i] })),
    days,
  }
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
