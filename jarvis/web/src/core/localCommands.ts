/**
 * TELEFONDA ÇÖZÜLEN KOMUTLAR (sunucuya gitmez)
 *  ⏱ "5 dakika zamanlayıcı kur", "10 saniye geri say", "yarım saat sayaç", "zamanlayıcıyı iptal et"
 *  ⏰ "yarın sabah 7'de uyandır", "alarm 6:45", "akşam 8'de alarm kur"
 *  📅 "yarın saat 10'da dişçiyi hatırlat", "15 dakika sonra annemi aramayı hatırlat", "hatırlatmalarım neler"
 *  ✈️ "Ahmet'e yarın geliyorum yaz", "anneme seni seviyorum diye mesaj at"
 *  📷 "bu ne", "kamerayı aç", "fotoğrafa bak"
 *  🤖 "salonu süpür", "mutfağı paspasla", "süpürgeyi şarja gönder" (Roborock — iPhone Kısayolları ile)
 */
import { addReminder, addTimer, cancelTimers, upcoming } from './timekeeper'
import { fmtDur, fmtWhen, fold, parseClock, parseDay, parseDuration } from './nlp'
import { closeScene, interrupt, play } from './player'
import type { JarvisEvent } from './types'
import { sfx } from './sfx'
import { setStore } from './store'
import { enablePush, isIOS } from './push'

/** Önce süren konuşma/sahne kesilir, sonra yeni olaylar oynar */
function run(events: JarvisEvent[]) {
  interrupt()
  closeScene()
  play(events)
}
const say = (text: string, scene?: { scene: string; data: unknown; hold?: number }) => run([...(scene ? [{ type: 'scene' as const, ...scene }] : []), { type: 'say', text }, { type: 'end' }])

/** Tetiklenen anın Date'i: gün kayması + saat (geçmişte kalırsa ertesi güne) */
function atTime(text: string): Date | undefined {
  const clock = parseClock(text)
  const day = parseDay(text)
  if (!clock && day === undefined) return undefined
  const d = new Date()
  d.setSeconds(0, 0)
  if (day !== undefined) d.setDate(d.getDate() + day)
  if (clock) d.setHours(clock.h, clock.m)
  else d.setHours(9, 0) // saat yoksa sabah 9
  if (d.getTime() <= Date.now() && day === undefined) d.setDate(d.getDate() + 1)
  return d
}

/** 🔔 düğmesi ve "bildirimleri aç" komutu */
export async function turnOnNotifications() {
  const r = await enablePush()
  say(r.message)
  return r.ok
}

