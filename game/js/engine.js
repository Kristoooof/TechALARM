// Renderer + HD-2D utófeldolgozás (bloom, tilt-shift, színkorrekció, vignetta, szemcse).
import * as THREE from './three.js';

const VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const BRIGHT = /* glsl */`
uniform sampler2D tIn; uniform vec2 texel; uniform float thr; uniform float knee;
varying vec2 vUv;
void main(){
  vec3 c = vec3(0.0);
  c += texture2D(tIn, vUv + texel * vec2(-0.5,-0.5)).rgb;
  c += texture2D(tIn, vUv + texel * vec2( 0.5,-0.5)).rgb;
  c += texture2D(tIn, vUv + texel * vec2(-0.5, 0.5)).rgb;
  c += texture2D(tIn, vUv + texel * vec2( 0.5, 0.5)).rgb;
  c *= 0.25;
  float l = max(c.r, max(c.g, c.b));
  float k = smoothstep(thr, thr + knee, l);
  gl_FragColor = vec4(min(c * k, vec3(40.0)), 1.0);
}`;

const COPY = /* glsl */`
uniform sampler2D tIn; uniform vec2 texel;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tIn, vUv + texel * vec2(-0.5,-0.5)).rgb + texture2D(tIn, vUv + texel * vec2(0.5,-0.5)).rgb
         + texture2D(tIn, vUv + texel * vec2(-0.5,0.5)).rgb + texture2D(tIn, vUv + texel * vec2(0.5,0.5)).rgb;
  gl_FragColor = vec4(c * 0.25, 1.0);
}`;

const BLUR = /* glsl */`
uniform sampler2D tIn; uniform vec2 dir;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tIn, vUv).rgb * 0.2270270270;
  c += texture2D(tIn, vUv + dir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tIn, vUv - dir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tIn, vUv + dir * 3.2307692308).rgb * 0.0702702703;
  c += texture2D(tIn, vUv - dir * 3.2307692308).rgb * 0.0702702703;
  gl_FragColor = vec4(c, 1.0);
}`;

const COMPOSITE = /* glsl */`
uniform sampler2D tScene, tSoft, tB1, tB2, tB3;
uniform vec2 res;
uniform float time, bloom, exposure, sat, contrast, vignette, grain, flash, wobble, focus, range, tilt, desatEdge;
uniform vec3 tint, lift, flashColor;
varying vec2 vUv;
vec3 aces(vec3 x){ const float a=2.51; const float b=0.03; const float c=2.43; const float d=0.59; const float e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0); }
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308), c)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = vUv;
  if (wobble > 0.0) {
    uv += wobble * vec2(sin(uv.y * 18.0 + time * 1.7), cos(uv.x * 14.0 + time * 1.3)) * 0.004;
  }
  vec3 sharp = texture2D(tScene, uv).rgb;
  vec3 soft = texture2D(tSoft, uv).rgb;
  float d = abs(uv.y - focus);
  float t = smoothstep(range * 0.35, range, d) * tilt;
  vec3 col = mix(sharp, soft, t);
  vec3 bl = texture2D(tB1, uv).rgb * 0.65 + texture2D(tB2, uv).rgb * 0.5 + texture2D(tB3, uv).rgb * 0.3;
  col += bl * bloom;
  col *= exposure;
  col = aces(col);
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float s = sat * mix(1.0, 0.55, t * desatEdge);
  col = mix(vec3(lum), col, s);
  col = (col - 0.5) * contrast + 0.5;
  col = col * tint + lift;
  col = clamp(col, 0.0, 1.0);
  vec2 q = vUv - 0.5; q.x *= res.x / res.y * 0.75;
  float v = smoothstep(0.85, 0.25, length(q));
  col *= mix(1.0 - vignette, 1.0, v);
  col = toSRGB(col);
  col += (hash(vUv * res + fract(time) * 100.0) - 0.5) * grain;
  col = mix(col, flashColor, flash);
  gl_FragColor = vec4(col, 1.0);
}`;

export const DEFAULT_POST = {
  bloom: 0.7, thr: 1.1, knee: 0.8, exposure: 1.0, sat: 1.0, contrast: 1.05,
  tint: [1, 1, 1], lift: [0, 0, 0], vignette: 0.45, grain: 0.04, wobble: 0,
  focus: 0.46, range: 0.46, tilt: 0.8, desatEdge: 0.3,
};

