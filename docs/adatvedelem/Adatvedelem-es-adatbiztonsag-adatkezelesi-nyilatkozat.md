---
title: "ADATVÉDELEM ÉS ADATBIZTONSÁG – ADATKEZELÉSI NYILATKOZAT"
subtitle: "TechALARM iskolai hibabejelentő rendszer"
---

**Verzió:** 2026-11-23 (megegyezik a rendszer /adatkezeles oldalán közzétett tájékoztatóval) · **Készült:** 2026-11-23

> Ez a nyilatkozat a TechALARM jelenlegi működését írja le. A [szögletes zárójeles] mezőket az iskola tölti ki. A dokumentumot az iskola adatvédelmi tisztviselőjével (DPO) vagy jogásszal kell egyeztetni, mielőtt éles használatba kerül.

# 1. Az adatkezelő és az adatvédelmi tisztviselő

| | |
|---|---|
| **Adatkezelő** | [az iskola neve – kitöltendő] |
| **Székhely** | [kitöltendő] |
| **Képviselő** | [az igazgató neve – kitöltendő] |
| **Adatvédelmi tisztviselő (DPO)** | [név és elérhetőség – kitöltendő] |

Minden iskola a saját aloldalát és a saját adatbázisát használja, ezért minden iskola önálló adatkezelő, az iskolák adatai nem keverednek. A rendszert diákok fejlesztik, éles adathoz csak az üzemeltető (igazgató) engedélyével és írásbeli titoktartási nyilatkozat birtokában férhetnek hozzá.

# 2. Milyen adatot, miért és milyen jogalappal kezelünk?

| Adat | Cél | Jogalap | Megőrzés |
|---|---|---|---|
| Teljes név, jelszó (nem olvasható hash), regisztráció és jóváhagyás időpontja, a tájékoztató verziója és tudomásulvételének ideje | Azonosítás, a jogosultak körének ellenőrzése, visszaélések megelőzése | Közfeladat (GDPR 6. cikk (1) e)) | Az iskolai jogviszony megszűnéséig, a tanév végi takarításig. Jóváhagyásra váró vagy elutasított regisztráció: 90 nap |
| Bejelentés: terem, eszköz, leírás, fénykép, állapot, megjegyzés, a bejelentő nevének pillanatképe, követőkód | A hibák kezelése és visszajelzés | Közfeladat (GDPR 6. cikk (1) e)) | A bejelentés tanévének végéig és még 1 évig, utána automatikus törlés |
| Adatkezelési kérelmek (típus, szöveg, válasz, határidő) | Az érintetti jogok gyakorlásának kezelése | Jogi kötelezettség (GDPR 6. cikk (1) c)) | A lezárásig, utána a jogi igények igazolásához szükséges ideig [az iskola dönti el] |
| Technikai adatok (IP-cím, böngésző) a szerver- és spamvédelmi naplókban | A rendszer biztonsága és működése | Közfeladat, biztonság (GDPR 32. cikk) | A szolgáltatók szabályai szerint |

**E-mail címet, telefonszámot, osztályt és más felesleges adatot nem kérünk.** A fényképen embert ne ábrázolj, csak a hibás eszközt.

**Hozzájárulást nem kérünk,** mert a tanuló és az iskola, illetve a munkavállaló és a munkáltató viszonyában a hozzájárulás általában nem tekinthető önkéntesnek (GDPR (43) preambulumbekezdés). A regisztráció után rögtön lehet bejelenteni, de a bejelentés **hitelesítetlenként** jelenik meg az admin felületen, amíg az admin a regisztrációt jóvá nem hagyja. A jóváhagyás a név ellenőrzése, ettől a bejelentések hitelesítetté válnak. Regisztrációkor a felhasználó a tájékoztatót tudomásul veszi, ennek időpontját és a tájékoztató verzióját elmentjük.

# 3. Az adatkezelés alapelvei és korlátai

- **Célhoz kötöttség:** az adatokat kizárólag hibák kezelésére használjuk (GDPR 5. cikk (1) b)).
- **Fegyelmi felhasználás tilalma:** az adatok fegyelmi vagy felelősségre vonási célra **nem használhatók**.
- **Adattakarékosság:** csak a szükséges adatot kérjük (nincs e-mail, telefonszám, osztály).
- **Marketing, profilozás, harmadik félnek átadás:** nincs. Automatizált döntéshozatalt nem alkalmazunk.
- **Fejlesztés és tesztelés:** tesztadattal történik. Éles adatot csak az üzemeltető engedélyével, titoktartás mellett lehet kezelni.

