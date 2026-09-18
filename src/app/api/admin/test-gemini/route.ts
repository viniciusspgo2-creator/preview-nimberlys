import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 15_000;
const DEFAULT_MODEL = "gemini-flash-latest";

/** Chat-capable model ids for a key (Google ListModels), newest first. */
async function listAvailableModels(
  key: string
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(key)}`,
      { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
    };
    return (data.models ?? [])
      .filter(
        (m) =>
          typeof m.name === "string" &&
          m.name.startsWith("models/gemini-") &&
          (m.supportedGenerationMethods ?? []).includes("generateContent") &&
          !/(embedding|aqa|imagen|image|tts|native-audio|live|transcribe|translate|robotics|computer-use|omni)/i.test(
            m.name
          )
      )
      .map((m) => (m.name as string).replace(/^models\//, ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

/** Friendly diagnosis for a Gemini HTTP status code. */
async function diagnose(
  status: number,
  googleMessage: string,
  model: string,
  key = ""
): Promise<string> {
  switch (status) {
    case 400:
      return "API key not valid. Copy the whole key again from Google AI Studio (it starts with 'AIza').";
    case 401:
      return "API key was rejected (401). Generate a new key in Google AI Studio and save it here.";
    case 403:
      return `Key was refused (403). Usually one of: the "Generative Language API" is not enabled for this key, or the key is restricted to specific websites. Create the key in Google AI Studio with NO website/referrer restrictions. (Google said: ${googleMessage})`;
    case 404: {
      // Auto-probe which models this key CAN use so the owner sees real ids.
      const available = await listAvailableModels(key);
      const hint =
        available.length > 0
          ? ` Models available for this key: ${available.slice(0, 10).join(", ")}${available.length > 10 ? " …" : ""}.`
          : " Click “Load models for this key” above the model list to see exactly which models your key supports. Fresh Google AI Studio keys usually only have Gemini 3+ models (e.g. gemini-flash-latest or gemini-3.5-flash).";
      return `Model "${model}" is not available for this key.${hint}`;
    }
    case 429:
      return "Free-tier quota reached (429). Wait a minute and test again — if it keeps failing, check quotas in Google AI Studio.";
    case 500:
    case 503:
      return "Google's servers had a hiccup (" + status + "). Try again in a moment.";
    default:
      return `Google answered with HTTP ${status}. (Google said: ${googleMessage})`;
  }
}

export async function POST(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      key?: unknown;
      model?: unknown;
    };

    // Resolve key: newly typed value wins → saved panel value → env var.
    let key = "";
    let keySource = "";
    if (typeof body.key === "string" && body.key.trim()) {
      key = body.key.trim();
      keySource = "the new key you just typed";
    } else {
      try {
        const row = await db.setting.findUnique({ where: { key: "gemini_api_key" } });
        if (row?.value?.trim()) {
          key = row.value.trim();
          keySource = "the key saved in the panel";
        }
      } catch {
        /* DB hiccup — fall through to env */
      }
      if (!key && process.env.GEMINI_API_KEY?.trim()) {
        key = process.env.GEMINI_API_KEY.trim();
        keySource = "the GEMINI_API_KEY environment variable";
      }
    }

    if (!key) {
      return NextResponse.json({
        ok: false,
        message:
          "No API key found. Paste your Google AI Studio key above and save, or set the GEMINI_API_KEY environment variable.",
      });
    }

    // Resolve model: dropdown value → saved value → env → default.
    let model =
      typeof body.model === "string" && body.model.trim() && body.model !== "__custom"
        ? body.model.trim()
        : "";
    if (!model) {
      try {
        const row = await db.setting.findUnique({ where: { key: "gemini_model" } });
        if (row?.value?.trim()) model = row.value.trim();
      } catch {
        /* ignore */
      }
    }
    if (!model) model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(key)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        system_instruction: { parts: [{ text: "You are a connection test. Reply with exactly: OK" }] },
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 10 },
      }),
    });

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
        message: await diagnose(res.status, googleMessage, model, key),
      });
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply =
      data.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? "").join("").trim() || "";

    return NextResponse.json({
      ok: true,
      message: `Connection works! ${model} answered "${reply || "(empty)"}" using ${keySource}.`,
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json({
      ok: false,
      message: isTimeout
        ? "Timed out after 15s. Check this server's internet connection and try again."
        : `Unexpected error: ${err instanceof Error ? err.message.slice(0, 200) : "unknown"}`,
    });
  }
}
