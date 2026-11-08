/** UZUN SÜRELİ HAFIZA — "Jarvis, kahvemi şekersiz içerim, unutma" */
import { z } from 'zod'
import { store } from '../store.ts'
import { defineTool } from './registry.ts'

defineTool({
  name: 'memory_save',
  description:
    'Kullanıcı hakkında kalıcı olarak hatırlanması gereken bir bilgiyi kaydet (tercihler, alışkanlıklar, önemli bilgiler). Kullanıcı "unutma", "aklında tut", "bunu hatırla" dediğinde veya açıkça kalıcı bir tercih belirttiğinde kullan. Bilgiyi üçüncü şahıs ağzından kısa yaz: "Kahvesini şekersiz içer".',
  schema: z.object({ text: z.string().min(2).describe('Kaydedilecek bilgi, kısa ve net') }),
  async run({ text }) {
    const m = store.addMemory(text)
    return { result: { saved: true, id: m.id }, scene: { scene: 'memory', data: { text }, hold: 2800 } }
  },
})

defineTool({
  name: 'memory_forget',
  description: 'Kayıtlı bir hafıza bilgisini sil (kullanıcı "bunu unut" derse). id değeri sistem talimatındaki hafıza listesinde yazar.',
  schema: z.object({ id: z.string() }),
  async run({ id }) {
    return { result: { deleted: store.deleteMemory(id) } }
  },
})
