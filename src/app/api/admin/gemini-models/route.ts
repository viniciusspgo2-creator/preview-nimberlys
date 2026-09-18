import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 15_000;

/** Non-chat Gemini families that must never appear in the chatbot dropdown. */
const EXCLUDE_PATTERN =
  /(embedding|aqa|imagen|image|tts|native-audio|live|transcribe|translate|robotics|computer-use|omni)/i;

function friendlyError(status: number, googleMessage: string): string {
  switch (status) {
    case 400:
      return "API key not valid. Copy the whole key again from Google AI Studio (it starts with 'AIza').";
    case 401:
      return "API key was rejected (401). Generate a new key in Google AI Studio and save it here.";
    case 403:
      return `Key was refused (403). Usually the "Generative Language API" is not enabled for this key, or it is restricted to specific websites. Create the key in Google AI Studio with NO website/referrer restrictions. (Google said: ${googleMessage})`;
    case 429:
      return "Free-tier quota reached (429). Wait a minute and try again.";
    default:
      return `Google answered with HTTP ${status}. (Google said: ${googleMessage})`;
  }
}

/**
 * POST /api/admin/gemini-models
 * Asks Google's ListModels API which models THIS key can actually use and
 * returns the chat-capable ones (newest first). This kills the
 * "Model not found for this key" problem for good: the owner picks from the
 * exact list their key supports.
 */
export async function POST(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { key?: unknown };

    // Resolve key: newly typed value wins → saved panel value → env var.
    let key = "";
    if (typeof body.key === "string" && body.key.trim()) {
      key = body.key.trim();
    } else {
      try {
        const row = await db.setting.findUnique({ where: { key: "gemini_api_key" } });
        if (row?.value?.trim()) key = row.value.trim();
      } catch {
        /* DB hiccup — fall through to env */
      }
      if (!key && process.env.GEMINI_API_KEY?.trim()) {
        key = process.env.GEMINI_API_KEY.trim();
      }
    }

    if (!key) {
      return NextResponse.json({
        ok: false,
        message:
          "No API key found. Paste your Google AI Studio key in the field above first.",
      });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(key)}`,
      { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) }
    );

    if (!res.ok) {
      let googleMessage = "";
      try {
        const err = (await res.json()) as { error?: { message?: string } };
        googleMessage = err.error?.message?.slice(0, 300) ?? "";
      } catch {
        /* ignore body parse */
      }
      return NextResponse.json({
        ok: false,
        message: friendlyError(res.status, googleMessage),
      });
    }

    const data = (await res.json()) as {
      models?: Array<{
        name?: string;
        supportedGenerationMethods?: string[];
      }>;
    };

    const models = (data.models ?? [])
      .filter(
        (m) =>
          typeof m.name === "string" &&
          m.name.startsWith("models/gemini-") &&
          (m.supportedGenerationMethods ?? []).includes("generateContent") &&
          !EXCLUDE_PATTERN.test(m.name)
      )
      .map((m) => (m.name as string).replace(/^models\//, ""))
      .sort()
      .reverse(); // descending → gemini-flash-latest, 3.8, 3.7, … 2.0

    if (models.length === 0) {
      return NextResponse.json({
        ok: false,
        message:
          "The key works, but Google returned no chat models for it. Create a new key in Google AI Studio (https://aistudio.google.com/apikey).",
      });
    }

    return NextResponse.json({ ok: true, models, count: models.length });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json({
      ok: false,
      message: isTimeout
        ? "Timed out after 15s while talking to Google. Check this server's internet connection and try again."
        : `Unexpected error: ${err instanceof Error ? err.message.slice(0, 200) : "unknown"}`,
    });
  }
}
