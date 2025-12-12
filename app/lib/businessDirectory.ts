"use server";

import { supabase } from "@/app/lib/supabaseClient";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { sendBusinessSubmissionApproved } from "@/app/lib/notifications";

/* ---------- Types that match your admin component ---------- */

export type BusinessSubmissionStatus = "pending" | "approved" | "rejected";

export type BusinessSubmission = {
  id: string;
  businessName: string;
  mode: "claim" | "new";
  category: string;
  priceLevel?: number | null;
  shortDescription?: string | null;
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  imageUrl?: string | null;
  audience?: string[] | null;
  tags?: string[] | null;
  submittedAt: string;
  status: BusinessSubmissionStatus;
  contactName: string;
  contactEmail: string;
  notes?: string;
};

export type AdminBusinessListing = {
  id: string;
  slug: string;
  businessName: string;
  category: string;
  priceLevel: number;
  address: string;
  phone?: string;
  websiteUrl?: string;
  audience: string[];
  tags: string[];
  imageUrl?: string;
  isPublished?: boolean;
};

function slugifyName(name?: string | null): string {
  if (!name) return `listing-${Date.now()}`;
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ----------------- ADMIN LOADERS ----------------- */

export async function getAdminBusinessSubmissions(): Promise<
  BusinessSubmission[]
> {
  const client = supabaseAdmin || supabase;

  const { data, error } = await client
    .from("business_submissions")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.warn("[Directory] Submissions unavailable:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    businessName: row.business_name,
    mode: row.mode,
    category: row.category ?? "General",
    priceLevel: row.price_level ?? null,
    shortDescription: row.short_description ?? null,
    address: row.address_line1 ?? null,
    phone: row.phone ?? null,
    websiteUrl: row.website_url ?? null,
    imageUrl: row.image_url ?? null,
    audience: row.audience ?? null,
    tags: row.tags ?? null,
    submittedAt: row.submitted_at,
    status: row.status,
    contactName: row.contact_name ?? "",
    contactEmail: row.contact_email ?? "",
    notes: row.notes ?? undefined,
  }));
}

export async function updateBusinessSubmissionStatus(
  id: string,
  status: BusinessSubmissionStatus
): Promise<BusinessSubmissionStatus | null> {
  const { data, error } = await supabase
    .from("business_submissions")
    .update({ status })
    .eq("id", id)
    .select("status")
    .single();

  if (error) {
    console.error("[Directory] Unable to update submission status:", error.message);
    return null;
  }

  return (data as { status: BusinessSubmissionStatus }).status;
}

type ApproveResult = {
  submission: BusinessSubmission;
  listing?: AdminBusinessListing;
};

export async function approveBusinessSubmission(
  id: string
): Promise<ApproveResult | null> {
  const client = supabaseAdmin || supabase;

  const { data: subRow, error: subErr } = await client
    .from("business_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (subErr || !subRow) {
    console.error("[Directory] Unable to load submission for approval:", subErr?.message);
    return null;
  }

  // If this is a claim, try to load the existing listing so we can update it in-place.
  const linkedBusinessId = subRow.linked_business as string | null;
  let existingListing: any = null;

  if (linkedBusinessId) {
    const { data: listingRow, error: listingLoadErr } = await client
      .from("business_listings")
      .select("*")
      .eq("id", linkedBusinessId)
      .maybeSingle();

    if (listingLoadErr) {
      console.warn("[Directory] Unable to load linked listing for claim:", listingLoadErr.message);
    }

    existingListing = listingRow;
  }

  const slug =
    existingListing?.slug || slugifyName(subRow.business_name);
  const name =
    subRow.business_name || existingListing?.name || "Untitled business";

  const listingPayload = {
    slug,
    name,
    category: subRow.category || existingListing?.category,
    price_level: subRow.price_level ?? existingListing?.price_level ?? null,
    address_line1: subRow.address_line1 || existingListing?.address_line1,
    phone: subRow.phone || existingListing?.phone,
    website_url: subRow.website_url || existingListing?.website_url,
    audience: subRow.audience ?? existingListing?.audience ?? [],
    tags: subRow.tags ?? existingListing?.tags ?? [],
    image_url: subRow.image_url ?? existingListing?.image_url ?? null,
    is_published: true,
    is_claimed: subRow.mode === "claim" ? true : existingListing?.is_claimed ?? false,
    source: subRow.source || existingListing?.source || "submission",
  };

  const { data: listingData, error: listingErr } = await client
    .from("business_listings")
    .upsert([listingPayload], { onConflict: "slug" })
    .select(
      `
      id,
      slug,
      name,
      category,
      price_level,
      address_line1,
      phone,
      website_url,
      audience,
      tags,
      image_url,
      is_published,
      is_claimed
    `
    )
    .single();

  if (listingErr) {
    console.error("[Directory] Unable to upsert listing from submission:", listingErr.message);
  }

  const { data: updatedSub, error: updateErr } = await client
    .from("business_submissions")
    .update({ status: "approved" })
    .eq("id", id)
    .select("*")
    .single();

  if (updateErr || !updatedSub) {
    console.error("[Directory] Unable to update submission status:", updateErr?.message);
    return null;
  }

  // Fire-and-forget approval email
  if (updatedSub.contact_email) {
    sendBusinessSubmissionApproved(updatedSub.contact_email, name, updatedSub.mode).catch((err) =>
      console.warn("[Directory] Unable to send approval email:", err)
    );
  }

  const submission: BusinessSubmission = {
    id: updatedSub.id,
    businessName: updatedSub.business_name,
    mode: updatedSub.mode,
    category: updatedSub.category ?? "General",
    priceLevel: updatedSub.price_level ?? null,
    shortDescription: updatedSub.short_description ?? null,
    address: updatedSub.address_line1 ?? null,
    phone: updatedSub.phone ?? null,
    websiteUrl: updatedSub.website_url ?? null,
    imageUrl: updatedSub.image_url ?? null,
    audience: updatedSub.audience ?? null,
    tags: updatedSub.tags ?? null,
    submittedAt: updatedSub.submitted_at,
    status: updatedSub.status,
    contactName: updatedSub.contact_name ?? "",
    contactEmail: updatedSub.contact_email ?? "",
    notes: updatedSub.notes ?? undefined,
  };

  let listing: AdminBusinessListing | undefined;
  if (listingData) {
    listing = {
      id: listingData.id,
      slug: listingData.slug,
      businessName: listingData.name,
      category: listingData.category ?? "General",
      priceLevel: listingData.price_level ?? 2,
      address: listingData.address_line1 ?? "",
      phone: listingData.phone ?? undefined,
      websiteUrl: listingData.website_url ?? undefined,
      audience: listingData.audience ?? [],
      tags: listingData.tags ?? [],
      imageUrl: listingData.image_url ?? undefined,
      isPublished: listingData.is_published ?? true,
    };
  }

  return { submission, listing };
}

