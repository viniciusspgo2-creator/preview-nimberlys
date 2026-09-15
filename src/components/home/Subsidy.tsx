"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SUBSIDY_PROGRAMS } from "@/lib/site";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { RainbowArch, Sparkle } from "@/components/shared/decor";

export function Subsidy() {
  const { t } = useI18n();

  return (
    <section
      id="programs"
      aria-label={t("subsidy.title")}
      className="relative scroll-mt-28 overflow-hidden bg-[#253557] py-20 sm:py-28"
    >
      {/* Decor */}
      <RainbowArch className="pointer-events-none absolute -right-10 -top-8 w-72 opacity-20" />
      <RainbowArch className="pointer-events-none absolute -left-16 bottom-0 w-56 rotate-180 opacity-10" />
      <Sparkle className="pointer-events-none absolute left-[12%] top-16 w-6 animate-twinkle" color="#ffc42e" />
      <Sparkle
        className="pointer-events-none absolute bottom-20 left-[45%] w-5 animate-twinkle"
        color="#2fb9f1"
        style={{ animationDelay: "1.1s" }}
      />

      <div className="container-site relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* ---- Copy ---- */}
          <div>
            <SectionHeading
              eyebrowKey="subsidy.eyebrow"
              title={t("subsidy.title")}
              align="left"
              dark
              squiggle={false}
            />
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-xl leading-relaxed text-white/80 sm:text-lg">
                {t("subsidy.intro")}
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <p className="mt-6 flex max-w-md items-start gap-2.5 text-xs leading-relaxed text-white/55">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {t("subsidy.disclaimer")}
              </p>
            </Reveal>
            <Reveal delay={0.36}>
              <Link href="/contact" className="btn-pink btn-lg mt-8">
                {t("subsidy.cta")}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Reveal>
          </div>

          {/* ---- Programs ---- */}
          <div>
            <Reveal delay={0.1}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                {t("subsidy.listTitle")}
              </h3>
            </Reveal>
            <RevealGroup className="mt-5 flex flex-col gap-3" stagger={0.06}>
              {SUBSIDY_PROGRAMS.map((program) => (
                <RevealItem key={program}>
                  <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 backdrop-blur transition-colors duration-300 hover:bg-white/15">
                    <BadgeCheck className="h-6 w-6 shrink-0 text-yellow-pop" aria-hidden />
                    <span className="text-sm font-semibold text-white sm:text-[0.95rem]">
                      {program}
                    </span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
