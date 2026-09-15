import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const faqs = await db.faq.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }],
    });
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("[/api/faq] failed to load FAQs:", error);
    // The FAQ page has its own fallback data, so an empty list is safe here.
    return NextResponse.json({ faqs: [] });
  }
}
