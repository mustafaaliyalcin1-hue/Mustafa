import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { useFonts, Clip, FlipLetters, Place, Out } from "./Fragman";
import { End } from "./Tanitim";

// Arayüz cilası videosu: eski / yeni ekranlar perde kaydırarak karşılaştırılır, sonra yeni HUD ile sürüş.
// Kareler oyunun içinden çekildi (public/guncelleme7/kare/*.png, public/guncelleme7/surus/0000.jpg ...). Müzik render sonrası ffmpeg ile eklenir.
type Cmp = { k: string; title: string; note: string; tel?: boolean };
const CMP: Cmp[] = [
  { k: "pc_menu", title: "Menü daha düzenli", note: "Sunum modu kartı düzeldi, ikonlar çizildi" },
  { k: "pc_hud", title: "Göstergeler okunuyor", note: "Gökyüzünde bile net: koyu zemin, büyük yazı" },
  { k: "tel_hud", title: "Telefonda tuşlar rahat", note: "İpucu tuşların arasına sığdı, klavye harfi yok", tel: true },
  { k: "tel_menu", title: "Telefonda menü", note: "Başlık etiketleri kalktı, yazılar büyüdü", tel: true },
];
const CD = 120, DRIVE = 150;
export const G7_LEN = 70 + CMP.length * CD + DRIVE + 90;

const Title: React.FC<{ text: string; note: string }> = ({ text, note }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 13 } });
  return (
    <div style={{ position: "absolute", left: 40, bottom: 40, transform: `translateY(${(1 - s) * 200}px)` }}>
      <div style={{ fontFamily: "BebasNeue", fontSize: 66, color: "#fff", background: "rgba(10,12,16,.75)", padding: "4px 20px", display: "inline-block" }}>{text}</div>
      <div style={{ fontFamily: "RussoOne", fontSize: 26, color: "#ffd34d", background: "rgba(10,12,16,.75)", padding: "6px 20px", marginTop: 4, display: "table" }}>{note}</div>
    </div>
  );
};
const Tag: React.FC<{ text: string; right?: boolean; color: string }> = ({ text, right, color }) => (
  <div style={{ position: "absolute", top: 24, [right ? "right" : "left"]: 24, fontFamily: "BebasNeue", fontSize: 44, color: "#fff", background: color, padding: "2px 16px", borderRadius: 4 }}>{text}</div>
);
// Perde: önce eski görünür, perde soldan sağa kayar ve yeniyi açar.
const Compare: React.FC<{ c: Cmp }> = ({ c }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [24, 70], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const zoom = interpolate(f, [0, CD], [1, 1.05]);
  const img = (v: string) => <Img src={staticFile(`guncelleme7/kare/${v}_${c.k}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: c.tel ? "contain" : "cover", transform: `scale(${zoom})` }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d12" }}>
      {img("yeni")}
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${100 - x}%)` }}>{img("eski")}</AbsoluteFill>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${100 - x}%`, width: 6, marginLeft: -3, background: "#ff3b4e", opacity: x > 0 && x < 100 ? 1 : 0 }} />
      <div style={{ opacity: interpolate(f, [44, 56], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}><Tag text="ÖNCE" right color="rgba(120,124,132,.9)" /></div>
      <div style={{ opacity: interpolate(f, [50, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}><Tag text="ŞİMDİ" color="#e3263b" /></div>
      <Sequence from={10}><Title text={c.title} note={c.note} /></Sequence>
    </AbsoluteFill>
  );
};

export const Guncelleme7: React.FC = () => {
  useFonts();
  const d0 = 70 + CMP.length * CD;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={0} durationInFrames={70}><Clip dir="guncelleme7" shot="surus" count={DRIVE} punch={false} blur={6} /><Out dur={70}><Place at="center"><FlipLetters text="YENİ GÖRÜNÜM" font="Monoton" size={96} color="#ff3b4e" /></Place></Out></Sequence>
      {CMP.map((c, i) => <Sequence key={c.k} from={70 + i * CD} durationInFrames={CD}><Compare c={c} /></Sequence>)}
      <Sequence from={d0} durationInFrames={DRIVE}><Clip dir="guncelleme7" shot="surus" count={DRIVE} punch /><Out dur={DRIVE}><Title text="Daha güzel, daha net" note="Hepsi oyunda: Tepetaklak Rampa" /></Out></Sequence>
      <Sequence from={d0 + DRIVE} durationInFrames={90}><Clip dir="guncelleme7" shot="surus" start={60} count={DRIVE} punch={false} blur={7} /><End /></Sequence>
    </AbsoluteFill>
  );
};
