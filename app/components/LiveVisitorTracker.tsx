"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId() {
  try {
    const existing = window.localStorage.getItem("wp_live_session_id");
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem("wp_live_session_id", id);
    return id;
  } catch {
    // localStorage may be blocked; fall back to in-memory id.
    return `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export default function LiveVisitorTracker() {
  const pathname = usePathname();
  const sessionId = useMemo(
    () => (typeof window !== "undefined" ? getOrCreateSessionId() : ""),
    []
  );
  const lastRouteRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  async function send(route: string) {
    try {
      await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          route,
          referrer: typeof document !== "undefined" ? document.referrer : null,
        }),
      });
    } catch {
      // best-effort
    }
  }

  useEffect(() => {
    if (!pathname) return;
    if (!sessionId) return;
    if (pathname.startsWith("/admin")) return;

    if (lastRouteRef.current !== pathname) {
      lastRouteRef.current = pathname;
      send(pathname);
    }

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    // Keep the visitor marked as active while they stay on the page.
    timerRef.current = window.setInterval(() => {
      send(pathname);
    }, 25_000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [pathname, sessionId]);

  return null;
}

