import { Composition } from "remotion";
import { Promo } from "./Promo";
import { DarkHour, DARK_TOTAL } from "./dark/DarkHour";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="DarkHour" component={DarkHour} width={1920} height={1080} fps={30} durationInFrames={DARK_TOTAL} />
  <Composition id="Promo" component={Promo} width={WIDTH} height={HEIGHT} fps={FPS} durationInFrames={TOTAL_FRAMES} />
  </>
);
