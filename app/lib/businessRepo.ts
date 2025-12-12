// app/lib/businessRepo.ts
import { supabase } from "./supabaseClient";

export type BusinessListing = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  emoji: string | null;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website_url: string | null;
  email: string | null;
  price_level: number | null;
  is_claimed: boolean;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchAllBusinesses(): Promise<BusinessListing[]> {
  const { data, error } = await supabase
    .from("business_listings")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching business listings:", error);
    return [];
  }

  return data as BusinessListing[];
}

export async function fetchBusinessBySlug(
  slug: string
): Promise<BusinessListing | null> {
  const { data, error } = await supabase
    .from("business_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching business by slug:", error);
    return null;
  }

  return data as BusinessListing | null;
}