import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus } from "@/lib/constants";

export type Reporter = { id: string; fullName: string; email: string; status: ProfileStatus };

/** A bejelentkezett bejelentő (név, e-mail, jóváhagyási állapot). Ha nincs belépve, vagy a fióknak nincs bejelentői profilja (pl. admin), null. */
export async function getReporter(): Promise<Reporter | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("full_name, email, status").eq("id", user.id).maybeSingle();
  if (!p) return null;
  return { id: user.id, fullName: p.full_name, email: p.email, status: p.status as ProfileStatus };
}
