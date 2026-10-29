// Saha ölçüleri (IFAB standartlarına uygun, metre) ve simülasyon sabitleri.
// Koordinat sistemi: x boyuna (kaleler x = ±52.5), z enine, y yukarı.

export const FPS = 30;
export const DT = 1 / FPS;

export const PITCH = {
  L: 105,
  W: 68,
  HL: 52.5, // yarı uzunluk: kale çizgisinin dış kenarı
  HW: 34, // yarı genişlik: taç çizgisinin dış kenarı
  LINE: 0.12, // çizgi kalınlığı (çizgiler tanımladıkları alana dahildir)
  BOX_D: 16.5, // ceza sahası derinliği
  BOX_HW: 20.16, // ceza sahası yarı genişliği
  GA_D: 5.5,
  GA_HW: 9.16,
  GOAL_HW: 3.66, // direklerin iç kenarı
  GOAL_H: 2.44,
  POST_R: 0.06,
  SPOT: 11,
  CIRCLE_R: 9.15,
};
export const BOX_LINE_X = PITCH.HL - PITCH.BOX_D; // 36.0 — ceza sahası çizgisinin dış kenarı

export const BALL_R = 0.11;

// Varlık dizinleri
export const N_PLAYERS = 22;
export const REF = 22;
export const AR1 = 23; // z = +34 tarafındaki yan hakem
export const AR2 = 24; // z = -34 tarafındaki yan hakem
export const N_ENT = 25;

// Kayıt düzeni: varlık başına kayan sayı
// [x, z, heading, phase, speed, pose, poseT, p1, p2, p3]
export const ESTRIDE = 10;
export const BSTRIDE = 4; // top: x, y, z, dönüş
export const FSTRIDE = N_ENT * ESTRIDE + BSTRIDE;

export const POSE = {
  HIDDEN: -1,
  LOCO: 0, // koşu / yürüme / bekleme (p1: kol modu)
  KICK: 1, // vuruş (p1: 1 = sol ayak)
  LUNGE: 2, // ayakta müdahale; ayak hedefi (p1 ileri, p2 sağ, p3 yükseklik)
  SLIDE: 3, // kayarak müdahale; ayak hedefi
  FALL: 4, // düşme (p1 = gövdeye göre düşüş yönü)
  DOWN: 5, // yerde yatıyor
  PUSH: 6, // iki elle itme
  CARD: 7, // hakem kart gösteriyor (p1: 1 sarı, 2 kırmızı)
  DIVE: 8, // kaleci uçuşu (p1: -1 sol / +1 sağ)
  GETUP: 9,
  CELEB: 10, // gol sevinci
  FLAG: 11, // yan hakem bayrak kaldırıyor
  POINT: 12, // hakem işaret ediyor (p1 = gövdeye göre yön)
};

// LOCO pozunda kol modları (p1)
export const ARM = {
  NORMAL: 0,
  POINT_R: 1, // sağ kol ileri uzatılmış (top istiyor)
  PROTEST: 2, // itiraz: kollar yana açık
  OUT: 3, // kol(lar) gövdeden açık — p2: açı (radyan), p3: 0 sol, 1 sağ, 2 ikisi
};

export const TEAM_HOME = 0;
export const TEAM_AWAY = 1;
