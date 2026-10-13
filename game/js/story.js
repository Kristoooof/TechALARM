// I. fejezet: A Fülemüle álma. Forgatókönyv, napszakok, éjszakák, álmok, befejezések.
import { LAST_DAY, makeCtx, doDeed, gainStat, gainBond, addLog, spreadGossip, npcMem, statLv, dateOf, SLOT_NAME } from './logic.js';
import { sleep } from './ui.js';

const QUIZ = [
  { q: 'Ki írta „A Morgue utcai kettős gyilkosság”-ot, minden detektívtörténet ősét? A nyomozó neve egyébként C. Auguste Dupin.', a: ['Arthur Conan Doyle', 'Edgar Allan Poe', 'Agatha Christie'], ok: 1, why: 'Poe, 1841-ben. Dupin előbb volt, mint Sherlock Holmes. A logika mindig előbb jár, mint a hírnév.' },
  { q: 'Ovidius Átváltozásaiban egy királylány a fájdalmától menekülve madárrá változik. Mi a neve, és mivé lesz?', a: ['Ekhó, visszhanggá', 'Philomela, fülemülévé', 'Daphné, babérfává'], ok: 1, why: 'Philomela. Elvették tőle a hangját, és ő mégis énekelni kezdett. Jegyezzék meg: a fájdalom néha dallá lesz.' },
  { q: 'Egy könnyű kérdés a londoniaknak: mi valójában a „Big Ben”?', a: ['Az óratorony', 'A legnagyobb harang', 'Az óra nagymutatója'], ok: 1, why: 'A harang. A torony neve Erzsébet-torony. Mindenki a tornyot hívja Big Bennek, pedig az csak a hangja.' },
  { q: 'Shakespeare melyik drámájában mondja Prospero: „Olyan anyagból vagyunk, mint az álmok”?', a: ['Hamlet', 'A vihar', 'Macbeth'], ok: 1, why: 'A vihar. És a kis életünket álom keríti. Ma reggel többen is úgy néznek ki, mintha még benne lennének.' },
];

export class Story {
  constructor(game) { this.g = game; }
  get s() { return this.g.state; }
  say(who, t) { return this.g.ui.say(who, this.g.dlg.text(t, who === 'player' ? null : who, {})); }
  mono(t, o) { return this.g.ui.mono(this.g.dlg.text(t, null, {}), o); }
  noir() { return this.g.grammar.expand('#mono#', makeCtx(this.g, null)); }

  // NPC-k, akikkel nem a szabálymotor, hanem forgatókönyv beszél
  hook(id) {
    const map = {
      lamplighter: () => this.lamplighter(),
      lyraGrey: () => this.greyClimax(),
      lyraMom: () => this.warmClimax(),
      husband: () => this.mono('A férfi nem szól. Az arca helyén sima porcelán. Amikor Lily nevet, ő is nevet, egy fél másodperccel később, mint egy visszhang.'),
      kidA: () => this.g.ui.say('kidA', 'Anya! Anya, nézd! …Te nem vagy anya. Te kívülről jöttél. Kintről senki sem jön.'),
      kidB: () => this.g.ui.say('kidB', 'Hét óra van. Mindig hét óra. Holnap nincs, csak vacsora. Jó, nem?'),
      kalauz: () => this.kalauzTalk(),
    };
    return map[id] || null;
  }
  async lamplighter() {
    const g = this.g, s = this.s;
    await this.mono('A sikátor szájában egy magas alak áll, cilinderben, kezében egy régimódi lámpással. A lámpás ég, de nem vet árnyékot.');
    await g.ui.say('lamplighter', '…A tizenharmadik órában minden ajtó nyitva, fiatalember. Vigyázz, melyiken lépsz be.');
    g.engine.flash([.4, 1, .9], .5);
    g.world.removeNpc('lamplighter');
    s.facts.saw_lamplighter = true;
    await this.mono('Pislogsz. A sikátor üres. Csak a pocsolyában ég tovább egy lámpa tükörképe, aztán az is kialszik.');
    addLog(g, 'Egy lámpás alak a sikátorban. A tizenharmadik óráról beszélt. Mielőtt bármit is tudtam volna róla.');
  }
  async kalauzTalk() {
    const g = this.g, s = this.s;
    await this.say('kalauz', g.grammar.expand('#bark#', makeCtx(g, 'kalauz'), g.content.NPCS.kalauz.voice));
    for (;;) {
      const opts = [{ label: 'Mi ez a hely?' }, { label: 'Mik azok az árnyak?' }, { label: 'Ki a Lámpagyújtó?' }];
      if (!s.facts['kalauz_rest_' + s.day]) opts.push({ label: 'Pihenni szeretnék egy kicsit' });
      opts.push({ label: 'Mennem kell' });
      const i = await g.ui.choose(opts, { cancel: opts.length - 1 });
      const l = opts[i].label;
      if (l.startsWith('Mi ez')) await this.say('kalauz', 'Pályaudvar. A város minden álma itt fut be, mint a vonatok. A legtöbb utas nem is tudja, hogy utazik. Maga tudja. Ez a különbség.');
      else if (l.startsWith('Mik')) await this.say('kalauz', 'Amit az álmodó nem mer kimondani, az árnyékká lesz. Az árnyék nem gonosz. Csak éhes. Arra éhes, hogy végre lássák.');
      else if (l.startsWith('Ki a')) await this.say('kalauz', s.facts.saw_lamplighter ? '…Látta őt? Hm. Ő gyújtja a lámpákat ott, ahol az ajtók nyílnak. Hogy kinek nyitja őket, és miért, azt még én sem tudom.' : 'Nem ismerek ilyen utast. Talán még nem vett jegyet.');
      else if (l.startsWith('Pihenni')) { s.facts['kalauz_rest_' + s.day] = true; g.party.restore(); await this.say('kalauz', 'Üljön le a padra. Egy korty köd, egy perc csend. A peronon az idő lassabban telik.'); g.ui.toast('PIHENÉS', 'ÉP és LP feltöltve'); }
      else { await this.say('kalauz', 'Vigyázzon magára odabent. Az álom nem bántja azt, aki figyel.'); return; }
    }
  }
  async defeat() {
    const g = this.g, s = this.s;
    await this.mono('Az árnyak összezárnak. A köd hideg, aztán meleg, aztán semmilyen. Egy harang üt valahol, tizenháromszor visszafelé.', { full: true });
    g.party.restore();
    if (s.day >= LAST_DAY) return this.ending('sleep');
    await this.mono('A kanapén ébredsz, zihálva. Ma éjjel nem jutottál messzire. Holnap újra kell próbálnod.', { full: true });
    return this.nextDay();
  }

