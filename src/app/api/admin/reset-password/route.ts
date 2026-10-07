import { NextResponse } from "next/server";
import { ADMIN_COOKIE, resetAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const attempts = new Map<string, { count: number; until: number }>();

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if ((origin && origin !== new URL(req.url).origin) || req.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) || "unknown";
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const bucket = attempts.get(ip) ?? { count: 0, until: now + 60_000 };
  if (bucket.count >= 5 || attempts.size >= 1000) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Wait one minute." }, { status: 429 });
  }
  bucket.count++; attempts.set(ip, bucket);
  try {
    const body = await req.json() as { token?: unknown; password?: unknown; confirm?: unknown };
    if (typeof body.token !== "string" || typeof body.password !== "string" || body.password !== body.confirm) {
      return NextResponse.json({ ok: false, error: "Enter your recovery code and matching passwords." }, { status: 400 });
    }
    const result = await resetAdminPassword(body.token.trim(), body.password);
    if (!result.ok) return NextResponse.json(result, { status: result.status });
    // Sign in separately after recovery; retries cannot consume the code twice.
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Recovery failed. Check the database connection and try again." }, { status: 503 });
  }
}
