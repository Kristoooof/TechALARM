// Játékállapot, feltételek, NPC-emlékezet és pletykaterjedés.

export const STAT_STEPS = [0, 3, 7, 12, 18];
export const STAT_INFO = {
  esz: { name: 'ÉSZ', ranks: ['Átlagos', 'Éles', 'Ravasz', 'Briliáns', 'Dupin-i'] },
  bat: { name: 'BÁTORSÁG', ranks: ['Óvatos', 'Határozott', 'Merész', 'Rettenthetetlen', 'Oroszlánszívű'] },
  emp: { name: 'EMPÁTIA', ranks: ['Udvarias', 'Figyelmes', 'Megértő', 'Együttérző', 'Angyali'] },
};
export const SLOTS = ['reggel', 'delutan', 'este', 'ejjel'];
export const SLOT_NAME = { reggel: 'REGGEL', delutan: 'DÉLUTÁN', este: 'ESTE', ejjel: 'ÉJJEL' };
export const DOW = ['VAS', 'HÉT', 'KEDD', 'SZE', 'CSÜT', 'PÉN', 'SZOM'];
export const START = { month: 10, date: 13, dow: 1 }; // október 13., hétfő
export const LAST_DAY = 5;

export function newState(name) {
  return {
    v: 3, name: name || 'Noel', day: 1, slot: 'este', scene: 'office',
    stats: { esz: 0, bat: 0, emp: 0 },
    bonds: { ivy: 0, arthur: 0, lyra: 0, maggie: 0, tom: 0 },
    bondPts: { ivy: 0, arthur: 0, lyra: 0, maggie: 0, tom: 0 },
    clues: [], deds: [], truths: [], facts: {}, deeds: [], npc: {}, log: [],
    party: { lv: 1, xp: 0, hp: 60, sp: 30, ivy: { hp: 52, sp: 34 } },
    items: { tea: 2, mint: 1 },
    defeated: {}, ending: null, played: Date.now(),
  };
}

export function statLv(state, k) { let lv = 1; for (let i = 0; i < STAT_STEPS.length; i++) if (state.stats[k] >= STAT_STEPS[i]) lv = i + 1; return lv; }
export function statProgress(state, k) {
  const lv = statLv(state, k), cur = STAT_STEPS[lv - 1], nxt = STAT_STEPS[lv] ?? cur + 6;
  return Math.min(1, (state.stats[k] - cur) / (nxt - cur));
}
export function dateOf(day) {
  const d = START.date + day - 1;
  return { md: `${START.month}/${d}`, dow: DOW[(START.dow + day - 1) % 7] };
}

// ---------------- feltételek ----------------
// kulcs formátum: "útvonal[op]" ahol op: '' | '!' | '>' | '>=' | '<' | '<='
const OPS = ['>=', '<=', '!=', '>', '<', '!'];
export function test(cond, get) {
  if (!cond) return true;
  if (typeof cond === 'function') return !!cond(get);
  for (const raw in cond) {
    const want = cond[raw];
    if (raw === 'any') { if (!want.some(c => test(c, get))) return false; continue; }
    if (raw === 'not') { if (test(want, get)) return false; continue; }
    let op = '', key = raw;
    for (const o of OPS) if (raw.endsWith(o)) { op = o; key = raw.slice(0, -o.length); break; }
    const v = get(key);
    let ok;
    switch (op) {
      case '>': ok = (v ?? 0) > want; break;
      case '>=': ok = (v ?? 0) >= want; break;
      case '<': ok = (v ?? 0) < want; break;
      case '<=': ok = (v ?? 0) <= want; break;
      case '!': case '!=': ok = want === true ? !v : want === false ? !!v : v !== want; break;
      default: ok = want === true ? !!v : want === false ? !v : v === want;
    }
    if (!ok) return false;
  }
  return true;
}

export function npcMem(state, id) {
  return (state.npc[id] ||= { att: 0, met: 0, known: {}, said: {}, commented: {}, mood: 0 });
}

// egy NPC szemszögéből olvasható kontextus
export function makeGetter(game, npcId, vars = {}) {
  const s = game.state;
  return (path) => {
    const dot = path.indexOf('.');
    const head = dot < 0 ? path : path.slice(0, dot), rest = dot < 0 ? '' : path.slice(dot + 1);
    switch (head) {
      case 'f': return s.facts[rest];
      case 'clue': return s.clues.includes(rest);
      case 'ded': return s.deds.includes(rest);
      case 'truth': return s.truths.includes(rest);
      case 'stat': return statLv(s, rest);
      case 'bond': return s.bonds[rest] ?? 0;
      case 'item': return s.items[rest] ?? 0;
      case 'day': return s.day;
      case 'slot': return s.slot;
      case 'scene': return s.scene;
      case 'clues': return s.clues.length;
      case 'deed': return s.deeds.some(d => d.id === rest);
      case 'rand': return Math.random();
      case 'v': return vars[rest];
      case 'npc': {
        const m = npcMem(s, npcId);
        if (rest.startsWith('knows.')) { const d = rest.slice(6) + '#'; return Object.keys(m.known).some(k => k.startsWith(d)); }
        if (rest === 'newDeed') return !!vars.deedId;
        return m[rest];
      }
      case 'heard': { const d = rest + '#'; return Object.keys(npcMem(s, npcId).known).some(k => k.startsWith(d)); }
      case 'said': return !!npcMem(s, npcId).said[rest];
      case 'other': { const [id, k] = rest.split('.'); return npcMem(s, id)[k]; }
      default: return s[head];
    }
  };
}

