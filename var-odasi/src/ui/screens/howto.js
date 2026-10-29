// Nasıl Oynanır: VAR protokolü, kontroller ve interaktif eğitim maçı
import { h } from '../dom.js';
import { page } from './common.js';
import { PROTOCOL_TEXT } from '../../data/rules.js';
import { startTraining } from './training.js';

export class HowToScreen {
  constructor(app) {
    this.app = app;
    const li = (t) => h('li', { style: { margin: '6px 0', lineHeight: 1.5 } }, t);
    const body = h('div.grid2', null,
      h('div.card', null,
        h('h3', null, '🎓 İnteraktif eğitim maçı'),
        h('p', null, 'Adım adım rehberle iki pozisyon: önce ofsayt aracını, sonra temas ve penaltı incelemesini öğren.'),
        h('div.col', null,
          h('button.btn.primary', { style: { height: '52px' }, onclick: () => tutorialOffside(app) }, '1. Ders — Ofsayt aracı'),
          h('button.btn', { style: { height: '52px' }, onclick: () => tutorialPenalty(app) }, '2. Ders — Penaltı ve OFR'),
        ),
        h('h3', { style: { marginTop: '18px' } }, '🧭 VAR protokolü'),
        h('ul', { style: { paddingLeft: '18px', fontSize: '14px' } }, ...PROTOCOL_TEXT.map(li)),
      ),
      h('div.card', null,
        h('h3', null, '🕹️ Kontroller'),
        h('div.kv', null,
          h('span', null, 'Oynat / duraklat'), h('span', null, 'Boşluk · ▶ düğmesi'),
          h('span', null, 'Kare kare'), h('span', null, '← → (Shift ile 10 kare) · ‹ 1  1 › düğmeleri'),
          h('span', null, 'Sarma'), h('span', null, 'Zaman çizelgesini sürükle'),
          h('span', null, 'Yavaş çekim'), h('span', null, '0.1x · 0.25x · 0.5x · 1x'),
          h('span', null, 'Kamera'), h('span', null, '1–6 tuşları · kamera düğmeleri (seçili görüntüye)'),
          h('span', null, 'Bölünmüş ekran'), h('span', null, '▣ ◫ ⊞ · Tab ile görüntü seç'),
          h('span', null, 'Yakınlaştırma'), h('span', null, 'Fare tekerleği · iki parmak · + / −'),
          h('span', null, 'Kaydırma'), h('span', null, 'Yakınken sürükle · çift tık: sıfırla'),
          h('span', null, 'Pas karesi / kritik kare'), h('span', null, 'P / K tuşları'),
          h('span', null, 'APP’ye git'), h('span', null, 'A tuşu · ⏮ APP'),
          h('span', null, 'Canlı oyunu hızlandır'), h('span', null, 'F · ⏩ düğmesi'),
        ),
        h('h3', { style: { marginTop: '14px' } }, '📏 Ofsayt aracı'),
        h('ol', { style: { paddingLeft: '18px', fontSize: '14px' } },
          li('Pasın çıktığı kareyi bul: topa İLK temasın olduğu kare. Bir kare hata 20+ cm demektir.'),
          li('“Pas karesi” düğmesine bas.'),
          li('Hücumcunun kol hariç en ileri bölgesine tıkla (ayak, diz, gövde, kafa).'),
          li('Sondan ikinci savunmacının (genelde kaleciden sonraki en geri oyuncu) kalesine en yakın bölgesine tıkla.'),
          li('Kırmızı çizgi maviyi geçiyorsa ofsayt. Fark ekranda cm olarak yazar.'),
        ),
        h('h3', { style: { marginTop: '14px' } }, '🏅 Puanlama'),
        h('p', { style: { fontSize: '14px', lineHeight: 1.5 } }, 'Her pozisyonun simülasyon tarafından ölçülmüş kesin bir doğru cevabı vardır. Doğruluk en önemli kısımdır; hızlı karar, doğru kareyi bulmak, doğru kamera ve doğru prosedür (olgusal → doğrudan, yorum → OFR) bonus getirir. Gereksiz müdahale ve kaçırılan açık hata notunu düşürür. Gri alanda saha kararına dokunmamak doğrudur.'),
      ),
    );
    this.el = page(app, 'Nasıl Oynanır', body);
  }
}

