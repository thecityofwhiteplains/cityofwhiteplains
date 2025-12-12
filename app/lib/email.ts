import nodemailer from "nodemailer";

type EmailPayload = {
  to: string[];
  subject: string;
  text?: string;
  html?: string;
};

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM || user;
const replyTo = process.env.EMAIL_REPLY_TO;

type MailTransporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: MailTransporter | null = null;

function getTransporter() {
  // Validate on demand so builds without env vars do not crash.
  if (!host || !port || Number.isNaN(port) || !user || !pass) {
    throw new Error("SMTP configuration is missing (host/port/user/pass).");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // IONOS SSL port
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
  if (!Array.isArray(to) || to.length === 0) {
    throw new Error("Recipient list is empty.");
  }

  const client = getTransporter();

  await client.sendMail({
    from,
    // Use BCC to keep the recipient list private between customers.
    to: undefined,
    bcc: to,
    subject,
    text,
    html,
    replyTo,
  });
}
