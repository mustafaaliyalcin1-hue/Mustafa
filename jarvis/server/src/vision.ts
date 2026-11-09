/** Görsel analiz — Claude yedeği (Gemini anahtarı yoksa) */
import Anthropic from '@anthropic-ai/sdk'
import { config } from './config.ts'
import { parseVision } from './gemini.ts'

export async function claudeVision(b64: string, mime: string, question: string) {
  const client = new Anthropic({ apiKey: config.anthropicKey })
  const r = await client.messages.create({
    model: config.model,
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mime as 'image/jpeg', data: b64 } },
          { type: 'text', text: `${question || 'Bu görselde ne var?'}\nTürkçe yanıt ver. Yalnızca şu JSON'u döndür: {"description": "1-3 cümle, efendim diye hitap et", "objects": [{"label": "Türkçe ad", "box": [ymin, xmin, ymax, xmax]}]} — kutular 0-1000 ölçeğinde, en fazla 8 nesne.` },
        ],
      },
    ],
  })
  if (r.stop_reason === 'refusal') throw new Error('Bu görseli analiz edemiyorum')
  const text = r.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  return parseVision(text)
}
