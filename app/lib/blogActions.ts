// app/lib/blogActions.ts
"use server";

import { supabase } from "./supabaseClient";
import { revalidatePath } from "next/cache";

export async function createBlogPost(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const body_html = formData.get("body_html") as string;
  const category = formData.get("category") as string;
  const published_at = formData.get("published_at") as string;
  const is_published = formData.get("is_published") === "on";
  const hero_image_url = formData.get("hero_image_url") as string;
  const meta_title = formData.get("meta_title") as string;
  const meta_description = formData.get("meta_description") as string;
  const ad_embed_code = formData.get("ad_embed_code") as string;
  const reading_time_minutes = Number(
    formData.get("reading_time_minutes") || 3
  );

  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    excerpt,
    body_html,
    category,
    published_at: published_at || null,
    is_published,
    hero_image_url,
    meta_title,
    meta_description,
    ad_embed_code,
    reading_time_minutes,
  });

  if (error) {
    console.error("Error inserting blog post:", error);
    throw new Error("Failed to create blog post.");
  }

  // Revalidate blog listing + individual post page
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return { success: true };
}