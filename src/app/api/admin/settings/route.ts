import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromRequest, updateAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Keys that must never be written directly through the bulk upsert. */
const PROTECTED_KEYS = new Set([
  "admin_password",
  "admin_password_hash",
  "admin_secret",
  "new_admin_password",
]);

function maskKey(value: string): string {
  const tail = value.slice(-4);
  return `•••• ${tail}`;
}

export async function GET(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const rows = await db.setting.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      if (row.key === "admin_password_hash" || row.key === "admin_secret") continue; // never expose
      settings[row.key] = row.value;
    }

    // Mask the Gemini API key: client only gets a hint, never the raw value.
    const rawKey = settings.gemini_api_key ?? "";
    const geminiKeySet = rawKey.trim().length > 0;
    settings.gemini_api_key = "";
    settings.gemini_api_key_set = geminiKeySet ? "1" : "";
    settings.gemini_api_key_hint = geminiKeySet ? maskKey(rawKey.trim()) : "";

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[admin/settings GET]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load settings." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const writes: { key: string; value: string }[] = [];
    for (const [key, rawValue] of Object.entries(body)) {
      if (PROTECTED_KEYS.has(key)) continue;
      const value = typeof rawValue === "string" ? rawValue : String(rawValue ?? "");
      // Never blank an existing Gemini key — only overwrite with a new value.
      if (key === "gemini_api_key" && !value.trim()) continue;
      writes.push({ key, value });
    }

    // Optional password change flow (stored as a salted scrypt hash)
    const newPw = typeof body.new_admin_password === "string" ? body.new_admin_password : "";
    if (newPw) {
      const result = await updateAdminPassword(newPw);
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }
    }

    for (const w of writes) {
      await db.setting.upsert({
        where: { key: w.key },
        update: { value: w.value },
        create: { key: w.key, value: w.value },
      });
    }

    return NextResponse.json({ ok: true, updated: writes.length });
  } catch (err) {
    console.error("[admin/settings PUT]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to save settings." },
      { status: 500 }
    );
  }
}
