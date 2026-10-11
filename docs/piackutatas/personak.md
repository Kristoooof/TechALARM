# TechALARM – Személyek (personák)

> **Fontos:** az alábbi személyek **feltételezéseken alapuló, kitalált szereplők**, nem valós emberek és nem mért adatok. A cél, hogy a fejlesztés közben mindig egy konkrét felhasználót lássunk magunk előtt. A diákkérdőív (`google-form.gs`) eredményei alapján érdemes őket felülvizsgálni és finomítani.

---

## Diák oldal

### 1. Bence, az észrevevő (a fő felhasználó)

| | |
|---|---|
| **Kor, évfolyam** | 16 éves, 10. évfolyam, gépész szakirány |
| **Hol van sokat?** | Gépműhely, CNC labor, tanterem |
| **Eszköz** | Okostelefon, naponta többször használja szünetekben |
| **Technikai tudás** | Magabiztos a telefonján, de nem akar regisztrálni vagy új alkalmazást telepíteni |

**Egy nap az iskolában:** gyakorlaton dolgozik, és észreveszi, hogy az egyik fúrógép szíja nem forog rendesen, a labor hűtőszekrénye pedig már napok óta nem hűt. Tudja, hogy valamit kellene tenni, de nem biztos benne, hogy kinek.

**Célok**
- Gyorsan, két-három koppintással jelezni a problémát, hogy tovább tudjon dolgozni.
- Látni, hogy a jelzésének van következménye, tehát megjavítják.

