// Szereplők, tettek, nyomok, következtetések, igazságok, tárgyak.

export const PLAYER_SPRITE = { skin: '#efc6a4', hair: '#1b1d2e', hairStyle: 'messy', top: '#34333f', topStyle: 'trench', accent: '#1d1f29', scarf: '#a01a2e', legs: '#1d1f29', shoes: '#121217' };

const S = {
  arthur: { skin: '#e2b08f', hair: '#8f8f8f', hairStyle: 'slick', beard: '#7c7c7c', top: '#6b5a3c', topStyle: 'trench', accent: '#2a2216', legs: '#2a2a30', hat: 'fedora', hatColor: '#3a3328', extra: 'cigarette' },
  ivy: { skin: '#f1cfb4', hair: '#b44a22', hairStyle: 'bob', top: '#1d2a4f', topStyle: 'blazer', accent: '#8f1426', legs: '#2a2f45', shoes: '#2a1a14', blush: '#e8988a', extra: 'book' },
  maggie: { skin: '#e9b994', hair: '#b5651d', hairStyle: 'bun', top: '#2f4a3a', topStyle: 'coat', scarf: '#d8a03a', legs: '#3a2a2a', extra: 'flowers', blush: '#e08a7a' },
  tom: { skin: '#d9a988', hair: '#cfcfcf', hairStyle: 'short', beard: '#d6d6d6', top: '#4a3a2a', topStyle: 'coat', legs: '#2a2a2a', hat: 'beanie', hatColor: '#5a2a2a', glasses: true, extra: 'accordion' },
  priya: { skin: '#b98260', hair: '#151215', hairStyle: 'bun', top: '#151a2e', topStyle: 'police', legs: '#151a2e', hat: 'helmet', hatColor: '#10131f', lips: '#7a3a3a' },
  dex: { skin: '#d9a07a', hair: '#3a2516', hairStyle: 'messy', top: '#7a5a1a', topStyle: 'hoodie', legs: '#2a3040', hat: 'cap', hatColor: '#2a3a5a', extra: 'newspaper', kid: true },
  harriet: { skin: '#efc6a4', hair: '#2a1a14', hairStyle: 'ponytail', top: '#3a1a2a', topStyle: 'vest', accent: '#111', legs: '#1a1a1a', lips: '#9a1a2a', extra: 'cigarette' },
  crane: { skin: '#f0c8a8', hair: '#d9d0b0', hairStyle: 'slick', top: '#26262e', topStyle: 'suit', accent: '#7d0c16', legs: '#26262e', shoes: '#0a0a0a' },
  ozzie: { skin: '#efc6a4', hair: '#a0622a', hairStyle: 'messy', top: '#4a3a2a', topStyle: 'vest', accent: '#2a1a14', legs: '#2a2a30', glasses: true, extra: 'clipboard' },
  agnes: { skin: '#efc6a4', hair: '#5a3a2a', hairStyle: 'bun', top: '#5a7aa8', topStyle: 'nurse', legs: '#e8e4da', shoes: '#e8e4da', hat: 'nurse' },
  theo: { skin: '#f3d2b8', hair: '#e0c070', hairStyle: 'slick', top: '#1d2a4f', topStyle: 'blazer', accent: '#d9a540', legs: '#2a2f45' },
  nadia: { skin: '#7a4a30', hair: '#151015', hairStyle: 'bun', top: '#1d2a4f', topStyle: 'blazer', accent: '#8f1426', scarf: '#d8a03a', legs: '#2a2f45', lips: '#5a2a2a' },
  pembroke: { skin: '#e6b896', hair: '#aaaaaa', hairStyle: 'bald', top: '#5a4a3a', topStyle: 'suit', accent: '#2a4a2a', legs: '#4a3a2a', glasses: true, beard: '#9a9a9a' },
  kalauz: { skin: '#cfd8dc', hair: '#111', hairStyle: 'short', top: '#16322f', topStyle: 'coat', accent: '#d9a540', legs: '#0f1f1e', hat: 'conductor', hatColor: '#16322f', gloves: '#f4f1ea', mask: '#06080c' },
  lamplighter: { skin: '#cfd2d8', hair: '#111', hairStyle: 'short', top: '#0c0d12', topStyle: 'robe', legs: '#0c0d12', hat: 'tophat', hatColor: '#0c0d12', extra: 'lantern', faceless: true },
  lyra: { skin: '#f5d6c6', hair: '#eadba8', hairStyle: 'long', top: '#2a1838', topStyle: 'gown', accent: '#d9a540', lips: '#b0304a', blush: '#f0a0a0' },
  lyraGrey: { skin: '#c4c4c4', hair: '#6f6f6f', hairStyle: 'bun', top: '#555559', topStyle: 'coat', legs: '#3a3a3e', glasses: true, lips: '#8a8a8a' },
  lyraMom: { skin: '#f5d6c6', hair: '#eadba8', hairStyle: 'ponytail', top: '#e7a49a', topStyle: 'dress', accent: '#fff4e0', lips: '#c0405a', blush: '#f0a0a0', extra: 'flowers' },
  husband: { skin: '#e8dcd0', hair: '#5a4a3a', hairStyle: 'short', top: '#d9cbb0', topStyle: 'vest', accent: '#8a6a4a', legs: '#5a5040', faceless: true },
  kidA: { skin: '#f8f0ec', hair: '#e0b860', hairStyle: 'ponytail', top: '#ffb0c0', topStyle: 'dress', legs: '#fff', kid: true, faceless: true },
  kidB: { skin: '#f8f0ec', hair: '#7a5030', hairStyle: 'messy', top: '#9fc4ff', topStyle: 'hoodie', legs: '#4a5a8a', kid: true, faceless: true },
  greyA: { skin: '#9a9a9e', hair: '#3a3a3e', hairStyle: 'short', top: '#4a4a50', topStyle: 'coat', legs: '#2a2a2e', faceless: true, extra: 'umbrella', umbrella: '#2a2a30' },
  greyB: { skin: '#a8a8ac', hair: '#2a2a2e', hairStyle: 'bob', top: '#5a5a60', topStyle: 'trench', legs: '#333338', faceless: true, hat: 'fedora', hatColor: '#2a2a30' },
  greyC: { skin: '#8e8e92', hair: '#46464a', hairStyle: 'long', top: '#3e3e44', topStyle: 'coat', legs: '#2a2a2e', faceless: true, extra: 'umbrella', umbrella: '#1e1e22' },
};
export const SPRITES = S;

