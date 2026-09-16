"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Mail,
  Settings,
  Menu,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AdminStyleTag } from "./admin-shared";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Blog Posts", icon: FileText },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/logo-mark.png"
        alt="Nimberly's Daycare logo"
        className="size-10 shrink-0 object-contain"
      />
      <div className="leading-tight">
        <p className="font-display text-[1.05rem] font-semibold text-ink">
          Nimberly&apos;s Admin
        </p>
        <p className="text-[0.72rem] font-bold tracking-wide text-ink-faint uppercase">
          Daycare Manager
        </p>
      </div>
    </div>
  );
}

function NavList({
  pathname,
  unhandled,
  onNavigate,
}: {
  pathname: string;
  unhandled: number;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="flex-1 space-y-1.5 px-3">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-200",
              active
                ? "bg-brand-soft text-brand shadow-[0_4px_14px_-4px_rgb(34_120_224/0.25)]"
                : "text-ink-soft hover:bg-cream-deep hover:text-ink"
            )}
          >
            <Icon
              className={cn(
                "size-[1.15rem] transition-transform duration-200 group-hover:scale-110",
                active ? "text-brand" : "text-ink-faint group-hover:text-ink-soft"
              )}
            />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/messages" && unhandled > 0 ? (
              <span className="flex min-w-6 items-center justify-center rounded-full bg-pink-pop px-2 py-0.5 text-[0.7rem] font-extrabold text-white">
                {unhandled}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = React.useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/admin/logout", {
            method: "POST",
            credentials: "same-origin",
          });
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new Event("nimb:unauthorized"));
        onDone?.();
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-red-soft hover:text-red-pop disabled:opacity-60"
    >
      <LogOut className="size-[1.15rem]" />
      Sign out
    </button>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unhandled, setUnhandled] = React.useState(0);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Fetch unhandled message count for the sidebar badge (re-checks on navigation)
  React.useEffect(() => {
    let active = true;
    fetch("/api/admin/stats", { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setUnhandled(d?.contactMessages?.unhandled ?? 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  const currentLabel =
    NAV_ITEMS.find((i) => isActive(pathname, i.href))?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-cream lg:pl-64">
      <AdminStyleTag />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#f0e4d3] bg-white lg:flex">
        <div className="px-5 py-5">
          <BrandLockup />
        </div>
        <div className="rainbow-bar h-1 w-full opacity-70" aria-hidden />
        <div className="flex flex-1 flex-col py-4">
          <NavList pathname={pathname} unhandled={unhandled} />
        </div>
        <div className="space-y-1 border-t border-[#f0e4d3] p-3">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink"
          >
            <ExternalLink className="size-[1.15rem]" />
            View website
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[#f0e4d3] bg-white/95 px-4 backdrop-blur lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open admin menu"
              className="text-ink"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-full flex-col">
              <div className="px-5 py-5">
                <BrandLockup />
              </div>
              <div className="rainbow-bar h-1 w-full opacity-70" aria-hidden />
              <div className="flex flex-1 flex-col py-4">
                <NavList
                  pathname={pathname}
                  unhandled={unhandled}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
              <div className="space-y-1 border-t border-[#f0e4d3] p-3">
                <Link
                  href="/"
                  target="_blank"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink"
                >
                  <ExternalLink className="size-[1.15rem]" />
                  View website
                </Link>
                <LogoutButton onDone={() => setMobileOpen(false)} />
              </div>
            </div>
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center gap-2">
          <img
            src="/images/logo-mark.png"
            alt=""
            aria-hidden
            className="size-7 object-contain"
          />
          <span className="font-display text-base font-semibold text-ink">
            {currentLabel}
          </span>
        </div>
        <LogoutButton />
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
