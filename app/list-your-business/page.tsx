// app/list-your-business/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ListYourBusinessPageClient from "../components/business/ListYourBusinessPageClient";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
} from "../lib/seo";

export const metadata: Metadata = {
  title: "List Your Business | CityOfWhitePlains.org",
  description:
    "Claim an existing listing or submit a new White Plains business to the directory on CityOfWhitePlains.org.",
  alternates: {
    canonical: "/list-your-business",
  },
  openGraph: {
    title: "List Your Business",
    description:
      "Claim an existing listing or submit a new White Plains business to the directory on CityOfWhitePlains.org.",
    url: absoluteUrl("/list-your-business"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Business",
    description:
      "Add or claim your White Plains business listing on CityOfWhitePlains.org.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

export default function ListYourBusinessPage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <Suspense fallback={null}>
        <ListYourBusinessPageClient />
      </Suspense>
      <Footer />
    </div>
  );
}
