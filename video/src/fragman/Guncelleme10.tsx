import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Yaya kazası videosu: polis + ambulans, mobese kaydı, karakol + basın, sesli ifade, YouTube araç ekranında.
// Kareler oyunun içinden çekildi (public/guncelleme10/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Seg = { shot: string; dur: number; titles: [number, string][] };
const SEG: Seg[] = [
  { shot: "kaza", dur: 150, titles: [[0, "Yayaya çarptın: dur ve bekle"], [60, "Polis ve ambulans geliyor"]] },
  { shot: "mobese", dur: 150, titles: [[0, "Polis ifadeni alıyor"], [40, "Mobese kaydını izliyorlar"], [110, "Otopilot çarptıysa ceza yok"]] },
  { shot: "karakol", dur: 260, titles: [[0, "Yaya ölürse: kelepçe"], [90, "Polis arabasıyla karakola"], [170, "Kapıda basın: “Neden yaptınız?”"]] },
  { shot: "ifade", dur: 90, titles: [[0, "İfadeni sesle ya da yazarak ver"]] },
  { shot: "yt", dur: 100, titles: [[0, "Ezip kaçarsan polis kovalar"], [34, "YouTube artık arabanın ekranında"]] },
];
export const G10_LEN = SEG.reduce((a, s) => a + s.dur, 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, bottom: 60, fontFamily: "BebasNeue", fontSize: 70, color: "#fff", background: "rgba(10,12,16,.72)", padding: "4px 22px", transform: `translateY(${(1 - s) * 200}px)` }}>{text}</div>;
};

export const Guncelleme10: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme10" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      <Sequence from={0} durationInFrames={60}><Out dur={60}><Place at="center"><FlipLetters text="KAZA VE KARAKOL" font="Monoton" size={84} color="#2f7bff" /></Place></Out></Sequence>
      {parts.flatMap((p) => p.titles.map(([t, text], k) => {
        const next = p.titles[k + 1] ? p.titles[k + 1][0] : p.dur;
        const from = p.from + t + (p.from === 0 && t === 0 ? 60 : 0), dur = p.from + next - from;
        return dur > 0 ? <Sequence key={p.shot + k} from={from} durationInFrames={dur}><Out dur={dur}><Title text={text} /></Out></Sequence> : null;
      }))}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme10" shot="kaza" start={80} count={150} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
