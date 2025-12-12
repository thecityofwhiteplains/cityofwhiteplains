// app/lib/notifications.ts
// Lightweight notification helpers. Uses nodemailer via SMTP (see email.ts).
// If SMTP env vars are missing or sending fails, we log and move on so core flows still work.
import { sendEmail } from "@/app/lib/email";

type EventApprovalEmail = {
  to: string;
  title: string;
  startAt?: string | null;
  location?: string | null;
};

export async function sendEventApprovalEmail(payload: EventApprovalEmail) {
  const { to, title, startAt, location } = payload;

  try {
    await sendEmail({
      to: [to],
      subject: `Your event "${title}" was approved`,
      text: [
        `Hi there,`,
        ``,
        `Your event "${title}" has been approved and is live on the site.`,
        startAt ? `When: ${startAt}` : "",
        location ? `Where: ${location}` : "",
        ``,
        `Thanks for sharing it with the community!`,
        `CityOfWhitePlains.org`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.warn("[Notifications] Unable to send event approval email:", err);
  }
}

export async function sendBusinessSubmissionReceipt(to: string, businessName: string) {
  try {
    await sendEmail({
      to: [to],
      subject: "We received your business submission",
      text: [
        `Thanks for submitting ${businessName || "your business"} to CityOfWhitePlains.org.`,
        `Our team will review it and follow up if we need anything else.`,
        ``,
        `If this was a claim request, we'll confirm once it's approved.`,
        ``,
        `– CityOfWhitePlains.org`,
      ].join("\n"),
    });
  } catch (err) {
    console.warn("[Notifications] Unable to send business submission receipt:", err);
  }
}

export async function sendBusinessSubmissionApproved(to: string, businessName: string, mode: "claim" | "new") {
  try {
    await sendEmail({
      to: [to],
      subject: `${businessName || "Your business"} has been approved`,
      text: [
        `Good news! ${businessName || "Your business"} has been approved on CityOfWhitePlains.org.`,
        mode === "claim"
          ? "Your claim is confirmed and the listing is now marked as claimed."
          : "Your new listing is live on the site.",
        ``,
        `Thank you for keeping the directory up to date.`,
        `– CityOfWhitePlains.org`,
      ].join("\n"),
    });
  } catch (err) {
    console.warn("[Notifications] Unable to send business approval email:", err);
  }
}
