import { Easing } from "remotion";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Az oldal kék témájából (theme.css)
export const colors = {
  bg: "#060b1f",
  navy: "#172554",
  blue: "#2563eb",
  sky: "#60a5fa",
  ice: "#dbeafe",
  text: "#f8fbff",
  muted: "#8da2d6",
  ink: "#1e293b",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

export const FONT = '"Inter Variable", "Inter", system-ui, sans-serif';

// Apple-szerű, lassan lecsengő mozgás
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// Jelenetek hossza (képkocka, 30 fps)
export const SCENES = {
  hook: 90,
  problem: 120,
  logo: 90,
  demo: 270,
  tracking: 120,
  pillars: 100,
  end: 110,
} as const;

export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0);
