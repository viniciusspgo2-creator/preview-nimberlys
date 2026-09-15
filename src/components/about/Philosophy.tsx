"use client";

import { BookOpen, HandHeart, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";

/**
 * Philosophy band — a centered statement on cream-deep with
 * gently floating care & learning icons.
 */
export function AboutPhilosophy() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-cream-deep py-16 sm:py-20 lg:py-24">
      {/* Subtle floating icons */}
      <BookOpen
        className="pointer-events-none absolute left-[6%] top-[14%] h-12 w-12 animate-float-slow text-brand/25"
        aria-hidden
      />
      <Heart
        className="pointer-events-none absolute right-[8%] top-[22%] h-10 w-10 animate-float text-pink-pop/30"
        aria-hidden
      />
      <HandHeart
        className="pointer-events-none absolute bottom-[16%] left-[12%] h-11 w-11 animate-float-x text-green-pop/30"
        aria-hidden
      />
      <HandHeart
        className="pointer-events-none absolute bottom-[20%] right-[14%] h-9 w-9 animate-float-slow text-orange-pop/25"
        aria-hidden
      />

      <div className="container-site relative">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrowKey="about.mission.eyebrow"
            title={t("about.mission.title")}
          />
          <Reveal delay={0.2}>
            <p className="mt-6 text-center text-base leading-relaxed text-ink-soft sm:text-lg">
              {t("about.mission.text")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
