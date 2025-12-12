const ENV_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const SITE_URL =
  (ENV_SITE_URL && ENV_SITE_URL.length > 0
    ? ENV_SITE_URL
    : "https://cityofwhiteplains.org") || "https://cityofwhiteplains.org";

export const SITE_NAME = "CityOfWhitePlains.org";

export const SITE_DESCRIPTION =
  "Independent local guide for White Plains, NY. Find parking, restaurants, events, and practical guides for residents, visitors, and businesses.";

export const metadataBaseUrl = new URL(SITE_URL);

export const DEFAULT_SOCIAL_IMAGE = {
  url:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/CourtStreetWP.jpg/1200px-CourtStreetWP.jpg",
  width: 1200,
  height: 630,
  alt: "Downtown White Plains skyline at dusk",
};

export const robotsNoIndex = {
  index: false,
  follow: false,
};

export function absoluteUrl(path = "/"): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
