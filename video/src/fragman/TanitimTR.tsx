import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { useFonts, Clip, FlipLetters, Slam, Place, Out } from "./Fragman";

// Türkçe tam tanıtım (1920x1080, 72 sn). Kareler oyundan çekildi: public/almanca/<sahne>/0000.jpg ... (klasör adı ilk plandan kaldı)
// Müzik scripts/muzik_synth_de.py ile üretildi (128 BPM, 1 ölçü = 56.25 kare); sahneler ölçülere oturur.
const BAR = 56.25;
const at = (b: number) => Math.round(b * BAR);

type S = { shot: string; from: number; to: number; start?: number; punch?: boolean; n?: string; title?: string; sub?: string; color?: string };
const D3 = at(22);
const SC: S[] = [
  { shot: "flug", from: 0, to: at(2), punch: false },
  { shot: "rampe", from: at(2), to: 282, n: "01", title: "TAVANDA SÜR", sub: "Lupingler, taklalar, bitmeyen rampalar", color: "#ff3b4e" },
  { shot: "stadt", from: 282, to: 394, n: "02", title: "SONSUZ ŞEHİR", sub: "Gerçek cepheler, yansıyan camlar, çatlaklı asfalt", color: "#5fd0ff" },
  { shot: "polizei", from: 394, to: at(10), n: "03", title: "POLİS PEŞİNDE", sub: "Ekip arabaları ve helikopter kuyruğunda", color: "#ff4d5e" },
  { shot: "fuss", from: at(10), to: at(12), n: "04", title: "İN VE YÜRÜ", sub: "Sana ait bir karakter", color: "#ffd34d" },
  { shot: "restaurant", from: at(12), to: at(12) + 150, n: "05", title: "RESTORANA GİR", sub: "Sipariş ver, otur, karnını doyur", color: "#ff8a3d" },
  { shot: "mode", from: at(12) + 150, to: at(12) + 300, n: "06", title: "TARZINI SEÇ", sub: "Desenli tişörtler, üstelik kendi fotoğrafınla", color: "#c77dff" },
  { shot: "friseur", from: at(12) + 300, to: at(20), n: "07", title: "BERBERE UĞRA", sub: "Saç modeli, saç rengi, sakal", color: "#ffd34d" },
  { shot: "klinik", from: at(20), to: at(22), n: "08", title: "HASTALANDIN MI?", sub: "Hastanede serum, açlık ve can barı her an ekranda", color: "#5fd38a" },
  { shot: "einsatz", from: D3, to: D3 + 150, n: "09", title: "112 YA DA POLİS OL", sub: "Şehirde kaza olur, yaralıyı sen kurtarırsın", color: "#ff3b4e" },
  { shot: "news", from: D3 + 150, to: D3 + 270, n: "10", title: "CANLI HABER", sub: "Mobese kaydıyla olay yerinden", color: "#5fd0ff" },
  { shot: "turm", from: D3 + 270, to: D3 + 410, n: "11", title: "VOLTRA R TARETİ", sub: "Minigun, lazer ve roket", color: "#ff8a3d" },
  { shot: "hava", from: D3 + 410, to: D3 + 490, n: "12", title: "HAVALİMANI", sub: "Lüks jetinle 81 ile uç", color: "#d4af37" },
  { shot: "kabin", from: D3 + 490, to: D3 + 560, n: "13", title: "BİRİNCİ SINIF", sub: "Deri koltuk, şampanya, kabin memuru", color: "#d4af37" },
  { shot: "ucus", from: D3 + 560, to: D3 + 670, n: "14", title: "BULUTLARIN ÜSTÜNDE", sub: "11.000 metrede Antalya yolunda", color: "#7fb6ff" },
  { shot: "burg", from: D3 + 670, to: at(36), n: "15", title: "81 İL, GERÇEK YERLER", sub: "Elazığ'da Harput Kalesi", color: "#ffd34d" },
];
export const TR_LEN = at(38.4);

// lower third: number, big title with accent bar, subtitle
const Feature: React.FC<{ n: string; title: string; sub: string; color: string; dur: number }> = ({ n, title, sub, color, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = spring({ frame: f - 3, fps, config: { damping: 16, stiffness: 140 } });
  const b = spring({ frame: f - 9, fps, config: { damping: 18 } });
  const out = interpolate(f, [dur - 10, dur - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 118px 110px", opacity: 1 - out, transform: `translateX(${-out * 80}px)` }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 26 }}>
        <div style={{ width: 10, background: color, transform: `scaleY(${a})`, transformOrigin: "bottom", boxShadow: `0 0 24px ${color}` }} />
        <div>
          <div style={{ fontFamily: "JetBrainsMono", fontSize: 30, color, letterSpacing: 6, opacity: b, transform: `translateY(${(1 - b) * 20}px)` }}>{n}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: "BebasNeue", fontSize: 128, lineHeight: 1, color: "#fff", transform: `translateY(${(1 - a) * 110}%)`, textShadow: "0 8px 40px rgba(0,0,0,.6)", letterSpacing: 2 }}>{title}</div>
          </div>
          <div style={{ fontFamily: "Kanit", fontSize: 40, color: "#e8edf3", opacity: b, transform: `translateX(${(1 - b) * -40}px)`, textShadow: "0 4px 18px rgba(0,0,0,.8)", marginTop: 6 }}>{sub}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// cinematic frame: soft letterbox, vignette, corner logo
const Frame: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at(2), at(2) + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, background: "linear-gradient(#000,rgba(0,0,0,.0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 320, background: "linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.72))" }} />
      <div style={{ position: "absolute", right: 64, top: 52, fontFamily: "RubikMonoOne", fontSize: 30, color: "#fff", opacity: o * 0.9, letterSpacing: 2, textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>
        TEPE<span style={{ display: "inline-block", transform: "scaleY(-1)", color: "#ff3b4e" }}>TAKLAK</span>
      </div>
    </>
  );
};

