// app/events/page.tsx
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EventsExplorerClient from "../components/events/EventsExplorerClient";
import {
  getApprovedCommunityEvents,
  getUpcomingEvents,
  type CityEvent,
  type CommunityEvent,
} from "@/app/lib/events";
import { getPageHeroImage } from "../lib/homepageSettings";
import { DEFAULT_HOMEPAGE_HERO_IMAGE } from "../lib/constants";
import { SITE_NAME, absoluteUrl } from "../lib/seo";
import { getAdsByPlacement } from "../lib/ads";
import { URL } from "url";

const policyPoints = [
  {
    title: "Family-first standards",
    body:
      "Events must be safe for the community. Family events stay family-friendly; 18+ events must be non-explicit and clearly labeled.",
  },
  {
    title: "No explicit content",
    body:
      "No pornographic, sexually explicit, or graphic imagery — for any age group. We reserve the right to remove submissions that violate this.",
  },
  {
    title: "Safety & respect",
    body:
      "No hate speech, harassment, illegal activity, or unsafe gatherings. Provide accurate locations and emergency contacts if applicable.",
  },
  {
    title: "Accessibility & clarity",
    body:
      "Include accessibility details (wheelchair access, ASL, sensory-friendly), pricing, refund notes, and accurate start/end times.",
  },
  {
    title: "Media guidelines",
    body:
      "Images and copy must be rights-cleared, appropriate for a civic site, and free of graphic content.",
  },
  {
    title: "Review & enforcement",
    body:
      "All submissions are reviewed by an admin before publishing. Edits may be requested; noncompliant events can be removed at any time.",
  },
];

