import { randomInt } from "node:crypto";

// Félreérthető karakterek (0/O, 1/I/L) nélkül
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Pl. TA-K7M2-QX9P */
export function generateTrackingCode(): string {
  const pick = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `TA-${pick()}-${pick()}`;
}

/** A felhasználó által beírt kódot egységes alakra hozza; érvénytelen esetén null. */
export function normalizeTrackingCode(input: string): string | null {
  let s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.startsWith("TA")) s = s.slice(2);
  if (s.length !== 8) return null;
  return `TA-${s.slice(0, 4)}-${s.slice(4)}`;
}
