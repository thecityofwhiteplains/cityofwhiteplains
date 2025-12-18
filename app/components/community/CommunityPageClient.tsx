"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AffiliateAd } from "@/app/lib/ads";
import { DEFAULT_HOMEPAGE_HERO_IMAGE } from "@/app/lib/constants";

type ResourceLink = {
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  badges?: string[];
};

type ResourceCategory = {
  id: string;
  title: string;
  description: string;
  items: ResourceLink[];
};

type Props = {
  heroImageUrl?: string | null;
  bannerAd?: AffiliateAd | null;
};

const TOP_TASKS: ResourceLink[] = [
  {
    title: "Pay a parking ticket",
    description: "Pay online using the city’s ticket portal (external).",
    href: "https://whiteplains.citationportal.com/",
    external: true,
    badges: ["Online", "External"],
  },
  {
    title: "Pay for parking by phone",
    description: "Use ParkWhitePlains to pay meters by mobile (external).",
    href: "http://parkwhiteplains.com/",
    external: true,
    badges: ["Online", "External"],
  },
  {
    title: "Pay taxes / water & sewer",
    description: "Access MUNIS self-service payments (external).",
    href: "https://cwp.munisselfservice.com/citizens/default.aspx",
    external: true,
    badges: ["Online", "External"],
  },
  {
    title: "White Plains Public Library",
    description: "Hours, events, digital services, and getting a library card.",
    href: "https://www.whiteplainslibrary.org/",
    external: true,
    badges: ["Info", "External"],
  },
  {
    title: "Trash & recycling info",
    description:
      "Find sanitation schedules and guidelines on the official city site (external).",
    href: "https://www.cityofwhiteplains.com/215/Bureau-of-Sanitation",
    external: true,
    badges: ["Info", "External"],
  },
  {
    title: "Report an issue",
    description:
      "Tell us what’s missing or broken (and we’ll point you to the right place).",
    href: "/contact",
    badges: ["Help"],
  },
];

