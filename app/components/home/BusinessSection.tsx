// app/components/home/BusinessSection.tsx

export default function BusinessSection() {
    return (
      <section className="mt-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
              For local businesses &amp; organizations
            </h2>
            <p className="text-xs text-[#5A6270]">
              If you serve people who live in or visit White Plains, there&apos;s
              likely a place for you on this site.
            </p>
          </div>
          <a
            href="/business"
            className="text-xs font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
          >
            Learn about listings →
          </a>
        </div>
  
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1C1F2A]">
              Be part of how visitors explore
            </h3>
            <p className="mt-2 text-[11px]">
              CityOfWhitePlains.org is built as a calm, visitor-first guide. Your
              business appears in the context of simple guides, not cluttered ad
              walls.
            </p>
          </article>
          <article className="rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1C1F2A]">
              Clear, modern profiles
            </h3>
            <p className="mt-2 text-[11px]">
              Name, description, hours, photos and direct links to your website,
              ordering, or booking — so visitors can act quickly.
            </p>
          </article>
          <article className="rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] shadow-sm">
            <h3 className="text-sm font-semibold text-[#1C1F2A]">
              Self-serve dashboard (coming soon)
            </h3>
            <p className="mt-2 text-[11px]">
              We&apos;re building a simple dashboard where you can update your
              info, see basic stats, and manage your presence without needing a
              developer.
            </p>
          </article>
        </div>
      </section>
    );
  }