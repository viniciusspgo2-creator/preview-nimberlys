/* ============================================================
   NIMBERLY'S ADMIN — lightweight auth (no NextAuth)

   • Password is created on FIRST ACCESS (setup flow) — there is
     no default password. Stored as a salted scrypt hash in the
     Setting table under "admin_password_hash".
   • Session = HMAC-SHA256 signed token in an httpOnly cookie
     ("nimb_admin"), valid for 12h.
   • Token secret = process.env.ADMIN_SECRET (production) or a
     random value persisted once in Setting "admin_secret".
   ============================================================ */

import { createHmac, timingSafeEqual, randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/lib/db";

export const ADMIN_COOKIE = "nimb_admin";
export const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const PASSWORD_HASH_KEY = "admin_password_hash";
const SECRET_KEY = "admin_secret";
const MIN_PASSWORD_LENGTH = 8;

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

/* ---------------- password hashing (scrypt) ---------------- */

export function validatePasswordStrength(password: string): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 128) return "Password is too long (max 128 characters).";
  return null;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  try {
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    const actual = await scryptAsync(password, salt, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ---------------- password state / setup ---------------- */

/** True once the admin password has been created (setup completed). */
export async function isAdminConfigured(): Promise<boolean> {
  try {
    const row = await db.setting.findUnique({ where: { key: PASSWORD_HASH_KEY } });
    return Boolean(row?.value);
  } catch {
    return false;
  }
}

/**
 * First-access setup: create the admin password.
 * Only succeeds when no password exists yet (otherwise it would
 * let an attacker silently replace the real one).
 */
export async function setupAdminPassword(password: string): Promise<
  { ok: true } | { ok: false; error: string; status: number }
> {
  if (!(await isAdminConfigured())) {
    const strengthError = validatePasswordStrength(password);
    if (strengthError) return { ok: false, error: strengthError, status: 400 };
    const hashed = await hashPassword(password);
    await db.setting.upsert({
      where: { key: PASSWORD_HASH_KEY },
      update: { value: hashed },
      create: { key: PASSWORD_HASH_KEY, value: hashed },
    });
    return { ok: true };
  }
  return {
    ok: false,
    error: "The admin password already exists. Sign in instead.",
    status: 403,
  };
}

/** Change the password from the (authenticated) settings area. */
export async function updateAdminPassword(password: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const strengthError = validatePasswordStrength(password);
  if (strengthError) return { ok: false, error: strengthError };
  const hashed = await hashPassword(password);
  await db.setting.upsert({
    where: { key: PASSWORD_HASH_KEY },
    update: { value: hashed },
    create: { key: PASSWORD_HASH_KEY, value: hashed },
  });
  return { ok: true };
}

/** Constant-time-ish password check against the stored scrypt hash. */
export async function checkAdminPassword(password: string): Promise<boolean> {
  if (!password || typeof password !== "string") return false;
  try {
    const row = await db.setting.findUnique({ where: { key: PASSWORD_HASH_KEY } });
    if (!row?.value) return false; // not configured yet → nothing to match
    return verifyPassword(password, row.value);
  } catch {
    return false;
  }
}

/* ---------------- token API ---------------- */

async function getSecret(): Promise<string> {
  if (process.env.ADMIN_SECRET?.trim()) return process.env.ADMIN_SECRET.trim();
  try {
    const row = await db.setting.findUnique({ where: { key: SECRET_KEY } });
    if (row?.value) return row.value;
    // First run without ADMIN_SECRET: persist a random secret so sessions
    // survive server restarts (production should still set ADMIN_SECRET).
    const generated = randomBytes(32).toString("hex");
    await db.setting.upsert({
      where: { key: SECRET_KEY },
      update: {},
      create: { key: SECRET_KEY, value: generated },
    });
    return generated;
  } catch {
    // DB unavailable — ephemeral secret for this process only.
    return randomBytes(32).toString("hex");
  }
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

/** Create a signed token valid for 12h. */
export async function createToken(): Promise<{ token: string; maxAgeSec: number }> {
  const secret = await getSecret();
  const payload = JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS });
  const data = Buffer.from(payload, "utf8").toString("base64url");
  const token = `${data}.${sign(data, secret)}`;
  return { token, maxAgeSec: Math.floor(TOKEN_TTL_MS / 1000) };
}

/** Verify a token's signature + expiry. */
export async function verifyToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [data, sig] = parts;
  if (!data || !sig) return false;

  const secret = await getSecret();
  const expected = sign(data, secret);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** Extract the admin cookie value from a Request (cookie header). */
function tokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const name = pair.slice(0, idx).trim();
    if (name === ADMIN_COOKIE) {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return null;
}

/** True when the request carries a valid admin cookie. */
export async function getAdminFromRequest(req: Request): Promise<boolean> {
  const token = tokenFromCookieHeader(req.headers.get("cookie"));
  return verifyToken(token);
}
