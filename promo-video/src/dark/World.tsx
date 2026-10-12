import type React from "react";
import { useEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import type { FC } from "react";
import * as THREE from "three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, D, easeIO, easeOut, flashAt, rnd } from "./theme";
import { Chair, chairPos, Students } from "./People";
import { type Env, envAt, smooth, T } from "./time";

// ---------- Kamera-pálya ----------
export const camAt = (f: number) => {
  const zMove = interpolate(f, [0, 175], [8, -19.25], { ...clamp, easing: Easing.bezier(0.25, 0.05, 0.2, 1) });
  const z = zMove - 0.25 * smooth(f, 230, 340);
  const x = interpolate(f, [0, 150, 205, 330, 520, 880], [0.0, 0.0, -0.4, -2.15, -2.5, -3.1], { ...clamp, easing: easeIO });
  const yaw = interpolate(f, [118, 178], [0, Math.PI / 2], { ...clamp, easing: easeIO }) - 0.13 * smooth(f, 230, 340);
  const pitch = interpolate(f, [230, 340, 880], [0, 0.08, 0.07], { ...clamp, easing: easeIO });
  const walking = f < 175 ? 1 : f < 300 ? 0.55 : 0.1;
  const y = 1.62 + Math.sin(f * 0.34) * 0.035 * walking;
  const sway = Math.sin(f * 0.17) * 0.012 * walking + Math.sin(f * 0.05) * 0.004;
  return { x, y, z, yaw: yaw + sway, pitch: pitch + Math.sin(f * 0.21) * 0.004 * (walking > 0.3 ? 1 : 0.4) };
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
const WALL_Z = -25.95;
const WIN_X = [-10.9, -8.4, -5.9];
const WIN_W = 2.0;
const Y0 = 0.95;
const Y1 = 2.75;

const Desks: FC = () => {
  const items: React.ReactElement[] = [];
  const xs = [-3.5, -5.2, -7.0, -8.8, -10.5];
  for (let xi = 0; xi < xs.length; xi++) {
    for (let zi = 0; zi < 7; zi++) {
      // középen szabad sáv a projektorig + tisztás a földön ülő diákoknak
      if (zi === 3) continue;
      if (zi === 4 && xi <= 2) continue;
      const x = xs[xi];
      const z = -15.3 - zi * 1.3;
      const k = `${xi}-${zi}`;
      items.push(<Box key={`t${k}`} p={[x, 0.72, z]} s={[0.55, 0.04, 0.9]} c="#d6e6ff" />);
      items.push(<Box key={`a${k}`} p={[x, 0.36, z - 0.4]} s={[0.5, 0.72, 0.04]} c="#3a62ff" />);
      items.push(<Box key={`b${k}`} p={[x, 0.36, z + 0.4]} s={[0.5, 0.72, 0.04]} c="#3a62ff" />);
      if (!(xi === 2 && zi === 2)) items.push(<Chair key={`c${k}`} x={x + 0.66} z={z} />); // a (2,2) szék külön mozog
    }
  }
  return <group>{items}</group>;
};

const Smoke: FC<{ f: number; lum: number }> = ({ f, lum }) => {
  const puffs: React.ReactElement[] = [];
  const N = 46;
  const k = 0.3 + 0.7 * Math.min(1, lum);
  const c1 = new THREE.Color("#7f93c9").multiplyScalar(k).getStyle();
  const c2 = new THREE.Color("#5a6db3").multiplyScalar(k).getStyle();
  for (let i = 0; i < N; i++) {
    const life = 70 + rnd(i) * 40;
    const age = ((f * 1 + i * 13.7) % life) / life; // 0..1
    const seed = Math.floor((f + i * 13.7) / life) + i * 7;
    const ox = (rnd(seed) - 0.5) * 0.45;
    const oz = (rnd(seed + 1) - 0.5) * 0.35;
    const rise = age * 1.5;
    const drift = Math.sin(age * 5 + i) * 0.18 * age + (rnd(seed + 2) - 0.5) * 0.5 * age;
    const r = 0.07 + age * 0.38;
    const op = Math.sin(Math.PI * Math.min(1, age * 1.15)) * 0.42;
    puffs.push(
      <mesh key={i} position={[-6.2 + ox + drift, 2.58 + rise, -19.5 + oz + drift * 0.6]} scale={r}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={i % 3 ? c1 : c2} transparent opacity={op} depthWrite={false} />
      </mesh>,
    );
  }
  return <group>{puffs}</group>;
};

function FLASH_NEAR(f: number) {
  // 1, ha 6 képkockán belül villanás van
  for (let k = -6; k <= 6; k++) if (flashAt(f + k) > 0) return 1;
  return 0;
}

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

/** Négyszög négy tetszőleges ponttal (fénynyaláb, napfolt). */
const Quad: FC<{ pts: [number, number, number][]; color: THREE.Color; opacity: number }> = ({ pts, color, opacity }) => {
  const key = pts.map((p) => p.map((v) => v.toFixed(3)).join(",")).join("|");
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts.flat(), 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => () => geo.dispose(), [geo]);
  if (opacity <= 0.002) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
    </mesh>
  );
};

