/**
 * ÜCRETSİZ BEYİN ZİNCİRİ
 * ---------------------------------------------------------------
 * Sıra (anahtarı/adresi tanımlı olanlar): Gemini → Groq → OpenRouter → Ollama (yerel)
 * Biri kota doldurursa (429) ya da yoğunsa/çöktüyse bir süre dinlenmeye alınır ve
 * aynı soru otomatik olarak sıradakine sorulur. Kullanıcı farkı görmez.
 * BRAIN_ORDER ile sıra değiştirilebilir (ör. "ollama,groq,gemini").
 */
import { toSpeech } from './agent.ts'
import { config } from './config.ts'
import type { Emit } from './events.ts'
import { runGeminiTurn } from './gemini.ts'
import { BrainError, runCompatTurn, type CompatProvider } from './openai-compat.ts'

export interface Turn {
  role: 'user' | 'assistant'
  text: string
}

type BrainName = 'gemini' | 'groq' | 'openrouter' | 'ollama'
interface Brain {
  name: BrainName
  run: (history: Turn[], text: string, emit: Emit, signal?: AbortSignal) => Promise<string>
}

function compat(p: CompatProvider): Brain {
  return { name: p.name, run: (h, t, e, s) => runCompatTurn(p, h, t, e, s) }
}

export function configuredBrains(): Brain[] {
  const all: Partial<Record<BrainName, Brain>> = {}
  if (config.geminiKey) all.gemini = { name: 'gemini', run: runGeminiTurn }
  if (config.groqKey) all.groq = compat({ name: 'groq', baseUrl: 'https://api.groq.com/openai/v1', apiKey: config.groqKey, model: config.groqModel })
  if (config.openrouterKey) all.openrouter = compat({ name: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', apiKey: config.openrouterKey, model: config.openrouterModel })
  if (config.ollamaUrl) all.ollama = compat({ name: 'ollama', baseUrl: config.ollamaUrl, apiKey: config.ollamaKey || undefined, model: config.ollamaModel })
  const order = (config.brainOrder.length ? config.brainOrder : ['gemini', 'groq', 'openrouter', 'ollama']) as BrainName[]
  return order.map((n) => all[n]).filter((b): b is Brain => !!b)
}

// ------------------------------------------------------------ dinlenme süreleri
const cooling = new Map<BrainName, number>()
export function brainStatus() {
  const now = Date.now()
  return configuredBrains().map((b) => ({ name: b.name, ready: (cooling.get(b.name) || 0) <= now }))
}

function statusOf(e: unknown): number {
  if (e instanceof BrainError) return e.status
  const s = (e as { status?: unknown })?.status
  return typeof s === 'number' ? s : 0
}

/** Hatanın türüne göre bu beyni ne kadar dinlendireceğiz? */
function coolDownMs(status: number) {
  if (status === 429) return 10 * 60_000 // kota/hız sınırı
  if (status === 401 || status === 403) return 60 * 60_000 // anahtar hatalı
  if (status === 404 || status === 400) return 30 * 60_000 // model yok / desteklenmiyor
  return 60_000 // yoğunluk, bağlantı, iç hata
}

// --------------------------------------------------------- ortak sohbet geçmişi
const conversations = new Map<string, { turns: Turn[]; lastUsed: number }>()
export function resetFreeConversation(id: string) {
  conversations.delete(id)
}
function transcript(id: string) {
  const now = Date.now()
  for (const [k, c] of conversations) if (now - c.lastUsed > 30 * 60_000) conversations.delete(k)
  let c = conversations.get(id)
  if (!c) conversations.set(id, (c = { turns: [], lastUsed: now }))
  c.lastUsed = now
  return c
}

export class AllBrainsBusy extends Error {}

export async function runFreeBrains(conversationId: string, text: string, emit: Emit, signal?: AbortSignal) {
  const convo = transcript(conversationId)
  const history = convo.turns.slice(-16)
  emit({ type: 'state', state: 'thinking' })
  const brains = configuredBrains()
  const now = Date.now()
  // Dinlenmede olmayanlar önce; hepsi dinlenmedeyse yine de en erken açılacak olanı dene
  const queue = [...brains.filter((b) => (cooling.get(b.name) || 0) <= now), ...brains.filter((b) => (cooling.get(b.name) || 0) > now).sort((a, b) => (cooling.get(a.name) || 0) - (cooling.get(b.name) || 0)).slice(0, 1)]
  const errors: string[] = []
  for (const brain of queue) {
    if (signal?.aborted) return
    try {
      const reply = await brain.run(history, text, emit, signal)
      cooling.delete(brain.name)
      if (signal?.aborted) return
      const speech = toSpeech(reply)
      convo.turns.push({ role: 'user', text }, { role: 'assistant', text: reply || speech })
      if (convo.turns.length > 40) convo.turns.splice(0, convo.turns.length - 40)
      emit({ type: 'say', text: speech || 'Bir sorun oluştu efendim, tekrar dener misiniz?' })
      return
    } catch (e) {
      if (signal?.aborted) return
      const st = statusOf(e)
      cooling.set(brain.name, Date.now() + coolDownMs(st))
      errors.push(`${brain.name}: ${st || ''} ${(e as Error).message?.slice(0, 120)}`)
      console.warn(`[beyin] ${brain.name} başarısız (${st}) → sıradaki deneniyor`)
    }
  }
  throw new AllBrainsBusy(errors.join(' | ') || 'Tanımlı ücretsiz beyin yok')
}
