/**
 * ÜCRETSİZ BEYİN — Google Gemini (ücretsiz katman)
 * ---------------------------------------------------------------
 * Claude beyniyle (agent.ts) aynı araçları ve aynı arayüz olaylarını kullanır;
 * arayüz hangi beynin çalıştığını bilmez. Fark: web araması ve sayfa okuma
 * burada kendi araçlarımızdır:
 *   web_search → ayrı bir Gemini çağrısı + "Google Arama ile temellendirme"
 *   web_fetch  → sayfayı indirip düz metne çevirir
 * Ücretsiz katmanın günlük istek sınırı vardır; dolarsa anlaşılır bir hata verilir.
 */
import { ApiError, GoogleGenAI, type Content, type FunctionCall, type Part } from '@google/genai'
import { z } from 'zod'
import { memoryBlock, nowLine, SYSTEM, toSpeech } from './agent.ts'
import { config } from './config.ts'
import type { Emit } from './events.ts'
import { listTools, type ToolDef } from './tools/index.ts'

let client: GoogleGenAI | null = null
const ai = () => (client ??= new GoogleGenAI({ apiKey: config.geminiKey, ...(process.env.GEMINI_BASE_URL ? { httpOptions: { baseUrl: process.env.GEMINI_BASE_URL } } : {}) }))

// ---------------------------------------------------------- Gemini'ye özel araçlar
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$)/i

const searchSchema = z.object({ query: z.string().describe('Arama sorgusu') })
const webSearch: ToolDef<typeof searchSchema> = {
  name: 'web_search',
  description: 'İnternette Google araması yap; güncel bilgi, haber, fiyat, olay, doğrulama için kullan. Kaynakların adları ve linkleriyle birlikte özet döner. Gerekirse farklı sorgularla birkaç kez çağır.',
  schema: searchSchema,
  pendingScene: { scene: 'research', data: { topic: 'İNTERNETTE ARAŞTIRILIYOR', summary: '', sources: [] } },
  async run({ query }) {
    const r = await ai().models.generateContent({
      model: config.geminiModel,
      contents: `Şu konuda internette ara ve bulguları kaynaklarıyla birlikte Türkçe, olgusal ve kısa özetle: ${query}`,
      config: { tools: [{ googleSearch: {} }] },
    })
    const chunks = r.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    const sources = chunks
      .map((c) => ({ name: c.web?.title || c.web?.domain || 'kaynak', url: c.web?.uri || '' }))
      .filter((s) => s.url)
      .slice(0, 10)
    return { result: { summary: r.text || '', sources } }
  },
}

const fetchSchema = z.object({ url: z.string().url() })
const webFetch: ToolDef<typeof fetchSchema> = {
  name: 'web_fetch',
  description: 'Kullanıcının verdiği bir linkteki sayfanın metnini oku (ör. doğrulanacak haber).',
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

function allTools(): ToolDef[] {
  return [webSearch as unknown as ToolDef, webFetch as unknown as ToolDef, ...listTools()]
}
function findTool(name: string) {
  return allTools().find((t) => t.name === name)
}

function declarations() {
  return allTools().map((t) => ({ name: t.name, description: t.description, parametersJsonSchema: z.toJSONSchema(t.schema) }))
}

// ------------------------------------------------------------------ sohbetler
const conversations = new Map<string, { contents: Content[]; lastUsed: number }>()
export function resetGeminiConversation(id: string) {
  conversations.delete(id)
}
function getConversation(id: string) {
  const now = Date.now()
  for (const [k, c] of conversations) if (now - c.lastUsed > 30 * 60_000) conversations.delete(k)
  let c = conversations.get(id)
  if (!c || c.contents.length > 60) conversations.set(id, (c = { contents: [], lastUsed: now }))
  c.lastUsed = now
  return c
}

export async function runGeminiAgent(conversationId: string, userText: string, emit: Emit, signal?: AbortSignal) {
  const convo = getConversation(conversationId)
  const contents = convo.contents
  contents.push({ role: 'user', parts: [{ text: `${nowLine()}\n${userText}` }] })
  emit({ type: 'state', state: 'thinking' })
  const shown = new Set<string>()

  for (let step = 0; step < 10; step++) {
    if (signal?.aborted) return
    const r = await ai().models.generateContent({
      model: config.geminiModel,
      contents,
      config: {
        systemInstruction: `${SYSTEM}\n\n${memoryBlock()}`,
        tools: [{ functionDeclarations: declarations() }],
        abortSignal: signal,
      },
    })
    const content = r.candidates?.[0]?.content
    if (!content?.parts?.length) {
      emit({ type: 'say', text: 'Üzgünüm efendim, buna yanıt veremiyorum.' })
      resetGeminiConversation(conversationId)
      return
    }
    // Modelin cevabını olduğu gibi geçmişe ekle (düşünce imzaları korunur)
    contents.push(content)

    const calls: FunctionCall[] = r.functionCalls || []
    if (!calls.length) {
      const speech = toSpeech(r.text || '')
      if (speech) emit({ type: 'say', text: speech })
      return
    }

    // Bekleme sahneleri
    for (const c of calls) {
      const t = c.name ? findTool(c.name) : undefined
      if (t?.pendingScene && !shown.has(t.name)) {
        shown.add(t.name)
        emit({ type: 'scene', ...t.pendingScene, hold: 400 })
      }
    }
    // Araçları paralel çalıştır, tüm sonuçları tek mesajda döndür
    const parts: Part[] = await Promise.all(
      calls.map(async (c): Promise<Part> => {
        const name = c.name || ''
        const tool = findTool(name)
        const reply = (response: Record<string, unknown>) => ({ functionResponse: { id: c.id, name, response } })
        if (!tool) return reply({ error: `Bilinmeyen araç: ${name}` })
        const parsed = tool.schema.safeParse(c.args || {})
        if (!parsed.success) return reply({ error: `Geçersiz girdi: ${parsed.error.message}` })
        try {
          const out = await tool.run(parsed.data)
          if (out.scene) emit({ type: 'scene', ...out.scene })
          return reply({ output: out.result })
        } catch (e) {
          return reply({ error: (e as Error).message })
        }
      }),
    )
    contents.push({ role: 'user', parts })
  }
}

export function describeGeminiError(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null
  if (err.status === 429) return 'Ücretsiz yapay zekâ kotası şimdilik doldu; biraz sonra (en geç yarın) tekrar deneyin.'
  if (err.status === 400 || err.status === 403) return 'Gemini API anahtarı geçersiz ya da model bulunamadı.'
  return `Yapay zekâ servisi hatası (${err.status}).`
}
