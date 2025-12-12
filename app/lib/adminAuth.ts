import crypto from "crypto";
import { cookies } from "next/headers";

export function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getAdminPassword(): string | null {
  const raw =
    process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

export function getAdminPasswordHash(): string | null {
  const pwd = getAdminPassword();
  if (!pwd) return null;
  return hashValue(pwd);
}

function signToken(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function buildSessionToken(secret: string, hours = 8): string {
  const exp = Math.floor(Date.now() / 1000) + hours * 60 * 60;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = signToken(payload, secret);
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = signToken(payload, secret);
  if (expected !== sig) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const exp = decoded?.exp;
    if (!exp || typeof exp !== "number") return false;
    return exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function readAdminCookie(): Promise<string | null> {
  try {
    const store = await cookies();
    const value = store.get("admin_auth");
    if (!value) return null;
    return typeof value === "string" ? value : (value as any)?.value ?? null;
  } catch (err) {
    console.warn("[Admin auth] Unable to read cookies:", err);
  }
  return null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const hash = getAdminPasswordHash();
  if (!hash) return false;
  const token = await readAdminCookie();
  return token ? verifySessionToken(token, hash) : false;
}

export async function createAdminCookie(hash?: string | null) {
  const secret = hash || getAdminPasswordHash();
  if (!secret) return;
  const token = buildSessionToken(secret);
  const store = await cookies();
  store.set("admin_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.set("admin_auth", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
