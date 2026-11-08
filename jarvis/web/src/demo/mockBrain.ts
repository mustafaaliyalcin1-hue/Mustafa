/**
 * DEMO BEYNİ (1. aşama)
 * Gerçek Claude beyni 2. aşamada backend'de çalışacak. Bu modül, aynı olay
 * protokolünü (JarvisEvent) sahte verilerle üretir; böylece arayüz backend
 * olmadan uçtan uca denenebilir.
 */
import { getScene } from '../animations'
import type { JarvisEvent } from '../core/types'

const norm = (s: string) => s.toLocaleLowerCase('tr-TR')

function demoOf(sceneId: string, label?: string) {
  const d = getScene(sceneId).demo || []
  return (label && d.find((x) => norm(x.label) === norm(label))) || d[0]
}

/** Metne göre olay dizisi üret */
export function mockRespond(text: string): JarvisEvent[] {
  const t = norm(text)
  const seq: JarvisEvent[] = [{ type: 'user', text }, { type: 'state', state: 'thinking' }]

  const scene = (id: string, label?: string) => {
    const d = demoOf(id, label)
    seq.push({ type: 'scene', scene: id, data: d?.data, hold: 1800 })
    if (d?.say) seq.push({ type: 'say', text: d.say })
  }

  if (/araştır|karşılaştır/.test(t)) {
    seq.push({ type: 'scene', scene: 'research', data: { topic: '', summary: '', sources: [] }, hold: 1600 })
    scene('research')
  } else if (/maç|skor|fenerbahçe|fener|puan durumu|fikstür|lig/.test(t)) {
    scene('sports', /canlı/.test(t) ? 'Canlı maç' : /sıradaki|ne zaman/.test(t) ? 'Sıradaki maç' : 'Fenerbahçe kazandı')
  } else if (/dolar|euro|avro|altın|borsa|bitcoin|kripto|kur\b|döviz/.test(t)) {
    scene('finance', /bitcoin|kripto/.test(t) ? 'Düşüş' : undefined)
  } else if (/manşet|gündem|haberler|son dakika|ne oldu/.test(t)) {
    scene('news')
  } else if (/hava|yağmur|sıcaklık|kar yağ|derece/.test(t)) {
    const label = /yağmur/.test(t) ? 'Yağmurlu' : /kar/.test(t) ? 'Karlı' : /gece/.test(t) ? 'Gece' : /rüzgar|rüzgâr/.test(t) ? 'Rüzgârlı' : /bulut/.test(t) ? 'Bulutlu' : 'Güneşli'
    scene('weather', label)
  } else if (/gerçek mi|doğru mu|yalan mı|doğrula|teyit|haber/.test(t)) {
    const label = /köprü/.test(t) ? 'YALAN' : /kahve/.test(t) ? 'YANILTICI' : /evlen/.test(t) ? 'DOĞRULANAMADI' : /webb|nasa/.test(t) ? 'DOĞRU' : ['YALAN', 'DOĞRU', 'YANILTICI', 'DOĞRULANAMADI'][Math.floor(Math.random() * 4)]
    seq.push({ type: 'scene', scene: 'factcheck', data: demoOf('factcheck', label)?.data, hold: 6600 })
    seq.push({ type: 'say', text: demoOf('factcheck', label)?.say || '' })
  } else if (/unutma|hatırla ki|aklında tut/.test(t)) {
    const what = text.replace(/jarvis,?/i, '').replace(/,?\s*unutma\.?/i, '').trim()
    seq.push({ type: 'scene', scene: 'memory', data: { text: what || text }, hold: 3000 })
    seq.push({ type: 'state', state: 'success' })
    seq.push({ type: 'say', text: 'Kaydedildi efendim. Bunu unutmayacağım.' })
  } else if (/hata|bozuk/.test(t)) {
    seq.push({ type: 'state', state: 'error', message: 'Demo: bağlantı zaman aşımına uğradı (sahte hata).' })
    seq.push({ type: 'say', text: 'Üzgünüm efendim, bir sorun oluştu. Tekrar deneyeceğim.' })
  } else if (/merhaba|selam|günaydın|nasılsın/.test(t)) {
    seq.push({ type: 'say', text: 'Merhaba efendim. Tüm sistemler çalışıyor; size nasıl yardımcı olabilirim?' })
  } else {
    seq.push({ type: 'scene', scene: 'generic', data: { label: 'İŞLEM YAPILIYOR' }, hold: 2400 })
    seq.push({ type: 'state', state: 'success' })
    seq.push({ type: 'say', text: 'Demo modundayım efendim. Gerçek yanıtlar beyin bağlandığında, yani ikinci aşamada gelecek.' })
  }
  seq.push({ type: 'end' })
  return seq
}
