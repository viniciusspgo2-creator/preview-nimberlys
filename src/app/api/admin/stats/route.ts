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
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const d14 = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const [
      viewsTotal,
      views7,
      views30,
      sessionRows,
      chatsTotal,
      chatsToday,
      contactsTotal,
      contactsUnhandled,
      viewRows,
      recentContacts,
      recentChats,
    ] = await Promise.all([
      db.pageView.count(),
      db.pageView.count({ where: { createdAt: { gte: d7 } } }),
      db.pageView.count({ where: { createdAt: { gte: d30 } } }),
      db.pageView.groupBy({ by: ["sessionId"] }),
      db.chatLog.count(),
      db.chatLog.count({ where: { createdAt: { gte: startOfToday } } }),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { handled: false } }),
      db.pageView.findMany({
        where: { createdAt: { gte: d14 } },
        select: { createdAt: true },
      }),
      db.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.chatLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Bucket views into the last 14 days (including today)
    const buckets = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      buckets.set(key, 0);
    }
    for (const row of viewRows) {
      const d = row.createdAt;
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return NextResponse.json({
      views: { total: viewsTotal, last7: views7, last30: views30 },
      uniqueSessions: sessionRows.length,
      chatMessages: { total: chatsTotal, today: chatsToday },
      contactMessages: { total: contactsTotal, unhandled: contactsUnhandled },
      viewsPerDay: Array.from(buckets.entries()).map(([date, count]) => ({
        date,
        count,
      })),
      recent: { contacts: recentContacts, chats: recentChats },
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load stats." },
      { status: 500 }
    );
  }
}
