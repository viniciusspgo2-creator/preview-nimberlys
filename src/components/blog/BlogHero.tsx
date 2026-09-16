"use client";

import { Cloud, Sparkle, Sun, Blocks } from "@/components/shared/decor";
import { Reveal } from "@/components/shared/Reveal";
import { useI18n } from "@/lib/i18n";
import React from "react";

/* ============================================================
   BlogHero — playful page hero for /blog with floating
   books, blocks, clouds, and a smiling sun.
   ============================================================ */

/** Simple open-book doodle (two floating color variants) */
function Book({
  className = "",
  left = "#F43F6D",
  right = "#FF7A1F",
}: {
  className?: string;
  left?: string;
  right?: string;
}) {
  return (
    <svg viewBox="0 0 64 48" fill="none" aria-hidden className={className}>
      <path
        d="M32 9C26.5 4.6 18 3.4 9 4.8v34.4c9-1.4 17.5-.2 23 4.2V9z"
        fill={left}
      />
      <path
        d="M32 9c5.5-4.4 14-5.6 23-4.2v34.4c-9-1.4-17.5-.2-23 4.2V9z"
        fill={right}
      />
      <path
        d="M32 9v34.4"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M14 13.5c4-.6 8-.5 11 .4M14 21c4-.6 8-.5 11 .4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M39 13.5c4-.6 8-.5 11 .4M39 21c4-.6 8-.5 11 .4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function BlogHero() {
  const { t } = useI18n();
  const words = t("blog.title").trim().split(/\s+/);
  const lastWord = words.length > 1 ? words.pop()! : null;

  return (
    <section className="relative overflow-hidden">
      {/* soft background washes */}
      <div
        aria-hidden
        className="absolute -left-28 top-4 h-80 w-80 rounded-full bg-pink-soft/70 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-yellow-soft/80 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/3 h-56 w-72 rounded-full bg-sky-soft/60 blur-3xl"
      />

      {/* floating decor */}
      <Cloud className="absolute left-[3%] top-16 w-24 animate-float-slow opacity-90" />
      <Sun className="absolute right-[5%] top-10 hidden w-20 animate-wobble sm:block" />
      <Sparkle className="absolute right-[19%] top-28 w-5 animate-twinkle" />
      <Sparkle
        className="absolute left-[15%] bottom-28 w-6 animate-twinkle"
        color="#F43F6D"
        style={{ animationDelay: "1.2s" }}
      />
      <Sparkle
        className="absolute right-[28%] top-10 w-4 animate-twinkle"
        color="#2FB9F1"
        style={{ animationDelay: "0.6s" }}
      />
      <Blocks className="absolute bottom-6 right-[7%] hidden w-24 animate-float opacity-90 md:block" />
      <Book
        className="absolute bottom-12 left-[6%] hidden w-16 -rotate-12 animate-float-slow md:block"
        left="#F43F6D"
        right="#FF7A1F"
      />
      <Book
        className="absolute left-[21%] top-12 hidden w-11 rotate-6 animate-float lg:block"
        left="#2FB9F1"
        right="#7CC043"
      />

      <div className="container-site relative flex flex-col items-center pb-14 pt-14 text-center sm:pb-16 sm:pt-20">
        <Reveal from="scale">
          <span className="eyebrow">
            <Sparkle className="h-3.5 w-3.5" color="#F43F6D" aria-hidden />
            {t("blog.eyebrow")}
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            {words.join(" ")}
            {lastWord && (
              <>
                {" "}
                <span className="doodle-underline whitespace-nowrap text-pink-pop">
                  {lastWord}
                </span>
              </>
            )}
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {t("blog.subtitle")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
