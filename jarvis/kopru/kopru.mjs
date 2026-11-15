#!/usr/bin/env node
/**
 * J.A.R.V.I.S. BİLGİSAYAR KÖPRÜSÜ
 * ---------------------------------------------------------------
 * Bulut Jarvis'in /kopru ucuna bağlanır; gelen her istemi bu bilgisayardaki Claude Code'a sorar:
 *   claude -p --output-format json --tools "" --no-session-persistence --strict-mcp-config
 * ve cevabı aynı id ile geri yollar. Bağlantı koparsa 10 saniyede bir yeniden dener.
 *
 * Ayarlar (öncelik sırasıyla):
 *   1) Ortam değişkenleri: JARVIS_SUNUCU (ör. https://jarvis-server-xxxx.onrender.com), KOPRU_SIFRESI
 *   2) Ayar dosyası: Windows'ta %APPDATA%\JarvisKopru\ayar.json, diğerlerinde ~/.jarvis-kopru/ayar.json
 *      { "sunucu": "https://...", "sifre": "..." }   ← kur.ps1 bunu sizin yerinize yazar (depoya girmez)
 * Günlük: aynı klasörde kopru.log
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import WebSocket from 'ws'

const SURUM = '1.0.0'
const YENIDEN_DENE_MS = 10_000
const CLAUDE_ZAMAN_ASIMI_MS = 115_000 // sunucu 120 sn bekliyor; biz biraz önce bırakırız
const AYNI_ANDA = 2 // aynı anda en fazla bu kadar claude süreci

export const CLAUDE_KOMUTU = process.env.KOPRU_CLAUDE_KOMUT || 'claude -p --output-format json --tools "" --no-session-persistence --strict-mcp-config'

export const ayarKlasoru = process.env.APPDATA ? path.join(process.env.APPDATA, 'JarvisKopru') : path.join(os.homedir(), '.jarvis-kopru')
const logDosyasi = path.join(ayarKlasoru, 'kopru.log')

export function log(...p) {
  const satir = `[${new Date().toLocaleString('tr-TR')}] ${p.join(' ')}`
  console.log(satir)
  try {
    fs.mkdirSync(ayarKlasoru, { recursive: true })
    if (fs.existsSync(logDosyasi) && fs.statSync(logDosyasi).size > 1_000_000) fs.renameSync(logDosyasi, logDosyasi + '.eski')
    fs.appendFileSync(logDosyasi, satir + '\n')
  } catch {
    /* günlük yazılamazsa önemli değil */
  }
}

export function ayarlariOku() {
  let dosya = {}
  try {
    dosya = JSON.parse(fs.readFileSync(path.join(ayarKlasoru, 'ayar.json'), 'utf8').replace(/^﻿/, ''))
  } catch {
    /* dosya yok */
  }
  const sunucu = (process.env.JARVIS_SUNUCU || dosya.sunucu || '').trim().replace(/\/+$/, '')
  const sifre = (process.env.KOPRU_SIFRESI || dosya.sifre || '').trim()
  return { sunucu, sifre }
}

/** https://x → wss://x/kopru */
export function kopruAdresi(sunucu) {
  const u = new URL(sunucu)
  u.protocol = u.protocol === 'http:' ? 'ws:' : 'wss:'
  u.pathname = '/kopru'
  return u.toString()
}

/** claude -p çıktısını yorumla → { cevap } ya da { hata } */
export function ciktiyiYorumla(stdout, stderr, kod) {
  const metin = (stdout || '').trim()
  let json
  try {
    json = JSON.parse(metin)
  } catch {
    // Öncesinde uyarı satırı olabilir: son JSON satırını dene
    const satir = metin.split(/\r?\n/).reverse().find((s) => s.trim().startsWith('{'))
    try {
      json = satir ? JSON.parse(satir) : undefined
    } catch {
      json = undefined
    }
  }
  const tumu = `${metin}\n${stderr || ''}`
  const girisSorunu = /login|auth|401/i.test(tumu)
  if (json && !json.is_error && typeof json.result === 'string' && json.result.trim()) return { cevap: json.result }
  if (girisSorunu) return { hata: 'Claude Code oturumu açık değil ya da yetki hatası (bilgisayarda "claude" yazıp giriş yapın): ' + kisalt(json?.result || tumu) }
  if (json?.is_error) return { hata: 'Claude Code hata döndürdü: ' + kisalt(json.result || json.subtype || '') }
  return { hata: `Claude Code beklenmeyen çıktı verdi (çıkış kodu ${kod}): ${kisalt(tumu)}` }
}
const kisalt = (s) => String(s).replace(/\s+/g, ' ').trim().slice(0, 300)

