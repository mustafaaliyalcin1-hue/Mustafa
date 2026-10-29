import { Composition } from "remotion";
import { EfektDemo } from "./EfektDemo";
import { Fragman } from "./fragman/Fragman";

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
    </>
  );
};
