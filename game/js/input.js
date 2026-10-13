// Billentyűzet + érintés: folyamatos irány (axis) és események (act, back, menu, up, down, left, right).
export class Input {
  constructor() {
    this.keys = new Set();
    this.ls = {};
    this.stick = { x: 0, y: 0 };
    this.enabled = true;
    addEventListener('keydown', e => this.kd(e));
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    this.touch = matchMedia('(pointer: coarse)').matches;
    this.setupTouch();
  }
  on(ev, fn) { (this.ls[ev] ||= []).push(fn); return () => { this.ls[ev] = this.ls[ev].filter(f => f !== fn); }; }
  emit(ev) { for (const fn of [...(this.ls[ev] || [])]) fn(); }
  kd(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      if (e.code === 'Enter') this.emit('enter');
      return;
    }
    const first = !this.keys.has(e.code);
    this.keys.add(e.code);
    const map = {
      Enter: 'act', Space: 'act', KeyE: 'act', NumpadEnter: 'act',
      Escape: 'back', Backspace: 'back', KeyX: 'back',
      Tab: 'menu', KeyI: 'menu', KeyM: 'menu',
      ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    };
    const ev = map[e.code];
    if (ev) {
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(e.code)) e.preventDefault();
      if (first || ev === 'up' || ev === 'down') this.emit(ev);
    }
  }
  axis() {
    const k = this.keys;
    let x = 0, z = 0;
    if (k.has('ArrowLeft') || k.has('KeyA')) x -= 1;
    if (k.has('ArrowRight') || k.has('KeyD')) x += 1;
    if (k.has('ArrowUp') || k.has('KeyW')) z -= 1;
    if (k.has('ArrowDown') || k.has('KeyS')) z += 1;
    x += this.stick.x; z += this.stick.y;
    const l = Math.hypot(x, z);
    if (l > 1) { x /= l; z /= l; }
    return { x, z, run: k.has('ShiftLeft') || k.has('ShiftRight') || Math.hypot(this.stick.x, this.stick.y) > .92 };
  }
  setupTouch() {
    const wrap = document.getElementById('touch'), st = document.getElementById('stick'), knob = st.querySelector('i'), a = document.getElementById('tA');
    if (this.touch) { wrap.classList.add('on'); document.getElementById('app').classList.add('touch'); }
    let id = null, cx = 0, cy = 0;
    const R = 50;
    const move = (e) => {
      const dx = e.clientX - cx, dy = e.clientY - cy, l = Math.hypot(dx, dy), k = l > R ? R / l : 1;
      knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      this.stick.x = dx * k / R; this.stick.y = dy * k / R;
    };
    st.addEventListener('pointerdown', e => { id = e.pointerId; const r = st.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; st.setPointerCapture(id); move(e); });
    st.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
    const end = e => { if (e.pointerId !== id) return; id = null; this.stick.x = this.stick.y = 0; knob.style.transform = ''; };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    a.addEventListener('pointerdown', e => { e.preventDefault(); this.emit('act'); });
  }
  showPad(on) {
    document.getElementById('touch').classList.toggle('hidepad', !on);
    if (!on) { this.stick.x = this.stick.y = 0; const k = document.querySelector('#stick i'); if (k) k.style.transform = ''; }
  }
}
