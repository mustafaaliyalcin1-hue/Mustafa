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
import { memoryBlock, nowLine, SYSTEM } from './agent.ts'
import type { Turn } from './brains.ts'
import { config } from './config.ts'
import type { Emit } from './events.ts'
import { executeTool, showPending } from './tools/exec.ts'
import { listTools, type ToolDef } from './tools/index.ts'
import { freeWebTools } from './tools/web.ts'

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

// ------------------------------------------------- Google Arama ile temellendirme
/** web_search aracının Gemini yolu: Google Arama sonuçlarıyla kısa özet + kaynaklar */
export async function geminiGroundedSearch(query: string) {
  const r = await generate({
    contents: `Şu konuda internette ara ve bulguları kaynaklarıyla birlikte Türkçe, olgusal ve kısa özetle: ${query}`,
    config: { tools: [{ googleSearch: {} }] },
  })
  const chunks = r.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  const sources = chunks
    .map((c) => ({ name: c.web?.title || c.web?.domain || 'kaynak', url: c.web?.uri || '' }))
    .filter((s) => s.url)
    .slice(0, 10)
  return { summary: r.text || '', sources }
}

function allTools(): ToolDef[] {
  return [...freeWebTools, ...listTools()]
}
function findTool(name: string) {
  return allTools().find((t) => t.name === name)
}
function declarations() {
  return allTools().map((t) => ({ name: t.name, description: t.description, parametersJsonSchema: z.toJSONSchema(t.schema) }))
}

/**
 * Bir sohbet turunu Gemini ile çalıştır; son cevap metnini döndürür.
 * Geçmiş (önceki turların düz metni) ortak sohbet deposundan gelir (brains.ts).
 */
export async function runGeminiTurn(history: Turn[], userText: string, emit: Emit, signal?: AbortSignal): Promise<string> {
  const contents: Content[] = history.map((t) => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.text }] }))
  contents.push({ role: 'user', parts: [{ text: `${nowLine()}\n${userText}` }] })
  const shown = new Set<string>()

  for (let step = 0; step < 10; step++) {
    if (signal?.aborted) return ''
    const r = await generate({
      contents,
      config: {
        systemInstruction: `${SYSTEM}\n\n${memoryBlock()}`,
        tools: [{ functionDeclarations: declarations() }],
        abortSignal: signal,
      },
    })
    const content = r.candidates?.[0]?.content
    if (!content?.parts?.length) return 'Üzgünüm efendim, buna yanıt veremiyorum.'
    // Modelin cevabını olduğu gibi ekle (düşünce imzaları tur içinde korunur)
    contents.push(content)

    const calls: FunctionCall[] = r.functionCalls || []
    if (!calls.length) return r.text || ''

    for (const c of calls) showPending(findTool(c.name || ''), emit, shown)
    // Araçları paralel çalıştır, tüm sonuçları tek mesajda döndür
    const parts: Part[] = await Promise.all(
      calls.map(async (c): Promise<Part> => {
        const name = c.name || ''
        const response = await executeTool(findTool(name), name, c.args, emit)
        return { functionResponse: { id: c.id, name, response } }
      }),
    )
    contents.push({ role: 'user', parts })
  }
  return ''
}

export function describeGeminiError(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null
  if (err.status === 429) return 'Ücretsiz yapay zekâ kotası şimdilik doldu; biraz sonra (en geç yarın) tekrar deneyin.'
  if (err.status === 400 || err.status === 403) return 'Gemini API anahtarı geçersiz ya da yetkisiz.'
  if (err.status === 404) return 'Gemini modeli bulunamadı; sunucu kayıtlarına bakın.'
  if (err.status === 503 || err.status === 500) return 'Google’ın ücretsiz yapay zekâ modelleri şu an çok yoğun. Bir dakika sonra tekrar deneyin.'
  return `Yapay zekâ servisi hatası (${err.status}).`
}
