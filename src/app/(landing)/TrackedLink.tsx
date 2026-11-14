"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

/** A „Regisztrálok” gombok: a kattintást személyes adat nélkül számolja (konverzió-mérés). */
export default function TrackedLink({
  href,
  place,
  className,
  children,
}: {
  href: string;
  place: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track("regisztracio_gomb", { hely: place })}>
      {children}
    </Link>
  );
}
