// Telsiz konuşmaları, AVAR ipuçları, yorumcular, sosyal medya ve MHK olayları.
// Tüm karakterler ve hesaplar kurgusaldır. Hakaret/küfür yoktur.

export const RADIO_START = {
  OFSAYT: ['VAR, gol için kontrol ediyoruz. Ofsayt şüphesi var.', 'Golü kontrol edin, yardımcım tereddütlü.'],
  PENALTI: ['VAR, ceza sahasında temas var mı? Kontrol edin.', 'Penaltı pozisyonu, bakıyor musunuz?'],
  ELLE: ['El var mı? Ben net göremedim, kontrol edin.', 'Elle oynama itirazı var, bakın lütfen.'],
  KIRMIZI: ['Müdahale sert mi? Kırmızı için kontrol edin.', 'Kartı gösterdim, siz bir bakın.'],
  FAUL_GOL: ['Golü kontrol edin, atakta bir şey var mı?', 'Gol öncesine bakın, savunma itiraz ediyor.'],
  KIMLIK: ['Kartı doğru oyuncuya mı gösterdim? Kontrol edin.', 'Numarayı teyit edin, kalabalıktı.'],
  TOP_DISARI: ['Top çizgiden çıktı mı? Golü kontrol edin.', 'Yardımcım emin değil, top dışarıda mıydı?'],
};
export const RADIO_PRESSURE = [
  'Ne oluyor, bekliyorum.',
  'Oyuncular etrafımda, süre uzuyor!',
  'Bir şey var mı yok mu? Söyleyin.',
  'Tribünler çok gergin, hızlanalım.',
  'Kontrol devam ediyor mu?',
  'Kaptanlar sürekli soruyor, karar ne?',
];
export const RADIO_TIMEOUT = 'Süre doldu, saha kararıyla devam ediyorum!';
export const RADIO_CHECK_DONE = ['Anlaşıldı, kontrol tamam. Devam.', 'Tamam, oyunu başlatıyorum.'];
export const RADIO_OFR = ['Monitöre geliyorum.', 'Tamam, sahada inceleyeceğim.'];
export const RADIO_DIRECT = ['Anlaşıldı, kararı düzeltiyorum.', 'Tamam, olgusal düzeltme yapıyorum.'];

export const AVAR_GOOD = {
  OFSAYT: ['Bence ofsayt kamerası (5) daha net, çizgiyi oradan çekelim.', 'Pas anını iyi bul, koşu çok hızlı.', 'Sondan ikinci savunmacıya dikkat, en geride kalan o.'],
  PENALTI: ['Yakın plan (6) temasın olup olmadığını gösteriyor.', 'Temas noktası çizgiye çok yakın, ceza sahası göstergesini aç.', 'Kale arkası (3) da işe yarar.'],
  ELLE: ['Yakın planda (6) topun nereye çarptığı görünüyor.', 'Kolun konumuna dikkat et, vücudu büyütüyor mu?'],
  KIRMIZI: ['Yakın plan (6) krampon yüksekliğini gösteriyor.', 'Taktik kamera (4) kale tarafındaki savunmacıları gösterir.'],
  FAUL_GOL: ['Golden geriye sar, APP işaretine kadar bak.', 'Ters açı (2) mücadeleyi daha net gösteriyor.'],
  KIMLIK: ['Yakın planda (6) sırt numaralarını okuyabiliriz.', 'Çelmeyi takanla kartı göreni karşılaştır.'],
  TOP_DISARI: ['Çizgi kamerası (5) tam çizgiye bakıyor.', 'Topun en dış karesini bul.'],
};
export const AVAR_TRUTH = {
  OFFSIDE: 'Bana ofsayt gibi geldi ama ölçmeden emin olamayız.',
  GOAL: 'İlk izlenimim gol temiz.',
  PEN: 'Bence temas var, ciddiye almak lazım.',
  NOFOUL: 'Bana temas yok gibi geldi.',
  DIVE: 'Bence oyuncu kendini attı.',
  FK: 'Temas çizginin dışında olabilir.',
  RED: 'Bu müdahale bence çok sert.',
  NORED: 'Sert ama bence kırmızılık değil.',
  NOGOAL_FOUL: 'Golden önce bir itme gördüm sanki.',
  NOGOAL_OUT: 'Top çizgiyi geçmiş olabilir.',
  CONFIRM: 'Bence kart doğru oyuncuya.',
  SW: 'Bence kartı yanlış oyuncu gördü.',
};