/** İstemi Claude Code'a sor (stdin'den, UTF-8; çalışma klasörü geçici klasör) */
export function claudeyaSor(istem) {
  return new Promise((coz) => {
    const calismaKlasoru = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-kopru-'))
    // Windows'ta claude bir .cmd dosyası: kabuk (shell) gerekir; boş argüman "" olarak yazılır
    const p = spawn(CLAUDE_KOMUTU, { shell: true, cwd: calismaKlasoru, windowsHide: true, env: process.env })
    let out = ''
    let err = ''
    let bitti = false
    const temizle = () => fs.rm(calismaKlasoru, { recursive: true, force: true }, () => {})
    const zaman = setTimeout(() => {
      if (bitti) return
      bitti = true
      p.kill()
      temizle()
      coz({ hata: `Claude Code ${CLAUDE_ZAMAN_ASIMI_MS / 1000} sn içinde cevap vermedi` })
    }, CLAUDE_ZAMAN_ASIMI_MS)
    p.stdout.setEncoding('utf8').on('data', (d) => (out += d))
    p.stderr.setEncoding('utf8').on('data', (d) => (err += d))
    p.on('error', (e) => {
      if (bitti) return
      bitti = true
      clearTimeout(zaman)
      temizle()
      coz({ hata: `Claude Code başlatılamadı (kurulu mu?): ${e.message}` })
    })
    p.on('close', (kod) => {
      if (bitti) return
      bitti = true
      clearTimeout(zaman)
      temizle()
      coz(ciktiyiYorumla(out, err, kod))
    })
    p.stdin.on('error', () => {}) // süreç erken kapanırsa
    p.stdin.end(Buffer.from(istem, 'utf8'))
  })
}

// ------------------------------------------------------------------ sıra (aynı anda en fazla 2)
let calisan = 0
const sira = []
function siradaCalistir(is) {
  return new Promise((coz) => {
    sira.push(async () => {
      calisan++
      try {
        coz(await is())
      } finally {
        calisan--
        sira.shift()?.()
      }
    })
    if (calisan < AYNI_ANDA) sira.shift()?.()
  })
}

// ------------------------------------------------------------------ bağlantı döngüsü
export function baslat({ sunucu, sifre }, sorucu = claudeyaSor) {
  if (!sunucu || !sifre) {
    log('HATA: sunucu adresi ya da KOPRU_SIFRESI eksik. kur.ps1 ile kurun ya da JARVIS_SUNUCU / KOPRU_SIFRESI ortam değişkenlerini verin.')
    process.exitCode = 1
    return { durdur() {} }
  }
  const adres = kopruAdresi(sunucu)
  let ws
  let durdu = false
  let yenidenZaman
  let nabiz

  const baglan = () => {
    if (durdu) return
    log(`Bağlanılıyor: ${adres}`)
    ws = new WebSocket(adres, { headers: { authorization: `Bearer ${sifre}` }, handshakeTimeout: 30_000 })
    ws.on('open', () => {
      log('✓ Bulut Jarvis’e bağlandı. Sorular bu bilgisayardaki Claude Code ile cevaplanacak.')
      ws.send(JSON.stringify({ tip: 'merhaba', makine: os.hostname(), surum: SURUM }))
      // Bağlantı boşta kapanmasın diye 25 sn'de bir nabız
      nabiz = setInterval(() => ws.readyState === WebSocket.OPEN && ws.ping(), 25_000)
    })
    ws.on('unexpected-response', (_req, res) => {
      if (res.statusCode === 401) log('HATA: KOPRU_SIFRESI yanlış — sunucu bağlantıyı reddetti (401). Şifreyi kontrol edin.')
      else log(`Sunucu ${res.statusCode} döndürdü (uyuyor ya da güncelleniyor olabilir).`)
    })
    ws.on('message', async (veri) => {
      let m
      try {
        m = JSON.parse(veri.toString())
      } catch {
        return
      }
      if (m.tip !== 'istem' || !m.id) return
      const t0 = Date.now()
      log(`→ İstem geldi (${m.id.slice(0, 8)}, ${m.istem.length} karakter)`)
      const s = await siradaCalistir(() => sorucu(m.istem))
      const cevap = s.hata ? { tip: 'hata', id: m.id, hata: s.hata } : { tip: 'cevap', id: m.id, cevap: s.cevap }
      log(s.hata ? `✗ Hata (${m.id.slice(0, 8)}): ${s.hata}` : `← Cevap gönderildi (${m.id.slice(0, 8)}, ${((Date.now() - t0) / 1000).toFixed(1)} sn)`)
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(cevap))
    })
    ws.on('close', (kod) => {
      clearInterval(nabiz)
      if (durdu) return
      log(`Bağlantı kapandı (${kod}). ${YENIDEN_DENE_MS / 1000} sn sonra tekrar denenecek.`)
      yenidenZaman = setTimeout(baglan, YENIDEN_DENE_MS)
    })
    ws.on('error', (e) => log(`Bağlantı hatası: ${e.message}`))
  }
  baglan()
  return {
    durdur() {
      durdu = true
      clearTimeout(yenidenZaman)
      clearInterval(nabiz)
      ws?.close()
    },
  }
}

// Doğrudan çalıştırıldıysa başlat (testlerde içe aktarılınca başlamaz)
const ayni = (a, b) => (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b)
const dogrudan = !!process.argv[1] && ayni(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))
if (dogrudan) {
  log(`J.A.R.V.I.S. köprüsü ${SURUM} başlıyor (${os.hostname()})`)
  baslat(ayarlariOku())
}
