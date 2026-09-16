import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { MapSection } from "@/components/contact/MapSection";
import { TrustStrip } from "@/components/contact/TrustStrip";
import { SEO } from "@/lib/seo";
import { SITE } from "@/lib/site";

const title = `Contact Us | Daycare in Bay Point, CA | ${SITE.displayName}`;
const description =
  "Contact Nimberly's Daycare in Bay Point, CA. Call (925) 848-8272, email us, or send a message to schedule a visit — we usually reply the same day. Subsidy programs accepted.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${SEO.siteUrl}/contact` },
  openGraph: {
    title,
    description,
    url: `${SEO.siteUrl}/contact`,
    siteName: SITE.displayName,
    type: "website",
    images: [{ url: `${SEO.siteUrl}${SEO.ogImage}`, width: 1200, height: 630, alt: SITE.displayName }],
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />

      {/* Form + info stack */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container-site">
          <div className="grid items-start gap-8 [&>*]:min-w-0 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>

      <MapSection />
      <TrustStrip />
    </>
  );
}
