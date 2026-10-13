// Voxel "assetek": londoni utca, belső terek, álomvilágok elemei. Minden koordináta méterben.
import { shade, mix } from './voxel.js';

export const PAL = {
  brickA: 0x6b3329, brickB: 0x4f2a2a, brickC: 0x5a4a44, stone: 0x77706a, stoneDark: 0x3d3a3a,
  soot: 0x2a2526, trim: 0xb9b2a4, glassDark: 0x0e1424, warm: 0xffb45a, warm2: 0xffd08a, cold: 0x8fc4ff,
  iron: 0x15161b, red: 0xb3121f, redDark: 0x7d0c16, green: 0x1f4a3a, navy: 0x1a2340,
  cobble: 0x2c3140, cobble2: 0x343a4b, pave: 0x4c4e57, asphalt: 0x1b1d24, wood: 0x5a3a24, woodDark: 0x3a2516,
  paper: 0xd9cfb4, cork: 0x9a6b3f, gold: 0xd9a540, white: 0xe8e4da,
};

// ---------------- talaj ----------------
export function ground(b, x0, x1, z0, z1, kind = 'cobble') {
  const X0 = b.m(x0), X1 = b.m(x1), Z0 = b.m(z0), Z1 = b.m(z1);
  if (kind === 'cobble') b.tiles(X0, Z0, X1, Z1, -1, 1, 2, b.pick([PAL.cobble, PAL.cobble2, shade(PAL.cobble, .8), shade(PAL.cobble2, 1.15)]), 'wet');
  else if (kind === 'pave') b.tiles(X0, Z0, X1, Z1, -1, 1, 4, b.pick([PAL.pave, shade(PAL.pave, .9), shade(PAL.pave, 1.08)]), 'wet', 0);
  else if (kind === 'road') {
    b.slab(X0, -1, Z0, X1 - X0, 1, Z1 - Z0, PAL.asphalt, 'wet');
    const zc = Math.round((Z0 + Z1) / 2);
    for (let x = X0; x < X1; x += 8) b.slab(x, 0, zc, 4, 0.08, 1, 0xb8b3a0, 'wet');
  }
  else if (kind === 'wood') b.tiles(X0, Z0, X1, Z1, -1, 1, 1, (x, y, z) => shade(PAL.wood, (x % 4 === 0 ? .78 : 1) * (1 + ((z * 7 + (x >> 2) * 13) % 5 - 2) * .04)), 'std');
  else if (kind === 'tileBW') b.tiles(X0, Z0, X1, Z1, -1, 1, 2, (x, y, z) => ((x >> 1) + (z >> 1)) % 2 ? 0x1c1c22 : 0xcfcbc0, 'wet');
  else if (kind === 'hospital') b.tiles(X0, Z0, X1, Z1, -1, 1, 4, b.pick([0x9fb3b0, 0xa7bab6, 0x98aca9]), 'wet');
  else if (kind === 'grass') b.tiles(X0, Z0, X1, Z1, -1, 1, 1, b.pick([0x2f4a2a, 0x36552f, 0x2a4226, 0x3b5a31]), 'std');
  else if (kind === 'carpet') b.tiles(X0, Z0, X1, Z1, -1, 1, 2, b.pick([0x5a1620, 0x641a24, 0x521219]), 'soft');
  else if (kind === 'stage') b.tiles(X0, Z0, X1, Z1, -1, 1, 1, (x) => shade(0x3a2618, x % 6 === 0 ? .7 : 1 + ((x * 31) % 7 - 3) * .02), 'wet');
  else if (kind === 'platform') b.tiles(X0, Z0, X1, Z1, -1, 1, 2, b.pick([0x3a3f48, 0x353a42, 0x40454f]), 'wet');
  else b.slab(X0, -1, Z0, X1 - X0, 1, Z1 - Z0, kind, 'std');
}

// macskakő-pocsolya: sötét, nagyon fényes folt
export function puddle(b, x, z, w = 1.5, d = .8) {
  b.slab(b.m(x - w / 2), 0, b.m(z - d / 2), b.m(w), 0.12, b.m(d), 0x0a0d16, 'wet');
}

