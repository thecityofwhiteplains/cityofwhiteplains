"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DEFAULT_HOMEPAGE_HERO_IMAGE } from "@/app/lib/constants";
import { trackEvent } from "@/app/lib/analyticsClient";

type BusinessListing = {
  id: string;
  businessName: string;
  category: string;
  priceLevel?: number;
  address: string;
  phone?: string;
  websiteUrl?: string;
  audience: string[];
  tags: string[];
  imageUrl?: string;
};

type Props = {
  listings: BusinessListing[];
  heroImageUrl?: string | null;
};

const FALLBACK_IMAGE =
  "https://placehold.co/600x400?text=White+Plains+Business";

const CATEGORY_LABELS: Record<string, string> = {
  "eat-drink": "Eat & Drink",
  services: "Services",
  "legal-financial": "Legal & Financial",
  "health-wellness": "Health & Wellness",
  shopping: "Shopping",
};

function formatCategoryLabel(category?: string | null): string {
  if (!category) return "Business";
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BusinessPageClient({ listings, heroImageUrl }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<
    "any" | "visitors" | "locals" | "business-owners" | "court-day" | "family"
  >("any");
  const backgroundImage = heroImageUrl?.trim() || DEFAULT_HOMEPAGE_HERO_IMAGE;

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(listings.map((l) => (l.category || "Other").trim()))
    ).filter(Boolean);
    return ["all", ...unique];
  }, [listings]);

  const filteredBusinesses = useMemo(() => {
    return listings.filter((biz) => {
      const categoryMatch =
        activeCategory === "all"
          ? true
          : biz.category?.toLowerCase() === activeCategory.toLowerCase();

      const audienceMatch =
        audienceFilter === "any"
          ? true
          : biz.audience?.map((a) => a.toLowerCase()).includes(audienceFilter);

      return categoryMatch && audienceMatch;
    });
  }, [activeCategory, audienceFilter, listings]);

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#1C1F2A] text-white">
          <div className="absolute inset-0">
            <img
              src={backgroundImage}
              alt="Business directory hero"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-[#4B5FC6]/60" />
          </div>
          <div className="relative max-w-3xl space-y-4 px-5 py-10 sm:px-8 md:py-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white">
              White Plains Business Directory
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              A calm, practical business directory for people who live, work, and
              visit White Plains.
            </h1>
            <p className="text-sm text-slate-100/90">
              To start, the CityOfWhitePlains.org team will seed core listings. Business
              owners can claim their listing, and new businesses can submit themselves
              directly from this page.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-100/90">
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                Core city categories: food, legal, services, health, shopping
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                Claim your business
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                Submit a new listing
              </span>
            </div>
          </div>
        </section>

        {/* Filters + Explainers */}
        <section className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
                Explore businesses
              </h2>
              <p className="text-xs text-[#6B7280]">
                Filter by category and who the business is mainly for. Pulled directly
                from the admin directory.
              </p>
            </div>
          </div>

          {/* Filter controls */}
          <div className="space-y-3 text-[11px]">
            {/* Category filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#6B7280]">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const active = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        trackEvent("page_view", {
                          route: "/business",
                          action: "category_filter",
                          category: cat,
                        });
                      }}
                      className={[
                        "rounded-full border px-3 py-1 transition",
                        active
                          ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#4B5FC6]"
                          : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                      ].join(" ")}
                    >
                      {cat === "all" ? "🌐 All" : formatCategoryLabel(cat)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audience filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#6B7280]">Best for:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "any", label: "Anyone" },
                  { id: "visitors", label: "Visitors" },
                  { id: "locals", label: "Locals / residents" },
                  { id: "business-owners", label: "Business owners" },
                ].map((opt) => {
                  const active = audienceFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAudienceFilter(opt.id as typeof audienceFilter);
                        trackEvent("page_view", {
                          route: "/business",
                          action: "audience_filter",
                          audience: opt.id,
                        });
                      }}
                      className={[
                        "rounded-full border px-3 py-1 transition",
                        active
                          ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#4B5FC6]"
                          : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Admin explain + Add/Claim section */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs md:col-span-2">
            <h2 className="text-sm font-semibold text-[#111827]">
              How listings work (starting out)
            </h2>
            <p className="mt-2 text-[11px] text-[#4B5563]">
              At first, many listings will be added by the CityOfWhitePlains.org admin
              team to create a helpful base directory—especially for visitor-critical
              services like food, printing, and legal support.
            </p>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Business owners can then claim those listings, update details, and later
              unlock more options like promoted placement or featured guides.
            </p>
          </div>

          <div className="rounded-2xl bg-[#1C1F2A] p-4 text-xs text-white">
            <h3 className="text-sm font-semibold">Business not listed yet?</h3>
            <p className="mt-2 text-[11px] text-[#E5E7EB]">
              If you don&apos;t see your business here, you&apos;ll be able to submit a
              new listing with basic details. The admin team will review and publish it
              to the directory.
            </p>
            <Link
              href="/list-your-business"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-[#1C1F2A] hover:bg-[#F3F4F6]"
            >
              List your business →
            </Link>
          </div>
        </section>

        {/* Business cards grid */}
        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>
              Showing{" "}
              <span className="font-semibold text-[#111827]">
                {filteredBusinesses.length}
              </span>{" "}
              listings
            </span>
          </div>

          <div className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBusinesses.map((biz) => {
              const priceLevel = biz.priceLevel ?? 0;
              const filled = "$$$$".slice(0, priceLevel);
              const empty = "$$$$".slice(priceLevel);
              const audChips = biz.audience || [];

              return (
                <article
                  key={biz.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#ECEEF3] bg-white text-xs shadow-sm"
                >
                  {/* Image / banner */}
                  <div className="relative h-28 w-full overflow-hidden bg-[#E5E7EB]">
                    {biz.imageUrl ? (
                      <img
                        src={biz.imageUrl}
                        alt={biz.businessName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EEF0FF] to-[#FFF7ED]">
                        <span className="text-[24px] text-[#4B5FC6]">
                          {formatCategoryLabel(biz.category)}
                        </span>
                      </div>
                    )}
                    {biz.category && (
                      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white">
                        {formatCategoryLabel(biz.category)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#111827]">
                          {biz.businessName}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#4B5563]">
                          {biz.address}
                        </p>
                      </div>

                      {/* Price range */}
                      {priceLevel > 0 && (
                        <div className="text-right text-[10px] text-[#6B7280]">
                          <p>
                            <span className="font-semibold text-[#111827]">
                              {filled}
                            </span>
                            <span className="text-[#D1D5DB]">
                              {empty}
                            </span>
                          </p>
                          <p className="mt-0.5">Price range</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                      {biz.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[#4B5FC6]"
                        >
                          {tag}
                        </span>
                      ))}
                      {audChips.map((aud) => (
                        <span
                          key={aud}
                          className="rounded-full bg-[#F3F4F6] px-2 py-0.5 capitalize text-[#4B5563]"
                        >
                          {aud.replace("-", " ")}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-[10px] text-[#9CA3AF]">
                        Added by admin directory. Owners can contact to update details.
                      </span>

                      <div className="flex gap-1.5">
                        {biz.websiteUrl && (
                          <a
                            href={biz.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() =>
                              trackEvent("outbound_click", {
                                listingId: biz.id,
                                url: biz.websiteUrl,
                              })
                            }
                            className="rounded-full bg-[#1C1F2A] px-3 py-1 text-[11px] font-semibold text-white hover:bg-black"
                          >
                            Visit site
                          </a>
                        )}
                        <Link
                          href={`/list-your-business?business=${encodeURIComponent(
                            biz.id
                          )}`}
                          onClick={() =>
                            trackEvent("claim_click", {
                              listingId: biz.id,
                              category: biz.category,
                              route: "/business",
                            })
                          }
                          className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] text-[#4B5563] hover:bg-[#F3F4F6]"
                        >
                          Update / claim
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Official payments, applications & permits */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#1C1F2A] px-5 py-5 text-xs text-white">
            <h2 className="text-sm font-semibold">
              Online payments &amp; city services
            </h2>
            <p className="mt-2 text-[11px] text-[#E5E7EB]">
              For official City of White Plains bills and payments—like water, property
              tax, parking tickets, and more—use the city&apos;s secure online portals.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://www.cityofwhiteplains.com/820/Online-Payments"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-[#1C1F2A] hover:bg-[#F3F4F6]"
              >
                Online payments hub →
              </a>
              <a
                href="https://www.cityofwhiteplains.com/331/Pay-Parking-Tickets"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-white/15"
              >
                Pay parking tickets →
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 text-xs">
            <h2 className="text-sm font-semibold text-[#111827]">
              Applications &amp; permits (official links)
            </h2>
            <p className="mt-2 text-[11px] text-[#4B5563]">
              For building permits, applications, and other official approvals, we link
              directly to the City of White Plains resources so you&apos;re always using
              the correct, up-to-date forms.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <a
                href="https://www.cityofwhiteplains.com/814/Applications-Permits"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#EEF0FF] px-4 py-1.5 font-semibold text-[#4B5FC6] hover:bg-[#E0E3FF]"
              >
                Applications &amp; permits →
              </a>
              <a
                href="https://www.cityofwhiteplains.com/115/Building-Permits-Applications"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-1.5 font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                Building permits info →
              </a>
            </div>
            <p className="mt-2 text-[10px] text-[#9CA3AF]">
              CityOfWhitePlains.org is independent and simply points you to the official
              municipal pages for anything that involves city approvals or payments.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
