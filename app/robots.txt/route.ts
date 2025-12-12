import { NextResponse } from "next/server";
import { SITE_URL } from "../lib/seo";

export function GET() {
  const body = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/login

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
