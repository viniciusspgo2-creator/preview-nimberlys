/* Shared mapper for admin Post payloads (server-only helpers).
   Lives in a `_`-prefixed folder so Next.js never treats it as a route. */

import { Prisma } from "@prisma/client";

const SLUG_RE = /^[a-z0-9-]+$/;

export type IncomingPost = {
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  metaTitle?: unknown;
  metaDescription?: unknown;
  cover?: unknown;
  category?: unknown;
  tags?: unknown;
  readingMinutes?: unknown;
  faq?: unknown;
  featured?: unknown;
  published?: unknown;
};

/** Map a JSON body onto Prisma Post fields (tags array→CSV, faq array→JSON). */
export function mapPostBody(
  body: IncomingPost,
  partial: boolean
): Prisma.PostUncheckedCreateInput {
  const data: Record<string, unknown> = {};
  const has = (k: keyof IncomingPost) =>
    Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("title")) {
    const title = String(body.title ?? "").trim();
    if (!title) throw new Error("Title is required.");
    data.title = title;
  }
  if (!partial || has("slug")) {
    const slug = String(body.slug ?? "").trim().toLowerCase();
    if (!SLUG_RE.test(slug)) {
      throw new Error(
        "Slug may only contain lowercase letters, numbers and dashes."
      );
    }
    data.slug = slug;
  }
  if (!partial || has("excerpt")) {
    const excerpt = String(body.excerpt ?? "").trim();
    if (!excerpt) throw new Error("Excerpt is required.");
    data.excerpt = excerpt;
  }
  if (!partial || has("content")) {
    const content = String(body.content ?? "").trim();
    if (!content) throw new Error("Content is required.");
    data.content = content;
  }
  if (!partial || has("metaTitle")) {
    data.metaTitle =
      String(body.metaTitle ?? "").trim() || String(data.title ?? "") || "Untitled";
  }
  if (!partial || has("metaDescription")) {
    data.metaDescription = String(body.metaDescription ?? "").trim();
  }
  if (!partial || has("cover")) {
    data.cover =
      String(body.cover ?? "").trim() || "/images/gallery/hero-classroom.webp?v=4";
  }
  if (!partial || has("category")) {
    data.category = String(body.category ?? "").trim() || "Choosing Child Care";
  }
  if (has("tags") || !partial) {
    const t = body.tags;
    data.tags = Array.isArray(t)
      ? t.map((x) => String(x).trim()).filter(Boolean).join(", ")
      : String(t ?? "").trim();
  }
  if (has("readingMinutes") || !partial) {
    const n = Number(body.readingMinutes);
    data.readingMinutes =
      Number.isFinite(n) && n > 0 ? Math.round(n) : 5;
  }
  if (has("faq") || !partial) {
    const f = body.faq;
    let faqArr: { question: string; answer: string }[] = [];
    if (Array.isArray(f)) {
      faqArr = f
        .map((item) => {
          const q = (item as { question?: unknown; answer?: unknown }) ?? {};
          return {
            question: String(q.question ?? "").trim(),
            answer: String(q.answer ?? "").trim(),
          };
        })
        .filter((x) => x.question || x.answer);
    }
    data.faq = JSON.stringify(faqArr);
  }
  if (has("featured") || !partial) {
    data.featured = Boolean(body.featured);
  }
  if (has("published") || !partial) {
    data.published =
      body.published === undefined ? true : Boolean(body.published);
  }
  return data as Prisma.PostUncheckedCreateInput;
}
