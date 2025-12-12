// app/visit/page.tsx
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import VisitPageClient from "../components/visit/VisitPageClient";
import { getPageHeroImage } from "../lib/homepageSettings";
import { getTodayWeather } from "../lib/weather";
import { SITE_NAME, absoluteUrl } from "../lib/seo";
import { getAdsByPlacement } from "../lib/ads";

export const metadata: Metadata = {
  title: "Visit White Plains | CityOfWhitePlains.org",
  description:
    "Calm, practical visit guides for White Plains—whether you're here for court, a quick no-car visit, or a family day downtown.",
  alternates: {
    canonical: "/visit",
  },
  openGraph: {
    title: "Visit White Plains",
    description:
      "Plan White Plains days with easy guides: court days, no-car trips, and family visits.",
    url: absoluteUrl("/visit"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [
      {
        url:
          "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Visit White Plains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit White Plains",
    description:
      "Plan White Plains days with easy guides: court days, no-car trips, and family visits.",
    images: [
      "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

// Refresh ads and weather on a quicker cadence
export const revalidate = 300;

export default async function VisitPage() {
  const heroImageUrl = await getPageHeroImage("visit");
  const weather = await getTodayWeather();
  const ads = await getAdsByPlacement([
    "visit_lodging",
    "visit_rentals",
    "transport",
  ]);

  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <VisitPageClient
        heroImageUrl={heroImageUrl}
        weatherHigh={weather.high}
        weatherLow={weather.low}
        lodgingAd={ads["visit_lodging"]?.[0]}
        rentalsAd={ads["visit_rentals"]?.[0]}
        transportAd={ads["transport"]?.[0]}
      />
      <Footer />
    </div>
  );
}
