/**
 * KARMA BEYİN — bilgisayar açıkken Claude Code (köprü), kapalıyken Claude API
 * ---------------------------------------------------------------
 *  sor(istem) → { cevap, yol }
 *   1) Köprü bağlıysa istem /kopru websocket'i üzerinden bilgisayara gider (her isteğe bir id).
 *      En fazla 120 sn beklenir; zaman aşımı, köprü hatası ya da kopma olursa API'ye düşülür.
 *   2) Köprü yoksa Claude API (resmi SDK, ANTHROPIC_API_KEY ortam değişkeninden).
 *  Sohbet hafızası (son 20 mesaj) sunucuda tutulur ve her isteme eklenir: yol değişse de konuşma kopmaz.
 *
 * Köprü protokolü (JSON):
 *   sunucu → köprü : { tip: 'istem', id, istem }
 *   köprü → sunucu : { tip: 'cevap', id, cevap } | { tip: 'hata', id, hata } | { tip: 'merhaba', makine?, surum? }
 *  Bağlantı "Authorization: Bearer <KOPRU_SIFRESI>" başlığı ister; yanlışsa el sıkışma 401 ile reddedilir.
 */
import Anthropic from '@anthropic-ai/sdk'
import crypto from 'node:crypto'
import fs from 'node:fs'
import type { IncomingMessage, Server } from 'node:http'
import path from 'node:path'
import type { Duplex } from 'node:stream'
import { WebSocketServer, type WebSocket } from 'ws'
import { z } from 'zod'
import { nowLine, toSpeech } from './agent.ts'
import { config } from './config.ts'
import type { JarvisEvent } from './events.ts'
import { getTool } from './tools/index.ts'

export type Yol = 'bilgisayar' | 'api'
type Sahne = Extract<JarvisEvent, { type: 'scene' }>
export interface Cevap {
  cevap: string
  yol: Yol
  /** Cevapla birlikte ekranda oynatılacak animasyon (tarif kartı, doğrulama damgası…) */
  sahne?: Omit<Sahne, 'type'>
}
export interface HafizaMesaji {
  rol: 'kullanici' | 'jarvis'
  metin: string
  yol?: Yol | 'yerel'
  at: number
}

export const KOPRU_YOLU = '/kopru'
const KOPRU_BEKLEME_MS = Number(process.env.KOPRU_BEKLEME_MS) || 120_000
const HAFIZA_BOYU = 20

export const KARMA_SISTEM = `Sen J.A.R.V.I.S.'sin: kullanıcının kişisel yapay zekâ asistanı. Iron Man'deki Jarvis gibi kibar, zeki ve hafif esprili bir İngiliz uşak tavrın var.
- Her zaman Türkçe konuş ve kullanıcıya "efendim" diye hitap et.
- Yanıtın sesli okunacak: kısa ve net konuş (genelde 1-3 cümle). Kullanıcı detay isterse uzat.
- Markdown, madde işareti, tablo, emoji veya link yazma; düz konuşma dili kullan.
- Emin olmadığın bir bilgiyi kesinmiş gibi söyleme; güncel bilgiye (anlık skor, fiyat, son dakika) erişimin yoksa bunu açıkça söyle.
- Sayıları ve birimleri okunabilir yaz: "18 derece", "yüzde 60".`

// ------------------------------------------------------------------ sahne (animasyon) protokolü
/** Karma beynin ekranda gösterebileceği kartlar: diğer modlardaki sunum araçlarının aynısı */
export const SAHNE_ARACLARI = ['present_fact_check', 'present_research', 'present_match', 'present_recipe', 'present_media'] as const

