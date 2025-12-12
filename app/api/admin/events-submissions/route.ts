// app/api/admin/events-submissions/route.ts
import { NextResponse } from "next/server";
import { getEventSubmissions } from "@/app/lib/eventsAdmin";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await getEventSubmissions();
  return NextResponse.json({ submissions });
}
