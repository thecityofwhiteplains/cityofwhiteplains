// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getApprovedCommunityEvents, getUpcomingEvents } from "@/app/lib/events";

export const runtime = "nodejs"; // ensure Node runtime for node-ical

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) || 10 : 10;

    const [cityEvents, communityEvents] = await Promise.all([
      getUpcomingEvents(limit),
      getApprovedCommunityEvents(limit),
    ]);

    const events = [
      ...communityEvents,
      ...cityEvents.map((evt) => ({ ...evt, source: "city" as const })),
    ];

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}
