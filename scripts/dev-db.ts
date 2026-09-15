/**
 * Local development PostgreSQL (embedded, userland — no root required).
 *
 * Starts a real PostgreSQL server on 127.0.0.1:5432 using embedded-postgres
 * binaries, with the same interface production will use on Vercel
 * (Neon / Vercel Postgres) via DATABASE_URL.
 *
 * Usage: bun run db:up   (keep it running in a background terminal)
 */

import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "pgdata");
const PORT = 5432;
const USER = "postgres";
const PASSWORD = "postgres";
const DATABASE = "nimberlys";

async function main() {
  const fresh = !existsSync(join(DATA_DIR, "PG_VERSION"));

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: true,
    onLog: () => {}, // keep the console clean
    onError: (msg: string) => console.error("[pg]", msg),
  });

  if (fresh) {
    console.log(`[dev-db] initialising cluster at ${DATA_DIR} …`);
    await pg.initialise();
  }

  console.log(`[dev-db] starting PostgreSQL ${fresh ? "" : "(existing cluster)"}…`);
  await pg.start();

  try {
    await pg.createDatabase(DATABASE);
    console.log(`[dev-db] created database "${DATABASE}"`);
  } catch {
    // already exists — fine
  }

  console.log(
    `[dev-db] ✅ PostgreSQL ready → postgresql://${USER}:${PASSWORD}@127.0.0.1:${PORT}/${DATABASE}`
  );
  console.log("[dev-db] press Ctrl+C to stop");

  // Keep the process alive so the server stays up.
  const keepAlive = setInterval(() => {}, 1 << 30);
  const shutdown = async (signal: string) => {
    console.log(`\n[dev-db] ${signal} received — stopping PostgreSQL…`);
    clearInterval(keepAlive);
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[dev-db] failed:", err);
  process.exit(1);
});
