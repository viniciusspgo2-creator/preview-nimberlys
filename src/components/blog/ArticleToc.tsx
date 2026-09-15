"use client";

import { ListTree } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TOC_DOTS } from "./categories";
import React from "react";

/* ============================================================
   ArticleToc — sticky "In this article" card (xl screens)
   ============================================================ */

export type TocItem = { id: string; text: string };

export function ArticleToc({ items }: { items: TocItem[] }) {
  const { t } = useI18n();
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={t("blog.toc")}
      className="card-soft sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto p-6 no-scrollbar"
    >
      <p className="flex items-center gap-2 font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-ink">
        <ListTree className="h-4 w-4 text-pink-pop" aria-hidden />
        {t("blog.toc")}
      </p>
      <ul className="mt-4 space-y-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex items-start gap-2.5 rounded-xl px-3 py-2 text-[0.86rem] font-semibold leading-snug text-ink-soft transition-colors hover:bg-pink-soft/60 hover:text-pink-pop"
            >
              <span
                className={`mt-[0.4rem] h-2 w-2 shrink-0 rounded-full ${TOC_DOTS[i % TOC_DOTS.length]}`}
                aria-hidden
              />
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
