// app/components/home/HeroSection.tsx
import { DEFAULT_HOMEPAGE_HERO_IMAGE } from "@/app/lib/constants";

type HeroSectionProps = {
  heroImageUrl?: string | null;
};

export default function HeroSection({ heroImageUrl }: HeroSectionProps) {
  const backgroundImage = heroImageUrl?.trim() || DEFAULT_HOMEPAGE_HERO_IMAGE;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#1C1F2A] text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="Downtown White Plains at dusk"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1C1F2A]/90 via-[#1C1F2A]/40 to-[#4B5FC6]/70" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:py-14">
        {/* Left: Welcome copy */}
        <div className="max-w-xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#4B5FC6]" />
            Welcome to White Plains, NY
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            A small city with big-city comfort.
          </h1>

          <p className="text-sm text-slate-100/90">
            Whether you&apos;re here for court, staying for the weekend, grabbing dinner
            with friends, or curious about living here, this is your friendly entrance to
            White Plains — all in one simple, visitor-first guide.
          </p>

          {/* Audience chips */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-100/90">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Visitors &amp; day trips
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Locals &amp; nearby workers
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Court &amp; business visits
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              Thinking of moving here
            </span>
          </div>
        </div>

        {/* Right: quick-start tiles */}
      </div>
    </section>
  );
}
