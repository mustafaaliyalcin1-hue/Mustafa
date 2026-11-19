// Tepetaklak Stüdyo (mobil) — tamamen çevrimdışı: ffmpeg.wasm (tek iş parçacıklı çekirdek) + Web Audio
import { FFmpeg } from "./ffmpeg/index.js";

const $ = (s) => document.querySelector(s);
const durum = { format: "dikey", renk: "yok", hiz: "1", yaziYer: "ust", yaziRenk: "#FFD60A", muzik: "yok", orjSes: "1", kalite: "720" };
let dosya = null, sure = 0, sesVar = true, sonucBlob = null, ffmpeg = null;
const ffLog = []; window.__ffLog = ffLog;

// ---------- renk ön ayarları: ffmpeg filtresi + önizleme için CSS karşılığı ----------
const RENK = {
  yok: { ff: "", css: "none" },
  sicak: { ff: "colorbalance=rs=.08:gs=.02:bs=-.08:rm=.06:bm=-.06,eq=saturation=1.12:contrast=1.04", css: "sepia(.25) saturate(1.25) hue-rotate(-8deg)" },
  sinematik: { ff: "colorbalance=rs=-.06:bs=.08:rh=.08:bh=-.06,eq=contrast=1.15:saturation=1.1:brightness=-0.02,vignette=PI/5",
    css: "contrast(1.15) saturate(1.1) brightness(.97)" },
  canli: { ff: "eq=saturation=1.5:contrast=1.1:brightness=0.02", css: "saturate(1.5) contrast(1.1) brightness(1.02)" },
  vintage: { ff: "curves=preset=vintage,vignette=PI/4", css: "sepia(.45) contrast(.92) saturate(.85)" },
  soguk: { ff: "colorbalance=rs=-.06:bs=.1:rm=-.04:bm=.06,eq=saturation=0.95", css: "saturate(.9) hue-rotate(12deg) brightness(1.03)" },
  sb: { ff: "hue=s=0,eq=contrast=1.1", css: "grayscale(1) contrast(1.1)" },
};

// ---------- arayüz ----------
document.querySelectorAll(".secenekler").forEach((grup) => {
  grup.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    grup.querySelectorAll("button").forEach((x) => x.classList.remove("sec"));
    b.classList.add("sec"); durum[grup.dataset.ad] = b.dataset.d; onizlemeGuncelle();
  });
});
const fmt = (s) => `${(+s).toFixed(1)} sn`;
["bas", "son"].forEach((id) => $("#" + id).addEventListener("input", () => {
  let a = +$("#bas").value, b = +$("#son").value;
  if (b - a < 0.5) { if (id === "bas") a = Math.max(0, b - 0.5); else b = Math.min(sure, a + 0.5); $("#bas").value = a; $("#son").value = b; }
  $("#basO").value = fmt(a); $("#sonO").value = fmt(b);
  const v = $("#onizleme"); v.currentTime = id === "bas" ? a : b;
}));
$("#hassas").addEventListener("input", (e) => ($("#hassasO").value = `${(+e.target.value).toFixed(2)} sn`));
$("#muzikSeviye").addEventListener("input", (e) => ($("#muzikO").value = `%${Math.round(e.target.value * 100)}`));
$("#yazi").addEventListener("input", onizlemeGuncelle);

function onizlemeGuncelle() {
  $("#onizleme").style.filter = RENK[durum.renk].css;
  const y = $("#yaziOnizleme"); y.textContent = $("#yazi").value; y.style.color = durum.yaziRenk;
  y.style.top = { ust: "14%", orta: "45%", alt: "70%" }[durum.yaziYer];
}

$("#dosya").addEventListener("change", async (e) => {
  dosya = e.target.files[0]; if (!dosya) return;
  const v = $("#onizleme"); v.src = URL.createObjectURL(dosya);
  await new Promise((r) => (v.onloadedmetadata = r));
  sure = v.duration || 0;
  for (const id of ["bas", "son"]) { $("#" + id).max = sure; }
  $("#bas").value = 0; $("#son").value = sure; $("#basO").value = fmt(0); $("#sonO").value = fmt(sure);
  $("#secim").classList.add("gizli"); $("#duzen").classList.remove("gizli"); onizlemeGuncelle();
});