  // ======================= PROLÓGUS =======================
  async prologue() {
    const g = this.g, s = this.s;
    g.audio.setMusic(true, 'noir');
    await g.ui.fade(1, 10);
    await this.mono('London, október. Három hete érkeztem, egy bőrönddel és egy címmel a zsebemben.', { full: true });
    await this.mono('Anyám azt mondta, Arthur bácsi az egyetlen rokon, aki nem kérdez semmit. Igaza volt. Nem kérdez. Csak iszik, és nyomoz.', { full: true });
    await this.mono('Aznap este még nem tudtam, hogy a város álmodik. És hogy néha nem ébred fel.', { full: true });
    await g.goto('office', 'street', { fadeIn: true, skipEnter: true });
    g.ui.hud(true);
    await g.ui.banner(`${dateOf(1).md} · ${dateOf(1).dow}`, 'Este · Soho, Dean Street', 'dark');
    await this.say('arthur', 'Na. Hát itt vagy. Vizes vagy, mint egy kutya. Akaszd fel a kabátod, mielőtt elárasztod az irodát.');
    await this.say('arthur', 'Holnap kezdesz a St. Aldric\'sban. A nagynénéd mindig azt akarta, hogy legyen valami rendes iskolád. Hát legyen.');
    await g.ui.say(null, 'Kopogás. Az ajtó kinyílik, mielőtt bárki felelhetne.');
    const crane = g.world.addNpc({ id: 'crane', x: 4.2, z: 1.6, dir: 3 });
    await g.walk(crane, 1.4, -0.6, 1.5);
    crane.faceTo(0.4, -2.5);
    s.facts.met_crane = true;
    await this.say('crane', 'Arthur Vale? Victor Crane. Lyra Vance menedzsere. Gondolom, olvas újságot.');
    await this.say('arthur', 'A Fülemüle. Három napja nem ébred fel. Igen, olvasok újságot, Mr. Crane. Néha még a címlapon túl is.');
    await this.say('crane', 'Akkor tudja, hogy az orvosok tanácstalanok. Nincs méreg, nincs sérülés, nincs semmi. Egyszerűen alszik. Két hét múlva kezdődik a világturné.');
    await this.say('crane', 'Azt akarom, hogy derítse ki, ki vagy mi tette ezt vele. Rendőrség nélkül. A sajtó így is elég hangos.');
    crane.faceTo(3.6, 1.2);
    await this.say('crane', 'És ez ki? A titkára?');
    await g.ui.choose([{ label: '„Az unokaöccse. És tanonca.”' }, { label: '„Valaki, aki figyel.”' }, { label: 'Nem szólsz semmit' }]).then(async (i) => {
      if (i === 0) await this.say('player', 'Az unokaöccse. És a tanonca.');
      if (i === 1) { await this.say('player', 'Valaki, aki figyel.'); s.facts.prologue_bold = true; }
      if (i === 2) await g.ui.say(null, 'Állod a tekintetét. Crane mosolya egy pillanatra megáll a levegőben.');
    });
    crane.faceTo(0.4, -2.5);
    await this.say('crane', 'Bájos. A csekket itt hagyom. A dupláját kapja, ha a turné időben elindul.');
    await g.walk(crane, 4.2, 1.6, 1.8);
    g.world.removeNpc('crane');
    await this.say('arthur', '„Ha a turné elindul.” Nem az, hogy „ha Lyra felébred”. Hallottad?');
    await this.say('arthur', 'Na, kölyök. Első lecke: a megbízó mindig hazudik. Csak az a kérdés, miről.');
    await this.say('arthur', 'Fogd. A névjegyem. Menj le az utcára, és kérdezősködj. Maggie, a virágárus. Tom, a harmonikás. Shah rendőrtiszt. Ők látnak mindent, amit Soho lát.');
    s.facts.has_card = true; s.facts.case_open = true;
    g.ui.toast('ÚJ ÜGY', 'A Fülemüle álma');
    g.audio.sfx('clue');
    await this.say('arthur', 'Ha végeztél, gyere fel aludni. A kanapé a tiéd. Ne nézz így rá, nem harap.');
    addLog(g, 'Victor Crane megbízta Arthurt: derítsük ki, miért nem ébred fel Lyra Vance. Engem is bevont. Vagy csak nem küldött el.');
    await g.ui.toast('TIPP', g.input.touch ? 'Joystick: mozgás · A: beszélgetés · NOTESZ: nyomok' : 'WASD: mozgás · E: beszélgetés · TAB: notesz');
    g.save();
  }

  // ======================= HELYSZÍNEK =======================
  async enterSoho() {
    const s = this.s;
    if (!s.facts.soho_first) {
      s.facts.soho_first = true;
      await this.mono('Az eső úgy esett Sohóra, mintha valaki odafent a bűneit akarná kimosni. A neon vérzett a pocsolyákban, és senki sem hívott orvost.');
      return;
    }
    if (Math.random() < 0.45) await this.mono(this.noir());
  }
  async enterOffice() {
    if (this.s.slot === 'ejjel') return;
    if (Math.random() < 0.3) await this.mono(this.noir());
  }
  async enterHospital() {
    const s = this.s;
    if (!s.facts.visited_hospital) {
      s.facts.visited_hospital = true;
      await this.mono('A kórterem tele van virággal. Rajongók küldték, kártyákkal: „Ébredj fel, Fülemüle!” Senki sem írt olyat, hogy „Ébredj fel, Lily.”');
    } else if (Math.random() < .4) await this.mono(this.noir());
  }
  preTheatre() {
    const s = this.s;
    s.facts.ivy_distracting = false;
    if (s.facts.ivy_distract && !s.facts.ivy_distract_used && s.slot === 'delutan') { s.facts.ivy_distracting = true; s.facts.ivy_distract_used = true; }
  }
  async enterTheatre() {
    const s = this.s, g = this.g;
    if (!s.facts.theatre_visited) {
      s.facts.theatre_visited = true;
      await this.mono('A színfalak mögött minden kisebb, porosabb és őszintébb. A díszletek hátulján ott a felirat: „TÖRÉKENY”.');
    }
    if (s.facts.ivy_distracting) {
      await g.ui.say('ivy', 'Mr. Crane! Ivy Marlowe, St. Aldric\'s Krónika. Lenne öt perce egy interjúra? Csak tíz kérdés. Vagy húsz.');
      await g.ui.say('crane', 'Az iskolaújság? Hát… a fiatal közönség fontos. Kérdezzen.');
      await g.ui.say(null, 'Ivy a háta mögött rád kacsint. Crane irodája szabad.');
    }
  }
  async enterSchool() {
    if (Math.random() < .5) await this.mono(this.noir());
  }

