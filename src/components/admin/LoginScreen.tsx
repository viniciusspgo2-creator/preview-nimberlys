"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  Sparkles,
  LoaderCircle,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "login" | "setup";

function strengthHint(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too weak", "Weak", "Okay", "Good", "Strong", "Excellent"];
  return { score, label: labels[Math.min(score, 5)] };
}

export function LoginScreen({
  mode = "login",
  onSuccess,
}: {
  mode?: Mode;
  onSuccess: () => void;
}) {
  const isSetup = mode === "setup";
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [shakeKey, setShakeKey] = React.useState(0);

  const strength = isSetup && password ? strengthHint(password) : null;
  const mismatch = isSetup && confirm.length > 0 && confirm !== password;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    if (isSetup) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setShakeKey((k) => k + 1);
        return;
      }
      if (password !== confirm) {
        setError("Passwords don't match. Please check and try again.");
        setShakeKey((k) => k + 1);
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(isSetup ? "/api/admin/setup" : "/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSetup ? { password, confirm } : { password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        onSuccess();
        return;
      }
      setError(data.error || "Something went wrong. Please try again.");
      setShakeKey((k) => k + 1);
    } catch {
      setError("Something went wrong. Please try again.");
      setShakeKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  const strengthBarColor =
    !strength || strength.score <= 1
      ? "bg-red-pop"
      : strength.score === 2
        ? "bg-orange-pop"
        : strength.score === 3
          ? "bg-yellow-pop"
          : "bg-green-pop";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-5 py-10">
      {/* soft color washes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-pink-soft/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 size-[28rem] rounded-full bg-brand-soft/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 right-[12%] size-40 rounded-full bg-yellow-soft/80 blur-2xl"
      />

      {/* floating sparkles */}
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute top-[16%] left-[14%] size-7 text-yellow-pop animate-twinkle"
      />
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute top-[24%] right-[18%] size-5 text-pink-pop animate-twinkle [animation-delay:0.8s]"
      />
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute bottom-[18%] left-[20%] size-6 text-sky-pop animate-twinkle [animation-delay:1.6s]"
      />
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute bottom-[26%] right-[12%] size-4 text-orange-pop animate-twinkle [animation-delay:2.2s]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-4xl border border-[#f0e4d3] bg-white p-8 shadow-[0_24px_60px_-20px_rgb(46_58_84/0.25)] sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src="/images/logo-mark.png"
                alt="Nimberly's Daycare logo"
                className="size-20 object-contain drop-shadow-[0_10px_24px_rgb(46_58_84/0.18)]"
              />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
              {isSetup ? "Create your admin password" : "Nimberly's Admin"}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {isSetup
                ? "First time here — protect your dashboard with a password of at least 8 characters."
                : "Sign in to manage your daycare website"}
            </p>
          </div>

          <motion.form
            key={shakeKey}
            onSubmit={submit}
            className="mt-8 space-y-4"
            animate={shakeKey > 0 ? { x: [0, -10, 10, -7, 7, -3, 0] } : undefined}
            transition={{ duration: 0.45 }}
          >
            <div>
              <label htmlFor="admin-password" className="sr-only">
                {isSetup ? "New admin password" : "Admin password"}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-faint" />
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={isSetup ? "Create a password (min. 8 characters)" : "Admin password"}
                  autoComplete={isSetup ? "new-password" : "current-password"}
                  autoFocus
                  className={cn(
                    "h-12 rounded-xl border-[#eadfcc] bg-cream-soft pl-10 pr-11 text-base",
                    error && "border-red-pop/60 focus-visible:ring-red-pop/25"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* strength meter (setup only) */}
            {strength ? (
              <div className="space-y-1.5" aria-live="polite">
                <div className="flex gap-1" aria-hidden>
                  {[1, 2, 3, 4, 5].map((step) => (
                    <span
                      key={step}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors duration-300",
                        strength.score >= step ? strengthBarColor : "bg-[#efe6d8]"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-ink-faint">
                  Strength: {strength.label}
                </p>
              </div>
            ) : null}

            {isSetup ? (
              <div>
                <label htmlFor="admin-confirm" className="sr-only">
                  Confirm new password
                </label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-faint" />
                  <Input
                    id="admin-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={cn(
                      "h-12 rounded-xl border-[#eadfcc] bg-cream-soft pl-10 pr-11 text-base",
                      mismatch && "border-red-pop/60 focus-visible:ring-red-pop/25",
                      confirm.length > 0 &&
                        !mismatch &&
                        "border-green-pop/60 focus-visible:ring-green-pop/25"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
                  >
                    {mismatch ? (
                      <X className="size-4 text-red-pop" />
                    ) : confirm.length > 0 ? (
                      <Check className="size-4 text-green-pop" />
                    ) : showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {mismatch ? (
                  <p className="mt-1.5 pl-1 text-xs font-semibold text-red-pop">
                    Passwords don&apos;t match yet.
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-red-soft px-4 py-2.5 text-sm font-semibold text-red-pop"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={
                busy ||
                !password ||
                (isSetup && (!confirm || password !== confirm))
              }
              className="h-12 w-full rounded-full font-display text-base font-semibold shadow-[0_12px_40px_-10px_rgb(34_120_224/0.45)]"
            >
              {busy ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {isSetup ? "Creating…" : "Signing in…"}
                </>
              ) : (
                <>
                  {isSetup ? <ShieldCheck className="size-4" /> : <Lock className="size-4" />}
                  {isSetup ? "Create password & sign in" : "Sign in"}
                </>
              )}
            </Button>
          </motion.form>

          <p className="mt-6 text-center text-xs text-ink-faint">
            {isSetup
              ? "You'll use this password every time you sign in. Store it safely."
              : "Protected area · Nimberly's Daycare, Inc."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
