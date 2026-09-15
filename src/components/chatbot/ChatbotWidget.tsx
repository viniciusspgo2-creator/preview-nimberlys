"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, MessagesSquare, Phone, SendHorizontal, Sun, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/i18n/dictionaries/en";
import { SITE } from "@/lib/site";
import { Sparkle } from "@/components/shared/decor";

/* ================================ types ================================== */

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
};

/* ============================== configuration ============================= */

const SESSION_KEY = "nimb.chat.sid";
const MAX_INPUT_LENGTH = 1000;
const HISTORY_WINDOW = 10;
const QUICK_REPLIES_HIDE_AFTER = 2;

const QUICK_REPLY_KEYS: readonly DictKey[] = [
  "chat.q1",
  "chat.q2",
  "chat.q3",
  "chat.q4",
  "chat.q5",
];

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
      new Date(ts)
    );
  } catch {
    return "";
  }
}

/* ============================== the widget ================================ */

export function ChatbotWidget() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const greetedRef = useRef(false);
  const sendingRef = useRef(false);
  const sessionIdRef = useRef<string>("anon");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* ---- session id (sessionStorage, created once per browser tab) ---- */
  useEffect(() => {
    try {
      let sid = window.sessionStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        window.sessionStorage.setItem(SESSION_KEY, sid);
      }
      sessionIdRef.current = sid.slice(0, 64) || "anon";
    } catch {
      sessionIdRef.current = "anon";
    }
  }, []);

  /* ---- Escape closes the panel (click-outside intentionally does not) ---- */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* ---- keep the conversation pinned to the bottom ---- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, sending, open, reduceMotion]);

  const toggleOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) {
        if (!greetedRef.current) {
          greetedRef.current = true;
          setMessages((prev) => [
            ...prev,
            { id: makeId(), role: "assistant", content: t("chat.greeting"), ts: Date.now() },
          ]);
        }
        window.setTimeout(
          () => inputRef.current?.focus(),
          reduceMotion ? 0 : 250
        );
      } else {
        launcherRef.current?.focus();
      }
    },
    [t, reduceMotion]
  );

  /* ---- send a message to /api/chat ---- */
  const send = useCallback(async (raw: string) => {
    const content = raw.trim().slice(0, MAX_INPUT_LENGTH);
    if (!content || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setInput("");

    const history = messagesRef.current
      .slice(-HISTORY_WINDOW)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: "user", content, ts: Date.now() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history,
          sessionId: sessionIdRef.current,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        reply?: unknown;
      } | null;
      const reply =
        typeof data?.reply === "string" && data.reply.trim() ? data.reply.trim() : "";
      if (!reply) throw new Error("chat: empty reply");
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", content: reply, ts: Date.now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: `I'm sorry — I'm having trouble responding right now. Please call us at ${SITE.phone} and we'll be happy to help you!`,
          ts: Date.now(),
        },
      ]);
    } finally {
      sendingRef.current = false;
      setSending(false);
      inputRef.current?.focus();
    }
  }, []);

  const userMsgCount = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages]
  );
  const showQuickReplies = open && !sending && userMsgCount < QUICK_REPLIES_HIDE_AFTER;

  return (
    <>
      {/* ============================ launcher ============================ */}
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => toggleOpen(!open)}
        aria-label={t("chat.open")}
        aria-expanded={open}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0, y: 24 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.3, delay: 1.5 }
            : { delay: 1.5, type: "spring", stiffness: 260, damping: 15 }
        }
        whileHover={reduceMotion ? undefined : { scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-pop to-magenta-pop text-white shadow-[var(--shadow-glow-pink)] sm:right-6"
      >
        <MessagesSquare className="h-6 w-6" aria-hidden />
        {!open && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-pop opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-pop" />
          </span>
        )}
      </motion.button>

      {/* ============================= panel ============================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label={`${t("chat.title")} — ${t("chat.subtitle")}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 24 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 320, damping: 26 }
            }
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.5rem)] right-4 z-[80] flex h-[min(600px,70vh)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-4xl border border-ink/10 bg-white font-body text-sm shadow-[var(--shadow-lift)] sm:right-6"
          >
            {/* header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-pink-pop to-magenta-pop px-4 py-3.5 text-white">
              <Sparkle
                className="absolute right-12 top-2.5 h-3 w-3 opacity-70"
                color="#FFC42E"
              />
              <Sparkle
                className="absolute right-5 top-7 h-2 w-2 opacity-50"
                color="#FFFFFF"
              />
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)]">
                  <Image
                    src="/images/logo-mark.png"
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-contain"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold leading-tight">
                    {t("chat.title")}
                  </p>
                  <p className="truncate text-xs text-white/85">{t("chat.subtitle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleOpen(false)}
                  aria-label={t("nav.close")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>

            {/* messages */}
            <div
              ref={scrollRef}
              aria-live="polite"
              className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-cream px-3.5 py-4"
            >
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex flex-col items-end">
                    <div className="max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-[var(--shadow-soft)]">
                      {m.content}
                      <span className="mt-1 block text-right text-[10px] text-white/70">
                        {formatTime(m.ts)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-end gap-2">
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-pop to-orange-pop shadow-[var(--shadow-soft)]"
                    >
                      <Sun className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </span>
                    <div className="max-w-[80%] whitespace-pre-line break-words rounded-2xl rounded-bl-md border border-ink/10 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink shadow-[var(--shadow-soft)]">
                      {m.content}
                      <span className="mt-1 block text-right text-[10px] text-ink-faint">
                        {formatTime(m.ts)}
                      </span>
                    </div>
                  </div>
                )
              )}

              {/* typing indicator */}
              {sending && (
                <div className="flex items-end gap-2" role="status" aria-live="polite">
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-pop to-orange-pop shadow-[var(--shadow-soft)]"
                  >
                    <Sun className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                  </span>
                  <div className="rounded-2xl rounded-bl-md border border-ink/10 bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
                    <span className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full bg-pink-pop/70 ${
                            reduceMotion ? "" : "animate-bounce-soft"
                          }`}
                          style={{ animationDelay: `${i * 0.18}s` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* quick replies */}
            {showQuickReplies && (
              <div className="shrink-0 border-t border-ink/5 bg-white px-3 pb-1.5 pt-2.5">
                <div className="flex items-center gap-1">
                  <div
                    ref={quickRef}
                    className="no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [touch-action:pan-x]"
                  >
                    {QUICK_REPLY_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => void send(t(key))}
                        className="shrink-0 whitespace-nowrap rounded-full border border-pink-pop/25 bg-pink-soft/50 px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-all duration-200 hover:border-pink-pop/60 hover:bg-pink-soft hover:text-ink active:scale-95"
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                  {/* Slide affordance — reveals the remaining chips even where
                      touch panning is unreliable (embedded webviews) */}
                  <button
                    type="button"
                    onClick={() =>
                      quickRef.current?.scrollBy({ left: 200, behavior: "smooth" })
                    }
                    aria-label="Show more quick questions"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-pink-pop transition-all duration-200 hover:bg-pink-soft hover:text-ink active:scale-90"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            )}

            {/* input row */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
              className="shrink-0 border-t border-ink/10 bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t("chat.placeholder")}
                  aria-label={t("chat.placeholder")}
                  maxLength={MAX_INPUT_LENGTH}
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 rounded-full border-ink/10 bg-cream/70 px-4 text-sm text-ink shadow-none outline-none transition placeholder:text-ink-faint focus-visible:border-pink-pop/50 focus-visible:ring-[3px] focus-visible:ring-pink-pop/25"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label={t("chat.send")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-pop to-magenta-pop text-white shadow-[var(--shadow-glow-pink)] transition-all duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  ) : (
                    <SendHorizontal className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </div>
            </form>

            {/* trust footer */}
            <div className="flex items-center justify-center gap-1.5 border-t border-ink/5 bg-white px-3 pb-2.5 pt-1.5 text-center text-[10px] leading-snug text-ink-faint">
              <Phone className="h-3 w-3 shrink-0 text-green-deep" aria-hidden />
              <p>
                Sunny is an AI assistant. For anything urgent, call{" "}
                <a
                  href={SITE.phoneHref}
                  className="font-semibold text-ink-soft transition hover:text-brand"
                >
                  {SITE.phone}
                </a>
                .
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
