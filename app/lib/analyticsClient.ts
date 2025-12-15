"use client";

type AnalyticsEvent =
  | "page_view"
  | "directory_filter"
  | "directory_outbound_click"
  | "directory_form_submit"
  | "claim_click"
  | "claim_submit"
  | "new_submit"
  | "outbound_click"
  | "blog_reaction"
  | "blog_scroll";

export async function trackEvent(
  event: AnalyticsEvent,
  meta: Record<string, unknown> = {}
) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        route: typeof window !== "undefined" ? window.location.pathname : "",
        referrer: typeof document !== "undefined" ? document.referrer : null,
        meta,
      }),
    });
  } catch (err) {
    console.warn("[analytics] trackEvent failed", err);
  }
}
