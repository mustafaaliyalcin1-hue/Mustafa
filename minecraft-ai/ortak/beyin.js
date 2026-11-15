// Yardımcının "beyni": oyuncunun Türkçe mesajını Claude'a verir, Claude görev araçlarını çağırır.
// ANTHROPIC_API_KEY yoksa basit anahtar kelime çözücüyle çalışır.
import Anthropic from '@anthropic-ai/sdk'
import { GOREVLER, basitCoz } from './gorevler.js'

const MODEL = process.env.YZ_MODEL || 'claude-opus-5-5'

function sistemMetni(surum, ad) {
  return `Sen "${ad}" adında, Minecraft ${surum} dünyasına katılmış bir yapay zeka arkadaşsın. Oyuncuyla Türkçe, samimi ve kısa konuş ("reis", "kanka" gibi rahat bir dil olabilir).
Cevapların oyun sohbetinde görünür: en fazla 2 kısa cümle, emoji yok, Markdown yok.

Oyuncunun isteğini görev araçlarıyla yerine getirirsin. Görevler uzun sürer ve arka planda çalışır; gidişatı bot kendisi sohbete yazar, sen bekleme.
- İstek bir göreve uyuyorsa gorev_baslat'ı çağır, sonra ne yapacağını bir cümleyle söyle.
- "Ev yap" gibi yapı isteklerinde önce semalari_listele ile seçenekleri gör, isteğe en uygun şemayı seç. Oyuncu "büyük" demediyse küçük ve hızlı olanı tercih et.
- Bir şey eksikse ya da emin değilsen durum_bak ile envanterine ve konumuna bak.
- Yeni bir görev eskisini durdurur. Oyuncu sadece sohbet ediyorsa araç çağırma, sadece cevap ver.
- X-ray yeteneğin var: yeraltındaki cevherleri ve lavı görebiliyorsun. Bunu sadece oyuncunun kendi dünyasında kullanıyorsun.`
}

const ARACLAR = [
  {
    name: 'gorev_baslat',
    description: 'Yardımcıya uzun süren bir görev başlatır (öncekini durdurur). Görevler:\n' +
      Object.entries(GOREVLER).map(([k, v]) => `- ${k}: ${v}`).join('\n'),
    input_schema: {
      type: 'object',
      properties: {
        gorev: { type: 'string', enum: Object.keys(GOREVLER) },
        sema: { type: 'string', description: 'insa_et için şema adı (semalari_listele\'den)' },
        cevher: { type: 'string', description: 'maden_bul için: diamond, iron, gold, coal, copper, redstone, lapis, emerald, ancient_debris, quartz' },
        adet: { type: 'integer', description: 'kaç tane (odun_topla, maden_bul)' },
        esya: { type: 'string', description: 'esyalari_ver için eşya adı ya da "hepsi"' }
      },
      required: ['gorev'],
      additionalProperties: false
    }
  },
  {
    name: 'durum_bak',
    description: 'Yardımcının konumu, canı, açlığı, envanteri ve şu anki görevi.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'semalari_listele',
    description: 'İnşa edilebilecek yapıların (kendi tasarımlar + indirilmiş şematikler) listesi ve açıklamaları.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false }
  }
]

export class Beyin {
  /**
   * @param {object} o
   * @param {string} o.surum 'Java' | 'Bedrock'
   * @param {string} o.ad yardımcının adı
   * @param {(g: {gorev:string, sema?:string, cevher?:string, adet?:number, esya?:string}) => Promise<string>|string} o.gorevBaslat
   * @param {() => Promise<string>|string} o.durum
   * @param {() => Promise<string>|string} o.semalar
   * @param {(metin: string) => void} o.konus
   */
  constructor(o) {
    this.o = o
    this.gecmis = []
    this.sira = Promise.resolve()
    this.istemci = (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) ? new Anthropic() : null
    if (!this.istemci) console.log('[beyin] ANTHROPIC_API_KEY yok: basit komut modunda çalışıyorum.')
  }

  /** Oyuncu mesajı. Mesajlar sırayla işlenir. */
  mesaj(oyuncu, metin) {
    this.sira = this.sira.then(() => this.#isle(oyuncu, metin)).catch((e) => {
      console.error('[beyin] hata:', e)
      this.o.konus('Kafam karıştı, bir daha söyler misin?')
    })
    return this.sira
  }

  async #isle(oyuncu, metin) {
    if (!this.istemci) return this.#basit(metin)
    if (this.gecmis.length > 40) this.gecmis = [] // sohbet çok uzadıysa baştan başla
    this.gecmis.push({ role: 'user', content: `${oyuncu}: ${metin}` })
    for (let tur = 0; tur < 6; tur++) {
      const cevap = await this.istemci.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system: sistemMetni(this.o.surum, this.o.ad),
        tools: ARACLAR,
        messages: this.gecmis
      })
      this.gecmis.push({ role: 'assistant', content: cevap.content })
      if (cevap.stop_reason === 'refusal') { this.o.konus('Bunu yapamam reis.'); this.gecmis = []; return }
      const yazi = cevap.content.filter((b) => b.type === 'text').map((b) => b.text).join(' ').trim()
      if (yazi) this.o.konus(yazi)
      const cagrilar = cevap.content.filter((b) => b.type === 'tool_use')
      if (cevap.stop_reason !== 'tool_use' || !cagrilar.length) return
      const sonuclar = []
      for (const c of cagrilar) {
        let icerik, hata = false
        try {
          if (c.name === 'gorev_baslat') {
            if (!c.input || typeof c.input.gorev !== 'string' || !GOREVLER[c.input.gorev]) throw new Error('geçersiz görev')
            icerik = await this.o.gorevBaslat(c.input)
          } else if (c.name === 'durum_bak') icerik = await this.o.durum()
          else if (c.name === 'semalari_listele') icerik = await this.o.semalar()
          else throw new Error('bilinmeyen araç')
        } catch (e) { icerik = String(e.message || e); hata = true }
        sonuclar.push({ type: 'tool_result', tool_use_id: c.id, content: String(icerik ?? 'tamam'), ...(hata ? { is_error: true } : {}) })
      }
      this.gecmis.push({ role: 'user', content: sonuclar })
    }
  }

  async #basit(metin) {
    const g = basitCoz(metin)
    if (!g) { this.o.konus('Anlamadım. "gel", "takip et", "elmas bul", "ev yap", "netherite" gibi yaz.'); return }
    const sonuc = await this.o.gorevBaslat(g)
    if (sonuc && /bilinmeyen/.test(sonuc)) this.o.konus(String(sonuc))
    else if (g.gorev !== 'dur') this.o.konus('Tamam, başlıyorum.')
  }
}
