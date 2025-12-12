// app/lib/blogQueries.ts
import { supabase } from "@/app/lib/supabaseClient";
import type { BlogPostAdminSummary } from "@/app/types/blog";

/**
 * Shape of the raw row in Supabase `blog_posts` table.
 * Adjust field names/types if your schema is slightly different.
 */
export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  status: "draft" | "published" | null;
  published_at: string | null;
  reading_time: number | null; // INT minutes
  meta_title: string | null;
  meta_description: string | null;
  hero_image_url: string | null;
  body_html: string | null; // 🔹 actual column in your table
  ad_embed_code: string | null;
  created_at: string | null;
};

/**
 * Public-facing blog card type for /blog
 */
export type BlogListItem = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  heroImageUrl?: string;
  publishedAt: string;
  readingTimeMinutes?: number;
};

/**
 * Full post for /blog/[slug]
 */
export type BlogFullPost = {
  slug: string;
  title: string;
  category: string;
  status: "draft" | "published";
  publishedAt?: string;
  readingTimeMinutes?: number;
  metaTitle?: string;
  metaDescription?: string;
  heroImageUrl?: string;
  bodyHtml?: string;
  adEmbedCode?: string;
};

/**
 * 🔹 Admin list – used by AdminDashboardClient as `initialPosts`
 */
export async function getAdminPosts(): Promise<BlogPostAdminSummary[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      slug,
      title,
      category,
      status,
      published_at,
      reading_time,
      meta_title,
      meta_description,
      hero_image_url,
      body_html,
      ad_embed_code
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[WP Blog] Error loading admin posts:", error?.message);
    return [];
  }

  return data.map((row: any) => ({
    slug: row.slug,
    title: row.title,
    category: row.category ?? "Guide",
    status: (row.status as "draft" | "published") ?? "draft",
    publishedAt: row.published_at ?? undefined,
    // stringify so it fits the `string` field you used in the admin form
    readingTime: row.reading_time != null ? String(row.reading_time) : undefined,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    heroImageUrl: row.hero_image_url ?? undefined,
    body: row.body_html ?? undefined,
    adEmbedCode: row.ad_embed_code ?? undefined,
  }));
}

/**
 * 🔹 Public list – used on /blog page
 */
export async function getPublishedPosts(): Promise<BlogListItem[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      slug,
      title,
      category,
      status,
      published_at,
      reading_time,
      meta_description,
      hero_image_url,
      created_at
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("[WP Blog] Error loading posts:", error?.message);
    return [];
  }

  return (data as BlogPostRow[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    category: row.category || "Guide",
    excerpt:
      row.meta_description ||
      "Local, calm visitor-first guide from CityOfWhitePlains.org.",
    heroImageUrl: row.hero_image_url || undefined,
    publishedAt: row.published_at || row.created_at || new Date().toISOString(),
    readingTimeMinutes: row.reading_time || undefined,
  }));
}

/**
 * 🔹 Single post for /blog/[slug]
 */
export async function getPostBySlug(
  slug: string
): Promise<BlogFullPost | null> {
  // Guard: no useless call if slug missing
  if (!slug) {
    console.warn("[WP Blog] getPostBySlug called without a slug.");
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      title,
      category,
      status,
      published_at,
      reading_time,
      meta_title,
      meta_description,
      hero_image_url,
      body_html,
      ad_embed_code,
      created_at
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[WP Blog] Error loading single post:", error);
    return null;
  }

  if (!data) {
    console.warn("[WP Blog] No blog_posts row found for slug:", slug);
    return null;
  }

  return {
    slug: data.slug,
    title: data.title,
    category: data.category ?? "Guide",
    status: (data.status as "draft" | "published") ?? "draft",
    publishedAt: data.published_at ?? data.created_at ?? undefined,
    readingTimeMinutes: data.reading_time ?? undefined,
    metaTitle: data.meta_title ?? undefined,
    metaDescription: data.meta_description ?? undefined,
    heroImageUrl: data.hero_image_url ?? undefined,
    bodyHtml: data.body_html ?? undefined, // 🔹 map DB `body_html` → front-end `bodyHtml`
    adEmbedCode: data.ad_embed_code ?? undefined,
  };
}
