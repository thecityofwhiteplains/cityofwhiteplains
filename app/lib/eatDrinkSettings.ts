import { supabase } from "@/app/lib/supabaseClient";
import type { EatPlace, EatCategory } from "@/app/types/eatDrink";
import { DEFAULT_EAT_DRINK_TAGS } from "@/app/types/eatDrink";

const SETTINGS_TABLE = "site_settings";
const EAT_DRINK_KEY = "eat_drink_spots";

function slugify(input?: string | null): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildMapsUrl(address?: string | null, name?: string | null): string | null {
  const query = address?.trim() || name?.trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function normalizeEatDrinkSpot(
  spot: Partial<EatPlace>,
  idx = 0
): EatPlace {
  const name = spot.name?.trim() || `Restaurant ${idx + 1}`;
  const id =
    spot.id?.trim() ||
    slugify(name) ||
    `eat-drink-${idx + 1}-${Date.now()}`;

  const shortDescription =
    spot.shortDescription?.trim() || "Local spot in White Plains.";

  const allowedCategories: EatCategory[] = [
    "coffee",
    "breakfast",
    "lunch",
    "dinner",
    "quick-bite",
  ];
  const category = allowedCategories.includes(spot.category as EatCategory)
    ? (spot.category as EatCategory)
    : "dinner";
  const vibeOptions: EatPlace["vibe"][] = ["calm", "family", "fast", "date-night"];
  const vibe = vibeOptions.includes(spot.vibe as EatPlace["vibe"])
    ? (spot.vibe as EatPlace["vibe"])
    : "calm";
  const budgetOptions: EatPlace["budget"][] = ["$", "$$", "$$$"];
  const budget = budgetOptions.includes(spot.budget as EatPlace["budget"])
    ? (spot.budget as EatPlace["budget"])
    : "$$";

  const rawGoodFor = (spot as any)?.goodFor;
  const goodFor = Array.isArray(rawGoodFor)
    ? rawGoodFor.map((g: any) => g?.trim()).filter(Boolean)
    : typeof rawGoodFor === "string"
    ? rawGoodFor
        .split(",")
        .map((g: string) => g.trim())
        .filter(Boolean)
    : [...DEFAULT_EAT_DRINK_TAGS];

  const mapsUrl =
    spot.mapsUrl?.trim() ||
    buildMapsUrl(spot.address, name) ||
    null;

  return {
    id,
    name,
    shortDescription,
    category,
    vibe,
    budget,
    goodFor: goodFor.length ? goodFor : [...DEFAULT_EAT_DRINK_TAGS],
    address: spot.address?.trim() || null,
    phone: spot.phone?.trim() || null,
    websiteUrl: spot.websiteUrl?.trim() || null,
    imageUrl: spot.imageUrl?.trim() || null,
    mapsUrl,
    menuUrl: spot.menuUrl?.trim() || null,
    upVotes:
      typeof spot.upVotes === "number"
        ? Math.max(0, Math.round(spot.upVotes))
        : 0,
    downVotes:
      typeof spot.downVotes === "number"
        ? Math.max(0, Math.round(spot.downVotes))
        : 0,
  };
}

type EatDrinkStored = {
  spots: EatPlace[];
  featuredIds?: string[];
};

function parseEatDrinkValue(raw: string | null): EatDrinkStored | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed?.spots;
    if (!Array.isArray(list)) return null;
    const spots = list.map((spot, idx) => normalizeEatDrinkSpot(spot, idx));
    const featuredIds = Array.isArray(parsed?.featuredIds)
      ? parsed.featuredIds
          .map((id: unknown) =>
            typeof id === "string" ? id.trim() : ""
          )
          .filter(Boolean)
      : [];
    return { spots, featuredIds };
  } catch (err) {
    console.warn("[Eat & Drink] Unable to parse saved settings:", err);
    return null;
  }
}

export async function getSavedEatDrinkSettings(): Promise<EatDrinkStored | null> {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("value")
    .eq("key", EAT_DRINK_KEY)
    .maybeSingle();

  if (error) {
    console.warn("[Eat & Drink] Unable to load saved settings:", error.message);
    return null;
  }

  const raw = (data as { value?: string | null } | null)?.value ?? null;
  return parseEatDrinkValue(raw);
}

export async function saveEatDrinkSettings(
  spots: EatPlace[],
  featuredIds: string[] = []
): Promise<EatDrinkStored> {
  const normalized = spots.map((spot, idx) =>
    normalizeEatDrinkSpot(spot, idx)
  );
  const dedupedFeatured = featuredIds
    .map((id) => id.trim())
    .filter(Boolean)
    .filter((id, idx, arr) => arr.indexOf(id) === idx);

  const value = JSON.stringify({
    spots: normalized,
    featuredIds: dedupedFeatured,
  });

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(
      {
        key: EAT_DRINK_KEY,
        value,
      },
      { onConflict: "key" }
    )
    .select("value")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const raw = (data as { value?: string | null } | null)?.value ?? null;
  return (
    parseEatDrinkValue(raw) || { spots: normalized, featuredIds: dedupedFeatured }
  );
}
