// app/api/admin/ai-blog/route.ts
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { supabase } from "@/app/lib/supabaseClient";
import type { BlogPostAdminSummary } from "@/app/types/blog";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1";
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

type AIDraftRequest = {
  topic: string;
  keywords?: string;
  audience?: string;
  tone?: string;
  callToAction?: string;
  length?: number; // desired word count
  cadence?: "once" | "daily" | "weekly" | "monthly";
  sourceUrl?: string;
  sourceNotes?: string;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80";

const client = supabaseAdmin || supabase;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureUniqueSlug(base: string): Promise<string> {
  const root = base || `post-${Date.now()}`;
  let candidate = root;
  for (let i = 0; i < 10; i++) {
    const { data, error } = await client
      .from("blog_posts")
      .select("slug")
      .eq("slug", candidate)
      .limit(1);

    if (error) {
      console.warn("[AI Blog] Unable to confirm slug uniqueness:", error.message);
      return candidate;
    }

    if (!data || data.length === 0) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now()}`;
}

function buildOpenAIPrompt({
  topic,
  keywords,
  audience,
  tone,
  callToAction,
  length,
  cadence,
  sourceUrl,
  sourceNotes,
}: AIDraftRequest): string {
  const keywordList =
    keywords && keywords.trim()
      ? keywords
      : "White Plains, NY guide; calm visitor tips; WP Insider Blog";
  const sourceBlock = sourceUrl
    ? `Use and cite this official/source URL once: ${sourceUrl}`
    : "If you reference any official sources, cite them once.";
  const sourceNotesBlock = sourceNotes
    ? `Key facts to weave in: ${sourceNotes}`
    : "";

  return `
Write a locally-grounded, calm, practical WP Insider Blog post for CityOfWhitePlains.org.
Topic: "${topic}"
Audience: ${audience || "visitors and locals planning time in White Plains"}
Tone: ${tone || "calm, human, visitor-first, non-touristy"}
Desired length: ~${length || 800} words
Keywords to weave in naturally: ${keywordList}
Cadence note: ${cadence || "once"}
Call to action: ${callToAction || "Invite the reader to plan a simple next step in White Plains."}
${sourceBlock}
${sourceNotesBlock}

Output strict HTML only (no code fences, no Markdown), using:
- <h1> for the title once, <h2>/<h3> for sections
- <p> paragraphs with concrete details, addresses/landmarks when relevant
- <ul>/<ol> for checklists or steps
- An FAQ section with 3–4 concise Q&As
- A short CTA section
SEO principles: lead with a clear intro, include scannable headings, natural keyword usage (no stuffing), short paragraphs, and answer likely search intent. Apply E-E-A-T (experience, expertise, authoritativeness, trustworthiness) by citing local specifics and practical steps. Avoid puffery. Be specific to White Plains and prioritize practical tips people can act on today. Keep HTML clean and valid.
`;
}

type OpenAIChatResponse = {
  choices?: Array<{
    message?: { content?: string | null } | null;
  }>;
};

async function generateBodyWithOpenAI(input: AIDraftRequest): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "";
  }

  const prompt = buildOpenAIPrompt(input);
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You write concise, human, locally-grounded guides for White Plains visitors and locals. Keep it calm, specific, and useful.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    console.error("[AI Blog] OpenAI response error:", res.status, errText);
    return "";
  }

  const data = (await res.json().catch(() => ({}))) as OpenAIChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || "";
}

function buildMeta(topic: string, keywords?: string, audience?: string) {
  const trimmedKeywords = (keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const metaTitle = `${topic} | WP Insider Blog`;
  const keywordText =
    trimmedKeywords.length > 0
      ? `${trimmedKeywords.slice(0, 3).join(", ")} in White Plains`
      : "Calm, practical guide for White Plains";
  const audienceText = audience?.trim()
    ? ` for ${audience.trim()}`
    : "";
  const metaDescription = `${topic}${audienceText}: ${keywordText}. Helpful, SEO-friendly local guide from CityOfWhitePlains.org.`;

  return { metaTitle, metaDescription };
}

function estimateReadingTime(bodyHtml: string, preferredLength?: number): number {
  const text = bodyHtml.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const baseWords =
    preferredLength && preferredLength > 0 ? preferredLength : words;
  return Math.max(3, Math.round(baseWords / 180));
}

function buildBody({
  topic,
  keywords,
  audience,
  tone,
  callToAction,
  cadence,
  sourceUrl,
  sourceNotes,
}: AIDraftRequest) {
  const keywordList = (keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const seoList =
    keywordList.length > 0
      ? `<p><strong>Target keywords:</strong> ${keywordList.join(", ")}</p>`
      : "";

  const cadenceNote =
    cadence && cadence !== "once"
      ? `<p><strong>Automation cadence:</strong> ${cadence} (scheduled as draft by default).</p>`
      : "";

  const sourcesSection =
    sourceUrl || sourceNotes
      ? `<h2>Sources & attribution</h2>
         <p>Primary source: ${sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noreferrer">${sourceUrl}</a>` : "Official city information"}.</p>
         ${sourceNotes ? `<p>Notes from source: ${sourceNotes}</p>` : ""}`
      : "";

  return `
    <p>Local, calm guide for White Plains readers about <strong>${topic}</strong>${
      audience ? `, tailored for ${audience}` : ""
    }${tone ? ` in a ${tone} tone` : ""}.</p>
    ${seoList}
    ${cadenceNote}

    <h2>Why this matters in White Plains</h2>
    <ul>
      <li>Context that respects how people actually move through White Plains.</li>
      <li>Quick wins readers can use the same day.</li>
      <li>Links and mentions that align with search intent around the topic.</li>
    </ul>

    <h2>Key takeaways</h2>
    <ol>
      <li>Lead with the most practical action readers can take within 15–30 minutes.</li>
      <li>Highlight options that work for court days, quick visits, and locals.</li>
      <li>Close with a simple next step and one internal link to a related guide.</li>
    </ol>

    <h2>Starter outline (editable)</h2>
    <p>Use this outline as a starting point. Edit or regenerate sections as needed.</p>
    <ul>
      <li>Intro: what the reader needs and why this guide helps.</li>
      <li>3–5 focused sections with specifics (addresses, timing, budget cues).</li>
      <li>Micro-itinerary or checklist that fits a short visit.</li>
      <li>Optional FAQ: 3–4 concise Q&As based on search intent.</li>
    </ul>

    <h2>Suggested call to action</h2>
    <p>${callToAction || "Invite the reader to plan a simple next step in White Plains."}</p>

    ${sourcesSection}

    <p class="text-[11px] text-[#6B7280]">Generated as a draft. Double-check facts, links, and add internal links before publishing.</p>
  `;
}

export async function POST(req: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: "Unauthorized: admin session required." },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => null)) as AIDraftRequest | null;
  if (!body || !body.topic) {
    return NextResponse.json(
      { error: "Missing topic. Provide at least a topic/title." },
      { status: 400 }
    );
  }

  const { topic, keywords, audience, tone, callToAction, length, cadence } =
    body;
  const { sourceUrl, sourceNotes } = body;

  const { metaTitle, metaDescription } = buildMeta(topic, keywords, audience);
  const baseSlug = slugify(topic);
  const uniqueSlug = await ensureUniqueSlug(baseSlug);

  const generated =
    (await generateBodyWithOpenAI({
      topic,
      keywords,
      audience,
      tone,
      callToAction,
      length,
      cadence,
      sourceUrl,
      sourceNotes,
    })) || "";

  const html =
    generated ||
    buildBody({
      topic,
      keywords,
      audience,
      tone,
      callToAction,
      length,
      cadence,
      sourceUrl,
      sourceNotes,
    });

  const readingTime = estimateReadingTime(html, length);
  const category = "Guide";
  const hero_image_url = FALLBACK_HERO;

  const { data, error } = await client
    .from("blog_posts")
    .upsert(
      [
        {
          slug: uniqueSlug,
          title: topic,
          category,
          status: "draft",
          published_at: null,
          reading_time: readingTime,
          meta_title: metaTitle,
          meta_description: metaDescription,
          hero_image_url,
          body_html: html,
          ad_embed_code: null,
        },
      ],
      { onConflict: "slug" }
    )
    .select(
      `
      slug,
      title,
      category,
      status,
      published_at,
      reading_time,
      meta_title,
      meta_description,
      hero_image_url,
      body_html,
      ad_embed_code
    `
    )
    .single();

  if (error || !data) {
    console.error("[AI Blog] Error saving generated draft:", error?.message);
    return NextResponse.json(
      { error: "Unable to save generated draft. Check logs." },
      { status: 500 }
    );
  }

  const post: BlogPostAdminSummary = {
    slug: data.slug,
    title: data.title,
    category: data.category ?? "Guide",
    status: (data.status as "draft" | "published") || "draft",
    publishedAt: data.published_at ?? undefined,
    readingTime: data.reading_time ? String(data.reading_time) : undefined,
    metaTitle: data.meta_title ?? undefined,
    metaDescription: data.meta_description ?? undefined,
    heroImageUrl: data.hero_image_url ?? undefined,
    body: data.body_html ?? undefined,
    adEmbedCode: data.ad_embed_code ?? undefined,
  };

  return NextResponse.json({
    message: "Draft generated and saved as draft.",
    post,
  });
}
