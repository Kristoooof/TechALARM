import { createClient } from "@supabase/supabase-js";

/** Névtelen (anon) kliens a publikus adatokhoz (termek, eszközök). Sütit nem használ. */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
