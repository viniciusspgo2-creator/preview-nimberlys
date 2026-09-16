"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/shared/Reveal";
import { Blob, Cloud, Sparkle } from "@/components/shared/decor";

/**
 * Community band — our place in Bay Point & Contra Costa County.
 */
export function AboutCommunity() {
  const { t } = useI18n();

  return (
    <section className="bg-white pb-16 pt-4 sm:pb-20">
      <div className="container-site">
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl bg-sky-soft px-6 py-12 text-center sm:px-12 sm:py-14">
            <Blob className="-left-14 -top-14 h-48 w-48 opacity-70" color="#FFFFFF" />
            <Blob className="-bottom-16 -right-12 h-52 w-52 opacity-60" color="#FFF6DC" />
            <Cloud
              className="absolute left-[8%] top-[14%] w-20 animate-float-slow opacity-80"
              color="#FFFFFF"
            />
            <Sparkle
              className="absolute right-[10%] bottom-[18%] w-7 animate-twinkle"
              color="#2FB9F1"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card">
                <MapPin className="h-7 w-7 text-sky-pop" aria-hidden />
              </span>
              <h2 className="section-title mt-5 text-balance">
                {t("about.community.title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                {t("about.community.text")}
              </p>
              <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-2">
                <span className="chip-info">
                  <MapPin className="h-3.5 w-3.5 text-sky-pop" aria-hidden />
                  {SITE.addressFull}
                </span>
                <span className="chip-info">
                  <MapPin className="h-3.5 w-3.5 text-green-pop" aria-hidden />
                  {SITE.county}
                </span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
