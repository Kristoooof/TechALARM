import { createPublicClient } from "@/lib/supabase/public";
import ReportForm from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ terem?: string }> }) {
  const { terem } = await searchParams;
  const db = createPublicClient();
  const [{ data: rooms, error: roomsError }, { data: devices, error: devicesError }] = await Promise.all([
    db.from("rooms").select("id, name").order("sort_order").order("name"),
    db.from("devices").select("id, room_id, name, inventory_code").order("name"),
  ]);

  return (
    <>
      <h1>Hibabejelentés</h1>
      <p className="lead">Elromlott eszköz vagy rongálás? Jelentsd be, hogy a karbantartók mielőbb intézkedhessenek. Nem kell bejelentkezni.</p>
      {roomsError || devicesError ? (
        <div className="alert error" role="alert">
          A termek listáját most nem sikerült betölteni. Kérlek, frissítsd az oldalt, vagy próbáld meg később.
        </div>
      ) : (
      <ReportForm
        rooms={rooms ?? []}
        devices={devices ?? []}
        initialRoomId={terem}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
      />
      )}
    </>
  );
}
