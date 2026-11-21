import { Composition } from "remotion";
import { Eldiven, Plan } from "./eldiven/Eldiven";
import { AmongUs, Z } from "./amongus/AmongUs";
import plan from "../public/eldiven/plan.json";
import { Komut3, Plan3 } from "./komut3/Komut3";
import plan3 from "../public/komut3/plan.json";
import { KaleciVideo, PlanK } from "./kaleci/Kaleci";
import planK from "../public/kaleci/plan.json";
import { Kaleci2, Plan2 } from "./kaleci2/Kaleci2";
import plan2 from "../public/kaleci2/plan.json";

export const Root = () => (
  <>
  <Composition id="Kaleci2" component={Kaleci2} fps={30} width={1080} height={1920}
    durationInFrames={Math.ceil((plan2 as Plan2).sure * 30)} defaultProps={{ plan: plan2 as Plan2 }} />
  <Composition id="Kaleci" component={KaleciVideo} fps={30} width={1080} height={1920}
    durationInFrames={Math.ceil((planK as PlanK).sure * 30)} defaultProps={{ plan: planK as PlanK }} />
  <Composition id="Komut3" component={Komut3} fps={30} width={1080} height={1920}
    durationInFrames={Math.ceil((plan3 as Plan3).sure * 30)} defaultProps={{ plan: plan3 as Plan3 }} />
  <Composition id="AmongUs" component={AmongUs} fps={30} width={1080} height={1920} durationInFrames={Math.round(Z.sure * 30)} />
  <Composition id="Eldiven" component={Eldiven} fps={30} width={1080} height={1920}
    durationInFrames={Math.ceil((plan as Plan).sure * 30)} defaultProps={{ plan: plan as Plan }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil(props.plan.sure * 30) })} />
  </>
);
