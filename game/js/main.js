// London Nocturne: belépési pont. Összeköti a motort, a világot, a párbeszédet, a történetet és a harcot.
import { Engine } from './engine.js';
import { World } from './world.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { UI, sleep } from './ui.js';
import { Grammar } from './grammar.js';
import { Dialogue } from './dialogue.js';
import { Story } from './story.js';
import { Battle, Party } from './battle.js';
import { SCENES } from './scenes.js';
import { newState, makeCtx, npcMem, addLog } from './logic.js';
import { BANKS, VOICES } from './content/banks.js';
import { RULES } from './content/rules.js';
import * as W from './content/world.js';

const SAVE_KEY = 'nocturne_save';

class Game {
  constructor() {
    this.content = {
      NPCS: W.NPCS, DEEDS: W.DEEDS, CLUES: W.CLUES, DEDUCTIONS: W.DEDUCTIONS, TRUTHS: W.TRUTHS, ITEMS: W.ITEMS,
      RULES, PLAYER_SPRITE: W.PLAYER_SPRITE, ENEMY_SPRITES: W.ENEMY_SPRITES, drawPoster: W.drawPoster,
    };
    for (const id in W.NPCS) W.NPCS[id].voice = VOICES[id] ?? null;
    this.engine = new Engine(document.getElementById('gl'));
    this.input = new Input();
    this.audio = new Audio();
    this.ui = new UI(this);
    this.grammar = new Grammar(BANKS);
    this.dlg = new Dialogue(this);
    this.story = new Story(this);
    this.party = new Party(this);
    this.battle = new Battle(this);
    this.state = newState();
    this.world = null; this.scene = null;
    this.mode = 'title'; this.locked = 0; this.walkers = []; this.talkingWith = null;
    this.input.on('act', () => this.onAct());
    this.input.on('menu', () => this.onMenu());
    this.last = performance.now();
    window.__game = this;
  }

  get controllable() { return this.mode === 'explore' && this.locked === 0 && !this.ui.busy && !!this.world; }

  async boot() {
    try { await Promise.race([document.fonts.load('40px Anton'), sleep(2500)]); } catch { /* betűtípus nélkül is megy */ }
    requestAnimationFrame((t) => this.frame(t));
    await this.toTitle();
  }

  frame(t) {
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    for (const w of this.walkers) {
      const a = w.a, dx = w.x - a.x, dz = w.z - a.z, d = Math.hypot(dx, dz);
      if (d < 0.05) { a.moving = false; a.scripted = false; w.done = true; w.res(); continue; }
      const v = Math.min(d, w.speed * dt);
      a.x += dx / d * v; a.z += dz / d * v; a.face(dx, dz); a.moving = true;
    }
    this.walkers = this.walkers.filter(w => !w.done);
    // érintős vezérlő csak szabad mozgás közben látszik
    const pad = this.controllable;
    if (pad !== this._pad) { this._pad = pad; this.input.showPad(pad); }
    if (this.world) {
      this.world.update(dt, this.controllable);
      if (this.mode === 'title') {
        const cam = this.engine.camera, tt = this.engine.time;
        const px = Math.sin(tt * 0.04) * 8 + 2;
        cam.position.set(px, 4.6, 12.5);
        cam.lookAt(px + 3, 3.4, -7);
      }
      this.engine.render(this.world.scene, dt);
    }
    requestAnimationFrame((tt) => this.frame(tt));
  }

  // ---------------- jelenetek ----------------
  async goto(id, spawn = null, { skipEnter = false, keepFade = false } = {}) {
    const def = SCENES[id];
    if (!def) throw new Error('Ismeretlen helyszín: ' + id);
    if (this.world) await this.ui.fade(1, 320);
    if (def.pre) def.pre(this);
    if (id === 'theatre') this.story.preTheatre();
    if (this.world) this.world.dispose();
    this.walkers = [];
    this.state.scene = id;
    this.scene = { ...def, id };
    this.world = new World(this, def, spawn);
    this.ui.setHUD();
    await sleep(60);
    if (!keepFade) await this.ui.fade(0, 420);
    if (!skipEnter && def.onEnter) await def.onEnter(this);
  }

  walk(actor, x, z, speed = 1.6) {
    if (window.__fast) { actor.x = x; actor.z = z; return Promise.resolve(); }
    actor.scripted = true;
    return new Promise(res => this.walkers.push({ a: actor, x, z, speed, res }));
  }

