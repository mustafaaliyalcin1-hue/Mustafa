// Java Edition yapay zeka arkadaşı. Çalıştırma: npm run java
import 'dotenv/config'
import mineflayer from 'mineflayer'
import pf from 'mineflayer-pathfinder'
import { plugin as collectBlock } from 'mineflayer-collectblock'
import { plugin as toolPlugin } from 'mineflayer-tool'
import { Vec3 } from 'vec3'
import { Beyin } from '../ortak/beyin.js'
import { Beceriler, dusmanMi } from './beceriler.js'

const { pathfinder, Movements, goals } = pf
const AYAR = {
  host: process.env.MC_HOST || 'localhost',
  port: Number(process.env.MC_PORT || 25565),
  username: process.env.BOT_ADI || 'Yardimci',
  auth: process.env.MC_AUTH || 'offline',
  version: process.env.MC_SURUM || false,
  sahip: process.env.SAHIP || '',
  xray: (process.env.XRAY || 'otomatik').toLowerCase(), // otomatik | acik | kapali
  komut: (process.env.KOMUT || 'otomatik').toLowerCase() // otomatik: hileler açıksa komutla inşa | acik | kapali
}

// Hileler açık mı? Zararsız bir komut dener: cevap gelirse komut yetkisi var.
let komutOnbellek = null
async function komutIzni() {
  if (AYAR.komut === 'acik') return true
  if (AYAR.komut === 'kapali') return false
  if (komutOnbellek && Date.now() - komutOnbellek.t < 60000) return komutOnbellek.v
  const v = await new Promise((coz) => {
    let bitti = false
    const dinle = (m) => {
      if (/time is|daytime|saat/i.test(m)) bitir(true)
      else if (/unknown or incomplete|unknown command|permission|not allowed|bilinmeyen|yetki|izin/i.test(m)) bitir(false)
    }
    const bitir = (x) => { if (bitti) return; bitti = true; bot.removeListener('messagestr', dinle); clearTimeout(t); coz(x) }
    const t = setTimeout(() => bitir(false), 3000)
    bot.on('messagestr', dinle)
    bot.chat('/time query daytime')
  })
  komutOnbellek = { t: Date.now(), v }
  console.log(`[komut] hileler ${v ? 'AÇIK: inşaat komutla, kat kat' : 'KAPALI: inşaat gerçekçi yoldan, malzeme toplayarak'}`)
  return v
}

// Kendi bilgisayarındaki / ev ağındaki dünya mı (LAN, localhost), yoksa dışarıdaki bir sunucu mu?
const YEREL = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$)/i
const KENDI_DUNYAM = YEREL.test(AYAR.host)

/** X-ray kuralı: sadece kendi tek kişilik dünyanda açık. Sunucuda ya da başka oyuncu varken kapalı (hile olmasın). */
function xrayIzinli() {
  if (AYAR.xray === 'acik') return true
  if (AYAR.xray === 'kapali') return false
  if (!KENDI_DUNYAM) return false
  const digerleri = Object.keys(bot.players).filter((ad) => ad !== bot.username)
  return digerleri.length <= 1
}

let bot, beceri, beyin
let aktifGorev = null // { ad, token, soz }
let sonKonusan = AYAR.sahip
let sahip = AYAR.sahip // sunucuda SAHIP boşsa, adımı ilk söyleyen oyuncu sahip olur

function konus(metin) {
  if (!bot || !metin) return
  const temiz = String(metin).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
  for (let i = 0; i < temiz.length; i += 240) bot.chat(temiz.slice(i, i + 240))
  console.log(`[${AYAR.username}] ${temiz}`)
}

function oyuncuVarlik() {
  const ad = sonKonusan || AYAR.sahip
  return (ad && bot.players[ad]?.entity) || bot.nearestEntity((e) => e.type === 'player')
}

function hareketAyarla() {
  const m = new Movements(bot)
  m.allowParkour = false // zıplayarak lav üstünden geçmeye çalışmasın
  m.allow1by1towers = true
  m.canDig = true
  m.dontCreateFlow = true // sıvıya komşu bloğu kazmaz: lav akıtmaz
  m.liquidCost = 6
  m.maxDropDown = 3
  const iskele = ['dirt', 'cobblestone', 'cobbled_deepslate', 'netherrack', 'andesite', 'diorite', 'granite', 'blackstone']
  m.scafoldingBlocks = iskele.map((a) => bot.registry.itemsByName[a]?.id).filter((x) => x !== undefined)
  for (const korunan of ['chest', 'barrel', 'furnace', 'crafting_table', 'nether_portal', 'obsidian', 'bedrock', 'spawner']) {
    const b = bot.registry.blocksByName[korunan]
    if (b) m.blocksCantBreak.add(b.id)
  }
  bot.pathfinder.setMovements(m)
  bot.pathfinder.thinkTimeout = 15000
  bot.pathfinder.tickTimeout = 40
}

