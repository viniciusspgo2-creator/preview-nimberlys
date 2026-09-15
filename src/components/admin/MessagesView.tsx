"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Trash2,
  Baby,
  Inbox,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  api,
  fmtDateTime,
  PageHeader,
  EmptyState,
  adminCard,
  type AdminMessage,
} from "./admin-shared";

type Filter = "all" | "unhandled" | "handled";

export function MessagesView() {
  const [messages, setMessages] = React.useState<AdminMessage[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [busyId, setBusyId] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    api<{ messages: AdminMessage[] }>("/api/admin/messages")
      .then((d) => setMessages(d.messages))
      .catch((e: Error) => {
        if (e.name === "AdminUnauthorized") return;
        setError(e.message);
        setMessages([]);
      });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function setHandled(m: AdminMessage, v: boolean) {
    setBusyId(m.id);
    try {
      await api(`/api/admin/messages/${m.id}`, {
        method: "PATCH",
        body: JSON.stringify({ handled: v }),
      });
      toast.success(
        v ? "Marked as handled" : "Marked as unhandled"
      );
      setMessages((list) =>
        list?.map((x) => (x.id === m.id ? { ...x, handled: v } : x)) ?? null
      );
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Update failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(m: AdminMessage) {
    setBusyId(m.id);
    try {
      await api(`/api/admin/messages/${m.id}`, { method: "DELETE" });
      toast.success("Message deleted");
      setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Delete failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  const loading = messages === null && !error;
  const all = messages ?? [];
  const unhandledCount = all.filter((m) => !m.handled).length;
  const handledCount = all.length - unhandledCount;
  const shown = all.filter((m) =>
    filter === "all" ? true : filter === "unhandled" ? !m.handled : m.handled
  );

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: all.length },
    { key: "unhandled", label: "Unhandled", count: unhandledCount },
    { key: "handled", label: "Handled", count: handledCount },
  ];

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        subtitle="Families who reached out through the website contact form."
      />

      {/* filter pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all",
              filter === f.key
                ? f.key === "unhandled"
                  ? "bg-pink-pop text-white shadow-[0_8px_24px_-8px_rgb(244_63_109/0.6)]"
                  : "bg-brand text-white shadow-[0_8px_24px_-8px_rgb(34_120_224/0.6)]"
                : "bg-white text-ink-soft shadow-[0_4px_20px_-4px_rgb(46_58_84/0.08)] hover:text-ink"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[0.68rem] font-extrabold tabular-nums",
                filter === f.key ? "bg-white/25" : "bg-cream-deep text-ink-faint"
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={<Inbox />} title="Couldn't load messages" description={error} />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<Mail />}
          title={
            all.length === 0
              ? "No messages yet"
              : filter === "unhandled"
                ? "All caught up!"
                : "No handled messages"
          }
          description={
            all.length === 0
              ? "New contact form submissions will appear here."
              : "Try a different filter."
          }
        />
      ) : (
        <div className="space-y-4">
          {shown.map((m) => {
            const busy = busyId === m.id;
            return (
              <article
                key={m.id}
                className={cn(
                  adminCard,
                  "overflow-hidden transition-opacity",
                  m.handled
                    ? "opacity-90"
                    : "border-l-4 border-l-pink-pop",
                  busy && "pointer-events-none opacity-50"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-semibold text-ink">
                        {m.name}
                      </h2>
                      {m.handled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-soft px-2.5 py-0.5 text-[0.68rem] font-extrabold text-green-deep">
                          <span className="size-1.5 rounded-full bg-green-pop" />
                          Handled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-pink-soft px-2.5 py-0.5 text-[0.68rem] font-extrabold text-pink-pop">
                          <span className="size-1.5 animate-pulse rounded-full bg-pink-pop" />
                          Needs reply
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                      <CalendarDays className="size-3.5" />
                      {fmtDateTime(m.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-cream-soft px-3.5 py-2">
                      <Switch
                        checked={m.handled}
                        aria-label={
                          m.handled
                            ? `Mark ${m.name} as unhandled`
                            : `Mark ${m.name} as handled`
                        }
                        onCheckedChange={(v) => setHandled(m, v)}
                        className="data-[state=checked]:bg-green-pop"
                      />
                      <span className="text-xs font-bold text-ink-soft">
                        {m.handled ? "Handled" : "Mark handled"}
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete message from ${m.name}`}
                          className="size-9 text-ink-soft hover:bg-red-soft hover:text-red-pop"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">
                            Delete this message?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            The message from {m.name} will be permanently
                            removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove(m)}
                            className="bg-red-pop text-white hover:bg-[#e22c5c]"
                          >
                            <Trash2 className="size-4" /> Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="border-t border-[#f0e4d3] bg-cream-soft/50 px-4 py-4 sm:px-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${m.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-[0_2px_10px_-2px_rgb(46_58_84/0.12)] transition-transform hover:-translate-y-0.5"
                    >
                      <Mail className="size-3.5" />
                      {m.email}
                    </a>
                    {m.phone ? (
                      <a
                        href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-green-deep shadow-[0_2px_10px_-2px_rgb(46_58_84/0.12)] transition-transform hover:-translate-y-0.5"
                      >
                        <Phone className="size-3.5" />
                        {m.phone}
                      </a>
                    ) : null}
                    {m.childAge ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-soft px-3 py-1.5 text-xs font-bold text-orange-pop">
                        <Baby className="size-3.5" />
                        Child: {m.childAge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
                    {m.message}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
