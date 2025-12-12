import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export type AffiliateAd = {
  id: string;
  title: string;
  subtitle?: string | null;
  link: string;
  buttonText?: string | null;
  imageUrl?: string | null;
  placement: string;
  partner?: string | null;
  is_active?: boolean | null;
};

export async function getAdsByPlacement(
  placements: string[]
): Promise<Record<string, AffiliateAd[]>> {
  if (placements.length === 0) return {};

  type AdRow = {
    id: string;
    title: string;
    subtitle?: string | null;
    button_text?: string | null;
    link: string;
    image_url?: string | null;
    placement?: string | null;
    partner?: string | null;
    is_active?: boolean | null;
  };

  async function runSelect(selectClause: string) {
    return supabaseAdmin
      .from("affiliate_ads")
      .select(selectClause)
      .in("placement", placements)
      .eq("is_active", true);
  }

  let { data, error } = await runSelect(
    "id, title, subtitle, button_text, link, image_url, placement, partner, is_active"
  );

  // Fallback if subtitle column doesn't exist yet in DB.
  if (error && error.message?.toLowerCase().includes("subtitle")) {
    console.warn("[Ads] subtitle column missing; retrying select without it");
    const retry = await runSelect(
      "id, title, link, image_url, placement, partner, is_active"
    );
    data = retry.data;
    error = retry.error;
  }
  if (error && error.message?.toLowerCase().includes("button_text")) {
    console.warn("[Ads] button_text column missing; retrying select without it");
    const retry = await runSelect(
      "id, title, subtitle, link, image_url, placement, partner, is_active"
    );
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    console.warn("[Ads] Unable to load affiliate ads:", error?.message);
    return {};
  }

  const grouped: Record<string, AffiliateAd[]> = {};
  const rows: AdRow[] = Array.isArray(data) ? (data as unknown as AdRow[]) : [];
  rows.forEach((row) => {
    const placement = row.placement || "default";
    grouped[placement] = grouped[placement] || [];
    const buttonText =
      (row as any).button_text ||
      (row as any).buttonText ||
      (row.partner ? `Open ${row.partner}` : "Open link");
    grouped[placement].push({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      buttonText,
      link: row.link,
      imageUrl: row.image_url,
      placement,
      partner: row.partner,
      is_active: row.is_active,
    });
  });

  return grouped;
}
