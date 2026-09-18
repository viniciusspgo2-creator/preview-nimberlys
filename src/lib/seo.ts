import { SITE, siteUrl } from "./site";

export const SEO = {
  siteUrl: siteUrl(),
  titleTemplate: `%s | ${SITE.displayName}`,
  defaultTitle: `${SITE.displayName} | Trusted Daycare & Child Care in Bay Point, CA`,
  defaultDescription:
    "Warm, family-style daycare in Bay Point, CA for infants and toddlers. Safe, nurturing care, learning through play, and California child care subsidy programs accepted.",
  ogImage: "/images/og-image.jpg",
};

export function childCareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["ChildCare", "LocalBusiness"],
    "@id": `${siteUrl()}/#daycare`,
    name: SITE.legalName,
    alternateName: SITE.displayName,
    description:
      "Family-style daycare and child care home in Bay Point, CA serving infants and toddlers. Learning through play, a warm home environment, and California child care subsidy programs accepted.",
    url: siteUrl(),
    telephone: "+1-925-848-8272",
    email: SITE.email,
    image: `${siteUrl()}${SEO.ogImage}`,
    logo: `${siteUrl()}/images/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressCity,
      addressRegion: SITE.addressState,
      postalCode: SITE.addressZip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.0224,
      longitude: -121.8071,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "17:30",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Bay Point" },
      { "@type": "City", name: "Pittsburg" },
      { "@type": "AdministrativeArea", name: "Contra Costa County" },
    ],
    priceRange: "$$",
    slogan: SITE.tagline,
    knowsAbout: [
      "Child care",
      "Daycare",
      "Early learning",
      "Infant care",
      "Toddler care",
      "Preschool readiness",
      "California child care subsidy programs",
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl()}${item.url}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  createdAt?: string | Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `${siteUrl()}${post.cover}`,
    author: { "@type": "Organization", name: SITE.legalName },
    publisher: {
      "@type": "Organization",
      name: SITE.displayName,
      logo: { "@type": "ImageObject", url: `${siteUrl()}/images/logo.png` },
    },
    mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
    ...(post.createdAt ? { datePublished: new Date(post.createdAt).toISOString() } : {}),
  };
}