// ---------- boşluk tespiti (stüdyodaki kk_sessizlik algoritması) ----------
async function konusmaBolgeleri(buf, minBosluk) {
  const ctx = new OfflineAudioContext(1, 16000, 16000);
  let ses;
  try { ses = await ctx.decodeAudioData(buf); } catch { return null; }
  const y = ses.getChannelData(0), sr = ses.sampleRate, hop = Math.round(sr / 100);
  const n = Math.floor(y.length / hop), db = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = i * hop; j < (i + 1) * hop; j++) s += y[j] * y[j]; db[i] = 10 * Math.log10(s / hop + 1e-12); }
  const sirali = Array.from(db).sort((a, b) => a - b);
  const p = (q) => sirali[Math.min(n - 1, Math.floor(q * n))];
  const esik = Math.max(p(0.10) + 14, p(0.97) - 32);
  const bol = []; let i = 0;
  while (i < n) { if (db[i] > esik) { let j = i; while (j < n && db[j] > esik) j++; bol.push([i / 100, j / 100]); i = j; } else i++; }
  const birlesik = [];
  for (const [a, b] of bol) { if (birlesik.length && a - birlesik.at(-1)[1] < minBosluk) birlesik.at(-1)[1] = b; else birlesik.push([a, b]); }
  return birlesik.filter(([a, b]) => b - a >= 0.08);
}

function parcalar(bol, a, b) {
  if (!bol) return [[a, b]];
  const out = [];
  for (let [x, z] of bol) {
    x = Math.max(a, x - 0.07); z = Math.min(b, z + 0.09);
    if (z - x < 0.05) continue;
    if (out.length && x <= out.at(-1)[1] + 0.02) out.at(-1)[1] = z; else out.push([x, z]);
  }
  return out.length ? out : [[a, b]];
}

const atempo = (k) => { const p = []; while (k > 2) { p.push("atempo=2"); k /= 2; } while (k < 0.5) { p.push("atempo=0.5"); k /= 0.5; } p.push(`atempo=${k}`); return p.join(","); };

// ---------- ffmpeg ----------
async function ffmpegHazir(log) {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => log(message));
  await ffmpeg.load({ coreURL: new URL("core/ffmpeg-core.js", location.href).href, wasmURL: new URL("core/ffmpeg-core.wasm", location.href).href });
  const font = await (await fetch("fonts/Montserrat-Black.ttf")).arrayBuffer();
  await ffmpeg.writeFile("/font.ttf", new Uint8Array(font));
  return ffmpeg;
}

function goster(id) { ["#duzen", "#isleniyor", "#sonuc"].forEach((s) => $(s).classList.toggle("gizli", s !== id)); window.scrollTo(0, 0); }

