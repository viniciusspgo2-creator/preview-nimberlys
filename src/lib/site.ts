// Central source of truth for client-provided facts.
// DO NOT alter these values — they were provided by the client.
export const SITE = {
  legalName: "Nimberly's Daycare, Inc.",
  displayName: "Nimberly's Daycare",
  tagline: "Where Little Hearts Learn, Play & Grow",
  phone: "(925) 848-8272",
  phoneHref: "tel:+19258488272",
  email: "nimberlysdaycare0528@gmail.com",
  emailHref: "mailto:nimberlysdaycare0528@gmail.com",
  addressStreet: "Island View Drive",
  addressCity: "Bay Point",
  addressState: "CA",
  addressZip: "94565",
  addressFull: "Island View Drive, Bay Point, CA 94565",
  county: "Contra Costa County",
  hours: "Monday – Friday, 7:00 AM – 5:30 PM",
  hoursShort: "Mon–Fri · 7 AM – 5:30 PM",
  ages: "4 months – 12 years",
  mapsEmbed:
    "https://www.google.com/maps?q=Island%20View%20Drive%2C%20Bay%20Point%2C%20CA%2094565&output=embed",
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Island+View+Drive%2C+Bay+Point%2C+CA+94565",
  mapsListing:
    "https://www.google.com/maps/search/?api=1&query=Island+View+Drive%2C+Bay+Point%2C+CA+94565",
} as const;

export const SUBSIDY_PROGRAMS = [
  "CalWORKs Child Care",
  "California Alternative Payment Program (CAPP)",
  "General Child Care and Development Program (CCTR)",
  "California State Preschool Program (CSPP)",
  "CocoKids Child Care Subsidy Programs",
  "Contra Costa County Child Care Assistance Programs",
  "California Department of Social Services (CDSS) Child Care Programs",
] as const;

export const NAV_LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/blog", key: "nav.blog" },
  { href: "/faq", key: "nav.faq" },
  { href: "/contact", key: "nav.contact" },
] as const;

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://nimberlysdaycare.com";
}
