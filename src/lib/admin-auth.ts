/** Admin password lives in PostgreSQL; ADMIN_SECRET signs sessions only. */
import { createHash, createHmac, timingSafeEqual, randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/lib/db";

export const ADMIN_COOKIE = "nimb_admin";
export const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const PASSWORD_HASH_KEY = "admin_password_hash";
const SECRET_KEY = "admin_secret";
const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
type AuthResult = { ok: true } | { ok: false; error: string; status: number };

export function validatePasswordStrength(password: string): string | null {
  if (typeof password !== "string" || password.length < 8) return "Password must be at least 8 characters.";
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
  if (parts.length !== 3 || parts[0] !== "scrypt" || !/^[a-f0-9]{32}$/i.test(parts[1]) || !/^[a-f0-9]{128}$/i.test(parts[2])) return false;
  const expected = Buffer.from(parts[2], "hex");
  const actual = await scryptAsync(password, Buffer.from(parts[1], "hex"), 64);
  return timingSafeEqual(actual, expected);
}

function isDuplicate(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

/** Database errors must never masquerade as an unconfigured admin. */
export async function isAdminConfigured(): Promise<boolean> {
  const row = await db.setting.findUnique({ where: { key: PASSWORD_HASH_KEY } });
  return Boolean(row?.value);
}

export async function setupAdminPassword(password: string): Promise<AuthResult> {
  const error = validatePasswordStrength(password);
  if (error) return { ok: false, error, status: 400 };
  if (await isAdminConfigured()) return { ok: false, error: "The admin password already exists. Sign in instead.", status: 403 };
  const value = await hashPassword(password);
  try {
    // Unique primary key makes concurrent first-access attempts safe.
    await db.setting.create({ data: { key: PASSWORD_HASH_KEY, value } });
    return { ok: true };
  } catch (err) {
    if (isDuplicate(err)) return { ok: false, error: "The admin password already exists. Sign in instead.", status: 403 };
    throw err;
  }
}

export async function updateAdminPassword(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const error = validatePasswordStrength(password);
  if (error) return { ok: false, error };
  const value = await hashPassword(password);
  await db.setting.upsert({ where: { key: PASSWORD_HASH_KEY }, update: { value }, create: { key: PASSWORD_HASH_KEY, value } });
  return { ok: true };
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  if (typeof password !== "string" || !password || password.length > 128) return false;
  const row = await db.setting.findUnique({ where: { key: PASSWORD_HASH_KEY } });
  return row?.value ? verifyPassword(password, row.value) : false;
}

/** Owner-controlled, one-use recovery token. Never reuse ADMIN_SECRET here. */
export async function resetAdminPassword(token: string, password: string): Promise<AuthResult> {
  const configured = process.env.ADMIN_RESET_TOKEN?.trim();
  if (!configured || configured.length < 32 || configured.length > 256 || configured === process.env.ADMIN_SECRET?.trim()) {
    return { ok: false, error: "Recovery is not enabled. Set a separate ADMIN_RESET_TOKEN (32–256 characters) in your hosting settings and redeploy.", status: 503 };
  }
  if (typeof token !== "string" || token.length > 256 || !timingSafeEqual(createHash("sha256").update(token).digest(), createHash("sha256").update(configured).digest())) {
    return { ok: false, error: "Invalid recovery code.", status: 401 };
  }
  const error = validatePasswordStrength(password);
  if (error) return { ok: false, error, status: 400 };
  const usedKey = "admin_reset_used_" + createHash("sha256").update(configured).digest("hex");
  const used = { ok: false as const, error: "This recovery code has already been used. Configure a new code and redeploy.", status: 409 };
  if (await db.setting.findUnique({ where: { key: usedKey } })) return used;
  const value = await hashPassword(password);
  try {
    await db.$transaction(async (tx) => {
      // Consumption and password replacement commit or roll back together.
      await tx.setting.create({ data: { key: usedKey, value: new Date().toISOString() } });
      await tx.setting.upsert({ where: { key: PASSWORD_HASH_KEY }, update: { value }, create: { key: PASSWORD_HASH_KEY, value } });
    });
    return { ok: true };
  } catch (err) {
    if (isDuplicate(err)) return used;
    throw err;
  }
}

async function getSecret(): Promise<string> {
  let secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    const row = await db.setting.upsert({ where: { key: SECRET_KEY }, update: {}, create: { key: SECRET_KEY, value: randomBytes(32).toString("hex") } });
    secret = row.value;
  }
  const credential = await db.setting.findUnique({ where: { key: PASSWORD_HASH_KEY } });
  if (!credential?.value) throw new Error("Admin is not configured.");
  // A password change invalidates all previous sessions, even with a fixed env secret.
  return createHmac("sha256", secret).update(credential.value).digest("hex");
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export async function createToken(): Promise<{ token: string; maxAgeSec: number }> {
  const secret = await getSecret();
  const data = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS }), "utf8").toString("base64url");
  return { token: `${data}.${sign(data, secret)}`, maxAgeSec: Math.floor(TOKEN_TTL_MS / 1000) };
}

export async function verifyToken(token: string | undefined | null): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  try {
    const [data, sig] = parts;
    const expected = sign(data, await getSecret());
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch { return false; }
}

export async function getAdminFromRequest(req: Request): Promise<boolean> {
  for (const pair of (req.headers.get("cookie") ?? "").split(";")) {
    const index = pair.indexOf("=");
    if (index === -1 || pair.slice(0, index).trim() !== ADMIN_COOKIE) continue;
    try { return await verifyToken(decodeURIComponent(pair.slice(index + 1).trim())); }
    catch { return false; }
  }
  return false;
}
