import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const onlyUnhandled = url.searchParams.get("unhandled") === "1";
    const messages = await db.contactMessage.findMany({
      where: onlyUnhandled ? { handled: false } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[admin/messages GET]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load messages." },
      { status: 500 }
    );
  }
}
