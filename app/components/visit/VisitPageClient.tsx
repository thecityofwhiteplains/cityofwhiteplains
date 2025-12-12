"use client";

import { useState } from "react";
import { DEFAULT_HOMEPAGE_HERO_IMAGE } from "@/app/lib/constants";
import Link from "next/link";
import type { AffiliateAd } from "@/app/lib/ads";

type GuideId = "court-day" | "family-day" | "no-car";

const guides: {
  id: GuideId;
  label: string;
  tone: string;
  badge: string;
  summary: string;
  highlights: { title: string; items: string[] }[];
}[] = [
  {
    id: "court-day",
    label: "Court Day – Keep It Calm",
    tone: "For people visiting White Plains because of a court date or legal appointment.",
    badge: "Court Day Guide",
    summary:
      "Simple, calm ideas to make a stressful day feel a little more controlled: where to arrive, where to sit, where to breathe.",
    highlights: [
      {
        title: "Before your appearance",
        items: [
          "Aim to arrive in White Plains at least 45–60 minutes early, especially if you’re unfamiliar with the area.",
          "If you’re coming by train, give yourself a moment at the station to check your paperwork and phone battery.",
          "Grab a light snack and water nearby so you’re not sitting in court hungry or jittery.",
        ],
      },
      {
        title: "During breaks",
        items: [
          "Step outside for a short walk instead of waiting in a crowded hallway the entire time.",
          "Keep one calm place in mind—a quiet coffee shop or bench—where you can reset between sessions.",
          "Use breaks to check in with anyone supporting you (family, attorney, friend) instead of spiraling on your own.",
        ],
      },
      {
        title: "After court",
        items: [
          "Don’t rush straight out of the city—take 10–15 minutes to decompress with a short walk in the downtown area.",
          "If things went well, mark the moment with a small treat—coffee, a pastry, or a short sit-down meal.",
          "If you have a follow-up date, add it to your calendar before you leave White Plains.",
        ],
      },
    ],
  },
  {
    id: "family-day",
    label: "Kids & Family Day – Light and Simple",
    tone: "For parents, guardians, and relatives looking for a low-stress day with the kids.",
    badge: "Family Day",
    summary:
      "A simple loop that doesn’t overload the day: a little movement, a little food, a little fun, all within easy reach.",
    highlights: [
      {
        title: "Easy start to the day",
        items: [
          "Choose one kid-friendly breakfast spot and stick to it—too many options can turn into decision fatigue.",
          "Bring a small ‘day bag’ with wipes, snacks, charger, and a light layer for everyone—weather can shift.",
          "Let the kids know the plan in simple steps: ‘breakfast, park, snack, home.’",
        ],
      },
      {
        title: "Move, then snack",
        items: [
          "Plan an hour of movement first (park, short walk, or playground) so kids burn energy before sitting to eat.",
          "Look for spots with restrooms nearby—small detail, big difference.",
          "Build in a calm snack break instead of rushing from one activity to the next.",
        ],
      },
      {
        title: "Keep the ending soft",
        items: [
          "End the day with something low-key: a treat, a short stroll, or a library/indoor stop if the weather turns.",
          "Don’t try to do everything in one visit—leave one or two ideas for next time.",
          "If you’re visiting family in White Plains, schedule your arrival so kids have some quiet time before bed.",
        ],
      },
    ],
  },
  {
    id: "no-car",
    label: "No-Car Visit – Downtown Loop",
    tone: "For people arriving by train or staying nearby without a car.",
    badge: "No-Car Loop",
    summary:
      "White Plains works well on foot if you keep to a simple downtown triangle: train station, Main Street, and Mamaroneck Ave.",
    highlights: [
      {
        title: "Arriving without a car",
        items: [
          "From the train or bus, keep your first stop close—coffee, restroom, or a quick breakfast within a short walk.",
          "Travel light if you can; one small bag makes moving through downtown much easier.",
          "If your hotel is walkable from the station, check if they can hold your bag before check-in time.",
        ],
      },
      {
        title: "A simple walking loop",
        items: [
          "Pick one stretch to stroll—Main Street or Mamaroneck Avenue—and explore slowly instead of zig-zagging everywhere.",
          "Anchor your day around 2–3 spots: one place to eat, one place to sit, and one place to wander or people-watch.",
          "Use rideshare only for quick “jumps” outside the core; keep most of your time on foot in the central area.",
        ],
      },
      {
        title: "Heading back home",
        items: [
          "Plan to be at the station 10–15 minutes before departure so you’re not sprinting the last block.",
          "Grab water and a small snack before boarding—it’s a small thing that makes the ride back easier.",
          "If you think you’ll be back, make a quick note on your phone of any spots you want to try next time.",
        ],
      },
    ],
  },
];