  // ---- tárgyak ----
  async posters() {
    const g = this.g, s = this.s;
    if (!s.clues.includes('plakat')) {
      await this.mono('A Fülemüle plakátjai. Mindegyiken ugyanaz: valaki kikaparta az arcát. Csak az arcát. A nevét, a dátumot, a jegyárakat nem.');
      await this.mono('Nem dühös rongálás. Gondos, türelmes munka. Mint aki egy foltot próbál kidörzsölni.');
      g.addClue('plakat');
    } else await this.mono('Kikapart arcok sora. ' + (s.clues.includes('dex_tanu') ? 'Egy kapucnis nő, aki közben a saját dalát dúdolja. A kép összeáll.' : 'Ki tesz ilyet egy csillaggal?'));
  }
  async phoneBox() {
    const g = this.g;
    await g.ui.say(null, 'Bedobsz egy érmét, és tárcsázod az irodát. Hosszú csengés, aztán recsegő hang.');
    await g.dlg.topic('arthur', 'case', {});
    await g.ui.say(null, 'Kattanás. A vonal elnémul. Az eső hangosabb lett.');
  }
  async windowLook() {
    const s = this.s;
    if (s.slot === 'ejjel') { await this.mono('Az utcán egy magas alak áll a lámpa alatt. Mire pislogsz, már nincs ott.'); return; }
    await this.mono(this.noir());
  }
  async bed() {
    const g = this.g, s = this.s;
    if (s.slot === 'delutan' || s.slot === 'reggel') { await this.mono('Még világos van. Az ágy majd megvár, az ügy nem.'); return; }
    const i = await g.ui.choose([{ label: 'Lefekszel (vége a napnak)' }, { label: 'Még nem' }], { cancel: 1 });
    if (i === 0) await this.startNight();
  }
  async board() {
    const g = this.g, s = this.s, D = g.content.DEDUCTIONS;
    if (s.clues.length < 2) { await this.mono('A parafatábla üres. Néhány gombostű, egy régi térkép, és Arthur kézírása: „Mindenki hazudik.” Előbb nyomok kellenek.'); return; }
    s.facts.board_used = true;
    for (;;) {
      const pair = await g.ui.deduce();
      if (!pair) return;
      const hit = Object.entries(D).find(([id, d]) => d.pairs.some(([a, b]) => (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0])));
      if (!hit) { g.audio.sfx('back'); await this.mono('A piros fonal nem ér össze. Ezek a nyomok nem egymásról mesélnek.'); continue; }
      const [id, d] = hit;
      if (s.deds.includes(id)) { await this.mono(`Ezt már összekötötted: „${d.name}”.`); continue; }
      s.deds.push(id);
      g.audio.sfx('clue'); g.engine.flash([1, .2, .25], .5);
      await g.ui.banner('KÖVETKEZTETÉS', d.name, '');
      await this.mono(d.desc);
      addLog(g, `Összeállt a kép: ${d.name}.`);
      gainStat(g, 'esz', 1);
      if (d.truth && !s.truths.includes(d.truth)) {
        s.truths.push(d.truth);
        g.ui.toast('IGAZSÁG', g.content.TRUTHS[d.truth].name, 'clue');
        await this.mono('Ezt nem csak tudod. Ezt bármikor kimondhatod, akár egy álomban is. Egy fegyver, ami nem vág, hanem kinyit.');
      }
      if (g.world.npcs.has('arthur')) {
        const lines = { ded_arc: 'Aki a saját arcát kaparja le, az nem a hírnevet gyűlöli. Hanem azt, hogy senki nem látja mögötte.', ded_csalad: 'Árvaház. Hm. A pénz nem vesz családot, kölyök. Csak drágább magányt.', ded_kalitka: 'Crane. Tudtam, hogy a mosolya mögött van valami. Ritkán téved az ember gyomra.', ded_lumen: 'Lumen… Ezt a nevet már hallottam. Egy lezárt aktában. Vigyázz vele.', ded_13: 'Tizenhárom ütés. Ha nem ismernélek, azt mondanám, igyál kevesebbet.' };
        await g.ui.say('arthur', lines[id]);
        gainBond(g, 'arthur', 1);
      }
    }
  }
  async lyraBed() {
    const g = this.g, s = this.s;
    if (!s.facts.lyra_touched) {
      await this.mono('Lyra Vance. Közelről nem csillag, hanem egy fáradt lány, akinek a szeme mozog a szemhéja alatt. Mintha keresne valamit.');
      const i = await g.ui.choose([{ label: 'Megfogod a kezét' }, { label: 'Hagyod pihenni' }]);
      if (i === 1) return;
      g.audio.bell(0, .25);
      g.engine.flash([.4, 1, .9], .7);
      g.engine.tweakPost({ wobble: 1.2, sat: .4 });
      await this.mono('A keze hideg. Aztán… egy pillanatra hallod. Harangszó, nagyon messziről. Tizenkettő. Aztán még egy.');
      await this.mono('És valaki énekel. Egy dalt, amit még sosem hallottál, mégis ismerős: „Senki lánya, senki várja…”');
      g.engine.tweakPost({ wobble: 0, sat: g.world.env.post?.sat ?? 1 });
      s.facts.lyra_touched = true;
      addLog(g, 'Megfogtam Lyra kezét. Hallottam a tizenharmadik ütést. Ébren.');
      g.ui.toast('KAPCSOLAT', 'Az álom ismer téged', 'clue');
      if (s.facts.persona) await this.mono('Most már tudod az utat. Ma éjjel, a tizenharmadik órában.');
      return;
    }
    const opts = [{ label: 'Beszélsz hozzá' }];
    if (s.facts.has_flowers) opts.push({ label: 'Az éjjeliszekrényre teszed a virágot' });
    opts.push({ label: 'Hagyod pihenni' });
    const i = await g.ui.choose(opts, { cancel: opts.length - 1 });
    const pick = opts[i].label;
    if (pick.startsWith('Beszélsz')) {
      const lines = ['Hé, Lily. Az öreg Tom még mindig játssza a dalodat.', 'Tudod, a fél város miattad virraszt. A másik fele miattad nem alszik.', 'Valaki egyszer azt mondta, a jó kérdés fontosabb a jó válasznál. Nekem csak kérdéseim vannak.'];
      await this.say('player', lines[(Math.random() * lines.length) | 0]);
      await this.mono('A monitor sípolása egy pillanatra felgyorsul. Aztán visszaáll.');
      if (!s.facts['lyra_talk_' + s.day]) { s.facts['lyra_talk_' + s.day] = true; gainBond(g, 'lyra', 1); }
    } else if (pick.startsWith('Az éjjeli')) {
      s.facts.has_flowers = false;
      await this.mono('Az őszirózsák a rajongók liliomjai közé kerülnek. Egyszerűek, olcsók, és az egyetlenek, amelyeket valaki személyesen hozott.');
      gainBond(g, 'lyra', 1); gainStat(g, 'emp', 1);
    }
  }
  async lyraCoat() {
    const g = this.g, s = this.s;
    if (!s.clues.includes('nevjegy')) {
      await this.mono('A kabát zsebében egy matt fekete kártya. Ezüst lámpapecsét, a hátoldalán kézírás: „A tizenharmadik órában minden ajtó nyitva.”');
      g.addClue('nevjegy');
    } else await this.mono('A kabát még mindig esőszagú. A Westminster hídon ázott meg, azon az éjszakán.');
  }
  async dressingTable() {
    const g = this.g, s = this.s;
    if (!s.clues.includes('level')) {
      await this.mono('A sminktükör izzói közül kettő kiégett. Az asztalon púder, egy hajtű, és egy félbehagyott levél.');
      await this.mono('„Kedves Senki! Ha egyszer hazaérek, várj meg. Csak egyszer várjon meg valaki…” Itt a toll megcsúszott.');
      g.addClue('level');
    } else await this.mono('A tükörben a saját arcod néz vissza, izzók keretében. Egy pillanatig érted, milyen lehet ezt minden este látni.');
  }
  async craneDesk() {
    const g = this.g, s = this.s;
    if (s.clues.includes('szerzodes')) { await this.mono('Crane íróasztala. Drága toll, olcsó whisky, és egy keretezett fénykép. Saját magáról.'); return; }
    const craneHere = g.world.npcs.has('crane') && !s.facts.ivy_distracting;
    const take = async (deed) => {
      await this.mono('A felső fiókban egy vastag dosszié: „VILÁGTURNÉ, 5 ÉV”. Az utolsó oldalon Lyra aláírása helyett Crane neve, meghatalmazással. A dátum két nappal az összeesés utáni.');
      if (deed) doDeed(g, deed);
      g.addClue('szerzodes');
    };
    if (!craneHere || s.facts.office_open) {
      if (craneHere && s.facts.office_open) { await this.mono('Crane épp telefonál a folyosón. Ozzie a kulcscsomójával zörög, hogy elnyomja a fiók hangját.'); return take(null); }
      return take(s.facts.ivy_distracting ? null : 'sneaked_office');
    }
    await this.say('crane', 'Keres valamit, fiatalember? Az az én asztalom.');
    if (statLv(s, 'bat') >= 3) {
      const i = await g.ui.choose([{ label: 'Megvárod, amíg kimegy telefonálni, és beosonsz', tag: 'BÁTORSÁG RETTENTHETETLEN', tagClass: 'ok' }, { label: 'Hátrálsz' }]);
      if (i === 0) { await g.ui.say(null, 'Tíz perc a díszletek mögött. Crane végre kimegy a folyosóra kiabálni valakivel a telefonba.'); return take('sneaked_office'); }
    } else await this.mono('Amíg Crane ott ül, ehhez nincs elég bátorságod. Vagy segítség kell: valaki, aki eltereli a figyelmét, vagy valaki, akinél kulcs van.');
  }

  // ======================= NAPSZAKOK =======================
  async slotBanner() {
    const s = this.s, d = dateOf(s.day);
    await this.g.ui.banner(`${d.md} · ${d.dow}`, SLOT_NAME[s.slot].charAt(0) + SLOT_NAME[s.slot].slice(1).toLowerCase(), s.slot === 'ejjel' ? 'dark' : '');
  }
  async gossipRound() {
    const g = this.g;
    const news = spreadGossip(g);
    const shown = news.filter(n => !g.content.NPCS[n.to]?.dream).slice(-2);
    for (const n of shown) {
      const deed = g.state.deeds[n.idx];
      const they = g.grammar.expand(`#deedThey_${deed.id}#`, makeCtx(g, n.to));
      g.ui.toast('PLETYKA', `${g.content.NPCS[n.to].name} most már tudja, hogy ${g.state.name} ${they}. (${g.content.NPCS[n.from].name} mesélte)`, 'gossip');
    }
  }

  // délután vagy este vége: tovább a következő napszakba
  async leave() {
    const g = this.g, s = this.s;
    if (s.slot === 'delutan') {
      s.slot = 'este';
      await this.gossipRound();
      g.save();
      return this.chooseEvening();
    }
    if (s.slot === 'este') return this.startNight();
  }

  async chooseAfternoon() {
    const g = this.g, s = this.s;
    g.ui.setHUD();
    const dest = await g.ui.map([
      { id: 'school', label: "ST. ALDRIC'S", sub: s.bonds.ivy >= 1 ? 'Ivy vár az udvaron' : 'Ivy, Theo, Nadia' },
      { id: 'soho', label: 'SOHO', sub: 'utca · színház nyitva' },
      { id: 'hospital', label: 'SZENT TAMÁS', sub: 'Lyra kórterme' },
    ], { title: 'DÉLUTÁN', sub: 'Egy helyszín délutánonként. Ha eljössz onnan, beesteledik.' }) ?? 'soho';
    await g.goto(dest);
  }
  async chooseEvening() {
    const g = this.g;
    g.ui.setHUD();
    const dest = await g.ui.map([
      { id: 'soho', label: 'SOHO', sub: 'Tom, Harriet, a Varjú' },
      { id: 'hospital', label: 'SZENT TAMÁS', sub: 'esti látogatás' },
      { id: 'home', label: 'HAZA', sub: 'korán lefekszel' },
    ], { title: 'ESTE', sub: 'Az este az utolsó esély ébren. Utána jön a tizenharmadik óra.' }) ?? 'soho';
    if (dest === 'home') return this.startNight();
    await g.goto(dest);
  }

  // ======================= REGGEL: ISKOLA =======================
  async morning() {
    const g = this.g, s = this.s;
    s.slot = 'reggel';
    g.party.restore();
    await g.goto('classroom', null, { skipEnter: true });
    await this.slotBanner();
    const day = s.day;
    if (day === 2) {
      await this.say('pembroke', 'Csendet. Ma új diákunk van. Mutatkozz be, kérlek. Röviden. Az irodalomóra drága.');
      await this.say('player', `${s.name} vagyok. Három hete jöttem Londonba. A nagybátyámnál lakom, Sohóban.`);
      await this.say('theo', 'Sohóban? Ott, ahol a Fülemüle színháza van?');
      await this.say('ivy', 'A nagybátyád nem véletlenül Arthur Vale? A magánnyomozó? Az, akiről apám régi cikkeiben olvastam?');
      await this.say('pembroke', 'Miss Marlowe. A kérdéseit tartogassa szünetre. Akkor talán meg is hallgatja valaki.');
      // Theo kigúnyolja Nadia rajzát
      await this.say('theo', 'Nadia, mi ez a rajz? A Fülemüle arc nélkül? Ez sértés. Mint egy rajongó, tiltakozom.');
      await this.say('nadia', 'Ez nem sértés, Theo. Ez portré.');
      const i = await g.ui.choose([
        { label: '„Szerintem jobban hasonlít rá, mint a plakátok.”', tag: 'BÁTORSÁG', tagClass: 'ok' },
        { label: '„Theónak igaza van, ez furcsa.”' },
        { label: 'Hallgatsz' },
      ]);
      if (i === 0) { await this.say('player', 'Szerintem jobban hasonlít rá, mint az összes plakát.'); await this.say('nadia', '…Köszi. Végre valaki látja.'); doDeed(g, 'defended_nadia'); gainStat(g, 'bat', 1); npcMem(s, 'nadia').att += 1; }
      if (i === 1) { await this.say('player', 'Theónak igaza van. Ez furcsa.'); await this.say('theo', 'Na ugye! Látod, Nadia? Az új fiú is egyetért.'); doDeed(g, 'flattered_theo'); }
      if (i === 2) await g.ui.say(null, 'Nadia visszafordul a rajzához. Theo vállat von.');
    } else {
      // generált csevegés: amit a pletyka eljuttatott az iskolába
      await g.ui.say(null, ['Esős reggel. A radiátor kattog, Pembroke késik.', 'A padok között egy összegyűrt Herald jár kézről kézre.', 'Az ablakon túl a köd úgy áll, mint egy szürke fal.'][day % 3]);
      for (const who of ['theo', 'nadia', 'ivy']) {
        const vars = g.dlg.deedVars(who);
        const line = g.grammar.expand(`#chatter_${who}#`, makeCtx(g, who, vars), g.content.NPCS[who].voice);
        if (vars.deedKey) npcMem(s, who).commented[vars.deedKey] = true;
        npcMem(s, who).met++;
        await g.ui.say(who, line);
      }
    }
    // óra: kérdés
    const q = QUIZ[(day - 2) % QUIZ.length];
    await this.say('pembroke', q.q);
    const whisper = s.bonds.ivy >= 1 || statLv(s, 'esz') >= 3;
    if (whisper) await g.ui.say(null, statLv(s, 'esz') >= 3 ? 'Tudod a választ. Persze, hogy tudod.' : `Ivy a füzete mögül súgja: „${q.a[q.ok]}…”`);
    const pick = await g.ui.choose(q.a.map((a, i) => ({ label: a, tag: whisper && i === q.ok ? 'SÚGÁS' : null, tagClass: 'clue' })));
    if (pick === q.ok) {
      await this.say('pembroke', 'Helyes. ' + q.why);
      doDeed(g, 'answered_class'); gainStat(g, 'esz', 1);
    } else await this.say('pembroke', 'Nem. ' + q.why + ' Olvasson többet, és aludjon kevesebbet.');
    if (day === 2) {
      await g.ui.say(null, 'Kicsöngetnek. Ivy a táskáját lóbálva megáll a padod mellett.');
      await this.say('ivy', 'Ivy Marlowe. St. Aldric\'s Krónika, főszerkesztő, riporter, fotós és terjesztő. Egyszemélyes szerkesztőség.');
      await this.say('ivy', 'A Fülemüle-ügyön dolgozol, igaz? Ne tagadd, Dex mindent elmond, amit tud. Délután az udvaron leszek. Ha nyomozni akarsz, tudod, hol találsz.');
      npcMem(s, 'ivy').met++;
    }
    s.slot = 'delutan';
    await this.gossipRound();
    g.save();
    await this.chooseAfternoon();
  }

  // ======================= IVY KÖTELÉK-JELENETEK =======================
  async ivyHangout() {
    const g = this.g, s = this.s;
    const rank = s.bonds.ivy;
    await g.ui.fade(1, 400);
    await g.ui.fade(0, 400);
    if (rank === 0) {
      await this.say('ivy', 'Szóval. Arthur Vale unokaöccse. Milyen vele lakni? Tényleg whiskyvel issza a teát?');
      const i = await g.ui.choose([{ label: '„Teával issza a whiskyt. Az más.”' }, { label: '„Jobb, mint amilyennek látszik.”', tag: 'EMPÁTIA', tagClass: 'ok' }, { label: '„Miért érdekel ennyire?”' }]);
      if (i === 0) { await this.say('player', 'Nem a teát issza whiskyvel. A whiskyt teával. Az más.'); await this.say('ivy', 'Ha! Ezt beleírom a cikkembe.'); }
      if (i === 1) { await this.say('player', 'Jobb ember, mint amilyennek látszik. Csak nem szereti, ha ezt bárki észreveszi.'); await this.say('ivy', '…Ez szép volt. Apámra emlékeztet.'); gainBond(g, 'ivy', 1); }
      if (i === 2) { await this.say('player', 'Miért érdekel ennyire?'); await this.say('ivy', 'Mert apám is nyomozott. Nem rendőrként. Újságíróként.'); }
      await g.ui.say(null, 'Elered az eső. Ivy a táskájában kotorászik, de esernyő nincs nála.');
      const j = await g.ui.choose([{ label: 'Odaadod neki az esernyődet' }, { label: 'Együtt áztok' }]);
      if (j === 0) { doDeed(g, 'shared_umbrella'); await this.say('ivy', 'Te aztán… Na jó. De holnap visszakapod. Talán.'); }
      else await this.say('ivy', 'Hát jó. Legalább most már mindketten úgy nézünk ki, mint egy tragikus regény szereplői.');
      gainBond(g, 'ivy', 2);
    } else if (rank === 1) {
      await this.say('ivy', 'Mondhatok valamit? Nem a cikkhez. Csak úgy.');
      await this.say('ivy', 'Apám, Daniel Marlowe, két éve tűnt el. Újságíró volt, a Heraldnál. Egy gyógyszercégről írt cikket. Aztán egy reggel nem jött haza.');
      await this.say('ivy', 'A rendőrség szerint elhagyott minket. Anya elhiszi. Én nem.');
      const i = await g.ui.choose([{ label: '„Melyik cégről írt?”', tag: 'ÉSZ', tagClass: 'ok' }, { label: '„Hiszek neked.”', tag: 'EMPÁTIA', tagClass: 'ok' }, { label: 'Csendben mellette maradsz' }]);
      if (i === 0) { await this.say('player', 'Melyik cégről írt?'); await this.say('ivy', 'Lumen Pharma. Altatók. Azt írta a jegyzeteibe: „Nem az alvást árulják. Hanem az álmot.”'); s.facts.ivy_father = true; s.facts.ivy_lumen = true; gainStat(g, 'esz', 1); }
      if (i === 1) { await this.say('player', 'Hiszek neked.'); await this.say('ivy', '…Senki sem mondta ezt két éve. Köszönöm.'); s.facts.ivy_father = true; gainBond(g, 'ivy', 1); }
      if (i === 2) { await g.ui.say(null, 'Egy ideig csak az esőt hallgatjátok. Ivy aztán a válladnak dől, egy pillanatra. Csak egy pillanatra.'); s.facts.ivy_father = true; }
      gainBond(g, 'ivy', 2);
    } else if (rank === 2 && !s.facts.ivy_ready) {
      await this.say('ivy', 'Furcsát fogok mondani. Ne nevess ki.');
      await this.say('ivy', 'Minden éjjel ugyanazt álmodom. Egy peronon állok, a táblán: „13”. Egy kalauz arc nélkül azt mondja: „Még nem a te vonatod.”');
      await this.say('ivy', 'És tegnap éjjel… téged láttalak ott. Egy magas, maszkos alakkal a hátad mögött.');
      const i = await g.ui.choose([{ label: 'Elmondod neki az igazat', tag: 'BÁTORSÁG', tagClass: 'ok' }, { label: '„Csak álom, Ivy.”' }]);
      if (i === 0) {
        await this.say('player', 'Nem álom volt. Azaz álom volt, de igazi. Éjfélkor tizenhármat üt a Big Ben, és én átlépek. Lyra álmába.');
        await this.say('ivy', '…Tudtam. TUDTAM! Ma éjjel én is jövök. Ne is próbálj lebeszélni. Apa ott van valahol abban a világban, érzem.');
        s.facts.ivy_ready = true;
        g.ui.toast('ÚJ TÁRS', 'Ivy veled tart az álomba', 'bond');
        gainStat(g, 'bat', 1);
      } else {
        await this.say('player', 'Csak álom, Ivy.');
        await this.say('ivy', 'Hm. Persze. Csak álom.', );
        await g.ui.say(null, 'Nem hiszi el. És te sem.');
      }
      gainBond(g, 'ivy', 2);
    } else {
      const scenes = [
        ['Ivy elvisz a kedvenc kávézójába, ahol a pincér a nevén szólítja, és a sütemény mindig tegnapi.', 'Ha egyszer vége lesz ennek az egésznek, írok egy könyvet. Te leszel benne a morcos mellékszereplő.'],
        ['Az iskola tetején ültök, a vízköpők között. Innen látszik a Big Ben.', 'Szerinted ma éjjel is tizenhármat üt? …Ne válaszolj. Tudom.'],
        ['Ivy megmutatja apja régi jegyzetfüzetét. Az utolsó oldalon egy rajz: egy lámpa, és egy kulcs.', 'Egyszer megtalálom, mit nyit ez a kulcs. Velem jössz?'],
      ];
      const sc = scenes[(s.day + rank) % scenes.length];
      await g.ui.say(null, sc[0]);
      await this.say('ivy', sc[1]);
      gainBond(g, 'ivy', 2);
    }
    addLog(g, `Délután Ivyval. ${['Kíváncsi, hangos, és nem hagy békén. Talán ezért jó vele.', 'Az apja eltűnt. Ő keresi. Én is keresek valamit.', 'Ivy is hallja a tizenharmadik órát.', 'Egy délután, ami nem az ügyről szólt.'][Math.min(3, rank)]}`);
  }

  // ======================= ÉJSZAKA =======================
  async startNight() {
    const g = this.g, s = this.s;
    s.slot = 'ejjel';
    await this.gossipRound();
    if (g.scene?.id !== 'office') await g.goto('office', 'bed', { skipEnter: true });
    g.ui.setHUD();
    g.party.restore();
    await this.slotBanner();
    if (!s.facts.persona) return this.firstNight();
    await this.mono('Éjfél előtt pár perccel. A kanapé nyikorog, az eső kopog, Arthur horkol a szomszéd szobában.');
    const opts = [];
    if (s.facts.lyra_touched) opts.push({ label: 'Megvárod a tizenharmadik ütést (álom)', tag: 'ÁLOM', tagClass: 'clue' });
    else opts.push({ label: 'Megvárod a tizenharmadik ütést (álom)', disabled: true, tag: 'MÉG NEM ÉRINTETTED MEG' });
    opts.push({ label: 'Alszol (pihenés)' });
    if (!s.facts.lyra_touched) await this.mono('Lyra álma zárva előtted. Az álom csak azt engedi be, akit ébren már megérintett. A Szent Tamás kórházban fekszik.');
    const i = await g.ui.choose(opts);
    if (opts[i].label.startsWith('Alszol')) {
      await this.mono(s.day >= LAST_DAY ? 'Lehunyod a szemed. Valahol messze tizenhármat üt egy harang, és te átalszod.' : 'Mély, álomtalan alvás. Reggel frissen ébredsz, és egy kicsit bűnösnek érzed magad.');
      return this.nextDay();
    }
    await this.thirteenth();
    await g.goto('peron', null);
  }

  async thirteenth() {
    const g = this.g;
    g.ui.hud(false);
    g.audio.setMusic(false);
    for (let i = 0; i < 13; i++) {
      g.audio.bell(0, i === 12 ? .7 : .45);
      if (i === 12) { g.engine.flash([.4, 1, .9], 1); g.engine.shake = 1; }
      await sleep(window.__fast ? 10 : i < 11 ? 520 : 900);
    }
    await this.mono('Tizenhárom.', { hold: 300 });
    g.ui.hud(true);
  }

  async firstNight() {
    const g = this.g, s = this.s;
    await this.mono('Az első éjszaka Londonban. A kanapé rugói a hátadba nyomódnak. Valahol egy harang üt.');
    await this.thirteenth();
    await this.mono('A szoba megtelik zöldes fénnyel. A padló puha lesz, mint a víz, és te süllyedsz…', { full: true });
    await g.goto('peron', null, { skipEnter: true });
    g.audio.setMusic(true, 'dream');
    await this.say('kalauz', 'Jegyeket, kérem.');
    await this.say('player', 'Hol… hol vagyok?');
    await this.say('kalauz', 'A tizenhármas peronon. Ahová a város álmai futnak be, és ahonnan ritkán indul vissza vonat.');
    await this.say('kalauz', 'Aki hallja a tizenharmadik ütést, az átléphet. Mások álmába. Abba a világba, amely ugyanaz, csak egy másik szemszögből nézve: ahogyan az álmodó érzi, és ahogyan vágyik.');
    await this.say('kalauz', 'Egy hölgy álma nemrég bezárult. A Fülemüle. Odabent ragadt, a saját árnyai között. Te keresed őt, nem igaz?');
    // árny-támadás: Persona ébredés
    await g.ui.say(null, 'A peron végén a köd összesűrűsödik. Egy arctalan alak lép ki belőle, esernyővel, és feléd fordul.');
    g.engine.shake = .6;
    await this.say('kalauz', 'Á. Egy árny. Ő nem kér jegyet.');
    await this.mono('Nem tudsz elfutni. A lábad gyökeret ver. Aztán egy hang a fejedben, a saját hangod, csak régebbi:', { full: true });
    await g.ui.say('dupin', 'Ki vagy te, aki csak nézel, és sosem kérdezel? Eleget hallgattál. Ideje látni.');
    await g.ui.say('dupin', 'Én vagyok az a kérdés, amit sosem mersz feltenni. Én vagyok a logika a ködben. Én vagyok Dupin. És te vagy én.');
    g.audio.sfx('summon'); g.engine.flash([.4, 1, .9], 1); g.engine.shake = 1.2;
    await g.ui.banner('PERSONA', 'DUPIN · a hollómaszkos nyomozó', 'dream');
    s.facts.persona = true;
    addLog(g, 'A tizenharmadik órában felébredt bennem valami. Dupinnak hívja magát. Úgy beszél, mint én, csak bátrabban.');
    const r = await g.battle.start({ enemies: ['faceless'], tutorial: true, canFlee: false });
    if (r.result !== 'win') { g.party.restore(); }
    await this.say('kalauz', 'Hm. Nem rossz. A legtöbben az első éjszakán elfutnak. Vagy felébrednek sikoltva.');
    await this.say('kalauz', 'Halld hát a szabályt: a hölgy álmába csak akkor léphetsz be, ha ébren már megérintetted. Az álom nem enged be idegent.');
    await this.say('kalauz', 'És csak öt éjszakád van. Utána a vonat elindul, és aki a fedélzetén alszik, az nem száll le többé.');
    await this.say('kalauz', 'Most ébredj. A hajnal mindjárt itt van, és a ti iskoláitok nem várnak.');
    s.facts.saw_lamplighter = true;
    await g.ui.fade(1, 700);
    await this.nextDay();
  }

  async nextDay() {
    const g = this.g, s = this.s;
    g.audio.setMusic(true, 'noir');
    s.day += 1;
    if (s.day > LAST_DAY) return this.ending('sleep');
    await this.morning();
  }

  async wakeUp() {
    const g = this.g;
    await this.mono('Kinyitod a szemed. A kanapé. Az eső. A szádban vasíz, mintha egész éjjel futottál volna.');
    await this.nextDay();
  }

  // ======================= ÁLOMVILÁGOK =======================
  async enterPeron() {
    const g = this.g, s = this.s;
    g.audio.setMusic(true, 'dream');
    if (s.facts.ivy_ready && !s.facts.ivy_awake) return this.ivyAwakening();
    if (!s.facts['peron_' + s.day]) {
      s.facts['peron_' + s.day] = true;
      const left = LAST_DAY - s.day;
      await this.say('kalauz', left <= 0 ? 'Az utolsó éjszaka. A vonat hajnalban indul. Ha a hölgy addig nem ébred fel, vele megy.' : `Megint itt. Még ${left + 1} éjszakád van, nyomozó.`);
      if (s.truths.includes('t_senki') && s.truths.includes('t_otthon')) await this.say('kalauz', 'Két ajtót már kinyitottál. Az arany ajtó, a középső, most már enged. Ott vár rád ő. Vagyis az, amivé lett.');
      else if (s.day >= LAST_DAY) await this.say('kalauz', 'Az arany ajtó nyitva. Nem vagy felkészülve. De az idő nem kérdez.');
      else await this.say('kalauz', 'Egy éjszaka, egy ajtó. Válassz bölcsen.');
    }
  }
  async ivyAwakening() {
    const g = this.g, s = this.s;
    const ivy = g.world.addNpc({ id: 'ivy', x: -11.5, z: 0.8, dir: 2 });
    await this.say('ivy', 'Szóval ez az. Tizenhármas peron. Pont olyan, mint az álmaimban. Csak… hidegebb.');
    await this.say('kalauz', 'Még egy utas. Kisasszony, maga már régóta hallja a harangot, igaz? Csak eddig nem mert leszállni.');
    await g.ui.say(null, 'A köd megmozdul. A peron végén két arctalan árny jelenik meg. Ivy felé fordulnak.');
    await this.say('ivy', 'Ezek… ezek apa jegyzeteiben is benne voltak. „Az álom árnyai.” Ő is látta őket!');
    g.engine.shake = .8;
    await g.ui.say('ivy', 'Nem. Nem fogok megint csak állni és nézni, ahogy valaki eltűnik. Elég!');
    g.audio.sfx('summon'); g.engine.flash([1, .3, .7], 1); g.engine.shake = 1.2;
    await g.ui.say(null, 'Ivy körül rózsaszín láng csap fel. Mögötte egy aranyhajú, lepeles alak emelkedik fel, lehunyt szemmel.');
    await g.ui.banner('PERSONA', 'CASSANDRA · a jósnő, akinek senki sem hitt', 'dream');
    s.facts.ivy_awake = true;
    g.ui.toast('ÚJ TÁRS', 'Ivy (Cassandra) csatlakozott a csapathoz', 'bond');
    addLog(g, 'Ivy is átlépett. Cassandra, a jósnő, akinek senki sem hitt. Illik hozzá.');
    await g.battle.start({ enemies: ['faceless', 'faceless'], canFlee: false });
    await this.say('ivy', 'Ez… ez fantasztikus volt. És rémisztő. Főleg fantasztikus.');
    gainBond(g, 'ivy', 2);
    g.world.removeNpc('ivy');
  }

  async enterDream(which) {
    const g = this.g, s = this.s;
    if (which !== 'stage' && s.facts.door_night === s.day && s.facts.door_which !== which) { await this.say('kalauz', 'Egy éjszaka, egy ajtó. Ma már választottál, nyomozó.'); return; }
    if (which !== 'stage') { s.facts.door_night = s.day; s.facts.door_which = which; }
    if (which === 'grey' && s.facts.grey_done) { await this.mono('A Szürke Városban már jártál. Lily ott már nem vár senkit. Most már téged sem.'); return; }
    if (which === 'warm' && s.facts.warm_done) { await this.mono('A Napfény-ház ajtaja zárva. Bentről halk nevetés, ami nem neked szól.'); return; }
    await g.goto(which, null);
  }
  async backToPeron() { await this.g.goto('peron', null); }

  async enterGrey() {
    const g = this.g, s = this.s;
    g.audio.setMusic(true, 'grey');
    if (s.facts.grey_seen) return;
    s.facts.grey_seen = true;
    await this.mono('Ugyanaz az utca. Ugyanaz a London. Csak minden szürke, mint egy kimosott fénykép. Az emberek arca üres, sima, mint a tojás.');
    await this.mono('Csak a plakátok színesek. A Fülemüle mosolyog róluk, harsányan, mint egy reklám. Ő az egyetlen szín ebben a világban, és mégsincs itt.');
    if (s.facts.ivy_awake) await g.ui.say('ivy', 'Ez… szomorú. Ez a legszomorúbb hely, ahol valaha jártam. És én jártam a Heraldnál a szerkesztőségi karácsonyon.');
  }

  async enterWarm() {
    const g = this.g, s = this.s;
    g.audio.setMusic(true, 'warm');
    if (s.facts.warm_seen) return;
    s.facts.warm_seen = true;
    await this.mono('Meleg fény. Naplemente, ami sosem ér véget. Egy ház, egy kert, egy hosszú asztal, és körülötte egy család.');
    await this.mono('Egy nagy, nevetős család. Csak az arcok… az arcok helyén porcelán. Mintha Lily nem tudná, milyen arca van annak, aki szereti.');
    if (s.facts.ivy_awake) await g.ui.say('ivy', 'Ez gyönyörű. Miért fáj ennyire nézni?');
  }

  // a Szürke Város szíve: L. a buszmegállóban
  async greyClimax() {
    const g = this.g, s = this.s;
    await this.mono('A buszmegállóban egy szürke kabátos nő ül. Szemüveg, kontyba fogott haj, egy aktatáska a térdén. A busz soha nem jön.');
    await this.say('lyraGrey', 'Ó. Maga lát engem? Ez… szokatlan. Engem senki sem lát. Én csak L. vagyok, a könyvelésről.');
    await this.say('lyraGrey', 'Tudja, ott a plakátokon… az a Fülemüle. Mindenki őt szereti. Néha arra gondolok, ha eltűnnék, észrevennék? Nem. Őt keresnék, nem engem.');
    const hasDed = s.deds.includes('ded_arc');
    const opts = [
      { label: '„Én nem a Fülemülét keresem. Hanem Lilyt.”', tag: hasDed ? 'KÖVETKEZTETÉS' : null, tagClass: 'clue', ok: true },
      { label: '„De hiszen te vagy a Fülemüle! Mindenki szeret!”' },
      { label: '„Mindenki magányos néha.”', tag: statLv(s, 'emp') >= 3 ? 'EMPÁTIA' : null, tagClass: 'ok', ok: statLv(s, 'emp') >= 3 },
    ];
    if (!hasDed) await this.mono('(Ha tudnád, miért kaparta le az arcát a plakátokról, könnyebb lenne. Vagy talán elég a szív is.)');
    const i = await g.ui.choose(opts);
    if (opts[i].ok) {
      await this.say('player', i === 0 ? 'Én nem a Fülemülét keresem. Hanem Lilyt. Azt a lányt, aki a plakátok mögött van.' : 'Mindenki magányos néha. De te nem vagy láthatatlan. Én látlak.');
      await this.say('lyraGrey', '…Lily? Ezt a nevet… senki sem mondta ki évek óta.');
      g.engine.flash([1, 1, 1], .8);
      await this.mono('L. leveszi a szemüvegét. A szeme kék, és egy pillanatra minden szín visszatér az utcába. Aztán elhalványul, és csak egy mondat marad utána a levegőben:');
      await this.mono('„Mindenki a Fülemülét szereti. Engem senki sem lát.”');
      if (!s.truths.includes('t_senki')) s.truths.push('t_senki');
      g.ui.toast('IGAZSÁG', g.content.TRUTHS.t_senki.name, 'clue'); g.audio.sfx('clue');
      gainBond(g, 'lyra', 1);
    } else {
      await this.say('player', 'De hiszen te vagy a Fülemüle! Mindenki szeret!');
      await this.say('lyraGrey', 'Igen. Őt szeretik. Ez a baj.');
      await this.mono('L. visszateszi a szemüvegét, és a szürke esőbe néz. A pillanat elmúlt. Valamit közelebbről kellett volna látnod.');
      s.facts.grey_failed = true;
    }
    s.facts.grey_done = true;
    addLog(g, s.truths.includes('t_senki') ? 'A Szürke Városban megtaláltam Lilyt. Láthatatlan volt. Én láttam.' : 'A Szürke Városban rossz dolgot mondtam egy szürke nőnek. Talán soha nem tudom meg, mit kellett volna.');
    g.world.removeNpc('lyraGrey');
    await this.say('kalauz', 'Egy éjszaka, egy ajtó. Ébredj, nyomozó.');
    await this.wakeUp();
  }

  async warmClimax() {
    const g = this.g, s = this.s;
    await this.say('lyraMom', 'Ó, vendég! Gyere, ülj le, mindjárt kész a vacsora. Hét óra van. Mindig hét óra van.');
    await this.say('lyraMom', 'Ezek az én gyerekeim. Ő a férjem. Ugye milyen szépek? Egyszer csak mind itt voltak. Mintha mindig is itt lettek volna.');
    await this.mono('A férj nem szól. A gyerekek porcelánarca mosolyog, de a szemük nem mozdul. Lily nem nézi az arcukat. Soha nem nézi.');
    const hasDed = s.deds.includes('ded_csalad');
    const opts = [
      { label: '„Ők nem valódiak, Lily. Csak azt akarod, hogy valaki hazavárjon.”', tag: hasDed ? 'KÖVETKEZTETÉS' : null, tagClass: 'clue', ok: true },
      { label: '„Gyönyörű család. Maradj velük.”' },
      { label: '„Mikor néztél utoljára az arcukba?”', tag: statLv(s, 'esz') >= 3 ? 'ÉSZ' : null, tagClass: 'ok', ok: statLv(s, 'esz') >= 3 },
    ];
    if (!hasDed) await this.mono('(Egy árvaházi fénykép és egy félbehagyott levél segítene megérteni. Vagy egy éles szem.)');
    const i = await g.ui.choose(opts);
    if (opts[i].ok) {
      await this.say('player', i === 0 ? 'Ők nem valódiak, Lily. Te nem családot akarsz kitalálni. Csak azt, hogy valaki egyszer hazavárjon.' : 'Mikor néztél utoljára az arcukba, Lily?');
      await this.say('lyraMom', '…Az arcukba?');
      g.engine.flash([1, .9, .7], .8);
      await this.mono('Lily lassan a gyerekek felé fordul. A porcelán megreped. Nem fáj neki. Sír, de nem fáj.');
      await this.say('lyraMom', 'Minden vasárnap kiálltam az ablakba. Az árvaházban. És vártam. Nem jött senki.');
      await this.mono('„Nem a taps hiányzik. Hanem hogy valaki hazavárjon.”');
      if (!s.truths.includes('t_otthon')) s.truths.push('t_otthon');
      g.ui.toast('IGAZSÁG', g.content.TRUTHS.t_otthon.name, 'clue'); g.audio.sfx('clue');
      gainBond(g, 'lyra', 1);
    } else {
      await this.say('player', 'Gyönyörű család. Maradj velük.');
      await this.say('lyraMom', 'Igen. Igen, maradok. Örökre. Hét óra van, mindig hét óra.');
      await this.mono('A naplemente megmerevedik. Rossz választ adtál, és a ház ezt tudja.');
      s.facts.warm_failed = true;
    }
    s.facts.warm_done = true;
    addLog(g, s.truths.includes('t_otthon') ? 'A Napfény-házban Lily megnézte a porcelánarcokat. Végre sírt.' : 'A Napfény-házban azt mondtam Lilynek, maradjon. Hiba volt. Érzem.');
    for (const id of ['lyraMom', 'husband', 'kidA', 'kidB']) g.world.removeNpc(id);
    await this.say('kalauz', 'Egy éjszaka, egy ajtó. Ébredj, nyomozó.');
    await this.wakeUp();
  }

  // ======================= A FÜLEMÜLE SZÍNPADA =======================
  async enterStage() {
    const g = this.g, s = this.s;
    g.audio.setMusic(false);
    g.world.addBossPlane();
    await this.mono('Egy üres színház. Telt ház, csupa üres szék. A színpad közepén egy aranykalitka, benne egy alak tollból és sötétségből.');
    await this.say(null, 'Egy hang, ami egyszerre Lyra hangja és egy egész stadionnyi tapsé:');
    await g.ui.say('lyra', '♪ Aranykalitka, aranykalitka… ♪ Tapsoljatok! Miért nem tapsoltok?');
    await g.ui.say('lyra', 'Ó. Egy rajongó. Autogramot akarsz? Mindenki azt akar. Egy darabot a Fülemüléből. Vigyél egy tollat. Egyet a sok közül.');
    if (s.facts.ivy_awake) await g.ui.say('ivy', 'Ez ő. Az árnyéka. Minden, amit soha nem mondott ki. Óvatosan!');
    await g.ui.say('lyra', 'Itt maradok. Itt biztonságos. A kalitka rácsai között senki sem kér tőlem többet, mint egy dalt. És itt soha nem kell felébrednem.');
    g.audio.setMusic(true, 'battle');
    await g.ui.banner('A FÜLEMÜLE VISSZHANGJA', 'Lyra árnyéka', '');
    const r = await g.battle.start({ enemies: ['nightingale'], boss: true, canFlee: false });
    if (r.result !== 'win') {
      if (s.day >= LAST_DAY) return this.ending('sleep');
      await this.mono('A reflektorfény elnyel. A taps fülsiketítő lesz, aztán csend. A kanapén ébredsz, zihálva.');
      return this.nextDay();
    }
    g.audio.setMusic(true, 'dream');
    await this.mono('A kalitka rácsai elolvadnak, mint a viasz. Az árnyék összeroskad, és egy lány marad a helyén, térdre esve. Lyra. Nem: Lily.');
    await g.ui.say('lyra', 'Ne… ne nézz rám. Most nincs rajtam smink. Most nincs rajtam semmi. Csak én vagyok.');
    const truths = r.truthsUsed;
    const i = await g.ui.choose([
      { label: 'Kinyújtod felé a kezed', tag: truths >= 3 ? 'MINDEN IGAZSÁG' : null, tagClass: 'clue' },
      { label: 'Végzel az árnyékkal' },
    ]);
    if (i === 1) {
      await g.ui.say('dupin', 'Az árnyékot el lehet pusztítani. De amit elpusztítasz, az többé nem tér vissza.');
      g.engine.flash([1, 1, 1], 1); g.engine.shake = 1;
      await this.mono('Dupin pengéje átsuhan az árnyékon. A tollak szétszóródnak, és a színház lassan kiürül.');
      return this.ending(truths >= 3 ? 'silence' : 'cage');
    }
    if (truths < 3) {
      await this.say('player', 'Gyere. Felébreszthetlek.');
      await g.ui.say('lyra', 'Felébredni? Hová? Vissza a kalitkába? …Jó. Megyek. Hiszen a turné megy tovább.');
      await this.mono('Megfogja a kezed, de a keze hideg. Valamit nem mondtál ki. Valamit, amit csak az igazság nyithatott volna ki.');
      return this.ending('cage');
    }
    await this.say('player', 'Lily. Nem kell eltűnnöd ahhoz, hogy szabad legyél. Láttalak a Szürke Városban. Láttalak a Napfény-házban. És most is látlak.');
    await g.ui.say('lyra', '…Látsz. Engem.');
    await g.ui.say('lyra', 'A dalaim… a saját dalaim. „Senki lánya.” Emlékszel rá?');
    await this.say('player', 'Az öreg Tom még mindig játssza. Minden este. Az igazit.');
    g.audio.sfx('summon'); g.engine.flash([.9, .8, 1], 1); g.engine.shake = 1;
    await this.mono('Lily feláll. Mögötte a tollak összeállnak: egy lila szárnyú, aranymaszkos alak emelkedik fel, és énekelni kezd. Nem az Aranykalitkát. A saját dalát.');
    await g.ui.banner('PERSONA', 'PHILOMELA · aki visszakapta a hangját', 'dream');
    await this.ending('free');
  }

  // ======================= BEFEJEZÉSEK =======================
  async ending(kind) {
    const g = this.g, s = this.s;
    s.ending = kind;
    const deedMap = { free: 'ending_free', silence: 'ending_silence', cage: 'ending_cage', sleep: 'ending_sleep' };
    // a hír mindenkihez eljut
    doDeed(g, deedMap[kind], { witnesses: Object.keys(g.content.NPCS) });
    s.facts.lyra_free = kind === 'free';
    g.audio.setMusic(true, kind === 'sleep' ? 'grey' : 'noir');
    await g.ui.fade(1, 900);
    s.day = Math.min(LAST_DAY + 1, s.day + 1); s.slot = 'reggel';
    await g.goto('soho', 'office', { skipEnter: true, keepFade: true });
    g.ui.hud(false);
    // újság
    const ctx = makeCtx(g, null);
    const head = g.grammar.expand(`#headline_${kind}#`, ctx);
    const subs = [];
    for (let k = 0; k < 2; k++) { const t = g.grammar.expand('#sub_extra#', ctx); if (t && !subs.includes(t)) subs.push(t); }
    await g.ui.fade(0, 900);
    await g.ui.banner('ESTI HÍRNÖK', head, 'dark');
    for (const t of subs) await g.ui.say(null, t);
    // utcai visszhang: a generált reakciók azokra, amit tettél
    const voices = ['maggie', 'dex', 'priya', 'tom'];
    const react = {
      free: { maggie: 'Hallottad? Lily felébredt! Azt mondják, ma este ingyen énekel. Itt, a sarkon. Tommal.', dex: 'Címlap, főnök! „A Fülemüle szabad!” Az egész város erről beszél. És rólad is. Kicsit.', priya: 'Nem tudom, mit csinált, és nem is akarom tudni. De jól csinálta.', tom: '♪ Senki lánya, senki várja, mégis hazatalál… ♪ Hallod? Ez az igazi.' },
      silence: { maggie: 'Felébredt, aztán eltűnt. Azt mondják, vidékre költözött. Talán ott végre senki sem ismeri fel.', dex: 'Kiárusítás! Az összes Fülemüle-újság féláron! Többé nem lesz rá szükség…', priya: 'Az ügy lezárva. Az ilyen ügyek néha úgy záródnak le, hogy senki sem nyer.', tom: 'Nem jött el elbúcsúzni. Talán így jobb. A dalok is elmennek egyszer.' },
      cage: { maggie: 'Visszament a színpadra. Mosolygott. Ugyanazzal a mosollyal, mint a plakáton.', dex: 'A turné megy tovább, főnök! Crane dupla gázsit fizet a fotósoknak.', priya: 'Felébredt. Ez a lényeg, nem? Akkor miért nem érzem úgy?', tom: 'A rádióban megint az Aranykalitka szól. Kikapcsoltam.' },
      sleep: { maggie: 'Még mindig alszik. A virágok elhervadtak a kórteremben. Újakat vittem.', dex: 'Nincs mit eladni, főnök. Senki sem akar olvasni róla. Túl szomorú.', priya: 'Az ügyet elvették tőlünk. Felülről. Ismerős, nem?', tom: 'Minden este eljátszom neki. Hátha meghallja.' },
    }[kind];
    for (const id of voices) {
      const vars = g.dlg.deedVars(id);
      let extra = '';
      if (vars.deedId && !vars.deedId.startsWith('ending')) extra = ' ' + g.grammar.expand('#deed_comment#', makeCtx(g, id, vars), g.content.NPCS[id].voice);
      await g.ui.say(id, react[id] + extra);
    }
    // Lyra
    if (kind === 'free') {
      await g.ui.say(null, 'Este az irodában. Arthur két csészét tesz az asztalra. Aztán egy harmadikat.');
      await g.ui.say('lyra', 'Jó estét. Lily Vance vagyok. Azt mondták, itt dolgozik valaki, aki lát.');
      if (s.facts.crane_confronted) await g.ui.say('lyra', 'Felmondtam Crane-nek. Ma reggel, a kórházi ágyból. Azt mondta, tönkretesz. Azt mondtam neki, hogy ezt már megpróbálta.');
      else await g.ui.say('lyra', 'Crane-nek még nem mondtam fel. De fogok. Csak előbb meg kell tanulnom újra a saját hangomon beszélni.');
      await g.ui.say('lyra', 'És van még valami. A tizenharmadik óra… én is hallom. Philomela velem maradt. Ha kellek, ott leszek a peronon.');
      gainBond(g, 'lyra', 2);
      g.ui.toast('ÚJ TÁRS', 'Lyra (Philomela) csatlakozik a II. fejezetben', 'bond');
    } else if (kind === 'silence') {
      await g.ui.say(null, 'Egy levél érkezik az irodába, feladó nélkül. Benne egy kézzel írt kotta: „Senki lánya”. Alatta egyetlen sor: „Köszönöm, hogy láttál. Most hagyj eltűnni.”');
    } else if (kind === 'cage') {
      await g.ui.say(null, 'A Dean Street kirakataiban a tévék Lyrát mutatják. Énekel. Mosolyog. A szeme nem mosolyog. Ahogy Nadia rajza mondta: arc nélkül jobban hasonlított rá.');
    } else {
      await g.ui.say(null, 'A Szent Tamás harmadik kórtermében a monitor egyenletesen sípol. Éjfélkor felgyorsul. Pontosan tizenhármat.');
    }
    // noir összefoglaló a naplóból
    const deeds = new Set(s.deeds.map(d => d.id));
    const sum = [];
    sum.push(kind === 'free' ? 'A Fülemüle szabad. London azt hiszi, egy csoda volt. Én tudom, hogy csak valaki végre ránézett.' : kind === 'silence' ? 'Megmentettem egy lányt, és elvesztettem egy hangot. Arthur szerint ez is győzelem. Arthur sokat iszik.' : kind === 'cage' ? 'Felébresztettem. Ennyit kértek. Néha a megbízó kapja meg, amit kért, és a lány nem.' : 'Öt éjszaka. Nem volt elég. A város tovább álmodik, és én tovább hallom a harangot.');
    if (deeds.has('helped_tom') || deeds.has('bought_flowers')) sum.push('Soho emlékezni fog rám. A kis jótettek pletykája gyorsabban terjed, mint az eső.');
    if (deeds.has('mocked_tom') || deeds.has('rude_agnes') || deeds.has('bribed_dex')) sum.push('Nem voltam mindig jó ember ezen a héten. A város ezt is feljegyezte.');
    if (deeds.has('lied_police')) sum.push('Shah rendőrtiszt nem felejt. Egyszer még visszakapom azt a hazugságot.');
    if (s.facts.ivy_awake) sum.push('Ivy mellettem állt a peronon. Cassandra és Dupin: egy jósnő, akinek senki sem hisz, és egy nyomozó, aki csak most tanul látni.');
    for (const t of sum) await this.mono(t);
    // II. fejezet előzetes
    g.ui.hud(false);
    await g.ui.fade(1, 900);
    await this.mono('Valahol Londonban, a tizenharmadik órában, egy magas alak gázlámpát gyújt.', { full: true });
    if (s.deds.includes('ded_lumen') || s.facts.ivy_lumen) await this.mono('A lámpa fényében egy logó csillan: Lumen Pharma. „Aludj mélyen.”', { full: true });
    if (s.facts.other_sleepers) await this.mono('Camdenben egy festő alszik már két hónapja. Az ő zsebében is volt egy fekete névjegy.', { full: true });
    if (s.facts.ivy_father) await this.mono('És a peron végén, a ködben, egy férfi áll, kezében egy régi jegyzetfüzettel. Daniel Marlowe.', { full: true });
    await this.mono('II. FEJEZET: A LÁMPAGYÚJTÓ. Folytatása következik.', { full: true });
    const names = { free: 'A FÜLEMÜLE SZABADON', silence: 'CSEND', cage: 'ARANYKALITKA', sleep: 'ÖRÖK ÁLOM' };
    await this.mono(`I. FEJEZET VÉGE · Befejezés: ${names[kind]} · Nyomok: ${s.clues.length}/10 · Igazságok: ${s.truths.length}/3 · Tettek, amikről a város beszélt: ${s.deeds.filter(d => !d.id.startsWith('ending')).length}`, { full: true });
    try { localStorage.removeItem('nocturne_save'); } catch { /* nem baj */ }
    g.toTitle();
  }
}

