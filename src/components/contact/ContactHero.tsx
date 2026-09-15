"use client";

import { Blob, Cloud, Sparkle, Sun } from "@/components/shared/decor";
import { Reveal } from "@/components/shared/Reveal";
import { useI18n } from "@/lib/i18n";

/**
 * Contact page hero — warm invitation to reach out.
 */
export function ContactHero() {
  const { t } = useI18n();
  const title = t("contact.title");
  const words = title.split(" ");
  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");

  return (
    <section className="relative overflow-hidden bg-cream pb-14 pt-28 sm:pb-16 sm:pt-32">
      <Blob className="-left-24 top-10 h-72 w-72 opacity-60" color="#E2F5FD" />
      <Blob className="-right-20 top-24 h-80 w-80 opacity-50" color="#FDE5EC" />
      <Blob className="bottom-0 left-1/3 h-56 w-56 opacity-40" color="#FFF6DC" />
      <Sun className="absolute right-[6%] top-16 w-14 animate-spin-slow sm:w-16" />
      <Cloud className="absolute left-[5%] top-24 w-24 animate-float-slow opacity-90" color="#FFFFFF" />
      <Sparkle className="absolute right-[18%] top-36 w-6 animate-twinkle" />
      <Sparkle
        className="absolute left-[14%] bottom-16 w-5 animate-twinkle"
        color="#F43F6D"
        style={{ animationDelay: "1.1s" }}
      />

      <div className="container-site relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal from="scale">
            <span className="eyebrow">
              <Sparkle className="h-3.5 w-3.5" color="#2FB9F1" />
              {t("contact.eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="section-title mt-5 text-balance sm:text-5xl lg:text-6xl">
              {head}{" "}
              {tail && (
                <span className="doodle-underline whitespace-nowrap text-pink-pop">{tail}</span>
              )}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {t("contact.subtitle")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
