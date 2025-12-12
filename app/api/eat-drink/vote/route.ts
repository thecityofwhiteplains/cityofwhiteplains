import { NextResponse } from "next/server";
import { getSavedEatDrinkSettings, saveEatDrinkSettings } from "@/app/lib/eatDrinkSettings";
import { getEatDrinkContent } from "@/app/lib/eatDrinkData";

type VoteBody = { id?: string; direction?: "up" | "down" };

const VOTE_WINDOW_MS = 60 * 60 * 1000;
const VOTE_LIMIT = 50;
const VOTE_ATTEMPTS = new Map<string, { count: number; first: number }>();

function getClientKey(req: Request): string {
  const hdr =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "";
  return hdr.split(",")[0].trim() || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = VOTE_ATTEMPTS.get(key);
  if (!record) return false;
  if (now - record.first > VOTE_WINDOW_MS) {
    VOTE_ATTEMPTS.delete(key);
    return false;
  }
  return record.count >= VOTE_LIMIT;
}

function trackVote(key: string) {
  const now = Date.now();
  const record = VOTE_ATTEMPTS.get(key);
  if (!record || now - record.first > VOTE_WINDOW_MS) {
    VOTE_ATTEMPTS.set(key, { count: 1, first: now });
  } else {
    VOTE_ATTEMPTS.set(key, { count: record.count + 1, first: record.first });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as VoteBody;
  const id = body?.id?.trim();
  const direction = body?.direction === "down" ? "down" : "up";
  const clientKey = getClientKey(request);

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Too many votes from this network. Try again later." },
      { status: 429 }
    );
  }

  // Pull saved settings or fallback to computed content
  const saved = await getSavedEatDrinkSettings();
  const featuredIds = saved?.featuredIds || [];
  const spots =
    saved?.spots ||
    (await getEatDrinkContent()).places;

  const idx = spots.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  const spot = spots[idx];
  const upVotes = spot.upVotes ?? 0;
  const downVotes = spot.downVotes ?? 0;
  const updated =
    direction === "up"
      ? { ...spot, upVotes: upVotes + 1 }
      : { ...spot, downVotes: Math.max(0, downVotes + 1) };

  const nextSpots = spots.slice();
  nextSpots[idx] = updated;

  trackVote(clientKey);

  const savedResult = await saveEatDrinkSettings(nextSpots, featuredIds);

  return NextResponse.json({
    success: true,
    upVotes: updated.upVotes ?? 0,
    downVotes: updated.downVotes ?? 0,
    spots: savedResult.spots,
  });
}
