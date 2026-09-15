"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PageHeader,
  EmptyState,
  adminCard,
  FAQ_CATEGORIES,
  type AdminFaq,
} from "./admin-shared";

type DialogState =
  | { mode: "closed" }
  | { mode: "edit"; faq: AdminFaq | null };

const EMPTY_FORM = {
  question: "",
  answer: "",
  category: FAQ_CATEGORIES[0] as string,
  order: "0",
  published: true,
};

export function FaqManager() {
  const [faqs, setFaqs] = React.useState<AdminFaq[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);
  const [dialog, setDialog] = React.useState<DialogState>({ mode: "closed" });
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(() => {
    api<{ faqs: AdminFaq[] }>("/api/admin/faqs")
      .then((d) => setFaqs(d.faqs))
      .catch((e: Error) => {
        if (e.name === "AdminUnauthorized") return;
        setError(e.message);
        setFaqs([]);
      });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function openEdit(faq: AdminFaq | null) {
    setForm(
      faq
        ? {
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: String(faq.order),
            published: faq.published,
          }
        : EMPTY_FORM
    );
    setDialog({ mode: "edit", faq });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!form.question.trim()) return toast.error("Question is required.");
    if (!form.answer.trim()) return toast.error("Answer is required.");
    setSaving(true);
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category,
      order: Number(form.order) || 0,
      published: form.published,
    };
    const editing = dialog.mode === "edit" ? dialog.faq : null;
    try {
      if (editing) {
        await api(`/api/admin/faqs/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("FAQ updated");
      } else {
        await api("/api/admin/faqs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("FAQ added");
      }
      setDialog({ mode: "closed" });
      load();
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(faq: AdminFaq, v: boolean) {
    setBusyId(faq.id);
    try {
      await api(`/api/admin/faqs/${faq.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: v }),
      });
      toast.success(v ? "FAQ published" : "FAQ hidden");
      setFaqs((list) =>
        list?.map((f) => (f.id === faq.id ? { ...f, published: v } : f)) ?? null
      );
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Update failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(faq: AdminFaq) {
    setBusyId(faq.id);
    try {
      await api(`/api/admin/faqs/${faq.id}`, { method: "DELETE" });
      toast.success("FAQ deleted");
      setFaqs((list) => list?.filter((f) => f.id !== faq.id) ?? null);
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Delete failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  const loading = faqs === null && !error;

  return (
    <div>
      <PageHeader
        title="FAQs"
        subtitle="Questions shown on the public FAQ page and used by Sunny, the chatbot."
      >
        <Button
          size="sm"
          onClick={() => openEdit(null)}
          className="rounded-full font-display font-semibold"
        >
          <Plus className="size-4" /> Add FAQ
        </Button>
      </PageHeader>

      <div className={cn(adminCard, "overflow-hidden")}>
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4">
            <EmptyState icon={<HelpCircle />} title="Couldn't load FAQs" description={error} />
          </div>
        ) : faqs && faqs.length > 0 ? (
          <ul className="divide-y divide-[#f0e4d3]">
            {faqs.map((f) => {
              const busy = busyId === f.id;
              return (
                <li
                  key={f.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-4 transition-opacity sm:px-5",
                    busy && "pointer-events-none opacity-50"
                  )}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-extrabold text-brand">
                    {f.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{f.question}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">
                      {f.answer}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[0.68rem] font-extrabold text-ink-soft">
                        {f.category}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-extrabold",
                          f.published
                            ? "bg-green-soft text-green-deep"
                            : "bg-cream-deep text-ink-faint"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            f.published ? "bg-green-pop" : "bg-ink-faint"
                          )}
                        />
                        {f.published ? "Live" : "Hidden"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row">
                    <Switch
                      checked={f.published}
                      aria-label={f.published ? `Hide ${f.question}` : `Show ${f.question}`}
                      onCheckedChange={(v) => togglePublished(f, v)}
                      className="data-[state=checked]:bg-green-pop"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${f.question}`}
                      onClick={() => openEdit(f)}
                      className="size-8 text-ink-soft hover:bg-brand-soft hover:text-brand"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${f.question}`}
                          className="size-8 text-ink-soft hover:bg-red-soft hover:text-red-pop"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">
                            Delete this FAQ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            “{f.question}” will be permanently removed from the
                            website.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove(f)}
                            className="bg-red-pop text-white hover:bg-[#e22c5c]"
                          >
                            <Trash2 className="size-4" /> Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={<HelpCircle />}
              title="No FAQs yet"
              description="Add your first question — it appears on the FAQ page instantly."
            >
              <Button
                size="sm"
                onClick={() => openEdit(null)}
                className="mt-2 rounded-full font-display font-semibold"
              >
                <Plus className="size-4" /> Add FAQ
              </Button>
            </EmptyState>
          </div>
        )}
      </div>

      {/* Add / edit dialog */}
      <Dialog
        open={dialog.mode === "edit"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {dialog.mode === "edit" && dialog.faq ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription>
              Keep answers warm, clear and honest — families read these before
              calling.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="faq-question" className="text-[0.8rem] font-extrabold tracking-wide text-ink uppercase">
                Question
              </Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="e.g. Do you provide meals?"
                className="rounded-xl border-[#eadfcc] bg-cream-soft font-bold"
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="faq-answer" className="text-[0.8rem] font-extrabold tracking-wide text-ink uppercase">
                Answer
              </Label>
              <Textarea
                id="faq-answer"
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                rows={4}
                className="rounded-xl border-[#eadfcc] bg-cream-soft"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[0.8rem] font-extrabold tracking-wide text-ink uppercase">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="w-full rounded-xl border-[#eadfcc] bg-cream-soft font-bold">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="faq-order" className="text-[0.8rem] font-extrabold tracking-wide text-ink uppercase">
                  Order
                </Label>
                <Input
                  id="faq-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  className="rounded-xl border-[#eadfcc] bg-cream-soft"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-soft px-4 py-3">
              <Label htmlFor="faq-published" className="cursor-pointer text-sm font-bold text-ink">
                Published
              </Label>
              <Switch
                id="faq-published"
                checked={form.published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
                className="data-[state=checked]:bg-green-pop"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialog({ mode: "closed" })}
                className="rounded-full bg-white font-display font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full font-display font-semibold"
              >
                {saving ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {dialog.mode === "edit" && dialog.faq ? "Save changes" : "Add FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
