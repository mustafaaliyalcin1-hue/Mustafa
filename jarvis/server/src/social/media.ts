/**
 * Telefondan seçilen videoların geçici deposu.
 * Video, YouTube/Instagram'a gönderilene kadar sunucuda durur; 6 saat sonra silinir.
 * (Render ücretsiz diski kalıcı değildir; bu yüzden yalnızca geçici kullanılır.)
 */
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { Readable } from 'node:stream'
import { config } from '../config.ts'

export interface MediaFile {
  id: string
  name: string
  mime: string
  size: number
  path: string
  at: number
}

const files = new Map<string, MediaFile>()
const MAX = 1.5 * 1024 ** 3 // 1,5 GB

function sweep() {
  const now = Date.now()
  for (const [id, f] of files)
    if (now - f.at > 6 * 3600e3) {
      fs.rm(f.path, { force: true }, () => {})
      files.delete(id)
    }
}

export async function saveUpload(stream: Readable, name: string, mime: string): Promise<MediaFile> {
  sweep()
  fs.mkdirSync(config.uploadDir, { recursive: true })
  const id = randomUUID()
  const ext = (path.extname(name) || (mime.includes('quicktime') ? '.mov' : '.mp4')).toLowerCase().replace(/[^.a-z0-9]/g, '')
  const p = path.join(config.uploadDir, id + ext)
  let size = 0
  stream.on('data', (c: Buffer) => {
    size += c.length
    if (size > MAX) stream.destroy(new Error('Video 1,5 GB sınırını aşıyor'))
  })
  await pipeline(stream, fs.createWriteStream(p))
  const f = { id, name: name.slice(0, 200), mime: mime || 'video/mp4', size, path: p, at: Date.now() }
  files.set(id, f)
  return f
}

export function getMedia(id: string) {
  return files.get(id)
}
