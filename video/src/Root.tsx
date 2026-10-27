import { Composition } from "remotion";
import { EfektDemo } from "./EfektDemo";

export const Root: React.FC = () => {
  return (
    <Composition
      id="EfektDemo"
      component={EfektDemo}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