/** Ablakok a hátsó (jobb) falon: kilátás az égre, nappal/holddal. */
const Windows: FC<{ env: Env }> = ({ env }) => {
  const { hour, night, warm, sky } = env;
  const bands: React.ReactElement[] = [];
  const NB = 12;
  for (let k = 0; k < NB; k++) {
    const t = k / (NB - 1);
    const col = t < 0.45 ? sky[2].clone().lerp(sky[1], t / 0.45) : sky[1].clone().lerp(sky[0], (t - 0.45) / 0.55);
    bands.push(
      <mesh key={k} position={[-7.6, 0.4 + k * 0.3 + 0.15, -27.0]}>
        <planeGeometry args={[14, 0.31]} />
        <meshBasicMaterial color={col} fog={false} />
      </mesh>,
    );
  }
  // látóhatár: házak sziluettje
  const skyline: React.ReactElement[] = [];
  const dayHaze = new THREE.Color("#35539f").lerp(new THREE.Color("#05093a"), night);
  const dusk = new THREE.Color("#3a2a6a").lerp(new THREE.Color("#05093a"), night);
  const sil = dayHaze.lerp(dusk, warm * 0.8);
  for (let i = 0; i < 16; i++) {
    const h = 0.8 + 1.15 * rnd(i * 3.7);
    skyline.push(
      <mesh key={i} position={[-13.8 + i * 0.7, h / 2, -26.8]}>
        <boxGeometry args={[0.62, h, 0.3]} />
        <meshBasicMaterial color={sil} fog={false} />
      </mesh>,
    );
  }
  // nap és hold
  const sunX = -12.8 + (6.9 * (hour - 6)) / 12;
  const sunY = 1.2 + env.el * 3.6;
  const mh = hour >= 18 ? hour - 18 : hour + 6;
  const moonX = -12.8 + (6.9 * mh) / 12;
  const moonY = 1.2 + Math.sin((Math.PI * mh) / 12) * 3.2;
  const sunCol = new THREE.Color("#fff6cf").lerp(new THREE.Color("#ff8a3a"), warm);
  const sunVis = env.el > -0.06 ? 1 : 0;
  const moonVis = env.night > 0.25 ? 1 : 0;
  const stars: React.ReactElement[] = [];
  for (let i = 0; i < 40; i++) {
    const tw = 0.45 + 0.55 * Math.abs(Math.sin(env.f * 0.15 + i * 1.7));
    stars.push(
      <mesh key={i} position={[-13 + rnd(i * 5.1) * 9, 1.0 + rnd(i * 9.3) * 3.6, -26.7]}>
        <planeGeometry args={[0.05, 0.05]} />
        <meshBasicMaterial color="#dfe9ff" transparent opacity={night * tw} fog={false} />
      </mesh>,
    );
  }
  // fal az ablakok körül
  const piers: [number, number][] = [
    [-12.05, -11.9],
    [-9.9, -9.4],
    [-7.4, -6.9],
    [-4.9, -1.45],
  ];
  return (
    <group>
      {bands}
      {skyline}
      {sunVis ? (
        <>
          <mesh position={[sunX, sunY, -26.6]}>
            <circleGeometry args={[0.55, 28]} />
            <meshBasicMaterial color={sunCol} fog={false} />
          </mesh>
          <mesh position={[sunX, sunY, -26.65]}>
            <circleGeometry args={[1.5, 28]} />
            <meshBasicMaterial color={sunCol} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
          </mesh>
        </>
      ) : null}
      {moonVis ? (
        <>
          <mesh position={[moonX, moonY, -26.6]}>
            <circleGeometry args={[0.32, 24]} />
            <meshBasicMaterial color="#e6eeff" transparent opacity={night} fog={false} />
          </mesh>
          <mesh position={[moonX, moonY, -26.65]}>
            <circleGeometry args={[1.0, 24]} />
            <meshBasicMaterial color="#9fb8ff" transparent opacity={0.22 * night} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
          </mesh>
        </>
      ) : null}
      {stars}
      {/* fal: ablak alatt, felett, pillérek */}
      <Box p={[-6.75, Y0 / 2, WALL_Z]} s={[10.6, Y0, 0.1]} c="#0d2386" />
      <Box p={[-6.75, (Y1 + 3.2) / 2, WALL_Z]} s={[10.6, 3.2 - Y1, 0.1]} c="#0d2386" />
      {piers.map(([a, b], i) => (
        <Box key={i} p={[(a + b) / 2, (Y0 + Y1) / 2, WALL_Z]} s={[b - a, Y1 - Y0, 0.1]} c="#0d2386" />
      ))}
      {WIN_X.map((wx, i) => (
        <group key={i}>
          <Box p={[wx, Y0 - 0.02, WALL_Z + 0.08]} s={[WIN_W + 0.2, 0.05, 0.16]} c="#e8f4ff" />
          <Box p={[wx, (Y0 + Y1) / 2, WALL_Z + 0.03]} s={[0.05, Y1 - Y0, 0.05]} c="#e8f4ff" />
          <Box p={[wx, (Y0 + Y1) / 2, WALL_Z + 0.03]} s={[WIN_W, 0.05, 0.05]} c="#e8f4ff" />
        </group>
      ))}
    </group>
  );
};