// ---------------- épület homlokzat ----------------
// opts: x0,x1, zf (homlokzat síkja), h (magasság m), wall (szín), floors, winCols, lit (0..1), shop {color, glow, sign}
export function building(b, o) {
  const X0 = b.m(o.x0), X1 = b.m(o.x1), ZF = b.m(o.zf), H = b.m(o.h), D = b.m(o.depth ?? 3);
  const W = X1 - X0;
  const wall = o.wall ?? PAL.brickA;
  const floorH = 12;
  const groundH = o.groundH ?? 14;
  const z = ZF - 1;
  const brick = (x, y) => {
    const row = y % 2, bx = Math.floor((x + row) / 2);
    const n = ((bx * 73856093) ^ (y * 19349663)) >>> 0;
    let f = 0.86 + (n % 100) / 100 * 0.24;
    if (y > H - 6) f *= 0.82; // korom a tetőnél
    return shade(wall, f);
  };
  // test (mögötte egy tömb)
  b.slab(X0, 0, ZF - D, W, H, D - 1, shade(wall, .5));
  // homlokzat voxelekben, ablakok kihagyásával
  const winW = o.winW ?? 4, winH = o.winH ?? 7;
  const cols = o.winCols ?? Math.max(1, Math.floor(W / 8));
  const holes = new Set();
  const wins = [];
  const floors = Math.floor((H - groundH) / floorH);
  for (let f = 0; f < floors; f++) {
    const y0 = groundH + f * floorH + 3;
    for (let c = 0; c < cols; c++) {
      const cx = X0 + Math.round((c + .5) * W / cols - winW / 2);
      wins.push({ x: cx, y: y0, f, c });
      for (let i = 0; i < winW; i++) for (let j = 0; j < winH; j++) holes.add((cx + i) + ',' + (y0 + j));
    }
  }
  // földszint: üzlet vagy ajtó
  const shop = o.shop;
  if (shop) {
    const sx0 = X0 + 2, sx1 = X1 - 2;
    for (let x = sx0; x < sx1; x++) for (let y = 1; y < groundH - 4; y++) holes.add(x + ',' + y);
  }
  if (o.door) {
    const dx = b.m(o.door.x) - 2;
    for (let x = dx; x < dx + 4; x++) for (let y = 0; y < 9; y++) holes.add(x + ',' + y);
  }
  for (let x = X0; x < X1; x++) for (let y = 0; y < H; y++) {
    if (holes.has(x + ',' + y)) continue;
    b.v(x, y, z, brick(x, y));
  }
  // párkány a földszint felett és tetőpárkány
  const trim = o.trim ?? PAL.trim;
  if (!o.shop) b.box(X0 - 1, groundH - 2, z + 1, W + 2, 1, 1, b.jit(trim, .05));
  b.box(X0 - 1, H, z - 1, W + 2, 1, 3, b.jit(shade(trim, .8), .05));
  b.box(X0, H + 1, ZF - D, W, 1, D, shade(wall, .45));
  if (o.chimney !== false) {
    const cx = X0 + 3 + Math.floor(b.rand() * Math.max(1, W - 8));
    b.box(cx, H + 1, ZF - D + 2, 4, 5, 3, b.jit(PAL.brickB, .1));
    b.glow(cx + 1, H + 6, ZF - D + 3, 2, 1, 1, 0x331a10, 1);
  }
  // ablakok
  const lit = o.lit ?? 0.45;
  for (const w of wins) {
    const isLit = o.litFn ? o.litFn(w) : b.rand() < lit;
    const warm = b.rand() < 0.75 ? PAL.warm : PAL.warm2;
    for (let i = 0; i < winW; i++) for (let j = 0; j < winH; j++) {
      const edge = i === 0 || i === winW - 1 || j === winH - 1;
      if (edge) { b.v(w.x + i, w.y + j, z - 1, shade(trim, .9)); continue; }
      if (isLit) {
        const curtain = (i === 1 || i === winW - 2) && b.rand() < 0.8;
        if (curtain) b.v(w.x + i, w.y + j, z - 1, shade(o.curtain ?? 0x6a2a2a, .9));
        else b.glow(w.x + i, w.y + j, z - 1, 1, 1, 1, warm, o.dayMode ? .9 : 2.2 + b.rand() * .8);
      } else b.v(w.x + i, w.y + j, z - 1, PAL.glassDark, 'wet');
    }
    // párkány
    b.box(w.x - 1, w.y - 1, z + 1, winW + 2, 1, 1, b.jit(trim, .05));
  }
  if (shop) {
    const sx0 = X0 + 2, sx1 = X1 - 2;
    // keret
    b.box(sx0 - 1, 0, z + 1, 1, groundH - 3, 1, shade(shop.color, .8));
    b.box(sx1, 0, z + 1, 1, groundH - 3, 1, shade(shop.color, .8));
    b.box(sx0, groundH - 4, z + 1, sx1 - sx0, 1, 1, shade(shop.color, .8));
    b.box(sx0, 0, z + 1, sx1 - sx0, 1, 1, shade(shop.color, .7));
    // kirakat
    const dx = shop.doorX != null ? b.m(shop.doorX) - 2 : -999;
    for (let x = sx0; x < sx1; x++) for (let y = 1; y < groundH - 4; y++) {
      if (x >= dx && x < dx + 4) { b.v(x, y, z - 2, y < 9 ? shade(shop.color, .55) : PAL.glassDark); continue; }
      if (y === 5 || (x - sx0) % 6 === 5) { b.v(x, y, z - 1, shade(shop.color, .7)); continue; }
      if (shop.glow) b.glow(x, y, z - 2, 1, 1, 1, shop.glow, o.dayMode ? 0.8 : (shop.k ?? 1.6));
      else b.v(x, y, z - 1, PAL.glassDark, 'wet');
    }
    // cégtábla
    b.box(sx0 - 1, groundH - 3, z + 1, sx1 - sx0 + 2, 3, 1, shade(shop.color, 1));
    o.signY = (groundH - 1.5) * 0.25;
  }
  if (o.door) {
    const dx = b.m(o.door.x) - 2;
    for (let x = dx; x < dx + 4; x++) for (let y = 0; y < 9; y++) b.v(x, y, z - 1, y === 8 || x === dx || x === dx + 3 ? shade(trim, .8) : (o.door.color ?? PAL.green));
    b.glow(dx + 1, 9, z + 1, 2, 1, 1, PAL.warm, o.dayMode ? .6 : 2.5);
    b.box(dx - 1, 0, z + 1, 6, 1, 1, PAL.stone);
  }
  b.collide(o.x0, o.zf - (o.depth ?? 3), o.x1, o.zf);
  return { wins };
}

