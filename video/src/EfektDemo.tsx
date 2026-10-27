import { AbsoluteFill, Series } from "remotion";
import { KineticCaptions } from "./efektler/KineticCaptions";
import { DoodleBoil } from "./efektler/DoodleBoil";
import { ChartGrow } from "./efektler/ChartGrow";
import { Vertigo } from "./efektler/Vertigo";

// Reel'deki efektlerden dördünün örneği; her biri 3 saniye.
export const EfektDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <KineticCaptions text="Bu videodaki her efekti Claude yaptı" />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <DoodleBoil />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <ChartGrow values={[30, 55, 42, 80, 95]} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Vertigo />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
