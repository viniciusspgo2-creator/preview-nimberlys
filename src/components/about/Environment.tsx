"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Sparkle } from "@/components/shared/decor";

const POINTS = ["1", "2", "3", "4"] as const;

/**
 * Our environment — checklist of what makes the home special,
 * paired with a warm rounded photo.
 */
export function AboutEnvironment() {
  const { t } = useI18n();

  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Checklist */}
          <div>
            <SectionHeading
              eyebrowKey="about.environment.eyebrow"
              title={t("about.environment.title")}
              align="left"
            />
            <Reveal delay={0.18}>
              <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                {t("about.environment.text")}
              </p>
            </Reveal>

            <ul className="mt-7 space-y-3.5">
              {POINTS.map((key, i) => (
                <Reveal key={key} delay={0.22 + i * 0.08}>
                  <li className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card sm:items-center sm:p-5">
                    <CheckCircle2
                      className="mt-0.5 h-6 w-6 shrink-0 text-green-pop sm:mt-0"
                      aria-hidden
                    />
                    <span className="font-display text-base font-medium text-ink sm:text-lg">
                      {t(`about.environment.${key}`)}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Photo */}
          <Reveal from="right" delay={0.15} className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-3 -top-3 h-24 w-24 rounded-4xl bg-pink-soft" aria-hidden />
            <div className="absolute -bottom-3 -right-3 h-24 w-24 rounded-4xl bg-yellow-soft" aria-hidden />
            <div className="relative aspect-[4/3] overflow-hidden rounded-4xl shadow-lift">
              <Image
                src="/images/gallery/photo-toddler-joy.webp?v=4"
                alt="A happy child playing on the classroom floor at Nimberly's Daycare"
                fill
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover"
              />
            </div>
            <Sparkle className="absolute -right-2 -top-4 w-9 animate-twinkle" />
            <Sparkle
              className="absolute -bottom-3 left-8 w-6 animate-twinkle"
              color="#2FB9F1"
              style={{ animationDelay: "0.9s" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
