import Link from "next/link";
import { getReporter } from "@/lib/reporter";
import { createPublicClient } from "@/lib/supabase/public";
import ReportForm from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ terem?: string }> }) {
  const { terem } = await searchParams;
  const reporter = await getReporter();

  if (!reporter) {
    return (
      <>
        <h1>Hibabejelentés</h1>
        <p className="lead">Elromlott eszköz vagy rongálás? A bejelentéshez regisztráció és belépés kell.</p>
        <div className="card">
          <p>A regisztrációt az admin hagyja jóvá, utána be tudsz lépni és hibát tudsz bejelenteni. A bejelentéseidet a neveddel együtt tároljuk, a nevedet az admin és a karbantartó látja.</p>
          <div style={{ display: "grid", gap: 8 }}>
            <Link className="btn block" href="/belepes">Belépés</Link>
            <Link className="btn secondary block" href="/regisztracio">Regisztráció</Link>
          </div>
        </div>
      </>
    );
  }

  if (reporter.status !== "approved") {
    return (
      <>
        <h1>Hibabejelentés</h1>
        <div className="alert error" role="alert">
          {reporter.status === "pending"
            ? "A regisztrációd még jóváhagyásra vár. Amint az admin elfogadta, itt tudsz bejelentést tenni."
            : "A regisztrációdat az admin elutasította, ezért nem küldhetsz be bejelentést."}
        </div>
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
      <p className="lead">Elromlott eszköz vagy rongálás? Jelentsd be, hogy a karbantartók mielőbb intézkedhessenek.</p>
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
