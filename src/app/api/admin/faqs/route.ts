import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingFaq = {
  question?: unknown;
  answer?: unknown;
  category?: unknown;
  order?: unknown;
  published?: unknown;
};

function mapFaq(body: IncomingFaq, partial: boolean) {
  const data: Record<string, unknown> = {};
  const has = (k: keyof IncomingFaq) =>
    Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("question")) {
    const q = String(body.question ?? "").trim();
    if (!q) throw new Error("Question is required.");
    data.question = q;
  }
  if (!partial || has("answer")) {
    const a = String(body.answer ?? "").trim();
    if (!a) throw new Error("Answer is required.");
    data.answer = a;
  }
  if (!partial || has("category")) {
    data.category = String(body.category ?? "").trim() || "General";
  }
  if (has("order") || !partial) {
    const n = Number(body.order);
    data.order = Number.isFinite(n) ? Math.round(n) : 0;
  }
  if (has("published") || !partial) {
    data.published =
      body.published === undefined ? true : Boolean(body.published);
  }
  return data;
}

export async function GET(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const faqs = await db.faq.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });
    return NextResponse.json({ faqs });
  } catch (err) {
    console.error("[admin/faqs GET]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load FAQs." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as IncomingFaq;
    const data = mapFaq(body, false);
    const faq = await db.faq.create({ data });
    return NextResponse.json({ ok: true, faq }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && !/prisma/i.test(err.message)) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[admin/faqs POST]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create FAQ." },
      { status: 500 }
    );
  }
}
