// Körökre osztott harc Persona-módra: gyengeség → "TÖBB!", földre kerülés, össztámadás, igazságok a fátylak ellen.
import { BIG, drawPortrait } from './sprites.js';
import { makeCtx, statLv, addLog } from './logic.js';
import { sleep } from './ui.js';

const EL = { fiz: 'fizikai', vil: 'villám', tuz: 'tűz', psz: 'psziché', gyo: 'gyógyítás' };

const SKILLS = {
  attack: { name: 'Támadás', el: 'fiz', pow: 9, sp: 0, desc: 'Sima ütés. Nem kér LP-t.' },
  villamszo: { name: 'Villámszó', el: 'vil', pow: 17, sp: 4, desc: 'Egyetlen kimondott szó, ami villámként csap le. Villám, egy célpont.' },
  logika: { name: 'Hideg logika', el: 'fiz', pow: 19, sp: 5, desc: 'Dupin tollpengéje ott vág, ahol a gondolat. Fizikai, egy célpont.' },
  dedukcio: { name: 'Dedukció', el: 'none', pow: 0, sp: 2, desc: 'Kiolvassa a célpont gyengeségét. A következő találat kritikus.' },
  vihar: { name: 'Éjféli vihar', el: 'vil', pow: 13, sp: 9, all: true, lv: 3, desc: 'Tizenhárom villám a tizenharmadik órában. Villám, minden ellenség.' },
  lang: { name: 'Lángnyelv', el: 'tuz', pow: 16, sp: 4, desc: 'Cassandra rózsaszín lángja. Tűz, egy célpont.' },
  baljos: { name: 'Baljós jel', el: 'psz', pow: 13, sp: 5, stun: .45, desc: 'Egy jóslat, amit senki sem akar hallani. Psziché, gyakran megbénít.' },
  gyogyir: { name: 'Gyógyír', el: 'gyo', pow: 32, sp: 5, heal: true, desc: 'Cassandra tudja, mi fog fájni. És előre begyógyítja. Egy szövetséges.' },
};

const ENEMIES = {
  faceless: { name: 'Arctalan', hp: 34, atk: 7, weak: ['vil'], resist: ['fiz'], nul: [], xp: 12, big: 'faceless',
    moves: [{ name: 'Közöny', text: 'Az Arctalan átnéz rajtad. Fáj.', pow: 1 }, { name: 'Tolongás', text: 'A szürke tömeg nekedlök.', pow: 1.2 }] },
  umbrella: { name: 'Esernyős árny', hp: 44, atk: 9, weak: ['tuz'], resist: [], nul: ['vil'], xp: 16, big: 'umbrella',
    moves: [{ name: 'Fekete eső', text: 'Az esernyőről hideg, fekete eső csorog rád.', pow: 1 }, { name: 'Szúrás', text: 'Az esernyő hegye előrevág.', pow: 1.3 }] },
  porcelain: { name: 'Porcelánbaba', hp: 38, atk: 8, weak: ['fiz'], resist: ['tuz'], nul: [], xp: 14, big: 'porcelain',
    moves: [{ name: 'Kacagás', text: '„Anya! Anya!” A kacagás megreped, mint az üveg.', pow: 1 }, { name: 'Szilánk', text: 'Egy éles porcelándarab repül feléd.', pow: 1.25 }] },
  nightingale: { name: 'A Fülemüle Visszhangja', hp: 190, atk: 12, weak: [], resist: [], nul: [], xp: 80, big: 'nightingale', boss: true,
    veils: [
      { name: 'Reflektorfény', truth: 't_senki', hint: 'A fátyol mögött egy hang: „…ha eltűnnék, észrevennék? Nem engem…”' },
      { name: 'Vacsoraasztal', truth: 't_otthon', hint: 'A fátyol mögött egy hang: „…minden vasárnap az ablakban… vártam…”' },
      { name: 'Aranykalitka', truth: 't_kalitka', hint: 'A fátyol mögött egy hang: „…ez nem az én dalom… elvette…”' },
    ],
    moves: [{ name: 'Reflektorfény', text: 'Vakító fénycsóva vág beléd.', pow: 1.25 }, { name: 'Ráadás!', text: 'Egy egész stadion tapsa zúdul rátok.', pow: .8, all: true }, { name: 'Aranykalitka', text: 'Arany rácsok zárulnak köréd.', pow: .6, stun: true }, { name: 'Taps', text: 'A Visszhang meghajol. A taps begyógyítja.', heal: 16 }] },
};