// --- Yorumcular (kurgusal) ---
export const PUNDITS = [
  { name: 'Necdet Kuralbilir', role: 'Eski FIFA hakemi (kurgusal)', tone: 'teknik', color: '#22d36b' },
  { name: 'Bülent Taçoğlu', role: 'Eski futbolcu', tone: 'duygusal', color: '#ffb300' },
  { name: 'Ayla Tezcan', role: 'Spor yazarı', tone: 'analitik', color: '#4fc3f7' },
];
export const PUNDIT_LINES = {
  teknik: {
    iyi: ['Protokole birebir uygun bir VAR yönetimi. Gereksiz hiçbir müdahale yok.', 'Çizgiyi doğru karede çekti, işte modern hakemlik bu.', 'Ders kitabına girecek bir kontrol süreci.'],
    orta: ['Genel olarak iyi ama bir iki pozisyonda süre uzadı.', 'Bir kararda protokolün sınırında dolaştı.', 'Kötü değil ama mükemmel de değil.'],
    kotu: ['Açık ve net hatayı kaçırırsanız VAR’ın ne anlamı kalır?', 'Bu maçta VAR odası sınıfta kaldı.', 'Protokol böyle uygulanmaz arkadaşlar.'],
  },
  duygusal: {
    iyi: ['Valla helal olsun, bu akşam kimse VAR’dan şikâyet edemez!', 'Ben de itiraz ederdim ama görüntüler net, doğru karar.', 'Futbolun adaleti bu akşam sahadaydı.'],
    orta: ['Bir pozisyon var ki hâlâ içime sinmedi.', 'Taraftar haklı olarak sinirlendi bir ara.', 'İdare eder, ama bu ligde daha iyisini görmeliyiz.'],
    kotu: ['Bu nasıl karar? Ben oynasam saha ortasına oturur kalırdım!', 'Emeğe yazık, çok yazık!', 'VAR odasında uyuyorlar mıydı acaba?'],
  },
  analitik: {
    iyi: ['Karar başına ortalama süre çok makul, doğruluk yüksek.', 'İstatistiksel olarak sezonun en iyi VAR performanslarından biri.', 'Kamera seçimleri isabetli, ölçümler hassas.'],
    orta: ['Doğruluk fena değil ama süre yönetimi geliştirilmeli.', 'Bir kritik pozisyondaki ölçüm hatası maçın notunu düşürdü.', 'Veriler karışık bir tablo çiziyor.'],
    kotu: ['Kaçırılan açık hata sayısı kabul edilebilir değil.', 'Bu maçın verileri MHK masasına gidecek.', 'Doğruluk oranı lig ortalamasının epey altında.'],
  },
};
export const PUNDIT_INCIDENT = {
  dogru_mudahale: ['{dk}. dakikadaki müdahale tam yerindeydi.', '{dk}. dakikada VAR hatayı yakaladı, bravo.'],
  dogru_kontrol: ['{dk}. dakikada müdahale etmemek doğruydu.', '{dk}. dakikadaki pozisyonda saha kararı zaten doğruydu.'],
  gri_kontrol: ['{dk}. dakika yoruma açıktı, hakeme saygı gösterildi.'],
  kismi: ['{dk}. dakikada doğru yöne gidildi ama karar tam isabet değildi.'],
  gereksiz_gri: ['{dk}. dakikada müdahaleye gerek yoktu, gri bir pozisyondu.'],
  yanlis_mudahale: ['{dk}. dakikadaki müdahale tamamen hatalıydı.', '{dk}. dakikada doğru kararı bozdular!'],
  kacirilan: ['{dk}. dakikada çok net bir hata vardı ve VAR görmedi!', '{dk}. dakikadaki pozisyon affedilemez.'],
  yanlis_duzeltme: ['{dk}. dakikada müdahale etmek doğruydu ama yanlış karara gidildi.'],
};

