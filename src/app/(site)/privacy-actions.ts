"use server";

import { revalidatePath } from "next/cache";
import { getReporter } from "@/lib/reporter";
import { createAdminClient } from "@/lib/supabase/admin";

export type RequestState = { ok: boolean; message: string } | null;

const TYPES = ["hozzaferes", "helyesbites", "torles", "tiltakozas", "egyeb"] as const;
const MAX_OPEN = 5;

/** Adatkezelési kérelem (GDPR 15–21. cikk): a felhasználó a saját fiókjából nyújtja be, az üzemeltető kezeli. */
export async function submitDataRequest(_prev: RequestState, fd: FormData): Promise<RequestState> {
  const reporter = await getReporter();
  if (!reporter || reporter.status !== "approved") return { ok: false, message: "A kérelemhez be kell lépned." };

  const type = String(fd.get("type") ?? "");
  const message = String(fd.get("message") ?? "").trim();
  if (!(TYPES as readonly string[]).includes(type)) return { ok: false, message: "Válaszd ki a kérelem típusát." };
  if (message.length < 3 || message.length > 2000) return { ok: false, message: "Írd le röviden a kérelmedet (3–2000 karakter)." };

  const db = createAdminClient();
  const { count } = await db
    .from("data_requests")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", reporter.id)
    .eq("status", "open");
  if ((count ?? 0) >= MAX_OPEN) return { ok: false, message: "Már van néhány feldolgozás alatt lévő kérelmed. Várd meg a választ." };

  const { error } = await db.from("data_requests").insert({ profile_id: reporter.id, requester_name: reporter.fullName, type, message });
  if (error) {
    console.error("Kérelem mentési hiba:", error.message);
    return { ok: false, message: "A kérelmet nem sikerült elmenteni. Próbáld újra később." };
  }
  revalidatePath("/fiokom");
  return { ok: true, message: "A kérelmedet megkaptuk. A válaszra legfeljebb 1 hónapod (30 nap) van, a válasz ezen az oldalon jelenik meg." };
}
