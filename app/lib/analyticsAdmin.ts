import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import type { AnalyticsSummary } from "@/app/types/analytics";

const DEFAULT_SUMMARY: AnalyticsSummary = {
  since: "",
  totals: {
    all: 0,
    page_view: 0,
    claim_click: 0,
    claim_submit: 0,
    new_submit: 0,
    outbound_click: 0,
    blog_reaction: 0,
    blog_scroll: 0,
  },
  topRoutes: [],
  topEvents: [],
};

export async function getAnalyticsSummary(
  days = 30
): Promise<AnalyticsSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabaseAdmin
    .from("analytics_events")
    .select("event, route, created_at")
    .gte("created_at", since);

  if (error || !data) {
    console.warn("[analytics] Unable to load summary:", error?.message);
    return { ...DEFAULT_SUMMARY, since };
  }

  const totals: AnalyticsSummary["totals"] = {
    all: data.length,
    page_view: 0,
    claim_click: 0,
    claim_submit: 0,
    new_submit: 0,
    outbound_click: 0,
    blog_reaction: 0,
    blog_scroll: 0,
  };

  const routeCounts: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};

  data.forEach((row) => {
    const evt = (row.event || "unknown") as keyof typeof totals;
    if (evt in totals) {
      const key = evt as keyof typeof totals;
      totals[key] = (totals[key] || 0) + 1;
    }
    eventCounts[evt] = (eventCounts[evt] || 0) + 1;

    const route = row.route || "(none)";
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });

  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([route, count]) => ({ route, count }));

  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([event, count]) => ({ event, count }));

  return {
    since,
    totals,
    topRoutes,
    topEvents,
  };
}