export const ENEMY_SPRITES = {
  faceless: { skin: '#c9ccd4', hair: '#15161c', hairStyle: 'short', top: '#2a2c36', topStyle: 'trench', legs: '#15161c', faceless: true, extra: 'umbrella', umbrella: '#0c0c10', hat: 'fedora', hatColor: '#0c0c10' },
  umbrella: { skin: '#3a2050', hair: '#120c1e', hairStyle: 'long', top: '#120c1e', topStyle: 'robe', legs: '#120c1e', faceless: true, extra: 'umbrella', umbrella: '#2a1848' },
  porcelain: { skin: '#f8f4f0', hair: '#d9a540', hairStyle: 'ponytail', top: '#f4e8ec', topStyle: 'dress', accent: '#ff8fb0', legs: '#fff', kid: true, faceless: true },
};

// arcana: a Persona-féle kötelékek tarot-lapjai
export const NPCS = {
  arthur: { name: 'Arthur Vale', short: 'ARTHUR', title: 'magánnyomozó · a nagybátyád', sprite: S.arthur, arcana: 'A Remete',
    values: { brave: 1, smart: 1, kind: 1, lie: -1, sneak: 1, bribe: -1 }, links: { harriet: .3, priya: .3, ivy: .2 }, noGossip: false },
  ivy: { name: 'Ivy Marlowe', short: 'IVY', title: 'osztálytárs · iskolaújság', sprite: S.ivy, arcana: 'A Főpapnő',
    values: { brave: 2, smart: 1, kind: 1, rude: -1, sneak: 1, lie: -1 }, links: { theo: .5, nadia: .6, dex: .4, arthur: .2 }, gossipy: 1.2 },
  maggie: { name: 'Maggie Doyle', short: 'MAGGIE', title: 'virágárus', sprite: S.maggie, arcana: 'A Szerencsekerék',
    values: { kind: 2, rude: -2, money: 1, brave: 1, lie: -1 }, links: { tom: .7, dex: .5, priya: .3, harriet: .3 }, gossipy: 1.1 },
  tom: { name: 'Öreg Tom', short: 'TOM', title: 'vak harmonikás', sprite: S.tom, arcana: 'A Bolond',
    values: { kind: 2, rude: -3, brave: 1, money: 0 }, links: { maggie: .7, dex: .4 } },
  priya: { name: 'Priya Shah', short: 'SHAH', title: 'rendőrtiszt', sprite: S.priya,
    values: { law: 2, lie: -2, bribe: -3, sneak: -2, kind: 1, rude: -1, brave: 1 }, links: { maggie: .3, harriet: .3, arthur: .4 } },
  dex: { name: 'Dex', short: 'DEX', title: 'rikkancs', sprite: S.dex,
    values: { money: 2, bribe: 1, rude: -1, brave: 1, law: -1, sneak: 1 }, links: { maggie: .6, tom: .5, harriet: .5, priya: .3, ozzie: .3, ivy: .4 }, gossipy: 1.5 },
  harriet: { name: '„Gin” Harriet', short: 'HARRIET', title: 'csapos · A Vízbefúlt Varjú', sprite: S.harriet,
    values: { brave: 2, kind: 1, law: -1, sneak: 1, rude: 0 }, links: { dex: .4, crane: .3, arthur: .5, ozzie: .3 } },
  crane: { name: 'Victor Crane', short: 'CRANE', title: 'Lyra menedzsere', sprite: S.crane,
    values: { rude: -2, brave: -2, sneak: -3, money: 1, kind: 0 }, links: { ozzie: .3 } },
  ozzie: { name: 'Ozzie Finch', short: 'OZZIE', title: 'színpadmester', sprite: S.ozzie,
    values: { kind: 2, brave: 1, rude: -2 }, links: { crane: .5, harriet: .3, dex: .2 } },
  agnes: { name: 'Agnes Pike', short: 'PIKE NŐVÉR', title: 'ápolónő · Szent Tamás', sprite: S.agnes,
    values: { kind: 2, rude: -2, lie: -1, law: 1 }, links: { crane: .2 } },
  theo: { name: 'Theo Ashworth', short: 'THEO', title: 'osztálytárs · Fülemüle-rajongó', sprite: S.theo,
    values: { money: 1, brave: -1, kind: 0, rude: 0, smart: 1 }, links: { nadia: .4, ivy: .4 } },
  nadia: { name: 'Nadia Okafor', short: 'NADIA', title: 'osztálytárs · rajzszakkör', sprite: S.nadia,
    values: { kind: 2, brave: 1, rude: -2, smart: 1 }, links: { ivy: .6, theo: .3, pembroke: .2 }, gossipy: 1.3 },
  pembroke: { name: 'Mr. Pembroke', short: 'PEMBROKE', title: 'irodalomtanár', sprite: S.pembroke,
    values: { smart: 2, rude: -1, kind: 1 }, links: { nadia: .2 }, noCase: true },
  kalauz: { name: 'A Kalauz', short: 'A KALAUZ', title: '13-as peron', sprite: S.kalauz, dream: true, noGossip: true, noPresent: true, noCase: true, values: {}, links: {} },
  lamplighter: { name: 'A Lámpagyújtó', short: '???', title: '', sprite: S.lamplighter, dream: true, values: {}, links: {}, noTalk: false, simple: true },
  lyraGrey: { name: 'L.', short: 'L.', title: 'irodista · Szürke Város', sprite: S.lyraGrey, dream: true, noGossip: true, noPresent: true, noCase: true, values: {}, links: {}, simple: true },
  lyraMom: { name: 'Lily', short: 'LILY', title: 'anya · Napfény-ház', sprite: S.lyraMom, dream: true, noGossip: true, noPresent: true, noCase: true, values: {}, links: {}, simple: true },
  lyra: { name: 'Lyra Vance', short: 'LYRA', title: '„a Fülemüle”', sprite: S.lyra, arcana: 'A Csillag', dream: true, values: { kind: 1, brave: 1 }, links: {}, simple: true },
  husband: { name: 'A Férj', short: '…', title: 'arc nélkül', sprite: S.husband, dream: true, values: {}, links: {}, simple: true },
  kidA: { name: 'Kislány', short: 'KISLÁNY', title: 'porcelánarc', sprite: S.kidA, dream: true, values: {}, links: {}, simple: true },
  kidB: { name: 'Kisfiú', short: 'KISFIÚ', title: 'porcelánarc', sprite: S.kidB, dream: true, values: {}, links: {}, simple: true },
  greyA: { name: 'Arctalan járókelő', short: '…', title: '', sprite: S.greyA, dream: true, values: {}, links: {}, simple: true },
  dupin: { name: 'Dupin', short: 'DUPIN', title: 'Persona', sprite: { skin: '#d9d2c0', hair: '#0d0f18', hairStyle: 'short', top: '#141b33', topStyle: 'robe', hat: 'tophat', hatColor: '#0d0f18', mask: '#d9d2c0', legs: '#0d0f18' }, dream: true, values: {}, links: {} },
};