**Fájdalompontok (feltételezések)**
- Nem tudja, kinek kell szólni, ha nincs ott a tanára.
- Úgy érzi, a szóbeli jelzés elsikkad („szóltam, de nem lett belőle semmi").
- Nem akar vesződni hosszú űrlappal vagy bejelentkezéssel.

**Idézet:** *„Ha 30 másodperc alatt el tudnám küldeni a telefonomról, simán megcsinálnám."*

**Mit kap a TechALARM-tól**
- Telefonra optimalizált űrlap bejelentkezés nélkül, a terem és az eszköz kiválasztásával.
- Fénykép csatolása (a telefon automatikusan lekicsinyíti).
- Követőkód, amivel később megnézheti, hogy lett-e intézkedés.

**Sikermérő:** a kitöltés 1 percen belül megvan; a bejelentések aránya nő a „szóltam, de nem történt semmi" helyzetekhez képest.

---

### 2. Lilla, a visszafogott szemtanú (a névtelenséget igénylő felhasználó)

| | |
|---|---|
| **Kor, évfolyam** | 17 éves, 11. évfolyam |
| **Jellemző** | Csendes, kerüli a konfliktust, nem szeretne „besúgó" lenni |
| **Eszköz** | Okostelefon |

**Helyzet:** látja, hogy valaki szándékosan megrongált egy széket vagy egy projektort, de fél, hogy ha szól, őt gyanúsítják vagy kiközösítik. Ezért eddig inkább nem tett semmit.

**Célok**
- Úgy jelezni a problémát, hogy senki ne tudja meg, ki volt.
- Biztosan tudni, hogy az oldal nem kér tőle semmilyen személyes adatot.

**Fájdalompontok (feltételezések)**
- Fél a következményektől és a társak ítéletétől.
- Bizalmatlan: nem hiszi el, hogy egy „névtelen" oldal valóban névtelen.

**Idézet:** *„Szívesen szólnék, de nem akarom, hogy kiderüljön, hogy én voltam."*

**Mit kap a TechALARM-tól**
- Személyes adat nélküli bejelentés: nincs regisztráció, nincs név. Az IP-címet csak sózott hash formában tároljuk, spam elleni korlátozásra.
- Egyértelmű, jól látható tájékoztatás az oldalon arról, hogy mit tárolunk és mit nem.
- A követőkód egy véletlen kód, nem köthető a személyéhez.

**Sikermérő:** a rongálásokat és a „kényes" bejelentéseket is megkapjuk, amelyeket korábban senki sem jelentett.

> **Design következmény:** érdemes az űrlap közelében egy rövid, érthető „Névtelen vagy" mondatot elhelyezni.

---

## Admin oldal

### 3. Gábor, a karbantartó / műhelyvezető (a napi felhasználó)

| | |
|---|---|
| **Kor, szerep** | 48 éves, műszaki karbantartó és műhelyfelelős |
| **Eszköz** | Műhelyben telefon, irodában számítógép |
| **Technikai tudás** | Közepes: a napi eszközöket használja, de nem szeret bonyolult rendszereket |

**Egy nap az iskolában:** a jelzéseket főleg szóban kapja tanároktól és diákoktól, sokszor ugyanarról a hibáról többször, máskor pedig nem derül ki, hogy pontosan melyik eszköz romlott el.

**Célok**
- Egy helyen látni az összes hibát, az eszköz pontos megjelölésével (terem, leltári szám).
- Fényképből gyorsan eldönteni, hogy milyen alkatrész vagy szerszám kell.
- Rangsorolni a teendőket és jelölni, mi van folyamatban.

**Fájdalompontok (feltételezések)**
- Szóbeli jelzések elvesznek, félreértések vannak („melyik gép?").
- Nincs nyilvántartása arról, mi lett megjavítva és mikor.
- Nincs ideje bonyolult adminisztrációra.

**Idézet:** *„Csak azt akarom tudni, hol mi romlott el, és legyen rajta egy kép."*

**Mit kap a TechALARM-tól**
- Bejelentéslista szűrhető státuszokkal (új / folyamatban / megjavítva / elutasítva).
- Részletes nézet fényképpel, hellyel, eszközzel, leírással.
- Megjegyzés, amelyet a bejelentő is lát („Csütörtökön cseréljük az alkatrészt").

**Sikermérő:** kevesebb szóbeli kérdezgetés; a bejelentéstől a javításig eltelt idő csökken.

---

### 4. Dóra, az iskolai adminisztrátor / igazgatóhelyettes (az áttekintő)

| | |
|---|---|
| **Kor, szerep** | 39 éves, igazgatóhelyettes, az épületüzemeltetés és a költségvetés is hozzá tartozik |
| **Eszköz** | Számítógép, időnként telefon |
| **Technikai tudás** | Jó, de az átláthatóság és a felelősség érdekli |

**Helyzet:** a fenntartó felé számot kell adnia a javításokról és a rongálásokról; a költségeket is tervezni kell. Most nincs összesített kép arról, hol milyen gyakoriak a hibák.

**Célok**
- Áttekinteni, mi van nyitva, mi lett megoldva, és mi okozza a legtöbb gondot.
- Tudni, mely termekben vagy eszközöknél gyakori a probléma (karbantartási és beszerzési döntésekhez).
- Bizonyítani, hogy a bejelentések kezelése működik.

**Fájdalompontok (feltételezések)**
- Hiányzik az összesítés és az előzmény.
- A rongálások gyakran követhetetlenek, és nincs bizonyíték.
- A tanárok és diákok nem tudják, hova forduljanak.

**Idézet:** *„Ha számokat és képeket látok, jobban tudok dönteni, mire költsünk."*

**Mit kap a TechALARM-tól (jelenleg és később)**
- Jelenleg: teljes lista és szűrés, státuszok, előzmény a bejelentésekről.
- Későbbi ötlet: statisztika (melyik terem / eszköz a leggyakoribb), havi összesítő, exportálás.

**Sikermérő:** gyorsabb döntés a javításokról; a hibák száma és a megoldási idő követhető.

---

## Összefoglaló: ki mit vár?

| | Bence | Lilla | Gábor | Dóra |
|---|---|---|---|---|
| **Fő igény** | Gyorsaság | Névtelenség | Pontos információ | Áttekintés |
| **Kulcs funkció** | Egyszerű űrlap | Névtelen bejelentés | Lista + fénykép | Szűrés, státusz |
| **Siker** | Van következménye | Biztonságban érzi magát | Kevesebb kérdezgetés | Jobb döntések |

*Egy további, később hozzáadható szereplő: a **tanár / oktató**, aki gyakorlat vagy óra közben észleli a hibát, és gyorsan akar jelezni.*