const Intro: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 40, fps, config: { damping: 14 } });
  const dim = interpolate(f, [0, 30, 95, 112], [1, 0.55, 0.45, 0], { extrapolateRight: "clamp" });
  return (
    <>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: dim }} />
      <Out dur={112}>
        <Place at="center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <FlipLetters text="TEPETAKLAK" font="Monoton" size={210} color="#ff3b4e" />
            <div style={{ fontFamily: "Kanit", fontSize: 50, color: "#fff", opacity: s, transform: `translateY(${(1 - s) * 30}px)`, letterSpacing: 3, textShadow: "0 4px 20px #000" }}>Her şeyi tepetaklak eden araba oyunu</div>
          </div>
        </Place>
      </Out>
    </>
  );
};

const Break: React.FC<{ text: string; color: string; dur: number }> = ({ text, color, dur }) => (
  <Out dur={dur}><Place at="top"><div style={{ marginTop: 40 }}><Slam text={text} font="BlackOpsOne" size={120} color={color} /></div></Place></Out>
);

const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = spring({ frame: f - 2, fps, config: { damping: 12 } });
  const h = spring({ frame: f - 18, fps, config: { damping: 9, stiffness: 190 } });
  const u = spring({ frame: f - 30, fps, config: { damping: 16 } });
  const fade = interpolate(f, [118, 135], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 30, opacity: fade }}>
      <div style={{ fontFamily: "RubikMonoOne", fontSize: 176, color: "#fff", transform: `scale(${a}) rotate(${(1 - a) * 10}deg)`, textShadow: "0 0 60px rgba(255,59,78,.8), 0 10px 40px #000", letterSpacing: 6 }}>
        TEPE<span style={{ display: "inline-block", transform: "scaleY(-1)", color: "#ff3b4e" }}>TAKLAK</span>
      </div>
      <div style={{ fontFamily: "Lobster", fontSize: 120, color: "#ffd34d", opacity: h, transform: `translateY(${(1 - h) * 70}px) scale(${0.6 + h * 0.4})`, textShadow: "0 8px 30px #000" }}>Hemen ücretsiz oyna!</div>
      <div style={{ display: "flex", gap: 18, opacity: u, transform: `translateY(${(1 - u) * 30}px)` }}>
        {["Tarayıcıda", "Telefon & PC", "Arkadaşlarınla online"].map((t) => (
          <div key={t} style={{ fontFamily: "Kanit", fontSize: 36, color: "#0b0d10", background: "#fff", padding: "8px 22px", borderRadius: 999 }}>{t}</div>
        ))}
      </div>
      <div style={{ fontFamily: "JetBrainsMono", fontSize: 38, color: "#cfe6ff", opacity: u, background: "rgba(0,0,0,.5)", padding: "12px 24px", borderRadius: 10 }}>mustafaaliyalcin1-hue.github.io/Mustafa/rampa</div>
    </AbsoluteFill>
  );
};

export const TanitimTR: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SC.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.to - s.from}>
          <Clip dir="almanca" shot={s.shot} start={s.start || 0} count={(s.start || 0) + (s.to - s.from)} punch={s.punch !== false} />
        </Sequence>
      ))}
      <Sequence from={at(36)} durationInFrames={TR_LEN - at(36)}>
        <Clip dir="almanca" shot="flug" start={150} count={280} punch={false} blur={9} />
      </Sequence>
      <Frame />
      <Sequence from={0} durationInFrames={at(2)}><Intro /></Sequence>
      {SC.filter((s) => s.title).map((s, i) => (
        <Sequence key={"t" + i} from={s.from + 4} durationInFrames={s.to - s.from - 4}>
          <Feature n={s.n!} title={s.title!} sub={s.sub!} color={s.color!} dur={s.to - s.from - 4} />
        </Sequence>
      ))}
      <Sequence from={at(10) + 4} durationInFrames={52}><Break text="ŞİMDİ NE?" color="#ffd34d" dur={52} /></Sequence>
      <Sequence from={at(20) + 4} durationInFrames={52}><Break text="GERÇEK HAYAT" color="#5fd38a" dur={52} /></Sequence>
      <Sequence from={at(36)} durationInFrames={TR_LEN - at(36)}><EndCard /></Sequence>
    </AbsoluteFill>
  );
};