const back = (app) => () => app.show(new HowToScreen(app));

export function tutorialOffside(app) {
  const guide = [
    { text: 'Bu bir <b class="k">ofsayt şüpheli gol</b>. Önce pozisyonu sonuna kadar izle. (Video kendiliğinden oynuyor.)', check: (vv) => vv.ph >= vv.f1 - 5 || vv.timeUsed > 14 },
    { text: 'Sağ paneldeki <b class="k">📐 Ofsayt aracı</b> düğmesine bas.', check: (vv) => vv.tool === 'offside' },
    { text: 'Zaman çizelgesini sürükle ve <b class="k">‹ 1 / 1 ›</b> (ya da ← →) ile kare kare ilerleyerek pasörün topa <b class="k">ilk dokunduğu</b> kareyi bul. Sonra <b class="k">⏺ Pas karesi</b>’ne bas.', check: (vv) => vv.off.passFrame !== null },
    { text: 'Kamerayı <b class="k">5 — ÇİZGİ</b> yap: savunma çizgisine dik bakan ofsayt kamerası. Tekerlek ya da iki parmakla yakınlaştırabilirsin.', check: (vv) => vv.views[vv.active].cam === 4 },
    { text: 'Golü atan <b class="k">hücumcunun</b> kol HARİÇ en ileri bölgesine tıkla (ayak, diz, gövde ya da kafa).', check: (vv) => !!vv.off.att },
    { text: 'Şimdi <b class="k">sondan ikinci savunmacının</b> (kaleciden sonra kalesine en yakın oyuncu) kalesine en yakın bölgesine tıkla.', check: (vv) => !!vv.off.def },
    { text: 'Kırmızı çizgi maviyi geçiyorsa <b class="k">OFSAYT</b>. Saha kararı yanlışsa doğrudan düzelt, doğruysa “Kontrol tamamlandı” de; sonra <b class="k">✔ KARARI GÖNDER</b>.', check: (vv) => vv.decided },
  ];
  startTraining(app, 'OFSAYT', 'kolay', { guide, onExit: back(app), onNext: () => tutorialPenalty(app), nextLabel: '2. Ders: Penaltı →' });
}

export function tutorialPenalty(app) {
  const guide = [
    { text: 'Şimdi bir <b class="k">penaltı şüphesi</b>. İzle: hücumcu düştü ve hakem bir karar verdi (üstte “Saha kararı”).', check: (vv) => vv.ph >= vv.f0 + vv.inc.truth.keyFrame + 25 || vv.timeUsed > 12 },
    { text: 'Alttaki <b class="k">⊞</b> düğmesiyle 4’lü bölünmüş ekrana geç ve açıları karşılaştır.', check: (vv) => vv.layout === 4 },
    { text: 'Bir görüntüye dokunup seç ve <b class="k">6 — YAKIN</b> kamerayı ata.', check: (vv) => vv.views.slice(0, vv.layout).some((v) => v.cam === 5) },
    { text: 'Temas anına git (yavaş çekim 0.25x yardımcı olur) ve <b class="k">📍 Bu kare: kritik an</b> düğmesine bas.', check: (vv) => vv.marks.contactFrame !== null },
    { text: '<b class="k">🟨 Ceza sahası çizgisi göstergesini</b> aç: temas çizginin içinde mi dışında mı? (Çizgi ceza sahasına dahildir.)', check: (vv) => vv.boxOn },
    { text: 'Karar ver. Saha kararı makulse <b class="k">Kontrol tamamlandı</b>. Açık hata varsa: yorum gerektiriyorsa <b class="k">OFR</b>, faulün yeri gibi olgusal bir hataysa <b class="k">doğrudan düzeltme</b>.', check: (vv) => vv.decided },
  ];
  startTraining(app, 'PENALTI', 'kolay', {
    guide, onExit: back(app),
    onResult: () => { app.save.data.tutorialDone = true; app.persist(); },
    onNext: back(app), nextLabel: 'Eğitimi bitir ✓',
  });
}