const guideCards: Record<
  GuideId,
  { title: string; description: string; tag: string; link?: string }[]
> = {
  "court-day": [
    {
      title: "Courthouse Commons",
      description:
        "Quick coffee and a calm bench across from the courthouse—good for a 10-minute reset between sessions.",
      tag: "5 min walk",
      link:
        "https://maps.google.com/?q=White+Plains+City+Court,+77+S+Bway,+White+Plains,+NY+10601",
    },
    {
      title: "Renaissance Plaza benches",
      description:
        "Open-air seating with space to breathe. Handy if you need a quiet call or to review notes.",
      tag: "Flat, stroller-friendly",
      link:
        "https://maps.google.com/?q=Renaissance+Plaza,+Mamaroneck+Ave,+White+Plains,+NY",
    },
    {
      title: "Public Library pods",
      description:
        "White Plains Library has calm corners, outlets, and restrooms—good for longer breaks.",
      tag: "Indoor backup",
      link: "https://whiteplainslibrary.org/",
    },
  ],
  "family-day": [
    {
      title: "Playground at Tibbets Park",
      description:
        "Shaded play area with room to run before meals. Restrooms nearby in the mall if needed.",
      tag: "Easy energy burn",
      link: "https://maps.google.com/?q=Tibbets+Park,+White+Plains,+NY",
    },
    {
      title: "White Plains Library Trove",
      description:
        "Children’s section with books and soft seating—perfect weather backup or calm-down stop.",
      tag: "Indoor, stroller-friendly",
      link: "https://whiteplainslibrary.org/children/",
    },
    {
      title: "City Center food court",
      description:
        "Mix of quick options so everyone can pick something fast. Easy stroller access and seating.",
      tag: "Fast eats",
      link:
        "https://maps.google.com/?q=City+Center+15+Mamaroneck+Ave,+White+Plains,+NY",
    },
  ],
  "no-car": [
    {
      title: "Station-to-Main street loop",
      description:
        "Leave the station, head to Main Street for coffee, then drift down Mamaroneck Ave for lunch.",
      tag: "Walkable loop",
      link:
        "https://maps.google.com/?q=White+Plains+Station+to+Main+St+to+Mamaroneck+Ave+walk",
    },
    {
      title: "Bronx River Pathway",
      description:
        "Short, flat stretch for a breather without leaving downtown. Good for a 20–30 minute walk.",
      tag: "Green escape",
      link:
        "https://maps.google.com/?q=Bronx+River+Pathway,+White+Plains,+NY",
    },
    {
      title: "Galleria transit hub block",
      description:
        "Transit-adjacent block with food, restrooms, and ride-share pickup. Easy pivot point for the day.",
      tag: "Transit friendly",
      link:
        "https://maps.google.com/?q=Galleria+at+White+Plains,+100+Main+St,+White+Plains,+NY",
    },
  ],
};

type Props = {
  heroImageUrl?: string | null;
  weatherHigh?: string;
  weatherLow?: string;
  lodgingAd?: AffiliateAd | null;
  rentalsAd?: AffiliateAd | null;
  transportAd?: AffiliateAd | null;
};

