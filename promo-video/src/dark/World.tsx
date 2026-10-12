import type React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import type { FC } from "react";
import * as THREE from "three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, D, easeIO, easeOut, flashAt, rnd } from "./theme";

// ---------- Kamera-pálya ----------
export const camAt = (f: number) => {
  const zMove = interpolate(f, [0, 175], [8, -19.25], { ...clamp, easing: Easing.bezier(0.25, 0.05, 0.2, 1) });
  const x = interpolate(f, [0, 150, 205, 300, 560], [0.0, 0.0, -0.4, -2.2, -3.0], { ...clamp, easing: easeIO });
  const yaw = interpolate(f, [118, 178], [0, Math.PI / 2], { ...clamp, easing: easeIO });
  const pitch = interpolate(f, [300, 400, 560], [0, 0.15, 0.12], { ...clamp, easing: easeIO });
  const walking = f < 175 ? 1 : f < 300 ? 0.55 : 0.12;
  const y = 1.62 + Math.sin(f * 0.34) * 0.035 * walking;
  const sway = Math.sin(f * 0.17) * 0.012 * walking + Math.sin(f * 0.05) * 0.004;
  return { x, y, z: zMove, yaw: yaw + sway, pitch: pitch + Math.sin(f * 0.21) * 0.004 };
};

const CameraRig: FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  const c = camAt(f);
  camera.position.set(c.x, c.y, c.z);
  camera.rotation.set(c.pitch, c.yaw, 0, "YXZ");
  return null;
};

const Box: FC<{ p: [number, number, number]; s: [number, number, number]; c: string; basic?: boolean }> = ({ p, s, c, basic }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    {basic ? <meshBasicMaterial color={c} /> : <meshLambertMaterial color={c} />}
  </mesh>
);

// ---------- Folyosó ----------
const Corridor: FC<{ f: number }> = ({ f }) => {
  const lockers: React.ReactElement[] = [];
  for (let i = 0; i < 64; i++) {
    const z = 9 - i * 0.55;
    lockers.push(<Box key={i} p={[1.27, 1.05, z]} s={[0.46, 2.1, 0.5]} c={i % 2 ? "#1c47e0" : "#2354f0"} />);
    lockers.push(<Box key={`h${i}`} p={[1.03, 1.15, z]} s={[0.03, 0.2, 0.06]} c="#9fd2ff" basic />);
  }
  const panels: React.ReactElement[] = [];
  for (let i = 0; i < 12; i++) {
    const z = 7 - i * 3.2;
    const flick = i === 4 || i === 7 ? 0.45 + 0.55 * rnd(Math.floor(f / 3) + i * 9) : 1;
    const b = 0.55 + 0.45 * flick;
    panels.push(<Box key={i} p={[0, 3.09, z]} s={[0.9, 0.03, 1.5]} c={new THREE.Color(0.55 * b, 0.82 * b, 1.0 * b).getStyle()} basic />);
  }
  const doors: React.ReactElement[] = [];
  [-4.6, -9.8, -14.4, -24.6].forEach((z, i) => {
    doors.push(<Box key={`d${i}`} p={[-1.38, 1.05, z]} s={[0.06, 2.1, 1.05]} c="#0a1a78" />);
    doors.push(<Box key={`w${i}`} p={[-1.34, 1.55, z]} s={[0.04, 0.6, 0.55]} c="#7fb5ff" basic />);
  });
  return (
    <group>
      {/* padló és mennyezet */}
      <Box p={[0, -0.05, -9]} s={[3, 0.1, 40]} c="#0c1a73" />
      <Box p={[-0.9, 0.001, -9]} s={[0.05, 0.002, 40]} c="#5aa0ff" basic />
      <Box p={[0.9, 0.001, -9]} s={[0.05, 0.002, 40]} c="#5aa0ff" basic />
      <Box p={[0, 3.2, -9]} s={[3, 0.1, 40]} c="#0a1660" basic />
      {/* jobb fal + szekrények */}
      <Box p={[1.52, 1.6, -9]} s={[0.04, 3.2, 40]} c="#0a1a78" />
      {lockers}
      {/* bal fal: szakaszok az ajtó körül (rés: -18.6 … -19.8) */}
      <Box p={[-1.55, 1.6, -4.8]} s={[0.1, 3.2, 27.6]} c="#0f2a8f" />
      <Box p={[-1.55, 1.6, -23.4]} s={[0.1, 3.2, 7.2]} c="#0f2a8f" />
      <Box p={[-1.55, 2.7, -19.2]} s={[0.1, 1.0, 1.2]} c="#0f2a8f" />
      {doors}
      {panels}
      {/* folyosó vége */}
      <Box p={[0, 1.6, -29]} s={[3, 3.2, 0.1]} c="#071263" />
    </group>
  );
};

