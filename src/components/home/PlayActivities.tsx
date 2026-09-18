"use client";

import Image from "next/image";
import {
  Blocks,
  BookOpen,
  Music,
  Palette,
  Puzzle,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Cloud, Sparkle, Squiggle } from "@/components/shared/decor";

const ACTIVITIES: {
  key: DictKey;
  icon: LucideIcon;
  color: string;
  pos: string;
  tilt: string;
}[] = [
  {
    key: "play.1",
    icon: Palette,
    color: "text-pink-pop",
    // Pills hug the photo: right edge sits ~48px INSIDE the photo's left
    // edge (photo half-width ≈ 224px + ring), so each pill takes a little
    // bite of the image instead of floating far away.
    pos: "lg:absolute lg:right-[calc(50%+176px)] lg:top-[64px] lg:z-20",
    tilt: "lg:-rotate-3",
  },
  {
    key: "play.2",
    icon: BookOpen,
    color: "text-brand",
    pos: "lg:absolute lg:left-[calc(50%+176px)] lg:top-[112px] lg:z-20",
    tilt: "lg:rotate-2",
  },
  {
    key: "play.3",
    icon: Music,
    color: "text-magenta-pop",
    pos: "lg:absolute lg:right-[calc(50%+190px)] lg:top-[45%] lg:z-20",
    tilt: "lg:rotate-2",
  },
  {
    key: "play.4",
    icon: Sun,
    color: "text-orange-pop",
    pos: "lg:absolute lg:left-[calc(50%+188px)] lg:top-[55%] lg:z-20",
    tilt: "lg:-rotate-2",
  },
  {
    key: "play.5",
    icon: Blocks,
    color: "text-sky-pop",
    pos: "lg:absolute lg:right-[calc(50%+168px)] lg:bottom-[108px] lg:z-20",
    tilt: "lg:-rotate-2",
  },
  {
    key: "play.6",
    icon: Puzzle,
    color: "text-green-deep",
    pos: "lg:absolute lg:left-[calc(50%+170px)] lg:bottom-[92px] lg:z-20",
    tilt: "lg:rotate-3",
  },
];

export function PlayActivities() {
  const { t } = useI18n();

  return (
    <section
      aria-label={t("play.title")}
      className="relative overflow-hidden bg-sky-soft py-20 sm:py-28"
    >
      <Cloud className="pointer-events-none absolute left-[4%] top-10 w-28 opacity-80 animate-float-slow" />
      <Cloud
        className="pointer-events-none absolute bottom-16 right-[4%] w-32 opacity-80 animate-float"
        color="#fde5ec"
      />
      <Sparkle
        className="pointer-events-none absolute right-[12%] top-16 w-7 animate-twinkle"
        color="#ffc42e"
      />

      <div className="container-site relative">
        <SectionHeading
          eyebrowKey="play.eyebrow"
          title={t("play.title")}
          subtitle={t("play.subtitle")}
        />

        {/* Wide stage on lg so the photo stays centered while the pills
            hug its edges (photo capped at max-w-md) */}
        <div className="relative mx-auto mt-12 max-w-3xl lg:h-[560px] lg:max-w-4xl">
          {/* Central photo */}
          <Reveal from="scale" className="relative z-10 mx-auto w-full max-w-md lg:pt-14">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -left-4 -top-4 h-full w-full -rotate-3 rounded-[3rem] bg-white/70"
              />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[3rem] shadow-lift ring-8 ring-white">
                <Image
                  src="/images/gallery/photo-kids-play.webp?v=6"
                  alt="Six smiling children sitting together under the Happy Daycare banner at Nimberly's Daycare"
                  fill
                  sizes="(min-width: 1024px) 28rem, 92vw"
                  className="object-cover"
                />
              </div>
              <Squiggle className="absolute -bottom-7 left-8 w-28" color="#f43f6d" />
              <Sparkle
                className="absolute -right-3 -top-4 w-8 animate-twinkle"
                color="#f43f6d"
              />
            </div>
          </Reveal>

          {/* Activity pills — on lg they hug the photo edges (slight
              overlap) and gently float; grid below the photo on mobile.
              Each pill is its own Reveal (whileInView must live on the
              positioned element itself — display:contents containers have
              no box, so a RevealGroup wrapper would never trigger). */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-0 lg:contents">
            {ACTIVITIES.map((activity, i) => (
              <Reveal
                key={activity.key}
                delay={0.06 * i}
                className={activity.pos}
                amount={0.2}
              >
                {/* Float wrapper: CSS bobbing stays on its own layer so it
                    never fights the pill's hover scale transition */}
                <span
                  className="block lg:animate-float"
                  style={{ animationDelay: `${(i % 3) * 0.8}s` }}
                >
                  <span
                    className={`flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-white px-5 py-3 font-display text-sm font-semibold text-ink shadow-card transition-all duration-300 hover:rotate-0 hover:scale-105 hover:shadow-lift sm:justify-start ${activity.tilt}`}
                  >
                    <activity.icon className={`h-5 w-5 shrink-0 ${activity.color}`} aria-hidden />
                    {t(activity.key)}
                  </span>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
