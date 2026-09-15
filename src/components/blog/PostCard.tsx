"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/shared/Reveal";
import { categoryStyle } from "./categories";
import React from "react";

/* ============================================================
   PostCard — the reusable blog card (grid + related posts)
   ============================================================ */

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  cover: string;
  createdAt: string; // ISO string
};

/** Deterministic "Mar 12, 2025" formatting (UTC to keep SSR/client identical) */
export function formatPostDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Category chip — soft pastel style used inside card bodies */
export function CategoryChip({
  category,
  className = "",
}: {
  category: string;
  className?: string;
}) {
  const cs = categoryStyle(category);
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] shadow-sm ${cs.badge} ${className}`}
    >
      {category}
    </span>
  );
}

/** Date + reading time meta row, shared by all card sizes */
export function PostMeta({
  post,
  className = "",
}: {
  post: PostCardData;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] font-bold text-ink-faint ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-sky-pop" aria-hidden />
        <time dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-green-pop" aria-hidden />
        {post.readingMinutes} {t("blog.minRead")}
      </span>
    </div>
  );
}

/** The standard 3-column grid card */
export function PostCard({
  post,
  delay = 0,
}: {
  post: PostCardData;
  delay?: number;
}) {
  const { t } = useI18n();
  return (
    <Reveal delay={delay} className="h-full">
      <article className="card-soft card-hover group h-full overflow-hidden">
        <Link
          href={`/blog/${post.slug}`}
          aria-label={post.title}
          className="flex h-full flex-col focus-visible:outline-none"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            />
            <span
              className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] shadow-md ${categoryStyle(post.category).overlay}`}
            >
              {post.category}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="line-clamp-2 font-display text-xl font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-pink-pop">
              {post.title}
            </h3>
            <p className="mt-2.5 line-clamp-3 text-[0.92rem] leading-relaxed text-ink-soft">
              {post.excerpt}
            </p>

            <div className="mt-auto flex flex-col gap-4 pt-5">
              <PostMeta post={post} />
              <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-pink-pop transition-all duration-300 group-hover:gap-3">
                {t("common.readMore")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}
