import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Egy felhasználó összes tárolt adata (GDPR 15. és 20. cikk szerinti másolathoz). A fényképek 1 órás, aláírt hivatkozásként szerepelnek. */
export async function buildUserExport(profileId: string) {
  const db = createAdminClient();
  const [{ data: profile }, { data: reports }, { data: requests }] = await Promise.all([
    db.from("profiles").select("full_name, username, status, created_at, decided_at, notice_version, notice_accepted_at").eq("id", profileId).maybeSingle(),
    db
      .from("reports")
      .select("tracking_code, room_name, room_number, device_name, category, description, status, admin_note, photo_path, created_at, updated_at")
      .eq("reporter_id", profileId)
      .order("created_at", { ascending: false }),
    db.from("data_requests").select("type, message, status, response, created_at, due_at, handled_at").eq("profile_id", profileId).order("created_at", { ascending: false }),
  ]);
  if (!profile) return null;

  const withPhotos = await Promise.all(
    (reports ?? []).map(async ({ photo_path, ...r }) => {
      if (!photo_path) return { ...r, photo_url_1_ora: null };
      const { data } = await db.storage.from("report-photos").createSignedUrl(photo_path, 3600);
      return { ...r, photo_url_1_ora: data?.signedUrl ?? null };
    }),
  );

  return {
    exportalva: new Date().toISOString(),
    megjegyzes: "A TechALARM által rólad tárolt adatok. A jelszavad nem olvasható formában tárolódik, ezért nem szerepel itt.",
    profil: profile,
    bejelentesek: withPhotos,
    adatkezelesi_kerelmek: requests ?? [],
  };
}
