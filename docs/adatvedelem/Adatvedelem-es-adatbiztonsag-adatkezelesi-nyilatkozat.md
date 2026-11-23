---
title: "ADATVÉDELEM ÉS ADATBIZTONSÁG"
subtitle: "ADATKEZELÉSI NYILATKOZAT · TechALARM iskolai hibabejelentő rendszer"
---

| Dokumentumvezérlés | |
|---|---|
| **Dokumentum azonosítója** | TA-ADV-001 |
| **Verzió** | 2026-11-24 (megegyezik a rendszer /adatkezeles oldalán közzétett tájékoztatóval) |
| **Státusz** | Tervezet, az adatvédelmi tisztviselő (DPO) jóváhagyására vár |
| **Hatálybalépés** | [dátum – kitöltendő] |
| **Készítette** | A TechALARM fejlesztői csapata |
| **Jóváhagyja** | [az igazgató neve – kitöltendő] |
| **Következő felülvizsgálat** | Legkésőbb 12 hónap múlva, vagy az adatkezelés érdemi változásakor |

> A [szögletes zárójeles] mezőket az iskola tölti ki. A dokumentum nem helyettesíti a jogi tanácsadást: aláírás előtt az iskola adatvédelmi tisztviselőjével vagy jogásszal egyeztetendő.

**Tartalom:** 1. Cél és hatály · 2. Az adatkezelő és az adatfeldolgozók · 3. Kezelt adatok és jogalap · 4. Szerepkörök és hozzáférési jogosultságok · 5. Azonosítás és hitelesítés · 6. Alapelvek és korlátok · 7. Adatbiztonság · 8. Megőrzés és törlés · 9. Az érintettek jogai · 10. Adatvédelmi incidens · 11. Adattovábbítás · 12. Kiskorúak és sütik · 13. Felelősségek · 14. Nyilatkozat · 15. Módosítások

# 1. Cél és hatály

Ez a nyilatkozat azt rögzíti, hogyan kezeli a **TechALARM** iskolai hibabejelentő rendszer a felhasználók személyes adatait, milyen jogalappal, ki fér hozzájuk, és milyen szervezési és műszaki intézkedésekkel védjük őket. A rendszer célja, hogy az iskola diákjai és dolgozói bejelentsék az elromlott eszközöket és a rongálásokat, a karbantartók pedig nyomon követhessék és javíthassák ezeket.

A nyilatkozat a rendszer minden felhasználójára és minden, az adatokhoz hozzáférő személyre kiterjed (diákok, tanárok, karbantartók, igazgató, admin, fejlesztők). Összhangban van a rendszer nyilvános **adatkezelési tájékoztatójával**, amely a felhasználók számára közérthetően összefoglalja a lényeget.

# 2. Az adatkezelő és az adatfeldolgozók

| Szerep | Adatok |
|---|---|
| **Adatkezelő** | [az iskola neve – kitöltendő], [székhelye – kitöltendő], képviseli: [az igazgató neve – kitöltendő] |
| **Adatvédelmi tisztviselő (DPO)** | [név és elérhetőség – kitöltendő] |
| **Adatfeldolgozó: Supabase** | Adatbázis, felhasználókezelés és fájltároló, **EU (Írország)** |
| **Adatfeldolgozó: Vercel** | A rendszer üzemeltetése, függvények régiója: **EU (Dublin)** |
| **Adatfeldolgozó: Cloudflare** | Spamvédelem (Turnstile) a regisztrációnál |
| **Fejlesztők** | Csak az igazgató engedélyével és írásbeli titoktartási nyilatkozattal férnek éles adathoz |

Minden iskola a saját aloldalát és **saját adatbázisát** használja, ezért minden iskola önálló adatkezelő, az iskolák adatai nem keverednek.

# 3. Kezelt adatok és jogalap

| Adat | Cél | Jogalap | Megőrzés |
|---|---|---|---|
| Teljes név, egyedi felhasználónév, jelszó (nem olvasható hash), regisztráció és jóváhagyás időpontja, a tájékoztató verziója és tudomásulvételének ideje | Azonosítás, a jogosultak körének ellenőrzése, visszaélések megelőzése | Közfeladat (GDPR 6. cikk (1) e)) | Az iskolai jogviszony megszűnéséig, a tanév végi takarításig. Jóváhagyásra váró vagy elutasított regisztráció: 90 nap |
| Bejelentés: terem, eszköz, leírás, fénykép, állapot, megjegyzés, a bejelentő nevének és felhasználónevének pillanatképe, követőkód, hitelesítettségi jelzés | A hibák kezelése és visszajelzés | Közfeladat (GDPR 6. cikk (1) e)) | A bejelentés tanévének végéig és még 1 évig, utána automatikus törlés |
| Adatkezelési kérelmek (típus, szöveg, válasz, határidő) | Az érintetti jogok gyakorlásának kezelése | Jogi kötelezettség (GDPR 6. cikk (1) c)) | A lezárásig, utána a jogi igények igazolásához szükséges ideig [az iskola dönti el] |
| Technikai adatok (IP-cím, böngésző) a szerver- és spamvédelmi naplókban | A rendszer biztonsága és működése | Közfeladat, biztonság (GDPR 32. cikk) | A szolgáltatók szabályai szerint |

