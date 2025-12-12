"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type TrackerEvent = {
  event: string;
  route: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  meta?: Record<string, unknown>;
};

async function sendEvent(data: TrackerEvent) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn("[analytics] failed to send", err);
  }
}

function getUtmParams(searchParams: URLSearchParams) {
  return {
    utm_source: searchParams.get("utm_source"),
    utm_medium: searchParams.get("utm_medium"),
    utm_campaign: searchParams.get("utm_campaign"),
  };
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const current = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    if (pathname.startsWith("/admin")) return; // avoid logging admin traffic
    if (lastPath.current === current) return;
    lastPath.current = current;

    const utm = searchParams ? getUtmParams(searchParams) : {};

    sendEvent({
      event: "page_view",
      route: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      ...utm,
    });
  }, [pathname, searchParams]);

  return null;
}
