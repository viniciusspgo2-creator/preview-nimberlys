"use client";

import { Baby, Clock, HandHeart, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";

const CHIPS = [
  { key: "hero.chip1", icon: Baby, iconColor: "text-sky-pop" },
  { key: "hero.chip2", icon: Clock, iconColor: "text-orange-pop" },
  { key: "hero.chip3", icon: HandHeart, iconColor: "text-pink-pop" },
  { key: "hero.chip4", icon: MapPin, iconColor: "text-green-deep" },
] as const;

/**
 * Trust strip — quick facts families scan for before reaching out.
 */
export function TrustStrip() {
  const { t } = useI18n();

  return (
    <section className="bg-cream-deep pb-20 pt-2 sm:pb-24">
      <div className="container-site">
        <RevealGroup className="flex flex-wrap items-center justify-center gap-3 sm:gap-4" stagger={0.08}>
          {CHIPS.map((c) => {
            const Icon = c.icon;
            return (
              <RevealItem key={c.key} from="scale">
                <span className="chip-info !px-5 !py-2.5 !text-sm">
                  <Icon className={`h-4.5 w-4.5 ${c.iconColor}`} aria-hidden />
                  {t(c.key)}
                </span>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