**E-mail címet, telefonszámot, osztályt és más felesleges adatot nem kérünk.** A bejelentéshez csatolt fényképen embert ne ábrázolj, csak a hibás eszközt.

**Hozzájárulást nem kérünk.** A tanuló és az iskola, illetve a munkavállaló és a munkáltató viszonyában a hozzájárulás általában nem tekinthető önkéntesnek (GDPR (43) preambulumbekezdés), ezért az adatkezelés alapja a közfeladat: az iskola létesítményeinek működtetése és vagyonvédelme (Nkt., Szkt.). Regisztrációkor a felhasználó a tájékoztatót tudomásul veszi, ennek időpontját és a tájékoztató verzióját elmentjük.

# 4. Szerepkörök és hozzáférési jogosultságok

A jogosultságok a **szükséges legkisebb hozzáférés** elvét követik. A szerepkört az igazgató vagy az admin adja meg a felhasználó felhasználóneve alapján, a rendszer pedig az adatbázis szintjén is kikényszeríti.

| Funkció | Diák | Tanár | Karbantartó | Igazgató és admin |
|---|:-:|:-:|:-:|:-:|
| Bejelentés beküldése | ✔ | ✔ | ✔ | ✔ |
| Állapot megtekintése követőkóddal | ✔ | ✔ | ✔ | ✔ |
| Saját adatok letöltése, adatkezelési kérelem | ✔ | ✔ | ✔ | ✔ |
| Regisztráció jóváhagyása, név javítása | – | ✔ | ✔ | ✔ |
| Bejelentések megtekintése és kezelése (név, fénykép) | – | – | ✔ | ✔ |
| Termek és eszközök kezelése | – | – | ✔ | ✔ |
| Szerepkörök kiosztása, adatkérelmek kezelése | – | – | – | ✔ |
| Fiók törlése és anonimizálás, adatmentés | – | – | – | ✔ |

**A bejelentő nevét más bejelentők nem látják,** és a követőkódos oldal sem mutatja. A tanár a nevet csak a regisztrációknál látja, a bejelentéseknél nem.

# 5. Azonosítás és hitelesítés

- **Azonos nevű felhasználók:** a név nem egyedi, mert egy iskolában több ugyanolyan nevű személy is lehet. Mindenki egyedi **felhasználónevet** kap a regisztrációkor (például *kovacs.sandor*, *kovacs.sandor2*), amely a bejelentéseken is megjelenik, így az azonos nevűek megkülönböztethetők. Belépni a névvel vagy a felhasználónévvel lehet, azonos nevűeknél a felhasználónévvel.
- **Jelszó:** legalább 8 karakter, nem visszafejthető hash formában tárolódik, az adminok sem látják.
- **Azonnali bejelentés, hitelesítetlen jelzés:** a regisztráció után a felhasználó rögtön bejelenthet. Amíg a tanár, karbantartó, igazgató vagy admin a regisztrációt jóvá nem hagyja, a bejelentése **hitelesítetlen bejelentőtől származóként** jelenik meg az admin felületen, szűrhető jelzéssel. A jóváhagyás után a bejelentések automatikusan hitelesítetté válnak, elutasításnál ismét hitelesítetlenek. A jóváhagyásra váró felhasználó óránként legfeljebb 2, a jóváhagyott legfeljebb 5 bejelentést küldhet.

# 6. Alapelvek és korlátok

- **Célhoz kötöttség:** az adatokat kizárólag hibák kezelésére használjuk (GDPR 5. cikk (1) b)).
- **Fegyelmi felhasználás tilalma:** az adatok fegyelmi vagy felelősségre vonási célra **nem használhatók**.
- **Adattakarékosság:** csak a szükséges adatot kérjük.
- **Nincs marketing, profilozás vagy harmadik félnek átadás,** a megjelölt adatfeldolgozókon kívül. Automatizált döntéshozatalt nem alkalmazunk.
- **Fejlesztés és tesztelés tesztadattal történik.** Éles adatot csak az igazgató engedélyével, titoktartás mellett lehet kezelni.

# 7. Adatbiztonság

## 7.1 Műszaki intézkedések (GDPR 32. cikk)

