import { getRoles } from "@/lib/auth";
import { buildUserExport } from "@/lib/user-export";

export const dynamic = "force-dynamic";

/** Egy felhasználó adatainak letöltése az adatkezelési kérelem teljesítéséhez. Csak üzemeltető. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getRoles()).includes("operator")) return new Response("Nincs jogosultságod.", { status: 403 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Érvénytelen azonosító.", { status: 400 });
  const data = await buildUserExport(id);
  if (!data) return new Response("Nem található adat.", { status: 404 });
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="techalarm-felhasznalo-adatai.json"',
      "cache-control": "no-store",
    },
  });
}
