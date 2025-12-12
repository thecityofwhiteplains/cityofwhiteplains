import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/app/lib/adminAuth";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}
