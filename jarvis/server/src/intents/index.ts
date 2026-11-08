/**
 * KOMUT ÇÖZÜCÜ (yapay zekâsız, ücretsiz, hızlı)
 * ---------------------------------------------------------------
 * Sık kullanılan komutları kodla anlar ve doğrudan çalıştırır; animasyonlar aynen oynar.
 * Anlayamadığı ya da yorum gerektiren soruları (doğrulama, araştırma, "neden", sohbet)
 * yapay zekâya bırakır. Takip sorularını anlar: "peki yarın?", "ya Galatasaray?".
 */
import type { Emit } from '../events.ts'
import { financeIntent } from './finance.ts'
import { footballIntent } from './football.ts'
import { calcIntent, memoryIntent, smallTalkIntent, timeIntent } from './misc.ts'
import { newsIntent } from './news.ts'
import { norm, type Norm } from './text.ts'
import type { Intent, IntentContext } from './types.ts'
import { weatherIntent } from './weather.ts'

/** Sıra önemli: daha özel olan önce */
export const INTENTS: Intent[] = [smallTalkIntent, memoryIntent, timeIntent, newsIntent, footballIntent, financeIntent, weatherIntent, calcIntent] as unknown as Intent[]

/** Bu kalıplar yorum/araştırma ister → her zaman yapay zekâya */
const NEEDS_AI = /(dogru mu|gercek mi|yalan mi|dogrula|teyit|arastir|karsilastir|\bneden\b|\bniye\b|nasil yapilir|anlat|acikla|yorumla|tavsiye|oner|ozetle|cevir|tercume|ne demek|kimdir|nedir|tarifi|yorumun|sence|fikrin|analiz|hangi kanal|nereden izle|yayin\w* hangi|kim att|golleri kim|kadro|sakat|transfer)/

const FOLLOW_UP = /^(peki|ya|ve|bir de|ayrica|o zaman|ya da)\b/

const contexts = new Map<string, IntentContext & { at: number }>()

export interface LocalResult {
  intent: string
  reply: string
}

/** Komutu tanı (çalıştırmadan) — test ve yönlendirme için */
export function recognize(text: string, ctx: IntentContext = {}): { intent: Intent; params: Record<string, unknown> } | null {
  const n: Norm = norm(text)
  if (NEEDS_AI.test(n.f)) return null
  for (const intent of INTENTS) {
    const params = intent.detect(n, ctx)
    if (params) return { intent, params }
  }
  // Takip sorusu: kısa ya da "peki/ya" ile başlayan cümle, son 10 dakika içinde
  const last = ctx.last
  if (last && Date.now() - last.at < 10 * 60_000 && (FOLLOW_UP.test(n.f) || n.words.length <= 4)) {
    const intent = INTENTS.find((i) => i.name === last.intent)
    const params = intent?.followUp?.(n, last.params)
    if (intent && params) return { intent, params }
  }
  return null
}

/** Yerelde çözebilirse çalıştırır ve true döner; çözemezse false (yapay zekâya gidilir) */
export async function tryLocal(conversationId: string, text: string, emit: Emit): Promise<LocalResult | null> {
  const now = Date.now()
  for (const [k, c] of contexts) if (now - c.at > 30 * 60_000) contexts.delete(k)
  const ctx = contexts.get(conversationId) || { at: now }
  const hit = recognize(text, ctx)
  if (!hit) return null
  emit({ type: 'state', state: 'thinking' })
  try {
    const reply = await hit.intent.run(hit.params, emit)
    contexts.set(conversationId, { at: now, last: { intent: hit.intent.name, params: hit.params, at: now } })
    emit({ type: 'say', text: reply })
    return { intent: hit.intent.name, reply }
  } catch (e) {
    // Veri kaynağı çöktüyse yapay zekâ başka yoldan (web araması) denesin
    console.warn(`[komut] ${hit.intent.name} başarısız: ${(e as Error).message}`)
    return null
  }
}
