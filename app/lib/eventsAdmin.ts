import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export type EventSubmissionStatus = "pending" | "approved" | "rejected";

export type EventSubmission = {
  id: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  location: string;
  audience: "family" | "18plus" | "21plus" | null;
  cost?: string | null;
  description?: string | null;
  accessibility?: string | null;
  url?: string | null;
  contactEmail: string;
  contactName?: string | null;
  attachments?: string | null;
  status: EventSubmissionStatus;
  submittedAt: string;
  lastReviewedAt?: string | null;
};

export async function getEventSubmissions(): Promise<EventSubmission[]> {
  const { data, error } = await supabaseAdmin
    .from("events_submissions")
    .select(
      "id, title, start_at, end_at, location, audience, cost, description, accessibility, url, contact_email, contact_name, attachments, status, submitted_at, last_reviewed_at"
    )
    .order("submitted_at", { ascending: false });

  if (error || !data) {
    console.warn("[Events Admin] Unable to load event submissions:", error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location,
    audience: row.audience,
    cost: row.cost,
    description: row.description,
    accessibility: row.accessibility,
    url: row.url,
    contactEmail: row.contact_email,
    contactName: row.contact_name,
    attachments: row.attachments,
    status: row.status,
    submittedAt: row.submitted_at,
    lastReviewedAt: row.last_reviewed_at,
  }));
}

export async function updateEventSubmissionStatus(
  id: string,
  status: EventSubmissionStatus
): Promise<{ status: EventSubmissionStatus | null; error?: string; submission?: EventSubmission }> {
  const { data, error } = await supabaseAdmin
    .from("events_submissions")
    .update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      "id, title, start_at, end_at, location, audience, cost, description, accessibility, url, contact_email, contact_name, attachments, status, submitted_at, last_reviewed_at"
    )
    .single();

  if (error) {
    console.error("[Events Admin] Unable to update submission status:", error.message);
    return { status: null, error: error.message };
  }

  return {
    status: (data as { status: EventSubmissionStatus }).status,
    submission: {
      id: data.id,
      title: data.title,
      startAt: data.start_at,
      endAt: data.end_at,
      location: data.location,
      audience: data.audience,
      cost: data.cost,
      description: data.description,
      accessibility: data.accessibility,
      url: data.url,
      contactEmail: data.contact_email,
      contactName: data.contact_name,
      attachments: data.attachments,
      status: data.status,
      submittedAt: data.submitted_at,
      lastReviewedAt: data.last_reviewed_at,
    },
  };
}
