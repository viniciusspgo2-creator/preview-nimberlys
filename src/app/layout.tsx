import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import {getPublicPhotos} from "@/lib/photos";
import {PhotoProvider} from "@/components/shared/SiteImage";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { getPublicSettings } from "@/lib/settings-server";
import { SEO } from "@/lib/seo";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FFF9F1",
  width: "device-width",
  initialScale: 1,
};

/* Settings come from the database (root layout) — render every page
   per-request so Admin edits appear on the public site immediately. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getPublicSettings();
  return {
    metadataBase: new URL(SEO.siteUrl),
    title: {
      default: s.meta_title || SEO.defaultTitle,
      template: SEO.titleTemplate,
    },
    description: s.meta_description || SEO.defaultDescription,
    keywords: [
      "daycare Bay Point CA",
      "child care Bay Point",
      "daycare near Bay Point",
      "child care Contra Costa County",
      "family child care Bay Point",
      "infant care Bay Point CA",
      "preschool Bay Point",
      "subsidized child care Contra Costa",
    ],
    applicationName: s.site_name,
    authors: [{ name: s.site_name }],
    creator: s.site_name,
    alternates: {
      canonical: "/",
      languages: {
        "en-US": "/",
        "es-ES": "/",
        "fr-FR": "/",
        "de-DE": "/",
        "pt-BR": "/",
      },
    },
    openGraph: {
      title: s.meta_title || SEO.defaultTitle,
      description: s.meta_description || SEO.defaultDescription,
      url: "/",
      siteName: s.site_display_name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: s.og_image || SEO.ogImage,
          width: 1200,
          height: 630,
          alt: `${s.site_display_name} — daycare in Bay Point, CA`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: s.meta_title || SEO.defaultTitle,
      description: s.meta_description || SEO.defaultDescription,
      images: [s.og_image || SEO.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    ...(s.gsc_verification ? { verification: { google: s.gsc_verification } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [s, photos] = await Promise.all([getPublicSettings(),getPublicPhotos()]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${nunito.variable} antialiased`}
      >
        <I18nProvider><PhotoProvider photos={photos}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </PhotoProvider></I18nProvider>

        {/* Google Analytics (managed from Admin → Settings) */}
        {s.ga_measurement_id ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${s.ga_measurement_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.ga_measurement_id}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
