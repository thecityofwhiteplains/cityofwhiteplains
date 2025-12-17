import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function parseFloatSafe(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function getGeoFromRequest(request: NextRequest) {
  const geo = (request as any).geo || {};
  const headers = request.headers;

  const countryCode =
    geo.country ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code");
  const region =
    geo.region ||
    headers.get("x-vercel-ip-country-region") ||
    headers.get("x-region");
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
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = (body?.sessionId || "").toString().trim();
  const route = (body?.route || "").toString().trim();
  if (!sessionId || !route) {
    return NextResponse.json({ error: "Missing sessionId or route" }, { status: 400 });
  }
  // Avoid filling the table with admin traffic.
  if (route.startsWith("/admin")) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const location = getGeoFromRequest(request);

  const row = {
    session_id: sessionId,
    route,
    last_seen: now,
    // created_at will be set server-side in the DB default, but we include a value for
    // first-write cases where defaults aren't present.
    created_at: now,
    meta: {
      location,
      referrer:
        typeof body?.referrer === "string" && body.referrer.trim().length > 0
          ? body.referrer
          : null,
      userAgent: request.headers.get("user-agent"),
    },
  };

  try {
    const { error } = await supabaseAdmin
      .from("live_visitors")
      .upsert([row], { onConflict: "session_id" });

    if (error) {
      console.warn("[live] upsert failed:", error.message);
      return NextResponse.json({ ok: true }); // best-effort, don't break the page
    }
  } catch (err) {
    console.warn("[live] unexpected error:", err);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

