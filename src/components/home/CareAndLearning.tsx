"use client";

import {
  Blocks,
  BookOpen,
  CalendarClock,
  GraduationCap,
  Salad,
  Smile,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WaveDivider, Sparkle } from "@/components/shared/decor";

const ITEMS: {
  titleKey: DictKey;
  textKey: DictKey;
  icon: LucideIcon;
  wrap: string;
  span?: string;
}[] = [
  {
    titleKey: "care.1.title",
    textKey: "care.1.text",
    icon: Blocks,
    wrap: "bg-pink-soft text-pink-pop",
    span: "md:col-span-2",
  },
  {
    titleKey: "care.2.title",
    textKey: "care.2.text",
    icon: CalendarClock,
    wrap: "bg-sky-soft text-sky-pop",
  },
  {
    titleKey: "care.3.title",
    textKey: "care.3.text",
    icon: BookOpen,
    wrap: "bg-orange-soft text-orange-pop",
  },
  {
    titleKey: "care.4.title",
    textKey: "care.4.text",
    icon: Smile,
    wrap: "bg-green-soft text-green-deep",
  },
  {
    titleKey: "care.5.title",
    textKey: "care.5.text",
    icon: Salad,
    wrap: "bg-magenta-soft text-magenta-pop",
  },
];

export function CareAndLearning() {
  const { t } = useI18n();

  const renderFeatured = (item: (typeof ITEMS)[number]) => (
    <RevealItem key={item.titleKey} className={item.span}>
      <article className="group relative flex h-full flex-col justify-center overflow-hidden rounded-4xl bg-cream-soft p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:p-9">
        <Sparkle
          className="absolute right-6 top-6 z-10 w-6 animate-twinkle"
          color="#ffc42e"
        />
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm transition-transform duration-300 group-hover:animate-wobble ${item.wrap}`}
        >
          <item.icon className="h-8 w-8" aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink sm:text-[1.7rem]">
          {t(item.titleKey)}
        </h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
          {t(item.textKey)}
        </p>
      </article>
    </RevealItem>
  );

  const renderSmall = (item: (typeof ITEMS)[number]) => (
    <RevealItem key={item.titleKey}>
      <article className="group h-full rounded-4xl border border-ink/5 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:animate-wobble ${item.wrap}`}
        >
          <item.icon className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold text-ink">
          {t(item.titleKey)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {t(item.textKey)}
        </p>
      </article>
    </RevealItem>
  );

  return (
    <section aria-label={t("care.title")} className="relative bg-white">
      <WaveDivider fill="#fdf0e0" flip />

      <div className="container-site relative pb-20 pt-10 sm:pb-24 sm:pt-12">
        <SectionHeading
          eyebrowKey="care.eyebrow"
          title={t("care.title")}
          subtitle={t("care.subtitle")}
        />

        {/* Info-only bento — no photos, every grid cell filled:
            lg → featured(2) + 1 small | 3 smalls | wide(3)
            md → featured(2) | 2x2 smalls | wide(2) */}
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {renderFeatured(ITEMS[0])}
          {renderSmall(ITEMS[1])}
          {renderSmall(ITEMS[2])}
          {renderSmall(ITEMS[3])}
          {renderSmall(ITEMS[4])}

          {/* Wide closer card */}
          <RevealItem className="md:col-span-2 lg:col-span-3">
            <article className="group flex h-full flex-col gap-5 rounded-4xl bg-cream-soft p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:flex-row sm:items-center sm:gap-8 sm:p-8">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white shadow-sm transition-transform duration-300 group-hover:animate-wobble bg-brand-soft text-brand">
                <GraduationCap className="h-8 w-8" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink">
                  {t("care.6.title")}
                </h3>
                <p className="mt-2.5 max-w-2xl leading-relaxed text-ink-soft">
                  {t("care.6.text")}
                </p>
              </div>
            </article>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
