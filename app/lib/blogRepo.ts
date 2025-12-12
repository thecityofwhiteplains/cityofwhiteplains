// app/lib/blogRepo.ts
import { supabase } from "./supabaseClient";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_html: string | null;
  hero_image_url: string | null;
  category: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  ad_embed_code: string | null;
  created_at: string;
  updated_at: string;
};

// Get all published posts ordered by date desc
export async function fetchAllPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return data as BlogPost[];
}

// Get a single post by slug
export async function fetchPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }

  return data as BlogPost | null;
}