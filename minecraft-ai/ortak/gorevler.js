// İki sürümün (Java ve Bedrock) ortak görev kataloğu ve Claude'suz basit komut çözücü.

export const GOREVLER = {
  gel: 'Oyuncunun yanına gelir.',
  takip_et: 'Oyuncuyu takip eder (dur diyene kadar).',
  dur: 'Elindeki işi bırakır, olduğu yerde bekler.',
  odun_topla: 'Ağaç keser (adet: kaç kütük, varsayılan 16).',
  ahsap_aletler: 'Odun toplar, çalışma masası, tahta kazma ve balta yapar.',
  tas_aletler: 'Taş kazar; taş kazma, balta, kılıç ve fırın yapar.',
  demir_aletler: 'X-ray ile kömür ve demir bulur, kazar, fırında eritir; demir kazma, kılıç ve kova yapar. Altın görürse onu da alır.',
  elmas: 'X-ray ile en yakın elmasa (y≈-58) lavdan kaçarak tünel kazar; elmas kazma ve kılıç yapar.',
  nether_portali: 'Kovayla suyu lava döküp obsidyen yapar, kazar, Nether portalı kurar ve yakar.',
  nether_git: 'Portaldan Nether\'e geçer (Bedrock\'ta seninle birlikte geçer).',
  netherite: 'Nether\'de X-ray ile ancient debris bulur, eritir, altınla netherite külçesi yapar; şablon varsa kazmayı netherite\'a yükseltir.',
  hepsini_yap: 'Sıfırdan netherite\'a kadar bütün aşamaları sırayla yapar.',
  insa_et: 'Şema kütüphanesinden bir yapıyı malzemesini toplayıp blok blok kurar (sema: şema adı).',
  tarla_yap: 'Su, çapa ve tohumla 9x9 buğday tarlası yapar.',
  maden_bul: 'X-ray ile istenen cevheri bulup kazar (cevher: diamond, iron, gold, coal, ancient_debris..., adet).',
  esyalari_ver: 'Topladığı eşyaları oyuncunun önüne atar (esya: hepsi ya da belli eşya adı).',
  uyu: 'Gece ise yatak bulup uyur / yatak yoksa sığınak kazar.',
  komut: 'SADECE hileler açıkken: Minecraft komutları çalıştırır (komutlar: liste, başında / olmadan). Ör. oyuncuya eşya/zırh/kılıç vermek (give {oyuncu} diamond_sword), büyülemek (enchant), efekt, gündüz/hava, ışınlanma. {oyuncu} yerine oyuncunun adı konur. Elindeki işi bölmez.'
}

const ANAHTAR = [
  [/\b(dur|bekle|kes|yeter|stop)\b/, 'dur'],
  [/takip|peşimden|arkamdan/, 'takip_et'],
  [/\b(gel|buraya|yanıma)\b/, 'gel'],
  [/(zırh|zirh).*\b(ver|lazım|lazim)/, 'komut', { komutlar: ['give {oyuncu} diamond_helmet', 'give {oyuncu} diamond_chestplate', 'give {oyuncu} diamond_leggings', 'give {oyuncu} diamond_boots'] }],
  [/(kılıç|kilic).*\b(ver|lazım|lazim)/, 'komut', { komutlar: ['give {oyuncu} diamond_sword'] }],
  [/gündüz|gunduz|sabah yap/, 'komut', { komutlar: ['time set day'] }],
  [/hepsini|baştan sona|sıfırdan|full/, 'hepsini_yap'],
  [/netherit/, 'netherite'],
  [/portal/, 'nether_portali'],
  [/nether/, 'nether_git'],
  [/(elmas|diamond).*\b(bul|kaz|topla)\b/, 'maden_bul', { cevher: 'diamond', adet: 3 }],
  [/(demir|iron).*\b(bul|kaz|topla)\b/, 'maden_bul', { cevher: 'iron', adet: 8 }],
  [/elmas|diamond/, 'elmas'],
  [/demir|iron/, 'demir_aletler'],
  [/taş alet|tas alet|taş kazma|tas kazma/, 'tas_aletler'],
  [/tahta|ahşap alet|ahsap alet/, 'ahsap_aletler'],
  [/odun|ağaç|agac|kütük/, 'odun_topla'],
  [/tarla|farm|çiftlik|ciftlik|buğday/, 'tarla_yap'],
  [/kule/, 'insa_et', { sema: 'kule' }],
  [/viking/, 'insa_et', { sema: 'viking-evi' }],
  [/büyük ev|buyuk ev|köy evi|koy evi/, 'insa_et', { sema: 'kucuk-ev' }],
  [/iki katlı|iki katli|taş ev|tas ev/, 'insa_et', { sema: 'tas_ev' }],
  [/\bev\b|kulübe|kulube|inşa|insa/, 'insa_et', { sema: 'kulube' }],
  [/\b(ver|verir misin|at)\b|eşyalar|esyalar|envanter/, 'esyalari_ver', { esya: 'hepsi' }],
  [/uyu|gece/, 'uyu']
]

/** Claude yokken basit eşleştirme. Döner: {gorev, ...args} ya da null */
export function basitCoz(metin) {
  const m = metin.toLocaleLowerCase('tr')
  for (const [re, gorev, ek] of ANAHTAR) if (re.test(m)) return { gorev, ...(ek || {}) }
  return null
}

export const ILERLEME_SIRASI = ['ahsap_aletler', 'tas_aletler', 'demir_aletler', 'elmas', 'nether_portali', 'nether_git', 'netherite']
