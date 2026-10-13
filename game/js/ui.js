// Felület: párbeszéd, választás, monológ, értesítések, HUD, notesz, térkép, címképernyő.
import { drawPortrait } from './sprites.js';
import { dateOf, SLOT_NAME, statLv, statProgress, STAT_INFO, LAST_DAY, BOND_STEPS } from './logic.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export class UI {
  constructor(game) {
    this.g = game; this.in = game.input;
    this.dlg = $('dlg'); this.dlgName = $('dlgName'); this.dlgText = $('dlgText'); this.port = $('dlgPort');
    this.choicesEl = $('choices'); this.monoEl = $('mono'); this.toastsEl = $('toasts'); this.bannerEl = $('banner');
    this.fadeEl = $('fade'); this.promptEl = $('prompt');
    this.modal = 0; this.hideT = null; this.lastTarget = null;
    $('btnMenu').addEventListener('click', () => this.in.emit('menu'));
  }
  get busy() { return this.modal > 0; }
  // koppintás/kattintás bárhová (gombokon és paneleken kívül) = továbblépés
  onTap(fn) {
    const app = document.getElementById('app');
    const h = (e) => { if (e.target.closest('button, .panel, #touch, input')) return; fn(); };
    app.addEventListener('click', h);
    return () => app.removeEventListener('click', h);
  }

  speakerInfo(sp) {
    const g = this.g;
    if (sp === 'player') return { name: g.state.name, title: '', desc: g.content.PLAYER_SPRITE, cls: 'player' };
    if (!sp) return null;
    const n = g.content.NPCS[sp];
    if (!n) return { name: sp, title: '' };
    return { name: n.short ?? n.name, title: n.title ?? '', desc: n.portrait ?? n.sprite, cls: n.dream ? 'dream' : '' };
  }

  // ---------------- párbeszéd ----------------
  say(speaker, text) {
    clearTimeout(this.hideT);
    this.modal++;
    const info = this.speakerInfo(speaker);
    const d = this.dlg;
    d.className = 'on' + (info ? '' : ' noport') + (info?.cls ? ' ' + info.cls : '') + (info && !info.desc ? ' noport' : '');
    this.dlgName.style.display = info ? '' : 'none';
    if (info) {
      this.dlgName.innerHTML = esc(info.name) + (info.title ? `<small>${esc(info.title)}</small>` : '');
      if (info.desc) drawPortrait(this.port, info.desc);
    }
    const full = text;
    const plain = full.replace(/\*/g, '');
    const html = esc(full).replace(/\*([^*]+)\*/g, '<em>$1</em>');
    let i = 0, done = false;
    this.dlgText.textContent = '';
    const speed = window.__fast ? 1e5 : 42; // karakter / mp
    return new Promise(res => {
      let t0 = performance.now(), raf;
      const step = () => {
        const n = Math.min(plain.length, Math.floor((performance.now() - t0) / 1000 * speed));
        if (n !== i) { if (n % 3 === 0) this.g.audio.sfx('blip'); i = n; this.dlgText.textContent = plain.slice(0, i); }
        if (i >= plain.length) finish(); else raf = requestAnimationFrame(step);
      };
      const finish = () => { done = true; cancelAnimationFrame(raf); this.dlgText.innerHTML = html; d.classList.add('done'); };
      const adv = () => {
        if (!done) { finish(); return; }
        off(); offClick(); d.classList.remove('done');
        this.modal--;
        this.hideT = setTimeout(() => { d.className = ''; }, 80);
        res();
      };
      const off = this.in.on('act', adv);
      const offClick = this.onTap(adv);
      raf = requestAnimationFrame(step);
    });
  }
  hideDialog() { clearTimeout(this.hideT); this.dlg.className = ''; }

  choose(items, { cancel = null, center = false } = {}) {
    clearTimeout(this.hideT);
    this.modal++;
    const el = this.choicesEl;
    el.className = 'on' + (center ? ' center' : '');
    el.innerHTML = '';
    let sel = items.findIndex(it => !it.disabled); if (sel < 0) sel = 0;
    let pick = () => {};
    const btns = items.map((it, i) => {
      const b = document.createElement('button');
      b.className = 'ch'; b.type = 'button';
      b.style.animationDelay = (i * 0.04) + 's';
      b.innerHTML = `<span>${esc(it.label)}</span>` + (it.tag ? `<span class="tag ${it.tagClass || ''}">${esc(it.tag)}</span>` : '');
      if (it.disabled) b.setAttribute('disabled', '');
      b.addEventListener('mouseenter', () => { if (!it.disabled) { sel = i; draw(); } });
      b.addEventListener('click', (e) => { e.stopPropagation(); if (!it.disabled) pick(i); });
      el.appendChild(b);
      return b;
    });
    const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
    draw();
    return new Promise(res => {
      const move = (dir) => { let n = sel; for (let k = 0; k < items.length; k++) { n = (n + dir + items.length) % items.length; if (!items[n].disabled) break; } sel = n; draw(); this.g.audio.sfx('move'); };
      const offs = [this.in.on('up', () => move(-1)), this.in.on('down', () => move(1)), this.in.on('act', () => pick(sel)),
        this.in.on('back', () => { if (cancel != null) pick(cancel); })];
      pick = (i) => {
        if (items[i]?.disabled) return;
        offs.forEach(o => o()); el.className = ''; el.innerHTML = '';
        this.modal--; this.g.audio.sfx('ok');
        this.hideT = setTimeout(() => { this.dlg.className = ''; }, 80);
        res(i);
      };
    });
  }

  mono(text, { full = false, hold = 0 } = {}) {
    clearTimeout(this.hideT); this.dlg.className = '';
    this.modal++;
    const wrap = this.monoEl;
    wrap.className = full ? 'full' : '';
    wrap.innerHTML = `<div class="m">${esc(text).replace(/\*([^*]+)\*/g, '<em>$1</em>')}<small>▼</small></div>`;
    const m = wrap.firstChild;
    requestAnimationFrame(() => m.classList.add('on'));
    return new Promise(res => {
      const t0 = performance.now();
      const adv = () => {
        if (performance.now() - t0 < (window.__fast ? 0 : 450 + hold)) return;
        off(); offClick();
        m.classList.remove('on');
        this.modal--;
        setTimeout(() => { if (wrap.firstChild === m) { wrap.innerHTML = ''; wrap.className = ''; } }, 400);
        res();
      };
      const off = this.in.on('act', adv);
      const offClick = this.onTap(adv);
    });
  }

  toast(title, text = '', kind = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.innerHTML = `<span><b>${esc(title)}</b>${esc(text)}</span>`;
    this.toastsEl.appendChild(t);
    setTimeout(() => t.remove(), 3800);
    while (this.toastsEl.children.length > 4) this.toastsEl.firstChild.remove();
  }

  async banner(big, small = '', kind = '') {
    const b = document.createElement('div');
    b.className = 'bn ' + kind;
    b.innerHTML = `<div class="big">${esc(big)}</div>${small ? `<div class="small">${esc(small)}</div>` : ''}`;
    this.bannerEl.innerHTML = ''; this.bannerEl.appendChild(b);
    requestAnimationFrame(() => b.classList.add('on'));
    await sleep(window.__fast ? 150 : 2200);
    b.remove();
  }

  fade(to = 1, ms = 500) {
    const f = this.fadeEl;
    f.style.transition = `opacity ${ms}ms`;
    f.style.opacity = to;
    f.classList.toggle('on', to > 0.5);
    return sleep(ms + 30);
  }
  flash(color = '#fff', ms = 400) {
    const f = $('flash');
    f.style.transition = 'none'; f.style.background = color; f.style.opacity = 1;
    requestAnimationFrame(() => { f.style.transition = `opacity ${ms}ms`; f.style.opacity = 0; });
  }

  prompt(text) {
    if (text === this.lastPrompt) return;
    this.lastPrompt = text;
    if (!text) { this.promptEl.classList.remove('on'); return; }
    this.promptEl.innerHTML = `<kbd>${this.in.touch ? 'A' : 'E'}</kbd>${esc(text)}`;
    this.promptEl.classList.add('on');
  }

  hud(on) { $('hud').classList.toggle('off', !on); $('hudbtns').classList.toggle('off', !on); }
  setHUD() {
    const s = this.g.state, dt = dateOf(s.day);
    $('calDate').textContent = dt.md; $('calDow').textContent = dt.dow; $('calSlot').textContent = SLOT_NAME[s.slot];
    const left = LAST_DAY - s.day + 1;
    const sub = [];
    if (s.facts.case_open && !s.ending) sub.push(left <= 1 ? `<span class="warn">Lyra: utolsó éjszaka</span>` : `Lyra álma: <b>${left}</b> éjszaka`);
    sub.push(this.g.scene?.weather ?? 'eső');
    $('calSub').innerHTML = sub.join(' · ');
    $('locName').textContent = this.g.scene?.name ?? '';
    $('locSub').textContent = this.g.scene?.sub ?? '';
  }

  // ---------------- címképernyő ----------------
  title(hasSave) {
    const el = $('title');
    el.hidden = false;
    el.innerHTML = `
      <div class="t-word a">LONDON</div>
      <div><span class="t-word b">NOCTURNE</span></div>
      <div class="t-sub">A tizenharmadik óra · I. fejezet: A Fülemüle álma</div>
      <div class="t-menu" id="tMenu">
        <button class="t-btn" type="button" data-a="new"><span>ÚJ JÁTÉK</span></button>
        <button class="t-btn" type="button" data-a="cont" ${hasSave ? '' : 'disabled'}><span>FOLYTATÁS</span></button>
      </div>
      <div class="t-foot">${this.in.touch ? 'Bal oldalon a joystick, jobbra az <kbd>A</kbd> gomb.' : '<kbd>WASD</kbd> / nyilak: mozgás · <kbd>SHIFT</kbd>: futás · <kbd>E</kbd> / <kbd>SPACE</kbd>: cselekvés · <kbd>TAB</kbd>: notesz · <kbd>ESC</kbd>: vissza'}<br>Fejhallgatóval az igazi: eső, zongora, harangszó.</div>`;
    return new Promise(res => {
      const btns = [...el.querySelectorAll('.t-btn')];
      let sel = hasSave ? 1 : 0;
      const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
      draw();
      const go = async (i) => {
        if (btns[i].disabled) return;
        offs.forEach(o => o());
        this.g.audio.start(); this.g.audio.sfx('ok');
        if (i === 1) { el.hidden = true; res({ action: 'cont' }); return; }
        const name = await this.askName();
        el.hidden = true; res({ action: 'new', name });
      };
      btns.forEach((b, i) => { b.onclick = () => go(i); b.onmouseenter = () => { sel = i; draw(); }; });
      const offs = [this.in.on('up', () => { sel = (sel + 1) % 2; if (btns[sel].disabled) sel = (sel + 1) % 2; draw(); }), this.in.on('down', () => { sel = (sel + 1) % 2; if (btns[sel].disabled) sel = (sel + 1) % 2; draw(); }), this.in.on('act', () => go(sel))];
    });
  }
  askName() {
    const m = $('tMenu');
    m.outerHTML = `<div class="t-name" id="tMenu"><label for="pname">A neved</label><input id="pname" maxlength="14" value="Noel" autocomplete="off"><button class="t-btn" type="button" id="pgo"><span>ESŐBE</span></button></div>`;
    const inp = $('pname');
    setTimeout(() => { inp.focus(); inp.select(); }, 50);
    return new Promise(res => {
      const done = () => { off(); const v = inp.value.trim().replace(/[<>]/g, '') || 'Noel'; inp.blur(); res(v.charAt(0).toUpperCase() + v.slice(1)); };
      $('pgo').onclick = done;
      const off = this.in.on('enter', done);
    });
  }

  // ---------------- panelek ----------------
  panel(id) { return $(id); }

  // nyom kiválasztása (bizonyíték bemutatása)
  pickClue(title, { list = null, filter = null } = {}) {
    const g = this.g, C = g.content.CLUES;
    const ids = (list ?? g.state.clues).filter(id => !filter || filter(id));
    const el = $('menu');
    el.hidden = false; this.modal++;
    el.innerHTML = `<div class="p-head"><div class="p-title">${esc(title)}</div><button class="p-close" type="button" id="pcX">MÉGSE</button></div>
      <div class="p-body" style="margin-top:14px"><div class="cards" id="pcCards">${ids.map((id, i) => `<div class="card pick" data-i="${i}" tabindex="0"><div class="k">${esc(C[id].where)}</div><h4>${esc(C[id].name)}</h4><p>${esc(C[id].desc)}</p></div>`).join('') || '<div class="empty">Még nincs nyomod.</div>'}</div></div>`;
    return new Promise(res => {
      const cards = [...el.querySelectorAll('.card')];
      let sel = 0;
      const draw = () => { cards.forEach((c, i) => c.classList.toggle('sel', i === sel)); cards[sel]?.scrollIntoView({ block: 'nearest' }); };
      draw();
      const close = (v) => { offs.forEach(o => o()); el.hidden = true; el.innerHTML = ''; this.modal--; res(v); };
      cards.forEach((c, i) => { c.onclick = () => close(ids[i]); c.onmouseenter = () => { sel = i; draw(); }; });
      $('pcX').onclick = () => close(null);
      const offs = [this.in.on('up', () => { sel = Math.max(0, sel - 1); draw(); }), this.in.on('down', () => { sel = Math.min(cards.length - 1, sel + 1); draw(); }),
        this.in.on('left', () => { sel = Math.max(0, sel - 1); draw(); }), this.in.on('right', () => { sel = Math.min(cards.length - 1, sel + 1); draw(); }),
        this.in.on('act', () => close(ids[sel] ?? null)), this.in.on('back', () => close(null))];
    });
  }

  // következtetés: két nyom összekötése a parafatáblán
  deduce() {
    const g = this.g, C = g.content.CLUES;
    const ids = g.state.clues.slice();
    const el = $('menu');
    el.hidden = false; this.modal++;
    el.innerHTML = `<div class="p-head"><div class="p-title">PARAFATÁBLA</div><button class="p-close" type="button" id="pcX">KÉSZ</button></div>
      <p class="map-hint" style="text-align:left;max-width:1100px;margin:10px auto 12px;width:100%">Válassz ki két nyomot, amelyek szerinted összefüggnek. A piros fonal megmutatja, ha igazad van.</p>
      <div class="p-body"><div class="cards">${ids.map((id, i) => `<div class="card pick" data-i="${i}" tabindex="0"><div class="k">${esc(C[id].where)}</div><h4>${esc(C[id].name)}</h4><p>${esc(C[id].desc)}</p></div>`).join('') || '<div class="empty">Előbb gyűjts nyomokat Londonban.</div>'}</div></div>`;
    return new Promise(res => {
      const cards = [...el.querySelectorAll('.card')];
      let sel = 0; const chosen = [];
      const draw = () => { cards.forEach((c, i) => { c.classList.toggle('sel', i === sel || chosen.includes(i)); c.style.outline = chosen.includes(i) ? '2px solid var(--crimson)' : ''; }); cards[sel]?.scrollIntoView({ block: 'nearest' }); };
      draw();
      const close = (v) => { offs.forEach(o => o()); el.hidden = true; el.innerHTML = ''; this.modal--; res(v); };
      const toggle = (i) => {
        const k = chosen.indexOf(i);
        if (k >= 0) chosen.splice(k, 1); else chosen.push(i);
        this.g.audio.sfx('move');
        draw();
        if (chosen.length === 2) setTimeout(() => close([ids[chosen[0]], ids[chosen[1]]]), 250);
      };
      cards.forEach((c, i) => { c.onclick = () => toggle(i); c.onmouseenter = () => { sel = i; draw(); }; });
      $('pcX').onclick = () => close(null);
      const offs = [this.in.on('up', () => { sel = Math.max(0, sel - 1); draw(); }), this.in.on('down', () => { sel = Math.min(cards.length - 1, sel + 1); draw(); }),
        this.in.on('left', () => { sel = Math.max(0, sel - 1); draw(); }), this.in.on('right', () => { sel = Math.min(cards.length - 1, sel + 1); draw(); }),
        this.in.on('act', () => cards.length && toggle(sel)), this.in.on('back', () => close(null))];
    });
  }

  // notesz (menü)
  notebook(tab = 'nyomok') {
    const g = this.g, s = g.state, el = $('menu');
    el.hidden = false; this.modal++;
    const tabs = [['nyomok', 'NYOMOK'], ['igazsag', 'KÖVETKEZTETÉSEK'], ['kapcs', 'KAPCSOLATOK'], ['naplo', 'NAPLÓ'], ['rendszer', 'RENDSZER']];
    const render = () => {
      let body = '';
      if (tab === 'nyomok') {
        const all = Object.keys(g.content.CLUES);
        body = `<div class="cards">${all.map(id => {
          const c = g.content.CLUES[id], have = s.clues.includes(id);
          return have ? `<div class="card"><div class="k">${esc(c.where)}</div><h4>${esc(c.name)}</h4><p>${esc(c.desc)}</p></div>` : `<div class="card missing"><div class="k">???</div><h4>Ismeretlen nyom</h4><p>${esc(c.hint ?? '')}</p></div>`;
        }).join('')}</div>`;
      } else if (tab === 'igazsag') {
        const D = g.content.DEDUCTIONS, T = g.content.TRUTHS;
        body = `<div class="cards">${Object.keys(D).map(id => s.deds.includes(id) ? `<div class="card"><div class="k">Következtetés</div><h4>${esc(D[id].name)}</h4><p>${esc(D[id].desc)}</p></div>` : `<div class="card missing"><div class="k">Következtetés</div><h4>???</h4><p>Két összefüggő nyom a parafatáblán.</p></div>`).join('')}
          ${Object.keys(T).map(id => s.truths.includes(id) ? `<div class="card dream"><div class="k">Igazság · álomból</div><h4>${esc(T[id].name)}</h4><p>${esc(T[id].desc)}</p></div>` : `<div class="card missing dream"><div class="k">Igazság</div><h4>???</h4><p>${esc(T[id].hint)}</p></div>`).join('')}</div>`;
      } else if (tab === 'kapcs') {
        body = `<h3 class="k" style="font-family:var(--display);letter-spacing:3px;font-weight:400;margin:4px 0 6px">JELLEM</h3>` +
          Object.keys(STAT_INFO).map(k => `<div class="stat-row"><div class="nm">${STAT_INFO[k].name}</div><div class="bar"><i style="width:${(statLv(s, k) - 1 + statProgress(s, k)) / 5 * 100}%"></i></div><div class="rk">${STAT_INFO[k].ranks[statLv(s, k) - 1]}</div></div>`).join('') +
          `<h3 style="font-family:var(--display);letter-spacing:3px;font-weight:400;margin:22px 0 6px">KÖTELÉKEK</h3>` +
          Object.keys(s.bonds).filter(k => g.content.NPCS[k] && npcMet(s, k)).map(k => {
            const n = g.content.NPCS[k], lv = s.bonds[k], pts = s.bondPts[k] ?? 0, nx = BOND_STEPS[lv + 1] ?? pts;
            const pr = lv >= 5 ? 1 : (pts - BOND_STEPS[lv]) / (nx - BOND_STEPS[lv]);
            return `<div class="stat-row"><div class="nm">${esc(n.short ?? n.name)}</div><div class="bar c"><i style="width:${(lv + pr) / 5 * 100}%"></i></div><div class="rk">${esc(n.arcana ?? '')} · ${lv}</div></div>`;
          }).join('') +
          `<h3 style="font-family:var(--display);letter-spacing:3px;font-weight:400;margin:22px 0 6px">KIK MIT TUDNAK RÓLAD</h3><div class="cards">` +
          Object.keys(g.content.NPCS).filter(k => npcMet(s, k) && !g.content.NPCS[k].dream).map(k => {
            const m = s.npc[k], known = Object.keys(m.known || {}).length;
            const mood = m.att >= 3 ? 'kedvel' : m.att >= 1 ? 'barátságos' : m.att <= -2 ? 'neheztel rád' : m.att < 0 ? 'gyanakvó' : 'semleges';
            return `<div class="card"><div class="k">${esc(g.content.NPCS[k].title ?? '')}</div><h4>${esc(g.content.NPCS[k].name)}</h4><p>Hozzáállás: <b>${mood}</b> · ${known} tettedről tud</p></div>`;
          }).join('') + `</div>`;
      } else if (tab === 'naplo') {
        body = s.log.length ? `<ul class="log">${s.log.slice().reverse().map(l => `<li><span>${dateOf(l.day).md} · ${SLOT_NAME[l.slot]}</span>${esc(l.t)}</li>`).join('')}</ul>` : '<div class="empty">Üres lapok. Még minden előtted áll.</div>';
      } else {
        body = `<div class="sysbtns"><button class="t-btn" type="button" id="sysSave"><span>MENTÉS</span></button><button class="t-btn" type="button" id="sysMute"><span>${g.audio.muted ? 'HANG BE' : 'HANG KI'}</span></button><button class="t-btn" type="button" id="sysTitle"><span>CÍMKÉPERNYŐ</span></button></div>
          <p class="empty" style="font-style:normal;margin-top:16px;max-width:60ch;line-height:1.6">A játék automatikusan ment minden napszakváltáskor ebbe a böngészőbe.<br>Irányítás: WASD/nyilak · SHIFT futás · E/SPACE cselekvés · TAB notesz · ESC vissza.</p>`;
      }
      el.innerHTML = `<div class="p-head"><div class="p-title">NOTESZ</div><button class="p-close" type="button" id="nbX">BEZÁR</button></div>
        <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${k === tab ? 'on' : ''}" type="button" data-t="${k}">${l}</button>`).join('')}</div>
        <div class="p-body">${body}</div>`;
      el.querySelectorAll('.tab').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
      $('nbX').onclick = () => close();
      if (tab === 'rendszer') {
        $('sysSave').onclick = () => { g.save(); this.toast('MENTVE', 'A böngésződ megjegyezte, hol tartasz.'); };
        $('sysMute').onclick = () => { g.audio.toggleMute(); render(); };
        $('sysTitle').onclick = () => { close(); g.toTitle(); };
      }
    };
    render();
    return new Promise(res => {
      const close = () => { offs.forEach(o => o()); el.hidden = true; el.innerHTML = ''; this.modal--; res(); };
      this._nbClose = close;
      const offs = [this.in.on('back', close), this.in.on('menu', close),
        this.in.on('left', () => { const i = tabs.findIndex(t => t[0] === tab); tab = tabs[(i + tabs.length - 1) % tabs.length][0]; render(); }),
        this.in.on('right', () => { const i = tabs.findIndex(t => t[0] === tab); tab = tabs[(i + 1) % tabs.length][0]; render(); })];
      const origRender = render;
      void origRender;
    });
  }

  // London térkép: helyszínválasztás
  map(options, { title = 'HOVA MÉSZ?', sub = '' } = {}) {
    const el = $('map');
    el.hidden = false; this.modal++;
    const pos = { school: [190, 150], soho: [430, 210], hospital: [560, 360], office: [430, 210], dream: [700, 120], sleep: [430, 210], home: [430, 210] };
    el.innerHTML = `<div class="p-head"><div class="p-title">${esc(title)}</div></div>
      <div class="map-hint" style="margin:6px 0">${esc(sub)}</div>
      <div class="map-wrap"><svg class="map-svg" viewBox="0 0 860 470" role="list" aria-label="London térkép">
        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1d2547" stroke-width="1"/></pattern></defs>
        <rect width="860" height="470" fill="#0a0e1d"/><rect width="860" height="470" fill="url(#grid)"/>
        <path d="M-10 330 C 120 300, 220 380, 340 350 S 520 260, 600 300 S 760 420, 880 380" fill="none" stroke="#14315a" stroke-width="34" stroke-linecap="round"/>
        <path d="M-10 330 C 120 300, 220 380, 340 350 S 520 260, 600 300 S 760 420, 880 380" fill="none" stroke="#1f4c86" stroke-width="2" stroke-dasharray="6 10"/>
        <text x="700" y="410" fill="#2f5f9a" font-family="var(--noir)" font-style="italic" font-size="20">Temze</text>
        <g opacity=".5"><rect x="610" y="250" width="14" height="40" fill="#2a3150"/><circle cx="617" cy="248" r="6" fill="#ffd27a"/><text x="632" y="268" fill="#7c88ad" font-size="13" font-family="var(--body)">Big Ben</text></g>
        ${options.map((o, i) => { const [x, y] = pos[o.id] || [430, 210]; return `<g class="pin ${o.disabled ? 'off' : ''}" data-i="${i}" role="listitem" transform="translate(${x},${y})"><path class="pb" d="M0 0 L-14 -26 A16 16 0 1 1 14 -26 Z"/><circle cx="0" cy="-34" r="5" fill="${o.dream ? 'var(--dream)' : 'var(--amber)'}"/><text x="22" y="-30">${esc(o.label)}</text><text class="sub" x="22" y="-10">${esc(o.sub ?? '')}</text></g>`; }).join('')}
      </svg></div>
      <div class="map-hint">${this.in.touch ? 'Koppints egy helyszínre.' : 'Nyilakkal válassz, E / SPACE: indulás · ESC: maradok'}</div>`;
    return new Promise(res => {
      const pins = [...el.querySelectorAll('.pin')];
      let sel = options.findIndex(o => !o.disabled); if (sel < 0) sel = 0;
      const draw = () => pins.forEach((p, i) => p.classList.toggle('sel', i === sel));
      draw();
      const close = (v) => { offs.forEach(o => o()); el.hidden = true; el.innerHTML = ''; this.modal--; res(v); };
      pins.forEach((p, i) => { p.onclick = () => { if (!options[i].disabled) close(options[i].id); }; p.onmouseenter = () => { sel = i; draw(); }; });
      const mv = (d) => { let n = sel; for (let k = 0; k < options.length; k++) { n = (n + d + options.length) % options.length; if (!options[n].disabled) break; } sel = n; draw(); this.g.audio.sfx('move'); };
      const offs = [this.in.on('up', () => mv(-1)), this.in.on('left', () => mv(-1)), this.in.on('down', () => mv(1)), this.in.on('right', () => mv(1)),
        this.in.on('act', () => { if (!options[sel].disabled) close(options[sel].id); }), this.in.on('back', () => close(null))];
    });
  }
}

function npcMet(s, k) { return (s.npc[k]?.met ?? 0) > 0; }
export { sleep };
