import { Composition } from "remotion";
import { Eldiven, Plan } from "./eldiven/Eldiven";
import { AmongUs, Z } from "./amongus/AmongUs";
import plan from "../public/eldiven/plan.json";
import { Komut3, Plan3 } from "./komut3/Komut3";
import plan3 from "../public/komut3/plan.json";

export const Root = () => (
  <>
  <Composition id="Komut3" component={Komut3} fps={30} width={1080} height={1920}
    durationInFrames={Math.ceil((plan3 as Plan3).sure * 30)} defaultProps={{ plan: plan3 as Plan3 }} />
  <Composition id="AmongUs" component={AmongUs} fps={30} width={1080} height={1920} durationInFrames={Math.round(Z.sure * 30)} />
  <Composition id="Eldiven" component={Eldiven} fps={30} width={1080} height={1920}
    durationInFrames={Math.ceil((plan as Plan).sure * 30)} defaultProps={{ plan: plan as Plan }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil(props.plan.sure * 30) })} />
  </>
);
