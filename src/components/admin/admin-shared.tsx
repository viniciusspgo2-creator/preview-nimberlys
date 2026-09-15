"use client";

/* ============================================================
   NIMBERLY'S ADMIN — shared client helpers, types & small UI bits
   ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------- API types ---------------- */

export type AdminPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  cover: string;
  category: string;
  tags: string;
  readingMinutes: number;
  faq: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostFaqItem = { question: string; answer: string };

export type AdminFaq = {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
};

export type AdminMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  childAge: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
};

export type AdminChatLog = {
  id: number;
  role: string;
  content: string;
  sessionId: string;
  provider: string | null;
  createdAt: string;
};

export type AdminStats = {
  views: { total: number; last7: number; last30: number };
  uniqueSessions: number;
  chatMessages: { total: number; today: number };
  contactMessages: { total: number; unhandled: number };
  viewsPerDay: { date: string; count: number }[];
  recent: { contacts: AdminMessage[]; chats: AdminChatLog[] };
};

/* ---------------- Constants ---------------- */

export const POST_CATEGORIES = [
  "Choosing Child Care",
  "Parenting Tips",
  "Child Development",
  "Nutrition & Health",
  "Subsidies & Programs",
] as const;

export const FAQ_CATEGORIES = [
  "General",
  "Enrollment",
  "Programs",
  "Safety",
  "Subsidy",
] as const;

export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
] as const;

const GALLERY_FILES = [
  "hero-classroom",
  "photo-baby-play",
  "photo-boy-blocks",
  "photo-boy-truck",
  "photo-girl-draw",
  "photo-girl-smile",
  "photo-girl-stack",
  "photo-girl-table",
  "photo-group-room",
  "photo-group-smiles",
  "photo-kids-craft",
  "photo-kids-play",
  "photo-toddler-fun",
  "photo-toddler-joy",
] as const;

export const COVERS: string[] = GALLERY_FILES.map((f) => `/images/gallery/${f}.webp`);

export function coverLabel(path: string): string {
  const name = path.split("/").pop() ?? path;
  return name
    .replace(/\.webp$/, "")
    .replace(/^photo-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------------- Utilities ---------------- */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return fmtDate(iso);
}

export function parsePostFaq(json: string): PostFaqItem[] {
  try {
    const arr = JSON.parse(json || "[]");
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => ({
        question: String((x as { question?: unknown })?.question ?? ""),
        answer: String((x as { answer?: unknown })?.answer ?? ""),
      }))
      .filter((x) => x.question || x.answer);
  } catch {
    return [];
  }
}

/* ---------------- fetch helper ---------------- */

export class AdminUnauthorized extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AdminUnauthorized";
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    cache: "no-store",
    ...init,
  });

  if (res.status === 401) {
    window.dispatchEvent(new Event("nimb:unauthorized"));
    throw new AdminUnauthorized();
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`
    );
  }
  return data as T;
}

/* ---------------- small UI bits ---------------- */

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function CharCounter({
  value,
  max,
  className,
}: {
  value: string;
  max: number;
  className?: string;
}) {
  const len = value.length;
  const over = len > max;
  const near = !over && len > max * 0.9;
  return (
    <span
      className={cn(
        "text-[0.7rem] font-bold tabular-nums",
        over ? "text-red-pop" : near ? "text-orange-pop" : "text-ink-faint",
        className
      )}
    >
      {len}/{max}
    </span>
  );
}

export const adminCard =
  "rounded-2xl border border-[#f0e4d3] bg-white shadow-[0_4px_20px_-4px_rgb(46_58_84/0.08)]";

export function AdminSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-8 animate-spin rounded-full border-[3px] border-brand-soft border-t-brand",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#eadfcc] bg-white/60 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-cream-deep text-ink-faint [&>svg]:size-7">
        {icon}
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Shared slim scrollbar style for long lists (injected once by AdminShell). */
export function AdminStyleTag() {
  return (
    <style>{`
      .admin-scroll::-webkit-scrollbar { width: 7px; height: 7px; }
      .admin-scroll::-webkit-scrollbar-track { background: transparent; }
      .admin-scroll::-webkit-scrollbar-thumb {
        background: #eadfcc; border-radius: 99px; border: none;
      }
      .admin-scroll::-webkit-scrollbar-thumb:hover { background: #d9c9a9; }
    `}</style>
  );
}
