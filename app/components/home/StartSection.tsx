// app/components/home/StartSection.tsx

import { DEFAULT_START_CARD_IMAGES } from "@/app/lib/constants";
import type { StartCardImages } from "@/app/lib/homepageSettings";

type StartSectionProps = {
  startCardImages?: StartCardImages | null;
};

export default function StartSection({ startCardImages }: StartSectionProps) {
  const cards = [
    {
      id: "visitors",
      href: "/visit",
      eyebrow: "Visitors",
      title: "I'm visiting for a day or weekend",
      body: "Simple starting points whether you're arriving by train or car, with or without kids.",
      cta: "Go to Visit →",
      imageUrl:
        startCardImages?.visitors?.trim() ||
        DEFAULT_START_CARD_IMAGES.visitors,
    },
    {
      id: "court",
      href: "/visit#court-day",
      eyebrow: "Court & business",
      title: "I'm here for court or a meeting",
      body: "Calm, practical info: getting here on time, nearby coffee, and what to expect around the courthouse.",
      cta: "Court day guide →",
      imageUrl:
        startCardImages?.court?.trim() || DEFAULT_START_CARD_IMAGES.court,
    },
    {
      id: "eat",
      href: "/eat-drink",
      eyebrow: "Eat & drink",
      title: "I just need somewhere good to eat",
      body: "Quick lunches, calm coffee shops, and dinner & drinks before heading home.",
      cta: "See Eat & Drink →",
      imageUrl: startCardImages?.eat?.trim() || DEFAULT_START_CARD_IMAGES.eat,
    },
    {
      id: "business",
      href: "/business",
      eyebrow: "Locals & future locals",
      title: "I run / support a local business",
      body: "Learn how listings will work and how to be part of how people discover White Plains.",
      cta: "Business info →",
      imageUrl:
        startCardImages?.business?.trim() ||
        DEFAULT_START_CARD_IMAGES.business,
    },
  ];

  const Card = ({
    href,
    eyebrow,
    title,
    body,
    cta,
    imageUrl,
  }: (typeof cards)[number]) => (
    <a
      href={href}
      className="group relative mb-4 flex flex-col justify-between overflow-hidden rounded-2xl border border-[#ECEEF3] text-xs text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-white/30 md:mb-0 break-inside-avoid"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.7) 100%), url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/55 transition group-hover:from-black/20 group-hover:to-black/60" />
      <div className="relative flex flex-col gap-3 p-4">
        <p className="text-[11px] uppercase tracking-wide text-slate-100">
          {eyebrow}
        </p>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-[11px] text-slate-100/90">{body}</p>
      </div>
      <span className="relative mx-4 mb-4 inline-flex items-center justify-center rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#1C1F2A] transition group-hover:bg-white">
        {cta}
      </span>
    </a>
  );

  return (
    <section className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A6270]">
            Choose the path that fits your trip
          </h2>
          <p className="text-xs text-[#5A6270]">
            We built the site around real reasons people come to White Plains —
            not just pretty photos.
          </p>
        </div>
      </div>

      {/* Mobile masonry (2-col) */}
      <div className="columns-2 gap-4 md:hidden">
        {cards.map((card) => (
          <Card key={card.id} {...card} />
        ))}
      </div>

      {/* Desktop grid */}
      <div className="hidden gap-4 md:grid md:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.id} {...card} />
        ))}
      </div>
    </section>
  );
}
