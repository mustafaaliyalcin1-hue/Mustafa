/**
 * J.A.R.V.I.S. BEYNİ — Claude ile ajan döngüsü
 * ---------------------------------------------------------------
 * 1) Kullanıcı mesajı + sohbet geçmişi Claude'a akışla (stream) gönderilir.
 * 2) Claude bir araç çağırmaya başladığı AN arayüze "bekleme sahnesi" gider
 *    (akış olaylarından yakalanır), araç çalışınca sonuç sahnesi gider.
 * 3) Claude birden çok aracı zincirleyebilir; döngü bitene kadar devam eder.
 * 4) Son metin 'say' olayıyla arayüze gider (seslendirme + altyazı).
 *
 * Geçmiş YALNIZCA sona eklenerek büyür (append-only): düşünme blokları ve
 * prompt önbelleği bu sayede geçerli kalır. Çok uzayınca sohbet sıfırlanır.
 */
import Anthropic from '@anthropic-ai/sdk'
import { config } from './config.ts'
import type { Emit } from './events.ts'
import { store } from './store.ts'
import { getTool, toolSpecs } from './tools/index.ts'

const client = new Anthropic({ apiKey: config.anthropicKey || undefined })

const SYSTEM = `Sen J.A.R.V.I.S.'sin: kullanıcının kişisel yapay zekâ asistanı. Iron Man'deki Jarvis gibi kibar, zeki ve hafif esprili bir İngiliz uşak tavrın var.

Kurallar:
- Her zaman Türkçe konuş ve kullanıcıya "efendim" diye hitap et.
- Yanıtların sesli okunacak: kısa ve net konuş (genelde 1-3 cümle). Kullanıcı detay isterse uzat.
- Markdown, madde işareti, tablo, emoji veya link yazma; düz konuşma dili kullan. Kaynak gerekiyorsa adını söyle ("Reuters'a göre...").
- Emin olmadığın bir bilgiyi kesinmiş gibi söyleme. Güncel olabilecek her konuda (haber, skor, fiyat, olay) önce internette ara.
- Hava durumu için get_weather aracını kullan. Kullanıcı kalıcı bir tercih veya "unutma" dediği bir bilgi verirse memory_save ile kaydet.
- Birden fazla adım gerekiyorsa araçları sırayla kullan (ör. önce hava durumuna bak, sonra öneride bulun).
- Sayıları ve birimleri okunabilir yaz: "18 derece", "yüzde 60".`

function memoryBlock() {
  const ms = store.listMemories()
  if (!ms.length) return 'Kullanıcı hakkında kayıtlı bilgi yok.'
  return 'Kullanıcı hakkında hatırladıkların (id: bilgi):\n' + ms.map((m) => `- ${m.id}: ${m.text}`).join('\n')
}

// ------------------------------------------------------------------ sohbetler
interface Conversation {
  messages: Anthropic.Beta.BetaMessageParam[]
  lastUsed: number
}
const conversations = new Map<string, Conversation>()
const MAX_MESSAGES = 60
const IDLE_MS = 30 * 60 * 1000

function getConversation(id: string) {
  const now = Date.now()
  for (const [k, c] of conversations) if (now - c.lastUsed > IDLE_MS) conversations.delete(k)
  let c = conversations.get(id)
  // Çok uzayan sohbet baştan başlar (ortadan kırpmak düşünme bloklarını geçersiz kılardı)
  if (!c || c.messages.length > MAX_MESSAGES) {
    c = { messages: [], lastUsed: now }
    conversations.set(id, c)
  }
  c.lastUsed = now
  return c
}

/** Hata sonrası yarım kalmış (araç sonucu eksik) geçmişle devam edilmesin */
export function resetConversation(id: string) {
  conversations.delete(id)
}

const SERVER_TOOL_SCENES: Record<string, { label: string }> = {
  web_search: { label: 'İNTERNETTE ARAŞTIRILIYOR' },
  web_fetch: { label: 'KAYNAK OKUNUYOR' },
}

