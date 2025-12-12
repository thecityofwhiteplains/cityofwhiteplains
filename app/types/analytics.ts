export type AnalyticsEventName =
  | "page_view"
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
  totals: Record<AnalyticsEventName | "all", number>;
  topRoutes: { route: string; count: number }[];
  topEvents: { event: string; count: number }[];
  // Optional: future daily series
  daily?: { date: string; event: string; count: number }[];
};
