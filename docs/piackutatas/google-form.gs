/**
 * TechALARM – diák piackutatási kérdőív
 *
 * Használat (1 perc):
 *  1. Nyisd meg: https://script.google.com  →  Új projekt
 *  2. Töröld a Code.gs tartalmát, és másold be ezt a fájlt.
 *  3. Fent válaszd ki a "createTechAlarmSurvey" függvényt, majd kattints a Futtatás gombra.
 *  4. Az első futtatáskor engedélyezd a hozzáférést a Google-fiókodhoz (Google Űrlapok).
 *  5. A Naplóban (Végrehajtási napló) megkapod a szerkesztő és a kitöltő linket.
 *
 * Ha az Űrlap "nem fogad válaszokat" állapotban van, a tetején kattints a "Közzététel" gombra.
 * Fontos: a kérdőív névtelen, nem kér nevet vagy e-mail címet (a diákok nagy része kiskorú).
 */
function createTechAlarmSurvey() {
  const form = FormApp.create('TechALARM – Hibabejelentő rövid kérdőív (diákoknak)');

  form
    .setDescription(
      'Szia! Egy olyan weboldalt tervezünk, ahol az iskolában elromlott eszközöket és rongálásokat ' +
      'lehet gyorsan, akár névtelenül jelenteni. Szeretnénk tudni, hogy neked mi lenne hasznos.\n\n' +
      '• Kitöltési idő: kb. 3–4 perc\n' +
      '• Névtelen: nem kérünk nevet, e-mail címet vagy egyéb személyes adatot\n' +
      '• Nincs jó vagy rossz válasz, az őszinte véleményed segít\n\n' +
      'Köszönjük a segítséget!'
    )
    .setCollectEmail(false)
    .setProgressBar(true)
    .setAllowResponseEdits(false)
    .setConfirmationMessage('Köszönjük a válaszaidat! Segítettél abban, hogy a TechALARM tényleg a diákoknak készüljön.');

  // ---------- 1. Rólad ----------
  form.addSectionHeaderItem().setTitle('1. Rólad (névtelenül)');

  form.addMultipleChoiceItem()
    .setTitle('Hányadik évfolyamra jársz?')
    .setChoiceValues(['9.', '10.', '11.', '12.', '13.', 'Egyéb'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Mennyire használod a telefonod napközben az iskolában?')
    .setChoiceValues(['Szinte folyamatosan', 'Szünetekben rendszeresen', 'Ritkán', 'Szinte soha'])
    .setRequired(true);

  // ---------- 2. Jelenlegi helyzet ----------
  form.addPageBreakItem().setTitle('2. Mi a helyzet most?');

  form.addMultipleChoiceItem()
    .setTitle('Az elmúlt 3 hónapban találkoztál elromlott eszközzel vagy rongálással az iskolában?')
    .setChoiceValues(['Igen, gyakran', 'Igen, néha', 'Igen, de csak egyszer-kétszer', 'Nem, nem találkoztam ilyennel'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Mit tettél, amikor ilyet láttál? (Több választ is megjelölhetsz)')
    .setChoiceValues([
      'Szóltam a tanárnak / oktatónak',
      'Szóltam egy osztálytársamnak',
      'Szóltam a karbantartónak vagy a portásnak',
      'Nem tettem semmit',
      'Nem tudtam, kinek kellene szólni',
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Ha nem jelentetted be, mi volt az oka? (Több választ is megjelölhetsz)')
    .setChoiceValues([
      'Nem tudtam, kinek vagy hol kellene jelenteni',
      'Úgysem javítják meg',
      'Féltem, hogy engem hibáztatnak vagy engem gyanúsítanak',
      'Nem akartam „besúgó” lenni',
      'Túl bonyolult vagy időigényes lett volna',
      'Nem az én dolgom',
      'Mindig jelentettem, nem volt ilyen helyzet',
    ])
    .showOtherOption(true);

  // ---------- 3. Az ötlet ----------
  form.addPageBreakItem()
    .setTitle('3. Az ötlet: TechALARM')
    .setHelpText(
      'A TechALARM egy weboldal, amit telefonról is használhatsz. Kiválasztod a termet és az eszközt, ' +
      'leírod, mi a baj (akár fényképpel), és elküldöd. Nem kell bejelentkezni, és nem kell megadnod a nevedet. ' +
      'Kapsz egy kódot, amivel később megnézheted, hogy intézkedtek-e.'
    );

  form.addScaleItem()
    .setTitle('Szerinted mennyire lenne hasznos egy ilyen oldal az iskolában?')
    .setBounds(1, 5)
    .setLabels('Egyáltalán nem hasznos', 'Nagyon hasznos')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Használnád, ha az iskola bevezetné?')
    .setChoiceValues(['Biztosan', 'Valószínűleg', 'Talán', 'Valószínűleg nem', 'Biztosan nem'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Mi ösztönözne arra, hogy bejelentsd a hibákat? (Több választ is megjelölhetsz)')
    .setChoiceValues([
      'Ha névtelen lehet',
      'Ha tudom, hogy tényleg foglalkoznak vele',
      'Ha látom, hogy megjavították',
      'Ha nagyon gyors a kitöltés',
      'Ha a teremben van egy QR-kód, amit csak be kell olvasni',
      'Ha a tanárok is ezt használják, és mindenki tudja, hogy létezik',
    ])
    .showOtherOption(true);

  form.addCheckboxItem()
    .setTitle('Mi tántorítana el a használattól? (Több választ is megjelölhetsz)')
    .setChoiceValues([
      'Ha nem lenne névtelen',
      'Ha bejelentkezés kellene hozzá',
      'Ha túl sokáig tartana kitölteni',
      'Ha nem lenne semmi visszajelzés',
      'Ha attól félnék, hogy kiderül, ki jelentette',
      'Semmi, használnám',
    ])
    .showOtherOption(true);

  // ---------- 4. Funkciók ----------
  form.addPageBreakItem().setTitle('4. Mi a fontos neked?');

  form.addGridItem()
    .setTitle('Mennyire fontos neked az alábbiak mindegyike? (1 = egyáltalán nem fontos, 5 = nagyon fontos)')
    .setRows([
      'Névtelen bejelentés',
      'Fénykép csatolása',
      'Követőkód, amivel megnézhetem az állapotot',
      'Értesítés, ha megjavították',
      'QR-kód a teremben a gyors eléréshez',
      'Egyszerű, 1 perc alatt kitölthető űrlap',
      'Magyar nyelvű, telefonon jól használható oldal',
    ])
    .setColumns(['1', '2', '3', '4', '5'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Legfeljebb mennyi időt szánnál egy bejelentésre?')
    .setChoiceValues(['Max. 30 másodperc', 'Kb. 1 perc', '2–3 perc', 'Nem számít, ha tényleg elintézik'])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Honnan érnéd el legszívesebben az oldalt? (Több választ is megjelölhetsz)')
    .setChoiceValues([
      'QR-kódról a teremben / műhelyben',
      'Az iskola honlapjáról',
      'Az osztály csoportos csevegéséből (pl. link)',
      'Az iskola digitális felületéről (pl. e-napló)',
      'Kitűzött plakátról, ahol a linket látom',
    ])
    .showOtherOption(true);

  form.addCheckboxItem()
    .setTitle('Mikor jelentenél legvalószínűbben? (Több választ is megjelölhetsz)')
    .setChoiceValues([
      'Óra vagy gyakorlat közben, amikor észreveszem',
      'Szünetben',
      'Az iskola után, otthonról',
      'Csak ha valami komolyabb dolog történik',
    ])
    .showOtherOption(true);

  // ---------- 5. Bizalom és ötletek ----------
  form.addPageBreakItem().setTitle('5. Bizalom és ötletek');

  form.addScaleItem()
    .setTitle('Mennyire bíznál abban, hogy a bejelentéseddel valóban foglalkoznak?')
    .setBounds(1, 5)
    .setLabels('Egyáltalán nem', 'Teljesen')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('Mit változtatnál az ötleten, vagy mit hiányolsz belőle? Bármi jöhet! (nem kötelező)');

  Logger.log('Szerkesztői link (ezt kezeld): ' + form.getEditUrl());
  Logger.log('Kitöltői link (ezt oszd meg a diákokkal): ' + form.getPublishedUrl());
}