// ---------------- utcabútor ----------------
export function lamp(b, x, z, { lit = true, light = true, color = PAL.warm, intensity = 26, h = 3.4, dist = 11 } = {}) {
  const X = b.m(x), Z = b.m(z), H = b.m(h);
  b.box(X - 1, 0, Z - 1, 3, 2, 3, PAL.iron);
  b.box(X, 2, Z, 1, H - 2, 1, PAL.iron);
  b.box(X - 1, H - 3, Z, 3, 1, 1, PAL.iron);
  // lámpás
  b.box(X - 1, H, Z - 1, 3, 1, 3, PAL.iron);
  if (lit) b.glow(X - 1, H + 1, Z - 1, 3, 3, 3, color, 2.6);
  else b.box(X - 1, H + 1, Z - 1, 3, 3, 3, 0x2b2e38, 'wet');
  b.box(X - 1, H + 4, Z - 1, 3, 1, 3, PAL.iron);
  b.v(X, H + 5, Z, PAL.iron);
  if (lit && light) b.light(x + .12, h + .7, z + .12, color, intensity, dist, 0.04);
  if (lit) (b.marks.streaks ||= []).push({ x: x + .12, z: z + .4, color, len: 3.2 });
  b.collide(x - .3, z - .3, x + .45, z + .45);
}

export function phoneBox(b, x, z, { dayMode = false } = {}) {
  const X = b.m(x) - 2, Z = b.m(z) - 2;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 10; j++) for (let k = 0; k < 4; k++) {
    if (i > 0 && i < 3 && k > 0 && k < 3 && j < 9) continue;
    const pane = (k === 3 || i === 0 || i === 3) && j > 2 && j < 8 && (i === 1 || i === 2 || k === 1 || k === 2);
    if (pane) b.glow(X + i, j, Z + k, 1, 1, 1, 0xfff1c9, dayMode ? .7 : 1.6);
    else b.v(X + i, j, Z + k, j === 9 ? PAL.redDark : PAL.red, 'wet');
  }
  b.glow(X, 8, Z + 4, 4, 1, 0.2, 0xfff6e0, dayMode ? 1 : 2.2);
  b.box(X, 10, Z, 4, 1, 4, PAL.redDark, 'wet');
  b.collide(x - .5, z - .5, x + .5, z + .5);
}

export function postbox(b, x, z) {
  const X = b.m(x) - 1, Z = b.m(z) - 1;
  b.box(X, 0, Z, 3, 5, 3, PAL.red, 'wet');
  b.box(X, 5, Z, 3, 1, 3, PAL.redDark, 'wet');
  b.v(X + 1, 4, Z + 3, 0x111111);
  b.collide(x - .35, z - .35, x + .45, z + .45);
}

export function bollard(b, x, z) { const X = b.m(x), Z = b.m(z); b.box(X, 0, Z, 1, 4, 1, PAL.iron, 'wet'); b.v(X, 3, Z, PAL.gold); }

export function bench(b, x, z, { rot = 0 } = {}) {
  const X = b.m(x) - 3, Z = b.m(z);
  b.box(X, 0, Z, 1, 2, 1, PAL.iron); b.box(X + 5, 0, Z, 1, 2, 1, PAL.iron);
  b.box(X, 2, Z - 1, 6, 1, 2, b.jit(PAL.wood, .08));
  b.box(X, 3, Z - 1, 6, 2, 1, b.jit(PAL.woodDark, .08));
  b.collide(x - .75, z - .3, x + .75, z + .3);
}

export function bin(b, x, z) { const X = b.m(x) - 1, Z = b.m(z) - 1; b.box(X, 0, Z, 2, 4, 2, 0x22303a, 'wet'); b.box(X, 4, Z, 2, 1, 2, 0x1a242c); b.collide(x - .3, z - .3, x + .3, z + .3); }

export function railing(b, x0, x1, z, h = 4) {
  const X0 = b.m(x0), X1 = b.m(x1), Z = b.m(z);
  for (let x = X0; x < X1; x++) {
    if ((x - X0) % 2 === 0) b.box(x, 0, Z, 1, h, 1, PAL.iron);
    if ((x - X0) % 2 === 0) b.v(x, h, Z, PAL.gold);
  }
  b.box(X0, h - 1, Z, X1 - X0, 1, 1, PAL.iron);
  b.collide(x0, z - .15, x1, z + .35);
}

export function cab(b, x, z, { dayMode = false, flip = false } = {}) {
  const X = b.m(x) - 9, Z = b.m(z) - 3;
  const body = 0x15171e;
  for (let i = 0; i < 18; i++) {
    const front = flip ? i < 4 : i > 13, back = flip ? i > 14 : i < 3;
    const top = front ? 4 : back ? 5 : 7;
    for (let j = 1; j < top; j++) for (let k = 0; k < 6; k++) {
      const win = j >= 5 && j <= 6 && (k === 0 || k === 5) && i > 3 && i < 14 && i !== 9;
      const ws = j >= 5 && ((flip ? i === 4 : i === 13) || (flip ? i === 14 : i === 3)) && k > 0 && k < 5;
      if (win || ws) b.v(X + i, j, Z + k, 0x1d2840, 'wet');
      else if (j > 1 && k > 0 && k < 5 && i > 0 && i < 17 && j < top - 1) continue;
      else b.v(X + i, j, Z + k, j === 1 ? 0x050507 : body, 'wet');
    }
  }
  // kerekek
  for (const wi of [3, 13]) for (const k of [-0.2, 5.2]) b.box(X + wi - 1, 0, Z + Math.round(k), 3, 2, 1, 0x070708);
  // fényszórók, TAXI tábla
  const fx = flip ? X : X + 17;
  b.glow(fx, 2, Z + 1, 1, 1, 1, 0xfff4d6, dayMode ? 1 : 4); b.glow(fx, 2, Z + 4, 1, 1, 1, 0xfff4d6, dayMode ? 1 : 4);
  const rx = flip ? X + 17 : X;
  b.glow(rx, 2, Z + 1, 1, 1, 1, 0xff2020, 2.5); b.glow(rx, 2, Z + 4, 1, 1, 1, 0xff2020, 2.5);
  b.glow(X + 8, 7, Z + 2, 2, 1, 2, 0xffa830, dayMode ? 1.4 : 4);
  b.collide(x - 2.3, z - .8, x + 2.3, z + .8);
}

