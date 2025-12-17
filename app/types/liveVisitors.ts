export type LiveVisitorLocation = {
  countryCode?: string | null;
  countryName?: string | null;
  region?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type LiveVisitorRow = {
  session_id: string;
  route: string;
  created_at: string;
  last_seen: string;
  meta?: {
    location?: LiveVisitorLocation;
    referrer?: string | null;
    userAgent?: string | null;
  } | null;
};

export type LiveVisitorsResponse = {
  now: string;
  windowSeconds: number;
  count: number;
  visitors: LiveVisitorRow[];
};

