// app/lib/notifications.ts
// Lightweight notification helpers. Uses nodemailer via SMTP (see email.ts).
// If SMTP env vars are missing or sending fails, we log and move on so core flows still work.
import { absoluteUrl } from "@/app/lib/seo";
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
  const { subject, text, html } = buildBusinessSubmissionReceiptEmail(businessName);

  try {
    await sendEmail({
      to: [to],
      subject,
      text,
      html,
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

function buildBusinessInviteEmail() {
  const ctaUrl = absoluteUrl("/list-your-business");
  const subject = "(Community Focused): You’re invited: Feature your business on CityOfWhitePlains.org";

  const text = [
    "To the Business Community of White Plains,",
    "",
    "We are thrilled to announce that cityofwhiteplains.org is officially live!",
    "",
    "Our mission is to establish a comprehensive digital hub for our community—connecting White Plains residents, daily commuters, and visitors with the exceptional local services and shops that keep our city vibrant.",
    "",
    "As a vital part of the local economy, we want to ensure your business is represented. We are inviting you to create a complimentary business listing on our new directory.",
    "",
    "Why join the directory?",
    "- Expand Your Reach: Be found by locals and visitors specifically looking for White Plains services.",
    "- Zero Cost: This is a 100% free community resource designed to support local commerce.",
    "- Build Trust: Joining a local, curated directory signals reliability to potential customers.",
    "",
    "How to get listed:",
    "1) Visit the registration page below.",
    "2) Upload your details (logo, hours, contact info, and description).",
    "3) Submit your listing for approval.",
    "",
    `Create your free listing: ${ctaUrl}`,
    "",
    "Please note: To maintain the integrity and quality of our directory for the public, all submissions are personally reviewed by our team. You will receive a notification once your listing has been approved and published to the live site.",
    "",
    "Let’s work together to make it easier for White Plains to find you.",
    "",
    "Best regards,",
    "The Team at City of White Plains",
    "cityofwhiteplains.org",
  ].join("\n");

  const html = `
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Arial,sans-serif;color:#111827;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f8fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(17,24,39,0.08);">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <span style="display:inline-flex;width:40px;height:40px;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;background:#fff;">
                    <img src="${absoluteUrl("/logo-wp.png")}" alt="City of White Plains" style="width:100%;height:100%;object-fit:contain;padding:6px;" />
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
                  <a href="${ctaUrl}" style="display:inline-block;background:#1c1f2a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">Create Your Free Listing</a>
                </div>

                <p style="margin:0 0 12px 0;">Please note: To maintain the integrity and quality of our directory for the public, all submissions are personally reviewed by our team. You will receive a notification once your listing has been approved and published to the live site.</p>
                <p style="margin:0 0 16px 0;">Let’s work together to make it easier for White Plains to find you.</p>

                <p style="margin:0 0 4px 0;">Best regards,</p>
                <p style="margin:0 0 4px 0;">The Team at City of White Plains</p>
                <p style="margin:0 0 0 0;"><a href="${absoluteUrl("/")}" style="color:#4b5fc6;text-decoration:none;">cityofwhiteplains.org</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  `;

  return { subject, text, html };
}

export async function sendBusinessDirectoryInvite(to: string | string[]) {
  const recipients = Array.isArray(to) ? to : [to];
  const filtered = recipients.map((r) => r.trim()).filter(Boolean);
  if (filtered.length === 0) {
    throw new Error("No recipients provided for business directory invite.");
  }

  const { subject, text, html } = buildBusinessInviteEmail();
  try {
    await sendEmail({
      to: filtered,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.warn("[Notifications] Unable to send business directory invite:", err);
    throw err;
  }
}

function buildBusinessSubmissionReceiptEmail(businessName?: string | null) {
  const name = businessName?.trim() || "your business";
  const subject = "Submission Received: Your listing on CityOfWhitePlains.org";
  const text = [
    "Dear Business Owner,",
    "",
    `Thank you for submitting ${name} to the City of White Plains Community Directory.`,
    "",
    "We have successfully received your details.",
    "",
    "What happens next? To ensure cityofwhiteplains.org remains a high-quality, spam-free resource for our residents and commuters, our team manually reviews every listing before it goes live.",
    "",
    "Review: We are currently verifying your details to ensure accuracy and proper formatting.",
    "Timeline: This process typically takes 24–48 hours.",
    "Approval: You will receive a second email notification the moment your listing is published and visible to the public.",
    "",
    "In the meantime, no further action is required on your part.",
    "",
    "Thank you for helping us build a vibrant digital hub for our city!",
    "",
    "Best regards,",
    "The Team at City of White Plains",
    "cityofwhiteplains.org",
  ].join("\n");

  const html = `
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Arial,sans-serif;color:#111827;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f8fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(17,24,39,0.08);">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <span style="display:inline-flex;width:40px;height:40px;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;background:#fff;">
                    <img src="${absoluteUrl("/logo-wp.png")}" alt="City of White Plains" style="width:100%;height:100%;object-fit:contain;padding:6px;" />
                  </span>
                  <div style="font-weight:700;font-size:16px;color:#111827;">CityOfWhitePlains.org</div>
                </div>
                <p style="margin:20px 0 8px 0;font-size:14px;color:#6b7280;">Submission received</p>
                <h1 style="margin:0 0 12px 0;font-size:22px;color:#111827;line-height:1.3;">Your listing is under review</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;font-size:15px;line-height:1.6;color:#374151;">
                <p style="margin:0 0 12px 0;">Dear Business Owner,</p>
                <p style="margin:0 0 12px 0;">Thank you for submitting <strong>${name}</strong> to the City of White Plains Community Directory.</p>
                <p style="margin:0 0 12px 0;">We have successfully received your details.</p>
                <p style="margin:0 0 12px 0;">To ensure cityofwhiteplains.org remains a high-quality, spam-free resource for our residents and commuters, our team manually reviews every listing before it goes live.</p>

                <div style="margin:18px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
                  <p style="margin:0 0 8px 0;font-weight:700;color:#111827;">What happens next?</p>
                  <ul style="margin:0;padding-left:18px;color:#374151;">
                    <li style="margin-bottom:6px;"><strong>Review:</strong> We are currently verifying your details to ensure accuracy and proper formatting.</li>
                    <li style="margin-bottom:6px;"><strong>Timeline:</strong> This process typically takes 24–48 hours.</li>
                    <li style="margin-bottom:0;"><strong>Approval:</strong> You will receive a second email notification the moment your listing is published and visible to the public.</li>
                  </ul>
                </div>

                <p style="margin:0 0 12px 0;">In the meantime, no further action is required on your part.</p>
                <p style="margin:0 0 16px 0;">Thank you for helping us build a vibrant digital hub for our city!</p>

                <p style="margin:0 0 4px 0;">Best regards,</p>
                <p style="margin:0 0 4px 0;">The Team at City of White Plains</p>
                <p style="margin:0 0 0 0;"><a href="${absoluteUrl("/")}" style="color:#4b5fc6;text-decoration:none;">cityofwhiteplains.org</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  `;

  return { subject, text, html };
}
