"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Blob, PlaneTrail, Sparkle, Squiggle } from "@/components/shared/decor";

const BULLETS: DictKey[] = ["welcome.b1", "welcome.b2", "welcome.b3"];

export function Welcome() {
  const { t } = useI18n();

  return (
    <section
      aria-label={t("welcome.title")}
      className="overflow-x-clip bg-white pt-20 sm:pt-24 lg:pt-28"
    >
      <div className="container-site">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ---- Photo composition ---- */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Blob color="#fde5ec" className="-left-12 -top-12 h-64 w-64 opacity-80" />

            {/* single wide photo — replaces the previous front + back collage */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-[10rem] rounded-b-[2.5rem] shadow-lift ring-8 ring-cream-deep/60 sm:mx-4 lg:mx-12">
              <Image
                src="/images/gallery/photo-group-room.webp?v=5"
                alt="Six happy children lying together on the play mat smiling at Nimberly's Daycare"
                fill
                sizes="(min-width: 1024px) 42vw, 92vw"
                className="object-cover"
                priority
              />
            </div>

            <Sparkle
              className="absolute -right-1 top-8 w-8 animate-twinkle"
              color="#ffc42e"
            />
            <Squiggle className="absolute -bottom-5 right-6 w-28" color="#f43f6d" />
            <PlaneTrail className="absolute -top-10 right-0 hidden w-28 lg:block" />
          </div>

          {/* ---- Copy ---- */}
          <div>
            <SectionHeading
              eyebrowKey="welcome.eyebrow"
              title={t("welcome.title")}
              align="left"
            />
            <Reveal delay={0.15}>
              <p className="mt-6 leading-relaxed text-ink-soft sm:text-lg">
                {t("welcome.p1")}
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <p className="mt-4 leading-relaxed text-ink-soft sm:text-lg">
                {t("welcome.p2")}
              </p>
            </Reveal>

            <ul className="mt-7 space-y-3.5">
              {BULLETS.map((key, i) => (
                <Reveal as="li" key={key} delay={0.28 + i * 0.08}>
                  <span className="flex items-center gap-3">
                    <CheckCircle2
                      className="h-6 w-6 shrink-0 text-green-pop"
                      aria-hidden
                    />
                    <span className="font-semibold text-ink">{t(key)}</span>
                  </span>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.55}>
              <Link href="/about" className="btn-primary btn-md mt-9">
                {t("welcome.cta")}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
