import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const windowSeconds = Math.min(
    600,
    Math.max(30, parseInt(searchParams.get("windowSeconds") || "120", 10))
  );
  const sinceIso = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("live_visitors")
    .select("session_id, route, created_at, last_seen, meta")
    .gte("last_seen", sinceIso)
    .order("last_seen", { ascending: false })
    .limit(250);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    now,
    windowSeconds,
    count: data?.length || 0,
    visitors: data || [],
  });
}

