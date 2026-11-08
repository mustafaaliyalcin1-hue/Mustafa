/**
 * SUNUM ARAÇLARI — Claude web araştırmasını bitirdikten sonra sonucu
 * arayüzde görsel olarak göstermek için çağırır (veri getirmez, sahne oynatır).
 */
import { z } from 'zod'
import { defineTool } from './registry.ts'

const source = z.object({ name: z.string().describe('Site/kuruluş adı'), url: z.string() })

defineTool({
  name: 'present_fact_check',
  description:
    'Bir haberi/iddiayı doğruladıktan SONRA sonucu ekranda damga animasyonuyla göster. Önce web_search ile birden fazla güvenilir kaynağa ve doğrulama sitelerine (teyit.org, dogrulukpayi.com, Reuters/AP/AFP fact check) bak; link verilmişse web_fetch ile oku. Sonra bu aracı çağır, ardından sonucu kısaca söyle.',
  schema: z.object({
    headline: z.string().describe('Haberin başlığı / iddianın kısa hali'),
    body: z.string().describe('İddianın 1-2 cümlelik özeti'),
    outlet: z.string().optional().describe('İddianın nerede yayıldığı'),
    verdict: z.enum(['DOGRU', 'YALAN', 'YANILTICI', 'DOGRULANAMADI']),
    reason: z.string().describe('Gerekçe, 1-3 cümle'),
    strike: z.array(z.string()).optional().describe('YANILTICI ise body içindeki yanlış ifadeler (birebir alıntı)'),
    sources: z.array(source.extend({ stance: z.enum(['match', 'conflict', 'neutral']).describe('match=iddiayı destekliyor, conflict=çürütüyor') })).min(1).max(8),
  }),
  async run(input) {
    return { result: { shown: true }, scene: { scene: 'factcheck', data: input, hold: 6600 } }
  },
})

defineTool({
  name: 'present_research',
  description:
    'Kullanıcı bir konuyu araştırmanı ya da "detaylı araştır" dediğinde, web araştırmasını bitirdikten SONRA bulguları ekranda göster. Detaylı araştırmada en az 5 farklı kaynağa bak ve karşılaştır. Sonra kısa bir sesli özet ver; ayrıntılar ekranda kalır.',
  schema: z.object({
    topic: z.string(),
    summary: z.string().describe('Rapor gibi özet: 3-8 cümle, gerekirse madde madde (her madde yeni satır, "• " ile)'),
    sources: z.array(source).min(1).max(14),
  }),
  async run(input) {
    return { result: { shown: true }, scene: { scene: 'research', data: input, hold: 5200 } }
  },
})
