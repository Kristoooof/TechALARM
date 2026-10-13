// Egy betöltött helyszín futásideje: 3D jelenet, szereplők, ütközés, kamera, interakciók.
import * as THREE from './three.js';
import { VoxelBuilder } from './voxel.js';
import { Rain, Motes } from './engine.js';
import { sheetTexture, setFrame, FW, FH, PX, BIG } from './sprites.js';

const tmpV = new THREE.Vector3();

function gradientTex(stops) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 64;
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 64);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  x.fillStyle = g; x.fillRect(0, 0, 4, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let blobTex = null;
function blob() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 31);
  g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(.6, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  blobTex = new THREE.CanvasTexture(c); return blobTex;
}

export class Actor {
  constructor(world, desc, x, z, { id = null, dir = 0, scale = 1, glow = null, aura = null } = {}) {
    glow = glow ?? world.env.spriteGlow ?? 0.3;
    this.world = world; this.id = id; this.desc = desc;
    this.x = x; this.z = z; this.dir = dir; this.frame = 0; this.t = Math.random() * 3; this.moving = false;
    this.tex = sheetTexture(desc);
    const w = FW * PX * scale, h = FH * PX * scale;
    const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
    this.mat = new THREE.MeshStandardMaterial({ map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95, metalness: 0, emissive: 0xffffff, emissiveMap: this.tex, emissiveIntensity: glow });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.position.set(x, 0.0, z);
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9 * scale, 0.45 * scale), new THREE.MeshBasicMaterial({ map: blob(), transparent: true, depthWrite: false, color: aura ?? 0x000000, blending: aura ? THREE.AdditiveBlending : THREE.NormalBlending }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(x, 0.015, z);
    if (aura) { this.shadow.material.color = new THREE.Color(aura).multiplyScalar(2); this.shadow.scale.set(1.6, 1.6, 1); }
    world.scene.add(this.mesh, this.shadow);
    setFrame(this.tex, this.dir, 0);
    this.h = h;
  }
  face(dx, dz) {
    if (Math.abs(dx) < 1e-4 && Math.abs(dz) < 1e-4) return;
    this.dir = Math.abs(dx) > Math.abs(dz) * 0.9 ? (dx > 0 ? 2 : 3) : (dz > 0 ? 0 : 1);
  }
  faceTo(x, z) { this.face(x - this.x, z - this.z); setFrame(this.tex, this.dir, 0); }
  update(dt, cam) {
    this.t += dt;
    if (this.moving) {
      this.frame = Math.floor(this.t * (this.running ? 10 : 7)) % 4;
    } else this.frame = 0;
    setFrame(this.tex, this.dir, this.frame);
    this.mesh.position.set(this.x, 0, this.z);
    this.shadow.position.set(this.x, 0.015, this.z);
    // hengeres billboard: a kamera felé fordul
    this.mesh.rotation.y = Math.atan2(cam.position.x - this.x, cam.position.z - this.z) * 0.35;
  }
  remove() { this.world.scene.remove(this.mesh, this.shadow); this.mesh.geometry.dispose(); this.mat.dispose(); this.tex.dispose(); this.shadow.geometry.dispose(); this.shadow.material.dispose(); }
}

export class World {
  constructor(game, def, spawnKey) {
    this.g = game; this.def = def;
    const s = game.state;
    this.scene = new THREE.Scene();
    this.env = def.env(s);
    this.actors = []; this.npcs = new Map(); this.enemies = []; this.crowd = []; this.objects = []; this.lights = [];
    this.bubbles = [];
    this.buildScene();
    // játékos
    const sp = def.spawns[spawnKey] || def.spawns.default;
    this.player = new Actor(this, game.content.PLAYER_SPRITE, sp[0], sp[1], { id: 'player', dir: sp[2] ?? 0 });
    this.bounds = def.bounds;
    // NPC-k
    for (const n of (def.npcs ? def.npcs(s) : [])) this.addNpc(n);
    for (const o of (def.objects ? def.objects(s) : [])) this.objects.push(o);
    for (const e of (def.enemies ? def.enemies(s) : [])) if (!s.defeated[e.key]) this.addEnemy(e);
    if (def.crowd) this.makeCrowd(def.crowd(s));
    // kamera
    this.cam = { ...def.cam };
    this.camTarget = new THREE.Vector3(this.player.x, 0, this.player.z);
    this.snapCamera();
    this.marker = this.makeMarker();
  }

