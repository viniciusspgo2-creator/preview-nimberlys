"use client";

import { useState } from "react";
import {
  Clock,
  Copy,
  Check,
  Mail,
  MapPin,
  Phone,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/shared/Reveal";

type InfoCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  chip: string;
  iconColor: string;
  href?: string;
  copyValue?: string;
  external?: boolean;
};

/** One contact detail card with optional link + copy-to-clipboard. */
function InfoCard({ icon: Icon, label, value, chip, iconColor, href, copyValue, external }: InfoCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      toast.success("Copied!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  const body = (
    <>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${chip}`} aria-hidden>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">
          {label}
        </span>
        <span className="mt-0.5 block break-words font-display text-base font-semibold text-ink [overflow-wrap:anywhere]">
          {value}
        </span>
      </span>
    </>
  );

  return (
    <div className="card-soft card-hover flex min-w-0 items-center gap-4 p-4 sm:p-5">
      {href ? (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
        >
          {body}
        </a>
      ) : (
        body
      )}
      {copyValue && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-ink-soft transition-all hover:bg-sky-soft hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 active:scale-90"
        >
          {copied ? <Check className="h-4.5 w-4.5 text-green-deep" aria-hidden /> : <Copy className="h-4.5 w-4.5" aria-hidden />}
        </button>
      )}
    </div>
  );
}

const STEP_COLORS = ["bg-pink-soft", "bg-yellow-soft", "bg-sky-soft", "bg-green-soft"];
const STEP_NUM_COLORS = ["text-pink-pop", "text-orange-pop", "text-sky-pop", "text-green-deep"];

/**
 * Right-hand info stack: contact details, reply promise, and next steps.
 */
export function ContactInfo() {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      {/* Contact details */}
      <Reveal from="right" delay={0.05} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <InfoCard
          icon={Phone}
          label={t("contact.phone")}
          value={SITE.phone}
          href={SITE.phoneHref}
          chip="bg-pink-soft"
          iconColor="text-pink-pop"
        />
        <InfoCard
          icon={Mail}
          label={t("contact.email")}
          value={SITE.email}
          href={SITE.emailHref}
          copyValue={SITE.email}
          chip="bg-sky-soft"
          iconColor="text-sky-pop"
        />
        <InfoCard
          icon={MapPin}
          label={t("contact.address")}
          value={SITE.addressFull}
          href={SITE.mapsDirections}
          external
          chip="bg-green-soft"
          iconColor="text-green-deep"
        />
        <InfoCard
          icon={Clock}
          label={t("contact.hours")}
          value={SITE.hours}
          chip="bg-orange-soft"
          iconColor="text-orange-pop"
        />
      </Reveal>

      {/* Reply-fast promise */}
      <Reveal from="right" delay={0.15}>
        <div className="flex items-start gap-4 rounded-4xl bg-yellow-soft p-5 sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-card" aria-hidden>
            <Zap className="h-6 w-6 text-orange-pop" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">
              {t("contact.response.title")}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
              {t("contact.response.text")}
            </p>
          </div>
        </div>
      </Reveal>

      {/* What happens next */}
      <Reveal from="right" delay={0.25}>
        <div className="card-soft p-5 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-ink">
            {t("contact.whyTitle")}
          </h3>
          <ol className="mt-4 space-y-3.5">
            {(["1", "2", "3", "4"] as const).map((step, i) => (
              <li key={step} className="flex items-start gap-3.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${STEP_COLORS[i]} ${STEP_NUM_COLORS[i]}`}
                  aria-hidden
                >
                  {step}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
                  {t(`contact.why${step}`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  );
}