let sahneTalimati = ''
/** Cevap biçimi + kart şemaları (Zod şemalarından üretilir; araçlar değişirse talimat da değişir) */
export function sahneTalimatiniGetir() {
  if (sahneTalimati) return sahneTalimati
  const araclar = SAHNE_ARACLARI.map((ad) => {
    const t = getTool(ad)
    if (!t) return ''
    const sema = z.toJSONSchema(t.schema) as Record<string, unknown>
    delete sema.$schema
    // Araç açıklamaları API adlarıyla yazılı; Claude Code'daki adlarına çevir
    const aciklama = t.description.replace(/web_search/g, 'WebSearch').replace(/web_fetch/g, 'WebFetch').replace(/bu aracı çağır|bu araçla/g, 'bu kartı doldur')
    return `- ${ad}: ${aciklama}\n  veri şeması: ${JSON.stringify(sema)}`
  }).filter(Boolean)
  sahneTalimati = `CEVAP BİÇİMİ (çok önemli): Cevabını YALNIZCA tek bir JSON nesnesi olarak yaz; JSON dışında hiçbir şey yazma, kod bloğu kullanma.
{"konusma": "<sesli okunacak kısa cevap>", "sahne": null}
Ekranda kart göstermek uygunsa "sahne" alanına {"arac": "<araç adı>", "veri": {...}} yaz. Kartlar:
${araclar.join('\n')}
Kurallar:
- Haber doğrulama ("bu doğru mu", "gerçek mi", link): önce WebSearch ile birden çok güvenilir kaynağa ve doğrulama sitelerine bak (link varsa WebFetch ile oku), sonra present_fact_check kartını doldur.
- Araştırma ("araştır", karşılaştır): WebSearch ile birden çok kaynağa bak, present_research kartını doldur; kaynakların gerçek adres (url) olsun.
- Yemek tarifi: present_recipe. Film/dizi/müzik/kitap önerisi: present_media. Bir maç sonucunu internetten bulduysan: present_match.
- Güncel bilgi gerekiyorsa (skor, haber, fiyat) WebSearch kullan; bulamadıysan uydurma, söyle.
- Kart yoksa "sahne": null. "konusma" her zaman dolu olsun (1-3 cümle, markdown yok).`
  return sahneTalimati
}

