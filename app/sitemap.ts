import { MetadataRoute } from "next";
import { supabase } from "@/app/lib/supabaseClient";
import { SITE_URL } from "@/app/lib/seo";

// Always fetch fresh data so removed blog posts don't linger in the sitemap.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const staticPaths = [
    "",
    "/visit",
    "/community",
    "/eat-drink",
    "/events",
    "/business",
    "/blog",
    "/list-your-business",
  ];

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at, updated_at, created_at")
    .eq("status", "published");

  const blogEntries: MetadataRoute.Sitemap = (posts || []).map((post) => {
    const lastModified =
      post.updated_at ||
      post.published_at ||
      post.created_at ||
      now.toISOString();

    return {
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(lastModified),
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  return [...staticPages, ...blogEntries];
}
