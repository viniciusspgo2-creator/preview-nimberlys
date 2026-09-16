"use client";

import * as React from "react";
import { AdminSpinner } from "./admin-shared";
import { LoginScreen } from "./LoginScreen";
import { AdminShell } from "./AdminShell";

type Status = "loading" | "authed" | "guest" | "setup";

/**
 * Client-side gate: checks GET /api/admin/me and renders either the
 * setup screen (first access — no password yet), the login screen or the
 * dashboard shell. Listens for "nimb:unauthorized" (dispatched by the
 * shared fetch helper on any 401) to flip back to login.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<Status>("loading");

  React.useEffect(() => {
    let active = true;
    fetch("/api/admin/me", { credentials: "same-origin", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authed?: boolean; configured?: boolean }) => {
        if (!active) return;
        if (d.authed) setStatus("authed");
        else if (d.configured === false) setStatus("setup"); // first access
        else setStatus("guest");
      })
      .catch(() => {
        if (active) setStatus("guest");
      });

    const onUnauthorized = () => setStatus("guest");
    window.addEventListener("nimb:unauthorized", onUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("nimb:unauthorized", onUnauthorized);
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream">
        <AdminSpinner className="size-10" />
        <p className="text-sm font-semibold text-ink-faint">Loading admin…</p>
      </div>
    );
  }

  if (status === "setup") {
    return <LoginScreen mode="setup" onSuccess={() => setStatus("authed")} />;
  }

  if (status === "guest") {
    return <LoginScreen mode="login" onSuccess={() => setStatus("authed")} />;
  }

  return <AdminShell>{children}</AdminShell>;
}
