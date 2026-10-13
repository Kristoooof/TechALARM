// Párbeszéd-szabályok. A motor a témához illő, legtöbb feltételnek megfelelő szabályt választja.
// topic: greet | talk | case | gossip | present | present:<nyom> | act | bye
// sorok: 'NPC mondja' | {p:'játékos'} | {m:'monológ'} | {n:'narráció'} | {who, t} | {choice:[...]} | {fn}

const today = (key) => (get) => get('f.' + key) !== get('day');
const markToday = (key) => (g) => { g.state.facts[key] = g.state.day; };

export const RULES = [
  // ================= ÁLTALÁNOS (bárki) =================
  { id: 'g_greet_deed', who: '*', topic: 'greet', when: { 'v.deedId': true }, lines: ['#greet# #deed_comment#'], consumesDeed: true, prio: 1 },
  { id: 'g_greet', who: '*', topic: 'greet', lines: ['#greet#'] },
  { id: 'g_talk', who: '*', topic: 'talk', lines: ['#small#'] },
  { id: 'g_gossip_you', who: '*', topic: 'gossip', when: { 'v.gossipDeed': true }, lines: ['#gossip_you#'], consumesDeed: true, prio: 1 },
  { id: 'g_gossip', who: '*', topic: 'gossip', lines: ['#rumor#'] },
  { id: 'g_case', who: '*', topic: 'case', lines: ['Lyra Vance? Csak annyit tudok, amit az újság ír.', '#small#'] },
  { id: 'g_present', who: '*', topic: 'present', lines: ['#present_generic#'] },
  { id: 'g_bye', who: '*', topic: 'bye', lines: ['#bye#'] },

  // ================= ARTHUR =================
  { id: 'ar_case_done', who: 'arthur', topic: 'case', prio: 1, lines: ['Most már te tudsz többet, nem én. Az igazság nem a táblán van, kölyök. Benne van. Lyrában.'] },
  { id: 'ar_case_board', who: 'arthur', topic: 'case', prio: 3, when: (get) => get('clues') >= 2 && get('f.board_used') !== true, lines: ['Van már pár nyomod. Gyere a parafatáblához, kössük össze őket. Két szál, egy csomó. Így kezdődik minden.'] },
  { id: 'ar_case_foto', who: 'arthur', topic: 'case', prio: 4, when: { 'clue.foto!': true }, lines: ['Ki ismerte Lyrát, mielőtt Crane megtalálta? Az utca. Maggie, a virágárus, és az öreg Tom évtizedek óta ott állnak a sarkon.', 'Csak vigyázz. Az utca emlékszik rá, ki hogyan bánik vele.'] },
  { id: 'ar_case_theatre', who: 'arthur', topic: 'case', prio: 5, when: { 'f.theatre_visited!': true }, lines: ['A színház. Délutánonként nyitva a hátsó bejárat. Ozzie Finch, a színpadmester, ijedős fajta. Bánj vele kesztyűs kézzel.'] },
  { id: 'ar_case_harriet', who: 'arthur', topic: 'case', prio: 6, when: { 'clue.veszekedes!': true }, lines: ['Crane a Varjúba jár inni. Harriet mindent hall, de nem akárkinek beszél. Mutasd meg neki, hogy van gerinced.'] },
  { id: 'ar_case_dex', who: 'arthur', topic: 'case', prio: 7, when: { 'clue.plakat': true, 'clue.dex_tanu!': true }, lines: ['Ki kaparja le egy sztár arcát a plakátokról? Kérdezd a rikkancsot. Dex mindent lát, és mindent elad.'] },
  { id: 'ar_case_plakat', who: 'arthur', topic: 'case', prio: 8, when: { 'clue.plakat!': true }, lines: ['Láttad a plakátokat a színház falán? Nézd meg őket közelebbről. Egy nyomozó nem néz, hanem lát.'] },
  { id: 'ar_case_hosp', who: 'arthur', topic: 'case', prio: 9, when: { 'f.visited_hospital!': true }, lines: ['Nézd meg a lányt a Szent Tamásban. Délután vagy este, látogatási időben. Egy ügy addig papír, amíg nem látod az áldozatot.'] },
  { id: 'ar_case_police', who: 'arthur', topic: 'case', prio: 10, when: { 'clue.jegyzokonyv!': true }, lines: ['Kezdd a rendőrséggel. Priya Shah esténként a Dean Streeten járőrözik. Mutasd meg neki a névjegyemet.', 'És ne hazudj neki. Priya kiszagolja.'] },
  { id: 'ar_act_files', who: 'arthur', topic: 'act', label: 'Segítesz neki az aktákban', when: today('arthur_day'), lines: [
    { alt: [
      ['Na, ez a kupac. Biztosítási csalás, 1998. Nézd meg, mi nem stimmel.', { n: 'Két órán át lapozgattok. A whisky fogy, az eső kopog. Végül megtalálod: a tűz előtt két nappal kötöttek biztosítást.' }, 'Nem rossz. Egyáltalán nem rossz.'],
      ['Ez egy régi eltűnés. Soha nem oldottuk meg. Olvasd el, hátha friss szem kell hozzá.', { n: 'Arthur hallgat, amíg olvasol. Aztán halkan beszélni kezd a régi társáról, aki egyszer csak nem jött be dolgozni.' }, 'Néha az ügyek nem záródnak le. Csak megtanulunk együtt élni velük.'],
      ['Segíts rendet rakni. Tudom, tudom, ez nem nyomozás. De a rend az.', { n: 'A kupacok alól előkerül egy fénykép: Arthur, fiatalon, egyenruhában. Mellette egy nő nevet. A nagynénéd.' }, 'Ne nézz így. Tedd vissza.'],
    ] },
  ], run: async (g) => { g.state.facts.arthur_day = g.state.day; }, stat: { esz: 1 }, bond: { arthur: 1 } },
  { id: 'ar_present', who: 'arthur', topic: 'present', lines: ['{clue}. Tűzd fel a táblára. Egy nyom egyedül csak egy darab papír.'] },
  { id: 'ar_present_nevjegy', who: 'arthur', topic: 'present:nevjegy', lines: ['…', 'Ezt a pecsétet láttam már. Régen. Egy aktában, amit felülről zártak le.', 'Tedd el. És ne mutogasd mindenkinek.'], set: { arthur_card_seen: true } },

  // ================= MAGGIE =================
  { id: 'mg_first', who: 'maggie', topic: 'greet', once: true, prio: 5, lines: ['Jó estét, aranyom! Virágot? Az esőben a legszebbek, mert senki sem veszi őket.', { p: 'Arthur Vale unokaöccse vagyok. Kérdezhetek valamit?' }, 'Arthur unokaöccse! Jézus-Mária, akkor vigyázz magadra. Az a férfi vonzza a bajt, mint a lámpa a molyokat.'] },
  { id: 'mg_case_nofoto', who: 'maggie', topic: 'case', when: { 'clue.foto!': true }, lines: ['Lyra… szegény lány. Nem nekem kéne róla beszélnem.', 'Talán majd, ha jobban ismerlek. Ezen a sarkon az emberek szavaiból élek, aranyom. Meg a tetteikből.'] },
  { id: 'mg_case_foto', who: 'maggie', topic: 'case', prio: 2, when: { 'clue.foto!': true, any: [{ 'npc.att>=': 2 }, { 'stat.emp>=': 2 }] }, lines: [
    '…Jól van. Neked elmondom.',
    'Mielőtt Lyra Vance lett volna, Lily volt. Lily Vance. A Szent Brigitta árvaházban nőtt fel, Whitechapelben. Én ott takarítottam akkoriban.',
    'Minden vasárnap kiállt az ablakba, és várt. Nem jött senki. Soha. Aztán felnőtt, és elkezdett énekelni.',
    { n: 'Maggie elővesz egy megfakult fényképet a köténye zsebéből.' },
    'Ezt tartsd meg. Nekem elég, hogy emlékszem rá.',
  ], clue: 'foto', att: 1 },
  { id: 'mg_case_after', who: 'maggie', topic: 'case', prio: 3, when: { 'clue.foto': true }, lines: ['Csak hozd vissza nekünk, jó? Nem a Fülemülét. Lilyt.'] },
  { id: 'mg_act_flowers', who: 'maggie', topic: 'act', label: 'Veszel egy csokor őszirózsát (1 £)', when: { 'f.has_flowers!': true }, lines: [{ n: 'Maggie becsomagolja a virágot egy régi Herald-lapba. A címlapon Lyra arca mosolyog.' }, 'Kinek viszed? Nem, ne mondd meg. Az a szép benne, ha titok.'], deed: 'bought_flowers', set: { has_flowers: true } },
  { id: 'mg_present_foto', who: 'maggie', topic: 'present:foto', lines: ['Lily az ott, középen. Látod, hogy senki sem áll mögötte? A többieknek mindig volt valakijük, akár egy nagynéni is. Neki nem.'] },
  { id: 'mg_present_level', who: 'maggie', topic: 'present:level', lines: ['„Csak egyszer várjon meg valaki…” Ó, Lily.', { n: 'Maggie elfordul, és nagyon sokáig rendezgeti a liliomokat.' }], att: 1 },

  // ================= ÖREG TOM =================
  { id: 'tm_first', who: 'tom', topic: 'greet', once: true, prio: 5, lines: ['♪ …Senki lánya, senki várja… ♪', { n: 'A harmonika elhallgat. Az öregember feléd fordítja sötét szemüvegét.' }, 'Új léptek. Fiatalok, de fáradtak. Mit hozott ide a szél, barátom?'] },
  { id: 'tm_act_coin', who: 'tom', topic: 'act', label: 'Bedobsz egy fontot a kalapjába', when: { 'deed.helped_tom!': true }, lines: [{ n: 'Az érme csilingel. Tom elmosolyodik, és rázendít egy vidám ír dalra.' }, 'Köszönöm, barátom. Egy font nem sok. De egy font az esőben sokat ér.'], deed: 'helped_tom', bond: { tom: 1 } },
  { id: 'tm_act_mock', who: 'tom', topic: 'act', label: '„Harmonika egy vak embernek? Ki fizet ezért?”', when: { 'deed.helped_tom!': true, 'deed.mocked_tom!': true }, lines: [{ p: 'Harmonika egy vak embernek? Komolyan, ki fizet ezért?' }, { n: 'Tom keze megáll a billentyűkön.' }, 'Negyven éve ugyanezt kérdezik. És negyven éve itt vagyok.', '…Menj, barátom.'], deed: 'mocked_tom', endTalk: true },
  { id: 'tm_act_sorry', who: 'tom', topic: 'act', label: 'Bocsánatot kérsz tőle', need: { emp: 2 }, when: { 'deed.mocked_tom': true, 'f.tom_sorry!': true }, lines: [{ p: 'Tom… sajnálom, amit mondtam. Ostoba voltam.' }, 'Hm. Ritkán hallom ezt fiatal szájból.', 'Na. Ülj le. A dal nem haragszik sokáig.'], att: 4, set: { tom_sorry: true } },
  { id: 'tm_case_cold', who: 'tom', topic: 'case', when: { 'clue.kotta!': true }, lines: ['Lyra? Volt egy lány… évekkel ezelőtt. Itt énekelt velem, ezen a sarkon.', 'De ezt nem akárkinek mesélem el. Gyere vissza, ha jobban ismerjük egymást.'] },
  { id: 'tm_case_kotta', who: 'tom', topic: 'case', prio: 2, when: { 'clue.kotta!': true, 'npc.att>=': 1 }, lines: [
    'Volt egy lány. Lily. Tizenhét éves lehetett. Minden este itt énekelt velem, ezen a sarkon. A hangja olyan volt, mint az eső az ablaküvegen.',
    'A saját dalait énekelte. Az egyiket nagyon szerettem. „Senki lánya.” Arról szólt, hogy aki sehova sem tartozik, az mindenhol otthon lehet.',
    'Aztán jött egy úr drága cipőben. Crane. Azt mondta, csillag lesz belőle. Lett is. A dalt pedig átírták: „Aranykalitka”. Most azt játssza minden rádió.',
    { n: 'Tom kotorászik a harmonikatokban, és előhúz egy összehajtott, vizes foltos papírt.' },
    'Itt hagyta. Én nem látom, mi van rajta. De tudom.',
  ], clue: 'kotta' },
  { id: 'tm_case_after', who: 'tom', topic: 'case', prio: 3, when: { 'clue.kotta': true }, lines: ['Ha megtalálod, mondd meg neki, hogy az öreg Tom még mindig játssza a dalát. Az igazit.'] },
  { id: 'tm_present_kotta', who: 'tom', topic: 'present:kotta', lines: ['♪ Senki lánya, senki várja, mégis hazatalál… ♪', 'Így szólt. Nem „aranykalitka”. Hazatalál.'] },

  // ================= SHAH RENDŐRTISZT =================
  { id: 'pr_first', who: 'priya', topic: 'greet', once: true, prio: 5, lines: ['Jó estét. Itt nem lehet ácsorogni, hacsak nem tud valamit, amit én nem.'] },
  { id: 'pr_case', who: 'priya', topic: 'case', when: { 'clue.jegyzokonyv!': true }, lines: ['Lyra Vance ügye nem nyilvános. Miért érdekli?', { choice: [
    { label: 'Arthur Vale unokaöccse vagyok. Ő küldött. (névjegy)', if: { 'f.has_card': true }, tagClue: 'NÉVJEGY', lines: [{ n: 'Megmutatod Arthur gyűrött névjegyét. Shah rendőrtiszt szája sarka megrándul.' }, 'Vale. Persze. Hogy van az öreg medve?', 'Jól van. Hivatalosan nem mondtam semmit.', 'Október tizedikén, éjfélkor esett össze a Westminster hídon. Nem volt alkohol, nem volt drog. Egyszerűen elaludt állva, mint egy ló.', 'Egy tanú, egy részeg festő, azt állítja, hogy a Big Ben tizenhármat ütött. Kinevettük. De…', 'Én is hallottam valamit aznap éjjel. Tizenhármat, nem tizenkettőt.'], deed: 'honest_police', run: (g) => g.addClue('jegyzokonyv') },
    { label: 'A családja küldött. (hazugság)', need: { bat: 2 }, lines: ['A családja? Lyra Vance-nek nincs családja. Ezt mindenki tudja, aki olvas újságot.', { n: 'Rád néz. Hosszan.' }, '…Jól van. Elmondom, de csak hogy tudja: nem hiszek magának.', 'Október tizedike, éjfél, Westminster híd. Egy tanú szerint a Big Ben tizenhármat ütött. Ennyi. Most pedig menjen haza.'], deed: 'lied_police', run: (g) => g.addClue('jegyzokonyv') },
    { label: 'Csak kíváncsi vagyok.', lines: ['A kíváncsiság nem jogosítvány. Jó estét.'] },
  ] }] },
  { id: 'pr_case_after', who: 'priya', topic: 'case', prio: 1, when: { 'clue.jegyzokonyv': true }, lines: ['Már mindent elmondtam. Ha a Big Ben megint tizenhármat üt, maga lesz az első, akit felhívok. Vagy letartóztatok.'] },
  { id: 'pr_present_nevjegy', who: 'priya', topic: 'present:nevjegy', lines: ['…Honnan van ez?', 'Két hónapja Camdenben találtunk egy másik alvót. Egy fiatal festőt. Ugyanez a kártya volt a zsebében.', 'Az ügyet lezárták. Felülről. Ha bárkinek elmondja, hogy ezt tőlem hallotta, letagadom.'], set: { other_sleepers: true }, att: 1 },
  { id: 'pr_present_dex', who: 'priya', topic: 'present:dex_tanu', lines: ['Dex? Az a kölyök többet tud ebről az utcáról, mint az egész körzet. Ha ő mondja, valószínűleg igaz. Sajnos.'] },

  // ================= DEX =================
  { id: 'dx_first', who: 'dex', topic: 'greet', once: true, prio: 5, lines: ['ESTI HÍRNÖK! Az alvó csillag rejtélye! Egy penny! …Ja, te nem venni jöttél. Látom rajtad. Kérdezni jöttél.', 'A kérdés drágább, főnök.'] },
  { id: 'dx_case_noplakat', who: 'dex', topic: 'case', when: { 'clue.plakat!': true }, lines: ['A Fülemüle? Ingyen tipp, főnök: nézd meg a plakátjait a színház falán. Közelről.'] },
  { id: 'dx_case', who: 'dex', topic: 'case', prio: 1, when: { 'clue.plakat': true, 'clue.dex_tanu!': true }, lines: ['A plakátok? Ó, láttam, ki csinálta. Persze, hogy láttam. De a látás pénzbe kerül.', { choice: [
    { label: 'Adsz neki két fontot', lines: [{ n: 'Dex villámgyorsan eltünteti a pénzt.' }, 'Na, ez a beszéd! Szóval: egy nő volt, kapucniban, három nappal az összeesés előtt, éjjel. Kulccsal kaparta le az arcokat, egyiket a másik után.', 'És közben dúdolt. Esküszöm, főnök, pont úgy, mint a rádióban. Mint a Fülemüle.'], deed: 'bribed_dex', run: (g) => g.addClue('dex_tanu') },
    { label: '„Vagy szólok Shah rendőrtisztnek.”', need: { bat: 2 }, lines: ['Hé, hé! Nyugi! Csak vicceltem, főnök.', 'Egy nő volt, kapucnis, éjjel. Kulccsal kaparta le az arcokat. És dúdolt, pont úgy, mint a Fülemüle a rádióban. Na. Boldog vagy?'], att: -1, run: (g) => g.addClue('dex_tanu') },
    { label: '„Barátok közt ingyen van, nem?”', if: { 'npc.att>=': 2 }, lines: ['…Hát, neked. Csak most az egyszer, főnök.', 'Egy kapucnis nő volt, éjjel, kulccsal kaparta. És dúdolt, mint a Fülemüle. Hátborzongató volt.'], run: (g) => g.addClue('dex_tanu') },
    { label: 'Majd máskor.', lines: ['Az ár holnap is ugyanennyi lesz. Vagy több.'] },
  ] }] },
  { id: 'dx_case_after', who: 'dex', topic: 'case', prio: 2, when: { 'clue.dex_tanu': true }, lines: ['Szerintem ő volt. A Fülemüle saját maga. Ki más dúdolná a saját dalát, miközben a saját arcát kaparja? Para, főnök.'] },
  { id: 'dx_talk_news', who: 'dex', topic: 'talk', prio: 1, lines: ['A mai címlap: „#rumor#” Na jó, nem ez a címlap. De ez lesz holnap.'] },

  // ================= „GIN” HARRIET =================
  { id: 'hr_first', who: 'harriet', topic: 'greet', once: true, prio: 5, lines: [{ n: 'A pub ajtaja előtt egy nő cigarettázik. A füst összekeveredik a köddel.' }, 'Ha Arthurt keresed, nincs itt. Ha whiskyt, az ő számlájára nem adok. Ha mást, azt mondd gyorsan.'] },
  { id: 'hr_act_drunk', who: 'harriet', topic: 'act', label: 'Elzavarod a kötekedő részeget', when: { 'deed.stood_harriet!': true, 'day>=': 2, slot: 'este' }, lines: [
    { n: 'Egy dülöngélő férfi tántorog ki a Varjúból, és Harriet karját rángatja. „Még egy kört, szivi!”' },
    { choice: [
      { label: '„Engedje el. Most.”', need: { bat: 1 }, lines: [{ p: 'Engedje el. Most.' }, { n: 'A részeg rád néz, aztán a sáladra, aztán megint rád. Motyog valamit, és elbotorkál az esőbe.' }, 'Hm. Nem vagy olyan puhány, mint a nagybátyád mondta.'], deed: 'stood_harriet', stat: { bat: 1 } },
      { label: 'Nem avatkozol bele', lines: [{ n: 'Harriet egyetlen mozdulattal lefejti magáról a kezet, és visszalöki a férfit az ajtón.' }, 'Köszi a segítséget. Ja, várj. Nem segítettél.'], att: -1 },
    ] },
  ] },
  { id: 'hr_case', who: 'harriet', topic: 'case', when: { 'clue.veszekedes!': true }, lines: ['Lyra Vance? Ide nem jár. Ide a menedzsere jár. De hogy miről beszél, az a Varjú titka.', 'Mutasd meg, hogy van gerinced, kölyök, akkor talán beszélgetünk.'] },
  { id: 'hr_case_ok', who: 'harriet', topic: 'case', prio: 2, when: { 'clue.veszekedes!': true, any: [{ 'npc.att>=': 2 }, { 'stat.bat>=': 3 }] }, lines: [
    'Na jó. Egy héttel az összeesés előtt Lyra is itt volt. Először és utoljára. Crane-nel veszekedett, ott a sarokasztalnál.',
    'Crane papírokat lobogtatott. Turné, öt év, Tokió, New York, minden. Lyra felállt, és olyan hangosan mondta, hogy még a csap is elhallgatott:',
    '„Nem leszek a kalitkás madarad, Victor!”',
    'Aztán kiment az esőbe, esernyő nélkül. Crane meg rendelt még egy whiskyt. Kettőt.',
  ], clue: 'veszekedes' },
  { id: 'hr_case_after', who: 'harriet', topic: 'case', prio: 3, when: { 'clue.veszekedes': true }, lines: ['A madarak kalitkában is énekelnek, kölyök. Csak más dalt.'] },

  // ================= OZZIE FINCH =================
  { id: 'oz_first', who: 'ozzie', topic: 'greet', once: true, prio: 5, lines: ['J-jó napot! Maga a… a nyomozó? Crane úr mondta, hogy jöhet. Vagy nem mondta? Jaj.'] },
  { id: 'oz_case', who: 'ozzie', topic: 'case', lines: [
    'Az utolsó előadás… Lyra az „Aranykalitka” közepén megállt. Ott állt a reflektorfényben, és nézett a semmibe.',
    'Aztán azt mondta a mikrofonba, halkan: „Ez nem az én dalom.” És lesétált a színpadról.',
    'Crane úr azt mondta a közönségnek, hogy rosszul lett. Három nappal később aztán tényleg rosszul lett.',
  ], set: { ozzie_story: true } },
  { id: 'oz_act_calm', who: 'ozzie', topic: 'act', label: 'Megnyugtatod', when: { 'deed.calmed_ozzie!': true }, lines: [{ p: 'Ozzie. Lassan. Nem vagyok az ellenséged. Lyrát akarom felébreszteni, nem bajt csinálni.' }, { n: 'Ozzie keze lassan abbahagyja a remegést.' }, 'Ö… köszönöm. Tudja, mindenki csak kiabál velem mostanában.'], deed: 'calmed_ozzie', stat: { emp: 1 } },
  { id: 'oz_act_office', who: 'ozzie', topic: 'act', label: 'Megkéred, hogy engedjen be Crane irodájába', when: { 'f.office_open!': true, 'clue.szerzodes!': true }, lines: [{ p: 'Ozzie. Be kell mennem Crane irodájába. Öt perc.' }, { fn: async (g, id) => {
    const att = g.state.npc.ozzie?.att ?? 0;
    if (att >= 2) { await g.ui.say('ozzie', 'Én… én ezt nem hallottam. És a kulcs véletlenül nyitva felejtődött. Öt perc!'); g.state.facts.office_open = true; g.ui.toast('AJTÓ', 'Crane irodája nyitva'); }
    else await g.ui.say('ozzie', 'Nem, nem, nem! Crane úr kirúg! Kérem, ne kérjen ilyet!');
  } }] },

  // ================= VICTOR CRANE =================
  { id: 'cr_case', who: 'crane', topic: 'case', lines: ['Lyra kimerült. Pihennie kell, aztán turné. Ennyi. Arthur Vale-t azért fizetem, hogy kiderítse, melyik orvos téved, nem azért, hogy egy kamasz a magánéletében turkáljon.'], set: { met_crane: true } },
  { id: 'cr_act_confront', who: 'crane', topic: 'act', label: 'Szembesíted a bizonyítékokkal', need: { bat: 2 }, when: { 'f.crane_confronted!': true, any: [{ 'clue.kotta': true }, { 'clue.szerzodes': true }] }, lines: [
    { p: 'Lyra nem kimerült. Lyra fogoly. Az ön foglya.' },
    'Tessék?',
    { if: { 'clue.kotta': true }, p: '„Senki lánya.” Ez volt a dal címe, mielőtt ön átírta „Aranykalitkára”. Tom a Dean Streeten még emlékszik rá.' },
    { if: { 'clue.szerzodes': true }, p: 'És a szerződés. Ön írta alá helyette, két nappal azután, hogy összeesett.' },
    { n: 'Crane mosolya nem tűnik el. Csak megkeményedik, mint a hideg viasz.' },
    'Fiatalember. Én adtam neki mindent. Színpadot, nevet, hangot. Az utcáról szedtem fel.',
    { choice: [
      { label: '„Nem adott neki hangot. Elvette tőle.”', lines: [{ p: 'Nem adott neki hangot. Elvette tőle.' }, '…', 'Ki innen. Mielőtt hívom a biztonságiakat. És mondja meg a nagybátyjának, hogy a megbízásnak vége.'], deed: 'threatened_crane', set: { crane_confronted: true, crane_cracked: true }, stat: { bat: 1 } },
      { label: '„Ha felébred, maga elveszít mindent.”', lines: [{ p: 'Ha felébred, és megtudja, mit tett, maga mindent elveszít.' }, 'Ha felébred. Ugye? Ha.', { n: 'Crane megigazítja a nyakkendőjét, és hátat fordít.' }], deed: 'threatened_crane', set: { crane_confronted: true } },
    ] },
  ], endTalk: true },
  { id: 'cr_present_kotta', who: 'crane', topic: 'present:kotta', lines: ['Az egy… régi demó. A jogok az enyémek. Megvettem. Minden legális.'], set: { met_crane: true } },
  { id: 'cr_present_szerzodes', who: 'crane', topic: 'present:szerzodes', lines: ['Hol szerezte ezt?! Az… meghatalmazás. Teljesen legális. Adja vissza.', { n: 'Nem adod vissza.' }], att: -2 },

  // ================= PIKE NŐVÉR =================
  { id: 'ag_first', who: 'agnes', topic: 'greet', once: true, prio: 5, lines: ['Látogatási idő van, de halkan. A betegeknek pihenniük kell. Még annak is, aki nem akar felébredni.'] },
  { id: 'ag_case', who: 'agnes', topic: 'case', when: { 'clue.gyogyszer!': true }, lines: ['Az orvosi adatokról nem beszélhetek. Szabályzat.', { choice: [
    { label: '„Köszönöm, hogy vigyáz rá. Látom, milyen fáradt.”', lines: [{ p: 'Köszönöm, hogy vigyáz rá. Látom, milyen fáradt.' }, { n: 'Pike nővér meglepetten pislog, aztán egy pillanatra leül az ágy szélére.' }, '…Harminc év alatt ezt talán háromszor mondták.', 'Nézd, nem mondtam semmit. De a táskájában találtunk egy doboz Somnyxot. Erős altató, a Lumen Pharma gyártja. Hónapok óta szedte, a dobozok szerint.', 'Ilyen adagtól valaki vagy nagyon jól alszik, vagy egyáltalán nem ébred fel.'], deed: 'kind_agnes', run: (g) => g.addClue('gyogyszer') },
    { label: '„A szabályzat nem ébreszti fel.”', need: { bat: 2 }, lines: [{ p: 'A szabályzat nem fogja felébreszteni.' }, 'Ne kiabálj velem, fiatalember. Itt betegek vannak.', '…De igazad van. Somnyx. Lumen Pharma. Hónapok óta szedte. Most pedig ki.'], deed: 'rude_agnes', run: (g) => g.addClue('gyogyszer') },
    { label: 'Megérted, nem erőlteted', lines: ['Köszönöm. Ritka az ilyen látogató.'], att: 1 },
  ] }] },
  { id: 'ag_case_after', who: 'agnes', topic: 'case', prio: 1, when: { 'clue.gyogyszer': true }, lines: ['A pulzusa éjjelente felgyorsul. Pontban éjfélkor. Mintha valahol futna.'] },
  { id: 'ag_act_flowers', who: 'agnes', topic: 'act', label: 'Odaadod neki a virágot', when: { 'f.has_flowers': true, 'f.flowers_given!': true }, lines: [{ p: 'Ezt önnek hoztam. Valakinek, aki ébren van.' }, 'Nekem? Ó… Ó, istenem.', { n: 'Pike nővér úgy fogja a csokrot, mint valami törékenyet.' }], att: 3, set: { flowers_given: true, has_flowers: false }, stat: { emp: 1 } },

  // ================= ISKOLA: IVY =================
  { id: 'iv_act_hang', who: 'ivy', topic: 'act', label: 'Együtt töltöd vele a délutánt', when: today('ivy_day'), run: async (g) => { g.state.facts.ivy_day = g.state.day; await g.story.ivyHangout(); }, endTalk: true },
  { id: 'iv_case', who: 'ivy', topic: 'case', lines: ['Én azt nézném meg, kinek éri meg, hogy Lyra aludjon. Nem kinek fáj. Kinek éri meg.', { if: { 'f.ivy_father': true }, t: 'És a Lumen. Apa jegyzeteiben is benne van a Lumen. Ez nem véletlen.' }] },
  { id: 'iv_case_distract', who: 'ivy', topic: 'case', prio: 2, when: { 'f.theatre_visited': true, 'clue.szerzodes!': true, 'f.ivy_distract!': true, 'bond.ivy>=': 1 }, lines: ['Szóval be kéne jutni Crane irodájába, de ott ül a seggén egész délután? Hagyd rám.', 'Holnap délután bemegyek veled a színházba, és interjút kérek tőle az iskolaújságnak. Egy olyan ember, mint Crane, nem tud ellenállni a saját hangjának.'], set: { ivy_distract: true } },
  { id: 'iv_present_gyogyszer', who: 'ivy', topic: 'present:gyogyszer', lines: ['Lumen Pharma…', { n: 'Ivy elsápad.' }, 'Apa erről a cégről írt, mielőtt eltűnt. Ugyanez a lámpás logó volt a jegyzetfüzete hátulján.'], set: { ivy_lumen: true } },
  { id: 'iv_present_flowers', who: 'ivy', topic: 'act', label: 'Odaadod neki a virágot', when: { 'f.has_flowers': true }, lines: [{ p: 'Ezt… neked hoztam. Azt hiszem.' }, 'Azt hiszed? Te vagy a legrosszabb romantikus, akit valaha láttam.', { n: 'De a virágot elveszi, és egész délután a táskája oldalzsebében hordja.' }], set: { has_flowers: false }, bond: { ivy: 1 } },

  // ================= ISKOLA: THEO, NADIA =================
  { id: 'th_act_flatter', who: 'theo', topic: 'act', label: '„Theo, te vagy a legnagyobb Fülemüle-szakértő.”', when: { 'deed.flattered_theo!': true }, lines: [{ p: 'Theo, te vagy itt a legnagyobb Fülemüle-szakértő. Mondj valamit, amit más nem tud.' }, 'Hát… igen. Az vagyok. Na figyelj.', 'Apám szerint Crane nyakig ül az adósságban. Ha nincs turné, neki vége. Ezért nem engedi el Lyrát. Soha.'], deed: 'flattered_theo', set: { crane_debt: true } },
  { id: 'th_case', who: 'theo', topic: 'case', lines: ['Mindent tudok róla! Kedvenc színe: éjkék. Kedvenc étele: rántott hal. Kedvenc dala: soha nem mondta meg. Furcsa, nem?'] },
  { id: 'nd_case', who: 'nadia', topic: 'case', lines: ['Egyszer láttam Lyrát a metrón, napszemüvegben. Senki sem ismerte fel. Ő pedig… mosolygott. Mintha az lett volna élete legszebb napja.'], set: { nadia_story: true } },

  // ================= ÁLOM-SZEREPLŐK =================
  { id: 'kz_talk', who: 'kalauz', topic: 'greet', endTalk: true, lines: ['#bark#'] },
  { id: 'll_talk', who: 'lamplighter', topic: 'greet', endTalk: true, lines: [{ n: 'A magas alak nem fordul feléd. A lámpása fénye nem vet árnyékot.' }] },
];
