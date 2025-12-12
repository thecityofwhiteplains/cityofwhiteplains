import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const STATIC_PAGES = [
  { title: "Home", href: "/" },
  { title: "Visit White Plains", href: "/visit" },
  { title: "Eat & Drink", href: "/eat-drink" },
  { title: "Events", href: "/events" },
  { title: "Business Directory", href: "/business" },
  { title: "List Your Business", href: "/list-your-business" },
  { title: "WP Insider Blog", href: "/blog" },
];

type SearchResult = {
  title: string;
  href: string;
  type: "page" | "blog" | "business";
  snippet?: string | null;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const like = `%${query}%`;

  const [blogRes, businessRes] = await Promise.all([
    supabaseAdmin
      .from("blog_posts")
      .select("slug,title,meta_description")
      .eq("status", "published")
      .ilike("title", like)
      .limit(5),
    supabaseAdmin
      .from("business_listings")
      .select("slug,name,category,short_description")
      .eq("is_published", true)
      .or(`name.ilike.${like},category.ilike.${like},short_description.ilike.${like}`)
      .limit(5),
  ]);

  const results: SearchResult[] = [];

  // Static pages first
  STATIC_PAGES.forEach((page) => {
    if (page.title.toLowerCase().includes(query.toLowerCase())) {
      results.push({ ...page, type: "page" });
    }
  });

  if (blogRes.data) {
    blogRes.data.forEach((row) => {
      results.push({
        title: row.title,
        href: `/blog/${row.slug}`,
        type: "blog",
        snippet: row.meta_description ?? null,
      });
    });
  }

  if (businessRes.data) {
    businessRes.data.forEach((row) => {
      results.push({
        title: row.name,
        href: `/business#${row.slug}`,
        type: "business",
        snippet: row.short_description ?? row.category ?? null,
      });
    });
  }

  return NextResponse.json({ results });
}
