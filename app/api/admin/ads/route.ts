// app/api/admin/ads/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  async function runSelect(selectClause: string) {
    return supabaseAdmin
      .from("affiliate_ads")
      .select(selectClause)
      .order("created_at", { ascending: false });
  }

  let { data, error } = await runSelect("*");

  // Fallback if subtitle or button_text not present in schema cache.
  if (error && (error.message?.toLowerCase().includes("subtitle") || error.message?.toLowerCase().includes("button_text"))) {
    console.warn("[Ads] subtitle/button_text missing; retrying GET without them");
    const retry = await runSelect("id, title, link, image_url, placement, partner, is_active, created_at, updated_at");
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ads: data }, { status: 200 });
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { title, subtitle, buttonText, link, placement, imageUrl, partner, isActive = true } = body || {};
  if (!title || !link || !placement) {
    return NextResponse.json(
      { error: "title, link, and placement are required" },
      { status: 400 }
    );
  }

  async function runInsert(payload: Record<string, any>) {
    return supabaseAdmin
      .from("affiliate_ads")
      .insert([payload])
      .select("id, title, subtitle, button_text, link, image_url, placement, partner, is_active, created_at, updated_at")
      .single();
  }

  let { data, error } = await runInsert({
    title,
    subtitle: subtitle || null,
    button_text: buttonText || null,
    link,
    placement,
    image_url: imageUrl || null,
    partner: partner || null,
    is_active: !!isActive,
  });

  // If subtitle/button_text columns are missing in DB, retry without them so the ad still saves.
  if (error && (error.message?.toLowerCase().includes("subtitle") || error.message?.toLowerCase().includes("button_text"))) {
    console.warn("[Ads] Retrying insert without subtitle/button_text (schema not migrated yet)");
    const retry = await runInsert({
      title,
      link,
      placement,
      image_url: imageUrl || null,
      partner: partner || null,
      is_active: !!isActive,
    });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/visit");
  revalidatePath("/events");

  return NextResponse.json({ ad: data }, { status: 201 });
}
