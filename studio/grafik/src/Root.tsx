import { Composition } from "remotion";
import { Eldiven, Plan } from "./eldiven/Eldiven";
import { AmongUs, Z } from "./amongus/AmongUs";
import plan from "../public/eldiven/plan.json";

export const Root = () => (
  <>
  <Composition id="AmongUs" component={AmongUs} fps={30} width={1080} height={1920} durationInFrames={Math.round(Z.sure * 30)} />
  <Composition id="Eldiven" component={Eldiven} fps={30} width={1080} height={1920}
    durationInFrames={Math.ceil((plan as Plan).sure * 30)} defaultProps={{ plan: plan as Plan }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil(props.plan.sure * 30) })} />
  </>
);
