import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fire-and-forget page-view tracking. Always responds {ok:true} — never throws to the client. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      path?: unknown;
      sessionId?: unknown;
      referrer?: unknown;
    } | null;

    if (body) {
      const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
      const sessionId =
        typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
      const referrer =
        typeof body.referrer === "string" ? body.referrer.slice(0, 400) : "";

      if (path && sessionId) {
        await db.pageView.create({
          data: {
            path,
            sessionId,
            ...(referrer ? { referrer } : {}),
          },
        });
      }
    }
  } catch {
    // Tracking must never break the user experience — swallow everything.
  }

  return NextResponse.json({ ok: true });
}
