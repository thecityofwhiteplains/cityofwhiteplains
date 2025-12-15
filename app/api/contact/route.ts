import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email";

const RECIPIENT = process.env.EMAIL_FROM || process.env.SMTP_USER || "info@cityofwhiteplains.org";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body?.name || "").toString().trim();
  const email = (body?.email || "").toString().trim();
  const topic = (body?.topic || "general").toString().trim();
  const message = (body?.message || "").toString().trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Message is too short. Please add more detail." }, { status: 400 });
  }

  const subject = `[Contact] ${topic || "General"} — ${name}`;
  const text = [
    `Topic: ${topic || "general"}`,
    `From: ${name} <${email}>`,
    "",
    message,
  ].join("\n");

  try {
    await sendEmail({
      to: [RECIPIENT],
      subject,
      text,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] unable to send message", err);
    return NextResponse.json({ error: "Unable to send message right now." }, { status: 500 });
  }
}