/** Model cevabından {konusma, sahne} çıkar; JSON değilse düz metin kabul edilir */
export function cevabiCoz(metin: string): { konusma: string; sahne?: { arac: string; veri: unknown } } {
  const t = metin.replace(/```(?:json)?/gi, '').trim()
  for (let i = t.indexOf('{'); i >= 0; i = t.indexOf('{', i + 1)) {
    const son = t.lastIndexOf('}')
    if (son <= i) break
    try {
      const j = JSON.parse(t.slice(i, son + 1))
      if (j && typeof j.konusma === 'string') {
        const sahne = j.sahne && typeof j.sahne.arac === 'string' ? { arac: j.sahne.arac, veri: j.sahne.veri } : undefined
        return { konusma: j.konusma, sahne }
      }
    } catch {
      /* sıradaki { */
    }
  }
  return { konusma: metin }
}

/** Kart verisini aracın kendi şemasıyla doğrula ve sahneye çevir (geçersizse kart gösterilmez) */
export async function sahneyeCevir(s?: { arac: string; veri: unknown }, log?: (m: string) => void): Promise<Cevap['sahne']> {
  if (!s || !(SAHNE_ARACLARI as readonly string[]).includes(s.arac)) return undefined
  const t = getTool(s.arac)!
  const p = t.schema.safeParse(s.veri)
  if (!p.success) {
    log?.(`Kart verisi geçersiz (${s.arac}): ${p.error.message.slice(0, 200)}`)
    return undefined
  }
  return (await t.run(p.data)).scene
}

// ------------------------------------------------------------------ hafıza (son 20 mesaj, dosyada)
const hafizaDosyasi = path.join(config.dataDir, 'karma-hafiza.json')
let hafiza: HafizaMesaji[] = []
try {
  hafiza = JSON.parse(fs.readFileSync(hafizaDosyasi, 'utf8'))
} catch {
  /* ilk çalıştırma */
}
function hafizayiKaydet() {
  try {
    fs.mkdirSync(config.dataDir, { recursive: true })
    fs.writeFileSync(hafizaDosyasi, JSON.stringify(hafiza))
  } catch {
    /* disk yoksa bellekte kalır */
  }
}
export function hafizayaEkle(m: Omit<HafizaMesaji, 'at'>) {
  hafiza.push({ ...m, at: Date.now() })
  hafiza = hafiza.slice(-HAFIZA_BOYU)
  hafizayiKaydet()
}
export const hafizayiGetir = () => [...hafiza]
export function hafizayiSil() {
  hafiza = []
  hafizayiKaydet()
}

/** Köprüye gidecek tek metin: kişilik + son konuşma + yeni soru */
export function kopruIstemi(istem: string, gecmis = hafiza) {
  const konusma = gecmis.length
    ? 'Şimdiye kadarki konuşma (eskiden yeniye):\n' + gecmis.map((m) => `${m.rol === 'kullanici' ? 'Kullanıcı' : 'Jarvis'}: ${m.metin}`).join('\n') + '\n\n'
    : ''
  return `${KARMA_SISTEM}\n\n${sahneTalimatiniGetir()}\n\n${nowLine()}\n\n${konusma}Kullanıcının yeni mesajı: ${istem}\n\nSadece Jarvis'in bu mesaja vereceği cevabı, yukarıdaki JSON biçiminde yaz.`
}

// ------------------------------------------------------------------ köprü bağlantısı
interface Bekleyen {
  coz: (cevap: string) => void
  reddet: (e: Error) => void
  zaman: ReturnType<typeof setTimeout>
}
let kopru: WebSocket | null = null
let kopruBilgi: { makine?: string; surum?: string; baglandi: number } | null = null
const bekleyenler = new Map<string, Bekleyen>()

export const kopruBagli = () => !!kopru && kopru.readyState === 1

export function kopruDurumu() {
  return kopruBagli() ? { bagli: true, ...kopruBilgi } : { bagli: false }
}

/** Sabit süreli karşılaştırma (şifre tahmin edilmesin) */
function sifreDogru(gelen: string | undefined) {
  const beklenen = config.kopruSifresi
  if (!beklenen || !gelen) return false
  const a = crypto.createHash('sha256').update(gelen).digest()
  const b = crypto.createHash('sha256').update(beklenen).digest()
  return crypto.timingSafeEqual(a, b)
}

function tumBekleyenleriReddet(neden: string) {
  for (const [id, b] of bekleyenler) {
    clearTimeout(b.zaman)
    b.reddet(new Error(neden))
    bekleyenler.delete(id)
  }
}

/** HTTP sunucusuna /kopru websocket ucunu ekler */
export function kopruyuBagla(server: Server, log: { info: (m: string) => void; warn: (m: string) => void }) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 })

  server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const yol = (req.url || '').split('?')[0]
    if (yol !== KOPRU_YOLU) return socket.destroy()
    const auth = req.headers.authorization || ''
    const sifre = auth.startsWith('Bearer ') ? auth.slice(7).trim() : undefined
    if (!config.kopruSifresi || !sifreDogru(sifre)) {
      log.warn(`Köprü bağlantısı reddedildi (${config.kopruSifresi ? 'şifre yanlış' : 'KOPRU_SIFRESI tanımlı değil'})`)
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\nContent-Length: 0\r\n\r\n')
      return socket.destroy()
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
  })

  wss.on('connection', (ws: WebSocket) => {
    // Aynı anda tek köprü: yenisi eskisinin yerini alır
    if (kopru && kopru !== ws) {
      kopru.close(4000, 'Yeni köprü bağlandı')
      tumBekleyenleriReddet('Köprü değişti')
    }
    kopru = ws
    kopruBilgi = { baglandi: Date.now() }
    log.info('🖥  Bilgisayar köprüsü bağlandı')
    let canli = true
    ws.on('pong', () => (canli = true))
    const nabiz = setInterval(() => {
      if (!canli) return ws.terminate()
      canli = false
      ws.ping()
    }, 30_000)

    ws.on('message', (veri) => {
      let m: { tip?: string; id?: string; cevap?: string; hata?: string; makine?: string; surum?: string }
      try {
        m = JSON.parse(veri.toString())
      } catch {
        return
      }
      if (m.tip === 'merhaba') {
        kopruBilgi = { baglandi: kopruBilgi?.baglandi || Date.now(), makine: String(m.makine || '').slice(0, 60), surum: String(m.surum || '').slice(0, 20) }
        return
      }
      const b = m.id ? bekleyenler.get(m.id) : undefined
      if (!b) return
      bekleyenler.delete(m.id!)
      clearTimeout(b.zaman)
      if (m.tip === 'cevap' && typeof m.cevap === 'string' && m.cevap.trim()) b.coz(m.cevap)
      else b.reddet(new Error(m.hata || 'Köprüden boş cevap'))
    })

    ws.on('close', () => {
      clearInterval(nabiz)
      if (kopru === ws) {
        kopru = null
        kopruBilgi = null
        tumBekleyenleriReddet('Köprü bağlantısı koptu')
        log.info('🖥  Bilgisayar köprüsü ayrıldı')
      }
    })
    ws.on('error', () => ws.terminate())
  })
  return wss
}

/** İstemi köprüye gönder, aynı id'li cevabı bekle */
export function kopruyeSor(istem: string, beklemeMs = KOPRU_BEKLEME_MS): Promise<string> {
  const ws = kopru
  if (!ws || ws.readyState !== 1) return Promise.reject(new Error('Köprü bağlı değil'))
  const id = crypto.randomUUID()
  return new Promise<string>((coz, reddet) => {
    const zaman = setTimeout(() => {
      bekleyenler.delete(id)
      reddet(new Error(`Köprü ${Math.round(beklemeMs / 1000)} sn içinde cevap vermedi`))
    }, beklemeMs)
    bekleyenler.set(id, { coz, reddet, zaman })
    ws.send(JSON.stringify({ tip: 'istem', id, istem }), (e) => {
      if (!e) return
      clearTimeout(zaman)
      bekleyenler.delete(id)
      reddet(e)
    })
  })
}

