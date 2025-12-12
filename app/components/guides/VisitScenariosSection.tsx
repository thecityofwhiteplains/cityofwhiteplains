// app/components/guides/VisitScenariosSection.tsx

const scenarios = [
    {
      id: "court-day",
      label: "Court & appointments",
      title: "I’m here for court or a legal appointment.",
      description:
        "You want to arrive on time, know where to wait between sessions, and find calm places for coffee or lunch nearby.",
      linkLabel: "Jump to court-day guide",
      href: "#court-day",
    },
    {
      id: "no-car",
      label: "No car",
      title: "I’m visiting without a car.",
      description:
        "You’re coming in on the train or getting dropped off and want everything you need within walking distance.",
      linkLabel: "Jump to no-car guide",
      href: "#no-car",
    },
    {
      id: "with-kids",
      label: "With kids",
      title: "I’m in town with kids or family.",
      description:
        "You’re looking for a simple, low-stress mix of parks, food, and places to walk without going far.",
      linkLabel: "Jump to family guide",
      href: "#with-kids",
    },
    {
      id: "day-loop",
      label: "Day trip",
      title: "I’m here for a quick day or overnight.",
      description:
        "Think: one calm loop through downtown — coffee, a walk, lunch, a bit of shopping, and dinner.",
      linkLabel: "Jump to 24-hour loop",
      href: "#day-loop",
    },
  ];
  
  export default function VisitScenariosSection() {
    return (
      <section className="mt-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
              Which one sounds like your visit?
            </h2>
            <p className="text-xs text-[#5A6270]">
              Pick the scenario that feels closest — you can always mix and match
              ideas.
            </p>
          </div>
        </div>
  
        <div className="grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <article
              key={scenario.id}
              className="flex flex-col justify-between rounded-2xl border border-[#ECEEF3] bg-white p-4 text-xs text-[#5A6270] shadow-sm transition hover:-translate-y-1 hover:border-[#4B5FC6]/40 hover:shadow-md"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A91A0]">
                  {scenario.label}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-[#1C1F2A]">
                  {scenario.title}
                </h3>
                <p className="mt-2 text-[11px]">{scenario.description}</p>
              </div>
              <a
                href={scenario.href}
                className="mt-3 text-[11px] font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
              >
                {scenario.linkLabel} →
              </a>
            </article>
          ))}
        </div>
      </section>
    );
  }