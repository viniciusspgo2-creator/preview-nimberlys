"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RecoveryScreen({ onBack }: { onBack: () => void }) {
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirm }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Unable to reset password.");
      setToken(""); setPassword(""); setConfirm(""); setDone(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to reset password."); }
    finally { setBusy(false); }
  }
  return <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-10">
    <section className="w-full max-w-md rounded-3xl border border-[#f0e4d3] bg-white p-8 shadow-lg">
      <h1 className="font-display text-2xl font-semibold text-ink">Reset admin password</h1>
      {done ? <div className="mt-5 space-y-5"><p role="status">Password updated. Your recovery code has been used and previous sessions have been signed out. You can now sign in with your new password.</p><Button onClick={onBack}>Back to sign in</Button></div> : <>
        <p className="mt-3 text-sm text-ink-soft">The website owner can enable recovery by setting a separate <code>ADMIN_RESET_TOKEN</code> in the hosting environment and redeploying. Use a random code of 32–256 characters. <code>ADMIN_SECRET</code> is not your password or recovery code.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">Recovery code<Input className="mt-2 text-base" type="password" value={token} onChange={e => setToken(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} minLength={32} maxLength={256} required /></label>
          <label className="block text-sm font-semibold">New password<Input className="mt-2 text-base" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required /></label>
          <label className="block text-sm font-semibold">Confirm new password<Input className="mt-2 text-base" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required /></label>
          {error && <p role="alert" className="rounded-xl bg-red-soft p-3 text-sm text-red-pop">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Resetting…" : "Save new password"}</Button>
          <button type="button" disabled={busy} onClick={onBack} className="w-full py-2 text-sm underline">Back to sign in</button>
        </form>
      </>}
    </section>
  </div>;
}
