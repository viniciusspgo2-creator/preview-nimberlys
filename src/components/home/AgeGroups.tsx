"use client";

import Link from "next/link";
import {
  ArrowRight,
  Baby,
  Blocks,
  GraduationCap,
  PencilRuler,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { RevealGroup, RevealItem, Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WaveDivider, Cloud, Sparkle } from "@/components/shared/decor";

const GROUPS: {
  nameKey: DictKey;
  rangeKey: DictKey;
  descKey: DictKey;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  offset: string;
  tilt: string;
}[] = [
  {
    nameKey: "ages.infant.name",
    rangeKey: "ages.infant.range",
    descKey: "ages.infant.desc",
    icon: Baby,
    bg: "bg-pink-soft",
    iconColor: "text-pink-pop",
    offset: "",
    tilt: "xl:-rotate-1",
  },
  {
    nameKey: "ages.toddler.name",
    rangeKey: "ages.toddler.range",
    descKey: "ages.toddler.desc",
    icon: Blocks,
    bg: "bg-sky-soft",
    iconColor: "text-sky-pop",
    offset: "sm:mt-6 xl:mt-0",
    tilt: "xl:rotate-1",
  },
  {
    nameKey: "ages.preschool.name",
    rangeKey: "ages.preschool.range",
    descKey: "ages.preschool.desc",
    icon: PencilRuler,
    bg: "bg-yellow-soft",
    iconColor: "text-orange-pop",
    offset: "xl:mt-4",
    tilt: "xl:-rotate-1",
  },
  {
    nameKey: "ages.school.name",
    rangeKey: "ages.school.range",
    descKey: "ages.school.desc",
    icon: GraduationCap,
    bg: "bg-green-soft",
    iconColor: "text-green-deep",
    offset: "sm:mt-6 xl:mt-10",
    tilt: "xl:rotate-1",
  },
];

export function AgeGroups() {
  const { t } = useI18n();

  return (
    <section
      id="ages"
      aria-label={t("ages.title")}
      className="relative scroll-mt-28 overflow-hidden bg-cream-deep"
    >
      <WaveDivider fill="#ffffff" flip />
      <Cloud
        className="pointer-events-none absolute right-[6%] top-40 w-24 opacity-70 animate-float-slow"
        color="#ffffff"
      />
      <Sparkle
        className="pointer-events-none absolute left-[8%] top-64 w-6 animate-twinkle"
        color="#d92e9c"
      />

      <div className="container-site relative pb-20 pt-10 sm:pb-24 sm:pt-12">
        <SectionHeading
          eyebrowKey="ages.eyebrow"
          title={t("ages.title")}
          subtitle={t("ages.subtitle")}
        />

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
          {GROUPS.map((group) => (
            <RevealItem key={group.nameKey} className={group.offset}>
              <article
                className={`group h-full rounded-4xl p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-lift ${group.bg} ${group.tilt}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-300 group-hover:animate-wobble ${group.iconColor}`}
                  >
                    <group.icon className="h-7 w-7" aria-hidden />
                  </span>
                  <span className="rounded-full bg-white/90 px-3.5 py-1.5 font-display text-xs font-semibold text-ink shadow-sm">
                    {t(group.rangeKey)}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                  {t(group.nameKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {t(group.descKey)}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-12 text-center">
          <Link
            href="/contact"
            className="link-underline inline-flex items-center gap-2 font-display text-lg font-semibold text-brand"
          >
            {t("ages.cta")}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