const CATEGORIES: ResourceCategory[] = [
  {
    id: "library-learning",
    title: "Library & Learning",
    description: "Books, events, meeting rooms, and learning resources.",
    items: [
      {
        title: "White Plains Public Library (main site)",
        description: "Hours, location, services, and announcements.",
        href: "https://www.whiteplainslibrary.org/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Library events calendar",
        description: "Story times, author talks, classes, and community events.",
        href: "https://calendar.whiteplainslibrary.org/events/?",
        external: true,
        badges: ["External"],
      },
      {
        title: "Get a library card",
        description: "How to sign up and what you’ll need.",
        href: "https://whiteplainslibrary.org/get-a-card/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Digital library (ebooks, audiobooks)",
        description: "Browse digital resources and online services.",
        href: "https://www.whiteplainslibrary.org/digital-library/",
        external: true,
        badges: ["External"],
      },
    ],
  },
  {
    id: "housing-help",
    title: "Housing & Home Help",
    description: "Affordable housing starting points and resident help links.",
    items: [
      {
        title: "Affordable housing (official city site)",
        description:
          "Start on the city’s official website and follow housing resources (external).",
        href: "https://www.cityofwhiteplains.com/192/Affordable-Housing",
        external: true,
        badges: ["External"],
      },
      {
        title: "Fair Housing / discrimination info",
        description:
          "Know your rights and where to report housing discrimination (external).",
        href: "https://www.hud.gov/program_offices/fair_housing_equal_opp",
        external: true,
        badges: ["External"],
      },
      {
        title: "Emergency help (local starting point)",
        description:
          "If you’re in a tough spot, start here and we’ll help route you to the right resource.",
        href: "/contact",
        badges: ["Help"],
      },
    ],
  },
  {
    id: "parking-streets",
    title: "Parking, Streets & Transportation",
    description: "Tickets, meters, garages, permits, and getting around.",
    items: [
      {
        title: "Pay a parking ticket",
        description: "Pay online using the city’s ticket portal (external).",
        href: "https://whiteplains.citationportal.com/",
        external: true,
        badges: ["Online", "External"],
      },
      {
        title: "Pay parking meters by mobile",
        description: "ParkWhitePlains mobile meter payments (external).",
        href: "http://parkwhiteplains.com/",
        external: true,
        badges: ["Online", "External"],
      },
      {
        title: "Parking rules & permits (official city site)",
        description:
          "Resident permits, overnight rules, and parking info (external).",
        href: "https://www.cityofwhiteplains.com/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Traffic tickets (NY DMV – general info)",
        description:
          "Guidance on tickets/points/insurance implications (external).",
        href: "https://dmv.ny.gov/tickets",
        external: true,
        badges: ["External"],
      },
      {
        title: "Metro-North schedules (Harlem Line)",
        description: "Train schedules and service updates (external).",
        href: "https://new.mta.info/",
        external: true,
        badges: ["External"],
      },
    ],
  },
  {
    id: "sanitation",
    title: "Trash, Recycling & Cleanup",
    description: "Schedules, guidelines, and what to do with bulky items.",
    items: [
      {
        title: "Sanitation info (official city site)",
        description: "Trash/recycling details and updates (external).",
        href: "https://www.cityofwhiteplains.com/215/Bureau-of-Sanitation",
        external: true,
        badges: ["External"],
      },
      {
        title: "Bulk pickup guidance (official city site)",
        description: "How bulky items work and what’s accepted (external).",
        href: "https://www.cityofwhiteplains.com/215/Bureau-of-Sanitation",
        external: true,
        badges: ["External"],
      },
      {
        title: "Household hazardous waste (Westchester – starting point)",
        description:
          "Paint, chemicals, batteries, and special disposal (external).",
        href: "https://environment.westchestergov.com/",
        external: true,
        badges: ["External"],
      },
    ],
  },
  {
    id: "parks-recreation",
    title: "Parks, Recreation & Community Events",
    description: "Parks, programs, and things happening in the city.",
    items: [
      {
        title: "City events (on this site)",
        description: "What’s happening this week in White Plains.",
        href: "/events",
        badges: ["On-site"],
      },
      {
        title: "Parks & recreation (official city site)",
        description: "Program signups, facilities, and parks info (external).",
        href: "https://www.cityofwhiteplains.com/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Local guides (on this site)",
        description: "Neighborhoods, ideas, and practical local tips.",
        href: "/visit",
        badges: ["On-site"],
      },
    ],
  },
  {
    id: "family-youth",
    title: "Family, Youth & Schools",
    description: "School links, youth programs, and family resources.",
    items: [
      {
        title: "White Plains City School District",
        description: "Registration, calendars, and district resources (external).",
        href: "https://www.whiteplainspublicschools.org/",
        external: true,
        badges: ["External"],
      },
      {
        title: "After-school & programs (official city site)",
        description: "Recreation programs and youth resources (external).",
        href: "https://www.cityofwhiteplains.com/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Library kids & teen programs",
        description: "Story time, teen events, and learning programs (external).",
        href: "https://www.whiteplainslibrary.org/",
        external: true,
        badges: ["External"],
      },
    ],
  },
  {
    id: "help-support",
    title: "Help & Support",
    description: "Food, seniors, benefits, and crisis resources.",
    items: [
      {
        title: "Senior services (official city site)",
        description: "Programs, resources, and guidance (external).",
        href: "https://www.cityofwhiteplains.com/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Food assistance (Feeding Westchester)",
        description: "Find food pantries and resources (external).",
        href: "https://feedingwestchester.org/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Mental health crisis: 988 Lifeline",
        description:
          "Call or text 988 for 24/7 support (external). If you’re in immediate danger, call 911.",
        href: "https://988lifeline.org/",
        external: true,
        badges: ["24/7", "External"],
      },
      {
        title: "Ask for help finding the right service",
        description:
          "Send us what you’re trying to do and we’ll point you to the right link.",
        href: "/contact",
        badges: ["Help"],
      },
    ],
  },
  {
    id: "safety-preparedness",
    title: "Safety & Preparedness",
    description: "Emergency info and resident readiness resources.",
    items: [
      {
        title: "Official city site (alerts & updates)",
        description: "Official notices and citywide updates (external).",
        href: "https://www.cityofwhiteplains.com/",
        external: true,
        badges: ["External"],
      },
      {
        title: "Ready.gov (emergency preparedness)",
        description: "Preparedness guides and checklists (external).",
        href: "https://www.ready.gov/",
        external: true,
        badges: ["External"],
      },
    ],
  },
];

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function ResourceBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-semibold text-[#0F5132]">
      {label}
    </span>
  );
}

