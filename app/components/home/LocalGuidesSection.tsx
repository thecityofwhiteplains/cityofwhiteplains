// app/components/home/LocalGuidesSection.tsx

export default function LocalGuidesSection() {
    return (
      <section className="mt-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
              Living, working &amp; coming back often
            </h2>
            <p className="text-xs text-[#5A6270]">
              Even if you&apos;re just here once, we want the experience to feel
              calm, clear, and welcoming.
            </p>
          </div>
        </div>
  
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1C1F2A]">
              For locals
            </h3>
            <p className="mt-2 text-[11px]">
              Use this site as a quick link hub for events, downtown updates, and
              places to recommend when friends or family come to visit.
            </p>
          </article>
          <article className="rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1C1F2A]">
              For people visiting often
            </h3>
            <p className="mt-2 text-[11px]">
              Coming here regularly for work, court, or school? Build a routine
              around a few favorite places so the city feels familiar, not
              stressful.
            </p>
          </article>
          <article className="rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1C1F2A]">
              Thinking of living here
            </h3>
            <p className="mt-2 text-[11px]">
              As the site grows, we&apos;ll add simple &quot;moving to White
              Plains&quot; basics: neighborhoods, transit, and everyday life
              snapshots — not sales pitches.
            </p>
          </article>
        </div>
      </section>
    );
  }