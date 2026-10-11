import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service role kliens: megkerüli az RLS-t. KIZÁRÓLAG szerveroldali kódban használd,
 * a névtelen bejelentések beírásához és a követőkód alapú lekérdezéshez.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Hiányzik a SUPABASE_SERVICE_ROLE_KEY környezeti változó.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