const bigCache = {};
function bigCanvas(kind) { return (bigCache[kind] ||= BIG[kind]()); }

export class Party {
  constructor(game) { this.g = game; }
  get s() { return this.g.state; }
  maxHp(m) { const lv = this.s.party.lv; return m === 'ivy' ? 52 + (lv - 1) * 7 : 60 + (lv - 1) * 8; }
  maxSp(m) { const lv = this.s.party.lv; return m === 'ivy' ? 34 + (lv - 1) * 5 : 30 + (lv - 1) * 5; }
  restore() {
    const p = this.s.party;
    p.hp = this.maxHp('player'); p.sp = this.maxSp('player');
    p.ivy = { hp: this.maxHp('ivy'), sp: this.maxSp('ivy') };
  }
}

export class Battle {
  constructor(game) { this.g = game; this.el = document.getElementById('battle'); }

  async start({ enemies, boss = false, canFlee = true, tutorial = false }) {
    const g = this.g, s = g.state, P = g.party;
    this.boss = boss; this.tutorial = tutorial; this.truthsUsed = 0; this.listened = 0;
    g.ui.hud(false);
    const prevMood = g.audio.mood;
    g.audio.setMusic(true, 'battle');
    g.engine.tweakPost({ tilt: 1, range: 0.18, sat: (g.engine.post.target.sat ?? 1) * 0.7 });
    g.engine.flash([1, 1, 1], .8); g.audio.sfx('hit');
    // résztvevők
    this.party = [{ id: 'player', name: s.name.toUpperCase(), persona: 'Dupin', hp: s.party.hp, sp: s.party.sp, mhp: P.maxHp('player'), msp: P.maxSp('player'), skills: ['villamszo', 'logika', 'dedukcio', ...(s.party.lv >= 3 ? ['vihar'] : [])], sprite: g.content.PLAYER_SPRITE, guard: false, stun: 0 }];
    if (s.facts.ivy_awake) this.party.push({ id: 'ivy', name: 'IVY', persona: 'Cassandra', hp: s.party.ivy.hp, sp: s.party.ivy.sp, mhp: P.maxHp('ivy'), msp: P.maxSp('ivy'), skills: ['lang', 'baljos', 'gyogyir'], sprite: g.content.NPCS.ivy.sprite, guard: false, stun: 0 });
    this.foes = enemies.map((k, i) => { const d = ENEMIES[k]; return { key: k, i, ...d, mhp: d.hp, hp: d.hp, down: false, stun: 0, known: new Set(), veil: d.veils ? 0 : -1, crit: false }; });
    this.render();
    this.el.hidden = false;
    g.ui.modal++;
    await this.log(boss ? 'A Visszhang kitárja tollszárnyait!' : tutorial ? 'Egy árny állja utadat!' : 'Árnyak!', 900);
    if (tutorial) await this.log('Tipp: keresd a gyengeséget! Az Arctalan nem bírja a villámot.', 1600);
    let result = null;
    let round = 0;
    while (!result) {
      round++;
      // játékos köre
      for (const m of this.party) {
        if (result) break;
        if (m.hp <= 0) continue;
        if (m.stun > 0) { m.stun--; await this.log(`${m.name} nem tud mozdulni az arany rácsok között!`, 800); continue; }
        m.guard = false;
        let more = true, extra = false;
        while (more && !result) {
          more = false;
          this.active = m; this.renderParty();
          const act = await this.chooseAction(m, canFlee);
          if (act.type === 'flee') { if (Math.random() < .6) { await this.log('Sikerült elmenekülni!', 700); result = 'flee'; break; } await this.log('Nem sikerült elmenekülni!', 700); break; }
          const hitWeak = await this.execute(m, act);
          if (this.foes.every(f => f.hp <= 0)) { result = 'win'; break; }
          if (hitWeak && !extra) {
            extra = true;
            if (this.foes.filter(f => f.hp > 0).every(f => f.down)) {
              const ok = await this.allOutPrompt();
              if (ok) { await this.allOut(); if (this.foes.every(f => f.hp <= 0)) { result = 'win'; break; } }
            } else { this.oneMore(); await sleep(700); more = true; }
          }
        }
      }
      if (result) break;
      // ellenség köre
      for (const f of this.foes) {
        if (f.hp <= 0) continue;
        if (f.down) { f.down = false; this.renderFoes(); continue; }
        if (f.stun > 0) { f.stun--; await this.log(`${f.name} megbénult a jóslattól!`, 700); continue; }
        await this.enemyAct(f, round);
        if (this.party.every(m => m.hp <= 0)) { result = 'lose'; break; }
      }
    }
    // eredmény
    this.active = null;
    if (result === 'win') {
      const xp = this.foes.reduce((a, f) => a + f.xp, 0);
      await this.log(`GYŐZELEM! +${xp} tapasztalat`, 1000);
      s.party.xp += xp;
      const steps = [0, 30, 75, 130, 200];
      let lv = 1; for (let i = 0; i < steps.length; i++) if (s.party.xp >= steps[i]) lv = i + 1;
      if (lv > s.party.lv) { s.party.lv = lv; g.audio.sfx('rank'); await this.log(`SZINTLÉPÉS! Dupin ${lv}. szint${lv === 3 ? ' · Új képesség: Éjféli vihar' : ''}`, 1500); }
    }
    // állapot vissza
    const pl = this.party[0];
    s.party.hp = Math.max(1, pl.hp); s.party.sp = pl.sp;
    const iv = this.party.find(m => m.id === 'ivy'); if (iv) s.party.ivy = { hp: Math.max(1, iv.hp), sp: iv.sp };
    this.el.hidden = true; this.el.innerHTML = '';
    g.ui.modal--;
    g.ui.hud(true);
    g.engine.tweakPost(g.world?.env?.post ? { ...g.world.env.post } : {});
    g.audio.setMusic(true, prevMood === 'battle' ? 'dream' : prevMood);
    if (result === 'win' && !this.tutorial) addLog(g, boss ? 'A Fülemüle árnyékával harcoltam a színpadon.' : 'Árnyak az álomban. Dupin nem hátrált.');
    return { result, truthsUsed: this.truthsUsed, listened: this.listened };
  }

