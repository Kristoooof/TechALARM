"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EMAIL_RE, NAME_MAX, NAME_MIN, NAME_RE, PASSWORD_MAX, PASSWORD_MIN } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";

export type AuthState = { ok: boolean; message: string; email?: string; name?: string } | null;

const field = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

// ---------- Regisztráció ----------

export async function register(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (field(fd, "website")) return { ok: true, message: "Köszönjük, a regisztrációd megérkezett." }; // csalimező

  const name = field(fd, "name").replace(/\s+/g, " ");
  const email = field(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const password2 = String(fd.get("password2") ?? "");
  const keep = { email, name };
  const fail = (message: string): AuthState => ({ ok: false, message, ...keep });

  if (name.length < NAME_MIN || name.length > NAME_MAX || !NAME_RE.test(name)) {
    return fail(`Add meg a teljes neved (${NAME_MIN}–${NAME_MAX} karakter, csak betűk, szóköz, pont és kötőjel).`);
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) return fail("Add meg érvényes e-mail címet.");
  if (password.length < PASSWORD_MIN) return fail(`A jelszó legalább ${PASSWORD_MIN} karakter legyen.`);
  if (password.length > PASSWORD_MAX) return fail(`A jelszó legfeljebb ${PASSWORD_MAX} karakter lehet.`);
  if (password !== password2) return fail("A két jelszó nem egyezik.");
  if (fd.get("consent") !== "on") return fail("A regisztrációhoz el kell fogadnod az adatkezelést.");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "ismeretlen";
  if (!(await verifyTurnstile(field(fd, "cf-turnstile-response"), ip))) {
    return fail("A spamvédelmi ellenőrzés nem sikerült. Próbáld újra.");
  }

  const db = createAdminClient();
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // az e-mail-címet nem levélben, hanem az admin jóváhagyása erősíti meg
    user_metadata: { full_name: name },
  });
  if (error || !data.user) {
    if (error && /already|exists|registered/i.test(error.message)) return fail("Ezzel az e-mail címmel már van regisztráció.");
    console.error("Regisztrációs hiba:", error?.message);
    return fail("A regisztrációt nem sikerült elmenteni. Próbáld újra később.");
  }

  const { error: profileError } = await db.from("profiles").insert({ id: data.user.id, full_name: name, email });
  if (profileError) {
    console.error("Profil mentési hiba:", profileError.message);
    await db.auth.admin.deleteUser(data.user.id);
    return fail("A regisztrációt nem sikerült elmenteni. Próbáld újra később.");
  }

  return { ok: true, message: "Köszönjük, a regisztrációd megérkezett.", email };
}

// ---------- Belépés / kilépés ----------

export async function loginReporter(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = field(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const fail = (message: string): AuthState => ({ ok: false, message, email });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return fail("Hibás e-mail cím vagy jelszó.");

  const { data: profile } = await supabase.from("profiles").select("status").eq("id", data.user.id).maybeSingle();
  if (!profile) {
    await supabase.auth.signOut();
    return fail("Ehhez a fiókhoz nincs bejelentői regisztráció. Admin belépés: /admin/login.");
  }
  if (profile.status === "pending") {
    await supabase.auth.signOut();
    return fail("A regisztrációd még jóváhagyásra vár. Amint az admin elfogadta, be tudsz lépni.");
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
