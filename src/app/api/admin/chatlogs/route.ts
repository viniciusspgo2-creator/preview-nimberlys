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
    const logs = await db.chatLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ logs });
  } catch (err) {
    console.error("[admin/chatlogs GET]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load chat logs." },
      { status: 500 }
    );
  }
}
