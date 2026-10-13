// Szabályalapú párbeszédmotor (Valve-féle "dynamic dialog" mintára):
// minden szabálynak vannak feltételei; a legtöbb feltételnek megfelelő, legspecifikusabb szabály nyer.
import { makeCtx, npcMem, freshDeedFor, doDeed, gainStat, gainBond, statLv, STAT_INFO } from './logic.js';

const STAT_SHORT = { esz: 'ÉSZ', bat: 'BÁTORSÁG', emp: 'EMPÁTIA' };

export class Dialogue {
  constructor(game) { this.g = game; }
  get R() { return this.g.content.RULES; }

  voice(npcId) { return npcId ? this.g.content.NPCS[npcId]?.voice : null; }

  candidates(npcId, topic, vars = {}) {
    const ctx = makeCtx(this.g, npcId, vars);
    const m = npcId ? npcMem(this.g.state, npcId) : { said: {} };
    return this.R.filter(r => {
      const whoOk = r.who === npcId || r.who === '*' || (Array.isArray(r.who) && r.who.includes(npcId));
      if (!whoOk || r.topic !== topic) return false;
      if (r.once && (r.global ? this.g.state.facts['rule_' + r.id] : m.said[r.id])) return false;
      if (r.who === '*' && this.g.content.NPCS[npcId]?.noGeneric?.includes(topic)) return false;
      return ctx.test(r.when);
    });
  }
  score(r) {
    const n = r.when && typeof r.when === 'object' ? Object.keys(r.when).length : 0;
    return n + (r.prio ?? 0) + (r.who === '*' ? -0.5 : 0);
  }
  best(npcId, topic, vars) {
    const c = this.candidates(npcId, topic, vars);
    if (!c.length) return null;
    let top = -Infinity; for (const r of c) top = Math.max(top, this.score(r));
    const pool = c.filter(r => this.score(r) === top);
    return pool[(Math.random() * pool.length) | 0];
  }

  text(str, npcId, vars) {
    const ctx = makeCtx(this.g, npcId, vars);
    return this.g.grammar.expand(typeof str === 'function' ? str(this.g) : str, ctx, this.voice(npcId));
  }

  // egy sor lejátszása
  async line(entry, npcId, vars) {
    const ui = this.g.ui;
    if (entry == null) return;
    if (typeof entry === 'string') return ui.say(npcId, this.text(entry, npcId, vars));
    if (entry.if && !makeCtx(this.g, npcId, vars).test(entry.if)) return;
    if (entry.p != null) return ui.say('player', this.text(entry.p, npcId, vars));
    if (entry.m != null) return ui.mono(this.text(entry.m, npcId, vars));
    if (entry.n != null) return ui.say(null, this.text(entry.n, npcId, vars));
    if (entry.who) return ui.say(entry.who, this.text(entry.t, entry.who, vars));
    if (entry.t != null) return ui.say(npcId, this.text(entry.t, npcId, vars));
    if (entry.fn) return entry.fn(this.g, npcId, vars);
    if (entry.alt) { const pick = entry.alt[(Math.random() * entry.alt.length) | 0]; return this.lines(pick, npcId, vars); }
    if (entry.choice) return this.choice(entry.choice, npcId, vars);
  }
  async lines(list, npcId, vars) { for (const e of list || []) await this.line(e, npcId, vars); }

  // választás statisztika-feltételekkel ("Bátorság: Merész kell")
  async choice(opts, npcId, vars) {
    const ctx = makeCtx(this.g, npcId, vars);
    const shown = opts.filter(o => !o.if || ctx.test(o.if));
    const items = shown.map(o => {
      let tag = null, disabled = false, tagClass = '';
      if (o.need) {
        const [k, lv] = Object.entries(o.need)[0];
        const ok = statLv(this.g.state, k) >= lv;
        tag = `${STAT_SHORT[k]} ${STAT_INFO[k].ranks[lv - 1].toUpperCase()}`;
        disabled = !ok; tagClass = ok ? 'ok' : '';
      }
      if (o.tagClue) { tag = o.tagClue; tagClass = 'clue'; }
      return { label: this.text(o.label, npcId, vars), tag, tagClass, disabled };
    });
    const i = await this.g.ui.choose(items);
    const o = shown[i];
    await this.apply(o, npcId, vars);
    return o;
  }

  // szabály / opció hatásai
  async apply(r, npcId, vars) {
    const g = this.g, s = g.state;
    if (r.lines) await this.lines(r.lines, npcId, vars);
    if (r.set) Object.assign(s.facts, r.set);
    if (r.inc) for (const k in r.inc) s.facts[k] = (s.facts[k] ?? 0) + r.inc[k];
    if (r.att && npcId) npcMem(s, npcId).att += r.att;
    if (r.deed) doDeed(g, r.deed);
    if (r.clue) g.addClue(r.clue);
    if (r.stat) for (const k in r.stat) gainStat(g, k, r.stat[k]);
    if (r.bond) for (const k in r.bond) gainBond(g, k, r.bond[k]);
    if (r.item) for (const k in r.item) { s.items[k] = (s.items[k] ?? 0) + r.item[k]; g.ui.toast('TÁRGY', `${g.content.ITEMS[k]?.name ?? k} ×${r.item[k]}`); }
    if (r.run) await r.run(g, npcId, vars);
  }

