# London Nocturne: A tizenharmadik óra

HD-2D stílusú, böngészőben futó JRPG / noir nyomozós játék (I. fejezet: *A Fülemüle álma*).
Pixel-sprite szereplők voxel-világban, bloommal, tilt-shift életlenítéssel, esővel.
Persona-szerű napbeosztás (iskola → délután → este → éjjel), kötelékek, jellemvonások,
álomvilágok és körökre osztott harc. Az NPC-k szövegeit szabályok és szóbankok rakják össze
a játékos korábbi tettei alapján.

## Futtatás

Nincs build lépés, csak statikus fájlok. Kell hozzá egy egyszerű webszerver (ES modulok miatt):

```bash
cd game
python3 -m http.server 8000
# majd: http://localhost:8000
```

A three.js a jsDelivr CDN-ről töltődik (`js/three.js`), rögzített verzióval (0.160.0).

**Irányítás:** WASD / nyilak: mozgás · SHIFT: futás · E / SPACE / ENTER: cselekvés · TAB: notesz · ESC: vissza.
Telefonon bal oldalt joystick, jobbra az **A** gomb.

## A történet váza

- **1. nap este:** Victor Crane megbízza Arthur Vale-t (a nagybátyádat): Lyra Vance, „a Fülemüle”, napok óta nem ébred fel.
  Éjfélkor a Big Ben tizenhármat üt, felébred a Personád (**Dupin**), és megérkezel a **13-as peronra**.
- **2–5. nap:** reggel iskola (generált osztálytársi csevegés + kvíz), délután és este egy-egy helyszín
  (Soho, színház, kórház, iskola), éjjel álom.
- **Álomvilágok:** a *Szürke Város* (ahogy Lyra érzi magát: senki sem látja) és a *Napfény-ház*
  (amire vágyik: egy család, ami hazavárja). Mindkettőből egy **igazság** hozható el.
- **Boss:** *A Fülemüle Visszhangja*. Három fátyla van; mindegyiket a megfelelő igazság szakítja át.
- **Befejezések:** *A Fülemüle szabadon*, *Csend*, *Aranykalitka*, *Örök álom*. Mindegyik után a város
  (generáltan) reagál arra, amit a héten tettél, és jön a II. fejezet előzetese.

## A generatív párbeszédrendszer

Három réteg dolgozik együtt:

1. **Emlékezet (`js/logic.js`)**: a játékos minden fontos tette (`DEEDS`) bekerül egy naplóba.
   Akik a közelben vannak (9 m), látják. Minden NPC-nek vannak értékei (`values`: pl. `kind: +2, rude: -2`),
   ebből számolódik, hogyan változik a hozzáállása (`att`).
2. **Pletyka (`spreadGossip`)**: minden napszakváltáskor az NPC-k továbbadják a kapcsolataiknak (`links`),
   amit tudnak. Dex, a rikkancs, a legnagyobb pletykafészek; Ivy köti össze az utcát az iskolával.
   Így a reggeli osztálytársak is tudhatnak arról, amit előző este Sohóban csináltál.
3. **Szabályok + szóbankok**:
   - `js/content/rules.js`: Valve-féle „dynamic dialog”. Minden szabálynak feltételei vannak
     (`'clue.foto!': true`, `'npc.att>=': 2`, `'stat.emp>=': 2` …); a motor (`js/dialogue.js`) a legtöbb
     feltételnek megfelelő, legspecifikusabb szabályt választja.
   - `js/content/banks.js`: Tracery-szerű szóbankok (`#greet#`, `#deed_comment#`, `#rumor#`, `#noir_open#` …),
     feltételes elemekkel. Minden NPC-nek saját „hangja” van (`VOICES`), ami felülírja az általános szavakat.
   - `js/grammar.js`: a szövegkifejtő (`#kulcs#`, `#kulcs.cap#`, `{változó}`, magyar névelő-javítás).

Példa: ha bedobsz egy fontot Tom kalapjába, Tom (vak lévén) így reagál: „Hallottam ám, hogy bedobtál egy fontot
a kalapomba. Ez szép volt tőled.” Ha Tom elmeséli Maggie-nek, Maggie legközelebb így köszön:
„Jó estét, aranyom! Öreg Tom mesélte, hogy bedobtál egy fontot a kalapjába. Aranyból van a szíved, tudod?”
Ha Dex is hallja, és továbbadja Ivynak, másnap reggel Ivy hozza szóba az osztályteremben.
A boss is felhozhatja a csúnya tetteidet.

### Új NPC-szöveg hozzáadása

```js
// rules.js
{ id: 'mg_eso', who: 'maggie', topic: 'talk', when: { slot: 'este', 'deed.helped_tom': true },
  lines: ['Láttam, mit tettél Tommal. #praise#'] },
```

```js
// banks.js → VOICES.maggie
small: ['Ez az eső! Írországban legalább melegebben esik.', { t: 'Ma este szép a hold.', if: { slot: 'este' } }],
```

## Fájlok

| Fájl | Tartalom |
|---|---|
| `js/engine.js` | renderer, HD-2D utófeldolgozás (bloom-lánc, tilt-shift, ACES, vignetta, szemcse), eső, lebegő porszemek |
| `js/voxel.js`, `js/prefabs.js` | voxel-építő (InstancedMesh) és a voxel „assetek” (épületek, lámpák, taxi, busz, Big Ben, szobák, álomelemek) |
| `js/sprites.js` | procedurális pixel-art szereplők (4 irány × 4 képkocka), portrék, Persona- és ellenségképek |
| `js/world.js` | helyszín futásideje: szereplők, ütközés, kamera, interakció, buborékok |
| `js/scenes.js` | 11 helyszín (Soho éjjel/nappal, iroda, kórház, színház, iskola, osztályterem, 13-as peron, 2 álomvilág, színpad) |
| `js/story.js` | I. fejezet forgatókönyve, napszakok, éjszakák, álmok, befejezések |
| `js/battle.js` | körökre osztott harc: gyengeség → „TÖBB!”, össztámadás, meghallgatás, igazságok |
| `js/content/*` | szereplők, tettek, nyomok, következtetések, szabályok, szóbankok |

Mentés: a böngésző `localStorage`-ába, minden napszakváltáskor automatikusan.
