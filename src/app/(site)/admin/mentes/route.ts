import { getRoles } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Teljes adatmentés JSON-ban (az ingyenes Supabase-csomagban nincs automatikus mentés). A fényképek nem szerepelnek benne. Csak üzemeltető. */
export async function GET() {
  if (!(await getRoles()).includes("operator")) return new Response("Nincs jogosultságod.", { status: 403 });
  const db = createAdminClient();
  const [rooms, devices, reports, profiles, requests] = await Promise.all([
    db.from("rooms").select("*"),
    db.from("devices").select("*"),
    db.from("reports").select("*"),
    db.from("profiles").select("id, full_name, status, created_at, decided_at, notice_version, notice_accepted_at"),
    db.from("data_requests").select("*"),
  ]);
  const dump = {
    mentve: new Date().toISOString(),
    megjegyzes: "A fényképek (Supabase Storage) és a jelszavak nem részei a mentésnek. Bizalmas adat, biztonságos helyen tárold.",
    rooms: rooms.data, devices: devices.data, reports: reports.data, profiles: profiles.data, data_requests: requests.data,
  };
  return new Response(JSON.stringify(dump, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="techalarm-mentes-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
