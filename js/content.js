// Uygulama içeriği. g: 1 = 1. sınıf, 2 = 2. sınıf.
// Yeni cümle/hikâye eklemek için sadece bu dosyayı düzenlemek yeterli.

export const THEMES = [
  {
    id: "ailem", title: "Ailem", icon: "👨‍👩‍👧",
    items: [
      { t: "anne", g: 1 }, { t: "baba", g: 1 }, { t: "Annem beni sever.", g: 1 },
      { t: "Babam eve geldi.", g: 1 }, { t: "Dedem bahçede.", g: 1 }, { t: "Ablam kitap okur.", g: 1 },
      { t: "Ailemle pikniğe gittik.", g: 2 }, { t: "Kardeşim bana resim çizdi.", g: 2 },
      { t: "Babaannem çok güzel börek yapar.", g: 2 }, { t: "Akşamları ailece sohbet ederiz.", g: 2 },
      { t: "Dedem bana masal anlattı.", g: 2 }, { t: "Annemle birlikte sofrayı kurduk.", g: 2 },
    ],
  },
  {
    id: "okulum", title: "Okulum", icon: "🏫",
    items: [
      { t: "okul", g: 1 }, { t: "kalem", g: 1 }, { t: "Okul çok güzel.", g: 1 },
      { t: "Ela kalem al.", g: 1 }, { t: "Sıra temiz.", g: 1 }, { t: "Zil çaldı.", g: 1 },
      { t: "Öğretmenimiz bize masal okudu.", g: 2 }, { t: "Teneffüste arkadaşlarımla oynadım.", g: 2 },
      { t: "Çantamı her akşam hazırlarım.", g: 2 }, { t: "Okulda yeni arkadaşlar edindim.", g: 2 },
      { t: "Defterime güzel yazı yazdım.", g: 2 }, { t: "Sınıfımızın panosu çok renkli.", g: 2 },
    ],
  },
  {
    id: "hayvanlar", title: "Hayvanlar", icon: "🐾",
    items: [
      { t: "kedi", g: 1 }, { t: "kuş", g: 1 }, { t: "Kedi süt içti.", g: 1 },
      { t: "Kuş uçtu.", g: 1 }, { t: "Köpek havladı.", g: 1 }, { t: "İnek ot yer.", g: 1 },
      { t: "Küçük köpek bahçede koşuyor.", g: 2 }, { t: "Kaplumbağa çok yavaş yürür.", g: 2 },
      { t: "Kelebek çiçeğe kondu.", g: 2 }, { t: "Arılar bal yapar.", g: 2 },
      { t: "Tavşan havuç yemeyi sever.", g: 2 }, { t: "Zürafanın boynu çok uzundur.", g: 2 },
    ],
  },
  {
    id: "doga", title: "Doğa ve Mevsimler", icon: "🌳",
    items: [
      { t: "ağaç", g: 1 }, { t: "güneş", g: 1 }, { t: "Kar yağdı.", g: 1 },
      { t: "Güneş doğdu.", g: 1 }, { t: "Ağaç yeşil.", g: 1 }, { t: "Yağmur yağıyor.", g: 1 },
      { t: "Bugün hava çok güneşli.", g: 2 }, { t: "Sonbaharda yapraklar sararır.", g: 2 },
      { t: "Kışın kardan adam yaptık.", g: 2 }, { t: "İlkbaharda çiçekler açar.", g: 2 },
      { t: "Yazın denize gideriz.", g: 2 }, { t: "Gökyüzünde bir gökkuşağı belirdi.", g: 2 },
    ],
  },
  {
    id: "yiyecekler", title: "Yiyecekler", icon: "🍎",
    items: [
      { t: "elma", g: 1 }, { t: "üzüm", g: 1 }, { t: "Annem elma aldı.", g: 1 },
      { t: "Süt iç.", g: 1 }, { t: "Ekmek taze.", g: 1 }, { t: "Çorba sıcak.", g: 1 },
      { t: "Kahvaltıda peynir ve zeytin yedim.", g: 2 }, { t: "Meyve yemek sağlığa yararlıdır.", g: 2 },
      { t: "Dedem bana şeker getirdi.", g: 2 }, { t: "Akşam ailemle yemek yedik.", g: 2 },
      { t: "Çileklerin hepsi kıpkırmızı.", g: 2 }, { t: "Yemekten önce ellerimizi yıkarız.", g: 2 },
    ],
  },
  {
    id: "tekerleme", title: "Tekerlemeler", icon: "🌀",
    items: [
      { t: "Şu köşe yaz köşesi.", g: 1 }, { t: "Kartal kalkar dal sarkar.", g: 1 },
      { t: "Dal sarkar kartal kalkar.", g: 1 }, { t: "Bir berber bir berbere.", g: 1 },
      { t: "Kırk küp, kırkının da kulpu kırık küp.", g: 2 },
      { t: "Şu yoğurdu sarımsaklasak da mı saklasak?", g: 2 },
      { t: "Bir berber bir berbere gel beraber demiş.", g: 2 },
      { t: "Al bu takatukayı takatukacıya götür.", g: 2 },
    ],
  },
];

