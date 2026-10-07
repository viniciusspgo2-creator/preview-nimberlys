import { NextResponse } from "next/server";
import { getAdminFromRequest, isAdminConfigured } from "@/lib/admin-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const [authed, configured] = await Promise.all([getAdminFromRequest(req), isAdminConfigured()]);
    return NextResponse.json({ authed, configured }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Admin is temporarily unavailable. Check DATABASE_URL and the database migrations in your hosting settings." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
