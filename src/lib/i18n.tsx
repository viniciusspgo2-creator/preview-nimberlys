"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { en, type DictKey } from "@/i18n/dictionaries/en";
import { es } from "@/i18n/dictionaries/es";
import { fr } from "@/i18n/dictionaries/fr";
import { de } from "@/i18n/dictionaries/de";
import { pt } from "@/i18n/dictionaries/pt";

export const LANGUAGES = [
  { code: "en", flag: "🇺🇸", label: "English", native: "English" },
  { code: "es", flag: "🇪🇸", label: "Spanish", native: "Español" },
  { code: "fr", flag: "🇫🇷", label: "French", native: "Français" },
  { code: "de", flag: "🇩🇪", label: "German", native: "Deutsch" },
  { code: "pt", flag: "🇧🇷", label: "Portuguese", native: "Português" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

type Dict = Partial<Record<DictKey, string>>;

const DICTIONARIES: Record<Lang, Dict> = {
  en,
  es: es as Dict,
  fr: fr as Dict,
  de: de as Dict,
  pt: pt as Dict,
};

const STORAGE_KEY = "nimberlys.lang";

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) =>
    vars[k] !== undefined ? String(vars[k]) : m
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always start in English (SSR-safe); hydrate saved preference after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe localStorage read
      if (saved && saved in DICTIONARIES) setLangState(saved);
    } catch {
      /* private mode */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* private mode */
    }
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => {
      const val = DICTIONARIES[lang]?.[key] ?? en[key] ?? key;
      return interpolate(val, vars);
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

// Convenience: pick a translation of a nav/link label inside non-hook contexts
export function getDict(lang: Lang): Dict {
  return DICTIONARIES[lang];
}
