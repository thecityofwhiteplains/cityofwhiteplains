// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { getPostBySlug, getPublishedPosts } from "@/app/lib/blogQueries";
import EngagementRail from "@/app/components/blog/EngagementRail";
import BlogScrollTracker from "@/app/components/blog/BlogScrollTracker";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
  robotsNoIndex,
} from "@/app/lib/seo";

type BlogPostPageProps = {
  // In Next 16, dynamic route params are a Promise
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) {
    const title = "Post not found | WP Insider Blog";
    const description = "The article you’re looking for could not be found.";
    return {
      title,
      description,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      robots: robotsNoIndex,
      openGraph: {
        title,
        description,
        url: absoluteUrl(`/blog/${slug}`),
        siteName: SITE_NAME,
        images: [DEFAULT_SOCIAL_IMAGE],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [DEFAULT_SOCIAL_IMAGE.url],
      },
    };
  }

  const isDraft = post.status !== "published";
  const title =
    post.metaTitle || `${post.title} | WP Insider Blog`;
  const description =
    post.metaDescription || "Calm, practical guides and stories from White Plains.";
  const image = post.heroImageUrl
    ? { url: post.heroImageUrl, alt: post.title }
    : DEFAULT_SOCIAL_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/blog/${slug}`),
      siteName: SITE_NAME,
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    robots: isDraft ? robotsNoIndex : undefined,
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  const related = (await getPublishedPosts())
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  if (!post) {
    return (
      <div className="bg-[#FAFAFA] text-[#111827]">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
            WP Insider Blog
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
            Post not found
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            We couldn&apos;t find that article. It may have been removed, or it&apos;s
            still in draft mode.
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-flex text-xs font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
          >
            ← Back to WP Insider Blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const {
    title,
    category,
    heroImageUrl,
    publishedAt,
    readingTimeMinutes,
    bodyHtml,
    adEmbedCode,
  } = post;

  const hasAdCode = !!adEmbedCode && adEmbedCode.trim().length > 0;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-[#FAFAFA] text-[#111827]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-8">
        <BlogScrollTracker slug={slug} />
        {/* Breadcrumb */}
        <div className="mb-4 text-[11px] text-[#6B7280]">
          <Link
            href="/blog"
            className="font-semibold text-[#4B5FC6] hover:underline"
          >
            WP Insider Blog
          </Link>{" "}
          <span className="mx-1 text-[#D1D5DB]">/</span>
          <span className="text-[#9CA3AF] line-clamp-1">{title}</span>
        </div>

        {/* Main layout: left rail + article + right sidebar */}
        <div
          className={`grid gap-8 ${
            hasAdCode
              ? "lg:grid-cols-[60px_minmax(0,3fr)_minmax(260px,1fr)]"
              : "lg:grid-cols-[60px_minmax(0,3fr)]"
          }`}
        >
          {/* ---------- LEFT INTERACTION RAIL ---------- */}
          <EngagementRail title={title} slug={slug} />

          {/* ---------- ARTICLE COLUMN ---------- */}
          <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            {/* Category + title + meta */}
            <header className="mb-4 border-b border-[#F3F4F6] pb-4">
              {category && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EA580C]">
                  {category}
                </p>
              )}
              <h1 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
                {title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#9CA3AF]">
                {formattedDate && <span>{formattedDate}</span>}
                {readingTimeMinutes && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-.75 4.5a.75.75 0 011.5 0v3.19l2.22 2.22a.75.75 0 11-1.06 1.06l-2.41-2.4a.75.75 0 01-.22-.53V6.5z" />
                      </svg>
                      {readingTimeMinutes} min read
                    </span>
                  </>
                )}
              </div>
            </header>

            {/* Hero image (if any) */}
            {heroImageUrl && (
              <div className="mb-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]">
                <img
                  src={heroImageUrl}
                  alt={title}
                  className="max-h-[380px] w-full object-cover"
                />
              </div>
            )}

            {/* 🔹 TOP AD SLOT */}
          {hasAdCode && (
            <AdSlot
              code={adEmbedCode}
              label="Top of article ad"
              variant="banner"
            />
          )}

          {/* Article body + inline ad */}
          <section className="mt-4 space-y-6 text-sm leading-relaxed text-[#111827]">
              {/* Inline ad splitting body roughly in half */}
              {bodyHtml ? (() => {
                const parts = bodyHtml.split(/<\/p>/i).filter((p) => p.trim() !== "");
                const midpoint = Math.max(1, Math.floor(parts.length / 2));
                const firstHtml = parts
                  .slice(0, midpoint)
                  .map((p) => (p.trim().startsWith("<p") ? `${p}</p>` : `<p>${p}</p>`))
                  .join("");
                const secondHtml = parts
                  .slice(midpoint)
                  .map((p) => (p.trim().startsWith("<p") ? `${p}</p>` : `<p>${p}</p>`))
                  .join("");

                return (
                  <>
                    {firstHtml && (
                      <div
                        className="prose prose-sm max-w-none prose-p:mb-3 prose-p:text-[#111827] prose-a:text-[#4B5FC6]"
                        dangerouslySetInnerHTML={{ __html: firstHtml }}
                      />
                    )}

                    {hasAdCode && (
                      <div className="mt-8">
                      <AdSlot
                        code={adEmbedCode}
                        label="Inline article ad"
                        variant="inline"
                      />
                      </div>
                    )}

                    {secondHtml && (
                      <div
                        className="prose prose-sm max-w-none prose-p:mb-3 prose-p:text-[#111827] prose-a:text-[#4B5FC6]"
                        dangerouslySetInnerHTML={{ __html: secondHtml }}
                      />
                    )}
                  </>
                );
              })() : (
                <p className="text-sm text-[#6B7280]">
                  No content body has been added yet.
                </p>
              )}
          </section>

            {/* 🔹 BOTTOM AD SLOT */}
            {hasAdCode && (
              <div className="mt-10 border-t border-[#F3F4F6] pt-5">
                <AdSlot
                  code={adEmbedCode}
                  label="Bottom of article ad"
                  variant="banner"
                />
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <section className="mt-10 rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      More from WP Insider
                    </p>
                    <h3 className="text-sm font-semibold text-[#1C1F2A]">
                      Trending guides readers are enjoying
                    </h3>
                  </div>
                  <Link
                    href="/blog"
                    className="text-[11px] font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-[#ECEEF3] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EA580C]">
                        {r.category}
                      </p>
                      <h4 className="mt-1 text-sm font-semibold text-[#1C1F2A] line-clamp-2 group-hover:text-[#4B5FC6]">
                        {r.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-[#6B7280] line-clamp-3">
                        {r.excerpt}
                      </p>
                      <div className="mt-auto pt-3 text-[10px] text-[#9CA3AF]">
                        {new Date(r.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {r.readingTimeMinutes && (
                          <span className="ml-2 inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3 w-3"
                              aria-hidden="true"
                            >
                              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-.75 4.5a.75.75 0 011.5 0v3.19l2.22 2.22a.75.75 0 11-1.06 1.06l-2.41-2.4a.75.75 0 01-.22-.53V6.5z" />
                            </svg>
                            {r.readingTimeMinutes} min read
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back link */}
            <div className="mt-6">
              <Link
                href="/blog"
                className="inline-flex text-xs font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
              >
                ← Back to more stories
              </Link>
            </div>
          </article>

          {/* ---------- RIGHT SIDEBAR (SKYSCRAPER AD) ---------- */}
          {hasAdCode && (
            <aside className="space-y-4">
              <div className="rounded-3xl border border-dashed border-[#E5E7EB] bg-white/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
                  Sponsored
                </p>
                <div className="mt-2 rounded-2xl bg-[#F9FAFB] p-2">
                  <AdSlot
                    code={adEmbedCode}
                    label="Right sidebar skyscraper ad"
                    variant="skyscraper"
                  />
                </div>
                <p className="mt-2 text-[10px] text-[#9CA3AF]">
                  This is the ideal spot for a skyscraper display ad or a tall
                  affiliate widget—visible while visitors read the guide.
                </p>
              </div>
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- AD SLOT COMPONENT ---------- */

type AdSlotProps = {
  code: string | null | undefined;
  label: string;
  variant?: "banner" | "inline" | "skyscraper";
};

function AdSlot({ code, label, variant = "banner" }: AdSlotProps) {
  if (!code) return null;

  const wrapperClass =
    variant === "skyscraper"
      ? "max-w-[280px] max-h-[520px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 shadow-sm"
      : variant === "inline"
      ? "max-h-[240px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 shadow-sm"
      : "max-h-[220px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 shadow-sm";

  // ⚠️ This assumes you trust the HTML (e.g. AdSense / your own code).
  // Make sure only trusted ad code can be saved into adEmbedCode.
  return (
    <div
      className={`w-full ${wrapperClass}`}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
