import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CommunityPageClient from "../components/community/CommunityPageClient";
import { DEFAULT_SOCIAL_IMAGE, SITE_NAME, absoluteUrl } from "../lib/seo";
import { DEFAULT_HOMEPAGE_HERO_IMAGE } from "../lib/constants";
import { getPageHeroImage } from "../lib/homepageSettings";
import { getAdsByPlacement } from "../lib/ads";

export const metadata: Metadata = {
  title: "Community Resources | CityOfWhitePlains.org",
  description:
    "A resident-first hub for everyday needs in White Plains: library, parking, housing resources, sanitation, schools, and more—fast links with plain-language guidance.",
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "Community Resources",
    description:
      "Resident-first hub: library, parking, housing resources, sanitation, schools, and more.",
    url: absoluteUrl("/community"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Resources",
    description:
      "Resident-first hub: library, parking, housing resources, sanitation, schools, and more.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

export default async function CommunityPage() {
  const heroImageUrl =
    (await getPageHeroImage("community")) || DEFAULT_HOMEPAGE_HERO_IMAGE;
  const ads = await getAdsByPlacement(["community_banner"]);
  const bannerAd = ads["community_banner"]?.[0];

  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:pt-8">
        <CommunityPageClient heroImageUrl={heroImageUrl} bannerAd={bannerAd} />
      </main>
      <Footer />
    </div>
  );
}
