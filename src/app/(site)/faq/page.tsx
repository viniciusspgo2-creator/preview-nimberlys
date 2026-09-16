import type { Metadata } from "next";
import { FaqClient } from "@/components/faq/FaqClient";
import { SEO } from "@/lib/seo";
import { SITE } from "@/lib/site";

const title = `FAQ | ${SITE.displayName} Bay Point, CA`;
const description =
  "Answers to the questions parents ask most — enrollment, hours, location, subsidy programs, safety, and what a day at Nimberly's Daycare in Bay Point, CA looks like.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${SEO.siteUrl}/faq` },
  openGraph: {
    title,
    description,
    url: `${SEO.siteUrl}/faq`,
    siteName: SITE.displayName,
    type: "website",
    images: [{ url: `${SEO.siteUrl}${SEO.ogImage}`, width: 1200, height: 630, alt: SITE.displayName }],
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
