import type { Metadata } from "next";
import { db } from "@/lib/db";
import { BlogHero } from "@/components/blog/BlogHero";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { BlogCtaBand } from "@/components/blog/BlogCtaBand";
import type { PostCardData } from "@/components/blog/PostCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Daycare & Parenting Tips Blog | Nimberly's Daycare Bay Point, CA",
  },
  description:
    "Practical daycare and parenting tips for Bay Point families — choosing child care, child development, healthy eating, and California subsidy programs, from the Nimberly's team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Daycare & Parenting Tips Blog | Nimberly's Daycare",
    description:
      "Tips, guidance, and real talk for families — from our family to yours.",
    url: "/blog",
    type: "website",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

/* ------------------------------------------------------------------
   Data loading — never crash: any failure degrades to an empty
   list and the page shows the friendly empty state.
   ------------------------------------------------------------------ */
type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  cover: string;
  featured: boolean;
  createdAt: Date;
};

async function loadPosts(): Promise<PostRow[]> {
  try {
    return await db.post.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("[blog] failed to load posts:", err);
    return [];
  }
}

export default async function BlogListingPage() {
  const rows = await loadPosts();

  const all = rows.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    readingMinutes: p.readingMinutes,
    cover: p.cover,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
  }));

  const posts: PostCardData[] = all.map(
    ({ featured: _featured, ...card }) => card,
  );

  // Top 3 featured posts (ordering already puts featured first);
  // fall back to the first 3 posts when nothing is flagged.
  const flagged = all.filter((p) => p.featured);
  const featuredRows = flagged.length > 0 ? flagged : all.slice(0, 3);
  const featured: PostCardData[] = featuredRows
    .slice(0, 3)
    .map(({ featured: _featured, ...card }) => card);
  const featuredSlugs = featured.map((p) => p.slug);

  return (
    <>
      <BlogHero />

      <FeaturedPosts posts={featured} />

      <BlogExplorer posts={posts} excludeSlugs={featuredSlugs} />

      <BlogCtaBand />
    </>
  );
}
