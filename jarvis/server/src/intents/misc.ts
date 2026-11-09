/**
 * ÇEŞİTLİ KOMUTLAR
 *  Saat/tarih : "saat kaç", "bugün ayın kaçı", "bugün günlerden ne"
 *  Hesap      : "15 çarpı 23", "1250'nin yüzde 18'i", "karekök 144", "2 üzeri 10", "(12+8)/4"
 *  Hafıza     : "kahvemi şekersiz içerim, unutma", "hakkımda ne biliyorsun", "kahve bilgisini unut"
 *  Sohbet     : selam, günaydın (+ kısa hava özeti), nasılsın, teşekkürler, kimsin, ne yapabilirsin, iyi geceler
 */
import { config } from '../config.ts'
import { store } from '../store.ts'
import { fetchWeather } from '../tools/weather.ts'
import { ekle, fmt, hasPhrase, hasStem, pick, type Norm } from './text.ts'
import type { Intent } from './types.ts'

// ------------------------------------------------------------------ saat/tarih
export const timeIntent: Intent<{ ask: 'saat' | 'tarih' | 'gun' }> = {
  name: 'time',
  detect(n) {
    if (/(^|\s)saat (kac|ne)(\s|$|\?)/.test(n.f) || hasPhrase(n, 'saati soyle', 'su an saat')) return { ask: 'saat' }
    if (hasPhrase(n, 'ayin kaci', 'tarih ne', 'bugunun tarihi', 'hangi tarih', 'tarih kac')) return { ask: 'tarih' }
    if (hasPhrase(n, 'gunlerden ne', 'hangi gun', 'bugun gunlerden', 'bugun ne gunu')) return { ask: 'gun' }
    return null
  },
  async run({ ask }, emit) {
    const d = new Date()
    const tz = config.tz
    const saat = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: tz })
    const tarih = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz })
    const gun = d.toLocaleDateString('tr-TR', { weekday: 'long', timeZone: tz })
    emit({ type: 'state', state: 'success' })
    if (ask === 'saat') return `Saat ${saat} efendim.`
    if (ask === 'tarih') return `Bugün ${tarih}, ${gun} efendim.`
    return `Bugün ${gun} efendim, ${tarih}.`
  },
}

// ------------------------------------------------------------------- hafıza
type MemP = { action: 'save'; text: string } | { action: 'list' } | { action: 'forget'; what: string }

