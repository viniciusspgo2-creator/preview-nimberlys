"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@/components/shared/SiteImage";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Pause, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Balloon, Sparkle, Squiggle } from "@/components/shared/decor";

const AUDIO_SRC = "/audio/welcome-message.mp3";
const HERO_THUMB = "/images/gallery/photo-group-room.webp?v=5";

/** Deterministic bar heights (px at peak) for an organic waveform look */
const BARS = [
  10, 18, 26, 14, 30, 22, 34, 18, 28, 12, 32, 24, 36, 20, 30, 14, 26, 34, 16,
  28, 22, 36, 18, 30, 12, 24, 32, 16,
];
const BAR_COLORS = [
  "#f43f6d", "#ff7a1f", "#ffc42e", "#7cc043", "#2fb9f1", "#d92e9c",
];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VoiceMessage() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const [ready, setReady] = useState(false); // metadata loaded
  const [buffering, setBuffering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [burstKey, setBurstKey] = useState(0); // replay ripple on each play press

  const busy = !ready || buffering;

  /* ------------------------------ controls ------------------------------ */

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
    } else {
      setBurstKey((k) => k + 1);
      void audio.play().catch(() => setPlaying(false));
    }
  }, [playing, ready]);

  const seekTo = useCallback((clientX: number) => {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !ready || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(audio.currentTime);
  }, [duration, ready]);

  /* --------------------------- drag + keyboard --------------------------- */

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) seekTo(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    const step = 2;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(duration, audio.currentTime + step);
    else if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - step);
    else return;
    setCurrent(audio.currentTime);
    e.preventDefault();
  };

  /* -------------------------- pause on unmount -------------------------- */
  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  /* If metadata finished loading before React hydration attached the event
     handlers (very common on fast connections), pick the duration up here. */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.readyState >= 1 && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
      setReady(true);
    }
  }, []);

  const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const barsActive = playing && !buffering && !reduce;

  return (
    <section
      aria-label={t("audio.title")}
      className="relative overflow-hidden bg-white pb-6 pt-14 sm:pb-8 sm:pt-16"
    >
      <div className="container-site relative">
        <SectionHeading
          eyebrowKey="audio.eyebrow"
          title={t("audio.title")}
          subtitle={t("audio.subtitle")}
        />

        {/* ------------------------- glass player card ------------------------- */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="group/card relative mx-auto mt-10 max-w-3xl"
        >
          {/* playful accents around the card */}
          <Balloon className="absolute -left-7 -top-9 z-10 hidden w-9 animate-float sm:block" color="#2fb9f1" />
          <Sparkle className="absolute -right-4 -top-5 z-10 w-7 animate-twinkle" color="#ffc42e" />
          <Sparkle className="absolute -bottom-6 left-8 z-10 w-5 animate-twinkle" color="#d92e9c" />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/70 shadow-lift backdrop-blur-xl transition-transform duration-300 group-hover/card:-translate-y-1">
            {/* soft color washes */}
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-pink-soft/70 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-sky-soft/70 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute right-1/3 top-0 h-24 w-24 rounded-full bg-yellow-soft/60 blur-2xl" />

            <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-8 lg:gap-9 lg:p-9">
              {/* ---------- photo chip ---------- */}
              <div className="relative shrink-0">
                <div
                  aria-hidden
                  className={`absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-pink-soft via-yellow-soft to-sky-soft transition-transform duration-500 ${
                    playing && !reduce ? "animate-heartbeat" : ""
                  }`}
                />
                <div className="relative h-28 w-28 overflow-hidden rounded-[1.75rem] shadow-card ring-4 ring-white sm:h-32 sm:w-32">
                  <Image
                    src={HERO_THUMB}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                {/* play-start ripple burst */}
                {playing && !reduce && (
                  <span
                    key={burstKey}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[2rem] border-[3px] border-pink-pop motion-safe:animate-ping"
                  />
                )}
              </div>

              {/* ---------- player body ---------- */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-pink-pop">
                    {t("audio.title")}
                  </p>
                </div>

                {/* waveform + progress */}
                <div className="mt-3">
                  {/* waveform bars (decorative) */}
                  <div
                    aria-hidden
                    className="flex h-10 items-center gap-[3px] overflow-hidden px-0.5 sm:h-12"
                  >
                    {BARS.map((h, i) => (
                      <motion.span
                        key={i}
                        className={`w-1 flex-none rounded-full sm:w-[5px] ${barsActive ? "" : "bg-ink/15"}`}
                        style={barsActive ? { backgroundColor: BAR_COLORS[i % BAR_COLORS.length] } : undefined}
                        initial={false}
                        animate={
                          barsActive
                            ? { height: [h * 0.45, h, h * 0.55, h * 0.85, h * 0.4], opacity: 1 }
                            : { height: Math.max(6, h * 0.32), opacity: 1 }
                        }
                        transition={
                          barsActive
                            ? {
                                duration: 0.9 + (i % 5) * 0.13,
                                repeat: Infinity,
                                repeatType: "mirror",
                                ease: "easeInOut",
                                delay: i * 0.045,
                              }
                            : { duration: 0.3 }
                        }
                      />
                    ))}
                  </div>

                  {/* seek bar */}
                  <div
                    ref={barRef}
                    role="slider"
                    tabIndex={0}
                    aria-label={t("audio.seek")}
                    aria-valuemin={0}
                    aria-valuemax={Math.round(duration)}
                    aria-valuenow={Math.round(current)}
                    aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onKeyDown={onKeyDown}
                    className="group/bar relative -mt-0.5 flex h-8 touch-none select-none items-center outline-none"
                  >
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
                      {!ready && (
                        <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                      )}
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-pop via-orange-pop to-yellow-pop transition-[width] duration-150"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      aria-hidden
                      className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md ring-2 ring-pink-pop transition-transform duration-150 ${
                        ready ? "scale-0 group-hover/bar:scale-100 group-focus-visible/bar:scale-100 group-active/bar:scale-100" : ""
                      }`}
                      style={{ left: `${pct}%` }}
                    />
                  </div>

                  {/* times */}
                  <div className="mt-1 flex items-center justify-between font-body text-xs font-semibold tabular-nums text-ink-soft">
                    <span>{formatTime(current)}</span>
                    <span aria-live="polite">
                      {!ready ? t("audio.loading") : formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ---------- custom play button ---------- */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!ready}
                  aria-label={playing ? t("audio.pause") : t("audio.play")}
                  className={`relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-white shadow-[var(--shadow-glow-pink)] transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-80 sm:h-20 sm:w-20 ${
                    playing
                      ? "bg-gradient-to-br from-orange-pop to-pink-pop"
                      : "bg-gradient-to-br from-pink-pop to-magenta-pop"
                  }`}
                >
                  {busy ? (
                    <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                  ) : playing ? (
                    <Pause className="h-8 w-8 fill-current" aria-hidden />
                  ) : (
                    <Play className="ml-1 h-8 w-8 fill-current" aria-hidden />
                  )}
                  {/* soft halo while playing */}
                  {playing && !reduce && (
                    <span
                      aria-hidden
                      className="absolute -inset-1.5 -z-10 rounded-full bg-gradient-to-br from-pink-pop/30 to-magenta-pop/30 blur-md"
                    />
                  )}
                </button>
                <Squiggle className="absolute -bottom-6 -right-8 hidden w-12 sm:block" color="#ffc42e" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* hidden native element — the actual engine behind the custom UI */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setReady(true);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={(e) => {
          setPlaying(false);
          e.currentTarget.currentTime = 0;
          setCurrent(0);
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => {
          if (!draggingRef.current) setCurrent(e.currentTarget.currentTime);
        }}
      />
    </section>
  );
}
