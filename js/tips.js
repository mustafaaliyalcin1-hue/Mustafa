// Telaffuz ipuçları. Çocuk diline uygun, ağız/dil hareketini anlatan kısa cümleler.

// Bir sesin genel nasıl söyleneceği.
export const SOUND_TIPS = {
  a: "“a” sesinde ağzını kocaman aç: “aaaa” 😮",
  e: "“e” sesinde ağzını yarım aç, dudaklarını biraz yana çek: “eeee”.",
  ı: "“ı” sesinde gülümseme! Dudakların düz kalsın, ağzın hafif açık: “ıııı”.",
  i: "“i” sesinde gülümser gibi dudaklarını yana çek: “iiii” 😁",
  o: "“o” sesinde dudaklarını yuvarlak yap, ağzın açık kalsın: “oooo”.",
  ö: "“ö” sesinde dudaklarını öpücük verir gibi yuvarla, dilini öne it: “öööö” 😗",
  u: "“u” sesinde dudaklarını küçük bir daire yap ve öne uzat: “uuuu”.",
  ü: "“ü” sesinde dudakların “u” gibi yuvarlak, dilin “i” gibi önde olsun: “üüüü”.",
  b: "“b” sesinde dudaklarını kapat, sonra aç; boğazın titrer: “bı”.",
  c: "“c” sesi yumuşaktır. Elini boğazına koy, titrediğini hisset: “cı”.",
  ç: "“ç” sesi sert ve kısadır, hapşırır gibi: “çı” 🤧",
  d: "“d” sesinde dilinin ucu üst dişlerinin arkasına değer, boğazın titrer: “dı”.",
  f: "“f” sesinde üst dişlerin alt dudağına değer, sadece hava üflersin: “ffff”.",
  g: "“g” sesinde dilinin arkası damağa değer, boğazın titrer: “gı”.",
  ğ: "“ğ” (yumuşak g) tek başına okunmaz, önündeki sesi uzatır: “dağ” → “daa”.",
  h: "“h” sesinde camı buğulandırır gibi nefes ver: “hhhh” 🌬️",
  j: "“j” sesi “ş” gibidir ama boğazın titrer: “jjjj”.",
  k: "“k” sesinde dilinin arkası damağa değer, boğazın titremez: “kı”.",
  l: "“l” sesinde dilinin ucu üst dişlerinin arkasına değer ve orada kalır: “llll”.",
  m: "“m” sesinde dudaklarını kapat, sesi burnundan ver: “mmmm” 😋",
  n: "“n” sesinde dilinin ucu damağa değer, ses burnundan çıkar: “nnnn”.",
  p: "“p” sesinde dudaklarını kapatıp havayı patlat: “pı” 💨",
  r: "“r” sesinde dilinin ucu üst dişlerinin arkasında titrer, motosiklet gibi: “rrrr” 🏍️",
  s: "“s” sesi yılan gibidir: dişlerini birleştir, gülümse ve üfle: “ssss” 🐍",
  ş: "“ş” sesi “sus” işareti gibidir: dudaklarını öne uzat: “şşşş” 🤫",
  t: "“t” sesinde dilinin ucu dişlerinin arkasına değer, boğazın titremez: “tı”.",
  v: "“v” sesinde üst dişlerin alt dudağına değer, boğazın titrer: “vvvv”.",
  y: "“y” sesi kısacık bir “i” gibidir: “yı”.",
  z: "“z” sesi arı gibi vızıldar, boğazın titrer: “zzzz” 🐝",
};

// Çocukların sık karıştırdığı ses çiftleri için özel ipuçları.
// Anahtar: "beklenen>duyulan" ("r>" = r sesi atlandı)
export const PAIR_TIPS = {
  "r>l": "“r” yerine “l” söyledin. “r”de dilinin ucu titrer: “rrrr” 🏍️ “l”de ise dil sadece değer, titremez.",
  "r>y": "“r” yerine “y” söyledin. Dilinin ucunu üst dişlerinin arkasına koy ve titret: “rrrr” 🏍️",
  "r>": "“r” sesini atladın. Dilinin ucunu üst dişlerinin arkasında titret: “rrrr” 🏍️",
  "ş>s": "“ş” yerine “s” söyledin. “ş”de dudaklarını öne uzat, “sus” der gibi: “şşşş” 🤫",
  "s>ş": "“s” yerine “ş” söyledin. “s”de dudaklarını yana çek, yılan gibi: “ssss” 🐍",
  "ç>c": "“ç” yerine “c” söyledin. “ç”de boğazın titremez, hapşırır gibi kısacık: “çı” 🤧",
  "c>ç": "“c” yerine “ç” söyledin. “c”de boğazın titrer. Elini boğazına koy ve “cı” de.",
  "ç>ş": "“ç” yerine “ş” söyledin. “ç” kısa bir patlamadır: dilini damağa değdir ve bırak: “çı”.",
  "ç>s": "“ç” yerine “s” söyledin. “ç” kısa bir patlamadır: dilini damağa değdir ve bırak: “çı”.",
  "ş>ç": "“ş” yerine “ç” söyledin. “ş” uzayan bir sestir, kesme: “şşşş” 🤫",
  "ı>i": "“ı” yerine “i” söyledin. “ı”da gülümseme! Dudakların düz kalsın: “ıııı”.",
  "i>ı": "“i” yerine “ı” söyledin. “i”de gülümser gibi dudaklarını yana çek: “iiii” 😁",
  "ö>o": "“ö” yerine “o” söyledin. “ö”de dudakların yuvarlak, dilin önde: “öööö” 😗",
  "o>ö": "“o” yerine “ö” söyledin. “o”da dilin geride, ağzın daha açık: “oooo”.",
  "ü>u": "“ü” yerine “u” söyledin. “ü”de dudakların yuvarlak, dilin “i” gibi önde: “üüüü”.",
  "u>ü": "“u” yerine “ü” söyledin. “u”da dilin geride kalsın: “uuuu”.",
  "ü>i": "“ü” yerine “i” söyledin. “ü”de dudaklarını öne uzatıp yuvarla: “üüüü”.",
  "ö>e": "“ö” yerine “e” söyledin. “ö”de dudaklarını öpücük verir gibi yuvarla: “öööö” 😗",
  "k>t": "“k” yerine “t” söyledin. “k”de dilinin ucu değil, arkası damağa değer: “kı”.",
  "t>k": "“t” yerine “k” söyledin. “t”de dilinin ucu üst dişlerinin arkasına değer: “tı”.",
  "g>d": "“g” yerine “d” söyledin. “g”de dilinin arkası damağa değer: “gı”.",
  "z>s": "“z” yerine “s” söyledin. “z” arı gibi vızıldar, boğazın titrer: “zzzz” 🐝",
  "v>f": "“v” yerine “f” söyledin. “v”de boğazın titrer: “vvvv”.",
  "b>p": "“b” yerine “p” söyledin. “b”de boğazın titrer, havayı patlatma: “bı”.",
  "d>t": "“d” yerine “t” söyledin. “d”de boğazın titrer: “dı”.",
  "c>j": "“c” yerine “j” söyledin. “c”de dilin bir an damağa değer: “cı”.",
};

export function tipFor(want, got) {
  return PAIR_TIPS[`${want}>${got}`] || SOUND_TIPS[want] || null;
}
