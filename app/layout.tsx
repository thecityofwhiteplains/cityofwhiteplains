// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  metadataBaseUrl,
} from "./lib/seo";
import { Suspense } from "react";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { getSiteVerificationSettingsServer } from "@/app/lib/siteVerificationSettingsServer";

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: "CityOfWhitePlains.org – Modern Guide to White Plains, NY",
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CityOfWhitePlains.org – Modern Guide to White Plains, NY",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "CityOfWhitePlains.org",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  description: SITE_DESCRIPTION,
  areaServed: "White Plains, NY",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const verificationPromise = getSiteVerificationSettingsServer();

  return (
    <html lang="en">
      <head>
        <Script
          id="org-ld-json"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <SiteVerificationHeadContent settingsPromise={verificationPromise} />
      </head>
      <body className="font-sans">
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

async function SiteVerificationHeadContent({
  settingsPromise,
}: {
  settingsPromise: ReturnType<typeof getSiteVerificationSettingsServer>;
}) {
  const settings = await settingsPromise;
  const metaValue = settings.metaTag?.trim();
  const scriptValue = settings.script?.trim();

  return (
    <>
      {metaValue ? (
        <meta name="google-site-verification" content={metaValue} />
      ) : null}
      {scriptValue ? (
        <Script
          id="site-verification-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: scriptValue }}
        />
      ) : null}
    </>
  );
}
