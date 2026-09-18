"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WaveDivider, Sparkle } from "@/components/shared/decor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

type FaqItem = {
  question: string;
  answer: string;
  category?: string;
};

/** Graceful fallback (first 5 seeded FAQs) used while /api/faq is unavailable */
const FALLBACK_FAQS: FaqItem[] = [
  {
    question: "What ages of children do you accept?",
    answer:
      "We welcome infants and toddlers. Our small, family-style setting lets us care for infants, toddlers, preschoolers, and school-age children in a warm, mixed-age environment where everyone feels at home.",
    category: "Enrollment",
  },
  {
    question: "What are your hours of operation?",
    answer:
      "We are open Monday through Friday, from 7:00 AM to 5:30 PM. We're closed on weekends and major holidays. If you need care during specific hours, give us a call and we'll be happy to confirm availability.",
    category: "General",
  },
  {
    question: "Where is Nimberly's Daycare located?",
    answer:
      "We're located on Island View Drive in Bay Point, California 94565 — a quiet, family-friendly neighborhood in Contra Costa County. Families visit us from Bay Point, Pittsburg, and surrounding communities.",
    category: "General",
  },
  {
    question: "Do you accept child care subsidy programs?",
    answer:
      "Yes! We accept child care subsidy programs from Contra Costa County and the State of California, including CalWORKs Child Care, CAPP, CCTR, CSPP, CocoKids, and CDSS programs. Eligibility is determined by each program, so contact us and we'll gladly help you understand your options.",
    category: "Subsidy",
  },
  {
    question: "How do I schedule a visit?",
    answer:
      "It's simple — call us at (925) 848-8272, email nimberlysdaycare0528@gmail.com, or fill out the contact form on our website. We love meeting families in person, and a visit is the best way to see if we're the right fit for your child.",
    category: "Enrollment",
  },
];

const CATEGORY_TONES: Record<string, string> = {
  Enrollment: "bg-pink-soft text-pink-pop",
  General: "bg-brand-soft text-brand",
  Subsidy: "bg-green-soft text-green-deep",
  Programs: "bg-orange-soft text-orange-pop",
};

export function FaqPreview() {
  const { t } = useI18n();
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/faq")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: unknown) => {
        if (!alive) return;
        const list =
          data && typeof data === "object" && Array.isArray((data as { faqs?: unknown }).faqs)
            ? ((data as { faqs: FaqItem[] }).faqs ?? []).slice(0, 5)
            : [];
        setFaqs(list.length > 0 ? list : FALLBACK_FAQS);
      })
      .catch(() => {
        if (alive) setFaqs(FALLBACK_FAQS);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      aria-label={t("faq.title")}
      className="relative overflow-hidden bg-cream-deep"
    >
      <WaveDivider fill="#ffffff" flip />
      <Sparkle
        className="pointer-events-none absolute right-[10%] top-44 w-6 animate-twinkle"
        color="#2fb9f1"
      />

      <div className="container-site relative pb-20 pt-10 sm:pb-24 sm:pt-12">
        <SectionHeading
          eyebrowKey="faq.eyebrow"
          title={t("faq.title")}
          subtitle={t("faq.subtitle")}
        />

        <div className="mx-auto mt-12 max-w-3xl">
          {faqs === null ? (
            <div className="rounded-[2.5rem] bg-white p-5 shadow-card sm:p-7">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          ) : (
            <Reveal>
              <div className="rounded-[2.5rem] bg-white px-5 py-2 shadow-card sm:px-7">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={faq.question}
                      value={`faq-${i}`}
                      className="border-b border-cream-deep last:border-b-0"
                    >
                      <AccordionTrigger className="gap-4 rounded-none py-5 font-display text-base font-semibold text-ink hover:no-underline sm:text-lg [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0 [&>svg]:text-brand">
                        <span className="flex flex-1 items-center gap-3 text-left">
                          <span>{faq.question}</span>
                          {faq.category && (
                            <span
                              className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide sm:inline-block ${
                                CATEGORY_TONES[faq.category] ?? "bg-cream-deep text-ink-soft"
                              }`}
                            >
                              {faq.category}
                            </span>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-[0.95rem] leading-relaxed text-ink-soft">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.12} className="mt-9 text-center">
            <Link href="/faq" className="btn-outline btn-md">
              {t("faq.viewAll")}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
