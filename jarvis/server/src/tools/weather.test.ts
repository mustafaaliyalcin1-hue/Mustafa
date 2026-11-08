import assert from 'node:assert/strict'
import { test } from 'node:test'
import { wmo } from './weather.ts'
import { toSpeech } from '../agent.ts'

test('WMO kodları doğru sahneye eşlenir', () => {
  assert.equal(wmo(0, true).cond, 'sunny')
  assert.equal(wmo(0, false).cond, 'night')
  assert.equal(wmo(63).cond, 'rain')
  assert.equal(wmo(73).cond, 'snow')
  assert.equal(wmo(95).cond, 'storm')
  assert.equal(wmo(2, true, 40).cond, 'wind')
})

test('Seslendirme metni markdown içermez', () => {
  assert.equal(toSpeech('**Merhaba** efendim, [Reuters](https://r.com) diyor ki:\n- bir'), 'Merhaba efendim, Reuters diyor ki: bir')
})

test('Open-Meteo yanıtı sahne verisine dönüştürülür', async () => {
  const { fetchWeather } = await import('./weather.ts')
  const real = globalThis.fetch
  globalThis.fetch = (async (url: string) => {
    const body = String(url).includes('geocoding')
      ? { results: [{ name: 'İstanbul', country: 'Türkiye', latitude: 41, longitude: 29 }] }
      : {
          current: { temperature_2m: 17.6, apparent_temperature: 16.2, relative_humidity_2m: 70, weather_code: 61, wind_speed_10m: 12, is_day: 1 },
          hourly: { time: ['2026-11-08T14:00', '2026-11-08T15:00'], temperature_2m: [17, 16], precipitation_probability: [60, 80], weather_code: [61, 63] },
          daily: { time: ['2026-11-08', '2026-11-09'], weather_code: [61, 0], temperature_2m_max: [18.4, 20.1], temperature_2m_min: [12, 11], precipitation_probability_max: [80, 5] },
        }
    return new Response(JSON.stringify(body), { status: 200 })
  }) as typeof fetch
  try {
    const w = await fetchWeather('İstanbul')
    assert.equal(w.temp, 18)
    assert.equal(w.condition, 'rain')
    assert.equal(w.days[0].day, 'BUGÜN')
    assert.equal(w.days[1].day, 'PZT')
    assert.equal(w.days[1].condition, 'sunny')
    assert.equal(w.hourly.length, 2)
  } finally {
    globalThis.fetch = real
  }
})
