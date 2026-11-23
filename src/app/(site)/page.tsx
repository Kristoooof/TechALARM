import Link from "next/link";
import { getReporter } from "@/lib/reporter";
import { createPublicClient } from "@/lib/supabase/public";
import ReportForm from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ terem?: string; udv?: string }> }) {
  const { terem, udv } = await searchParams;
  const reporter = await getReporter();

  if (!reporter) {
    return (
      <>
        <h1>Hibabejelentés</h1>
        <p className="lead">Elromlott eszköz vagy rongálás? A bejelentéshez regisztráció és belépés kell.</p>
        <div className="card">
          <p>Regisztráció után azonnal bejelenthetsz hibát. Az admin jóváhagyásáig a bejelentéseid hitelesítetlenként jelennek meg. A bejelentéseidet a neveddel együtt tároljuk, a nevedet a karbantartó, az igazgató és az admin látja.</p>
          <div style={{ display: "grid", gap: 8 }}>
            <Link className="btn block" href="/belepes">Belépés</Link>
            <Link className="btn secondary block" href="/regisztracio">Regisztráció</Link>
          </div>
        </div>
      </>
    );
  }

  if (reporter.status === "rejected") {
    return (
      <>
        <h1>Hibabejelentés</h1>
        <div className="alert error" role="alert">A regisztrációdat az admin elutasította, ezért nem küldhetsz be bejelentést.</div>
      </>
    );
  }

  const db = createPublicClient();
  const [{ data: rooms, error: roomsError }, { data: devices, error: devicesError }] = await Promise.all([
    db.from("rooms").select("id, name").order("sort_order").order("name"),
    db.from("devices").select("id, room_id, name, inventory_code").order("name"),
  ]);

  return (
    <>
      <h1>Hibabejelentés</h1>
      {udv && <div className="alert success" role="status">Köszönjük a regisztrációt, már be is léptél. A felhasználóneved: <strong>{reporter.username}</strong> (ha több azonos nevű felhasználó van, ezzel tudsz belépni). Az admin jóváhagyásáig a bejelentéseid <strong>hitelesítetlenként</strong> jelennek meg, jóváhagyás után hitelesítetté válnak.</div>}
      <p className="lead">Elromlott eszköz vagy rongálás? Jelentsd be, hogy a karbantartók mielőbb intézkedhessenek.</p>
      {reporter.status === "pending" && !udv && (
        <p className="hint">A regisztrációdat az admin még nem hagyta jóvá, ezért a bejelentéseid hitelesítetlenként jelennek meg.</p>
      )}
      {roomsError || devicesError ? (
        <div className="alert error" role="alert">
          A termek listáját most nem sikerült betölteni. Kérlek, frissítsd az oldalt, vagy próbáld meg később.
        </div>
      ) : (
      <ReportForm
        rooms={rooms ?? []}
        devices={devices ?? []}
        initialRoomId={terem}
        reporterName={reporter.fullName}
      />
      )}
    </>
  );
}
