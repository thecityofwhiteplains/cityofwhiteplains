import { supabase } from "@/app/lib/supabaseClient";

const SETTINGS_TABLE = "site_settings";
const HERO_KEY = "homepage_hero_image_url";
const PROMO_CARD_KEY = "homepage_promo_card";
const START_CARD_IMAGES_KEY = "homepage_start_card_images";
const PAGE_HERO_KEYS: Record<PageHeroKey, string> = {
  home: HERO_KEY,
  visit: "page_visit_hero_image_url",
  events: "page_events_hero_image_url",
  eat: "page_eat_hero_image_url",
  business: "page_business_hero_image_url",
  community: "page_community_hero_image_url",
};

export type PromoCardSettings = {
  imageUrl?: string | null;
  title?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
};

export type StartCardImages = {
  visitors?: string | null;
  court?: string | null;
  eat?: string | null;
  business?: string | null;
};

export type PageHeroKey =
  | "home"
  | "visit"
  | "events"
  | "eat"
  | "business"
  | "community";
export type PageHeroImages = Record<PageHeroKey, string | null | undefined>;

/**
 * Fetch the saved homepage hero image URL from Supabase (if one exists).
 */
export async function getHomepageHeroImageUrl(): Promise<string | null> {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("value")
    .eq("key", HERO_KEY)
    .maybeSingle();

  if (error) {
    console.warn("[Site settings] Unable to load hero image:", error.message);
    return null;
  }

  const value = (data as { value?: string | null } | null)?.value;
  return typeof value === "string" ? value : null;
}

/**
 * Save or update the homepage hero image URL (null clears it back to default).
 */
export async function saveHomepageHeroImageUrl(
  url: string
): Promise<string | null> {
  const value = url.trim() || null;

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(
      {
        key: HERO_KEY,
        value,
      },
      { onConflict: "key" }
    )
    .select("value")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const saved = (data as { value?: string | null } | null)?.value;
  return typeof saved === "string" ? saved : null;
}

/**
 * Fetch a specific page hero image URL by page key.
 * `home` maps to the existing homepage hero key for backward compatibility.
 */
export async function getPageHeroImage(page: PageHeroKey): Promise<string | null> {
  const key = PAGE_HERO_KEYS[page];
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.warn("[Site settings] Unable to load page hero image:", error.message);
    return null;
  }

  const value = (data as { value?: string | null } | null)?.value;
  return typeof value === "string" ? value : null;
}

/**
 * Fetch hero images for all supported pages in a single query.
 */
export async function getPageHeroImages(): Promise<PageHeroImages> {
  const keys = Object.values(PAGE_HERO_KEYS);
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("key, value")
    .in("key", keys);

  if (error || !data) {
    console.warn("[Site settings] Unable to load page hero images:", error?.message);
    return {
      home: null,
      visit: null,
      events: null,
      eat: null,
      business: null,
      community: null,
    };
  }

  const map: PageHeroImages = {
    home: null,
    visit: null,
    events: null,
    eat: null,
    business: null,
    community: null,
  };

  data.forEach((row: { key: string; value: string | null }) => {
    const entry = (Object.entries(PAGE_HERO_KEYS) as [PageHeroKey, string][])
      .find(([, k]) => k === row.key);
    if (entry) {
      const page = entry[0];
      map[page] = typeof row.value === "string" ? row.value : null;
    }
  });

  return map;
}

/**
 * Save/update a page hero image by page key.
 */
export async function savePageHeroImage(
  page: PageHeroKey,
  url: string
): Promise<string | null> {
  const key = PAGE_HERO_KEYS[page];
  const value = url.trim() || null;

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(
      {
        key,
        value,
      },
      { onConflict: "key" }
    )
    .select("value")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const saved = (data as { value?: string | null } | null)?.value;
  return typeof saved === "string" ? saved : null;
}

/**
 * Load homepage promo card settings (image/title/button copy).
 */
export async function getHomepagePromoCard(): Promise<PromoCardSettings | null> {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("value")
    .eq("key", PROMO_CARD_KEY)
    .maybeSingle();

  if (error) {
    console.warn("[Site settings] Unable to load promo card:", error.message);
    return null;
  }

  const raw = (data as { value?: string | null } | null)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      imageUrl: parsed.imageUrl ?? null,
      title: parsed.title ?? null,
      buttonText: parsed.buttonText ?? null,
      buttonUrl: parsed.buttonUrl ?? null,
    };
  } catch (err) {
    console.warn("[Site settings] Unable to parse promo card JSON:", err);
    return null;
  }
}

/**
 * Save homepage promo card settings as a JSON blob.
 */
export async function saveHomepagePromoCard(
  promo: PromoCardSettings
): Promise<PromoCardSettings | null> {
  const value = JSON.stringify({
    imageUrl: promo.imageUrl?.trim() || null,
    title: promo.title?.trim() || null,
    buttonText: promo.buttonText?.trim() || null,
    buttonUrl: promo.buttonUrl?.trim() || null,
  });

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(
      {
        key: PROMO_CARD_KEY,
        value,
      },
      { onConflict: "key" }
    )
    .select("value")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const savedValue = (data as { value?: string | null } | null)?.value;
  if (!savedValue) return null;
  try {
    return JSON.parse(savedValue);
  } catch {
    return null;
  }
}

export async function getStartCardImages(): Promise<StartCardImages | null> {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("value")
    .eq("key", START_CARD_IMAGES_KEY)
    .maybeSingle();

  if (error) {
    console.warn("[Site settings] Unable to load start card images:", error.message);
    return null;
  }

  const raw = (data as { value?: string | null } | null)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      visitors: parsed.visitors ?? null,
      court: parsed.court ?? null,
      eat: parsed.eat ?? null,
      business: parsed.business ?? null,
    };
  } catch (err) {
    console.warn("[Site settings] Unable to parse start card images JSON:", err);
    return null;
  }
}

export async function saveStartCardImages(
  images: StartCardImages
): Promise<StartCardImages | null> {
  const value = JSON.stringify({
    visitors: images.visitors?.trim() || null,
    court: images.court?.trim() || null,
    eat: images.eat?.trim() || null,
    business: images.business?.trim() || null,
  });

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(
      {
        key: START_CARD_IMAGES_KEY,
        value,
      },
      { onConflict: "key" }
    )
    .select("value")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const savedValue = (data as { value?: string | null } | null)?.value;
  if (!savedValue) return null;
  try {
    return JSON.parse(savedValue);
  } catch {
    return null;
  }
}
