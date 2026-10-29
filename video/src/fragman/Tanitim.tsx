import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, Bars, FlipLetters, Slam, Spin, Wipe, Typewriter, SlideSkew, BlurGlow, Handwrite, Bounce, Glitch, Place, Out } from "./Fragman";

// Yeni güncellemenin tanıtım videosu: Boğaz, asansör, tünel, 81 il, Hey Tesla, yayalar, kaza önleme, yürüme, modifiye.
// Kareler oyunun içinden çekildi (public/tanitim/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.

const SC = [
  { from: 0, dur: 150, shot: "bogaz", start: 0, count: 150, punch: false },
  { from: 150, dur: 150, shot: "asansor", start: 10, count: 165 },
  { from: 300, dur: 170, shot: "tunel", start: 20, count: 190 },
  { from: 470, dur: 90, shot: "varis", start: 15, count: 110 },
  { from: 560, dur: 140, shot: "tesla", start: 5, count: 150 },
  { from: 700, dur: 90, shot: "yaya", start: 10, count: 110 },
  { from: 790, dur: 90, shot: "kaza", start: 8, count: 100 },
  { from: 880, dur: 120, shot: "yuru", start: 8, count: 130 },
  { from: 1000, dur: 160, shot: "modif", start: 0, count: 200 },
  { from: 1160, dur: 100, shot: "tunel", start: 150, count: 190, punch: false, blur: 7 },
];

const Tag: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 14 } });
  return <div style={{ position: "absolute", left: 40, top: 76, fontFamily: "JetBrainsMono", fontSize: 24, color: "#0b0d10", background: color, padding: "6px 14px", borderRadius: 6, transform: `translateX(${(1 - s) * -400}px)` }}>{text}</div>;
};

export const Tanitim: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SC.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <Clip dir="tanitim" shot={s.shot} start={s.start} count={s.count} punch={s.punch !== false} blur={s.blur} />
        </Sequence>
      ))}
      <Bars />
      <Sequence from={0} durationInFrames={110}>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, 30, 90, 110], [1, 0.4, 0.3, 0], { extrapolateRight: "clamp" }) }} />
        <Out dur={110}><Place at="center"><div style={{ textAlign: "center" }}>
          <FlipLetters text="YENİ GÜNCELLEME" font="Monoton" size={96} color="#ff3b4e" />
        </div></Place></Out>
      </Sequence>
      <Sequence from={112} durationInFrames={38}><Out dur={38}><Place at="bottom"><Slam text="İSTANBUL BOĞAZI" font="BlackOpsOne" size={96} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={154} durationInFrames={70}><Out dur={70}><Place at="left"><Wipe text="Araç asansörü" font="Righteous" size={104} color="#5fd0ff" /></Place></Out></Sequence>
      <Sequence from={226} durationInFrames={74}><Out dur={74}><Place at="bottom"><Typewriter text="3 saniye bekle... aşağı iniyoruz!" font="RussoOne" size={58} color="#ffd34d" /></Place></Out></Sequence>
      <Sequence from={304} durationInFrames={80}><Out dur={80}><Place at="top"><Glitch text="YERALTI TÜNELİ" font="BebasNeue" size={128} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={390} durationInFrames={80}><Out dur={80}><Place at="center"><BlurGlow text="81 İLİN HEPSİ" font="Audiowide" size={96} color="#7fd6ff" /></Place></Out></Sequence>
      <Sequence from={474} durationInFrames={86}><Out dur={86}><Place at="top"><Bounce text="TRABZON'A HOŞ GELDİN" font="PermanentMarker" size={76} color="#ff8a3d" /></Place></Out></Sequence>
      <Sequence from={564} durationInFrames={136}><Out dur={136}><Place at="top"><BlurGlow text="HEY TESLA" font="Audiowide" size={110} color="#7fb6ff" /></Place></Out></Sequence>
      <Sequence from={704} durationInFrames={86}><Out dur={86}><Place at="top"><Typewriter text="Kırmızıda yaya geçer. Çarparsan ceza!" font="RussoOne" size={52} color="#ff4d5e" /></Place></Out></Sequence>
      <Sequence from={794} durationInFrames={86}><Out dur={86}><Place at="bottom"><SlideSkew text="KAZA ÖNLEME: YANA KAÇ!" font="Kanit" size={84} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={884} durationInFrames={116}><Out dur={116}><Place at="bottom"><Handwrite text="Arabadan in, koş!" font="Pacifico" size={100} color="#ffe27a" /></Place></Out></Sequence>
      <Sequence from={1004} durationInFrames={70}><Out dur={70}><Place at="top"><Slam text="MODİFİYE" font="RubikMonoOne" size={110} color="#ff3b4e" /></Place></Out></Sequence>
      <Sequence from={1076} durationInFrames={84}><Out dur={84}><Place at="bottom"><Spin text="Tampon · Jant · Spoiler · Neon" font="Lobster" size={74} color="#ffffff" /></Place></Out></Sequence>
      <Sequence from={1004} durationInFrames={156}><Tag text="sadece görsel · hepsi bedava" color="#7fd6ff" /></Sequence>
      <Sequence from={1160} durationInFrames={100}><End /></Sequence>
    </AbsoluteFill>
  );
};

export const End: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = spring({ frame: f - 2, fps, config: { damping: 13 } });
  const h = spring({ frame: f - 22, fps, config: { damping: 8, stiffness: 200 } });
  const fade = interpolate(f, [86, 100], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22, opacity: fade, flexDirection: "column" }}>
      <div style={{ fontFamily: "RubikMonoOne", fontSize: 118, color: "#fff", transform: `scale(${a}) rotate(${(1 - a) * 12}deg)`, textShadow: "0 0 40px rgba(255,59,78,.8), 0 8px 30px #000", letterSpacing: 4 }}>
        TEPE<span style={{ display: "inline-block", transform: "scaleY(-1)", color: "#ff3b4e" }}>TAKLAK</span>
      </div>
      <div style={{ fontFamily: "Lobster", fontSize: 84, color: "#ffd34d", transform: `translateY(${(1 - h) * 60}px) scale(${0.6 + h * 0.4})`, opacity: h, textShadow: "0 6px 24px #000" }}>Güncelleme yayında!</div>
    </AbsoluteFill>
  );
};
