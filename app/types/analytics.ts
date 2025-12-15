export type AnalyticsEventName =
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

export type AnalyticsEventPayload = {
  event: AnalyticsEventName;
  route: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  device?: "mobile" | "desktop" | "tablet";
  meta?: Record<string, unknown>;
};

export type AnalyticsSummary = {
  since: string;
  until?: string;
  totals: Record<AnalyticsEventName | "all", number>;
  topRoutes: { route: string; count: number }[];
  topEvents: { event: string; count: number }[];
  topCountries: { country: string; countryCode?: string | null; count: number }[];
  topRouteLocations: {
    route: string;
    country: string;
    countryCode?: string | null;
    count: number;
  }[];
  locations?: {
    lat: number;
    lng: number;
    country?: string | null;
    city?: string | null;
    count: number;
  }[];
  // Optional: future daily series
  daily?: { date: string; event: string; count: number }[];
};
