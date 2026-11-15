import { Composition } from "remotion";
const Deneme = () => <div style={{position:"absolute",left:100,top:300,fontSize:120,color:"#fff",fontFamily:"sans-serif"}}>ŞEFFAF ğüış</div>;
export const Root = () => <Composition id="Deneme" component={Deneme} durationInFrames={10} fps={30} width={1080} height={1920} />;
