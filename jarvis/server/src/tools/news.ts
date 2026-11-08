/**
 * GÜNCEL HABERLER — Google News RSS (Türkçe, ücretsiz, anahtarsız).
 * Kategori veya arama sorgusuyla manşetleri getirir; arayüzde 'news' sahnesi oynar.
 */
import { z } from 'zod'
import { getText } from './http.ts'
import { defineTool } from './registry.ts'

const TOPICS: Record<string, string> = {
  gundem: 'NATION',
  dunya: 'WORLD',
  ekonomi: 'BUSINESS',
  teknoloji: 'TECHNOLOGY',
  spor: 'SPORTS',
  bilim: 'SCIENCE',
  saglik: 'HEALTH',
  magazin: 'ENTERTAINMENT',
}
const LABEL: Record<string, string> = { gundem: 'GÜNDEM', dunya: 'DÜNYA', ekonomi: 'EKONOMİ', teknoloji: 'TEKNOLOJİ', spor: 'SPOR', bilim: 'BİLİM', saglik: 'SAĞLIK', magazin: 'MAGAZİN' }

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

export function parseRss(xml: string, limit = 10) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit)
  return items.map(([, it]) => {
    const tag = (t: string) => decode(it.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))?.[1] || '')
    let title = tag('title')
    const source = tag('source')
    // Google News başlığın sonuna " - Kaynak" ekler
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3))
    return { title, source, url: tag('link'), time: tag('pubDate') ? new Date(tag('pubDate')).toISOString() : '' }
  })
}

defineTool({
  name: 'get_news',
  description:
    'Güncel haber manşetlerini getir (Türkiye, Türkçe). Kategori seç ya da belirli bir konu için sorgu ver. Kullanıcıya en önemli 3-5 haberi kısaca özetle.',
  schema: z.object({
    category: z.enum(['gundem', 'dunya', 'ekonomi', 'teknoloji', 'spor', 'bilim', 'saglik', 'magazin']).optional().describe('Boşsa genel manşetler'),
    query: z.string().optional().describe('Belirli bir konu, ör. "Fenerbahçe", "asgari ücret"'),
  }),
  pendingScene: { scene: 'news', data: { category: 'HABERLER', items: [] } },
  async run({ category, query }) {
    const base = 'hl=tr&gl=TR&ceid=TR:tr'
    const url = query
      ? `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:2d')}&${base}`
      : category
        ? `https://news.google.com/rss/headlines/section/topic/${TOPICS[category]}?${base}`
        : `https://news.google.com/rss?${base}`
    const items = parseRss(await getText(url), 10)
    const label = query ? query.toLocaleUpperCase('tr-TR') : category ? LABEL[category] : 'GÜNDEM'
    return { result: { items }, scene: { scene: 'news', data: { category: label, items }, hold: 2600 } }
  },
})
