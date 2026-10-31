import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// İllerin ünlü yerleri videosu: her ilde bir yapı; kamera etrafında döner.
// Kareler oyunun içinden çekildi (public/guncelleme11/<yer>/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
const SEG: [string, string][] = [
  ["sultanahmet", "İstanbul · Sultanahmet Camii"], ["galata", "İstanbul · Galata Kulesi"], ["anitkabir", "Ankara · Anıtkabir"], ["kapadokya", "Nevşehir · Kapadokya"],
  ["pamukkale", "Denizli · Pamukkale"], ["nemrut", "Adıyaman · Nemrut Dağı"], ["mevlana", "Konya · Mevlana Türbesi"], ["gobeklitepe", "Şanlıurfa · Göbeklitepe"],
  ["truva", "Çanakkale · Truva Atı"], ["kizkalesi", "Mersin · Kızkalesi"], ["sumela", "Trabzon · Sümela Manastırı"], ["akdamar", "Van · Akdamar Kilisesi"],
];
const D = 60;
export const G11_LEN = SEG.length * D + 90;

const Title: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return <div style={{ position: "absolute", left: 40, bottom: 60, fontFamily: "BebasNeue", fontSize: 70, color: "#fff", background: "rgba(10,12,16,.72)", padding: "4px 22px", transform: `translateY(${(1 - s) * 200}px)` }}>{text}</div>;
};

export const Guncelleme11: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SEG.map(([id, t], k) => (<Sequence key={id} from={k * D} durationInFrames={D}><Clip dir="guncelleme11" shot={id} count={D} punch={k > 0} /><Sequence from={k ? 0 : 45}><Out dur={k ? D : D - 45}><Title text={t} /></Out></Sequence></Sequence>))}
      <Sequence from={0} durationInFrames={45}><Out dur={45}><Place at="center"><FlipLetters text="80 İLİN ÜNLÜ YERLERİ" font="Monoton" size={70} color="#ffd34d" /></Place></Out></Sequence>
      <Sequence from={SEG.length * D} durationInFrames={90}><Clip dir="guncelleme11" shot="kapadokya" start={10} count={D} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