function durdur() {
  if (aktifGorev) aktifGorev.token.iptal = true
  try { bot.pathfinder.stop() } catch {}
  try { bot.pathfinder.setGoal(null) } catch {}
  try { bot.stopDigging() } catch {}
  try { bot.collectBlock.cancelTask() } catch {}
  aktifGorev = null
}

const GOREV_FONK = {
  gel: async () => {
    const o = oyuncuVarlik()
    if (!o) throw new Error('seni göremiyorum, çok uzaktasın')
    await beceri.uzaGit(o.position.floored(), 2)
    konus('Geldim!')
  },
  takip_et: async ({ token }) => {
    const o = oyuncuVarlik()
    if (!o) throw new Error('seni göremiyorum')
    bot.pathfinder.setGoal(new goals.GoalFollow(o, 2), true)
    while (!token.iptal) await new Promise((r) => setTimeout(r, 500))
  },
  dur: async () => {},
  odun_topla: async ({ adet }) => { await beceri.odunTopla(adet || 16); konus('Odunlar tamam.') },
  ahsap_aletler: () => beceri.ahsapAletler(),
  tas_aletler: () => beceri.tasAletler(),
  demir_aletler: () => beceri.demirAletler(),
  elmas: () => beceri.elmas(),
  nether_portali: () => beceri.portalKur(),
  nether_git: () => beceri.netherGit(),
  netherite: () => beceri.netherite(),
  hepsini_yap: () => beceri.hepsiniYap(),
  insa_et: ({ sema }) => beceri.insaEt(sema || 'kulube', oyuncuVarlik()),
  tarla_yap: () => beceri.tarlaYap(),
  maden_bul: ({ cevher, adet }) => beceri.madenBul(cevher || 'diamond', adet || 4),
  esyalari_ver: ({ esya }) => beceri.esyalariVer(oyuncuVarlik(), esya || 'hepsi'),
  uyu: () => beceri.uyu()
}

function gorevBaslat(g) {
  const f = GOREV_FONK[g.gorev]
  if (!f) return `bilinmeyen görev: ${g.gorev}`
  durdur()
  if (g.gorev === 'dur') { konus('Tamam, durdum.'); return 'durdu' }
  const token = { iptal: false }
  beceri.token = token
  const gorev = { ad: g.gorev, token }
  aktifGorev = gorev
  console.log('[görev] başladı:', g)
  gorev.soz = (async () => {
    try {
      await f({ ...g, token })
    } catch (e) {
      if (!token.iptal && !e.iptal) {
        console.error('[görev] hata:', e)
        konus(`Takıldım: ${e.message}`)
      }
    } finally {
      if (aktifGorev === gorev) aktifGorev = null
      try { bot.pathfinder.setGoal(null) } catch {}
    }
  })()
  return `${g.gorev} görevi başladı`
}

function durumMetni() {
  const p = bot.entity.position
  const env = {}
  for (const i of bot.inventory.items()) env[i.name] = (env[i.name] || 0) + i.count
  return JSON.stringify({
    konum: { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) },
    boyut: bot.game.dimension, can: Math.round(bot.health), aclik: bot.food,
    gorev: aktifGorev?.ad || 'yok', gece: !bot.time.isDay, xray: xrayIzinli() ? 'acik' : 'kapali', sunucu: KENDI_DUNYAM ? 'kendi dünyan' : 'dış sunucu', envanter: env
  })
}

// ---------- refleksler: acil durumlar görevden bağımsız ----------
let sonGuvenli = null, sonYemek = 0, sonVurus = 0, refleksSayaci = null
function refleksler() {
  if (!bot.entity) return
  const ben = bot.entity
  const alt = bot.blockAt(ben.position.offset(0, -1, 0))
  if (!ben.isInLava && ben.onGround && alt && alt.boundingBox === 'block') sonGuvenli = ben.position.clone()

  // LAV! hemen zıpla ve son güvenli yere koş
  if (ben.isInLava || bot.blockAt(ben.position)?.name === 'lava') {
    bot.setControlState('jump', true)
    if (sonGuvenli) {
      bot.lookAt(sonGuvenli.offset(0, 1.6, 0), true).catch(() => {})
      bot.setControlState('forward', true)
    }
    const kova = bot.inventory.items().find((i) => i.name === 'water_bucket')
    if (kova && Date.now() - sonVurus > 1000) {
      sonVurus = Date.now()
      bot.equip(kova, 'hand').then(() => bot.lookAt(ben.position.offset(0, -1, 0), true)).then(() => bot.activateItem()).catch(() => {})
    }
    setTimeout(() => { bot.setControlState('jump', false); bot.setControlState('forward', false) }, 1200)
    return
  }

  // yemek
  if (bot.food <= 14 && Date.now() - sonYemek > 5000 && !bot.targetDigBlock) {
    const yiyecek = bot.inventory.items().find((i) => bot.registry.foodsByName?.[i.name] && !/rotten|spider_eye|poisonous|pufferfish|suspicious/.test(i.name))
    if (yiyecek) {
      sonYemek = Date.now()
      bot.equip(yiyecek, 'hand').then(() => bot.consume()).catch(() => {})
    }
  }

  // yakındaki düşmana vur
  const dusman = bot.nearestEntity((e) => dusmanMi(e) && e.position.distanceTo(ben.position) < 3.5)
  if (dusman && Date.now() - sonVurus > 650 && !bot.targetDigBlock) {
    sonVurus = Date.now()
    const kilic = bot.inventory.items().find((i) => /_sword$/.test(i.name)) || bot.inventory.items().find((i) => /_axe$/.test(i.name))
    const vur = () => bot.lookAt(dusman.position.offset(0, dusman.height * 0.8, 0), true).then(() => bot.attack(dusman))
    ;(kilic && bot.heldItem?.name !== kilic.name ? bot.equip(kilic, 'hand').then(vur) : vur()).catch(() => {})
  }
}