function ResourceCard({ item }: { item: ResourceLink }) {
  const content = (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#DDE4EE] bg-gradient-to-br from-[#F5FBFF] via-white to-[#FDF6EC] p-4 shadow-md transition hover:-translate-y-[2px] hover:shadow-lg">
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#475467]">
          {item.description}
        </p>
      </div>
      {item.badges && item.badges.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.badges.map((badge) => (
            <ResourceBadge key={badge} label={badge} />
          ))}
        </div>
      ) : null}
    </div>
  );

  if (!item.href) {
    return (
      <div className="opacity-70">
        {content}
        <p className="mt-2 text-[11px] text-[#9CA3AF]">Link coming soon.</p>
      </div>
    );
  }

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className="block">
      {content}
    </Link>
  );
}

function BannerAd({ ad }: { ad: AffiliateAd }) {
  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noreferrer"
      className="relative block overflow-hidden rounded-2xl border border-[#CFE6FF] bg-gradient-to-br from-[#0B5F5F] via-[#0F2D50] to-[#051326] p-5 text-white shadow-xl transition hover:-translate-y-[2px] hover:shadow-2xl"
    >
      <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#9EE6D0]">
            Community banner
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">
            {ad.title || "Featured partner"}
          </p>
          {ad.subtitle && (
            <p className="mt-1 text-sm text-[#D8E5FF]">{ad.subtitle}</p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">
            <span>{ad.buttonText || "Learn more"}</span>
            <span aria-hidden>→</span>
          </div>
          {ad.partner && (
            <p className="mt-2 text-[11px] text-[#A5F3CE]">Partner: {ad.partner}</p>
          )}
        </div>
        {ad.imageUrl && (
          <div className="relative h-28 w-full max-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-32">
            <img
              src={ad.imageUrl}
              alt={ad.partner || ad.title || "Ad"}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.15), transparent 40%)",
          }}
        />
      </div>
    </a>
  );
}

