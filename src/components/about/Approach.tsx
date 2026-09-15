"use client";

import { useI18n } from "@/lib/i18n";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";

const PILLARS = [
  { n: "01", key: "1", soft: "bg-pink-soft", accent: "text-pink-pop" },
  { n: "02", key: "2", soft: "bg-yellow-soft", accent: "text-orange-pop" },
  { n: "03", key: "3", soft: "bg-sky-soft", accent: "text-sky-pop" },
  { n: "04", key: "4", soft: "bg-green-soft", accent: "text-green-deep" },
] as const;

/**
 * Our approach — the four pillars of care, shown as numbered cards
 * in an alternating 2x2 grid.
 */
export function AboutApproach() {
  const { t } = useI18n();

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <SectionHeading
          eyebrowKey="about.approach.eyebrow"
          title={t("about.approach.title")}
          subtitle={t("about.subtitle")}
        />

        <RevealGroup className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6">
          {PILLARS.map((p, i) => (
            <RevealItem key={p.key} from={i % 2 === 0 ? "left" : "right"}>
              <article
                className={`card-soft card-hover group flex h-full gap-5 p-6 sm:gap-7 sm:p-8 ${
                  p.soft
                }`}
              >
                <span
                  className={`font-display text-5xl font-bold leading-none sm:text-6xl ${p.accent} opacity-90 transition-transform duration-300 group-hover:scale-110`}
                  aria-hidden
                >
                  {p.n}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                    {t(`about.approach.${p.key}.title`)}
                  </h3>
                  <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft sm:text-base">
                    {t(`about.approach.${p.key}.text`)}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