| Intézkedés | Leírás |
|---|---|
| **Titkosított kapcsolat** | Minden forgalom HTTPS-en megy |
| **Jelszóvédelem** | Nem visszafejthető hash (Supabase Auth), a jelszavak senki számára nem olvashatók |
| **Jogosultságkezelés** | Szerepkör-hierarchia (tanár, karbantartó, igazgató és admin), az adatbázisban sorszintű védelemmel (RLS). A szerver ellenőriz, nem a böngésző |
| **Privát fájltároló** | A fényképek nem nyilvánosak, megtekintésük csak jogosultaknak, 1 órás aláírt hivatkozással lehetséges |
| **Titkos kulcsok** | Környezeti változóban, a böngészőbe nem kerülnek, kódban nem szerepelnek |
| **Spam- és visszaélés-védelem** | Regisztrációnál Cloudflare Turnstile és csalimező; bejelentésnél felhasználónkénti óránkénti korlát; bejelentés csak belépett felhasználótól |
| **Adatok helye** | Adatbázis és fájltároló az EU-ban (Írország), függvények Dublinban |
| **Automatikus törlés** | Napi feladat törli a lejárt bejelentéseket (fényképpel együtt) és a 90 napnál régebbi, jóváhagyásra váró vagy elutasított regisztrációkat |
| **Mentés** | Az igazgató vagy az admin a felületről teljes mentést tölt le (havonta és nagyobb módosítás előtt). A mentés személyes adat, zárt helyen tárolandó és a megőrzési szabályokat követi |

## 7.2 Szervezési intézkedések

- Éles adathoz a hozzáférést az igazgató adja, névre szólóan, indoklással, nyilvántartva.
- Az adathoz hozzáférők írásban **titoktartásra** kötelezettek (GDPR 28. cikk (3) b), 29. és 32. cikk (4)).
- Az iskola adatvédelmi tisztviselőt jelölt ki (GDPR 37. cikk).
- Az adatkezelési tevékenységeket nyilvántartásba vettük (GDPR 30. cikk), a kockázatokat küszöbelemzéssel dokumentáltuk (GDPR 35. cikk).
- Az iskola és a fejlesztők között adatfeldolgozási megállapodás szükséges (GDPR 28. cikk).

# 8. Megőrzés és törlés

| Adat | Megőrzési idő | Törlés módja |
|---|---|---|
| Bejelentések és fényképek | A bejelentés tanévének végéig és még 1 évig | Automatikus, napi feladat |
| Jóváhagyott regisztráció | Az iskolai jogviszony megszűnéséig, a tanév végi takarításig | Igazgató vagy admin törli (a jogviszony végén) |
| Jóváhagyásra váró vagy elutasított regisztráció | 90 nap | Automatikus, napi feladat |
| Adatkezelési kérelmek | A lezárásig, utána a jogi igények igazolásához szükséges ideig | Igazgató vagy admin |
| Adatmentések | [3 hónap] | A mentés kezelője törli |

**Fiók törlésekor** a felhasználó bejelentései **névtelenné válnak** (a név, a felhasználónév és a kapcsolat törlődik), hogy a hibák előzményei megmaradjanak.

# 9. Az érintettek jogai

| Jog | Hivatkozás | Hogyan gyakorolható |
|---|---|---|
| **Tájékoztatás** | GDPR 13–14. cikk | Ez a nyilatkozat és a rendszer /adatkezeles oldala |
| **Hozzáférés** | GDPR 15. cikk | Belépés után a Fiókom oldalon megtekinthetők és JSON fájlként letölthetők az adatok |
| **Helyesbítés** | GDPR 16. cikk | Kérelem a Fiókom oldalon, a tanár, a karbantartó, az igazgató vagy az admin javítja a nevet (a korábbi bejelentésekben is) |
| **Törlés** | GDPR 17. cikk | Kérelem a Fiókom oldalon. A fiók törlődik, a bejelentések névtelenné válnak. Közfeladati alapnál a jog nem korlátlan (17. cikk (3) b)) |
| **Korlátozás** | GDPR 18. cikk | Kérelem a Fiókom oldalon |
| **Tiltakozás** | GDPR 21. cikk | Kérelem a Fiókom oldalon, az igazgató vagy az admin elbírálja és indokolja |
| **Adathordozhatóság** | GDPR 20. cikk | Közfeladati jogalapnál nem alkalmazandó, a letöltés ettől még elérhető |

**Határidő:** legfeljebb **1 hónap** (GDPR 12. cikk (3)), indokolt esetben további 2 hónappal hosszabbítható, erről értesítünk. A választ a Fiókom oldalon közöljük.

**Jogorvoslat:** panasz a **Nemzeti Adatvédelmi és Információszabadság Hatósághoz** (NAIH, 1055 Budapest, Falk Miksa utca 9–11., naih.hu), bírósági jogérvényesítés, kártérítés (GDPR 77–79., 82. cikk, Infotv.).

