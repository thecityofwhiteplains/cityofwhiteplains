// app/components/home/InsiderBlogSection.tsx
import Link from "next/link";
import type { BlogListItem } from "@/app/lib/blogQueries";

type Props = {
  posts: BlogListItem[];
};

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/4425776/pexels-photo-4425776.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function InsiderBlogSection({ posts }: Props) {
  const featured = posts.slice(0, 4);

  return (
    <section className="mt-10 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A91A0]">
            WP Insider Blog
          </p>
          <h2 className="text-sm font-semibold text-[#1C1F2A]">
            Latest notes from around White Plains
          </h2>
          <p className="text-xs text-[#5A6270]">
            Fresh reads written like a friend showing you around town — not a brochure.
          </p>
        </div>
        <Link
          href="/blog"
          className="text-xs font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
        >
          View all stories →
        </Link>
      </div>

      {/* Horizontal scroll area (mobile-friendly, shows up to 4) */}
      <div className="relative">
        {/* right fade */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#FAFAFA] to-transparent" />

        <div
          className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-thin"
          role="list"
          aria-label="Latest WP Insider Blog posts"
        >
          {featured.map((post) => (
            <article
              key={post.slug}
              role="listitem"
              className="group snap-start shrink-0 w-64 sm:w-72 md:w-[20rem] rounded-2xl border border-[#ECEEF3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image */}
              <div className="relative h-36 sm:h-40 w-full overflow-hidden rounded-t-2xl">
                <img
                  src={post.heroImageUrl || FALLBACK_IMAGE}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {post.category && (
                  <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {post.category}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 p-4 text-xs text-[#5A6270]">
                <div className="flex items-center gap-2 text-[10px] text-[#8A91A0]">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-[11px]">🕒</span>
                    <span>
                      {post.readingTimeMinutes
                        ? `${post.readingTimeMinutes} min read`
                        : "Quick read"}
                    </span>
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-[#E5E7EB] sm:inline-flex" />
                  <span className="hidden sm:inline-flex text-[10px] text-[#8A91A0]">
                    New this week
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#1C1F2A] line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-[11px] text-[#5A6270] line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-semibold text-[#4B5FC6] hover:underline"
                  >
                    Read story →
                  </Link>
                  <span className="text-[10px] text-[#8A91A0]">
                    Local insight
                  </span>
                </div>
              </div>
            </article>
          ))}

          {featured.length === 0 && (
            <div className="snap-start shrink-0 w-full rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270]">
              <p className="font-semibold text-[#1C1F2A]">No posts yet</p>
              <p className="mt-1 text-[11px] text-[#8A91A0]">
                Publish your first post from the admin dashboard to see it featured here.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[#8A91A0]">
        Swipe on mobile to see the latest posts. Newest four show up automatically from
        the WP Insider Blog.
      </p>
    </section>
  );
}
