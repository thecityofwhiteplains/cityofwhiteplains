import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import type { AnalyticsEventPayload } from "@/app/types/analytics";

export const dynamic = "force-dynamic";

function detectDevice(ua: string | null): "mobile" | "desktop" | "tablet" {
  if (!ua) return "desktop";
  const lower = ua.toLowerCase();
  if (lower.includes("ipad") || lower.includes("tablet")) return "tablet";
  if (lower.includes("mobi")) return "mobile";
  return "desktop";
}

export async function POST(request: NextRequest) {
  let payload: AnalyticsEventPayload;

  try {
    payload = (await request.json()) as AnalyticsEventPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.event || !payload?.route) {
    return NextResponse.json({ error: "Missing event or route" }, { status: 400 });
  }

  const ua = request.headers.get("user-agent");
  const now = new Date().toISOString();

  const row = {
    event: payload.event,
    route: payload.route,
    referrer: payload.referrer || null,
    utm_source: payload.utm_source || null,
    utm_medium: payload.utm_medium || null,
    utm_campaign: payload.utm_campaign || null,
    device: payload.device || detectDevice(ua),
    meta: payload.meta || {},
    created_at: now,
  };

  const { error } = await supabaseAdmin.from("analytics_events").insert([row]);
  if (error) {
    console.error("[analytics] insert failed:", error.message);
    return NextResponse.json({ error: "Unable to record event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
