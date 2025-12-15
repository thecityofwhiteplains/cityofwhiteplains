"use client";

import { useState, FormEvent, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { BlogPostAdminSummary } from "@/app/types/blog";
import type {
  AdminBusinessListing,
  BusinessSubmission,
  BusinessSubmissionStatus,
} from "@/app/lib/businessDirectory";
import {
  approveBusinessSubmission,
  rejectBusinessSubmission,
} from "@/app/lib/businessDirectory";
import type { EventSubmission, EventSubmissionStatus } from "@/app/lib/eventsAdmin";
import type { AffiliateAd } from "@/app/lib/ads";
import {
  DEFAULT_HOMEPAGE_HERO_IMAGE,
  DEFAULT_PROMO_CARD,
  DEFAULT_START_CARD_IMAGES,
} from "@/app/lib/constants";
import {
  saveHomepagePromoCard,
  saveStartCardImages,
  savePageHeroImage,
  type PromoCardSettings,
  type StartCardImages,
  type PageHeroKey,
  type PageHeroImages,
} from "@/app/lib/homepageSettings";
import {
  saveSiteVerificationSettings,
  type SiteVerificationSettings,
} from "@/app/lib/siteVerificationSettings";
import {
  DEFAULT_EAT_DRINK_TAGS,
  type EatPlace,
} from "@/app/types/eatDrink";
import { saveEatDrinkSettings } from "@/app/lib/eatDrinkSettings";
import type { AnalyticsSummary } from "@/app/types/analytics";
import AnalyticsMap from "./AnalyticsMap";

function slugifyName(name?: string | null): string {
  if (!name) return `listing-${Date.now()}`;
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Props = {
  initialPosts: BlogPostAdminSummary[];
  initialSubmissions: BusinessSubmission[];
  initialListings: AdminBusinessListing[];
  initialEventSubmissions: EventSubmission[];
  initialAds: AffiliateAd[];
  initialPromoCard?: PromoCardSettings | null;
  initialStartCardImages?: StartCardImages | null;
  initialPageHeroImages?: PageHeroImages | null;
  initialEatDrinkSpots?: EatPlace[] | null;
  initialFeaturedEatDrinkIds?: string[] | null;
  initialAnalyticsSummary?: AnalyticsSummary | null;
  initialSiteVerification?: SiteVerificationSettings | null;
};

export default function AdminDashboardClient({
  initialPosts,
  initialSubmissions,
  initialListings,
  initialEventSubmissions,
  initialAds,
  initialPromoCard,
  initialStartCardImages,
  initialPageHeroImages,
  initialEatDrinkSpots,
  initialFeaturedEatDrinkIds,
  initialAnalyticsSummary,
  initialSiteVerification,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "business"
    | "events"
    | "ads"
    | "blog"
    | "homepage"
    | "eat-drink"
    | "analytics"
    | "email"
  >("overview");

  // Local state so new posts created in admin appear immediately
  const [posts, setPosts] = useState<BlogPostAdminSummary[]>(initialPosts);
  const upsertPostInState = (savedPost: BlogPostAdminSummary) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.slug === savedPost.slug);
      if (idx === -1) {
        return [savedPost, ...prev];
      }
      const copy = [...prev];
      copy[idx] = savedPost;
      return copy;
    });
  };

  // Local state for admin-created business listings
  const [adminListings, setAdminListings] =
    useState<AdminBusinessListing[]>(initialListings || []);
  const [submissions, setSubmissions] = useState<BusinessSubmission[]>(
    initialSubmissions || []
  );
  const [eventSubmissions, setEventSubmissions] = useState<EventSubmission[]>(
    (initialEventSubmissions || []).filter((s) => !!s.id && s.id !== "undefined")
  );
  const [ads, setAds] = useState<AffiliateAd[]>(
    (initialAds || []).map((ad: any) => ({
      id: ad.id,
      title: ad.title,
      subtitle: ad.subtitle,
      buttonText: ad.button_text ?? ad.buttonText,
      link: ad.link,
      placement: ad.placement,
      partner: ad.partner,
      imageUrl: ad.image_url ?? ad.imageUrl ?? "",
      is_active: ad.is_active ?? true,
    }))
  );

  // Homepage settings state (local to admin client)
  const [pageHeroInputs, setPageHeroInputs] = useState<PageHeroImages>({
    home: initialPageHeroImages?.home || "",
    visit: initialPageHeroImages?.visit || "",
    events: initialPageHeroImages?.events || "",
    eat: initialPageHeroImages?.eat || "",
    business: initialPageHeroImages?.business || "",
  });
  const [promoImage, setPromoImage] = useState(
    initialPromoCard?.imageUrl || DEFAULT_PROMO_CARD.imageUrl
  );
  const [promoTitle, setPromoTitle] = useState(
    initialPromoCard?.title || DEFAULT_PROMO_CARD.title
  );
  const [promoButtonText, setPromoButtonText] = useState(
    initialPromoCard?.buttonText || DEFAULT_PROMO_CARD.buttonText
  );
  const [promoButtonUrl, setPromoButtonUrl] = useState(
    initialPromoCard?.buttonUrl || DEFAULT_PROMO_CARD.buttonUrl
  );
  const [startVisitors, setStartVisitors] = useState(
    initialStartCardImages?.visitors || DEFAULT_START_CARD_IMAGES.visitors
  );
  const [startCourt, setStartCourt] = useState(
    initialStartCardImages?.court || DEFAULT_START_CARD_IMAGES.court
  );
  const [startEat, setStartEat] = useState(
    initialStartCardImages?.eat || DEFAULT_START_CARD_IMAGES.eat
  );
  const [startBusiness, setStartBusiness] = useState(
    initialStartCardImages?.business || DEFAULT_START_CARD_IMAGES.business
  );
  const [siteVerificationMeta, setSiteVerificationMeta] = useState(
    initialSiteVerification?.metaTag || ""
  );
  const [siteVerificationScript, setSiteVerificationScript] = useState(
    initialSiteVerification?.script || ""
  );
  const [eatDrinkSpots, setEatDrinkSpots] = useState<EatPlace[]>(
    initialEatDrinkSpots && initialEatDrinkSpots.length > 0
      ? initialEatDrinkSpots
      : []
  );
  const [featuredEatDrinkIds, setFeaturedEatDrinkIds] = useState<string[]>(
    initialFeaturedEatDrinkIds && initialFeaturedEatDrinkIds.length > 0
      ? initialFeaturedEatDrinkIds
      : (initialEatDrinkSpots || []).slice(0, 3).map((s) => s.id)
  );
  const [savingEatDrink, setSavingEatDrink] = useState(false);
  const [eatDrinkStatus, setEatDrinkStatus] = useState<
    "idle" | "saved" | "error"
  >("idle");
  const [pageHeroStatus, setPageHeroStatus] = useState<
    Partial<Record<PageHeroKey, "idle" | "saved" | "error">>
  >({});
  const [pageHeroSaving, setPageHeroSaving] = useState<
    Partial<Record<PageHeroKey, boolean>>
  >({});
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoStatus, setPromoStatus] = useState<"idle" | "saved" | "error">(
    "idle"
  );
  const [savingStart, setSavingStart] = useState(false);
  const [startStatus, setStartStatus] = useState<"idle" | "saved" | "error">(
    "idle"
  );
  const [savingVerification, setSavingVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "saved" | "error"
  >("idle");
  const [submissionUpdatingId, setSubmissionUpdatingId] = useState<string | null>(
    null
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(
    initialAnalyticsSummary || null
  );
  const [analyticsRange, setAnalyticsRange] = useState<
    { type: "preset"; days: number } | { type: "custom"; start?: string; end?: string }
  >({ type: "preset", days: 30 });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [eventUpdatingId, setEventUpdatingId] = useState<string | null>(null);
  const [adSaving, setAdSaving] = useState(false);
  const [adStatus, setAdStatus] = useState<"idle" | "saved" | "error">("idle");
  const [adsError, setAdsError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sent" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  async function refreshAds() {
    setAdsError(null);
    try {
      const adsRes = await fetch("/api/admin/ads", { credentials: "include" });
      if (adsRes.ok) {
        const json = await adsRes.json();
        if (json.error) {
          setAdsError(json.error);
          return;
        }
        const normalized =
          (json.ads || []).map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            subtitle: ad.subtitle,
            buttonText: ad.button_text ?? ad.buttonText,
            link: ad.link,
            placement: ad.placement,
            partner: ad.partner,
            imageUrl: ad.image_url ?? ad.imageUrl ?? "",
            is_active: ad.is_active ?? true,
          })) || [];
        setAds(normalized);
      } else {
        const body = await adsRes.text();
        console.warn("[Admin] Unable to refresh ads: HTTP", adsRes.status, body);
        setAdsError(`Unable to refresh ads (HTTP ${adsRes.status})`);
      }
    } catch (err) {
      console.warn("[Admin] Unable to refresh ads:", err);
      setAdsError("Unable to refresh ads. Check server logs.");
    }
  }

  async function handleSaveAd(ad: Partial<AffiliateAd>) {
    setAdSaving(true);
    setAdStatus("idle");

    const payload = {
      title: ad.title,
      subtitle: ad.subtitle,
      buttonText: ad.buttonText,
      link: ad.link,
      placement: ad.placement,
      imageUrl: (ad as any).imageUrl || (ad as any).image_url,
      partner: ad.partner,
      isActive: ad.is_active ?? true,
    } as any;

    try {
      const res = ad.id
        ? await fetch(`/api/admin/ads/${ad.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/ads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        console.warn("[Admin] Unable to save ad:", await res.text());
        setAdStatus("error");
        setAdSaving(false);
        return;
      }

      const json = await res.json();
      const saved = json.ad || ad;
      const normalized = {
        id: saved.id,
        title: saved.title,
        subtitle: saved.subtitle,
        buttonText: saved.button_text ?? saved.buttonText,
        link: saved.link,
        placement: saved.placement,
        partner: saved.partner,
        imageUrl: saved.image_url ?? saved.imageUrl ?? "",
        is_active: saved.is_active ?? true,
      };
      if (!normalized.id) {
        await refreshAds();
      } else {
        setAds((prev) => {
          const existing = prev.find((a) => a.id === normalized.id);
          if (existing) {
            return prev.map((a) => (a.id === normalized.id ? { ...existing, ...normalized } : a));
          }
          return [normalized as AffiliateAd, ...prev];
        });
      }
      setAdStatus("saved");
    } catch (err) {
      console.warn("[Admin] Unexpected error saving ad:", err);
      setAdStatus("error");
    } finally {
      setAdSaving(false);
    }
  }

  async function handleSendEmail(payload: {
    recipients: string;
    subject: string;
    body: string;
    isHtml: boolean;
  }) {
    setEmailSending(true);
    setEmailStatus("idle");
    setEmailError(null);

    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: payload.recipients,
          subject: payload.subject,
          body: payload.body,
          isHtml: payload.isHtml,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setEmailStatus("error");
        setEmailError(json?.error || "Unable to send email.");
        return;
      }

      setEmailStatus("sent");
    } catch (err) {
      console.warn("[Admin] Unable to send email:", err);
      setEmailStatus("error");
      setEmailError("Unexpected error sending email. Check server logs.");
    } finally {
      setEmailSending(false);
    }
  }

  const fetchAnalyticsSummary = useCallback(
    async (
      range:
        | { type: "preset"; days: number }
        | { type: "custom"; start?: string; end?: string }
    ) => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      const params = new URLSearchParams();
      if (range.type === "custom") {
        if (range.start) params.set("start", range.start);
        if (range.end) params.set("end", range.end);
      } else {
        params.set("days", String(range.days));
      }

      try {
        const res = await fetch(`/api/admin/analytics?${params.toString()}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Unable to load analytics");
        }
        const data = await res.json();
        setAnalyticsSummary(data);
      } catch (err) {
        console.warn("[analytics] fetch failed", err);
        setAnalyticsError("Unable to load analytics. Try again.");
      } finally {
        setAnalyticsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!initialAnalyticsSummary) {
      fetchAnalyticsSummary(analyticsRange);
    }
  }, [analyticsRange, fetchAnalyticsSummary, initialAnalyticsSummary]);

  const handleAnalyticsRangeChange = (
    range:
      | { type: "preset"; days: number }
      | { type: "custom"; start?: string; end?: string }
  ) => {
    setAnalyticsRange(range);
    fetchAnalyticsSummary(range);
  };

  // Client-side refresh to pick up latest submissions/listings after page load.
  useEffect(() => {
    async function refresh() {
      try {
        const { data: subData, error: subError } = await supabase
          .from("business_submissions")
          .select(
            `
            id,
            business_name,
            mode,
            category,
            submitted_at,
            status,
            contact_name,
            contact_email,
            notes
          `
          )
          .order("submitted_at", { ascending: false })
          .limit(50);

        if (!subError && subData) {
          setSubmissions(
            subData.map((row: any) => ({
              id: row.id,
              businessName: row.business_name,
              mode: row.mode,
              category: row.category ?? "General",
              submittedAt: row.submitted_at,
              status: row.status,
              contactName: row.contact_name ?? "",
              contactEmail: row.contact_email ?? "",
              notes: row.notes ?? undefined,
            }))
          );
        } else if (subError) {
          console.warn("[Admin] Unable to refresh submissions:", subError.message);
        }

        try {
          const eventRes = await fetch("/api/admin/events-submissions", {
            credentials: "include",
          });
          if (eventRes.ok) {
            const json = await eventRes.json();
            const eventData = json.submissions || [];
            setEventSubmissions(
              eventData
                .map((row: any) => ({
                  id: row.id,
                  title: row.title,
                  startAt: row.startAt,
                  endAt: row.endAt,
                  location: row.location,
                  audience: row.audience,
                  cost: row.cost,
                  description: row.description,
                  accessibility: row.accessibility,
                  url: row.url,
                  contactEmail: row.contactEmail,
                  contactName: row.contactName,
                  attachments: row.attachments,
                  status: row.status,
                  submittedAt: row.submittedAt,
                }))
                .filter((s: EventSubmission) => !!s.id && s.id !== "undefined")
            );
          } else {
            console.warn("[Admin] Unable to refresh event submissions: HTTP", eventRes.status);
          }
        } catch (err) {
          console.warn("[Admin] Unable to refresh event submissions:", err);
        }

        try {
          await refreshAds();
        } catch (err) {
          console.warn("[Admin] Unable to refresh ads:", err);
        }

        const { data: listData, error: listError } = await supabase
          .from("business_listings")
          .select(
            `
            id,
            slug,
            name,
            category,
            price_level,
            address_line1,
            phone,
            website_url,
            audience,
            tags,
            image_url,
            is_published
          `
          )
          .order("created_at", { ascending: false })
          .limit(100);

        if (!listError && listData) {
          setAdminListings(
            listData.map((row: any) => ({
              id: row.id,
              slug: row.slug,
              businessName: row.name,
              category: row.category ?? "General",
              priceLevel: row.price_level ?? 2,
              address: row.address_line1 ?? "",
              phone: row.phone ?? undefined,
              websiteUrl: row.website_url ?? undefined,
              audience: row.audience ?? [],
              tags: row.tags ?? [],
              imageUrl: row.image_url ?? undefined,
              isPublished: row.is_published ?? true,
            }))
          );
        } else if (listError) {
          console.warn("[Admin] Unable to refresh listings:", listError.message);
        }
      } catch (err) {
        console.warn("[Admin] Unexpected error refreshing data:", err);
      }
    }

    refresh();
  }, []);

  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(
    (s) => s.status === "pending"
  ).length;
  const approvedSubmissions = submissions.filter(
    (s) => s.status === "approved"
  ).length;
  const pendingEventSubmissions = eventSubmissions.filter(
    (s) => s.status === "pending"
  ).length;

  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;

  async function handleUpdateSubmissionStatus(
    id: string,
    status: BusinessSubmissionStatus
  ) {
    setSubmissionUpdatingId(id);
    const submission = submissions.find((s) => s.id === id);
    const slug = submission ? slugifyName(submission.businessName) : null;
    if (status === "approved") {
      const result = await approveBusinessSubmission(id);
      if (result?.submission) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: result.submission.status } : s
          )
        );
      }
      const listing = result?.listing;
      if (listing) {
        setAdminListings((prev) => {
          const exists = prev.find((l) => l.slug === listing.slug);
          if (exists) {
            return prev.map((l) => (l.slug === listing.slug ? listing : l));
          }
          return [listing, ...prev];
        });
      }
    } else if (status === "rejected") {
      const updated = await rejectBusinessSubmission(id);
      if (updated) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: updated.status } : s
          )
        );
        if (slug) {
          setAdminListings((prev) => prev.filter((l) => l.slug !== slug));
        }
      }
    }
    setSubmissionUpdatingId(null);
  }

  async function handleUpdateEventStatus(
    id: string,
    status: EventSubmissionStatus,
    sendEmail = true
  ) {
    if (!id || id === "undefined") {
      console.error("[Admin] Missing submission id for status update", { id });
      return;
    }
    console.log("[Admin] Updating event submission", { id, status });
    setEventUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/events-submissions/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status, sendEmail }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("[Admin] Unable to update event submission status", res.status, text);
        return;
      }
      const data = await res.json();
      const newStatus = data.status as EventSubmissionStatus;
      setEventSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: newStatus, lastReviewedAt: new Date().toISOString() }
            : s
        )
      );
    } catch (err) {
      console.error("[Admin] Unexpected error updating event submission:", err);
    } finally {
      setEventUpdatingId(null);
    }
  }

  async function handleSavePageHero(page: PageHeroKey) {
    setPageHeroSaving((prev) => ({ ...prev, [page]: true }));
    setPageHeroStatus((prev) => ({ ...prev, [page]: "idle" }));
    try {
      const saved = await savePageHeroImage(page, pageHeroInputs[page] || "");
      setPageHeroInputs((prev) => ({ ...prev, [page]: saved || "" }));
      setPageHeroStatus((prev) => ({ ...prev, [page]: "saved" }));
    } catch (err) {
      console.error("[Admin] Unable to save page hero image:", err);
      setPageHeroStatus((prev) => ({ ...prev, [page]: "error" }));
    } finally {
      setPageHeroSaving((prev) => ({ ...prev, [page]: false }));
    }
  }

  async function handleSavePromoCard() {
    setSavingPromo(true);
    setPromoStatus("idle");
    try {
      const saved = await saveHomepagePromoCard({
        imageUrl: promoImage,
        title: promoTitle,
        buttonText: promoButtonText,
        buttonUrl: promoButtonUrl,
      });
      if (saved) {
        setPromoImage(saved.imageUrl || "");
        setPromoTitle(saved.title || "");
        setPromoButtonText(saved.buttonText || "");
        setPromoButtonUrl(saved.buttonUrl || "");
      }
      setPromoStatus("saved");
    } catch (err) {
      console.error("[Admin] Unable to save homepage promo card:", err);
      setPromoStatus("error");
    } finally {
      setSavingPromo(false);
    }
  }

  async function handleSaveStartCards() {
    setSavingStart(true);
    setStartStatus("idle");
    try {
      const saved = await saveStartCardImages({
        visitors: startVisitors,
        court: startCourt,
        eat: startEat,
        business: startBusiness,
      });
      if (saved) {
        setStartVisitors(saved.visitors || "");
        setStartCourt(saved.court || "");
        setStartEat(saved.eat || "");
        setStartBusiness(saved.business || "");
      }
      setStartStatus("saved");
    } catch (err) {
      console.error("[Admin] Unable to save start card images:", err);
      setStartStatus("error");
    } finally {
      setSavingStart(false);
    }
  }

  async function handleSaveSiteVerification() {
    setSavingVerification(true);
    setVerificationStatus("idle");
    try {
      const saved = await saveSiteVerificationSettings({
        metaTag: siteVerificationMeta,
        script: siteVerificationScript,
      });
      setSiteVerificationMeta(saved.metaTag || "");
      setSiteVerificationScript(saved.script || "");
      setVerificationStatus("saved");
    } catch (err) {
      console.error("[Admin] Unable to save site verification snippet:", err);
      setVerificationStatus("error");
    } finally {
      setSavingVerification(false);
    }
  }

  async function handleSaveEatDrinkSpots() {
    setSavingEatDrink(true);
    setEatDrinkStatus("idle");
    try {
      const prepared = eatDrinkSpots.map((spot, idx) => ({
        ...spot,
        id: spot.id || slugifyName(spot.name) || `eat-drink-${idx + 1}`,
      }));
      const saved = await saveEatDrinkSettings(prepared, featuredEatDrinkIds);
      setEatDrinkSpots(saved.spots || []);
      setFeaturedEatDrinkIds(saved.featuredIds || []);
      setEatDrinkStatus("saved");
    } catch (err) {
      console.error("[Admin] Unable to save Eat & Drink spots:", err);
      setEatDrinkStatus("error");
    } finally {
      setSavingEatDrink(false);
    }
  }

  async function handleCreatePost(
    newPost: BlogPostAdminSummary,
    options?: { previousSlug?: string | null }
  ): Promise<void> {
    try {
      const previousSlug = options?.previousSlug || newPost.slug;
      const payload = {
        slug: newPost.slug,
        title: newPost.title,
        category: newPost.category || null,
        status: newPost.status,
        published_at: newPost.publishedAt ?? null,
        reading_time: newPost.readingTime
          ? parseInt(newPost.readingTime, 10)
          : null,
        meta_title: newPost.metaTitle ?? null,
        meta_description: newPost.metaDescription ?? null,
        hero_image_url: newPost.heroImageUrl ?? null,
        body_html: newPost.body ?? null,
        ad_embed_code: newPost.adEmbedCode ?? null,
      };

      // If editing, try to update by previous slug (so changing the slug won't create a new row).
      let data: any = null;
      let error: any = null;
      if (previousSlug) {
        const updateResult = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("slug", previousSlug)
          .select()
          .single();

        data = updateResult.data;
        error = updateResult.error;

        // If no row matched (PGRST116) or no data returned, fall back to upsert.
        if (!data || updateResult.error?.code === "PGRST116") {
          data = null;
          error = null;
        } else if (error) {
          // If a different error, surface it.
          throw error;
        }
      }

      if (!data) {
        const upsertResult = await supabase
          .from("blog_posts")
          .upsert([payload], { onConflict: "slug" })
          .select()
          .single();
        data = upsertResult.data;
        error = upsertResult.error;
      }

      if (error || !data) {
        console.error(
          "Error inserting/updating blog post:",
          error?.message,
          JSON.stringify(error, null, 2)
        );
        alert("There was an error saving the post. Check console for details.");
        return;
      }

      const savedPost: BlogPostAdminSummary = {
        slug: data.slug,
        title: data.title,
        category: data.category ?? "Guide",
        status: (data.status as "draft" | "published") ?? "draft",
        publishedAt: data.published_at ?? undefined,
        readingTime: data.reading_time ? String(data.reading_time) : undefined,
        metaTitle: data.meta_title ?? undefined,
        metaDescription: data.meta_description ?? undefined,
        heroImageUrl: data.hero_image_url ?? undefined,
        body: data.body_html ?? undefined,
        adEmbedCode: data.ad_embed_code ?? undefined,
      };

      upsertPostInState(savedPost);
    } catch (err) {
      console.error("Unexpected error inserting/updating blog post:", err);
      alert("Unexpected error saving blog post. Check console.");
    }
  }

  async function handleDeletePost(slug: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
      if (error) {
        console.error("[Admin] Unable to delete post:", error.message);
        return false;
      }
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      return true;
    } catch (err) {
      console.error("[Admin] Unexpected error deleting post:", err);
      return false;
    }
  }

  function handleSyncGeneratedPost(post: BlogPostAdminSummary) {
    upsertPostInState(post);
  }
  async function handleCreateListing(
    newListing: Omit<AdminBusinessListing, "id">
  ) {
    try {
      const slug = newListing.slug?.trim() || `listing-${Date.now()}`;

      const { data, error } = await supabase
        .from("business_listings")
        .insert([
          {
            slug,
            name: newListing.businessName,
            category: newListing.category,
            price_level: newListing.priceLevel,
            address_line1: newListing.address,
            phone: newListing.phone ?? null,
            website_url: newListing.websiteUrl ?? null,
            audience: newListing.audience ?? [],
            tags: newListing.tags ?? [],
            image_url: newListing.imageUrl ?? null,
            is_published: newListing.isPublished ?? true,
            source: "admin",
          },
        ])
        .select(
          `
          id,
          slug,
          name,
          category,
          price_level,
          address_line1,
          phone,
          website_url,
          audience,
          tags,
          image_url,
          is_published
        `
        )
        .single();

      if (error || !data) {
        console.error("Error inserting business listing:", error?.message);
        alert("There was an error saving the listing. Check console for details.");
        return;
      }

      const saved: AdminBusinessListing = {
        id: data.id,
        slug: data.slug,
        businessName: data.name,
        category: data.category ?? "General",
        priceLevel: data.price_level ?? 2,
        address: data.address_line1 ?? "",
        phone: data.phone ?? undefined,
        websiteUrl: data.website_url ?? undefined,
        audience: data.audience ?? [],
        tags: data.tags ?? [],
        imageUrl: data.image_url ?? undefined,
        isPublished: data.is_published ?? true,
      };

      setAdminListings((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Unexpected error inserting business listing:", err);
      alert("Unexpected error saving business listing. Check console.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:pt-8">
      {/* Minimal admin top bar */}
      <header className="mb-6 flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1C1F2A] text-white text-sm font-bold">
            WP
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1C1F2A]">
              CityOfWhitePlains.org Admin
            </p>
            <p className="text-[11px] text-[#6B7280]">
              Internal tools · not indexed
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            setLoggingOut(true);
            try {
              await fetch("/api/admin/logout", { method: "POST" });
            } catch (err) {
              console.warn("Unable to logout:", err);
            } finally {
              setLoggingOut(false);
              window.location.href = "/admin/login";
            }
          }}
          className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-3 py-1.5 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6] disabled:opacity-60"
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </header>

      {/* Tabs */}
      <nav className="-mx-4 mb-6">
        <div className="grid grid-cols-2 gap-2 px-4 text-xs sm:grid-cols-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "homepage", label: "Page settings" },
            { id: "eat-drink", label: "Eat & drink page" },
            { id: "business", label: "Business submissions & listings" },
            { id: "events", label: "Event submissions" },
            { id: "ads", label: "Ads / affiliates" },
            { id: "email", label: "Email" },
            { id: "blog", label: "WP Insider Blog" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | "overview"
                      | "business"
                      | "events"
                      | "blog"
                      | "homepage"
                      | "eat-drink"
                      | "analytics"
                      | "email"
                  )
                }
                className={[
                  "w-full rounded-full border px-4 py-2 transition",
                  active
                    ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                    : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      {activeTab === "overview" && (
        <OverviewTab
          totalSubmissions={totalSubmissions}
          pendingSubmissions={pendingSubmissions}
          approvedSubmissions={approvedSubmissions}
          publishedPosts={publishedPosts}
          draftPosts={draftPosts}
          submissions={submissions}
          posts={posts}
        />
      )}

      {activeTab === "homepage" && (
        <PageSettingsTab
          pageHeroInputs={pageHeroInputs}
          setPageHeroInputs={setPageHeroInputs}
          pageHeroSaving={pageHeroSaving}
          pageHeroStatus={pageHeroStatus}
          onSavePageHero={handleSavePageHero}
          promoImage={promoImage}
          setPromoImage={setPromoImage}
          promoTitle={promoTitle}
          setPromoTitle={setPromoTitle}
          promoButtonText={promoButtonText}
          setPromoButtonText={setPromoButtonText}
          promoButtonUrl={promoButtonUrl}
          setPromoButtonUrl={setPromoButtonUrl}
          savingPromo={savingPromo}
          promoStatus={promoStatus}
          onSavePromoCard={handleSavePromoCard}
          startVisitors={startVisitors}
          setStartVisitors={setStartVisitors}
          startCourt={startCourt}
          setStartCourt={setStartCourt}
          startEat={startEat}
          setStartEat={setStartEat}
          startBusiness={startBusiness}
          setStartBusiness={setStartBusiness}
          savingStart={savingStart}
          startStatus={startStatus}
          setStartStatus={setStartStatus}
          onSaveStartCards={handleSaveStartCards}
          verificationMeta={siteVerificationMeta}
          setVerificationMeta={setSiteVerificationMeta}
          verificationScript={siteVerificationScript}
          setVerificationScript={setSiteVerificationScript}
          savingVerification={savingVerification}
          verificationStatus={verificationStatus}
          onSaveVerification={handleSaveSiteVerification}
          setVerificationStatus={setVerificationStatus}
        />
      )}

      {activeTab === "eat-drink" && (
        <EatDrinkSettingsTab
          spots={eatDrinkSpots}
          setSpots={setEatDrinkSpots}
          featuredIds={featuredEatDrinkIds}
          setFeaturedIds={setFeaturedEatDrinkIds}
          onSave={handleSaveEatDrinkSpots}
          saving={savingEatDrink}
          status={eatDrinkStatus}
          setStatus={setEatDrinkStatus}
        />
      )}

      {activeTab === "business" && (
        <BusinessTab
          submissions={submissions}
          adminListings={adminListings}
          onCreateListing={handleCreateListing}
          onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
          submissionUpdatingId={submissionUpdatingId}
        />
      )}

      {activeTab === "events" && (
        <EventsTab
          submissions={eventSubmissions}
          onUpdateStatus={handleUpdateEventStatus}
          updatingId={eventUpdatingId}
        />
      )}

      {activeTab === "ads" && (
        <AdsTab
          ads={ads}
          onSaveAd={handleSaveAd}
          saving={adSaving}
          status={adStatus}
          setStatus={setAdStatus}
          adsError={adsError}
        />
      )}

      {activeTab === "email" && (
        <EmailTab
          onSend={handleSendEmail}
          sending={emailSending}
          status={emailStatus}
          setStatus={setEmailStatus}
          error={emailError}
          setError={setEmailError}
        />
      )}

      {activeTab === "blog" && (
        <BlogTab
          posts={posts}
          onCreatePost={handleCreatePost}
          onSyncPost={handleSyncGeneratedPost}
          onDeletePost={handleDeletePost}
        />
      )}

      {activeTab === "analytics" && (
        <AnalyticsTab
          summary={analyticsSummary}
          onChangeRange={handleAnalyticsRangeChange}
          range={analyticsRange}
          loading={analyticsLoading}
          error={analyticsError}
        />
      )}
    </main>
  );
}


