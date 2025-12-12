import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { sendBusinessSubmissionReceipt } from "@/app/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  mode?: "claim" | "new";
  linkedBusiness?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactRole?: string | null;
  businessName?: string | null;
  category?: string | null;
  priceLevel?: string | number | null;
  shortDescription?: string | null;
  address?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  imageUrl?: string | null;
  audience?: string[] | null;
  tags?: string[] | null;
  internalNotes?: string | null; // accepted but currently ignored if column absent
};

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((t) => `${t}`.trim()).filter(Boolean);
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(request: Request) {
  let body: Payload = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = (body.contactEmail || "").trim();
  const businessName = (body.businessName || "").trim();
  const category = (body.category || "").trim();
  const mode = body.mode === "claim" ? "claim" : "new";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid contact email is required." }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }

  const submission = {
    mode,
    business_name: businessName || null,
    category: category || null,
    price_level: body.priceLevel ? Number(body.priceLevel) : null,
    short_description: body.shortDescription || null,
    address_line1: body.address || null,
    phone: body.phone || null,
    website_url: body.websiteUrl || null,
    image_url: body.imageUrl || null,
    audience: Array.isArray(body.audience) ? body.audience : [],
    tags: normalizeTags(body.tags),
    contact_name: body.contactName || null,
    contact_email: email,
    contact_role: body.contactRole || null,
    linked_business: body.linkedBusiness || null,
    status: "pending",
    source: "public_form",
    submitted_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabaseAdmin
      .from("business_submissions")
      .insert([submission]);

    if (error) {
      console.error("[Directory] Error saving submission:", error.message);
      return NextResponse.json(
        {
          error:
            error.message ||
            "There was an issue submitting your business. Please try again.",
        },
        { status: 500 }
      );
    }

    // Fire-and-forget receipt email
    sendBusinessSubmissionReceipt(email, businessName).catch((err) =>
      console.warn("[Directory] Unable to send submission receipt:", err)
    );

    return NextResponse.json(
      {
        status: "pending",
        message: "Thanks! We received your submission and will review it.",
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("[Directory] Unexpected error saving submission:", err);
    return NextResponse.json(
      { error: "There was an issue submitting your business. Please try again." },
      { status: 500 }
    );
  }
}