/** Napfény: foltok a padlón/falon és fénynyalábok az ablakokból. */
const Sunlight: FC<{ env: Env }> = ({ env }) => {
  const { el, sunC, shiftX } = env;
  const power = smooth(el, -0.01, 0.03) * smooth(env.f, 225, 255);
  if (power <= 0.01) return null;
  const t = Math.tan(Math.asin(Math.min(1, Math.max(0.012, el))));
  const zw = WALL_Z + 0.06;
  const DMAX = 12.8;
  const els: React.ReactElement[] = [];
  const bright = (0.5 + 0.5 * Math.min(1, el / 0.3)) * power;
  WIN_X.forEach((wx, j) => {
    const x0 = Math.max(wx - WIN_W / 2 + shiftX, -11.9);
    const x1 = Math.min(wx + WIN_W / 2 + shiftX, -1.7);
    if (x1 - x0 < 0.15) return;
    const d1 = Y0 / t;
    const d2 = Y1 / t;
    // padlófolt
    if (d1 < DMAX) {
      const za = zw + d1;
      const zb = zw + Math.min(d2, DMAX);
      els.push(
        <Quad key={`f${j}`} pts={[[x0, 0.012, za], [x1, 0.012, za], [x1, 0.012, zb], [x0, 0.012, zb]]} color={sunC} opacity={0.5 * bright} />,
      );
    }
    // folt a szemközti falon (alacsony napnál)
    const yw0 = Y0 - DMAX * t;
    const yw1 = Y1 - DMAX * t;
    if (d2 > DMAX && yw1 > 0.05) {
      els.push(<Quad key={`w${j}`} pts={[[x0, Math.max(0.02, yw0), -13.0], [x1, Math.max(0.02, yw0), -13.0], [x1, yw1, -13.0], [x0, yw1, -13.0]]} color={sunC} opacity={0.55 * bright} />);
    }
    // nyaláb (4 lap)
    const D = Math.min(DMAX, d2);
    const yF0 = Math.max(0.02, Y0 - D * t);
    const yF1 = Math.max(0.02, Y1 - D * t);
    const zF = zw + D;
    const n = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
    const o = 0.13 * bright;
    els.push(
      <Quad key={`bt${j}`} pts={[n(x0, Y1, zw), n(x1, Y1, zw), n(x1 + shiftX * 0.0, yF1, zF), n(x0, yF1, zF)]} color={sunC} opacity={o} />,
      <Quad key={`bb${j}`} pts={[n(x0, Y0, zw), n(x1, Y0, zw), n(x1, yF0, zF), n(x0, yF0, zF)]} color={sunC} opacity={o} />,
      <Quad key={`bl${j}`} pts={[n(x0, Y0, zw), n(x0, Y1, zw), n(x0, yF1, zF), n(x0, yF0, zF)]} color={sunC} opacity={o * 0.8} />,
      <Quad key={`br${j}`} pts={[n(x1, Y0, zw), n(x1, Y1, zw), n(x1, yF1, zF), n(x1, yF0, zF)]} color={sunC} opacity={o * 0.8} />,
    );
  });
  return <group>{els}</group>;
};

