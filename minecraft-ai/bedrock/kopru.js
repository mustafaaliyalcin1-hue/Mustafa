// Bedrock köprüsü: Minecraft'ın /connect özelliğiyle bağlanır, sohbeti Claude'a verir,
// Claude'un kararlarını /scriptevent ile eklentideki yardımcıya iletir.
// Çalıştırma: npm run bedrock   — sonra oyunda:  /connect localhost:3000
import 'dotenv/config'
import { WebSocketServer } from 'ws'
import { randomUUID } from 'node:crypto'
import { Beyin } from '../ortak/beyin.js'
import { semalariListele } from '../ortak/semalar.js'

const PORT = Number(process.env.KOPRU_PORT || 3000)
const AD = 'Yardımcı'
const sunucu = new WebSocketServer({ port: PORT })
console.log(`Köprü hazır. Minecraft'ta sohbete yaz:  /connect localhost:${PORT}`)

sunucu.on('connection', (ws) => {
  console.log('Minecraft bağlandı!')
  const bekleyen = new Map()

  function gonder(govde, amac = 'commandRequest') {
    const id = randomUUID()
    ws.send(JSON.stringify({ header: { version: 1, requestId: id, messagePurpose: amac, messageType: 'commandRequest' }, body: govde }))
    return id
  }

  function komut(satir, zamanAsimi = 5000) {
    return new Promise((coz) => {
      const id = gonder({ version: 1, commandLine: satir, origin: { type: 'player' } })
      const t = setTimeout(() => { bekleyen.delete(id); coz(null) }, zamanAsimi)
      bekleyen.set(id, (cevap) => { clearTimeout(t); coz(cevap) })
    })
  }

  const temiz = (s) => String(s).replace(/[\r\n]+/g, ' ').replace(/"/g, '\'').slice(0, 1500)
  const konus = (metin) => { console.log(`[${AD}] ${metin}`); komut(`scriptevent yardimci:soyle ${temiz(metin)}`) }

  const beyin = new Beyin({
    surum: 'Bedrock',
    ad: AD,
    konus,
    gorevBaslat: async (g) => {
      const cevap = await komut(`scriptevent yardimci:gorev ${JSON.stringify(g)}`)
      if (cevap && cevap.statusCode < 0) return `komut çalışmadı: ${cevap.statusMessage} (dünyada hileler açık mı, eklenti yüklü mü?)`
      return `${g.gorev} görevi başladı`
    },
    durum: async () => {
      await komut('scriptevent yardimci:durum')
      const cevap = await komut('tag @e[type=yardimci:arkadas] list')
      const m = /yzd:([^\s,]+)/.exec(cevap?.statusMessage || '')
      if (!m) return 'yardımcı dünyada yok ya da uzakta (kumandadan "Yardımcıyı çağır")'
      try { return decodeURIComponent(m[1]) } catch { return m[1] }
    },
    semalar: () => semalariListele().map((s) => `${s.ad}: ${s.aciklama}`).join('\n')
  })

  // sohbet mesajlarına abone ol
  gonder({ eventName: 'PlayerMessage' }, 'subscribe')
  komut(`scriptevent yardimci:soyle Köprü bağlandı! Artık bana sohbetten yazabilirsin.`)

  ws.on('message', (ham) => {
    let m
    try { m = JSON.parse(ham.toString()) } catch { return }
    const h = m.header || {}
    if (h.messagePurpose === 'commandResponse') { bekleyen.get(h.requestId)?.(m.body); bekleyen.delete(h.requestId); return }
    if (h.messagePurpose === 'error') { console.warn('[minecraft hata]', m.body?.statusMessage); bekleyen.get(h.requestId)?.(m.body); return }
    if (h.eventName === 'PlayerMessage' || m.body?.eventName === 'PlayerMessage') {
      const b = m.body?.properties || m.body || {}
      const tur = b.type || b.MessageType || 'chat'
      const gonderen = b.sender || b.Sender || ''
      const metin = b.message || b.Message || ''
      if (tur !== 'chat' || !metin || gonderen === AD || gonderen === 'Dış' || gonderen === 'External') return
      console.log(`<${gonderen}> ${metin}`)
      if (/^(dur|stop|bekle)\b/i.test(metin.trim())) { komut('scriptevent yardimci:gorev dur'); return }
      beyin.mesaj(gonderen, metin)
    }
  })
  ws.on('close', () => console.log('Minecraft bağlantısı kapandı. Tekrar /connect yazabilirsin.'))
})
