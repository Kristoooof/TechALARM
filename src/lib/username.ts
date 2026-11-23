import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** A névből felhasználónév-alap: ékezetek nélkül, kisbetűvel, szavak pontokkal elválasztva (pl. „Kovács Sándor” → „kovacs.sandor”). */
export function usernameBase(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return (base || "felhasznalo").slice(0, 40);
}

/** Az első szabad felhasználónév: kovacs.sandor, kovacs.sandor2, kovacs.sandor3, … */
export async function nextUsername(db: SupabaseClient, name: string): Promise<string> {
  const base = usernameBase(name);
  const { data } = await db.from("profiles").select("username").ilike("username", `${base}%`);
  const taken = new Set((data ?? []).map((r: { username: string }) => r.username.toLowerCase()));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 10000; i++) {
    if (!taken.has(`${base}${i}`)) return `${base}${i}`;
  }
  return `${base}.${Date.now()}`;
}
