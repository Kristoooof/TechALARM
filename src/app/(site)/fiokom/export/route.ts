import { getReporter } from "@/lib/reporter";
import { buildUserExport } from "@/lib/user-export";

export const dynamic = "force-dynamic";

/** A belépett felhasználó saját adatainak letöltése JSON fájlként. */
export async function GET() {
  const reporter = await getReporter();
  if (!reporter) return new Response("Be kell lépned.", { status: 401 });
  const data = await buildUserExport(reporter.id);
  if (!data) return new Response("Nem található adat.", { status: 404 });
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="techalarm-adataim.json"',
      "cache-control": "no-store",
    },
  });
}
