import { NextResponse } from "next/server";
import { getAdminFromRequest, isAdminConfigured } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const [authed, configured] = await Promise.all([
    getAdminFromRequest(req),
    isAdminConfigured(),
  ]);
  return NextResponse.json({ authed, configured });
}
