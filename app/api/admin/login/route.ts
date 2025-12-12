import { NextResponse } from "next/server";
import {
  getAdminPassword,
  getAdminPasswordHash,
  hashValue,
  createAdminCookie,
} from "@/app/lib/adminAuth";

type Attempt = { count: number; first: number };
const ATTEMPTS = new Map<string, Attempt>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

function getClientKey(req: Request): string {
  const hdr =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "";
  return hdr.split(",")[0].trim() || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = ATTEMPTS.get(key);
  if (!record) return false;
  if (now - record.first > WINDOW_MS) {
    ATTEMPTS.delete(key);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function trackAttempt(key: string, success: boolean) {
  if (success) {
    ATTEMPTS.delete(key);
    return;
  }
  const now = Date.now();
  const record = ATTEMPTS.get(key);
  if (!record || now - record.first > WINDOW_MS) {
    ATTEMPTS.set(key, { count: 1, first: now });
  } else {
    ATTEMPTS.set(key, { count: record.count + 1, first: record.first });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const passwordInput = (body?.password as string | undefined)?.trim() || "";
  const expectedPassword = getAdminPassword();
  const expectedHash = getAdminPasswordHash();
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  if (!expectedPassword || !expectedHash) {
    return NextResponse.json(
      { error: "Admin password is not configured on the server." },
      { status: 500 }
    );
  }

  const suppliedHash = passwordInput ? hashValue(passwordInput) : "";

  if (suppliedHash !== expectedHash) {
    trackAttempt(clientKey, false);
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  trackAttempt(clientKey, true);
  const response = NextResponse.json({ success: true });
  await createAdminCookie(expectedHash);
  return response;
}
