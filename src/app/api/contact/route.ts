import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LENGTHS = { phone: 25, childAge: 40, message: 2000 } as const;

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  childAge?: string;
  message: string;
  company?: string; // honeypot — must stay empty
};

function validate(body: Partial<ContactPayload>) {
  const errors: string[] = [];

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const childAge = typeof body.childAge === "string" ? body.childAge.trim() : "";

  if (name.length < 2 || name.length > 80) errors.push("name");
  if (!EMAIL_RE.test(email) || email.length > 254) errors.push("email");
  if (message.length < 5 || message.length > MAX_LENGTHS.message) errors.push("message");
  if (phone.length > MAX_LENGTHS.phone) errors.push("phone");
  if (childAge.length > MAX_LENGTHS.childAge) errors.push("childAge");

  return {
    errors,
    values: {
      name,
      email,
      message,
      ...(phone ? { phone } : {}),
      ...(childAge ? { childAge } : {}),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Simple in-memory rate limit — 3 submissions per minute per IP       */
/* ------------------------------------------------------------------ */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

// Light cleanup so the map can't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) if (entry.resetAt < now) hits.delete(ip);
}, WINDOW_MS).unref?.();

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export async function POST(request: Request) {
  try {
    let body: Partial<ContactPayload>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    // Honeypot: real visitors never fill this hidden field. Bots that do get
    // a fake success response — nothing is stored.
    if (typeof body.company === "string" && body.company.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many messages. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { errors, values } = validate(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Please check the following fields: ${errors.join(", ")}.` },
        { status: 400 }
      );
    }

    await db.contactMessage.create({ data: values });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/contact] failed to store message:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
