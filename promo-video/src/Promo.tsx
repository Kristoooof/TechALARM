import { AbsoluteFill, Series } from "remotion";
import "./fonts";
import { DemoScene } from "./PhoneDemo";
import { EndScene, HookScene, LogoScene, PillarsScene, ProblemScene, TrackingScene } from "./scenes";
import { SCENES } from "./theme";
import { Background } from "./ui";

export const Promo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Series>
      <Series.Sequence name="Nyitás" durationInFrames={SCENES.hook}>
        <HookScene />
      </Series.Sequence>
      <Series.Sequence name="Probléma" durationInFrames={SCENES.problem}>
        <ProblemScene />
      </Series.Sequence>
      <Series.Sequence name="Logó" durationInFrames={SCENES.logo}>
        <LogoScene />
      </Series.Sequence>
      <Series.Sequence name="Bemutató" durationInFrames={SCENES.demo}>
        <DemoScene />
      </Series.Sequence>
      <Series.Sequence name="Követés" durationInFrames={SCENES.tracking}>
        <TrackingScene />
      </Series.Sequence>
      <Series.Sequence name="Három szó" durationInFrames={SCENES.pillars}>
        <PillarsScene />
      </Series.Sequence>
      <Series.Sequence name="Zárás" durationInFrames={SCENES.end}>
        <EndScene />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