// A játékos tettei. tags → az NPC-k "values" alapján változik a hozzáállásuk.
export const DEEDS = {
  bought_flowers: { tags: ['kind', 'money'], spread: .45, log: 'Vettem egy csokor őszirózsát Maggie-től. Senkinek sem adtam oda. Még.' },
  helped_tom: { tags: ['kind'], spread: .6, log: 'Egy font Tom kalapjában. Kevés, de a harmonika hálásan felsóhajtott.' },
  mocked_tom: { tags: ['rude'], spread: .75, log: 'Kinevettem egy vak öregembert. Az eső sem moshatja le.' },
  bribed_dex: { tags: ['money', 'bribe'], spread: .5, log: 'Pénzért vettem egy pletykát egy gyerektől. London így működik.' },
  lied_police: { tags: ['lie'], spread: .5, log: 'Hazudtam egy rendőrnek. Könnyebben ment, mint kellett volna.' },
  honest_police: { tags: ['law', 'kind'], spread: .4, log: 'Megmondtam a rendőrnőnek az igazat. Néha ez is működik.' },
  stood_harriet: { tags: ['brave'], spread: .6, log: 'Kiálltam egy részeg mellett a Varjú előtt. Harriet figyelt.' },
  threatened_crane: { tags: ['brave', 'rude'], spread: .8, log: 'Nekimentem Victor Crane-nek. Az ilyen emberek nem felejtenek.' },
  sneaked_office: { tags: ['sneak'], spread: .35, log: 'Beosontam Crane irodájába. Arthur büszke lenne. Vagy dühös.' },
  calmed_ozzie: { tags: ['kind'], spread: .5, log: 'Megnyugtattam Ozzie-t. Egy remegő kéz is lehet szövetséges.' },
  shared_umbrella: { tags: ['kind'], spread: .55, log: 'Megosztottam az esernyőmet Ivyval. Ő vitte. Én áztam.' },
  answered_class: { tags: ['smart'], spread: .6, log: 'Jól feleltem Pembroke óráján. Apró győzelmek egy ködös reggelen.' },
  defended_nadia: { tags: ['brave', 'kind'], spread: .7, log: 'Kiálltam Nadiáért Theóval szemben. A folyosó elcsendesedett.' },
  flattered_theo: { tags: ['money'], spread: .4, log: 'Theónak azt mondtam, amit hallani akart. Tartozik eggyel.' },
  kind_agnes: { tags: ['kind'], spread: .4, log: 'Megköszöntem Pike nővérnek a munkáját. Úgy nézett rám, mintha ritkán hallaná.' },
  rude_agnes: { tags: ['rude'], spread: .5, log: 'Rászóltam a nővérre. Nem vagyok rá büszke.' },
  // a fejezet végén a sajtó is ír róla (mindenki megtudja)
  ending_free: { tags: ['kind', 'brave'], spread: 1, quiet: true },
  ending_silence: { tags: ['kind'], spread: 1, quiet: true },
  ending_cage: { tags: ['brave'], spread: 1, quiet: true },
  ending_sleep: { tags: [], spread: 1, quiet: true },
};

