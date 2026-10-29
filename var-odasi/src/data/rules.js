// Kural açıklamaları (IFAB Oyun Kuralları'na dayanır; metinler bu oyuna özgü kendi cümlelerimizdir).

const cm = (m) => `${Math.abs(m * 100).toFixed(Math.abs(m * 100) < 10 ? 1 : 0)} cm`;

export const PROTOCOL_TEXT = [
  'VAR yalnızca dört durumda devreye girer: gol / gol değil, penaltı / penaltı değil, direkt kırmızı kart ve kimlik karışıklığı.',
  'Temel ilke: “Açık ve net hata” ya da gözden kaçan ciddi bir olay yoksa saha kararına dokunulmaz. Yoruma açık (gri) pozisyonlarda saha kararı makulse VAR “Kontrol tamamlandı” der.',
  'Olgusal kararlar (ofsayt çizgisi, top oyun dışında mı, faulün ceza sahası içinde mi dışında mı, kart kime gösterildi) ölçülebilir; yanlışsa VAR doğrudan düzeltir.',
  'Yoruma dayalı kararlarda (temasın şiddeti, elin konumu, faulün sertliği) VAR hakemi monitöre çağırır: Sahada İnceleme (OFR). Son kararı saha hakemi verir.',
  'Gol öncesi kontrol, Atak Başlangıç Anı’na (APP) kadar geriye gider. Bu aralıktaki faul, ofsayt ya da topun oyun dışına çıkması golü geçersiz kılar.',
  'Sarı kartlar (ikinci sarı hariç) ve penaltı dışındaki serbest vuruşlar VAR incelemesine konu değildir.',
];