# 4. Ki fér hozzá az adatokhoz?

| Szerepkör | Mit lát |
|---|---|
| **Felhasználó** (diák, tanár, dolgozó) | Csak a saját adatait és bejelentéseit |
| **Karbantartó** | A bejelentéseket (a bejelentő nevével, a hitelesítetlen bejelentők jelölésével és a fényképpel), termek és eszközök |
| **Jóváhagyó tanár** | A regisztrációkat (a nevet, a jóváhagyás állapotát) |
| **Rendszerüzemeltető (igazgató)** | Minden adatot, a munkatársakat és az adatkezelési kérelmeket |
| **Fejlesztők** | Csak üzemeltetői engedéllyel és aláírt titoktartási nyilatkozattal |

**Más bejelentők nem látják a bejelentő nevét,** és a követőkódos oldal sem mutatja azt.

**Adatfeldolgozók:** Supabase (adatbázis és fájltároló, EU: Írország), Vercel (üzemeltetés, EU-régió: Dublin), Cloudflare (spamvédelem a regisztrációnál, az IP-cím és böngészőadatok kerülnek hozzá).

**Adattovábbítás harmadik országba:** a Vercel és a Cloudflare amerikai vállalat, az adattovábbítás az EU–USA adatvédelmi keretrendszer és/vagy a szokásos szerződési feltételek (SCC) alapján történik (GDPR 44–46. cikk). Az adatbázis és a fényképek az EU-ban vannak.

# 5. Adatbiztonság

## 5.1 Technikai intézkedések (GDPR 32. cikk)

- **Titkosított kapcsolat:** minden forgalom HTTPS-en keresztül megy.
- **Jelszavak:** nem visszafejthető hash formában tárolódnak (Supabase Auth), az adminok sem látják őket.
- **Jogosultságkezelés:** három szerepkör (üzemeltető, karbantartó, jóváhagyó tanár), az adatbázisban sorszintű védelemmel (RLS). A jogosultságot a szerver ellenőrzi, nem a böngésző.
- **Privát fájltároló:** a fényképek nem nyilvánosak, megtekintésük csak jogosultaknak, 1 órás aláírt hivatkozással lehetséges.
- **Titkos kulcsok:** a szerverkulcsok környezeti változóban vannak, a böngészőbe nem kerülnek, kódban nem szerepelnek.
- **Spam és visszaélés elleni védelem:** a regisztrációnál Cloudflare Turnstile és rejtett csalimező, a bejelentéseknél felhasználónkénti óránkénti korlát. Bejelentést csak belépett (regisztrált) felhasználó küldhet. A jóváhagyásra váró, hitelesítetlen felhasználó óránként legfeljebb 2, a jóváhagyott legfeljebb 5 bejelentést küldhet.
- **Adatok helye:** az adatbázis és a fájltároló az EU-ban (Írország), a függvények Dublinban futnak.
- **Automatikus törlés:** napi feladat törli a lejárt bejelentéseket (fényképpel együtt) és a 90 napnál régebbi, jóváhagyásra váró vagy elutasított regisztrációkat.
- **Mentés:** az üzemeltető a felületről teljes mentést tölt le (havonta és nagyobb módosítás előtt). A mentés személyes adatot tartalmaz, zárt helyen kell tárolni, és a megőrzési szabályokat követnie kell.

## 5.2 Szervezési intézkedések

- Éles adathoz a hozzáférést az üzemeltető adja, névre szólóan, indoklással, nyilvántartva.
- Az adathoz hozzáférők írásban titoktartásra kötelezettek (GDPR 28. cikk (3) b), 29. és 32. cikk (4)).
- Az iskola adatvédelmi tisztviselőt jelölt ki (GDPR 37. cikk).
- Az adatkezelési tevékenységeket nyilvántartásba vettük (GDPR 30. cikk).
- Az iskola és a fejlesztők között adatfeldolgozási megállapodás szükséges (GDPR 28. cikk).

## 5.3 Adatvédelmi incidens

