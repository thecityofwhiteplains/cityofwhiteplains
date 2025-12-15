import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import type { AnalyticsSummary } from "@/app/types/analytics";

const DEFAULT_SUMMARY: AnalyticsSummary = {
  since: "",
  totals: {
    all: 0,
    page_view: 0,
    directory_filter: 0,
    directory_outbound_click: 0,
    directory_form_submit: 0,
    claim_click: 0,
    claim_submit: 0,
    new_submit: 0,
    outbound_click: 0,
    blog_reaction: 0,
    blog_scroll: 0,
  },
  topRoutes: [],
  topEvents: [],
  topCountries: [],
  topRouteLocations: [],
};

type SummaryOptions =
  | { days: number }
  | { startDate: string; endDate?: string }
  | undefined;

export async function getAnalyticsSummary(
  options: SummaryOptions = { days: 30 }
): Promise<AnalyticsSummary> {
  const now = new Date();
  const todayIso = now.toISOString().split("T")[0];
  let since = todayIso;
  let until: string | undefined;

  if ("startDate" in (options || {})) {
    since = (options as any).startDate || todayIso;
    until = (options as any).endDate || todayIso;
  } else {
    const days = (options as any)?.days ?? 30;
    since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    until = todayIso;
  }

  let query = supabaseAdmin
    .from("analytics_events")
    .select("event, route, created_at, meta")
    .gte("created_at", since);

  if (until) {
    const untilIso = new Date(`${until}T23:59:59.999Z`).toISOString();
    query = query.lte("created_at", untilIso);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.warn("[analytics] Unable to load summary:", error?.message);
    return { ...DEFAULT_SUMMARY, since, until };
  }

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const totals: AnalyticsSummary["totals"] = {
    all: data.length,
    page_view: 0,
    directory_filter: 0,
    directory_outbound_click: 0,
    directory_form_submit: 0,
    claim_click: 0,
    claim_submit: 0,
    new_submit: 0,
    outbound_click: 0,
    blog_reaction: 0,
    blog_scroll: 0,
  };

  const routeCounts: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const countryCounts: Record<
    string,
    { count: number; code: string | null; name: string | null }
  > = {};
  const routeLocationCounts: Record<
    string,
    { count: number; countryCode: string | null; countryName: string | null }
  > = {};

  const formatCountry = (code?: string | null, name?: string | null) => {
    if (name && name.trim().length > 0) return name;
    if (code && code.trim().length > 0) {
      return (
        regionNames.of(code.trim().toUpperCase()) ||
        code.trim().toUpperCase()
      );
    }
    return "Unknown";
  };

  data.forEach((row) => {
    const evt = (row.event || "unknown") as keyof typeof totals;
    if (evt in totals) {
      const key = evt as keyof typeof totals;
      totals[key] = (totals[key] || 0) + 1;
    }
    eventCounts[evt] = (eventCounts[evt] || 0) + 1;

    const route = row.route || "(none)";
    routeCounts[route] = (routeCounts[route] || 0) + 1;

    if (row.event === "page_view") {
      const meta = (row as any).meta || {};
      const location = (meta as any).location || {};
      const countryCode =
        typeof location.countryCode === "string"
          ? location.countryCode
          : null;
      const countryName =
        typeof location.countryName === "string"
          ? location.countryName
          : null;
      const countryKey = countryCode || countryName || "Unknown";

      if (!countryCounts[countryKey]) {
        countryCounts[countryKey] = {
          count: 0,
          code: countryCode,
          name: countryName,
        };
      }
      countryCounts[countryKey].count += 1;

      const routeKey = `${route}__${countryKey}`;
      if (!routeLocationCounts[routeKey]) {
        routeLocationCounts[routeKey] = {
          count: 0,
          countryCode,
          countryName,
        };
      }
      routeLocationCounts[routeKey].count += 1;
    }
  });

  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([route, count]) => ({ route, count }));

  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([event, count]) => ({ event, count }));

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([key, value]) => ({
      country: formatCountry(value.code, value.name) || key,
      countryCode: value.code,
      count: value.count,
    }));

  const topRouteLocations = Object.entries(routeLocationCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([key, value]) => {
      const [routePart] = key.split("__");
      return {
        route: routePart || "(none)",
        country: formatCountry(value.countryCode, value.countryName),
        countryCode: value.countryCode,
        count: value.count,
      };
    });

  return {
    since,
    totals,
    topRoutes,
    topEvents,
    topCountries,
    topRouteLocations,
    until,
  };
}