// ---------- Ajtó ----------
const Door: FC<{ f: number }> = ({ f }) => {
  const angle = interpolate(f, [172, 218], [0, 1.78], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
  return (
    <group position={[-1.55, 0, -18.6]} rotation={[0, angle, 0]}>
      <Box p={[0, 1.05, -0.6]} s={[0.06, 2.1, 1.2]} c="#e8f4ff" />
      <Box p={[0.04, 1.4, -0.6]} s={[0.02, 0.6, 0.5]} c="#9fd2ff" basic />
      <Box p={[0.05, 1.0, -1.05]} s={[0.05, 0.05, 0.14]} c="#ffd98a" basic />
    </group>
  );
};

// ---------- Tanterem ----------
const Desks: FC = () => {
  const items: React.ReactElement[] = [];
  const xs = [-3.5, -5.2, -7.0, -8.8, -10.5];
  for (let xi = 0; xi < xs.length; xi++) {
    for (let zi = 0; zi < 7; zi++) {
      const x = xs[xi];
      const z = -15.3 - zi * 1.3;
      const k = `${xi}-${zi}`;
      items.push(<Box key={`t${k}`} p={[x, 0.72, z]} s={[0.55, 0.04, 0.9]} c="#d6e6ff" />);
      items.push(<Box key={`a${k}`} p={[x, 0.36, z - 0.4]} s={[0.5, 0.72, 0.04]} c="#3a62ff" />);
      items.push(<Box key={`b${k}`} p={[x, 0.36, z + 0.4]} s={[0.5, 0.72, 0.04]} c="#3a62ff" />);
      items.push(<Box key={`s${k}`} p={[x + 0.66, 0.45, z]} s={[0.42, 0.05, 0.42]} c="#2145d6" />);
      items.push(<Box key={`r${k}`} p={[x + 0.86, 0.72, z]} s={[0.04, 0.42, 0.42]} c="#2145d6" />);
      items.push(<Box key={`l${k}`} p={[x + 0.66, 0.22, z]} s={[0.05, 0.44, 0.05]} c="#6f8bff" />);
    }
  }
  return <group>{items}</group>;
};

const Smoke: FC<{ f: number }> = ({ f }) => {
  const puffs: React.ReactElement[] = [];
  const N = 46;
  for (let i = 0; i < N; i++) {
    const life = 70 + rnd(i) * 40;
    const age = ((f * 1 + i * 13.7) % life) / life; // 0..1
    const seed = Math.floor((f + i * 13.7) / life) + i * 7;
    const ox = (rnd(seed) - 0.5) * 0.45;
    const oz = (rnd(seed + 1) - 0.5) * 0.35;
    const rise = age * 1.5;
    const drift = Math.sin(age * 5 + i) * 0.18 * age + (rnd(seed + 2) - 0.5) * 0.5 * age;
    const r = 0.07 + age * 0.38;
    const op = Math.sin(Math.PI * Math.min(1, age * 1.15)) * 0.4;
    puffs.push(
      <mesh key={i} position={[-6.2 + ox + drift, 2.58 + rise, -19.5 + oz + drift * 0.6]} scale={r}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={i % 3 ? "#7f93c9" : "#5a6db3"} transparent opacity={op} depthWrite={false} />
      </mesh>,
    );
  }
  return <group>{puffs}</group>;
};

const Projector: FC<{ f: number }> = ({ f }) => {
  const fl = flashAt(f);
  // erőlködés: apró remegés a villanások körül
  const near = FLASH_NEAR(f);
  const jx = near * (rnd(f * 3.1) - 0.5) * 0.02;
  const jr = near * (rnd(f * 1.7) - 0.5) * 0.05;
  const led = Math.floor(f / 6) % 2 === 0 ? "#ff3b4e" : "#5a0f18";
  return (
    <group position={[-6.2 + jx, 0, -19.5]} rotation={[0, 0, jr]}>
      <Box p={[0, 2.9, 0]} s={[0.04, 0.6, 0.04]} c="#9db2e8" />
      <Box p={[0, 2.62, 0]} s={[0.3, 0.04, 0.3]} c="#9db2e8" />
      <Box p={[0, 2.5, 0]} s={[0.56, 0.16, 0.42]} c="#e9f2ff" />
      <mesh position={[-0.31, 2.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.095, 0.095, 0.1, 18]} />
        <meshBasicMaterial color={fl > 0 ? "#ffffff" : "#16206b"} />
      </mesh>
      <Box p={[0.12, 2.585, 0.12]} s={[0.04, 0.02, 0.04]} c={led} basic />
      <Box p={[0.15, 2.5, 0.215]} s={[0.22, 0.05, 0.01]} c="#36427f" />
    </group>
  );
};

function FLASH_NEAR(f: number) {
  // 1, ha 6 képkockán belül villanás van
  for (let k = -6; k <= 6; k++) if (flashAt(f + k) > 0) return 1;
  return 0;
}

const Classroom: FC<{ f: number }> = ({ f }) => {
  const fl = flashAt(f);
  const board = new THREE.Color(0.04 + 0.96 * fl, 0.09 + 0.91 * fl, 0.33 + 0.67 * fl).getStyle();
  return (
    <group>
      <Box p={[-6.75, -0.05, -19.5]} s={[10.5, 0.1, 13]} c="#0a1670" />
      <Box p={[-6.75, 3.25, -19.5]} s={[10.5, 0.1, 13]} c="#0b1a6a" basic />
      <Box p={[-12.05, 1.6, -19.5]} s={[0.1, 3.2, 13]} c="#0f2a8f" />
      <Box p={[-6.75, 1.6, -13.05]} s={[10.5, 3.2, 0.1]} c="#0d2386" />
      <Box p={[-6.75, 1.6, -25.95]} s={[10.5, 3.2, 0.1]} c="#0d2386" />
      {/* ablakok a hátsó falon: hideg fény */}
      {[-3.6, -6.4, -9.2].map((x) => (
        <Box key={x} p={[x, 1.8, -25.88]} s={[1.8, 1.2, 0.03]} c="#6f9bff" basic />
      ))}
      {/* tábla */}
      <Box p={[-11.97, 1.75, -19.5]} s={[0.04, 1.9, 4.3]} c="#0a1148" />
      <mesh position={[-11.93, 1.75, -19.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.1, 1.7]} />
        <meshBasicMaterial color={board} />
      </mesh>
      <Desks />
      <Projector f={f} />
      <Smoke f={f} />
      {/* fénykúp a projektortól a tábláig */}
      <mesh position={[-9.3, 1.9, -19.5]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[1.9, 5.4, 28, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5 * fl} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight position={[-6.6, 2.3, -19.5]} intensity={46 * fl} distance={13} color="#ffffff" />
      <pointLight position={[-6.0, 2.8, -25.0]} intensity={3.2} distance={12} color="#5f8cff" />
    </group>
  );
};

export const World: FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const c = camAt(f);
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 72, near: 0.05, far: 60, position: [0, 1.6, 8] }}>
      <color attach="background" args={[D.void]} />
      <fog attach="fog" args={[D.void, 4, 26]} />
      <ambientLight intensity={0.8} color="#7d97ff" />
      <pointLight position={[c.x, c.y + 0.4, c.z]} intensity={9} distance={11} decay={1.5} color="#a9c4ff" />
      {/* az ajtón kiszűrődő fény */}
      <pointLight position={[-2.6, 1.8, -19.2]} intensity={f > 172 ? 7 : 0} distance={8} color="#bcd4ff" />
      <CameraRig f={f} />
      <Corridor f={f} />
      <Door f={f} />
      <Classroom f={f} />
    </ThreeCanvas>
  );
};
export { easeOut };
