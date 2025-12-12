import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import {
  SITE_VERIFICATION_META_KEY,
  SITE_VERIFICATION_SCRIPT_KEY,
  type SiteVerificationSettings,
} from "@/app/lib/siteVerificationSettings";

export async function getSiteVerificationSettingsServer(): Promise<SiteVerificationSettings> {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("key, value")
    .in("key", [SITE_VERIFICATION_META_KEY, SITE_VERIFICATION_SCRIPT_KEY]);

  if (error) {
    console.warn("[Site verification] Unable to load server settings:", error.message);
    return { metaTag: null, script: null };
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
