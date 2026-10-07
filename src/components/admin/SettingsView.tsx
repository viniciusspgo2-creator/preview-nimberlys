"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Bot,
  ShieldCheck,
  Save,
  LoaderCircle,
  Eye,
  EyeOff,
  KeyRound,
  PlugZap,
  ListRestart,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  api,
  CharCounter,
  PageHeader,
  adminCard,
  GEMINI_MODELS,
  GEMINI_CUSTOM,
} from "./admin-shared";

type Settings = Record<string, string>;

function Field({
  label,
  htmlFor,
  hint,
  counter,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-[0.8rem] font-extrabold tracking-wide text-ink uppercase">
          {label}
        </Label>
        {counter}
      </div>
      {children}
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}

const inputCls = "rounded-xl border-[#eadfcc] bg-cream-soft";

export function SettingsView() {
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // per-tab state
  const [site, setSite] = React.useState<Settings>({});
  const [seo, setSeo] = React.useState<Settings>({});
  const [chat, setChat] = React.useState<Settings>({});
  const [showKey, setShowKey] = React.useState(false);

  // security
  const [newPw, setNewPw] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");

  // chatbot: custom model id + connection test
  const [customModel, setCustomModel] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ ok: boolean; message: string } | null>(null);

  // chatbot: models fetched live from Google for the configured key
  const [availableModels, setAvailableModels] = React.useState<string[] | null>(null);
  const [loadingModels, setLoadingModels] = React.useState(false);

  const [savingTab, setSavingTab] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    api<{ settings: Settings }>("/api/admin/settings")
      .then((d) => {
        if (!active) return;
        setSettings(d.settings);
        const s = d.settings;
        const pick = (keys: string[], src: Settings): Settings =>
          Object.fromEntries(keys.map((k) => [k, src[k] ?? ""]));
        setSite(
          pick(
            [
              "site_name",
              "site_display_name",
              "tagline",
              "address_street",
              "address_city",
              "hours",
              "ages",
              "phone",
              "email",
            ],
            s
          )
        );
        setSeo(
          pick(
            [
              "meta_title",
              "meta_description",
              "og_image",
              "gsc_verification",
              "ga_measurement_id",
            ],
            s
          )
        );
        setChat(
          pick(
            [
              "chat_welcome",
              "gemini_api_key",
              "gemini_model",
              "chat_system_prompt",
              "chat_quick_replies",
            ],
            s
          )
        );
        // If the saved model is not one of the presets, show the custom input.
        const savedModel = (s.gemini_model ?? "").trim();
        setCustomModel(savedModel.length > 0 && !GEMINI_MODELS.includes(savedModel as (typeof GEMINI_MODELS)[number]));
      })
      .catch((e: Error) => {
        if (!active) return;
        if (e.name === "AdminUnauthorized") return;
        setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveTab(tab: string, payload: Record<string, string>) {
    setSavingTab(tab);
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Settings saved", { description: `${tab} settings updated.` });
      if (payload.gemini_api_key !== undefined) {
        // blank means "keep existing" — clear the field after save
        setChat((c) => ({ ...c, gemini_api_key: "" }));
        setShowKey(false);
      }
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Save failed");
      }
    } finally {
      setSavingTab(null);
    }
  }

  async function testGemini() {
    if (testing) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/test-gemini", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: chat.gemini_api_key?.trim() || undefined,
          model: chat.gemini_model?.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      setTestResult({
        ok: Boolean(res.ok && data.ok),
        message: data.message || "Could not reach the test endpoint. Try again.",
      });
    } catch {
      setTestResult({
        ok: false,
        message: "Could not reach the test endpoint. Try again.",
      });
    } finally {
      setTesting(false);
    }
  }

  async function loadModels() {
    if (loadingModels) return;
    setLoadingModels(true);
    try {
      const res = await fetch("/api/admin/gemini-models", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: chat.gemini_api_key?.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        models?: string[];
        count?: number;
        message?: string;
      };
      if (res.ok && data.ok && Array.isArray(data.models) && data.models.length > 0) {
        const models = data.models;
        setAvailableModels(models);
        const current = (chat.gemini_model ?? "").trim();
        if (!current || !models.includes(current)) {
          setCustomModel(false);
          setChat((s) => ({ ...s, gemini_model: models[0] }));
          toast.success(`Loaded ${models.length} models for this key`, {
            description: current
              ? `“${current}” is not available for this key — switched to ${models[0]}.`
              : `Selected ${models[0]} (newest). Remember to save.`,
          });
        } else {
          toast.success(`Loaded ${models.length} models for this key`, {
            description: `“${current}” is available and stays selected.`,
          });
        }
      } else {
        toast.error(data.message || "Could not load models. Try again.");
      }
    } catch {
      toast.error("Could not reach the models endpoint. Try again.");
    } finally {
      setLoadingModels(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (savingTab) return;
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingTab("Security");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ new_admin_password: newPw }),
      });
      toast.success("Password updated", {
        description: "Password updated. Please sign in again with your new password.",
      });
      window.dispatchEvent(new Event("nimb:unauthorized"));
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Save failed");
      }
    } finally {
      setSavingTab(null);
    }
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Settings" />
        <div className={cn(adminCard, "p-6 text-sm font-semibold text-red-pop")}>
          {error}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Loading…" />
        <div className="space-y-4">
          <Skeleton className="h-11 w-full max-w-md rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const keySet = (settings.gemini_api_key_set ?? "") === "1";
  const keyHint = settings.gemini_api_key_hint ?? "";

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Everything here powers the public website and the Sunny chatbot."
      />

      <Tabs defaultValue="site">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-white p-1.5 shadow-[0_4px_20px_-4px_rgb(46_58_84/0.08)]">
          {[
            { value: "site", label: "Site", icon: Building2 },
            { value: "seo", label: "SEO", icon: Search },
            { value: "chatbot", label: "Chatbot", icon: Bot },
            { value: "security", label: "Security", icon: ShieldCheck },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="gap-1.5 rounded-xl px-4 py-2.5 font-display text-sm font-semibold data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              <t.icon className="size-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---------------- SITE ---------------- */}
        <TabsContent value="site" className="mt-5">
          <div className={cn(adminCard, "space-y-5 p-5 sm:p-6")}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Legal name" htmlFor="s-site_name">
                <Input id="s-site_name" className={inputCls} value={site.site_name ?? ""} onChange={(e) => setSite((s) => ({ ...s, site_name: e.target.value }))} />
              </Field>
              <Field label="Display name" htmlFor="s-site_display_name">
                <Input id="s-site_display_name" className={inputCls} value={site.site_display_name ?? ""} onChange={(e) => setSite((s) => ({ ...s, site_display_name: e.target.value }))} />
              </Field>
            </div>
            <Field label="Tagline" htmlFor="s-tagline">
              <Input id="s-tagline" className={inputCls} value={site.tagline ?? ""} onChange={(e) => setSite((s) => ({ ...s, tagline: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Street address" htmlFor="s-address_street">
                <Input id="s-address_street" className={inputCls} value={site.address_street ?? ""} onChange={(e) => setSite((s) => ({ ...s, address_street: e.target.value }))} />
              </Field>
              <Field label="City, state & ZIP" htmlFor="s-address_city">
                <Input id="s-address_city" className={inputCls} value={site.address_city ?? ""} onChange={(e) => setSite((s) => ({ ...s, address_city: e.target.value }))} />
              </Field>
              <Field label="Hours" htmlFor="s-hours">
                <Input id="s-hours" className={inputCls} value={site.hours ?? ""} onChange={(e) => setSite((s) => ({ ...s, hours: e.target.value }))} />
              </Field>
              <Field label="Ages accepted" htmlFor="s-ages">
                <Input id="s-ages" className={inputCls} value={site.ages ?? ""} onChange={(e) => setSite((s) => ({ ...s, ages: e.target.value }))} />
              </Field>
              <Field label="Phone" htmlFor="s-phone">
                <Input id="s-phone" type="tel" className={inputCls} value={site.phone ?? ""} onChange={(e) => setSite((s) => ({ ...s, phone: e.target.value }))} />
              </Field>
              <Field label="Email" htmlFor="s-email">
                <Input id="s-email" type="email" className={inputCls} value={site.email ?? ""} onChange={(e) => setSite((s) => ({ ...s, email: e.target.value }))} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("Site", site)}
                disabled={savingTab !== null}
                className="rounded-full font-display font-semibold"
              >
                {savingTab === "Site" ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save site settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---------------- SEO ---------------- */}
        <TabsContent value="seo" className="mt-5">
          <div className={cn(adminCard, "space-y-5 p-5 sm:p-6")}>
            <Field
              label="Meta title"
              htmlFor="s-meta_title"
              counter={<CharCounter value={seo.meta_title ?? ""} max={60} />}
              hint="Shown as the page title in Google results (60 char limit)."
            >
              <Input id="s-meta_title" className={inputCls} value={seo.meta_title ?? ""} onChange={(e) => setSeo((s) => ({ ...s, meta_title: e.target.value }))} />
            </Field>
            <Field
              label="Meta description"
              htmlFor="s-meta_description"
              counter={<CharCounter value={seo.meta_description ?? ""} max={160} />}
              hint="Short summary for search results (160 char limit)."
            >
              <Textarea id="s-meta_description" rows={3} className={inputCls} value={seo.meta_description ?? ""} onChange={(e) => setSeo((s) => ({ ...s, meta_description: e.target.value }))} />
            </Field>
            <Field label="OG image" htmlFor="s-og_image" hint="Path or URL of the social sharing image (1200×630 recommended).">
              <Input id="s-og_image" className={inputCls} value={seo.og_image ?? ""} onChange={(e) => setSeo((s) => ({ ...s, og_image: e.target.value }))} />
            </Field>
            <Field label="Google Search Console verification" htmlFor="s-gsc_verification" hint="Paste the content value of the <meta name='google-site-verification'> tag.">
              <Input id="s-gsc_verification" className={cn(inputCls, "font-mono text-sm")} value={seo.gsc_verification ?? ""} onChange={(e) => setSeo((s) => ({ ...s, gsc_verification: e.target.value }))} />
            </Field>
            <Field label="Google Analytics measurement ID" htmlFor="s-ga_measurement_id" hint="Format: G-XXXXXXXXXX — find it in your GA4 property settings. Leave blank to disable analytics.">
              <Input id="s-ga_measurement_id" placeholder="G-XXXXXXXXXX" className={cn(inputCls, "font-mono text-sm")} value={seo.ga_measurement_id ?? ""} onChange={(e) => setSeo((s) => ({ ...s, ga_measurement_id: e.target.value }))} />
            </Field>
            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("SEO", seo)}
                disabled={savingTab !== null}
                className="rounded-full font-display font-semibold"
              >
                {savingTab === "SEO" ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save SEO settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---------------- CHATBOT ---------------- */}
        <TabsContent value="chatbot" className="mt-5">
          <div className={cn(adminCard, "space-y-5 p-5 sm:p-6")}>
            <Field
              label="Welcome message"
              htmlFor="s-chat_welcome"
              hint="First thing visitors see when they open the chat."
            >
              <Textarea id="s-chat_welcome" rows={3} className={inputCls} value={chat.chat_welcome ?? ""} onChange={(e) => setChat((s) => ({ ...s, chat_welcome: e.target.value }))} />
            </Field>

            <Field
              label="Gemini API key"
              htmlFor="s-gemini_api_key"
              hint={
                keySet
                  ? `Current key: ${keyHint} — leave blank to keep it, or type a new key to replace it.`
                  : "Get a key from Google AI Studio. Required for Sunny to answer with AI."
              }
            >
              <div className="relative">
                <Input
                  id="s-gemini_api_key"
                  type={showKey ? "text" : "password"}
                  placeholder={keySet ? "•••••••••••• (saved)" : "AIza…"}
                  autoComplete="off"
                  className={cn(inputCls, "pr-11 font-mono text-sm")}
                  value={chat.gemini_api_key ?? ""}
                  onChange={(e) => {
                    setChat((s) => ({ ...s, gemini_api_key: e.target.value }));
                    // A new key means a new model list — drop the stale one.
                    if (availableModels) setAvailableModels(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Field
              label="Gemini model"
              htmlFor="s-gemini_model"
              hint="Not sure which model your key supports? Click “Load models for this key” — it asks Google for the exact list. Or choose “Custom model id…” and paste any id exactly as shown in Google AI Studio."
            >
              {customModel ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="s-gemini_model"
                    className={cn(inputCls, "font-mono text-sm")}
                    placeholder="e.g. gemini-flash-latest"
                    autoComplete="off"
                    value={chat.gemini_model ?? ""}
                    onChange={(e) => setChat((s) => ({ ...s, gemini_model: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 rounded-full font-semibold"
                    onClick={() => {
                      setCustomModel(false);
                      setChat((s) => ({ ...s, gemini_model: GEMINI_MODELS[0] }));
                    }}
                  >
                    Choose from list
                  </Button>
                </div>
              ) : (
                <Select
                  value={chat.gemini_model || GEMINI_MODELS[0]}
                  onValueChange={(v) => {
                    if (v === GEMINI_CUSTOM) {
                      setCustomModel(true);
                      setChat((s) => ({ ...s, gemini_model: "" }));
                    } else {
                      setChat((s) => ({ ...s, gemini_model: v }));
                    }
                  }}
                >
                  <SelectTrigger id="s-gemini_model" className="w-full sm:w-80">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="admin-scroll max-h-72">
                    {availableModels && availableModels.length > 0 ? (
                      <SelectGroup>
                        <SelectLabel className="text-[0.7rem] font-extrabold uppercase tracking-wide text-green-pop">
                          Available for your key ({availableModels.length})
                        </SelectLabel>
                        {availableModels.map((m) => (
                          <SelectItem key={m} value={m} className="font-mono text-[0.8rem]">
                            {m}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                    <SelectGroup>
                      <SelectLabel className="text-[0.7rem] font-extrabold uppercase tracking-wide text-ink-faint">
                        {availableModels && availableModels.length > 0
                          ? "Other known models"
                          : "Common models"}
                      </SelectLabel>
                      {GEMINI_MODELS.filter(
                        (m) => !availableModels || !availableModels.includes(m)
                      ).map((m) => (
                        <SelectItem key={m} value={m} className="font-mono text-[0.8rem]">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectItem value={GEMINI_CUSTOM}>Custom model id…</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadModels}
                  disabled={loadingModels}
                  className="rounded-full font-semibold"
                >
                  {loadingModels ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ListRestart className="size-4" />
                  )}
                  Load models for this key
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={testGemini}
                  disabled={testing}
                  className="rounded-full font-semibold"
                >
                  {testing ? <LoaderCircle className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
                  Test connection
                </Button>
              </div>
              <p className="text-xs text-ink-faint">
                “Load models” asks Google which chat models your key accepts (new AI Studio keys
                usually get Gemini 3 family only). “Test connection” sends a tiny “ping” and shows
                exactly what went wrong if it fails.
              </p>
              {availableModels && availableModels.length > 0 ? (
                <p className="flex items-start gap-1.5 text-xs font-semibold text-green-pop">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                  {availableModels.length} chat models found for this key — they are grouped at the
                  top of the model list.
                </p>
              ) : null}
              {testResult ? (
                <p
                  role="status"
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-semibold leading-relaxed",
                    testResult.ok ? "bg-green-soft text-green-pop" : "bg-red-soft text-red-pop"
                  )}
                >
                  {testResult.message}
                </p>
              ) : null}
            </div>

            <Field
              label="Quick replies"
              htmlFor="s-chat_quick_replies"
              hint="Buttons shown under the welcome message. Separate replies with |"
            >
              <Input id="s-chat_quick_replies" className={inputCls} value={chat.chat_quick_replies ?? ""} onChange={(e) => setChat((s) => ({ ...s, chat_quick_replies: e.target.value }))} />
            </Field>

            <Field
              label="System prompt"
              htmlFor="s-chat_system_prompt"
              hint="Instructions for Sunny — keep the FACTS block accurate and never invent prices or policies."
            >
              <Textarea
                id="s-chat_system_prompt"
                rows={12}
                className={cn(inputCls, "admin-scroll font-mono text-xs leading-relaxed")}
                value={chat.chat_system_prompt ?? ""}
                onChange={(e) => setChat((s) => ({ ...s, chat_system_prompt: e.target.value }))}
              />
            </Field>

            <div className="flex justify-end">
              <Button
                onClick={() => saveTab("Chatbot", chat)}
                disabled={savingTab !== null}
                className="rounded-full font-display font-semibold"
              >
                {savingTab === "Chatbot" ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save chatbot settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ---------------- SECURITY ---------------- */}
        <TabsContent value="security" className="mt-5">
          <form onSubmit={savePassword} className={cn(adminCard, "max-w-xl space-y-5 p-5 sm:p-6")}>
            <div className="flex items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3.5">
              <KeyRound className="size-5 shrink-0 text-brand" />
              <p className="text-sm font-semibold text-brand-deep">
                This password protects the admin panel. Choose at least 8
                characters.
              </p>
            </div>
            <Field label="New password" htmlFor="s-new_pw">
              <Input
                id="s-new_pw"
                type="password"
                autoComplete="new-password"
                minLength={8}
                className={inputCls}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
            </Field>
            <Field label="Confirm new password" htmlFor="s-confirm_pw">
              <Input
                id="s-confirm_pw"
                type="password"
                autoComplete="new-password"
                className={cn(inputCls, newPw && confirmPw && newPw !== confirmPw ? "border-red-pop/60" : "")}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
              {newPw && confirmPw && newPw !== confirmPw ? (
                <p className="text-xs font-bold text-red-pop">
                  Passwords do not match yet.
                </p>
              ) : null}
            </Field>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingTab !== null}
                className="rounded-full font-display font-semibold"
              >
                {savingTab === "Security" ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                Update password
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