export const CLUES = {
  jegyzokonyv: { name: 'Rendőrségi jegyzőkönyv', where: 'Shah rendőrtiszt', desc: 'Lyra Vance október 10-én, pontban éjfélkor esett össze a Westminster hídon. Egy tanú esküszik rá, hogy a Big Ben tizenhármat ütött.', hint: 'A rendőrség tud valamit az összeesésről.' },
  plakat: { name: 'Kikapart plakát', where: 'Soho, a színház fala', desc: 'A Fülemüle összes plakátján ki van kaparva az arc. Csak az arc: a név és a dátum érintetlen.', hint: 'Valami nem stimmel a színház falán.' },
  dex_tanu: { name: 'Dex vallomása', where: 'Dex, rikkancs', desc: 'Egy kapucnis nő kaparta le az arcokat, éjjel. Közben dúdolt, „pont úgy, mint a rádióban”.', hint: 'Egy utcagyerek mindent lát.' },
  foto: { name: 'Árvaházi fénykép', where: 'Maggie Doyle', desc: 'Szent Brigitta Árvaház, Whitechapel, 2009. Középen egy szőke kislány: Lily Vance. Senki sem áll mögötte.', hint: 'Valaki ismerte Lyrát, mielőtt híres lett.' },
  kotta: { name: '„Senki lánya”: kézírásos kotta', where: 'Öreg Tom', desc: 'Lyra saját dala tizenhét évesen. Crane később „Aranykalitka” címmel adta ki, átírt szöveggel.', hint: 'Valaki hallotta Lyrát énekelni az utcán.' },
  veszekedes: { name: 'Veszekedés a Varjúban', where: '„Gin” Harriet', desc: 'Egy héttel az összeesés előtt Lyra ezt kiabálta Crane-nek: „Nem leszek a kalitkás madarad!”', hint: 'A kocsmában mindenki hall mindent.' },
  szerzodes: { name: 'Crane szerződése', where: 'Színház, Crane irodája', desc: 'Ötéves világturné. Lyra aláírása helyén Crane írt alá meghatalmazással, két nappal az összeesés után.', hint: 'Crane irodája a színházban van.' },
  level: { name: 'Befejezetlen levél', where: 'Színház, Lyra öltözője', desc: '„Kedves Senki! Ha egyszer hazaérek, várj meg. Csak egyszer várjon meg valaki…” Lyra kézírása.', hint: 'Lyra öltözője a színházban van.' },
  gyogyszer: { name: 'Somnyx altató', where: 'Szent Tamás Kórház', desc: 'Erős altató, a gyártó a Lumen Pharma. A logó egy égő gázlámpa. Lyra hónapok óta szedte.', hint: 'A kórházban tudják, mit szedett Lyra.' },
  nevjegy: { name: 'Fekete névjegy', where: 'Lyra kabátzsebe', desc: 'Matt fekete kártya, ezüst lámpapecsét. A hátoldalán: „A tizenharmadik órában minden ajtó nyitva.”', hint: 'Lyra holmija a kórházban van.' },
};