export async function rejectBusinessSubmission(
  id: string
): Promise<BusinessSubmission | null> {
  const client = supabaseAdmin || supabase;

  const { data, error } = await client
    .from("business_submissions")
    .update({ status: "rejected" })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[Directory] Unable to reject submission:", error?.message);
    return null;
  }

  const slug = slugifyName(data.business_name);
  await client
    .from("business_listings")
    .update({ is_published: false })
    .eq("slug", slug);

  return {
    id: data.id,
    businessName: data.business_name,
    mode: data.mode,
    category: data.category ?? "General",
    priceLevel: data.price_level ?? null,
    shortDescription: data.short_description ?? null,
    address: data.address_line1 ?? null,
    phone: data.phone ?? null,
    websiteUrl: data.website_url ?? null,
    imageUrl: data.image_url ?? null,
    audience: data.audience ?? null,
    tags: data.tags ?? null,
    submittedAt: data.submitted_at,
    status: data.status,
    contactName: data.contact_name ?? "",
    contactEmail: data.contact_email ?? "",
    notes: data.notes ?? undefined,
  };
}

export async function getAdminBusinessListings(): Promise<
  AdminBusinessListing[]
> {
  const client = supabaseAdmin || supabase;

  const { data, error } = await client
    .from("business_listings")
    .select(
      `
      id,
      slug,
      name,
      category,
      price_level,
      address_line1,
      phone,
      website_url,
      audience,
      tags,
      image_url,
      is_published
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[Directory] Listings unavailable:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    businessName: row.name,
    category: row.category ?? "General",
    priceLevel: row.price_level ?? 2,
    address: row.address_line1 ?? "",
    phone: row.phone ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    audience: row.audience ?? [],
    tags: row.tags ?? [],
    imageUrl: row.image_url ?? undefined,
    isPublished: row.is_published ?? true,
  }));
}

/* --------------- PUBLIC DIRECTORY LOADER --------------- */

export async function getPublicBusinessListings(): Promise<
  AdminBusinessListing[]
> {
  const { data, error } = await supabase
    .from("business_listings")
    .select(
      `
      id,
      slug,
      name,
      category,
      price_level,
      address_line1,
      phone,
      website_url,
      audience,
      tags,
      image_url
    `
    )
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("[Directory] Error loading public listings:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    businessName: row.name,
    category: row.category ?? "General",
    priceLevel: row.price_level ?? 2,
    address: row.address_line1 ?? "",
    phone: row.phone ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    audience: row.audience ?? [],
    tags: row.tags ?? [],
    imageUrl: row.image_url ?? undefined,
  }));
}

/* --------------- ADMIN MUTATION: CREATE LISTING --------------- */

export async function createAdminBusinessListing(
  input: Omit<AdminBusinessListing, "id">
): Promise<AdminBusinessListing | null> {
  const { data, error } = await supabase
    .from("business_listings")
    .insert([
      {
        slug: input.slug,
        name: input.businessName,
        category: input.category,
        price_level: input.priceLevel,
        address_line1: input.address,
        phone: input.phone ?? null,
        website_url: input.websiteUrl ?? null,
        audience: input.audience ?? [],
        tags: input.tags ?? [],
        image_url: input.imageUrl ?? null,
        is_published: input.isPublished ?? true,
        source: "admin",
      },
    ])
    .select(
      `
      id,
      slug,
      name,
      category,
      price_level,
      address_line1,
      phone,
      website_url,
      audience,
      tags,
      image_url,
      is_published
    `
    )
    .single();

  if (error || !data) {
    console.error("[Directory] Error creating listing:", error?.message);
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    businessName: data.name,
    category: data.category ?? "General",
    priceLevel: data.price_level ?? 2,
    address: data.address_line1 ?? "",
    phone: data.phone ?? undefined,
    websiteUrl: data.website_url ?? undefined,
    audience: data.audience ?? [],
    tags: data.tags ?? [],
    imageUrl: data.image_url ?? undefined,
    isPublished: data.is_published ?? true,
  };
}
