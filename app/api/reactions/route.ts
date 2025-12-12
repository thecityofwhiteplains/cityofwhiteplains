import { NextRequest, NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Direction = "up" | "down" | "share";
type ReactionRow = {
  up_count?: number | null;
  down_count?: number | null;
  share_count?: number | null;
};

function formatCounts(row?: ReactionRow | null) {
  return {
    upVotes: row?.up_count ?? 0,
    downVotes: row?.down_count ?? 0,
    shareCount: row?.share_count ?? 0,
  };
}

async function fetchCounts(
  slug: string,
  includeShare = true
): Promise<{ data: ReactionRow | null; error: PostgrestError | null }> {
  const columns = includeShare
    ? ("up_count,down_count,share_count" as const)
    : ("up_count,down_count" as const);
  return supabaseAdmin
    .from("blog_reactions")
    .select(columns)
    .eq("slug", slug)
    .maybeSingle<ReactionRow>();
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  let data: ReactionRow | null, error: PostgrestError | null;
  ({ data, error } = await fetchCounts(slug, true));

  // Fallback if share_count column hasn't been migrated yet
  if (error?.code === "42703") {
    ({ data, error } = await fetchCounts(slug, false));
  }

  if (error) {
    console.error("[reactions] GET error", error.message);
    return NextResponse.json({ error: "Unable to load reactions" }, { status: 500 });
  }

  return NextResponse.json(formatCounts(data));
}

async function incrementReaction(slug: string, direction: Direction) {
  // Grab existing counts (if any)
  let existing: ReactionRow | null,
    fetchError: PostgrestError | null,
    hasShareColumn = true;
  ({ data: existing, error: fetchError } = await supabaseAdmin
    .from("blog_reactions")
    .select("slug,up_count,down_count,share_count")
    .eq("slug", slug)
    .maybeSingle<ReactionRow>());

  // Fallback if share_count column isn't present yet
  if (fetchError?.code === "42703") {
    hasShareColumn = false;
    ({ data: existing, error: fetchError } = await supabaseAdmin
      .from("blog_reactions")
      .select("slug,up_count,down_count")
      .eq("slug", slug)
      .maybeSingle<ReactionRow>());
  }

  if (fetchError) {
    throw fetchError;
  }

  const upCount = existing?.up_count ?? 0;
  const downCount = existing?.down_count ?? 0;

  const shareCount = hasShareColumn ? existing?.share_count ?? 0 : 0;

  const updates =
    direction === "up"
      ? { up_count: upCount + 1, down_count: downCount, ...(hasShareColumn ? { share_count: shareCount } : {}) }
      : direction === "down"
      ? { up_count: upCount, down_count: downCount + 1, ...(hasShareColumn ? { share_count: shareCount } : {}) }
      : hasShareColumn
      ? { up_count: upCount, down_count: downCount, share_count: shareCount + 1 }
      : { up_count: upCount, down_count: downCount };

  // Insert when missing, otherwise update counts.
  if (!existing) {
    const selectCols = hasShareColumn
      ? ("up_count,down_count,share_count" as const)
      : ("up_count,down_count" as const);
    const { data, error } = await supabaseAdmin
      .from("blog_reactions")
      .insert({ slug, ...updates })
      .select(selectCols)
      .maybeSingle<ReactionRow>();

    if (error) throw error;
    return data;
  }

  const selectCols = hasShareColumn
    ? ("up_count,down_count,share_count" as const)
    : ("up_count,down_count" as const);
  const { data, error } = await supabaseAdmin
    .from("blog_reactions")
    .update(updates)
    .eq("slug", slug)
    .select(selectCols)
    .maybeSingle<ReactionRow>();

  if (error) throw error;
  return data;
}

export async function POST(request: NextRequest) {
  const { slug, direction } = await request.json();
  const cleanSlug = typeof slug === "string" ? slug.trim() : "";

  if (!cleanSlug || (direction !== "up" && direction !== "down" && direction !== "share")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const updated = await incrementReaction(cleanSlug, direction);
    return NextResponse.json(formatCounts(updated));
  } catch (error: any) {
    console.error("[reactions] POST error", error?.message || error);
    return NextResponse.json({ error: "Unable to save reaction" }, { status: 500 });
  }
}
