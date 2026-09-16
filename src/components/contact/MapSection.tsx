"use client";

import { MapPin, Navigation } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Sparkle } from "@/components/shared/decor";

/**
 * Location section — embedded Google Map with an address overlay card.
 */
export function MapSection() {
  const { t } = useI18n();

  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <SectionHeading
          eyebrowKey="location.eyebrow"
          title={t("contact.map.title")}
          subtitle={t("contact.map.text")}
        />

        <Reveal delay={0.15} className="relative mx-auto mt-10 max-w-4xl sm:mt-14">
          <div className="overflow-hidden rounded-4xl border-4 border-white shadow-lift">
            <iframe
              src={SITE.mapsEmbed}
              title={t("contact.map.title")}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[360px] w-full sm:h-[440px]"
            />
          </div>

          {/* Overlay card */}
          <div className="mt-5 sm:absolute sm:bottom-6 sm:left-6 sm:mt-0 sm:max-w-sm">
            <div className="card-soft p-5 sm:p-6">
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-soft" aria-hidden>
                  <MapPin className="h-5.5 w-5.5 text-pink-pop" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-ink sm:text-lg">
                    {SITE.displayName}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                    {SITE.addressFull}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={SITE.mapsListing}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-sm flex-1"
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  {t("contact.map.open")}
                </a>
                <a
                  href={SITE.mapsDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm flex-1"
                >
                  <Navigation className="h-4 w-4 text-brand" aria-hidden />
                  {t("contact.map.directions")}
                </a>
              </div>
            </div>
          </div>

          <Sparkle
            className="absolute -top-5 right-8 w-8 animate-twinkle"
            color="#2FB9F1"
          />
        </Reveal>
      </div>
    </section>
  );
}
