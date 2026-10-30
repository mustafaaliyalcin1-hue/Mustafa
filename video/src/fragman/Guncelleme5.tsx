import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip } from "./Fragman";
import { End } from "./Tanitim";

// Güncelleme videosu: "beni Elazığ'da bir köfteciye götür" (önce tünelle il, sonra köfteci) ve Boğaz kıyısı: balıkçılar, banklar, köprü.
// Kareler oyunun içinden çekildi (public/guncelleme5/<sahne>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
const SEG: [string, number, string | null][] = [
  ["e_komut", 80, "Tek cümle, iki iş"], ["e_asansor", 60, "1) Önce tünelle Elazığ'a"], ["e_tunel", 60, null], ["e_varis", 80, null], ["e_kofte", 70, "2) Sonra köfteciye"], ["e_vardi", 50, null],
  ["b_komut", 70, "Beni Boğaz'a götür"], ["b_yol", 70, null], ["b_balikci", 110, "Balıkçı abiler 🎣"], ["b_bank", 90, "Banka otur, Boğaz'ı izle"], ["b_kopru_komut", 50, "Köprüye de gider"], ["b_kopru", 80, null],
];
export const G5_LEN = SEG.reduce((a, s) => a + s[1], 0) + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, top: 120, fontFamily: "BebasNeue", fontSize: 76, color: "#fff", background: "rgba(10,12,16,.55)", padding: "4px 20px", borderLeft: "10px solid #ffd34d", transform: `translateX(${(1 - s) * -700}px)`, textShadow: "0 4px 18px rgba(0,0,0,.7)" }}>{text}</div>;
};

export const Guncelleme5: React.FC = () => {
  useFonts();
  let at = 0;
  const parts = SEG.map(([shot, dur, title]) => { const from = at; at += dur; return { shot, dur, title, from }; });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {parts.map((p) => (<Sequence key={p.shot} from={p.from} durationInFrames={p.dur}><Clip dir="guncelleme5" shot={p.shot} count={p.dur} punch={p.from > 0} /></Sequence>))}
      {parts.map((p) => p.title ? (<Sequence key={"t" + p.shot} from={p.from} durationInFrames={p.dur}><Title text={p.title} /></Sequence>) : null)}
      <Sequence from={at} durationInFrames={90}><Clip dir="guncelleme5" shot="b_bank" start={89} count={90} punch={false} blur={7} /></Sequence>
      <Sequence from={at} durationInFrames={90}><End /></Sequence>
    </AbsoluteFill>
  );
};