export const STORIES = [
  {
    id: "minik-kedi", title: "Minik Kedi", icon: "🐱", g: 1,
    lines: ["Minik kedi bahçeye çıktı.", "Bir kelebek gördü.", "Kelebeği yakalamak istedi.", "Kelebek uçtu gitti.", "Minik kedi güldü."],
  },
  {
    id: "alinin-topu", title: "Ali'nin Topu", icon: "⚽", g: 1,
    lines: ["Ali'nin kırmızı bir topu var.", "Ali topu Ela'ya attı.", "Ela topu tuttu.", "İkisi çok eğlendi."],
  },
  {
    id: "yagmur-damlasi", title: "Yağmur Damlası", icon: "💧", g: 2,
    lines: ["Bir yağmur damlası buluttan düştü.", "Bir çiçeğin yaprağına kondu.", "Çiçek çok susamıştı.", "Damla çiçeğe hayat verdi.", "Çiçek ona teşekkür etti."],
  },
  {
    id: "ormanda-yaris", title: "Ormanda Yarış", icon: "🐢", g: 2,
    lines: ["Tavşan ile kaplumbağa yarışmaya karar verdi.", "Tavşan çok hızlı koştu.", "Yolda bir ağacın altında uyudu.", "Kaplumbağa hiç durmadan yürüdü.", "Sonunda yarışı kaplumbağa kazandı."],
  },
];

export const LETTERS = [
  { l: "A", w: "arı", e: "🐝" }, { l: "B", w: "balık", e: "🐟" }, { l: "C", w: "ceket", e: "🧥" },
  { l: "Ç", w: "çiçek", e: "🌸" }, { l: "D", w: "dede", e: "👴" }, { l: "E", w: "elma", e: "🍎" },
  { l: "F", w: "fil", e: "🐘" }, { l: "G", w: "gemi", e: "🚢" }, { l: "Ğ", w: "dağ", e: "⛰️" },
  { l: "H", w: "horoz", e: "🐓" }, { l: "I", w: "ırmak", e: "🏞️" }, { l: "İ", w: "inek", e: "🐄" },
  { l: "J", w: "jöle", e: "🍮" }, { l: "K", w: "kedi", e: "🐱" }, { l: "L", w: "limon", e: "🍋" },
  { l: "M", w: "masa", e: "🪑" }, { l: "N", w: "nota", e: "🎵" }, { l: "O", w: "okul", e: "🏫" },
  { l: "Ö", w: "ördek", e: "🦆" }, { l: "P", w: "pasta", e: "🎂" }, { l: "R", w: "roket", e: "🚀" },
  { l: "S", w: "saat", e: "⏰" }, { l: "Ş", w: "şemsiye", e: "☂️" }, { l: "T", w: "top", e: "⚽" },
  { l: "U", w: "uçak", e: "✈️" }, { l: "Ü", w: "üzüm", e: "🍇" }, { l: "V", w: "vazo", e: "🏺" },
  { l: "Y", w: "yıldız", e: "⭐" }, { l: "Z", w: "zürafa", e: "🦒" },
];

// Birbirine karışan ses çiftleri ve anlamlı kelime çiftleri.
export const SOUND_PAIRS = [
  { a: "ı", b: "i", words: [["kır", "kir"], ["kıl", "kil"], ["ılık", "ilik"]] },
  { a: "o", b: "ö", words: [["kor", "kör"], ["on", "ön"], ["ol", "öl"]] },
  { a: "u", b: "ü", words: [["kul", "kül"], ["un", "ün"], ["sus", "süs"]] },
  { a: "s", b: "ş", words: [["kas", "kaş"], ["sis", "şiş"], ["sal", "şal"]] },
  { a: "c", b: "ç", words: [["cam", "çam"], ["can", "çan"], ["acı", "açı"]] },
  { a: "r", b: "l", words: [["kar", "kal"], ["dar", "dal"], ["kor", "kol"]] },
  { a: "k", b: "g", words: [["kel", "gel"], ["kar", "gar"], ["kol", "gol"]] },
];

