import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/app/lib/analyticsAdmin";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";

export async function GET(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const daysParam = searchParams.get("days");

  let summary;
  if (startDate) {
    summary = await getAnalyticsSummary({
      startDate,
      endDate: endDate || undefined,
    });
  } else {
    const days = daysParam ? parseInt(daysParam, 10) : 30;
    summary = await getAnalyticsSummary({ days: Number.isFinite(days) ? days : 30 });
  }

  return NextResponse.json(summary);
}
