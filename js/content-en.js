// Hafif düzey İngilizce içerik (1. ve 2. sınıf, başlangıç).
// t: İngilizce metin, tr: Türkçe anlamı, p: Türk harfleriyle yaklaşık okunuşu, e: resim, g: sınıf

export const EN_THEMES = [
  {
    id: "en-greetings", title: "Selamlaşma", sub: "Greetings", icon: "👋",
    items: [
      { t: "Hello!", tr: "Merhaba!", p: "helou", e: "👋", g: 1 },
      { t: "Goodbye!", tr: "Hoşça kal!", p: "gudbay", e: "🙋", g: 1 },
      { t: "Thank you.", tr: "Teşekkür ederim.", p: "tenk yu", e: "🙏", g: 1 },
      { t: "Good morning!", tr: "Günaydın!", p: "gud mooning", e: "🌅", g: 1 },
      { t: "Yes.", tr: "Evet.", p: "yes", e: "👍", g: 1 },
      { t: "Please.", tr: "Lütfen.", p: "pliiz", e: "🥺", g: 1 },
      { t: "My name is Ali.", tr: "Benim adım Ali.", p: "may neym iz ali", e: "🧒", g: 2 },
      { t: "How are you?", tr: "Nasılsın?", p: "hau ar yu", e: "🙂", g: 2 },
      { t: "I am fine, thank you.", tr: "İyiyim, teşekkür ederim.", p: "ay em fayn, tenk yu", e: "😊", g: 2 },
      { t: "What is your name?", tr: "Senin adın ne?", p: "uot iz yor neym", e: "❓", g: 2 },
      { t: "Nice to meet you.", tr: "Tanıştığıma memnun oldum.", p: "nays tu miit yu", e: "🤝", g: 2 },
      { t: "See you tomorrow.", tr: "Yarın görüşürüz.", p: "sii yu tumorou", e: "📅", g: 2 },
    ],
  },
  {
    id: "en-colors", title: "Renkler", sub: "Colors", icon: "🎨",
    items: [
      { t: "red", tr: "kırmızı", p: "red", e: "🔴", g: 1 },
      { t: "blue", tr: "mavi", p: "bluu", e: "🔵", g: 1 },
      { t: "green", tr: "yeşil", p: "griin", e: "🟢", g: 1 },
      { t: "yellow", tr: "sarı", p: "yelou", e: "🟡", g: 1 },
      { t: "black", tr: "siyah", p: "blek", e: "⚫", g: 1 },
      { t: "white", tr: "beyaz", p: "uayt", e: "⚪", g: 1 },
      { t: "The sun is yellow.", tr: "Güneş sarıdır.", p: "dı san iz yelou", e: "☀️", g: 2 },
      { t: "The sky is blue.", tr: "Gökyüzü mavidir.", p: "dı skay iz bluu", e: "🌤️", g: 2 },
      { t: "I like red.", tr: "Kırmızıyı severim.", p: "ay layk red", e: "❤️", g: 2 },
      { t: "The grass is green.", tr: "Çimen yeşildir.", p: "dı gras iz griin", e: "🌱", g: 2 },
      { t: "My bag is black.", tr: "Çantam siyah.", p: "may beg iz blek", e: "🎒", g: 2 },
      { t: "Snow is white.", tr: "Kar beyazdır.", p: "snou iz uayt", e: "❄️", g: 2 },
    ],
  },
  {
    id: "en-numbers", title: "Sayılar", sub: "Numbers", icon: "🔢",
    items: [
      { t: "one", tr: "bir", p: "uan", e: "1️⃣", g: 1 },
      { t: "two", tr: "iki", p: "tuu", e: "2️⃣", g: 1 },
      { t: "three", tr: "üç", p: "thrii (dil dişlerin arasında)", e: "3️⃣", g: 1 },
      { t: "four", tr: "dört", p: "foor", e: "4️⃣", g: 1 },
      { t: "five", tr: "beş", p: "fayv", e: "5️⃣", g: 1 },
      { t: "six", tr: "altı", p: "siks", e: "6️⃣", g: 1 },
      { t: "seven", tr: "yedi", p: "sevın", e: "7️⃣", g: 2 },
      { t: "eight", tr: "sekiz", p: "eyt", e: "8️⃣", g: 2 },
      { t: "nine", tr: "dokuz", p: "nayn", e: "9️⃣", g: 2 },
      { t: "ten", tr: "on", p: "ten", e: "🔟", g: 2 },
      { t: "I have two cats.", tr: "İki kedim var.", p: "ay hev tuu kets", e: "🐱", g: 2 },
      { t: "I am seven years old.", tr: "Yedi yaşındayım.", p: "ay em sevın yiırz ould", e: "🎂", g: 2 },
    ],
  },
  {
    id: "en-animals", title: "Hayvanlar", sub: "Animals", icon: "🐾",
    items: [
      { t: "cat", tr: "kedi", p: "ket", e: "🐱", g: 1 },
      { t: "dog", tr: "köpek", p: "dog", e: "🐶", g: 1 },
      { t: "bird", tr: "kuş", p: "börd", e: "🐦", g: 1 },
      { t: "fish", tr: "balık", p: "fiş", e: "🐟", g: 1 },
      { t: "cow", tr: "inek", p: "kau", e: "🐄", g: 1 },
      { t: "duck", tr: "ördek", p: "dak", e: "🦆", g: 1 },
      { t: "The cat is small.", tr: "Kedi küçüktür.", p: "dı ket iz smool", e: "🐈", g: 2 },
      { t: "I have a dog.", tr: "Bir köpeğim var.", p: "ay hev ı dog", e: "🐕", g: 2 },
      { t: "The bird can fly.", tr: "Kuş uçabilir.", p: "dı börd ken flay", e: "🕊️", g: 2 },
      { t: "The fish is in the water.", tr: "Balık suyun içinde.", p: "dı fiş iz in dı uootır", e: "🐠", g: 2 },
      { t: "The elephant is big.", tr: "Fil büyüktür.", p: "dı elıfınt iz big", e: "🐘", g: 2 },
      { t: "I love animals.", tr: "Hayvanları severim.", p: "ay lav enımılz", e: "🦁", g: 2 },
    ],
  },
  {
    id: "en-food", title: "Yiyecekler", sub: "Food", icon: "🍎",
    items: [
      { t: "apple", tr: "elma", p: "epıl", e: "🍎", g: 1 },
      { t: "banana", tr: "muz", p: "bınena", e: "🍌", g: 1 },
      { t: "milk", tr: "süt", p: "milk", e: "🥛", g: 1 },
      { t: "bread", tr: "ekmek", p: "bred", e: "🍞", g: 1 },
      { t: "water", tr: "su", p: "uootır", e: "💧", g: 1 },
      { t: "egg", tr: "yumurta", p: "eg", e: "🥚", g: 1 },
      { t: "I like apples.", tr: "Elmaları severim.", p: "ay layk epılz", e: "🍏", g: 2 },
      { t: "I am hungry.", tr: "Acıktım.", p: "ay em hangri", e: "😋", g: 2 },
      { t: "Water, please.", tr: "Su, lütfen.", p: "uootır, pliiz", e: "🥤", g: 2 },
      { t: "Bananas are yellow.", tr: "Muzlar sarıdır.", p: "bınenaz ar yelou", e: "🍌", g: 2 },
      { t: "I drink milk.", tr: "Süt içerim.", p: "ay drink milk", e: "🥛", g: 2 },
      { t: "This cake is good.", tr: "Bu pasta güzel.", p: "dis keyk iz gud", e: "🍰", g: 2 },
    ],
  },
  {
    id: "en-school", title: "Ailem ve Okulum", sub: "Family & School", icon: "🏫",
    items: [
      { t: "mother", tr: "anne", p: "madhır", e: "👩", g: 1 },
      { t: "father", tr: "baba", p: "faadhır", e: "👨", g: 1 },
      { t: "book", tr: "kitap", p: "buk", e: "📕", g: 1 },
      { t: "pen", tr: "kalem", p: "pen", e: "🖊️", g: 1 },
      { t: "teacher", tr: "öğretmen", p: "tiiçır", e: "👩‍🏫", g: 1 },
      { t: "friend", tr: "arkadaş", p: "frend", e: "🧑‍🤝‍🧑", g: 1 },
      { t: "This is my mother.", tr: "Bu benim annem.", p: "dis iz may madhır", e: "👩‍👧", g: 2 },
      { t: "I love my family.", tr: "Ailemi seviyorum.", p: "ay lav may femıli", e: "👨‍👩‍👧", g: 2 },
      { t: "Open your book.", tr: "Kitabını aç.", p: "oupın yor buk", e: "📖", g: 2 },
      { t: "Sit down, please.", tr: "Otur, lütfen.", p: "sit daun, pliiz", e: "🪑", g: 2 },
      { t: "Stand up, please.", tr: "Ayağa kalk, lütfen.", p: "stend ap, pliiz", e: "🧍", g: 2 },
      { t: "She is my teacher.", tr: "O benim öğretmenim.", p: "şii iz may tiiçır", e: "👩‍🏫", g: 2 },
    ],
  },
];

