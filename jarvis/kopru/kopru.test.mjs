import assert from 'node:assert/strict'
import { test } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const burasi = path.dirname(fileURLToPath(import.meta.url))
process.env.KOPRU_CLAUDE_KOMUT = `node "${path.join(burasi, 'test', 'sahte-claude.mjs')}"`
process.env.APPDATA = path.join(burasi, 'test', '.appdata')
const { ciktiyiYorumla, kopruAdresi, claudeyaSor } = await import('./kopru.mjs')

test('çıktı yorumlama', () => {
  assert.deepEqual(ciktiyiYorumla('{"is_error":false,"result":"Merhaba efendim"}', '', 0), { cevap: 'Merhaba efendim' })
  assert.deepEqual(ciktiyiYorumla('uyarı satırı\n{"is_error":false,"result":"tamam"}', '', 0), { cevap: 'tamam' })
  assert.match(ciktiyiYorumla('{"is_error":true,"result":"Please run /login"}', '', 1).hata, /oturumu açık değil/)
  assert.match(ciktiyiYorumla('', 'Error: 401 Unauthorized', 1).hata, /oturumu açık değil/)
  assert.match(ciktiyiYorumla('{"is_error":true,"result":"overloaded"}', '', 1).hata, /hata döndürdü/)
  assert.match(ciktiyiYorumla('', 'komut bulunamadı', 127).hata, /beklenmeyen/)
  // Başarılı cevapta "login" kelimesi geçmesi hata sayılmaz
  assert.deepEqual(ciktiyiYorumla('{"is_error":false,"result":"login sayfasına gidin"}', '', 0), { cevap: 'login sayfasına gidin' })
})

test('köprü adresi', () => {
  assert.equal(kopruAdresi('https://jarvis-server-x.onrender.com/'), 'wss://jarvis-server-x.onrender.com/kopru')
  assert.equal(kopruAdresi('http://localhost:8787'), 'ws://localhost:8787/kopru')
})

test('claude komutu: istem stdin’den UTF-8, geçici klasörde çalışır', async () => {
  const s = await claudeyaSor('Kullanıcının yeni mesajı: Şehir neresi? ğüşıöç')
  assert.equal(s.cevap, 'Bilgisayardan cevap: Şehir neresi? ğüşıöç [klasör: geçici]')
  process.env.SAHTE_MOD = 'giris'
  const h = await claudeyaSor('selam')
  delete process.env.SAHTE_MOD
  assert.match(h.hata, /oturumu açık değil/)
})
