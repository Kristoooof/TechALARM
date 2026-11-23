/**
 * Az adatkezelő adatai az adatkezelési tájékoztatóhoz. Állítsd be a Vercel környezeti változóiban
 * (NEXT_PUBLIC_ORG_NAME, NEXT_PUBLIC_ORG_ADDRESS, NEXT_PUBLIC_DPO_NAME, NEXT_PUBLIC_DPO_CONTACT).
 * Amíg nincs kitöltve, a tájékoztatóban jól látható helyőrző jelenik meg.
 */
const val = (v: string | undefined, placeholder: string) => (v && v.trim() ? v.trim() : placeholder);

export const ORG = {
  name: val(process.env.NEXT_PUBLIC_ORG_NAME, "[az adatkezelő neve – kitöltendő]"),
  address: val(process.env.NEXT_PUBLIC_ORG_ADDRESS, "[az adatkezelő címe – kitöltendő]"),
  dpoName: val(process.env.NEXT_PUBLIC_DPO_NAME, "[az adatvédelmi tisztviselő neve – kitöltendő]"),
  dpoContact: val(process.env.NEXT_PUBLIC_DPO_CONTACT, "[az adatvédelmi tisztviselő elérhetősége – kitöltendő]"),
  filled: Boolean(process.env.NEXT_PUBLIC_ORG_NAME && process.env.NEXT_PUBLIC_DPO_CONTACT),
};

/** A tájékoztató verziója: ezt mentjük el a regisztrációkor. Módosításkor növeld. */
export const NOTICE_VERSION = "2026-11-24";

/** Megőrzési szabályok (a tájékoztató és a törlési feladat is ezt használja). */
export const RETENTION = {
  pendingRejectedDays: 90,
  reportsText: "a bejelentés tanévének végéig és az azt követő 1 évig",
  accountText: "az iskolai jogviszony megszűnéséig, de legfeljebb a tanév végi takarításig",
};
