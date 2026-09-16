"use client";

import { useRef } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  HandHeart,
  Heart,
  Lightbulb,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FloatingDecor, Sparkle } from "@/components/shared/decor";

const VALUES: {
  titleKey: DictKey;
  textKey: DictKey;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  sparkle: string;
  tilt: string;
}[] = [
  {
    titleKey: "values.1.title",
    textKey: "values.1.text",
    icon: Heart,
    bg: "bg-pink-soft",
    iconColor: "text-pink-pop",
    sparkle: "#f43f6d",
    tilt: "sm:-rotate-1",
  },
  {
    titleKey: "values.2.title",
    textKey: "values.2.text",
    icon: ShieldCheck,
    bg: "bg-brand-soft",
    iconColor: "text-brand",
    sparkle: "#2278e0",
    tilt: "sm:rotate-1",
  },
  {
    titleKey: "values.3.title",
    textKey: "values.3.text",
    icon: HandHeart,
    bg: "bg-magenta-soft",
    iconColor: "text-magenta-pop",
    sparkle: "#d92e9c",
    tilt: "sm:-rotate-2",
  },
  {
    titleKey: "values.4.title",
    textKey: "values.4.text",
    icon: Lightbulb,
    bg: "bg-orange-soft",
    iconColor: "text-orange-pop",
    sparkle: "#ff7a1f",
    tilt: "sm:rotate-2",
  },
  {
    titleKey: "values.5.title",
    textKey: "values.5.text",
    icon: Users,
    bg: "bg-sky-soft",
    iconColor: "text-sky-pop",
    sparkle: "#2fb9f1",
    tilt: "sm:-rotate-1",
  },
  {
    titleKey: "values.6.title",
    textKey: "values.6.text",
    icon: CalendarCheck,
    bg: "bg-green-soft",
    iconColor: "text-green-deep",
    sparkle: "#7cc043",
    tilt: "sm:rotate-1",
  },
];

export function Values() {
  const { t } = useI18n();
  const rowWrapRef = useRef<HTMLDivElement | null>(null);

  /** Slide the mobile card row by one card (guaranteed affordance — works
      even where touch panning is unreliable, e.g. embedded webviews). */
  const scrollRow = (dir: 1 | -1) => {
    const row = rowWrapRef.current?.firstElementChild as HTMLElement | null;
    if (!row) return;
    const card = row.querySelector<HTMLElement>(":scope > *");
    const step = (card?.offsetWidth ?? 262) + 16;
    row.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      aria-label={t("values.title")}
      className="relative overflow-hidden bg-cream-deep py-20 sm:py-28"
    >
      <FloatingDecor variant={2} />

      <div className="container-site relative">
        <SectionHeading
          eyebrowKey="values.eyebrow"
          title={t("values.title")}
          subtitle={t("values.subtitle")}
        />

        <div ref={rowWrapRef} className="relative mt-12">
          <RevealGroup
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 no-scrollbar [-webkit-overflow-scrolling:touch] [touch-action:pan-x] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3"
            stagger={0.08}
          >
            {VALUES.map((value) => (
              <RevealItem
                key={value.titleKey}
                className="w-[min(85%,300px)] shrink-0 snap-center sm:w-auto"
              >
                <article
                  className={`group relative h-full rounded-4xl p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-lift ${value.bg} ${value.tilt}`}
                >
                  <Sparkle
                    className={`absolute right-5 top-5 w-4 animate-twinkle ${value.iconColor}`}
                    color="currentColor"
                  />
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <value.icon className={`h-6 w-6 ${value.iconColor}`} aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                    {t(value.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {t(value.textKey)}
                  </p>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* Mobile-only slide controls — cards are reachable even if touch
              swiping is swallowed by an embedded preview/webview */}
          <div className="mt-2 flex items-center justify-center gap-3 sm:hidden">
            <button
              type="button"
              onClick={() => scrollRow(-1)}
              aria-label="Previous value"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-pink-pop shadow-card transition-all duration-200 hover:bg-pink-soft active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <span aria-hidden className="h-1.5 w-10 rounded-full bg-gradient-to-r from-pink-pop via-orange-pop to-yellow-pop" />
            <button
              type="button"
              onClick={() => scrollRow(1)}
              aria-label="Next value"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-pink-pop shadow-card transition-all duration-200 hover:bg-pink-soft active:scale-90"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}