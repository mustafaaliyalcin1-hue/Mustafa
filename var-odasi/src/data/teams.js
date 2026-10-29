// Tamamen KURGUSAL takımlar. Gerçek kulüp adı, arması veya oyuncusu kullanılmaz.
// İsimler Türk şehir ve yöre adlarından türetilmiştir.

const T = (id, name, short, city, shirt, shorts, socks, gk, str = 60) => ({ id, name, short, city, kit: { shirt, shorts, socks, gk }, str });

export const LEAGUES = [
  {
    id: 'amator', name: 'Bölgesel Amatör Lig',
    teams: [
      T('ova', 'Ovacık Gençlik', 'OVA', 'Ovacık', '#2e7d32', '#ffffff', '#2e7d32', '#ff9800', 40),
      T('bag', 'Bağlarbaşı Gücü', 'BAĞ', 'Bağlarbaşı', '#6a1b9a', '#212121', '#6a1b9a', '#cddc39', 38),
      T('pin', 'Pınarhisar Yolspor', 'PIN', 'Pınarhisar', '#f9a825', '#1a237e', '#f9a825', '#00bcd4', 41),
      T('koy', 'Köprüköy Dostluk', 'KÖP', 'Köprüköy', '#c62828', '#c62828', '#ffffff', '#4caf50', 39),
      T('yay', 'Yaylalar Birlik', 'YAY', 'Yaylalar', '#0277bd', '#ffffff', '#0277bd', '#ffeb3b', 37),
      T('cay', 'Çayırova Kıvılcım', 'ÇAY', 'Çayırova', '#ef6c00', '#000000', '#ef6c00', '#9c27b0', 40),
    ],
  },
  {
    id: 'lig3', name: '3. Lig',
    teams: [
      T('nig', 'Niğde Kalespor', 'NKS', 'Niğde', '#455a64', '#ffffff', '#455a64', '#ff5722', 48),
      T('kir', 'Kırşehir Bozkurtları', 'KBZ', 'Kırşehir', '#8d6e63', '#3e2723', '#8d6e63', '#00e676', 47),
      T('bil', 'Bilecik Lalesi', 'BLL', 'Bilecik', '#e91e63', '#ffffff', '#e91e63', '#3f51b5', 46),
      T('ama', 'Amasya Elmaspor', 'AES', 'Amasya', '#d32f2f', '#ffeb3b', '#d32f2f', '#03a9f4', 49),
      T('yoz', 'Yozgat Çamlık SK', 'YÇS', 'Yozgat', '#1b5e20', '#a5d6a7', '#1b5e20', '#ff9800', 45),
      T('art', 'Artvin Çoruh Gücü', 'AÇG', 'Artvin', '#00838f', '#ffffff', '#00838f', '#ffc107', 48),
    ],
  },
  {
    id: 'lig2', name: '2. Lig',
    teams: [
      T('usa', 'Uşak Halıcılar', 'UHL', 'Uşak', '#283593', '#ffffff', '#283593', '#ff7043', 55),
      T('ksk', 'Kastamonu Ormanspor', 'KOS', 'Kastamonu', '#2e7d32', '#1b5e20', '#ffffff', '#ffeb3b', 54),
      T('afy', 'Afyon Kaymaklılar', 'AKY', 'Afyon', '#fafafa', '#c62828', '#fafafa', '#673ab7', 56),
      T('tok', 'Tokat Bezcileri', 'TBZ', 'Tokat', '#6d4c41', '#ffffff', '#6d4c41', '#00bcd4', 53),
      T('bur', 'Burdur Göl Yıldızı', 'BGY', 'Burdur', '#039be5', '#01579b', '#039be5', '#ff5252', 55),
      T('cor', 'Çorum Leblebispor', 'ÇLS', 'Çorum', '#fdd835', '#d84315', '#fdd835', '#2196f3', 54),
    ],
  },
  {
    id: 'lig1', name: '1. Lig',
    teams: [
      T('erz', 'Erzurum Dadaş Gücü', 'EDG', 'Erzurum', '#0d47a1', '#ffffff', '#0d47a1', '#ff9100', 62),
      T('sam', 'Samsun Karadeniz FK', 'SKF', 'Samsun', '#e53935', '#ffffff', '#e53935', '#00c853', 63),
      T('man', 'Manisa Mesir SK', 'MMS', 'Manisa', '#000000', '#ffffff', '#000000', '#ffd600', 61),
      T('mal', 'Malatya Kayısıspor', 'MKS', 'Malatya', '#ffb300', '#5d4037', '#ffb300', '#00b0ff', 62),
      T('eld', 'Edirne Selimiye FK', 'ESF', 'Edirne', '#7b1fa2', '#ffffff', '#7b1fa2', '#76ff03', 60),
      T('den', 'Denizli Horozları', 'DHZ', 'Denizli', '#1b5e20', '#000000', '#1b5e20', '#ff4081', 61),
    ],
  },
  {
    id: 'super', name: 'Süper Lig',
    teams: [
      T('anb', 'Ankara Bozkır SK', 'ABZ', 'Ankara', '#1565c0', '#ffd600', '#1565c0', '#ff6d00', 72),
      T('izk', 'İzmir Körfez Yıldızları', 'İKY', 'İzmir', '#00acc1', '#ffffff', '#00acc1', '#ff1744', 71),
      T('bsa', 'Bursa Uludağ Gücü', 'BUG', 'Bursa', '#2e7d32', '#ffffff', '#2e7d32', '#ffab00', 70),
      T('kon', 'Konya Ova Kartalları', 'KOK', 'Konya', '#fafafa', '#2e7d32', '#2e7d32', '#651fff', 69),
      T('ant', 'Antalya Güneşspor', 'AGS', 'Antalya', '#d50000', '#ffffff', '#d50000', '#00e5ff', 70),
      T('trb', 'Trabzon Dalgakıran', 'TDK', 'Trabzon', '#880e4f', '#4fc3f7', '#880e4f', '#ffea00', 72),
      T('gaz', 'Gaziantep Kale FK', 'GKF', 'Gaziantep', '#212121', '#e53935', '#212121', '#00e676', 68),
      T('esk', 'Eskişehir Lületaşı', 'ELT', 'Eskişehir', '#f57c00', '#000000', '#f57c00', '#2979ff', 68),
    ],
  },
  {
    id: 'derbi', name: 'Derbi Maçları',
    teams: [], // derbiler aşağıda çiftler hâlinde
  },
  {
    id: 'avrupa', name: 'Avrupa Kupası',
    teams: [
      T('nor', 'Nordhafen SV', 'NOR', 'Nordhafen', '#b71c1c', '#ffffff', '#b71c1c', '#00e676', 80),
      T('mon', 'Real Montaval', 'RMV', 'Montaval', '#ffffff', '#1a237e', '#ffffff', '#ff6d00', 82),
      T('kov', 'Dinamo Kovrin', 'DKV', 'Kovrin', '#0d47a1', '#0d47a1', '#ffffff', '#ffd600', 78),
      T('ver', 'AC Verrano', 'ACV', 'Verrano', '#000000', '#000000', '#e53935', '#76ff03', 81),
      T('cal', 'Sporting Calheta', 'SCA', 'Calheta', '#2e7d32', '#ffffff', '#2e7d32', '#ff4081', 79),
      T('lun', 'Lundmark FF', 'LFF', 'Lundmark', '#ffd600', '#1565c0', '#ffd600', '#d500f9', 77),
    ],
  },
  {
    id: 'final', name: 'Turnuva Finali',
    teams: [],
  },
];

