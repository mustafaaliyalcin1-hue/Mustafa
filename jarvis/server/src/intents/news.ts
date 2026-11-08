/**
 * HABER KOMUTLARI
 *  "gündem", "son dakika", "bugün neler oldu", "spor haberleri", "ekonomi haberleri",
 *  "teknoloji haberleri", "dünyadan haberler", "Fenerbahçe ile ilgili haberler", "X hakkında son haberler"
 * Ekranda manşet bandı + kart destesi; ilk üç başlık okunur.
 */
import { getTool } from '../tools/index.ts'
import { hasPhrase, hasStem, type Norm } from './text.ts'
import type { Intent } from './types.ts'

const CATS: [string[], string][] = [
  [['spor'], 'spor'],
  [['ekonomi', 'finans', 'piyasa'], 'ekonomi'],
  [['teknoloji', 'bilim teknoloji'], 'teknoloji'],
  [['dunya', 'yabanci', 'uluslararasi'], 'dunya'],
  [['bilim'], 'bilim'],
  [['saglik'], 'saglik'],
  [['magazin', 'unlu'], 'magazin'],
]

interface P extends Record<string, unknown> {
  category?: string
  query?: string
}

export const newsIntent: Intent<P> = {
  name: 'news',
  detect(n: Norm) {
    const isNews = hasStem(n, 'haber', 'mansett', 'manset', 'gundem') || hasPhrase(n, 'son dakika', 'neler oldu', 'ne oldu bugun', 'dunyada neler')
    if (!isNews) return null
    // Doğrulama soruları yapay zekâya ("bu haber doğru mu")
    if (hasPhrase(n, 'dogru mu', 'gercek mi', 'yalan mi', 'dogrula', 'teyit')) return null
    if (hasPhrase(n, 'son dakika')) return {}
    // "X hakkında / ile ilgili haberler"
    const q = n.raw.match(/(.+?)\s+(?:hakkında|ile ilgili|ilgili|konusunda|haberleri)\b/i)
    if (q) {
      const topic = q[1].replace(/^(jarvis,?\s*)?(bana\s+)?(son|güncel|en son)?\s*/i, '').trim()
      const cat = CATS.find(([a]) => a.some((x) => topic.toLocaleLowerCase('tr-TR').startsWith(x)))
      if (cat && topic.split(/\s+/).length === 1) return { category: cat[1] }
      if (topic && !/^(son dakika|gündem|güncel)$/i.test(topic)) return { query: topic.replace(/['’](n[ıiuü]n|[ıiuü]n|[ıiuü]|y[ıiuü]|da|de|ta|te)$/i, '') }
    }
    const cat = CATS.find(([a]) => a.some((x) => hasStem(n, x)))
    return { category: cat?.[1] }
  },
  async run(p, emit) {
    const out = await getTool('get_news')!.run(p.query ? { query: p.query } : p.category ? { category: p.category } : {})
    const data = out.scene!.data as { category: string; items: { title: string; source: string }[] }
    emit({ type: 'scene', scene: 'news', data, hold: 3000 })
    const items = data.items.slice(0, 3)
    if (!items.length) return 'Şu an haber başlıklarına ulaşamadım efendim.'
    const head = p.query ? `${p.query} ile ilgili son haberler efendim:` : p.category ? `${data.category.charAt(0) + data.category.slice(1).toLocaleLowerCase('tr-TR')} gündeminden öne çıkanlar efendim:` : 'Gündemden öne çıkanlar efendim:'
    const ord = ['Birincisi', 'İkincisi', 'Üçüncüsü']
    return `${head} ${items.map((it, i) => `${ord[i]}, ${it.title.replace(/[.!?]+$/, '')}.`).join(' ')} Ayrıntılar ekranda.`
  },
}
