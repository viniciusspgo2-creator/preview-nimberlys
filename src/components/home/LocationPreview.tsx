"use client";

import Link from "next/link";
import { Clock3, MapPin, Navigation, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Balloon } from "@/components/shared/decor";

export function LocationPreview() {
  const { t } = useI18n();

  return (
    <section aria-label={t("location.title")} className="bg-white py-20 sm:py-28">
      <div className="container-site">
        <Reveal from="scale" duration={0.75}>
          <div className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-lift ring-1 ring-ink/5 lg:grid-cols-2">
            {/* ---- Copy + NAP ---- */}
            <div className="relative p-7 sm:p-10 lg:p-12">
              <Balloon className="absolute right-8 top-8 w-8 opacity-90" color="#ffc42e" />
              <SectionHeading
                eyebrowKey="location.eyebrow"
                title={t("location.title")}
                subtitle={t("location.subtitle")}
                align="left"
                squiggle={false}
              />

              <ul className="mt-8 space-y-6">
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-soft text-pink-pop">
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                      {t("contact.address")}
                    </h3>
                    <p className="mt-1 font-semibold text-ink">{SITE.addressFull}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                      {t("contact.phone")}
                    </h3>
                    <a
                      href={SITE.phoneHref}
                      className="link-underline mt-1 inline-block font-semibold text-brand"
                    >
                      {SITE.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-soft text-green-deep">
                    <Clock3 className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                      {t("contact.hours")}
                    </h3>
                    <p className="mt-1 font-semibold text-ink">{SITE.hours}</p>
                  </div>
                </li>
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SITE.mapsDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-md"
                >
                  <Navigation className="h-4.5 w-4.5" aria-hidden />
                  {t("common.getDirections")}
                </a>
                <Link href="/contact" className="btn-outline btn-md">
                  {t("common.contactUs")}
                </Link>
              </div>
            </div>

            {/* ---- Map ---- */}
            <div className="relative min-h-[20rem] border-t border-cream-deep lg:min-h-0 lg:border-l lg:border-t-0">
              <iframe
                src={SITE.mapsEmbed}
                title={`${SITE.displayName} — map to ${SITE.addressFull}`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 lg:h-full"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
