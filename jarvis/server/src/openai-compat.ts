/**
 * OpenAI uyumlu ücretsiz beyinler — tek sürücü, birçok servis:
 *   groq       : çok hızlı, kart istemez (console.groq.com)
 *   openrouter : ":free" modeller (openrouter.ai)
 *   ollama     : KENDİ BİLGİSAYARINDA çalışan yerel model — sınırsız ve tamamen ücretsiz
 * Hepsi aynı "chat/completions + tools" biçimini konuşur.
 */
import { memoryBlock, nowLine, SYSTEM } from './agent.ts'
import type { Turn } from './brains.ts'
import type { Emit } from './events.ts'
import { executeTool, showPending } from './tools/exec.ts'
import { listTools, type ToolDef } from './tools/index.ts'
import { freeWebTools } from './tools/web.ts'
import { z } from 'zod'

export interface CompatProvider {
  name: 'groq' | 'openrouter' | 'ollama'
  baseUrl: string
  apiKey?: string
  model: string
}

/** HTTP durum koduyla birlikte fırlatılan hata (beyin zinciri buna göre karar verir) */
export class BrainError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Msg =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string }
interface ToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

function allTools(): ToolDef[] {
  return [...freeWebTools, ...listTools()]
}

/** Yerel modellerin <think> bölümlerini at */
export const stripThink = (s: string) => s.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

export async function runCompatTurn(p: CompatProvider, history: Turn[], userText: string, emit: Emit, signal?: AbortSignal): Promise<string> {
  const tools = allTools()
  const specs = tools.map((t) => ({ type: 'function' as const, function: { name: t.name, description: t.description, parameters: z.toJSONSchema(t.schema) } }))
  const messages: Msg[] = [
    { role: 'system', content: `${SYSTEM}\n\n${memoryBlock()}` },
    ...history.map((t): Msg => ({ role: t.role, content: t.text }) as Msg),
    { role: 'user', content: `${nowLine()}\n${userText}` },
  ]
  const shown = new Set<string>()

  for (let step = 0; step < 8; step++) {
    if (signal?.aborted) return ''
    const timeout = AbortSignal.timeout(p.name === 'ollama' ? 120_000 : 45_000)
    const r = await fetch(`${p.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(p.apiKey ? { authorization: `Bearer ${p.apiKey}` } : {}), ...(p.name === 'openrouter' ? { 'x-title': 'JARVIS' } : {}) },
      body: JSON.stringify({ model: p.model, messages, tools: specs, tool_choice: 'auto', temperature: 0.4, max_tokens: 1500 }),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    }).catch((e) => {
      throw new BrainError(503, `${p.name} erişilemedi: ${(e as Error).message}`)
    })
    if (!r.ok) throw new BrainError(r.status, `${p.name} hatası ${r.status}: ${(await r.text()).slice(0, 300)}`)
    const j = (await r.json()) as { choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[] }
    const msg = j.choices?.[0]?.message
    if (!msg) throw new BrainError(502, `${p.name} boş yanıt verdi`)

    const calls = msg.tool_calls || []
    if (!calls.length) return stripThink(msg.content || '')

    messages.push({ role: 'assistant', content: msg.content ?? null, tool_calls: calls })
    for (const c of calls) showPending(tools.find((t) => t.name === c.function.name), emit, shown)
    const results = await Promise.all(
      calls.map(async (c) => {
        let args: unknown = {}
        try {
          args = JSON.parse(c.function.arguments || '{}')
        } catch {
          return { id: c.id, out: { error: 'Araç girdisi geçerli JSON değil' } }
        }
        return { id: c.id, out: await executeTool(tools.find((t) => t.name === c.function.name), c.function.name, args, emit) }
      }),
    )
    for (const { id, out } of results) messages.push({ role: 'tool', tool_call_id: id, content: JSON.stringify(out).slice(0, 20000) })
  }
  return ''
}
