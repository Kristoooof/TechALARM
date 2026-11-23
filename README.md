# TechALARM

Hibabejelentő weboldal a MSZC Gépészeti Technikum számára: elromlott eszközök és rongálások jelentése, névtelenül is.

**Technológia:** Next.js 15 (App Router) · Supabase (Postgres, Auth, Storage) · Vercel · Cloudflare Turnstile

## Funkciók

- **Bejelentés** (`/`) – csak belépett, az admin által jóváhagyott felhasználónak: terem típusa (Informatika terem / Gépész terem / Osztályterem), a terem száma (a bejelentő írja be, pl. 1, 104), eszköz, típus, leírás, kötelező fénykép. A bejelentés a bejelentő nevéhez kötődik. Telefonra optimalizált. A `/?terem=<terem-id>` hivatkozás előre kiválasztja a termet (QR-kódokhoz).
- **Regisztráció és belépés** (`/regisztracio`, `/belepes`) – név és jelszó (e-mail cím nem kell; a név egyedi, a belépés név + jelszó); regisztráció után rögtön be van léptetve és bejelenthet, a bejelentése az admin felületen **hitelesítetlen** (szűrhető) addig, amíg az admin jóvá nem hagyja a regisztrációt (`/admin/regisztraciok`), ekkor a bejelentései hitelesítetté válnak. A hitelesítetlen felhasználó óránként 2, a jóváhagyott 5 bejelentést küldhet. Saját bejelentések: `/bejelentesim`. A követőkóddal az állapot belépés nélkül is lekérdezhető (`/nyomon`), a név ott nem jelenik meg.
- **Állapotkövetés** (`/nyomon`) – a bejelentő a kapott `TA-XXXX-XXXX` kóddal nézheti meg az állapotot és az admin üzenetét.
- **Bemutató / landing oldal** (`/bemutato`) – a projekt bemutatkozó oldala: ígéret, a probléma, három lépés, állapotkövetés, adatkezelés, GYIK, egy fő gomb (Hibát jelentek) és egy másodlagos link a kérdőívhez. A karbantartóknak és az iskolának külön oldal szól (`/karbantartoknak`). A „Hibát jelentek” gombok kattintását a Vercel Web Analytics névtelenül számolja (sütik nélkül; a Vercel projekt Analytics fülén be kell kapcsolni). Saját rajzolt tanterem-illusztráció (`RoomScene.tsx`), görgetésre beúszó elemek (`Reveal.tsx`, mozgáscsökkentésnél kikapcsol). Önálló elrendezés (`src/app/(landing)`), a belső oldalak a `src/app/(site)` csoportban vannak.
- **Adatvédelem** – adatkezelési tájékoztató (`/adatkezeles`, jogalap: közfeladat, regisztrációkor tudomásulvétel a verzióval és időponttal mentve); Fiókom (`/fiokom`): tárolt adatok, JSON-letöltés, adatkezelési kérelmek (helyesbítés, törlés, tiltakozás); az üzemeltető az admin felületen kezeli a kérelmeket (határidő: 30 nap), javítja a nevet, törli és anonimizálja a fiókot. Adatmegőrzés: napi Vercel cron (`/api/cron/retention`) a tanév végéig + 1 évnél régebbi bejelentéseket (és fényképeket), valamint a 90 napnál régebbi, jóváhagyásra váró vagy elutasított regisztrációkat törli. Szerepkörök: üzemeltető, karbantartó, jóváhagyó tanár (`/admin/munkatarsak`). Dokumentumok: `docs/adatvedelem/` (nyilvántartás, küszöbelemzés, incidens eljárásrend, hozzáférés és titoktartás, adatfeldolgozási megállapodás, mentés).
- **Admin** (`/admin`) – belépés után: bejelentések listája és szűrése, státuszváltás (új / folyamatban / megjavítva / elutasítva), megjegyzés, törlés; termek és eszközök kezelése, CSV-import (`/admin/helyek`).
- **Spamvédelem** – Turnstile és rejtett csalimező a regisztrációnál, felhasználónkénti korlát (óránként 5 bejelentés). Új bejelentésnél IP-címet nem tárolunk.

