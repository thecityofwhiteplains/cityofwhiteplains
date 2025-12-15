import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import type { AnalyticsEventPayload } from "@/app/types/analytics";

export const dynamic = "force-dynamic";
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function detectDevice(ua: string | null): "mobile" | "desktop" | "tablet" {
  if (!ua) return "desktop";
  const lower = ua.toLowerCase();
  if (lower.includes("ipad") || lower.includes("tablet")) return "tablet";
  if (lower.includes("mobi")) return "mobile";
  return "desktop";
}

function parseFloatSafe(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function getGeoFromRequest(request: NextRequest) {
  // NextRequest.geo is available at runtime on Vercel but not typed in NextRequest.
  const geo = (request as any).geo || {};
  const headers = request.headers;

  const countryCode =
    geo.country ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code");
  const region =
    geo.region || headers.get("x-vercel-ip-country-region") || headers.get("x-region");
  const city = geo.city || headers.get("x-vercel-ip-city") || headers.get("x-city");

  const latitude =
    parseFloatSafe(geo.latitude || headers.get("x-vercel-ip-latitude")) ?? null;
  const longitude =
    parseFloatSafe(geo.longitude || headers.get("x-vercel-ip-longitude")) ?? null;

  const countryName = countryCode
    ? regionNames.of(countryCode.toUpperCase()) || countryCode.toUpperCase()
    : null;

  return {
    countryCode: countryCode || null,
    countryName: countryName || null,
    region: region || null,
    city: city || null,
    latitude,
    longitude,
  };
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
  const location = getGeoFromRequest(request);

  const row = {
    event: payload.event,
    route: payload.route,
    referrer: payload.referrer || null,
    utm_source: payload.utm_source || null,
    utm_medium: payload.utm_medium || null,
    utm_campaign: payload.utm_campaign || null,
    device: payload.device || detectDevice(ua),
    meta: {
      ...(payload.meta || {}),
      location,
    },
    created_at: now,
  };

  const { error } = await supabaseAdmin.from("analytics_events").insert([row]);
  if (error) {
    console.error("[analytics] insert failed:", error.message);
    return NextResponse.json({ error: "Unable to record event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
