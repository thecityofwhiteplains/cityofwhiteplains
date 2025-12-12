"use client";

import { useState } from "react";

type GuideId = "court-day" | "no-car" | "with-kids" | "day-loop";

type Spot = {
  name: string;
  type: string;
  distance: string;
  vibe: string;
  partnerUrl: string; // affiliate or partner link
};

type Hotel = {
  name: string;
  distance: string;
  vibe: string;
  priceBand: "$" | "$$" | "$$$";
  bookingUrl: string; // affiliate URL
};

// Court-day coffee / lunch partners (placeholder data)
const courtDaySpots: Spot[] = [
  {
    name: "Calm Corner Café",
    type: "Coffee & light breakfast",
    distance: "5–7 min walk from courthouse",
    vibe: "Quiet seating, good for reviewing paperwork between sessions.",
    partnerUrl: "#partner-calm-corner-cafe", // TODO: replace with real partner link
  },
  {
    name: "Main Street Lunch Spot",
    type: "Quick lunch",
    distance: "Within a few blocks of Main St.",
    vibe: "Fast service, simple menu, easy to get in and out during breaks.",
    partnerUrl: "#partner-main-street-lunch", // TODO: replace with real partner link
  },
];

// No-car essentials (placeholder data)
const noCarEssentials: Spot[] = [
  {
    name: "Station Side Market",
    type: "Grab-and-go food",
    distance: "Next to or near the train station",
    vibe: "Snacks, drinks, and basics right as you arrive or before you leave.",
    partnerUrl: "#partner-station-market", // TODO: replace with real partner link
  },
  {
    name: "Downtown Essentials Pharmacy",
    type: "Pharmacy & essentials",
    distance: "Short walk from Main St.",
    vibe: "Last-minute items: toiletries, medicine, chargers, and more.",
    partnerUrl: "#partner-downtown-pharmacy", // TODO: replace with real partner link
  },
];

// Kid/family-friendly food & treats (placeholder data)
const familySpots: Spot[] = [
  {
    name: "Family Table Diner",
    type: "Kid-friendly meals",
    distance: "Close to downtown parks",
    vibe: "Comfort food, kids’ menu, booths, and a relaxed atmosphere.",
    partnerUrl: "#partner-family-diner", // TODO: replace with real partner link
  },
  {
    name: "Downtown Scoop",
    type: "Ice cream & dessert",
    distance: "Walkable from Main St.",
    vibe: "Easy treat stop after the park or dinner.",
    partnerUrl: "#partner-downtown-scoop", // TODO: replace with real partner link
  },
];

// Downtown hotel suggestions (placeholder data)
const downtownHotels: Hotel[] = [
  {
    name: "Downtown Business Hotel",
    distance: "4–6 min walk to Main St.",
    vibe: "Quiet, business-friendly stay close to court and downtown.",
    priceBand: "$$",
    bookingUrl: "#booking-downtown-business-hotel", // TODO: replace with real affiliate link
  },
  {
    name: "Station Side Hotel",
    distance: "Near the train station",
    vibe: "Easy for arrivals by Metro-North, short ride or walk into downtown.",
    priceBand: "$$",
    bookingUrl: "#booking-station-side-hotel", // TODO: replace with real affiliate link
  },
  {
    name: "Weekend Stay Hotel",
    distance: "Short drive to downtown",
    vibe: "Good fit for quick weekend visits, shopping, and food runs.",
    priceBand: "$$",
    bookingUrl: "#booking-weekend-stay-hotel", // TODO: replace with real affiliate link
  },
];

