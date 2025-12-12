"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_HOMEPAGE_HERO_IMAGE } from "@/app/lib/constants";
import type { EatCategory, EatPlace } from "@/app/types/eatDrink";

type CategoryId = EatCategory;

const categories: { id: CategoryId; label: string; description: string }[] = [
  {
    id: "coffee",
    label: "Coffee & Reset",
    description: "Good for a quiet moment before or after something heavy.",
  },
  {
    id: "breakfast",
    label: "Breakfast & Brunch",
    description: "Start of the day spots—especially helpful on court days or family mornings.",
  },
  {
    id: "lunch",
    label: "Lunch",
    description: "Simple midday options between appointments or errands.",
  },
  {
    id: "dinner",
    label: "Dinner",
    description: "Sit-down or slower evening meals.",
  },
  {
    id: "quick-bite",
    label: "Quick Bites",
    description: "In-and-out food when time or energy is low.",
  },
];

type Props = {
  heroImageUrl?: string | null;
  places: EatPlace[];
  featuredIds?: string[];
};

export default function EatDrinkPageClient({
  heroImageUrl,
  places,
  featuredIds = [],
}: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState<
    "any" | "court-day" | "family" | "no-car"
  >("any");
  const [localPlaces, setLocalPlaces] = useState<EatPlace[]>(places);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalPlaces(places);
  }, [places]);

  const backgroundImage = heroImageUrl?.trim() || DEFAULT_HOMEPAGE_HERO_IMAGE;

  const filteredPlaces = useMemo(() => {
    return localPlaces.filter((place) => {
      const categoryMatch =
        activeCategory === "all" ? true : place.category === activeCategory;

      let visitMatch = true;
      if (visitTypeFilter === "court-day") {
        visitMatch = place.goodFor.includes("Court day") || place.goodFor.includes("After court");
      } else if (visitTypeFilter === "family") {
        visitMatch = place.goodFor.includes("Family day") || place.goodFor.includes("Kids");
      } else if (visitTypeFilter === "no-car") {
        visitMatch = place.goodFor.includes("No-car visits");
      }

      return categoryMatch && visitMatch;
    });
  }, [activeCategory, visitTypeFilter, localPlaces]);

  const featuredPlaces = useMemo(() => {
    const picks = featuredIds
      .map((id) => localPlaces.find((p) => p.id === id))
      .filter(Boolean) as EatPlace[];
    if (picks.length > 0) return picks.slice(0, 3);
    return localPlaces.slice(0, 3);
  }, [featuredIds, localPlaces]);

  async function handleVote(id: string, direction: "up" | "down") {
    setVotingId(id);
    setToast(null);
    // optimistic update
    setLocalPlaces((prev) =>
      prev.map((spot) => {
        if (spot.id !== id) return spot;
        const up = spot.upVotes ?? 0;
        const down = spot.downVotes ?? 0;
        return {
          ...spot,
          upVotes: direction === "up" ? up + 1 : up,
          downVotes: direction === "down" ? down + 1 : down,
        };
      })
    );
    try {
      const res = await fetch("/api/eat-drink/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      });
      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({})))?.error || "Unable to vote");
      }
      const data = await res.json();
      if (data?.spots) {
        setLocalPlaces(data.spots);
      }
      setToast({ type: "success", message: "Thanks for your vote!" });
    } catch (err: any) {
      setToast({ type: "error", message: err?.message || "Unable to vote right now." });
      // rollback by refetching from props
      setLocalPlaces((prev) =>
        prev.map((spot) => {
          if (spot.id !== id) return spot;
          const original = places.find((p) => p.id === id);
          return original || spot;
        })
      );
    } finally {
      setVotingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-8">
      {toast && (
        <div
          className={[
            "mb-3 rounded-xl px-4 py-2 text-[11px] shadow-sm",
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100",
          ].join(" ")}
        >
          {toast.message}
        </div>
      )}
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1C1F2A] text-white">
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Eat and drink in White Plains"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-[#4B5FC6]/60" />
        </div>
        <div className="relative max-w-3xl space-y-4 px-5 py-10 sm:px-8 md:py-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white">
            Eat &amp; Drink in White Plains
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Food and coffee choices that match the kind of day you&apos;re having.
          </h1>
          <p className="text-sm text-slate-100/90">
            This page is for real visits: court dates, family weekends, no-car train
            trips, and long work days. Start with how your day feels, then pick
            something that supports that—not the other way around.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-100/90">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Court day reset spots
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Family-friendly picks
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              No-car friendly
            </span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
              Find something that fits today
            </h2>
            <p className="text-xs text-[#6B7280]">
              Start with your situation, then narrow down by type of spot. These examples
              will later connect to real places.
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-3 text-[11px]">
          {/* Visit type filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#6B7280]">Visit type:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "any", label: "Any day" },
                { id: "court-day", label: "Court day" },
                { id: "family", label: "Family / kids" },
                { id: "no-car", label: "No-car visit" },
              ].map((opt) => {
                const active = visitTypeFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setVisitTypeFilter(opt.id as typeof visitTypeFilter)
                    }
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

          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#6B7280]">Type of spot:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={[
                    "rounded-full border px-3 py-1 transition",
                    activeCategory === "all"
                      ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#4B5FC6]"
                      : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  All
                </button>
                {Array.from(new Set(places.map((p) => p.category))).map((cat) => {
                  const active = activeCategory === cat;
                  const label =
                    categories.find((c) => c.id === cat)?.label || cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={[
                        "rounded-full border px-3 py-1 transition",
                        active
                          ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#4B5FC6]"
                          : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

      {/* Top picks */}
      <section className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              Here’s where everyone’s going
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              Top 3 spots people are choosing right now.
            </p>
          </div>
          <span className="text-[10px] text-[#9CA3AF]">Updated daily.</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:p-0">
          {featuredPlaces.map((place) => (
            <article
              key={`featured-${place.id}`}
              className="flex min-w-[260px] flex-col rounded-2xl bg-gradient-to-br from-[#1C1F2A] via-[#2F3F99] to-[#4B5FC6] p-3 text-[11px] text-white shadow-lg ring-1 ring-[#4B5FC6]/30 sm:min-w-0 sm:w-full sm:p-4"
            >
              <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10">
                {place.imageUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={place.imageUrl}
                      alt={place.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-white/10 text-[11px] text-white/80">
                    Image coming soon.
                  </div>
                )}
                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-[#111827]/80 px-3 py-1 text-[10px] font-semibold text-white shadow-sm ring-1 ring-white/30 backdrop-blur">
                  ⭐ Crowd favorite
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <h3 className="text-sm font-semibold">{place.name}</h3>
                  <p className="mt-1 text-[11px] text-white/80">{place.shortDescription}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {place.goodFor.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/15 px-2 py-0.5 text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/80">
                  <span className="rounded-full bg-white/15 px-2 py-1 border border-white/20">
                    {categories.find((c) => c.id === place.category)?.label || place.category}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-1 border border-white/20">
                    {place.budget} • {place.vibe.replace("-", " ")}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Places grid */}
      <section className="mt-8 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>
            Showing{" "}
            <span className="font-semibold text-[#111827]">
              {filteredPlaces.length}
            </span>{" "}
            example spots
          </span>
          <span className="hidden sm:inline">All current spots.</span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filteredPlaces.map((place) => {
            const categoryLabel =
              categories.find((c) => c.id === place.category)?.label ||
              place.category;
            const mapHref =
              place.mapsUrl?.trim() ||
              (place.address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
                : null);

            return (
              <article
                key={place.id}
                className="flex flex-col rounded-2xl border border-[#ECEEF3] bg-white p-3 text-[11px] shadow-sm"
              >
                <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]">
                  {place.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={place.imageUrl}
                        alt={place.name}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#EEF0FF] to-[#E5E7EB] text-[11px] text-[#6B7280]">
                      Photo coming soon.
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2 text-[10px]">
                    <span className="rounded-full bg-white/90 px-2 py-1 font-semibold text-[#1C1F2A] shadow-sm">
                      {categoryLabel}
                    </span>
                    <span className="rounded-full bg-white/80 px-2 py-1 text-[#4B5563] shadow-sm">
                      {place.budget} • {place.vibe.replace("-", " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                  <h3 className="text-sm font-semibold text-[#111827]">
                    {place.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#4B5563]">
                    {place.shortDescription}
                  </p>
                  {place.address && (
                    <a
                      href={
                        mapHref ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#4B5FC6] hover:text-[#2F3F99]"
                    >
                      {place.address}
                    </a>
                  )}
                  {place.phone && (
                    <div className="mt-0.5 text-[10px] text-[#4B5563]">
                      <a
                        href={`tel:${place.phone.replace(/[^0-9+]/g, "")}`}
                        className="font-semibold text-[#4B5FC6] hover:text-[#2F3F99]"
                      >
                        {place.phone}
                      </a>
                    </div>
                  )}
                  {place.websiteUrl && (
                    <div className="mt-0.5 text-[10px]">
                      <a
                        href={place.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#4B5FC6] hover:text-[#2F3F99]"
                      >
                        Website ↗
                      </a>
                    </div>
                  )}
                </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {place.goodFor.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[#4B5FC6]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                      <button
                        type="button"
                        onClick={() => handleVote(place.id, "up")}
                        disabled={votingId === place.id}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] px-3 py-1 text-[#1C1F2A] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        👍 <span className="font-semibold">{place.upVotes ?? 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote(place.id, "down")}
                        disabled={votingId === place.id}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] px-3 py-1 text-[#1C1F2A] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        👎 <span className="font-semibold">{place.downVotes ?? 0}</span>
                      </button>
                    </div>
                    {place.menuUrl ? (
                      <a
                        href={place.menuUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-3 py-1 text-[11px] font-semibold text-white hover:bg-black"
                      >
                        Menu
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#E5E7EB] px-3 py-1 text-[11px] font-semibold text-[#9CA3AF]">
                        Menu not added
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Connect back to Visit & Business */}
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 text-xs">
          <h2 className="text-sm font-semibold text-[#111827]">
            Pair this with a Visit guide
          </h2>
          <p className="mt-2 text-[11px] text-[#4B5563]">
            Not sure how this fits into your actual day? Use the Visit page
            guides for court days, family days, or no-car visits and drop one of
            these spots into that flow.
          </p>
          <Link
            href="/visit"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-[#EEF0FF] px-4 py-1.5 text-[11px] font-semibold text-[#4B5FC6] hover:bg-[#E0E3FF]"
          >
            Open Visit White Plains →
          </Link>
        </div>

        <div className="rounded-2xl bg-[#1C1F2A] px-5 py-5 text-xs text-white">
          <h2 className="text-sm font-semibold">For local restaurants & cafés</h2>
          <p className="mt-2 text-[11px] text-[#E5E7EB]">
            Soon, this page will highlight real White Plains businesses with
            clear, honest descriptions of what they&apos;re good for—court days,
            family visits, late-night bites, and more.
          </p>
          <p className="mt-1 text-[11px] text-[#9CA3AF]">
            You&apos;ll be able to claim or submit your listing, and optionally
            boost visibility.
          </p>
          <Link
            href="/list-your-business"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-[#1C1F2A] hover:bg-[#F3F4F6]"
          >
            List your business →
          </Link>
        </div>
      </section>
    </main>
  );
}