// Kurgusal derbiler — şehir içi rekabetler (gerçek kulüplerle ilgisi yoktur)
export const DERBIES = [
  {
    name: 'Boğaz Derbisi',
    a: T('hal', 'Haliç Yelkenlileri', 'HYK', 'İstanbul', '#f9a825', '#0d47a1', '#f9a825', '#00e676', 76),
    b: T('usk', 'Üsküdar Martıları', 'ÜSM', 'İstanbul', '#ffffff', '#000000', '#000000', '#ff3d00', 76),
  },
  {
    name: 'Ege Derbisi',
    a: T('kor', 'Kordon Rüzgârı', 'KRZ', 'İzmir', '#00897b', '#ffffff', '#00897b', '#ffab00', 72),
    b: T('bor', 'Bornova Zeytinliler', 'BZY', 'İzmir', '#558b2f', '#000000', '#558b2f', '#e040fb', 72),
  },
  {
    name: 'Başkent Derbisi',
    a: T('ulu', 'Ulus Kalesi FK', 'UKF', 'Ankara', '#c62828', '#000000', '#c62828', '#00e5ff', 71),
    b: T('cny', 'Çankaya Gençlerbirliği Ankara', 'ÇGA', 'Ankara', '#1a237e', '#fafafa', '#1a237e', '#ffea00', 70),
  },
  {
    name: 'Karadeniz Derbisi',
    a: T('ris', 'Rize Çay Gücü', 'RÇG', 'Rize', '#2e7d32', '#1565c0', '#2e7d32', '#ff9100', 70),
    b: T('ord', 'Ordu Fındık SK', 'OFS', 'Ordu', '#6a1b9a', '#ffffff', '#6a1b9a', '#c6ff00', 69),
  },
];

