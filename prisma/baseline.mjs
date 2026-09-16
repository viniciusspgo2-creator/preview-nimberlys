/**
 * Auto-baseline for Prisma migrations (Vercel-friendly).
 *
 * Why: a database created before migrations existed (e.g. via `prisma db push`)
 * already has all tables but NO rows in _prisma_migrations. Running
 * `prisma migrate deploy` against it would try to re-create the tables and fail.
 *
 * This script runs BEFORE migrate deploy in the build and:
 *   1. does nothing when there is a migration history (normal path), or when
 *      the app tables don't exist yet (fresh DB — migrate deploy creates them);
 *   2. when the app tables exist WITHOUT history, it marks every local
 *      migration in prisma/migrations as already applied (baseline), so
 *      `migrate deploy` becomes a no-op instead of crashing the build.
 *
 * It never throws: any unexpected error only prints a warning so the real
 * diagnosis happens in `prisma migrate deploy`.
 */

import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(here, "migrations");

const APP_TABLES = ["Post", "Faq", "Setting", "ContactMessage", "PageView", "ChatLog"];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[baseline] DATABASE_URL not set — skipping (nothing to baseline).");
    return;
  }

  const migrationDirs = existsSync(migrationsDir)
    ? readdirSync(migrationsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(join(migrationsDir, d.name, "migration.sql")))
        .map((d) => d.name)
        .sort()
    : [];

  if (migrationDirs.length === 0) {
    console.log("[baseline] no local migrations found — skipping.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    const existing = async (table) => {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
        table
      );
      return rows.length > 0;
    };

    const historyRows = (await existing("_prisma_migrations"))
      ? await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS n FROM "_prisma_migrations" WHERE rolled_back_at IS NULL`)
      : [{ n: 0 }];

    const tablesPresent = (await Promise.all(APP_TABLES.map(existing))).filter(Boolean).length;

    if (historyRows[0].n > 0 || tablesPresent === 0) {
      console.log(
        `[baseline] ok — migration history: ${historyRows[0].n}, app tables present: ${tablesPresent}/${APP_TABLES.length}. Nothing to do.`
      );
      return;
    }

    // Tables exist without history → baseline every local migration as applied.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" TEXT NOT NULL,
        "checksum" TEXT NOT NULL,
        "finished_at" TIMESTAMPTZ(3),
        "migration_name" TEXT NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ(3),
        "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
      )
    `);

    for (const name of migrationDirs) {
      const sql = readFileSync(join(migrationsDir, name, "migration.sql"), "utf8");
      const checksum = createHash("sha384").update(sql).digest("hex");
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","logs","rolled_back_at","started_at","applied_steps_count")
         VALUES ($1, $2, now(), $3, NULL, NULL, now(), 1)`,
        crypto.randomUUID(),
        checksum,
        name
      );
      console.log(`[baseline] marked as applied: ${name}`);
    }
    console.log("[baseline] ✅ database baselined — migrate deploy can now run safely.");
  } catch (err) {
    console.warn("[baseline] warning: could not inspect/baseline database —", err?.message ?? err);
    console.warn("[baseline] continuing; prisma migrate deploy will report the real state.");
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();
