"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CityEvent, CommunityEvent } from "@/app/lib/events";
import { supabase } from "@/app/lib/supabaseClient";

type FilterKey = "all" | "family" | "adult" | "free" | "outdoor" | "weekend";
type ViewMode = "list" | "calendar";

type PreparedEvent = (CityEvent | CommunityEvent) & {
  source?: "city" | "community";
  audience?: "family" | "18plus" | "21plus";
  cost?: string;
  url?: string;
  accessibility?: string;
  status?: string;
  dayKey: string;
  flags: {
    free: boolean;
    outdoor: boolean;
    weekend: boolean;
    today: boolean;
  };
};

const filterOptions: { id: FilterKey; label: string }[] = [
  { id: "all", label: "All upcoming" },
  { id: "family", label: "Family-friendly" },
  { id: "adult", label: "18+ / 21+" },
  { id: "free", label: "Free" },
  { id: "outdoor", label: "Outdoor & seasonal" },
  { id: "weekend", label: "This weekend" },
];

const weekendDays = new Set([5, 6, 0]); // Fri-Sun

function cleanLocation(raw?: string) {
  if (!raw) return "";
  return raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDateTimeLabel(iso: string) {
  const date = new Date(iso);
  const dateLabel = formatDateLabel(iso);
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateLabel} • ${timeLabel}`;
}

function inferAudience(event: CityEvent | CommunityEvent): "family" | "18plus" | "21plus" | undefined {
  if ("audience" in event && event.audience) return event.audience as any;
  const text = `${event.title} ${event.description || ""}`.toLowerCase();
  if (text.match(/18\+|21\+|adults|after dark|cocktail|wine|brew/)) {
    return text.includes("21+") ? "21plus" : "18plus";
  }
  if (text.match(/family|kids|children|youth|teen|santa|story|craft|library/)) {
    return "family";
  }
  return undefined;
}

function inferFree(event: CityEvent | CommunityEvent) {
  const text = `${event.title} ${event.description || ""} ${"cost" in event ? event.cost || "" : ""}`.toLowerCase();
  return text.includes("free") || text.includes("no cost");
}

function inferOutdoor(event: CityEvent | CommunityEvent) {
  const text = `${event.title} ${event.description || ""}`.toLowerCase();
  return text.match(/market|parade|outdoor|park|trail|run|walk|festival|concert in the park|ice|skate|lights|tree/);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function EventsExplorerClient({ events }: { events: (CityEvent | CommunityEvent)[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const preparedEvents: PreparedEvent[] = useMemo(() => {
    return events.map((event) => {
      const startDate = new Date(event.start);
      const dayKey = startDate.toISOString().split("T")[0];
      const audience = inferAudience(event);
      const flags = {
        free: inferFree(event),
        outdoor: !!inferOutdoor(event),
        weekend: weekendDays.has(startDate.getDay()),
        today: sameDay(startDate, new Date()),
      };

      return {
        ...event,
        audience,
        dayKey,
        flags,
      };
    });
  }, [events]);

  const dateKeys = useMemo(() => {
    const keys = Array.from(new Set(preparedEvents.map((e) => e.dayKey)));
    return keys.sort();
  }, [preparedEvents]);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return preparedEvents
      .filter((event) => {
        if (activeFilter === "family") {
          return (event.audience || "family") === "family";
        }
        if (activeFilter === "adult") {
          return event.audience === "18plus" || event.audience === "21plus";
        }
        if (activeFilter === "free" && !event.flags.free) return false;
        if (activeFilter === "outdoor" && !event.flags.outdoor) return false;
        if (activeFilter === "weekend" && !event.flags.weekend) return false;
        return true;
      })
      .filter((event) => {
        if (!selectedDate || selectedDate === "all") return true;
        return event.dayKey === selectedDate;
      })
      .filter((event) => {
        if (!term) return true;
        const text = `${event.title} ${event.description || ""} ${event.location || ""}`.toLowerCase();
        return text.includes(term);
      })
      .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }, [preparedEvents, activeFilter, selectedDate, search]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const title = (data.get("title") as string) || "";
    const start = (data.get("start") as string) || "";
    const location = (data.get("location") as string) || "";
    const contactEmail = (data.get("contact_email") as string) || "";

    if (!title || !start || !location || !contactEmail.includes("@")) {
      setSubmitError("Title, start time, location, and a valid contact email are required.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      start_at: start,
      end_at: (data.get("end") as string) || null,
      location,
      audience: (data.get("audience") as string) || "family",
      cost: (data.get("cost") as string) || null,
      description: (data.get("description") as string) || null,
      accessibility: (data.get("accessibility") as string) || null,
      url: (data.get("url") as string) || null,
      contact_email: contactEmail,
      contact_name: (data.get("contact_name") as string) || null,
      attachments: (data.get("attachments") as string) || null,
      status: "pending",
      source: "public_form",
      submitted_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("events_submissions").insert([payload]);
      if (error) {
        console.error("Error saving event submission:", error.message);
        setSubmitError("We couldn't submit this right now. Please try again or email events@cityofwhiteplains.com.");
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("Unexpected error saving event submission:", err);
      setSubmitError("We couldn't submit this right now. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitMessage(
      "Thanks! Your event is pending review. Once approved, it will appear above and be labeled as a community submission."
    );
    form.reset();
  }

  const eventsForSelectedDate =
    selectedDate !== "all" && view === "calendar"
      ? filteredEvents.filter((event) => event.dayKey === selectedDate)
      : filteredEvents;

  return (
    <>
      <section className="mt-8 rounded-3xl border border-[#ECEEF3] bg-white p-5 text-xs text-[#1C1F2A] shadow-sm md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A91A0]">
              Explore events
            </span>
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={[
                  "rounded-full border px-3 py-1 text-[11px] transition",
                  activeFilter === option.id
                    ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#1C1F2A]"
                    : "border-[#ECEEF3] bg-white text-[#5A6270] hover:border-[#D7DBFF]",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="search"
                placeholder="Search by title or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 rounded-full border border-[#ECEEF3] bg-[#FAFAFA] px-3 py-1.5 pr-8 text-[11px] text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
              />
              <span className="pointer-events-none absolute right-2 top-1.5 text-[#8A91A0]">⌕</span>
            </div>
            <div className="inline-flex overflow-hidden rounded-full border border-[#ECEEF3] bg-[#FAFAFA]">
              {(["list", "calendar"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={[
                    "px-3 py-1.5 text-[11px] font-semibold transition",
                    view === mode ? "bg-[#4B5FC6] text-white" : "text-[#5A6270]",
                  ].join(" ")}
                >
                  {mode === "list" ? "List" : "Calendar"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {dateKeys.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDate("all")}
              className={[
                "rounded-2xl border px-3 py-2 text-left text-[11px] transition",
                selectedDate === "all"
                  ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#1C1F2A]"
                  : "border-[#ECEEF3] bg-[#FAFAFA] text-[#5A6270] hover:border-[#D7DBFF]",
              ].join(" ")}
            >
              <p className="font-semibold text-[#1C1F2A]">All dates</p>
              <p className="text-[#4B5FC6]">{preparedEvents.length} total</p>
            </button>
            {dateKeys.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={[
                  "rounded-2xl border px-3 py-2 text-left text-[11px] transition",
                  selectedDate === day
                    ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#1C1F2A]"
                    : "border-[#ECEEF3] bg-[#FAFAFA] text-[#5A6270] hover:border-[#D7DBFF]",
                ].join(" ")}
              >
                <p className="font-semibold text-[#1C1F2A]">{formatDateLabel(day)}</p>
                <p className="text-[#4B5FC6]">
                  {preparedEvents.filter((evt) => evt.dayKey === day).length} event(s)
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between text-[11px] text-[#5A6270]">
          <p>
            Showing {eventsForSelectedDate.length} event{eventsForSelectedDate.length === 1 ? "" : "s"}{" "}
            {activeFilter !== "all" && (
              <span className="text-[#4B5FC6]">
                • Filter: {filterOptions.find((f) => f.id === activeFilter)?.label}
              </span>
            )}
          </p>
          <p className="text-[#8A91A0]">City feed + approved community events</p>
        </div>

        {eventsForSelectedDate.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-[#ECEEF3] bg-[#FAFAFA] p-4 text-[11px] text-[#5A6270]">
            No events match these filters yet. Try switching the view or removing a filter.
          </div>
        ) : view === "list" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventsForSelectedDate.map((event) => (
              <article
                key={`${event.source || "city"}-${event.id}`}
                className="flex flex-col justify-between rounded-2xl border border-[#ECEEF3] bg-[#FAFAFA] p-4 text-[11px] text-[#5A6270] shadow-sm transition hover:-translate-y-1 hover:border-[#4B5FC6]/50 hover:shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#EEF0FF] px-2 py-0.5 font-semibold text-[#4B5FC6]">
                      {formatDateTimeLabel(event.start)}
                    </span>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 font-semibold",
                        event.source === "community"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-[#E5E7EB] text-[#374151]",
                      ].join(" ")}
                    >
                      {event.source === "community" ? "Community (approved)" : "City feed"}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#1C1F2A]">{event.title}</p>

                  {event.location && (
                    <p className="text-[11px] text-[#5A6270]">{cleanLocation(event.location)}</p>
                  )}

                  {event.description && (
                    <p className="mt-1 line-clamp-3 text-[11px] text-[#8A91A0]">
                      {event.description.trim()}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {event.audience && (
                    <span className="rounded-full bg-[#E5E7EB] px-2 py-0.5 font-semibold text-[#374151]">
                      {event.audience === "family" ? "Family-friendly" : "18+ (non-explicit)"}
                    </span>
                  )}
                  {event.flags.free && (
                    <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 font-semibold text-[#15803D]">
                      Free
                    </span>
                  )}
                  {event.flags.outdoor && (
                    <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 font-semibold text-[#0369A1]">
                      Outdoor
                    </span>
                  )}
                  {event.url && (
                    <a
                      href={event.url}
                      className="rounded-full bg-[#EEF0FF] px-2 py-0.5 font-semibold text-[#4B5FC6] underline"
                    >
                      Details / tickets
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {dateKeys.map((day) => {
              const dayEvents = filteredEvents.filter((evt) => evt.dayKey === day);
              if (dayEvents.length === 0) return null;
              return (
                <div key={day} className="rounded-2xl border border-[#ECEEF3] bg-[#FAFAFA] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-[#1C1F2A]">{formatDateLabel(day)}</p>
                    <span className="text-[11px] text-[#8A91A0]">{dayEvents.length} event(s)</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {dayEvents.map((event) => (
                      <div
                        key={`${event.source || "city"}-${event.id}`}
                        className="rounded-xl border border-[#ECEEF3] bg-white p-3 text-[11px] text-[#5A6270]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] font-semibold text-[#1C1F2A]">{event.title}</p>
                          <span className="rounded-full bg-[#EEF0FF] px-2 py-0.5 font-semibold text-[#4B5FC6]">
                            {new Date(event.start).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-[11px] text-[#5A6270]">{cleanLocation(event.location)}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {event.audience && (
                            <span className="rounded-full bg-[#E5E7EB] px-2 py-0.5 font-semibold text-[#374151]">
                              {event.audience === "family" ? "Family" : "18+ / 21+"}
                            </span>
                          )}
                          {event.flags.free && (
                            <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 font-semibold text-[#15803D]">
                              Free
                            </span>
                          )}
                          {event.flags.outdoor && (
                            <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 font-semibold text-[#0369A1]">
                              Outdoor
                            </span>
                          )}
                          {event.source === "community" && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                              Approved community
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Submit event tab */}
      <section
        id="submit-event"
        className="mt-8 rounded-3xl border border-[#ECEEF3] bg-white p-5 text-xs text-[#1C1F2A] shadow-sm md:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A91A0]">
              Event planners &amp; venues
            </p>
            <h2 className="text-lg font-bold text-[#1C1F2A]">
              Submit an event (admin approval required)
            </h2>
            <p className="text-[11px] text-[#5A6270]">
              Typical review time: 1–2 business days. Approved events appear in the calendar above and are labeled as
              community submissions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen((prev) => !prev)}
            className={[
              "rounded-full border px-4 py-2 text-[11px] font-semibold transition",
              formOpen
                ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                : "border-[#ECEEF3] bg-[#FAFAFA] text-[#4B5FC6]",
            ].join(" ")}
            aria-expanded={formOpen}
            aria-controls="event-submit-panel"
          >
            {formOpen ? "Hide submission form" : "Open submission form"}
          </button>
        </div>

        {submitMessage && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[11px] text-[#166534]">
            {submitMessage}
          </div>
        )}
        {submitError && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-[#92400e]">
            {submitError}
          </div>
        )}

        {formOpen && (
          <div
            id="event-submit-panel"
            className="mt-5 grid gap-6 md:grid-cols-[1fr,1.05fr] md:items-start"
          >
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#EEF0FF] px-4 py-3 text-[11px] text-[#1C1F2A]">
                <p className="font-semibold text-[#4B5FC6]">Policy highlights</p>
                <p className="text-[#5A6270]">
                  Family-first standards. Adult events must be non-explicit. No pornographic or graphic content. Include
                  accessibility notes (wheelchair access, ASL, sensory-friendly) and truthful details.
                </p>
              </div>
              <ul className="space-y-2 text-[11px] text-[#4B5FC6]">
                <li className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>Mark the correct audience (Family or 18+/21+ non-explicit).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>Include accessibility info and a way for us to contact you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>We may request edits. Non-compliant events won&apos;t be published.</span>
                </li>
              </ul>
              <p className="text-[11px] text-[#5A6270]">
                Questions? Email{" "}
                <a className="underline hover:text-[#1C1F2A]" href="mailto:events@cityofwhiteplains.com">
                  events@cityofwhiteplains.com
                </a>
                .
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[#ECEEF3] bg-[#FAFAFA] p-4">
              <div className="grid gap-2">
                <label className="font-semibold text-[#1C1F2A]" htmlFor="title">
                  Event title
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                  placeholder="e.g., Downtown Winter Market"
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="start">
                    Start date &amp; time
                  </label>
                  <input
                    id="start"
                    name="start"
                    required
                    type="datetime-local"
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="end">
                    End date &amp; time (optional)
                  </label>
                  <input
                    id="end"
                    name="end"
                    type="datetime-local"
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="font-semibold text-[#1C1F2A]" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  required
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                  placeholder="Venue name, address, or park"
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="audience">
                    Audience
                  </label>
                  <select
                    id="audience"
                    name="audience"
                    required
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select an audience
                    </option>
                    <option value="family">Family-friendly / all ages</option>
                    <option value="18plus">18+ (non-explicit)</option>
                    <option value="21plus">21+ (non-explicit)</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="cost">
                    Cost
                  </label>
                  <input
                    id="cost"
                    name="cost"
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                    placeholder="Free, $10 suggested donation, etc."
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="font-semibold text-[#1C1F2A]" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                  placeholder="What is happening? Who is it for? Any special notes?"
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="accessibility">
                    Accessibility details
                  </label>
                  <input
                    id="accessibility"
                    name="accessibility"
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                    placeholder="Wheelchair access, ASL, sensory-friendly hours"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="url">
                    Website or ticket link
                  </label>
                  <input
                    id="url"
                    name="url"
                    type="url"
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="contact_name">
                    Your name
                  </label>
                  <input
                    id="contact_name"
                    name="contact_name"
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                    placeholder="First and last name"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-semibold text-[#1C1F2A]" htmlFor="contact_email">
                    Contact email (not shown publicly)
                  </label>
                  <input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    required
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="font-semibold text-[#1C1F2A]" htmlFor="attachments">
                  Media links (optional)
                </label>
                <input
                  id="attachments"
                  name="attachments"
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#1C1F2A] outline-none transition focus:border-[#4B5FC6] focus:ring-2 focus:ring-[#4B5FC6]/20"
                  placeholder="Image or video URLs for review"
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2">
                <input
                  id="policy"
                  name="policy"
                  type="checkbox"
                  required
                  className="mt-[2px] h-4 w-4 rounded border-[#4B5FC6] text-[#4B5FC6] focus:ring-[#4B5FC6]"
                />
                <label htmlFor="policy" className="text-[11px] leading-snug">
                  I confirm this event follows the{" "}
                  <a href="#events-policy" className="font-semibold text-[#4B5FC6] underline">
                    Events Policy
                  </a>{" "}
                  (no explicit content, respectful, truthful, and accessible).
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4B5FC6] px-4 py-2 text-[12px] font-semibold text-white transition hover:-translate-y-[1px] hover:bg-[#3F52AE] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit for review"}
                <span aria-hidden className="text-sm">
                  ↗
                </span>
              </button>
            </form>
          </div>
        )}
      </section>
    </>
  );
}