export default function VisitPageClient({
  heroImageUrl,
  weatherHigh,
  weatherLow,
  lodgingAd,
  rentalsAd,
  transportAd,
}: Props) {
  const [openGuide, setOpenGuide] = useState<GuideId | null>("court-day");
  const backgroundImage = heroImageUrl?.trim() || DEFAULT_HOMEPAGE_HERO_IMAGE;
  const displayHigh = weatherHigh ?? "—";
  const displayLow = weatherLow ?? "—";
  const domainLabel = (link: string) => {
    try {
      const url = new URL(link);
      return url.hostname.replace("www.", "");
    } catch {
      return link;
    }
  };
  const ctaAds: AffiliateAd[] = [
    lodgingAd || {
      id: "fallback-lodging",
      title: "Find hotels in White Plains (Booking.com)",
      subtitle: "Walkable stays near Main St & Mamaroneck Ave",
      buttonText: "Book now",
      link: "https://www.booking.com/index.html",
      placement: "visit_lodging",
      partner: "Booking.com",
    },
    rentalsAd || {
      id: "fallback-rentals",
      title: "Vacation rentals and suites (Vrbo)",
      subtitle: "Multi-room stays for groups and families",
      buttonText: "See rentals",
      link: "https://www.vrbo.com/",
      placement: "visit_rentals",
      partner: "Vrbo",
    },
    transportAd || {
      id: "fallback-transport",
      title: "Book a car near White Plains (Discovercars)",
      subtitle: "Pick up close to the train and downtown",
      buttonText: "Book a car",
      link: "https://www.discovercars.com/",
      placement: "transport",
      partner: "Discovercars",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1C1F2A] text-white">
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Visit White Plains hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-[#4B5FC6]/60" />
        </div>
        <div className="relative max-w-3xl space-y-4 px-5 py-10 sm:px-8 md:py-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white">
            Visit White Plains
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Calm, practical ideas for the way people actually visit White Plains.
          </h1>
          <p className="text-sm text-slate-100/90">
            Whether you&apos;re here for court, seeing family, in town on business,
            or just passing through without a car, this page is built for real
            visits—not stock travel photos.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-100/90">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Court day visitors
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Families &amp; kids
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              No-car stays
            </span>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-[#FFE8A3] backdrop-blur md:right-6 md:top-6">
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFF4BF]">
                Today in White Plains
              </span>
              <span className="text-sm">
                High {displayHigh} / Low {displayLow}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate CTA row */}
      <section className="mt-6 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {ctaAds.map((ad, idx) => {
          const fallbackImages = [
            "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
          ];
          const image = ad.imageUrl || fallbackImages[idx] || fallbackImages[0];
          const partner = ad.partner || domainLabel(ad.link);
          return (
            <a
              key={ad.id}
              href={ad.link}
              className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute inset-0">
                <img src={image} alt={ad.title} className="h-full w-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="relative flex h-full flex-col justify-between p-4 text-white">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                    {partner}
                  </span>
                  <p className="text-sm font-semibold leading-snug">{ad.title}</p>
                {ad.subtitle && ad.subtitle.trim().length > 0 && (
                  <p className="text-[11px] font-semibold text-[#FBBF24]">
                    {ad.subtitle}
                  </p>
                )}
              </div>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-white/90">
                  {ad.buttonText || (ad as any).button_text || "Open link"} <span aria-hidden>↗</span>
              </span>
            </div>
          </a>
        );
        })}
      </section>

      <p className="mt-2 text-[10px] text-[#6B7280]">
        Some recommendations use affiliate links (Booking.com, Expedia, Vrbo, Ticketmaster, car rentals).
        We only surface options that fit visitors and residents; using them supports this site.
      </p>

      {/* Smart day guides */}
      <section className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
              Smart day guides
            </h2>
            <p className="text-xs text-[#6B7280]">
              Choose the situation that fits you best and tap to expand simple,
              step-by-step ideas for your day.
            </p>
          </div>
        </div>

        {/* Mobile: inline accordions */}
        <div className="mt-2 space-y-3 lg:hidden">
          {guides.map((guide) => {
            const active = openGuide === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenGuide((prev) => (prev === guide.id ? null : guide.id))
                  }
                  className="w-full px-4 py-3 text-left text-xs"
                >
                  <p
                    className={[
                      "text-[11px] font-semibold uppercase tracking-[0.16em]",
                      active ? "text-[#4B5FC6]" : "text-[#6B7280]",
                    ].join(" ")}
                  >
                    {guide.badge}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#111827]">
                    {guide.label}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B7280] line-clamp-3">
                    {guide.tone}
                  </p>
                </button>
                {active && (
                  <div className="space-y-3 border-t border-[#E5E7EB] px-4 py-3 text-xs">
                    <p className="text-[11px] text-[#4B5563]">
                      {guide.summary}
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                        Places that fit this plan
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-1 pt-1 snap-x snap-mandatory">
                        {guideCards[guide.id]?.map((card) => (
                          <div
                            key={card.title}
                            className="snap-start w-64 shrink-0 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4B5FC6]">
                              {card.tag}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">
                              {card.title}
                            </p>
                            <p className="mt-1 text-[11px] text-[#4B5563]">
                              {card.description}
                            </p>
                            {card.link ? (
                              <Link
                                href={card.link}
                                className="mt-2 inline-flex items-center text-[11px] font-semibold text-[#4B5FC6] hover:underline"
                              >
                                Open in maps →
                              </Link>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {guide.highlights.map((block) => (
                        <div
                          key={block.title}
                          className="rounded-xl bg-[#F9FAFB] p-3"
                        >
                          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                            {block.title}
                          </h4>
                          <ul className="mt-2 space-y-1 text-[11px] text-[#4B5563]">
                            {block.items.map((item) => (
                              <li key={item} className="flex gap-1">
                                <span className="mt-[3px] inline-block h-1 w-1 rounded-full bg-[#9CA3AF]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: two-column layout */}
        <div className="mt-2 hidden gap-4 lg:grid lg:grid-cols-3">
          {/* Left: guide selector buttons */}
          <div className="space-y-2 lg:col-span-1">
            {guides.map((guide) => {
              const active = openGuide === guide.id;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() =>
                    setOpenGuide((prev) => (prev === guide.id ? null : guide.id))
                  }
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left text-xs transition",
                    active
                      ? "border-[#4B5FC6] bg-[#EEF0FF]"
                      : "border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "text-[11px] font-semibold uppercase tracking-[0.16em]",
                      active ? "text-[#4B5FC6]" : "text-[#6B7280]",
                    ].join(" ")}
                  >
                    {guide.badge}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#111827]">
                    {guide.label}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B7280] line-clamp-3">
                    {guide.tone}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: expanded active guide */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs lg:col-span-2 lg:p-5">
            {openGuide ? (
              (() => {
                const activeGuide = guides.find((g) => g.id === openGuide)!;
                return (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
                        {activeGuide.badge}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-[#111827]">
                        {activeGuide.label}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#4B5563]">
                        {activeGuide.summary}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {activeGuide.highlights.map((block) => (
                        <div
                          key={block.title}
                          className="rounded-xl bg-[#F9FAFB] p-3"
                        >
                          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                            {block.title}
                          </h4>
                          <ul className="mt-2 space-y-1 text-[11px] text-[#4B5563]">
                            {block.items.map((item) => (
                              <li key={item} className="flex gap-1">
                                <span className="mt-[3px] inline-block h-1 w-1 rounded-full bg-[#9CA3AF]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                        Places that fit this plan
                      </h4>
                      <div className="grid gap-3 md:grid-cols-3">
                        {guideCards[openGuide]?.map((card) => (
                          <div
                            key={card.title}
                            className="rounded-2xl border border-[#E5E7EB] bg-white p-3 text-[11px] shadow-sm"
                          >
                            <p className="font-semibold uppercase tracking-[0.14em] text-[#4B5FC6]">
                              {card.tag}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">
                              {card.title}
                            </p>
                            <p className="mt-1 text-[#4B5563]">{card.description}</p>
                            {card.link ? (
                              <Link
                                href={card.link}
                                className="mt-2 inline-flex items-center text-[11px] font-semibold text-[#4B5FC6] hover:underline"
                              >
                                Open in maps →
                              </Link>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monetization / links zone */}
                    <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3 text-[11px]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-[#4B5563]">
                          Ready to turn this guide into a real plan?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href="/eat-drink"
                            className="rounded-full bg-white px-3 py-1 font-semibold text-[#4B5FC6] hover:bg-[#EEF0FF]"
                          >
                            Find a place to eat →
                          </Link>
                          <Link
                            href="/business"
                            className="rounded-full bg-white px-3 py-1 font-semibold text-[#111827] hover:bg-[#F3F4F6]"
                          >
                            View nearby services →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-[11px] text-[#6B7280]">
                Pick one of the guides on the left to see simple, situation-based
                suggestions for your visit to White Plains.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick essentials */}
      <section className="mt-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
              Quick essentials
            </h2>
            <p className="text-xs text-[#6B7280]">
              A few basics people usually ask about when they&apos;re planning
              a day here.
            </p>
          </div>
        </div>

        {/* Mobile carousel */}
        <div className="relative md:hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#FAFAFA] to-transparent" />
          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-thin">
            {[
              {
                title: "Getting here",
                body: "White Plains is reachable by train, bus, and car. Many visitors arrive by rail, then stay mostly on foot in the downtown area.",
                tip: "Tip: build in extra time for your first trip—figuring out exits, elevators, or parking always takes longer than expected.",
              },
              {
                title: "Moving around",
                body: "Downtown is compact enough for walking, with most food, coffee, and quick stops within a small radius.",
                tip: "Tip: choose one “stretch” to focus on instead of trying to cover everything in one day.",
              },
              {
                title: "Weather & what to bring",
                body: "Weather can shift throughout the day. A light layer, water, and a small charger go a long way.",
                tip: "Tip: keep indoor backups (library, mall, coffee shops) for sudden rain or heat.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="snap-start w-72 shrink-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs shadow-sm"
              >
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[11px] text-[#4B5563]">{card.body}</p>
                <p className="mt-3 text-[11px] text-[#6B7280]">{card.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
              Getting here
            </h3>
            <p className="mt-2 text-[11px] text-[#4B5563]">
              White Plains is reachable by train, bus, and car. Many visitors
              arrive by rail, then stay mostly on foot in the downtown area.
            </p>
            <p className="mt-3 text-[11px] text-[#6B7280]">
              Tip: build in extra time for your first trip—figuring out exits,
              elevators, or parking always takes longer than expected.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
              Moving around
            </h3>
            <p className="mt-2 text-[11px] text-[#4B5563]">
              Downtown is compact enough for walking, with most food, coffee,
              and quick stops within a small radius.
            </p>
            <p className="mt-3 text-[11px] text-[#6B7280]">
              Tip: choose one “stretch” to focus on instead of trying to cover
              everything in one day.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
              Weather &amp; what to bring
            </h3>
            <p className="mt-2 text-[11px] text-[#4B5563]">
              Weather can shift throughout the day. A light layer and
              comfortable shoes go a long way.
            </p>
            <p className="mt-3 text-[11px] text-[#6B7280]">
              Tip: a small bag with water, charger, and a simple snack keeps
              waits, delays, and in-between moments easier.
            </p>
          </div>
        </div>
      </section>

      {/* Connect to other pages */}
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#1C1F2A] px-5 py-5 text-xs text-white">
          <h2 className="text-sm font-semibold">Eat &amp; Drink in White Plains</h2>
          <p className="mt-2 text-[11px] text-[#E5E7EB]">
            From quick coffee stops to sit-down dinners, explore options that
            match the kind of visit you&apos;re having—court day, family day, or
            a short no-car stay.
          </p>
          <Link
            href="/eat-drink"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-[#1C1F2A] hover:bg-[#F3F4F6]"
          >
            Explore Eat &amp; Drink →
          </Link>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 text-xs">
          <h2 className="text-sm font-semibold text-[#111827]">
            Services &amp; local support
          </h2>
          <p className="mt-2 text-[11px] text-[#4B5563]">
            Looking for a place to print documents, grab last-minute supplies,
            or find a nearby service while you&apos;re in town?
          </p>
          <p className="mt-1 text-[11px] text-[#6B7280]">
            Our business directory will highlight practical, visitor-friendly
            services first.
          </p>
          <Link
            href="/business"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-[#EEF0FF] px-4 py-1.5 text-[11px] font-semibold text-[#4B5FC6] hover:bg-[#E0E3FF]"
          >
            View business directory →
          </Link>
        </div>
      </section>
    </main>
  );
}