  buildScene() {
    const env = this.env, sc = this.scene, s = this.g.state;
    sc.background = new THREE.Color(env.bg);
    sc.fog = new THREE.FogExp2(env.fog, env.fogDensity ?? 0.02);
    const hemi = new THREE.HemisphereLight(env.hemi[0], env.hemi[1], env.hemi[2]);
    sc.add(hemi);
    if (env.amb) sc.add(new THREE.AmbientLight(env.amb[0], env.amb[1]));
    const moon = new THREE.DirectionalLight(env.sun[0], env.sun[1]);
    moon.position.set(...(env.sunDir ?? [-8, 14, 10]));
    moon.target.position.set(0, 0, 0);
    moon.castShadow = true;
    const B = this.def.bounds, ext = Math.max(B.x1 - B.x0, B.z1 - B.z0) / 2 + 8;
    moon.shadow.mapSize.set(this.g.engine.mobile ? 1024 : 2048, this.g.engine.mobile ? 1024 : 2048);
    const cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2;
    moon.position.x += cx; moon.position.z += cz; moon.target.position.set(cx, 0, cz);
    Object.assign(moon.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: 1, far: 80 });
    moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.02;
    sc.add(moon, moon.target);
    this.moon = moon;
    // voxelek
    const b = new VoxelBuilder(this.def.seed ?? 11, { colorMap: env.colorMap ?? null });
    this.def.build(b, s, env);
    this.group = b.build();
    sc.add(this.group);
    this.colliders = b.colliders;
    for (const L of b.lights) {
      const l = new THREE.PointLight(L.color, L.intensity * (env.lampMul ?? 1), L.distance, 2);
      l.position.set(L.x, L.y, L.z);
      l.userData = { base: l.intensity, flicker: L.flicker, ph: Math.random() * 10 };
      sc.add(l); this.lights.push(l);
    }
    // nedves úton tükröződő fénycsíkok
    const streakTex = gradientTex([[0, 'rgba(255,255,255,0)'], [0.2, 'rgba(255,255,255,.55)'], [0.55, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);
    for (const st of b.marks.streaks || []) {
      if (env.noStreaks) break;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.55, st.len), new THREE.MeshBasicMaterial({ map: streakTex, color: new THREE.Color(st.color).multiplyScalar(env.streakK ?? 1.1), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.rotation.x = -Math.PI / 2; m.position.set(st.x, 0.03, st.z + st.len / 2 - 0.3);
      sc.add(m);
    }
    for (const sg of b.marks.signs || []) sc.add(makeSign(sg, env));
    for (const p of b.marks.posters || []) sc.add(makePoster(p, this.g, env));
    for (const st of b.marks.strings || []) {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const a = new THREE.Vector3(st.x + (Math.random() - .5) * st.w * .8, st.y + (Math.random() - .5) * st.h * .7, st.z);
        const c = new THREE.Vector3(st.x + (Math.random() - .5) * st.w * .8, st.y + (Math.random() - .5) * st.h * .7, st.z);
        pts.push(a, c);
      }
      const ls = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(0xff2030).multiplyScalar(1.1) }));
      sc.add(ls);
    }
    if (env.rain) this.rain = new Rain(sc, env.rain);
    if (env.motes) this.motes = new Motes(sc, env.motes);
    this.g.engine.setPost(env.post ?? {}, true);
    this.g.audio.setRain?.(env.rain ? (env.rainVol ?? 1) : 0);
  }

  addNpc(n) {
    const def = this.g.content.NPCS[n.id];
    if (!def) return;
    const a = new Actor(this, n.sprite ?? def.sprite, n.x, n.z, { id: n.id, dir: n.dir ?? 0, scale: def.scale ?? 1, aura: n.aura });
    a.home = [n.x, n.z]; a.wander = n.wander ?? 0; a.label = n.label; a.homeDir = n.dir ?? 0;
    a.next = 2 + Math.random() * 4; a.goal = null; a.solid = n.solid ?? true;
    this.npcs.set(n.id, a);
    this.actors.push(a);
    return a;
  }
  // a boss nagy pixelképe a kalitkában
  addBossPlane() {
    const src = BIG.nightingale();
    const t = new THREE.CanvasTexture(src); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
    const h = 3.6, w = h * src.width / src.height;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .5, color: new THREE.Color(1.15, 1.1, 1.15) }));
    m.position.set(0, h / 2 + 0.1, -2.6);
    this.scene.add(m);
    this.bossPlane = m;
  }
  removeNpc(id) { const a = this.npcs.get(id); if (!a) return; a.remove(); this.npcs.delete(id); this.actors = this.actors.filter(x => x !== a); }
  presentNpcs() { return [...this.npcs.keys()].filter(id => !this.g.content.NPCS[id]?.dream); }
  witnesses(r) { const p = this.player; return this.presentNpcs().filter(id => { const a = this.npcs.get(id); return Math.hypot(a.x - p.x, a.z - p.z) <= r; }); }

  addEnemy(e) {
    const a = new Actor(this, e.sprite ?? this.g.content.ENEMY_SPRITES[e.type], e.x, e.z, { id: e.key, aura: e.aura ?? 0x8a1030, scale: e.scale ?? 1 });
    a.enemy = e; a.home = [e.x, e.z]; a.next = 1; a.goal = null;
    this.enemies.push(a);
  }
  removeEnemy(a) { a.remove(); this.enemies = this.enemies.filter(x => x !== a); }

  makeCrowd(c) {
    for (let i = 0; i < c.count; i++) {
      const lane = c.lanes[i % c.lanes.length];
      const a = new Actor(this, c.sprites[i % c.sprites.length], c.x0 + Math.random() * (c.x1 - c.x0), lane + (Math.random() - .5) * .4, { glow: 0.05 });
      a.vx = (Math.random() < .5 ? -1 : 1) * (0.9 + Math.random() * .6);
      a.moving = true; a.face(a.vx, 0);
      a.crowd = c;
      this.crowd.push(a);
    }
  }

  makeMarker() {
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb547).multiplyScalar(3) }));
    m.scale.y = 1.5; m.visible = false;
    this.scene.add(m);
    return m;
  }

  // ---------------- interakció ----------------
  interactables() {
    const s = this.g.state, list = [];
    for (const [id, a] of this.npcs) {
      const def = this.g.content.NPCS[id];
      if (def.noTalk) continue;
      list.push({ kind: 'npc', id, x: a.x, z: a.z, r: 1.35, label: a.label ?? `Beszélgetés: ${def.short ?? def.name}`, y: a.h + .25 });
    }
    for (const o of this.objects) {
      if (o.when && !o.when(s)) continue;
      list.push({ kind: 'obj', obj: o, x: o.x, z: o.z, r: o.r ?? 1.2, label: typeof o.label === 'function' ? o.label(s) : o.label, y: o.y ?? 1.4 });
    }
    return list;
  }
  nearest() {
    const p = this.player;
    let best = null, bd = Infinity;
    for (const it of this.interactables()) {
      const d = Math.hypot(it.x - p.x, it.z - p.z);
      if (d < it.r && d < bd) { bd = d; best = it; }
    }
    return best;
  }

  // ---------------- mozgás ----------------
  collide(x, z, r, self) {
    for (const c of this.colliders) {
      const x0 = c.x0 - r, x1 = c.x1 + r, z0 = c.z0 - r, z1 = c.z1 + r;
      if (x > x0 && x < x1 && z > z0 && z < z1) {
        const dl = x - x0, dr = x1 - x, dt = z - z0, db = z1 - z;
        const m = Math.min(dl, dr, dt, db);
        if (m === dl) x = x0; else if (m === dr) x = x1; else if (m === dt) z = z0; else z = z1;
      }
    }
    for (const a of this.npcs.values()) {
      if (a === self || !a.solid) continue;
      const dx = x - a.x, dz = z - a.z, d = Math.hypot(dx, dz), min = r + 0.28;
      if (d < min && d > 1e-5) { x = a.x + dx / d * min; z = a.z + dz / d * min; }
    }
    const B = this.bounds;
    x = Math.max(B.x0 + r, Math.min(B.x1 - r, x));
    z = Math.max(B.z0 + r, Math.min(B.z1 - r, z));
    return [x, z];
  }

  snapCamera() {
    const c = this.cam, cam = this.g.engine.camera;
    const tx = Math.max(c.x0 ?? -1e9, Math.min(c.x1 ?? 1e9, this.player.x));
    const tz = Math.max(c.z0 ?? -1e9, Math.min(c.z1 ?? 1e9, this.player.z));
    this.camTarget.set(tx, 0, tz);
    this.applyCam(cam);
  }
  applyCam(cam) {
    const c = this.cam, t = this.camTarget;
    const narrow = cam.aspect < 0.9;
    const off = narrow && c.offNarrow ? c.offNarrow : c.off;
    cam.position.set(t.x + off[0], t.y + off[1], t.z + off[2]);
    cam.lookAt(t.x + c.look[0], t.y + c.look[1], t.z + c.look[2]);
  }

  update(dt, controllable) {
    const g = this.g, cam = g.engine.camera, p = this.player;
    // játékos
    if (controllable) {
      const ax = g.input.axis();
      const sp = (ax.run ? 5.4 : 3.3) * dt;
      p.moving = Math.hypot(ax.x, ax.z) > 0.12;
      p.running = ax.run;
      if (p.moving) {
        p.face(ax.x, ax.z);
        const [nx, nz] = this.collide(p.x + ax.x * sp, p.z + ax.z * sp, 0.28, p);
        p.x = nx; p.z = nz;
        this.stepT = (this.stepT ?? 0) + dt;
        if (this.stepT > (ax.run ? .22 : .32)) { this.stepT = 0; g.audio.sfx('step'); }
      }
    } else if (!p.scripted) p.moving = false;
    // NPC-k lassú kóborlása
    for (const a of this.npcs.values()) {
      if (a.scripted) { a.update(dt, cam); continue; }
      if (a.wander > 0 && !this.talkingTo(a)) {
        a.next -= dt;
        if (a.goal) {
          const dx = a.goal[0] - a.x, dz = a.goal[1] - a.z, d = Math.hypot(dx, dz);
          if (d < 0.08) { a.goal = null; a.moving = false; a.dir = a.homeDir; }
          else { const v = Math.min(d, 1.1 * dt); a.face(dx, dz); const [nx, nz] = this.collide(a.x + dx / d * v, a.z + dz / d * v, 0.25, a); a.x = nx; a.z = nz; a.moving = true; }
        } else if (a.next <= 0) {
          a.next = 3 + Math.random() * 5;
          a.goal = [a.home[0] + (Math.random() - .5) * 2 * a.wander, a.home[1] + (Math.random() - .5) * a.wander];
        }
      }
      a.update(dt, cam);
    }
    // ellenségek
    for (const e of this.enemies) {
      const dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz);
      if (controllable && d < 4.2) { const v = 2.1 * dt; e.face(dx, dz); e.x += dx / d * v; e.z += dz / d * v; e.moving = true; }
      else {
        e.next -= dt;
        if (!e.goal || e.next < 0) { e.next = 2 + Math.random() * 3; e.goal = [e.home[0] + (Math.random() - .5) * 4, e.home[1] + (Math.random() - .5) * 2]; }
        const gx = e.goal[0] - e.x, gz = e.goal[1] - e.z, gd = Math.hypot(gx, gz);
        if (gd > .1) { e.face(gx, gz); e.x += gx / gd * .8 * dt; e.z += gz / gd * .8 * dt; e.moving = true; } else e.moving = false;
      }
      [e.x, e.z] = this.collide(e.x, e.z, .25, null);
      e.mesh.position.y = Math.sin(e.t * 3) * .05;
      e.update(dt, cam);
      e.shadow.material.opacity = .6 + Math.sin(e.t * 4) * .2;
      if (controllable && d < 0.75 && !this.encounter) { this.encounter = e; g.onEncounter(e); }
    }
    // tömeg
    for (const a of this.crowd) {
      a.x += a.vx * dt;
      if (a.x > a.crowd.x1) a.x = a.crowd.x0; if (a.x < a.crowd.x0) a.x = a.crowd.x1;
      a.update(dt, cam);
    }
    p.update(dt, cam);
    // kamera
    const c = this.cam;
    const tx = Math.max(c.x0 ?? -1e9, Math.min(c.x1 ?? 1e9, p.x));
    const tz = Math.max(c.z0 ?? -1e9, Math.min(c.z1 ?? 1e9, p.z));
    const k = 1 - Math.exp(-dt * 3.2);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.z += (tz - this.camTarget.z) * k;
    this.applyCam(cam);
    // fények pislákolása
    const tt = g.engine.time;
    for (const l of this.lights) if (l.userData.flicker) l.intensity = l.userData.base * (1 + Math.sin(tt * 13 + l.userData.ph) * l.userData.flicker * .5 + (Math.random() - .5) * l.userData.flicker);
    // eső
    if (this.rain) this.rain.update(dt, this.camTarget.x, this.camTarget.z - 1.5);
    if (this.motes) this.motes.update(dt, this.camTarget.x, this.camTarget.z - 2);
    // jelölő a legközelebbi interakció felett
    const near = controllable ? this.nearest() : null;
    if (near) {
      this.marker.visible = true;
      this.marker.position.set(near.x, near.y + Math.sin(tt * 4) * .06, near.z);
      this.marker.rotation.y += dt * 2.5;
    } else this.marker.visible = false;
    g.ui.prompt(near ? near.label : null);
    this.near = near;
    // mellékes megjegyzések (buborékok)
    if (controllable) this.barks(dt);
    this.updateBubbles(dt);
  }
  talkingTo(a) { return this.g.talkingWith === a.id; }

  // ---------------- buborékok ----------------
  barks(dt) {
    this.barkT = (this.barkT ?? 3) - dt;
    if (this.barkT > 0) return;
    this.barkT = 5 + Math.random() * 6;
    const p = this.player;
    const cands = [...this.npcs.values()].filter(a => { const d = Math.hypot(a.x - p.x, a.z - p.z); return d > 1.4 && d < 6.5; });
    if (!cands.length) return;
    const a = cands[(Math.random() * cands.length) | 0];
    const text = this.g.bark(a.id);
    if (text) this.bubble(a, text);
  }
  bubble(a, text, ms = 3600) {
    const el = document.createElement('div');
    el.className = 'bubble';
    el.textContent = text;
    document.getElementById('app').appendChild(el);
    this.bubbles.push({ el, a, t: ms / 1000 });
  }
  updateBubbles(dt) {
    const cam = this.g.engine.camera, cv = this.g.engine.canvas;
    for (const b of this.bubbles) {
      b.t -= dt;
      tmpV.set(b.a.x, b.a.h + 0.45, b.a.z).project(cam);
      const x = (tmpV.x * .5 + .5) * cv.clientWidth, y = (-tmpV.y * .5 + .5) * cv.clientHeight;
      b.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      b.el.style.opacity = b.t < .4 ? Math.max(0, b.t / .4) : 1;
    }
    this.bubbles = this.bubbles.filter(b => { if (b.t <= 0) { b.el.remove(); return false; } return true; });
  }

  dispose() {
    for (const b of this.bubbles) b.el.remove();
    if (this.rain) this.rain.dispose(this.scene);
    if (this.motes) this.motes.dispose(this.scene);
    this.scene.traverse(o => {
      if (o.geometry && o.geometry !== undefined && !o.isInstancedMesh) o.geometry.dispose?.();
      if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.map && m.map !== blobTex) m.map.dispose(); m.dispose(); }); }
      if (o.isInstancedMesh) o.dispose();
    });
    this.g.ui.prompt(null);
  }
}