Ha az adatok jogosulatlan hozzáférésére, elvesztésére vagy kiszivárgására gyanú merül fel, az észlelő azonnal jelzi az üzemeltetőnek és a DPO-nak. Az incidenst legkésőbb **72 órán belül** bejelentjük a Nemzeti Adatvédelmi és Információszabadság Hatóságnak, ha az valószínűleg kockázattal jár, magas kockázat esetén az érintetteket is értesítjük (GDPR 33–34. cikk). Minden incidenst naplózunk.

# 6. Az érintettek jogai és gyakorlásuk

| Jog | Hivatkozás | Hogyan gyakorolható |
|---|---|---|
| **Tájékoztatás** | GDPR 13–14. cikk | Ez a nyilatkozat és a rendszer /adatkezeles oldala |
| **Hozzáférés** | GDPR 15. cikk | Belépés után a Fiókom oldalon az adatok megtekinthetők és JSON fájlként letölthetők |
| **Helyesbítés** | GDPR 16. cikk | Kérelem a Fiókom oldalon, a jóváhagyó vagy az üzemeltető javítja az adatot (a korábbi bejelentésekben is) |
| **Törlés** | GDPR 17. cikk | Kérelem a Fiókom oldalon. A fiók törlődik, a bejelentések névtelenné válnak. Közfeladati alapnál a jog nem korlátlan (17. cikk (3) b)) |
| **Korlátozás** | GDPR 18. cikk | Kérelem a Fiókom oldalon |
| **Tiltakozás** | GDPR 21. cikk | Kérelem a Fiókom oldalon, az üzemeltető elbírálja és indokolja a döntést |
| **Adathordozhatóság** | GDPR 20. cikk | Közfeladati jogalapnál nem alkalmazandó, a letöltés ettől még elérhető |

**Határidő:** a kérelmekre legfeljebb **1 hónapon belül** válaszolunk (GDPR 12. cikk (3)), indokolt esetben további 2 hónappal hosszabbítható, erről értesítünk. A választ a Fiókom oldalon közöljük.

**Jogorvoslat:** ha úgy érzed, megsértettük a jogaidat, panasszal fordulhatsz a **Nemzeti Adatvédelmi és Információszabadság Hatósághoz** (NAIH, 1055 Budapest, Falk Miksa utca 9–11., naih.hu), vagy bírósághoz (GDPR 77–79. cikk, Infotv.). Kártérítést is kérhetsz (GDPR 82. cikk).

# 7. Kiskorúak

A rendszert 14 éves kortól tanulók is használhatják (a 14. életévét betöltött kiskorú korlátozottan cselekvőképes, Ptk. 2:12. §). Mivel az adatkezelés jogalapja nem hozzájárulás, hanem közfeladat, a 16 év alattiakra a GDPR 8. cikkének szülői hozzájárulási szabálya nem vonatkozik. Az iskola a szülőket a szokásos iskolai csatornákon tájékoztatja a rendszerről.

# 8. Sütik

Csak a bejelentkezéshez szükséges munkamenet-sütit használjuk, amely hozzájárulás nélkül használható. A látogatottságot sütik nélkül, személy nélküli összesítéssel mérjük (Vercel Web Analytics).

# 9. Nyilatkozat

**Az adatkezelő nyilatkozik, hogy**

1. a személyes adatokat a jelen nyilatkozatban megjelölt célra, jogalappal és ideig kezeli;
2. az adatokat nem használja fegyelmi, felelősségre vonási, marketing vagy profilozási célra, és nem adja át harmadik félnek, a megjelölt adatfeldolgozókon kívül;
3. az adatok védelmét a 5. pontban leírt technikai és szervezési intézkedésekkel biztosítja;
4. az érintettek jogait a 6. pont szerint, 1 hónapon belül teljesíti;
5. az adatvédelmi incidenseket a 5.3 pont szerint kezeli és jelenti.

**A felhasználó regisztrációkor tudomásul veszi, hogy** a nevét a bejelentéseihez kapcsolva tároljuk, és azt az admin és a karbantartó látja, más bejelentő nem.

Kelt: [hely, dátum]

Adatkezelő: [név, aláírás, bélyegző]  Adatvédelmi tisztviselő: [név, aláírás]

*Jogszabályi hivatkozások:* az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR); az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Infotv.); a Polgári Törvénykönyvről szóló 2013. évi V. törvény (Ptk.); a nemzeti köznevelésről szóló 2011. évi CXC. törvény (Nkt.); a szakképzésről szóló 2019. évi LXXX. törvény (Szkt.). A szakaszszámokat a DPO-val ellenőriztesd.
