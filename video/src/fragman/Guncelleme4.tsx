import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Typewriter, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Güncelleme videosu: Sunum modu (araba kendini tanıtır) ve telefonda düzelen Hey Tesla tuşu.
// Kareler oyunun içinden çekildi (public/guncelleme4/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
const SEG: [string, number, string][] = [
  ["s00", 60, "SUNUM MODU"], ["s01", 60, "Otopilot"], ["s02", 60, "Boğaz köprüsü"], ["s03", 60, "Uçarak otopilot"], ["s04", 70, "Kaza önleme"],
  ["s05", 75, "Hey Tesla"], ["s06", 60, "Arabadan in, koş"], ["s07", 60, "Tesla uygulaması"], ["s08", 60, "Taksi"], ["s09", 80, "Modifiye"],
  ["s10", 60, "FPV drone"], ["s11", 70, "Tünel asansörü"], ["s12", 60, "Yeraltı tüneli"], ["s13", 60, "81 il"],
];
const HEY = 90;
export const G4_LEN = HEY + SEG.reduce((a, s) => a + s[1], 0) + 90;

const Name: React.FC<{ text: string; n: number }> = ({ text, n }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: 40, top: 70, display: "flex", alignItems: "center", gap: 12, transform: `translateX(${(1 - s) * -500}px)` }}>
      <span style={{ fontFamily: "JetBrainsMono", fontSize: 22, color: "#0b0d10", background: "#ff5a6b", padding: "4px 10px", borderRadius: 6 }}>{String(n).padStart(2, "0")}</span>
      <span style={{ fontFamily: "BebasNeue", fontSize: 64, color: "#fff", textShadow: "0 4px 18px rgba(0,0,0,.8)" }}>{text}</span>
    </div>
  );
};

export const Guncelleme4: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  let at = HEY;
  const parts = SEG.map(([shot, dur, name], i) => { const from = at; at += dur; return { shot, dur, name, from, i }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={0} durationInFrames={HEY}><Clip dir="guncelleme4" shot="hey" count={90} punch={false} /></Sequence>
      {parts.map((p) => (
        <Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme4" shot={p.shot} count={p.dur} /></Sequence>
      ))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme4" shot="s13" start={59} count={60} punch={false} blur={7} /></Sequence>
      {/* altyazı kutusu altta, şerit yok */}
      <Sequence from={0} durationInFrames={HEY}>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, 12, 70, 90], [0.7, 0.25, 0.25, 0], { extrapolateRight: "clamp" }) }} />
        <Out dur={HEY}><Place at="top"><Typewriter text="Hey Tesla: dokun, bırak, konuş" font="RussoOne" size={50} color="#7fd6ff" /></Place></Out>
      </Sequence>
      {parts.map((p) => (
        <Sequence key={"n" + p.shot} from={p.from} durationInFrames={p.dur}>
          {p.i === 0 ? <Out dur={p.dur}><Place at="center"><FlipLetters text="SUNUM MODU" font="Monoton" size={110} color="#ff3b4e" /></Place></Out> : <Out dur={p.dur}><Name text={p.name} n={p.i} /></Out>}
        </Sequence>
      ))}
      <Sequence from={at} durationInFrames={90}><End /></Sequence>
    </AbsoluteFill>
  );
};