export function bus(b, x, z, { dayMode = false } = {}) {
  const X = b.m(x) - 22, Z = b.m(z) - 5, L = 44, Wd = 10, Hh = 18;
  for (let i = 0; i < L; i++) for (let j = 1; j < Hh; j++) for (let k = 0; k < Wd; k++) {
    const shell = i === 0 || i === L - 1 || k === 0 || k === Wd - 1 || j === 1 || j === Hh - 1;
    if (!shell) continue;
    const winRow = (j >= 6 && j <= 8) || (j >= 13 && j <= 15);
    const isWin = winRow && (i % 6 !== 0) && (k === Wd - 1 || k === 0 || i === L - 1);
    if (isWin) b.glow(X + i, j, Z + k, 1, 1, 1, 0xffe0a8, dayMode ? .6 : 1.4);
    else b.v(X + i, j, Z + k, j === 10 || j === 11 ? 0xd9d2c0 : (j < 3 ? 0x2a0a0d : PAL.red), 'wet');
  }
  for (const wi of [6, 36]) for (const k of [-1, Wd]) b.box(X + wi - 2, 0, Z + k, 4, 3, 1, 0x070708);
  b.glow(X + L - 1, 3, Z + 1, 1, 1, 1, 0xfff4d6, dayMode ? 1 : 4); b.glow(X + L - 1, 3, Z + Wd - 2, 1, 1, 1, 0xfff4d6, dayMode ? 1 : 4);
  b.collide(x - 5.5, z - 1.25, x + 5.5, z + 1.25);
}

export function awning(b, x0, x1, zf, y, c1, c2) {
  const X0 = b.m(x0), X1 = b.m(x1), Z = b.m(zf), Y = b.m(y);
  for (let x = X0; x < X1; x++) for (let k = 0; k < 6; k++) b.v(x, Y - (k >> 1), Z + k, Math.floor((x - X0) / 2) % 2 ? c1 : c2);
  for (let x = X0; x < X1; x++) b.v(x, Y - 3, Z + 6, (x % 2) ? c1 : shade(c2, .8));
}

export function flowerStand(b, x, z) {
  const X = b.m(x) - 4, Z = b.m(z) - 2;
  b.box(X, 0, Z, 8, 3, 4, b.jit(PAL.woodDark, .1));
  const fl = [0xd8233a, 0xf0c419, 0xe96fa5, 0xf5f0e6, 0x9a4fd1, 0xff7a2f];
  for (let i = 0; i < 8; i += 2) for (let k = 0; k < 4; k += 2) {
    b.box(X + i, 3, Z + k, 2, 1, 2, 0x5d6b78, 'wet');
    const c = fl[(i * 3 + k * 5) % fl.length];
    b.box(X + i, 4, Z + k, 2, 2, 2, (xx, yy, zz, r) => r() < .3 ? 0x2c5a2c : shade(c, .85 + r() * .3));
  }
  b.collide(x - 1, z - .5, x + 1, z + .5);
}

export function crate(b, x, z, n = 1) { const X = b.m(x) - 2, Z = b.m(z) - 2; for (let s = 0; s < n; s++) b.box(X, s * 4, Z, 4, 4, 4, (xx, yy, zz, r) => (yy % 4 === 0 || yy % 4 === 3) ? PAL.woodDark : shade(PAL.wood, .85 + r() * .25)); b.collide(x - .5, z - .5, x + .5, z + .5); }

export function tree(b, x, z, { leaves = 0x2f4d2b, bare = false, h = 4.5 } = {}) {
  const X = b.m(x), Z = b.m(z), H = b.m(h);
  b.box(X - 1, 0, Z - 1, 2, H, 2, b.jit(0x3b2a1e, .1));
  if (bare) {
    for (let i = 0; i < 9; i++) { const a = i * 2.3, l = 3 + (i % 3) * 2; for (let s = 0; s < l; s++) b.v(X + Math.round(Math.cos(a) * s * .7), H - 6 + i + Math.round(s * .6), Z + Math.round(Math.sin(a) * s * .5), 0x2e2219); }
  } else {
    const R = 6;
    for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) for (let k = -R; k <= R; k++) {
      const d = i * i + j * j * 1.4 + k * k;
      if (d > R * R || d < (R - 2) * (R - 2)) continue;
      if (b.rand() < .18) continue;
      b.v(X + i, H + j + 2, Z + k, shade(leaves, .75 + b.rand() * .5));
    }
  }
  b.collide(x - .35, z - .35, x + .35, z + .35);
}