## Üzembe helyezés (egyszeri beállítás)

### 1. Supabase
A séma és a mintaadatok már fel vannak töltve a **TechALARM** projektre (`supabase/migrations/`, `supabase/seed.sql`). Teendők:

1. **Authentication → Sign In / Providers → Email**: kapcsold ki a *Allow new users to sign up* opciót, hogy ne lehessen regisztrálni.
2. **Authentication → Users → Add user**: hozd létre az admin fiókot (e-mail + jelszó, *Auto Confirm User* bepipálva).
3. **SQL Editor**: tedd adminná a fiókot (az e-mail címet cseréld ki):
   ```sql
   insert into private.admins (user_id)
   select id from auth.users where email = 'admin@pelda.hu';
   ```
4. **Project Settings → API**: másold ki a `service_role` (secret) kulcsot a Vercelhez. **Ez titok, soha ne kerüljön a repóba!**

### 2. Cloudflare Turnstile
[dash.cloudflare.com](https://dash.cloudflare.com/) → Turnstile → új widget (a Vercel domainre). Kapsz egy *site key*-t és egy *secret key*-t.

### 3. Vercel
Importáld a GitHub repót, majd a Settings → Environment Variables alatt add meg (lásd `.env.example`):

| Változó | Érték |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://igtzmnpbizcfpwhqxqnd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) kulcs |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role kulcs (titok) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key |
| `CRON_SECRET` | hosszú véletlen szöveg: a napi törlési feladatot védi |
| `NEXT_PUBLIC_ORG_NAME`, `_ORG_ADDRESS`, `_DPO_NAME`, `_DPO_CONTACT` | az adatkezelő és a DPO adatai a tájékoztatóhoz |

> Ha a `TURNSTILE_SECRET_KEY` hiányzik, a bejelentések **le vannak tiltva** (biztonsági okból).

## Helyi fejlesztés

```bash
cp .env.example .env.local   # töltsd ki a SUPABASE_SERVICE_ROLE_KEY-t
npm install
npm run dev                  # http://localhost:3000
```

A `.env.example`-ben lévő Turnstile kulcsok Cloudflare teszt kulcsok: fejlesztéshez mindig átengednek.

## Termek és eszközök feltöltése CSV-ből

Admin → *Termek és eszközök* → *Tömeges feltöltés*. Három oszlop, `;`, `,` vagy tabulátor elválasztóval, UTF-8 kódolásban (a fejléc elhagyható):

```
terem;eszköz;leltári szám
Gépműhely;Fúrógép;GM-001
CNC labor;CNC maró;CNC-002
```

Excelből: *Mentés másként → CSV UTF-8*. A már létező termeket és eszközöket kihagyja, így többször is futtatható.

## Adatbázis

| Tábla | Tartalom |
| --- | --- |
| `rooms` | teremtípusok (Informatika terem, Gépész terem, Osztályterem; `active`: rejtés a bejelentő űrlapról) |
| `devices` | eszközök, teremhez kötve, leltári számmal |
| `reports` | bejelentések (követőkód, státusz, admin megjegyzés, fotó útvonala) |
| `private.admins` | adminok (nem érhető el az API-n keresztül) |

Biztonság: minden táblán RLS van. A névtelen látogató csak az aktív termeket és eszközöket olvashatja; a bejelentések írása és a követőkódos lekérdezés a szerveren, a service role kulccsal történik. A fotók privát tárolóban vannak, az admin ideiglenes (1 órás) linkkel látja őket.

## Státuszok és kategóriák módosítása

A típusok és státuszok a `src/lib/constants.ts` fájlban, valamint a `reports` tábla `check` megkötéseiben (`supabase/migrations/`) vannak. Új érték felvételéhez mindkettőt módosítani kell.
