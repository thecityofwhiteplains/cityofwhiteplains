// app/api/admin/email/send/route.ts
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/lib/adminAuth";
import { sendEmail } from "@/app/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SendBody = {
  to?: string | string[];
  subject?: string;
  body?: string;
  isHtml?: boolean;
};

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRecipients(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const joined = Array.isArray(raw) ? raw.join(",") : raw;
  const parts = joined
    .split(/[\n,;]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const deduped = Array.from(new Set(parts));
  return deduped.filter((addr) => EMAIL_REGEX.test(addr));
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SendBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const recipients = parseRecipients(body.to);
  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Add at least one valid recipient (comma or newline separated)." },
      { status: 400 }
    );
  }
  if (recipients.length > 200) {
    return NextResponse.json(
      { error: "Limit to 200 recipients per send to avoid rate limits." },
      { status: 400 }
    );
  }

  const subject = (body.subject || "").trim();
  const content = (body.body || "").trim();
  const isHtml = Boolean(body.isHtml);

  if (!subject || !content) {
    return NextResponse.json(
      { error: "Subject and body are required." },
      { status: 400 }
    );
  }

  try {
    await sendEmail({
      to: recipients,
      subject,
      text: isHtml ? undefined : content,
      html: isHtml ? content : undefined,
    });
    return NextResponse.json({ success: true, sent: recipients.length });
  } catch (err) {
    const message =
      (err as any)?.message || "Unable to send email. Check SMTP settings and logs.";
    console.error("[Email] Unable to send message:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
