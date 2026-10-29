import { Composition } from "remotion";
import { EfektDemo } from "./EfektDemo";
import { Fragman } from "./fragman/Fragman";
import { Tanitim } from "./fragman/Tanitim";
import { Guncelleme2 } from "./fragman/Guncelleme2";

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
    </>
  );
};