$("#olustur").addEventListener("click", async () => {
  goster("#isleniyor");
  const ilerle = (yuzde, yazi) => { $("#ilerleme").style.width = `${yuzde}%`; if (yazi) $("#durum").textContent = yazi; };
  let sonLog = "";
  try {
    ilerle(3, "Video okunuyor…");
    const buf = await dosya.arrayBuffer();
    const a = +$("#bas").value, b = +$("#son").value;
    let segs = [[a, b]];
    sesVar = true;
    if ($("#bosluk").checked) {
      ilerle(8, "Boşluklar aranıyor…");
      const bol = await konusmaBolgeleri(buf.slice(0), +$("#hassas").value);
      if (bol === null) sesVar = false;
      segs = parcalar(bol, a, b);
    } else {
      const ctx = new OfflineAudioContext(1, 16000, 16000);
      try { await ctx.decodeAudioData(buf.slice(0)); } catch { sesVar = false; }
    }
    const atilan = (b - a) - segs.reduce((t, [x, z]) => t + z - x, 0);
    $("#ayrinti").textContent = $("#bosluk").checked ? `${segs.length} parça, ${atilan.toFixed(1)} sn boşluk kesilecek` : "";

    ilerle(14, "Kurgu motoru yükleniyor…");
    const ff = await ffmpegHazir((m) => { sonLog = m; ffLog.push(m); if (ffLog.length > 60) ffLog.shift(); });
    const ext = (dosya.name.split(".").pop() || "mp4").toLowerCase();
    await ff.writeFile(`/girdi.${ext}`, new Uint8Array(buf));
    const yazi = $("#yazi").value.trim();
    if (yazi) await ff.writeFile("/yazi.txt", new TextEncoder().encode(yazi));
    const muzikVar = durum.muzik === "melodik";
    if (muzikVar) await ff.writeFile("/muzik.mp3", new Uint8Array(await (await fetch("muzik/melodik.mp3")).arrayBuffer()));

    // filtre zinciri
    const Wd = +durum.kalite, H = Math.round(Wd * 16 / 9 / 2) * 2;  // 720p → 720x1280, 1080p → 1080x1920
    const hiz = +durum.hiz, orj = +durum.orjSes;
    const fc = []; let z = "";
    segs.forEach(([x, y2], i) => {
      fc.push(`[0:v]trim=${x.toFixed(3)}:${y2.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
      if (sesVar) fc.push(`[0:a]atrim=${x.toFixed(3)}:${y2.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.01[a${i}]`);
      z += `[v${i}]` + (sesVar ? `[a${i}]` : "");
    });
    fc.push(`${z}concat=n=${segs.length}:v=1:a=${sesVar ? 1 : 0}[vc]` + (sesVar ? "[ac]" : ""));
    let v = `[vc]setpts=PTS/${hiz},fps=30`;
    const r = RENK[durum.renk].ff; if (r) v += "," + r;
    if (durum.format === "dikey") {
      fc.push(`${v},split[b][f]`);
      fc.push(`[b]scale=${Wd}:${H}:force_original_aspect_ratio=increase,crop=${Wd}:${H},boxblur=20:2,eq=brightness=-0.1[bg]`);
      fc.push(`[f]scale=${Wd}:${H}:force_original_aspect_ratio=decrease[fg]`);
      fc.push(`[bg][fg]overlay=(W-w)/2:(H-h)/2[vf]`);
    } else if (durum.format === "kirp") {
      fc.push(`${v},scale=${Wd}:${H}:force_original_aspect_ratio=increase,crop=${Wd}:${H}[vf]`);
    } else if (durum.format === "kare") {
      fc.push(`${v},scale=${Wd}:${Wd}:force_original_aspect_ratio=increase,crop=${Wd}:${Wd}[vf]`);
    } else {
      fc.push(`${v},scale='min(${Wd},iw)':-2[vf]`);
    }
    let son = "[vf]";
    if (yazi) {
      const yer = { ust: "h*0.16", orta: "(h-text_h)/2", alt: "h*0.70" }[durum.yaziYer];
      const renk = durum.yaziRenk.replace("#", "0x");
      const cH = durum.format === "kare" ? Wd : H;  // çıktı yüksekliği (bu ffmpeg sürümü borderw'da ifade kabul etmez)
      const fs = Math.round(cH * (durum.format === "kare" ? 0.075 : 0.055)), kb = Math.max(2, Math.round(fs * 0.07));
      fc.push(`[vf]drawtext=fontfile=/font.ttf:textfile=/yazi.txt:fontsize=${fs}:fontcolor=${renk}:borderw=${kb}:bordercolor=black@0.85:` +
        `shadowx=0:shadowy=${kb}:shadowcolor=black@0.5:x=(w-text_w)/2:y=${yer}:alpha='min(1,t/0.4)'[vy]`);
      son = "[vy]";
    }
    fc.push(`${son}format=yuv420p[vout]`);
    const sesler = [];
    if (sesVar && orj > 0) { fc.push(`[ac]${atempo(hiz)},volume=${orj},aformat=sample_rates=44100:channel_layouts=stereo[o]`); sesler.push("[o]"); }
    if (muzikVar) {
      fc.push(`[1:a]volume=${$("#muzikSeviye").value},afade=t=in:d=1,aformat=sample_rates=44100:channel_layouts=stereo[m]`);
      sesler.push("[m]");
    }
    const norm = "loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100,alimiter=limit=0.68";  // sosyal medya ses seviyesi
    if (sesler.length > 1) fc.push(`${sesler.join("")}amix=inputs=${sesler.length}:duration=first:normalize=0,${norm}[aout]`);
    else if (sesler.length === 1) fc.push(`${sesler[0]}${norm}[aout]`);
    const toplam = segs.reduce((t, [x, y2]) => t + y2 - x, 0) / hiz;

    const args = ["-i", `/girdi.${ext}`];
    if (muzikVar) args.push("-stream_loop", "-1", "-i", "/muzik.mp3");
    args.push("-filter_complex", fc.join(";"), "-map", "[vout]");
    if (sesler.length) args.push("-map", "[aout]", "-c:a", "aac", "-b:a", "160k");
    args.push("-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-t", toplam.toFixed(3), "-movflags", "+faststart", "/cikti.mp4");

    ff.on("progress", ({ progress }) => { if (progress >= 0 && progress <= 1) ilerle(20 + progress * 78, "Video oluşturuluyor…"); });
    ilerle(20, "Video oluşturuluyor…");
    const kod = await ff.exec(args);
    if (kod !== 0) throw new Error("ffmpeg hata kodu " + kod + ": " + sonLog);
    const veri = await ff.readFile("/cikti.mp4");
    sonucBlob = new Blob([veri.buffer], { type: "video/mp4" }); kayitSozu = null;
    await ff.deleteFile(`/girdi.${ext}`).catch(() => {});
    ilerle(100, "Hazır!");
    $("#sonucVideo").src = URL.createObjectURL(sonucBlob);
    $("#kayitBilgi").textContent = `${toplam.toFixed(1)} sn · ${(sonucBlob.size / 1048576).toFixed(1)} MB`;
    goster("#sonuc");
  } catch (err) {
    $("#durum").textContent = "Bir sorun oldu 😕";
    $("#ayrinti").textContent = String(err.message || err).slice(0, 300);
    setTimeout(() => goster("#duzen"), 4000);
  }
});

// ---------- kaydet / paylaş (Android köprüsü; tarayıcıda indirme) ----------
async function blobBase64Parcalar(blob, fn) {
  const PARCA = 512 * 1024;
  for (let i = 0; i < blob.size; i += PARCA) {
    const ab = await blob.slice(i, i + PARCA).arrayBuffer();
    let s = ""; const u = new Uint8Array(ab);
    for (let j = 0; j < u.length; j += 0x8000) s += String.fromCharCode.apply(null, u.subarray(j, j + 0x8000));
    fn(btoa(s));
  }
}
const dosyaAdi = () => `tepetaklak_${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}.mp4`;
let kayitSozu = null;
async function kaydet() {
  if (!sonucBlob) return false;
  if (!window.Android) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(sonucBlob); a.download = dosyaAdi(); a.click(); return true;
  }
  $("#kayitBilgi").textContent = "Kaydediliyor…";
  Android.kaydetBasla(dosyaAdi());
  await blobBase64Parcalar(sonucBlob, (p) => Android.kaydetParca(p));
  const ok = Android.kaydetBitir();
  $("#kayitBilgi").textContent = ok ? "Galeriye kaydedildi ✓ (Filmler / Tepetaklak Stüdyo)" : "Kaydedilemedi";
  return ok;
}
$("#kaydet").addEventListener("click", () => { kayitSozu = kaydet(); });
$("#paylas").addEventListener("click", async () => {
  if (!sonucBlob) return;
  if (window.Android) {
    if (!Android.sonKayitVar()) await (kayitSozu || (kayitSozu = kaydet()));
    Android.paylas();
  } else if (navigator.share) {
    navigator.share({ files: [new File([sonucBlob], dosyaAdi(), { type: "video/mp4" })] }).catch(() => {});
  }
});
$("#yeniden").addEventListener("click", () => goster("#duzen"));