// ---------------- feliratok, plakátok ----------------
function makeSign(sg, env) {
  const ar = sg.w / sg.h, H = 128, W = Math.round(H * ar);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = sg.bg; x.fillRect(0, 0, W, H);
  if (sg.border) { x.strokeStyle = sg.border; x.lineWidth = 8; x.strokeRect(6, 6, W - 12, H - 12); }
  x.fillStyle = sg.color; x.textAlign = 'center'; x.textBaseline = 'middle';
  let fs = sg.size ?? 72;
  x.font = `${fs}px ${sg.font}, Impact, sans-serif`;
  while (x.measureText(sg.text).width > W - 36 && fs > 12) { fs -= 2; x.font = `${fs}px ${sg.font}, Impact, sans-serif`; }
  x.fillText(sg.text, W / 2, H / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const k = env.dayMode ? Math.min(1.1, sg.glow) : sg.glow;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(sg.w, sg.h), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1, 1, 1).multiplyScalar(k), transparent: false }));
  m.position.set(sg.x, sg.y, sg.z); m.rotation.y = sg.ry ?? 0;
  return m;
}

function makePoster(p, game, env) {
  const c = document.createElement('canvas'); c.width = 48; c.height = 64;
  const x = c.getContext('2d');
  game.content.drawPoster(x, p.kind, 48, 64);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
  const k = env.dayMode ? 1 : (p.glow ?? 1.2);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1, 1, 1).multiplyScalar(k) }));
  m.position.set(p.x, p.y, p.z); m.rotation.y = p.ry ?? 0;
  return m;
}
