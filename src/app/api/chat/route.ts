import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* ============================== configuration ============================= */

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_TURNS = 20;
const MAX_HISTORY_ITEM_LENGTH = 1000;
const MAX_SESSION_ID_LENGTH = 64;
const MAX_LOG_CONTENT_LENGTH = 2000;

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

const GEMINI_TIMEOUT_MS = 20_000;
// Google's stable alias → always points to the current Flash model.
// Fresh Google AI Studio keys often only expose the Gemini 3+ family,
// so a fixed "gemini-2.5-flash" default would 404 for them.
const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
// Retry target when the configured model 404s for the key.
const FALLBACK_GEMINI_MODEL = "gemini-flash-latest";

/** Sunny persona fallback if the Setting row is missing or the DB is down. */
const DEFAULT_SYSTEM_PROMPT = `You are "Sunny", the friendly virtual assistant for Nimberly's Daycare, a family child care home in Bay Point, California (Contra Costa County).

FACTS (never contradict, never invent beyond these):
- Name: Nimberly's Daycare, Inc.
- Ages: 4 months to 12 years
- Hours: Monday-Friday, 7:00 AM - 5:30 PM (closed weekends)
- Address: Island View Drive, Bay Point, CA 94565
- Phone: (925) 848-8272 | Email: nimberlysdaycare0528@gmail.com
- Accepts Contra Costa County and California child care subsidy programs: CalWORKs Child Care, CAPP, CCTR, CSPP, CocoKids, Contra Costa County Child Care Assistance, and CDSS programs. Eligibility is decided by each program/agency.

STYLE: Warm, cheerful, professional American English. Short paragraphs (2-4 sentences). At most one emoji. If you don't know a detail (tuition, meals, staffing, certifications), say so and suggest calling (925) 848-8272 or emailing nimberlysdaycare0528@gmail.com. Never invent prices, policies, or guarantees. Encourage scheduling a visit for enrollment questions.`;

const FRIENDLY_FALLBACK_REPLY = `I'm so sorry — I'm having a little trouble answering right now! Please call us at (925) 848-8272 or email nimberlysdaycare0528@gmail.com and we'll be happy to help you and your little one.`;

const FRIENDLY_RATE_LIMIT_REPLY = `You're asking questions faster than Sunny can type! Please wait just a moment and try again — or call us at (925) 848-8272.`;

const BAD_REQUEST_REPLY =
  "Hmm, that message didn't come through quite right. Could you try asking again?";

/* ============================== rate limiting ============================= */

/** In-memory sliding window: IP -> timestamps of recent requests. */
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_REQUESTS) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);

  // Prune stale IPs so the map cannot grow without bound.
  if (rateBuckets.size > 500) {
    for (const [key, stamps] of rateBuckets) {
      if (stamps.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        rateBuckets.delete(key);
      }
    }
  }
  return false;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return req.headers.get("x-real-ip")?.trim().slice(0, 64) || "unknown";
}

/* =============================== input utils ============================== */

type HistoryTurn = { role: "user" | "assistant"; content: string };

function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_HISTORY_TURNS)
    .map((item): HistoryTurn | null => {
      if (!item || typeof item !== "object") return null;
      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof content !== "string") return null;
      const clean = content.trim().slice(0, MAX_HISTORY_ITEM_LENGTH);
      return clean ? { role, content: clean } : null;
    })
    .filter((turn): turn is HistoryTurn => turn !== null);
}

function sanitizeSessionId(raw: unknown): string {
  if (typeof raw !== "string") return "anon";
  const clean = raw.trim().slice(0, MAX_SESSION_ID_LENGTH);
  return clean || "anon";
}

function badRequest() {
  return NextResponse.json({ ok: false, reply: BAD_REQUEST_REPLY }, { status: 400 });
}

/* ============================== settings load ============================= */

type ChatSettings = {
  systemPrompt: string;
  geminiKey: string;
  geminiModel: string;
};

