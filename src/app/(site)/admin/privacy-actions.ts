"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { NAME_MAX, NAME_MIN, NAME_RE, PASSWORD_MAX, PASSWORD_MIN, nameKey } from "@/lib/constants";
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
  const key = nameKey(name);
  const { data: clash } = await db.from("profiles").select("id").eq("name_key", key).neq("id", id).maybeSingle();
  if (clash) throw new Error("Ezzel a névvel már van regisztráció.");
  const { error } = await db.from("profiles").update({ full_name: name, name_key: key }).eq("id", id);
  if (error) throw new Error(error.message);
  await db.from("reports").update({ reporter_name: name }).eq("reporter_id", id);
  revalidatePath("/admin/regisztraciok");
}

/** Fiók törlése és a bejelentések anonimizálása (GDPR 17. cikk). Csak üzemeltető. */
export async function eraseAccount(fd: FormData) {
  await requireRole("operator");
  const id = uuid(fd, "id");
  const db = createAdminClient();
  await db.from("reports").update({ reporter_id: null, reporter_name: null }).eq("reporter_id", id);
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

export async function createStaff(_prev: StaffState, fd: FormData): Promise<StaffState> {
  const { supabase } = await requireRole("operator");
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = text(fd, "role");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, message: "Adj meg érvényes e-mail címet." };
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return { ok: false, message: `A jelszó ${PASSWORD_MIN}–${PASSWORD_MAX} karakter legyen.` };
  if (!(ROLES as readonly string[]).includes(role)) return { ok: false, message: "Válassz szerepkört." };

  const db = createAdminClient();
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) {
    const exists = error && /already|exists|registered/i.test(error.message);
    return { ok: false, message: exists ? "Ezzel az e-mail címmel már van fiók. Szerepkört a listában adhatsz neki." : "A fiókot nem sikerült létrehozni." };
  }
  const { error: grantError } = await supabase.rpc("grant_role", { p_user: data.user.id, p_role: role });
  if (grantError) {
    await db.auth.admin.deleteUser(data.user.id);
    return { ok: false, message: "A szerepkör megadása nem sikerült." };
  }
  revalidatePath("/admin/munkatarsak");
  return { ok: true, message: `A fiók létrejött: ${email}. A jelszót add át neki biztonságos módon.` };
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
