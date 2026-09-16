import { db } from "@/lib/db";

export type PublicSettings = {
  site_name: string;
  site_display_name: string;
  tagline: string;
  phone: string;
  email: string;
  address_street: string;
  address_city: string;
  hours: string;
  ages: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  ga_measurement_id: string;
  gsc_verification: string;
  chat_welcome: string;
};

const FALLBACK: PublicSettings = {
  site_name: "Nimberly's Daycare, Inc.",
  site_display_name: "Nimberly's Daycare",
  tagline: "Where Little Hearts Learn, Play & Grow",
  phone: "(925) 848-8272",
  email: "nimberlysdaycare0528@gmail.com",
  address_street: "Island View Drive",
  address_city: "Bay Point, CA 94565",
  hours: "Monday – Friday, 7:00 AM – 5:30 PM",
  ages: "4 months – 12 years",
  meta_title: "Nimberly's Daycare | Trusted Daycare & Child Care in Bay Point, CA",
  meta_description:
    "Warm, family-style daycare in Bay Point, CA for children 4 months to 12 years. Safe, nurturing care, learning through play, and California child care subsidy programs accepted.",
  og_image: "/images/og-image.jpg",
  ga_measurement_id: "",
  gsc_verification: "",
  chat_welcome:
    "Hi there! I'm Sunny, the Nimberly's Daycare assistant. Ask me anything about our daycare — ages, hours, programs, or how to schedule a visit!",
};

/** Read public settings from the DB; never throws. */
export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const rows = await db.setting.findMany({
      where: { key: { in: Object.keys(FALLBACK) } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...FALLBACK, ...map } as PublicSettings;
  } catch {
    return FALLBACK;
  }
}
