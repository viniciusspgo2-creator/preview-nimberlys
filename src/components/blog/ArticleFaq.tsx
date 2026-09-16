"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/shared/Reveal";
import { useI18n } from "@/lib/i18n";
import React from "react";

/* ============================================================
   PostFaq — article FAQ accordion (shadcn) with heading
   ============================================================ */

export type FaqItem = { question: string; answer: string };

export function PostFaq({ faqs }: { faqs: FaqItem[] }) {
  const { t } = useI18n();
  if (faqs.length === 0) return null;

  return (
    <Reveal className="mt-14">
      <section aria-label={t("blog.faqTitle")}>
        <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-ink sm:text-[1.65rem]">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-yellow-soft">
            <HelpCircle className="h-5.5 w-5.5 text-orange-pop" aria-hidden />
          </span>
          {t("blog.faqTitle")}
        </h2>

        <Accordion type="single" collapsible className="mt-6 space-y-3.5">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={`faq-${i}`}
              value={`faq-${i}`}
              className="card-soft rounded-3xl border-0 px-5 sm:px-6"
            >
              <AccordionTrigger className="py-5 font-display text-base font-semibold text-ink hover:no-underline sm:text-lg [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0 [&>svg]:text-pink-pop">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[0.95rem] leading-relaxed text-ink-soft">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </Reveal>
  );
}