  // ---------------- megjelenítés ----------------
  render() {
    this.el.innerHTML = `<div class="b-log"><span id="bLog"></span></div><div class="b-enemies" id="bFoes"></div><div class="b-persona" id="bPersona"></div><div class="b-cmd" id="bCmd"></div><div class="b-party" id="bParty"></div>`;
    this.renderFoes(); this.renderParty();
  }
  renderFoes() {
    const wrap = this.el.querySelector('#bFoes');
    if (!wrap.children.length) {
      for (const f of this.foes) {
        const d = document.createElement('div');
        d.className = 'b-en' + (f.boss ? ' boss' : '');
        const c = document.createElement('canvas'); const src = bigCanvas(f.big); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0);
        d.appendChild(c);
        d.insertAdjacentHTML('beforeend', `<div class="ehp"><i></i></div><div class="nm"></div>${f.veils ? '<div class="veils"></div>' : ''}`);
        wrap.appendChild(d); f.el = d;
      }
    }
    for (const f of this.foes) {
      f.el.classList.toggle('dead', f.hp <= 0);
      f.el.querySelector('.ehp i').style.width = Math.max(0, f.hp / f.mhp * 100) + '%';
      const weakTxt = f.known.size ? ' · ' + [...f.known].map(e => 'gyenge: ' + EL[e]).join(', ') : '';
      f.el.querySelector('.nm').textContent = f.name + (f.down ? ' · LENT' : '') + weakTxt;
      if (f.veils) f.el.querySelector('.veils').innerHTML = f.veils.map((v, i) => `<i class="${i < f.veil ? 'broken' : ''}" title="${v.name}"></i>`).join('');
      f.el.style.transform = f.down ? 'rotate(-8deg) translateY(10px)' : '';
    }
  }
  renderParty() {
    const wrap = this.el.querySelector('#bParty');
    wrap.innerHTML = '';
    for (const m of this.party) {
      const d = document.createElement('div');
      d.className = 'b-mem' + (this.active === m ? ' act' : '') + (m.hp <= 0 ? ' ko' : '');
      const c = document.createElement('canvas'); c.width = 40; c.height = 40; drawPortrait(c, m.sprite);
      d.appendChild(c);
      d.insertAdjacentHTML('beforeend', `<div><div class="n">${m.name} <small style="font-family:var(--noir);font-style:italic;color:var(--dream);font-size:12px">${m.persona}</small></div>
        <div class="row">ÉP <div class="bar hp"><i style="width:${m.hp / m.mhp * 100}%"></i></div> ${m.hp}</div>
        <div class="row">LP <div class="bar sp"><i style="width:${m.sp / m.msp * 100}%"></i></div> ${m.sp}</div></div>`);
      wrap.appendChild(d);
    }
  }
  async log(t, ms = 900) { const l = this.el.querySelector('#bLog'); if (l) l.textContent = t; if (ms) await sleep(window.__fast ? 20 : ms); }
  popup(target, text, cls = '') {
    const host = target.el ?? this.el.querySelector('#bParty');
    const r = host.getBoundingClientRect(), d = document.createElement('div');
    d.className = 'dmg ' + cls; d.textContent = text;
    d.style.left = (r.left + r.width / 2 - 20 + (Math.random() - .5) * 30) + 'px'; d.style.top = (r.top + r.height * .3) + 'px';
    document.getElementById('app').appendChild(d);
    setTimeout(() => d.remove(), 1000);
  }
  oneMore() {
    const d = document.createElement('div'); d.className = 'onemore'; d.textContent = 'TÖBB!';
    this.el.appendChild(d); setTimeout(() => d.remove(), 1000);
    this.g.audio.sfx('weak');
  }
  summon(m) {
    const p = this.el.querySelector('#bPersona');
    p.innerHTML = ''; const src = bigCanvas(m.id === 'ivy' ? 'cassandra' : 'dupin');
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); p.appendChild(c);
    p.classList.remove('on'); void p.offsetWidth; p.classList.add('on');
    this.g.audio.sfx('summon');
  }

  // ---------------- menük ----------------
  menu(items, { title = null, back = false } = {}) {
    const box = this.el.querySelector('#bCmd'), ui = this.g.ui, inp = this.g.input;
    if (back) items = [...items, { label: '← VISSZA', desc: 'Vissza az előző menübe.', isBack: true }];
    box.innerHTML = '';
    let sel = items.findIndex(i => !i.disabled); if (sel < 0) sel = 0;
    const desc = document.createElement('div'); desc.className = 'desc';
    const btns = items.map((it, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ch';
      b.innerHTML = `<span>${it.label}${it.sub ? `<small>${it.sub}</small>` : ''}</span>`;
      if (it.disabled) b.setAttribute('disabled', '');
      b.onmouseenter = () => { if (!it.disabled) { sel = i; draw(); } };
      b.onclick = (e) => { e.stopPropagation(); if (!it.disabled) done(i); };
      box.appendChild(b); return b;
    });
    box.appendChild(desc);
    const draw = () => { btns.forEach((b, i) => b.classList.toggle('sel', i === sel)); desc.textContent = items[sel]?.desc ?? title ?? ''; };
    draw();
    let done;
    return new Promise(res => {
      const mv = (d) => { let n = sel; for (let k = 0; k < items.length; k++) { n = (n + d + items.length) % items.length; if (!items[n].disabled) break; } sel = n; draw(); this.g.audio.sfx('move'); };
      const offs = [inp.on('up', () => mv(-1)), inp.on('down', () => mv(1)), inp.on('act', () => { if (!items[sel].disabled) done(sel); }), inp.on('back', () => done(-1))];
      done = (i) => { if (i >= 0 && items[i].isBack) i = -1; offs.forEach(o => o()); box.innerHTML = ''; this.g.audio.sfx(i < 0 ? 'back' : 'ok'); res(i); };
      void ui;
    });
  }
  pickTarget(list) {
    const inp = this.g.input;
    if (list.length === 1) return Promise.resolve(list[0]);
    let sel = 0;
    const draw = () => list.forEach((f, i) => f.el?.classList.toggle('sel', i === sel));
    draw();
    const box = this.el.querySelector('#bCmd');
    box.innerHTML = '<button type="button" class="ch sel"><span>← VISSZA</span></button><div class="desc">Válassz célpontot: koppints rá, vagy nyilak + E.</div>';
    return new Promise(res => {
      const fin = (v) => { offs.forEach(o => o()); box.innerHTML = ''; list.forEach(f => { f.el?.classList.remove('sel'); if (f.el) f.el.onclick = null; }); res(v); };
      box.querySelector('button').onclick = (e) => { e.stopPropagation(); fin(null); };
      list.forEach((f, i) => { if (f.el) f.el.onclick = () => fin(list[i]); });
      const offs = [inp.on('left', () => { sel = (sel + list.length - 1) % list.length; draw(); }), inp.on('right', () => { sel = (sel + 1) % list.length; draw(); }),
        inp.on('up', () => { sel = (sel + list.length - 1) % list.length; draw(); }), inp.on('down', () => { sel = (sel + 1) % list.length; draw(); }),
        inp.on('act', () => fin(list[sel])), inp.on('back', () => fin(null))];
    });
  }

  async chooseAction(m, canFlee) {
    const g = this.g, s = g.state;
    for (;;) {
      await this.log(`${m.name} köre`, 0);
      const items = [
        { id: 'attack', label: 'TÁMADÁS', desc: 'Sima fizikai ütés.' },
        { id: 'persona', label: 'PERSONA', sub: m.persona, desc: `${m.persona} képességei (LP-be kerülnek).` },
      ];
      if (this.boss && m.id === 'player') items.push({ id: 'truth', label: 'IGAZSÁG', disabled: !s.truths.length, desc: 'Kimondasz egy igazságot, amit a nyomozásod vagy az álmok során tudtál meg. A megfelelő igazság átszakítja a fátylat.' });
      items.push({ id: 'listen', label: 'MEGHALLGATÁS', desc: 'Nem támadsz, hanem figyelsz. Gyengíti az ellenség következő csapását' + (this.boss ? ', és elárulja, mi van a fátyol mögött.' : '.') });
      items.push({ id: 'item', label: 'TÁRGY', desc: `Teás termosz ×${s.items.tea ?? 0} · Mentolos cukorka ×${s.items.mint ?? 0}`, disabled: !((s.items.tea ?? 0) + (s.items.mint ?? 0)) });
      items.push({ id: 'guard', label: 'VÉDEKEZÉS', desc: 'Felére csökkenti a kapott sebzést a következő körig.' });
      if (canFlee) items.push({ id: 'flee', label: 'MENEKÜLÉS', desc: 'Vissza a ködbe. Nem mindig sikerül.' });
      const i = await this.menu(items);
      if (i < 0) continue;
      const id = items[i].id;
      const alive = this.foes.filter(f => f.hp > 0);
      if (id === 'flee') return { type: 'flee' };
      if (id === 'guard') return { type: 'guard' };
      if (id === 'listen') { const t = await this.pickTarget(alive); if (t) return { type: 'listen', target: t }; continue; }
      if (id === 'attack') { const t = await this.pickTarget(alive); if (t) return { type: 'skill', skill: 'attack', target: t }; continue; }
      if (id === 'persona') {
        const sk = m.skills.map(k => ({ id: k, label: SKILLS[k].name, sub: SKILLS[k].sp ? `${SKILLS[k].sp} LP` : '', desc: SKILLS[k].desc, disabled: m.sp < SKILLS[k].sp }));
        const j = await this.menu(sk, { back: true });
        if (j < 0) continue;
        const key = sk[j].id, def = SKILLS[key];
        if (def.all) return { type: 'skill', skill: key, all: true };
        if (def.heal) {
          const allies = this.party.filter(p => p.hp > 0);
          const k = allies.length === 1 ? 0 : await this.menu(allies.map(a => ({ label: a.name, desc: `ÉP ${a.hp}/${a.mhp}` })), { back: true });
          if (k < 0) continue;
          return { type: 'skill', skill: key, ally: allies[k] };
        }
        const t = await this.pickTarget(alive);
        if (t) return { type: 'skill', skill: key, target: t };
        continue;
      }
      if (id === 'truth') {
        const T = g.content.TRUTHS;
        const list = Object.keys(T).map(k => ({ id: k, label: s.truths.includes(k) ? T[k].name : '???', desc: s.truths.includes(k) ? T[k].desc : T[k].hint, disabled: !s.truths.includes(k) }));
        const j = await this.menu(list, { back: true });
        if (j < 0) continue;
        return { type: 'truth', truth: list[j].id, target: alive[0] };
      }
      if (id === 'item') {
        const its = [{ id: 'tea', label: `Teás termosz ×${s.items.tea ?? 0}`, desc: g.content.ITEMS.tea.desc, disabled: !(s.items.tea > 0) }, { id: 'mint', label: `Mentolos cukorka ×${s.items.mint ?? 0}`, desc: g.content.ITEMS.mint.desc, disabled: !(s.items.mint > 0) }];
        const j = await this.menu(its, { back: true });
        if (j < 0) continue;
        const allies = this.party.filter(p => p.hp > 0);
        const k = allies.length === 1 ? 0 : await this.menu(allies.map(a => ({ label: a.name, desc: `ÉP ${a.hp}/${a.mhp} · LP ${a.sp}/${a.msp}` })), { back: true });
        if (k < 0) continue;
        return { type: 'item', item: its[j].id, ally: allies[k] };
      }
    }
  }

  // ---------------- végrehajtás ----------------
  async execute(m, act) {
    const g = this.g, s = g.state;
    if (act.type === 'guard') { m.guard = true; await this.log(`${m.name} védekezik.`, 600); return false; }
    if (act.type === 'item') {
      const it = g.content.ITEMS[act.item]; s.items[act.item]--;
      if (it.hp) { act.ally.hp = Math.min(act.ally.mhp, act.ally.hp + it.hp); this.popup(act.ally, '+' + it.hp, 'heal'); }
      if (it.sp) { act.ally.sp = Math.min(act.ally.msp, act.ally.sp + it.sp); this.popup(act.ally, '+' + it.sp + ' LP', 'heal'); }
      g.audio.sfx('heal'); this.renderParty();
      await this.log(`${it.name}: ${act.ally.name}`, 700);
      return false;
    }
    if (act.type === 'listen') {
      const f = act.target; f.calm = true; this.listened++;
      await this.log(`${m.name} figyel. Nem támad, csak figyel.`, 900);
      if (f.veils && f.veil < f.veils.length) await this.log(f.veils[f.veil].hint, 2600);
      else if (f.weak.length) { f.weak.forEach(e => f.known.add(e)); this.renderFoes(); await this.log(`${f.name}: a mozdulataiból kiderül, mitől fél.`, 1100); }
      return false;
    }
    if (act.type === 'truth') return this.truth(m, act);
    const sk = SKILLS[act.skill];
    m.sp -= sk.sp;
    if (act.skill !== 'attack') { this.summon(m); await this.log(`${m.persona}: ${sk.name}!`, 700); }
    else await this.log(`${m.name}: támadás!`, 450);
    if (sk.heal) { const a = act.ally; a.hp = Math.min(a.mhp, a.hp + sk.pow); this.popup(a, '+' + sk.pow, 'heal'); g.audio.sfx('heal'); this.renderParty(); return false; }
    if (act.skill === 'dedukcio') {
      const f = act.target; f.weak.forEach(e => f.known.add(e)); f.crit = true; this.renderFoes();
      await this.log(f.weak.length ? `Dedukció: ${f.name} gyengéje: ${f.weak.map(e => EL[e]).join(', ')}.` : `Dedukció: ${f.name} nem gyenge semmire. Csak az igazság sebzi.`, 1400);
      this.renderParty(); return false;
    }
    let weakHit = false;
    const targets = act.all ? this.foes.filter(f => f.hp > 0) : [act.target];
    for (const f of targets) weakHit = (await this.hit(m, f, sk)) || weakHit;
    this.renderParty(); this.renderFoes();
    return weakHit;
  }

  async hit(m, f, sk) {
    const g = this.g;
    let dmg = sk.pow * (0.9 + Math.random() * 0.25) * (1 + (g.state.party.lv - 1) * 0.12);
    let weak = false, cls = '';
    if (f.nul.includes(sk.el)) { this.popup(f, 'HATÁSTALAN', 'null'); await this.log(`${f.name}: az esernyő elnyeli a villámot!`, 700); return false; }
    if (f.weak.includes(sk.el)) { dmg *= 1.6; weak = true; cls = 'weak'; f.known.add(sk.el); }
    if (f.resist.includes(sk.el)) { dmg *= 0.5; cls = 'null'; }
    if (f.crit) { dmg *= 1.5; f.crit = false; weak = true; cls = 'weak'; }
    if (f.veils && f.veil < f.veils.length) dmg *= 0.5;
    dmg = Math.max(1, Math.round(dmg));
    f.hp = Math.max(0, f.hp - dmg);
    f.el.classList.remove('hit'); void f.el.offsetWidth; f.el.classList.add('hit');
    this.popup(f, (weak ? 'GYENGE! ' : '') + dmg, cls);
    g.audio.sfx(weak ? 'weak' : 'hit'); g.engine.shake = weak ? .5 : .25;
    if (weak && f.hp > 0 && !f.boss) f.down = true;
    if (weak && f.boss && f.veil >= f.veils.length) f.down = true;
    if (sk.stun && Math.random() < sk.stun && f.hp > 0) { f.stun = 1; await this.log(`${f.name} megbénult!`, 500); }
    this.renderFoes();
    if (f.boss && f.hp > 0 && Math.random() < .5) await this.log('„' + g.grammar.expand('#taunt_hit#', makeCtx(g, null)) + '”', 900);
    else await sleep(500);
    if (f.hp <= 0) await this.log(`${f.name} szertefoszlik a ködben.`, 600);
    return weak;
  }

  async truth(m, act) {
    const g = this.g, f = act.target, s = g.state;
    const T = g.content.TRUTHS[act.truth];
    this.summon(m);
    await this.log(`${m.name}: „${T.name.replace(/[„”]/g, '')}”`, 1200);
    if (!f.veils || f.veil >= f.veils.length) { await this.log('Már nincs fátyol, amit átszakíthatna. Most csak a kitartás számít.', 1000); return false; }
    const v = f.veils[f.veil];
    if (v.truth === act.truth) {
      f.veil++; this.truthsUsed++;
      g.engine.flash([1, 1, 1], .9); g.engine.shake = .9; g.audio.sfx('clue');
      f.hp = Math.max(1, f.hp - 28); f.down = true;
      this.popup(f, 'IGAZSÁG!', 'weak');
      this.renderFoes();
      const lines = {
        t_senki: 'A reflektor kialszik. A Visszhang hunyorog a sötétben: „Te… engem nézel? Nem a Fülemülét?”',
        t_otthon: 'A vacsoraasztal képe összetörik. „Minden vasárnap… az ablakban… Honnan tudod?”',
        t_kalitka: 'Az aranyrácsok megolvadnak. „Ez nem az én dalom. Soha nem volt az enyém!”',
      };
      await this.log(lines[act.truth], 2400);
      if (f.veil >= f.veils.length) await this.log('Az utolsó fátyol is lehullott! Most minden csapás eltalálja.', 1300);
      return true;
    }
    f.hp = Math.min(f.mhp, f.hp + 18);
    this.popup(f, '+18', 'heal');
    this.renderFoes();
    await this.log(`A Visszhang felnevet. „Nem ez fáj, nyomozó. Nem ez.” (A fátyol: ${v.name})`, 1600);
    void s;
    return false;
  }

  allOutPrompt() {
    return this.menu([{ label: 'ÖSSZTÁMADÁS!', desc: 'Minden ellenség a földön. Rajta!' }, { label: 'Mégse', desc: 'Inkább óvatosan.' }]).then(i => i === 0);
  }
  async allOut() {
    const g = this.g;
    await this.log('ÖSSZTÁMADÁS!', 300);
    for (let k = 0; k < 5; k++) { g.engine.flash(k % 2 ? [1, .2, .3] : [1, 1, 1], .5); g.engine.shake = .8; g.audio.sfx('hit'); await sleep(140); }
    for (const f of this.foes.filter(f => f.hp > 0)) {
      const dmg = Math.round(22 + Math.random() * 14 + this.party.filter(p => p.hp > 0).length * 6);
      f.hp = Math.max(0, f.hp - dmg); f.down = false;
      this.popup(f, dmg, 'weak');
    }
    this.renderFoes();
    await sleep(700);
  }

  async enemyAct(f, round) {
    const g = this.g;
    const alive = this.party.filter(p => p.hp > 0);
    let mv = f.moves[(Math.random() * f.moves.length) | 0];
    if (f.boss) {
      if (round % 4 === 0 && f.hp < f.mhp * .7) mv = f.moves[3];
      else mv = f.moves[(Math.random() * 3) | 0];
      if (Math.random() < .5) {
        const vars = g.dlg.deedVars('lyra');
        await this.log('„' + g.grammar.expand('#taunt#', makeCtx(g, null, vars)) + '”', 1500);
      }
    }
    await this.log(`${f.name}: ${mv.name}`, 600);
    if (mv.heal) { f.hp = Math.min(f.mhp, f.hp + mv.heal); this.popup(f, '+' + mv.heal, 'heal'); this.renderFoes(); await this.log(mv.text, 800); return; }
    const targets = mv.all ? alive : [alive[(Math.random() * alive.length) | 0]];
    for (const t of targets) {
      let dmg = f.atk * mv.pow * (0.85 + Math.random() * .3);
      if (f.calm) dmg *= 0.5;
      if (t.guard) dmg *= 0.5;
      dmg = Math.max(1, Math.round(dmg));
      t.hp = Math.max(0, t.hp - dmg);
      this.popup(t, '-' + dmg);
      g.engine.shake = .35; g.audio.sfx('hit');
      if (mv.stun && t.hp > 0 && Math.random() < .5) t.stun = 1;
      this.renderParty();
    }
    f.calm = false;
    await this.log(mv.text, 900);
    const ko = targets.filter(t => t.hp <= 0);
    for (const t of ko) await this.log(`${t.name} összeesik!`, 700);
  }
}
void statLv;
