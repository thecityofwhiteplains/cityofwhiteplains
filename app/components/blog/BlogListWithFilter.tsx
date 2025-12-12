"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogListItem } from "@/app/lib/blogQueries";

type Props = {
  posts: BlogListItem[];
};

export default function BlogListWithFilter({ posts }: Props) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const filtered =
    selectedCategory === "All"
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Hero + featured */}
      <section className="rounded-3xl bg-gradient-to-br from-[#FFF7ED] via-white to-[#EEF0FF] px-5 py-8 sm:px-8 md:py-10">
        <div className="flex flex-wrap items-center gap-2 pb-4 text-[11px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 font-medium uppercase tracking-[0.2em] text-[#EA580C]">
            WP Insider Blog
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={[
                    "rounded-full border px-3 py-1 text-[11px] font-semibold transition",
                    active
                      ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                      : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Stories from the people who actually use White Plains.
            </h1>
            <p className="text-xs text-[#4B5563]">
              Calm, honest guides for court days, quick visits, weekends with kids, and
              anyone trying to make the most of a short stay.
            </p>
          </div>

          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {featured.heroImageUrl && (
                <div className="relative h-32 w-full overflow-hidden sm:h-36">
                  <Image
                    src={featured.heroImageUrl}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 90vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                    priority
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EA580C]">
                  Featured · {featured.category}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-[#1C1F2A] line-clamp-2">
                  {featured.title}
                </h2>
                <p className="mt-1 text-[11px] text-[#6B7280] line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-[#9CA3AF]">
                  <span>
                    {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>
                    {featured.readingTimeMinutes
                      ? `${featured.readingTimeMinutes} min read`
                      : ""}
                  </span>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-[#4B5FC6]">
                  Read the guide →
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Rest of posts grid */}
      {rest.length > 0 ? (
        <section className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
                More from WP Insider
              </h2>
              <p className="text-xs text-[#6B7280]">
                Browse short, useful reads based on how people actually move through White
                Plains.
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#ECEEF3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {post.heroImageUrl && (
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={post.heroImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EA580C]">
                    {post.category}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[#1C1F2A] line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#6B7280] line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-[#9CA3AF]">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      {post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : ""}
                    </span>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[11px] font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
                    >
                      Read article →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-6 text-xs text-[#6B7280]">
          <p className="font-semibold text-[#111827]">No posts in this category yet.</p>
          <p className="mt-1">Try another filter to see more stories.</p>
        </section>
      )}
    </>
  );
}
