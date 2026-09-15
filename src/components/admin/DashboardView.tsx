"use client";

import * as React from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Eye,
  Users,
  MessageCircle,
  Mail,
  FileText,
  HelpCircle,
  Settings,
  ArrowRight,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  api,
  fmtDate,
  timeAgo,
  PageHeader,
  AdminSpinner,
  EmptyState,
  adminCard,
  type AdminStats,
} from "./admin-shared";

function StatCard({
  icon,
  label,
  value,
  sub,
  chipClass,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  chipClass: string;
  delay: number;
}) {
  return (
    <div
      className={cn(
        adminCard,
        "flex items-center gap-4 p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-5"
      )}
      style={{ animation: `fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl [&>svg]:size-6",
          chipClass
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold tracking-wide text-ink-faint uppercase">
          {label}
        </p>
        <p className="font-display text-2xl font-semibold text-ink tabular-nums">
          {value}
        </p>
        {sub ? <p className="truncate text-xs text-ink-soft">{sub}</p> : null}
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-[#f0e4d3] bg-white px-3.5 py-2 shadow-[0_10px_30px_-10px_rgb(46_58_84/0.25)]">
      <p className="text-xs font-bold text-ink-faint">{label}</p>
      <p className="font-display text-lg font-semibold text-brand">
        {v} <span className="text-xs font-bold text-ink-soft">{v === 1 ? "view" : "views"}</span>
      </p>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className={cn(adminCard, "flex items-center gap-4 p-5")}>
      <Skeleton className="size-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-14" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    api<AdminStats>("/api/admin/stats")
      .then((d) => active && setStats(d))
      .catch((e: Error) => {
        if (active && e.name !== "AdminUnauthorized") setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A quick look at how the website is doing today."
      >
        <Button
          asChild
          className="rounded-full font-display font-semibold"
          size="sm"
        >
          <Link href="/admin/posts/new">
            <FileText className="size-4" /> New post
          </Link>
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!stats && !error ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : error ? (
          <div className="sm:col-span-2 xl:col-span-4">
            <EmptyState
              icon={<Eye />}
              title="Couldn't load stats"
              description={error}
            />
          </div>
        ) : stats ? (
          <>
            <StatCard
              delay={0}
              icon={<Eye />}
              label="Total views"
              value={stats.views.total.toLocaleString()}
              sub={`${stats.views.last7} in the last 7 days · ${stats.views.last30} in 30 days`}
              chipClass="bg-brand-soft text-brand"
            />
            <StatCard
              delay={70}
              icon={<Users />}
              label="Unique visitors"
              value={stats.uniqueSessions.toLocaleString()}
              sub="Counted by anonymous session"
              chipClass="bg-green-soft text-green-deep"
            />
            <StatCard
              delay={140}
              icon={<MessageCircle />}
              label="Chat messages"
              value={stats.chatMessages.total.toLocaleString()}
              sub={`${stats.chatMessages.today} today`}
              chipClass="bg-orange-soft text-orange-pop"
            />
            <StatCard
              delay={210}
              icon={<Mail />}
              label="Unhandled contacts"
              value={stats.contactMessages.unhandled.toLocaleString()}
              sub={`${stats.contactMessages.total} messages total`}
              chipClass="bg-pink-soft text-pink-pop"
            />
          </>
        ) : null}
      </div>

      {/* Chart */}
      <div className={cn(adminCard, "mt-6 p-5 sm:p-6")}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Page views
            </h2>
            <p className="text-xs text-ink-soft">Last 14 days</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5">
            <span className="size-2 rounded-full bg-brand" aria-hidden />
            <span className="text-xs font-bold text-brand">Views per day</span>
          </div>
        </div>
        <div className="h-64 w-full">
          {stats ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.viewsPerDay}
                margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2278E0" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#2278E0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 6"
                  stroke="#eadfcc"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#8b95ab", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8b95ab", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#eadfcc" }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Views"
                  stroke="#2278E0"
                  strokeWidth={2.5}
                  fill="url(#viewsFill)"
                  activeDot={{
                    r: 5,
                    fill: "#2278E0",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <AdminSpinner />
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            href: "/admin/posts/new",
            icon: FileText,
            label: "Write a post",
            cls: "hover:border-pink-pop/40 hover:text-pink-pop",
          },
          {
            href: "/admin/faqs",
            icon: HelpCircle,
            label: "Manage FAQs",
            cls: "hover:border-orange-pop/40 hover:text-orange-pop",
          },
          {
            href: "/admin/messages",
            icon: Mail,
            label: "Check messages",
            cls: "hover:border-brand/40 hover:text-brand",
          },
          {
            href: "/admin/settings",
            icon: Settings,
            label: "Site settings",
            cls: "hover:border-green-pop/40 hover:text-green-deep",
          },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-[#f0e4d3] bg-white px-4 py-3.5 text-sm font-bold text-ink shadow-[0_4px_20px_-4px_rgb(46_58_84/0.08)] transition-all duration-200 hover:-translate-y-0.5",
              a.cls
            )}
          >
            <a.icon className="size-[1.15rem] text-ink-faint transition-colors group-hover:text-current" />
            <span className="flex-1 leading-tight">{a.label}</span>
            <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent contacts */}
        <div className={cn(adminCard, "p-5 sm:p-6")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              Recent contact messages
            </h2>
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {stats && stats.recent.contacts.length > 0 ? (
            <ul className="admin-scroll max-h-96 space-y-3 overflow-y-auto pr-1">
              {stats.recent.contacts.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-3 rounded-xl bg-cream-soft p-3"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full [&>svg]:size-4",
                      c.handled
                        ? "bg-green-soft text-green-deep"
                        : "bg-pink-soft text-pink-pop"
                    )}
                  >
                    <User />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="truncate text-sm font-bold text-ink">{c.name}</p>
                      <span className="text-[0.7rem] font-semibold text-ink-faint">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">
                      {c.message}
                    </p>
                  </div>
                  {!c.handled ? (
                    <span className="mt-0.5 shrink-0 rounded-full bg-pink-pop px-2 py-0.5 text-[0.65rem] font-extrabold tracking-wide text-white uppercase">
                      New
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Mail />}
              title="No messages yet"
              description="Contact form submissions will show up here."
            />
          )}
        </div>

        {/* Recent chats */}
        <div className={cn(adminCard, "p-5 sm:p-6")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              Recent chat activity
            </h2>
            <span className="rounded-full bg-orange-soft px-2.5 py-1 text-[0.65rem] font-extrabold tracking-wide text-orange-pop uppercase">
              Sunny
            </span>
          </div>
          {stats && stats.recent.chats.length > 0 ? (
            <ul className="admin-scroll max-h-96 space-y-3 overflow-y-auto pr-1">
              {stats.recent.chats.map((m) => (
                <li key={m.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full [&>svg]:size-4",
                      m.role === "user"
                        ? "bg-brand-soft text-brand"
                        : "bg-yellow-soft text-orange-pop"
                    )}
                  >
                    {m.role === "user" ? <User /> : <Bot />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-sm font-bold text-ink">
                        {m.role === "user" ? "Visitor" : "Sunny"}
                      </p>
                      <span className="text-[0.7rem] font-semibold text-ink-faint">
                        {fmtDate(m.createdAt)} · {timeAgo(m.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">
                      {m.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<MessageCircle />}
              title="No chats yet"
              description="Chatbot conversations will appear here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
