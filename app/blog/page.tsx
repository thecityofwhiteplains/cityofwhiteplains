// app/blog/page.tsx
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getPublishedPosts } from "../lib/blogQueries";
import { SITE_NAME, absoluteUrl } from "../lib/seo";
import BlogListWithFilter from "../components/blog/BlogListWithFilter";

export const metadata: Metadata = {
  title: "WP Insider Blog | CityOfWhitePlains.org",
  description:
    "Local, calm, visitor-first stories and guides from CityOfWhitePlains.org—practical tips for court days, quick visits, family time, and downtown life.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "WP Insider Blog",
    description:
      "Local, calm, visitor-first stories and guides from CityOfWhitePlains.org.",
    url: absoluteUrl("/blog"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url:
          "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "WP Insider Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WP Insider Blog",
    description:
      "Local, calm, visitor-first stories and guides from CityOfWhitePlains.org.",
    images: [
      "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

// Always fetch fresh posts so new ones appear immediately.
export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-8">
        <BlogListWithFilter posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