export function makeCtx(game, npcId, vars = {}) {
  const get = makeGetter(game, npcId, { ...vars, speaker: npcId ?? '' });
  const npc = npcId ? game.content.NPCS[npcId] : null;
  return {
    get, vars: { player: game.state.name, npc: npc?.name ?? '', ...vars, speaker: npcId ?? '' },
    test: (c) => test(c, get),
  };
}

// ---------------- tettek és pletyka ----------------
export function attitudeDelta(npcDef, deedDef, hearsay) {
  if (!npcDef || !deedDef) return 0;
  let d = 0;
  for (const t of deedDef.tags || []) d += npcDef.values?.[t] ?? 0;
  return hearsay ? d * 0.5 : d;
}

export function learn(game, npcId, deedIdx, from) {
  const s = game.state, m = npcMem(s, npcId);
  const deed = s.deeds[deedIdx];
  const key = deed.id + '#' + deedIdx;
  if (m.known[key]) return false;
  m.known[key] = { from, day: s.day, idx: deedIdx };
  const def = game.content.DEEDS[deed.id];
  m.att += attitudeDelta(game.content.NPCS[npcId], def, from !== 'self');
  return true;
}

// a játékos egy tette: a jelenlévők látják, később terjed
export function doDeed(game, id, { witnesses = null, place = null, note = null } = {}) {
  const s = game.state;
  const def = game.content.DEEDS[id];
  const idx = s.deeds.push({ id, day: s.day, slot: s.slot, place: place ?? s.scene, note }) - 1;
  const present = witnesses ?? (game.world ? game.world.witnesses(9) : []);
  // akivel épp beszélsz, az mindig tanú
  if (!witnesses && game.talkingWith && !present.includes(game.talkingWith)) present.push(game.talkingWith);
  for (const n of present) if (game.content.NPCS[n]) learn(game, n, idx, 'self');
  if (def?.log) addLog(game, game.grammar.expand(def.log, makeCtx(game, null)));
  return idx;
}

// időszak-váltáskor: aki tud valamit, továbbadja a kapcsolatainak
export function spreadGossip(game) {
  const s = game.state, N = game.content.NPCS, D = game.content.DEEDS;
  const news = [];
  const ids = Object.keys(N);
  // először gyűjtünk, aztán alkalmazunk, hogy egy körben csak egy "ugrás" legyen
  const pending = [];
  for (const a of ids) {
    const ma = npcMem(s, a);
    for (const [b, strength] of Object.entries(N[a].links || {})) {
      for (const key in ma.known) {
        const { idx } = ma.known[key];
        const deed = s.deeds[idx];
        const def = D[deed.id];
        if (!def) continue;
        if (npcMem(s, b).known[key]) continue;
        const p = (def.spread ?? 0.5) * strength * (N[a].gossipy ?? 1);
        if (Math.random() < p) pending.push({ a, b, idx });
      }
    }
  }
  for (const { a, b, idx } of pending) {
    if (learn(game, b, idx, a)) news.push({ from: a, to: b, idx });
  }
  return news;
}

// az NPC által ismert, még nem kommentált legfrissebb tett
export function freshDeedFor(game, npcId) {
  const s = game.state, m = npcMem(s, npcId);
  let best = null;
  for (const key in m.known) {
    if (m.commented[key]) continue;
    const k = m.known[key];
    const def = game.content.DEEDS[s.deeds[k.idx].id];
    if (!def || def.quiet) continue;
    if (!best || k.idx > best.idx) best = { ...k, key };
  }
  return best;
}

export function addLog(game, text) {
  const s = game.state;
  s.log.push({ day: s.day, slot: s.slot, t: text });
  if (s.log.length > 120) s.log.shift();
}

export function gainStat(game, k, n = 1) {
  const s = game.state;
  const before = statLv(s, k);
  s.stats[k] += n;
  const after = statLv(s, k);
  game.ui.toast(`${STAT_INFO[k].name} +${n}`, after > before ? `Új szint: ${STAT_INFO[k].ranks[after - 1]}` : '', 'stat');
  if (after > before) game.audio?.sfx('rank');
}

export const BOND_STEPS = [0, 2, 5, 9, 14, 20];
export function gainBond(game, k, n = 1) {
  const s = game.state;
  s.bondPts[k] = (s.bondPts[k] ?? 0) + n;
  let lv = 0;
  for (let i = 0; i < BOND_STEPS.length; i++) if (s.bondPts[k] >= BOND_STEPS[i]) lv = i;
  const up = lv > (s.bonds[k] ?? 0);
  s.bonds[k] = lv;
  const nm = game.content.NPCS[k]?.name ?? k;
  game.ui.toast(up ? `KÖTELÉK ↑` : 'KÖTELÉK', up ? `${nm}: ${lv}. szint` : `${nm} közelebb került hozzád`, 'bond');
  if (up) game.audio?.sfx('rank');
}
