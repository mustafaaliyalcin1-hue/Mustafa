import { Composition } from "remotion";
import { EfektDemo } from "./EfektDemo";
import { Fragman } from "./fragman/Fragman";
import { Tanitim } from "./fragman/Tanitim";
import { Guncelleme2 } from "./fragman/Guncelleme2";
import { Guncelleme3 } from "./fragman/Guncelleme3";
import { Guncelleme4, G4_LEN } from "./fragman/Guncelleme4";
import { Guncelleme5, G5_LEN } from "./fragman/Guncelleme5";
import { Guncelleme6, G6_LEN } from "./fragman/Guncelleme6";
import { Guncelleme7, G7_LEN } from "./fragman/Guncelleme7";
import { Guncelleme8, G8_LEN } from "./fragman/Guncelleme8";
import { Guncelleme9, G9_LEN } from "./fragman/Guncelleme9";
import { TanitimReels, REELS_LEN } from "./reels/TanitimReels";

export const Root: React.FC = () => {
  return (
    <>
    <Composition
      id="EfektDemo"
      component={EfektDemo}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition id="Fragman" component={Fragman} durationInFrames={1200} fps={30} width={1280} height={720} />
    <Composition id="Tanitim" component={Tanitim} durationInFrames={1260} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme2" component={Guncelleme2} durationInFrames={720} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme3" component={Guncelleme3} durationInFrames={580} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme4" component={Guncelleme4} durationInFrames={G4_LEN} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme5" component={Guncelleme5} durationInFrames={G5_LEN} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme6" component={Guncelleme6} durationInFrames={G6_LEN} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme7" component={Guncelleme7} durationInFrames={G7_LEN} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme8" component={Guncelleme8} durationInFrames={G8_LEN} fps={30} width={1280} height={720} />
    <Composition id="Guncelleme9" component={Guncelleme9} durationInFrames={G9_LEN} fps={30} width={1280} height={720} />
    <Composition id="TanitimReels" component={TanitimReels} durationInFrames={REELS_LEN} fps={30} width={1080} height={1920} />
    </>
  );
};
