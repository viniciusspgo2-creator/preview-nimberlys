"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Baby,
  BadgeCheck,
  CalendarCheck,
  Clock3,
  Heart,
  MapPin,
  Puzzle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { Balloon, Blob, Cloud, Sparkle, Sun } from "@/components/shared/decor";

const CHIPS: { key: DictKey; icon: LucideIcon; color: string }[] = [
  { key: "hero.chip1", icon: Baby, color: "text-pink-pop" },
  { key: "hero.chip2", icon: Clock3, color: "text-brand" },
  { key: "hero.chip3", icon: BadgeCheck, color: "text-green-deep" },
  { key: "hero.chip4", icon: MapPin, color: "text-orange-pop" },
];

const CARDS: {
  titleKey: DictKey;
  textKey: DictKey;
  icon: LucideIcon;
  wrap: string;
  pos: string;
  anim: string;
  delay: string;
}[] = [
  {
    titleKey: "hero.card1.title",
    textKey: "hero.card1.text",
    icon: Heart,
    wrap: "bg-pink-soft text-pink-pop",
    pos: "-left-2 top-12 sm:-left-8",
    anim: "animate-float",
    delay: "0.6s",
  },
  {
    titleKey: "hero.card2.title",
    textKey: "hero.card2.text",
    icon: Users,
    wrap: "bg-brand-soft text-brand",
    pos: "-right-2 top-1/3 sm:-right-8",
    anim: "animate-float-slow",
    delay: "1.4s",
  },
  {
    titleKey: "hero.card3.title",
    textKey: "hero.card3.text",
    icon: Puzzle,
    wrap: "bg-green-soft text-green-deep",
    pos: "-left-1 bottom-10 sm:left-6",
    anim: "animate-float",
    delay: "2.2s",
  },
];

export function Hero() {
  const { t } = useI18n();

  return (
    <section
      aria-label={t("hero.badge")}
      className="relative overflow-hidden pb-28 pt-28 sm:pb-36 sm:pt-32 lg:pb-44"
    >
      {/* Soft color washes */}
      <Blob color="#fde5ec" className="-left-32 -top-28 h-[26rem] w-[26rem] opacity-80" />
      <Blob color="#e2f5fd" className="-right-28 top-32 h-[24rem] w-[24rem] opacity-70" />
      <Blob color="#fff6dc" className="bottom-4 left-1/4 h-[20rem] w-[20rem] opacity-60" />

      {/* Floating decor */}
      <Sun className="absolute right-[5%] top-28 hidden w-16 animate-float lg:block" />
      <Cloud className="absolute left-[3%] top-40 w-24 animate-float-slow" color="#ffffff" />
      <Cloud className="absolute bottom-24 right-[3%] hidden w-28 animate-float-x lg:block" color="#ffffff" />
      <Sparkle className="absolute left-[44%] top-32 w-6 animate-twinkle" color="#f43f6d" />
      <Balloon className="absolute bottom-32 left-[5%] hidden w-11 lg:block" color="#2fb9f1" />

      <div className="container-site relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* ---- Copy ---- */}
          <div className="text-center lg:text-left">
            <span
              className="eyebrow animate-fade-up"
              style={{ animationDelay: "0.05s" }}
            >
              <Sparkle className="h-3.5 w-3.5 text-pink-pop" />
              {t("hero.badge")}
            </span>

            <h1
              className="mt-5 animate-fade-up font-display text-4xl font-semibold leading-[1.08] text-balance text-ink sm:text-5xl lg:text-[3.6rem]"
              style={{ animationDelay: "0.15s" }}
            >
              {t("hero.titleA")}
              <span className="rainbow-text block pb-2">{t("hero.titleB")}</span>
            </h1>

            <p
              className="mx-auto mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0"
              style={{ animationDelay: "0.25s" }}
            >
              {t("hero.subtitle")}
            </p>

            <div
              className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              style={{ animationDelay: "0.35s" }}
            >
              <Link href="/contact" className="btn-pink btn-lg w-full sm:w-auto">
                <CalendarCheck className="h-5 w-5" aria-hidden />
                {t("hero.ctaPrimary")}
              </Link>
              <a href="#ages" className="btn-outline btn-lg w-full sm:w-auto">
                {t("hero.ctaSecondary")}
                <ArrowDown className="h-5 w-5" aria-hidden />
              </a>
            </div>

            <ul
              className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-2.5 lg:justify-start"
              style={{ animationDelay: "0.45s" }}
            >
              {CHIPS.map((chip) => (
                <li key={chip.key} className="chip-info">
                  <chip.icon className={`h-4 w-4 ${chip.color}`} aria-hidden />
                  {t(chip.key)}
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Photo composition ---- */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* offset backdrop arch */}
            <div
              aria-hidden
              className="absolute -right-3 -top-3 h-full w-full rotate-3 rounded-t-full rounded-b-[3rem] bg-yellow-soft sm:-right-5"
            />
            <Sparkle
              className="absolute -top-5 right-8 z-10 w-8 animate-twinkle"
              color="#ffc42e"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[3rem] shadow-lift ring-8 ring-white">
              <Image
                src="/images/gallery/hero-classroom.webp?v=4"
                alt="Smiling children doing a craft activity together at Nimberly's Daycare in Bay Point"
                fill
                priority
                sizes="(min-width: 1024px) 560px, 92vw"
                className="object-cover"
              />
            </div>

            {/* Floating glass cards — desktop only (photo has room beside it) */}
            {CARDS.map((card) => (
              <div
                key={card.titleKey}
                className={`absolute ${card.pos} ${card.anim} z-10 hidden items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-card backdrop-blur-md lg:flex`}
                style={{ animationDelay: card.delay }}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.wrap}`}
                >
                  <card.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-sm font-semibold leading-tight text-ink">
                    {t(card.titleKey)}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                    {t(card.textKey)}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Info cards — in-flow below the photo on mobile/tablet so they
              never cover the children's faces */}
          <ul className="mx-auto mt-6 grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-3 lg:hidden">
            {CARDS.map((card) => (
              <li
                key={card.titleKey}
                className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3.5 py-2.5 shadow-card backdrop-blur-md"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.wrap}`}
                >
                  <card.icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm font-semibold leading-tight text-ink">
                    {t(card.titleKey)}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">
                    {t(card.textKey)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
