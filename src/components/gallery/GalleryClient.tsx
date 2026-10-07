"use client";

import Image, {usePhotos} from "@/components/shared/SiteImage";
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

export function GalleryClient() {
  const { t } = useI18n();
  const PHOTOS = usePhotos().filter(p=>p.gallery);
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
  }, [open, PHOTOS.length]);

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
          className="mt-12 grid auto-rows-[150px] grid-flow-dense grid-cols-2 lg:grid-cols-3 gap-3 sm:auto-rows-[180px] sm:gap-4 lg:auto-rows-[210px]"
          stagger={0.05}
        >
          {PHOTOS.map((photo, i) => (
            <RevealItem
              key={photo.src}
              className="min-w-0"
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

          {open !== null && PHOTOS[open] && (
            <div className="relative h-[70vh] w-full overflow-hidden rounded-3xl shadow-lift sm:h-[78vh]">
              <Image
                key={PHOTOS[open].src}
                src={PHOTOS[open].src}
                alt={PHOTOS[open].alt}
                fill
                sizes="(min-width: 896px) 896px, 92vw"
                className="object-contain"
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
