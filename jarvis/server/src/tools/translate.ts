/**
 * ÇEVİRİ — MyMemory (ücretsiz, anahtarsız; günlük sınırı var). Sınır dolarsa yapay zekâ çevirir.
 */
import { z } from 'zod'
import { cached } from './cache.ts'
import { getJson } from './http.ts'
import { defineTool } from './registry.ts'

export const LANGS: Record<string, { code: string; name: string; flag: string }> = {
  tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  en: { code: 'en', name: 'İngilizce', flag: '🇬🇧' },
  de: { code: 'de', name: 'Almanca', flag: '🇩🇪' },
  fr: { code: 'fr', name: 'Fransızca', flag: '🇫🇷' },
  es: { code: 'es', name: 'İspanyolca', flag: '🇪🇸' },
  it: { code: 'it', name: 'İtalyanca', flag: '🇮🇹' },
  ru: { code: 'ru', name: 'Rusça', flag: '🇷🇺' },
  ar: { code: 'ar', name: 'Arapça', flag: '🇸🇦' },
  ja: { code: 'ja', name: 'Japonca', flag: '🇯🇵' },
  zh: { code: 'zh', name: 'Çince', flag: '🇨🇳' },
  ko: { code: 'ko', name: 'Korece', flag: '🇰🇷' },
  nl: { code: 'nl', name: 'Felemenkçe', flag: '🇳🇱' },
  pt: { code: 'pt', name: 'Portekizce', flag: '🇵🇹' },
  el: { code: 'el', name: 'Yunanca', flag: '🇬🇷' },
  fa: { code: 'fa', name: 'Farsça', flag: '🇮🇷' },
  az: { code: 'az', name: 'Azerice', flag: '🇦🇿' },
  ku: { code: 'ku', name: 'Kürtçe', flag: '☀️' },
}

export async function translateText(text: string, from: string, to: string): Promise<string> {
  return cached(`tr:${from}:${to}:${text}`, 864e5, async () => {
    const j = await getJson<{ responseStatus: number; responseData: { translatedText: string }; responseDetails?: string }>(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 480))}&langpair=${from}|${to}`)
    if (j.responseStatus !== 200 || !j.responseData?.translatedText || /MYMEMORY WARNING|QUERY LENGTH/i.test(j.responseData.translatedText)) throw new Error(j.responseDetails || 'Çeviri servisi yanıt vermedi')
    return j.responseData.translatedText
  })
}

defineTool({
  name: 'translate',
  description: 'Metni bir dilden diğerine çevir ve ekranda çeviri animasyonuyla göster. Dil kodları: tr, en, de, fr, es, it, ru, ar, ja, zh, ko, nl, pt, el, fa, az.',
  schema: z.object({ text: z.string(), from: z.string().describe('Kaynak dil kodu'), to: z.string().describe('Hedef dil kodu') }),
  async run({ text, from, to }) {
    const out = await translateText(text, from, to)
    return { result: { translation: out }, scene: { scene: 'translate', data: { text, out, from: LANGS[from] ?? { code: from, name: from, flag: '🏳' }, to: LANGS[to] ?? { code: to, name: to, flag: '🏳' } }, hold: 3000 } }
  },
})
