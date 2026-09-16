/* ============================================================
   BLOG — Category color system
   Maps each editorial category to the brand rainbow palette.
   Class strings are static so Tailwind can detect them.
   ============================================================ */

export type CategoryStyle = {
  /** Soft chip used inside card bodies */
  badge: string;
  /** Solid chip overlaid on cover photos */
  overlay: string;
  /** Solid text color utility */
  text: string;
  /** Dot marker */
  dot: string;
  /** Active filter pill */
  pillActive: string;
};

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "Choosing Child Care": {
    badge: "bg-pink-soft text-pink-pop",
    overlay: "bg-pink-pop text-white",
    text: "text-pink-pop",
    dot: "bg-pink-pop",
    pillActive: "bg-pink-pop border-pink-pop text-white",
  },
  "Parenting Tips": {
    badge: "bg-orange-soft text-orange-pop",
    overlay: "bg-orange-pop text-white",
    text: "text-orange-pop",
    dot: "bg-orange-pop",
    pillActive: "bg-orange-pop border-orange-pop text-white",
  },
  "Child Development": {
    badge: "bg-sky-soft text-sky-pop",
    overlay: "bg-sky-pop text-white",
    text: "text-sky-pop",
    dot: "bg-sky-pop",
    pillActive: "bg-sky-pop border-sky-pop text-white",
  },
  "Nutrition & Health": {
    badge: "bg-green-soft text-green-deep",
    overlay: "bg-green-pop text-white",
    text: "text-green-deep",
    dot: "bg-green-pop",
    pillActive: "bg-green-pop border-green-pop text-white",
  },
  "Subsidies & Programs": {
    badge: "bg-magenta-soft text-magenta-pop",
    overlay: "bg-magenta-pop text-white",
    text: "text-magenta-pop",
    dot: "bg-magenta-pop",
    pillActive: "bg-magenta-pop border-magenta-pop text-white",
  },
};

const FALLBACK: CategoryStyle = {
  badge: "bg-brand-soft text-brand",
  overlay: "bg-brand text-white",
  text: "text-brand",
  dot: "bg-brand",
  pillActive: "bg-brand border-brand text-white",
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? FALLBACK;
}

/** Small rainbow gradient dot used for the "All" filter pill */
export const ALL_PILL_DOT =
  "bg-[linear-gradient(90deg,#f43f6d,#ffc42e,#2fb9f1)]";

/** Rotating dot colors for TOC markers */
export const TOC_DOTS = [
  "bg-pink-pop",
  "bg-orange-pop",
  "bg-yellow-pop",
  "bg-green-pop",
  "bg-sky-pop",
  "bg-magenta-pop",
];
