"use client";

import {
  CalendarCheck,
  HandHeart,
  Heart,
  Lightbulb,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";

type Value = { key: "1" | "2" | "3" | "4" | "5" | "6"; icon: LucideIcon; chip: string; iconColor: string };

const VALUES: Value[] = [
  { key: "1", icon: Heart, chip: "bg-pink-soft", iconColor: "text-pink-pop" },
  { key: "2", icon: ShieldCheck, chip: "bg-brand-soft", iconColor: "text-brand" },
  { key: "3", icon: HandHeart, chip: "bg-magenta-soft", iconColor: "text-magenta-pop" },
  { key: "4", icon: Lightbulb, chip: "bg-yellow-soft", iconColor: "text-orange-pop" },
  { key: "5", icon: Users, chip: "bg-sky-soft", iconColor: "text-sky-pop" },
  { key: "6", icon: CalendarCheck, chip: "bg-green-soft", iconColor: "text-green-deep" },
];

/**
 * Our values — six compact cards with playful icon chips.
 */
export function AboutValues() {
  const { t } = useI18n();

  return (
    <section className="bg-cream-deep py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <SectionHeading
          eyebrowKey="values.eyebrow"
          title={t("values.title")}
          subtitle={t("values.subtitle")}
        />

        <RevealGroup className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <RevealItem key={v.key}>
                <article className="card-soft card-hover flex h-full items-start gap-4 p-5 sm:p-6">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${v.chip}`}
                    aria-hidden
                  >
                    <Icon className={`h-6 w-6 ${v.iconColor}`} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {t(`values.${v.key}.title`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
                      {t(`values.${v.key}.text`)}
                    </p>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
