"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Balloon, Blob, Sparkle } from "@/components/shared/decor";

const REASONS: DictKey[] = [
  "why.1",
  "why.2",
  "why.3",
  "why.4",
  "why.5",
  "why.6",
];

const DOT_COLORS = ["#f43f6d", "#ff7a1f", "#ffc42e", "#7cc043", "#2fb9f1", "#d92e9c"];

export function WhyUs() {
  const { t } = useI18n();

  return (
    <section aria-label={t("why.title")} className="bg-white py-20 sm:py-28">
      <div className="container-site">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ---- Checklist ---- */}
          <div>
            <SectionHeading
              eyebrowKey="why.eyebrow"
              title={t("why.title")}
              subtitle={t("why.subtitle")}
              align="left"
            />

            <Reveal delay={0.15}>
              <div className="mt-8 rounded-[2.5rem] bg-cream-soft p-3 shadow-card sm:p-5">
                <ol className="space-y-1">
                  {REASONS.map((key, i) => (
                    <li
                      key={key}
                      className="flex items-center gap-4 rounded-3xl px-3 py-3 transition-colors duration-200 hover:bg-white"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold shadow-sm"
                        style={{ backgroundColor: DOT_COLORS[i], color: i === 2 ? "#2e3a54" : "#ffffff" }}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span className="font-semibold text-ink sm:text-[1.05rem]">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="px-3 pb-2 pt-3">
                  <Link href="/contact" className="btn-pink btn-md">
                    {t("why.cta")}
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ---- Photo ---- */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Blob color="#fff6dc" className="-right-10 -top-10 h-56 w-56 opacity-90" />
            <Balloon className="absolute -left-7 -top-9 z-10 w-10" color="#f43f6d" />
            <Sparkle
              className="absolute -right-3 bottom-12 z-10 w-7 animate-twinkle"
              color="#2fb9f1"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-lift ring-8 ring-cream">
              <Image
                src="/images/gallery/photo-group-smiles.webp?v=5"
                alt="Children laughing together during story time at Nimberly's Daycare"
                fill
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
