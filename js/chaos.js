// Hata Kumandası'ndan (kumanda/) gelen "bilerek hata" komutlarını uygular.
// Aynı tarayıcıda localStorage üzerinden çalışır; kumanda değişince anında güncellenir.
// Hatalar yalnızca görüntüyü/sesi etkiler, kayıtlı ilerlemeye (yıldızlar vb.) asla dokunmaz.

export const CHAOS_KEY = "konusan-arkadasim:hatalar";
const root = document.documentElement;

export function readChaos() {
  try { return JSON.parse(localStorage.getItem(CHAOS_KEY) || "{}") || {}; } catch { return {}; }
}
export const chaosOn = (id) => !!readChaos()[id];

// Sınıfla çalışan görsel hatalar
const CLASS_BUGS = ["ters", "titre", "yavas", "renk", "ayna", "donen", "bulanik", "dev"];

let crashEl = null;
let dodgeOn = false;
let delayOn = false;
let lastJSON = "";

function apply() {
  const c = readChaos();
  const json = JSON.stringify(c);
  if (json === lastJSON) return;
  lastJSON = json;
  CLASS_BUGS.forEach((id) => root.classList.toggle(`bug-${id}`, !!c[id]));

  // Yıldız sayacı saçmalar (yalnızca görüntü)
  const star = document.getElementById("starCount");
  if (star) star.dataset.bug = c.yildiz ? "1" : "";

  // Sahte çökme ekranı
  if (c.cokme && !crashEl) {
    crashEl = document.createElement("div");
    crashEl.className = "bug-crash";
    crashEl.innerHTML = `<div><div class="bug-crash-ic">💥</div><b>Uygulama durduruldu</b>
      <p>Konuşan Arkadaşım beklenmedik bir hatayla karşılaştı.</p>
      <code>HATA 0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, "0")} · KARAKTER_KAYBOLDU</code></div>`;
    // Gizli çıkış: çökme ekranına art arda 3 dokunuş bütün hataları kapatır
    let taps = 0, tapTimer = 0;
    crashEl.addEventListener("click", () => {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 700);
      if (taps >= 3) {
        try { localStorage.removeItem(CHAOS_KEY); } catch { /* yok say */ }
        apply();
      }
    });
    document.body.appendChild(crashEl);
  } else if (!c.cokme && crashEl) { crashEl.remove(); crashEl = null; }

  dodgeOn = !!c.kacan;
  delayOn = !!c.gecikme;
}

// Kaçan düğmeler: parmak yaklaşınca düğme kaçar
document.addEventListener("pointerdown", (e) => {
  if (!dodgeOn) return;
  const b = e.target.closest?.("button, .btn, .tile, a");
  if (!b || b.closest(".menu")) return;
  if (Math.random() < 0.7) {
    e.preventDefault(); e.stopPropagation();
    const dx = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 80);
    const dy = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 60);
    b.style.transition = "transform .25s cubic-bezier(.2,1.4,.4,1)";
    b.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx > 0 ? 8 : -8}deg)`;
    setTimeout(() => { b.style.transform = ""; }, 900);
  }
}, true);

// Gecikme: her dokunuş 1,5 sn sonra çalışır
document.addEventListener("click", (e) => {
  if (!delayOn || e.__late) return;
  const t = e.target.closest?.("button, a, .tile");
  if (!t || t.closest(".menu")) return;
  e.preventDefault(); e.stopImmediatePropagation();
  document.body.classList.add("bug-wait");
  setTimeout(() => {
    document.body.classList.remove("bug-wait");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    ev.__late = true;
    if (t.tagName === "A" && t.getAttribute("href")) location.href = t.href;
    else t.dispatchEvent(ev);
  }, 1500);
}, true);

// Ses hataları (speech.js sorar)
export const speechBug = () => {
  const c = readChaos();
  return { mute: !!c.sessiz, squirrel: !!c.sincap };
};

apply();
window.addEventListener("storage", (e) => { if (e.key === CHAOS_KEY) apply(); });
// Yedek: bazı telefonlarda storage olayı gecikir
setInterval(apply, 1000);
document.addEventListener("visibilitychange", apply);
