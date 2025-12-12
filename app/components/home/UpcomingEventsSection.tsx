// app/components/home/UpcomingEventsSection.tsx
import { getUpcomingEvents } from "@/app/lib/events";

function formatBadgeParts(startISO: string, allDay?: boolean) {
  const start = new Date(startISO);

  const month = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = start.getDate().toString().padStart(2, "0");
  const weekday = start.toLocaleDateString("en-US", { weekday: "short" });

  const time = allDay
    ? "All day"
    : start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return { month, day, weekday, time };
}

function cleanLocation(raw?: string) {
  if (!raw) return "";
  return raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export default async function UpcomingEventsSection() {
  const events = await getUpcomingEvents(3);

  const cards = events.map((event) => {
    const { month, day, weekday, time } = formatBadgeParts(
      event.start,
      event.allDay
    );

    return (
      <article
        key={event.id}
        className="relative w-64 shrink-0 snap-start rounded-2xl border border-[#ECEEF3] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:w-72 md:h-full md:w-auto md:shrink"
      >
        {/* HORIZONTAL DATE BADGE WITH ICONS */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-3 rounded-md bg-[#EEF0FF] px-3 py-1.5 shadow-md border border-[#D7DBFF]">
          
          {/* Calendar icon + date */}
          <div className="flex items-center gap-1">
            <span className="text-[11px]">📅</span>
            <span className="text-[10px] font-bold tracking-wide text-[#1C1F2A]">
              {month} {day}
            </span>
          </div>

          <span className="text-[10px] text-[#1C1F2A]/30">•</span>

          {/* Weekday icon + weekday */}
          <div className="flex items-center gap-1">
            <span className="text-[11px]">📆</span>
            <span className="text-[10px] font-medium text-[#1C1F2A]">
              {weekday}
            </span>
          </div>

          <span className="text-[10px] text-[#1C1F2A]/30">•</span>

          {/* Clock icon + time */}
          <div className="flex items-center gap-1">
            <span className="text-[11px]">🕒</span>
            <span className="text-[10px] font-semibold text-[#4B5FC6]">
              {time}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-12 flex flex-col gap-2 text-[#5A6270]">
          <p className="text-sm font-semibold text-[#1C1F2A]">
            {event.title}
          </p>

          {event.location && (
            <p className="text-[11px]">{cleanLocation(event.location)}</p>
          )}

          {event.description && (
            <p className="mt-1 line-clamp-3 text-[11px] text-[#8A91A0]">
              {event.description.trim()}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#8A91A0]">
          <span>Official city event</span>
          <a
            href={event.description}
            className="font-semibold text-[#4B5FC6] hover:underline"
          >
            Details →
          </a>
        </div>
      </article>
    );
  });

  return (
    <section className="mt-10 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
            This week in White Plains
          </h2>
          <p className="text-xs text-[#5A6270]">
            A simple view of what’s happening around town this week.
          </p>
        </div>
        <a
          href="/events"
          className="text-xs font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
        >
          View all events →
        </a>
      </div>

      {/* Mobile swipe carousel */}
      <div className="relative md:hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#FAFAFA] to-transparent" />
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-thin">
          {cards}
          {cards.length === 0 && (
            <div className="snap-start shrink-0 w-full rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270]">
              <p className="font-semibold text-[#1C1F2A]">No events found</p>
              <p className="mt-1 text-[11px] text-[#8A91A0]">
                Events will appear here when the calendar feed has items.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden gap-6 md:grid md:grid-cols-3">
        {cards}
        {cards.length === 0 && (
          <div className="rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] md:col-span-3">
            <p className="font-semibold text-[#1C1F2A]">No events found</p>
            <p className="mt-1 text-[11px] text-[#8A91A0]">
              Events will appear here when the calendar feed has items.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