type PageSettingsTabProps = {
  pageHeroInputs: PageHeroImages;
  setPageHeroInputs: (v: PageHeroImages) => void;
  pageHeroSaving: Partial<Record<PageHeroKey, boolean>>;
  pageHeroStatus: Partial<Record<PageHeroKey, "idle" | "saved" | "error">>;
  onSavePageHero: (page: PageHeroKey) => Promise<void>;
  promoImage: string;
  setPromoImage: (v: string) => void;
  promoTitle: string;
  setPromoTitle: (v: string) => void;
  promoButtonText: string;
  setPromoButtonText: (v: string) => void;
  promoButtonUrl: string;
  setPromoButtonUrl: (v: string) => void;
  savingPromo: boolean;
  promoStatus: "idle" | "saved" | "error";
  onSavePromoCard: () => Promise<void>;
  startVisitors: string;
  setStartVisitors: (v: string) => void;
  startCourt: string;
  setStartCourt: (v: string) => void;
  startEat: string;
  setStartEat: (v: string) => void;
  startBusiness: string;
  setStartBusiness: (v: string) => void;
  setStartStatus: (v: "idle" | "saved" | "error") => void;
  startStatus: "idle" | "saved" | "error";
  savingStart: boolean;
  onSaveStartCards: () => Promise<void>;
  verificationMeta: string;
  setVerificationMeta: (v: string) => void;
  verificationScript: string;
  setVerificationScript: (v: string) => void;
  savingVerification: boolean;
  verificationStatus: "idle" | "saved" | "error";
  onSaveVerification: () => Promise<void>;
  setVerificationStatus: (v: "idle" | "saved" | "error") => void;
};

