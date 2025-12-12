import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
} from "../lib/seo";

export const metadata: Metadata = {
  title: "About CityOfWhitePlains.org",
  description:
    "Independent, visitor-first guide to White Plains, NY. Learn who we are, how we work, and how we keep the site sustainable.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About CityOfWhitePlains.org",
    description:
      "Who we are, how we publish, and how this independent White Plains guide stays sustainable.",
    url: absoluteUrl("/about"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "About CityOfWhitePlains.org",
    description:
      "Independent, visitor-first guide to White Plains, NY.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
          About
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          About CityOfWhitePlains.org
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">Updated Dec 2025</p>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <p>
            CityOfWhitePlains.org is an independent, visitor-first guide built
            to make it easier to enjoy White Plains, NY. We focus on calm,
            practical information: where to eat and drink, what to do, how to
            navigate the city, and how local businesses can connect with
            neighbors and visitors.
          </p>
          <p>
            We are not the official City of White Plains government website.
            You&apos;ll always find the latest civic updates and services on the
            city&apos;s official channels.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">How we work</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Plain-language guidance with quick read times and clear next
              steps.
            </li>
            <li>
              Frequent content updates so hours, addresses, and recommendations
              stay accurate.
            </li>
            <li>
              Local-first curation—what we feature is based on usefulness to
              readers, not paid placement.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">How we stay sustainable</h2>
          <p>
            To keep the site running, we use display advertising and occasional
            affiliate links. If you click an affiliate link and make a purchase,
            we may earn a commission at no extra cost to you. Learn more in our{" "}
            <a
              href="/affiliate-disclosure"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              Affiliate Disclosure
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Editorial standards</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Recommendations are independent and based on on-the-ground usefulness.</li>
            <li>Corrections are made promptly when something changes or errors are spotted.</li>
            <li>
              Feedback from residents, visitors, and business owners helps us keep guides fresh and
              accurate.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Get in touch</h2>
          <p>
            Have a correction, suggestion, or partnership idea? Visit our{" "}
            <a
              href="/contact"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              Contact
            </a>{" "}
            page and reach out—we&apos;re always glad to hear from people who care about White
            Plains.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
