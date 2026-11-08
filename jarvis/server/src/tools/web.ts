/**
 * ÜCRETSİZ WEB ARAÇLARI (Claude dışındaki beyinler için; Claude'un kendi arama aracı var)
 *  web_search: önce Gemini + Google Arama (kotası varsa), olmazsa DuckDuckGo (anahtarsız)
 *  web_fetch : bir sayfayı indirip düz metne çevirir
 */
import { z } from 'zod'
import { config } from '../config.ts'
import type { ToolDef } from './registry.ts'

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$)/i

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

/** DuckDuckGo HTML sonuç sayfasını ayrıştır (saf fonksiyon; test edilir) */
export function parseDuckDuckGo(html: string, limit = 8) {
  const out: { name: string; url: string; snippet: string }[] = []
  const anchors = [...html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  anchors.forEach((m, i) => {
    if (out.length >= limit) return
    // Bu sonucun özeti: bu bağlantı ile bir sonraki sonuç arasında
    const end = anchors[i + 1]?.index ?? html.length
    const chunk = html.slice((m.index ?? 0) + m[0].length, end)
    const snippet = chunk.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|div|td)>/)?.[1] || ''
    let url = m[1].replace(/&amp;/g, '&')
    const uddg = url.match(/[?&]uddg=([^&]+)/)
    if (uddg) url = decodeURIComponent(uddg[1])
    if (url.startsWith('//')) url = 'https:' + url
    if (!/^https?:/.test(url) || /duckduckgo\.com\/y\.js/.test(url)) return
    out.push({ name: decode(m[2]), url, snippet: decode(snippet) })
  })
  return out
}

async function duckDuckGo(query: string) {
  const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=tr-tr`, {
    signal: AbortSignal.timeout(10000),
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36', 'accept-language': 'tr-TR,tr;q=0.9' },
  })
  if (!r.ok) throw new Error(`Arama yapılamadı (HTTP ${r.status})`)
  const results = parseDuckDuckGo(await r.text())
  if (!results.length) throw new Error('Arama sonuç vermedi')
  return { results, note: 'Kısa özetler; ayrıntı gerekirse web_fetch ile sayfayı oku.' }
}

const searchSchema = z.object({ query: z.string().describe('Arama sorgusu') })
export const webSearch: ToolDef<typeof searchSchema> = {
  name: 'web_search',
  description: 'İnternette ara; güncel bilgi, haber, fiyat, olay, doğrulama için kullan. Kaynak adları ve linkleriyle sonuç döner. Gerekirse farklı sorgularla birkaç kez çağır.',
  schema: searchSchema,
  pendingScene: { scene: 'research', data: { topic: 'İNTERNETTE ARAŞTIRILIYOR', summary: '', sources: [] } },
  async run({ query }) {
    if (config.geminiKey) {
      try {
        const { geminiGroundedSearch } = await import('../gemini.ts')
        return { result: await geminiGroundedSearch(query) }
      } catch {
        /* Gemini kotası dolu/yoğun → ücretsiz yedek arama */
      }
    }
    return { result: await duckDuckGo(query) }
  },
}

const fetchSchema = z.object({ url: z.string().url() })
export const webFetch: ToolDef<typeof fetchSchema> = {
  name: 'web_fetch',
  description: 'Bir linkteki sayfanın metnini oku (ör. doğrulanacak haber, arama sonucundaki kaynak).',
  schema: fetchSchema,
  async run({ url }) {
    const u = new URL(url)
    if (!/^https?:$/.test(u.protocol) || PRIVATE_HOST.test(u.hostname)) throw new Error('Bu adres okunamaz.')
    const r = await fetch(u, { signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 JarvisAssistant' } })
    if (!r.ok) throw new Error(`Sayfa açılamadı (HTTP ${r.status})`)
    const html = await r.text()
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
    const text = html
      .replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000)
    return { result: { title, text } }
  },
}

export const freeWebTools = [webSearch, webFetch] as unknown as ToolDef[]