class PostFX {
  constructor(renderer) {
    this.r = renderer;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    this.mBright = mk(BRIGHT, { tIn: { value: null }, texel: { value: new THREE.Vector2() }, thr: { value: 1 }, knee: { value: .5 } });
    this.mCopy = mk(COPY, { tIn: { value: null }, texel: { value: new THREE.Vector2() } });
    this.mBlur = mk(BLUR, { tIn: { value: null }, dir: { value: new THREE.Vector2() } });
    this.mComp = mk(COMPOSITE, {
      tScene: { value: null }, tSoft: { value: null }, tB1: { value: null }, tB2: { value: null }, tB3: { value: null },
      res: { value: new THREE.Vector2() }, time: { value: 0 }, bloom: { value: 1 }, exposure: { value: 1 }, sat: { value: 1 },
      contrast: { value: 1 }, vignette: { value: .4 }, grain: { value: .04 }, flash: { value: 0 }, wobble: { value: 0 },
      focus: { value: .42 }, range: { value: .3 }, tilt: { value: .8 }, desatEdge: { value: .3 },
      tint: { value: new THREE.Vector3(1, 1, 1) }, lift: { value: new THREE.Vector3() }, flashColor: { value: new THREE.Vector3(1, 1, 1) },
    });
    this.params = { ...DEFAULT_POST };
    this.target = { ...DEFAULT_POST };
    this.flash = 0; this.flashColor = [1, 1, 1];
    this.rts = null;
  }
  setSize(w, h, samples) {
    if (this.rts) Object.values(this.rts).forEach(rt => rt.dispose());
    const opt = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    const h2 = [Math.max(1, w >> 1), Math.max(1, h >> 1)], h4 = [Math.max(1, w >> 2), Math.max(1, h >> 2)], h8 = [Math.max(1, w >> 3), Math.max(1, h >> 3)];
    this.rts = {
      scene: new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }),
      softA: new THREE.WebGLRenderTarget(...h2, opt), softB: new THREE.WebGLRenderTarget(...h2, opt),
      b1a: new THREE.WebGLRenderTarget(...h2, opt), b1b: new THREE.WebGLRenderTarget(...h2, opt),
      b2a: new THREE.WebGLRenderTarget(...h4, opt), b2b: new THREE.WebGLRenderTarget(...h4, opt),
      b3a: new THREE.WebGLRenderTarget(...h8, opt), b3b: new THREE.WebGLRenderTarget(...h8, opt),
    };
    this.w = w; this.h = h;
  }
  pass(mat, target) {
    this.quad.material = mat;
    this.r.setRenderTarget(target);
    this.r.render(this.scene, this.cam);
  }
  blur(a, b, spread) {
    const w = a.width, h = a.height;
    this.mBlur.uniforms.tIn.value = a.texture; this.mBlur.uniforms.dir.value.set(spread / w, 0); this.pass(this.mBlur, b);
    this.mBlur.uniforms.tIn.value = b.texture; this.mBlur.uniforms.dir.value.set(0, spread / h); this.pass(this.mBlur, a);
  }
  render(scene, camera, time, dt) {
    const p = this.params, t = this.target, k = Math.min(1, dt * 2.5);
    for (const key in t) {
      if (Array.isArray(t[key])) p[key] = p[key].map((v, i) => v + (t[key][i] - v) * k);
      else p[key] += (t[key] - p[key]) * k;
    }
    const R = this.rts;
    this.r.setRenderTarget(R.scene);
    this.r.render(scene, camera);
    // tilt-shift lágy kép
    this.mCopy.uniforms.tIn.value = R.scene.texture; this.mCopy.uniforms.texel.value.set(1 / this.w, 1 / this.h);
    this.pass(this.mCopy, R.softA);
    this.blur(R.softA, R.softB, 1.6);
    this.blur(R.softA, R.softB, 2.6);
    // bloom lánc
    this.mBright.uniforms.tIn.value = R.scene.texture; this.mBright.uniforms.texel.value.set(1 / this.w, 1 / this.h);
    this.mBright.uniforms.thr.value = p.thr; this.mBright.uniforms.knee.value = p.knee;
    this.pass(this.mBright, R.b1a);
    this.blur(R.b1a, R.b1b, 1.2);
    this.mCopy.uniforms.tIn.value = R.b1a.texture; this.mCopy.uniforms.texel.value.set(1 / R.b1a.width, 1 / R.b1a.height);
    this.pass(this.mCopy, R.b2a);
    this.blur(R.b2a, R.b2b, 1.5);
    this.mCopy.uniforms.tIn.value = R.b2a.texture; this.mCopy.uniforms.texel.value.set(1 / R.b2a.width, 1 / R.b2a.height);
    this.pass(this.mCopy, R.b3a);
    this.blur(R.b3a, R.b3b, 2.0);
    this.blur(R.b3a, R.b3b, 3.0);
    const u = this.mComp.uniforms;
    u.tScene.value = R.scene.texture; u.tSoft.value = R.softA.texture;
    u.tB1.value = R.b1a.texture; u.tB2.value = R.b2a.texture; u.tB3.value = R.b3a.texture;
    u.res.value.set(this.w, this.h); u.time.value = time;
    u.bloom.value = p.bloom; u.exposure.value = p.exposure; u.sat.value = p.sat; u.contrast.value = p.contrast;
    u.vignette.value = p.vignette; u.grain.value = p.grain; u.wobble.value = p.wobble;
    u.focus.value = p.focus; u.range.value = p.range; u.tilt.value = p.tilt; u.desatEdge.value = p.desatEdge;
    u.tint.value.set(...p.tint); u.lift.value.set(...p.lift);
    this.flash = Math.max(0, this.flash - dt * 2.2);
    u.flash.value = this.flash; u.flashColor.value.set(...this.flashColor);
    this.pass(this.mComp, null);
  }
}

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.mobile = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.shadowMap.enabled = !window.__fast;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
    this.post = new PostFX(this.renderer);
    this.time = 0;
    this.shake = 0;
    this.resize();
    addEventListener('resize', () => this.resize());
  }
  resize() {
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
    const pr = window.__fast ? 0.5 : Math.min(devicePixelRatio || 1, this.mobile ? 1.25 : 1.5);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // keskeny (álló) képernyőn tágabb látószög, hogy a szereplők elférjenek
    this.camera.fov = w / h < 0.9 ? 44 : w / h < 1.3 ? 36 : 30;
    this.camera.updateProjectionMatrix();
    const samples = this.mobile ? 0 : 4;
    this.post.setSize(Math.floor(w * pr), Math.floor(h * pr), samples);
  }
  setPost(params, instant = false) {
    Object.assign(this.post.target, { ...DEFAULT_POST, ...params });
    if (instant) Object.assign(this.post.params, JSON.parse(JSON.stringify(this.post.target)));
  }
  tweakPost(params) { Object.assign(this.post.target, params); }
  flash(color = [1, 1, 1], amount = 1) { this.post.flashColor = color; this.post.flash = amount; }
  render(scene, dt) {
    this.time += dt;
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 1.6);
      const s = this.shake * 0.12;
      this.camera.position.x += (Math.random() - .5) * s;
      this.camera.position.y += (Math.random() - .5) * s;
    }
    this.post.render(scene, this.camera, this.time, dt);
  }
}

