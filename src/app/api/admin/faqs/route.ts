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

function mapFaq(body: IncomingFaq) {
  const question = String(body.question ?? "").trim();
  const answer = String(body.answer ?? "").trim();
  if (!question) throw new Error("Question is required.");
  if (!answer) throw new Error("Answer is required.");
  const order = Number(body.order);
  return { question, answer, category: String(body.category ?? "").trim() || "General",
    order: Number.isFinite(order) ? Math.round(order) : 0,
    published: body.published === undefined ? true : Boolean(body.published) };
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
    const data = mapFaq(body);
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
