/**
 * One-time migration: legacy SQLite (sandbox) → PostgreSQL.
 *
 * Reads the old db/custom.db with bun:sqlite and upserts every table
 * into the PostgreSQL database pointed to by DATABASE_URL.
 *
 * Usage: bun scripts/migrate-sqlite-data.ts
 */

import { PrismaClient } from "@prisma/client";
import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";

const SQLITE_PATH = "db/custom.db";
const LEGACY_PASSWORD_KEYS = new Set(["admin_password"]); // replaced by the setup flow

if (!existsSync(SQLITE_PATH)) {
  console.error(`[migrate] legacy database not found at ${SQLITE_PATH} — nothing to do.`);
  process.exit(0);
}

const sqlite = new Database(SQLITE_PATH, { readonly: true });
const pg = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/nimberlys" } },
});

type Row = Record<string, unknown>;

function rows(table: string): Row[] {
  try {
    return sqlite.query(`SELECT * FROM "${table}"`).all() as Row[];
  } catch {
    return [];
  }
}

/** SQLite/Prisma stores DateTime as epoch ms (number) — parse safely. */
function toDate(value: unknown): Date | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  const raw = String(value);
  const asNum = Number(raw);
  const d = Number.isFinite(asNum) && /^\d+$/.test(raw.trim()) ? new Date(asNum) : new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

async function main() {
  /* ---------- Settings ---------- */
  const settings = rows("Setting");
  for (const s of settings) {
    const key = String(s.key);
    if (LEGACY_PASSWORD_KEYS.has(key)) continue; // old plaintext password → setup flow handles it
    await pg.setting.upsert({
      where: { key },
      update: { value: String(s.value ?? "") },
      create: { key, value: String(s.value ?? "") },
    });
  }
  console.log(`settings: ${settings.length} processed`);

  /* ---------- Blog posts ---------- */
  const posts = rows("Post");
  for (const p of posts) {
    const data = {
      slug: String(p.slug),
      title: String(p.title),
      excerpt: String(p.excerpt ?? ""),
      content: String(p.content ?? ""),
      metaTitle: String(p.metaTitle ?? p.title ?? ""),
      metaDescription: String(p.metaDescription ?? ""),
      cover: String(p.cover ?? ""),
      category: String(p.category ?? "General"),
      tags: String(p.tags ?? ""),
      readingMinutes: Number(p.readingMinutes ?? 5),
      faq: String(p.faq ?? "[]"),
      featured: Boolean(p.featured),
      published: p.published === undefined ? true : Boolean(p.published),
      createdAt: toDate(p.createdAt),
      updatedAt: toDate(p.updatedAt),
    };
    await pg.post.upsert({ where: { slug: data.slug }, update: data, create: data });
  }
  console.log(`posts: ${posts.length} processed`);

  /* ---------- FAQs ---------- */
  const faqs = rows("Faq");
  if (faqs.length > 0) {
    const existing = await pg.faq.count();
    if (existing === 0) {
      for (const f of faqs) {
        await pg.faq.create({
          data: {
            question: String(f.question),
            answer: String(f.answer ?? ""),
            category: String(f.category ?? "General"),
            order: Number(f.order ?? 0),
            published: f.published === undefined ? true : Boolean(f.published),
          },
        });
      }
    }
  }
  console.log(`faqs: ${faqs.length} processed`);

  /* ---------- Contact messages ---------- */
  const messages = rows("ContactMessage");
  const msgCount = await pg.contactMessage.count();
  if (messages.length > 0 && msgCount === 0) {
    for (const m of messages) {
      await pg.contactMessage.create({
        data: {
          name: String(m.name),
          email: String(m.email),
          phone: m.phone ? String(m.phone) : null,
          childAge: m.childAge ? String(m.childAge) : null,
          message: String(m.message ?? ""),
          handled: Boolean(m.handled),
          createdAt: toDate(m.createdAt),
        },
      });
    }
  }
  console.log(`contact messages: ${messages.length} processed`);

  /* ---------- Page views ---------- */
  const views = rows("PageView");
  const viewCount = await pg.pageView.count();
  if (views.length > 0 && viewCount === 0) {
    await pg.pageView.createMany({
      data: views.map((v) => ({
        path: String(v.path ?? "/"),
        sessionId: String(v.sessionId ?? "anon"),
        referrer: v.referrer ? String(v.referrer) : null,
        createdAt: toDate(v.createdAt),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`page views: ${views.length} processed`);

  /* ---------- Chat logs ---------- */
  const logs = rows("ChatLog");
  const logCount = await pg.chatLog.count();
  if (logs.length > 0 && logCount === 0) {
    await pg.chatLog.createMany({
      data: logs.map((l) => ({
        role: String(l.role ?? "user"),
        content: String(l.content ?? ""),
        sessionId: String(l.sessionId ?? "anon"),
        provider: l.provider ? String(l.provider) : null,
        createdAt: toDate(l.createdAt),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`chat logs: ${logs.length} processed`);

  console.log(
    `\n[migrate] ✅ done → posts:${await pg.post.count()} faqs:${await pg.faq.count()} settings:${await pg.setting.count()}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await pg.$disconnect();
  });
