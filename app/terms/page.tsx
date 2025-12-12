import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
} from "../lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service | CityOfWhitePlains.org",
  description:
    "Terms of Service for CityOfWhitePlains.org. Understand acceptable use, disclaimers, and limitations. Updated Dec 2025.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | CityOfWhitePlains.org",
    description:
      "Read the Terms of Service for using CityOfWhitePlains.org.",
    url: absoluteUrl("/terms"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | CityOfWhitePlains.org",
    description:
      "Understand acceptable use, disclaimers, and limitations when using CityOfWhitePlains.org.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

export default function TermsPage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
          Terms
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">Updated Dec 2025</p>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <p>
            These Terms of Service govern your use of CityOfWhitePlains.org. By using the site, you
            agree to these terms. If you do not agree, please do not use the site.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Use of the site</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Use the site only for lawful purposes and in line with these terms.</li>
            <li>Do not attempt to disrupt, overload, or interfere with the site or its security.</li>
            <li>Content is provided for general information; it is not professional or legal advice.</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Intellectual property</h2>
          <p>
            The site, its content, and branding are owned by CityOfWhitePlains.org or its
            licensors. You may not reproduce, distribute, or create derivative works without prior
            written permission, except for personal, non-commercial use with proper attribution.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Links, ads, and affiliates</h2>
          <p>
            The site may contain links to third-party sites, ads, and affiliate links. We do not
            control third-party content or practices and are not responsible for them. Our{" "}
            <a
              href="/privacy-policy"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="/affiliate-disclosure"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              Affiliate Disclosure
            </a>{" "}
            explain how ads and affiliate links work on this site.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Disclaimers</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Content is provided &quot;as is&quot; without warranties of any kind, express or implied,
              including accuracy, reliability, or fitness for a particular purpose.
            </li>
            <li>
              We try to keep information current but cannot guarantee completeness or timeliness.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, CityOfWhitePlains.org and its contributors will
            not be liable for any indirect, incidental, consequential, or punitive damages arising
            from your use of the site. Our total liability for any claim related to the site will not
            exceed fifty U.S. dollars (USD $50).
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Changes to these terms</h2>
          <p>
            We may update these Terms of Service occasionally. The latest revision date will always
            be noted at the top of this page. Continued use of the site after changes means you
            accept the updated terms.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Governing law</h2>
          <p>
            These terms are governed by the laws of the State of New York and applicable U.S.
            federal law, without regard to conflict of law principles.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Contact</h2>
          <p>
            For questions about these terms, email{" "}
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
      </main>
      <Footer />
    </div>
  );
}
