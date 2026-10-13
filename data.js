// Uygulama içeriği: 1. ve 2. sınıf seviyesine uygun kelime, hece ve cümleler.
// Yeni içerik eklemek için sadece bu dosyayı düzenlemek yeterli.

const LETTERS = [
  { l: "A", w: "arı", e: "🐝" }, { l: "B", w: "balık", e: "🐟" }, { l: "C", w: "ceket", e: "🧥" },
  { l: "Ç", w: "çiçek", e: "🌸" }, { l: "D", w: "dede", e: "👴" }, { l: "E", w: "elma", e: "🍎" },
  { l: "F", w: "fil", e: "🐘" }, { l: "G", w: "gemi", e: "🚢" }, { l: "Ğ", w: "dağ", e: "⛰️" },
  { l: "H", w: "horoz", e: "🐓" }, { l: "I", w: "ılık", e: "♨️" }, { l: "İ", w: "inek", e: "🐄" },
  { l: "J", w: "jöle", e: "🍮" }, { l: "K", w: "kedi", e: "🐱" }, { l: "L", w: "limon", e: "🍋" },
  { l: "M", w: "masa", e: "🪑" }, { l: "N", w: "nar", e: "🍎" }, { l: "O", w: "okul", e: "🏫" },
  { l: "Ö", w: "ördek", e: "🦆" }, { l: "P", w: "pasta", e: "🎂" }, { l: "R", w: "roket", e: "🚀" },
  { l: "S", w: "saat", e: "⏰" }, { l: "Ş", w: "şemsiye", e: "☂️" }, { l: "T", w: "top", e: "⚽" },
  { l: "U", w: "uçak", e: "✈️" }, { l: "Ü", w: "üzüm", e: "🍇" }, { l: "V", w: "vazo", e: "🏺" },
  { l: "Y", w: "yıldız", e: "⭐" }, { l: "Z", w: "zürafa", e: "🦒" },
];

// Konuşma çalışması: seviyelere göre kelime ve cümleler
const SPEAK_LEVELS = [
  {
    id: "kelime",
    title: "Kelimeler",
    icon: "🔤",
    grade: "1. sınıf",
    items: ["anne", "baba", "kedi", "elma", "okul", "kitap", "çiçek", "üzüm", "kuş", "ağaç", "ışık", "göz"],
  },
  {
    id: "kisa",
    title: "Kısa Cümleler",
    icon: "💬",
    grade: "1. sınıf",
    items: [
      "Ali topu at.",
      "Ela okula gel.",
      "Kedi süt içti.",
      "Annem elma aldı.",
      "Kuş ağaca kondu.",
      "Bu benim kitabım.",
    ],
  },
  {
    id: "uzun",
    title: "Uzun Cümleler",
    icon: "📖",
    grade: "2. sınıf",
    items: [
      "Bugün hava çok güneşli.",
      "Öğretmenimiz bize masal okudu.",
      "Küçük köpek bahçede koşuyor.",
      "Dedem bana şeker getirdi.",
      "Okulda yeni arkadaşlar edindim.",
      "Akşam ailemle yemek yedik.",
    ],
  },
  {
    id: "tekerleme",
    title: "Tekerlemeler",
    icon: "🌀",
    grade: "2. sınıf",
    items: [
      "Şu köşe yaz köşesi.",
      "Bir berber bir berbere gel beraber.",
      "Kırk küp, kırkının da kulpu kırık küp.",
      "Kartal kalkar dal sarkar.",
    ],
  },
];

// Zor sesler: birbirine karışan ses çiftleri
const SOUND_PAIRS = [
  { a: "ı", b: "i", words: [["kır", "kir"], ["kıl", "kil"], ["ılık", "ilik"]] },
  { a: "o", b: "ö", words: [["kor", "kör"], ["on", "ön"], ["ol", "öl"]] },
  { a: "u", b: "ü", words: [["kul", "kül"], ["un", "ün"], ["sus", "süs"]] },
  { a: "s", b: "ş", words: [["kas", "kaş"], ["sis", "şiş"], ["sal", "şal"]] },
  { a: "c", b: "ç", words: [["cam", "çam"], ["can", "çan"], ["acı", "açı"]] },
  { a: "k", b: "g", words: [["kel", "gel"], ["kar", "gar"], ["kol", "gol"]] },
];