/** Seslendirme için markdown ve fazlalıkları temizle */
export function toSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#>`|]/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function nowLine() {
  const d = new Date()
  const s = d.toLocaleString('tr-TR', { timeZone: config.tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  return `[Şu an: ${s} (${config.tz}). Varsayılan şehir: ${config.defaultCity}]`
}

export async function runAgent(conversationId: string, userText: string, emit: Emit, signal?: AbortSignal) {
  const convo = getConversation(conversationId)
  const messages = convo.messages
  // Zaman bilgisi kullanıcı mesajına eklenir (sistem talimatı sabit kalsın → önbellek bozulmasın)
  messages.push({ role: 'user', content: `${nowLine()}\n${userText}` })
  emit({ type: 'state', state: 'thinking' })

  const tools: Anthropic.Beta.BetaToolUnion[] = [
    { type: 'web_search_20260209', name: 'web_search', max_uses: 6, user_location: { type: 'approximate', country: 'TR', city: config.defaultCity, timezone: config.tz } },
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 4 },
    ...toolSpecs(),
  ]

  let jsonRetries = 0
  for (let step = 0; step < 12; step++) {
    if (signal?.aborted) return
    const stream = client.beta.messages.stream(
      {
        model: config.model,
        max_tokens: 16000,
        // Ret (refusal) durumunda sunucu tarafı otomatik yedek model
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: config.effort },
        system: [
          { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: memoryBlock() },
        ],
        tools,
        messages,
      },
      { signal },
    )

    // Araç çağrısı başladığı anda bekleme animasyonunu göster
    const shown = new Set<string>()
    stream.on('streamEvent', (ev) => {
      if (ev.type !== 'content_block_start') return
      const b = ev.content_block
      if (b.type === 'server_tool_use' && SERVER_TOOL_SCENES[b.name] && !shown.has(b.name)) {
        shown.add(b.name)
        emit({ type: 'scene', scene: 'generic', data: { label: SERVER_TOOL_SCENES[b.name].label, steps: ['Kaynaklar aranıyor', 'Sayfalar okunuyor', 'Bilgiler karşılaştırılıyor'] }, hold: 600 })
      } else if (b.type === 'tool_use') {
        const t = getTool(b.name)
        if (t?.pendingScene && !shown.has(b.name)) {
          shown.add(b.name)
          emit({ type: 'scene', ...t.pendingScene, hold: 400 })
        }
      }
    })

    let msg: Anthropic.Beta.BetaMessage
    try {
      msg = await stream.finalMessage()
      jsonRetries = 0
    } catch (err) {
      // Yalnızca ayrıştırılamayan araç girdisi tekrar denenir; API hataları yukarı fırlatılır
      if (err instanceof Anthropic.APIError || signal?.aborted || jsonRetries++ >= 2) throw err
      continue
    }

    if (msg.stop_reason === 'refusal') {
      emit({ type: 'say', text: 'Üzgünüm efendim, bu isteğe yardımcı olamıyorum.' })
      resetConversation(conversationId) // reddedilen tur geçmişte kalmasın
      break
    }
    messages.push({ role: 'assistant', content: msg.content })

    if (msg.stop_reason === 'pause_turn') continue // sunucu aracı (arama) devam ediyor

    const toolUses = msg.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use')
    // max_tokens'ta kesilmiş araç girdisi asla çalıştırılmaz
    if (msg.stop_reason === 'max_tokens' && toolUses.length) throw new Error('Araç girdisi yarıda kesildi (max_tokens).')
    if (msg.stop_reason !== 'tool_use' || !toolUses.length) {
      const text = msg.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
      const speech = toSpeech(text)
      if (speech) emit({ type: 'say', text: speech })
      break
    }

    // Araçları paralel çalıştır, TÜM sonuçları tek kullanıcı mesajında döndür
    const results = await Promise.all(
      toolUses.map(async (tu): Promise<Anthropic.Beta.BetaToolResultBlockParam> => {
        const tool = getTool(tu.name)
        if (!tool) return { type: 'tool_result', tool_use_id: tu.id, is_error: true, content: `Bilinmeyen araç: ${tu.name}` }
        const parsed = tool.schema.safeParse(tu.input)
        if (!parsed.success) return { type: 'tool_result', tool_use_id: tu.id, is_error: true, content: JSON.stringify({ INVALID_INPUT: parsed.error.message }) }
        try {
          const out = await tool.run(parsed.data)
          if (out.scene) emit({ type: 'scene', ...out.scene })
          return { type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(out.result) }
        } catch (e) {
          // Bir servis çökerse Claude'a bildir; o da kullanıcıya açıklasın veya başka yol denesin
          return { type: 'tool_result', tool_use_id: tu.id, is_error: true, content: `Hata: ${(e as Error).message}` }
        }
      }),
    )
    messages.push({ role: 'user', content: results })
  }
}

/** Hata → kullanıcıya gösterilecek Türkçe açıklama */
export function describeError(err: unknown) {
  if (err instanceof Anthropic.AuthenticationError) return 'Anthropic API anahtarı geçersiz.'
  if (err instanceof Anthropic.RateLimitError) return 'Yapay zekâ servisi şu an yoğun, biraz sonra tekrar deneyin.'
  if (err instanceof Anthropic.APIConnectionError) return 'Yapay zekâ servisine bağlanılamadı.'
  if (err instanceof Anthropic.APIError) return `Yapay zekâ servisi hatası (${err.status}).`
  return (err as Error)?.message || 'Bilinmeyen hata'
}
