"use client";

import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/shared/Reveal";
import { Blob, Sparkle, Sun } from "@/components/shared/decor";

/**
 * Final CTA band for the About page.
 */
export function AboutCTA() {
  const { t } = useI18n();

  return (
    <section className="bg-cream-deep pb-20 pt-16 sm:pb-24">
      <div className="container-site">
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl bg-ink px-6 py-14 text-center sm:px-12 sm:py-16">
            <Blob className="-left-16 -top-20 h-64 w-64 opacity-30" color="#F43F6D" />
            <Blob className="-bottom-20 -right-14 h-72 w-72 opacity-25" color="#2FB9F1" />
            <Sun className="absolute left-[7%] top-[12%] w-14 animate-spin-slow opacity-90" face={false} />
            <Sparkle className="absolute right-[10%] top-[18%] w-7 animate-twinkle" />
            <Sparkle
              className="absolute bottom-[16%] left-[18%] w-5 animate-twinkle"
              color="#F43F6D"
              style={{ animationDelay: "1s" }}
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <CalendarHeart className="h-8 w-8 text-yellow-pop" aria-hidden />
              </span>
              <h2 className="section-title mt-5 text-balance text-white">
                {t("about.cta.title")}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                {t("about.cta.text")}
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link href="/contact" className="btn-pink btn-lg w-full sm:w-auto">
                  {t("about.cta.primary")}
                </Link>
                <a href={SITE.phoneHref} className="btn-outline btn-lg w-full sm:w-auto">
                  {t("about.cta.secondary")}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
