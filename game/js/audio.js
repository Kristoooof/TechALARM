// Szintetizált hangok: eső, noir zongora-akkordok, Big Ben harang, UI-hangok. Nincs külső hangfájl.
export class Audio {
  constructor() { this.ctx = null; this.muted = false; this.rainGain = null; this.musicOn = false; this.mood = 'noir'; }
  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 0.7; this.master.connect(c.destination);
    // eső: szűrt fehérzaj
    const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    this.rainGain = c.createGain(); this.rainGain.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(this.rainGain); this.rainGain.connect(this.master);
    src.start();
    this.musicGain = c.createGain(); this.musicGain.gain.value = 0.0; this.musicGain.connect(this.master);
    const delay = c.createDelay(1.5); delay.delayTime.value = 0.42;
    const fb = c.createGain(); fb.gain.value = 0.32;
    const wet = c.createGain(); wet.gain.value = 0.35;
    this.musicGain.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(this.master);
    this.nextChord = c.currentTime + 0.5; this.chordIdx = 0;
    this.timer = setInterval(() => this.tick(), 200);
  }
  setRain(v) { if (this.rainGain) this.rainGain.gain.setTargetAtTime(this.muted ? 0 : v * 0.16, this.ctx.currentTime, 0.8); }
  setMusic(on, mood = 'noir') { this.musicOn = on; this.mood = mood; if (this.musicGain) this.musicGain.gain.setTargetAtTime(on && !this.muted ? 0.16 : 0, this.ctx.currentTime, 1.2); }
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.7; return this.muted; }
  tick() {
    const c = this.ctx; if (!c || !this.musicOn) return;
    while (this.nextChord < c.currentTime + 1) {
      const prog = {
        noir: [[57, 60, 64, 67], [55, 58, 62, 65], [53, 57, 60, 64], [52, 56, 59, 62]], // Am7 Gm7 Fmaj7 E7
        dream: [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 68]],
        grey: [[57, 60, 63], [56, 59, 62], [55, 58, 61], [54, 57, 60]],
        warm: [[60, 64, 67, 71], [57, 60, 64, 67], [65, 69, 72, 76], [67, 71, 74, 77]],
        battle: [[45, 52, 57, 60], [43, 50, 55, 58], [41, 48, 53, 57], [40, 47, 52, 56]],
      }[this.mood] || [[57, 60, 64, 67]];
      const ch = prog[this.chordIdx++ % prog.length];
      const t = this.nextChord;
      const step = this.mood === 'battle' ? 1.6 : 3.2;
      ch.forEach((n, i) => this.note(n, t + i * (this.mood === 'battle' ? 0.05 : 0.11), step * 1.1, this.mood === 'battle' ? 'sawtooth' : 'triangle', 0.25));
      if (this.mood === 'noir' && Math.random() < .6) this.note(ch[3 % ch.length] + 12 + [0, 2, -1, 3][(Math.random() * 4) | 0], t + step * .55, 1.2, 'sine', .18);
      if (this.mood === 'battle') { for (let k = 0; k < 4; k++) this.note(ch[0] - 12, t + k * step / 4, .25, 'square', .16); }
      this.nextChord += step;
    }
  }
  note(midi, t, dur, type = 'triangle', vol = .3) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = type; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    f.type = 'lowpass'; f.frequency.value = type === 'sawtooth' || type === 'square' ? 1400 : 2400;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(f); f.connect(g); g.connect(this.musicGain);
    o.start(t); o.stop(t + dur + 0.05);
  }
  bell(t0 = 0, vol = 0.5) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + t0;
    [[110, 1], [220.5, .5], [329, .35], [442, .25], [587, .18]].forEach(([fq, a]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = fq;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t + 3.6);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 3.8);
    });
  }
  sfx(kind) {
    const c = this.ctx; if (!c || this.muted) return;
    const t = c.currentTime;
    const beep = (f, d, type = 'square', v = .06, f2 = null) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0005, t + d); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + .02);
    };
    if (kind === 'blip') beep(880, .03, 'square', .015);
    else if (kind === 'move') beep(660, .05, 'triangle', .05);
    else if (kind === 'ok') { beep(740, .08, 'triangle', .08); setTimeout(() => beep(1110, .1, 'triangle', .07), 60); }
    else if (kind === 'back') beep(440, .08, 'triangle', .06, 300);
    else if (kind === 'clue') { [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => beep(f, .18, 'triangle', .07), i * 70)); }
    else if (kind === 'rank') { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .25, 'sine', .08), i * 90)); }
    else if (kind === 'hit') beep(180, .18, 'sawtooth', .12, 60);
    else if (kind === 'weak') { beep(300, .2, 'sawtooth', .12, 900); }
    else if (kind === 'heal') beep(600, .4, 'sine', .08, 1200);
    else if (kind === 'summon') { beep(200, .6, 'sawtooth', .07, 1600); beep(100, .8, 'sine', .12, 400); }
    else if (kind === 'step') beep(120, .03, 'sine', .02);
  }
}