export default function VisitDetailsSection() {
  const [openId, setOpenId] = useState<GuideId>("court-day");

  const handleToggle = (id: GuideId) => {
    setOpenId(id);
  };

  return (
    <section className="mt-12 space-y-5">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
          Visit guides, built around real trips
        </h2>
        <p className="text-xs text-[#5A6270]">
          Open the card that sounds most like your visit. Each guide keeps
          things practical and calm — not overwhelming.
        </p>
      </header>

      <div className="space-y-3">
        {/* COURT DAY */}
        <article
          id="court-day"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#ECEEF3] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => handleToggle("court-day")}
            aria-expanded={openId === "court-day"}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A91A0]">
                Court &amp; legal visits
              </p>
              <p className="text-sm font-semibold text-[#1C1F2A]">
                I&apos;m here for court or a legal appointment.
              </p>
              <p className="mt-1 text-[11px] text-[#5A6270]">
                Focused on getting here on time, staying oriented, and finding
                calm spots between sessions.
              </p>
            </div>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-bold text-[#4B5FC6] transition-transform ${
                openId === "court-day" ? "rotate-90" : ""
              }`}
            >
              ▸
            </span>
          </button>

          {openId === "court-day" && (
            <div className="border-t border-[#ECEEF3] px-4 pb-4 pt-3 text-xs text-[#5A6270]">
              <p className="text-[11px]">
                Court days are stressful enough. Use this guide to remove little
                frictions — where to arrive, where to wait, and how to plan
                breaks.
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Getting here
                  </p>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-[11px]">
                    <li>
                      Metro-North Harlem Line to{" "}
                      <span className="font-medium">White Plains</span>
                      &nbsp;station, then a short walk or cab to the courthouse.
                    </li>
                    <li>
                      Driving? Plan extra time for garages near Main St. and
                      Martine Ave — mornings fill up fastest.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Between sessions
                  </p>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-[11px]">
                    <li>
                      Keep 1–2 calm coffee shops in mind within a 5–10 minute
                      walk so you&apos;re not searching while stressed.
                    </li>
                    <li>
                      Have one &quot;quiet lunch&quot; option and one
                      &quot;fast bite&quot; option ready to go.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Simple court-day flow
                  </p>
                  <ol className="mt-1 space-y-1 list-decimal list-inside text-[11px]">
                    <li>Arrive early enough to find parking or orient yourself.</li>
                    <li>Check in, find your courtroom, and note a nearby exit.</li>
                    <li>
                      Use breaks to hydrate, eat something small, and step
                      outside for fresh air.
                    </li>
                    <li>
                      Plan your route home (train time / garage closing time)
                      before the day gets busy.
                    </li>
                  </ol>
                </div>
                <aside className="rounded-2xl border border-[#D7DBFF] bg-[#EEF0FF] p-3 text-[11px] text-[#1C1F2A]">
                  <p className="font-semibold">Court-day checklist idea</p>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Exact address, room number, and time saved on your phone.</li>
                    <li>Train schedule or parking plan ready before you leave.</li>
                    <li>
                      1–2 nearby food/coffee spots you&apos;re comfortable with.
                    </li>
                    <li>
                      A short list of questions for your attorney or contact so
                      nothing slips your mind.
                    </li>
                  </ul>
                </aside>
              </div>

              {/* 🔹 Monetization: calm coffee & lunch partners near court */}
              <div className="mt-4 space-y-2 rounded-2xl border border-[#F2E7FF] bg-[#FBF7FF] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Nearby calm spots for breaks
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    Some locations may partner with CityOfWhitePlains.org.
                  </p>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {courtDaySpots.map((spot) => (
                    <div
                      key={spot.name}
                      className="rounded-xl bg-white p-3 text-[11px] text-[#1C1F2A] shadow-sm"
                    >
                      <p className="font-semibold">{spot.name}</p>
                      <p className="mt-0.5 text-[10px] text-[#6B7280]">
                        {spot.type} · {spot.distance}
                      </p>
                      <p className="mt-1 text-[10px] text-[#4B5563]">
                        {spot.vibe}
                      </p>
                      <a
                        href={spot.partnerUrl}
                        className="mt-2 inline-flex text-[10px] font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View details →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* NO CAR */}
        <article
          id="no-car"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#ECEEF3] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => handleToggle("no-car")}
            aria-expanded={openId === "no-car"}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A91A0]">
                No car
              </p>
              <p className="text-sm font-semibold text-[#1C1F2A]">
                I&apos;m visiting without a car.
              </p>
              <p className="mt-1 text-[11px] text-[#5A6270]">
                Focused on walkability from the train station and short rides
                only when needed.
              </p>
            </div>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-bold text-[#4B5FC6] transition-transform ${
                openId === "no-car" ? "rotate-90" : ""
              }`}
            >
              ▸
            </span>
          </button>

          {openId === "no-car" && (
            <div className="border-t border-[#ECEEF3] px-4 pb-4 pt-3 text-xs text-[#5A6270]">
              <p className="text-[11px]">
                Once you&apos;re off the train, most of what you need is in a
                compact downtown triangle — the station, Main St., and
                Mamaroneck Ave.
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    From the train
                  </p>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-[11px]">
                    <li>
                      Follow signs for Main St. / downtown for the most direct
                      walking routes.
                    </li>
                    <li>
                      Prefer not to walk? Cabs and rideshares are usually
                      available near the station.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Keep it close
                  </p>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-[11px]">
                    <li>
                      Plan your day around a few blocks instead of trying to see
                      everything.
                    </li>
                    <li>
                      Look for a coffee spot, a quick lunch, and one or two
                      quiet places to sit.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Getting home
                  </p>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-[11px]">
                    <li>Check train times home before your day fills up.</li>
                    <li>
                      Give yourself a small buffer in case a meal or errand runs
                      long.
                    </li>
                  </ul>
                </div>
              </div>

              {/* 🔹 Monetization: essentials for no-car visitors */}
              <div className="mt-4 space-y-2 rounded-2xl border border-[#E0F2FE] bg-[#F5FAFF] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    No-car essentials near downtown
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    Some locations may use partner or affiliate links.
                  </p>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {noCarEssentials.map((spot) => (
                    <div
                      key={spot.name}
                      className="rounded-xl bg-white p-3 text-[11px] text-[#1C1F2A] shadow-sm"
                    >
                      <p className="font-semibold">{spot.name}</p>
                      <p className="mt-0.5 text-[10px] text-[#6B7280]">
                        {spot.type} · {spot.distance}
                      </p>
                      <p className="mt-1 text-[10px] text-[#4B5563]">
                        {spot.vibe}
                      </p>
                      <a
                        href={spot.partnerUrl}
                        className="mt-2 inline-flex text-[10px] font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View details →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* WITH KIDS */}
        <article
          id="with-kids"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#ECEEF3] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => handleToggle("with-kids")}
            aria-expanded={openId === "with-kids"}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A91A0]">
                With kids or family
              </p>
              <p className="text-sm font-semibold text-[#1C1F2A]">
                I&apos;m in town with kids or family.
              </p>
              <p className="mt-1 text-[11px] text-[#5A6270]">
                A short, low-stress mix of park time, simple food, and easy
                walks.
              </p>
            </div>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-bold text-[#4B5FC6] transition-transform ${
                openId === "with-kids" ? "rotate-90" : ""
              }`}
            >
              ▸
            </span>
          </button>

          {openId === "with-kids" && (
            <div className="border-t border-[#ECEEF3] px-4 pb-4 pt-3 text-xs text-[#5A6270]">
              <p className="text-[11px]">
                With kids, the goal is simple: short bursts of activity,
                predictable food, and as little backtracking as possible.
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Park + snack combo
                  </p>
                  <p className="mt-1 text-[11px]">
                    Pair a nearby playground or green space with an easy snack
                    or lunch spot so kids can move, then refuel.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Build in wiggle room
                  </p>
                  <p className="mt-1 text-[11px]">
                    Instead of stringing five activities together, plan two or
                    three, with open time in between for rest or changes.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Food picks
                  </p>
                  <p className="mt-1 text-[11px]">
                    Look for places with kid-friendly menus, quick service, and
                    restrooms — ideally close to where you&apos;re parking or
                    staying.
                  </p>
                </div>
              </div>

              {/* 🔹 Monetization: kid-friendly food & treat partners */}
              <div className="mt-4 space-y-2 rounded-2xl border border-[#FEF3C7] bg-[#FFFBEB] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Kid-friendly food & treat stops
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    Some locations may partner with CityOfWhitePlains.org.
                  </p>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {familySpots.map((spot) => (
                    <div
                      key={spot.name}
                      className="rounded-xl bg-white p-3 text-[11px] text-[#1C1F2A] shadow-sm"
                    >
                      <p className="font-semibold">{spot.name}</p>
                      <p className="mt-0.5 text-[10px] text-[#6B7280]">
                        {spot.type} · {spot.distance}
                      </p>
                      <p className="mt-1 text-[10px] text-[#4B5563]">
                        {spot.vibe}
                      </p>
                      <a
                        href={spot.partnerUrl}
                        className="mt-2 inline-flex text-[10px] font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View details →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* 24-HOUR LOOP + HOTEL MODULE */}
        <article
          id="day-loop"
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#ECEEF3] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => handleToggle("day-loop")}
            aria-expanded={openId === "day-loop"}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A91A0]">
                24-hour downtown loop
              </p>
              <p className="text-sm font-semibold text-[#1C1F2A]">
                I&apos;m here for a quick day or overnight.
              </p>
              <p className="mt-1 text-[11px] text-[#5A6270]">
                One simple loop through downtown: morning coffee, a walk, lunch,
                a bit of shopping, and dinner — with nearby places to stay.
              </p>
            </div>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-bold text-[#4B5FC6] transition-transform ${
                openId === "day-loop" ? "rotate-90" : ""
              }`}
            >
              ▸
            </span>
          </button>

          {openId === "day-loop" && (
            <div className="border-t border-[#ECEEF3] px-4 pb-4 pt-3 text-xs text-[#5A6270]">
              <p className="text-[11px]">
                Use this as a flexible outline. Swap in your own coffee, food,
                and activity picks as you get to know White Plains.
              </p>

              <ol className="mt-3 space-y-2 list-decimal list-inside text-[11px]">
                <li>
                  <span className="font-semibold text-[#1C1F2A]">
                    Morning:
                  </span>{" "}
                  arrive by train or car, grab coffee and something light, and
                  walk a short loop through downtown.
                </li>
                <li>
                  <span className="font-semibold text-[#1C1F2A]">
                    Late morning:
                  </span>{" "}
                  browse a bookstore, park, or quiet corner — something simple
                  that doesn&apos;t require tickets or reservations.
                </li>
                <li>
                  <span className="font-semibold text-[#1C1F2A]">
                    Afternoon:
                  </span>{" "}
                  sit-down lunch, then a little shopping or downtime back at
                  your hotel.
                </li>
                <li>
                  <span className="font-semibold text-[#1C1F2A]">
                    Evening:
                  </span>{" "}
                  dinner and a short walk before heading home or back to your
                  room.
                </li>
              </ol>

              {/* 🔹 Monetization module: downtown hotel recommendations */}
              <div className="mt-4 space-y-2 rounded-2xl border border-[#D7DBFF] bg-[#EEF0FF] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[11px] font-semibold text-[#1C1F2A]">
                    Stay nearby: downtown-friendly hotels
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    Some recommendations may use partner or affiliate links.
                  </p>
                </div>

                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {downtownHotels.map((hotel) => (
                    <div
                      key={hotel.name}
                      className="rounded-xl bg-white/80 p-3 text-[11px] text-[#1C1F2A] shadow-sm"
                    >
                      <p className="font-semibold">{hotel.name}</p>
                      <p className="mt-1 text-[10px] text-[#6B7280]">
                        {hotel.distance}
                      </p>
                      <p className="mt-1 text-[10px] text-[#4B5563]">
                        {hotel.vibe}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[10px] font-semibold text-[#4B5FC6]">
                          {hotel.priceBand} · Est.
                        </span>
                        <a
                          href={hotel.bookingUrl}
                          className="text-[10px] font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View rates →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-[11px] text-[#8A91A0]">
                Future versions of this guide will link directly to specific
                picks from the{" "}
                <a
                  href="/eat-drink"
                  className="font-semibold text-[#4B5FC6] hover:underline"
                >
                  Eat &amp; Drink
                </a>{" "}
                page and to nearby hotels using your preferred booking partners.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}