import type { Metadata } from "next";
import { AboutPageHero } from "@/components/about/PageHero";
import { AboutStory } from "@/components/about/Story";
import { AboutPhilosophy } from "@/components/about/Philosophy";
import { AboutApproach } from "@/components/about/Approach";
import { AboutEnvironment } from "@/components/about/Environment";
import { AboutCommunity } from "@/components/about/Community";
import { AboutValues } from "@/components/about/Values";
import { AboutCTA } from "@/components/about/AboutCTA";
import { SEO } from "@/lib/seo";
import { SITE } from "@/lib/site";

const title = `About Our Daycare in Bay Point, CA | ${SITE.displayName}`;
const description =
  "Get to know Nimberly's Daycare — a warm, family-style daycare home in Bay Point, CA. Our story, philosophy, approach, and the values behind care for children 4 months to 12 years.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${SEO.siteUrl}/about` },
  openGraph: {
    title,
    description,
    url: `${SEO.siteUrl}/about`,
    siteName: SITE.displayName,
    type: "website",
    images: [{ url: `${SEO.siteUrl}${SEO.ogImage}`, width: 1200, height: 630, alt: SITE.displayName }],
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutPageHero />
      <AboutStory />
      <AboutPhilosophy />
      <AboutApproach />
      <AboutEnvironment />
      <AboutCommunity />
      <AboutValues />
      <AboutCTA />
    </>
  );
}