// szöveges cégtábla (canvas textúra a világban)
export function sign(b, x, y, z, w, h, text, { color = '#ffd27a', bg = '#140d08', glow = 1.8, font = 'Anton', border = '#d9a540', ry = 0, size } = {}) {
  (b.marks.signs ||= []).push({ x, y, z, w, h, text, color, bg, glow, font, border, ry, size });
}

export function poster(b, x, y, z, w, h, kind, opts = {}) { (b.marks.posters ||= []).push({ x, y, z, w, h, kind, ...opts }); }

// ---------------- háttér ----------------
export function bigBen(b, x, z, { clock = 0xfff1c4, k = 3.2, dark = 0x2a2c38 } = {}) {
  const X = b.m(x), Z = b.m(z);
  const s = 2; // két voxel egy "tégla"
  const col = (xx, yy) => shade(dark, .85 + ((xx * 7 + yy * 13) % 5) * .05);
  b.slab(X - 8 * s, 0, Z - 8 * s, 16 * s, 150, 16 * s, dark);
  for (let y = 0; y < 150; y += 12) b.slab(X - 8 * s - 1, y, Z + 8 * s - 1, 16 * s + 2, 2, 2, shade(dark, 1.25));
  // óralap mindkét oldalon
  b.slab(X - 9 * s, 150, Z - 9 * s, 18 * s, 30, 18 * s, shade(dark, 1.1));
  const R = 13;
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) {
    const d = Math.sqrt(i * i + j * j);
    if (d > R) continue;
    const ring = d > R - 2;
    if (ring) b.glow(X + i, 165 + j, Z + 9 * s, 1, 1, 1, mix(clock, 0xffa040, .4), k * .8);
    else b.glow(X + i, 165 + j, Z + 9 * s, 1, 1, 1, clock, k * (0.75 + .25 * ((i + j) & 1)));
  }
  // mutatók (13 felé…)
  for (let t = 0; t < 9; t++) b.v(X, 165 + t, Z + 9 * s + 1, 0x111111);
  for (let t = 0; t < 6; t++) b.v(X + Math.round(t * .5), 165 + Math.round(t * .85), Z + 9 * s + 1, 0x111111);
  b.slab(X - 7 * s, 180, Z - 7 * s, 14 * s, 14, 14 * s, dark);
  for (let l = 0; l < 26; l++) { const w = Math.max(1, 12 - Math.floor(l / 2)); b.slab(X - w, 194 + l, Z - w, w * 2, 1, w * 2, shade(dark, .9)); }
  b.glow(X - 1, 220, Z - 1, 2, 3, 2, 0xffd27a, 2);
}

export function skyline(b, x0, x1, z, { col = 0x161a2a, lit = 0.12, minH = 10, maxH = 26, seedOff = 0, dayMode = false } = {}) {
  let x = b.m(x0);
  const X1 = b.m(x1), Z = b.m(z);
  while (x < X1) {
    const w = 10 + Math.floor(b.rand() * 18), h = b.m(minH) + Math.floor(b.rand() * b.m(maxH - minH));
    b.slab(x, 0, Z - 12, w, h, 12, shade(col, .85 + b.rand() * .3));
    for (let wy = 6; wy < h - 4; wy += 5) for (let wx = x + 2; wx < x + w - 2; wx += 3) if (b.rand() < lit) b.glow(wx, wy, Z, 1, 2, .2, b.rand() < .8 ? PAL.warm : PAL.cold, dayMode ? .4 : 1.6);
    if (b.rand() < .4) b.slab(x + 2, h, Z - 8, 2, 4, 2, shade(col, .8));
    x += w + Math.floor(b.rand() * 3);
  }
}

// ---------------- belső terek ----------------
// "babaház" szoba: hátsó fal + két oldalfal, elöl nyitott
export function room(b, x0, x1, z0, z1, h, { wall = 0x3b3f52, wainscot = 0x2a1c14, floor = 'wood', sideH = null } = {}) {
  ground(b, x0, x1, z0, z1, floor);
  const X0 = b.m(x0), X1 = b.m(x1), Z0 = b.m(z0), Z1 = b.m(z1), H = b.m(h);
  const wc = (x, y) => y < 4 ? shade(wainscot, .9 + ((x * 13) % 5) * .04) : y === 4 ? shade(wainscot, 1.3) : shade(wall, .92 + ((x * 7 + y * 3) % 5) * .03);
  for (let x = X0 - 1; x <= X1; x++) for (let y = 0; y < H; y++) b.v(x, y, Z0 - 1, wc(x, y));
  const SH = sideH != null ? b.m(sideH) : H;
  for (let z = Z0; z < Z1; z++) for (let y = 0; y < SH; y++) { b.v(X0 - 1, y, z, wc(z, y)); b.v(X1, y, z, wc(z, y)); }
  b.box(X0 - 1, H, Z0 - 1, X1 - X0 + 2, 1, 2, shade(wall, .6));
  b.collide(x0 - 1, z0 - 1, x1 + 1, z0 + .05);
  b.collide(x0 - 1, z0 - 1, x0 + .05, z1);
  b.collide(x1 - .05, z0 - 1, x1 + 1, z1);
}

