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
  /** Mobile-first grid spans; explicit lg placement forms the mosaic */
  cls: string;
};

const PHOTOS: GalleryPhoto[] = [
  {
    src: "/images/gallery/photo-kids-craft.webp?v=4",
    alt: "Children doing a fall craft activity together at the table",
    caption: "Little hands, big creations",
    cls: "col-span-2 row-span-2 lg:col-start-1 lg:row-start-1",
  },
  {
    src: "/images/gallery/photo-girl-smile.webp?v=4",
    alt: "Two children smiling during a seasonal celebration",
    caption: "Happy faces, every day",
    cls: "lg:col-start-3 lg:row-start-1",
  },
  {
    src: "/images/gallery/photo-baby-play.webp?v=4",
    alt: "Babies exploring colorful balloons on the grass",
    caption: "Big fun for our littlest ones",
    cls: "lg:col-start-4 lg:row-start-1",
  },
  {
    src: "/images/gallery/photo-boy-blocks.webp?v=4",
    alt: "A boy carefully stacking mini pumpkins at the fall festival",
    caption: "Building towers and confidence",
    cls: "lg:col-start-3 lg:row-start-2 lg:row-span-2",
  },
  {
    src: "/images/gallery/photo-girl-draw.webp?v=4",
    alt: "A child focused on a hands-on letter activity",
    caption: "Learning through hands-on play",
    cls: "col-span-2 lg:col-span-1 lg:col-start-4 lg:row-start-2",
  },
  {
    src: "/images/gallery/photo-girl-stack.webp?v=4",
    alt: "A girl laughing during playtime in the classroom",
    caption: "Playful days, happy hearts",
    cls: "lg:col-start-1 lg:row-start-3 lg:row-span-2",
  },
  {
    src: "/images/gallery/photo-boy-truck.webp?v=4",
    alt: "Children creating paintings together at the activity table",
    caption: "Imaginations at work",
    cls: "lg:col-start-2 lg:row-start-3 lg:col-span-2",
  },
  {
    src: "/images/gallery/photo-girl-table.webp?v=4",
    alt: "Children coloring quietly together at the table",
    caption: "Quiet moments, busy minds",
    cls: "lg:col-start-4 lg:row-start-3 lg:row-span-2",
  },
  {
    src: "/images/gallery/photo-toddler-fun.webp?v=4",
    alt: "Three children painting fall pictures side by side",
    caption: "Learning is more fun together",
    cls: "col-span-2 lg:col-start-2 lg:row-start-4 lg:col-span-2",
  },
];

export function Gallery() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  // Keyboard navigation for the lightbox
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : (i + PHOTOS.length - 1) % PHOTOS.length));
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % PHOTOS.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const step = (dir: 1 | -1) =>
    setOpen((i) => (i === null ? null : (i + dir + PHOTOS.length) % PHOTOS.length));

  return (
    <section aria-label={t("gallery.title")} className="bg-white py-20 sm:py-28">
      <div className="container-site">
        <SectionHeading
          eyebrowKey="gallery.eyebrow"
          title={t("gallery.title")}
          subtitle={t("gallery.subtitle")}
        />

        <RevealGroup
          className="mt-12 grid auto-rows-[150px] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[180px] sm:gap-4 lg:auto-rows-[200px]"
          stagger={0.06}
        >
          {PHOTOS.map((photo, i) => (
            <RevealItem key={photo.src} className={photo.cls}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${photo.caption} — ${t("gallery.title")}`}
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
          <DialogTitle className="sr-only">{t("gallery.title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("gallery.subtitle")}</DialogDescription>

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
