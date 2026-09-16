import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

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

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const fid = Number(id);
  if (!Number.isFinite(fid)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as IncomingFaq;
    const data = mapFaq(body, true);
    const faq = await db.faq.update({ where: { id: fid }, data });
    return NextResponse.json({ ok: true, faq });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "FAQ not found." },
        { status: 404 }
      );
    }
    if (err instanceof Error && !/prisma/i.test(err.message)) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[admin/faqs/[id] PUT]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update FAQ." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const fid = Number(id);
  if (!Number.isFinite(fid)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  try {
    await db.faq.delete({ where: { id: fid } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "FAQ not found." },
        { status: 404 }
      );
    }
    console.error("[admin/faqs/[id] DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete FAQ." },
      { status: 500 }
    );
  }
}
