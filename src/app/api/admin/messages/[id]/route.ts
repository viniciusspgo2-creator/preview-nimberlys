import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const mid = Number(id);
  if (!Number.isFinite(mid)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as { handled?: unknown };
    const message = await db.contactMessage.update({
      where: { id: mid },
      data: { handled: Boolean(body.handled) },
    });
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "Message not found." },
        { status: 404 }
      );
    }
    console.error("[admin/messages/[id] PATCH]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update message." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const mid = Number(id);
  if (!Number.isFinite(mid)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  try {
    await db.contactMessage.delete({ where: { id: mid } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "Message not found." },
        { status: 404 }
      );
    }
    console.error("[admin/messages/[id] DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete message." },
      { status: 500 }
    );
  }
}