export const memoryIntent: Intent<MemP> = {
  name: 'memory',
  detect(n) {
    if (hasPhrase(n, 'hakkimda ne biliyorsun', 'neleri hatirliyorsun', 'ne hatirliyorsun', 'neler kaydettin', 'hafizanda ne var', 'neyi kaydettin')) return { action: 'list' }
    const f = n.raw.match(/^(?:jarvis[,\s]+)?(.+?)\s+(?:bilgisini|bilgiyi|kaydını|notunu)?\s*unut\b/i)
    if (f && !/unutma/i.test(n.raw)) return { action: 'forget', what: f[1].replace(/['’][a-zçğıöşü]+$/i, '') }
    const s = n.raw.match(/^(?:jarvis[,\s]+)?(?:(?:şunu\s+)?unutma[:,\s]+|aklında tut[:,\s]+|hatırla ki\s+|not al[:,\s]+)?(.+?)(?:[,\s]+(?:bunu\s+)?(?:unutma|aklında tut|not al))?[.!]*$/i)
    if (s && /(unutma|aklında tut|hatırla ki|not al)/i.test(n.raw)) {
      const text = s[1].replace(/^(şunu|bunu)\s+/i, '').trim()
      if (text.length >= 3) return { action: 'save', text }
    }
    return null
  },
  async run(p, emit) {
    if (p.action === 'save') {
      store.addMemory(p.text)
      emit({ type: 'scene', scene: 'memory', data: { text: p.text }, hold: 2800 })
      emit({ type: 'state', state: 'success' })
      return pick(['Kaydedildi efendim, bunu unutmayacağım.', 'Not ettim efendim.', 'Hafızama işledim efendim.'])
    }
    const ms = store.listMemories()
    if (p.action === 'list') {
      if (!ms.length) return 'Henüz hakkınızda kaydettiğim bir bilgi yok efendim. "Unutma" diyerek bana bir şey öğretebilirsiniz.'
      return `Hakkınızda şunları biliyorum efendim: ${ms.slice(-8).map((m) => m.text.replace(/[.!]+$/, '')).join('; ')}.`
    }
    const words = p.what.toLocaleLowerCase('tr-TR').split(/\s+/).filter((w) => w.length > 2)
    const hit = ms.find((m) => words.some((w) => m.text.toLocaleLowerCase('tr-TR').includes(w)))
    if (!hit) return 'Bununla ilgili kayıtlı bir bilgi bulamadım efendim.'
    store.deleteMemory(hit.id)
    emit({ type: 'state', state: 'success' })
    return `Tamam efendim, "${hit.text}" bilgisini unuttum.`
  },
}

// ------------------------------------------------------------------- sohbet
type Talk = 'selam' | 'gunaydin' | 'nasilsin' | 'tesekkur' | 'kimsin' | 'yetenek' | 'iyigeceler' | 'aferin'
const TALK: [Talk, RegExp][] = [
  ['gunaydin', /^(jarvis )?(gunaydin|gun aydin)( jarvis)?$/],
  ['iyigeceler', /^(jarvis )?(iyi geceler|iyi uykular|tunaydin)( jarvis)?$/],
  ['selam', /^(jarvis )?(selam|merhaba|hey|alo|selamlar|meraba|iyi aksamlar|iyi gunler|naber)( jarvis)?$/],
  ['nasilsin', /(nasilsin|naber|ne var ne yok|keyfin nasil)/],
  ['tesekkur', /^(jarvis )?(tesekkur\w*|sag ol\w*|sagol\w*|eyvallah|cok iyi|harika|super)( jarvis)?$/],
  ['kimsin', /(sen kimsin|adin ne|kimsin|sen nesin|seni kim yapti)/],
  ['yetenek', /(neler yapabilirsin|ne yapabilirsin|ne ise yararsin|yardim|komutlar neler)/],
  ['aferin', /^(aferin|bravo|tebrikler)( jarvis)?$/],
]

export const smallTalkIntent: Intent<{ kind: Talk }> = {
  name: 'smalltalk',
  detect(n) {
    const t = n.f.replace(/[.,!?]/g, '').trim()
    if (t.split(' ').length > 6) return null
    const hit = TALK.find(([, re]) => re.test(t))
    return hit ? { kind: hit[0] } : null
  },
  async run({ kind }) {
    const h = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', timeZone: config.tz })
    switch (kind) {
      case 'gunaydin': {
        let w = ''
        try {
          const x = await fetchWeather(config.defaultCity)
          w = ` ${ekle(x.city, 'loc')} hava ${x.temp} derece, ${x.desc.toLocaleLowerCase('tr-TR')}${(x.days[0]?.rain ?? 0) >= 50 ? '; şemsiyenizi unutmayın' : ''}.`
        } catch {
          /* hava alınamazsa sadece selam */
        }
        return `Günaydın efendim.${w} Size nasıl yardımcı olabilirim?`
      }
      case 'iyigeceler':
        return pick(['İyi geceler efendim. Sistemleri gece moduna alıyorum.', 'İyi uykular efendim; ben nöbetteyim.'])
      case 'selam':
        return pick([`${Number(h) < 12 ? 'Günaydın' : Number(h) < 18 ? 'Merhaba' : 'İyi akşamlar'} efendim. Tüm sistemler çalışıyor; nasıl yardımcı olabilirim?`, 'Buradayım efendim. Emrinizdeyim.'])
      case 'nasilsin':
        return pick(['Tüm sistemlerim yüzde yüz çalışıyor efendim, sorduğunuz için teşekkürler. Siz nasılsınız?', 'Gayet iyiyim efendim; devrelerim pırıl pırıl. Size nasıl yardımcı olabilirim?'])
      case 'tesekkur':
        return pick(['Rica ederim efendim.', 'Her zaman efendim.', 'Ne demek efendim, görevim.'])
      case 'aferin':
        return 'Teşekkür ederim efendim; elimden geleni yapıyorum.'
      case 'kimsin':
        return 'Ben J.A.R.V.I.S. efendim; kişisel yapay zekâ asistanınız. Sorularınızı yanıtlar, internette araştırır, hava, maç, piyasa ve haberleri takip ederim.'
      case 'yetenek':
        return 'Hava durumu, Fenerbahçe başta olmak üzere maç sonuçları ve fikstür, döviz, altın ve kripto fiyatları, güncel haberler, hesaplama, saat ve tarih, hafıza konularında hemen yardımcı olurum. Haber doğrulama ve araştırma gibi konularda yapay zekâ beynimi kullanırım. Örneğin "Fener yendi mi" ya da "yarın yağmur yağacak mı" diyebilirsiniz.'
    }
  },
}