  async play(npcId, rule, vars = {}) {
    if (!rule) return null;
    const m = npcId ? npcMem(this.g.state, npcId) : null;
    if (m) m.said[rule.id] = true;
    if (rule.global) this.g.state.facts['rule_' + rule.id] = true;
    if (rule.consumesDeed && vars.deedKey && m) m.commented[vars.deedKey] = true;
    await this.apply(rule, npcId, vars);
    return rule;
  }

  // egy témához tartozó legjobb szabály lejátszása
  async topic(npcId, topic, vars = {}) {
    const r = this.best(npcId, topic, vars);
    if (r) await this.play(npcId, r, vars);
    return r;
  }

  deedVars(npcId) {
    const g = this.g, fd = freshDeedFor(g, npcId);
    if (!fd) return {};
    const deed = g.state.deeds[fd.idx], def = g.content.DEEDS[deed.id];
    const srcId = fd.from && fd.from !== 'self' ? fd.from : null;
    const ctx = makeCtx(g, npcId, { srcId });
    const src = srcId ? g.content.NPCS[srcId]?.name : null;
    return {
      deedId: deed.id, deedKey: fd.key, srcId,
      deedYou: g.grammar.expand(`#deedYou_${deed.id}#`, ctx),
      deedTone: (def.tags || []).reduce((a, t) => a + (g.content.NPCS[npcId]?.values?.[t] ?? 0), 0),
      deedSrc: src, deedSelf: fd.from === 'self',
    };
  }

  gossipVars(npcId) {
    const g = this.g, s = g.state, m = npcMem(s, npcId);
    // olyan tett, amit mástól hallott
    const heard = Object.entries(m.known).filter(([k, v]) => v.from !== 'self' && !m.commented[k] && !g.content.DEEDS[s.deeds[v.idx].id]?.quiet);
    if (heard.length) {
      const [key, v] = heard[heard.length - 1];
      const deed = s.deeds[v.idx], def = g.content.DEEDS[deed.id];
      return {
        gossipDeed: true, deedKey: key, deedId: deed.id,
        gFrom: g.content.NPCS[v.from]?.name ?? 'valaki', srcId: v.from,
        deedYou: g.grammar.expand(`#deedYou_${deed.id}#`, makeCtx(g, npcId, { srcId: v.from })),
        deedTone: (def.tags || []).reduce((a, t) => a + (g.content.NPCS[npcId]?.values?.[t] ?? 0), 0),
      };
    }
    return { gossipDeed: false };
  }

  // teljes beszélgetés egy NPC-vel: köszönés → témamenü
  async talk(npcId) {
    const g = this.g, s = g.state, def = g.content.NPCS[npcId];
    const m = npcMem(s, npcId);
    const vars = this.deedVars(npcId);
    const greet = this.best(npcId, 'greet', vars);
    if (greet) await this.play(npcId, greet, vars);
    m.met++;
    if (greet?.endTalk || def?.simple) return;
    for (let guard = 0; guard < 30; guard++) {
      const opts = [];
      opts.push({ id: 'talk', label: def.talkLabel ?? 'Beszélgetés' });
      if (s.facts.case_open && !def.noCase) opts.push({ id: 'case', label: 'Lyra ügyéről kérdezed' });
      if (!def.noGossip) opts.push({ id: 'gossip', label: 'Mi újság errefelé?' });
      if (s.clues.length && !def.noPresent) opts.push({ id: 'present', label: 'Bizonyítékot mutatsz' });
      const acts = this.candidates(npcId, 'act', {});
      for (const a of acts) opts.push({ id: 'act', rule: a, label: this.text(a.label, npcId, {}), need: a.need });
      opts.push({ id: 'bye', label: def.byeLabel ?? 'Elköszönsz' });
      const items = opts.map(o => {
        if (!o.need) return { label: o.label };
        const [k, lv] = Object.entries(o.need)[0];
        const ok = statLv(s, k) >= lv;
        return { label: o.label, tag: `${STAT_SHORT[k]} ${STAT_INFO[k].ranks[lv - 1].toUpperCase()}`, tagClass: ok ? 'ok' : '', disabled: !ok };
      });
      const i = await g.ui.choose(items, { cancel: opts.length - 1 });
      const o = opts[i];
      if (o.id === 'bye') { await this.topic(npcId, 'bye', {}); break; }
      if (o.id === 'act') { await this.play(npcId, o.rule, {}); if (o.rule.endTalk) break; continue; }
      if (o.id === 'gossip') { const gv = this.gossipVars(npcId); await this.topic(npcId, 'gossip', gv); continue; }
      if (o.id === 'present') {
        const clue = await g.pickClue('Melyik nyomot mutatod meg?');
        if (!clue) continue;
        const r = this.best(npcId, 'present:' + clue, {}) || this.best(npcId, 'present', { clue: g.content.CLUES[clue].name });
        if (r) await this.play(npcId, r, { clue: g.content.CLUES[clue].name });
        continue;
      }
      const r = await this.topic(npcId, o.id, {});
      if (r?.endTalk) break;
    }
  }
}
