import Link from "next/link";
import Image from "@/components/shared/SiteImage";
import { RainbowArch, Sparkle } from "@/components/shared/decor";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-pink-soft blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-sky-soft blur-3xl" />
      </div>
      <div className="relative">
        <Image src="/images/logo-mark.png" alt="" width={160} height={102} className="mx-auto w-32 opacity-90" />
        <RainbowArch className="absolute -top-8 left-1/2 w-56 -translate-x-1/2 opacity-60" />
        <Sparkle className="absolute -right-6 -top-10 w-7 animate-twinkle" />
      </div>
      <p className="mt-16 font-display text-6xl font-semibold text-brand">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
        This page wandered off to play
      </h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="btn-primary btn-md mt-8">
        Take Me Home
      </Link>
    </div>
  );
}