// ---------- Eső ----------
export class Rain {
  constructor(scene, { count = 1400, area = [40, 14, 15], color = 0x9fb8e8, opacity = 0.3, speed = 15, wind = -2.2, splash = true } = {}) {
    this.area = area; this.speed = speed; this.wind = wind; this.count = count;
    const pos = new Float32Array(count * 6);
    this.drops = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.drops[i * 3] = (Math.random() - .5) * area[0];
      this.drops[i * 3 + 1] = Math.random() * area[1];
      this.drops[i * 3 + 2] = (Math.random() - .5) * area[2];
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = new THREE.Color(color);
    this.mat = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity, depthWrite: false, fog: true });
    this.lines = new THREE.LineSegments(this.geo, this.mat);
    this.lines.frustumCulled = false;
    scene.add(this.lines);
    this.splashes = null;
    if (splash) {
      const n = 160;
      this.sp = new Float32Array(n * 4); // x, z, life, size
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(n), 1));
      const m = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { color: { value: c.clone().multiplyScalar(1.4) } },
        vertexShader: `attribute float alpha; varying float vA; void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = (1.0 - alpha) * 90.0 / -mv.z + 1.0; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 color; varying float vA; void main(){ vec2 p = gl_PointCoord - .5; float r = length(p); float ring = smoothstep(.5,.38,r) * smoothstep(.22,.36,r); gl_FragColor = vec4(color, ring * vA * .55); }`,
      });
      this.splashes = new THREE.Points(g, m);
      this.splashes.frustumCulled = false;
      scene.add(this.splashes);
      for (let i = 0; i < n; i++) this.sp[i * 4 + 2] = Math.random();
    }
    this.groundY = 0.02;
  }
  update(dt, cx, cz) {
    const a = this.area, p = this.geo.attributes.position.array, d = this.drops;
    const len = 0.55, vx = this.wind, vy = -this.speed;
    for (let i = 0; i < this.count; i++) {
      let x = d[i * 3], y = d[i * 3 + 1], z = d[i * 3 + 2];
      y += vy * dt; x += vx * dt;
      if (y < 0) { y += a[1]; x = (Math.random() - .5) * a[0]; z = (Math.random() - .5) * a[2]; }
      if (x < -a[0] / 2) x += a[0];
      d[i * 3] = x; d[i * 3 + 1] = y; d[i * 3 + 2] = z;
      const wx = x + cx, wz = z + cz;
      p[i * 6] = wx; p[i * 6 + 1] = y; p[i * 6 + 2] = wz;
      p[i * 6 + 3] = wx - vx * len / this.speed; p[i * 6 + 4] = y + len; p[i * 6 + 5] = wz;
    }
    this.geo.attributes.position.needsUpdate = true;
    if (this.splashes) {
      const g = this.splashes.geometry, sp = this.sp, pos = g.attributes.position.array, al = g.attributes.alpha.array;
      const n = al.length;
      for (let i = 0; i < n; i++) {
        sp[i * 4 + 2] -= dt * 2.6;
        if (sp[i * 4 + 2] <= 0) {
          sp[i * 4 + 2] = 1;
          sp[i * 4] = cx + (Math.random() - .5) * a[0] * .8;
          sp[i * 4 + 1] = cz + (Math.random() - .5) * a[2] * .6;
        }
        pos[i * 3] = sp[i * 4]; pos[i * 3 + 1] = this.groundY; pos[i * 3 + 2] = sp[i * 4 + 1];
        al[i] = sp[i * 4 + 2];
      }
      g.attributes.position.needsUpdate = true; g.attributes.alpha.needsUpdate = true;
    }
  }
  dispose(scene) {
    scene.remove(this.lines); this.geo.dispose(); this.mat.dispose();
    if (this.splashes) { scene.remove(this.splashes); this.splashes.geometry.dispose(); this.splashes.material.dispose(); }
  }
}