  // ---------------- interakció ----------------
  onAct() {
    if (!this.controllable) return;
    const it = this.world.near;
    if (it) this.run(() => this.interact(it));
  }
  onMenu() {
    if (!this.controllable) return;
    this.run(() => this.ui.notebook());
  }
  async run(fn) {
    this.locked++;
    try { await fn(); } catch (e) { console.error(e); this.ui.toast('HIBA', String(e.message || e)); }
    finally { this.locked = Math.max(0, this.locked - 1); }
  }
  async interact(it) {
    if (it.kind === 'npc') return this.talk(it.id);
    return it.obj.act(this);
  }
  async talk(id) {
    const a = this.world.npcs.get(id), p = this.world.player;
    if (a) { a.faceTo(p.x, p.z); p.faceTo(a.x, a.z); }
    const hook = this.story.hook(id);
    this.talkingWith = id;
    try {
      if (hook) await hook();
      else await this.dlg.talk(id);
    } finally {
      this.talkingWith = null;
      if (a && this.world.npcs.get(id) === a) a.dir = a.homeDir ?? 0;
    }
  }
  async pickClue(title) { return this.ui.pickClue(title); }

  addClue(id) {
    const s = this.state;
    if (s.clues.includes(id)) return;
    s.clues.push(id);
    const c = this.content.CLUES[id];
    this.ui.toast('ÚJ NYOM', c.name, 'clue');
    this.audio.sfx('clue');
    addLog(this, `Nyom: ${c.name}. ${c.where}.`);
  }

  // mellékes megjegyzés egy NPC-től (generált, a tetteidre is reagál)
  bark(id) {
    const def = this.content.NPCS[id];
    if (!def || (def.dream && id !== 'kalauz')) return null;
    const m = npcMem(this.state, id), keys = Object.keys(m.known).filter(k => !this.content.DEEDS[this.state.deeds[m.known[k].idx].id]?.quiet);
    if (keys.length && Math.random() < 0.45) {
      const k = keys[(Math.random() * keys.length) | 0], deed = this.state.deeds[m.known[k].idx], dd = this.content.DEEDS[deed.id];
      const tone = (dd.tags || []).reduce((a, t) => a + (def.values?.[t] ?? 0), 0);
      const vars = { deedThey: this.grammar.expand(`#deedThey_${deed.id}#`, makeCtx(this, id)), deedTone: tone };
      return this.grammar.expand('#bark_deed#', makeCtx(this, id, vars), def.voice);
    }
    if (!def.voice?.bark) return null;
    return this.grammar.expand('#bark#', makeCtx(this, id), def.voice);
  }

  // ---------------- napszakok ----------------
  async leaveDistrict() { await this.story.leave(); }

  async onEncounter(e) {
    await this.run(async () => {
      const r = await this.battle.start({ enemies: e.enemy.battle, canFlee: true });
      if (r.result === 'win') { this.state.defeated[e.enemy.key] = true; this.world.removeEnemy(e); }
      else if (r.result === 'flee') {
        const p = this.world.player, dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz) || 1;
        [p.x, p.z] = this.world.collide(p.x + dx / d * 2.5, p.z + dz / d * 2.5, .28, p);
        e.x = e.home[0]; e.z = e.home[1];
      } else await this.story.defeat();
    });
    if (this.world) this.world.encounter = null;
  }

  // ---------------- mentés ----------------
  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch { /* privát mód: nincs mentés */ }
  }
  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; } }
  load() {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === newState().v) return s; } catch { /* sérült mentés */ }
    return null;
  }
  async resume() {
    const s = this.state;
    if (s.day === 1 && s.slot === 'este') return this.goto(s.scene === 'office' || s.scene === 'soho' ? s.scene : 'office', null);
    if (s.slot === 'reggel') return this.story.morning();
    if (s.slot === 'delutan') return this.story.chooseAfternoon();
    if (s.slot === 'este') return this.story.chooseEvening();
    return this.story.startNight();
  }

  async toTitle() {
    this.mode = 'title';
    this.locked = 0;
    this.ui.hud(false); this.ui.prompt(null); this.ui.hideDialog();
    this.state = newState(); this.state.slot = 'este';
    await this.goto('soho', null, { skipEnter: true });
    this.engine.tweakPost({ tilt: 0.45, focus: 0.5, range: 0.4 });
    this.audio.setMusic?.(false);
    const r = await this.ui.title(this.hasSave());
    if (r.action === 'cont') {
      const s = this.load();
      if (s) { this.state = s; this.mode = 'explore'; this.ui.hud(true); this.audio.setMusic(true, 'noir'); await this.run(() => this.resume()); return; }
    }
    this.state = newState(r.name);
    this.mode = 'explore';
    await this.run(() => this.story.prologue());
  }
}

const game = new Game();
game.boot().catch(e => {
  console.error(e);
  const el = document.getElementById('err');
  el.style.display = 'block';
  el.textContent = 'A játék nem tudott elindulni ezen az eszközön (WebGL szükséges). ' + (e.message || e);
});