export const EN_STORIES = [
  {
    id: "en-my-cat", title: "My Cat", tr: "Kedim", icon: "🐱", g: 1,
    lines: [
      { t: "I have a cat.", tr: "Bir kedim var." },
      { t: "My cat is white.", tr: "Kedim beyaz." },
      { t: "My cat likes milk.", tr: "Kedim sütü sever." },
      { t: "I love my cat.", tr: "Kedimi seviyorum." },
    ],
  },
  {
    id: "en-park", title: "At the Park", tr: "Parkta", icon: "🌳", g: 2,
    lines: [
      { t: "Today is sunny.", tr: "Bugün hava güneşli." },
      { t: "We go to the park.", tr: "Parka gidiyoruz." },
      { t: "I see a big tree.", tr: "Büyük bir ağaç görüyorum." },
      { t: "My friend has a red ball.", tr: "Arkadaşımın kırmızı bir topu var." },
      { t: "We play together.", tr: "Birlikte oynuyoruz." },
    ],
  },
];

export const EN_LETTERS = [
  { l: "A", w: "apple", e: "🍎" }, { l: "B", w: "ball", e: "⚽" }, { l: "C", w: "cat", e: "🐱" },
  { l: "D", w: "dog", e: "🐶" }, { l: "E", w: "egg", e: "🥚" }, { l: "F", w: "fish", e: "🐟" },
  { l: "G", w: "goat", e: "🐐" }, { l: "H", w: "hat", e: "👒" }, { l: "I", w: "ice cream", e: "🍦" },
  { l: "J", w: "juice", e: "🧃" }, { l: "K", w: "kite", e: "🪁" }, { l: "L", w: "lion", e: "🦁" },
  { l: "M", w: "moon", e: "🌙" }, { l: "N", w: "nest", e: "🪺" }, { l: "O", w: "orange", e: "🍊" },
  { l: "P", w: "pig", e: "🐷" }, { l: "Q", w: "queen", e: "👸" }, { l: "R", w: "rabbit", e: "🐰" },
  { l: "S", w: "sun", e: "☀️" }, { l: "T", w: "tree", e: "🌳" }, { l: "U", w: "umbrella", e: "☂️" },
  { l: "V", w: "van", e: "🚐" }, { l: "W", w: "water", e: "💧" }, { l: "X", w: "fox", e: "🦊" },
  { l: "Y", w: "yellow", e: "🟡" }, { l: "Z", w: "zebra", e: "🦓" },
];

// İngilizcede Türk çocuklarının karıştırdığı ses çiftleri
export const EN_SOUND_PAIRS = [
  { a: "v", b: "w", words: [["vet", "wet"], ["vest", "west"], ["vow", "wow"]] },
  { a: "th", b: "t", words: [["three", "tree"], ["thank", "tank"], ["thin", "tin"]] },
  { a: "i", b: "ee", words: [["ship", "sheep"], ["sit", "seat"], ["hit", "heat"]] },
  { a: "s", b: "sh", words: [["see", "she"], ["sip", "ship"], ["sell", "shell"]] },
  { a: "a", b: "e", words: [["bad", "bed"], ["man", "men"], ["pan", "pen"]] },
];
