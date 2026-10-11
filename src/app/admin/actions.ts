"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isStatus } from "@/lib/constants";

export type FormState = { ok: boolean; message: string; email?: string } | null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const uuid = (fd: FormData, k: string) => {
  const v = text(fd, k);
  if (!UUID_RE.test(v)) throw new Error("Érvénytelen azonosító.");
  return v;
};

// ---------- Belépés / kilépés ----------

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email");
  const password = String(fd.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: "Hibás e-mail cím vagy jelszó.", email };
  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, message: "Ehhez a fiókhoz nincs admin jogosultság.", email };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Bejelentések ----------

export async function updateReport(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid(fd, "id");
  const status = text(fd, "status");
  if (!isStatus(status)) throw new Error("Érvénytelen státusz.");
  const note = text(fd, "admin_note").slice(0, 1000);
  const { error } = await supabase.from("reports").update({ status, admin_note: note || null }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
}

export async function deleteReport(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid(fd, "id");
  const { data: report } = await supabase.from("reports").select("photo_path").eq("id", id).maybeSingle();
  if (report?.photo_path) await supabase.storage.from("report-photos").remove([report.photo_path]);
  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  redirect("/admin");
}

// ---------- Termek és eszközök ----------

export async function addRoom(fd: FormData) {
  const { supabase } = await requireAdmin();
  const name = text(fd, "name").slice(0, 100);
  if (!name) return;
  const { data: last } = await supabase.from("rooms").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const { error } = await supabase.from("rooms").insert({ name, sort_order: (last?.[0]?.sort_order ?? 0) + 1 });
  if (error) throw new Error(error.code === "23505" ? "Már van ilyen nevű terem." : error.message);
  revalidatePath("/admin/helyek");
}

export async function toggleRoom(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("rooms").update({ active: text(fd, "active") === "true" }).eq("id", uuid(fd, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/helyek");
}

export async function deleteRoom(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("rooms").delete().eq("id", uuid(fd, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/helyek");
}

export async function addDevice(fd: FormData) {
  const { supabase } = await requireAdmin();
  const name = text(fd, "name").slice(0, 100);
  if (!name) return;
  const code = text(fd, "inventory_code").slice(0, 50);
  const { error } = await supabase.from("devices").insert({ room_id: uuid(fd, "room_id"), name, inventory_code: code || null });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/helyek");
}

export async function toggleDevice(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("devices").update({ active: text(fd, "active") === "true" }).eq("id", uuid(fd, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/helyek");
}

export async function deleteDevice(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("devices").delete().eq("id", uuid(fd, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/helyek");
}

// ---------- CSV import ----------

/** Egyszerű CSV-elemző: idézőjeles mezők, vessző / pontosvessző / tabulátor elválasztó. */
function parseCsv(input: string): string[][] {
  const src = input.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = [";", "\t", ","].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(cell.trim()); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell.trim()); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export async function importCsv(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Válassz ki egy CSV fájlt." };
  if (file.size > 1024 * 1024) return { ok: false, message: "A fájl túl nagy (max. 1 MB)." };

  let rows = parseCsv(await file.text());
  if (rows.length && /terem|hely|labor/i.test(rows[0][0] ?? "")) rows = rows.slice(1); // fejléc
  rows = rows.filter((r) => r[0] && r[1]);
  if (rows.length === 0) return { ok: false, message: "Nem találtam feldolgozható sort. Oszlopok: terem; eszköz; leltári szám." };
  if (rows.length > 2000) return { ok: false, message: "Legfeljebb 2000 sor importálható egyszerre." };

  const { data: existingRooms } = await supabase.from("rooms").select("id, name, sort_order");
  const roomIds = new Map((existingRooms ?? []).map((r) => [r.name as string, r.id as string]));
  let nextSort = Math.max(0, ...(existingRooms ?? []).map((r) => r.sort_order as number)) + 1;

  const newRooms = [...new Set(rows.map((r) => r[0].slice(0, 100)))].filter((n) => !roomIds.has(n));
  if (newRooms.length) {
    const { data, error } = await supabase
      .from("rooms")
      .insert(newRooms.map((name) => ({ name, sort_order: nextSort++ })))
      .select("id, name");
    if (error) return { ok: false, message: `Termek mentése sikertelen: ${error.message}` };
    data.forEach((r) => roomIds.set(r.name, r.id));
  }

  const { data: existingDevices } = await supabase.from("devices").select("room_id, name, inventory_code");
  const seen = new Set((existingDevices ?? []).map((d) => `${d.room_id}|${d.name}|${d.inventory_code ?? ""}`));
  const toInsert: { room_id: string; name: string; inventory_code: string | null }[] = [];
  for (const r of rows) {
    const room_id = roomIds.get(r[0].slice(0, 100))!;
    const name = r[1].slice(0, 100);
    const inventory_code = r[2] ? r[2].slice(0, 50) : null;
    const key = `${room_id}|${name}|${inventory_code ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    toInsert.push({ room_id, name, inventory_code });
  }
  if (toInsert.length) {
    const { error } = await supabase.from("devices").insert(toInsert);
    if (error) return { ok: false, message: `Eszközök mentése sikertelen: ${error.message}` };
  }

  revalidatePath("/admin/helyek");
  return { ok: true, message: `Kész: ${newRooms.length} új terem, ${toInsert.length} új eszköz (${rows.length - toInsert.length} sor már létezett).` };
}
