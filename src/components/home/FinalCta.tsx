"use client";

import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/shared/Reveal";
import { Balloon, Blob, RainbowArch, Sparkle } from "@/components/shared/decor";

export function FinalCta() {
  const { t } = useI18n();

  return (
    <section
      aria-label={t("final.title")}
      className="relative overflow-hidden bg-cream-deep pb-24 pt-16 sm:pb-28 sm:pt-20"
    >
      {/* Color washes */}
      <Blob color="#fde5ec" className="-left-24 top-6 h-80 w-80 opacity-80" />
      <Blob color="#e2f5fd" className="-right-24 bottom-0 h-72 w-72 opacity-70" />
      <Blob color="#ecf7e2" className="bottom-10 left-[38%] h-56 w-56 opacity-60" />

      {/* Floating decor */}
      <Balloon className="pointer-events-none absolute left-[7%] top-20 w-12" color="#f43f6d" />
      <Balloon
        className="pointer-events-none absolute right-[9%] top-28 hidden w-10 sm:block"
        color="#ffc42e"
        delay={1.2}
      />
      <Balloon
        className="pointer-events-none absolute bottom-16 left-[16%] hidden w-9 lg:block"
        color="#2fb9f1"
        delay={2}
      />
      <Sparkle className="pointer-events-none absolute right-[20%] top-16 w-6 animate-twinkle" color="#f43f6d" />
      <Sparkle
        className="pointer-events-none absolute bottom-20 right-[12%] w-7 animate-twinkle"
        color="#7cc043"
        style={{ animationDelay: "1s" }}
      />
      <Sparkle
        className="pointer-events-none absolute left-[24%] bottom-24 w-5 animate-twinkle"
        color="#d92e9c"
        style={{ animationDelay: "1.8s" }}
      />

      <div className="container-site relative text-center">
        <Reveal from="scale">
          <RainbowArch className="mx-auto w-60 sm:w-72" />
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="section-title mx-auto mt-6 max-w-2xl text-balance">
            {t("final.title")}
          </h2>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {t("final.subtitle")}
          </p>
        </Reveal>

        <Reveal delay={0.26}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="btn-pink btn-lg w-full sm:w-auto">
              <CalendarCheck className="h-5 w-5" aria-hidden />
              {t("final.primary")}
            </Link>
            <a href={SITE.phoneHref} className="btn-outline btn-lg w-full sm:w-auto">
              <Phone className="h-5 w-5" aria-hidden />
              {t("final.secondary")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