// lebegő porszemek / szirmok (álomvilágok)
export class Motes {
  constructor(scene, { count = 220, area = [36, 8, 18], color = 0xffd9a0, size = 0.06, rise = 0.25 } = {}) {
    this.area = area; this.rise = rise;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { pos[i * 3] = (Math.random() - .5) * area[0]; pos[i * 3 + 1] = Math.random() * area[1]; pos[i * 3 + 2] = (Math.random() - .5) * area[2]; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.base = pos.slice();
    this.mat = new THREE.PointsMaterial({ color: new THREE.Color(color).multiplyScalar(2.2), size, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending });
    this.pts = new THREE.Points(g, this.mat);
    this.pts.frustumCulled = false;
    scene.add(this.pts);
    this.t = 0;
  }
  update(dt, cx, cz) {
    this.t += dt;
    const p = this.pts.geometry.attributes.position.array, b = this.base, a = this.area;
    for (let i = 0; i < p.length; i += 3) {
      b[i + 1] += this.rise * dt * (0.5 + (i % 7) / 7);
      if (b[i + 1] > a[1]) b[i + 1] = 0;
      p[i] = cx + b[i] + Math.sin(this.t * .7 + i) * .3;
      p[i + 1] = b[i + 1];
      p[i + 2] = cz + b[i + 2] + Math.cos(this.t * .5 + i) * .3;
    }
    this.pts.geometry.attributes.position.needsUpdate = true;
  }
  dispose(scene) { scene.remove(this.pts); this.pts.geometry.dispose(); this.mat.dispose(); }
}
