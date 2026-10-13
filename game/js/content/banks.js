// Szóbankok: ebből rakja össze a játék a mondatokat. A feltételes elemek ({t, if}) a játékállapottól függnek.
// Hasznos változók: {player} {npc} {deedYou} (2. személy: "bedobtál…") {deedThey} (3. személy) {deedSrc} {gFrom}

// [érintett NPC, 2. személy, 3. személy, 2. sz. az érintett szájából, 3. sz. az érintett szájából, 2. sz. ha az érintett mesélte el]
const DEED_TEXT = {
  bought_flowers: ['maggie', ['vettél egy csokor virágot Maggie-től', 'virágot vettél Maggie standjánál'], ['vett egy csokor virágot Maggie-től', 'virágot vett Maggie standjánál'], ['vettél tőlem egy csokor virágot'], ['vett tőlem egy csokor virágot'], ['vettél tőle egy csokor virágot']],
  helped_tom: ['tom', ['bedobtál egy fontot Tom kalapjába', 'segítettél az öreg Tomnak'], ['bedobott egy fontot Tom kalapjába', 'segített az öreg Tomnak'], ['bedobtál egy fontot a kalapomba'], ['bedobott egy fontot a kalapomba'], ['bedobtál egy fontot a kalapjába']],
  mocked_tom: ['tom', ['kinevetted a vak Tomot', 'gúnyt űztél az öreg harmonikásból'], ['kinevette a vak Tomot', 'gúnyt űzött az öreg harmonikásból'], ['kinevettél engem'], ['kinevetett engem'], ['kinevetted őt']],
  bribed_dex: ['dex', ['lefizetted Dexet egy kis pletykáért', 'pénzt nyomtál Dex markába'], ['lefizette Dexet egy kis pletykáért', 'pénzt nyomott Dex markába'], ['pénzt nyomtál a markomba'], ['pénzt nyomott a markomba'], ['pénzt nyomtál a markába']],
  lied_police: ['priya', ['hazudtál Shah rendőrtisztnek', 'átverted a rendőrnőt'], ['hazudott Shah rendőrtisztnek', 'átverte a rendőrnőt'], ['hazudtál nekem'], ['hazudott nekem'], ['hazudtál neki']],
  honest_police: ['priya', ['őszinte voltál Shah rendőrtiszttel', 'mindent elmondtál a rendőrnőnek'], ['őszinte volt Shah rendőrtiszttel', 'mindent elmondott a rendőrnőnek'], ['őszinte voltál velem'], ['őszinte volt velem'], ['őszinte voltál vele']],
  stood_harriet: ['harriet', ['kiálltál egy részeggel szemben a Varjú előtt', 'nem hátráltál meg a Varjú előtt'], ['kiállt egy részeggel szemben a Varjú előtt', 'nem hátrált meg a Varjú előtt'], ['elzavartad azt a részeget a Varjú elől'], ['elzavarta azt a részeget a Varjú elől'], ['elzavartál előle egy részeget']],
  threatened_crane: ['crane', ['nekimentél Victor Crane-nek', 'jól odamondtál Crane-nek a színházban'], ['nekiment Victor Crane-nek', 'jól odamondott Crane-nek a színházban'], ['megfenyegettél engem'], ['megfenyegetett engem'], ['megfenyegetted őt']],
  sneaked_office: ['crane', ['beosontál Crane irodájába', 'kutakodtál Crane irodájában'], ['beosont Crane irodájába', 'kutakodott Crane irodájában'], ['az irodámban kutakodtál'], ['az irodámban kutakodott'], ['az irodájában kutakodtál']],
  calmed_ozzie: ['ozzie', ['megnyugtattad Ozzie-t', 'kedves voltál szegény Ozzie-val'], ['megnyugtatta Ozzie-t', 'kedves volt szegény Ozzie-val'], ['megnyugtattál engem'], ['kedves volt hozzám'], ['megnyugtattad őt']],
  shared_umbrella: ['ivy', ['odaadtad az esernyődet Ivynak', 'megosztottad az esernyődet Ivyval'], ['odaadta az esernyőjét Ivynak', 'megosztotta az esernyőjét Ivyval'], ['nekem adtad az esernyődet'], ['nekem adta az esernyőjét'], ['neki adtad az esernyődet']],
  answered_class: ['pembroke', ['jól feleltél Pembroke óráján', 'lenyűgözted Pembroke-ot'], ['jól felelt Pembroke óráján', 'lenyűgözte Pembroke-ot'], ['jól feleltél az órámon'], ['jól felelt az órámon'], ['jól feleltél az óráján']],
  defended_nadia: ['nadia', ['kiálltál Nadiáért Theóval szemben', 'megvédted Nadiát a folyosón'], ['kiállt Nadiáért Theóval szemben', 'megvédte Nadiát a folyosón'], ['kiálltál értem Theóval szemben'], ['kiállt értem Theóval szemben'], ['kiálltál érte Theóval szemben']],
  flattered_theo: ['theo', ['hízelegtél Theónak', 'Theo kedvére tettél'], ['hízelgett Theónak', 'Theo kedvére tett'], ['igazat adtál nekem'], ['igazat adott nekem'], ['igazat adtál neki']],
  kind_agnes: ['agnes', ['megköszönted Pike nővér munkáját', 'kedves voltál a nővérrel'], ['megköszönte Pike nővér munkáját', 'kedves volt a nővérrel'], ['megköszönted a munkámat'], ['megköszönte a munkámat'], ['megköszönted a munkáját']],
  rude_agnes: ['agnes', ['rászóltál Pike nővérre', 'goromba voltál a nővérrel'], ['rászólt Pike nővérre', 'goromba volt a nővérrel'], ['goromba voltál velem'], ['goromba volt velem'], ['goromba voltál vele']],
};

