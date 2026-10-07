"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "@/components/shared/SiteImage";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, ChevronDown, Clock, Globe, Mail, Menu, Phone, ShieldCheck, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";

/* ---------------- Language selector ---------------- */
export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.language")}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25",
          compact && "px-2.5"
        )}
      >
        <Globe className="h-[1.05rem] w-[1.05rem]" aria-hidden />
        <span className="uppercase tracking-wide">{current.code}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-white p-1.5 shadow-[var(--shadow-lift)]"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={l.code === lang}
                onClick={() => {
                  setLang(l.code as Lang);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                  l.code === lang ? "bg-brand-soft text-brand" : "text-ink hover:bg-cream"
                )}
              >
                <span className="text-base leading-none" aria-hidden>{l.flag}</span>
                {l.native}
                {l.code === lang && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-green-pop" aria-hidden />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Logo lockup ---------------- */
function Logo() {
  return (
    <Link href="/" aria-label="Nimberly's Daycare — Home" className="group flex items-center gap-2.5">
      <span className="relative block transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
        <Image
          src="/images/logo-mark.png"
          alt=""
          width={56}
          height={36}
          priority
          className="h-9 w-auto sm:h-10"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.15rem] font-semibold text-brand sm:text-xl">
          Nimberly&apos;s
        </span>
        <span className="mt-0.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.28em] text-pink-pop">
          Daycare
        </span>
      </span>
    </Link>
  );
}

/* ---------------- Header ---------------- */
export function Header() {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on navigation
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Top info bar */}
      <div className="rainbow-bar relative z-40 text-white">
        <div className="container-site flex h-9 items-center justify-between gap-4 text-[0.72rem] font-bold tracking-wide sm:text-xs">
          <a
            href={SITE.phoneHref}
            className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-85"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {SITE.phone}
          </a>
          <div className="hidden items-center gap-5 md:flex">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {SITE.hoursShort}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              County &amp; CA subsidy programs accepted
            </span>
            <a
              href={SITE.emailHref}
              className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-85"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {SITE.email}
            </a>
          </div>
          <a href={SITE.emailHref} className="inline-flex items-center gap-1.5 md:hidden" aria-label="Email us">
            <Mail className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-40 pt-3 sm:pt-4">
        <div className="container-site">
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-full border py-2 pl-4 pr-2 transition-all duration-300 sm:pl-5 sm:pr-3",
              scrolled
                ? "border-border bg-white/90 shadow-[var(--shadow-soft)] backdrop-blur-xl"
                : "border-transparent bg-white/70 backdrop-blur-md"
            )}
          >
            <Logo />

            <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "link-underline rounded-full px-3.5 py-2 text-[0.92rem] font-bold transition-colors xl:px-4",
                      active ? "text-brand" : "text-ink hover:text-brand"
                    )}
                  >
                    {t(link.key as DictKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <LanguageSelector />
              <Link href="/contact" className="btn-primary btn-sm hidden sm:inline-flex">
                <CalendarCheck className="h-4 w-4" aria-hidden />
                {t("nav.cta")}
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t("a11y.openMenu")}
                aria-expanded={menuOpen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 lg:hidden"
              >
                <Menu className="h-5.5 w-5.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-cream/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto rounded-l-[2.5rem] bg-white shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between border-b border-border/70 p-5">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t("a11y.closeMenu")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-ink transition-colors hover:bg-pink-soft hover:text-pink-pop"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-5">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 32 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.06, duration: 0.35, ease: "easeOut" }}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg font-semibold transition-colors",
                          active ? "bg-brand-soft text-brand" : "text-ink hover:bg-cream"
                        )}
                      >
                        {t(link.key as DictKey)}
                        {active && <span className="h-2.5 w-2.5 rounded-full bg-pink-pop" aria-hidden />}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="mt-auto space-y-4 border-t border-border/70 p-5"
              >
                <Link href="/contact" className="btn-primary btn-md w-full">
                  <CalendarCheck className="h-4.5 w-4.5" aria-hidden />
                  {t("nav.cta")}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code as Lang)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                        l.code === lang
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-border text-ink-soft hover:border-brand hover:text-brand"
                      )}
                    >
                      <span aria-hidden>{l.flag}</span> {l.native}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5 pb-2 text-sm font-semibold text-ink-soft">
                  <a href={SITE.phoneHref} className="inline-flex items-center gap-2 hover:text-brand">
                    <Phone className="h-4 w-4 text-pink-pop" aria-hidden /> {SITE.phone}
                  </a>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-pop" aria-hidden /> {SITE.hoursShort}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

