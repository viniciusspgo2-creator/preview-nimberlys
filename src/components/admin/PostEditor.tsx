"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  Trash2,
  Plus,
  Star,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  slugify,
  parsePostFaq,
  CharCounter,
  PageHeader,
  AdminSpinner,
  adminCard,
  POST_CATEGORIES,
  COVERS,
  coverLabel,
  type AdminPost,
  type PostFaqItem,
} from "./admin-shared";

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string;
  cover: string;
  readingMinutes: string;
  featured: boolean;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  faqItems: PostFaqItem[];
  content: string;
};

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  category: POST_CATEGORIES[0],
  tags: "",
  cover: COVERS[0],
  readingMinutes: "5",
  featured: false,
  published: true,
  metaTitle: "",
  metaDescription: "",
  faqItems: [],
  content: "",
};

function fromPost(p: AdminPost): FormState {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    category: p.category,
    tags: p.tags,
    cover: p.cover,
    readingMinutes: String(p.readingMinutes),
    featured: p.featured,
    published: p.published,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    faqItems: parsePostFaq(p.faq),
    content: p.content,
  };
}

function Field({
  label,
  htmlFor,
  counter,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  counter?: React.ReactNode;
  hint?: string;
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

export function PostEditor({ postId }: { postId?: number }) {
  const router = useRouter();
  const isEdit = typeof postId === "number" && Number.isFinite(postId);

  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [loading, setLoading] = React.useState(isEdit);
  const [notFound, setNotFound] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  React.useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api<{ post: AdminPost }>(`/api/admin/posts/${postId}`)
      .then((d) => {
        if (!active) return;
        setForm(fromPost(d.post));
        setSlugTouched(true); // keep existing slug as-is
        setLoading(false);
      })
      .catch((e: Error) => {
        if (!active) return;
        if (e.name === "AdminUnauthorized") return;
        setNotFound(true);
        setLoading(false);
        toast.error(e.message);
      });
    return () => {
      active = false;
    };
  }, [isEdit, postId]);

  function onTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.slug.trim()) return toast.error("Slug is required.");
    if (!/^[a-z0-9-]+$/.test(form.slug.trim())) {
      return toast.error(
        "Slug may only contain lowercase letters, numbers and dashes."
      );
    }
    if (!form.excerpt.trim()) return toast.error("Excerpt is required.");
    if (!form.content.trim()) return toast.error("Content is required.");

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      cover: form.cover,
      readingMinutes: Number(form.readingMinutes) || 5,
      featured: form.featured,
      published: form.published,
      metaTitle: form.metaTitle.trim(),
      metaDescription: form.metaDescription.trim(),
      faq: form.faqItems.filter((f) => f.question.trim() || f.answer.trim()),
      content: form.content,
    };

    try {
      if (isEdit) {
        await api(`/api/admin/posts/${postId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Post saved", {
          description: `“${payload.title}” was updated.`,
        });
      } else {
        await api("/api/admin/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Post created", {
          description: `“${payload.title}” was added to the blog.`,
        });
      }
      router.push("/admin/posts");
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Save failed");
      }
      setSaving(false);
    }
  }

  async function removePost() {
    if (!isEdit) return;
    setDeleting(true);
    try {
      await api(`/api/admin/posts/${postId}`, { method: "DELETE" });
      toast.success("Post deleted");
      router.push("/admin/posts");
    } catch (err) {
      if ((err as Error).name !== "AdminUnauthorized") {
        toast.error((err as Error).message || "Delete failed");
      }
      setDeleting(false);
    }
  }

  function addFaq() {
    set("faqItems", [...form.faqItems, { question: "", answer: "" }]);
  }

  function updateFaq(i: number, patch: Partial<PostFaqItem>) {
    set(
      "faqItems",
      form.faqItems.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );
  }

  function removeFaq(i: number) {
    set(
      "faqItems",
      form.faqItems.filter((_, idx) => idx !== i)
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit post" subtitle="Loading…" />
        <div className="flex items-center gap-3 rounded-2xl border border-[#f0e4d3] bg-white p-6">
          <AdminSpinner />
          <span className="text-sm font-semibold text-ink-soft">
            Fetching post…
          </span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <PageHeader title="Edit post" />
        <div
          className={cn(
            adminCard,
            "flex flex-col items-start gap-3 p-6 text-sm text-ink-soft"
          )}
        >
          <p className="font-display text-lg font-semibold text-ink">
            Post not found.
          </p>
          <Button asChild variant="outline" className="rounded-full font-display">
            <Link href="/admin/posts">
              <ArrowLeft className="size-4" /> Back to posts
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        title={isEdit ? "Edit post" : "New post"}
        subtitle={
          isEdit
            ? "Update the article, then save your changes."
            : "Fill in the details below to publish a new article."
        }
      >
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full bg-white font-display font-semibold"
        >
          <Link href="/admin/posts">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        {isEdit ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleting}
                className="rounded-full border-red-pop/30 bg-white font-display font-semibold text-red-pop hover:bg-red-soft hover:text-red-pop"
              >
                {deleting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">
                  Delete this post?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  “{form.title}” will be permanently removed. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={removePost}
                  className="bg-red-pop text-white hover:bg-[#e22c5c]"
                >
                  <Trash2 className="size-4" /> Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={saving}
          className="rounded-full font-display font-semibold"
        >
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isEdit ? "Save changes" : "Create post"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        {/* -------- Main column -------- */}
        <div className="space-y-5">
          <div className={cn(adminCard, "space-y-5 p-5 sm:p-6")}>
            <Field label="Title" htmlFor="post-title">
              <Input
                id="post-title"
                value={form.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Fun Rainy-Day Activities for Toddlers"
                className="h-11 rounded-xl border-[#eadfcc] bg-cream-soft font-display text-base font-semibold"
                required
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="post-slug"
              hint="URL path: /blog/your-slug — lowercase letters, numbers and dashes only."
            >
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-ink-faint">
                  /blog/
                </span>
                <Input
                  id="post-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  placeholder="fun-rainy-day-activities"
                  className="h-10 rounded-xl border-[#eadfcc] bg-cream-soft pl-14 font-mono text-sm"
                  required
                />
              </div>
            </Field>

            <Field
              label="Excerpt"
              htmlFor="post-excerpt"
              counter={<span className="text-[0.7rem] font-bold text-ink-faint tabular-nums">{form.excerpt.length} chars</span>}
              hint="Short summary shown on blog cards (aim for ~150–165 characters)."
            >
              <Textarea
                id="post-excerpt"
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                className="rounded-xl border-[#eadfcc] bg-cream-soft"
                required
              />
            </Field>

            <Field
              label="Content"
              htmlFor="post-content"
              hint="HTML allowed — use <h2> for section headings, <p> for paragraphs, <ul><li> for lists."
            >
              <Textarea
                id="post-content"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={18}
                className="admin-scroll rounded-xl border-[#eadfcc] bg-cream-soft font-mono text-[0.82rem] leading-relaxed"
                required
              />
            </Field>
          </div>

          {/* FAQ editor */}
          <div className={cn(adminCard, "p-5 sm:p-6")}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">
                  Article FAQ
                </h2>
                <p className="text-xs text-ink-soft">
                  Optional Q&amp;A pairs shown at the end of the article (great
                  for SEO).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaq}
                className="shrink-0 rounded-full bg-white font-display font-semibold"
              >
                <Plus className="size-4" /> Add
              </Button>
            </div>

            {form.faqItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#eadfcc] bg-cream-soft px-4 py-6 text-center text-sm text-ink-faint">
                No FAQ items yet — click “Add” to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {form.faqItems.map((item, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-2xl border border-[#f0e4d3] bg-cream-soft/60 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-extrabold text-brand">
                        {i + 1}
                      </span>
                      <p className="flex-1 text-xs font-extrabold tracking-wide text-ink-soft uppercase">
                        Question {i + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove FAQ ${i + 1}`}
                        onClick={() => removeFaq(i)}
                        className="size-8 text-ink-soft hover:bg-red-soft hover:text-red-pop"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <Input
                      value={item.question}
                      onChange={(e) => updateFaq(i, { question: e.target.value })}
                      placeholder="Question (e.g. How do I enroll?)"
                      className="rounded-xl border-[#eadfcc] bg-white font-bold"
                      aria-label={`FAQ ${i + 1} question`}
                    />
                    <Textarea
                      value={item.answer}
                      onChange={(e) => updateFaq(i, { answer: e.target.value })}
                      rows={3}
                      placeholder="Answer…"
                      className="rounded-xl border-[#eadfcc] bg-white"
                      aria-label={`FAQ ${i + 1} answer`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* -------- Side column -------- */}
        <div className="space-y-5">
          {/* Publish */}
          <div className={cn(adminCard, "space-y-4 p-5 sm:p-6")}>
            <h2 className="font-display text-lg font-semibold text-ink">
              Publish
            </h2>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-soft px-4 py-3">
              <Label htmlFor="post-published" className="cursor-pointer text-sm font-bold text-ink">
                Published
              </Label>
              <Switch
                id="post-published"
                checked={form.published}
                onCheckedChange={(v) => set("published", v)}
                className="data-[state=checked]:bg-green-pop"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-soft px-4 py-3">
              <Label htmlFor="post-featured" className="cursor-pointer text-sm font-bold text-ink">
                Featured
                <span className="mt-0.5 block text-xs font-semibold text-ink-faint">
                  Highlighted at the top of the blog
                </span>
              </Label>
              <StarToggle
                id="post-featured"
                checked={form.featured}
                onCheckedChange={(v) => set("featured", v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" htmlFor="post-category">
                <Select
                  value={form.category}
                  onValueChange={(v) => set("category", v)}
                >
                  <SelectTrigger
                    id="post-category"
                    className="w-full rounded-xl border-[#eadfcc] bg-cream-soft font-bold"
                  >
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Read time" htmlFor="post-minutes">
                <Input
                  id="post-minutes"
                  type="number"
                  min={1}
                  max={60}
                  value={form.readingMinutes}
                  onChange={(e) => set("readingMinutes", e.target.value)}
                  className="rounded-xl border-[#eadfcc] bg-cream-soft"
                />
              </Field>
            </div>
            <Field label="Tags" htmlFor="post-tags" hint="Comma-separated, e.g. daycare, bay point, toddlers">
              <Input
                id="post-tags"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="daycare, toddlers, tips"
                className="rounded-xl border-[#eadfcc] bg-cream-soft"
              />
            </Field>
          </div>

          {/* Cover */}
          <div className={cn(adminCard, "space-y-4 p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <ImageIcon className="size-4 text-brand" /> Cover image
            </h2>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#f0e4d3] bg-cream-deep">
              {form.cover ? (
                <img
                  src={form.cover}
                  alt="Cover preview"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-ink-faint">
                  <ImageIcon className="size-8" />
                </div>
              )}
            </div>
            <Field label="Choose image" htmlFor="post-cover">
              <Select value={form.cover} onValueChange={(v) => set("cover", v)}>
                <SelectTrigger
                  id="post-cover"
                  className="w-full rounded-xl border-[#eadfcc] bg-cream-soft font-bold"
                >
                  <SelectValue placeholder="Select a photo" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {COVERS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {coverLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* SEO */}
          <div className={cn(adminCard, "space-y-4 p-5 sm:p-6")}>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Search className="size-4 text-brand" /> SEO
            </h2>
            <Field
              label="Meta title"
              htmlFor="post-meta-title"
              counter={<CharCounter value={form.metaTitle} max={60} />}
              hint="Leave blank to use the post title (60 char limit)."
            >
              <Input
                id="post-meta-title"
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                className="rounded-xl border-[#eadfcc] bg-cream-soft"
              />
            </Field>
            <Field
              label="Meta description"
              htmlFor="post-meta-desc"
              counter={<CharCounter value={form.metaDescription} max={160} />}
              hint="Shown in Google results (160 char limit)."
            >
              <Textarea
                id="post-meta-desc"
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                rows={3}
                className="rounded-xl border-[#eadfcc] bg-cream-soft"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* bottom save bar (mobile-friendly) */}
      <div className="mt-6 flex justify-end gap-2">
        <Button
          type="submit"
          disabled={saving}
          className="rounded-full font-display font-semibold"
        >
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isEdit ? "Save changes" : "Create post"}
        </Button>
      </div>
    </form>
  );
}

function StarToggle({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex size-9 items-center justify-center rounded-xl border transition-all",
        checked
          ? "border-yellow-pop bg-yellow-soft"
          : "border-[#eadfcc] bg-white hover:border-yellow-pop/50"
      )}
    >
      <Star
        className={cn(
          "size-[1.1rem] transition-all",
          checked ? "fill-yellow-pop text-yellow-pop" : "text-ink-faint"
        )}
      />
    </button>
  );
}
