/**
 * ARAÇ (TOOL) KAYIT SİSTEMİ
 * ---------------------------------------------------------------
 * Yeni bir yetenek eklemek için:
 *   1) src/tools/ altına bir dosya yazıp defineTool({...}) çağırın
 *   2) src/tools/index.ts dosyasına import satırını ekleyin
 * Claude hangi aracı ne zaman kullanacağına kendisi karar verir.
 * Aracın döndürdüğü `scene` arayüzde ilgili animasyonu oynatır.
 */
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

export interface ToolOutput {
  /** Claude'a dönen sonuç (kısa, yapılandırılmış) */
  result: unknown
  /** Arayüzde oynatılacak sahne (animasyon) */
  scene?: { scene: string; data?: unknown; hold?: number }
}

export interface ToolDef<S extends z.ZodType = z.ZodType> {
  name: string
  description: string
  schema: S
  /** Çalışırken gösterilecek bekleme sahnesi (ör. 'generic') */
  pendingScene?: { scene: string; data?: unknown }
  /** Kritik işlem mi? (kilit açma, mesaj gönderme...) → önce kullanıcı onayı istenir (5./7. aşama) */
  critical?: boolean
  run: (input: z.infer<S>) => Promise<ToolOutput>
}

const tools = new Map<string, ToolDef>()

export function defineTool<S extends z.ZodType>(def: ToolDef<S>) {
  tools.set(def.name, def as unknown as ToolDef)
}

export function getTool(name: string) {
  return tools.get(name)
}

/** Claude API'ye gönderilecek araç tanımları (Zod şemasından JSON Schema üretilir). */
export function toolSpecs(): Anthropic.Beta.BetaTool[] {
  return [...tools.values()].map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: z.toJSONSchema(t.schema) as Anthropic.Beta.BetaTool['input_schema'],
    // Akışta girdiler üretildikçe gelsin; doğrulamayı biz yapıyoruz (Zod safeParse)
    eager_input_streaming: true,
  }))
}
