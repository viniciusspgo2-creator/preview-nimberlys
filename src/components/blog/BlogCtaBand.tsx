"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Cloud, Sparkle, Sun } from "@/components/shared/decor";
import { Reveal } from "@/components/shared/Reveal";
import { useI18n } from "@/lib/i18n";
import React from "react";

/* ============================================================
   BlogCtaBand — conversion band used at the bottom of the
   blog listing and article pages.
   ============================================================ */

export function BlogCtaBand() {
  const { t } = useI18n();
  return (
    <section className="bg-cream-deep pb-20 pt-6 lg:pb-24">
      <div className="container-site">
      <Reveal>
        <div className="relative overflow-hidden rounded-5xl bg-ink px-6 py-14 text-center sm:px-12 lg:px-20 lg:py-18">
          {/* rainbow top edge */}
          <div className="rainbow-bar absolute inset-x-0 top-0 h-2" aria-hidden />

          {/* floating decor */}
          <Cloud
            className="absolute -left-6 top-8 w-36 animate-float-slow opacity-10"
            aria-hidden
          />
          <Cloud
            className="absolute -right-8 bottom-4 w-44 animate-float opacity-10"
            aria-hidden
          />
          <Sun className="absolute right-[8%] top-8 hidden w-16 animate-wobble opacity-90 lg:block" />
          <Sparkle
            className="absolute left-[12%] bottom-10 w-6 animate-twinkle"
            color="#FFC42E"
          />
          <Sparkle
            className="absolute left-[22%] top-12 hidden w-4 animate-twinkle sm:block"
            color="#F43F6D"
            style={{ animationDelay: "1s" }}
          />

          <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {t("blog.ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {t("blog.ctaText")}
          </p>
          <Link href="/contact" className="btn-pink btn-lg mt-9">
            {t("blog.ctaButton")}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </Reveal>
      </div>
    </section>
  );
}
