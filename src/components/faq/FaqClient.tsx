"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageCircleHeart, Phone, Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/shared/Reveal";
import { Blob, Cloud, Sparkle, Sun } from "@/components/shared/decor";
import { faqJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_FAQS, type FaqItem } from "./faq-fallback";

const ALL = "__all";

/** Category chip colors (cycled by index) for playful grouping. */
const CATEGORY_DOTS = [
  "bg-pink-pop",
  "bg-sky-pop",
  "bg-green-pop",
  "bg-orange-pop",
  "bg-magenta-pop",
  "bg-brand",
];

export function FaqClient() {
  const { t } = useI18n();
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  /* Load live FAQs; fall back to the hardcoded list on any failure. */
  useEffect(() => {
    let cancelled = false;
    fetch("/api/faq")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((data: { faqs?: FaqItem[] }) => {
        if (!cancelled && data && Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs);
        }
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(faqs.map((f) => f.category))),
    [faqs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const inCategory = category === ALL || f.category === category;
      const inSearch =
        q === "" ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return inCategory && inSearch;
    });
  }, [faqs, category, query]);

  const groups = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const f of filtered) {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const title = t("faq.page.title");
  const lastSpace = title.lastIndexOf(" ");
  const titleHead = lastSpace > 0 ? title.slice(0, lastSpace) : title;
  const titleTail = lastSpace > 0 ? title.slice(lastSpace + 1) : "";
  const hasResults = groups.length > 0;

  return (
    <>
      {/* Rich result data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-cream pb-10 pt-28 sm:pt-32">
        <Blob className="-left-24 top-8 h-72 w-72 opacity-60" color="#FFF6DC" />
        <Blob className="-right-20 top-24 h-72 w-72 opacity-50" color="#FDE5EC" />
        <Sun className="absolute right-[7%] top-20 w-14 animate-spin-slow sm:w-16" />
        <Cloud className="absolute left-[6%] top-28 w-24 animate-float-slow opacity-90" color="#FFFFFF" />
        <Sparkle className="absolute left-[18%] top-16 w-5 animate-twinkle" />
        <Sparkle
          className="absolute right-[20%] top-40 w-6 animate-twinkle"
          color="#F43F6D"
          style={{ animationDelay: "1.2s" }}
        />

        <div className="container-site relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Reveal from="scale">
              <span className="eyebrow">
                <HelpCircle className="h-4 w-4 text-brand" aria-hidden />
                {t("faq.page.eyebrow")}
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="section-title mt-5 text-balance sm:text-5xl lg:text-6xl">
                {titleHead}{" "}
                {titleTail && (
                  <span className="doodle-underline whitespace-nowrap text-pink-pop">
                    {titleTail}
                  </span>
                )}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                {t("faq.page.subtitle")}
              </p>
            </Reveal>

            {/* Search */}
            <Reveal delay={0.24} className="w-full max-w-xl">
              <div className="relative mt-8">
                <Search
                  className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label={t("chat.placeholder")}
                  placeholder={t("chat.placeholder")}
                  className="h-14 w-full rounded-full border-2 border-transparent bg-white py-4 pl-13 pr-6 text-base text-ink shadow-card outline-none transition-all placeholder:text-ink-faint focus:border-brand focus:ring-4 focus:ring-brand/25"
                />
              </div>
            </Reveal>

            {/* Category pills */}
            <Reveal delay={0.3} className="w-full">
              <div
                className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
                role="group"
                aria-label={t("blog.categories")}
              >
                <button
                  type="button"
                  onClick={() => setCategory(ALL)}
                  aria-pressed={category === ALL}
                  className={`inline-flex h-11 items-center gap-2 rounded-full px-5 font-display text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-pop/30 active:scale-95 ${
                    category === ALL
                      ? "bg-pink-pop text-white shadow-glow-pink"
                      : "bg-white text-ink shadow-card hover:-translate-y-0.5 hover:text-pink-pop"
                  }`}
                >
                  <Sparkle className="h-3.5 w-3.5" aria-hidden />
                  {t("faq.page.categoryAll")}
                </button>
                {categories.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={`inline-flex h-11 items-center gap-2 rounded-full px-5 font-display text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-pop/30 active:scale-95 ${
                      category === c
                        ? "bg-pink-pop text-white shadow-glow-pink"
                        : "bg-white text-ink shadow-card hover:-translate-y-0.5 hover:text-pink-pop"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOTS[i % CATEGORY_DOTS.length]}`}
                      aria-hidden
                    />
                    {c}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Questions ---------------- */}
      <section className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="container-site">
          {hasResults ? (
            <div className="mx-auto max-w-3xl">
              {groups.map(([cat, items], gi) => (
                <Reveal key={cat} delay={Math.min(gi, 4) * 0.08} className="mb-10 last:mb-0">
                  <h2 className="mb-4 flex items-center gap-2.5 font-display text-xl font-semibold text-ink sm:text-2xl">
                    <span
                      className={`h-3 w-3 rounded-full ${CATEGORY_DOTS[gi % CATEGORY_DOTS.length]}`}
                      aria-hidden
                    />
                    {cat}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((f) => (
                      <AccordionItem
                        key={f.id}
                        value={`q-${f.id}`}
                        className="card-soft mb-3.5 overflow-hidden rounded-3xl border-0 px-5 py-1 sm:px-7"
                      >
                        <AccordionTrigger className="py-4 font-display text-base font-semibold text-ink hover:no-underline sm:text-lg [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-pink-pop">
                          {f.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pt-0 text-[0.95rem] leading-relaxed text-ink-soft sm:text-base">
                          {f.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Reveal>
              ))}
            </div>
          ) : (
            <NoResultsCard />
          )}
        </div>
      </section>

      {/* ---------------- Still curious ---------------- */}
      <section className="bg-cream-deep pb-20 pt-4 sm:pb-24">
        <div className="container-site">
          <Reveal>
            <div className="relative overflow-hidden rounded-5xl bg-cream-deep px-6 py-12 text-center sm:px-12 sm:py-14">
              <Blob className="-right-14 -top-16 h-52 w-52 opacity-70" color="#FDE5EC" />
              <Blob className="-bottom-16 -left-12 h-52 w-52 opacity-60" color="#E2F5FD" />
              <Sparkle
                className="absolute left-[12%] top-[20%] w-6 animate-twinkle"
                color="#F43F6D"
              />

              <div className="relative mx-auto flex max-w-xl flex-col items-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-card">
                  <MessageCircleHeart className="h-8 w-8 text-pink-pop" aria-hidden />
                </span>
                <h2 className="section-title mt-5 text-balance text-2xl sm:text-3xl">
                  {t("faq.page.stillTitle")}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">
                  {t("faq.page.stillText")}
                </p>
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
                  <Link href="/contact" className="btn-pink btn-lg w-full sm:w-auto">
                    {t("faq.page.cta")}
                  </Link>
                  <a href={SITE.phoneHref} className="btn-outline btn-lg w-full sm:w-auto">
                    <Phone className="h-4 w-4" aria-hidden />
                    {SITE.phone}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/** Friendly empty state (also used when a search matches nothing). */
function NoResultsCard() {
  const { t } = useI18n();
  return (
    <Reveal from="scale" className="mx-auto max-w-md">
      <div className="card-soft flex flex-col items-center p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-soft">
          <Search className="h-8 w-8 text-orange-pop" aria-hidden />
        </span>
        <p className="mt-5 font-display text-lg font-semibold text-ink">
          {t("faq.page.stillTitle")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
          {t("faq.page.stillText")}
        </p>
        <Link href="/contact" className="btn-pink btn-md mt-6">
          {t("faq.page.cta")}
        </Link>
      </div>
    </Reveal>
  );
}