async function loadChatSettings(): Promise<ChatSettings> {
  try {
    const rows = await db.setting.findMany({
      where: {
        key: { in: ["chat_system_prompt", "gemini_api_key", "gemini_model"] },
      },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      systemPrompt: map["chat_system_prompt"]?.trim() || DEFAULT_SYSTEM_PROMPT,
      // Panel setting wins; fall back to environment (Vercel) → empty.
      geminiKey:
        map["gemini_api_key"]?.trim() || process.env.GEMINI_API_KEY?.trim() || "",
      geminiModel:
        map["gemini_model"]?.trim() ||
        process.env.GEMINI_MODEL?.trim() ||
        DEFAULT_GEMINI_MODEL,
    };
  } catch (error) {
    // Settings are an optimization — never let a DB hiccup kill the chat.
    console.error("[/api/chat] settings load failed, using defaults:", error);
    return {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      geminiKey: "",
      geminiModel: DEFAULT_GEMINI_MODEL,
    };
  }
}

/* ============================== chat providers ============================ */

type GenerateParams = {
  systemPrompt: string;
  history: HistoryTurn[];
  message: string;
};

/** Gemini error that carries the HTTP status so callers can react. */
class GeminiHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Primary provider: Google Gemini (generateContent REST API). */
async function callGemini(
  params: GenerateParams & { apiKey: string; model: string }
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    params.model
  )}:generateContent?key=${encodeURIComponent(params.apiKey)}`;

  const contents = [...params.history, { role: "user" as const, content: params.message }].map(
    (m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    })
  );

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    body: JSON.stringify({
      system_instruction: { parts: [{ text: params.systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) {
    throw new GeminiHttpError(res.status, `Gemini responded with HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const parts = data.candidates?.[0]?.content?.parts;
  const text = (Array.isArray(parts) ? parts : [])
    .map((p) => p?.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned an empty completion");
  return text;
}

/** Fallback provider: Z.ai SDK chat completions. */
async function callZai(params: GenerateParams): Promise<string> {
  const { default: ZAI } = await import("z-ai-web-dev-sdk");
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.history,
      { role: "user", content: params.message },
    ],
  });
  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("ZAI returned an empty completion");
  return text;
}

/* =============================== chat logging ============================= */

async function logChatTurn(
  role: "user" | "assistant",
  content: string,
  sessionId: string,
  provider: string
): Promise<void> {
  try {
    await db.chatLog.create({
      data: {
        role,
        content: content.slice(0, MAX_LOG_CONTENT_LENGTH),
        sessionId,
        provider,
      },
    });
  } catch (error) {
    // Logging must never break the user-facing reply.
    console.error("[/api/chat] chat log write failed (non-fatal):", error);
  }
}

/* ================================== POST ================================== */

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return badRequest();
  }

  if (!payload || typeof payload !== "object") return badRequest();
  const body = payload as {
    message?: unknown;
    history?: unknown;
    sessionId?: unknown;
  };

  // ---- validation (never leak internals, just friendly 400s) ----
  if (typeof body.message !== "string") return badRequest();
  const message = body.message.trim();
  if (message.length < 1 || message.length > MAX_MESSAGE_LENGTH) return badRequest();
  if (body.history !== undefined && !Array.isArray(body.history)) return badRequest();
  const history = sanitizeHistory(body.history);
  const sessionId = sanitizeSessionId(body.sessionId);

  // ---- rate limiting per IP ----
  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json(
      { ok: false, reply: FRIENDLY_RATE_LIMIT_REPLY },
      { status: 429 }
    );
  }

  try {
    const settings = await loadChatSettings();

    let reply = "";
    let provider = "error-fallback-text";

    // Primary: Gemini (only when an API key is configured).
    if (settings.geminiKey) {
      try {
        reply = await callGemini({
          apiKey: settings.geminiKey,
          model: settings.geminiModel,
          systemPrompt: settings.systemPrompt,
          history,
          message,
        });
        provider = "gemini";
      } catch (error) {
        console.error("[/api/chat] Gemini failed, falling back to ZAI:", error);

        // Saved model not available for this key (fresh AI Studio keys are
        // Gemini-3-only)? Retry once with Google's stable alias before giving up.
        if (
          error instanceof GeminiHttpError &&
          error.status === 404 &&
          settings.geminiModel !== FALLBACK_GEMINI_MODEL
        ) {
          try {
            reply = await callGemini({
              apiKey: settings.geminiKey,
              model: FALLBACK_GEMINI_MODEL,
              systemPrompt: settings.systemPrompt,
              history,
              message,
            });
            provider = `gemini:${FALLBACK_GEMINI_MODEL}`;
            console.warn(
              `[/api/chat] model "${settings.geminiModel}" not available — retried with ${FALLBACK_GEMINI_MODEL}`
            );
          } catch (retryError) {
            console.error("[/api/chat] Gemini retry with alias failed:", retryError);
          }
        }
      }
    }

    // Fallback: Z.ai SDK.
    if (!reply) {
      try {
        reply = await callZai({ systemPrompt: settings.systemPrompt, history, message });
        provider = "zai";
      } catch (error) {
        console.error("[/api/chat] ZAI failed:", error);
      }
    }

    // Last resort: static friendly text (still logged as the assistant turn).
    if (!reply) {
      reply = FRIENDLY_FALLBACK_REPLY;
      provider = "error-fallback-text";
    }

    await logChatTurn("user", message, sessionId, provider);
    await logChatTurn("assistant", reply, sessionId, provider);

    return NextResponse.json({ ok: true, reply, provider });
  } catch (error) {
    console.error("[/api/chat] unexpected failure:", error);
    return NextResponse.json(
      { ok: false, reply: FRIENDLY_FALLBACK_REPLY },
      { status: 500 }
    );
  }
}