export function explain(inc) {
  const t = inc.truth, f = t.facts || {};
  const out = [];
  switch (inc.type) {
    case 'OFSAYT': {
      out.push('Kural 11: Topa takım arkadaşı oynadığı anda; kafa, gövde ya da ayaklarından herhangi biri rakip yarı sahada ve hem toptan hem de sondan ikinci rakip oyuncudan rakip kale çizgisine daha yakınsa oyuncu ofsayt konumundadır. Kollar ve eller (koltuk altının alt hizasından itibaren) hesaba katılmaz.');
      out.push(`Pas anında hücumcunun en ileri sayılabilir bölgesi “${f.attPart}”, sondan ikinci savunmacının ise “${f.secondPart}” idi.`);
      out.push(f.marginM > 0 ? `Hücumcu ${cm(f.marginM)} öndeydi: OFSAYT. Gol geçersiz.` : `Hücumcu ${cm(f.marginM)} gerideydi: ofsayt değil. Gol geçerli.`);
      if (f.armAhead) out.push('Dikkat: Pas anında hücumcunun kolu/eli vücudunun geri kalanından öndeydi. Kol ofsayta sayılmadığı için ölçüm vücudun diğer bölgelerinden yapılmalıydı.');
      out.push('Doğru pas karesi, topa ilk temasın olduğu karedir. Bir kare (1/30 sn) erken ya da geç seçmek, koşan bir oyuncu için 20 cm’den fazla fark yaratabilir.');
      break;
    }
    case 'PENALTI': {
      out.push('Kural 12: Rakibe dikkatsizce, pervasızca ya da aşırı güç kullanarak çelme takmak veya takmaya çalışmak doğrudan serbest vuruştur; kendi ceza sahasında yapılırsa penaltıdır. Faulün yeri temas noktasıdır ve ceza sahası çizgisi ceza sahasına dahildir.');
      if (f.contact) {
        out.push(`Temas vardı (iç içe geçme ${cm(f.penetrationM)}). Temas noktası ceza sahası çizgisinin ${f.distLineM >= 0 ? `${cm(f.distLineM)} İÇİNDEYDİ` : `${cm(f.distLineM)} DIŞINDAYDI`}.`);
        if (t.gray) out.push('Temas hafifti; bu bir yorum meselesi (gri alan). Hakemin kararı makul olduğundan VAR müdahalesi gerekmez.');
      } else {
        out.push(`Savunmacının ayağı ile hücumcunun bacağı arasında en az ${cm(f.minDistM)} mesafe kaldı: TEMAS YOK.`);
        if (f.fell) out.push('Hücumcu temas olmadan kendini attı. Bu bir simülasyondur; penaltı verilemez, sarı kart gerekir. (Simülasyon sarı kartı tek başına VAR konusu değildir, ama verilmiş bir penaltı iptal edilmelidir.)');
      }
      if (inc.subtype === 'clean') out.push('Savunmacı önce topa temiz şekilde oynadı.');
      break;
    }
    case 'ELLE': {
      out.push('Kural 12: Oyuncu kolunu/elini vücudunu doğal olmayan şekilde büyütecek biçimde açmışsa ve top koluna çarparsa elle oynamadır. Kol vücuda yakın, doğal konumdaysa ya da top omza (koltuk altının üst kısmı) çarptıysa elle oynama yoktur.');
      const reg = { kol: 'kola/ele', omuz: 'omza', govde: 'gövdeye', kafa: 'kafaya', bacak: 'bacağa', ayak: 'ayağa', yok: 'hiçbir yere' }[f.region] || f.region;
      out.push(`Top ${reg} çarptı (${f.part}). Kolun gövdeden açılma açısı yaklaşık ${Math.round(f.armAngleDeg)}°.`);
      if (f.region === 'kol' && f.armAngleDeg >= 43) out.push('Kol belirgin şekilde açık; savunmacı vücudunu büyütmüş: PENALTI.');
      else if (f.region === 'kol' && f.armAngleDeg >= 23) out.push('Kol ne tam doğal ne de belirgin açık: gri alan. Saha kararı korunmalı.');
      else if (f.region === 'kol') out.push('Kol vücuda yakın ve doğal pozisyonda: elle oynama yok.');
      else out.push('Kola temas yok: elle oynama yok.');
      break;
    }
    case 'KIRMIZI': {
      if (inc.meta.kind === 'sert') {
        out.push('Kural 12: Rakibin güvenliğini tehlikeye atan, aşırı güçle ya da krampon açık yapılan müdahale “ciddi faul hareketi”dir ve direkt kırmızı karttır. Pervasız ama tehlikeli olmayan müdahale sarı karttır.');
        out.push(`Temas yüksekliği yaklaşık ${cm(f.studsHeightM)}, müdahale hızı ${f.speed.toFixed(1)} m/sn.`);
        out.push(f.studsHeightM >= 0.34 ? 'Kramponlar baldır hizasında, yüksek hızla: rakibin sağlığını tehlikeye atan müdahale — KIRMIZI KART.' : f.studsHeightM >= 0.22 ? 'Temas bilek üstünde ama aşırı değil: gri alan. Saha kararı makul.' : 'Temas bilek hizasında, topa yönelik: sarı kart yeterli.');
      } else {
        out.push('Kural 12: Bariz gol şansını faulle engellemek (DOGSO) kırmızı karttır. Değerlendirme: kaleye uzaklık, oyunun yönü, topun kontrolü ve araya girebilecek savunmacı sayısı.');
        if (f.coverClear > 0) out.push(`Temas anında kale tarafında, hücumcunun yoluna girebilecek bir savunmacı vardı (en yakını ${f.nearestCoverM.toFixed(1)} m): bariz gol şansı yok, sarı kart.`);
        else if (f.coverGray > 0) out.push('Kale tarafında bir savunmacı vardı ama araya girip giremeyeceği tartışmalı: gri alan. Saha kararı korunmalı.');
        else out.push(`Hücumcu kaleye ${f.distGoalM.toFixed(0)} m uzaklıkta, top kontrolünde ve önünde kaleciden başka kimse yoktu: bariz gol şansı engellendi — KIRMIZI KART.`);
      }
      break;
    }
    case 'FAUL_GOL': {
      out.push('Gol kontrolü Atak Başlangıç Anı’na (APP) kadar geriye gider. Bu aralıkta hücum eden takımın yaptığı faul golü geçersiz kılar.');
      if (f.handsContact && f.fell) out.push('Hücumcu, rakibini iki eliyle sırtından itti ve rakip yere düştü. Bu net bir faul: GOL İPTAL, savunma lehine serbest vuruş.');
      else if (f.handsContact) out.push('Hücumcunun elleri rakibinin sırtındaydı ama itme hafifti, rakip dengesini korudu: gri alan. Saha kararı (gol) korunmalı.');
      else out.push('Omuz omuza, topa yönelik ve normal güçte bir mücadele: faul yok. Gol geçerli.');
      out.push(`Temas golden yaklaşık ${(f.framesBeforeGoal / 30).toFixed(1)} saniye önceydi; geriye sarıp APP’ye kadar izlemek gerekiyordu.`);
      break;
    }
    case 'KIMLIK': {
      out.push('VAR, kartın yanlış oyuncuya gösterildiği kimlik karışıklığında doğrudan müdahale eder (olgusal karar).');
      out.push(f.offender === f.cardTarget ? 'Kart, çelmeyi takan oyuncuya gösterildi: doğru.' : 'Çelmeyi takan oyuncu kart gören oyuncu değildi! Kart, temas eden oyuncuya verilmeliydi.');
      break;
    }
    case 'TOP_DISARI': {
      out.push('Kural 9: Top yerde ya da havada, kale çizgisini veya taç çizgisini TAMAMEN geçtiğinde oyun dışıdır. Çizgi sahaya dahildir; topun çizgiye değen küçük bir kısmı bile kalsa top oyundadır.');
      out.push(f.marginM > 0 ? `Top çizginin dış kenarını ${cm(f.marginM)} tamamen geçti: OYUN DIŞI. Ardından gelen gol geçersiz.` : `Topun ${cm(-f.marginM)}'lik kısmı hâlâ çizginin üzerindeydi: top oyunda. Gol geçerli.`);
      break;
    }
  }
  return out;
}

export const TYPE_LESSONS = {
  OFSAYT: 'Pas karesini bul → hücumcunun kol hariç en ileri bölgesini işaretle → sondan ikinci savunmacıyı işaretle → çizgileri karşılaştır.',
  PENALTI: 'Yakın plan ve kale arkası kamerasıyla temas karesini bul; ceza sahası çizgisi göstergesini aç; dalış mı, temas mı, içeride mi?',
  ELLE: 'Topun çarptığı bölgeyi bul: kol mu omuz mu? Kol vücudu büyütüyor mu?',
  KIRMIZI: 'Temas yüksekliği ve hız (sert faul) ya da kale tarafındaki savunmacılar (gol fırsatı).',
  FAUL_GOL: 'Golden geriye, APP işaretine kadar sar. Hücumcunun elleri rakibin sırtında mı?',
  KIMLIK: 'Yakın planda formaları oku: çelmeyi takan kim, kartı gören kim?',
  TOP_DISARI: 'Çizgi kamerasında topun en dış karesini bul; topun tamamı çizginin dışında mı?',
};
