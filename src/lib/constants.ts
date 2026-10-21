export const CATEGORIES = {
  elromlott: "Elromlott / nem működik",
  rongalas: "Rongálás",
  hianyzik: "Hiányzik / eltűnt",
  egyeb: "Egyéb",
} as const;

export const STATUSES = {
  uj: "Új",
  folyamatban: "Folyamatban",
  megjavitva: "Megjavítva / elintézve",
  elutasitva: "Elutasítva",
} as const;

export type Category = keyof typeof CATEGORIES;
export type Status = keyof typeof STATUSES;

export const isCategory = (v: unknown): v is Category => typeof v === "string" && v in CATEGORIES;
export const isStatus = (v: unknown): v is Status => typeof v === "string" && v in STATUSES;

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** Ennyi bejelentést tehet egy IP-cím egy óra alatt. */
export const MAX_REPORTS_PER_HOUR = 5;

export const statusLabel = (v: string): string => (isStatus(v) ? STATUSES[v] : v);
export const categoryLabel = (v: string): string => (isCategory(v) ? CATEGORIES[v] : v);

/** A teremszám / terem jele (pl. „1”, „104”, „A12”, „2/b”): betű, szám, szóköz, pont, per- és kötőjel. */
export const ROOM_NUMBER_MAX = 20;
export const ROOM_NUMBER_RE = /^[\p{L}\p{N}][\p{L}\p{N} ./\-]*$/u;
export const isRoomNumber = (v: string): boolean => v.length >= 1 && v.length <= ROOM_NUMBER_MAX && ROOM_NUMBER_RE.test(v);

/** A teremtípus és a terem száma együtt, pl. „Informatika terem – 104”. */
export const roomLabel = (name: string, number?: string | null): string => (number ? `${name} – ${number}` : name);