export default function CommunityPageClient({ heroImageUrl, bannerAd }: Props) {
  const [query, setQuery] = useState("");
  const heroImage = heroImageUrl || DEFAULT_HOMEPAGE_HERO_IMAGE;

  const { filteredTopTasks, filteredCategories, totalMatches } = useMemo(() => {
    const q = query.trim();
    if (!q) {
      const allItemsCount = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
      return {
        filteredTopTasks: TOP_TASKS,
        filteredCategories: CATEGORIES,
        totalMatches: TOP_TASKS.length + allItemsCount,
      };
    }

    const top = TOP_TASKS.filter(
      (item) =>
        matchesQuery(item.title, q) ||
        matchesQuery(item.description, q) ||
        (item.badges || []).some((b) => matchesQuery(b, q)),
    );

    const cats: ResourceCategory[] = CATEGORIES.map((cat) => {
      const items = cat.items.filter(
        (item) =>
          matchesQuery(item.title, q) ||
          matchesQuery(item.description, q) ||
          (item.badges || []).some((b) => matchesQuery(b, q)),
      );
      return { ...cat, items };
    }).filter((cat) => cat.items.length > 0);

    const catItemsCount = cats.reduce((sum, c) => sum + c.items.length, 0);
    return {
      filteredTopTasks: top,
      filteredCategories: cats,
      totalMatches: top.length + catItemsCount,
    };
  }, [query]);

  const jumpLinks = filteredCategories.map((c) => ({ id: c.id, title: c.title }));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-[#E0E7FF] bg-[#0F2D50] text-white shadow-xl">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Community resources hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B5F5F]/85 via-[#0F2D50]/80 to-[#0B1024]/90" />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B3FFE8]">
              Residents
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-[#E0E7FF]">
              Friendly guide with a municipal touch
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
            Community Resources
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#E5E7EB]">
            A warm, plain-language hub for everyday needs in White Plains. Fast links first,
            with guidance on what to do next. We link you to the official place when it matters.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="#top-tasks"
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-[#0F172A] shadow-sm hover:-translate-y-[1px]"
            >
              See top tasks
            </a>
            <a
              href="#categories"
              className="inline-flex items-center rounded-full border border-white/50 px-4 py-2 text-[12px] font-semibold text-white hover:bg-white/10"
            >
              Browse categories
            </a>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#FFF7ED] via-white to-[#E6F4F1] p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Find what you need
            </p>
            <p className="mt-1 text-[12px] text-[#475467]">
              Search this page for tickets, library, housing, trash, permits, and more.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-[420px] md:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#4B5FC6]"
              placeholder='Try "parking", "library", "trash", "housing"...'
              aria-label="Search community resources"
            />
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-xl border border-[#E5E7EB] bg-[#0F5132] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0C3F26] disabled:opacity-60"
              disabled={!query.trim()}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#475467]">
          <span className="rounded-full bg-white px-2 py-1 text-[#0F5132]">
            {totalMatches} result{totalMatches === 1 ? "" : "s"}
          </span>
          <span>
            Tip: open links in a new tab so you don’t lose your place.
          </span>
        </div>
      </div>

      {jumpLinks.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {jumpLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="rounded-full border border-[#DDE4EE] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0F172A] shadow-sm hover:-translate-y-[1px]"
            >
              {link.title}
            </a>
          ))}
        </div>
      ) : null}

      <section id="top-tasks" className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Top tasks</h2>
            <p className="text-[11px] text-[#475467]">Most-used resident actions</p>
          </div>
          <span className="rounded-full bg-[#ECFDF3] px-3 py-1 text-[11px] font-semibold text-[#0F5132]">
            Quick wins
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopTasks.map((item) => (
            <ResourceCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      {bannerAd ? <BannerAd ad={bannerAd} /> : null}

      <section
        id="categories"
        className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Browse by category</h2>
            <p className="text-[11px] text-[#475467]">Clear categories, not an org chart</p>
          </div>
          <span className="rounded-full bg-[#E0F2FE] px-3 py-1 text-[11px] font-semibold text-[#0B5F5F]">
            Jump in
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {filteredCategories.map((cat) => (
            <section
              key={cat.id}
              id={cat.id}
              className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#F7FBFF] to-[#FFF7ED] p-5 shadow-sm"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">{cat.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#475467]">
                    {cat.description}
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-[#0F5132]">
                  {cat.items.length} link{cat.items.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item) => (
                  <ResourceCard key={`${cat.id}-${item.title}`} item={item} />
                ))}
              </div>
            </section>
          ))}

          {filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#475467] shadow-sm">
              <p className="font-semibold text-[#0F172A]">No matches.</p>
              <p className="mt-1">
                Try a different search (for example: “permit”, “ticket”, “recycling”),
                or{" "}
                <Link href="/contact" className="font-semibold text-[#4B5FC6] hover:underline">
                  tell us what you were looking for
                </Link>
                .
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
