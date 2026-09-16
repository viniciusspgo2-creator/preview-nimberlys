"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/shared/Reveal";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  childAge: string;
  message: string;
  company: string; // honeypot — stays empty for real visitors
};

type FieldKey = "name" | "email" | "phone" | "childAge" | "message";
type FieldErrors = Partial<Record<FieldKey, string>>;

const INITIAL: FormValues = { name: "", email: "", phone: "", childAge: "", message: "", company: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (v.name.trim().length < 2 || v.name.trim().length > 80)
    errors.name = "Please enter your name (2–80 characters).";
  if (!EMAIL_RE.test(v.email.trim()) || v.email.trim().length > 254)
    errors.email = "Please enter a valid email address.";
  if (v.phone.trim().length > 25)
    errors.phone = "That phone number looks too long.";
  if (v.childAge.trim().length > 40)
    errors.childAge = "Please keep this under 40 characters.";
  if (v.message.trim().length < 5 || v.message.trim().length > 2000)
    errors.message = "Please add a few words (5–2000 characters).";
  return errors;
}

function fieldCls(invalid: boolean) {
  return `w-full rounded-2xl border-2 bg-white px-4 text-base text-ink shadow-sm outline-none transition-all placeholder:text-ink-faint focus:ring-4 md:text-base ${
    invalid
      ? "border-red-pop focus:ring-red-pop/20"
      : "border-input focus:border-brand focus:ring-brand/25"
  }`;
}

/**
 * The contact form — client-side validated, posts to /api/contact,
 * with sending / success / error states.
 */
export function ContactForm() {
  const { t } = useI18n();
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => (prev[key as FieldKey] ? { ...prev, [key]: undefined } : prev));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);

    const firstInvalid = (Object.keys(errs) as FieldKey[]).find((k) => errs[k]);
    if (firstInvalid) {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
      el?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;

      if (res.ok && data?.ok) {
        setStatus("success");
      } else {
        setStatus("idle");
        toast.error(t("contact.error"));
      }
    } catch {
      setStatus("idle");
      toast.error(t("contact.error"));
    }
  }

  /* ---------------- Success state ---------------- */
  if (status === "success") {
    return (
      <Reveal from="scale">
        <div className="card-soft flex flex-col items-center p-8 text-center sm:p-10" role="status">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-soft">
            <CheckCircle2 className="h-10 w-10 text-green-pop" aria-hidden />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
            {t("contact.formTitle")}
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-ink-soft">
            {t("contact.success")}
          </p>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-ink">
            {t("contact.emergency")}
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 rounded-full bg-green-soft px-4 py-2 font-display text-base text-green-deep transition-transform hover:scale-105"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {SITE.phone}
            </a>
          </p>
        </div>
      </Reveal>
    );
  }

  /* ---------------- Form state ---------------- */
  return (
    <Reveal>
      <div className="card-soft p-5 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-[1.7rem]">
          {t("contact.formTitle")}
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="contact-name" className="font-display text-sm font-semibold text-ink">
                {t("contact.name")} <span className="text-pink-pop">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={values.name}
                onChange={set("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={`${fieldCls(Boolean(errors.name))} mt-1.5 h-12`}
                minLength={2}
                maxLength={80}
              />
              {errors.name && (
                <p id="contact-name-error" role="alert" className="mt-1.5 text-sm font-semibold text-red-pop">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="font-display text-sm font-semibold text-ink">
                {t("contact.email")} <span className="text-pink-pop">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={set("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={`${fieldCls(Boolean(errors.email))} mt-1.5 h-12`}
                maxLength={254}
              />
              {errors.email && (
                <p id="contact-email-error" role="alert" className="mt-1.5 text-sm font-semibold text-red-pop">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Phone (optional) */}
            <div>
              <label htmlFor="contact-phone" className="font-display text-sm font-semibold text-ink">
                {t("contact.phone")}{" "}
                <span className="text-sm font-normal text-ink-faint">({t("contact.optional")})</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={set("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                className={`${fieldCls(Boolean(errors.phone))} mt-1.5 h-12`}
                maxLength={25}
              />
              {errors.phone && (
                <p id="contact-phone-error" role="alert" className="mt-1.5 text-sm font-semibold text-red-pop">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Child's age (optional) */}
            <div>
              <label htmlFor="contact-childAge" className="font-display text-sm font-semibold text-ink">
                {t("contact.childAge")}{" "}
                <span className="text-sm font-normal text-ink-faint">({t("contact.optional")})</span>
              </label>
              <input
                id="contact-childAge"
                name="childAge"
                type="text"
                placeholder={t("contact.childAgePlaceholder")}
                value={values.childAge}
                onChange={set("childAge")}
                aria-invalid={Boolean(errors.childAge)}
                aria-describedby={errors.childAge ? "contact-childAge-error" : undefined}
                className={`${fieldCls(Boolean(errors.childAge))} mt-1.5 h-12`}
                maxLength={40}
              />
              {errors.childAge && (
                <p id="contact-childAge-error" role="alert" className="mt-1.5 text-sm font-semibold text-red-pop">
                  {errors.childAge}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="contact-message" className="font-display text-sm font-semibold text-ink">
              {t("contact.message")} <span className="text-pink-pop">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              placeholder={t("contact.messagePlaceholder")}
              value={values.message}
              onChange={set("message")}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              className={`${fieldCls(Boolean(errors.message))} mt-1.5 min-h-32 py-3.5`}
              minLength={5}
              maxLength={2000}
            />
            {errors.message && (
              <p id="contact-message-error" role="alert" className="mt-1.5 text-sm font-semibold text-red-pop">
                {errors.message}
              </p>
            )}
          </div>

          {/* Honeypot — invisible to humans */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="contact-company">Company</label>
            <input
              id="contact-company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.company}
              onChange={set("company")}
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-pink btn-lg w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                {t("contact.sending")}
              </>
            ) : (
              <>
                <Send className="h-5 w-5" aria-hidden />
                {t("contact.send")}
              </>
            )}
          </button>
        </form>
      </div>
    </Reveal>
  );
}
