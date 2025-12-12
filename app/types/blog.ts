// app/types/blog.ts

export type BlogPostAdminSummary = {
    slug: string;
    title: string;
    category: string;
    status: "draft" | "published";
    publishedAt?: string;
    readingTime?: string;
    metaTitle?: string;
    metaDescription?: string;
    heroImageUrl?: string;
    body?: string;         // full HTML content
    adEmbedCode?: string;  // optional ad block
  };