# 10. Adatvédelmi incidens

Ha az adatok jogosulatlan hozzáférésére, elvesztésére vagy kiszivárgására gyanú merül fel, az észlelő **azonnal** jelzi az igazgatónak és a DPO-nak. Az incidenst legkésőbb **72 órán belül** bejelentjük a NAIH-nak, ha az valószínűleg kockázattal jár, magas kockázat esetén az érintetteket is értesítjük (GDPR 33–34. cikk). Minden incidenst naplózunk, akkor is, ha nem kell bejelenteni. A részletes eljárás külön dokumentum (03).

# 11. Adattovábbítás

A Vercel és a Cloudflare amerikai vállalat, az adattovábbítás az EU–USA adatvédelmi keretrendszer és/vagy a szokásos szerződési feltételek (SCC) alapján történik (GDPR 44–46. cikk). Az adatbázis és a fényképek az EU-ban vannak. A rendszer nem ad át adatot más harmadik félnek.

# 12. Kiskorúak és sütik

**Kiskorúak.** A rendszert 14 éves kortól tanulók is használhatják (a 14. életévét betöltött kiskorú korlátozottan cselekvőképes, Ptk. 2:12. §). Mivel az adatkezelés jogalapja nem hozzájárulás, hanem közfeladat, a 16 év alattiakra a GDPR 8. cikkének szülői hozzájárulási szabálya nem vonatkozik. Az iskola a szülőket a szokásos iskolai csatornákon tájékoztatja a rendszerről.

**Sütik.** Csak a bejelentkezéshez szükséges munkamenet-sütit használjuk, amely hozzájárulás nélkül használható. A látogatottságot sütik nélkül, személy nélküli összesítéssel mérjük (Vercel Web Analytics).

# 13. Felelősségek

| Szereplő | Felelősség |
|---|---|
| **Igazgató (adatkezelő képviselője)** | Az adatkezelés jogszerűségéért felel, jóváhagyja a hozzáféréseket és a megőrzési szabályokat, kezeli az adatkezelési kérelmeket |
| **Adatvédelmi tisztviselő** | Tanácsot ad, ellenőrzi a megfelelést, kapcsolattartó a NAIH-hoz és az érintettekhez |
| **Admin** | Műszaki üzemeltetés, mentések, jogosultságok, incidenskezelés az igazgatóval együtt |
| **Karbantartó** | A bejelentések kezelése, a regisztrációk jóváhagyása, a fegyelmi felhasználás tilalmának betartása |
| **Tanár** | A regisztrációk jóváhagyása, a nevek ellenőrzése |
| **Fejlesztők** | A rendszer biztonságos fejlesztése, tesztadat használata, titoktartás |

# 14. Nyilatkozat

**Az adatkezelő nyilatkozik, hogy**

1. a személyes adatokat a jelen nyilatkozatban megjelölt célra, jogalappal és ideig kezeli;
2. az adatokat nem használja fegyelmi, felelősségre vonási, marketing vagy profilozási célra, és nem adja át harmadik félnek, a megjelölt adatfeldolgozókon kívül;
3. az adatok védelmét a 7. pontban leírt műszaki és szervezési intézkedésekkel biztosítja;
4. az érintettek jogait a 9. pont szerint, 1 hónapon belül teljesíti;
5. az adatvédelmi incidenseket a 10. pont szerint kezeli és jelenti.

**A felhasználó regisztrációkor tudomásul veszi, hogy** a nevét és felhasználónevét a bejelentéseihez kapcsolva tároljuk, és azt a karbantartó, az igazgató és az admin látja, más bejelentő nem.

Kelt: [hely, dátum]

| | |
|---|---|
| **Adatkezelő:** [az igazgató neve, aláírás, bélyegző] | **Adatvédelmi tisztviselő:** [név, aláírás] |

# 15. Módosítások

| Verzió | Változás |
|---|---|
| 2026-11-18 | Első változat: regisztráció névvel és jelszóval, admin általi jóváhagyás, közfeladati jogalap |
| 2026-11-23 | Regisztráció után azonnali bejelentés, a bejelentések hitelesítetlen jelzése jóváhagyásig, szigorúbb korlát a jóváhagyásra váróknak |
| 2026-11-24 | Azonos nevű felhasználók (egyedi felhasználónév), a szerepkörök újradefiniálása: diák, tanár, karbantartó, igazgató és admin; a diák követőkóddal nézi az állapotot |

*Jogszabályi hivatkozások:* az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR); az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Infotv.); a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.); a nemzeti köznevelésről szóló 2011. évi CXC. törvény (Nkt.); a szakképzésről szóló 2019. évi LXXX. törvény (Szkt.). A szakaszszámokat a DPO-val ellenőriztesd.
