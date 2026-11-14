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
/** Ennyi bejelentést tehet egy bejelentő egy óra alatt. */
export const MAX_REPORTS_PER_HOUR = 5;

export const statusLabel = (v: string): string => (isStatus(v) ? STATUSES[v] : v);
export const categoryLabel = (v: string): string => (isCategory(v) ? CATEGORIES[v] : v);

/** A teremszám / terem jele (pl. „1”, „104”, „A12”, „2/b”): betű, szám, szóköz, pont, per- és kötőjel. */
export const ROOM_NUMBER_MAX = 20;
export const ROOM_NUMBER_RE = /^[\p{L}\p{N}][\p{L}\p{N} ./\-]*$/u;
export const isRoomNumber = (v: string): boolean => v.length >= 1 && v.length <= ROOM_NUMBER_MAX && ROOM_NUMBER_RE.test(v);

/** A teremtípus és a terem száma együtt, pl. „Informatika terem – 104”. */
export const roomLabel = (name: string, number?: string | null): string => (number ? `${name} – ${number}` : name);

/** Bejelentői fiókok állapota: az admin hagyja jóvá a regisztrációt. */
export const PROFILE_STATUSES = {
  pending: "Jóváhagyásra vár",
  approved: "Jóváhagyva",
  rejected: "Elutasítva",
} as const;
export type ProfileStatus = keyof typeof PROFILE_STATUSES;
export const isProfileStatus = (v: unknown): v is ProfileStatus => typeof v === "string" && v in PROFILE_STATUSES;
export const profileStatusLabel = (v: string): string => (isProfileStatus(v) ? PROFILE_STATUSES[v] : v);

export const NAME_MIN = 2;
export const NAME_MAX = 100;
/** Betűk, szóköz, pont, kötőjel, aposztróf: a teljes név ellenőrzéséhez. */
export const NAME_RE = /^[\p{L}][\p{L} .'’-]*$/u;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
/** A név egyedi azonosításhoz: szóközök összevonva, kisbetűsítve. */
export const nameKey = (name: string): string => name.trim().replace(/\s+/g, " ").toLowerCase();
