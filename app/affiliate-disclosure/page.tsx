import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
} from "../lib/seo";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | CityOfWhitePlains.org",
  description:
    "Clear, conspicuous affiliate disclosure for CityOfWhitePlains.org. Updated Dec 2025.",
  alternates: {
    canonical: "/affiliate-disclosure",
  },
  openGraph: {
    title: "Affiliate Disclosure | CityOfWhitePlains.org",
    description:
      "How affiliate links work on CityOfWhitePlains.org and how we earn commissions.",
    url: absoluteUrl("/affiliate-disclosure"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Affiliate Disclosure | CityOfWhitePlains.org",
    description:
      "How affiliate links work on CityOfWhitePlains.org.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
          Disclosure
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Affiliate Disclosure
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">Updated Dec 2025</p>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <p>
            Some links on CityOfWhitePlains.org are affiliate links. If you click a link and make a
            purchase, we may earn a commission or referral fee. This comes at no extra cost to you.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">How we choose recommendations</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Recommendations are based on usefulness to readers and local relevance.</li>
            <li>Affiliate status does not change our opinions or coverage.</li>
            <li>We note affiliate links near the top of posts that include them.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">What affiliate links mean for you</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>You pay the same price—commissions come from the merchant, not you.</li>
            <li>
              Affiliate partners may use cookies to attribute sales; their privacy practices are
              covered by their own policies.
            </li>
            <li>You can decide not to use affiliate links if you prefer.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Questions</h2>
          <p>
            If you have questions about how affiliate links work on this site, please{" "}
            <a
              href="/contact"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              contact us
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
