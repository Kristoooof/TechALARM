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
