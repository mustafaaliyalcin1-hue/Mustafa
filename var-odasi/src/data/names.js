// Kurgusal oyuncu isimleri: yaygın ad ve soyadlarının rastgele birleşimi.

const FIRST = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Emre', 'Burak', 'Cem', 'Can', 'Deniz', 'Eren', 'Furkan', 'Gökhan', 'Hakan',
  'İlker', 'Kaan', 'Kerem', 'Levent', 'Murat', 'Oğuz', 'Okan', 'Onur', 'Ozan', 'Serkan', 'Sinan', 'Tolga',
  'Tuna', 'Ufuk', 'Umut', 'Volkan', 'Yasin', 'Yiğit', 'Zafer', 'Alper', 'Barış', 'Batuhan', 'Berk', 'Cenk',
  'Doğan', 'Ege', 'Ferhat', 'Halil', 'İsmail', 'Kadir', 'Kemal', 'Mert', 'Necati', 'Orhan', 'Rıdvan', 'Selim',
  'Taner', 'Tarık', 'Utku', 'Yunus', 'Arda', 'Baran', 'Çağan', 'Efe', 'Erdem', 'Görkem', 'Koray', 'Polat',
];
const LAST = [
  'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan',
  'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Korkmaz', 'Karaca', 'Tekin',
  'Erdem', 'Güneş', 'Bulut', 'Aksoy', 'Tunç', 'Akın', 'Uçar', 'Işık', 'Duman', 'Sarı', 'Bozkurt', 'Çınar',
  'Toprak', 'Ateş', 'Ekinci', 'Gök', 'Taş', 'Yazıcı', 'Keskin', 'Avcı', 'Ergin', 'Sezer', 'Uysal', 'Altun',
  'Bayram', 'Karataş', 'Kocabaş', 'Yalçın', 'Önal', 'Turan', 'Erbay', 'Soylu', 'Kalkan', 'Acar', 'Ercan',
];
const FOREIGN_FIRST = ['Lukas', 'Mateo', 'Jonas', 'Rafael', 'Nico', 'Elias', 'Tomás', 'Viktor', 'Marco', 'Sven', 'Diego', 'Pierre', 'Anders', 'Luca', 'Adrien', 'Oskar'];
const FOREIGN_LAST = ['Halvorsen', 'Moreau', 'Kovač', 'Brandt', 'Ferreira', 'Lindqvist', 'Rossetti', 'Dvořák', 'Navarro', 'Weller', 'Castell', 'Ostrander', 'Varga', 'Delacroix', 'Mertens', 'Sorensen'];

// 4-4-2 dizilimi: forma numaraları
export const SQUAD_NUMBERS = [1, 2, 4, 5, 3, 7, 6, 8, 11, 9, 10];
export const ROLE_OF = ['GK', 'DR', 'DC', 'DC', 'DL', 'MR', 'MC', 'MC', 'ML', 'FW', 'FW'];
export const ROLE_TR = { GK: 'Kaleci', DR: 'Sağ bek', DC: 'Stoper', DL: 'Sol bek', MR: 'Sağ kanat', MC: 'Orta saha', ML: 'Sol kanat', FW: 'Forvet' };

export function makeSquad(rng, foreign = false) {
  const used = new Set();
  const squad = [];
  for (let i = 0; i < 11; i++) {
    let name;
    do {
      const f = foreign && rng.chance(0.75) ? rng.pick(FOREIGN_FIRST) : rng.pick(FIRST);
      const l = foreign && rng.chance(0.75) ? rng.pick(FOREIGN_LAST) : rng.pick(LAST);
      name = `${f} ${l}`;
    } while (used.has(name));
    used.add(name);
    squad.push({ name, num: SQUAD_NUMBERS[i], role: ROLE_OF[i], skin: rng.pick(['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#d9a066']), hair: rng.pick(['#1b1b1b', '#3b2a1a', '#5a3a1a', '#2a2a2a', '#7a5a30', '#c9a050']) });
  }
  return squad;
}

export const REFEREE_NAMES = ['Suat Düdükçüoğlu', 'Kenan Yeşilçim', 'Tamer Kuralsever', 'Halit Adaletli', 'Bora Kartçı', 'Serdar Düzgün'];
export const AVAR_NAMES = ['Nazlı Ekrancı', 'Cihan Ayrıntı', 'Pelin Karelik', 'Oktay Monitör'];
