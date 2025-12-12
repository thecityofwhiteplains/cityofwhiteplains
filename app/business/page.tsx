// app/business/page.tsx
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BusinessPageClient from "../components/business/BusinessPageClient";
import { getPublicBusinessListings } from "@/app/lib/businessDirectory";
import { getPageHeroImage } from "../lib/homepageSettings";
import { SITE_NAME, absoluteUrl } from "../lib/seo";

export const metadata: Metadata = {
  title: "Business Directory | CityOfWhitePlains.org",
  description:
    "Browse White Plains businesses, claim your listing, or submit a new one. Quick link hub for official online payments, applications, and permits.",
  alternates: {
    canonical: "/business",
  },
  openGraph: {
    title: "White Plains Business Directory",
    description:
      "Browse, claim, or submit White Plains business listings and find official links.",
    url: absoluteUrl("/business"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Business in White Plains",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "White Plains Business Directory",
    description:
      "Browse, claim, or submit White Plains business listings and find official links.",
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

// Always fetch the latest listings on each request
export const revalidate = 0;

export default async function BusinessPage() {
  const listings = await getPublicBusinessListings();
  const heroImageUrl = await getPageHeroImage("business");

  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <BusinessPageClient listings={listings} heroImageUrl={heroImageUrl} />
      <Footer />
    </div>
  );
}
