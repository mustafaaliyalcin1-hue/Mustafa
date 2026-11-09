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

defineTool({
  name: 'present_match',
  description:
    'get_football bir takımı/ligi bulamazsa (ör. 2. Lig, 3. Lig, amatör ligler, alt ligler) maç sonucunu web_search ile bul, sonra bu araçla skoru ekranda stadyum animasyonuyla göster. Skoru bilmiyorsan uydurma.',
  schema: z.object({
    home: z.string(),
    away: z.string(),
    homeScore: z.number().optional(),
    awayScore: z.number().optional(),
    status: z.enum(['post', 'in', 'pre']).describe('post=bitti, in=oynanıyor, pre=oynanacak'),
    date: z.string().optional().describe('ISO tarih, ör. 2026-11-08T13:00:00+03:00'),
    minute: z.string().optional().describe('Canlıysa dakika, ör. "67"'),
    competition: z.string().optional().describe('Lig/kupa adı'),
  }),
  async run(m) {
    const match = { id: 'ai', date: m.date || new Date().toISOString(), league: m.competition || '', status: m.status, detail: m.minute ? `${m.minute}'` : '', home: { name: m.home, short: '', score: m.homeScore }, away: { name: m.away, short: '', score: m.awayScore } }
    return { result: { shown: true }, scene: { scene: 'sports', data: { focusTeam: m.home, matches: [match] }, hold: 3600 } }
  },
})

defineTool({
  name: 'present_recipe',
  description: 'Kullanıcı bir yemek tarifi istediğinde tarifi ekranda animasyonla göster (malzemeler tabağa düşer). Ardından kısaca özetle; adımlar ekranda kalır.',
  schema: z.object({
    name: z.string(),
    emoji: z.string().optional().describe('Yemeği temsil eden tek emoji'),
    time: z.string().optional().describe('ör. "45 dakika"'),
    servings: z.string().optional(),
    ingredients: z.array(z.object({ item: z.string(), amount: z.string().optional(), emoji: z.string().optional() })).min(1).max(20),
    steps: z.array(z.string()).min(1).max(12),
  }),
  async run(input) {
    return { result: { shown: true }, scene: { scene: 'recipe', data: input, hold: 5000 } }
  },
})

defineTool({
  name: 'present_media',
  description: 'Film, dizi, müzik/şarkı/albüm ya da kitap önerisi istendiğinde önerileri ekranda (dönen plak / film şeridi + afiş kartları) göster. 3-6 öneri; gerçek ve var olan eserler öner.',
  schema: z.object({
    kind: z.enum(['film', 'dizi', 'muzik', 'kitap']),
    title: z.string().describe('Başlık, ör. "Bu akşam için bilim kurgu filmleri"'),
    items: z.array(z.object({ title: z.string(), by: z.string().optional().describe('Yönetmen / sanatçı / yazar'), year: z.string().optional(), note: z.string().optional().describe('Neden önerildiği, kısa'), emoji: z.string().optional() })).min(1).max(6),
  }),
  async run(input) {
    return { result: { shown: true }, scene: { scene: 'media', data: input, hold: 5000 } }
  },
})