const Ceiling: FC<{ env: Env }> = ({ env }) => {
  const on = env.lights;
  const col = new THREE.Color("#171f66").lerp(new THREE.Color("#f0f8ff"), on).getStyle();
  const panels: React.ReactElement[] = [];
  [-4.2, -6.75, -9.3].forEach((x, i) =>
    [-15.6, -19.5, -23.4].forEach((z, j) => panels.push(<Box key={`${i}${j}`} p={[x, 3.19, z]} s={[1.7, 0.04, 0.5]} c={col} basic />)),
  );
  return <group>{panels}</group>;
};

const Classroom: FC<{ f: number; env: Env }> = ({ f, env }) => {
  const fl = flashAt(f);
  const board = new THREE.Color(0.04 + 0.96 * fl, 0.09 + 0.91 * fl, 0.33 + 0.67 * fl).getStyle();
  const lum = Math.max(env.lights, Math.min(1, env.sunI / 2.0));
  const [cx, cz] = chairPos(f);
  return (
    <group>
      <Box p={[-6.75, -0.05, -19.5]} s={[10.5, 0.1, 13]} c="#0a1670" />
      <Box p={[-6.75, 3.25, -19.5]} s={[10.5, 0.1, 13]} c="#0b1a6a" basic />
      <Box p={[-12.05, 1.6, -19.5]} s={[0.1, 3.2, 13]} c="#0f2a8f" />
      <Box p={[-6.75, 1.6, -13.05]} s={[10.5, 3.2, 0.1]} c="#0d2386" />
      <Windows env={env} />
      <Ceiling env={env} />
      {/* tábla */}
      <Box p={[-11.97, 1.75, -19.5]} s={[0.04, 1.9, 4.3]} c="#0a1148" />
      <mesh position={[-11.93, 1.75, -19.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.1, 1.7]} />
        <meshBasicMaterial color={board} />
      </mesh>
      <Desks />
      <Chair x={cx} z={cz} />
      <Students f={f} />
      <Projector f={f} />
      <Smoke f={f} lum={lum} />
      <Sunlight env={env} />
      {/* fénykúp a projektortól a tábláig */}
      <mesh position={[-9.3, 1.9, -19.5]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[1.9, 5.4, 28, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5 * fl} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight position={[-6.6, 2.3, -19.5]} intensity={46 * fl} distance={13} color="#ffffff" />
      <pointLight position={[-6.0, 2.8, -25.0]} intensity={3.2 * (1 - 0.6 * env.lights)} distance={12} color="#5f8cff" />
      {/* mennyezeti lámpák fénye */}
      {[
        [-4.5, -17.5],
        [-4.5, -21.5],
        [-8.6, -17.5],
        [-8.6, -21.5],
      ].map(([x, z], i) => (
        <pointLight key={i} position={[x, 2.9, z]} intensity={19 * env.lights} distance={9} decay={1.4} color="#eaf4ff" />
      ))}
    </group>
  );
};

export const World: FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const env = envAt(f);
  const c = camAt(f);
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 72, near: 0.05, far: 60, position: [0, 1.6, 8] }}>
      <color attach="background" args={[D.void]} />
      <fog attach="fog" args={[D.void, 4, 26]} />
      <ambientLight intensity={env.ambI} color={env.ambC} />
      <directionalLight position={env.sunPos} intensity={env.sunI} color={env.sunC} />
      <directionalLight position={env.moonPos} intensity={env.moonI} color="#8fb0ff" />
      <pointLight position={[c.x, c.y + 0.4, c.z]} intensity={env.head} distance={11} decay={1.5} color="#a9c4ff" />
      {/* az ajtón kiszűrődő fény */}
      <pointLight position={[-2.6, 1.8, -19.2]} intensity={f > 172 && f < T.enter + 120 ? 7 : 0} distance={8} color="#bcd4ff" />
      <CameraRig f={f} />
      <Corridor f={f} />
      <Door f={f} />
      <Classroom f={f} env={env} />
    </ThreeCanvas>
  );
};
export { easeOut };
