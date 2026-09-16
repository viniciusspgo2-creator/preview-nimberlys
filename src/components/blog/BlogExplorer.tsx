"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { useI18n } from "@/lib/i18n";
import { ALL_PILL_DOT, categoryStyle } from "./categories";
import { PostCard, type PostCardData } from "./PostCard";
import React from "react";

/* ============================================================
   BlogExplorer — client-side category pills + search + grid
   ============================================================ */

const ALL = "__all__";

export function BlogExplorer({
  posts,
  excludeSlugs = [],
}: {
  posts: PostCardData[];
  excludeSlugs?: string[];
}) {
  const { t } = useI18n();
  const [active, setActive] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  // Distinct categories, order of first appearance
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const p of posts) {
      if (p.category && !seen.includes(p.category)) seen.push(p.category);
    }
    return seen;
  }, [posts]);

  const filtered = useMemo(() => {
    const isDefaultView = active === ALL && query.trim() === "";
    const base = isDefaultView
      ? posts.filter((p) => !excludeSlugs.includes(p.slug))
      : posts;
    const q = query.trim().toLowerCase();
    return base.filter((p) => {
      const inCategory = active === ALL || p.category === active;
      const inQuery =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [posts, active, query, excludeSlugs]);

  const countFor = (category: string) =>
    posts.filter((p) => p.category === category).length;

  return (
    <section className="container-site py-12 lg:py-16" id="all-posts">
      <SectionHeading title={t("blog.allPosts")} />

      {/* Toolbar: category pills + search */}
      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <Reveal from="scale">
          <div
            className="flex flex-wrap items-center gap-2.5"
            role="group"
            aria-label={t("blog.categories")}
          >
            {/* All pill */}
            <button
              type="button"
              onClick={() => setActive(ALL)}
              aria-pressed={active === ALL}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
                active === ALL
                  ? "border-ink bg-ink text-white shadow-[var(--shadow-card)]"
                  : "border-ink/10 bg-white text-ink-soft hover:-translate-y-0.5 hover:border-ink/25 hover:text-ink"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${ALL_PILL_DOT}`}
                aria-hidden
              />
              {t("blog.all")}
            </button>

            {categories.map((cat) => {
              const cs = categoryStyle(cat);
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-pop/25 ${
                    isActive
                      ? `${cs.pillActive} shadow-md`
                      : "border-ink/10 bg-white text-ink-soft hover:-translate-y-0.5 hover:border-ink/25 hover:text-ink"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isActive ? "bg-white/90" : cs.dot}`}
                    aria-hidden
                  />
                  {cat}
                  <span
                    className={`text-[0.7rem] font-extrabold ${isActive ? "text-white/70" : "text-ink-faint"}`}
                  >
                    {countFor(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal from="scale" delay={0.08}>
          <div className="relative w-full lg:w-80">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-faint"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("blog.searchPlaceholder")}
              aria-label={t("blog.searchPlaceholder")}
              className="w-full rounded-full border-2 border-ink/10 bg-white py-3 pl-11 pr-5 text-[0.92rem] font-semibold text-ink shadow-[var(--shadow-card)] transition-all duration-300 placeholder:font-medium placeholder:text-ink-faint focus:border-pink-pop/50 focus:outline-none focus:ring-4 focus:ring-pink-pop/15"
            />
          </div>
        </Reveal>
      </div>

      {/* Posts grid */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <PostCard
              key={post.slug}
              post={post}
              delay={(i % 3) * 0.08}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-lg rounded-4xl border-2 border-dashed border-ink/15 bg-white/70 px-8 py-16 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pink-soft">
            <SearchX className="h-8 w-8 text-pink-pop" aria-hidden />
          </span>
          <p className="mt-5 font-display text-lg font-semibold text-ink">
            {t("blog.noResults")}
          </p>
          {(active !== ALL || query.trim() !== "") && (
            <button
              type="button"
              onClick={() => {
                setActive(ALL);
                setQuery("");
              }}
              className="btn-outline btn-sm mt-6"
            >
              {t("blog.all")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