function baslat() {
  bot = mineflayer.createBot({ host: AYAR.host, port: AYAR.port, username: AYAR.username, auth: AYAR.auth, version: AYAR.version })
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(collectBlock)
  bot.loadPlugin(toolPlugin)

  // Kazarken kolu her tick salla: gerçek oyuncunun tuşu basılı tutması gibi görünsün.
  // (mineflayer kendisi 350 ms'de bir sallıyor; dışarıdan tıklama spamı gibi görünüyordu.)
  bot.on('physicsTick', () => { if (bot.targetDigBlock) bot.swingArm('right') })
  // Teşhis: kazma yarıda kesilirse ya da sunucu kırmayı kabul etmezse terminale yaz
  bot.on('diggingAborted', (b) => console.log(`[kazma] yarıda kesildi: ${b?.name} ${b?.position}`))
  let kazilanAd = null
  bot.on('physicsTick', () => { if (bot.targetDigBlock) kazilanAd = bot.targetDigBlock.name })
  bot.on('diggingCompleted', (b) => {
    if (!b) return
    const ad = kazilanAd, p = b.position.clone()
    setTimeout(() => {
      const simdi = bot.blockAt(p)
      if (simdi && simdi.boundingBox === 'block' && simdi.name === ad) console.log(`[kazma] sunucu ${ad} kırmayı kabul etmedi (${p}), kazma süresi uyuşmuyor olabilir`)
    }, 1200)
  })

  bot.once('spawn', () => {
    hareketAyarla()
    beceri = new Beceriler(bot, { konus, xrayIzinli, komutIzni })
    beyin = new Beyin({
      surum: `Java ${bot.version}`,
      ad: AYAR.username,
      gorevBaslat,
      durum: durumMetni,
      semalar: () => beceri.semaListesiMetni(),
      konus
    })
    if (!refleksSayaci) refleksSayaci = setInterval(refleksler, 250)
    const xr = xrayIzinli()
    console.log(`[x-ray] ${xr ? 'AÇIK (kendi dünyan)' : 'KAPALI (sunucu ya da çok oyunculu dünya)'}; ayar: ${AYAR.xray}`)
    if (KENDI_DUNYAM) konus('Selam! Ben geldim. Bana "elmas bul", "ev yap", "takip et" gibi şeyler söyleyebilirsin.')
    else konus(`Selam! Ben ${sahip || 'sahibimin'} yardımcısıyım. Sunucudayız: x-ray kapalı, sadece sahibimi dinlerim.`)
  })
  bot.on('spawn', () => { if (beceri) hareketAyarla() }) // boyut değişince (Nether) hareket ayarları yenilensin

  bot.on('chat', (oyuncu, mesaj) => {
    if (oyuncu === bot.username) return
    if (sahip && oyuncu !== sahip) return
    if (!sahip && !KENDI_DUNYAM) {
      // sunucuda herkes komut vermesin: adımı ilk söyleyen sahibim olur
      if (!mesaj.toLowerCase().includes(bot.username.toLowerCase())) return
      sahip = oyuncu
      konus(`Tamam ${oyuncu}, artık sadece seni dinliyorum.`)
    }
    sonKonusan = oyuncu
    console.log(`<${oyuncu}> ${mesaj}`)
    if (/^(dur|stop|bekle)\b/i.test(mesaj.trim())) { gorevBaslat({ gorev: 'dur' }); return } // anında
    beyin.mesaj(oyuncu, mesaj)
  })

  bot.on('death', () => { konus('Öldüm! Yeniden doğunca devam ederim, eşyalarım öldüğüm yerde.'); durdur() })
  bot.on('kicked', (sebep) => console.error('[bağlantı] atıldım:', typeof sebep === 'string' ? sebep : JSON.stringify(sebep)))
  bot.on('error', (e) => {
    console.error('[bağlantı] hata:', e.message)
    if (/ECONNREFUSED/.test(e.message)) console.error('Sunucuya bağlanamadım. Minecraft açık mı, dünya LAN\'a açık mı, MC_PORT doğru mu?')
  })
  bot.on('end', (sebep) => {
    console.log('[bağlantı] koptu:', sebep, '— 10 saniye sonra tekrar bağlanıyorum.')
    setTimeout(baslat, 10000)
  })
}

process.on('unhandledRejection', (e) => console.error('[yakalanmamış]', e?.message || e))
baslat()