// Resimli kelimeler (Dinle Bul, Hece Yapbozu, Eksik Ses, Ne Demek?). en: İngilizcesi
export const PICTURE_WORDS = [
  { w: "kedi", en: "cat", e: "🐱" }, { w: "köpek", en: "dog", e: "🐶" }, { w: "kuş", en: "bird", e: "🐦" }, { w: "balık", en: "fish", e: "🐟" },
  { w: "tavşan", en: "rabbit", e: "🐰" }, { w: "kelebek", en: "butterfly", e: "🦋" }, { w: "zürafa", en: "giraffe", e: "🦒" }, { w: "kaplumbağa", en: "turtle", e: "🐢" },
  { w: "elma", en: "apple", e: "🍎" }, { w: "üzüm", en: "grapes", e: "🍇" }, { w: "muz", en: "banana", e: "🍌" }, { w: "çilek", en: "strawberry", e: "🍓" },
  { w: "portakal", en: "orange", e: "🍊" }, { w: "domates", en: "tomato", e: "🍅" }, { w: "havuç", en: "carrot", e: "🥕" }, { w: "peynir", en: "cheese", e: "🧀" },
  { w: "araba", en: "car", e: "🚗" }, { w: "uçak", en: "plane", e: "✈️" }, { w: "gemi", en: "ship", e: "🚢" }, { w: "bisiklet", en: "bike", e: "🚲" },
  { w: "güneş", en: "sun", e: "☀️" }, { w: "yıldız", en: "star", e: "⭐" }, { w: "bulut", en: "cloud", e: "☁️" }, { w: "ağaç", en: "tree", e: "🌳" },
  { w: "çiçek", en: "flower", e: "🌸" }, { w: "ev", en: "house", e: "🏠" }, { w: "top", en: "ball", e: "⚽" }, { w: "kitap", en: "book", e: "📕" },
  { w: "kalem", en: "pencil", e: "✏️" }, { w: "saat", en: "clock", e: "⏰" }, { w: "şemsiye", en: "umbrella", e: "☂️" }, { w: "gözlük", en: "glasses", e: "👓" },
  { w: "öğretmen", en: "teacher", e: "👩‍🏫" }, { w: "televizyon", en: "television", e: "📺" }, { w: "şapka", en: "hat", e: "👒" }, { w: "ayakkabı", en: "shoe", e: "👟" },
];

// "Zor seslerim" çalışması için ek kelimeler (hedef ses içerenler aranır).
export const EXTRA_WORDS = [
  "ışık", "ılık", "kırmızı", "kız", "sıcak", "kapı", "ördek", "göz", "köprü", "gönül", "üzüm", "süt", "gül", "düğme",
  "şeker", "şarkı", "kuş", "beş", "çanta", "çocuk", "çay", "cam", "ceviz", "cüzdan", "roket", "araba", "kırk", "tren",
  "kar", "zebra", "zil", "vapur", "bal", "dağ", "yağmur", "ağaç", "jöle", "fare", "horoz", "limon", "masa", "nar",
];

// Eksik Ses oyunu için karışan ses eşleri.
export const PARTNER = { ı: "i", i: "ı", o: "ö", ö: "o", u: "ü", ü: "u", s: "ş", ş: "s", c: "ç", ç: "c", g: "ğ", ğ: "g", r: "l", l: "r" };

export const AVATARS = ["🐱", "🐶", "🦊", "🐼", "🐸", "🐰", "🦁", "🐨"];

export const BADGES = [
  { id: "ilk", icon: "🌟", title: "İlk Yıldız", desc: "İlk yıldızını kazandın" },
  { id: "on-cumle", icon: "🗣️", title: "Konuşkan", desc: "10 cümleyi doğru söyledin" },
  { id: "elli-cumle", icon: "🎙️", title: "Sunucu", desc: "50 cümleyi doğru söyledin" },
  { id: "hikaye", icon: "📚", title: "Kitap Kurdu", desc: "Bir hikâyeyi baştan sona okudun" },
  { id: "tekerleme", icon: "🌀", title: "Tekerleme Ustası", desc: "Tekerlemeler bölümünü bitirdin" },
  { id: "seri3", icon: "🔥", title: "3 Gün Seri", desc: "3 gün üst üste çalıştın" },
  { id: "yuz", icon: "💯", title: "Yüz Yıldız", desc: "100 yıldız topladın" },
  { id: "zor-ses", icon: "🦸", title: "Ses Kahramanı", desc: "Zor seslerinle çalıştın" },
];
