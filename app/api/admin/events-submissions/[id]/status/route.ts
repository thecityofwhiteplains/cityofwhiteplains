// app/api/admin/events-submissions/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateEventSubmissionStatus } from "@/app/lib/eventsAdmin";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
  }
  let body: any = {};
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const status = body?.status;
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

  return NextResponse.json({ status: result.status }, { status: 200 });
}
