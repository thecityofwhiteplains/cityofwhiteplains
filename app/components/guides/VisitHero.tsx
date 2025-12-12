// app/components/guides/VisitHero.tsx

export default function VisitHero() {
    return (
      <section className="rounded-3xl bg-[#1C1F2A] px-5 py-8 text-white sm:px-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em]">
              Plan your visit
            </span>
  
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Make your time in White Plains feel a little easier.
            </h1>
  
            <p className="text-sm text-slate-100/90">
              Most people come to White Plains for something specific — court,
              work, shopping, a quick stay, or to see friends and family. This
              page is built around those real trips, with simple suggestions and
              no overwhelm.
            </p>
  
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-100/90">
              <a
                href="#court-day"
                className="rounded-full bg-white/10 px-3 py-1 backdrop-blur hover:bg-white/20"
              >
                Here for court
              </a>
              <a
                href="#no-car"
                className="rounded-full bg-white/10 px-3 py-1 backdrop-blur hover:bg-white/20"
              >
                Visiting without a car
              </a>
              <a
                href="#with-kids"
                className="rounded-full bg-white/10 px-3 py-1 backdrop-blur hover:bg-white/20"
              >
                With kids
              </a>
              <a
                href="#day-loop"
                className="rounded-full bg-white/10 px-3 py-1 backdrop-blur hover:bg-white/20"
              >
                24-hour downtown loop
              </a>
            </div>
          </div>
  
          {/* Quick facts card */}
          <aside className="mt-4 w-full max-w-xs rounded-2xl bg-black/30 p-4 text-xs text-slate-100/90 md:ml-auto md:mt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
              Quick snapshot
            </p>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="font-semibold text-white">Train:</span>{" "}
                Metro-North Harlem Line to{" "}
                <span className="font-medium">White Plains</span> station.
              </li>
              <li>
                <span className="font-semibold text-white">Walkability:</span>{" "}
                compact downtown with courts, food, and shops within a short walk.
              </li>
              <li>
                <span className="font-semibold text-white">Best for:</span>{" "}
                quick visits, errands, meetups, and easy base for the Hudson
                Valley.
              </li>
            </ul>
          </aside>
        </div>
      </section>
    );
  }