import type { Metadata } from "next";
import Link from "next/link";
import TrackedLink from "../TrackedLink";

export const metadata: Metadata = {
  alternates: { canonical: "/karbantartoknak" },
  title: "TechALARM karbantartóknak és az iskolának",
  description: "Egy helyen minden bejelentés, pontos hellyel, eszközzel és fényképpel. Állapotkezelés és megjegyzés a bejelentőnek.",
  openGraph: {
    title: "TechALARM karbantartóknak és az iskolának",
    description: "Az admin felület: bejelentések listája, állapot, megjegyzés, termek és eszközök kezelése.",
    locale: "hu_HU",
    type: "website",
  },
};

const features = [
  {
    h: "Egy lista az összes bejelentésről",
    p: "Új, folyamatban lévő, megjavított és elutasított bejelentések egy helyen, állapot szerint szűrhetően. Minden állapotnál látod, hány bejelentés van.",
  },
  {
    h: "Pontos hely és eszköz",
    p: "A bejelentés tartalmazza a terem típusát és számát, az eszközt, a probléma típusát és a leírást. Nem kell visszakérdezned, melyik gép romlott el.",
  },
  {
    h: "Fénykép a hibáról",
    p: "Minden bejelentéshez kép tartozik, így indulás előtt látod a hibát, és tudod, milyen alkatrészt vagy szerszámot vigyél.",
  },
  {
    h: "Állapot és üzenet a bejelentőnek",
    p: "Átállíthatod az állapotot, és megjegyzést írhatsz, például hogy csütörtökön cseréled az alkatrészt. A bejelentő a követőkóddal látja ezt.",
  },
  {
    h: "Termek és eszközök kezelése",
    p: "A termek és az eszközök hozzáadhatók, kikapcsolhatók, és CSV-fájlból is betölthetők, leltári számmal együtt.",
  },
];

export default function Maintenance() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="eyebrow">Karbantartóknak és az iskolának</p>
          <h1>
            Egy helyen minden hiba, <em>pontos hellyel és képpel.</em>
          </h1>
          <p className="lead">
            A diákok és a tanárok telefonról jelentenek, te pedig egy listában látod, mi romlott el, hol, és hogyan néz ki. A javítás állapotát a bejelentő is követheti.
          </p>
          <div className="cta-row">
            <Link href="/admin" className="btn">Belépés az admin felületre</Link>
            <Link href="/bemutato" className="textlink">Vissza a bemutatóhoz</Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <p className="kicker">Mit tud az admin felület</p>
          <h2>Kevesebb kérdezgetés, gyorsabb javítás.</h2>
          <div className="cards three">
            {features.map((f) => (
              <article key={f.h} className="card">
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </article>
            ))}
          </div>
          <p className="note">A belépéshez fiók kell, amelyet az iskola üzemeltetője hoz létre. A bejelentők nem látják az admin felületet.</p>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2>Szeretnéd, ha a diákok is ide jelentenének?</h2>
          <p>A bejelentő űrlap telefonról, bejelentkezés nélkül használható. Érdemes plakáton vagy a teremben QR-kóddal kitenni.</p>
          <TrackedLink href="/" place="karbantartok" className="btn light">Kipróbálom a bejelentést</TrackedLink>
        </div>
      </section>
    </>
  );
}
