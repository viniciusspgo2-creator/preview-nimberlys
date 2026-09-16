import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ZIP_NAME = "nimberlys-daycare-vercel.zip";

/**
 * Admin-only project download (the deploy ZIP).
 *
 * The ZIP lives in /assets (OUTSIDE /public) so it is never served as a
 * static file — visitors can never download the source code. It is bundled
 * into this route's serverless function via next.config.ts
 * `outputFileTracingIncludes`, which makes it work on Vercel too.
 */
export async function GET(req: Request) {
  if (!(await getAdminFromRequest(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const zip = await readFile(path.join(process.cwd(), "assets", ZIP_NAME));
    return new NextResponse(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${ZIP_NAME}"`,
        "Content-Length": String(zip.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Project ZIP not found on the server." },
      { status: 404 }
    );
  }
}
