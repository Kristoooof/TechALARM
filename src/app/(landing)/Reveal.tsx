"use client";

import { useEffect } from "react";

/** A képernyő alatti elemeket finoman beúsztatja görgetéskor. Mozgáscsökkentésnél vagy JS nélkül minden azonnal látszik. */
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".lp .card, .lp .step, .lp .example, .lp .faq details, .lp .note-card, .lp .scene"),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el, i) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("rv");
        el.style.transitionDelay = `${(i % 3) * 90}ms`;
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);
  return null;
}