export const DEDUCTIONS = {
  ded_arc: { pairs: [['plakat', 'dex_tanu']], name: 'Lyra a saját arcát kaparta le', desc: 'Nem rongálás volt. Lyra gyűlöli a képet, amit mindenki szeret. A Fülemüle nem ő.' },
  ded_csalad: { pairs: [['foto', 'level']], name: 'Lyra családra vágyik', desc: 'Árvaházban nőtt fel, és soha senki nem várta haza. A hírnév ezt nem pótolta, csak eltakarta.' },
  ded_kalitka: { pairs: [['kotta', 'veszekedes'], ['szerzodes', 'veszekedes'], ['kotta', 'szerzodes']], name: 'Crane kalitkában tartja', desc: 'Crane elvette a dalait, most pedig az éveit is. Lyra nem a saját életét éli.', truth: 't_kalitka' },
  ded_lumen: { pairs: [['gyogyszer', 'nevjegy']], name: 'Lumen Pharma és a 13. óra', desc: 'Ugyanaz a lámpapecsét a gyógyszeren és a névjegyen. Valaki altatja azokat, akik álmodni tudnak?' },
  ded_13: { pairs: [['jegyzokonyv', 'nevjegy']], name: 'A tizenharmadik ütés', desc: 'A tanú nem volt részeg. Éjfélkor tizenhárom ütés: ugyanaz, amit te is hallottál.' },
};

export const TRUTHS = {
  t_senki: { name: '„Engem senki sem lát”', desc: 'Mindenki a Fülemülét szereti. Lily Vance-t, a lányt a plakát mögött, senki sem látja.', hint: 'A Szürke Városban rejtőzik.' },
  t_otthon: { name: '„Haza akarok menni valakihez”', desc: 'Nem a taps hiányzik neki, hanem hogy valaki hazavárja.', hint: 'A Napfény-házban rejtőzik.' },
  t_kalitka: { name: '„Ezek nem az én dalaim”', desc: 'Nem ő választotta ezt az életet. Crane elvette a hangját.', hint: 'A valóságban, Crane körül.' },
};

export const ITEMS = {
  tea: { name: 'Teás termosz', desc: 'Forró, erős, tejjel. 35 ÉP-t ad vissza.', hp: 35 },
  mint: { name: 'Mentolos cukorka', desc: 'Kitisztítja a fejet. 12 LP-t ad vissza.', sp: 12 },
};

