"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

/** A „Hibát jelentek” gomb: a kattintást névtelenül, személyes adat nélkül számolja (konverzió-mérés). */
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
    <Link href={href} className={className} onClick={() => track("hibat_jelentek_gomb", { hely: place })}>
      {children}
    </Link>
  );
}
