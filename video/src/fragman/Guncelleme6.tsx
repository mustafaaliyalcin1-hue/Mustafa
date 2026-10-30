import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Toplu güncelleme videosu: yeni uçan arabalar, uçuş kamerası, havada fren, araç ekranı (YouTube/Spotify), online'da yürüyen arkadaş + düzeltmeler.
// Kareler oyunun içinden çekildi (public/guncelleme6/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; start?: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "modeller", dur: 240, titles: [[0, "Kartal GT"], [80, "Bulut SUV"], [160, "Kapsül"]] },
  { shot: "ucus", dur: 80, titles: [[0, "Uçarken kamera artık kaçmıyor"]] },
  { shot: "fren", dur: 110, titles: [[0, "Havada hızlı fren, sonra yoldan devam"]] },
  { shot: "ekran", dur: 130, titles: [[0, "Arabanın ekranına dokun, büyüsün"], [80, "YouTube · Spotify"]] },
  { shot: "online", dur: 120, titles: [[0, "Online: yürürken de görünüyorsunuz"], [60, "Online'da tünel açık"]] },
];
const FIX = 100;
export const G6_LEN = SEG.reduce((a, s) => a + s.dur, 0) + FIX + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, top: 110, fontFamily: "BebasNeue", fontSize: 70, color: "#fff", background: "rgba(10,12,16,.55)", padding: "4px 20px", borderLeft: "10px solid #ff5a6b", transform: `translateX(${(1 - s) * -800}px)`, textShadow: "0 4px 18px rgba(0,0,0,.7)" }}>{text}</div>;
};
const Fixes: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["📱 Telefonu çevirince tuşlara kendiliğinden basılmıyor", "🔊 Oyunun sesi giderse kendiliğinden geri geliyor", "🌐 Online bağlantı farklı internetlerde de güçlü", "🧭 Uçarken kamera en fazla birkaç metre geride"];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 14 }}>
      <div style={{ fontFamily: "BebasNeue", fontSize: 80, color: "#ffd34d", textShadow: "0 6px 24px #000" }}>DÜZELTMELER</div>
      {items.map((t, i) => (
        <div key={i} style={{ fontFamily: "RussoOne", fontSize: 34, color: "#fff", background: "rgba(10,12,16,.6)", padding: "8px 18px", borderRadius: 10, opacity: interpolate(f, [8 + i * 10, 18 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateX(${interpolate(f, [8 + i * 10, 18 + i * 10], [-60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>{t}</div>
      ))}
    </AbsoluteFill>
  );
};

export const Guncelleme6: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme6" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={70}><Out dur={70}><Place at="center"><FlipLetters text="3 YENİ UÇAN ARABA" font="Monoton" size={84} color="#ff3b4e" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 70 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={FIX}><Clip dir="guncelleme6" shot="ucus" start={40} count={80} punch={false} blur={8} /><Fixes /></Sequence>
      <Sequence from={at + FIX} durationInFrames={90}><Clip dir="guncelleme6" shot="modeller" start={150} count={240} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
