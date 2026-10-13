// Voxel-építő: dobozokból InstancedMesh-eket rak össze anyagonként.
import * as THREE from './three.js';

export const V = 0.25; // egy voxel élhossza méterben

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

const _c = new THREE.Color();
export function shade(hex, f) {
  _c.setHex(hex);
  const r = Math.min(255, Math.max(0, Math.round(((hex >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((hex >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((hex & 255) * f)));
  return (r << 16) | (g << 8) | b;
}
export function mix(a, b, t) {
  const r = ((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t;
  const g = ((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t;
  const bl = (a & 255) * (1 - t) + (b & 255) * t;
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(bl);
}
export function desat(hex, t) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const l = Math.round(r * .3 + g * .59 + b * .11);
  return mix(hex, (l << 16) | (l << 8) | l, t);
}

let _geo = null;
function boxGeo() {
  if (!_geo) { _geo = new THREE.BoxGeometry(1, 1, 1); }
  return _geo;
}

export class VoxelBuilder {
  constructor(seed = 7, { colorMap = null } = {}) {
    this.items = { std: [], wet: [], glow: [], soft: [] };
    this.rand = mulberry(seed);
    this.colorMap = colorMap; // pl. álomvilágban szürkítés
    this.lights = []; this.colliders = []; this.marks = {};
  }
  // ---- színsegédek ----
  jit(hex, amt = 0.08) { return () => shade(hex, 1 + (this.rand() * 2 - 1) * amt); }
  pick(list) { return () => list[(this.rand() * list.length) | 0]; }
  col(c, x, y, z) { let h = typeof c === 'function' ? c(x, y, z, this.rand) : c; if (this.colorMap) h = this.colorMap(h); return h; }

  // ---- voxel egységekben ----
  v(x, y, z, c, mat = 'std') { this.items[mat].push(x, y, z, 1, 1, 1, this.col(c, x, y, z), 1); }
  // rácsos doboz: csak a felszíni cellák kerülnek be
  box(x, y, z, w, h, d, c, mat = 'std') {
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) for (let k = 0; k < d; k++) {
      if (i > 0 && i < w - 1 && j > 0 && j < h - 1 && k > 0 && k < d - 1) continue;
      this.v(x + i, y + j, z + k, c, mat);
    }
  }
  // egyetlen nyújtott elem (nagy, egyszínű felületekhez)
  slab(x, y, z, w, h, d, c, mat = 'std') { this.items[mat].push(x, y, z, w, h, d, this.col(c, x, y, z), 1); }
  glow(x, y, z, w, h, d, hex, k = 3) { this.items.glow.push(x, y, z, w, h, d, this.colorMap ? this.colorMap(hex) : hex, k); }
  // csempézett sík (pl. macskakő): size voxelnyi lapok
  tiles(x0, z0, x1, z1, y, h, size, c, mat = 'wet', gap = 0) {
    for (let x = x0; x < x1; x += size) for (let z = z0; z < z1; z += size) {
      const w = Math.min(size, x1 - x) - gap, d = Math.min(size, z1 - z) - gap;
      if (w <= 0 || d <= 0) continue;
      this.items[mat].push(x, y, z, w, h, d, this.col(c, x, y, z), 1);
    }
  }
  // már lerakott voxelek kivágása (pl. ablaknyílás a falban)
  carve(x0, y0, z0, x1, y1, z1) {
    for (const key of ['std', 'wet', 'soft']) {
      const a = this.items[key], out = [];
      for (let i = 0; i < a.length; i += 8) {
        const x = a[i], y = a[i + 1], z = a[i + 2];
        if (a[i + 3] === 1 && a[i + 4] === 1 && a[i + 5] === 1 && x >= x0 && x < x1 && y >= y0 && y < y1 && z >= z0 && z < z1) continue;
        for (let k = 0; k < 8; k++) out.push(a[i + k]);
      }
      this.items[key] = out;
    }
  }
  // ---- méter-alapú segédek ----
  m(x) { return Math.round(x / V); }
  light(x, y, z, color, intensity = 30, distance = 12, flicker = 0) { this.lights.push({ x, y, z, color, intensity, distance, flicker }); }
  collide(x0, z0, x1, z1) { this.colliders.push({ x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1) }); }

  build({ shadows = true } = {}) {
    const group = new THREE.Group();
    const mats = {
      std: new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0.0 }),
      wet: new THREE.MeshStandardMaterial({ roughness: 0.16, metalness: 0.08 }),
      soft: new THREE.MeshStandardMaterial({ roughness: 1.0, metalness: 0.0 }),
      glow: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    };
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
    for (const key of Object.keys(this.items)) {
      const arr = this.items[key];
      const n = arr.length / 8;
      if (!n) continue;
      const mesh = new THREE.InstancedMesh(boxGeo(), mats[key], n);
      for (let i = 0; i < n; i++) {
        const o = i * 8;
        const [x, y, z, w, h, d, hex, k] = [arr[o], arr[o + 1], arr[o + 2], arr[o + 3], arr[o + 4], arr[o + 5], arr[o + 6], arr[o + 7]];
        p.set((x + w / 2) * V, (y + h / 2) * V, (z + d / 2) * V);
        s.set(w * V, h * V, d * V);
        m4.compose(p, q, s);
        mesh.setMatrixAt(i, m4);
        _c.setHex(hex);
        if (k !== 1) _c.multiplyScalar(k);
        mesh.setColorAt(i, _c);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
      if (key !== 'glow' && shadows) { mesh.castShadow = true; mesh.receiveShadow = true; }
      group.add(mesh);
    }
    return group;
  }
}
