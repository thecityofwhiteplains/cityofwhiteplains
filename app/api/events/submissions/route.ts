// app/api/events/submissions/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

type SubmissionPayload = {
  title?: string;
  start?: string;
  end?: string;
  location?: string;
  audience?: string;
  cost?: string;
  description?: string;
  accessibility?: string;
  url?: string;
  contact_email?: string;
  contact_name?: string;
  attachments?: string;
};

function normalizePayload(body: Record<string, unknown>): SubmissionPayload {
  return {
    title: (body.title as string) || "",
    start: (body.start as string) || "",
    end: (body.end as string) || "",
    location: (body.location as string) || "",
    audience: (body.audience as string) || "",
    cost: (body.cost as string) || "",
    description: (body.description as string) || "",
    accessibility: (body.accessibility as string) || "",
    url: (body.url as string) || "",
    contact_email: (body.contact as string) || (body.contact_email as string) || "",
    contact_name: (body.contact_name as string) || "",
    attachments: (body.attachments as string) || "",
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const submission = normalizePayload(body);

    if (!submission.title || !submission.start || !submission.location || !submission.contact_email) {
      return NextResponse.json(
        { error: "Missing required fields: title, start, location, and contact email are required." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("events_submissions").insert([
      {
        title: submission.title,
        start_at: submission.start,
        end_at: submission.end || null,
        location: submission.location,
        audience: submission.audience || "family",
        cost: submission.cost || null,
        description: submission.description || null,
        accessibility: submission.accessibility || null,
        url: submission.url || null,
        contact_email: submission.contact_email,
        contact_name: submission.contact_name || null,
        attachments: submission.attachments || null,
        status: "pending",
        source: "public_form",
        submitted_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error saving event submission:", error.message);
      return NextResponse.json(
        { error: "We couldn't accept this submission right now. Please try again shortly." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "pending_review",
        message:
          "Thanks! Your event was received and will be reviewed by an admin before it appears on the site.",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Failed to accept event submission", error);
    return NextResponse.json(
      { error: "We couldn't accept this submission right now. Please try again shortly." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    {
      status: "ready",
      message:
        "POST an event to this endpoint to queue it for admin review. Required fields: title, start, location, contact.",
    },
    { status: 200 }
  );
}
