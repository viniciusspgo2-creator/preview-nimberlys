import type { Metadata } from "next";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { SEO } from "@/lib/seo";
import { SITE } from "@/lib/site";

const title = `Gallery | ${SITE.displayName} Bay Point, CA`;
const description =
  "All our favorite moments in one place — arts, games, story time, and lots of smiles. Take a peek at a day in the life at Nimberly's Daycare in Bay Point, CA.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${SEO.siteUrl}/gallery` },
  openGraph: {
    title,
    description,
    url: `${SEO.siteUrl}/gallery`,
    siteName: SITE.displayName,
    type: "website",
    images: [{ url: `${SEO.siteUrl}${SEO.ogImage}`, width: 1200, height: 630, alt: SITE.displayName }],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