function PageSettingsTab({
  pageHeroInputs,
  setPageHeroInputs,
  pageHeroSaving,
  pageHeroStatus,
  onSavePageHero,
  promoImage,
  setPromoImage,
  promoTitle,
  setPromoTitle,
  promoButtonText,
  setPromoButtonText,
  promoButtonUrl,
  setPromoButtonUrl,
  savingPromo,
  promoStatus,
  onSavePromoCard,
  startVisitors,
  setStartVisitors,
  startCourt,
  setStartCourt,
  startEat,
  setStartEat,
  startBusiness,
  setStartBusiness,
  setStartStatus,
  startStatus,
  savingStart,
  onSaveStartCards,
  verificationMeta,
  setVerificationMeta,
  verificationScript,
  setVerificationScript,
  savingVerification,
  verificationStatus,
  onSaveVerification,
  setVerificationStatus,
}: PageSettingsTabProps) {
  const [activePage, setActivePage] = useState<PageHeroKey>("home");
  const heroPreviewSrc =
    pageHeroInputs[activePage]?.trim() || DEFAULT_HOMEPAGE_HERO_IMAGE;
  const showHomeExtras = activePage === "home";

  return (
    <section className="space-y-6 text-xs text-[#111827]">
      <nav className="flex flex-wrap gap-2 text-xs">
        {[
          { id: "home", label: "Home" },
          { id: "visit", label: "Visit" },
          { id: "events", label: "Events" },
          { id: "eat", label: "Eat & Drink" },
          { id: "business", label: "Business" },
        ].map((tab) => {
          const active = activePage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePage(tab.id as PageHeroKey)}
              className={[
                "rounded-full border px-4 py-1.5 transition",
                active
                  ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                  : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              {activePage === "home" ? "Homepage" : `${activePage} page`} hero image
            </h2>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Paste an image URL for this page&apos;s hero background. Saving here updates
              the public page immediately.
            </p>
          </div>
          {pageHeroStatus[activePage] === "saved" && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
              Saved
            </span>
          )}
          {pageHeroStatus[activePage] === "error" && (
            <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700">
              Unable to save
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor={`${activePage}-hero`}
              className="block text-[11px] font-medium text-[#374151]"
            >
              Hero image URL
            </label>
            <input
              id={`${activePage}-hero`}
              value={pageHeroInputs[activePage] || ""}
              onChange={(e) =>
                setPageHeroInputs({
                  ...pageHeroInputs,
                  [activePage]: e.target.value,
                })
              }
              placeholder="https://example.com/your-photo.jpg"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
            />
            <p className="text-[10px] text-[#9CA3AF]">
              Leave blank and save to fall back to the default image for this page.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSavePageHero(activePage)}
                disabled={!!pageHeroSaving[activePage]}
                className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pageHeroSaving[activePage] ? "Saving…" : "Save hero image"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageHeroInputs({
                    ...pageHeroInputs,
                    [activePage]: "",
                  });
                }}
                className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                Reset to default
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
            <img
              src={heroPreviewSrc}
              alt={`${activePage} hero preview`}
              className="h-40 w-full object-cover"
            />
            <div className="border-t border-[#E5E7EB] px-3 py-2 text-[10px] text-[#6B7280]">
              Preview of what will appear on the {activePage} page hero.
            </div>
          </div>
        </div>
      </section>

      {showHomeExtras && (
        <>
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">
                  Sticky promo card
                </h2>
                <p className="mt-1 text-[11px] text-[#6B7280]">
                  Controls the sliding/sticky ad card on the hero. Set the image, headline, button
                  text, and destination link (affiliate or otherwise).
                </p>
              </div>
              {promoStatus === "saved" && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                  Saved
                </span>
              )}
              {promoStatus === "error" && (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700">
                  Unable to save
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="promoImageUrl"
                      className="block text-[11px] font-medium text-[#374151]"
                    >
                      Promo image URL
                    </label>
                    <input
                      id="promoImageUrl"
                      value={promoImage}
                      onChange={(e) => setPromoImage(e.target.value)}
                      placeholder="https://example.com/promo.jpg"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="promoTitle"
                      className="block text-[11px] font-medium text-[#374151]"
                    >
                      Headline
                    </label>
                    <input
                      id="promoTitle"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      placeholder="Example: Stay the night, skip the rush"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="promoButtonText"
                      className="block text-[11px] font-medium text-[#374151]"
                    >
                      Button text
                    </label>
                    <input
                      id="promoButtonText"
                      value={promoButtonText}
                      onChange={(e) => setPromoButtonText(e.target.value)}
                      placeholder="Book now"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="promoButtonUrl"
                      className="block text-[11px] font-medium text-[#374151]"
                    >
                      Button link
                    </label>
                    <input
                      id="promoButtonUrl"
                      value={promoButtonUrl}
                      onChange={(e) => setPromoButtonUrl(e.target.value)}
                      placeholder="https://affiliate.example.com"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSavePromoCard}
                    disabled={savingPromo}
                    className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingPromo ? "Saving…" : "Save promo card"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoImage(DEFAULT_PROMO_CARD.imageUrl);
                      setPromoTitle(DEFAULT_PROMO_CARD.title);
                      setPromoButtonText(DEFAULT_PROMO_CARD.buttonText);
                      setPromoButtonUrl(DEFAULT_PROMO_CARD.buttonUrl);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Reset to default
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                <img
                  src={promoImage || DEFAULT_PROMO_CARD.imageUrl}
                  alt={promoTitle || "Promo preview"}
                  className="h-32 w-full object-cover"
                />
                <div className="space-y-1 border-t border-[#E5E7EB] px-3 py-2 text-[10px] text-[#6B7280]">
                  <p className="text-[11px] font-semibold text-[#111827]">
                    {promoTitle || "Promo headline"}
                  </p>
                  <div className="inline-flex rounded-full bg-[#1C1F2A] px-3 py-1 text-[10px] font-semibold text-white">
                    {promoButtonText || "Button text"}
                  </div>
                  <p className="text-[10px] text-[#9CA3AF]">
                    {promoButtonUrl || "Link preview"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">
                  “Choose your path” card backgrounds
                </h2>
                <p className="mt-1 text-[11px] text-[#6B7280]">
                  Set background images for the four cards on the homepage (“Choose the path that fits your trip”).
                  A dark overlay keeps the text readable.
                </p>
              </div>
              {startStatus === "saved" && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                  Saved
                </span>
              )}
              {startStatus === "error" && (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700">
                  Unable to save
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="startVisitors"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Visitors card image URL
                  </label>
                  <input
                    id="startVisitors"
                    value={startVisitors}
                    onChange={(e) => setStartVisitors(e.target.value)}
                    placeholder="https://example.com/visitors.jpg"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="startCourt"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Court & business card image URL
                  </label>
                  <input
                    id="startCourt"
                    value={startCourt}
                    onChange={(e) => setStartCourt(e.target.value)}
                    placeholder="https://example.com/court.jpg"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="startEat"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Eat & drink card image URL
                  </label>
                  <input
                    id="startEat"
                    value={startEat}
                    onChange={(e) => setStartEat(e.target.value)}
                    placeholder="https://example.com/eat.jpg"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="startBusiness"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Business card image URL
                  </label>
                  <input
                    id="startBusiness"
                    value={startBusiness}
                    onChange={(e) => setStartBusiness(e.target.value)}
                    placeholder="https://example.com/business.jpg"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  />
                </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSaveStartCards}
                  disabled={savingStart}
                  className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingStart ? "Saving…" : "Save card images"}
                </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartVisitors(DEFAULT_START_CARD_IMAGES.visitors);
                      setStartCourt(DEFAULT_START_CARD_IMAGES.court);
                      setStartEat(DEFAULT_START_CARD_IMAGES.eat);
                      setStartBusiness(DEFAULT_START_CARD_IMAGES.business);
                      setStartStatus("idle");
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Reset to defaults
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Visitors", src: startVisitors, fallback: DEFAULT_START_CARD_IMAGES.visitors },
                  { label: "Court & business", src: startCourt, fallback: DEFAULT_START_CARD_IMAGES.court },
                  { label: "Eat & drink", src: startEat, fallback: DEFAULT_START_CARD_IMAGES.eat },
                  { label: "Business", src: startBusiness, fallback: DEFAULT_START_CARD_IMAGES.business },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]"
                  >
                    <img
                      src={card.src || card.fallback}
                      alt={`${card.label} preview`}
                      className="h-28 w-full object-cover"
                    />
                    <div className="border-t border-[#E5E7EB] px-3 py-2 text-[10px] text-[#6B7280]">
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">
                  Site verification & head snippets
                </h2>
                <p className="mt-1 text-[11px] text-[#6B7280]">
                  Paste verification details for Google Search Console (meta) and any required head scripts
                  for domain ownership checks. Saved snippets render in the site <code className="mx-1 rounded bg-[#F3F4F6] px-1">head</code>.
                </p>
              </div>
              {verificationStatus === "saved" && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                  Saved
                </span>
              )}
              {verificationStatus === "error" && (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700">
                  Unable to save
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="siteVerificationMeta"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Google/Bing meta tag content
                  </label>
                  <input
                    id="siteVerificationMeta"
                    value={verificationMeta}
                    onChange={(e) => setVerificationMeta(e.target.value)}
                    placeholder="Example: abc123-your-google-verification-token"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  />
                  <p className="text-[10px] text-[#9CA3AF]">
                    We output <code className="mx-1 rounded bg-[#F3F4F6] px-1">&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot; /&gt;</code> in the head.
                    Leave blank to remove it.
                  </p>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="siteVerificationScript"
                    className="block text-[11px] font-medium text-[#374151]"
                  >
                    Head script (optional)
                  </label>
                  <textarea
                    id="siteVerificationScript"
                    value={verificationScript}
                    onChange={(e) => setVerificationScript(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                    placeholder="<script>/* verification snippet */</script>"
                    rows={4}
                  />
                  <p className="text-[10px] text-[#9CA3AF]">
                    Paste the exact script content required for verification (runs before interactive on every page).
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSaveVerification}
                    disabled={savingVerification}
                    className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingVerification ? "Saving…" : "Save verification"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMeta("");
                      setVerificationScript("");
                      setVerificationStatus("idle");
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Clear fields
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[11px] text-[#4B5563]">
                <p className="text-[11px] font-semibold text-[#111827]">What gets injected</p>
                <div className="mt-2 space-y-2 rounded-lg bg-white p-3 text-[11px] text-[#111827]">
                  {verificationMeta ? (
                    <code className="block whitespace-pre-wrap break-words text-[11px] text-[#111827]">
                      {`<meta name="google-site-verification" content="${verificationMeta.trim()}" />`}
                    </code>
                  ) : (
                    <p className="text-[10px] text-[#9CA3AF]">No meta tag saved.</p>
                  )}
                  {verificationScript ? (
                    <code className="block whitespace-pre-wrap break-words text-[11px] text-[#111827]">
                      {verificationScript.trim()}
                    </code>
                  ) : (
                    <p className="text-[10px] text-[#9CA3AF]">No head script saved.</p>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-[#9CA3AF]">
                  Shows on all pages. For DNS/file verification, use your registrar instead.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </section>
  );
}

type AnalyticsRange =
  | { type: "preset"; days: number }
  | { type: "custom"; start?: string; end?: string };

type AnalyticsTabProps = {
  summary: AnalyticsSummary | null;
  range: AnalyticsRange;
  onChangeRange: (range: AnalyticsRange) => void;
  loading: boolean;
  error: string | null;
};

function AnalyticsTab({
  summary,
  range,
  onChangeRange,
  loading,
  error,
}: AnalyticsTabProps) {
  if (!summary) {
    return (
      <section className="rounded-3xl border border-[#E5E7EB] bg-white px-5 py-6 text-xs sm:px-7 sm:py-7">
        <p className="text-sm font-semibold text-[#111827]">
          Analytics not available
        </p>
        <p className="mt-1 text-[11px] text-[#6B7280]">
          No analytics summary was loaded. Ensure the Supabase table
          <code className="mx-1 rounded bg-[#F3F4F6] px-1">analytics_events</code> exists
          and refresh this page.
        </p>
      </section>
    );
  }

  const cards = [
    { label: "Page views", value: summary.totals.page_view },
    { label: "Directory filters", value: summary.totals.directory_filter },
    {
      label: "Directory outbound clicks",
      value: summary.totals.directory_outbound_click,
    },
    { label: "Directory form submits", value: summary.totals.directory_form_submit },
    { label: "Claim clicks", value: summary.totals.claim_click },
    { label: "Claim submits", value: summary.totals.claim_submit },
    { label: "New submits", value: summary.totals.new_submit },
    { label: "Other outbound clicks", value: summary.totals.outbound_click },
    { label: "Blog reactions", value: summary.totals.blog_reaction },
    { label: "Blog scroll depth hits", value: summary.totals.blog_scroll },
  ];
  const topCountries = summary.topCountries || [];
  const topRouteLocations = summary.topRouteLocations || [];
  const presetRanges = [
    { label: "24h", days: 1 },
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
    { label: "3mo", days: 90 },
    { label: "6mo", days: 180 },
    { label: "12mo", days: 365 },
  ];
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const activePreset = range.type === "preset" ? range.days : null;
  const rangeLabel =
    range.type === "custom" && range.start
      ? `${range.start}${range.end ? ` → ${range.end}` : ""}`
      : `${summary.since}${summary.until ? ` → ${summary.until}` : ""}`;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Analytics</h2>
          <p className="text-[11px] text-[#6B7280]">
            On-site events captured via the lightweight tracker for the selected range.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-[11px] text-[#6B7280]">
          <div className="flex flex-wrap items-center gap-2">
            {presetRanges.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChangeRange({ type: "preset", days: preset.days })}
                className={[
                  "rounded-full border px-3 py-1 font-semibold transition",
                  activePreset === preset.days
                    ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#4B5FC6]"
                    : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                ].join(" ")}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-32 rounded-lg border border-[#E5E7EB] px-2 py-1 text-[11px] text-[#111827]"
              aria-label="Start date"
            />
            <span className="text-[#9CA3AF]">→</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-32 rounded-lg border border-[#E5E7EB] px-2 py-1 text-[11px] text-[#111827]"
              aria-label="End date"
            />
            <button
              type="button"
              onClick={() =>
                customStart &&
                onChangeRange({ type: "custom", start: customStart, end: customEnd || undefined })
              }
              disabled={!customStart}
              className="rounded-full border border-[#E5E7EB] px-3 py-1 font-semibold text-[#4B5563] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply custom
            </button>
          </div>
          <p className="text-right text-[11px] text-[#6B7280]">
            Range: <span className="font-semibold text-[#111827]">{rangeLabel}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[11px] text-[#991B1B]">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <div
            key={`${card.label}-${idx}`}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-[11px] text-[#6B7280]">{card.label}</p>
            <p className="text-xl font-semibold text-[#111827]">{card.value}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[11px] text-[#4B5563]">
          Loading analytics for the selected range…
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsMap countries={topCountries} />
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
          <p className="text-sm font-semibold text-[#111827]">
            Page impressions by location
          </p>
          <p className="text-[11px] text-[#6B7280]">
            Top routes paired with their most frequent visitor country.
          </p>
          <div className="mt-3 space-y-2 text-[12px]">
            {topRouteLocations.length === 0 && (
              <p className="text-[11px] text-[#9CA3AF]">No geo-tagged page views yet.</p>
            )}
            {topRouteLocations.map((item) => (
              <div
                key={`${item.route}-${item.country}-${item.countryCode || "xx"}`}
                className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-[#111827]">{item.route}</span>
                  <span className="text-[11px] text-[#6B7280]">{item.country}</span>
                </div>
                <span className="text-[#4B5FC6] font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
          <p className="text-sm font-semibold text-[#111827]">Top routes</p>
          <p className="text-[11px] text-[#6B7280]">
            Routes with the most events in the last 30 days.
          </p>
          <div className="mt-3 space-y-2 text-[12px]">
            {summary.topRoutes.length === 0 && (
              <p className="text-[11px] text-[#9CA3AF]">No data yet.</p>
            )}
            {summary.topRoutes.map((item) => (
              <div
                key={item.route}
                className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-3 py-2"
              >
                <span className="text-[#111827]">{item.route}</span>
                <span className="text-[#4B5FC6] font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
          <p className="text-sm font-semibold text-[#111827]">Top events</p>
          <p className="text-[11px] text-[#6B7280]">
            Event types counted over the last 30 days.
          </p>
          <div className="mt-3 space-y-2 text-[12px]">
            {summary.topEvents.length === 0 && (
              <p className="text-[11px] text-[#9CA3AF]">No data yet.</p>
            )}
            {summary.topEvents.map((item) => (
              <div
                key={item.event}
                className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-3 py-2"
              >
                <span className="text-[#111827]">{item.event}</span>
                <span className="text-[#4B5FC6] font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

type EatDrinkSettingsTabProps = {
  spots: EatPlace[];
  setSpots: (spots: EatPlace[]) => void;
  featuredIds: string[];
  setFeaturedIds: (ids: string[]) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  status: "idle" | "saved" | "error";
  setStatus: (value: "idle" | "saved" | "error") => void;
};

function EatDrinkSettingsTab({
  spots,
  setSpots,
  featuredIds,
  setFeaturedIds,
  onSave,
  saving,
  status,
  setStatus,
}: EatDrinkSettingsTabProps) {
  const recommendedSize = "1200 x 800 (landscape)";
  const [searchTerm, setSearchTerm] = useState("");
  const isValidUrl = (value?: string | null) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddSpot = () => {
    setStatus("idle");
    const nextId = slugifyName(`eat-drink-${Date.now()}`);
    setSpots([
      ...spots,
      {
        id: nextId,
        name: "",
        shortDescription: "",
        category: "dinner",
        vibe: "calm",
        budget: "$$",
        goodFor: [...DEFAULT_EAT_DRINK_TAGS],
        address: "",
        phone: "",
        websiteUrl: "",
        menuUrl: "",
        imageUrl: "",
        mapsUrl: "",
      },
    ]);
  };

  const handleUpdateSpot = (id: string, updates: Partial<EatPlace>) => {
    setStatus("idle");
    setSpots(
      spots.map((spot) => (spot.id === id ? { ...spot, ...updates } : spot))
    );
  };

  const handleRemoveSpot = (id: string) => {
    setStatus("idle");
    setSpots(spots.filter((spot) => spot.id !== id));
    setFeaturedIds(featuredIds.filter((fid) => fid !== id));
  };

  const handleMoveSpot = (id: string, direction: "up" | "down") => {
    const idx = spots.findIndex((spot) => spot.id === id);
    if (idx === -1) return;
    setStatus("idle");
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= spots.length) return;

    const next = spots.slice();
    const [removed] = next.splice(idx, 1);
    next.splice(target, 0, removed);
    setSpots(next);
  };

  const filteredSpots = spots.filter((spot) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      spot.name.toLowerCase().includes(term) ||
      (spot.shortDescription || "").toLowerCase().includes(term) ||
      (spot.address || "").toLowerCase().includes(term) ||
      (spot.category || "").toLowerCase().includes(term)
    );
  });

  const toggleFeatured = (id: string) => {
    setStatus("idle");
    const exists = featuredIds.includes(id);
    if (exists) {
      setFeaturedIds(featuredIds.filter((fid) => fid !== id));
      return;
    }
    if (featuredIds.length >= 3) {
      // Replace the last one to keep max 3
      const next = featuredIds.slice(0, 2);
      setFeaturedIds([...next, id]);
      return;
    }
    setFeaturedIds([...featuredIds, id]);
  };

  return (
    <section className="space-y-4 text-xs text-[#111827]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#111827]">
            Eat &amp; Drink page spots
          </h2>
          <p className="mt-1 max-w-3xl text-[11px] text-[#6B7280]">
            Add, edit, or reorder the cards that appear on the Eat &amp; Drink page.
            Each card can include a map link (we&apos;ll generate one from the address if
            you leave the link blank) and an image. Recommended image size: {recommendedSize}.
          </p>
        </div>
        {status === "saved" && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
            Saved
          </span>
        )}
        {status === "error" && (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700">
            Unable to save
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAddSpot}
          className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
        >
          + Add spot
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || spots.length === 0}
          className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save Eat & drink spots"}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, description, or address"
            className="w-64 max-w-full rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
          />
          <span className="text-[10px] text-[#6B7280]">
            Showing {filteredSpots.length} of {spots.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
          <span className="font-semibold text-[#111827]">Top picks:</span>
          <div className="flex flex-wrap gap-1">
            {featuredIds.map((id) => {
              const spot = spots.find((s) => s.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-[#EEF0FF] px-2 py-1 text-[#4B5FC6]"
                >
                  {spot?.name || id}
                  <button
                    type="button"
                    onClick={() => toggleFeatured(id)}
                    className="text-[#6B7280] hover:text-[#1C1F2A]"
                    aria-label="Remove featured"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {featuredIds.length === 0 && <span>Choose up to 3.</span>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredSpots.map((spot) => {
          const orderIndex = spots.findIndex((s) => s.id === spot.id);
          const displayIndex = orderIndex >= 0 ? orderIndex + 1 : 1;
          return (
          <article
            key={spot.id}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-[#111827]">
                  Spot {displayIndex}
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  ID: {spot.id || "Will auto-generate from name"}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleFeatured(spot.id)}
                  className={[
                    "rounded-full border px-3 py-1 text-[10px] transition",
                    featuredIds.includes(spot.id)
                      ? "border-[#4B5FC6] bg-[#EEF0FF] text-[#4B5FC6]"
                      : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  {featuredIds.includes(spot.id) ? "Featured" : "Make featured"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveSpot(spot.id, "up")}
                  className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[10px] text-[#4B5563] hover:bg-[#F3F4F6]"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveSpot(spot.id, "down")}
                  className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[10px] text-[#4B5563] hover:bg-[#F3F4F6]"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSpot(spot.id)}
                  className="rounded-full border border-rose-200 px-3 py-1 text-[10px] text-rose-700 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Name
                </label>
                <input
                  value={spot.name}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, { name: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Example: Martine Gourmet Deli"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Short description
                </label>
                <input
                  value={spot.shortDescription}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, {
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Cuisine · Dine-in or takeout"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Category
                </label>
                <select
                  value={spot.category}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, {
                      category: e.target.value as EatPlace["category"],
                    })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                >
                  {[
                    { id: "coffee", label: "Coffee & reset" },
                    { id: "breakfast", label: "Breakfast & brunch" },
                    { id: "lunch", label: "Lunch" },
                    { id: "dinner", label: "Dinner" },
                    { id: "quick-bite", label: "Quick bite" },
                  ].map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 sm:col-span-1 md:col-span-1">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[#374151]">
                    Budget
                  </label>
                  <select
                    value={spot.budget}
                    onChange={(e) =>
                      handleUpdateSpot(spot.id, {
                        budget: e.target.value as EatPlace["budget"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  >
                    {["$", "$$", "$$$"].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[#374151]">
                    Vibe
                  </label>
                  <select
                    value={spot.vibe}
                    onChange={(e) =>
                      handleUpdateSpot(spot.id, {
                        vibe: e.target.value as EatPlace["vibe"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  >
                    {[
                      { id: "calm", label: "Calm" },
                      { id: "family", label: "Family" },
                      { id: "fast", label: "Fast" },
                      { id: "date-night", label: "Date night" },
                    ].map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[#374151]">
                    Good for (comma separated)
                  </label>
                  <input
                    value={(spot.goodFor || []).join(", ")}
                    onChange={(e) =>
                      handleUpdateSpot(spot.id, {
                        goodFor: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                    placeholder="Court day, Family day, No-car visits"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Address
                </label>
                <input
                  value={spot.address || ""}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, { address: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="123 Main St, White Plains, NY"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  Maps link will auto-generate from this unless you set a custom link.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Maps link (optional)
                </label>
                <input
                  value={spot.mapsUrl || ""}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, { mapsUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://maps.google.com/?q=..."
                />
                {spot.mapsUrl && !isValidUrl(spot.mapsUrl) && (
                  <p className="text-[10px] text-rose-600">
                    Enter a valid http/https link.
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Website URL (optional)
                </label>
                <input
                  value={spot.websiteUrl || ""}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, { websiteUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://example.com"
                />
              </div>
              {spot.websiteUrl && !isValidUrl(spot.websiteUrl) && (
                <p className="text-[10px] text-rose-600">
                  Enter a valid http/https link.
                </p>
              )}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Menu URL
                </label>
                <input
                  value={spot.menuUrl || ""}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, { menuUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://example.com/menu"
                />
                {spot.menuUrl && !isValidUrl(spot.menuUrl) && (
                  <p className="text-[10px] text-rose-600">
                    Enter a valid http/https link.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Phone (optional)
                </label>
                <input
                  value={spot.phone || ""}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, { phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Card image URL
                </label>
                <input
                  value={spot.imageUrl || ""}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, { imageUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://images.example.com/1200x800.jpg"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  Recommended {recommendedSize} so the card crops nicely.
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Thumbs up count
                </label>
                <input
                  type="number"
                  min={0}
                  value={spot.upVotes ?? 0}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, {
                      upVotes: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Thumbs down count
                </label>
                <input
                  type="number"
                  min={0}
                  value={spot.downVotes ?? 0}
                  onChange={(e) =>
                    handleUpdateSpot(spot.id, {
                      downVotes: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  Featured badge?
                </label>
                <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                  <span>
                    Use &ldquo;Make featured&rdquo; above to pick up to 3 top spots.
                  </span>
                </div>
              </div>
            </div>
          </article>
        );
        })}

        {filteredSpots.length === 0 && (
          <p className="text-[11px] text-[#6B7280]">
            No spots found. Clear the search or add a new spot.
          </p>
        )}
      </div>
    </section>
  );
}

/* ------------------------ OVERVIEW TAB ------------------------ */

type OverviewProps = {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  publishedPosts: number;
  draftPosts: number;
  submissions: BusinessSubmission[];
  posts: BlogPostAdminSummary[];
};

function OverviewTab({
  totalSubmissions,
  pendingSubmissions,
  approvedSubmissions,
  publishedPosts,
  draftPosts,
  submissions,
  posts,
}: OverviewProps) {
  const latestSubmissions = submissions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    .slice(0, 3);

  const latestPosts = posts.slice(0, 3);

  return (
    <section className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total business submissions"
          value={totalSubmissions}
          hint="All-time submissions via 'List your business'."
        />
        <StatCard
          label="Pending review"
          value={pendingSubmissions}
          hint="Submissions waiting for approval."
          tone="warning"
        />
        <StatCard
          label="Approved listings"
          value={approvedSubmissions}
          hint="Businesses that are live or ready to publish."
          tone="success"
        />
        <StatCard
          label="Blog posts"
          value={publishedPosts}
          hint={`${draftPosts} draft${draftPosts === 1 ? "" : "s"} in progress.`}
        />
      </div>

      {/* Latest submissions + latest posts */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs text-[#111827]">
          <h2 className="text-sm font-semibold text-[#111827]">
            Latest business submissions
          </h2>
          <p className="mt-1 text-[11px] text-[#6B7280]">
            A quick view of what&apos;s come in recently from the public form.
          </p>

          <div className="mt-3 space-y-2">
            {latestSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#111827]">
                    {sub.businessName}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    {sub.category} · {sub.mode === "claim" ? "Claim" : "New"} listing
                  </p>
                  <p className="mt-1 text-[10px] text-[#9CA3AF]">
                    From {sub.contactName} · {sub.contactEmail}
                  </p>
                </div>
                <span
                  className={[
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] capitalize",
                    sub.status === "pending" &&
                      "bg-amber-50 text-amber-700 border border-amber-200",
                    sub.status === "approved" &&
                      "bg-emerald-50 text-emerald-700 border border-emerald-200",
                    sub.status === "rejected" &&
                      "bg-rose-50 text-rose-700 border border-rose-200",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {sub.status}
                </span>
              </div>
            ))}

            {latestSubmissions.length === 0 && (
              <p className="text-[11px] text-[#6B7280]">
                No submissions yet. Once the form is live, new entries will show here.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs text-[#111827]">
          <h2 className="text-sm font-semibold text-[#111827]">
            Latest WP Insider Blog posts
          </h2>
          <p className="mt-1 text-[11px] text-[#6B7280]">
            Pulled from your current blog data. Later this will sync directly with the
            blog CMS / database.
          </p>

          <div className="mt-3 space-y-2">
            {latestPosts.map((post) => (
              <div
                key={post.slug}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#111827]">
                    {post.title}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    {post.category} · {post.readingTime || "Guide"}
                  </p>
                </div>
                <span
                  className={[
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] capitalize",
                    post.status === "draft"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200",
                  ].join(" ")}
                >
                  {post.status}
                </span>
              </div>
            ))}

            {latestPosts.length === 0 && (
              <p className="text-[11px] text-[#6B7280]">
                No blog posts found. The admin will list posts as soon as they exist in{" "}
                <code className="rounded bg-[#F3F4F6] px-1">blogData.ts</code> or
                your future CMS.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  tone?: "default" | "success" | "warning";
};

function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "warning"
      ? "border-amber-200 bg-amber-50"
      : "border-[#E5E7EB] bg-white";

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-xs text-[#111827] ${toneClasses}`}
    >
      <p className="text-[11px] font-semibold text-[#6B7280]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#111827]">{value}</p>
      <p className="mt-1 text-[10px] text-[#9CA3AF]">{hint}</p>
    </div>
  );
}

/* --------------------- EVENT SUBMISSIONS TAB --------------------- */

type EventsTabProps = {
  submissions: EventSubmission[];
  onUpdateStatus: (id: string, status: EventSubmissionStatus, sendEmail?: boolean) => Promise<void>;
  updatingId: string | null;
};

function EventsTab({ submissions, onUpdateStatus, updatingId }: EventsTabProps) {
  const [sendEmail, setSendEmail] = useState(true);

  return (
    <section className="space-y-4 text-xs text-[#111827]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#111827]">Event submissions</h2>
          <p className="text-[11px] text-[#6B7280]">
            Review events submitted from the public form. Approving marks them as
            “approved” so they appear on the public events page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[11px] text-[#4B5563]">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#4B5FC6] focus:ring-[#4B5FC6]"
            />
            Send approval email
          </label>
          <div className="rounded-full bg-[#EEF0FF] px-3 py-1 text-[11px] font-semibold text-[#4B5FC6]">
            Pending: {submissions.filter((s) => s.status === "pending").length}
          </div>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
        <table className="min-w-full border-separate border-spacing-y-1 text-left text-[11px]">
          <thead className="text-[#6B7280]">
            <tr>
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Audience</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Reviewed</th>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr
                key={sub.id}
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]"
              >
                <td className="px-4 py-2">
                  <p className="font-semibold text-[#111827]">{sub.title}</p>
                  <p className="text-[10px] text-[#6B7280]">{sub.location}</p>
                  {sub.description && (
                    <p className="mt-1 line-clamp-2 text-[10px] text-[#6B7280]">
                      {sub.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-2 text-[#4B5563]">
                  {new Date(sub.startAt).toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2 text-[#4B5563]">
                  <span className="inline-flex rounded-full bg-[#E5E7EB] px-2 py-0.5 text-[10px] font-semibold">
                    {sub.audience === "family"
                      ? "Family"
                      : sub.audience === "21plus"
                      ? "21+"
                      : sub.audience === "18plus"
                      ? "18+"
                      : "Unknown"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] capitalize",
                      sub.status === "pending" &&
                        "bg-amber-50 text-amber-700 border border-amber-200",
                      sub.status === "approved" &&
                        "bg-emerald-50 text-emerald-700 border border-emerald-200",
                      sub.status === "rejected" &&
                        "bg-rose-50 text-rose-700 border border-rose-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-[#6B7280]">
                  {sub.contactName}
                  <br />
                  <span className="text-[10px]">{sub.contactEmail}</span>
                </td>
                <td className="px-4 py-2 text-[10px] text-[#6B7280]">
                  {sub.lastReviewedAt
                    ? new Date(sub.lastReviewedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-2 text-[10px] text-[#9CA3AF]">
                  {sub.id || "—"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        sub.id &&
                        sub.id !== "undefined" &&
                        onUpdateStatus(sub.id, "approved", sendEmail)
                      }
                      disabled={updatingId === sub.id || !sub.id || sub.id === "undefined"}
                      className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                    >
                      {updatingId === sub.id ? "Saving…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        sub.id &&
                        sub.id !== "undefined" &&
                        onUpdateStatus(sub.id, "rejected", sendEmail)
                      }
                      disabled={updatingId === sub.id || !sub.id || sub.id === "undefined"}
                      className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                    >
                      {updatingId === sub.id ? "Saving…" : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {submissions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-[11px] text-[#6B7280]"
                >
                  No event submissions yet. Approved community events will show on the
                  public events page automatically.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* --------------------- ADS TAB --------------------- */

type AdsTabProps = {
  ads: AffiliateAd[];
  onSaveAd: (ad: Partial<AffiliateAd>) => Promise<void>;
  saving: boolean;
  status: "idle" | "saved" | "error";
  setStatus: (s: "idle" | "saved" | "error") => void;
  adsError: string | null;
};

function AdsTab({ ads, onSaveAd, saving, status, setStatus, adsError }: AdsTabProps) {
  const [form, setForm] = useState<Partial<AffiliateAd>>({
    title: "",
    subtitle: "",
    buttonText: "",
    link: "",
    placement: "visit_lodging",
    imageUrl: "",
    partner: "",
    is_active: true,
  } as any);

  return (
    <section className="space-y-4 text-xs text-[#111827]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#111827]">Ads / affiliate placements</h2>
          <p className="text-[11px] text-[#6B7280]">
            Manage CTA cards for lodging, tickets, rentals. Active ads show on Visit and Events pages.
          </p>
        </div>
        {status === "saved" && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            Saved
          </span>
        )}
        {status === "error" && (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700">
            Error saving
          </span>
        )}
      </header>

          <div className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveAd(form).then(() => setStatus("saved"));
          }}
          className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827]">Add / edit ad</h3>
            {form.id && (
              <span className="rounded-full bg-[#EEF0FF] px-3 py-1 text-[10px] text-[#4B5FC6]">
                Editing {form.id}
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-[11px] font-semibold text-[#374151]" htmlFor="ad-subtitle">
              Subtitle (shown under title)
            </label>
            <input
              id="ad-subtitle"
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] outline-none focus:border-[#4B5FC6]"
              value={(form as any).subtitle || ""}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g., Walkable to train and Main St."
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[11px] font-semibold text-[#374151]" htmlFor="ad-button-text">
              Button text
            </label>
            <input
              id="ad-button-text"
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] outline-none focus:border-[#4B5FC6]"
              value={(form as any).buttonText || ""}
              onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
              placeholder="e.g., Book now"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[11px] font-semibold text-[#374151]" htmlFor="ad-title">
              Title
            </label>
            <input
              id="ad-title"
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] outline-none focus:border-[#4B5FC6]"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[11px] font-semibold text-[#374151]" htmlFor="ad-link">
              Link (affiliate)
            </label>
            <input
              id="ad-link"
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] outline-none focus:border-[#4B5FC6]"
              value={form.link || ""}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              required
              placeholder="https://"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-[11px] font-semibold text-[#374151]" htmlFor="ad-placement">
              Placement
            </label>
            <select
              id="ad-placement"
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] outline-none focus:border-[#4B5FC6]"
              value={form.placement || "visit_lodging"}
              onChange={(e) => setForm({ ...form, placement: e.target.value })}
            >
              <option value="visit_lodging">Visit page – lodging CTA</option>
              <option value="visit_rentals">Visit page – rentals CTA</option>
              <option value="events_lodging">Events page – lodging CTA</option>
              <option value="events_tickets">Events page – tickets CTA</option>
              <option value="transport">Transport / car rentals</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-[11px] font-semibold text-[#374151]" htmlFor="ad-image">
              Image URL (optional)
            </label>
            <input
              id="ad-image"
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] outline-none focus:border-[#4B5FC6]"
              value={(form as any).image_url || (form as any).imageUrl || ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://images..."
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[11px] font-semibold text-[#374151]" htmlFor="ad-partner">
              Partner name (shown to users)
            </label>
            <input
              id="ad-partner"
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] outline-none focus:border-[#4B5FC6]"
              value={(form as any).partner || ""}
              onChange={(e) => setForm({ ...form, partner: e.target.value })}
              placeholder="Booking.com, Expedia, Ticketmaster..."
            />
          </div>
          <label className="flex items-center gap-2 text-[11px] text-[#4B5563]">
            <input
              type="checkbox"
              checked={(form as any).is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#4B5FC6] focus:ring-[#4B5FC6]"
            />
            Active
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#4B5FC6] px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : form.id ? "Update ad" : "Create ad"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() =>
                  setForm({
                    title: "",
                    subtitle: "",
                    buttonText: "",
                    link: "",
                    placement: "visit_lodging",
                    imageUrl: "",
                    partner: "",
                    is_active: true,
                  } as any)
                }
                className="rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563]"
              >
                New ad
              </button>
            )}
          </div>
        </form>

        <div className="space-y-2 rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#111827]">Existing ads</h3>
          {adsError && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-[#92400e]">
              {adsError}
            </p>
          )}
          {ads.length === 0 && (
            <p className="text-[11px] text-[#6B7280]">No ads yet. Add your first affiliate CTA.</p>
          )}
          <div className="grid gap-2">
            {ads.map((ad) => (
              <article
                key={ad.id}
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-semibold text-[#111827]">{ad.title}</p>
                    <p className="text-[10px] text-[#4B5563]">{ad.partner || ad.placement}</p>
                    <p className="text-[10px] text-[#9CA3AF] break-all">{ad.link}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      (ad as any).is_active === false
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {(ad as any).is_active === false ? "Inactive" : "Active"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[#6B7280]">
                  <span className="rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[#4B5FC6]">
                    {ad.placement}
                  </span>
                  {ad.imageUrl && <span className="text-[#9CA3AF]">Img ✓</span>}
                  {ad.subtitle && (
                    <span className="rounded-full bg-[#FFEDD5] px-2 py-0.5 font-semibold text-[#9A3412]">
                      Subtitle
                    </span>
                  )}
                  {ad.buttonText && (
                    <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 font-semibold text-[#1D4ED8]">
                      Button text
                    </span>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setForm({
                        ...ad,
                        imageUrl: (ad as any).image_url || (ad as any).imageUrl,
                        is_active: (ad as any).is_active ?? true,
                      } as any);
                    }}
                    className="rounded-full border border-[#D1D5DB] px-3 py-1 text-[10px] text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Edit
                  </button>
                  <a
                    href={ad.link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[10px] text-[#2563EB] hover:bg-[#EEF0FF]"
                  >
                    Open link →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type EmailTabProps = {
  onSend: (payload: {
    recipients: string;
    subject: string;
    body: string;
    isHtml: boolean;
  }) => Promise<void>;
  sending: boolean;
  status: "idle" | "sent" | "error";
  setStatus: (status: "idle" | "sent" | "error") => void;
  error: string | null;
  setError: (msg: string | null) => void;
};

function EmailTab({
  onSend,
  sending,
  status,
  setStatus,
  error,
  setError,
}: EmailTabProps) {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");

  const resetStatus = () => {
    if (status !== "idle") setStatus("idle");
    if (error) setError(null);
  };

  const handleSend = async (targetRecipients: string) => {
    resetStatus();
    await onSend({
      recipients: targetRecipients,
      subject,
      body,
      isHtml,
    });
  };

  const handleTestSend = async () => {
    if (!testRecipient.trim()) {
      setError("Add an email address for the test send.");
      setStatus("error");
      return;
    }
    await handleSend(testRecipient.trim());
  };

  const applyBusinessOutreachTemplate = () => {
    resetStatus();
    setIsHtml(true);
    setSubject("(Community Focused): You’re invited: Feature your business on CityOfWhitePlains.org");
    setBody(`
    <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Arial,sans-serif;color:#111827;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f8fb;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(17,24,39,0.08);">
              <tr>
                <td style="padding:28px 32px 8px 32px;">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <span style="display:inline-flex;width:40px;height:40px;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;background:#fff;">
                      <img src="https://cityofwhiteplains.org/logo-wp.png" alt="City of White Plains" style="width:100%;height:100%;object-fit:contain;padding:6px;" />
                    </span>
                    <div style="font-weight:700;font-size:16px;color:#111827;">CityOfWhitePlains.org</div>
                  </div>
                  <p style="margin:20px 0 8px 0;font-size:14px;color:#6b7280;">(Community Focused) Invitation</p>
                  <h1 style="margin:0 0 12px 0;font-size:22px;color:#111827;line-height:1.3;">Feature your business on CityOfWhitePlains.org</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 24px 32px;font-size:15px;line-height:1.6;color:#374151;">
                  <p style="margin:0 0 12px 0;">To the Business Community of White Plains,</p>
                  <p style="margin:0 0 12px 0;">We are thrilled to announce that <strong>cityofwhiteplains.org</strong> is officially live!</p>
                  <p style="margin:0 0 12px 0;">Our mission is to establish a comprehensive digital hub for our community—connecting White Plains residents, daily commuters, and visitors with the exceptional local services and shops that keep our city vibrant.</p>
                  <p style="margin:0 0 12px 0;">As a vital part of the local economy, we want to ensure your business is represented. We are inviting you to create a complimentary business listing on our new directory.</p>

                  <div style="margin:18px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
                    <p style="margin:0 0 8px 0;font-weight:700;color:#111827;">Why join the directory?</p>
                    <ul style="margin:0;padding-left:18px;color:#374151;">
                      <li style="margin-bottom:6px;"><strong>Expand Your Reach:</strong> Be found by locals and visitors specifically looking for White Plains services.</li>
                      <li style="margin-bottom:6px;"><strong>Zero Cost:</strong> This is a 100% free community resource designed to support local commerce.</li>
                      <li style="margin-bottom:0;"><strong>Build Trust:</strong> Joining a local, curated directory signals reliability to potential customers.</li>
                    </ul>
                  </div>

                  <p style="margin:0 0 8px 0;font-weight:700;color:#111827;">How to get listed:</p>
                  <ol style="margin:0 0 18px 0;padding-left:18px;color:#374151;">
                    <li style="margin-bottom:6px;">Click the button below to visit our registration page.</li>
                    <li style="margin-bottom:6px;">Upload your details (logo, hours, contact info, and description).</li>
                    <li style="margin-bottom:0;">Submit your listing for approval.</li>
                  </ol>

                  <div style="text-align:center;margin:24px 0;">
                    <a href="https://cityofwhiteplains.org/list-your-business" style="display:inline-block;background:#1c1f2a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">Create Your Free Listing</a>
                  </div>

                  <p style="margin:0 0 12px 0;">Please note: To maintain the integrity and quality of our directory for the public, all submissions are personally reviewed by our team. You will receive a notification once your listing has been approved and published to the live site.</p>
                  <p style="margin:0 0 16px 0;">Let’s work together to make it easier for White Plains to find you.</p>

                  <p style="margin:0 0 4px 0;">Best regards,</p>
                  <p style="margin:0 0 4px 0;">The Team at City of White Plains</p>
                  <p style="margin:0 0 0 0;"><a href="https://cityofwhiteplains.org" style="color:#4b5fc6;text-decoration:none;">cityofwhiteplains.org</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    `);
  };

  return (
    <section className="space-y-4 text-xs text-[#111827]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#111827]">Send email</h2>
          <p className="text-[11px] text-[#6B7280]">
            Uses your IONOS SMTP (BCC to all recipients so addresses stay private). Keep to small batches to avoid rate limits.
          </p>
        </div>
        {status === "sent" && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            Sent
          </span>
        )}
        {status === "error" && (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700">
            Error
          </span>
        )}
      </header>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <button
          type="button"
          onClick={applyBusinessOutreachTemplate}
          className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 font-semibold text-[#1C1F2A] shadow-sm hover:bg-[#F3F4F6]"
        >
          Use Business Listing Outreach template
        </button>
        <span className="text-[#6B7280]">Prefills subject/body and sets HTML.</span>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
          {error}
        </p>
      )}

      <form
        className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSend(recipients);
        }}
      >
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold text-[#374151]" htmlFor="email-to">
            Recipients (comma or newline separated)
          </label>
          <textarea
            id="email-to"
            rows={2}
            value={recipients}
            onChange={(e) => {
              resetStatus();
              setRecipients(e.target.value);
            }}
            placeholder="customer1@example.com, customer2@example.com"
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
          />
          <p className="text-[10px] text-[#9CA3AF]">
            We&apos;ll send as BCC to keep addresses private. Max 200 per send.
          </p>
        </div>

        <div className="grid gap-2">
          <label className="text-[11px] font-semibold text-[#374151]" htmlFor="email-subject">
            Subject
          </label>
          <input
            id="email-subject"
            value={subject}
            onChange={(e) => {
              resetStatus();
              setSubject(e.target.value);
            }}
            className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
            placeholder="Example: Service update for your listing"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-[11px] font-semibold text-[#374151]" htmlFor="email-body">
            Body
          </label>
          <textarea
            id="email-body"
            rows={8}
            value={body}
            onChange={(e) => {
              resetStatus();
              setBody(e.target.value);
            }}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
            placeholder="Write your message..."
          />
          <label className="flex items-center gap-2 text-[11px] text-[#4B5563]">
            <input
              type="checkbox"
              checked={isHtml}
              onChange={(e) => {
                resetStatus();
                setIsHtml(e.target.checked);
              }}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#4B5FC6] focus:ring-[#4B5FC6]"
            />
            Send as HTML (otherwise plain text)
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send email"}
          </button>
          <div className="flex items-center gap-2">
            <input
              value={testRecipient}
              onChange={(e) => {
                resetStatus();
                setTestRecipient(e.target.value);
              }}
              placeholder="Test email (optional)"
              className="w-52 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
            />
            <button
              type="button"
              onClick={handleTestSend}
              disabled={sending}
              className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6] disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send test"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

/* --------------------- BUSINESS SUBMISSIONS TAB --------------------- */

type BusinessTabProps = {
  submissions: BusinessSubmission[];
  adminListings: AdminBusinessListing[];
  onCreateListing: (listing: Omit<AdminBusinessListing, "id">) => void;
  onUpdateSubmissionStatus: (
    id: string,
    status: BusinessSubmissionStatus
  ) => Promise<void>;
  submissionUpdatingId: string | null;
};

function BusinessTab({
  submissions,
  adminListings,
  onCreateListing,
  onUpdateSubmissionStatus,
  submissionUpdatingId,
}: BusinessTabProps) {
  const [view, setView] = useState<"submissions" | "create">("submissions");
  const [previewSubmission, setPreviewSubmission] =
    useState<BusinessSubmission | null>(null);

  // Form state for creating a listing
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Eat & Drink");
  const [priceLevel, setPriceLevel] = useState("2");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [audience, setAudience] = useState<string[]>([]);
  const [tags, setTags] = useState("");

  // 🔹 Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [saving, setSaving] = useState(false);

  const audienceOptions = [
    { id: "visitors", label: "Visitors" },
    { id: "locals", label: "Locals / residents" },
    { id: "business-owners", label: "Business owners" },
    { id: "court-day", label: "Court day friendly" },
    { id: "family", label: "Family / kids" },
  ];

  function toggleAudience(id: string) {
    setAudience((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleImageFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  async function handleCreateListingSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!businessName.trim() || !address.trim()) return;
    setSaving(true);

    const parsedTags =
      tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean) || [];

    // 🔹 Prefer uploaded preview, fall back to pasted URL
    const finalImageUrl = imagePreview || imageUrlInput || undefined;

    const baseSlug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = baseSlug || `listing-${Date.now()}`;

    const listing: Omit<AdminBusinessListing, "id"> = {
      slug,
      businessName: businessName.trim(),
      category: category.trim(),
      priceLevel: Number(priceLevel) || 2,
      address: address.trim(),
      phone: phone.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      audience,
      tags: parsedTags,
      imageUrl: finalImageUrl,
      isPublished: true,
    };

    await onCreateListing(listing);

    console.log("New admin-created business listing:", listing);

    // reset form
    setBusinessName("");
    setCategory("Eat & Drink");
    setPriceLevel("2");
    setAddress("");
    setPhone("");
    setWebsiteUrl("");
    setAudience([]);
    setTags("");
    setImageFile(null);
    setImagePreview(null);
    setImageUrlInput("");
    setSaving(false);
    setView("submissions");
  }

  return (
    <section className="space-y-4 text-xs text-[#111827]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#111827]">
            Business submissions & admin listings
          </h2>
          <p className="text-[11px] text-[#6B7280]">
            Review public submissions and seed official listings directly from the
            admin side. Later, approved listings can sync into the public directory.
          </p>
        </div>

        <div className="flex gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setView("submissions")}
            className={[
              "rounded-full border px-3 py-1.5",
              view === "submissions"
                ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            Submissions & listings
          </button>
          <button
            type="button"
            onClick={() => setView("create")}
            className={[
              "rounded-full border px-3 py-1.5",
              view === "create"
                ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            Create listing
          </button>
        </div>
      </header>

      {view === "submissions" && (
        <>
          {/* Public submissions table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
            <table className="min-w-full border-separate border-spacing-y-1 text-left text-[11px]">
              <thead className="text-[#6B7280]">
                <tr>
                  <th className="px-4 py-2">Business</th>
                  <th className="px-4 py-2">Mode</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Submitted</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-2 font-semibold text-[#111827]">
                      {sub.businessName}
                    </td>
                    <td className="px-4 py-2 text-[#4B5563]">
                      {sub.mode === "claim" ? "Claim" : "New"}
                    </td>
                    <td className="px-4 py-2 text-[#4B5563]">{sub.category}</td>
                    <td className="px-4 py-2 text-[#9CA3AF]">
                      {new Date(sub.submittedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] capitalize",
                          sub.status === "pending" &&
                            "bg-amber-50 text-amber-700 border border-amber-200",
                          sub.status === "approved" &&
                            "bg-emerald-50 text-emerald-700 border border-emerald-200",
                          sub.status === "rejected" &&
                            "bg-rose-50 text-rose-700 border border-rose-200",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#6B7280]">
                      {sub.contactName}
                      <br />
                      <span className="text-[10px]">{sub.contactEmail}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateSubmissionStatus(sub.id, "approved")}
                          disabled={submissionUpdatingId === sub.id}
                          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        >
                          {submissionUpdatingId === sub.id ? "Saving…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateSubmissionStatus(sub.id, "rejected")}
                          disabled={submissionUpdatingId === sub.id}
                          className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                        >
                          {submissionUpdatingId === sub.id ? "Saving…" : "Reject"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewSubmission(sub)}
                          className="inline-flex items-center rounded-full border border-[#D1D5DB] px-3 py-1 text-[10px] text-[#4B5563] hover:bg-[#F3F4F6]"
                        >
                          Preview
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

            {submissions.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-4 text-center text-[11px] text-[#6B7280]"
                >
                  No submissions yet. When the form receives entries, they&apos;ll
                  appear here for review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

          {/* Admin-created listings preview */}
          <section className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-[#111827]">
              Admin-created listings (preview only)
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              These are listings you&apos;ve created from the admin panel. Later they
              can sync directly into the public directory table.
            </p>

            {adminListings.length === 0 && (
              <p className="text-[11px] text-[#9CA3AF]">
                No admin-created listings yet. Use the &quot;Create listing&quot; view
                to add one.
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {adminListings.map((b) => (
                <article
                  key={b.id}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-3 text-[11px]"
                >
                  {b.imageUrl && (
                    <div className="mb-2 overflow-hidden rounded-xl">
                      <img
                        src={b.imageUrl}
                        alt={b.businessName}
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  )}
                  <h4 className="text-[12px] font-semibold text-[#111827]">
                    {b.businessName}
                  </h4>
                  <p className="text-[10px] text-[#6B7280]">
                    {b.category} ·{" "}
                    {"$".repeat(b.priceLevel).padEnd(4, "·")}
                  </p>
                  <p className="mt-1 text-[10px] text-[#4B5563]">{b.address}</p>
                  {b.phone && (
                    <p className="mt-1 text-[10px] text-[#4B5563]">{b.phone}</p>
                  )}
                  {b.websiteUrl && (
                    <a
                      href={b.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-[10px] text-[#2563EB] hover:underline"
                    >
                      Visit website →
                    </a>
                  )}
                  {b.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {b.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] text-[#6B7280]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {previewSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-2xl text-xs text-[#111827]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">
                  Submission preview
                </p>
                <h3 className="text-sm font-semibold text-[#111827]">
                  {previewSubmission.businessName}
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  {previewSubmission.category} · {previewSubmission.mode === "claim" ? "Claim" : "New"} listing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSubmission(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <div className="mt-3 space-y-2 rounded-xl bg-[#F9FAFB] p-3">
              <p className="text-[11px] text-[#4B5563]">
                Submitted:{" "}
                {new Date(previewSubmission.submittedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-[11px] text-[#4B5563]">
                Status:{" "}
                <span className="font-semibold capitalize">
                  {previewSubmission.status}
                </span>
              </p>
              {previewSubmission.shortDescription && (
                <p className="text-[11px] text-[#4B5563]">
                  {previewSubmission.shortDescription}
                </p>
              )}
              {previewSubmission.address && (
                <p className="text-[11px] text-[#4B5563]">
                  {previewSubmission.address}
                </p>
              )}
              {(previewSubmission.phone || previewSubmission.websiteUrl) && (
                <p className="text-[11px] text-[#4B5563]">
                  {previewSubmission.phone || "No phone"} ·{" "}
                  {previewSubmission.websiteUrl ? (
                    <a
                      href={previewSubmission.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#4B5FC6] underline"
                    >
                      Website
                    </a>
                  ) : (
                    "No website"
                  )}
                </p>
              )}
              {(previewSubmission.audience?.length || previewSubmission.tags?.length) && (
                <p className="text-[11px] text-[#4B5563]">
                  {previewSubmission.audience?.length
                    ? `Audience: ${previewSubmission.audience.join(", ")}`
                    : null}
                  {previewSubmission.audience?.length && previewSubmission.tags?.length
                    ? " • "
                    : ""}
                  {previewSubmission.tags?.length
                    ? `Tags: ${previewSubmission.tags.join(", ")}`
                    : null}
                </p>
              )}
              {previewSubmission.notes && (
                <p className="text-[11px] text-[#4B5563]">
                  Notes: {previewSubmission.notes}
                </p>
              )}
              <p className="text-[11px] text-[#4B5563]">
                Contact: {previewSubmission.contactName} · {previewSubmission.contactEmail}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateSubmissionStatus(previewSubmission.id, "approved");
                  setPreviewSubmission(null);
                }}
                className="inline-flex items-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black"
              >
                Approve & publish
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateSubmissionStatus(previewSubmission.id, "rejected");
                  setPreviewSubmission(null);
                }}
                className="inline-flex items-center rounded-full border border-[#E5E7EB] px-4 py-2 text-[11px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "create" && (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-xs">
          <h3 className="text-sm font-semibold text-[#111827]">
            Create new business listing
          </h3>
          <p className="mt-1 text-[11px] text-[#6B7280]">
            Use this for seeding or correcting official listings directly from the
            admin side. Later, this will write into your directory database and
            appear on the public Business page.
          </p>

          <form
            onSubmit={handleCreateListingSubmit}
            className="mt-4 space-y-4"
          >
            {/* Name + category + price */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1 md:col-span-1">
                <label
                  htmlFor="adminBusinessName"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Business name
                </label>
                <input
                  id="adminBusinessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Example: Calm Corner Coffee"
                />
              </div>

              <div className="space-y-1 md:col-span-1">
                <label
                  htmlFor="adminBusinessCategory"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Category
                </label>
                <input
                  id="adminBusinessCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Eat & Drink, Services, etc."
                />
              </div>

              <div className="space-y-1 md:col-span-1">
                <label
                  htmlFor="adminBusinessPrice"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Price range
                </label>
                <select
                  id="adminBusinessPrice"
                  value={priceLevel}
                  onChange={(e) => setPriceLevel(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                >
                  <option value="1">$ · Budget</option>
                  <option value="2">$$ · Moderate</option>
                  <option value="3">$$$ · Higher-end</option>
                  <option value="4">$$$$ · Premium</option>
                </select>
              </div>
            </div>

            {/* Address, phone, website */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1 md:col-span-2">
                <label
                  htmlFor="adminBusinessAddress"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Address
                </label>
                <input
                  id="adminBusinessAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="123 Example St, White Plains, NY 10601"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="adminBusinessPhone"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Phone (optional)
                </label>
                <input
                  id="adminBusinessPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="(914) 555-0123"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="adminBusinessWebsite"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Website (optional)
              </label>
              <input
                id="adminBusinessWebsite"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="https://example.com"
              />
            </div>

            {/* Image upload + URL */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="adminBusinessImageFile"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Business image (upload)
                </label>
                <input
                  id="adminBusinessImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-[11px] text-[#4B5563]"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  For now this stays in the browser and uses a preview URL. Later
                  we&apos;ll connect it to Cloudinary or Supabase Storage.
                </p>
                {imagePreview && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="adminBusinessImageUrl"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Business image URL (optional)
                </label>
                <input
                  id="adminBusinessImageUrl"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://…"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  If you paste a URL and also upload a file, the uploaded preview
                  takes priority for now.
                </p>
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-1">
              <span className="block text-[11px] font-medium text-[#374151]">
                Especially good for
              </span>
              <div className="mt-1 flex flex-wrap gap-2">
                {audienceOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    <input
                      type="checkbox"
                      checked={audience.includes(opt.id)}
                      onChange={() => toggleAudience(opt.id)}
                      className="h-3 w-3 border-[#D1D5DB] text-[#4B5FC6] focus:ring-0"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label
                htmlFor="adminBusinessTags"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Tags (optional)
              </label>
              <input
                id="adminBusinessTags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="court day friendly, walkable, kid-friendly"
              />
              <p className="text-[10px] text-[#9CA3AF]">
                Separate tags with commas. These help power guide filters later.
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
              <p className="text-[10px] text-[#9CA3AF]">
                This creates an admin-only listing preview for now. Later, we&apos;ll
                connect it to the public directory table and &quot;Featured&quot;
                sections on the site.
              </p>
              <button
                type="submit"
                disabled={saving || !businessName.trim() || !address.trim()}
                className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-5 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving…" : "Save listing to admin"}
              </button>
            </div>
          </form>
        </section>
      )}
    </section>
  );
}

// Make sure you have this import near the top of the file:
// import { supabase } from "@/app/lib/supabaseClient";

/**
 * Given a base slug, returns a unique slug by checking the blog_posts table.
 * If "calmer-court-days-in-white-plains" exists, it will try
 * "calmer-court-days-in-white-plains-2", "-3", etc.
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const base = baseSlug || `post-${Date.now()}`;
  let candidate = base;
  let counter = 1;

  // small safety limit so we don't loop forever
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", candidate)
      .limit(1);

    if (error) {
      console.error("[WP Blog] Error checking slug uniqueness:", error.message);
      // if we can't check for some reason, just use the current candidate
      return candidate;
    }

    // no row found → slug is free
    if (!data || data.length === 0) {
      return candidate;
    }

    // slug taken → try with increment
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  // extreme fallback with timestamp
  return `${base}-${Date.now()}`;
}

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

/**
 * Minimal rich-text editor using contentEditable + execCommand (works without extra deps).
 * Gives you bold/italic/underline, lists, links, quotes, and inline/ block code.
 */
function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState("#111827");
  const [lineHeight, setLineHeight] = useState("1.6");
  const [fontSize, setFontSize] = useState("14px");
  const lastRangeRef = useRef<Range | null>(null);

  // Keep DOM in sync when we load an existing post for editing.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value === editor.innerHTML) return;
    editor.innerHTML = value || "";
  }, [value]);

  function emitChange() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    lastRangeRef.current = selection.getRangeAt(0);
  }

  function restoreSelection() {
    const selection = window.getSelection();
    const range = lastRangeRef.current;
    if (!selection || !range) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function focusEditor() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
  }

  function runCommand(command: string, arg?: string) {
    restoreSelection();
    focusEditor();
    restoreSelection();
    document.execCommand(command, false, arg);
    emitChange();
  }

  function insertLink() {
    const url = window.prompt("Enter URL (https://…)", "https://");
    if (!url) return;
    runCommand("createLink", url);
  }

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newColor = e.target.value || "#111827";
    setColor(newColor);
    runCommand("foreColor", newColor);
  }

  function wrapSelection(tag: "code" | "pre" | "blockquote") {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const wrapper = document.createElement(tag);
    try {
      range.surroundContents(wrapper);
    } catch (err) {
      // If selection is complex, fall back to execCommand formatting.
      if (tag === "blockquote") runCommand("formatBlock", "blockquote");
      if (tag === "pre") runCommand("formatBlock", "pre");
      if (tag === "code") runCommand("insertHTML", `<code>${selection.toString()}</code>`);
      return;
    }
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.addRange(newRange);
    emitChange();
  }

  function applyLineHeight(value: string) {
    setLineHeight(value);
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const startNode = range?.startContainer;
    const element: HTMLElement | null =
      startNode instanceof HTMLElement
        ? startNode
        : startNode?.parentElement || null;

    const block = element?.closest(
      "p,div,li,h1,h2,h3,h4,h5,h6"
    ) as HTMLElement | null;

    if (block) {
      block.style.lineHeight = value;
    } else if (editorRef.current) {
      editorRef.current.style.lineHeight = value;
    }
  }

  function applyFontSize(value: string) {
    setFontSize(value);
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range) return;

    const span = document.createElement("span");
    span.style.fontSize = value;
    try {
      range.surroundContents(span);
    } catch {
      // Fallback: insert inline styled span with selected text
      const text = selection?.toString() || "";
      if (text) {
        runCommand(
          "insertHTML",
          `<span style="font-size:${value}">${text}</span>`
        );
      }
      return;
    }
    emitChange();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
        <ToolbarButton label="B" onClick={() => runCommand("bold")} />
        <ToolbarButton label="I" onClick={() => runCommand("italic")} />
        <ToolbarButton label="U" onClick={() => runCommand("underline")} />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton label="• List" onClick={() => runCommand("insertUnorderedList")} />
        <ToolbarButton label="1. List" onClick={() => runCommand("insertOrderedList")} />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton label="Quote" onClick={() => wrapSelection("blockquote")} />
        <ToolbarButton label="Link" onClick={insertLink} />
        <ToolbarButton label="Code" onClick={() => wrapSelection("code")} />
        <ToolbarButton label="Code block" onClick={() => wrapSelection("pre")} />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton label="H1" onClick={() => runCommand("formatBlock", "h1")} />
        <ToolbarButton label="H2" onClick={() => runCommand("formatBlock", "h2")} />
        <ToolbarButton label="H3" onClick={() => runCommand("formatBlock", "h3")} />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton label="Indent" onClick={() => runCommand("indent")} />
        <ToolbarButton label="Outdent" onClick={() => runCommand("outdent")} />
        <ToolbarButton label="Align L" onClick={() => runCommand("justifyLeft")} />
        <ToolbarButton label="Align C" onClick={() => runCommand("justifyCenter")} />
        <ToolbarButton label="Align R" onClick={() => runCommand("justifyRight")} />
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <label className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-semibold text-[#4B5563]">
          Font size
          <select
            value={fontSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="rounded-md border border-[#D1D5DB] bg-white px-2 py-1 text-[10px] text-[#111827] outline-none"
          >
            <option value="13px">Small</option>
            <option value="14px">Normal</option>
            <option value="16px">Medium</option>
            <option value="18px">Large</option>
            <option value="20px">XL</option>
          </select>
        </label>
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <label className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-semibold text-[#4B5563]">
          Line spacing
          <select
            value={lineHeight}
            onChange={(e) => applyLineHeight(e.target.value)}
            className="rounded-md border border-[#D1D5DB] bg-white px-2 py-1 text-[10px] text-[#111827] outline-none"
          >
            <option value="1.4">Tight</option>
            <option value="1.6">Normal</option>
            <option value="1.8">Relaxed</option>
          </select>
        </label>
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <label className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-semibold text-[#4B5563]">
          Color
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="h-5 w-8 cursor-pointer border border-[#D1D5DB] bg-white p-0"
            aria-label="Pick text color"
          />
        </label>
        <div className="h-5 w-px bg-[#E5E7EB]" />
        <ToolbarButton label="Clear" onClick={() => runCommand("removeFormat")} />
      </div>

      <div
        ref={editorRef}
        className="min-h-[220px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] leading-relaxed text-[#111827] outline-none focus:border-[#4B5FC6]"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={emitChange}
        onBlur={emitChange}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onClick={saveSelection}
        data-placeholder={placeholder}
      />
      <p className="text-[10px] text-[#9CA3AF]">
        Use the toolbar for bold/italic/underline, lists, quotes, links, and inline or
        block code. You can still paste plain text or HTML; we store the raw HTML value.
      </p>
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
};

function ToolbarButton({ label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()} // keep selection in editor
      className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[10px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
    >
      {label}
    </button>
  );
}

/* ----------------------- BLOG (WP INSIDER) TAB ---------------------- */

type BlogTabProps = {
  posts: BlogPostAdminSummary[];
  onCreatePost: (
    post: BlogPostAdminSummary,
    options?: { previousSlug?: string | null }
  ) => Promise<void>;
  onSyncPost: (post: BlogPostAdminSummary) => void;
  onDeletePost: (slug: string) => Promise<boolean>;
};

function BlogTab({ posts, onCreatePost, onSyncPost, onDeletePost }: BlogTabProps) {
  const [view, setView] = useState<"list" | "create">("list");
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiAudience, setAiAudience] = useState("Visitors and locals");
  const [aiTone, setAiTone] = useState("Calm, practical, visitor-first");
  const [aiCTA, setAiCTA] = useState(
    "Invite readers to plan or bookmark a White Plains visit."
  );
  const [aiSourceUrl, setAiSourceUrl] = useState("");
  const [aiSourceNotes, setAiSourceNotes] = useState("");
  const [aiCadence, setAiCadence] = useState<
    "once" | "daily" | "weekly" | "monthly"
  >("weekly");
  const [aiLength, setAiLength] = useState("800");
  const [aiStatus, setAiStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [aiMessage, setAiMessage] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Which post (if any) are we editing?
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // Form state for creating / editing a post
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Guide");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");

  // Full post content
  const [body, setBody] = useState("");
  const [adEmbedCode, setAdEmbedCode] = useState("");

  // Hero image upload state
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingSlug(null);
    setTitle("");
    setSlug("");
    setCategory("Guide");
    setStatus("draft");
    setPublishedAt("");
    setReadingTime("");
    setMetaTitle("");
    setMetaDescription("");
    setHeroImageUrl("");
    setBody("");
    setAdEmbedCode("");
    setHeroFile(null);
    setHeroPreview(null);
  }

  function handleGenerateSlugFromTitle(value: string) {
    setTitle(value);
    // Only auto-generate slug when creating a *new* post or when slug is empty
    if (!slug && !editingSlug) {
      const base = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(base);
    }
  }

  function handleHeroFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) {
      setHeroFile(null);
      setHeroPreview(null);
      return;
    }
    setHeroFile(file);
    const url = URL.createObjectURL(file);
    setHeroPreview(url);
  }

  function startNewPost() {
    resetForm();
    setView("create");
  }

  async function handleGenerateAIDraft(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setAiStatus("loading");
    setAiMessage("");

    try {
      const res = await fetch("/api/admin/ai-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          keywords: aiKeywords.trim(),
          audience: aiAudience.trim(),
          tone: aiTone.trim(),
          callToAction: aiCTA.trim(),
          length: Number(aiLength) || undefined,
          cadence: aiCadence,
          sourceUrl: aiSourceUrl.trim(),
          sourceNotes: aiSourceNotes.trim(),
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || "Unable to generate draft.");
      }

      if (payload?.post) {
        onSyncPost(payload.post as BlogPostAdminSummary);
        setView("list");
        setAiStatus("success");
        setAiMessage(
          `Draft saved as ${payload.post.slug}. Review and publish when ready.`
        );
      } else {
        setAiStatus("error");
        setAiMessage("Draft generated, but response was missing post data.");
      }
    } catch (err: any) {
      console.error("[AI Draft] Unable to generate:", err);
      setAiStatus("error");
      setAiMessage(err?.message || "Unable to generate draft.");
    }
  }

  function startEditing(post: BlogPostAdminSummary) {
    // Pre-fill the form with the existing post values
    setEditingSlug(post.slug);
    setView("create");

    setTitle(post.title || "");
    setSlug(post.slug || "");
    setCategory(post.category || "Guide");
    setStatus(post.status || "draft");
    setPublishedAt(post.publishedAt || "");
    setReadingTime(post.readingTime || "");
    setMetaTitle(post.metaTitle || "");
    setMetaDescription(post.metaDescription || "");
    setHeroImageUrl(post.heroImageUrl || "");

    setBody(post.body || "");
    setAdEmbedCode(post.adEmbedCode || "");

    setHeroFile(null);
    setHeroPreview(post.heroImageUrl || null);
  }

  async function handleCreateSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
  
    // If editing, keep the current slug unless user changes it manually
    const baseSlug =
      slug ||
      editingSlug ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
  
    const finalSlug = baseSlug || `post-${Date.now()}`;
  
    // Prefer a real URL; avoid saving a temporary blob URL from the browser.
    const typedHeroUrl =
      heroImageUrl && !heroImageUrl.startsWith("blob:")
        ? heroImageUrl
        : undefined;
    const previewHeroUrl =
      heroPreview && !heroPreview.startsWith("blob:")
        ? heroPreview
        : undefined;
    const finalHeroUrl = typedHeroUrl || previewHeroUrl || undefined;
  
    const newPost: BlogPostAdminSummary = {
      slug: finalSlug,
      title: title.trim(),
      category: category.trim() || "Guide",
      status,
      publishedAt: publishedAt || undefined,
      readingTime: readingTime || undefined,
      metaTitle: metaTitle || title.trim(),
      metaDescription: metaDescription || undefined,
      heroImageUrl: finalHeroUrl,
      body: body || undefined,
      adEmbedCode: adEmbedCode || undefined,
    };
  
    // 🔹 Parent will do Supabase update/upsert + update local state
    await onCreatePost(newPost, { previousSlug: editingSlug });
  
    console.log(
      editingSlug ? "Updated blog post payload:" : "Created blog post payload:",
      newPost
    );
  
    setSaving(false);
    resetForm();
    setView("list");
  }

  async function handleDeletePostLocal(slug: string) {
    const confirmDelete = window.confirm(
      "Delete this blog post from Supabase? This cannot be undone."
    );
    if (!confirmDelete) return;
    setDeletingSlug(slug);
    const success = await onDeletePost(slug);
    if (success && editingSlug === slug) {
      resetForm();
      setView("list");
    }
    setDeletingSlug(null);
  }

  return (
    <section className="space-y-4 text-xs text-[#111827]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#111827]">
            WP Insider Blog
          </h2>
          <p className="text-[11px] text-[#6B7280]">
            Manage the content that powers the visitor-facing blog. Each post has a
            slug, meta title, meta description, hero image, full HTML-capable body,
            and optional ad/embed code for monetization.
          </p>
        </div>

        <div className="flex gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setView("list");
              resetForm();
            }}
            className={[
              "rounded-full border px-3 py-1.5",
              view === "list"
                ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            All posts
          </button>
          <button
            type="button"
            onClick={startNewPost}
            className={[
              "rounded-full border px-3 py-1.5",
              view === "create" && !editingSlug
                ? "border-[#4B5FC6] bg-[#4B5FC6] text-white"
                : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            Create new post
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">
              AI draft generator (saves to WP Insider Blog as draft)
            </h3>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Enter the topic, keywords, and cadence. We&apos;ll create an SEO-friendly draft,
              keep it in <span className="font-semibold">draft</span>, and add metadata for the blog detail page.
            </p>
          </div>
          {aiStatus === "success" && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
              Draft created
            </span>
          )}
          {aiStatus === "error" && (
            <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700">
              Unable to generate
            </span>
          )}
        </div>

        <form
          onSubmit={handleGenerateAIDraft}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <div className="space-y-2">
            <div className="space-y-1">
              <label
                htmlFor="aiTopic"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Topic / working title
              </label>
              <input
                id="aiTopic"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                required
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="Example: Calmer court days in White Plains"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="aiKeywords"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Keywords (comma separated)
              </label>
              <input
                id="aiKeywords"
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="White Plains court tips, parking, quick visit"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="aiAudience"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Target audience
              </label>
              <input
                id="aiAudience"
                value={aiAudience}
                onChange={(e) => setAiAudience(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="Visitors here for court, families, no-car trips"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <label
                htmlFor="aiTone"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Tone &amp; voice
              </label>
              <input
                id="aiTone"
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="Calm, practical, non-touristy"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="aiCTA"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Call to action
              </label>
              <input
                id="aiCTA"
                value={aiCTA}
                onChange={(e) => setAiCTA(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="Plan the visit, bookmark, or open a related guide"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="aiCadence"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Frequency
                </label>
                <select
                  id="aiCadence"
                  value={aiCadence}
                  onChange={(e) =>
                    setAiCadence(e.target.value as typeof aiCadence)
                  }
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                >
                  <option value="once">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-[10px] text-[#9CA3AF]">
                  Saved note in the draft so you can schedule runs later.
                </p>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="aiLength"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Desired length (words)
                </label>
                <input
                  id="aiLength"
                  type="number"
                  min={300}
                  value={aiLength}
                  onChange={(e) => setAiLength(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="800"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  Used to estimate reading time and structure the outline.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="aiSourceUrl"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Official/source URL (optional)
                </label>
                <input
                  id="aiSourceUrl"
                  value={aiSourceUrl}
                  onChange={(e) => setAiSourceUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="https://www.cityofwhiteplains.com/... (official source)"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  Link to an official city page or dataset to cite in the draft.
                </p>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="aiSourceNotes"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Source notes / facts to include
                </label>
                <textarea
                  id="aiSourceNotes"
                  value={aiSourceNotes}
                  onChange={(e) => setAiSourceNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Key facts from the official source to ground the draft."
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] pt-3">
            <p className="text-[10px] text-[#9CA3AF]">
              Generates a structured outline + SEO meta, then saves to Supabase as a
              <span className="ml-1 font-semibold text-[#111827]">draft</span>. Review facts and links before publishing.
            </p>
            <div className="flex flex-wrap gap-2">
              {aiMessage && (
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[10px] text-[#4B5563]">
                  {aiMessage}
                </span>
              )}
              <button
                type="submit"
                disabled={aiStatus === "loading" || !aiTopic.trim()}
                className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-4 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {aiStatus === "loading" ? "Generating…" : "Generate draft"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {view === "list" && (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
          <table className="min-w-full border-separate border-spacing-y-1 text-left text-[11px]">
            <thead className="text-[#6B7280]">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Published</th>
                <th className="px-4 py-2">Reading time</th>
                <th className="px-4 py-2">Public link</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const dateLabel = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr
                    key={post.slug}
                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-2 font-semibold text-[#111827]">
                      {post.title}
                    </td>
                    <td className="px-4 py-2 text-[#4B5563]">
                      {post.category}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] capitalize",
                          post.status === "draft"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        ].join(" ")}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#9CA3AF]">{dateLabel}</td>
                    <td className="px-4 py-2 text-[#9CA3AF]">
                      {post.readingTime || "—"}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#2563EB] hover:underline"
                      >
                        View on site →
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(post)}
                          className="inline-flex items-center rounded-full border border-[#D1D5DB] px-3 py-1 text-[10px] text-[#4B5563] hover:bg-[#F3F4F6]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePostLocal(post.slug)}
                          disabled={deletingSlug === post.slug}
                          className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                        >
                          {deletingSlug === post.slug ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-center text-[11px] text-[#6B7280]"
                  >
                    No posts found. Once you have entries in{" "}
                    <code className="rounded bg-[#F3F4F6] px-1">
                      blog_posts
                    </code>
                    , they&apos;ll show here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "create" && (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-xs">
          <h3 className="text-sm font-semibold text-[#111827]">
            {editingSlug ? "Edit WP Insider Blog post" : "Create new WP Insider Blog post"}
          </h3>
          {editingSlug && (
            <p className="mt-1 text-[11px] text-[#6B7280]">
              You are editing{" "}
              <span className="font-semibold">{title || editingSlug}</span>. Changes
              will update the existing post with slug{" "}
              <code className="rounded bg-[#F3F4F6] px-1">{editingSlug}</code>.
            </p>
          )}
          {!editingSlug && (
            <p className="mt-1 text-[11px] text-[#6B7280]">
              This doesn&apos;t publish directly to the live site yet—it prepares a
              clean payload you can later send to your API. Each field supports good
              SEO, hero images, full HTML-capable body content, and optional
              ad/embed code for monetization.
            </p>
          )}

          <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
            {/* Title + slug */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="postTitle"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Post title
                </label>
                <input
                  id="postTitle"
                  value={title}
                  onChange={(e) => handleGenerateSlugFromTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Example: Calmer Court Days in White Plains"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="postSlug"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  URL slug
                </label>
                <input
                  id="postSlug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="calmer-court-days-in-white-plains"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  If left blank, we&apos;ll generate it from the title. This becomes
                  <span className="ml-1 font-mono text-[#4B5563]">
                    /blog/your-slug-here
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Category, status, reading time */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label
                  htmlFor="postCategory"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Category
                </label>
                <input
                  id="postCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="Guide, Food, Court day, No-car, Family, etc."
                />
              </div>

              <div className="space-y-1">
                <span className="block text-[11px] font-medium text-[#374151]">
                  Status
                </span>
                <div className="flex gap-3 pt-1">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-[#4B5563]">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === "draft"}
                      onChange={() => setStatus("draft")}
                      className="h-3 w-3 border-[#D1D5DB] text-[#4B5FC6] focus:ring-0"
                    />
                    Draft
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-[#4B5563]">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={status === "published"}
                      onChange={() => setStatus("published")}
                      className="h-3 w-3 border-[#D1D5DB] text-[#4B5FC6] focus:ring-0"
                    />
                    Published
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="postReadingTime"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Reading time (optional)
                </label>
                <input
                  id="postReadingTime"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="3 min read"
                />
              </div>
            </div>

            {/* Published date + hero image upload */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="postPublishedAt"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Published date (optional)
                </label>
                <input
                  id="postPublishedAt"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  Helps keep things ordered by the real publish date. You can leave it
                  blank for now.
                </p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="postHeroImageFile"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Hero image (upload)
                </label>
                <input
                  id="postHeroImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFileChange}
                  className="w-full text-[11px] text-[#4B5563]"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  For now this stays in the browser as a preview URL. Later we&apos;ll
                  connect this to Cloudinary or Supabase Storage.
                </p>
                {heroPreview && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                    <img
                      src={heroPreview}
                      alt="Hero preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Hero image URL */}
            <div className="space-y-1">
              <label
                htmlFor="postHeroImageUrl"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Hero image URL (optional)
              </label>
              <input
                id="postHeroImageUrl"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                placeholder="https://…"
              />
              <p className="text-[10px] text-[#9CA3AF]">
                If you both upload and paste a URL, the uploaded preview will be used
                for now.
              </p>
            </div>

            {/* Post body content */}
            <div className="space-y-1">
              <label
                htmlFor="postBody"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Post content (HTML / links allowed)
              </label>
              <RichTextEditor
                value={body}
                onChange={setBody}
                placeholder={`Type or paste content. Use the toolbar for formatting, or paste HTML/code snippets directly.

Example:
<p>Welcome to our calm guide to White Plains.</p>
<p>Grab a hotel deal here: <a href="https://affiliate-link.com" target="_blank" rel="noopener noreferrer">Best rates</a></p>`}
              />
            </div>

            {/* Ad / embed code */}
            <div className="space-y-1">
              <label
                htmlFor="postAdEmbedCode"
                className="block text-[11px] font-medium text-[#374151]"
              >
                Ad / embed code (AdSense, affiliate widgets, etc.)
              </label>
              <textarea
                id="postAdEmbedCode"
                value={adEmbedCode}
                onChange={(e) => setAdEmbedCode(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#0B1020] px-3 py-2 font-mono text-[11px] text-[#E5E7EB] outline-none focus:border-[#4B5FC6]"
                placeholder={`Paste script tags or ad HTML here.

Example:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXX" data-ad-slot="YYYY" data-ad-format="auto"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
              />
              <p className="text-[10px] text-[#9CA3AF]">
                Stored as raw text for now. We won&apos;t execute or render this in
                the admin UI. Later you can inject this into specific ad slots on the
                public blog template.
              </p>
            </div>

            {/* Meta fields */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="postMetaTitle"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Meta title (SEO)
                </label>
                <input
                  id="postMetaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="What search engines should show as the title"
                />
                <p className="text-[10px] text-[#9CA3AF]">
                  If blank, the post title will be used.
                </p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="postMetaDescription"
                  className="block text-[11px] font-medium text-[#374151]"
                >
                  Meta description (SEO)
                </label>
                <textarea
                  id="postMetaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#111827] outline-none focus:border-[#4B5FC6]"
                  placeholder="1–2 sentences that describe the post to visitors in search results."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
              <p className="text-[10px] text-[#9CA3AF]">
                This UI is front-end only. The payload is sent back to the admin
                container, which handles saving via Supabase upsert. When you edit a
                post, its existing row is updated instead of creating a duplicate.
              </p>
              <button
                type="submit"
                disabled={saving || !title.trim() || !body.trim()}
                className="inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-5 py-2 text-[11px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? editingSlug
                    ? "Saving changes…"
                    : "Saving…"
                  : editingSlug
                  ? "Save changes"
                  : "Save post to admin list"}
              </button>
            </div>
          </form>
        </section>
      )}
    </section>
  );
}
