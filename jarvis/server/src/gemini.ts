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
import { ApiError, GoogleGenAI, ThinkingLevel, type Content, type FunctionCall, type Part } from '@google/genai'
import { z } from 'zod'
import { memoryBlock, nowLine, SYSTEM, toSpeech } from './agent.ts'
import { config } from './config.ts'
import type { Emit } from './events.ts'
import { listTools, type ToolDef } from './tools/index.ts'

let client: GoogleGenAI | null = null
const ai = () => (client ??= new GoogleGenAI({ apiKey: config.geminiKey, ...(process.env.GEMINI_BASE_URL ? { httpOptions: { baseUrl: process.env.GEMINI_BASE_URL } } : {}) }))

// ---------------------------------------------------------------- model seçimi
/**
 * Google model adlarını sık değiştiriyor. Ayarlanan model bulunamazsa (404),
 * anahtarın erişebildiği modeller listelenir ve en yeni kararlı "Flash" modeli seçilir.
 */
let activeModel = config.geminiModel
let discovered = false

export function currentGeminiModel() {
  return activeModel
}

/** Model listesinden en uygun Flash modelini seç (saf fonksiyon; test edilir) */
export function pickFlashModel(names: string[]): string | undefined {
  return rankFlashModels(names)[0]
}

/** Uygun Flash modellerini iyiden kötüye sırala */
export function rankFlashModels(names: string[]): string[] {
  const clean = names.map((n) => n.replace(/^models\//, ''))
  const bad = /(image|tts|audio|live|embedding|vision|learnlm|gemma|computer|robotics)/i
  // "-latest" takma adları her zaman en yeni sürümü gösterir
  const ver = (n: string) => (/-latest$/.test(n) ? 99 : Number(n.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] || 0))
  const score = (n: string) => {
    if (!/^gemini-/.test(n) || !/flash/.test(n) || bad.test(n)) return -1
    let sc = ver(n) * 100
    if (/^gemini-[\d.]+-flash$/.test(n)) sc += 50 // kararlı, ana Flash
    if (/lite/.test(n)) sc -= 30
    if (/(preview|exp|\d{2}-\d{2}|\d{3,})/.test(n)) sc -= 20
    return sc
  }
  return clean
    .map((n) => [n, score(n)] as const)
    .filter(([, sc]) => sc >= 0)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => n)
}

/** Yoğunlukta denenecek yedek modeller (keşifte doldurulur) */
let ranked: string[] = []

async function listModels() {
  const names: string[] = []
  for await (const m of await ai().models.list()) {
    if (m.name && (!m.supportedActions || m.supportedActions.includes('generateContent'))) names.push(m.name)
  }
  ranked = rankFlashModels(names)
  return names
}

async function discoverModel() {
  discovered = true
  const names = await listModels()
  const pick = ranked[0]
  console.log(`[gemini] "${activeModel}" bulunamadı → seçilen model: ${pick ?? '(yok)'} · mevcut: ${names.slice(0, 30).join(', ')}`)
  if (!pick) throw new Error('Bu anahtarla kullanılabilen bir Gemini Flash modeli bulunamadı.')
  activeModel = pick
}

/**
 * Sunucu açılırken modeli önceden belirle: ilk soruda 404 + liste turu yaşanmasın.
 * Ayarlanan model listede varsa o kalır; yoksa en uygun Flash seçilir.
 */
export async function warmUpGemini() {
  try {
    const names = (await listModels()).map((n) => n.replace(/^models\//, ''))
    discovered = true
    if (!names.includes(activeModel) && ranked[0]) {
      console.log(`[gemini] açılış: "${activeModel}" yok → ${ranked[0]}`)
      activeModel = ranked[0]
    } else console.log(`[gemini] açılış: model ${activeModel}`)
  } catch (e) {
    console.warn('[gemini] açılışta model listesi alınamadı:', (e as Error).message)
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
/** Geçici sunucu hataları: aşırı yoğunluk (503), iç hata (500) */
const transient = (e: unknown) => e instanceof ApiError && (e.status === 503 || e.status === 500)

type GenParams = Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>

/**
 * Hız: sesli asistan için uzun "düşünme" gereksiz → düşük düşünme seviyesi.
 * Model bu ayarı desteklemezse (400) bir kez ayarsız dener ve bir daha göndermez.
 */
let thinkingSupported = true
function withSpeed(params: GenParams): GenParams {
  if (!thinkingSupported) return params
  return { ...params, config: { ...params.config, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } }
}

/** Belirli modelde dene: geçici hatada (503/500) kısa beklemelerle 2 kez daha */
async function tryModel(model: string, params: GenParams) {
  for (let i = 0; ; i++) {
    try {
      return await ai().models.generateContent({ ...withSpeed(params), model })
    } catch (e) {
      if (e instanceof ApiError && e.status === 400 && thinkingSupported) {
        thinkingSupported = false
        console.log('[gemini] model düşünme seviyesi ayarını desteklemiyor; ayarsız devam')
        i--
        continue
      }
      if (!transient(e) || i >= 2 || params.config?.abortSignal?.aborted) throw e
      await sleep(i === 0 ? 1200 : 3000)
    }
  }
}

/**
 * generateContent, dayanıklı sürüm:
 *  - model bulunamazsa (404) bir kez keşif yapıp en uygun modele geçer
 *  - model aşırı yoğunsa (503) önce tekrar dener, sonra sıradaki ücretsiz modele geçer
 */
async function generate(params: GenParams) {
  try {
    return await tryModel(activeModel, params)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404 && !discovered) {
      await discoverModel()
      return tryModel(activeModel, params)
    }
    if (!transient(e)) throw e
    // Yedek modeller: listeyi gerekirse bir kez çek
    if (!ranked.length) await listModels().catch(() => {})
    let last = e
    for (const alt of ranked.filter((m) => m !== activeModel).slice(0, 3)) {
      try {
        const r = await ai().models.generateContent({ ...withSpeed(params), model: alt })
        console.log(`[gemini] ${activeModel} yoğun → bu istek ${alt} ile yanıtlandı`)
        return r
      } catch (e2) {
        last = e2
        if (!transient(e2) && !(e2 instanceof ApiError && e2.status === 404)) throw e2
      }
    }
    throw last
  }
}

// ---------------------------------------------------------- Gemini'ye özel araçlar
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$)/i

const searchSchema = z.object({ query: z.string().describe('Arama sorgusu') })
const webSearch: ToolDef<typeof searchSchema> = {
  name: 'web_search',
  description: 'İnternette Google araması yap; güncel bilgi, haber, fiyat, olay, doğrulama için kullan. Kaynakların adları ve linkleriyle birlikte özet döner. Gerekirse farklı sorgularla birkaç kez çağır.',
  schema: searchSchema,
  pendingScene: { scene: 'research', data: { topic: 'İNTERNETTE ARAŞTIRILIYOR', summary: '', sources: [] } },
  async run({ query }) {
    const r = await generate({
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
    const r = await generate({
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
  if (err.status === 400 || err.status === 403) return 'Gemini API anahtarı geçersiz ya da yetkisiz.'
  if (err.status === 404) return 'Gemini modeli bulunamadı; sunucu kayıtlarına bakın.'
  if (err.status === 503 || err.status === 500) return 'Google’ın ücretsiz yapay zekâ modelleri şu an çok yoğun. Bir dakika sonra tekrar deneyin.'
  return `Yapay zekâ servisi hatası (${err.status}).`
}
