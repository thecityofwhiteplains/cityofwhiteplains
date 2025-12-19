// app/api/admin/ads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { title, subtitle, buttonText, link, placement, imageUrl, partner, isActive } = body || {};

  const updates: Record<string, any> = {};
  if (title !== undefined) updates.title = title;
  if (subtitle !== undefined) updates.subtitle = subtitle;
  if (buttonText !== undefined) updates.button_text = buttonText;
  if (link !== undefined) updates.link = link;
  if (placement !== undefined) updates.placement = placement;
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (partner !== undefined) updates.partner = partner;
  if (isActive !== undefined) updates.is_active = !!isActive;

  async function runUpdate(payload: Record<string, any>) {
    return supabaseAdmin
      .from("affiliate_ads")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
  }

  let { data, error } = await runUpdate(updates);

  // If the subtitle column isn't present in the DB yet, retry without it so the update succeeds.
  if (error && error.message?.toLowerCase().includes("subtitle")) {
    const retryPayload = { ...updates };
    delete retryPayload.subtitle;
    console.warn("[Ads] Retrying update without subtitle column (schema not migrated yet)");
    const retry = await runUpdate(retryPayload);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("[Ads] Failed to update ad", { id, error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/visit");
  revalidatePath("/events");
  revalidatePath("/community");

  return NextResponse.json({ ad: data }, { status: 200 });
}
