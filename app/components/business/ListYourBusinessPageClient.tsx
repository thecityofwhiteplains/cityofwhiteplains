"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { trackEvent } from "@/app/lib/analyticsClient";

type BusinessCategoryId =
  | "eat-drink"
  | "services"
  | "legal-financial"
  | "health-wellness"
  | "shopping";

type AudienceType = "visitors" | "locals" | "business-owners";

const categoryOptions: { id: BusinessCategoryId; label: string; emoji: string }[] = [
  { id: "eat-drink", label: "Eat & Drink", emoji: "🍽️" },
  { id: "services", label: "Services", emoji: "🛠️" },
  { id: "legal-financial", label: "Legal & Financial", emoji: "⚖️" },
  { id: "health-wellness", label: "Health & Wellness", emoji: "🩺" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
];

const audienceOptions: { id: AudienceType; label: string }[] = [
  { id: "visitors", label: "Visitors" },
  { id: "locals", label: "Locals / residents" },
  { id: "business-owners", label: "Business owners" },
];

export default function ListYourBusinessPageClient() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode");
  const linkedBusiness = searchParams.get("business") ?? "";
  const [formKey, setFormKey] = useState(() => linkedBusiness || "new");
  const [prefill, setPrefill] = useState({
    businessName: "",
    category: "",
    priceLevel: "2",
    shortDescription: "",
    address: "",
    phone: "",
    websiteUrl: "",
    imageUrl: "",
    audience: [] as string[],
    tags: "",
  });
  const [loadingLinked, setLoadingLinked] = useState(false);

  const [mode, setMode] = useState<"claim" | "new">(
    urlMode === "claim" ? "claim" : "new"
  );
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isClaimMode = mode === "claim";

  // If claiming, load the existing listing to prefill fields so the user updates it.
  useEffect(() => {
    async function loadLinkedBusiness() {
      if (!linkedBusiness || !isClaimMode) return;
      setLoadingLinked(true);
      const { data, error } = await supabase
        .from("business_listings")
        .select("*")
        .eq("id", linkedBusiness)
        .maybeSingle();

      if (error) {
        console.warn("[Directory] Unable to prefill claim form:", error.message);
        setLoadingLinked(false);
        return;
      }

      if (data) {
        setPrefill({
          businessName: data.name ?? "",
          category: data.category ?? "",
          priceLevel: data.price_level?.toString() ?? "2",
          shortDescription: data.short_description ?? "",
          address: data.address_line1 ?? "",
          phone: data.phone ?? "",
          websiteUrl: data.website_url ?? "",
          imageUrl: data.image_url ?? "",
          audience: data.audience ?? [],
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        });
        setFormKey(data.id || linkedBusiness);
      }
      setLoadingLinked(false);
    }

    loadLinkedBusiness();
  }, [linkedBusiness, isClaimMode]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    // turn multi-select audience + tags into arrays
    const audience = formData.getAll("audience");
    const tagsRaw = (formData.get("tags") as string | null) ?? "";
    const tags =
      tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean) || [];

    const payload = {
      mode,
      linkedBusiness: formData.get("linkedBusiness") || linkedBusiness,
      contactName: formData.get("contactName"),
      contactEmail: formData.get("contactEmail"),
      contactRole: formData.get("contactRole"),
      businessName: formData.get("businessName"),
      category: formData.get("category"),
      priceLevel: formData.get("priceLevel"),
      shortDescription: formData.get("shortDescription"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      websiteUrl: formData.get("websiteUrl"),
      imageUrl: formData.get("imageUrl"),
      audience,
      tags,
      internalNotes: formData.get("internalNotes"),
    };

    // Basic validation
    const email = (payload.contactEmail as string) || "";
    const website = (payload.websiteUrl as string) || "";
    const category = (payload.category as string) || "";
    if (!email.includes("@")) {
      setFormError("Please enter a valid email address so we can follow up.");
      setSubmitting(false);
      return;
    }
    if (!category) {
      setFormError("Pick a category so we can place your business correctly.");
      setSubmitting(false);
      return;
    }
    if (website && !/^https?:\/\//i.test(website)) {
      setFormError("Website URLs should start with http:// or https://");
      setSubmitting(false);
      return;
    }

    console.log("List / claim business submission:", payload);

    const formEl = e.currentTarget;

    try {
      const res = await fetch("/api/business/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          audience,
          tags,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error("Error saving business submission:", json?.error);
        alert(
          json?.error ||
            "There was an issue submitting your business. Please try again or email us."
        );
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("Unexpected error saving business submission:", err);
      alert(
        "There was an unexpected issue submitting your business. Please try again or email us."
      );
      setSubmitting(false);
      return;
    }

    // Fire analytics event (best-effort)
    trackEvent("directory_form_submit", {
      mode,
      category: payload.category,
      linkedBusiness: payload.linkedBusiness,
    });
    trackEvent(mode === "claim" ? "claim_submit" : "new_submit", {
      category: payload.category,
      linkedBusiness: payload.linkedBusiness,
    });

    // Simulate short delay then reset form + show message
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(
        isClaimMode
          ? "Thank you. Your claim request has been submitted. The CityOfWhitePlains.org team will review and follow up by email."
          : "Thank you. Your business has been submitted for review. We’ll email you once it’s added to the directory."
      );
      setFormError(null);
      formEl?.reset();
    }, 500);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 md:pt-8">
      {/* Page header */}
      <section className="rounded-3xl bg-gradient-to-br from-[#EEF0FF] via-white to-[#FFF7ED] px-5 py-7 sm:px-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#4B5FC6]">
            List Your Business
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Claim an existing listing or submit a new White Plains business.
          </h1>
          <p className="text-xs text-[#4B5563]">
            This form doesn&apos;t change anything live right away. It sends your
            details to the CityOfWhitePlains.org team so we can verify ownership and
            add or update your listing in the directory.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mt-5 grid gap-3 text-xs md:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("claim")}
            className={[
              "rounded-2xl border px-4 py-3 text-left transition",
              mode === "claim"
                ? "border-[#4B5FC6] bg-[#EEF0FF]"
                : "border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
              Option 1
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              Claim an existing listing
            </p>
            <p className="mt-1 text-[11px] text-[#4B5563]">
              You clicked &quot;Claim this listing&quot; from the directory or your
              business is already visible on CityOfWhitePlains.org.
            </p>
            {linkedBusiness && (
              <p className="mt-1 inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] text-[#4B5FC6]">
                Linked listing:{" "}
                <span className="ml-1 font-semibold">{linkedBusiness}</span>
              </p>
            )}
            {isClaimMode && linkedBusiness && loadingLinked && (
              <p className="mt-1 text-[10px] text-[#6B7280]">
                Loading current listing details…
              </p>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode("new")}
            className={[
              "rounded-2xl border px-4 py-3 text-left transition",
              mode === "new"
                ? "border-[#4B5FC6] bg-[#EEF0FF]"
                : "border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4B5FC6]">
              Option 2
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              Submit a new business
            </p>
            <p className="mt-1 text-[11px] text-[#4B5563]">
              Your business is in White Plains or serves White Plains but doesn&apos;t
              appear in the directory yet.
            </p>
          </button>
        </div>
      </section>

      {/* Success message */}
      {successMessage && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-[#166534]">
          {successMessage}
        </div>
      )}
      {formError && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-[#92400e]">
          {formError}
        </div>
      )}

      {/* Form */}
      <section className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white px-5 py-6 text-xs sm:px-7 sm:py-7">
        <form onSubmit={handleSubmit} className="space-y-6" key={formKey}>
          {/* hidden meta fields */}
          <input type="hidden" name="mode" value={mode} />
          {linkedBusiness && (
            <input type="hidden" name="linkedBusiness" value={linkedBusiness} />
          )}

          {/* Who is submitting */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#111827]">
              Your details (not shown publicly)
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              This helps us verify that you&apos;re connected to the business and gives
              us a way to follow up if we have questions.
            </p>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="contactName"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Your name
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  required
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="First and last name"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="contactEmail"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Email
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="contactRole"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Your role
                </label>
                <input
                  id="contactRole"
                  name="contactRole"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Owner, manager, marketing, etc."
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="authorized"
                  name="authorized"
                  type="checkbox"
                  required
                  className="mt-[3px] h-3 w-3 rounded border-[#D1D5DB] text-[#4B5FC6] focus:ring-0"
                />
                <label
                  htmlFor="authorized"
                  className="text-[11px] text-[#4B5563]"
                >
                  I confirm I&apos;m the owner or an authorized representative of this
                  business and that the information I&apos;m submitting is accurate.
                </label>
              </div>
            </div>
          </div>

          {/* Business basics */}
          <div className="space-y-2 pt-1">
            <h2 className="text-sm font-semibold text-[#111827]">
              Business details
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              This is what we&apos;ll use to create or update your public listing in
              the White Plains directory.
            </p>

            {isClaimMode && linkedBusiness && (
              <div className="mt-2 rounded-2xl bg-[#F9FAFB] px-3 py-2 text-[11px] text-[#4B5563]">
                <p className="font-semibold text-[#111827]">
                  You’re claiming an existing directory listing.
                </p>
                <p className="mt-1">
                  Enter the business name as you want it to appear. We’ll match this claim
                  to the listing you selected and update it after approval.
                </p>
                {!loadingLinked && prefill.businessName && (
                  <p className="mt-1 text-[10px] text-[#6B7280]">
                    Current name on file: <span className="font-semibold">{prefill.businessName}</span>
                  </p>
                )}
                {loadingLinked && (
                  <p className="mt-1 text-[10px] text-[#6B7280]">
                    Pulling the existing listing to prefill your form…
                  </p>
                )}
              </div>
            )}

            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="businessName"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Business name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  required
                  defaultValue={prefill.businessName}
                  className="w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Example: Calm Corner Coffee"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="category"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    defaultValue={prefill.category || ""}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categoryOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="priceLevel"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Price range
                  </label>
                  <select
                    id="priceLevel"
                    name="priceLevel"
                    defaultValue={prefill.priceLevel || "2"}
                    className="w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  >
                    <option value="1">$ · Budget</option>
                    <option value="2">$$ · Moderate</option>
                    <option value="3">$$$ · Higher-end</option>
                    <option value="4">$$$$ · Premium</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="shortDescription"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Short description
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  rows={3}
                  required
                  defaultValue={prefill.shortDescription}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Example: Quiet-leaning café good for pre- or post-court resets, solo work, or low-key meetups."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="address"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Street address
                  </label>
                <input
                  id="address"
                  name="address"
                  required
                  defaultValue={prefill.address}
                  className="w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="123 Example St, White Plains, NY 10601"
                />
              </div>

                <div className="space-y-1">
                  <label
                    htmlFor="phone"
                    className="block text_[11px] font-medium text-[#374151]"
                  >
                    Public phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    defaultValue={prefill.phone}
                    className="w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                    placeholder="(914) 555-0123"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="websiteUrl"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Website (if any)
                </label>
                <input
                  id="websiteUrl"
                  name="websiteUrl"
                  defaultValue={prefill.websiteUrl}
                  className="w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="imageUrl"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Feature image URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  defaultValue={prefill.imageUrl}
                  className="w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://your-site.com/image.jpg"
                  inputMode="url"
                  pattern="https?://.+"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  Paste a direct image link (JPG/PNG/WebP). We&apos;ll use this to show
                  your listing in the directory.
                </p>
              </div>
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-2 pt-1">
            <h2 className="text-sm font-semibold text-[#111827]">
              Who is this business especially good for?
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              This helps us show your listing in the right guides—for court days,
              family visits, locals, etc.
            </p>

            <div className="mt-2 flex flex-wrap gap-3">
              {audienceOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] text-[#4B5563] hover:bg-[#F3F4F6]"
                >
                  <input
                    type="checkbox"
                    name="audience"
                    value={opt.id}
                    defaultChecked={prefill.audience.includes(opt.id)}
                    className="h-3 w-3 rounded border-[#D1D5DB] text-[#4B5FC6] focus:ring-0"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 space-y-1">
              <label
                htmlFor="tags"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Tags (optional)
              </label>
              <input
                id="tags"
                name="tags"
                defaultValue={prefill.tags}
                className="w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="court day friendly, walkable, kid-friendly"
              />
              <p className="text-[10px] text-[#9CA3AF]">
                Separate tags with commas. We may tweak wording to keep things
                consistent.
              </p>
            </div>
          </div>

          {/* Extra notes */}
          <div className="space-y-2 pt-1">
            <h2 className="text-sm font-semibold text-[#111827]">
              Anything else we should know?
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              This part won&apos;t be shown directly on the site. It&apos;s just for
              the CityOfWhitePlains.org team when we&apos;re reviewing your submission.
            </p>

            <textarea
              id="internalNotes"
              name="internalNotes"
              rows={3}
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg_WHITE px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
              placeholder="Optional: anything about ownership, recent changes, opening hours, or how you prefer to be described."
            />
          </div>

          {/* Submit */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
            <p className="text-[10px] text-[#9CA3AF]">
              Submitting this form does not create an official city record—it only
              updates the independent directory on CityOfWhitePlains.org.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-5 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Submitting..."
                : isClaimMode
                ? "Submit claim request"
                : "Submit business for review"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
