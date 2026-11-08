/**
 * Basit kalıcı depo (JSON dosyası). Hafıza, tercihler, hatırlatmalar burada.
 * NOT: Render ücretsiz katmanında disk kalıcı değildir (yeniden başlatmada silinir).
 * 4. aşamada bu arayüzün arkasına Firebase Firestore bağlanacak; kodun geri kalanı değişmeyecek.
 */
import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.ts'

type Data = { memories: { id: string; text: string; at: number }[] }

const file = path.join(config.dataDir, 'jarvis.json')
let data: Data = { memories: [] }
try {
  data = { ...data, ...JSON.parse(fs.readFileSync(file, 'utf8')) }
} catch {
  /* ilk çalıştırma */
}

function save() {
  try {
    fs.mkdirSync(config.dataDir, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch (e) {
    console.warn('Depo yazılamadı:', e)
  }
}

export const store = {
  addMemory(text: string) {
    const m = { id: Math.random().toString(36).slice(2, 10), text, at: Date.now() }
    data.memories.push(m)
    save()
    return m
  },
  listMemories() {
    return data.memories
  },
  deleteMemory(id: string) {
    const before = data.memories.length
    data.memories = data.memories.filter((m) => m.id !== id)
    save()
    return data.memories.length < before
  },
}