// --- Sosyal medya (kurgusal hesaplar) ---
export const HANDLES = [
  ['@TribunSesi', 'Tribün Sesi'], ['@OfsaytCizgisi', 'Ofsayt Çizgisi'], ['@KaleArkasiTayfa', 'Kale Arkası'],
  ['@EmekliHakemNuri', 'Emekli Hakem Nuri'], ['@VARsizOlmaz', 'VAR’sız Olmaz'], ['@FutbolIstatistik', 'Futbol İstatistik'],
  ['@CimAdami', 'Çim Adamı'], ['@KornerBayragi', 'Korner Bayrağı'], ['@DuduklerSusmasin', 'Düdükler Susmasın'],
  ['@KurgusalSpor', 'Kurgusal Spor Ajansı'], ['@AnneminKulubu', 'Annemin Kulübü'], ['@TaktikTahtasi', 'Taktik Tahtası'],
];
export const TWEETS = {
  dogru_mudahale: ['VAR odası bugün işini yaptı, {dk}. dakikadaki düzeltme tertemiz. 👏', '{dk}. dakikada çizgiyi çeken arkadaşa çay ısmarlayın ☕', 'Hata yakalandı, adalet yerini buldu. {dk}\''],
  dogru_kontrol: ['{dk}. dakikada müdahale etmediler, doğru. Herkes hakem olmuş yine 😅', 'Saha kararı doğruydu, VAR da öyle dedi. Tartışacak bir şey yok.'],
  gri_kontrol: ['{dk}. dakika tartışılır ama protokol böyle, gri pozisyona girilmez.', 'Penaltı mı değil mi? Saatlerce konuşuruz, VAR doğru yerde durdu.'],
  kismi: ['{dk}. dakikada yarım doğru... Bu da bir şey sanırım 🤷'],
  gereksiz_gri: ['{dk}. dakikada ne gerek vardı monitöre? Hakemin kararı makuldü.', 'Her pozisyona VAR girerse maç 3 saat sürer ⏳'],
  yanlis_mudahale: ['{dk}. dakikadaki müdahale bu sezonun en tuhaf olayı olabilir 🤯', 'Doğru kararı VAR bozdu. Ekranı ters mi takmışlar?', 'VAR odasına gözlük kampanyası başlatıyorum 👓'],
  kacirilan: ['{dk}. dakikayı izleyen herkes gördü, VAR odası hariç 🙈', 'Bu pozisyonu kaçırmak için özel eğitim almak lazım.', '{dk}\' — kumanda bende olsaydı 3 saniyede bulurdum.'],
  yanlis_duzeltme: ['{dk}. dakikada müdahale doğru, karar yanlış. Yarım hamle 🙃'],
};
export const TWEETS_GENERAL = {
  iyi: ['Bugünkü VAR performansı 10 numara. Böyle devam!', 'İlk kez bir maçtan sonra VAR’ı konuşmuyoruz, güzel duygu.', 'Hakem notu yüksek gelir bu maçta.'],
  orta: ['VAR fena değildi ama mükemmel de değildi.', 'Bir iki karar dışında sorun yok.', 'Ortalama bir VAR akşamı.'],
  kotu: ['Bu maçın VAR kayıtları müzeye kaldırılsın, ibret olsun.', 'MHK bu maçı mutlaka incelemeli.', 'Bu gidişle VAR odasına sesli asistan alacaklar 🤖'],
};

// --- MHK olayları (kariyer) ---
export const MHK_EVENTS = {
  suspend: ['MHK seni bir hafta görevlendirmedi. Bu haftayı eğitim videolarıyla geçireceksin.', 'Gözlemci raporu olumsuz: MHK bir hafta dinlenmeni istedi.'],
  praise: ['MHK Başkanı performansını tebrik etti. Bir sonraki görevin daha önemli olabilir.', 'Gözlemci raporunda “örnek VAR yönetimi” ifadesi var!'],
  warn: ['MHK’dan uyarı: Protokole daha sıkı uymalısın.', 'Gözlemci notu: Kararlarda daha hızlı olmalısın.'],
  promote: ['Tebrikler! MHK seni bir üst klasmana yükseltti: {lig}.', 'Yeni sezon, yeni lig: Artık {lig} maçlarında görevlisin!'],
  demote: ['Kötü performans serisi nedeniyle bir alt klasmana indirildin: {lig}.'],
};

export const LIVE_COMMENTS = [
  'Top orta sahada, iki takım da kontrollü oynuyor.',
  'Tempo yükseliyor, tribünler coştu.',
  'Kanattan etkili bir atak gelişiyor.',
  'Savunma hattı önde, ofsayt tuzağı kuruluyor.',
  'Hakem oyunu akıcı tutuyor.',
  'Ev sahibi baskıyı artırdı.',
  'Deplasman ekibi kontra arıyor.',
];
