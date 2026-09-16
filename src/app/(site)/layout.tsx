import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { VisitTracker } from "@/components/layout/VisitTracker";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { childCareJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(childCareJsonLd()) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:font-display focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <PageTransition />
      <Header />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />
      <ChatbotWidget />
      <VisitTracker />

      {/* NAP consistency for local SEO (screen-reader summary) */}
      <p className="sr-only">
        {SITE.legalName}. {SITE.addressFull}. Phone {SITE.phone}. {SITE.hours}.
        Serving children ages {SITE.ages}.
      </p>
    </div>
  );
}
