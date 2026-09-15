import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { mapPostBody, type IncomingPost } from "../_lib/post-map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[admin/posts GET]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load posts." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as IncomingPost;
    const data = mapPostBody(body, false);
    const post = await db.post.create({ data });
    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "A post with this slug already exists." },
        { status: 409 }
      );
    }
    if (err instanceof Error && !/prisma/i.test(err.message)) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[admin/posts POST]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create post." },
      { status: 500 }
    );
  }
}