// Revalidate every 30 minutes so you don't hammer the city server
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Things to Do in White Plains, NY",
  description:
    "See what’s happening in White Plains, NY. Markets, concerts, family activities, and seasonal events – pulled from official city calendars and local partners.",
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Events in White Plains",
    description:
      "Markets, concerts, family activities, and seasonal events around White Plains, NY.",
    url: absoluteUrl("/events"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url:
          "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Events in White Plains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events in White Plains",
    description:
      "Markets, concerts, family activities, and seasonal events around White Plains, NY.",
    images: [
      "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

function formatEventDate(startISO: string, allDay?: boolean) {
  const start = new Date(startISO);

  const dateLabel = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (allDay) {
    return `${dateLabel} • All day`;
  }

  const timeLabel = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel} • ${timeLabel}`;
}

function cleanLocation(raw?: string) {
  if (!raw) return "";
  return raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// Pick events that feel "seasonal" based on title keywords
function getSeasonalHighlights(events: CityEvent[]): CityEvent[] {
  const keywords = [
    "holiday",
    "christmas",
    "hanukkah",
    "kwanzaa",
    "new year",
    "lights",
    "tree",
    "santa",
    "winter",
    "skate",
    "ice",
    "market",
    "festival",
    "parade",
  ];

  const matches = events.filter((event) => {
    const title = (event.title || "").toLowerCase();
    return keywords.some((kw) => title.includes(kw));
  });

  // Just show the first 3 that match
  return matches.slice(0, 3);
}

function getHighlightEmoji(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("santa")) return "🎅";
  if (t.includes("lights") || t.includes("tree") || t.includes("holiday"))
    return "🎄";
  if (t.includes("new year")) return "🎆";
  if (t.includes("skate") || t.includes("ice")) return "⛸️";
  if (t.includes("market")) return "🛍️";
  if (t.includes("festival") || t.includes("parade")) return "🎉";
  return "✨";
}

function domainLabel(link: string) {
  try {
    const url = new URL(link);
    return url.hostname.replace("www.", "");
  } catch {
    return link;
  }
}

export default async function EventsPage() {
  const [cityEvents, communityEvents] = await Promise.all([
    getUpcomingEvents(120),
    getApprovedCommunityEvents(120),
  ]);
  const events: (CityEvent | CommunityEvent)[] = [
    ...communityEvents,
    ...cityEvents.map((evt) => ({ ...evt, source: "city" as const })),
  ];
  const seasonalHighlights = getSeasonalHighlights(cityEvents);
  const heroImageUrl = (await getPageHeroImage("events")) || DEFAULT_HOMEPAGE_HERO_IMAGE;
  const ads = await getAdsByPlacement([
    "events_lodging",
    "events_tickets",
    "transport",
  ]);
  const lodgingAd = ads["events_lodging"]?.[0];
  const ticketsAd = ads["events_tickets"]?.[0];
  const transportAd = ads["transport"]?.[0];

  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-[#1C1F2A] text-white">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={heroImageUrl}
              alt="Downtown White Plains at night"
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1C1F2A]/90 via-[#1C1F2A]/40 to-[#4B5FC6]/70" />
          </div>

          {/* Hero content */}
          <div className="relative flex flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:py-14">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#4B5FC6]" />
                Events &amp; Things to Do
              </span>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                What&apos;s on in White Plains
              </h1>

              <p className="text-sm text-slate-100/90">
                From holiday lights and ice skating to markets, concerts, and
                family nights — here&apos;s an easy way to see what&apos;s
                happening around town during your visit or your week at home.
              </p>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-100/90">
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  Seasonal celebrations
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  Family-friendly fun
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  Downtown evenings
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <a
                  href="#submit-event"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#1C1F2A] shadow-sm transition hover:-translate-y-[1px]"
                >
                  Submit your event
                  <span aria-hidden className="text-sm text-[#4B5FC6]">
                    ↗
                  </span>
                </a>
                <a
                  href="#events-policy"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-white transition hover:-translate-y-[1px]"
                >
                  Read the events policy
                </a>
              </div>
            </div>

            {/* Hero side card */}
            <aside className="ml-auto flex w-full max-w-xs flex-col gap-4 rounded-2xl bg-black/30 p-4 text-xs backdrop-blur">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-200/80">
                  Why use this page?
                </p>
                <p className="mt-1">
                  Events here are pulled from official city calendars and local
                  partners, then organized in one simple view.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-[11px]">
                <div>
                  <p className="text-slate-200/70">Perfect for</p>
                  <p className="font-semibold">
                    Visitors, families, residents
                  </p>
                </div>
                <div>
                  <p className="text-slate-200/70">Vibe</p>
                  <p className="font-semibold">Warm, walkable, downtown</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* 🌟 SEASONAL HIGHLIGHTS STRIP */}
        {seasonalHighlights.length > 0 && (
          <section className="mt-6 rounded-2xl border border-[#D7DBFF] bg-[#EEF0FF] p-4 text-xs text-[#1C1F2A] shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#1C1F2A]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#4B5FC6]" />
                Seasonal highlights in White Plains
              </span>
              <span className="text-[11px] text-[#4B5FC6]">
                Cozy nights, bright lights, and family moments.
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {seasonalHighlights.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col gap-1 rounded-2xl bg-white/80 p-3 text-[11px] shadow-sm ring-1 ring-white/40"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {getHighlightEmoji(event.title)}
                    </span>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A91A0]">
                        Featured this season
                      </p>
                      <p className="text-xs font-semibold text-[#1C1F2A]">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#4B5FC6]">
                        {formatEventDate(event.start, event.allDay)}
                      </p>
                    </div>
                  </div>
                  {event.location && (
                    <p className="mt-1 line-clamp-2 text-[10px] text-[#5A6270]">
                      {cleanLocation(event.location)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Affiliate CTAs */}
        <section className="mt-8 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
          {[
            lodgingAd || {
          id: "fallback-events-lodging",
          title: "Book a stay near downtown (Booking/Expedia)",
          subtitle: "Walkable to Mamaroneck Ave and train",
          link: "https://www.booking.com/index.html",
          placement: "events_lodging",
          partner: "Booking.com",
          button_text: "Book now",
          imageUrl:
            "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80",
        },
        ticketsAd || {
          id: "fallback-events-tickets",
          title: "Find tickets for shows and games (Ticketmaster)",
          subtitle: "Shows, concerts, and local sports",
          link: "https://www.ticketmaster.com/",
          placement: "events_tickets",
          partner: "Ticketmaster",
          button_text: "Get tickets",
          imageUrl:
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
        },
            transportAd || {
              id: "fallback-events-transport",
              title: "Rent a car nearby (Discovercars / LocalRent)",
              subtitle: "Easy pickup near downtown or the station",
              link: "https://www.discovercars.com/",
              placement: "transport",
              partner: "Discovercars",
              buttonText: "Book a car",
              imageUrl:
                "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
            },
          ].map((ad) => (
            <a
              key={ad.id}
              href={ad.link}
              className="group relative overflow-hidden rounded-2xl border border-[#ECEEF3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute inset-0">
                <img
                  src={(ad as any).imageUrl || (ad as any).image_url || ""}
                  alt={ad.title}
                  className="h-full w-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="relative flex h-full flex-col justify-between p-4 text-white">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                    {(ad as any).partner ||
                      (ad as any).placement ||
                      domainLabel(ad.link)}
                  </span>
                  <p className="text-sm font-semibold leading-snug">{ad.title}</p>
                  {(ad as any).subtitle && (ad as any).subtitle.trim().length > 0 && (
                    <p className="text-[11px] font-semibold text-[#FBBF24]">
                      {(ad as any).subtitle}
                    </p>
                  )}
                </div>
                <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-white/90">
                  {(ad as any).buttonText || (ad as any).button_text || "Open link"} <span aria-hidden>↗</span>
                </span>
              </div>
            </a>
          ))}
        </section>

        <p className="mt-2 text-[10px] text-[#6B7280]">
          Affiliate links (Booking.com, Expedia, Ticketmaster, car rentals) help support this guide.
          We only surface options that make sense for event visitors.
        </p>

        <EventsExplorerClient events={events} />

        {/* EVENTS POLICY */}
        <section
          id="events-policy"
          className="mt-10 rounded-3xl border border-[#ECEEF3] bg-white p-6 text-xs text-[#1C1F2A] shadow-sm md:p-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
            <div className="md:w-1/3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A91A0]">
                Events policy
              </p>
              <h3 className="text-xl font-bold text-[#1C1F2A]">
                Standards for events listed here
              </h3>
              <p className="mt-2 text-sm text-[#5A6270]">
                We welcome community events that are safe, inclusive, and
                accurate. Adult-only events are allowed when non-explicit and
                clearly labeled; explicit or pornographic content is never
                accepted.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EEF0FF] px-3 py-2 text-[11px] font-semibold text-[#4B5FC6]">
                <span aria-hidden>🔒</span>
                Admin review required before publishing
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="grid gap-3 md:grid-cols-2">
                {policyPoints.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-[#ECEEF3] bg-[#FAFAFA] p-4"
                  >
                    <p className="text-[12px] font-semibold text-[#1C1F2A]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px] text-[#5A6270]">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-[#F7F7FB] p-4 text-[11px] text-[#5A6270]">
                <p className="font-semibold text-[#1C1F2A]">
                  How we handle submissions
                </p>
                <ul className="mt-2 space-y-1">
                  <li>• Admins verify age guidance and remove explicit content.</li>
                  <li>• Family events get a “Family-friendly” badge; adult events get “18+ (non-explicit)” when appropriate.</li>
                  <li>• Incomplete, misleading, or unsafe listings may be declined or removed.</li>
                  <li>• Updates after approval may trigger a quick re-review.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
