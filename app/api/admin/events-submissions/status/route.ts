// app/api/admin/events-submissions/status/route.ts
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";
import { updateEventSubmissionStatus } from "@/app/lib/eventsAdmin";
import { sendEventApprovalEmail } from "@/app/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const id = body?.id;
  const status = body?.status;
  const sendEmail = body?.sendEmail ?? true;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
  }

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = await updateEventSubmissionStatus(id, status);
  if (!result.status) {
    return NextResponse.json(
      { error: result.error || "Unable to update submission" },
      { status: 500 }
    );
  }

  if (
    sendEmail &&
    status === "approved" &&
    result.submission?.contactEmail
  ) {
    // Fire-and-forget; do not block approval if email fails.
    sendEventApprovalEmail({
      to: result.submission.contactEmail,
      title: result.submission.title,
      startAt: result.submission.startAt,
      location: result.submission.location,
    }).catch((err) =>
      console.warn("[Events Admin] Failed to send approval email:", err)
    );
  }

  return NextResponse.json({ status: result.status }, { status: 200 });
}
