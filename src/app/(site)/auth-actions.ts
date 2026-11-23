"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NAME_MAX, NAME_MIN, NAME_RE, PASSWORD_MAX, PASSWORD_MIN, nameKey } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NOTICE_VERSION } from "@/lib/org";
import { verifyTurnstile } from "@/lib/turnstile";

export type AuthState = { ok: boolean; message: string; name?: string } | null;

const field = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const cleanName = (v: string) => v.replace(/\s+/g, " ");

// ---------- Regisztráció ----------

export async function register(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (field(fd, "website")) return { ok: true, message: "Köszönjük, a regisztrációd megérkezett." }; // csalimező

  const name = cleanName(field(fd, "name"));
  const password = String(fd.get("password") ?? "");
  const password2 = String(fd.get("password2") ?? "");
  const fail = (message: string): AuthState => ({ ok: false, message, name });

  if (name.length < NAME_MIN || name.length > NAME_MAX || !NAME_RE.test(name)) {
    return fail(`Add meg a teljes neved (${NAME_MIN}–${NAME_MAX} karakter, csak betűk, szóköz, pont és kötőjel).`);
  }
  if (password.length < PASSWORD_MIN) return fail(`A jelszó legalább ${PASSWORD_MIN} karakter legyen.`);
  if (password.length > PASSWORD_MAX) return fail(`A jelszó legfeljebb ${PASSWORD_MAX} karakter lehet.`);
  if (password !== password2) return fail("A két jelszó nem egyezik.");
  if (fd.get("notice") !== "on") return fail("A regisztrációhoz el kell olvasnod és tudomásul kell venned az adatkezelési tájékoztatót.");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "ismeretlen";
  if (!(await verifyTurnstile(field(fd, "cf-turnstile-response"), ip))) {
    return fail("A spamvédelmi ellenőrzés nem sikerült. Próbáld újra.");
  }

  const db = createAdminClient();
  const key = nameKey(name);
  const taken = "Ezzel a névvel már van regisztráció. Ha te vagy, lépj be. Ha másik személy, adj meg pontosabb nevet (például a második keresztneveddel vagy az osztályoddal).";
  const { data: existing } = await db.from("profiles").select("id").eq("name_key", key).maybeSingle();
  if (existing) return fail(taken);

  // A Supabase Auth belső azonosítót kap, a felhasználó e-mail címet nem ad meg.
  const loginEmail = `${randomUUID()}@felhasznalo.techalarm.invalid`;
  const { data, error } = await db.auth.admin.createUser({
    email: loginEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error || !data.user) {
    console.error("Regisztrációs hiba:", error?.message);
    return fail("A regisztrációt nem sikerült elmenteni. Próbáld újra később.");
  }

  const { error: profileError } = await db
    .from("profiles")
    .insert({
      id: data.user.id,
      full_name: name,
      name_key: key,
      login_email: loginEmail,
      notice_version: NOTICE_VERSION,
      notice_accepted_at: new Date().toISOString(),
    });
  if (profileError) {
    await db.auth.admin.deleteUser(data.user.id);
    if (profileError.code === "23505") return fail(taken); // közben valaki ugyanezt a nevet regisztrálta
    console.error("Profil mentési hiba:", profileError.message);
    return fail("A regisztrációt nem sikerült elmenteni. Próbáld újra később.");
  }

  // Regisztráció után azonnal be is léptetjük, hogy rögtön lehessen bejelenteni (az admin felületen hitelesítetlenként jelenik meg).
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
  if (signInError) return { ok: true, message: "Köszönjük, a regisztrációd megérkezett. Lépj be a neveddel és a jelszavaddal.", name };
  redirect("/?udv=1");
}

// ---------- Belépés / kilépés ----------

export async function loginReporter(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const name = cleanName(field(fd, "name"));
  const password = String(fd.get("password") ?? "");
  const fail = (message: string): AuthState => ({ ok: false, message, name });
  const wrong = "Hibás név vagy jelszó.";

  if (!name || !password) return fail(wrong);
  const { data: found } = await createAdminClient()
    .from("profiles")
    .select("login_email")
    .eq("name_key", nameKey(name))
    .maybeSingle();
  if (!found) return fail(wrong);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: found.login_email, password });
  if (error || !data.user) return fail(wrong);

  const { data: profile } = await supabase.from("profiles").select("status").eq("id", data.user.id).maybeSingle();
  if (!profile) {
    await supabase.auth.signOut();
    return fail(wrong);
  }
  if (profile.status === "rejected") {
    await supabase.auth.signOut();
    return fail("A regisztrációdat az admin elutasította.");
  }
  redirect("/");
}

export async function logoutReporter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
