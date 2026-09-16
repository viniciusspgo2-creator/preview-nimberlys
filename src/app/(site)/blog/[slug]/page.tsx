import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Phone } from "lucide-react";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Blob, Sparkle } from "@/components/shared/decor";
import { Reveal } from "@/components/shared/Reveal";
import { CategoryChip, type PostCardData } from "@/components/blog/PostCard";
import {
  ArticleBreadcrumb,
  ArticleMeta,
  ArticleShare,
  ArticleTags,
} from "@/components/blog/ArticleExtras";
import { ArticleToc, type TocItem } from "@/components/blog/ArticleToc";
import { PostFaq, type FaqItem } from "@/components/blog/ArticleFaq";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { BlogCtaBand } from "@/components/blog/BlogCtaBand";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------
   Data loading (memoized per request) — never throws.
   ------------------------------------------------------------------ */
type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  cover: string;
  category: string;
  tags: string;
  readingMinutes: number;
  faq: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const getPost = cache(async (slug: string): Promise<PostRow | null> => {
  try {
    return (await db.post.findUnique({ where: { slug } })) as PostRow | null;
  } catch (err) {
    console.error("[blog] failed to load post:", err);
    return null;
  }
});

/* ------------------------------------------------------------------
   SEO metadata (English, per client requirement)
   ------------------------------------------------------------------ */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const url = `/blog/${post.slug}`;
  const keywords = parseTags(post.tags);

  return {
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: new Date(post.createdAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [SITE.legalName],
      section: post.category,
      tags: keywords,
      images: [{ url: post.cover, width: 1200, height: 900, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.cover],
    },
  };
}

/* ------------------------------------------------------------------
   Content helpers — TOC extraction, heading ids, FAQ/tags parsing
   ------------------------------------------------------------------ */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractHeadings(html: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text) items.push({ id: slugify(text), text });
  }
  return items;
}

/** Injects id="..." anchors into every <h2> so TOC links can jump */
function injectHeadingIds(html: string): string {
  return html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (_m, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const id = slugify(text);
      return id ? `<h2${attrs} id="${id}">${inner}</h2>` : `<h2${attrs}>${inner}</h2>`;
    },
  );
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFaq(raw: string): FaqItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FaqItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as FaqItem).question === "string" &&
        typeof (item as FaqItem).answer === "string",
    );
  } catch {
    return [];
  }
}

