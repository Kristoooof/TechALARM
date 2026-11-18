import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Munkatársi szerepkörök. Az üzemeltető minden szerepkört magában foglal (az adatbázis így adja vissza). */
export type StaffRole = "operator" | "maintainer" | "approver";

/** Admin oldalak és műveletek védelme: belépés ÉS a megfelelő szerepkör kell. */
export async function requireRole(role: StaffRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await supabase.rpc("my_roles");
  const roles = (data ?? []) as StaffRole[];
  if (roles.length === 0) redirect("/admin/login?hiba=jogosultsag");
  if (!roles.includes(role)) redirect("/admin");
  return { supabase, user, roles };
}

/** A belépett munkatárs szerepkörei (üres, ha nincs belépve vagy nincs szerepköre). */
export async function getRoles(): Promise<StaffRole[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_roles");
  return (data ?? []) as StaffRole[];
}
