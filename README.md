# TechALARM

Hibabejelentő weboldal a MSZC Gépészeti Technikum számára: elromlott eszközök és rongálások jelentése, névtelenül is.

**Technológia:** Next.js 15 (App Router) · Supabase (Postgres, Auth, Storage) · Vercel · Cloudflare Turnstile

## Funkciók

- **Bejelentés** (`/`) – terem, eszköz, típus, leírás, opcionális fénykép. Bejelentkezés nélkül. Telefonra optimalizált. A `/?terem=<terem-id>` hivatkozás előre kiválasztja a termet (későbbi QR-kódokhoz).
- **Állapotkövetés** (`/nyomon`) – a bejelentő a kapott `TA-XXXX-XXXX` kóddal nézheti meg az állapotot és az admin üzenetét.
- **Admin** (`/admin`) – belépés után: bejelentések listája és szűrése, státuszváltás (új / folyamatban / megjavítva / elutasítva), megjegyzés, törlés; termek és eszközök kezelése, CSV-import (`/admin/helyek`).
- **Spamvédelem** – Turnstile, rejtett csalimező, IP-alapú korlát (óránként 5 bejelentés; az IP-t csak sózott hash-ként tároljuk).

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
| `IP_HASH_SALT` | tetszőleges hosszú véletlen szöveg |

> Ha a `TURNSTILE_SECRET_KEY` hiányzik, a bejelentések **le vannak tiltva** (biztonsági okból).

## Helyi fejlesztés

```bash
cp .env.example .env.local   # töltsd ki a SUPABASE_SERVICE_ROLE_KEY-t és az IP_HASH_SALT-ot
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
| `rooms` | termek / laborok (`active`: rejtés a bejelentő űrlapról) |
| `devices` | eszközök, teremhez kötve, leltári számmal |
| `reports` | bejelentések (követőkód, státusz, admin megjegyzés, fotó útvonala) |
| `private.admins` | adminok (nem érhető el az API-n keresztül) |

Biztonság: minden táblán RLS van. A névtelen látogató csak az aktív termeket és eszközöket olvashatja; a bejelentések írása és a követőkódos lekérdezés a szerveren, a service role kulccsal történik. A fotók privát tárolóban vannak, az admin ideiglenes (1 órás) linkkel látja őket.

## Státuszok és kategóriák módosítása

A típusok és státuszok a `src/lib/constants.ts` fájlban, valamint a `reports` tábla `check` megkötéseiben (`supabase/migrations/`) vannak. Új érték felvételéhez mindkettőt módosítani kell.
