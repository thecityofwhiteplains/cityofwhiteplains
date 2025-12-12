import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
} from "../lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy | CityOfWhitePlains.org",
  description:
    "Privacy practices for CityOfWhitePlains.org, including data we collect, how we use it, cookies, Google AdSense, and affiliate tracking. Updated Dec 2025.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | CityOfWhitePlains.org",
    description:
      "Learn how CityOfWhitePlains.org handles data, cookies, Google AdSense, and affiliate tracking.",
    url: absoluteUrl("/privacy-policy"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | CityOfWhitePlains.org",
    description:
      "Our approach to data, cookies, Google AdSense, and affiliate tracking.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
          Privacy
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">Updated Dec 2025</p>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <p>
            This Privacy Policy explains how CityOfWhitePlains.org collects, uses, and safeguards
            information when you use this site. By visiting the site, you agree to the practices
            described here.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Who we are</h2>
          <p>
            CityOfWhitePlains.org is an independent guide to White Plains, NY. For privacy-related
            questions or requests, email{" "}
            <a
              href="mailto:events@cityofwhiteplains.com"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              events@cityofwhiteplains.com
            </a>{" "}
            or visit our{" "}
            <a
              href="/contact"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              Contact
            </a>{" "}
            page.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">What we collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold text-[#111827]">Information you provide:</span> names,
              email addresses, and messages sent through forms or email (e.g., newsletters, business
              submissions, event updates).
            </li>
            <li>
              <span className="font-semibold text-[#111827]">Automatic data:</span> IP address,
              device and browser information, pages viewed, referring URLs, timestamps, and general
              location inferred from IP.
            </li>
            <li>
              <span className="font-semibold text-[#111827]">Cookies and trackers:</span> essential
              cookies for site functionality and non-essential cookies/pixels for analytics and
              advertising (including personalized ads where consent applies).
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">How we use data</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Operate and improve the site, fix issues, and measure performance.</li>
            <li>Respond to inquiries, submissions, and requests you send us.</li>
            <li>Send newsletters or updates you opt into (you can opt out anytime).</li>
            <li>Prevent abuse, fraud, or security issues.</li>
            <li>Serve advertising, including personalized ads where allowed.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Google AdSense & cookies</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Google is a third-party vendor that uses cookies (including the DART cookie) to serve
              ads based on your prior visits to this and other sites.
            </li>
            <li>
              We use cookies and similar technologies (e.g., web beacons) to support personalized
              advertising where consent is given.
            </li>
            <li>
              You can opt out of personalized ads through{" "}
              <a
                href="https://adssettings.google.com/authenticated"
                className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
              >
                Google Ads Settings
              </a>{" "}
              or via the{" "}
              <a
                href="https://thenai.org/opt-out/"
                className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
              >
                Network Advertising Initiative opt-out
              </a>
              .
            </li>
            <li>
              If other ad networks are used, they may also set cookies and tracking technologies;
              their practices are covered in their own policies.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Affiliate links</h2>
          <p>
            Some articles include affiliate links. If you click an affiliate link and make a
            purchase, we may earn a commission at no extra cost to you. Affiliate partners may set
            their own cookies to track purchases; their data practices are governed by their privacy
            policies. See our{" "}
            <a
              href="/affiliate-disclosure"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              Affiliate Disclosure
            </a>{" "}
            for details.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Legal bases (EEA/UK)</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Consent for non-essential cookies and personalized ads.</li>
            <li>Contract to deliver requested content or services (e.g., newsletters).</li>
            <li>Legitimate interests for security, site performance, and limited analytics with safeguards.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Your rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, delete, or
            restrict your personal data; object to certain processing; withdraw consent for
            non-essential cookies; or request data portability. Contact us to exercise these rights.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">California (CCPA/CPRA)</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You may request to know, correct, or delete personal information we hold about you.
            </li>
            <li>
              You can opt out of the “sale” or “sharing” of personal information (including
              cross-context behavioral advertising). Use our opt-out/Do Not Sell or Share link where
              provided or contact us to submit the request.
            </li>
            <li>
              Where supported, we honor Global Privacy Control (GPC) signals as an opt-out request.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Data retention & security</h2>
          <p>
            We retain data only as long as needed for the purposes described or as required by law.
            We use reasonable technical and organizational safeguards, but no system is 100% secure.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Children&apos;s privacy</h2>
          <p>
            This site is not directed to children under 13, and we do not knowingly collect personal
            information from children under 13. If you believe a child has provided personal
            information, contact us to delete it.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">International transfers</h2>
          <p>
            If data is transferred internationally, we use appropriate safeguards where required by
            law (for example, standard contractual clauses).
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Updates</h2>
          <p>
            We may update this Privacy Policy from time to time. The latest revision date will
            always be noted at the top of this page.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
