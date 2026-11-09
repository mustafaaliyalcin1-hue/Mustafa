/**
 * YOL / HARİTA — OpenStreetMap (Nominatim konum arama) + OSRM rota (ücretsiz, anahtarsız)
 * "Kadıköy'e ne kadar sürer", "Ankara İzmir arası kaç km", "Taksim'den Kadıköy'e nasıl giderim"
 * Not: OSRM süreleri trafiksiz tahmindir.
 */
import { z } from 'zod'
import { config } from '../config.ts'
import { cached } from './cache.ts'
import { defineTool } from './registry.ts'

const UA = 'JarvisPersonalAssistant/1.0 (+https://github.com/mustafaaliyalcin1-hue/Mustafa)'

export interface Place {
  name: string
  lat: number
  lon: number
}

/** Yer adı → koordinat (önce Türkiye içinde, sonra dünya) */
export function findPlace(q: string): Promise<Place> {
  return cached(`place:${q.toLocaleLowerCase('tr-TR')}`, 30 * 864e5, async () => {
    for (const cc of ['&countrycodes=tr', '']) {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=tr${cc}`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(8000) })
      if (!r.ok) throw new Error(`Konum araması yanıt vermedi (HTTP ${r.status})`)
      const j = (await r.json()) as { lat: string; lon: string; display_name: string }[]
      if (j[0]) return { name: q.charAt(0).toLocaleUpperCase('tr-TR') + q.slice(1), lat: Number(j[0].lat), lon: Number(j[0].lon) }
    }
    throw new Error(`"${q}" konumu bulunamadı`)
  })
}

export interface RouteResult {
  from: Place
  to: Place
  km: number
  minutes: number
  path: [number, number][] // [lat, lon]
  mode: 'car' | 'walk'
}

export async function route(fromQ: string | undefined, toQ: string, mode: 'car' | 'walk' = 'car'): Promise<RouteResult> {
  const [from, to] = await Promise.all([findPlace(fromQ || config.defaultCity), findPlace(toQ)])
  const profile = mode === 'walk' ? 'foot' : 'driving'
  const r = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=simplified&geometries=geojson`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10000) })
  if (!r.ok) throw new Error(`Rota servisi yanıt vermedi (HTTP ${r.status})`)
  const j = (await r.json()) as { code: string; routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] }
  const rt = j.routes?.[0]
  if (j.code !== 'Ok' || !rt) throw new Error('Bu iki yer arasında rota bulunamadı')
  // OSRM yürüyüş süresi demo sunucuda araba profiline düşebilir → ortalama 4,8 km/sa ile hesapla
  const minutes = mode === 'walk' ? (rt.distance / 1000 / 4.8) * 60 : rt.duration / 60
  return { from, to, km: Math.round(rt.distance / 100) / 10, minutes: Math.round(minutes), path: rt.geometry.coordinates.map(([lon, lat]) => [lat, lon]), mode }
}

export function durationText(min: number) {
  if (min < 60) return `${min} dakika`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} saat ${m} dakika` : `${h} saat`
}

defineTool({
  name: 'get_route',
  description: 'İki yer arası araçla ya da yürüyerek mesafe ve tahmini süre (trafiksiz) + haritada rota. Başlangıç verilmezse varsayılan şehir merkezi.',
  schema: z.object({ from: z.string().optional(), to: z.string(), mode: z.enum(['car', 'walk']).optional() }),
  pendingScene: { scene: 'map', data: { loading: true } },
  async run({ from, to, mode }) {
    const r = await route(from, to, mode)
    return { result: { km: r.km, minutes: r.minutes, from: r.from.name, to: r.to.name, note: 'Süre trafiksiz tahmindir.' }, scene: { scene: 'map', data: r, hold: 3200 } }
  },
})
