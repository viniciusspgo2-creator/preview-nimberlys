"use client";

import Image from "@/components/shared/SiteImage";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Facebook,
  Mail,
  Tag,
  Twitter,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SEO } from "@/lib/seo";
import { formatPostDate } from "./PostCard";
import React from "react";

/* ============================================================
   Article chrome — small translatable client pieces used on
   the article page: breadcrumb, byline meta row, tags, share.
   ============================================================ */

/** Home › Blog › Category — semantic nav with aria labels */
export function ArticleBreadcrumb({ category }: { category: string }) {
  const { t } = useI18n();
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.82rem] font-bold text-ink-faint">
        <li>
          <Link
            href="/"
            className="rounded px-0.5 transition-colors hover:text-pink-pop"
          >
            {t("nav.home")}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <Link
            href="/blog"
            className="rounded px-0.5 transition-colors hover:text-pink-pop"
          >
            {t("nav.blog")}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li aria-current="page" className="text-ink-soft">
          {category}
        </li>
      </ol>
    </nav>
  );
}

/** Byline row: logo-mark avatar + "By Nimberly's Team" + date + reading time */
export function ArticleMeta({
  dateIso,
  minutes,
}: {
  dateIso: string;
  minutes: number;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-bold text-ink-soft">
      <span className="inline-flex items-center gap-2.5">
        <Image
          src="/images/logo-mark.png"
          alt=""
          width={72}
          height={72}
          className="h-9 w-9 rounded-full bg-white object-contain p-1 ring-2 ring-pink-soft"
        />
        {t("blog.by")}
      </span>
      <span
        className="hidden h-1.5 w-1.5 rounded-full bg-pink-pop sm:inline-block"
        aria-hidden
      />
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4 text-sky-pop" aria-hidden />
        <time dateTime={dateIso}>{formatPostDate(dateIso)}</time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-green-pop" aria-hidden />
        {minutes} {t("blog.minRead")}
      </span>
    </div>
  );
}

/** Tag chips row */
export function ArticleTags({ tags }: { tags: string[] }) {
  const { t } = useI18n();
  if (tags.length === 0) return null;
  return (
    <div className="mt-12 flex flex-wrap items-center gap-2.5">
      <span className="mr-1 inline-flex items-center gap-1.5 font-display text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        <Tag className="h-4 w-4 text-magenta-pop" aria-hidden />
        {t("blog.tags")}
      </span>
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-white px-4 py-1.5 text-[0.8rem] font-bold text-ink-soft shadow-[var(--shadow-card)] transition-colors hover:text-pink-pop"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

/** Share row: Facebook / X-Twitter / Email */
export function ArticleShare({ slug, title }: { slug: string; title: string }) {
  const { t } = useI18n();
  const url = `${SEO.siteUrl}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: Facebook,
      cls: "bg-brand hover:bg-brand-deep hover:shadow-[var(--shadow-glow-blue)]",
    },
    {
      label: "Share on Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: Twitter,
      cls: "bg-sky-pop hover:bg-brand hover:shadow-[var(--shadow-glow-blue)]",
    },
    {
      label: "Share by email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      Icon: Mail,
      cls: "bg-pink-pop hover:bg-[#e22c5c] hover:shadow-[var(--shadow-glow-pink)]",
    },
  ];

  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-4 border-t-2 border-dashed border-ink/10 pt-8">
      <span className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {t("blog.share")}
      </span>
      <div className="flex items-center gap-2.5">
        {links.map(({ label, href, Icon, cls }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-md transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-pop/30 ${cls}`}
          >
            <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  );
}