export const BANKS = {
  // ---- köszönés, apróságok ----
  greet: [
    { t: 'Jó estét.', if: { slot: 'este' } }, { t: 'Jó napot.', if: { slot: 'delutan' } }, 'Üdv.',
    { t: 'Á, megint te.', if: { 'npc.att<': 0 } }, { t: 'Na, nézd csak, ki van itt!', if: { 'npc.att>=': 2 } },
  ],
  small: ['Ez az eső sosem áll el.', 'London. Mit mondhatnék.', 'Furcsa idők járnak.'],
  bye: ['Vigyázz magadra.', 'Na, menj csak.', { t: 'Ne ázz el!', if: { slot: 'este' } }],
  praise: ['Ritka az ilyen errefelé.', 'Ez tetszik.', 'Van benned valami.', 'Na, ez már beszéd.'],
  scold: ['Ezt nem kellett volna.', 'Szégyelld magad.', 'Ez nem volt szép.', 'Rossz irányba indultál.'],
  neutral: ['Hát. Ki-ki maga dolga.', 'Nem az én dolgom.', 'Érdekes.'],

  // a köszönéshez fűzött megjegyzés egy tettedről, amiről az NPC tud
  deed_comment: [
    { t: 'Láttam ám, hogy {deedYou}. #praise#', if: { 'v.deedSelf': true, 'v.deedTone>': 0 } },
    { t: 'Láttam, hogy {deedYou}. #scold#', if: { 'v.deedSelf': true, 'v.deedTone<': 0 } },
    { t: 'Láttam, hogy {deedYou}. #neutral#', if: { 'v.deedSelf': true, 'v.deedTone': 0 } },
    { t: '{deedSrc} mesélte, hogy {deedYou}. #praise#', if: { 'v.deedSelf': false, 'v.deedTone>': 0 } },
    { t: 'Azt mondja {deedSrc}, hogy {deedYou}. #scold#', if: { 'v.deedSelf': false, 'v.deedTone<': 0 } },
    { t: '{deedSrc} szerint {deedYou}. #neutral#', if: { 'v.deedSelf': false, 'v.deedTone': 0 } },
  ],
  gossip_you: [
    { t: 'Azt mondja {gFrom}, hogy {deedYou}. #praise#', if: { 'v.deedTone>': 0 } },
    { t: 'Úgy hallottam, {deedYou}. Legalábbis {gFrom} ezt terjeszti. #praise#', if: { 'v.deedTone>': 0 } },
    { t: '{gFrom} mesélte, hogy {deedYou}. #scold#', if: { 'v.deedTone<': 0 } },
    { t: 'Na és igaz, hogy {deedYou}? {gFrom} ezt mondja. #scold#', if: { 'v.deedTone<': 0 } },
    { t: '{gFrom} szerint {deedYou}. #neutral#', if: { 'v.deedTone': 0 } },
  ],
  // városi pletykák, a történet állásától függően
  rumor: [
    { t: 'Azt beszélik, a Fülemüle napok óta alszik, és egy orvos sem tudja, miért.', if: { 'f.lyra_free!': true } },
    'Valami lámpás alak jár éjjelente a sikátorokban. Nem gyújt lámpát, csak nézi őket.',
    'A Lumen Pharma reklámja mindenhol ott van: „Aludj mélyen.” Hát, van, aki túl mélyen alszik.',
    'Azt mondják, éjfélkor néha tizenhármat üt a Big Ben. Csak azok hallják, akiknek nem kéne.',
    { t: 'Crane új turnét jelentett be. Lyra nélkül? Vagy helyette?', if: { 'day>=': 3 } },
    { t: 'Valaki jól odamondott Crane-nek a színházban. Ozzie azóta fütyörészik.', if: { 'f.crane_confronted': true } },
    { t: 'A Herald szerint a Fülemüle kórházi szobájába egy fekete ruhás férfi próbált bejutni.', if: { 'day>=': 2 } },
    { t: 'Whitechapelben bezárt egy régi árvaház. Senki sem sírt utána.', if: { 'clue.foto': true } },
  ],
  bark_deed: [
    { t: 'Ott megy, aki {deedThey}.', if: { 'v.deedTone>': 0 } },
    { t: '(Ő az, aki {deedThey}…)', if: { 'v.deedTone<': 0 } },
    { t: 'Nézd, az, aki {deedThey}.', if: { 'v.deedTone': 0 } },
  ],
  present_generic: ['{clue}? Erről nem tudok semmit.', 'Hm. {clue}. Nem, nem mond semmit.', 'Ezt mutasd meg valaki másnak.'],

  // ---- noir belső monológ ----
  noir_open: [
    { t: 'Az eső úgy esett Sohóra, mintha valaki odafent a bűneit akarná kimosni.', if: { scene: 'soho', slot: 'este' } },
    { t: 'A neon vérzett a pocsolyákban, és senki sem hívott orvost.', if: { slot: 'este' } },
    { t: 'Délután volt, de a köd már este volt.', if: { slot: 'delutan' } },
    { t: 'A kórházi folyosón a csend hangosabb volt, mint a sziréna.', if: { scene: 'hospital' } },
    { t: 'Az iskola udvarán a fák úgy álltak, mint a tanúk, akik nem akarnak vallani.', if: { scene: 'school' } },
    { t: 'A színfalak mögött minden kisebb, porosabb, és őszintébb.', if: { scene: 'theatre' } },
    { t: 'Az iroda whiskyszagú volt és régi papírszagú. Arthur szaga.', if: { scene: 'office' } },
    'London sosem alszik. Csak néha elfelejt felébredni.',
    'Az esernyő otthon maradt. Persze, hogy otthon maradt.',
  ],
  noir_case: [
    { t: 'Egy alvó csillag, egy menedzser túl fehér fogakkal, és egy város, ami mindent lát, de semmit sem mond.', if: { 'clues<': 2 } },
    { t: 'A nyomok egy irányba mutattak. Csak én nem akartam még odanézni.', if: { 'clues>=': 5 } },
    { t: 'A Fülemüle a saját arcát kaparta le. Ki gyűlöli ennyire a tükörképét?', if: { 'ded.ded_arc': true } },
    { t: 'Crane mosolya túl fehér volt ahhoz, hogy őszinte legyen.', if: { 'f.met_crane': true } },
    { t: 'Lumen. Fény. Furcsa név egy altatónak.', if: { 'clue.gyogyszer': true } },
    { t: 'Egy árvaházi fénykép. Egy kislány, aki mögött senki sem áll. Ilyen képeket nem lehet elfelejteni.', if: { 'clue.foto': true } },
    { t: 'Négy darab egy kirakósból. Az ötödik mindig a legnehezebb.', if: { 'clues': 4 } },
  ],
  noir_self: [
    { t: 'Tom harmonikája még szólt a fülemben. Egy font. Ennyibe került, hogy jobban érezzem magam.', if: { 'deed.helped_tom': true } },
    { t: 'A rendőrnő pillantása még mindig a hátamban égett.', if: { 'deed.lied_police': true } },
    { t: 'Crane arca, amikor nekimentem. Megérte. Valószínűleg.', if: { 'deed.threatened_crane': true } },
    { t: 'Kezdtem érteni, miért iszik Arthur.', if: { 'day>=': 3 } },
    { t: 'Néha még hallottam a tizenharmadik ütést. Mint egy fogfájás, csak a lélekben.', if: { 'f.persona': true } },
    { t: 'Ivy azt mondta, a jó kérdés fontosabb a jó válasznál. Nekem egyik sem volt.', if: { 'bond.ivy>=': 1 } },
    'A sálam vizes volt, a cipőm vizes volt. A gondolataim is.',
  ],
  mono: ['#noir_open# #noir_case#', '#noir_open# #noir_self#', '#noir_open#'],

  // ---- reggeli osztályterem ----
  chatter_theo: [
    { t: 'Már napok óta nem ébred fel. A Fülemüle! Ha nem ébred fel, én sem kelek fel többet. Komolyan.', if: { 'day<=': 2 } },
    { t: 'Láttátok a Herald címlapját? „Az alvó csillag.” Írtam neki egy levelet. A tizenhatodikat.', if: { 'day>=': 3 } },
    { t: 'Állítólag {player} a nagybátyjával nyomoz a Fülemüle ügyében. Mondd, hogy igaz!', if: { 'f.case_open': true, 'day<=': 3 } },
    { t: 'Azt hallottam, {deedYou}. Ez most menő vagy ijesztő? Még nem döntöttem el.', if: { 'v.deedId': true } },
    { t: 'Apám szerint a Lumen Pharma részvényei az egekben vannak. Mindenki rosszul alszik mostanában.', if: { 'day>=': 4 } },
  ],
  chatter_nadia: [
    'Az éjjel megint arról álmodtam, hogy egy peronon állok. Tizenhármas peron. Hülyeség, ugye?',
    { t: 'Lerajzoltam a Fülemülét arc nélkül. Szerintem így jobban hasonlít rá.', if: { 'day>=': 2 } },
    { t: 'Hé, hallom, {deedYou}. #praise#', if: { 'v.deedTone>': 0 } },
    { t: 'Hallom, {deedYou}. Ez nem te vagy. Ugye nem te vagy?', if: { 'v.deedTone<': 0 } },
    { t: 'Ivy egész éjjel a jegyzeteit bújta. Valami lámpás cég. Kérdezd meg tőle, ha mered.', if: { 'bond.ivy>=': 1 } },
  ],
  chatter_ivy: [
    { t: 'Szóval. Nyomozunk vagy nem nyomozunk? Mert én már nyomozok.', if: { 'bond.ivy<': 1 } },
    { t: 'Délután ráérsz? Van egy ötletem. Rossz ötlet, de ötlet.', if: { 'bond.ivy>=': 1 } },
    { t: 'Dex mondta, hogy {deedYou}. Dex mindent elmond. Nekem főleg.', if: { 'v.deedId': true } },
    { t: 'Éjjel megint ugyanaz az álom. Egy vonat. Egy kalauz arc nélkül. Te nem álmodsz ilyesmiről?', if: { 'bond.ivy>=': 2, 'f.ivy_awake!': true } },
    { t: 'Ma éjjel is jövök. Ne is próbálj lebeszélni. Cassandra már ébren van.', if: { 'f.ivy_awake': true } },
  ],

  // ---- a Fülemüle árnyéka (boss) gúnyolódik: amit a város lát, az álom is tudja ----
  taunt: [
    'Tapsoljatok! Mindig tapsoljatok! A taps mögött senki sem hallja, ha sírok.',
    'Mit akarsz tőlem? Autogramot? Mindenki azt akar.',
    { t: 'Ismerlek. Te vagy az, aki {deedYou}. Ugyanolyan vagy, mint ők.', if: { 'v.deedTone<': 0 } },
    { t: 'Pénzt nyomtál egy gyerek markába. A szeretet nálad is csak üzlet?', if: { 'deed.bribed_dex': true } },
    { t: 'Kinevettél egy vak öregembert. Engem is ki fogsz nevetni?', if: { 'deed.mocked_tom': true } },
    { t: 'Virágot vettél. Kinek? Nekem is mindig virágot hoznak. Senki sem kérdezi, mi a kedvencem.', if: { 'deed.bought_flowers': true } },
    { t: 'Crane-nek nekimentél. Bátor. És ostoba. Ő a kulcs, én a madár.', if: { 'deed.threatened_crane': true } },
  ],
  taunt_hit: ['Ááh… a reflektor… éget…', 'Ne nézz rám! Ne NÉZZ rám!', 'Még egy ráadás? Mindig még egy ráadás…'],

  // ---- epilógus: újságcímek ----
  headline_free: ['A FÜLEMÜLE SZABADON ÉNEKEL', 'FELÉBREDT A CSILLAG, ÉS FELMONDOTT', 'LYRA VANCE: „AZ ÉN DALAIM, AZ ÉN HANGOM”'],
  headline_silence: ['A FÜLEMÜLE FELÉBREDT, ÉS ELTŰNT', 'LYRA VANCE VISSZAVONUL', 'CSEND A SZÍNHÁZBAN'],
  headline_cage: ['A FÜLEMÜLE VISSZATÉR A SZÍNPADRA', 'CRANE: „A TURNÉ MEGY TOVÁBB”', 'FELÉBREDT A CSILLAG, AZ ELŐADÁS FOLYTATÓDIK'],
  headline_sleep: ['A FÜLEMÜLE NEM ÉBRED', 'AZ ALVÓ CSILLAG: AZ ORVOSOK TANÁCSTALANOK', 'ÖTÖDIK ÉJSZAKA, ÉBREDÉS NÉLKÜL'],
  sub_extra: [
    { t: 'Egy névtelen fiatal nyomozót is emlegetnek, aki a nagybátyjával dolgozott az ügyön.', if: { 'f.case_open': true } },
    { t: 'Victor Crane menedzser nem kívánt nyilatkozni. Szemtanúk szerint egy fiatalember nyilvánosan kérdőre vonta.', if: { 'f.crane_confronted': true } },
    { t: 'A Lumen Pharma közleményben tagadta, hogy a Somnyx altatónak bármi köze lenne az esethez.', if: { 'ded.ded_lumen': true } },
    { t: 'Soho árusai szerint az utóbbi napokban „mintha jobban figyelnének egymásra az emberek”.', if: { 'deed.helped_tom': true } },
  ],
};