// ablak a hátsó falon, mögötte éjszakai város + eső
export function backWindow(b, x, y, zWall, w, h, { night = true, sky = 0x101830, frame = 0x2a1c14, k = 1 } = {}) {
  const X = b.m(x), Y = b.m(y), Z = b.m(zWall) - 1, W = b.m(w), H = b.m(h);
  b.carve(X, Y, Z, X + W, Y + H, Z + 1);
  for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) {
    const edge = i === 0 || j === 0 || i === W - 1 || j === H - 1 || i === Math.floor(W / 2) || j === Math.floor(H / 2);
    if (edge) b.v(X + i, Y + j, Z, frame);
    else {
      const lit = night && ((i * 7 + j * 13) % 11 === 0);
      if (lit) b.glow(X + i, Y + j, Z - 1, 1, 1, 1, PAL.warm, 1.2 * k);
      else b.glow(X + i, Y + j, Z - 1, 1, 1, 1, sky, (night ? 1 : 1.3) * k);
    }
  }
}

export function desk(b, x, z, { w = 2.2, col = PAL.woodDark } = {}) {
  const X = b.m(x - w / 2), Z = b.m(z) - 2, W = b.m(w);
  b.box(X, 0, Z, 2, 3, 4, shade(col, .8)); b.box(X + W - 2, 0, Z, 2, 3, 4, shade(col, .8));
  b.box(X, 3, Z - 1, W, 1, 5, b.jit(col, .06));
  b.collide(x - w / 2, z - .55, x + w / 2, z + .55);
}
export function deskLamp(b, x, y, z, { color = 0x2f8a52, light = true } = {}) {
  const X = b.m(x), Y = b.m(y), Z = b.m(z);
  b.box(X, Y, Z, 1, 2, 1, PAL.gold);
  b.box(X - 1, Y + 2, Z - 1, 3, 1, 2, color, 'wet');
  b.glow(X - 1, Y + 1.6, Z, 3, .4, 1, 0xfff1c4, 1.8);
  if (light) b.light(x + .1, y + .45, z + .4, 0xffd9a0, 12, 8);
}
export function chair(b, x, z, { col = PAL.woodDark, back = -1 } = {}) {
  const X = b.m(x) - 1, Z = b.m(z) - 1;
  b.box(X, 0, Z, 1, 2, 1, col); b.box(X + 2, 0, Z, 1, 2, 1, col); b.box(X, 0, Z + 2, 1, 2, 1, col); b.box(X + 2, 0, Z + 2, 1, 2, 1, col);
  b.box(X, 2, Z, 3, 1, 3, shade(col, 1.2));
  b.box(X, 3, back < 0 ? Z : Z + 2, 3, 3, 1, col);
}
export function bookshelf(b, x, zWall, { w = 2, h = 2.8 } = {}) {
  const X = b.m(x - w / 2), Z = b.m(zWall), W = b.m(w), H = b.m(h);
  const bc = [0x6a1d1d, 0x1d3a6a, 0x2a5a32, 0x8a6a2a, 0x4a2a5a, 0x7a4a2a, 0x2a2a2a];
  b.box(X, 0, Z, W, H, 2, PAL.woodDark);
  for (let y = 1; y < H - 1; y++) {
    if (y % 3 === 0) continue;
    for (let i = 1; i < W - 1; i++) if (b.rand() < .85) b.v(X + i, y, Z + 2, bc[(b.rand() * bc.length) | 0]);
  }
  b.collide(x - w / 2, zWall, x + w / 2, zWall + .55);
}
export function corkBoard(b, x, y, zWall, w = 2.2, h = 1.4) {
  const X = b.m(x - w / 2), Y = b.m(y), Z = b.m(zWall), W = b.m(w), H = b.m(h);
  for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) b.v(X + i, Y + j, Z, (i === 0 || j === 0 || i === W - 1 || j === H - 1) ? PAL.woodDark : shade(PAL.cork, .85 + b.rand() * .25));
  for (let n = 0; n < 7; n++) { const px = X + 1 + ((b.rand() * (W - 3)) | 0), py = Y + 1 + ((b.rand() * (H - 3)) | 0); b.box(px, py, Z + 1, 2, 2, 1, n % 3 ? PAL.paper : 0xe8e0c8); b.glow(px, py + 1, Z + 1.6, .5, .5, .5, 0xff2030, 1.1); }
  (b.marks.strings ||= []).push({ x, y: y + h / 2, z: zWall + .3, w, h });
}
export function coatRack(b, x, z) { const X = b.m(x), Z = b.m(z); b.box(X, 0, Z, 1, 8, 1, PAL.woodDark); b.box(X - 1, 7, Z, 3, 1, 1, PAL.woodDark); b.box(X - 1, 3, Z + 1, 3, 4, 1, 0x3b3226); b.v(X, 9, Z, 0x23252e); b.box(X - 1, 8, Z - 1, 3, 1, 3, 0x23252e); }
export function bed(b, x, z, { col = 0x6a2a2a, w = 1.2, l = 2.2 } = {}) {
  const X = b.m(x - w / 2), Z = b.m(z - l / 2), W = b.m(w), L = b.m(l);
  b.box(X, 0, Z, W, 2, L, PAL.woodDark);
  b.box(X, 2, Z, W, 1, L, b.jit(col, .05), 'soft');
  b.box(X + 1, 3, Z + 1, W - 2, 1, 2, 0xe8e4da, 'soft');
  b.box(X, 2, Z, W, 4, 1, PAL.woodDark);
  b.collide(x - w / 2, z - l / 2, x + w / 2, z + l / 2);
}
export function hospitalBed(b, x, z) {
  const X = b.m(x) - 3, Z = b.m(z) - 4;
  b.box(X, 0, Z, 1, 3, 1, 0x9aa3a8); b.box(X + 5, 0, Z, 1, 3, 1, 0x9aa3a8); b.box(X, 0, Z + 8, 1, 3, 1, 0x9aa3a8); b.box(X + 5, 0, Z + 8, 1, 3, 1, 0x9aa3a8);
  b.box(X, 3, Z, 6, 1, 9, 0xdfe6ea, 'soft');
  b.box(X + 1, 4, Z + 2, 4, 1, 7, 0xb9cde0, 'soft');
  b.box(X + 1, 4, Z, 4, 1, 2, 0xffffff, 'soft');
  b.box(X, 3, Z - 1, 6, 4, 1, 0x9aa3a8);
  b.collide(x - .75, z - 1.1, x + .75, z + 1.2);
}
export function monitor(b, x, z) {
  const X = b.m(x), Z = b.m(z);
  b.box(X, 0, Z, 1, 6, 1, 0x7a8288);
  b.box(X - 1, 6, Z, 3, 3, 1, 0x20262c);
  b.glow(X - 1, 7, Z + 1, 3, 1, .2, 0x40ff90, 3);
  b.collide(x - .2, z - .2, x + .3, z + .3);
}
export function plant(b, x, z, h = 4) { const X = b.m(x), Z = b.m(z); b.box(X - 1, 0, Z - 1, 2, 2, 2, 0x6a3a2a); for (let i = 0; i < 14; i++) b.v(X - 1 + ((i * 7) % 3), 2 + (i % h), Z - 1 + ((i * 5) % 3), shade(0x2f5a2a, .8 + (i % 4) * .1)); }
export function rug(b, x0, x1, z0, z1, c) { const X0 = b.m(x0), X1 = b.m(x1), Z0 = b.m(z0), Z1 = b.m(z1); b.tiles(X0, Z0, X1, Z1, 0, .3, 1, (x, y, z) => (x === X0 || z === Z0 || x === X1 - 1 || z === Z1 - 1 ? shade(c, 1.5) : (x + z) % 6 === 0 ? shade(c, 1.15) : c), 'soft'); }
export function mirrorBulbs(b, x, y, zWall, w = 1.4, h = 1.2) {
  const X = b.m(x - w / 2), Y = b.m(y), Z = b.m(zWall), W = b.m(w), H = b.m(h);
  for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) {
    const edge = i === 0 || j === 0 || i === W - 1 || j === H - 1;
    if (edge && (i + j) % 2 === 0) b.glow(X + i, Y + j, Z, 1, 1, 1, 0xfff0c8, 4);
    else if (edge) b.v(X + i, Y + j, Z, PAL.gold);
    else b.v(X + i, Y + j, Z, 0x8fa3b8, 'wet');
  }
}
export function clothesRack(b, x, z, w = 2) {
  const X = b.m(x - w / 2), Z = b.m(z), W = b.m(w);
  b.box(X, 0, Z, 1, 7, 1, PAL.iron); b.box(X + W - 1, 0, Z, 1, 7, 1, PAL.iron); b.box(X, 7, Z, W, 1, 1, PAL.iron);
  const cs = [0x7a0f2a, 0x101018, 0xd9a540, 0x2a3a7a, 0xe8e4da, 0x4a1a5a];
  for (let i = 1; i < W - 1; i += 1) { const c = cs[(i * 5) % cs.length]; b.box(X + i, 2 + (i % 2), Z - 1, 1, 5 - (i % 2), 3, c, 'soft'); }
  b.collide(x - w / 2, z - .3, x + w / 2, z + .4);
}
export function blackboard(b, x, y, zWall, w = 4, h = 1.6) {
  const X = b.m(x - w / 2), Y = b.m(y), Z = b.m(zWall), W = b.m(w), H = b.m(h);
  for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) b.v(X + i, Y + j, Z, (i === 0 || j === 0 || i === W - 1 || j === H - 1) ? PAL.wood : (b.rand() < .04 ? 0x9aa89a : 0x1e3a2c));
}
export function schoolDesk(b, x, z) { const X = b.m(x) - 2, Z = b.m(z) - 1; b.box(X, 0, Z, 1, 3, 1, PAL.iron); b.box(X + 3, 0, Z, 1, 3, 1, PAL.iron); b.box(X, 3, Z - 1, 4, 1, 3, b.jit(PAL.wood, .06)); b.collide(x - .5, z - .4, x + .5, z + .4); }

