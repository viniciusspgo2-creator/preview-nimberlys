"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/shared/Reveal";
import { Blob, Cloud, Sparkle, Sun } from "@/components/shared/decor";

/**
 * About page hero — eyebrow, doodled headline, subtitle, and an
 * overlapping photo strip of life at the daycare.
 */
export function AboutPageHero() {
  const { t } = useI18n();
  const title = t("about.title");

  // Underline the final word of the (translated) headline with the doodle.
  const lastSpace = title.lastIndexOf(" ");
  const head = lastSpace > 0 ? title.slice(0, lastSpace) : title;
  const underlined = lastSpace > 0 ? title.slice(lastSpace + 1) : "";

  return (
    <section className="relative overflow-hidden bg-cream pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24">
      {/* Soft background blobs */}
      <Blob className="-left-24 top-10 h-72 w-72 opacity-60" color="#FDE5EC" />
      <Blob className="-right-20 top-40 h-80 w-80 opacity-50" color="#FFF6DC" />
      <Blob className="bottom-0 left-1/3 h-64 w-64 opacity-40" color="#E2F5FD" />

      {/* Playful sky decor */}
      <Sun className="absolute right-[6%] top-16 w-16 animate-spin-slow sm:w-20" />
      <Cloud className="absolute left-[5%] top-24 w-24 animate-float-slow opacity-90 sm:w-32" color="#FFFFFF" />
      <Sparkle className="absolute right-[16%] top-40 w-6 animate-twinkle" />
      <Sparkle
        className="absolute left-[14%] bottom-24 w-5 animate-twinkle"
        color="#F43F6D"
        style={{ animationDelay: "1.1s" }}
      />

      <div className="container-site relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal from="scale">
            <span className="eyebrow">
              <Sparkle className="h-3.5 w-3.5" color="#F43F6D" />
              {t("about.eyebrow")}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="section-title mt-5 text-balance sm:text-5xl lg:text-6xl">
              {head}{" "}
              {underlined && (
                <span className="doodle-underline whitespace-nowrap text-pink-pop">
                  {underlined}
                </span>
              )}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {t("about.subtitle")}
            </p>
          </Reveal>
        </div>

        {/* Overlapping photo strip */}
        <div className="mx-auto mt-12 flex max-w-3xl items-center justify-center sm:mt-16">
          <Reveal
            from="left"
            delay={0.1}
            className="relative z-10 w-[38%] -rotate-6 overflow-hidden rounded-4xl border-4 border-white shadow-lift sm:w-[34%]"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src="/images/gallery/photo-group-room.webp?v=4"
                alt="Children learning together at the activity table in the classroom"
                fill
                sizes="(max-width: 640px) 38vw, 260px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal
            delay={0.2}
            className="relative z-20 -mx-6 w-[46%] overflow-hidden rounded-4xl border-4 border-white shadow-lift sm:-mx-4 sm:w-[38%]"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src="/images/gallery/photo-kids-craft.webp?v=4"
                alt="Children doing a fall craft activity at the table"
                fill
                priority
                sizes="(max-width: 640px) 46vw, 300px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal
            from="right"
            delay={0.3}
            className="relative z-10 w-[38%] rotate-6 overflow-hidden rounded-4xl border-4 border-white shadow-lift sm:w-[34%]"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src="/images/gallery/photo-girl-smile.webp?v=4"
                alt="Two children smiling during a seasonal celebration"
                fill
                sizes="(max-width: 640px) 38vw, 260px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
