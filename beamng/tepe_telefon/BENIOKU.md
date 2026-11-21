# Tepe Telefon — BeamNG.drive modu

Serbest sürüş için ayrıntılı akıllı telefon: 112 / 155 / 188 / taksi arama, canlı ekip takibi,
kaza algılama (otomatik 112), olay yeri tedavisi, cenaze aracı, polis ifadesi ve kaza tespit tutanağı, cüzdan.

## Kurulum
1. `tepe_telefon.zip` dosyasını açmadan şu klasöre koy:
   `%LOCALAPPDATA%\BeamNG.drive\<sürüm>\mods\`  (oyunda: Ana menü › Modlar › "Mod klasörünü aç")
2. Oyunu başlat, Modlar ekranında **Tepe Telefon** etkin olsun.
3. Serbest sürüşte **UI Uygulamaları** düzenleyicisini aç (Esc › UI Uygulamaları / Ctrl+U),
   "Tepe Telefon"u ekleyip ekranın sağ altına yerleştir, boyutunu ayarla.
4. İstersen tuş ata: Seçenekler › Kontroller › "Tepe Telefon: telefonu çıkar / cebe koy".

## Kullanım
- Alt çizgiye (ana ekran çubuğu) bas: ana ekrana döner, ana ekrandayken telefonu cebe koyar.
- Ciddi kazada 10 sn geri sayım çıkar; iptal etmezsen 112 aranır, ambulans ve trafik polisi gelir.
- Bir araca çarpınca o araç hemen dörtlülerini yakıp durur, sonra ileride uygun bir yerde sağa çeker
  (sürücüsü ağır yaralı ya da ölüyse olduğu yerde kalır). Ambulans ve polis oraya gelir.
- Ambulans yalnızca çarptığın kişiye bakar: önce hayati belirtileri kontrol eder; ölüm tespit ederse
  cenaze aracı otomatik çağrılır. Yaşıyorsa tedavi eder; sonuç tedavi bitene kadar belli olmaz.
- Cenaze aracını istediğin an çağırabilirsin: 188'i ara ya da Acil SOS › "Cenaze aracı".
- Polis gelince ifade alır, karşı tarafı da dinler, hasarı inceler; tutanakta kusur oranı ve ceza çıkar.
  Hapis yok; ceza Cüzdan'dan ödenir ya da itiraz edilir.
- Taksi: çağır, gelince "Bin", hedef seç, taksimetre çalışır; inince ücret Cüzdan'dan alınır.

## İtfaiye, yangın ve bağımsız kazalar
- 110'u ara ya da Acil SOS › İtfaiye: itfaiye gelir, yanan araçları söndürür.
- Sert kazada (yaklaşık 60 km/s üstü darbe) araç(lar) önce duman çıkarır, birkaç saniye sonra alev alır;
  112 otomatik aranırsa itfaiye de gelir. Ayarlar'dan kapatılabilir.
- Şehirde senden bağımsız kazalar olur: bir araç öndekine gerçekten çarpar, telefona trafik bildirimi gelir,
  ambulans, polis ve gerekirse itfaiye oraya gider. Ayarlar › "Bağımsız kazalar".
- Kaza algılama bazı kazaları kaçırıyorsa: Ayarlar › Algılama hassasiyeti › Yüksek.

## Polis ya da ambulans ol (Görev uygulaması)
Telefonda **Görev** uygulamasını aç, meslek seç. Aracın yerinde polis aracına ya da ambulansa dönüşür.
Tepe lambası ve siren telefondan açılır. Çağrılar telsizden düşer; kabul edince yerdeki oklar yolu gösterir.

**Ambulans:** kaza ya da fenalaşan sürücü vakası. Olay yerinde dur, her hastaya triyaj rengi ver ve doğru müdahaleyi seç
(nabız, SpO₂ ve tansiyon ekranda). Kalbi durmuş hastada CPR + defibrilatör gerekir. Sonra hastaları ambulansa al;
oklar en yakın hastaneye götürür, süre işler. Kazanç: doğru triyaj, hayatta teslim ve zamanında varış.
Hasta olay yerinde ölürse 188'den cenaze aracı çağırabilirsin.

**Polis:**
- *Kaza tespiti:* iki sürücünün ifadesini al (yalan söyleyebilirler), hasarı ve fren izlerini incele, kamera kaydı iste,
  alkolmetre yap; sonra 1. aracın kusur oranını belirle. Gerçeğe ne kadar yakınsan o kadar kazanırsın.
- *Kaçan araç:* şüpheli seni görünce kaçar. Yanına gelip durmaya zorla (15 m içinde 3 sn yavaş kalsın).
- *Çevirme:* "Öndeki aracı çevir" ile önündeki araç dörtlülerini yakıp sağa çeker. Belge iste, GBT sorgula,
  alkolmetre yap, araç içine bak; bulduğun ihlalleri işaretleyip ceza yaz ya da uyarıp bırak. Haksız ceza şikâyet getirir.
  Çevrilen araçların yaklaşık üçte biri önce yavaşlar, sonra kaçar. PIT manevrasıyla (arka tekerleğin arkasına yandan
  hafifçe vurup döndürerek) ya da önünü kesip sıkıştırarak durdur. PIT ile durdurmak ekstra kazandırır.