export function handleLocal(text: string): boolean {
  const f = fold(text)

  // ---------------------------------------------------- bildirim izni
  if (/bildirim/.test(f) && /(ac|etkin|izin|aktif|kur)/.test(f)) {
    turnOnNotifications()
    return true
  }

  // ---------------------------------------------------- zamanlayıcı / alarm
  if (/(zamanlayici|sayaci?|geri say|kronometre|alarm)\w* (iptal|durdur|kapat|sil)|(iptal|durdur|kapat)\w* (zamanlayici|alarm|sayac)/.test(f)) {
    const n = cancelTimers()
    say(n ? 'Zamanlayıcılar iptal edildi efendim.' : 'Çalışan bir zamanlayıcı yok efendim.')
    return true
  }
  if (/(zamanlayici|geri say|sayac|timer|kur\b|hatirlatmadan)/.test(f) && !/hatirlat/.test(f)) {
    const sec = parseDuration(text)
    if (sec && sec > 0) {
      const label = text.match(/(?:için|icin)\s+(.+)$/i)?.[1] || 'Zamanlayıcı'
      const t = addTimer('timer', sec, label)
      sfx('bip')
      say(`${fmtDur(sec)} sayıyorum efendim.`, { scene: 'timer', data: { id: t.id }, hold: 1800 })
      return true
    }
  }
  if (/(alarm|uyandir|kaldir beni)/.test(f)) {
    const at = atTime(text)
    if (at) {
      const t = addTimer('alarm', Math.round((at.getTime() - Date.now()) / 1000), 'Alarm')
      sfx('bip')
      say(`Alarm ${fmtWhen(at)} için kuruldu efendim. Telefon ve Jarvis açık kalmalı.`, { scene: 'timer', data: { id: t.id }, hold: 1800 })
      return true
    }
    const sec = parseDuration(text)
    if (sec) {
      const t = addTimer('alarm', sec, 'Alarm')
      say(`Alarm ${fmtDur(sec)} sonrasına kuruldu efendim.`, { scene: 'timer', data: { id: t.id }, hold: 1800 })
      return true
    }
  }

  // ---------------------------------------------------- hatırlatıcı / takvim
  if (/(hatirlatmalar|hatirlaticilar|ajandam|takvimim|bugun ne var|programim)/.test(f) && !/hatirlat(ir)? (mi|misin)$/.test(f)) {
    const items = upcoming()
    say(items.length ? `${items.length} hatırlatmanız var efendim. İlki ${fmtWhen(new Date(items[0].at))}: ${items[0].text}.` : 'Kayıtlı bir hatırlatmanız yok efendim.', { scene: 'calendar', data: { action: 'list', items }, hold: 2500 })
    return true
  }
  if (/hatirlat/.test(f)) {
    const sec = parseDuration(text)
    const at = /sonra/.test(f) && sec ? new Date(Date.now() + sec * 1000) : atTime(text)
    if (at) {
      // Hatırlatılacak şeyi temizle: zaman ifadelerini ve "hatırlat"ı at
      let what = text
        .replace(/^(jarvis[,\s]+|bana\s+)/i, '')
        .replace(/\b(bana\s+)?hatırlat\w*\b.*$/i, '')
        .replace(/\b(yarın|bugün|öbür gün|bu akşam|bu sabah|sabah|akşam|öğlen|gece|pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar)\b/gi, '')
        .replace(/\b(saat\s*)?\d{1,2}([:.]\d{2})?(\s?buçuk)?['’]?(de|da|te|ta)?\b/gi, '')
        .replace(/\b\d+\s*(dakika|saat|saniye)\s*sonra\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
      what = what.replace(/(y?[ıiuü]|n[ıiuü])$/i, (m) => (what.length > 4 ? m : m)).replace(/[,.]$/, '') || 'Hatırlatma'
      const r = addReminder(what.charAt(0).toLocaleUpperCase('tr-TR') + what.slice(1), at.getTime())
      say(`Tamam efendim, ${fmtWhen(at)} hatırlatacağım: ${r.text}.`, { scene: 'calendar', data: { action: 'add', focus: r, items: upcoming() }, hold: 2600 })
      return true
    }
  }

  // ------------------------------------------------------- rehber (WhatsApp numarası)
  const num = text.match(/^(?:jarvis[,\s]+)?(.+?)['’]?(?:n[ıiuü]n|[ıiuü]n)?\s+(?:numaras[ıi]|telefonu|whatsapp[ıi]?)\s*(?:şu|su)?[:\s]*(\+?[\d\s()-]{10,})/i)
  if (num) {
    const phone = normalizePhone(num[2])
    if (!phone) {
      say('Numarayı anlayamadım efendim. Örneğin: Ahmet’in numarası 0532 123 45 67.')
      return true
    }
    const name = num[1].trim()
    saveContact(name, phone)
    say(`${name} kaydedildi efendim. Artık ${name} için yazdığınız mesajlar doğrudan onun sohbetinde açılacak.`)
    return true
  }
  if (/(rehber|kayitli kisiler|kayitli numaralar)/.test(f)) {
    const c = Object.values(contacts())
    say(c.length ? `Kayıtlı kişiler: ${c.map((x) => x.name).join(', ')}.` : 'Henüz kayıtlı kişi yok efendim. Örneğin "Ahmet’in numarası 0532 123 45 67" diyebilirsiniz.')
    return true
  }

  // ------------------------------------------------------------------ mesaj
  const msg = text.match(/^(?:jarvis[,\s]+)?(.+?)['’]?(?:ya|ye|a|e)\s+(.+?)\s+(?:diye\s+)?(?:yaz|mesaj (?:at|gönder|yolla)|gönder|ilet)\b/i)
  if (msg && !/(çevir|hesap|not)/i.test(text)) {
    const to = msg[1].replace(/['’]$/, '')
    const body = msg[2].replace(/\s+diye$/i, '')
    setStore({ pendingMessage: { to, text: body } })
    run([{ type: 'say', text: `${to} için şu mesajı hazırladım efendim: "${body}". Göndereyim mi?` }, { type: 'end' }])
    return true
  }

  // ---------------------------------------------------------------- kamera
  if (/(bu ne\b|bunu tani|kamera(yi)? ac|fotograf(a|i)? (bak|cek|analiz)|goruntuyu analiz|ne goruyorsun|resme bak)/.test(f)) {
    setStore({ visionOpen: true })
    sfx('pop')
    run([{ type: 'say', text: 'Kamera hazır efendim. Fotoğraf çekin ya da galeriden seçin.' }, { type: 'end' }])
    return true
  }

  // --------------------------------------------------------------- Roborock
  // iPhone'da Kısayollar (Siri Shortcuts) üzerinden gerçek komut: Roborock uygulamasındaki
  // kısayol adıyla çalıştırılır ("Salon Süpür", "Süpür", "Şarja Dön" …)
  if (/(supur|paspas|robot supurge|roborock|sarja (don|gonder|git)|temizli)/.test(f)) {
    const ROOMS: [string, string][] = [['oturma odasi', 'Oturma Odası'], ['salon', 'Salon'], ['mutfak', 'Mutfak'], ['koridor', 'Koridor'], ['yatak odasi', 'Yatak Odası'], ['banyo', 'Banyo'], ['cocuk odasi', 'Çocuk Odası'], ['calisma odasi', 'Çalışma Odası']]
    const rooms = ROOMS.filter(([k]) => f.includes(k))
    const mode = /sarja|dur(dur)?\b|bitir/.test(f) ? 'dock' : /paspas/.test(f) && /supur/.test(f) ? 'both' : /paspas/.test(f) ? 'mop' : 'vacuum'
    const act = { dock: 'Şarja Dön', both: 'Süpür Paspas', mop: 'Paspas', vacuum: 'Süpür' }[mode]
    const shortcut = mode === 'dock' || !rooms.length ? act : `${rooms[0][1]} ${act}`
    const real = isIOS()
    run([
      { type: 'scene', scene: 'vacuum', data: { mode, rooms: rooms.length ? rooms.map(([k]) => k) : ['salon'], demo: !real }, hold: 4500 },
      {
        type: 'say',
        text: real
          ? mode === 'dock' ? 'Roborock şarj istasyonuna dönüyor efendim.' : `Roborock ${rooms.length ? rooms.map(([, n]) => n).join(' ve ') + ' için ' : ''}çalışmaya başlıyor efendim.`
          : 'Roborock’u şimdilik yalnızca iPhone’daki Kısayollar üzerinden çalıştırabiliyorum efendim; burada nasıl görüneceğini gösteriyorum.',
      },
      { type: 'end' },
    ])
    if (real) setTimeout(() => (location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcut)}`), 1200)
    return true
  }
  return false
}

// ------------------------------------------------------------------ rehber
// Numaralar YALNIZCA bu telefonda saklanır (sunucuya gitmez)
interface Contact { name: string; phone: string }
function contacts(): Record<string, Contact> {
  try {
    return JSON.parse(localStorage.getItem('jarvis.contacts') || '{}')
  } catch {
    return {}
  }
}
/** "Ahmet", "Ahmet'e", "anneme" → aynı anahtar */
const contactKey = (n: string) => fold(n).replace(/['’]/g, '').replace(/\s+/g, ' ').trim()
function findContact(name: string): Contact | undefined {
  const all = contacts()
  const k = contactKey(name)
  for (const cand of [k, k.replace(/(ya|ye|a|e|m)$/, ''), k.replace(/(im|um|ım|üm|m)$/, ''), k + 'm']) if (all[cand]) return all[cand]
  return undefined
}
function saveContact(name: string, phone: string) {
  const all = contacts()
  all[contactKey(name)] = { name, phone }
  try {
    localStorage.setItem('jarvis.contacts', JSON.stringify(all))
  } catch {
    /* gizli sekme */
  }
}
/** Türkiye numarası → uluslararası rakamlar (905321234567) */
export function normalizePhone(raw: string) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('0')) d = '90' + d.slice(1)
  if (d.length === 10 && d.startsWith('5')) d = '90' + d
  return d.length >= 11 && d.length <= 15 ? d : undefined
}

/** Hazırlanan mesajı onaylayınca: kağıt uçak + WhatsApp (kayıtlıysa doğrudan o kişinin sohbeti) */
export function sendPendingMessage(m: { to: string; text: string }) {
  const c = findContact(m.to)
  sfx('paper')
  play([{ type: 'scene', scene: 'message', data: { ...m, to: c?.name || m.to }, hold: 2400 }, { type: 'say', text: c ? `${c.name} ile sohbet açılıyor efendim; gönder tuşuna basmanız yeterli.` : `WhatsApp açılıyor efendim; ${m.to} kişisini seçip gönderin. Bir dahakine doğrudan açmam için numarasını söyleyebilirsiniz.` }, { type: 'end' }])
  const url = `https://wa.me/${c ? c.phone : ''}?text=${encodeURIComponent(m.text)}`
  setTimeout(() => window.open(url, '_blank'), 1800)
}
