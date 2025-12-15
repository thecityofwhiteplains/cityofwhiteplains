import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  absoluteUrl,
} from "../lib/seo";
import ContactForm from "../components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | CityOfWhitePlains.org",
  description:
    "Reach the CityOfWhitePlains.org team for corrections, tips, partnerships, events, or business updates.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact CityOfWhitePlains.org",
    description:
      "Contact us with corrections, tips, partnerships, events, or business updates.",
    url: absoluteUrl("/contact"),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | CityOfWhitePlains.org",
    description:
      "Reach the team with tips, corrections, partnerships, or listings.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

export default function ContactPage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1C1F2A]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
          Contact
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Contact CityOfWhitePlains.org
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">Updated Dec 2025</p>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <p>
            We&apos;re glad to hear from residents, visitors, and local businesses. Use the details
            below and we&apos;ll respond as quickly as we can.
          </p>
        </section>

        <section className="mt-8 grid gap-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#E5E7EB] sm:p-7 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#111827]">Send us a note</h2>
            <p className="text-sm text-[#6B7280]">
              Questions, corrections, partnerships, events, or business updates—drop a short message
              and we&apos;ll reply by email.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-[#4B5563]">
              <li>We typically respond within 1–2 business days.</li>
              <li>Your email is used only for this reply.</li>
              <li>For business listings, include your business name and website.</li>
            </ul>
          </div>
          <ContactForm />
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Email</h2>
          <p>
            For general questions, tips, corrections, or partnership ideas, email{" "}
            <a
              href="mailto:events@cityofwhiteplains.com"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              events@cityofwhiteplains.com
            </a>
            .
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Business listings</h2>
          <p>
            Need to add or update a White Plains business? Start on our{" "}
            <a
              href="/list-your-business"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              List Your Business
            </a>{" "}
            page so we get the right details and can verify quickly.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Event submissions</h2>
          <p>
            Sharing a local event? Email{" "}
            <a
              href="mailto:events@cityofwhiteplains.com"
              className="font-semibold text-[#4B5FC6] underline-offset-2 hover:underline"
            >
              events@cityofwhiteplains.com
            </a>{" "}
            with the event name, date, time, location, and a short description.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-relaxed text-[#374151]">
          <h2 className="text-xl font-bold text-[#111827]">Corrections</h2>
          <p>
            Spot an error or an outdated detail? Email us with the link and corrected info. We
            appreciate the assist in keeping this guide accurate.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
