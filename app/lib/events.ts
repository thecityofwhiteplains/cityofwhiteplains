// app/lib/events.ts
import ical from "node-ical";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export type CityEvent = {
  id: string;
  title: string;
  start: string; // ISO string
  end?: string;  // ISO string
  location?: string;
  description?: string;
  allDay?: boolean;
};

export type CommunityEvent = CityEvent & {
  source: "community";
  audience?: "family" | "18plus" | "21plus";
  cost?: string;
  url?: string;
  accessibility?: string;
  status?: "pending" | "approved" | "rejected";
  submissionId?: string;
};

const ICS_URL =
  "https://www.cityofwhiteplains.com/common/modules/iCalendar/iCalendar.aspx?catID=26&feed=calendar";

/**
 * Fetch and normalize upcoming events from the City of White Plains iCalendar feed.
 */
export async function getUpcomingEvents(limit = 10): Promise<CityEvent[]> {
  const now = new Date();

  // Fetch and parse ICS feed
  const data = await ical.async.fromURL(ICS_URL);

  const events: CityEvent[] = [];

  for (const key of Object.keys(data)) {
    const item = (data as any)[key];

    // Only keep VEVENT items
    if (!item || item.type !== "VEVENT") continue;

    const start: Date | undefined = item.start;
    const end: Date | undefined = item.end;

    if (!start) continue;

    // Skip events that ended before now
    if (end && end < now) continue;

    events.push({
      id: item.uid || key,
      title: item.summary || "Untitled event",
      start: start.toISOString(),
      end: end ? end.toISOString() : undefined,
      location: item.location || "",
      description: item.description || "",
      allDay: !!item.datetype && item.datetype === "date",
    });
  }

  // Sort by start date ascending
  events.sort((a, b) => +new Date(a.start) - +new Date(b.start));

  // Limit results
  return events.slice(0, limit);
}

/**
 * Fetch approved community-submitted events from Supabase. These are shown
 * alongside the official city calendar once an admin marks them as approved.
 */
export async function getApprovedCommunityEvents(
  limit = 50
): Promise<CommunityEvent[]> {
  // If Supabase isn't configured, skip quietly.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[events] Supabase service role key missing; skipping community events.");
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("events_submissions")
    .select(
      "id, title, start_at, end_at, location, description, cost, audience, url, accessibility, status"
    )
    .eq("status", "approved")
    .order("start_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    console.warn("[events] Unable to load approved community events:", error?.message);
    return [];
  }

  return data
    .filter((row) => !!row.start_at)
    .map((row) => ({
      id: row.id,
      title: row.title || "Community event",
      start: row.start_at as string,
      end: (row.end_at as string | null) || undefined,
      location: row.location || "",
      description: row.description || "",
      cost: row.cost || undefined,
      audience: (row.audience as CommunityEvent["audience"]) || undefined,
      url: row.url || undefined,
      accessibility: row.accessibility || undefined,
      status: (row.status as CommunityEvent["status"]) || "approved",
      source: "community" as const,
      submissionId: row.id,
    }));
}
