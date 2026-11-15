// Yardımcının "beyni": oyuncunun Türkçe mesajını Claude'a verir, Claude görevi seçer.
// Üç mod (kendiliğinden seçilir, YZ_BEYIN ile zorlanabilir: api | claude | basit):
//   api    : .env'de ANTHROPIC_API_KEY varsa
//   claude : anahtar yoksa ama bilgisayarda Claude Code kuruluysa — kendi Claude hesabınla, API anahtarı gerekmez
//   basit  : hiçbiri yoksa, anahtar kelimelerle ("gel", "elmas bul", "ev yap"...)
import Anthropic from '@anthropic-ai/sdk'
import { spawn, spawnSync } from 'node:child_process'
import os from 'node:os'
import { GOREVLER, basitCoz } from './gorevler.js'

const WIN = process.platform === 'win32'

export function claudeKurulu() {
  try {
    const r = spawnSync('claude', ['--version'], { shell: WIN, encoding: 'utf8', timeout: 20000, windowsHide: true })
    return r.status === 0
  } catch { return false }
}

/** Claude Code'u (claude -p) araçsız çalıştırır; kullanıcının kendi Claude girişini kullanır. */
export function claudeSor(istem, { komut = 'claude', zamanAsimi = 120000 } = {}) {
  return new Promise((coz, red) => {
    const args = ['-p', '--output-format', 'json', '--tools', WIN ? '""' : '', '--no-session-persistence', '--strict-mcp-config']
    let c
    try { c = spawn(komut, args, { shell: WIN, cwd: os.tmpdir(), windowsHide: true }) } catch (e) { red(e); return }
    let cikti = '', hata = ''
    const t = setTimeout(() => { try { c.kill() } catch {} red(new Error('Claude cevap vermedi (zaman aşımı)')) }, zamanAsimi)
    c.stdout.on('data', (d) => { cikti += d })
    c.stderr.on('data', (d) => { hata += d })
    c.on('error', (e) => { clearTimeout(t); red(e) })
    c.on('close', () => {
      clearTimeout(t)
      try {
        const j = JSON.parse(cikti)
        if (j.is_error) red(new Error(String(j.result || j.api_error_status || 'Claude hatası')))
        else coz(String(j.result ?? ''))
      } catch { red(new Error((hata || cikti || 'Claude çalışmadı').slice(0, 300))) }
    })
    c.stdin.end(istem)
  })
}

/** Claude'un yazdığı metinden {cevap, gorev} JSON'unu çıkarır. */
export function kararCoz(metin) {
  const a = metin.indexOf('{'), b = metin.lastIndexOf('}')
  if (a < 0 || b <= a) return { cevap: metin.trim(), gorev: null }
  try {
    const j = JSON.parse(metin.slice(a, b + 1))
    let g = j.gorev
    if (typeof g === 'string') g = { gorev: g }
    if (g && (typeof g !== 'object' || !GOREVLER[g.gorev])) g = null
    return { cevap: typeof j.cevap === 'string' ? j.cevap : '', gorev: g || null, durumIste: !!j.durum_bak }
  } catch { return { cevap: metin.trim(), gorev: null } }
}

const MODEL = process.env.YZ_MODEL || 'claude-opus-5-5'

