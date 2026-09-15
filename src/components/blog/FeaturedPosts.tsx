"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useI18n } from "@/lib/i18n";
import { categoryStyle } from "./categories";
import { PostMeta, type PostCardData } from "./PostCard";
import React from "react";

/* ============================================================
   FeaturedPosts — 1 large feature card + 2 stacked cards
   ============================================================ */

export function FeaturedPosts({ posts }: { posts: PostCardData[] }) {
  const { t } = useI18n();
  if (posts.length === 0) return null;

  const [first, ...rest] = posts;

  return (
    <section className="container-site py-12 lg:py-16">
      <SectionHeading title={t("blog.featured")} />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Large feature card */}
        <Reveal className="h-full">
          <article className="card-soft card-hover group h-full overflow-hidden">
            <Link
              href={`/blog/${first.slug}`}
              aria-label={first.title}
              className="flex h-full flex-col focus-visible:outline-none md:flex-row"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto md:w-[52%]">
                <Image
                  src={first.cover}
                  alt={first.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <span className="chip-info absolute left-4 top-4 !bg-yellow-pop/95 !shadow-lg">
                  <Star className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden />
                  {t("blog.featured")}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6 lg:p-8">
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] shadow-sm ${categoryStyle(first.category).badge}`}
                >
                  {first.category}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-pink-pop lg:text-[1.7rem]">
                  {first.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-[0.95rem] leading-relaxed text-ink-soft">
                  {first.excerpt}
                </p>
                <div className="mt-auto flex flex-col gap-4 pt-6">
                  <PostMeta post={first} />
                  <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-pink-pop transition-all duration-300 group-hover:gap-3">
                    {t("common.readMore")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        </Reveal>

        {/* Two stacked cards */}
        <div className="flex flex-col gap-6">
          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={0.12 + i * 0.1} className="flex-1">
              <article className="card-soft card-hover group h-full overflow-hidden">
                <Link
                  href={`/blog/${post.slug}`}
                  aria-label={post.title}
                  className="flex h-full flex-col focus-visible:outline-none sm:flex-row"
                >
                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-[36%]">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 22vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.08em] shadow-sm ${categoryStyle(post.category).badge}`}
                    >
                      {post.category}
                    </span>
                    <h3 className="mt-2.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-pink-pop">
                      {post.title}
                    </h3>
                    <p className="mt-2 hidden line-clamp-2 text-sm leading-relaxed text-ink-soft lg:block">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-3">
                      <PostMeta post={post} />
                    </div>
                  </div>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
