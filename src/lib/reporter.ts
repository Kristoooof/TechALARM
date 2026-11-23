import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus } from "@/lib/constants";

export type Reporter = { id: string; fullName: string; username: string; status: ProfileStatus };

/** A bejelentkezett bejelentő (név, jóváhagyási állapot). Ha nincs belépve, vagy a fióknak nincs bejelentői profilja (pl. admin), null. */
export async function getReporter(): Promise<Reporter | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("full_name, username, status").eq("id", user.id).maybeSingle();
  if (!p) return null;
  return { id: user.id, fullName: p.full_name, username: p.username, status: p.status as ProfileStatus };
}
