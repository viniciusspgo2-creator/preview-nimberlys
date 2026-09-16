"use client";

import Image from "next/image";
import { Quote, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Sparkle } from "@/components/shared/decor";

/**
 * Our story — 2-column layout: narrative copy on the left, an arched
 * photo on the right, finished with a pull-quote card.
 */
export function AboutStory() {
  const { t } = useI18n();

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <SectionHeading eyebrowKey="about.story.eyebrow" title={t("about.story.title")} />

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Narrative */}
          <div className="space-y-5">
            <Reveal>
              <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
                {t("about.story.p1")}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
                {t("about.story.p2")}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
                {t("about.story.p3")}
              </p>
            </Reveal>

            {/* Pull-quote card */}
            <Reveal delay={0.24}>
              <figure className="relative mt-8 overflow-hidden rounded-4xl bg-pink-soft p-7 sm:p-9">
                <Sparkle
                  className="absolute -right-2 -top-2 w-12 animate-twinkle"
                  color="#F43F6D"
                />
                <Sparkle
                  className="absolute bottom-4 right-10 w-6 animate-twinkle"
                  style={{ animationDelay: "1.4s" }}
                />
                <Quote className="h-8 w-8 rotate-180 text-pink-pop/70" aria-hidden />
                <blockquote className="mt-3 font-display text-xl font-medium italic leading-snug text-ink sm:text-2xl">
                  {t("about.quote")}
                </blockquote>
                <figcaption className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-pink-pop">
                  — {t("about.eyebrow")}, Nimberly&apos;s
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* Arched photo */}
          <Reveal from="right" delay={0.15} className="relative mx-auto w-full max-w-md">
            <div
              className="relative aspect-[4/5] overflow-hidden shadow-lift"
              style={{ borderRadius: "48% 48% 24px 24px / 34% 34% 24px 24px" }}
            >
              <Image
                src="/images/gallery/photo-group-smiles.webp?v=4"
                alt="Two children smiling by the whiteboard at Nimberly's Daycare"
                fill
                sizes="(max-width: 1024px) 90vw, 440px"
                className="object-cover"
              />
            </div>
            <Sparkle className="absolute -left-4 top-10 w-9 animate-twinkle" />
            <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-card">
              <Sparkles className="h-4 w-4 text-orange-pop" aria-hidden />
              <span className="font-display text-sm font-semibold text-ink">
                Bay Point, CA
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
