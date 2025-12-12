// app/page.tsx
import type { Metadata } from "next";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import InsiderBlogSection from "./components/home/InsiderBlogSection";
import HeroSection from "./components/home/HeroSection";
import StartSection from "./components/home/StartSection";
import UpcomingEventsSection from "./components/home/UpcomingEventsSection";
import LocalGuidesSection from "./components/home/LocalGuidesSection";
import BusinessSection from "./components/home/BusinessSection";
import FloatingPromoCard from "./components/home/FloatingPromoCard";
import { getPublishedPosts } from "./lib/blogQueries";
import {
  getPageHeroImage,
  getHomepagePromoCard,
  getStartCardImages,
} from "./lib/homepageSettings";
import { SITE_NAME, absoluteUrl } from "./lib/seo";

export const metadata: Metadata = {
  title: "CityOfWhitePlains.org – Welcome to White Plains, NY",
  description:
    "A friendly, visitor-first guide to White Plains, NY. Find simple info for visiting, eating & drinking, events, and local businesses – whether you’re here for a day, a weekend, or thinking about calling it home.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CityOfWhitePlains.org – Welcome to White Plains, NY",
    description:
      "Visitor-first info for White Plains: what to do, where to eat, and how to get around.",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/CourtStreetWP.jpg/1200px-CourtStreetWP.jpg",
        width: 1200,
        height: 630,
        alt: "Downtown White Plains, NY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CityOfWhitePlains.org",
    description:
      "Visitor-first info for White Plains: what to do, where to eat, and how to get around.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/CourtStreetWP.jpg/1200px-CourtStreetWP.jpg",
    ],
  },
};

// Always render fresh so hero image updates after admin saves.
export const revalidate = 0;

export default async function HomePage() {
  // Pull latest published posts + hero image; posts limited to 4 inside the section.
  const [heroImageUrl, promoCard, startCardImages, posts] = await Promise.all([
    getPageHeroImage("home"),
    getHomepagePromoCard(),
    getStartCardImages(),
    getPublishedPosts(),
  ]);

  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:pt-8">
        <HeroSection heroImageUrl={heroImageUrl} />
        <StartSection startCardImages={startCardImages} />
        <UpcomingEventsSection />
        <InsiderBlogSection posts={posts} />
        <LocalGuidesSection />
        <BusinessSection />
      </main>
      <FloatingPromoCard promoCard={promoCard} />
      <Footer />
    </div>
  );
}
