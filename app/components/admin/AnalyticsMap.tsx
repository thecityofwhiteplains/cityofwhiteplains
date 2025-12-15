"use client";

import { memo, useMemo } from "react";
import { geoPath, geoMercator, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import worldData from "world-atlas/countries-110m.json";

type CountryStat = {
  country: string;
  countryCode?: string | null;
  count: number;
};

// Register English names for lookup (safe to call multiple times).
if (!countries.getName("US", "en")) {
  countries.registerLocale(enLocale);
}

const WORLD_WIDTH = 569;
const WORLD_HEIGHT = 259;
const geoJson = feature(worldData as any, (worldData as any).objects.countries);

const numericCodes = countries.getNumericCodes();
const alpha2ToNumeric = (code?: string | null) => {
  if (!code) return null;
  const numeric = numericCodes[code.toUpperCase() as keyof typeof numericCodes];
  if (!numeric) return null;
  // Drop leading zeroes to match the Natural Earth ids.
  return String(Number(numeric));
};

function getFill(
  geoId: string | number,
  lookup: Map<string, { count: number }>,
  maxCount: number
) {
  const key = typeof geoId === "number" ? String(geoId) : geoId;
  const entry = lookup.get(key);
  if (!entry || maxCount === 0) {
    return "#0f172a";
  }
  const ratio = Math.min(1, entry.count / maxCount);
  const alpha = 0.18 + ratio * 0.65;
  return `rgba(79, 70, 229, ${alpha.toFixed(3)})`;
}

function useCountryLookup(countriesStat: CountryStat[]) {
  return useMemo(() => {
    const map = new Map<string, { count: number }>();
    countriesStat.forEach((country) => {
      const numeric = alpha2ToNumeric(country.countryCode);
      if (!numeric) return;
      map.set(numeric, { count: country.count });
    });
    return map;
  }, [countriesStat]);
}

function AnalyticsMap({ countries: countryStats }: { countries: CountryStat[] }) {
  const lookup = useCountryLookup(countryStats);
  const maxCount =
    countryStats.reduce((max, item) => Math.max(max, item.count), 0) || 0;

  const projection = useMemo(
    () => geoMercator().scale(100).translate([WORLD_WIDTH / 2, WORLD_HEIGHT / 1.6]),
    []
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticulePath = useMemo(
    () => pathGenerator(geoGraticule10()) || "",
    [pathGenerator]
  );

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#111827]">Visitors by country</p>
          <p className="text-[11px] text-[#6B7280]">
            Page view impressions, tinted by relative traffic.
          </p>
        </div>
        <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[10px] font-semibold text-[#4B5563]">
          geo-lite
        </span>
      </div>

      <div className="mt-3 flex-1 overflow-hidden rounded-2xl bg-[#0B1220]">
        <svg
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          className="h-full w-full"
          role="img"
          aria-label="World map of visitors by country"
        >
          <defs>
            <linearGradient id="map-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="100%" stopColor="#0B1220" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-glow)" />
          <path
            d={graticulePath}
            fill="none"
            stroke="#1f2937"
            strokeWidth={0.25}
            vectorEffect="non-scaling-stroke"
          />
          {(geoJson as any).features?.map((geo: any, idx: number) => {
            const path = pathGenerator(geo) || "";
            const fill = getFill(geo.id as string, lookup, maxCount);
            return (
              <path
                key={`${geo.id}-${idx}`}
                d={path}
                fill={fill}
                stroke="#0B1220"
                strokeWidth={0.3}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </div>

      {countryStats.length === 0 ? (
        <p className="mt-3 text-[11px] text-[#9CA3AF]">
          No page view geo data yet. Check back after new impressions roll in.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          {countryStats.slice(0, 4).map((country) => (
            <div
              key={`${country.country}-${country.countryCode || "unknown"}`}
              className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-3 py-2 text-[#111827]"
            >
              <span className="truncate">{country.country}</span>
              <span className="text-[#4B5FC6] font-semibold">{country.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(AnalyticsMap);