async function loadRelated(
  category: string,
  slug: string,
): Promise<PostCardData[]> {
  try {
    let rows = await db.post.findMany({
      where: { published: true, category, NOT: { slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    if (rows.length < 3) {
      const filler = await db.post.findMany({
        where: {
          published: true,
          NOT: { slug: { in: [slug, ...rows.map((r) => r.slug)] } },
        },
        orderBy: { createdAt: "desc" },
        take: 3 - rows.length,
      });
      rows = [...rows, ...filler];
    }
    return rows.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      readingMinutes: p.readingMinutes,
      cover: p.cover,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("[blog] failed to load related posts:", err);
    return [];
  }
}

/* ------------------------------------------------------------------
   Article body typography — scoped styles for raw HTML content.
   (No typography plugin; rendered via a plain <style> tag.)
   ------------------------------------------------------------------ */
const POST_BODY_CSS = `
.post-body { color: #5b6880; font-size: 1.05rem; line-height: 1.85; }
.post-body > *:first-child { margin-top: 0; }
.post-body h2 {
  font-family: var(--font-fredoka), sans-serif;
  color: #2e3a54; font-size: 1.5rem; font-weight: 600; line-height: 1.3;
  margin: 2.5rem 0 1rem; padding-left: 0.85rem;
  border-left: 5px solid #f43f6d; border-radius: 2px;
  scroll-margin-top: 7.5rem;
}
.post-body h3 {
  font-family: var(--font-fredoka), sans-serif;
  color: #2e3a54; font-size: 1.2rem; font-weight: 600; line-height: 1.4;
  margin: 2rem 0 0.75rem;
}
.post-body p { margin: 0 0 1.15rem; }
.post-body strong { color: #2e3a54; font-weight: 700; }
.post-body em { color: #2e3a54; }
.post-body a {
  color: #2278e0; font-weight: 700; text-decoration: underline;
  text-decoration-thickness: 2px; text-underline-offset: 3px;
  transition: color 0.2s ease;
}
.post-body a:hover { color: #f43f6d; }
.post-body ul { margin: 0 0 1.3rem; padding: 0; list-style: none; display: grid; gap: 0.55rem; }
.post-body ul li { position: relative; padding-left: 1.6rem; }
.post-body ul li::before {
  content: ""; position: absolute; left: 0.2rem; top: 0.6em;
  width: 0.55rem; height: 0.55rem; border-radius: 999px; background: #f43f6d;
}
.post-body ol { margin: 0 0 1.3rem; padding-left: 1.6rem; display: grid; gap: 0.55rem; }
.post-body ol li { padding-left: 0.35rem; }
.post-body ol li::marker { color: #f43f6d; font-weight: 800; }
.post-body blockquote {
  margin: 1.8rem 0; padding: 1rem 1.4rem;
  background: #fff6dc; border-left: 5px solid #ffc42e; border-radius: 1rem;
  color: #2e3a54; font-weight: 600;
}
.post-body img { max-width: 100%; border-radius: 1.25rem; }
@media (min-width: 640px) {
  .post-body { font-size: 1.08rem; }
  .post-body h2 { font-size: 1.65rem; margin: 2.75rem 0 1.1rem; }
  .post-body h3 { font-size: 1.28rem; }
}
`;

/* ------------------------------------------------------------------
   Page
   ------------------------------------------------------------------ */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  const faqs = parseFaq(post.faq);
  const tags = parseTags(post.tags);
  const tocItems = extractHeadings(post.content);
  const bodyHtml = injectHeadingIds(post.content);
  const related = await loadRelated(post.category, post.slug);
  const pageUrl = `/blog/${post.slug}`;

  const jsonLd = [
    articleJsonLd({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      cover: post.cover,
      createdAt: post.createdAt,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: pageUrl },
    ]),
    ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
  ];

  return (
    <article>
      <style dangerouslySetInnerHTML={{ __html: POST_BODY_CSS }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---------------- Header ---------------- */}
      <header className="relative overflow-hidden">
        <Blob className="-left-32 -top-28 h-80 w-80" color="#FDE5EC" />
        <Blob className="-right-28 top-10 h-72 w-72" color="#FFF6DC" />
        <Sparkle className="absolute left-[8%] top-24 w-5 animate-twinkle" />
        <Sparkle
          className="absolute right-[10%] top-40 hidden w-6 animate-twinkle sm:block"
          color="#F43F6D"
          style={{ animationDelay: "0.9s" }}
        />

        <div className="container-site relative pb-2 pt-10 lg:pt-14">
          <Reveal>
            <ArticleBreadcrumb category={post.category} />
          </Reveal>

          <div className="mx-auto mt-9 max-w-3xl text-center">
            <Reveal from="scale">
              <CategoryChip category={post.category} className="!text-[0.72rem] !px-4 !py-2" />
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-balance font-display text-3xl font-semibold leading-[1.15] text-ink sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]">
                {post.title}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <ArticleMeta
                dateIso={post.createdAt.toISOString()}
                minutes={post.readingMinutes}
              />
            </Reveal>
          </div>

          <Reveal delay={0.2} className="mt-11">
            <figure className="relative mx-auto max-w-5xl">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-4xl shadow-[var(--shadow-lift)] sm:aspect-[16/9] lg:aspect-[2/1]">
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </Reveal>
        </div>
      </header>

      {/* ---------------- Body + TOC ---------------- */}
      <div className="container-site">
        <div className="mx-auto grid max-w-6xl gap-10 pb-8 pt-12 lg:pt-14 xl:grid-cols-[46rem_17rem] xl:justify-center">
          <div className="min-w-0 xl:pt-2">
            <div
              className="post-body mx-auto max-w-[46rem]"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            <div className="mx-auto max-w-[46rem]">
              <ArticleTags tags={tags} />
              <ArticleShare slug={post.slug} title={post.title} />

              {/* Author card */}
              <Reveal className="mt-12">
                <aside className="card-soft flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-7">
                  <Image
                    src="/images/logo-mark.png"
                    alt="Nimberly's Daycare logo"
                    width={128}
                    height={128}
                    className="h-16 w-16 shrink-0 rounded-full bg-cream object-contain p-1.5 ring-4 ring-pink-soft"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold text-ink">
                      Nimberly&apos;s Team
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Real tips from our days learning, playing, and growing
                      with Bay Point&apos;s littlest learners.
                    </p>
                  </div>
                  <a href={SITE.phoneHref} className="btn-outline btn-sm shrink-0">
                    <Phone className="h-4 w-4" aria-hidden />
                    {SITE.phone}
                  </a>
                </aside>
              </Reveal>

              <PostFaq faqs={faqs} />
            </div>
          </div>

          <aside className="hidden xl:block">
            <ArticleToc items={tocItems} />
          </aside>
        </div>
      </div>

      {/* ---------------- Related + CTA ---------------- */}
      <RelatedPosts posts={related} />
      <BlogCtaBand />
    </article>
  );
}
