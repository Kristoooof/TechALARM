import { Composition } from "remotion";
import { Promo } from "./Promo";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition id="Promo" component={Promo} width={WIDTH} height={HEIGHT} fps={FPS} durationInFrames={TOTAL_FRAMES} />
);
