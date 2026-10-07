"use client";

import * as React from "react";
import { AdminSpinner } from "./admin-shared";
import { LoginScreen } from "./LoginScreen";
import { AdminShell } from "./AdminShell";

type Status = "loading" | "authed" | "guest" | "setup" | "error";

/**
 * Client-side gate: checks GET /api/admin/me and renders either the
 * setup screen (first access — no password yet), the login screen or the
 * dashboard shell. Listens for "nimb:unauthorized" (dispatched by the
 * shared fetch helper on any 401) to flip back to login.
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState("");
  const [status, setStatus] = React.useState<Status>("loading");

  React.useEffect(() => {
    let active = true;
    fetch("/api/admin/me", { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to load admin.");
        return data;
      })
      .then((d: { authed?: boolean; configured?: boolean }) => {
        if (!active) return;
        if (d.authed) setStatus("authed");
        else if (d.configured === false) setStatus("setup"); // first access
        else setStatus("guest");
      })
      .catch((err) => {
        if (active) { setError(err instanceof Error ? err.message : "Unable to load admin."); setStatus("error"); }
      });

    const onUnauthorized = () => setStatus("guest");
    window.addEventListener("nimb:unauthorized", onUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("nimb:unauthorized", onUnauthorized);
    };
  }, []);

  if (status === "error") return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream p-6"><p role="alert" className="max-w-md text-center">{error}</p><button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-white px-6 py-3">Try again</button></div>;

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