function sistemMetni(surum, ad) {
  return `Sen "${ad}" adında, Minecraft ${surum} dünyasına katılmış bir yapay zeka arkadaşsın. Oyuncuyla Türkçe, samimi ve kısa konuş ("reis", "kanka" gibi rahat bir dil olabilir).
Cevapların oyun sohbetinde görünür: en fazla 2 kısa cümle, emoji yok, Markdown yok.

Oyuncunun isteğini görev araçlarıyla yerine getirirsin. Görevler uzun sürer ve arka planda çalışır; gidişatı bot kendisi sohbete yazar, sen bekleme.
- İstek bir göreve uyuyorsa gorev_baslat'ı çağır, sonra ne yapacağını bir cümleyle söyle.
- "Ev yap" gibi yapı isteklerinde önce semalari_listele ile seçenekleri gör, isteğe en uygun şemayı seç. Oyuncu "büyük" demediyse küçük ve hızlı olanı tercih et.
- Bir şey eksikse ya da emin değilsen durum_bak ile envanterine ve konumuna bak.
- Yeni bir görev eskisini durdurur. Oyuncu sadece sohbet ediyorsa araç çağırma, sadece cevap ver.
- X-ray sadece oyuncunun kendi tek kişilik dünyasında açık. Sunucuda ya da başka oyuncu varken kapalı (hile olmasın); o zaman cevherleri gözünle, tünel kazarak bulursun. Durumdaki "xray" alanına bak, kapalıysa x-ray deme.`
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
    this.kisaGecmis = [] // claude modu için son konuşmalar
    const zorla = (process.env.YZ_BEYIN || '').toLowerCase()
    const anahtar = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
    if (zorla === 'api' || (!zorla && anahtar)) this.mod = 'api'
    else if (zorla === 'claude' || (!zorla && claudeKurulu())) this.mod = 'claude'
    else this.mod = 'basit'
    this.istemci = this.mod === 'api' ? new Anthropic() : null
    console.log({
      api: '[beyin] Claude API anahtarıyla çalışıyorum.',
      claude: '[beyin] API anahtarı yok; bilgisayardaki Claude Code ile (kendi Claude hesabınla) düşünüyorum.',
      basit: '[beyin] Claude bulunamadı: basit komut modundayım ("gel", "takip et", "elmas bul", "ev yap", "dur").'
    }[this.mod])
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
    if (this.mod === 'basit') return this.#basit(metin)
    if (this.mod === 'claude') return this.#claudeIle(oyuncu, metin)
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

  async #claudeIle(oyuncu, metin) {
    let durum = '', semalar = ''
    try { durum = String(await this.o.durum()) } catch {}
    try { semalar = String(await this.o.semalar()) } catch {}
    const istem = `${sistemMetni(this.o.surum, this.o.ad)}

GÖREVLER (birini seçebilirsin):
${Object.entries(GOREVLER).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
Ek alanlar: insa_et için "sema", maden_bul için "cevher" (diamond, iron, gold, coal, copper, redstone, lapis, emerald, ancient_debris, quartz) ve "adet", odun_topla için "adet", esyalari_ver için "esya".

İNŞA EDİLEBİLECEK YAPILAR:
${semalar}

ŞU ANKİ DURUMUN: ${durum}

SON KONUŞMALAR:
${this.kisaGecmis.join('\n') || '(yok)'}

YENİ MESAJ — ${oyuncu}: ${metin}

Sadece tek satır JSON yaz, başka hiçbir şey yazma:
{"cevap": "oyuncuya kısa Türkçe cevap", "gorev": null}
ya da bir görev başlatacaksan:
{"cevap": "...", "gorev": {"gorev": "insa_et", "sema": "kulube"}}`
    let karar
    try { karar = kararCoz(await claudeSor(istem)) } catch (e) {
      console.error('[beyin] Claude Code hatası:', e.message)
      if (/log ?in|auth|credential|401|API key/i.test(e.message)) this.o.konus('Claude\'a giriş yapılmamış. Bilgisayarda bir kere "claude" yazıp hesabınla gir. Şimdilik basit komutlarla devam.')
      return this.#basit(metin)
    }
    if (karar.cevap) this.o.konus(karar.cevap)
    let sonuc = ''
    if (karar.gorev) { try { sonuc = String(await this.o.gorevBaslat(karar.gorev)) } catch (e) { sonuc = e.message } }
    this.kisaGecmis.push(`${oyuncu}: ${metin}`, `Sen: ${karar.cevap}${karar.gorev ? ` [görev: ${JSON.stringify(karar.gorev)} → ${sonuc}]` : ''}`)
    this.kisaGecmis = this.kisaGecmis.slice(-12)
  }

  async #basit(metin) {
    const g = basitCoz(metin)
    if (!g) { this.o.konus('Anlamadım. "gel", "takip et", "elmas bul", "ev yap", "netherite" gibi yaz.'); return }
    const sonuc = await this.o.gorevBaslat(g)
    if (sonuc && /bilinmeyen/.test(sonuc)) this.o.konus(String(sonuc))
    else if (g.gorev !== 'dur') this.o.konus('Tamam, başlıyorum.')
  }
}