// Dinle-bul oyunu: kelime + resim
const PICTURE_WORDS = [
  { w: "kedi", e: "🐱" }, { w: "köpek", e: "🐶" }, { w: "kuş", e: "🐦" }, { w: "balık", e: "🐟" },
  { w: "elma", e: "🍎" }, { w: "üzüm", e: "🍇" }, { w: "muz", e: "🍌" }, { w: "çilek", e: "🍓" },
  { w: "araba", e: "🚗" }, { w: "uçak", e: "✈️" }, { w: "gemi", e: "🚢" }, { w: "bisiklet", e: "🚲" },
  { w: "güneş", e: "☀️" }, { w: "ay", e: "🌙" }, { w: "yıldız", e: "⭐" }, { w: "bulut", e: "☁️" },
  { w: "ev", e: "🏠" }, { w: "ağaç", e: "🌳" }, { w: "çiçek", e: "🌸" }, { w: "top", e: "⚽" },
  { w: "kitap", e: "📕" }, { w: "kalem", e: "✏️" }, { w: "saat", e: "⏰" }, { w: "şemsiye", e: "☂️" },
];

// Hece oyunu: doğru sırayla heceleri birleştir
const SYLLABLE_WORDS = [
  { w: "araba", e: "🚗" }, { w: "kalem", e: "✏️" }, { w: "çilek", e: "🍓" }, { w: "kelebek", e: "🦋" },
  { w: "domates", e: "🍅" }, { w: "kaplumbağa", e: "🐢" }, { w: "şemsiye", e: "☂️" }, { w: "bisiklet", e: "🚲" },
  { w: "öğretmen", e: "👩‍🏫" }, { w: "televizyon", e: "📺" }, { w: "zürafa", e: "🦒" }, { w: "portakal", e: "🍊" },
];

// Telaffuz ipuçları: bir ses yanlış söylendiğinde gösterilir
const SOUND_TIPS = {
  "ı": "“ı” sesinde dudaklarını yanlara açma, düz tut. Ağzın hafif açık, ses boğazdan gelsin: “ıııı”.",
  "i": "“i” sesinde gülümser gibi dudaklarını yanlara aç: “iiii”.",
  "o": "“o” sesinde dudaklarını yuvarla, ama öne uzatma: “oooo”.",
  "ö": "“ö” sesinde dudaklarını öpücük verir gibi yuvarla, dilin öne gelsin: “öööö”.",
  "u": "“u” sesinde dudaklarını küçük bir daire yap ve öne uzat: “uuuu”.",
  "ü": "“ü” sesinde dudakların “u” gibi yuvarlak, dilin “i” gibi önde olsun: “üüüü”.",
  "a": "“a” sesinde ağzını kocaman aç: “aaaa”.",
  "e": "“e” sesinde ağzını yarım aç, dudaklarını biraz yana çek: “eeee”.",
  "s": "“s” sesi yılan gibi: dişlerini birleştir, havayı üfle: “sssss” 🐍",
  "ş": "“ş” sesi “sus” işareti gibi: dudaklarını öne uzat: “şşşşş” 🤫",
  "c": "“c” sesi yumuşak ve titreşimli: boğazına elini koy, titrediğini hisset: “cı”.",
  "ç": "“ç” sesi sert ve kısa: hapşırır gibi havayı patlat: “çı” 🤧",
  "k": "“k” sesinde dilinin arkası damağa değer, ses titremez: “kı”.",
  "g": "“g” sesinde boğazın titrer, elini boğazına koyup dene: “gı”.",
  "ğ": "“ğ” (yumuşak g) tek başına söylenmez, önündeki sesi uzatır: “dağ” = “daa”.",
  "r": "“r” sesinde dilinin ucu üst dişlerinin arkasına hafifçe vurur: “rrr” 🏍️",
  "l": "“l” sesinde dilinin ucu üst dişlerinin arkasına değer: “lllı”.",
  "b": "“b” sesinde dudakların kapanır, sonra açılır ve ses titrer: “bı”.",
  "p": "“p” sesinde dudakların kapanıp havayı patlatır, ses titremez: “pı”.",
  "d": "“d” sesinde dilinin ucu dişlerin arkasına değer ve ses titrer: “dı”.",
  "t": "“t” sesinde dilinin ucu dişlerin arkasına değer, ses titremez: “tı”.",
  "v": "“v” sesinde üst dişlerin alt dudağına değer ve ses titrer: “vvv”.",
  "f": "“f” sesinde üst dişlerin alt dudağına değer, sadece hava üflenir: “fff”.",
  "z": "“z” sesi arı gibi vızıldar: “zzzz” 🐝",
  "j": "“j” sesi “ş” gibi ama titreşimli: “jjjj”.",
  "m": "“m” sesinde dudaklarını kapat ve burnundan ses ver: “mmm”.",
  "n": "“n” sesinde dilin damağa değer, ses burundan çıkar: “nnn”.",
  "h": "“h” sesinde camı buğulandırır gibi nefes ver: “hhh”.",
  "y": "“y” sesi “i”ye benzer ama kısacıktır: “yı”.",
};
