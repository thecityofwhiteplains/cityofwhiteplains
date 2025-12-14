// app/eat-drink/page.tsx
import type { Metadata } from "next";
import Script from "next/script";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EatDrinkPageClient from "../components/eat-drink/EatDrinkPageClient";
import { getPageHeroImage } from "../lib/homepageSettings";
import { getEatDrinkContent } from "../lib/eatDrinkData";
import { SITE_NAME, absoluteUrl } from "../lib/seo";

export const metadata: Metadata = {
  title: "Eat & Drink in White Plains | CityOfWhitePlains.org",
  description:
    "Calm, practical suggestions for where to eat and drink in White Plains—whether you're here for court, a quick visit, or a family day downtown.",
  alternates: {
    canonical: "/eat-drink",
  },
  openGraph: {
    title: "Eat & Drink in White Plains",
    description:
      "Honest picks for coffee, breakfast, lunch, and dinner—matched to the kind of day you're having.",
    url: absoluteUrl("/eat-drink"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [
      {
        url:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Eat and drink in White Plains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eat & Drink in White Plains",
    description:
      "Honest picks for coffee, breakfast, lunch, and dinner—matched to the kind of day you're having.",
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

// Always fetch the latest picks so admin updates show immediately.
export const revalidate = 0;

function buildEatDrinkStructuredData(places: Awaited<ReturnType<typeof getEatDrinkContent>>["places"]) {
  const itemListElement = places.map((place, index) => {
    const url =
      place.websiteUrl ||
      place.mapsUrl ||
      absoluteUrl(`/eat-drink#spot-${place.id}`);
    return {
      "@type": "ListItem",
      position: index + 1,
      name: place.name,
      url,
    };
  });

  const restaurants = places.map((place) => {
    const url =
      place.websiteUrl ||
      place.mapsUrl ||
      absoluteUrl(`/eat-drink#spot-${place.id}`);
    const data: Record<string, unknown> = {
      "@type": "Restaurant",
      "@id": url,
      name: place.name,
      url,
      description: place.shortDescription,
      priceRange: place.budget,
      servesCuisine: place.category.replace("-", " "),
      areaServed: "White Plains, NY",
    };
    if (place.imageUrl) data.image = place.imageUrl;
    if (place.address) data.address = place.address;
    if (place.phone) data.telephone = place.phone;
    if (place.menuUrl) data.hasMenu = place.menuUrl;
    if (place.mapsUrl) data.map = place.mapsUrl;
    if (place.websiteUrl) data.sameAs = [place.websiteUrl];
    return data;
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Eat & Drink in White Plains",
        description:
          "Restaurants, coffee, and quick bites in White Plains, NY curated for different visit types.",
        url: absoluteUrl("/eat-drink"),
        itemListElement,
      },
      ...restaurants,
    ],
  };
}

export default async function EatDrinkPage() {
  const heroImageUrl = await getPageHeroImage("eat");
  const { places, featuredIds } = await getEatDrinkContent();
  const structuredData = buildEatDrinkStructuredData(places);

  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <Script
        id="eat-drink-ld-json"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <EatDrinkPageClient
        heroImageUrl={heroImageUrl}
        places={places}
        featuredIds={featuredIds}
      />
      <Footer />
    </div>
  );
}
