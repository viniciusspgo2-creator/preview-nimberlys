"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

/**
 * Premium branded page transition / boot splash.
 * The curtain is server-rendered with pure-CSS animations (splash-*),
 * so the full logo — with the "Nimberly's Daycare" wordmark baked in —
 * is visible instantly, even before React hydrates. Once JS is live,
 * framer-motion lifts the curtain away on every route change.
 */
export function PageTransition() {
  const pathname = usePathname();
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const firstRun = useRef(true);

  useEffect(() => {
    // Duration: slightly longer on the very first load
    const ms = reduce ? 200 : firstRun.current ? 1600 : 1250;
    firstRun.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- route-change overlay trigger
    setVisible(true);
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, ms);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [pathname, reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-transition"
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-3%", filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="splash-root fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream"
        >
          {/* soft backdrop decor */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-pink-soft blur-3xl" />
            <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-sky-soft blur-3xl" />
            <div className="absolute left-1/3 -top-20 h-56 w-56 rounded-full bg-yellow-soft blur-3xl" />
          </div>

          {/* Full logo — animated in with pure CSS, no JS required */}
          <div className="splash-pop relative">
            <Image
              src="/images/logo.png?v=2"
              alt=""
              width={480}
              height={480}
              priority
              className="w-44 sm:w-56"
            />
          </div>

          <p className="splash-rise mt-3 text-[0.7rem] font-bold uppercase tracking-[0.34em] text-pink-pop sm:text-xs">
            {t("loader.tagline")}
          </p>

          {/* Rainbow progress */}
          <div className="splash-rise mt-7 h-2 w-44 overflow-hidden rounded-full bg-white shadow-inner sm:w-56">
            <div className="rainbow-bar splash-bar h-full rounded-full" />
          </div>

          {/* bouncing dots */}
          <div className="splash-rise mt-4 flex gap-2" aria-hidden>
            {["#F43F6D", "#FF7A1F", "#FFC42E", "#7CC043", "#2FB9F1", "#2278E0", "#D92E9C"].map(
              (c, i) => (
                <span
                  key={c}
                  className="splash-dot h-2 w-2 rounded-full"
                  style={{ backgroundColor: c, animationDelay: `${0.55 + i * 0.09}s` }}
                />
              ),
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