// ------------------------------------------------------------------ Claude API
export class ApiAnahtariYok extends Error {
  constructor() {
    super('Bilgisayar köprüsü bağlı değil ve sunucuda ANTHROPIC_API_KEY tanımlı değil.')
  }
}

let istemci: Anthropic | null = null
export async function apiyeSor(istem: string, gecmis = hafiza): Promise<string> {
  if (!config.anthropicKey) throw new ApiAnahtariYok()
  istemci ??= new Anthropic({ apiKey: config.anthropicKey })
  // Hafızadaki konuşma gerçek mesaj dizisi olarak gider (ilk mesaj kullanıcıdan olmalı)
  const mesajlar: Anthropic.Beta.BetaMessageParam[] = gecmis.map((m) => ({ role: m.rol === 'kullanici' ? 'user' : 'assistant', content: m.metin }))
  while (mesajlar.length && mesajlar[0].role !== 'user') mesajlar.shift()
  mesajlar.push({ role: 'user', content: `${nowLine()}\n${istem}` })
  // Bilgisayardaki Claude Code'la aynı yetenekler: web araması/okuma + aynı JSON kart biçimi
  const araclar: Anthropic.Beta.BetaToolUnion[] = [
    { type: 'web_search_20260209', name: 'web_search', max_uses: 6, user_location: { type: 'approximate', country: 'TR', city: config.defaultCity, timezone: config.tz } },
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 3 },
  ]
  let msg: Anthropic.Beta.BetaMessage | undefined
  for (let tur = 0; tur < 5; tur++) {
    msg = await istemci.beta.messages.create({
      model: config.model,
      max_tokens: 8000,
      // Ret (refusal) durumunda sunucu tarafında otomatik yedek model
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Kısa sesli cevaplar: düşük efor = hızlı ve ucuz
      output_config: { effort: config.karmaEffort },
      system: [{ type: 'text', text: `${KARMA_SISTEM}\n\n${sahneTalimatiniGetir().replace(/WebSearch/g, 'web_search').replace(/WebFetch/g, 'web_fetch')}`, cache_control: { type: 'ephemeral' } }],
      tools: araclar,
      messages: mesajlar,
    })
    if (msg.stop_reason !== 'pause_turn') break
    mesajlar.push({ role: 'assistant', content: msg.content }) // sunucu araması sürüyor: devam
  }
  if (!msg) throw new Error('API cevap vermedi')
  if (msg.stop_reason === 'refusal') return JSON.stringify({ konusma: 'Üzgünüm efendim, bu isteğe yardımcı olamıyorum.', sahne: null })
  // Arama sonrası son metin bloğu(ları) cevaptır
  const metin = msg.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
  if (!metin.trim()) throw new Error('API boş cevap döndü')
  return metin
}

// ------------------------------------------------------------------ tek giriş noktası
let sorucular = { kopru: kopruyeSor, api: apiyeSor }
/** Testler için: köprü/API yerine sahte işlev */
export function _sorucular(s: Partial<typeof sorucular>) {
  sorucular = { ...sorucular, ...s }
}

export async function sor(istem: string, log?: (m: string) => void): Promise<Cevap> {
  const gecmis = hafizayiGetir()
  let ham: string | undefined
  let yol: Yol = 'api'
  if (kopruBagli()) {
    try {
      ham = await sorucular.kopru(kopruIstemi(istem, gecmis))
      yol = 'bilgisayar'
    } catch (e) {
      log?.(`Köprü kullanılamadı, API'ye geçiliyor: ${(e as Error).message}`)
    }
  }
  if (ham === undefined) ham = await sorucular.api(istem, gecmis)
  const { konusma, sahne } = cevabiCoz(ham)
  const cevap = toSpeech(konusma)
  if (!cevap) throw new Error('Boş cevap')
  const kart = await sahneyeCevir(sahne, log)
  hafizayaEkle({ rol: 'kullanici', metin: istem })
  hafizayaEkle({ rol: 'jarvis', metin: cevap, yol })
  log?.(`Cevap yolu: ${yol}${kart ? ` · kart: ${kart.scene}` : ''}`)
  return { cevap, yol, ...(kart ? { sahne: kart } : {}) }
}
