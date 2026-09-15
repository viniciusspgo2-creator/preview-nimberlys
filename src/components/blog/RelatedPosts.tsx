"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useI18n } from "@/lib/i18n";
import { PostCard, type PostCardData } from "./PostCard";
import React from "react";

/* ============================================================
   RelatedPosts — "You may also like" section
   ============================================================ */

export function RelatedPosts({ posts }: { posts: PostCardData[] }) {
  const { t } = useI18n();
  if (posts.length === 0) return null;

  return (
    <section className="container-site py-14 lg:py-16">
      <SectionHeading title={t("blog.related")} />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} delay={i * 0.08} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/blog" className="btn-outline btn-md">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("blog.backToBlog")}
        </Link>
      </div>
    </section>
  );
}
