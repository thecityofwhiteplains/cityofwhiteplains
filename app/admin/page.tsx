// app/admin/page.tsx
import type { Metadata } from "next";
import Footer from "../components/layout/Footer";
import AdminDashboardClient from "../components/admin/AdminDashboardClient";
import { getAdminPosts } from "@/app/lib/blogQueries";
import {
  getAdminBusinessListings,
  getAdminBusinessSubmissions,
} from "@/app/lib/businessDirectory";
import { getEventSubmissions } from "@/app/lib/eventsAdmin";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import {
  getHomepagePromoCard,
  getStartCardImages,
  getPageHeroImages,
} from "@/app/lib/homepageSettings";
import { getEatDrinkContent } from "@/app/lib/eatDrinkData";
import { getAdminPasswordHash, isAdminAuthenticated } from "@/app/lib/adminAuth";
import { redirect } from "next/navigation";
import { robotsNoIndex } from "../lib/seo";
import { getAnalyticsSummary } from "../lib/analyticsAdmin";
import { getSiteVerificationSettingsServer } from "@/app/lib/siteVerificationSettingsServer";

// Always pull fresh data (Submissions/Listings) for the admin dashboard.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin Dashboard | CityOfWhitePlains.org",
  description:
    "Internal tools for managing the White Plains directory, visit content, and WP Insider Blog.",
  robots: robotsNoIndex,
  alternates: {
    canonical: "/admin",
  },
};

export default async function AdminPage() {
  const expectedHash = getAdminPasswordHash();
  const authed = await isAdminAuthenticated();
  if (!authed || !expectedHash) {
    redirect("/admin/login");
  }

  // 🔹 Pull ALL posts (draft + published) from Supabase
  const initialPosts = await getAdminPosts();
  const initialSubmissions = await getAdminBusinessSubmissions();
  const initialListings = await getAdminBusinessListings();
  const initialEventSubmissions = await getEventSubmissions();
  const { data: initialAds } = await supabaseAdmin
    .from("affiliate_ads")
    .select("id, title, subtitle, link, image_url, placement, partner, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });
  const homepagePromoCard = await getHomepagePromoCard();
  const startCardImages = await getStartCardImages();
  const pageHeroImages = await getPageHeroImages();
  const eatDrinkContent = await getEatDrinkContent();
  const analyticsSummary = await getAnalyticsSummary({ days: 30 });
  const siteVerificationSettings = await getSiteVerificationSettingsServer();

  return (
    <>
      <AdminDashboardClient
        initialPosts={initialPosts}
        initialSubmissions={initialSubmissions}
        initialListings={initialListings}
        initialEventSubmissions={initialEventSubmissions}
        initialAds={initialAds || []}
        initialPromoCard={homepagePromoCard}
        initialStartCardImages={startCardImages}
        initialPageHeroImages={pageHeroImages}
        initialEatDrinkSpots={eatDrinkContent.places}
        initialFeaturedEatDrinkIds={eatDrinkContent.featuredIds}
        initialAnalyticsSummary={analyticsSummary}
        initialSiteVerification={siteVerificationSettings}
      />
      <Footer />
    </>
  );
}
