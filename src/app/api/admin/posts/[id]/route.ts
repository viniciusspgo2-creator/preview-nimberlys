import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { mapPostBody, type IncomingPost } from "../../_lib/post-map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const pid = Number(id);
  if (!Number.isFinite(pid)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  try {
    const post = await db.post.findUnique({ where: { id: pid } });
    if (!post) {
      return NextResponse.json(
        { ok: false, error: "Post not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error("[admin/posts/[id] GET]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load post." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const pid = Number(id);
  if (!Number.isFinite(pid)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as IncomingPost;
    const data = mapPostBody(body, true);
    const post = await db.post.update({ where: { id: pid }, data });
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { ok: false, error: "A post with this slug already exists." },
          { status: 409 }
        );
      }
      if (err.code === "P2025") {
        return NextResponse.json(
          { ok: false, error: "Post not found." },
          { status: 404 }
        );
      }
    }
    if (err instanceof Error && !/prisma/i.test(err.message)) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[admin/posts/[id] PUT]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update post." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const pid = Number(id);
  if (!Number.isFinite(pid)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  try {
    await db.post.delete({ where: { id: pid } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "Post not found." },
        { status: 404 }
      );
    }
    console.error("[admin/posts/[id] DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete post." },
      { status: 500 }
    );
  }
}