export const FINAL_TEAMS = [
  T('ist', 'İstanbul Boğaziçi FK', 'İBF', 'İstanbul', '#ffffff', '#c62828', '#c62828', '#00e676', 86),
  T('lon', 'Albion Rovers Kingsbury', 'ARK', 'Kingsbury', '#1565c0', '#ffffff', '#1565c0', '#ffd600', 85),
];

export const STADIUMS = {
  amator: ['Belediye Çim Sahası', 'Köy Meydanı Stadı', 'İlçe Spor Kompleksi'],
  lig3: ['Şehir Stadı', 'Gençlik Parkı Stadı', 'Atatürk Şehir Stadı'],
  lig2: ['Yeni Şehir Stadı', 'Kent Arena', 'Vadi Stadyumu'],
  lig1: ['Büyükşehir Arena', 'Liman Stadyumu', 'Ova Park'],
  super: ['Anadolu Arena', 'Körfez Park', 'Kartal Yuvası Stadyumu', 'Güneş Arena'],
  derbi: ['Boğaz Arena', 'Ege Park Stadyumu', 'Başkent Arena'],
  avrupa: ['Arena Europa', 'Stade du Nord', 'Parkstadion'],
  final: ['Final Arena — Ulusal Stadyum'],
};

export function allTeams() {
  const list = [];
  for (const l of LEAGUES) list.push(...l.teams);
  for (const d of DERBIES) list.push(d.a, d.b);
  list.push(...FINAL_TEAMS);
  return list;
}

// İki takımın formalar çakışırsa deplasman takımına yedek forma
export function resolveKits(home, away) {
  const h = { ...home.kit }, a = { ...away.kit };
  if (colorDist(h.shirt, a.shirt) < 120) {
    a.shirt = lumi(h.shirt) > 0.5 ? '#263238' : '#f5f5f5';
    a.shorts = lumi(h.shirt) > 0.5 ? '#263238' : '#f5f5f5';
    a.socks = a.shirt;
  }
  return [h, a];
}
function hexRgb(hx) {
  const v = parseInt(hx.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function colorDist(a, b) {
  const x = hexRgb(a), y = hexRgb(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}
export function lumi(hx) {
  const [r, g, b] = hexRgb(hx);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