// plakátok pixelgrafikája
export function drawPoster(x, kind, W, H) {
  x.imageSmoothingEnabled = false;
  const r = (a, b, c, d, col) => { x.fillStyle = col; x.fillRect(a, b, c, d); };
  if (kind === 'lyra' || kind === 'lyra_scratched' || kind === 'lyra_grey') {
    const grey = kind === 'lyra_grey';
    r(0, 0, W, H, grey ? '#1a1a1e' : '#1a0b24');
    for (let i = 0; i < 10; i++) r(0, i * 6, W, 3, grey ? '#202024' : '#220e30');
    // arc
    r(14, 12, 20, 22, '#f5d6c6'); r(12, 14, 24, 18, '#f5d6c6');
    r(10, 8, 28, 8, '#eadba8'); r(8, 12, 6, 30, '#eadba8'); r(34, 12, 6, 30, '#eadba8');
    r(17, 20, 4, 3, '#1a0b24'); r(27, 20, 4, 3, '#1a0b24'); r(18, 20, 2, 2, '#7ad0ff'); r(28, 20, 2, 2, '#7ad0ff');
    r(21, 28, 6, 2, '#b0304a');
    r(16, 34, 16, 10, '#2a1838'); r(20, 34, 8, 3, '#d9a540');
    if (kind === 'lyra_scratched') {
      r(10, 9, 28, 26, '#3a2a30');
      for (let i = 0; i < 26; i++) r(11 + ((i * 7) % 26), 10 + ((i * 11) % 24), 2, 1, i % 2 ? '#d9cfb4' : '#7a6a60');
    }
    r(4, 48, 40, 6, '#d9a540'); x.fillStyle = '#1a0b24'; x.font = 'bold 6px sans-serif'; x.textAlign = 'center'; x.fillText('THE NIGHTINGALE', W / 2, 53);
    x.fillStyle = grey ? '#9a9a9a' : '#ffd27a'; x.font = '5px sans-serif'; x.fillText('LYRA VANCE · OCT', W / 2, 61);
    if (grey) { x.fillStyle = 'rgba(0,0,0,.0)'; }
  } else if (kind === 'lumen') {
    r(0, 0, W, H, '#0c1a1a'); r(20, 10, 8, 4, '#d9d9d9'); r(18, 14, 12, 14, '#ffd27a'); r(18, 14, 12, 2, '#d9d9d9'); r(22, 28, 4, 14, '#d9d9d9');
    x.fillStyle = '#e8f8ff'; x.font = 'bold 7px sans-serif'; x.textAlign = 'center'; x.fillText('LUMEN', W / 2, 52); x.font = '5px sans-serif'; x.fillText('aludj mélyen', W / 2, 60);
  } else if (kind === 'missing') {
    r(0, 0, W, H, '#d9cfb4'); r(10, 10, 28, 26, '#8a8070'); x.fillStyle = '#2a1a14'; x.font = 'bold 7px sans-serif'; x.textAlign = 'center'; x.fillText('ELTŰNT', W / 2, 46); x.font = '5px sans-serif'; x.fillText('macska · Mr. Pip', W / 2, 56);
  } else if (kind === 'family') {
    r(0, 0, W, H, '#f4e2c0'); r(4, 4, W - 8, H - 8, '#e8c890');
    for (let i = 0; i < 5; i++) { r(6 + i * 8, 24 - (i % 2) * 4, 6, 20, ['#e7a49a', '#d9cbb0', '#ffb0c0', '#9fc4ff', '#f0d0a0'][i]); r(6 + i * 8, 14 - (i % 2) * 4, 6, 8, '#f8f0ec'); }
    x.fillStyle = '#7a5030'; x.font = '5px sans-serif'; x.textAlign = 'center'; x.fillText('otthon', W / 2, 58);
  } else if (kind === 'show') {
    r(0, 0, W, H, '#220810'); r(6, 6, W - 12, H - 12, '#3a0c18'); x.fillStyle = '#ffd27a'; x.font = 'bold 9px sans-serif'; x.textAlign = 'center'; x.fillText('MA', W / 2, 26); x.fillText('ESTE', W / 2, 38); x.font = '5px sans-serif'; x.fillText('a Fülemüle', W / 2, 50); x.fillText('— nem lép fel —', W / 2, 57);
  }
}
