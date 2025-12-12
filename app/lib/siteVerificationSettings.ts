import { supabase } from "@/app/lib/supabaseClient";

export type SiteVerificationSettings = {
  metaTag?: string | null;
  script?: string | null;
};

export const SITE_VERIFICATION_META_KEY = "site_verification_meta_tag";
export const SITE_VERIFICATION_SCRIPT_KEY = "site_verification_script";

async function fetchSettings(keys: string[]) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);

  if (error) {
    console.warn("[Site verification] Unable to load settings:", error.message);
    return [];
  }

  return data || [];
}

export async function getSiteVerificationSettings(): Promise<SiteVerificationSettings> {
  const rows = await fetchSettings([
    SITE_VERIFICATION_META_KEY,
    SITE_VERIFICATION_SCRIPT_KEY,
  ]);

  const map: Record<string, string | null> = {};
  rows.forEach((row: { key: string; value: string | null }) => {
    map[row.key] = typeof row.value === "string" ? row.value : null;
  });

  return {
    metaTag: map[SITE_VERIFICATION_META_KEY] ?? null,
    script: map[SITE_VERIFICATION_SCRIPT_KEY] ?? null,
  };
}

export async function saveSiteVerificationSettings(
  settings: SiteVerificationSettings
): Promise<SiteVerificationSettings> {
  const payload = [
    {
      key: SITE_VERIFICATION_META_KEY,
      value: settings.metaTag?.trim() || null,
    },
    {
      key: SITE_VERIFICATION_SCRIPT_KEY,
      value: settings.script?.trim() || null,
    },
  ];

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "key" })
    .select("key, value");

  if (error) {
    throw new Error(error.message);
  }

  const map: Record<string, string | null> = {};
  (data || []).forEach((row: { key: string; value: string | null }) => {
    map[row.key] = typeof row.value === "string" ? row.value : null;
  });

  return {
    metaTag: map[SITE_VERIFICATION_META_KEY] ?? null,
    script: map[SITE_VERIFICATION_SCRIPT_KEY] ?? null,
  };
}
