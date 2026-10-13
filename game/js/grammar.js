// Szóbank-alapú szöveggenerátor (Tracery-szerű), feltételes alternatívákkal.
//   #kulcs#        → véletlen elem a szóbankból (rekurzívan kifejtve)
//   #kulcs.cap#    → nagy kezdőbetűvel
//   {valtozo}      → a kontextus változója (pl. {player}, {npc})
//   alternatíva lehet objektum is: { t: 'szöveg', if: {feltétel}, w: súly }

export function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// magyar névelő: "a" magánhangzó előtt "az"
const VOWEL = 'aáeéiíoóöőuúüűAÁEÉIÍOÓÖŐUÚÜŰ';
export function fixArticles(s) {
  return s.replace(/(^|[\s„(«—–-])([Aa])\s+(?=(\S))/g, (m, pre, a, next) => (VOWEL.includes(next) ? `${pre}${a}z ` : m));
}

export class Grammar {
  constructor(banks) { this.banks = banks; this.last = new Map(); }
  options(key, ctx, overlay) {
    const src = (overlay && overlay[key]) || this.banks[key];
    if (!src) return null;
    return src.filter(o => typeof o === 'string' || !o.if || (ctx && ctx.test(o.if)));
  }
  pick(key, ctx, overlay) {
    const opts = this.options(key, ctx, overlay);
    if (!opts || !opts.length) return '';
    // ismétlés kerülése: ugyanazt kétszer egymás után ne
    const last = this.last.get(key);
    let pool = opts.length > 1 ? opts.filter(o => (typeof o === 'string' ? o : o.t) !== last) : opts;
    if (!pool.length) pool = opts;
    let total = 0;
    for (const o of pool) total += (typeof o === 'string' ? 1 : (o.w ?? 1));
    let r = Math.random() * total, chosen = pool[0];
    for (const o of pool) { r -= (typeof o === 'string' ? 1 : (o.w ?? 1)); if (r <= 0) { chosen = o; break; } }
    const text = typeof chosen === 'string' ? chosen : chosen.t;
    this.last.set(key, text);
    return text;
  }
  expand(str, ctx, overlay, depth = 0) {
    if (depth > 12 || !str) return str || '';
    let out = str.replace(/#([\w]+)((?:\.[\w]+)*)#/g, (m, key, mods) => {
      let v = this.expand(this.pick(key, ctx, overlay), ctx, overlay, depth + 1);
      for (const mod of mods.split('.').filter(Boolean)) {
        if (mod === 'cap') v = cap(v);
        else if (mod === 'upper') v = v.toUpperCase();
        else if (mod === 'lower') v = v.toLowerCase();
      }
      return v;
    });
    out = out.replace(/\{(\w+)\}/g, (m, k) => {
      const v = ctx && ctx.vars ? ctx.vars[k] : undefined;
      return v == null ? m : String(v);
    });
    if (depth === 0) out = fixArticles(out.replace(/\s+([,.!?…])/g, '$1').replace(/\s{2,}/g, ' ').trim());
    return out;
  }
}
