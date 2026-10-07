import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createToken, setupAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * First-access setup: creates the admin password (there is no default).
 * Only works while no password exists; afterwards it returns 403 and the
 * normal login flow takes over. Signs the new admin in on success.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      password?: unknown;
      confirm?: unknown;
    };
    const password = typeof body.password === "string" ? body.password : "";
    const confirm = typeof body.confirm === "string" ? body.confirm : "";

    if (!password) {
      return NextResponse.json(
        { ok: false, error: "Please choose a password." },
        { status: 400 }
      );
    }
    if (password !== confirm) {
      return NextResponse.json(
        { ok: false, error: "Passwords don't match. Please check and try again." },
        { status: 400 }
      );
    }

    const result = await setupAdminPassword(password);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status }
      );
    }

    const { token, maxAgeSec } = await createToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSec,
    });
    return res;
  } catch (err) {
    console.error("[admin/setup]", err);
    return NextResponse.json(
      { ok: false, error: "Setup failed. Please try again." },
      { status: 500 }
    );
  }
}
