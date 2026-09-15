"use client";

import { Reveal } from "./Reveal";
import { Squiggle } from "./decor";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import React from "react";

type Props = {
  eyebrowKey?: DictKey;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean;
  squiggle?: boolean;
  className?: string;
};

/** Consistent, playful section heading used across the site */
export function SectionHeading({
  eyebrowKey,
  title,
  subtitle,
  align = "center",
  dark = false,
  squiggle = true,
  className = "",
}: Props) {
  const { t } = useI18n();
  const centered = align === "center";
  return (
    <div
      className={`${centered ? "mx-auto text-center items-center" : "text-left items-start"} flex max-w-2xl flex-col ${className}`}
    >
      {eyebrowKey && (
        <Reveal from="scale">
          <span className={`eyebrow ${dark ? "!bg-white/15 !text-white !shadow-none" : ""}`}>
            <SparkleDot />
            {t(eyebrowKey)}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className={`section-title mt-4 text-balance ${dark ? "text-white" : "text-ink"}`}>
          {title}
        </h2>
      </Reveal>
      {squiggle && (
        <Reveal delay={0.16}>
          <Squiggle className="mt-3 w-36" color={dark ? "#FFC42E" : "#7CC043"} />
        </Reveal>
      )}
      {subtitle && (
        <Reveal delay={0.22}>
          <p className={`mt-3 text-base leading-relaxed sm:text-lg ${dark ? "text-white/80" : "text-ink-soft"}`}>
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

function SparkleDot() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-pink-pop" fill="currentColor" aria-hidden>
      <path d="M8 0c.6 3.8 3.6 6.9 8 8-4.4 1.1-7.4 4.2-8 8-.6-3.8-3.6-6.9-8-8 4.4-1.1 7.4-4.2 8-8z" />
    </svg>
  );
}
