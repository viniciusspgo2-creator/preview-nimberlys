import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  createToken,
  isAdminConfigured,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Small in-memory rate limit: 8 attempts / minute / IP. */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((ts) => now - ts < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 500) {
    for (const [key, stamps] of attempts) {
      if (stamps.every((ts) => now - ts >= WINDOW_MS)) attempts.delete(key);
    }
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ||
      req.headers.get("x-real-ip")?.slice(0, 64) ||
      "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";

    if (!(await isAdminConfigured())) {
      return NextResponse.json(
        { ok: false, error: "Setup required. Create your admin password first." },
        { status: 409 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { ok: false, error: "Password is required." },
        { status: 400 }
      );
    }

    const valid = await checkAdminPassword(password);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const { token, maxAgeSec } = await createToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSec,
    });
    return res;
  } catch (err) {
    console.error("[admin/login]", err);
    return NextResponse.json(
      { ok: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
