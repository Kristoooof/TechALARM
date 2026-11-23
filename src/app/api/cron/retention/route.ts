import { RETENTION } from "@/lib/org";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Napi karbantartás az adatmegőrzési szabályok szerint (Vercel Cron, vercel.json).
 * - Bejelentések: a tanév végéig + 1 évig maradnak. Egy tanév szeptember 1-jén kezdődik, ezért
 *   a legutóbb kezdődött tanév előtti tanévnél régebbi bejelentések törlődnek (a fényképpel együtt).
 * - Jóváhagyásra váró vagy elutasított regisztrációk: RETENTION.pendingRejectedDays nap után törlődnek.
 * A hívást a CRON_SECRET környezeti változó védi (a Vercel Bearer tokenként küldi). Ha nincs beállítva, nem fut le.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = createAdminClient();
  const now = new Date();
  const currentStartYear = now.getUTCMonth() >= 8 ? now.getUTCFullYear() : now.getUTCFullYear() - 1; // a legutóbbi szeptember 1.
  const reportCutoff = new Date(Date.UTC(currentStartYear - 1, 8, 1)).toISOString();

  let deletedReports = 0;
  for (;;) {
    const { data: old } = await db.from("reports").select("id, photo_path").lt("created_at", reportCutoff).limit(200);
    if (!old || old.length === 0) break;
    const paths = old.map((r) => r.photo_path).filter((p): p is string => Boolean(p));
    if (paths.length) await db.storage.from("report-photos").remove(paths);
    const { error } = await db.from("reports").delete().in("id", old.map((r) => r.id));
    if (error) {
      console.error("Bejelentések törlése sikertelen:", error.message);
      break;
    }
    deletedReports += old.length;
  }

  const profileCutoff = new Date(now.getTime() - RETENTION.pendingRejectedDays * 24 * 3600 * 1000).toISOString();
  const { data: stale } = await db.from("profiles").select("id").neq("status", "approved").lt("created_at", profileCutoff).limit(500);
  let deletedProfiles = 0;
  for (const p of stale ?? []) {
    await db.from("reports").update({ reporter_id: null, reporter_name: null }).eq("reporter_id", p.id);
    await db.from("data_requests").update({ requester_name: "törölt felhasználó" }).eq("profile_id", p.id);
    await db.from("profiles").delete().eq("id", p.id);
    await db.auth.admin.deleteUser(p.id);
    deletedProfiles++;
  }

  return Response.json({ reportCutoff, deletedReports, deletedProfiles });
}
