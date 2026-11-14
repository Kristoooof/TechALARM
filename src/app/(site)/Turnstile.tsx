"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile explicit renderelés: a token a callbackben érkezik meg,
 * a resetKey növelésére új tokent kér. A scriptet (api.js?render=explicit) a szülő tölti be.
 */
export default function Turnstile({
  siteKey,
  onToken,
  resetKey,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const mount = () => {
      const el = containerRef.current;
      if (cancelled || !el || !window.turnstile || widgetId.current) return widgetId.current !== null;
      widgetId.current = window.turnstile.render(el, {
        sitekey: siteKey,
        language: "hu",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
      return true;
    };

    // A script késve is megérkezhet: addig várunk rá
    if (!mount()) {
      timer = setInterval(() => {
        if (mount()) clearInterval(timer);
      }, 200);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          // már eltávolították
        }
      }
      widgetId.current = null;
      onTokenRef.current(null);
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetKey === 0 || !widgetId.current) return;
    onTokenRef.current(null);
    try {
      window.turnstile?.reset(widgetId.current);
    } catch {
      // ha a widget közben eltűnt, a következő renderelés új tokent ad
    }
  }, [resetKey]);

  return <div ref={containerRef} />;
}
