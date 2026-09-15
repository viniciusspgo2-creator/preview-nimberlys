"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, Mail, MapPin, Moon, Phone, Sparkles } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { WaveDivider, RainbowArch, Sparkle } from "@/components/shared/decor";

const AGE_GROUPS: DictKey[] = [
  "ages.infant.name",
  "ages.toddler.name",
  "ages.preschool.name",
  "ages.school.name",
];

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto">
      {/* Wave sits on the same cream-deep as the pre-footer CTA band, so the
          transparent top of the SVG reads as a seamless color hand-off —
          never a white gap. */}
      <div aria-hidden className="bg-cream-deep">
        <WaveDivider fill="#253557" className="-mb-px" />
      </div>

      <div className="relative bg-[#253557] text-white">
        {/* Decorative */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <RainbowArch className="absolute -left-10 -top-6 w-72 opacity-[0.08]" />
          <Sparkle className="absolute right-[12%] top-10 w-6 text-yellow-pop/40 animate-twinkle" />
          <Sparkle className="absolute right-[28%] bottom-16 w-4 text-pink-pop/40 animate-twinkle" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-24 right-[-4rem] h-64 w-64 rounded-full bg-brand/10 blur-2xl" />
        </div>

        <div className="container-site relative grid gap-10 pb-10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image src="/images/logo-mark.png" alt="" width={64} height={41} className="h-11 w-auto" />
              <div className="leading-none">
                <p className="font-display text-xl font-semibold">{SITE.displayName}</p>
                <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.3em] text-yellow-pop">
                  {t("footer.learnPlayGrow")}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">
              {t("footer.about")}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur">
              <Heart className="h-3.5 w-3.5 text-pink-pop" fill="currentColor" aria-hidden />
              {SITE.county}, California
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-yellow-pop">
              {t("footer.quickLinks")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-2 text-white/80 transition-all hover:translate-x-1 hover:text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-pop" aria-hidden />
                    {t(l.key as DictKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* We welcome */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-green-pop">
              {t("footer.weWelcome")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              {AGE_GROUPS.map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-sky-pop" aria-hidden />
                  {t(k)}
                </li>
              ))}
              <li className="pt-1 text-xs font-bold text-white/60">{t("footer.agesLabel")}: {SITE.ages}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-pink-pop">
              {t("footer.contact")}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={SITE.phoneHref} className="group flex items-start gap-2.5 text-white/80 transition-colors hover:text-white">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-pop/20 text-pink-pop transition-transform group-hover:scale-110">
                    <Phone className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="pt-1.5 font-bold">{SITE.phone}</span>
                </a>
              </li>
              <li>
                <a href={SITE.emailHref} className="group flex items-start gap-2.5 text-white/80 transition-colors hover:text-white">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-pop/20 text-sky-pop transition-transform group-hover:scale-110">
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="pt-1.5 break-all">{SITE.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/80">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-pop/20 text-green-pop">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <span className="pt-1.5">{SITE.addressFull}</span>
              </li>
              <li className="flex items-start gap-2.5 text-white/80">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-pop/20 text-orange-pop">
                  <Clock className="h-4 w-4" aria-hidden />
                </span>
                <span className="pt-1.5">{SITE.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/10">
          <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
            <p>
              © {year} {t("footer.rights")}
            </p>
            <p className="inline-flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-yellow-pop" aria-hidden />
              Made with love in Bay Point, CA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