for (const [id, [owner, you, they, youSelf, theySelf, youFromOwner]] of Object.entries(DEED_TEXT)) {
  BANKS['deedYou_' + id] = [
    ...you.map(t => ({ t, if: { 'v.speaker!': owner, 'v.srcId!': owner } })),
    ...youSelf.map(t => ({ t, if: { 'v.speaker': owner } })),
    ...youFromOwner.map(t => ({ t, if: { 'v.speaker!': owner, 'v.srcId': owner } })),
  ];
  BANKS['deedThey_' + id] = [...they.map(t => ({ t, if: { 'v.speaker!': owner } })), ...theySelf.map(t => ({ t, if: { 'v.speaker': owner } }))];
}

// NPC-hangok: ugyanazokat a kulcsokat írják felül, így minden szereplő a saját stílusában beszél
export const VOICES = {
  maggie: {
    greet: ['Jó estét, aranyom!', { t: 'Na, a kis nyomozó!', if: { 'npc.met>=': 1 } }, { t: 'Ó… te.', if: { 'npc.att<': 0 } }, { t: 'Drága lelkem, de jó, hogy jössz!', if: { 'npc.att>=': 3 } }, { t: 'Jó napot, aranyom! Délután szebbek a virágok.', if: { slot: 'delutan' } }],
    small: ['Ez az eső! Írországban legalább melegebben esik.', 'A rózsák bírják a ködöt. Az emberek kevésbé.', 'Három pennyvel olcsóbb az őszirózsa, ha egy szép mosolyt is kapok hozzá.', 'Huszonkét éve árulok ezen a sarkon. A virágok mindig visszajönnek. Az emberek nem mindig.'],
    bark: ['Virágot! Friss virágot!', 'Őszirózsa, liliom, olcsón!', 'Egy szál rózsa a szívednek!'],
    praise: ['Áldjon meg az ég.', 'Anyád büszke lehet rád.', 'Aranyból van a szíved, tudod?'],
    scold: ['Szégyen, gyalázat.', 'Remélem, nem így neveltek.', 'Ezt még a ködben is látják, aranyom.'],
    bye: ['Vigyázz magadra, drága!', 'Gyere máskor is!'],
  },
  tom: {
    // Tom vak: ő nem lát, hanem hall
    deed_comment: [
      { t: 'Hallottam ám, hogy {deedYou}. #praise#', if: { 'v.deedSelf': true, 'v.deedTone>': 0 } },
      { t: 'Hallottam, hogy {deedYou}. #scold#', if: { 'v.deedSelf': true, 'v.deedTone<': 0 } },
      { t: 'Hallottam, hogy {deedYou}. #neutral#', if: { 'v.deedSelf': true, 'v.deedTone': 0 } },
      { t: '{deedSrc} mesélte, hogy {deedYou}. #praise#', if: { 'v.deedSelf': false, 'v.deedTone>': 0 } },
      { t: 'Azt mondja {deedSrc}, hogy {deedYou}. #scold#', if: { 'v.deedSelf': false, 'v.deedTone<': 0 } },
      { t: '{deedSrc} szerint {deedYou}. #neutral#', if: { 'v.deedSelf': false, 'v.deedTone': 0 } },
    ],
    greet: ['Hallom a lépteidet. Ismerős ritmus.', { t: 'Á, az ifjú nyomozó. Felismerem a köhintésedről.', if: { 'npc.met>=': 1 } }, { t: 'Te… a nevetésedre emlékszem.', if: { 'npc.att<': 0 } }, { t: 'Gyere, gyere, barátom. Ülj le a dobozra.', if: { 'npc.att>=': 3 } }],
    small: ['A harmonika olyan, mint a tüdő. Csak ez nem panaszkodik.', 'Negyven éve játszom ezen a sarkon. A sarok azóta háromszor cserélt gazdát.', 'Ha becsukod a szemed, London egészen más zene. Nekem nincs választásom.'],
    bark: ['♪ …la-la, Senki lánya… ♪', '♪ Ó, Danny fiam, a dudák szólnak… ♪', '(harmonikaszó)'],
    praise: ['Jó szív, jó ritmus.', 'Ez szép volt tőled.'], scold: ['A sötétben is látom az ilyet.', 'Rossz hang volt, barátom.'],
    bye: ['Menj csak. A dal megvár.'],
  },
  priya: {
    greet: ['Jó estét.', { t: 'Ön megint.', if: { 'npc.met>=': 1 } }, { t: 'Maga már megint itt?', if: { 'npc.att<': 0 } }, { t: 'Á, a fiatal Vale. Minden rendben?', if: { 'npc.att>=': 2 } }],
    small: ['Csendes este. A csendes esték a legrosszabbak.', 'Tizenkét óra szolgálat. Ebből tizenegy esőben.', 'Soho éjjel olyan, mint egy rossz vicc. Mindenki tudja a csattanót, senki sem nevet.'],
    bark: ['Kérem, haladjanak.', 'Minden rendben?', '(rádió recseg)'],
    praise: ['Ez helyes.', 'Köszönöm.'], scold: ['Ezt feljegyzem.', 'Nem szeretem, ha hazudnak nekem.'],
    bye: ['Viszontlátásra. Ne keveredjen bajba.'],
  },
  dex: {
    greet: ['Esti Hírnök! Friss szaft!', { t: 'Na, megint te? Van pénzed, van hírem.', if: { 'npc.met>=': 1 } }, { t: 'Főnök! A legjobb ügyfelem!', if: { 'npc.att>=': 2 } }, { t: 'Mit akarsz? Hitelbe nem adok.', if: { 'npc.att<': 0 } }],
    small: ['Az eső jót tesz az üzletnek. Mindenki újságot tart a feje fölé.', 'A pletyka gyorsabb, mint a busz. A busz késik. Én nem.', 'Egyszer láttam Arthur Vale-t mosolyogni. Azóta sem hiszi el senki.'],
    bark: ['ESTI HÍRNÖK! Az alvó csillag rejtélye!', 'Friss újság, friss bűn!', 'Egy penny, és megtudod, ki kivel!'],
    praise: ['Te aztán tudsz élni!', 'Szép munka, főnök.'], scold: ['Rossz üzlet, haver.', 'Ez még nekem is sok.'],
    bye: ['Viszlát, főnök! Hozz aprót!'],
  },
  harriet: {
    greet: ['Mit iszol? Ja, kiskorú vagy. Akkor mit akarsz?', { t: 'Megint te. Arthur unokaöccse.', if: { 'npc.met>=': 1 } }, { t: 'Na, kölyök. Állj be az eresz alá.', if: { 'npc.att>=': 2 } }],
    small: ['A Varjúban mindenki elmond mindent. Csak a csapos nem.', 'A nagybátyád itt hagyta a fél fizetését az évek alatt.', 'A gin olyan, mint a köd. Beborít, és azt hiszed, megvéd.'],
    bark: ['Záróra még messze.', '(cigarettafüst)', 'Hé, ne az ajtóban!'],
    praise: ['Van benned kurázsi.', 'Na, ez tetszik.'], scold: ['Gyenge.', 'Ilyet a Varjúban sem csinálunk.'],
    bye: ['Tűnés. És köszönd meg Arthurnak a tartozását.'],
  },
  crane: {
    greet: ['Á. A kis Vale.', { t: 'Már megint maga. Az időm pénz.', if: { 'npc.met>=': 1 } }, { t: 'Hívjam a biztonságiakat?', if: { 'npc.att<': -1 } }],
    small: ['A közönség a Fülemülét akarja. A közönségnek mindig igaza van.', 'Lyra fáradt. A sztárok néha elfáradnak. Ezért vagyok én.'],
    bark: ['Igen, a turné megy tovább. Nem, nincs kommentár.', '(telefonál) …dupla gázsi, vagy semmi.'],
    praise: ['Ügyes.'], scold: ['Nevetséges.', 'Ezt még megbánja.'],
    bye: ['Az ajtó arra van.'],
  },
  ozzie: {
    greet: ['O-ó, jó napot! Bocsánat, ijedős vagyok.', { t: 'Á, te vagy az. Hála az égnek.', if: { 'npc.att>=': 1 } }],
    small: ['Húsz éve vagyok színpadmester. A függöny sosem hazudik.', 'Lyra minden előadás előtt ugyanazt dúdolta. Egy régi dalt.'],
    bark: ['Kábelek, kábelek, mindenütt kábelek…', 'Látta valaki a csavarhúzómat?'],
    praise: ['Ó, ez kedves.'], scold: ['Jaj, ne, ne veszekedjünk…'],
  },
  agnes: {
    greet: ['Látogatási idő van, de halkan.', { t: 'Megint te. Jól van, gyere be.', if: { 'npc.att>=': 1 } }, { t: 'Ha megint kiabálni akarsz, ott az ajtó.', if: { 'npc.att<': 0 } }],
    small: ['Harminc éve vagyok ápoló. Ilyen álmot még nem láttam.', 'A pulzusa olyan, mintha futna valahol.'],
    bark: ['Csendet, kérem.', 'Mindjárt jövök, hozom a lázmérőt.'],
    praise: ['Köszönöm, kedves.'], scold: ['Itt betegek vannak.'],
  },
  arthur: {
    greet: ['Kölyök.', { t: 'Na. Mit hoztál?', if: { 'clues>=': 1 } }, { t: 'Ülj le. Teát? Persze, hogy teát.', if: { 'bond.arthur>=': 2 } }],
    small: ['Harminc év a Yardnál. Megtanultam: mindenki hazudik, csak nem ugyanarról.', 'A nagynénéd mindig azt mondta, a whisky nem válasz. Igaza volt. De jó kérdés.', 'Ez a város egy nagy kirakós. Csak a darabok mozognak.'],
    bark: ['(lapozgat)', '(köhög)', 'Hol a fenében van a gyufám…'],
    praise: ['Jó munka.', 'Na, ez már nyomozás.'], scold: ['Ezt még megbeszéljük.', 'Nem így tanítottalak.'],
  },
  ivy: {
    greet: ['Szia! Épp rólad írtam. Viccelek. Vagy nem.', { t: 'Na, végre! Van valami újság?', if: { 'npc.met>=': 1 } }, { t: 'Ó, a kedvenc nyomozótársam!', if: { 'bond.ivy>=': 2 } }],
    small: ['Az iskolaújság negyven példányban jelenik meg. Harminckilencet én olvasok el.', 'Apa mindig azt mondta, a jó kérdés fontosabb, mint a jó válasz.', 'Ha egyszer igazi újságíró leszek, az első cikkem rólad szól majd. Nem lesz dicsérő.'],
    bark: ['(jegyzetel)', 'Hmm… érdekes.'],
    praise: ['Ezt beleírom a cikkembe!', 'Nem is vagy olyan unalmas.'], scold: ['Ezt nem írom bele a cikkbe. Neked jobb így.'],
  },
  theo: {
    greet: ['Ó, szia.', { t: 'Hé! A nyomozó!', if: { 'f.case_open': true } }],
    small: ['Minden albuma megvan. Dedikálva. Háromszor.', 'Apám ismeri a Lumen igazgatóját. Állítólag. Apám állítólag mindenkit ismer.'],
    bark: ['♪ Aranykalitka… ♪ (hamisan)', 'Ma is feladtam a levelet…'],
    praise: ['Menő.'], scold: ['Hű. Ez nem menő.'],
  },
  nadia: {
    greet: ['Hé. Szép a sálad.', { t: 'Szia! Lerajzolhatlak? Csak viccelek. Kicsit.', if: { 'npc.att>=': 1 } }],
    small: ['Az esőt a legnehezebb lerajzolni. Mindig valami másnak látszik.', 'A Fülemüle arca minden plakáton ugyanaz. Az nem arc, hanem logó.'],
    bark: ['(rajzol)', 'Nincs elég szürke a dobozomban.'],
    praise: ['Ez szép volt.'], scold: ['Ez csúnya volt.'],
  },
  kalauz: {
    bark: ['A vonat nem késik. Az utasok késnek.', 'Jegyeket, kérem.', 'Tizenhármas peron. Mindenki leszállhat, aki mer.'],
  },
};
