"use client";

import {
  Blocks,
  HeartHandshake,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { Reveal } from "@/components/shared/Reveal";

const TRUST: {
  titleKey: DictKey;
  textKey: DictKey;
  icon: LucideIcon;
  wrap: string;
}[] = [
  {
    titleKey: "trust.1.title",
    textKey: "trust.1.text",
    icon: ShieldCheck,
    wrap: "bg-brand-soft text-brand",
  },
  {
    titleKey: "trust.2.title",
    textKey: "trust.2.text",
    icon: HeartHandshake,
    wrap: "bg-pink-soft text-pink-pop",
  },
  {
    titleKey: "trust.3.title",
    textKey: "trust.3.text",
    icon: Blocks,
    wrap: "bg-green-soft text-green-deep",
  },
  {
    titleKey: "trust.4.title",
    textKey: "trust.4.text",
    icon: Sun,
    wrap: "bg-orange-soft text-orange-pop",
  },
];

export function TrustBar() {
  const { t } = useI18n();

  return (
    <section aria-label={t("trust.1.title")} className="relative z-10 -mt-16 sm:-mt-20">
      <div className="container-site">
        <Reveal from="up" duration={0.7}>
          <ul className="grid gap-6 rounded-[2.5rem] bg-white p-6 shadow-lift ring-1 ring-ink/5 sm:grid-cols-2 sm:p-8 lg:grid-cols-4 lg:gap-5 xl:gap-7">
            {TRUST.map((item) => (
              <li key={item.titleKey} className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.wrap}`}
                >
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {t(item.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {t(item.textKey)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
