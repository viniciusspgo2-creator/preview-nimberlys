import { PrismaClient } from '@prisma/client'

/**
 * Resolves the PostgreSQL connection string.
 *
 * Production (Vercel): DATABASE_URL is set in the dashboard → used as-is.
 * Local dev: an embedded PostgreSQL runs via `bun run db:up`.
 *   - If DATABASE_URL is missing or points to a legacy SQLite file
 *     (stale sandbox env), we fall back to the local embedded server.
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim()
  if (url && (url.startsWith('postgresql://') || url.startsWith('postgres://'))) {
    return url
  }
  // Local embedded PostgreSQL (scripts/dev-db.ts)
  return 'postgresql://postgres:postgres@127.0.0.1:5432/nimberlys'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
