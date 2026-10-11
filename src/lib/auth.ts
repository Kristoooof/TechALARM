import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Admin oldalak és műveletek védelme: belépés ÉS admin jogosultság kell. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/admin/login?hiba=jogosultsag");
  return { supabase, user };
}