// ---------------- álom elemek ----------------
export function clockFace(b, x, y, z, r = 1.2, { k = 2.4, col = 0xe8f8ff, hands = 13 } = {}) {
  const X = b.m(x), Y = b.m(y), Z = b.m(z), R = b.m(r);
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) {
    const d = Math.sqrt(i * i + j * j);
    if (d > R) continue;
    if (d > R - 1.2) b.v(X + i, Y + j, Z, PAL.gold);
    else b.glow(X + i, Y + j, Z, 1, 1, 1, col, k);
  }
  const a = -(hands / 12) * Math.PI * 2 + Math.PI / 2;
  for (let t = 0; t < R - 1; t++) b.v(X + Math.round(Math.cos(a) * t), Y + Math.round(Math.sin(a) * t), Z + 1, 0x111111);
  for (let t = 0; t < R - 2; t++) b.v(X, Y + t, Z + 1, 0x111111);
}
export function train(b, x0, x1, z, { lit = 0x9ff5e6, body = 0x1c3b3a } = {}) {
  const X0 = b.m(x0), X1 = b.m(x1), Z = b.m(z) - 10;
  for (let x = X0; x < X1; x++) for (let y = 1; y < 14; y++) {
    const car = (x - X0) % 40;
    if (car === 39) continue;
    const win = y >= 6 && y <= 10 && car % 8 >= 2 && car % 8 <= 5;
    const door = car >= 17 && car <= 22 && y < 11;
    if (win) b.glow(x, y, Z + 9, 1, 1, 1, lit, 1.15);
    else if (door) b.v(x, y, Z + 9, y === 10 ? shade(body, 1.4) : shade(body, .7), 'wet');
    else b.v(x, y, Z + 9, y === 13 || y === 1 ? shade(body, .6) : (y === 4 ? 0xb9a046 : body), 'wet');
  }
  b.slab(X0, 1, Z, X1 - X0, 13, 9, shade(body, .5));
  b.slab(X0, 14, Z, X1 - X0, 2, 10, shade(body, .8));
  b.collide(x0, z - 2.6, x1, z + .1);
}
export function cage(b, x, z, r = 2.2, h = 5) {
  const X = b.m(x), Z = b.m(z), R = b.m(r), H = b.m(h);
  for (let a = 0; a < 18; a++) {
    const t = a / 18 * Math.PI * 2, cx = X + Math.round(Math.cos(t) * R), cz = Z + Math.round(Math.sin(t) * R);
    if (Math.sin(t) > 0.55 && Math.abs(Math.cos(t)) < 0.5) continue; // elöl nyitott, hogy látsszon, ki van bent
    for (let y = 0; y < H; y++) b.v(cx, y, cz, PAL.gold, 'wet');
  }
  for (let l = 0; l < 7; l++) { const rr = Math.max(1, R - l * 2); for (let a = 0; a < 28; a++) { const t = a / 28 * Math.PI * 2; b.v(X + Math.round(Math.cos(t) * rr), H + l, Z + Math.round(Math.sin(t) * rr), PAL.gold, 'wet'); } }
  b.glow(X, H + 7, Z, 1, 1, 1, 0xffe6a0, 4);
}
export function curtain(b, x0, x1, zf, h, col = 0x6a0a18) {
  const X0 = b.m(x0), X1 = b.m(x1), Z = b.m(zf), H = b.m(h);
  for (let x = X0; x < X1; x++) for (let y = 0; y < H; y++) b.v(x, y, Z + ((x % 3) === 0 ? 1 : 0), shade(col, (x % 3 === 0 ? 1.25 : .9) + (y > H - 3 ? -.2 : 0)), 'soft');
  b.box(X0, H - 3, Z + 1, X1 - X0, 3, 1, PAL.gold);
}
export function fence(b, x0, x1, z, col = 0xf0ece2) {
  const X0 = b.m(x0), X1 = b.m(x1), Z = b.m(z);
  for (let x = X0; x < X1; x++) { if ((x - X0) % 2 === 0) { b.box(x, 0, Z, 1, 4, 1, col); b.v(x, 4, Z, shade(col, .9)); } }
  b.box(X0, 2, Z, X1 - X0, 1, 1, col);
  b.collide(x0, z - .1, x1, z + .35);
}
export function longTable(b, x, z, w = 4) {
  const X = b.m(x - w / 2), Z = b.m(z) - 2, W = b.m(w);
  b.box(X, 3, Z, W, 1, 4, 0xf4efe6, 'soft');
  b.box(X + 1, 0, Z + 1, 1, 3, 1, PAL.wood); b.box(X + W - 2, 0, Z + 1, 1, 3, 1, PAL.wood);
  for (let i = 2; i < W - 2; i += 3) { b.box(X + i, 4, Z + 1, 1, 1, 1, 0xd9a540); b.glow(X + i, 5, Z + 1, 1, 1, 1, 0xffd08a, 3); }
  b.collide(x - w / 2, z - .5, x + w / 2, z + .5);
}
export function swing(b, x, z) { const X = b.m(x), Z = b.m(z); b.box(X - 4, 0, Z, 1, 10, 1, PAL.wood); b.box(X + 4, 0, Z, 1, 10, 1, PAL.wood); b.box(X - 4, 10, Z, 9, 1, 1, PAL.wood); for (let y = 3; y < 10; y++) { b.v(X - 2, y, Z, 0xcfc4a8); b.v(X + 2, y, Z, 0xcfc4a8); } b.box(X - 2, 2, Z - 1, 5, 1, 3, 0xd94a3a); }
export function billboard(b, x, y, zf, w, h, kind = 'lyra', opts = {}) {
  const X = b.m(x - w / 2), Y = b.m(y), Z = b.m(zf), W = b.m(w);
  b.box(X + 2, 0, Z - 1, 1, Y, 1, PAL.iron); b.box(X + W - 3, 0, Z - 1, 1, Y, 1, PAL.iron);
  poster(b, x, y + h / 2, zf + .02, w, h, kind, { glow: opts.glow ?? 2.2 });
}
export function spotlightRig(b, x, y, z) { const X = b.m(x), Y = b.m(y), Z = b.m(z); b.box(X - 1, Y, Z - 1, 3, 2, 3, PAL.iron); b.glow(X, Y - 1, Z, 1, 1, 1, 0xfff4d6, 5); }
