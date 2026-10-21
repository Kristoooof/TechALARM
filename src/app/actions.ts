"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTrackingCode } from "@/lib/tracking";
import { MAX_PHOTO_BYTES, MAX_REPORTS_PER_HOUR, ROOM_NUMBER_MAX, isCategory, isRoomNumber } from "@/lib/constants";

export type SubmitResult = { ok: true; code: string } | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (error: string): SubmitResult => ({ ok: false, error });

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY nincs beállítva – a bejelentések le vannak tiltva.");
    return false;
  }
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** A fájl első bájtjai alapján meghatározza a képtípust (a böngésző által küldött típusnak nem bízunk). */
function sniffImage(b: Uint8Array): { ext: string; mime: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: "png", mime: "image/png" };
  const riff = String.fromCharCode(...b.slice(0, 4));
  const webp = String.fromCharCode(...b.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return { ext: "webp", mime: "image/webp" };
  return null;
}

export async function submitReport(fd: FormData): Promise<SubmitResult> {
  // Csalogató rejtett mező: botok kitöltik. Úgy teszünk, mintha sikerült volna.
  if (str(fd, "website")) return { ok: true, code: "TA-0000-0000" };

  const roomId = str(fd, "room_id");
  const roomNumber = str(fd, "room_number").replace(/\s+/g, " ");
  const deviceChoice = str(fd, "device_id");
  const deviceText = str(fd, "device_text");
  const category = str(fd, "category");
  const description = str(fd, "description");
  const photo = fd.get("photo");

  if (!UUID_RE.test(roomId)) return fail("Válaszd ki a terem típusát.");
  if (!roomNumber) return fail("Írd be, melyik terem (pl. 1, 104).");
  if (roomNumber.length > ROOM_NUMBER_MAX || !isRoomNumber(roomNumber)) {
    return fail(`A terem száma legfeljebb ${ROOM_NUMBER_MAX} karakter lehet, és csak betűt, számot, szóközt, pontot, per- vagy kötőjelet tartalmazhat.`);
  }
  if (!deviceChoice) return fail("Válaszd ki az eszközt.");
  if (!isCategory(category)) return fail("Válaszd ki a bejelentés típusát.");
  if (description.length < 5) return fail("Írj egy rövid leírást (legalább 5 karakter).");
  if (description.length > 2000) return fail("A leírás legfeljebb 2000 karakter lehet.");
  if (deviceChoice === "egyeb" && (deviceText.length < 2 || deviceText.length > 100)) {
    return fail("Add meg az eszköz nevét (2–100 karakter).");
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "ismeretlen";

  if (!(await verifyTurnstile(str(fd, "cf-turnstile-response"), ip))) {
    return fail("A spamvédelmi ellenőrzés nem sikerült. Próbáld újra.");
  }

  const db = createAdminClient();
  const ipHash = createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? ""}${ip}`)
    .digest("hex");

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_REPORTS_PER_HOUR) {
    return fail("Egy órán belül túl sok bejelentést küldtél. Kérlek, próbáld később.");
  }

  const { data: room } = await db.from("rooms").select("id, name").eq("id", roomId).eq("active", true).maybeSingle();
  if (!room) return fail("A kiválasztott terem nem található.");

  let deviceId: string | null = null;
  let deviceName: string | null = null;
  if (deviceChoice === "egyeb") {
    deviceName = deviceText;
  } else if (deviceChoice !== "terem") {
    if (!UUID_RE.test(deviceChoice)) return fail("Érvénytelen eszköz.");
    const { data: device } = await db
      .from("devices")
      .select("id, name, inventory_code")
      .eq("id", deviceChoice)
      .eq("room_id", room.id)
      .eq("active", true)
      .maybeSingle();
    if (!device) return fail("A kiválasztott eszköz nem található ebben a teremben.");
    deviceId = device.id;
    deviceName = device.inventory_code ? `${device.name} (${device.inventory_code})` : device.name;
  }

  // Fénykép (kötelező)
  if (!(photo instanceof File) || photo.size === 0) return fail("Csatolj egy fényképet a hibáról.");
  if (photo.size > MAX_PHOTO_BYTES) return fail("A fénykép legfeljebb 5 MB lehet.");
  const photoBytes = new Uint8Array(await photo.arrayBuffer());
  const photoInfo = sniffImage(photoBytes);
  if (!photoInfo) return fail("Csak JPG, PNG vagy WebP kép tölthető fel.");

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTrackingCode();
    const photoPath = `${code}/${randomUUID()}.${photoInfo.ext}`;
    const { error: uploadError } = await db.storage
      .from("report-photos")
      .upload(photoPath, photoBytes, { contentType: photoInfo.mime });
    if (uploadError) {
      console.error("Fotófeltöltési hiba:", uploadError.message);
      return fail("A fénykép feltöltése nem sikerült. Próbáld újra.");
    }

    const { error } = await db.from("reports").insert({
      tracking_code: code,
      room_id: room.id,
      device_id: deviceId,
      room_name: room.name,
      room_number: roomNumber,
      device_name: deviceName,
      category,
      description,
      photo_path: photoPath,
      ip_hash: ipHash,
    });

    if (!error) return { ok: true, code };

    await db.storage.from("report-photos").remove([photoPath]);
    if (error.code !== "23505") {
      console.error("Bejelentés mentési hiba:", error.message);
      return fail("A bejelentést nem sikerült elmenteni. Próbáld újra később.");
    }
    // Követőkód-ütközés: új kóddal újrapróbáljuk
  }
  return fail("A bejelentést nem sikerült elmenteni. Próbáld újra később.");
}
