/** Ücretsiz beyinlerin ortak araç çalıştırıcısı: doğrulama, bekleme sahnesi, sonuç sahnesi */
import type { Emit } from '../events.ts'
import type { ToolDef } from './registry.ts'

export function showPending(tool: ToolDef | undefined, emit: Emit, shown: Set<string>) {
  if (tool?.pendingScene && !shown.has(tool.name)) {
    shown.add(tool.name)
    emit({ type: 'scene', ...tool.pendingScene, hold: 400 })
  }
}

export async function executeTool(tool: ToolDef | undefined, name: string, args: unknown, emit: Emit): Promise<Record<string, unknown>> {
  if (!tool) return { error: `Bilinmeyen araç: ${name}` }
  const parsed = tool.schema.safeParse(args ?? {})
  if (!parsed.success) return { error: `Geçersiz girdi: ${parsed.error.message}` }
  try {
    const out = await tool.run(parsed.data)
    if (out.scene) emit({ type: 'scene', ...out.scene })
    return { output: out.result }
  } catch (e) {
    // Bir servis çökerse modele bildir; o da kullanıcıya açıklasın veya başka yol denesin
    return { error: (e as Error).message }
  }
}
