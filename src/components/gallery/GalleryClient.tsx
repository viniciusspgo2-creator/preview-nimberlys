"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  /** Tall cells span 2 rows on desktop for a lively mosaic */
  tall?: boolean;
  /** Wide cells span 2 columns on desktop */
  wide?: boolean;
};

/** Every photo of the new collection — all in one place. */
const PHOTOS: GalleryPhoto[] = [
  {
    src: "/images/gallery/hero-classroom.webp?v=6",
    alt: "Five happy children smiling together on the classroom rug",
    caption: "All smiles",
    tall: true,
  },
  {
    src: "/images/gallery/photo-group-room.webp?v=5",
    alt: "Six happy children lying together on the play mat smiling at the camera",
    caption: "The whole gang",
    wide: true,
  },
  {
    src: "/images/gallery/photo-group-rug.webp?v=6",
    alt: "Eight laughing children sitting in a row on the colorful alphabet rug",
    caption: "Alphabet rug crew",
    wide: true,
  },
  {
    src: "/images/gallery/photo-girl-smile.webp?v=5",
    alt: "Three smiling children posing together against a yellow wall",
    caption: "Best friends",
  },
  {
    src: "/images/gallery/photo-baby-play.webp?v=5",
    alt: "A curious baby reaching out while playing with colorful blocks",
    caption: "Discovery day",
  },
  {
    src: "/images/gallery/photo-boy-blocks.webp?v=5",
    alt: "A toddler concentrating hard while stacking colorful toy blocks",
    caption: "Little architect",
    tall: true,
  },
  {
    src: "/images/gallery/photo-girl-draw.webp?v=5",
    alt: "Two children exploring a picture book and building with blocks together",
    caption: "Story time friends",
  },
  {
    src: "/images/gallery/photo-girl-stack.webp?v=5",
    alt: "A smiling child playing with building blocks in the classroom",
    caption: "Proud builder",
  },
  {
    src: "/images/gallery/photo-boy-truck.webp?v=5",
    alt: "A toddler playing with a wooden toy train with a teacher nearby",
    caption: "All aboard!",
    wide: true,
  },
  {
    src: "/images/gallery/photo-girl-table.webp?v=5",
    alt: "A caregiver and two girls building with blocks at the activity table",
    caption: "Teamwork",
  },
  {
    src: "/images/gallery/photo-group-smiles.webp?v=5",
    alt: "Children laughing together during story time",
    caption: "Story time giggles",
    wide: true,
  },
  {
    src: "/images/gallery/photo-kids-craft.webp?v=5",
    alt: "Children and teachers playing with colorful balls on the classroom rug",
    caption: "Play-time together",
    wide: true,
  },
  {
    src: "/images/gallery/photo-kids-play.webp?v=6",
    alt: "Six smiling children sitting together under the Happy Daycare banner",
    caption: "Our happy place",
  },
  {
    src: "/images/gallery/photo-toddler-fun.webp?v=5",
    alt: "Children celebrating together with balloons at a classroom party",
    caption: "Party day",
    tall: true,
  },
  {
    src: "/images/gallery/photo-toddler-joy.webp?v=5",
    alt: "A laughing toddler enjoying building blocks with a caregiver",
    caption: "Pure joy",
  },
  {
    src: "/images/gallery/photo-boy-learning.webp?v=5",
    alt: "A toddler counting with a wooden abacus toy",
    caption: "Little scholar",
  },
  {
    src: "/images/gallery/photo-fall-friends.webp?v=5",
    alt: "Children listening attentively in a circle on the classroom floor",
    caption: "Circle of friends",
  },
  {
    src: "/images/gallery/photo-group-circle.webp?v=5",
    alt: "Children lying in a circle with their heads together on the floor",
    caption: "Heads together",
  },
];

export function GalleryClient() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  // Keyboard navigation for the lightbox
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : (i + PHOTOS.length - 1) % PHOTOS.length));
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % PHOTOS.length));
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const step = (dir: 1 | -1) =>
    setOpen((i) => (i === null ? null : (i + dir + PHOTOS.length) % PHOTOS.length));

  return (
    <section aria-label={t("galleryPage.title")} className="bg-cream pt-28 pb-20 sm:pt-32 sm:pb-28">
      <div className="container-site">
        <SectionHeading
          eyebrowKey="galleryPage.eyebrow"
          title={t("galleryPage.title")}
          subtitle={t("galleryPage.subtitle")}
        />

        <RevealGroup
          className="mt-12 grid auto-rows-[150px] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[180px] sm:gap-4 lg:auto-rows-[210px]"
          stagger={0.05}
        >
          {PHOTOS.map((photo, i) => (
            <RevealItem
              key={photo.src}
              className={photo.tall ? "lg:row-span-2" : photo.wide ? "col-span-2" : undefined}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${photo.caption} — ${t("galleryPage.title")}`}
                className="group relative block h-full w-full overflow-hidden rounded-3xl shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-pop/40"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-10 text-left text-sm font-semibold text-white opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                >
                  {photo.caption}
                </span>
              </button>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* ---- Lightbox ---- */}
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none"
        >
          <DialogTitle className="sr-only">{t("galleryPage.title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("galleryPage.subtitle")}</DialogDescription>

          {open !== null && (
            <div className="relative h-[70vh] w-full overflow-hidden rounded-3xl shadow-lift sm:h-[78vh]">
              <Image
                key={PHOTOS[open].src}
                src={PHOTOS[open].src}
                alt={PHOTOS[open].alt}
                fill
                sizes="(min-width: 896px) 896px, 92vw"
                className="object-cover"
                priority
              />

              {/* caption + counter */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5 pt-14">
                <p className="font-display text-lg font-semibold text-white">
                  {PHOTOS[open].caption}
                </p>
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                {open + 1} / {PHOTOS.length}
              </span>

              {/* controls */}
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t("gallery.prev")}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lift transition hover:scale-105 hover:bg-white"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t("gallery.next")}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lift transition hover:scale-105 hover:bg-white"
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label={t("gallery.close")}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-lift transition hover:scale-105 hover:bg-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
