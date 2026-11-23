"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { NAME_MAX, NAME_MIN, NAME_RE, nameKey } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const uuid = (fd: FormData, k: string) => {
  const v = text(fd, k);
  if (!UUID_RE.test(v)) throw new Error("Érvénytelen azonosító.");
  return v;
};

export type StaffState = { ok: boolean; message: string } | null;

/** Név helyesbítése (GDPR 16. cikk): a profil és a korábbi bejelentések név-pillanatképe is frissül. Jóváhagyó vagy üzemeltető. */
export async function renameProfile(fd: FormData) {
  await requireRole("approver");
  const id = uuid(fd, "id");
  const name = text(fd, "name").replace(/\s+/g, " ");
  if (name.length < NAME_MIN || name.length > NAME_MAX || !NAME_RE.test(name)) {
    throw new Error(`A név ${NAME_MIN}–${NAME_MAX} karakter lehet, csak betűk, szóköz, pont és kötőjel.`);
  }
  const db = createAdminClient();
  const { error } = await db.from("profiles").update({ full_name: name, name_key: nameKey(name) }).eq("id", id);
  if (error) throw new Error(error.message);
  await db.from("reports").update({ reporter_name: name }).eq("reporter_id", id);
  revalidatePath("/admin/regisztraciok");
}

/** Fiók törlése és a bejelentések anonimizálása (GDPR 17. cikk). Csak üzemeltető. */
export async function eraseAccount(fd: FormData) {
  await requireRole("operator");
  const id = uuid(fd, "id");
  const db = createAdminClient();
  await db.from("reports").update({ reporter_id: null, reporter_name: null, reporter_username: null }).eq("reporter_id", id);
  await db.from("data_requests").update({ requester_name: "törölt felhasználó" }).eq("profile_id", id);
  const { error } = await db.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  const { error: authError } = await db.auth.admin.deleteUser(id);
  if (authError) console.error("Az auth felhasználó törlése nem sikerült:", authError.message);
  revalidatePath("/admin/regisztraciok");
  revalidatePath("/admin/adatkerelmek");
}

/** Adatkezelési kérelem lezárása a felhasználónak szóló válasszal. Csak üzemeltető. */
export async function handleRequest(fd: FormData) {
  await requireRole("operator");
  const id = uuid(fd, "id");
  const status = text(fd, "status");
  if (status !== "done" && status !== "rejected") throw new Error("Érvénytelen állapot.");
  const response = text(fd, "response").slice(0, 2000);
  if (!response) throw new Error("Írj választ a felhasználónak.");
  const { error } = await createAdminClient()
    .from("data_requests")
    .update({ status, response, handled_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/adatkerelmek");
}

// ---------- Munkatársak ----------

const ROLES = ["operator", "maintainer", "approver"] as const;

/** Szerepkör megadása egy regisztrált felhasználónak a felhasználóneve alapján (tanár, karbantartó, igazgató / admin). Csak üzemeltető. */
export async function assignRole(_prev: StaffState, fd: FormData): Promise<StaffState> {
  const { supabase } = await requireRole("operator");
  const username = text(fd, "username").toLowerCase();
  const role = text(fd, "role");
  if (!username) return { ok: false, message: "Add meg a felhasználónevet." };
  if (!(ROLES as readonly string[]).includes(role)) return { ok: false, message: "Válassz szerepkört." };

  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("id, full_name, status").ilike("username", username.replace(/[%_]/g, "")).maybeSingle();
  if (!profile) return { ok: false, message: "Nincs ilyen felhasználónév. Kérd meg a személyt, hogy előbb regisztráljon." };
  if (profile.status === "rejected") return { ok: false, message: "Elutasított regisztrációhoz nem adható szerepkör." };
  if (profile.status === "pending") {
    await db.from("profiles").update({ status: "approved", decided_at: new Date().toISOString() }).eq("id", profile.id);
  }
  const { error } = await supabase.rpc("grant_role", { p_user: profile.id, p_role: role });
  if (error) return { ok: false, message: "A szerepkör megadása nem sikerült." };
  revalidatePath("/admin/munkatarsak");
  revalidatePath("/admin/regisztraciok");
  return { ok: true, message: `${profile.full_name} megkapta a szerepkört. Legközelebb belépve az Admin menüpont jelenik meg neki.` };
}

export async function removeStaffRole(fd: FormData) {
  const { supabase } = await requireRole("operator");
  const user = uuid(fd, "user");
  const role = text(fd, "role");
  if (!(ROLES as readonly string[]).includes(role)) throw new Error("Érvénytelen szerepkör.");
  const { error } = await supabase.rpc("revoke_role", { p_user: user, p_role: role });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/munkatarsak");
}
