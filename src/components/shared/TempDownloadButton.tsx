import { Download } from "lucide-react";

/**
 * ⚠️ TEMPORARY — project download button (preview only).
 * Added so the client can grab the deploy ZIP directly from the preview.
 * REMOVE after deployment: delete this component and its import
 * in src/app/(site)/layout.tsx.
 */
export function TempDownloadButton() {
  return (
    <a
      href="/download/nimberlys-daycare-vercel.zip"
      download="nimberlys-daycare-vercel.zip"
      aria-label="Download do projeto em ZIP (botão temporário)"
      className="fixed bottom-5 left-5 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-ink/90 px-4 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgb(46_58_84/0.55)] backdrop-blur transition-transform duration-200 hover:scale-105 active:scale-95 sm:bottom-6 sm:left-6"
    >
      <Download className="size-4 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">Download do projeto</span>
      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide">
        .ZIP
      </span>
    </a>
  );
}
